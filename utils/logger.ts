type LogLevel = "info" | "warn" | "error"

export function log(event: string, payload: Record<string, unknown> = {}, level: LogLevel = "info") {
  const base = {
    event,
    level,
    timestamp: new Date().toISOString(),
  }
  try {
    console.log(JSON.stringify({ ...base, ...payload }))
  } catch {
    console.log(JSON.stringify(base))
  }
}
