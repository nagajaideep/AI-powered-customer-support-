import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('❌ Error:', err)

  let status = 500
  let message = 'Internal server error'
  let details: any = undefined

  if (err?.message === 'Conversation not found') {
    status = 404
    message = 'Conversation not found'
  } else if (err?.message === 'Invalid request body') {
    status = 400
    message = 'Invalid request body'
  } else if (err?.name === 'PrismaClientKnownRequestError') {
    status = 400
    message = 'Database error'
    details = err?.meta
  } else if (typeof err?.message === 'string' && err.message.includes('Rate limit')) {
    status = 429
    message = 'Too many requests'
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('Error details:', {
      message: err?.message,
      stack: err?.stack,
      status
    })
  }

  res.status(status).json({
    error: message,
    details: err instanceof Error ? err.message : 'Unknown error occurred',
    timestamp: new Date().toISOString()
  })
}