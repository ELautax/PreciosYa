import cors from 'cors'
import express, { type Express } from 'express'

import { env } from './config/env.js'

export const app: Express = express()

app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  })
})

