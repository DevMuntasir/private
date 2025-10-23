import { defineStore } from 'pinia'

export const useErrorStore = defineStore('error', {
  state: () => ({
    message: ''
  }),
  actions: {
    setError(message: string) {
      this.message = message
    },
    clearError() {
      this.message = ''
    }
  }
})
