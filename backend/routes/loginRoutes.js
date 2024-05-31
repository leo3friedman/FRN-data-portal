import crypto from 'crypto'
import { google } from 'googleapis'
import url from 'url'
import express from 'express'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

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
      consent: 'prompt',
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
    const { refresh_token } = tokens
    res.cookie('token', refresh_token, {
      httpOnly: true,
      secure: true,
      encode: (v) => v,
    })

    res.redirect(process.env.CLIENT_URL)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'oauth2callback failed!' })
  }
})

router.post('/logout', (req, res) => {
  try {
    // TODO: break google connection
    res.clearCookie('token')
    return res.status(200).json({ message: 'Logout successful!' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'logout failed!' })
  }
})

export async function isValidToken(refreshToken) {
  try {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      null,
      {
        params: {
          refresh_token: refreshToken,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: 'refresh_token',
        },
      }
    )

    const accessToken = response?.data?.access_token
    // TODO: use accessToken to verify the account email is whitelisted

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export default router
