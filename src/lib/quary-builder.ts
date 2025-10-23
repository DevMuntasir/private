// eslint-disable-next-line
export function buildQueryParams(params: Record<string, any>): URLSearchParams {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.append(key, String(value))
  })
  return query
}
