import { QueryClient } from "@tanstack/vue-query";

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cloneParamsValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => cloneParamsValue(item));
  }

  if (isObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = cloneParamsValue(value[key]);
        return acc;
      }, {});
  }

  return value;
};

const normalizeParamsObject = (
  params?: Record<string, unknown>
): Record<string, unknown> | undefined => {
  if (!params || Object.keys(params).length === 0) {
    return undefined;
  }

  return Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = cloneParamsValue(params[key]);
      return acc;
    }, {});
};

const parseQueryString = (queryString: string): Record<string, unknown> => {
  const searchParams = new URLSearchParams(queryString);
  const parsed: Record<string, unknown> = {};

  searchParams.forEach((value, key) => {
    const existing = parsed[key];

    if (existing === undefined) {
      parsed[key] = value;
      return;
    }

    if (Array.isArray(existing)) {
      existing.push(value);
      return;
    }

    parsed[key] = [existing as string, value];
  });

  return parsed;
};

const paramsLikeToObject = (
  params?: Record<string, unknown> | URLSearchParams | null
): Record<string, unknown> | undefined => {
  if (!params) {
    return undefined;
  }

  if (params instanceof URLSearchParams) {
    return parseQueryString(params.toString());
  }

  return params;
};

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
  const [pathPart] = url.split("?");

  const cleaned = pathPart
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/\/+$/, "")
    .replace(/(?<!:)\/\//g, "/");

  if (!cleaned || cleaned === "/") {
    return "/";
  }

  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

export const splitUrlAndParams = (
  url: string,
  params?: Record<string, unknown> | URLSearchParams | null
) => {
  const [rawPath, queryString] = url.split("?");
  const normalizedPath = normalizeUrl(rawPath);
  const fromQuery = queryString ? parseQueryString(queryString) : undefined;
  const provided = paramsLikeToObject(params);

  const mergedParams: Record<string, unknown> = {};

  if (fromQuery) {
    Object.assign(mergedParams, fromQuery);
  }

  if (provided) {
    Object.assign(mergedParams, provided);
  }

  const normalizedParams = normalizeParamsObject(mergedParams);

  return {
    path: normalizedPath,
    params: normalizedParams,
  };
};

export const buildQueryKey = (
  url: string,
  params?: Record<string, unknown> | URLSearchParams | null
) => {
  const { path, params: mergedParams } = splitUrlAndParams(url, params);

  if (!mergedParams) {
    return [path];
  }

  return [path, mergedParams];
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

export const paramsSubsetMatch = (
  candidate: Record<string, unknown>,
  expected: Record<string, unknown>
) => {
  const normalizeValue = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((entry) => normalizeValue(entry).join("|"))
        .sort((a, b) => a.localeCompare(b));
    }

    if (isObject(value)) {
      const normalizedObject = normalizeParamsObject(value) ?? {};
      return [JSON.stringify(normalizedObject)];
    }

    if (value === undefined) {
      return ["undefined"];
    }

    if (value === null) {
      return ["null"];
    }

    return [String(value)];
  };

  return Object.entries(expected).every(([key, expectedValue]) => {
    const candidateValue = candidate[key];
    if (candidateValue === undefined) {
      return false;
    }

    const candidateNormalized = normalizeValue(candidateValue);
    const expectedNormalized = normalizeValue(expectedValue);

    if (candidateNormalized.length !== expectedNormalized.length) {
      return false;
    }

    return candidateNormalized.every((value, index) => {
      return value === expectedNormalized[index];
    });
  });
};
