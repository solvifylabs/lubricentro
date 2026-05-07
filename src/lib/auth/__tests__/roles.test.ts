import { describe, it, expect } from "vitest"
import type { User } from "@supabase/supabase-js"
import { getRole, hasRole, isAdmin } from "@/lib/auth/roles"

function makeUser(role?: string): User {
  return {
    id: "test-id",
    app_metadata: role ? { role } : {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "",
  } as User
}

describe("getRole", () => {
  it("returns the role from app_metadata", () => {
    expect(getRole(makeUser("owner"))).toBe("owner")
    expect(getRole(makeUser("admin"))).toBe("admin")
  })

  it("returns null when no role is set", () => {
    expect(getRole(makeUser())).toBeNull()
  })

  it("returns null for a null user", () => {
    expect(getRole(null)).toBeNull()
  })
})

describe("hasRole", () => {
  it("returns true when user has a role", () => {
    expect(hasRole(makeUser("owner"))).toBe(true)
    expect(hasRole(makeUser("admin"))).toBe(true)
  })

  it("returns false when user has no role", () => {
    expect(hasRole(makeUser())).toBe(false)
  })

  it("returns false for a null user", () => {
    expect(hasRole(null)).toBe(false)
  })
})

describe("isAdmin", () => {
  it("returns true only for admin role", () => {
    expect(isAdmin(makeUser("admin"))).toBe(true)
  })

  it("returns false for owner role", () => {
    expect(isAdmin(makeUser("owner"))).toBe(false)
  })

  it("returns false when no role is set", () => {
    expect(isAdmin(makeUser())).toBe(false)
  })

  it("returns false for a null user", () => {
    expect(isAdmin(null)).toBe(false)
  })
})
