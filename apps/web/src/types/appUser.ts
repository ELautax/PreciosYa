export type AppUser = {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  googleId: string | null
  plan: string
  planExpiresAt: string | null
  createdAt: string
  updatedAt: string
}
