import { Pool, PoolClient, QueryConfig, QueryResult } from "pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required")
}

const pool = new Pool({
  connectionString,
  max: 10,
})

export async function query<T = any>(text: string | QueryConfig<any[]>, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text as any, params)
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await fn(client)
    await client.query("COMMIT")
    return result
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

export async function getClient() {
  return pool.connect()
}
