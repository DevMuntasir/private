import { QueryClient } from "@tanstack/vue-query";

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      gcTime: THIRTY_MINUTES,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const normalizeUrl = (url: string) => {
  const cleaned = url
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/\/+$/, "")
    .replace(/(?<!:)\/\//g, "/");

  if (!cleaned || cleaned === "/") {
    return "/";
  }

  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

export const buildQueryKey = (
  url: string,
  params?: Record<string, unknown> | undefined
) => {
  const normalizedUrl = normalizeUrl(url);
  if (!params || Object.keys(params).length === 0) {
    return [normalizedUrl];
  }

  const orderedParams = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return [normalizedUrl, orderedParams];
};

export const getUrlPrefixes = (url: string) => {
  const normalizedUrl = normalizeUrl(url);
  const segments = normalizedUrl.split("/").filter(Boolean);

  const prefixes: string[] = [];
  for (let i = segments.length; i > 0; i -= 1) {
    const prefix = `/${segments.slice(0, i).join("/")}`;
    if (prefix) {
      prefixes.push(prefix);
    }
  }

  return prefixes;
};
