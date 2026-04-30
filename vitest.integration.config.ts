import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.integration.test.ts"],
    globalSetup: ["./src/tests/setup/container.ts"],
    // Inject DATABASE_URL from globalSetup into each worker via setupFiles
    setupFiles: ["./src/tests/setup/env.ts"],
    hookTimeout: 60_000,
    testTimeout: 30_000,
    // Prevent concurrent DB writes across test files
    fileParallelism: false,
  },
})
