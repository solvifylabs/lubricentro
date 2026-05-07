import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getRole, isAdmin } from "@/lib/auth/roles"

const PUBLIC_PATHS = ["/login", "/auth/callback", "/pending"]

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url)
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p))

  if (!user) {
    if (isPublic) return supabaseResponse
    return redirectTo(request, "/login")
  }

  const role = getRole(user)

  if (!role) {
    if (path === "/pending") return supabaseResponse
    return redirectTo(request, "/pending")
  }

  // Authenticated user with role visiting public pages
  if (path === "/login" || path === "/pending") {
    return redirectTo(request, "/")
  }

  // Admin-only routes
  if (path.startsWith("/admin") && !isAdmin(user)) {
    return redirectTo(request, "/")
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
