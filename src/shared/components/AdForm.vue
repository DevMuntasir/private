<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useToast } from "@/composeable/useToast";

import { adService } from "@/services/ad-service";
import { videoService } from "@/services/video-service";
import {
  Building,
  ChevronUpIcon,
  Loader,
  PlusCircle,
  XIcon,
} from "lucide-vue-next";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as yup from "yup";
import PosterImageUploader from "./PosterImageUploader.vue";
import VideoPreview from "./VideoPreview.vue";
import AdGoal from "./AdGoal.vue";
import { Input } from "@/components/ui/input";
import AdLayoutSelector from "./AdLayoutSelector.vue";

/* ---------------------------------------
 * Route / Router
 * ------------------------------------- */
const route = useRoute();
const router = useRouter();

const adId = computed(() => Number(route.params.id));
const isEditMode = computed(() => Boolean(route.params.id && route.path.includes("ads/edit")));

/* ---------------------------------------
 * UI + Sections
 * ------------------------------------- */
const { showToast } = useToast();
const sections = reactive({
  adName: true,
  targetAudience: true,
  adCreation: true,
});
const showConfirmationModal = ref(false);
const isAgreementChecked = ref(false);
const shouldCloseModalOnFileSelect = ref(false);
const isPreviewOpen = ref(false);
const isLoadingAd = ref(false);
const isSubmitting = ref(false);
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

/* ---------------------------------------
 * Goal / Template
 * ------------------------------------- */
const goal_id = ref<number>(1);
const selectedLayoutId = ref<number | null>(null);

const goalTemplates: Record<number, { allowed: number[]; default: number }> = {
  1: { allowed: [1], default: 1 },
  2: { allowed: [2, 3], default: 2 },
};
function ensureLayoutForGoal(goal: number, { force = false } = {}) {
  const cfg = goalTemplates[goal] ?? goalTemplates[1];
  const current = selectedLayoutId.value;
  selectedLayoutId.value =
    !force && current != null && cfg.allowed.includes(current) ? current : cfg.default;
  // keep form value in sync
  try {
    values.template_id = selectedLayoutId.value;
  } catch {}
}
const selectGole = (goal: number) => {
  goal_id.value = goal;
  setFieldValue("goal_id", goal);
  ensureLayoutForGoal(goal, { force: true });
};

/* ---------------------------------------
 * Video State (consolidated)
 * ------------------------------------- */
const video = reactive({
  file: null as File | string | null,
  path: "" as string,                 
  uploadUrl: "",                      
  previewUrl: "",                     
  thumbDataUrl: "",                  
  width: null as number | null,
  height: null as number | null,
  duration: null as number | null,
  uploading: false,
  progress: 0,
  generated: false,
  loadingPreview: false,
  error: "" as string,
});

/* ---------------------------------------
 * Poster/QR
 * ------------------------------------- */
const posterFile = ref<File | null>(null);
const posterUrl = ref<string | null>(null);
const isGeneratingQR = ref(false);

/* ---------------------------------------
 * Derived Flags
 * ------------------------------------- */
const requiresPoster = computed(() => [2, 3].includes(selectedLayoutId.value ?? 0));
const hasVideo = computed(() => !!video.path);
const canGenerate = computed(
  () =>
    hasVideo.value &&
    !video.uploading &&
    !video.error &&
    (!requiresPoster.value || !!posterFile.value)
);
const canSave = computed(
  () => hasVideo.value && (!requiresPoster.value || video.generated) && !isSubmitting.value && !video.error
);

/* ---------------------------------------
 * Vee-Validate Form
 * ------------------------------------- */
type FormValues = {
  adName: string;
  out_url: string | null;
  template_id: number | null;
  qr_path: string | null;
  goal_id: number;
  video_url: string | null;
};

const schema = yup.object({
  adName: yup.string().max(255).required("Ad name is required!"),
  goal_id: yup.number().oneOf([1, 2]).required("Goal is required!"),
  qr_path: yup.string().nullable(),
  out_url: yup
    .string()
    .url("Must be a valid URL")
    .max(2048, "URL is too long")
    .nullable()
    .when("goal_id", {
      is: (g: number) => g === 2,
      then: (s) => s.required("Please provide a URL for goal 2."),
      otherwise: (s) => s.nullable(),
    }),
});

