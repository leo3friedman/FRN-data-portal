import dotenv from 'dotenv'
import express from 'express'
import crypto from 'crypto'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import loginRoutes from './routes/loginRoutes.js'
import pickupRoutes from './routes/pickupRoutes.js'

dotenv.config()

const app = express()
const port = process.env.EXPRESS_PORT
const sessionOptions = {
  secret: crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true },
}
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
}

app.use(session(sessionOptions))

app.use(cors(corsOptions))

app.use(cookieParser())

app.use('/', loginRoutes)

app.use('/', pickupRoutes)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
