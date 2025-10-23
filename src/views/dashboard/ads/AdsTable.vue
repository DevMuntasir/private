<template>
  <div class="space-y-4 mt-6">
    <template v-if="canViewAds">
    <div class="flex items-center justify-between">
      <RouterLink
        v-if="canCreateAd"
        :to="{
          name: 'AdCreate',
        }"
      >
        <Button class="btn">+ Add New Ad </Button>
      </RouterLink>
      <div class="flex items-center space-x-2">
        <Select v-model="pageSize">
          <SelectTrigger
            class="w-[120px] font-primary !h-[40px] rounded-[3px] bg-white"
          >
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Per Page</SelectLabel>
            <SelectItem v-for="size in [5, 10, 20]" :key="size" :value="size">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="border bg-white relative">
      <SearchAndFilterBar
        :search-query="searchQuery"
        :model-value="filters"
        @update:modelValue="(val) => (filters = { ...filters, ...val })"
        :selected-filters="selectedFilters"
        @update:selectedFilters="(val) => (selectedFilters = val)"
        @update:searchQuery="(val) => (searchQuery = val)"
        :filter-options="filterOptions"
        :searchable="true"
        :can-search="true"
        :placeholder="'Search by ad`s name...'"
        :status-option="AdConstant.getAdStatusOptions()"
        filter-for="ad"
        :canFilter="false"
      />

      <div
        ref="dragWrapper"
        :class="['table-drag-scroll', { 'is-dragging': isDraggingTable }]"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointerleave="handlePointerUp"
        @pointercancel="handlePointerUp"
        style="--sticky-name-width: 16rem; --sticky-second-width: 16rem"
      >
        <Table class="relative w-full border-separate border-spacing-0">
          <TableHeader class="h-[55px]">
            <TableRow class="bg-table-header">
              <TableHead
                :stickyTop="true"
                class="sticky-col sticky-col--checkbox w-[56px] px-3"
              >
                <Checkbox
                  class="checkbox"
                  :model-value="allSelected"
                  :indeterminate="isIndeterminate"
                  @update:modelValue="toggleSelectAll"
                />
              </TableHead>

              <TableHead
                @click="handleSort('name')"
                :stickyTop="true"
                class="cursor-pointer sticky-col sticky-col--name w-[200px]"
              >
                Ad's Name
              </TableHead>
              <TableHead class="pr-5 bg-table-header" :stickyTop="true"
                >Goal</TableHead>

              <TableHead class="pr-5 bg-table-header" :stickyTop="true"
                >Playlist</TableHead>
              <TableHead
                class="pr-5 bg-table-header text-right"
                :stickyTop="true"
                :stickyLastColumn="true"
                >Action</TableHead
              >
            </TableRow>
          </TableHeader>

          <TableBody>
            <template v-if="!loading && adStore.ads.length > 0">
              <TableRow
                v-for="ad in adStore.ads"
                :key="ad.id"
                :class="selectedUsers.includes(ad.id) ? 'bg-muted/50' : ''"
              >
                <TableCell
                  class="sticky-col sticky-col--checkbox w-[56px] text-left"
                >
                  <Checkbox
                    class="checkbox"
                    :model-value="selectedCampaigns.includes(ad.id)"
                    @update:modelValue="
                      (checked) => toggleRow(ad.id, checked as boolean)
                    "
                  />
                </TableCell>

                <TableCell class="sticky-col sticky-col--name min-w-[220px] font-primary hover:underline text-secondary">
                  <RouterLink
                    v-if="canUpdateAd"
                    :to="{
                      params: {
                        id: ad.id
                      },
                      name: 'AdEdit'
                    }"
                  >
                    {{ ad.name }}
                  </RouterLink>
                  <span v-else>{{ ad.name }}</span>
                </TableCell>
                <TableCell :stickyLastColumn="true" >
                  {{ ad.goal.label }}
                </TableCell>
                <TableCell :stickyLastColumn="true" >
                {{ ad?.playlists?.length ?? ' No playlist available!' }}
                </TableCell>
                <TableCell :stickyLastColumn="true" class="w-[0px]">
                  <Button
                    v-if="canUpdateAd"
                    @click.stop="openAdPlaylistSheet(ad)"
                    variant="outline"
                    class="btn"
                  >
                    <EyeIcon />
                  </Button>
                </TableCell>
              </TableRow>
            </template>

            <template v-else-if="!loading && adStore.ads.length < 1">
              <TableRow>
                <TableCell :colspan="10" class="text-center py-6 text-gray-500">
                  No ads found matching your filters.
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <TableSkelton v-if="loading" :rows="pageSize" :columns="4" />
    </div>

    <Pagination
      v-if="adStore.ads.length > 0"
      :current-page="currentPage"
      :last-page="adStore.pagination?.last_page || 1"
      :total="adStore.pagination?.total || 0"
      :per-page="pageSize"
      :from="adStore.pagination?.from"
      :to="adStore.pagination?.to"
      @page-change="setPage"
    />

    <VideoPreview
      :isOpen="isPreviewOpen"
      :videoUrl="videoUrl"
      :width="260"
      :height="430"
      logoUrl="/logo/w-logo.svg"
      @close="onCloseVideoPreview"
    />

    <Sheet v-model:open="isPlaylistSheetOpen">
      <SheetContent class="sm:max-w-[480px] w-full p-0" side="right">
        <div class="flex h-full flex-col">
          <div class="border-b px-6 py-4">
            <SheetHeader class="space-y-2">
              <SheetTitle>
                {{ selectedAd ? "Edit Ad" : "Ad Details" }}
              </SheetTitle>
              <SheetDescription>
                Update the ad name, goal, and playlist assignments without
                leaving the page.
              </SheetDescription>
            </SheetHeader>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-6">
            <div
              v-if="isLoadingSheetData"
              class="flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground"
            >
              <Loader2 class="h-5 w-5 animate-spin text-primary" />
              <span>Loading ad details...</span>
            </div>
            <div
              v-else-if="playlistError"
              class="text-center text-sm text-red-500"
            >
              {{ playlistError }}
            </div>
            <form
              v-else-if="selectedAd"
              class="space-y-6"
              @submit.prevent="handleSaveAdChanges"
            >

              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <Label>Playlists</Label>
                  <span class="text-xs text-muted-foreground">
                    {{ editForm.playlistIds.length }} selected
                  </span>
                </div>
                <div
                  v-if="isLoadingPlaylistOptions"
                  class="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Loader2 class="h-4 w-4 animate-spin text-primary" />
                  <span>Loading playlists...</span>
                </div>
                <div
                  v-else-if="playlistOptionsError"
                  class="text-sm text-red-500"
                >
                  {{ playlistOptionsError }}
                </div>
                <div
                  v-else-if="!playlistOptions.length"
                  class="text-sm text-muted-foreground"
                >
                  No playlists found yet. Create a playlist to link this ad.
                </div>
                <ul v-else class="space-y-3">
                  <li
                    v-for="playlist in playlistOptions"
                    :key="playlist.id"
                    class="flex items-start gap-3 rounded-md border border-slate-200 p-3"
                  >
                    <Checkbox
                      :id="`playlist-${playlist.id}`"
                      :disabled="isSavingAdChanges"
                      :model-value="editForm.playlistIds.includes(playlist.id)"
                      @update:modelValue="
                        (checked) =>
                          togglePlaylistSelection(
                            playlist.id,
                            checked as boolean
                          )
                      "
                    />
                    <div class="space-y-1">
                      <label
                        class="text-sm font-medium text-gray-900"
                        :for="`playlist-${playlist.id}`"
                      >
                        {{ playlist.name }}
                      </label>
                      <p
                        v-if="playlist.metaText"
                        class="text-xs text-muted-foreground"
                      >
                        {{ playlist.metaText }}
                      </p>
                    </div>
                  </li>
                </ul>
                <p v-if="formErrors.playlists" class="text-xs text-red-500">
                  {{ formErrors.playlists }}
                </p>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  @click="resetEditForm()"
                  :disabled="!hasChanges || isSavingAdChanges"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  class="btn flex items-center gap-2"
                  :disabled="!hasChanges || isSavingAdChanges"
                >
                  <Loader2
                    v-if="isSavingAdChanges"
                    class="h-4 w-4 animate-spin text-white"
                  />
                  <span>{{ isSavingAdChanges ? "Saving..." : "Save changes" }}</span>
                </Button>
              </div>
            </form>
            <div v-else class="text-center text-sm text-muted-foreground">
              Select an ad to edit.
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </template>
    <ComponentPermissionError v-else />
  </div>
</template>


<script setup lang="ts">
import {
  Select,
  SelectContent,

  SelectItem,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSearchQuary } from "@/composeable/userSearchQuary";

import { useHorizontalDragScroll } from "@/composeable/useHorizontalDragScroll";

import { Checkbox } from "@/components/ui/checkbox";
import { useRoleStore } from "@/store/common/role-permission-store";
import { PNComponentPermissions } from "@/constant/permission";

import Pagination from "@/shared/components/Pagination.vue";
import TableSkelton from "@/shared/components/TableSkelton.vue";
import ComponentPermissionError from "@/shared/components/ComponentPermissionError.vue";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
// import SearchAndFilterBar from "../clients/SearchAndFilterBar.vue";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


import { useToast } from "@/composeable/useToast";
import { adService } from "@/services/ad-service";
import { playlistService } from "@/services/playlist-service";
import VideoPreview from "@/shared/components/VideoPreview.vue";
import { useAdsStore } from "@/store/ad-store";
import { EyeIcon, Loader2 } from "lucide-vue-next";
import type {
  AdDetailResponse,
  AdResponse,
} from "@/types/ad-types";
import { Playlist } from "@/types/playlist-type";
import SearchAndFilterBar from "@/shared/components/SearchAndFilterBar.vue";
import { AdConstant } from "@/constant/ads";

const { showToast } = useToast();


const videoUrl = ref<string | null>(null);
const isPreviewOpen = ref(false);

const selectedFilters = ref<string[]>([]);
const adStore = useAdsStore();
const roleStore = useRoleStore();
const adPermissions = PNComponentPermissions.AdsTable;
const canViewAds = computed(() =>
  roleStore.hasPermission(adPermissions.view)
);
const canCreateAd = computed(() =>
  roleStore.hasPermission(adPermissions.create)
);
const canUpdateAd = computed(() =>
  roleStore.hasPermission(adPermissions.update)
);
const selectedUsers = ref<number[]>([]);
const loading = ref(false);
const isPlaylistSheetOpen = ref(false);
const isLoadingSheetData = ref(false);
const isLoadingPlaylistOptions = ref(false);
const isSavingAdChanges = ref(false);
const selectedAd = ref<AdDetailResponse | null>(null);
type PlaylistOption = {
  id: number;
  name: string;
  metaText?: string;
};
const playlistOptions = ref<PlaylistOption[]>([]);
const playlistOptionsError = ref<string | null>(null);
const playlistError = ref<string | null>(null);

const editForm = reactive({
  playlistIds: [] as number[],
});
const initialEditState = ref({
  playlistIds: [] as number[],
});
const formErrors = reactive({
  playlists: "",
});

const filterOptions =[]



function arraysHaveSameMembers(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

const hasChanges = computed(() => {
  const initial = initialEditState.value;
  return (
    !arraysHaveSameMembers(editForm.playlistIds, initial.playlistIds)
  );
});

function resetEditForm(useInitial = true) {
  const source = useInitial
    ? initialEditState.value
    : {
        playlistIds: [] as number[],
      };
  editForm.playlistIds = [...source.playlistIds];
  formErrors.playlists = "";
}

function togglePlaylistSelection(id: number, checked: boolean) {
  if (checked) {
    if (!editForm.playlistIds.includes(id)) {
      editForm.playlistIds = [...editForm.playlistIds, id];
    }
  } else {
    editForm.playlistIds = editForm.playlistIds.filter((pid) => pid !== id);
  }
  formErrors.playlists = "";
}

function buildPlaylistMeta(playlist: Playlist): string | undefined {
  const cityNames =
    Array.isArray(playlist.cities) && playlist.cities.length > 0
      ? playlist.cities
          .map((city: any) => (typeof city?.name === "string" ? city.name : null))
          .filter((name): name is string => Boolean(name?.trim()))
      : [];
  if (cityNames.length) {
    const [first, ...rest] = cityNames;
    const base = [first, ...rest.slice(0, 2)].join(", ");
    const remaining = rest.length > 2 ? rest.length - 2 : 0;
    return remaining > 0 ? `Cities: ${base} +${remaining} more` : `Cities: ${base}`;
  }

  const locationNames =
    Array.isArray(playlist.locations) && playlist.locations.length > 0
      ? playlist.locations
          .map((loc: any) => (typeof loc?.name === "string" ? loc.name : null))
          .filter((name): name is string => Boolean(name?.trim()))
      : [];
  if (locationNames.length) {
    const [first, ...rest] = locationNames;
    const base = [first, ...rest.slice(0, 2)].join(", ");
    const remaining = rest.length > 2 ? rest.length - 2 : 0;
    return remaining > 0
      ? `Locations: ${base} +${remaining} more`
      : `Locations: ${base}`;
  }

  if (typeof playlist.id === "number") {
    return `Playlist #${playlist.id}`;
  }
  return undefined;
}

function buildSelectedPlaylistsSnapshot() {
  return playlistOptions.value
    .filter((playlist) => editForm.playlistIds.includes(playlist.id))
    .map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
    }));
}

function clearSheetState() {
  playlistError.value = null;
  playlistOptionsError.value = null;
  playlistOptions.value = [];
  isLoadingSheetData.value = false;
  isLoadingPlaylistOptions.value = false;
  isSavingAdChanges.value = false;
  initialEditState.value = {
    
    playlistIds: [],
  };
  resetEditForm(false);
  selectedAd.value = null;
}



const {
  containerRef: dragWrapper,
  isDragging: isDraggingTable,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} = useHorizontalDragScroll();

const {
  searchQuery,
  debouncedSearch,
  currentPage,
  pageSize,
  sortBy,
  buildApiParams,
  filters,
  setPage,
  setSort,
  status,
} = useSearchQuary(
  {
    page: 1,
    perPage: 10,
    search: "",
    sortBy: "name:asc",
    status: null,
  },
  ["status", "live_ads", "active_devices", "video_plays", "impressions"]
);

let statusAlreadyPushed = false;
watch(
  () => filters.value.status,
  (newStatus) => {
    if (
      newStatus !== undefined &&
      newStatus !== null &&
      !statusAlreadyPushed &&
      !selectedFilters.value.includes("status")
    ) {
      selectedFilters.value.push("status");
      statusAlreadyPushed = true;
    }
  },
  { immediate: true }
);

watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);
watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(
  () => filters.value.status,
  (newVal) => {
    status.value = newVal == null || newVal === "" ? null : Number(newVal);
  }
);

const fetchCampaign = async () => {
  if (!canViewAds.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    await adStore.fetchAllAdsIndex(buildApiParams());
  } finally {
    loading.value = false;
  }
};

watch([debouncedSearch, currentPage, pageSize, sortBy, status], fetchCampaign);

watch(canViewAds, (hasAccess) => {
  if (hasAccess && adStore.ads.length === 0) {
    fetchCampaign();
  }
});

onMounted(() => {
  fetchCampaign();
  roleStore.fetchAllRoleIndex();
  if (!roleStore.permissionsLoaded) {
    roleStore.fetchSignlePermissions();
  }
});

watch(isPlaylistSheetOpen, (open) => {
  if (!open) {
    clearSheetState();
  }
});

const selectedCampaigns = ref<number[]>([]);
const allSelected = computed(() => {
  return (
    adStore.ads.length > 0 &&
    selectedCampaigns.value.length === adStore.ads.length
  );
});
const isIndeterminate = computed(() => {
  return (
    selectedCampaigns.value.length > 0 &&
    selectedCampaigns.value.length < adStore.ads.length
  );
});

const toggleRow = (id: number, checked: boolean) => {
  if (checked && !selectedCampaigns.value.includes(id)) {
    selectedCampaigns.value = [...selectedCampaigns.value, id];
  } else if (!checked) {
    selectedCampaigns.value = selectedCampaigns.value.filter(
      (item) => item !== id
    );
  }
};

const setSelectedCampaigns = (ids: number[]) => {
  selectedCampaigns.value = [...ids];
};

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    setSelectedCampaigns(adStore.ads.map((c) => c.id));
  } else {
    setSelectedCampaigns([]);
  }
};

