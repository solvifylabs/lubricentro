// Demo mode stub — admin operations are no-ops.
export function createAdminClient() {
  return {
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: [] }, error: null }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateUserById: async (..._args: any[]): Promise<{ data: { user: { id: string } }; error: null | { message: string } }> =>
          ({ data: { user: { id: "" } }, error: null }),
      },
    },
  }
}
