import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import loginRoutes from './routes/loginRoutes.js'
import pickupRoutes from './routes/pickupRoutes.js'

const app = express()
const port = 3000
const sessionOptions = {
  secret: 'your_secure_secret_key', // TODO: Replace with a strong secret
  resave: false,
  saveUninitialized: false,
}
const corsOptions = {
  origin: 'http://localhost:5173',
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
