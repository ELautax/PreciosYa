import cors from 'cors'
import express, { type Express } from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './config/env.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { apiRoutes, routes } from './routes/index.js'
import { AppError } from './utils/AppError.js'

export const app: Express = express()

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
)

app.use(express.json())

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

const windowMs = 15 * 60 * 1000
const limiter = rateLimit({
  windowMs,
  limit: env.NODE_ENV === 'production' ? 300 : 5000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})
app.use(limiter)

app.use(routes)
app.use('/api', apiRoutes)

app.use((_req, _res, next) => {
  next(
    new AppError({
      statusCode: 404,
      message: 'Ruta no encontrada',
      code: 'NOT_FOUND',
    }),
  )
})

app.use(errorMiddleware)
