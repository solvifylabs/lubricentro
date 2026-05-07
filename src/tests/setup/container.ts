import { PostgreSqlContainer } from "@testcontainers/postgresql"
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { execSync } from "child_process"
import { writeFileSync, unlinkSync, existsSync } from "fs"
import { join } from "path"

export const DB_URL_TMP = join(process.cwd(), ".vitest-db-url")

let container: StartedPostgreSqlContainer

export async function setup() {
  container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("lubricentro_test")
    .withUsername("test")
    .withPassword("test")
    .start()

  const databaseUrl = container.getConnectionUri()

  // Write URL to a temp file so every worker's setupFile can read it
  writeFileSync(DB_URL_TMP, databaseUrl, "utf-8")

  // --url bypasses prisma.config.ts dotenv override entirely
  execSync(`npx prisma db push --url="${databaseUrl}" --accept-data-loss`, {
    stdio: "inherit",
  })
}

export async function teardown() {
  if (existsSync(DB_URL_TMP)) unlinkSync(DB_URL_TMP)
  await container?.stop()
}
