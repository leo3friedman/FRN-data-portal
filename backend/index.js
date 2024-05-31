import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import loginRoutes from './routes/loginRoutes.js'
import pickupRoutes from './routes/pickupRoutes.js'

dotenv.config()

const app = express()
const port = process.env.EXPRESS_PORT
const sessionOptions = {
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
}

app.use(session(sessionOptions))

app.use(cors(corsOptions))

app.use(cookieParser())

app.use('/api/', loginRoutes)

app.use('/api/', pickupRoutes)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
