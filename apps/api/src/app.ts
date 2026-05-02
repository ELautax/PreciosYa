import cors from 'cors'
import express from 'express'

export const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
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

