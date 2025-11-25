export function buildPagination(searchParams: URLSearchParams, defaults = { limit: 20, max: 100 }) {
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const limitRaw = Number(searchParams.get("limit") || defaults.limit)
  const limit = Math.min(Math.max(1, limitRaw), defaults.max)
  const offset = (page - 1) * limit
  return { page, limit, offset }
}
