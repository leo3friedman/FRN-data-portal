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
    const errorMessage = `Login failed. Please try again later. Error Code: 500`
    return res.redirect(`${process.env.CLIENT_URL}/login?error=${errorMessage}`)
  }
})

router.get('/oauth2callback', async (req, res) => {
  try {
    const urlQuery = url.parse(req.url, true).query

    if (urlQuery.error) {
      const errorMessage = `Authentication failed, invalid query paremeters. Please try again later. Error Code: 400`
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=${errorMessage}`
      )
    }

    if (urlQuery.state !== req.session.state) {
      const errorMessage = `Authentication failed, possible CSRF attack. Please try again later. Error Code: 403`
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=${errorMessage}`
      )
    }

    const { tokens } = await oauth2Client.getToken(urlQuery.code)

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
      const errorMessage = `Email ${userEmail} is not allowed. Please sign in with a different Google account.`
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=${errorMessage}`
      )
    }

    const token = crypto.randomBytes(32).toString('hex')

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      encode: (v) => v,
    })

    // store token in memory for later verification
    userTokens.push(token)

    return res.redirect(process.env.CLIENT_URL)
  } catch (error) {
    const errorMessage = `Authentication failed. Please try again later. Error Code: 500`
    return res.redirect(`${process.env.CLIENT_URL}/login?error=${errorMessage}`)
  }
})

router.post('/logout', (req, res) => {
  try {
    // TODO: break google connection
    const userToken = req?.cookies?.token

    userTokens = userTokens.filter((t) => t != userToken)
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
