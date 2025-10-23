import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export function useSearchQuary(
  defaults = {
    page: 1,
    perPage: 10,
    search: "",
    sortBy: "name:asc",
    status: null,
  },
  filterKeys: string[] = []
) {
  const route = useRoute();
  const router = useRouter();

  const ready = ref(false);

  const currentPage = ref(defaults.page);
  const pageSize = ref(defaults.perPage);
  const searchQuery = ref(defaults.search);
  const sortBy = ref(defaults.sortBy);
  const debouncedSearch = ref(searchQuery.value);
  const status = ref(defaults.status);
  const filters = ref<Record<string, string | number>>({});

  let debounceTimeout: ReturnType<typeof setTimeout> | undefined;
  watch(searchQuery, (val) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = window.setTimeout(() => {
      debouncedSearch.value = val;
    }, 400);
  });

  const syncQuery = () => {
    if (!ready.value) {
      return;
    }
    updateUrlQuery();
  };

  watch(debouncedSearch, () => {
    if (!ready.value) {
      return;
    }
    if (currentPage.value !== 1) {
      currentPage.value = 1;
    }
    syncQuery();
  });

  watch(
    filters,
    () => {
      if (!ready.value) {
        return;
      }
      if (currentPage.value !== 1) {
        currentPage.value = 1;
      }
      syncQuery();
    },
    { deep: true }
  );

  watch([currentPage, pageSize, sortBy, status], () => {
    syncQuery();
  });

  const initializeFromQuery = () => {
    const query = route.query;
    currentPage.value = parseInt(query.page as string) || defaults.page;
    pageSize.value = parseInt(query.per_page as string) || defaults.perPage;
    searchQuery.value = (query.search as string) || defaults.search;
    sortBy.value = (query.sort as string) || defaults.sortBy;
    status.value = query.status != null ? Number(query.status) || null : defaults.status;

    const currentFilters = filters.value;
    const keysToRemove = new Set(Object.keys(currentFilters));

    filterKeys.forEach((key) => {
      if (query[key] !== undefined) {
        const nextVal = query[key] as string;
        if (currentFilters[key] !== nextVal) {
          currentFilters[key] = nextVal;
        }
        keysToRemove.delete(key);
      }
    });

    keysToRemove.forEach((key) => {
      delete currentFilters[key];
    });

    ready.value = true;
  };

  const focusAfterNavigation = (target: HTMLElement | null, marker: string | null) => {
    if (typeof window === "undefined") {
      return;
    }

    window.setTimeout(() => {
      let el = target;

      if (!el || !document.contains(el)) {
        el = marker
          ? (document.querySelector(`[data-preserve-focus="${marker}"]`) as HTMLElement | null)
          : null;
      }

      if (!el || typeof el.focus !== "function") {
        return;
      }

      el.focus({ preventScroll: true });

      if (el instanceof HTMLInputElement) {
        const end = el.value.length;
        el.setSelectionRange?.(end, end);
      }
    }, 0);
  };

  const updateUrlQuery = async () => {
    const query: Record<string, string> = {
      page: currentPage.value.toString(),
      per_page: pageSize.value.toString(),
    };

    if (searchQuery.value) {
      query.search = searchQuery.value;
    }
    if (sortBy.value !== defaults.sortBy) {
      query.sort = sortBy.value;
    }
    if (status.value !== null && status.value !== undefined) {
      query.status = status.value.toString();
    }

    for (const key of filterKeys) {
      const val = filters.value[key];
      if (val !== undefined && val !== "") {
        query[key] = String(val);
      }
    }

    const currentQuery = router.currentRoute.value.query;
    let hasChanges = false;
    const keys = new Set([...Object.keys(currentQuery), ...Object.keys(query)]);

    for (const key of keys) {
      const nextVal = query[key];
      const prevVal = currentQuery[key] as string | undefined;

      if (nextVal === undefined && prevVal === undefined) {
        continue;
      }

      if (
        nextVal === undefined ||
        prevVal === undefined ||
        String(nextVal) !== String(prevVal)
      ) {
        hasChanges = true;
        break;
      }
    }

    if (!hasChanges) {
      return;
    }

    let activeElement: HTMLElement | null = null;
    let focusMarker: string | null = null;

    if (typeof window !== "undefined") {
      const currentActive = document.activeElement;
      if (currentActive instanceof HTMLElement) {
        activeElement = currentActive;
        focusMarker = currentActive.getAttribute("data-preserve-focus");
      }
    }

    try {
      await router.replace({ query });
    } catch {
      return;
    }

    focusAfterNavigation(activeElement, focusMarker);
  };

  const buildApiParams = () => {
    const [sortField, sortOrder] = sortBy.value.split(":");
    const params: Record<string, unknown> = {
      page: currentPage.value,
      per_page: pageSize.value,
      search: searchQuery.value || undefined,
      sort_by: sortField,
      sort_order: sortOrder,
      status: status.value,
    };

    for (const key of filterKeys) {
      const val = filters.value[key];
      if (val !== undefined && val !== "") {
        params[key] = val;
      }
    }

    return params;
  };

  onMounted(() => {
    initializeFromQuery();
  });

  watch(
    () => route.fullPath,
    () => {
      initializeFromQuery();
    }
  );

  return {
    currentPage,
    pageSize,
    searchQuery,
    debouncedSearch,
    sortBy,
    filters,
    ready,
    status,
    buildApiParams,
    updateUrlQuery,
    setPage: (page: number) => {
      currentPage.value = page;
    },
    setPageSize: (value: string) => {
      pageSize.value = parseInt(value, 10);
      currentPage.value = 1;
    },
    setSort: (value: string) => {
      sortBy.value = value;
      currentPage.value = 1;
    },
  };
}