const { handleSubmit, values, resetForm, setFieldValue } = useForm<FormValues>({
  validationSchema: schema,
  initialValues: {
    adName: "",
    out_url: "",
    template_id: null,
    qr_path: "",
    goal_id: goal_id.value,
    video_url: null,
  },
});

/* ---------------------------------------
 * Helpers
 * ------------------------------------- */
function clearVideoState() {
  video.file = null;
  video.path = "";
  video.uploadUrl = "";
  video.previewUrl = "";
  video.thumbDataUrl = "";
  video.width = null;
  video.height = null;
  video.duration = null;
  video.progress = 0;
  video.generated = false;
  video.error = "";
  try {
    if (fileInput.value) fileInput.value.value = "";
  } catch {}
}
function clearGeneratedMedia() {
  clearVideoState();
  posterFile.value = null;
  posterUrl.value = null;
}

function expectedVideoSize() {
  switch (selectedLayoutId.value) {
    case 1:
      return { ratio: 9 / 16, label: "9:16 aspect ratio", example: "e.g., 1080 × 1920" };
    case 2:
      return { ratio: 16 / 9, label: "16:9 aspect ratio", example: "e.g., 1280 × 720" };
    case 3:
      return { ratio: 9 / 16, label: "9:16 aspect ratio", example: "e.g., 1080 × 1920" };
    default:
      return null;
  }
}
const videoSizeRequirement = computed(expectedVideoSize);

function validateVideoDimensions() {
  video.error = "";
  const exp = expectedVideoSize();
  if (!exp || !video.width || !video.height) return;

  const actual = video.width / video.height;
  const diff = Math.abs(actual - exp.ratio) / exp.ratio;
  const MAX_RATIO_DIFF = 0.02; // 2% tolerance
  if (diff > MAX_RATIO_DIFF) {
    video.error = `Invalid video aspect ratio for Template ${selectedLayoutId.value}. Expected ${exp.label}, got ${video.width}x${video.height}.`;
  }
}

/* ---------------------------------------
 * Thumbnail Generation (race-safe)
 * ------------------------------------- */
let thumbJobId = 0;
async function generateVideoThumbnail(src: string, captureAtSeconds = 0.5) {
  const jobId = ++thumbJobId;
  try {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.preload = "metadata";
    v.src = src;

    await new Promise<void>((resolve, reject) => {
      const onError = () => {
        cleanup();
        reject(new Error("Failed to load video for thumbnail"));
      };
      const onLoadedMetadata = () => {
        const t = Math.min(Math.max(captureAtSeconds, 0), Math.max(v.duration - 0.1, 0));
        const seeked = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = v.videoWidth || 320;
            canvas.height = v.videoHeight || 180;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("No 2D context");
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            if (jobId === thumbJobId) video.thumbDataUrl = canvas.toDataURL("image/jpeg", 0.8);
            cleanup();
            resolve();
          } catch (e) {
            cleanup();
            reject(e);
          }
        };
        v.addEventListener("seeked", seeked, { once: true });
        try {
          v.currentTime = t;
        } catch {
          v.addEventListener(
            "loadeddata",
            () => {
              try {
                v.currentTime = t;
              } catch {}
            },
            { once: true }
          );
        }
      };
      function cleanup() {
        v.removeEventListener("loadedmetadata", onLoadedMetadata);
        v.removeEventListener("error", onError);
        v.remove();
      }
      v.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
      v.addEventListener("error", onError, { once: true });
    });
  } catch {
    if (jobId === thumbJobId) video.thumbDataUrl = "";
  }
}

/* ---------------------------------------
 * Preview URL Fetch (race-safe)
 * ------------------------------------- */
let previewReqId = 0;
async function ensureVideoPreviewUrl() {
  if (!video.path) return;
  const myId = ++previewReqId;
  try {
    const res = await videoService.getVideoURL(video.path);
    const url = res?.data?.s3_data?.original?.download_url || "";
    if (myId === previewReqId) video.previewUrl = url;
  } catch {
    if (myId === previewReqId) video.previewUrl = "";
  }
}

/* ---------------------------------------
 * QR Code
 * ------------------------------------- */
