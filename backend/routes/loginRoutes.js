import crypto from 'crypto'
import { google } from 'googleapis'
import url from 'url'
import express from 'express'
import dotenv from 'dotenv'
import { getValidEmails } from './pickupRoutes.js'

dotenv.config()

let userTokens = []

const router = express.Router()

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
)

router.get('/googleauth', (req, res) => {
  try {
    // Generate a secure random state value.
    const state = crypto.randomBytes(32).toString('hex')

    // Store state in the session
    req.session.state = state

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.email'],
      // Include the state parameter to reduce the risk of CSRF attacks.
      state: state,
      prompt: 'consent',
    })

    return res.redirect(authorizationUrl)
  } catch (error) {
    return res.status(500).json({ error: 'googleauth failed!' })
  }
})

router.get('/oauth2callback', async (req, res) => {
  try {
    const q = url.parse(req.url, true).query

    if (q.error) {
      return res.status(400).json({ error: 'Invalid query parameters' })
    }

    if (q.state !== req.session.state) {
      return res
        .status(403)
        .json({ error: 'State mismatch. Possible CSRF attack' })
    }

    const { tokens } = await oauth2Client.getToken(q.code)

    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({
      version: 'v2',
      auth: oauth2Client,
    })

    const userInfo = await oauth2.userinfo.get()
    const userEmail = userInfo.data.email

    // get list of allowed emails
    const allowedEmails = await getValidEmails()

    if (!allowedEmails.includes(userEmail)) {
      return res
        .status(403)
        .json({ error: `Email ${userEmail} is not allowed` })
    }

    const token = crypto.randomBytes(32).toString('hex')

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      encode: (v) => v,
    })

    // store token in memory for later verification
    userTokens.push(token)

    console.log(`added new token: ${token}`, { userTokens })

    res.redirect(process.env.CLIENT_URL)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'oauth2callback failed!' })
  }
})

router.post('/logout', (req, res) => {
  try {
    // TODO: break google connection
    const userToken = req?.cookies?.token

    tokens = tokens.filter((t) => t != userToken)
    res.clearCookie('token')
    return res.status(200).json({ message: 'Logout successful!' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'logout failed!' })
  }
})

export async function isValidToken(token) {
  try {
    // TODO: validate against valid emails to ensure token is still valid
    return userTokens.includes(token)
  } catch (error) {
    console.log(error)
    return false
  }
}

export default router
