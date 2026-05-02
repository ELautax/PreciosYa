/** Formato estándar de respuesta exitosa de la API */
export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiErrorBody = {
  message: string
  code: string
}

/** Formato estándar de respuesta de error de la API */
export type ApiFailure = {
  success: false
  error: ApiErrorBody
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure
