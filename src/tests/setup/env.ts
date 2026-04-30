import { readFileSync, existsSync } from "fs"
import { join } from "path"

// Runs in each worker before any test file.
// Reads the test DB URL written by globalSetup (container.ts).
const tmp = join(process.cwd(), ".vitest-db-url")
if (existsSync(tmp)) {
  process.env.DATABASE_URL = readFileSync(tmp, "utf-8").trim()
}
