import { defineStore } from "pinia";

const HIDE_DELAY_MS = 100;
const SAFETY_TIMEOUT_MS = 15_000;

export const useRouteLoaderStore = defineStore("routeLoader", {
  state: () => ({
    active: false,
    pending: 0,
    hideTimeout: null as ReturnType<typeof setTimeout> | null,
    safetyTimeout: null as ReturnType<typeof setTimeout> | null,
    disabled: false,
  }),
  actions: {
    clearSafetyTimeout() {
      if (this.safetyTimeout) {
        clearTimeout(this.safetyTimeout);
        this.safetyTimeout = null;
      }
    },
    queueHideIfIdle() {
      if (this.disabled) {
        return;
      }
      if (this.pending === 0) {
        if (this.hideTimeout) {
          clearTimeout(this.hideTimeout);
        }
        this.hideTimeout = setTimeout(() => {
          this.active = false;
          this.hideTimeout = null;
        }, HIDE_DELAY_MS);
      }
    },
    completeNavigation() {
      if (this.disabled) {
        return;
      }
      this.pending = 0;
      this.clearSafetyTimeout();
      this.queueHideIfIdle();
    },
    start() {
      if (this.disabled) {
        return;
      }
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.pending += 1;
      this.active = true;
      this.clearSafetyTimeout();
      this.safetyTimeout = setTimeout(() => {
        this.reset();
      }, SAFETY_TIMEOUT_MS);
    },
    stop() {
      if (this.disabled) {
        return;
      }
      if (this.pending > 0) {
        this.pending -= 1;
      }
      this.clearSafetyTimeout();
      this.queueHideIfIdle();
    },
    reset() {
      this.pending = 0;
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.clearSafetyTimeout();
      this.active = false;
    },
    disable() {
      if (this.disabled) {
        return;
      }
      this.disabled = true;
      this.reset();
    },
    enable() {
      this.disabled = false;
    },
  },
});