async function generateQRCode() {
  if (!values.out_url) {
    showToast("Error", "Please enter a valid URL first", "error");
    return;
  }
  isGeneratingQR.value = true;
  try {
    const { data } = await adService.generateQRCode({ url: values.out_url as string });
    if (data && data.qr_path) {
      setFieldValue("qr_path", data.qr_path);
    } else {
      showToast("Error", "Failed to generate QR code", "error");
    }
  } catch (error) {
    console.error("Error generating QR code", error);
    showToast("Error", "Failed to generate QR code", "error");
  } finally {
    isGeneratingQR.value = false;
  }
}

/* ---------------------------------------
 * Uploading (with progress)
 * ------------------------------------- */
async function handleVideoUpload(file: File) {
  video.progress = 0;
  video.uploading = true;
  video.error = "";

  const objectUrl = URL.createObjectURL(file);
  const metaVideo = document.createElement("video");
  metaVideo.preload = "metadata";
  metaVideo.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      metaVideo.onloadedmetadata = () => {
        video.duration = Math.round(metaVideo.duration);
        video.width = metaVideo.videoWidth || null;
        video.height = metaVideo.videoHeight || null;
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      metaVideo.onerror = () => reject(new Error("Failed to read video metadata"));
    });

    validateVideoDimensions();
    if (video.error) return;

    const payload = new FormData();
    payload.append("file_name", file.name);
    payload.append("file_type", file.type);

    const { data } = await adService.adsVideoUpload(payload);
    const presignedUrl = data?.s3_data?.upload_url as string | undefined;
    video.path = data?.s3_data?.file_path || "";
    if (!presignedUrl || !video.path) throw new Error("No presigned URL returned");

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignedUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (e) => e.lengthComputable && (video.progress = Math.round((e.loaded / e.total) * 100));
      xhr.onload = () =>
        xhr.status === 200 || xhr.status === 204
          ? resolve()
          : reject(new Error(`Upload failed (${xhr.status})`));
      xhr.onerror = () => reject(new Error("Upload error"));
      xhr.send(file);
    });

    video.uploadUrl = presignedUrl.split("?")[0];
    video.file = file;
  } catch (err: any) {
    video.path = "";
    video.uploadUrl = "";
    showToast("Upload Failed", err?.message ?? "Video upload failed!", "error");
  } finally {
    video.uploading = false;
  }
}

/* ---------------------------------------
 * File Input / Drag & Drop
 * ------------------------------------- */
const triggerFileUpload = () => {
  showConfirmationModal.value = true;
};
const handleFileSelect = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (shouldCloseModalOnFileSelect.value) {
      showConfirmationModal.value = false;
      isAgreementChecked.value = false;
      shouldCloseModalOnFileSelect.value = false;
    }
    await handleVideoUpload(file);
  } else {
    shouldCloseModalOnFileSelect.value = false;
  }
};
const handleDragEnter = () => (isDragOver.value = true);
const handleDragLeave = () => (isDragOver.value = false);
const handleFileDrop = async (event: DragEvent) => {
  isDragOver.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) await handleVideoUpload(file);
};
const confirmVideoUpload = () => {
  if (isAgreementChecked.value) {
    shouldCloseModalOnFileSelect.value = true;
    nextTick(() => fileInput.value?.click());
  }
};

/* ---------------------------------------
 * Generated Video Preview
 * ------------------------------------- */
async function getVideoUrl() {
  if (!video.previewUrl) {
    video.loadingPreview = true;
    try {
      const res = await videoService.getVideoURL(video.path);
      video.previewUrl = res?.data?.s3_data?.original?.download_url || "";
      isPreviewOpen.value = true;
    } catch (error) {
      console.error("Error fetching video URL", error);
    } finally {
      video.loadingPreview = false;
    }
  } else {
    isPreviewOpen.value = true;
  }
}

/* ---------------------------------------
 * Poster handlers
 * ------------------------------------- */
const onPosterSelected = ({ file, url }: { file: File; url: string }) => {
  posterFile.value = file;
  posterUrl.value = url;
};
const onPosterCleared = () => {
  posterFile.value = null;
  posterUrl.value = null;
};

/* ---------------------------------------
 * Video Generation
 * ------------------------------------- */
