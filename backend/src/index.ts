import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler'
import router from './app/router'
import { rateLimiter } from './middleware/rateLimit'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(rateLimiter)

// Routes
app.use('/api', router)

// Error handling (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})
