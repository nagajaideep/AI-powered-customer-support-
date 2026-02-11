import { Request, Response, NextFunction } from 'express'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const windowMs = 15 * 60 * 1000 // 15 minutes
const max = 100 // limit each IP to 100 requests per windowMs

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string || req.ip || 'unknown'
  const now = Date.now()

  if (!store[ip]) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs
    }
  } else if (now > store[ip].resetTime) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs
    }
  } else {
    store[ip].count++
  }

  if (store[ip].count > max) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((store[ip].resetTime - now) / 1000)
    })
  }

  next()
}