const isGeneratingVideo = ref(false);
const onGenerateVideoButton = async () => {
  if (!canGenerate.value) return;
  try {
    isGeneratingVideo.value = true;
    const fd = new FormData();
    fd.append("template", String(selectedLayoutId.value));
    if (video.path) fd.append("video_path", video.path as string);
    if (posterFile.value) fd.append("poster", posterFile.value);
    if (values.qr_path) fd.append("qr_path", values.qr_path as string);
    const resp = await videoService.generateVideo(fd);
    const out = resp?.data;
    if (out) {
      if (out.s3_path) {
        video.path = out.s3_path;
        video.generated = true;
        video.uploadUrl = "";
      } else if (out.video_path) {
        video.path = out.video_path;
        video.generated = true;
      }
      if (out.video_url) {
        // optional display-only
        video.uploadUrl = out.video_url;
      }
    }
  } catch (err: any) {
    const msg =
      err?.code === "ECONNABORTED"
        ? "Video generation timed out. Please try again."
        : err?.message || "Failed to generate video";
    showToast("Generation Failed", msg, "error");
    console.error("video-gen error:", err);
  } finally {
    isGeneratingVideo.value = false;
  }
};

/* ---------------------------------------
 * Save / Cancel
 * ------------------------------------- */
const cancel = () => {
  resetForm();
  clearVideoState();
};

const save = handleSubmit(
  async (formValues) => {
    isSubmitting.value = true;

    const formData = new FormData();
    formData.set("name", formValues.adName);
    formData.set("at", String(video.duration ?? ""));
    formData.set("template_id", String(selectedLayoutId.value ?? ""));
    formData.set("goal_id", String(formValues.goal_id));
    if (formValues.out_url) formData.set("out_url", formValues.out_url);
    if (formValues.qr_path) formData.set("qr_path", formValues.qr_path);
    if (video.path) formData.set("video_url", video.path);

    try {
      const res = isEditMode.value
        ? await adService.update(adId.value!, { ...formValues, name: formValues.adName })
        : await adService.create(formData);

      if (res.success) {
        showToast(res.message, "Your ad is successfully created", "success");
        resetForm();
        clearVideoState();
        if (!isEditMode.value) {
          await router.push({ name: "ads" });
        }
      }
    } catch (error: any) {
      showToast(error?.message || "Something went wrong!", "Failed to create ad!", "error");
    } finally {
      isSubmitting.value = false;
    }
  },
  (er) => {
    console.log(er);
  }
);

/* ---------------------------------------
 * Template selection (single source of truth)
 * ------------------------------------- */
function onSelectedLayout(layoutId: number) {
  const prev = selectedLayoutId.value;
  selectedLayoutId.value = layoutId;
  // keep form value in sync
  try {
    values.template_id = layoutId;
  } catch {}
  // Always clear previous media when template actually changes
  if (prev !== null && prev !== layoutId) {
    clearVideoState();
    posterFile.value = null;
    posterUrl.value = null;
  }
  // Re-validate if we have known dimensions
  video.error = "";
  if (video.width && video.height) {
    validateVideoDimensions();
  }
}

/* ---------------------------------------
 * Watchers (minimal & purposeful)
 * ------------------------------------- */
watch(
  () => video.path,
  () => {
    video.previewUrl = "";
    ensureVideoPreviewUrl();
  }
);
watch(
  () => video.previewUrl,
  (url) => {
    if (url) generateVideoThumbnail(url);
    else video.thumbDataUrl = "";
  }
);
watch(selectedLayoutId, (next) => {
  // keep form sync
  values.template_id = next ?? null;
  if (video.width && video.height) validateVideoDimensions();
});
watch(
  () => values?.template_id,
  (t) => {
    const n = Number(t);
    if (!isNaN(n) && selectedLayoutId.value !== n) selectedLayoutId.value = n;
  },
  { immediate: true }
);

/* ---------------------------------------
 * onMounted: hydrate edit mode or pick default
 * ------------------------------------- */
