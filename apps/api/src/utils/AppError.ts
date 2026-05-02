export type AppErrorOptions = {
  statusCode: number
  message: string
  code: string
  isOperational?: boolean
}

export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly isOperational: boolean

  constructor(options: AppErrorOptions) {
    super(options.message)
    this.name = 'AppError'
    this.statusCode = options.statusCode
    this.code = options.code
    this.isOperational = options.isOperational ?? true
  }
}
