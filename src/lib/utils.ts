import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { Ref, ref } from 'vue'
import { Updater } from '@tanstack/vue-table'
import { FormField } from '@/types/Form'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
const errors = ref<Record<string, string>>({})
// eslint-disable-next-line
export function validateField(field: FormField, value: any) {
  for (const validation of field.validations || []) {
    if (!validation.rule(value)) {
      errors.value[field.name] = validation.message
      return false
    }
  }
  errors.value[field.name] = ''
  return true
}
// eslint-disable-next-line
export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}


export interface ParsedBackendError {
  message: string;
  status: number;
  errors: Record<string, string[]>;
}

export function parseBackendError(error: any): ParsedBackendError {
  const defaultMessage = "Something went wrong.";
  const defaultStatus = 500;

  if (!error || typeof error !== "object") {
    return {
      message: defaultMessage,
      status: defaultStatus,
      errors: {},
    };
  }

  const response = error.response || error;

  return {
    message:
      response?.data?.message ||
      response?.message ||
      defaultMessage,
    status: response?.status || defaultStatus,
    errors: response?.data?.errors || {},
  };
}

export function buildQueryParams(params: Record<string, any>): URLSearchParams {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.append(key, String(value))
  })
  return query
}

// utils/chartConfig.ts
import { Chart, type ChartConfiguration, type ChartType } from "chart.js";

/** Params for building a Chart.js configuration */
export type BuildConfigParams<TType extends ChartType> = {
  type: TType;
  labels: (string | number)[];
  datasets: ChartConfiguration<TType>["data"]["datasets"];
  /** Merge any extra Chart.js options if you need */
  options?: ChartConfiguration<TType>["options"];
  /** Quickly stack both x & y */
  stacked?: boolean;
  /** Defaults */
  responsive?: boolean;            // default: true
  maintainAspectRatio?: boolean;   // default: false
  showLegend?: boolean;            // default: false
  animation?: boolean;             // default: false (fast first paint)
};

/** Build a solid default config and shallow-merge user options */
export function buildConfig<TType extends ChartType>({
  type,
  labels,
  datasets,
  options,
  stacked = false,
  responsive = true,
  maintainAspectRatio = false,
  showLegend = false,
  animation = false,
}: BuildConfigParams<TType>): ChartConfiguration<TType> {
  const base: ChartConfiguration<TType> = {
    type,
    data: { labels, datasets } as ChartConfiguration<TType>["data"],
    options: {
      responsive,
      maintainAspectRatio,
      animation,
      plugins: {
        legend: { display: showLegend },
        tooltip: { enabled: true },
      },
      // @ts-expect-error - allow partial scales; we'll merge below
      scales: {},
    },
  };

  // Stacking helper
  // @ts-ignore - scales may be undefined yet
  if (stacked) {
    // @ts-expect-error
    base.options.scales = {
      x: { stacked: true, ...(base.options?.scales as any)?.x },
      y: { stacked: true, ...(base.options?.scales as any)?.y },
    };
  }

  // Shallow merge options (good enough for most cases)
  if (options) {
    base.options = {
      ...(base.options || {}),
      ...options,
      plugins: {
        ...(base.options?.plugins || {}),
        ...(options.plugins || {}),
        legend: {
          ...(base.options?.plugins?.legend || {}),
          ...(options.plugins?.legend || {}),
        },
        tooltip: {
          ...(base.options?.plugins?.tooltip || {}),
          ...(options.plugins?.tooltip || {}),
        },
      },
      // naive shallow merge for scales
      // @ts-expect-error
      scales: {
        // @ts-expect-error
        ...(base.options?.scales || {}),
        // @ts-expect-error
        ...(options.scales || {}),
      },
    };
  }

  return base;
}

/** Mount chart safely (handles first render + resizes). */
export function mountChart<TType extends ChartType>(
  canvasEl: HTMLCanvasElement,
  config: ChartConfiguration<TType>
) {
  const chart = new Chart(canvasEl, config);

  // Ensure first paint after layout
  requestAnimationFrame(() => chart.resize());

  // Keep chart sized with container
  const target = canvasEl.parentElement ?? canvasEl;
  const ro = new ResizeObserver(() => chart.resize());
  ro.observe(target);

  const destroy = () => {
    ro.disconnect();
    chart.destroy();
  };

  return { chart, destroy, ro };
}
