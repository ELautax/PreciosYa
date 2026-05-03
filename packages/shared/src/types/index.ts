export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiErrorBody = {
  message: string
  code: string
}

export type ApiFailure = {
  success: false
  error: ApiErrorBody
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure
