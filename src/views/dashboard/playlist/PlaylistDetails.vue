<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import PageLayout from "@/layouts/components/PageLayout.vue";
import Status from "@/shared/components/Status.vue";
import VideoPreview from "@/shared/components/VideoPreview.vue";
import { playlistService } from "@/services/playlist-service";
import { videoService } from "@/services/video-service";
import type {
  Playlist,
  PlaylistAdSummary,
  PlaylistLocation,
} from "@/types/playlist-type";
import { DotIcon, Loader2, Play } from "lucide-vue-next";

const route = useRoute();

const playlist = ref<Playlist | null>(null);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

const videoUrl = ref<string | null>(null);
const isVideoLoading = ref(false);
const isPreviewOpen = ref(false);
const videoCache = ref<Record<string, string>>({});
const loadingVideoPath = ref<string | null>(null);
let latestRequestId = 0;

const playlistId = computed(() => {
  const rawId = route.params.id;
  if (Array.isArray(rawId)) {
    const parsed = Number(rawId[0]);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof rawId === "string") {
    const parsed = Number(rawId);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof rawId === "number") {
    return rawId;
  }
  return null;
});

async function fetchPlaylistDetails(id: number) {
  const requestId = ++latestRequestId;
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const res = await playlistService.getPlaylist(id);
    if (requestId === latestRequestId) {
      playlist.value = res.data;
    }
  } catch (error: any) {
    console.error("Failed to load playlist details", error);
    if (requestId === latestRequestId) {
      playlist.value = null;
      errorMessage.value =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load playlist details.";
    }
  } finally {
    if (requestId === latestRequestId) {
      isLoading.value = false;
    }
  }
}

watch(
  playlistId,
  (id) => {
    if (id == null) {
      latestRequestId++;
      isLoading.value = false;
      errorMessage.value = "Invalid playlist id provided.";
      playlist.value = null;
      return;
    }
    fetchPlaylistDetails(id);
  },
  { immediate: true }
);

const playlistAds = computed<PlaylistAdSummary[]>(
  () => playlist.value?.ads ?? []
);
const playlistLocations = computed<PlaylistLocation[]>(
  () => playlist.value?.locations ?? []
);

const cityNames = computed(() => {
  const names = new Set<string>();
  playlistLocations.value.forEach((loc) => {
    if (loc?.city?.name) {
      names.add(loc.city.name);
    } else if ((loc as unknown as { city_name?: string })?.city_name) {
      names.add(
        String((loc as unknown as { city_name?: string }).city_name ?? "")
      );
    }
  });
  return Array.from(names);
});

const statItems = computed(() => [
  {
    label: "Ads",
    value: playlistAds.value.length,
  },
  {
    label: "Locations",
    value: playlistLocations.value.length,
  },
  {
    label: "Cities",
    value: cityNames.value.length,
  },
]);

async function openPreview(path: string) {
  if (!path) return;
  if (videoCache.value[path]) {
    videoUrl.value = videoCache.value[path];
    isPreviewOpen.value = true;
    return;
  }

  isVideoLoading.value = true;
  loadingVideoPath.value = path;
  try {
    const res = await videoService.getVideoURL(path);
    const downloadUrl =
      res?.data?.s3_data?.original?.download_url ||
      res?.data?.s3_data?.download_url ||
      null;

    if (downloadUrl) {
      videoCache.value = { ...videoCache.value, [path]: downloadUrl };
      videoUrl.value = downloadUrl;
      isPreviewOpen.value = true;
    }
  } catch (error) {
    console.error("Error fetching video URL", error);
  } finally {
    isVideoLoading.value = false;
    loadingVideoPath.value = null;
  }
}

function formatDate(input?: string | null) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input ?? "";
  }
  return date.toLocaleString();
}

function revokeIfObjectUrl(url: string | null) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function onCloseVideoPreview() {
  isPreviewOpen.value = false;
  revokeIfObjectUrl(videoUrl.value);
  videoUrl.value = null;
}

onBeforeUnmount(() => {
  revokeIfObjectUrl(videoUrl.value);
});
</script>

<template>
  <PageLayout title="Playlist Details">
    <div class="py-6 space-y-3 max-w-2xl">
      <div
        v-if="isLoading"
        class="bg-white border border-gray-200 rounded-md p-6 text-sm text-gray-600"
      >
        Loading playlist details...
      </div>

      <div
        v-else-if="errorMessage"
        class="bg-red-50 border border-red-200 text-red-700 rounded-md p-4"
      >
        {{ errorMessage }}
      </div>

      <template v-else-if="playlist">
        <section
          class="bg-white border border-gray-200 w-full space-y-4"
        >
          <div
            class="  w-full h-full gap-3 "
          >
            <div >
              <h2 class="text-[17px] px-5 py-4 border-b-[1px] block w-full font-primary font-semibold text-gray-900 capitalize">
                Playlist Name
              </h2>
              <h2 class="text-[16px] px-5 py-4 font-semibold text-gray-900 capitalize">
                {{ playlist.name }}
              </h2>
             
            </div>
            <Status v-if="playlist.status" :status="playlist.status" />
          </div>
        </section>

        <section
          class="bg-white border border-gray-200 "
        >
          <div class="flex items-center justify-between border-b-[1px] py-4 px-5 text-[17px] font-primary">
            <h3 class=" font-semibold text-gray-900">Locations</h3>
          </div>

          <div v-if="playlistLocations.length" class=" p-5" >
            <ul class="flex gap-2 flex-wrap">
              <li
                v-for="location in playlistLocations"
                :key="location.id"
                class="border border-gray-200 py-1 text-white bg-primary rounded-full "
              >
                <p class="font-medium flex items-center pr-4 text-sm">
                  <DotIcon /> {{ location.name || `Location #${location.id}` }}
                </p>
                <p
                  v-if="location.city?.name || (location as any).city_name"
                  class="text-xs text-gray-500 mt-1"
                >
                  {{ location.city?.name || (location as any).city_name }}
                </p>
              </li>
            </ul>
          </div>
          <p v-else class="text-sm text-gray-500">
            No locations linked to this playlist.
          </p>
        </section>

        <section
          class="bg-white border border-gray-200  "
        >
          <div class="flex items-center justify-between border-b-[1px] px-5 py-4">
            <h3 class=" font-semibold text-gray-900 text-[17px] font-primary">Video Ads</h3>
          </div>

          <div v-if="playlistAds.length" class="grid gap-4 md:grid-cols-2 p-5">
            <article
              v-for="ad in playlistAds"
              :key="ad.id"
              class="flex items-center justify-between border border-gray-200 rounded-md px-4 py-3 shadow-sm"
            >
              <h4 class="text-base font-semibold text-gray-900 truncate pr-4">
                {{ ad.name }}
              </h4>
              <button
                class="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-white transition hover:bg-secondary/90 disabled:opacity-50 disabled:pointer-events-none"
                :disabled="!ad.video_url || (isVideoLoading && loadingVideoPath === ad.video_url)"
                @click="ad.video_url && openPreview(ad.video_url)"
                title="Preview video"
              >
                <Loader2
                  v-if="isVideoLoading && loadingVideoPath === ad.video_url"
                  class="w-4 h-4 animate-spin"
                />
                <Play v-else class="w-4 h-4" />
              </button>
            </article>
          </div>
          <p v-else class="text-sm text-gray-500">
            No ads linked to this playlist.
          </p>
        </section>
      </template>
    </div>

    <VideoPreview
      :isOpen="isPreviewOpen"
      :videoUrl="videoUrl"
      :width="260"
      :height="430"
      @close="onCloseVideoPreview"
    />
  </PageLayout>
</template>
