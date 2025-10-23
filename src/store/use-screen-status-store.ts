import { adminScreenService } from '@/services/screen-service'
import { CursorScreenStatusResponse, ScreenStatusItem } from '@/types/screen-type'
import { defineStore } from 'pinia'

export type Status = 'online' | 'offline'

type SeenKey = string

function parseUtcToDate(utc: string): Date {
  const iso = utc.replace(' ', 'T').replace('+00', 'Z')
  return new Date(iso)
}

function itemKey(it: ScreenStatusItem): SeenKey {
  return `${it.reported_at}|${it.created_at}`
}

export const useScreenStatusStore = defineStore('screenStatus', {
  state: () => ({
    items: [] as ScreenStatusItem[],
    seen: new Set<SeenKey>(),
    loading: false,
    error: null as string | null,
    pollingId: null as number | null,
    screenId: 1 as number | null,           
    nextPageUrl: null as string | null      
  }),
  getters: {
    sortedItems: (s) =>
      [...s.items].sort(
        (a, b) => parseUtcToDate(a.reported_at).getTime() - parseUtcToDate(b.reported_at).getTime()
      ),
    cpuDps(): { x: Date; y: number }[] {
      return this.sortedItems.map(it => ({ x: parseUtcToDate(it.reported_at), y: parseFloat(it.cpu_percent) }))
    },
    ramDps(): { x: Date; y: number }[] {
      return this.sortedItems.map(it => ({ x: parseUtcToDate(it.reported_at), y: parseFloat(it.ram_percent) }))
    },
    diskDps(): { x: Date; y: number }[] {
      return this.sortedItems.map(it => ({ x: parseUtcToDate(it.reported_at), y: parseFloat(it.disk_percent) }))
    }
  },
  actions: {
    setScreen(id: string | null) {
      this.screenId = id
      this.reset()
      void this.fetchLatest()
    },

    _ingest(items: ScreenStatusItem[]) {
      for (const it of items) {
        const k = itemKey(it)
        if (!this.seen.has(k)) {
          this.seen.add(k)
          this.items.push(it)
        }
      }
    },

    async fetchLatest() {
      try {
        this.loading = true
        this.error = null
        const res = await adminScreenService.getScreenStatusDataCursor({
          per_page: 50,
          screenId: this.screenId ?? undefined
        })
        const body = res.data as CursorScreenStatusResponse
        this.nextPageUrl = body.next_page_url ?? null
        this._ingest(body.data ?? [])
      } catch (err: any) {
        this.error = err?.message ?? 'Failed to load'
      } finally {
        this.loading = false
      }
    },

   
    async fetchNextPage() {
      if (!this.nextPageUrl) return
      try {
        this.loading = true
        this.error = null
        const res = await adminScreenService.getScreenStatusDataCursorByUrl(this.nextPageUrl)
        const body = res.data as CursorScreenStatusResponse
        this.nextPageUrl = body.next_page_url ?? null
        this._ingest(body.data ?? [])
      } catch (err: any) {
        this.error = err?.message ?? 'Failed to load next page'
      } finally {
        this.loading = false
      }
    },

    startPolling(intervalMs = 15000) {
      if (this.pollingId) return
      void this.fetchLatest() 
      this.pollingId = window.setInterval(() => {
        void this.fetchLatest()
      }, intervalMs)
    },

    stopPolling() {
      if (this.pollingId) {
        clearInterval(this.pollingId)
        this.pollingId = null
      }
    },

    reset() {
      this.stopPolling()
      this.items = []
      this.seen.clear()
      this.error = null
      this.loading = false
      this.nextPageUrl = null
    }
  }
})