onMounted(async () => {
  if (isEditMode.value) {
    isLoadingAd.value = true;
    try {
      const { data } = await adService.getAd(adId.value!);

      if (data) {
        resetForm({
          values: {
            adName: data.name,
            template_id: (data as any)?.template_id ?? null,
            out_url: data.out_url ?? "",
            qr_path: (data as any)?.qr_path ?? "",
            video_url: data.video_url ?? null,
            goal_id:
              (data as any)?.goal?.value != null ? Number((data as any)?.goal?.value) : goal_id.value,
          },
        });

        // normalize goal
        const apiGoal = (data as any)?.goal?.value != null ? Number((data as any)?.goal?.value) : null;
        if (apiGoal === 1 || apiGoal === 2) {
          goal_id.value = apiGoal;
          setFieldValue("goal_id", apiGoal);
        }

        // normalize template
        try {
          const t = Number((data as any)?.template_id ?? (data as any)?.template);
          if (!Number.isNaN(t)) selectedLayoutId.value = t;
        } catch {}

        // existing video
        if (data.video_url) {
          video.path = data.video_url;
          video.file = "existing";
          video.generated = true;
        }

        // poster
        try {
          posterUrl.value = (data as any)?.poster_url || (data as any)?.poster || null;
        } catch {}
      }
    } catch (err) {
      console.log(err);
      showToast("Failed to load ad", "Something went wrong loading ad data", "error");
    } finally {
      ensureLayoutForGoal(goal_id.value, { force: selectedLayoutId.value == null });
      isLoadingAd.value = false;
    }
  } else {
    ensureLayoutForGoal(goal_id.value, { force: true });
  }
});

/* ---------------------------------------
 * Expose to parent (unchanged)
 * ------------------------------------- */
defineExpose({
  save,
  cancel,
  formData: computed(() => ({ ...values, videoFile: video.file })),
});
</script>

