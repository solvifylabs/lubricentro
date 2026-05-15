// Demo mode stub — returns a mock user with "owner" role.
export async function createClient() {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "demo-user",
            email: "demo@lubricentro.demo",
            app_metadata: { role: "owner" },
            user_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
          },
        },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exchangeCodeForSession: async (..._args: any[]) => ({ error: null }),
    },
  }
}
