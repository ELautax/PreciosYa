export type NotificationDto = {
  id: string
  userId: string
  type: string
  title: string
  body: string
  isRead: boolean
  metadata: unknown
  createdAt: string
}