async function openAdPlaylistSheet(ad: AdResponse) {
  if (!canUpdateAd.value) return;
  selectedAd.value = { ...ad } as AdDetailResponse;
  playlistError.value = null;
  resetEditForm(false);
  initialEditState.value = {
    playlistIds: [],
  };
  playlistOptions.value = [];
  playlistOptionsError.value = null;
  isPlaylistSheetOpen.value = true;
  isLoadingSheetData.value = true;
  isLoadingPlaylistOptions.value = true;
  isSavingAdChanges.value = false;

  try {
    const [adResult, playlistResult] = await Promise.allSettled([
      adService.getAd(ad.id),
      playlistService.getAllPlaylist({ show: 100 }),
    ]);

    if (
      adResult.status === "fulfilled" &&
      adResult.value.success &&
      adResult.value.data
    ) {
      const data = adResult.value.data;
      selectedAd.value = data;

     
      const playlistIds = Array.isArray((data as any)?.playlists)
        ? (data as any).playlists
            .map((playlist: any) => Number(playlist?.id))
            .filter((id) => Number.isFinite(id))
        : [];
      editForm.playlistIds = playlistIds;

      initialEditState.value = {
        playlistIds: [...playlistIds],
      };
    } else {
      const message =
        adResult.status === "fulfilled"
          ? adResult.value.message || "Failed to load ad details."
          : (adResult.reason as any)?.message || "Failed to load ad details.";
      playlistError.value = message;
      showToast("Error", message, "error");
    }

    if (
      playlistResult.status === "fulfilled" &&
      playlistResult.value.success
    ) {
      const data = Array.isArray(playlistResult.value.data)
        ? playlistResult.value.data
        : [];
      playlistOptions.value = data.map((playlist: Playlist) => ({
        id: playlist.id,
        name: playlist.name,
        metaText: buildPlaylistMeta(playlist),
      }));
      playlistOptionsError.value = null;
      const availableIds = new Set(
        playlistOptions.value.map((playlist) => playlist.id)
      );
      if (editForm.playlistIds.length) {
        editForm.playlistIds = editForm.playlistIds.filter((id) =>
          availableIds.has(id)
        );
      }
      if (!playlistError.value) {
        initialEditState.value = {
          ...initialEditState.value,
          playlistIds: [...editForm.playlistIds],
        };
      }
    } else {
      const message =
        playlistResult.status === "fulfilled"
          ? playlistResult.value.message || "Failed to load playlists."
          : (playlistResult.reason as any)?.message ||
            "Failed to load playlists.";
      playlistOptions.value = [];
      playlistOptionsError.value = message;
      showToast("Error", message, "error");
    }
  } catch (error: any) {
    console.error(error);
    const message = error?.message || "Failed to load ad details.";
    playlistError.value = message;
    showToast("Error", message, "error");
  } finally {
    isLoadingSheetData.value = false;
    isLoadingPlaylistOptions.value = false;
  }
}

async function handleSaveAdChanges() {
  if (!canUpdateAd.value || !selectedAd.value) return;

  const payload = {
ad_id:selectedAd.value.id,
    playlistIds: [...editForm.playlistIds],
  };

  isSavingAdChanges.value = true;
  try {
   
    const res = await adService.updateAdsPlaylist(payload);
    if (res.success) {
      showToast("Success", res.message || "Ad updated successfully.", "success");
      initialEditState.value = {
        playlistIds: [...editForm.playlistIds],
      };
      selectedAd.value = {
        ...selectedAd.value,

        playlists: buildSelectedPlaylistsSnapshot(),
      };
      await fetchCampaign();
    } else {
      showToast("Error", res.message || "Failed to update ad.", "error");
    }
  } catch (error: any) {
    console.error(error);
    showToast("Error", error?.message || "Failed to update ad.", "error");
  } finally {
    isSavingAdChanges.value = false;
  }
}

const handleSort = (field: string) => {
  const [currField, currDir] = sortBy.value.split(":");
  const nextDir = currField === field && currDir === "asc" ? "desc" : "asc";
  setSort(`${field}:${nextDir}`);
};

onBeforeUnmount(() => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
});
function onCloseVideoPreview() {
  isPreviewOpen.value = false;
  videoUrl.value = null;
}
</script>