<template>
  <!-- Confirmation Modal -->
  <template v-if="showConfirmationModal">
    <div class="fixed inset-0 bg-black/10 backdrop-blur-[2px] bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg max-w-md w-full shadow-lg space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Confirmation Required</h2>
        <p class="text-sm text-gray-600">
          By uploading, you confirm your video complies with our Terms and Conditions. Content must not be fraudulent,
          sexually explicit, violent, discriminatory, or infringe on any rights. We reserve the right to reject
          non-compliant uploads.
        </p>
        <label class="flex items-center space-x-2 text-sm">
          <input type="checkbox" v-model="isAgreementChecked" class="w-4 h-4 accent-secondary" />
          <span>I agree to the terms and conditions.</span>
        </label>
        <div class="flex justify-end gap-3 mt-4">
          <Button type="button" variant="ghost" @click="showConfirmationModal = false">Cancel</Button>
          <Button type="button" class="btn" :disabled="!isAgreementChecked" @click="confirmVideoUpload">Continue</Button>
        </div>
      </div>
    </div>
  </template>

  <!-- Loading skeleton in edit mode -->
  <template v-if="isEditMode && isLoadingAd">
    <div class="max-w-3xl mt-5 space-y-6">
      <div class="bg-white rounded-[3px] p-6 space-y-4 animate-pulse">
        <div class="h-5 w-32 rounded bg-slate-200"></div>
        <div class="h-20 rounded bg-slate-200"></div>
      </div>
      <div class="bg-white rounded-[3px] p-6 space-y-4 animate-pulse">
        <div class="h-5 w-40 rounded bg-slate-200"></div>
        <div class="h-10 rounded bg-slate-200"></div>
        <div class="h-10 rounded bg-slate-200"></div>
      </div>
      <div class="bg-white rounded-[3px] p-6 space-y-4 animate-pulse">
        <div class="h-5 w-48 rounded bg-slate-200"></div>
        <div class="h-56 rounded bg-slate-200"></div>
      </div>
      <div class="bg-white rounded-[3px] p-6 space-y-4 animate-pulse">
        <div class="h-5 w-44 rounded bg-slate-200"></div>
        <div class="h-24 rounded bg-slate-200"></div>
      </div>
    </div>
  </template>

  <template v-else>
    <AdGoal class="max-w-3xl" :goal="goal_id" @update:goal="selectGole" />

    <form @submit.prevent="save">
      <div class="max-w-3xl mt-5 min-h-screen space-y-6">
        <!-- Destination URL (Goal 2) -->
        <div v-if="goal_id == 2" value="destination-url" class="bg-white rounded-[3px] font-primary">
          <p class="text-[14px] border-b-[1px] p-4">Destination URL</p>
          <div class="text-sm px-6 text-muted-foreground py-3">
            <div class="space-y-2">
              <Field name="out_url" v-slot="{ field, errorMessage }">
                <div class="flex h-full">
                  <Input
                    id="out_url"
                    :model-value="field.value ?? ''"
                    type="url"
                    placeholder="https://example.com"
                    class="w-full rounded-none h-[40px] border-2 form-input"
                    @update:modelValue="field.onChange"
                    @blur="field.onBlur"
                  />
                  <Button
                    @click="generateQRCode()"
                    type="button"
                    class="btn ml-2 mr-auto flex items-center gap-2 !h-[45px]"
                    :aria-busy="isGeneratingQR"
                    :aria-disabled="isGeneratingQR"
                  >
                    <Loader v-if="isGeneratingQR" class="animate-spin" />
                    <Building v-else />
                  </Button>
                </div>
                <p v-if="errorMessage" class="text-sm text-red-600 mt-1">
                  {{ errorMessage }}
                </p>
              </Field>
              <p class="text-[12px] text-muted-foreground font-secondary-Regular">
                Enter the website users should visit when they engage with your ad then hit the generate button.
              </p>
            </div>
          </div>
        </div>

        <!-- All other sections show once URL exists for goal 2 or goal 1 selected -->
        <div v-show="values.out_url || goal_id == 1">
          <!-- Ad name -->
          <div class="bg-white border">
            <div class="flex justify-between items-center p-4 cursor-pointer border-b-[1px]" @click="sections.adName = !sections.adName">
              <h3 class="text-sm font-medium font-primary text-gray-900">Ad name</h3>
              <ChevronUpIcon :class="['w-4 h-4 transition-transform', { 'rotate-180': !sections.adName }]" />
            </div>
            <div v-show="sections.adName" class="px-6 py-4">
              <div class="relative">
                <Field name="adName" type="text" as="input" maxlength="255" placeholder="Ad Name" class="w-full border-[#E6B71D] form-input" />
                <div class="absolute right-3 top-2 text-xs text-gray-400">
                  {{ values.adName.length }}/255
                </div>
                <ErrorMessage name="adName" class="text-red-500 text-xs mt-1" />
              </div>
            </div>
          </div>

          <h3 class="text-[22px] font-medium mb-2 font-primary mt-10 text-[#4C4C4D]">1) Upload your video ad</h3>
          <p class="text-xs text-gray-600 mb-4">
            The video you upload must be of MP4 format of 15-second duration with 1080 (w) by 1920 (h) resolution for
            optimal viewing. Note that no audio will be played.
          </p>

          <div class="bg-white">
            <div class="bg-white border">
              <div class="flex justify-between items-center p-4 cursor-pointer border-[1px]" @click="sections.adCreation = !sections.adCreation">
                <h3 class="text-sm font-medium text-gray-900 font-secondary-Regular">Ad creation</h3>
                <ChevronUpIcon :class="['w-4 h-4 transition-transform', { 'rotate-180': !sections.adCreation }]" />
              </div>
            </div>

            <div v-show="sections.adCreation" class="p-6 space-y-4">
              <!-- Layout selector (only when not yet generated) -->
              <AdLayoutSelector
                v-if="!isGeneratingVideo && !video.generated"
                :initialTemplate="selectedLayoutId !== null ? selectedLayoutId : Number(values.template_id) || null"
                :goalId="goal_id"
                @template-select="onSelectedLayout"
              />

              <!-- Generating animation -->
              <div v-if="isGeneratingVideo">
                <div class="w-full h-[220px] rounded-xl border bg-primary/5 relative overflow-hidden flex flex-col items-center justify-center">
                  <div class="relative w-24 h-24 mb-4">
                    <div class="absolute inset-0 rounded-full bg-secondary/15"></div>
                    <div class="absolute inset-0 rounded-full border-2 border-secondary/40 animate-ripple"></div>
                    <div class="absolute inset-1.5 rounded-full border-2 border-secondary/30 animate-ripple-delayed"></div>
                    <div class="absolute inset-3 rounded-full bg-secondary/15 flex items-center justify-center text-secondary/30 text-xl font-bold">
                      ◎
                    </div>
                  </div>
                  <div class="text-[15px] font-medium text-primary">Generating your video...</div>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                    <span class="w-2 h-2 rounded-full bg-secondary animate-bounce delay-150ms"></span>
                    <span class="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-300ms"></span>
                  </div>
                  <div class="absolute left-0 bottom-0 w-full h-[3px] bg-primary-100/60 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-primary-500 via-amber-400 to-amber-500 animate-progress"></div>
                  </div>
                </div>
              </div>

              <!-- Generated video -->
              <div v-else-if="video.generated" class="border-2 border-dashed py-10 rounded-lg">
                <div class="flex flex-col items-center space-y-3">
                  <div class="items-center gap-4">
                    <div
                      @click="getVideoUrl()"
                      class="w-12 h-12 bg-primary mx-auto rounded-full flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                      title="Play generated video"
                      role="button"
                      tabindex="0"
                    >
                      <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <Button type="button" variant="ghost" class="text-sm" @click="clearGeneratedMedia">
                      Replace or Regenerate Ad
                    </Button>
                  </div>
                  <span class="text-xs text-gray-500">Play generated video</span>
                </div>
              </div>

              <!-- Upload + Poster -->
              <div v-else>
                <h2 class="font-[16px] font-primary">Upload your video and poster image</h2>
                <div class="flex gap-5 mt-5">
                  <PosterImageUploader
                    v-if="selectedLayoutId === 2 || selectedLayoutId === 3"
                    :templateId="selectedLayoutId"
                    :initialUrl="posterUrl || ''"
                    @poster-selected="onPosterSelected"
                    @poster-cleared="onPosterCleared"
                  />

                  <div class="max-w-[180px] aspect-[9/16] rounded-lg">
                    <div class="space-y-4">
                      <div
                        class="dropzone flex items-center justify-center cursor-pointer transition-colors"
                        :class="isDragOver ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'"
                        @dragover.prevent
                        @dragenter.prevent="handleDragEnter"
                        @dragleave.prevent="handleDragLeave"
                        @drop.prevent="handleFileDrop"
                      >
                        <input
                          ref="fileInput"
                          type="file"
                          accept="video/mp4"
                          class="hidden"
                          @change="handleFileSelect"
                        />

                        <!-- Uploading -->
                        <template v-if="video.uploading">
                          <div class="flex w-[180px] aspect-[9/16] flex-col justify-center p-6 items-center border-2 border-dashed rounded-2xl">
                            <svg class="animate-spin h-6 w-6 text-red-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span class="text-sm text-gray-500 font-medium">Uploading...</span>
                          </div>
                        </template>

                        <!-- Uploaded -->
                        <template v-else-if="video.path">
                          <div class="flex flex-col items-center max-w-[180px] justify-center">
                            <div class="aspect-[9/16] max-w-[250px] w-full">
                              <div
                                class="relative w-full h-full rounded-lg bg-gray-50 border overflow-hidden cursor-pointer group"
                                @click="getVideoUrl()"
                              >
                                <img
                                  v-if="video.thumbDataUrl"
                                  :src="video.thumbDataUrl"
                                  alt="Video thumbnail"
                                  class="w-full h-full object-cover"
                                />
                                <video
                                  v-else-if="video.previewUrl"
                                  :src="video.previewUrl"
                                  muted
                                  playsinline
                                  autoplay
                                  loop
                                  class="w-full h-full object-cover"
                                />
                                <div v-else class="absolute inset-0 bg-gray-50 flex items-center justify-center text-gray-500 text-xs">
                                  Loading thumbnail...
                                </div>
                                <button
                                  type="button"
                                  @click.stop="clearVideoState()"
                                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white text-red-600 rounded-full p-1 shadow"
                                  title="Remove video"
                                  aria-label="Remove video"
                                >
                                  <XIcon class="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </template>

                        <!-- Empty -->
                        <template v-else>
                          <div
                            @click="triggerFileUpload"
                            class="flex flex-col items-center rounded-2xl max-w-[180px] p-6 justify-center text-center gap-2 border-2 border-dashed"
                            role="button"
                            tabindex="0"
                          >
                            <div class="w-10 h-10 rounded-full border border-red-300 flex items-center justify-center text-red-500">
                              <PlusCircle class="w-5 h-5" />
                            </div>
                            <div class="text-red-600 font-medium">Add Video</div>
                            <p class="text-[12px] text-gray-500">Drag and drop your video file or click to browse</p>
                            <p class="text-[12px] text-gray-400">Supports MP4 up to 100MB</p>
                          </div>
                        </template>
                      </div>
                    </div>

                    <!-- Progress -->
                    <template v-if="video.progress > 1 && video.progress < 100">
                      <div class="border-2 border-dashed bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                        <div class="bg-red-500 h-full transition-all duration-200" :style="{ width: video.progress + '%' }"></div>
                      </div>
                      <span class="text-sm text-gray-500 font-medium">
                        {{ video.progress == 100 ? "Upload" : "Uploading..." }} {{ video.progress }}%
                      </span>
                    </template>
                  </div>
                </div>

                <!-- Expected / Detected -->
                <div class="mt-3 text-[12px] text-gray-600" v-if="videoSizeRequirement">
                  <div>
                    Expected video size:
                    <span class="font-medium">{{ videoSizeRequirement.label }}</span>
                  </div>
                  <div v-if="videoSizeRequirement.example" class="text-gray-500 mt-1">
                    Recommended: {{ videoSizeRequirement.example }}
                  </div>
                  <div v-if="video.width && video.height" class="text-gray-500 mt-1">
                    Detected: {{ video.width }} x {{ video.height }}
                  </div>
                  <p v-if="video.error" class="text-red-600 mt-1">{{ video.error }}</p>
                </div>

                <!-- Generate Video Ad -->
                <div class="mt-4" v-if="!video.generated && selectedLayoutId !== 1">
                  <Button
                    type="button"
                    class="btn px-6 py-2 flex items-center gap-2"
                    :disabled="!canGenerate || isGeneratingVideo"
                    :aria-busy="isGeneratingVideo"
                    :aria-disabled="!canGenerate || isGeneratingVideo"
                    @click="onGenerateVideoButton"
                  >
                    <svg v-if="isGeneratingVideo" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>{{ isGeneratingVideo ? "Generating..." : "Generate Video Ad" }}</span>
                  </Button>
                  <div v-if="selectedLayoutId === 2 || selectedLayoutId === 3" class="text-[12px] text-gray-500 mt-1">
                    <template v-if="!posterFile">Poster required for this template.</template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-5">
            <Button :disabled="!canSave" :aria-disabled="!canSave" type="submit" class="btn flex items-center gap-2 px-[70px]">
              <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>{{ isSubmitting ? "Saving..." : "Save" }}</span>
            </Button>
          </div>

          <div class="flex gap-3">
            <p class="text-[10px] text-[#4C4C4D] py-5" html-for="terms">
              Important notices: By creating this ad, you agree that you have legal rights to distribute all content
              (including all videos and images) you have provided. You are responsible for compliance with all applicable
              laws and regulations in the location(s) in which you have chosen to target your advertising.
            </p>
          </div>
        </div>
      </div>
    </form>

    <VideoPreview
      :isOpen="isPreviewOpen"
      :videoUrl="video.previewUrl"
      :width="240"
      :height="440"
      logoUrl="/logo/white-logo.svg"
      @close="isPreviewOpen = false"
    />
  </template>
</template>

<style scoped>
input[type="radio"]:checked {
  background-color: #f97316;
  border-color: #f97316;
}
input[type="radio"]:focus {
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}
.dropzone {
  transition: border-color 0.2s, background-color 0.2s;
}

@keyframes ripplePulse {
  0% {
    transform: scale(0.85);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}
.animate-ripple {
  animation: ripplePulse 1.8s ease-in-out infinite;
}
.animate-ripple-delayed {
  animation: ripplePulse 1.8s ease-in-out infinite;
  animation-delay: 0.4s;
}

@keyframes linearProgress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}
.animate-progress {
  animation: linearProgress 2.2s ease-in-out infinite alternate;
}

.delay-150ms {
  animation-delay: 150ms !important;
}
.delay-300ms {
  animation-delay: 300ms !important;
}
</style>
