import type { User } from "@supabase/supabase-js"

export type Role = "admin" | "owner"

export function getRole(user: User | null): Role | null {
  return (user?.app_metadata?.role as Role) ?? null
}

export function hasRole(user: User | null): boolean {
  return getRole(user) !== null
}

export function isAdmin(user: User | null): boolean {
  return getRole(user) === "admin"
}
