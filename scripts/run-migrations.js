/**
 * Simple migration runner: executes all .sql files in scripts/migrations in alphabetical order.
 * Usage: DATABASE_URL=postgres://... node scripts/run-migrations.js
 */
const fs = require("fs")
const path = require("path")
const { Client } = require("pg")

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL env is required")
  }

  const migrationsDir = path.join(__dirname, "migrations")
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")
      console.log(`Executing migration: ${file}`)
      await client.query("BEGIN")
      await client.query(sql)
      await client.query("COMMIT")
      console.log(`Finished: ${file}`)
    }
  } catch (err) {
    console.error("Migration failed:", err)
    await client.query("ROLLBACK")
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
