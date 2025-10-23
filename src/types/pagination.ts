export interface PaginationQuery {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export interface PaginationResponse {
  current_page: number
  last_page: number
  per_page: number
  total: number
  next_page_url?: string | null
  prev_page_url?: string | null
  from: number
  to: number
}

// Cursor-based pagination (backend returns next_cursor/prev_cursor)
export interface CursorPage<T = unknown> {
  data: T[]
  path: string
  per_page: number | string
  next_cursor: string | null
  next_page_url: string | null
  prev_cursor: string | null
  prev_page_url: string | null
}
