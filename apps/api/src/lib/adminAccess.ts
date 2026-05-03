import { env } from '../config/env.js'

function parseAdminEmails(raw: string | undefined): Set<string> {
  if (!raw) return new Set()
  const items = raw
    .split(',')
    .map((x) => x.trim())
    .map((x) =>
      x.startsWith('"') && x.endsWith('"')
        ? x.slice(1, -1)
        : x.startsWith("'") && x.endsWith("'")
          ? x.slice(1, -1)
          : x,
    )
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x.length > 0)
  return new Set(items)
}

const adminEmails = parseAdminEmails(env.ADMIN_EMAILS)

export function isAdminEmail(email: string): boolean {
  return adminEmails.has(email.trim().toLowerCase())
}
