import express from 'express'
import crypto from 'crypto'
import { google } from 'googleapis'
import session from 'express-session'
import dotenv from 'dotenv'
import url from 'url'
import cors from 'cors'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const port = 3000
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
}
app.use(
  session({
    secret: 'your_secure_secret_key', // TODO: Replace with a strong secret
    resave: false,
    saveUninitialized: false,
  })
)

app.use(cookieParser())

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
)

app.get('/googleauth', cors(corsOptions), (req, res) => {
  // Generate a secure random state value.
  const state = crypto.randomBytes(32).toString('hex')
  // Store state in the session
  req.session.state = state

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.email'],
    // Include the state parameter to reduce the risk of CSRF attacks.
    state: state,
  })

  res.redirect(authorizationUrl)
})

app.get('/oauth2callback', async (req, res) => {
  let q = url.parse(req.url, true).query

  if (q.error) {
    console.log('Error:' + q.error)
  } else if (q.state !== req.session.state) {
    console.log('State mismatch. Possible CSRF attack')
    res.end('State mismatch. Possible CSRF attack')
  } else {
    let { tokens } = await oauth2Client.getToken(q.code)
    const { refresh_token } = tokens

    res.cookie('token', refresh_token, {
      httpOnly: true,
      secure: true,
      encode: (v) => v,
    })
    res.redirect('http://localhost:5173/')
  }
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
