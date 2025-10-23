<template>
  <div class="w-full mx-auto bg-background">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <div
        v-if="allowedTemplates.includes(1)"
        @click="selectTemplate(1)"
        @keydown.enter.prevent="selectTemplate(1)"
        @keydown.space.prevent="selectTemplate(1)"
        role="button"
        tabindex="0"
        :aria-pressed="selectedTemplate === 1"
        :class="[
          'group relative cursor-pointer transition-all duration-300 ease-out border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          selectedTemplate === 1
            ? 'ring-2 ring-accent shadow-lg border-accent bg-accent/5'
            : 'border-border hover:scale-105 hover:shadow-md',
        ]"
      >
        <div
          v-if="selectedTemplate === 1"
          class="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-secondary text-white px-2 py-1 text-xs font-medium shadow"
        >
          <Check class="w-3.5 h-3.5" /> Selected
        </div>
        <div class="bg-card rounded-xl p-3 h-full">
          <div
            class="aspect-[3/4] mb-6 p-2 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20"
          >
            <div class="relative w-full h-[250px] bg-border rounded-lg">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <VideoIcon class="w-4 h-4" />
                  <span class="text-xs font-medium"
                    >Video 1080x1920 (9:16)</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="text-center">
            <h3
              class="text-md font-semibold text-card-foreground mb-2 font-sans"
            >
              Video Only
            </h3>
          </div>
        </div>
      </div>

      <div
        v-if="allowedTemplates.includes(2)"
        @click="selectTemplate(2)"
        @keydown.enter.prevent="selectTemplate(2)"
        @keydown.space.prevent="selectTemplate(2)"
        role="button"
        tabindex="0"
        :aria-pressed="selectedTemplate === 2"
        :class="[
          'group relative cursor-pointer transition-all duration-300 ease-out border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          selectedTemplate === 2
            ? 'ring-2 ring-accent shadow-lg border-accent bg-accent/5'
            : 'border-border hover:scale-105 hover:shadow-md',
        ]"
      >
        <div
          v-if="selectedTemplate === 2"
          class="absolute bg-secondary top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full text-white px-2 py-1 text-xs font-medium shadow"
        >
          <Check class="w-3.5 h-3.5" /> Selected
        </div>
        <div class="bg-card rounded-xl p-3 h-full">
          <div
            class="aspect-[3/4] mb-6 p-2 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20"
          >
            <div class="relative w-full h-[100px] bg-border rounded-lg">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <VideoIcon class="w-4 h-4" />
                  <span class="text-xs font-medium"
                    >Video 1067 A- 600 (16:9)</span
                  >
                </div>
              </div>
            </div>
            <div class="relative w-full h-[150px] bg-border rounded-lg mt-2">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon class="w-4 h-4" />
                  <span class="text-xs font-medium"
                    >Poster 1067 A- 1304 (9:11)</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="text-center">
            <h3
              class="text-md font-semibold text-card-foreground mb-2 font-sans"
            >
              Landscape Video + Poster
            </h3>
          </div>
        </div>
      </div>

      <div
        v-if="allowedTemplates.includes(3)"
        @click="selectTemplate(3)"
        @keydown.enter.prevent="selectTemplate(3)"
        @keydown.space.prevent="selectTemplate(3)"
        role="button"
        tabindex="0"
        :aria-pressed="selectedTemplate === 3"
        :class="[
          'group relative cursor-pointer transition-all  duration-300 ease-out border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          selectedTemplate === 3
            ? 'ring-2 ring-accent shadow-lg border-accent bg-accent/5'
            : 'border-border hover:scale-105 hover:shadow-md',
        ]"
      >
        <div
          v-if="selectedTemplate === 3"
          class="absolute bg-secondary top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full text-white px-2 py-1 text-xs font-medium shadow"
        >
          <Check class="w-3.5 h-3.5" /> Selected
        </div>
        <div class="bg-card rounded-xl p-3 h-full">
          <div
            class="aspect-[3/4] mb-6 p-2 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20"
          >
            <div class="relative w-full h-[180px] bg-border rounded-lg">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <VideoIcon class="w-4 h-4" />
                  <span class="text-xs font-medium"
                    >Video 906 A- 1610 (9:16)</span
                  >
                </div>
              </div>
            </div>
            <div class="relative w-full h-[70px] bg-border rounded-lg mt-2">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon class="w-4 h-4" />
                  <span class="text-xs font-medium"
                    >Poster 906 A- 302 (3:1)</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="text-center">
            <h3
              class="text-md font-semibold text-card-foreground mb-2 font-sans"
            >
              Portrait Video + Poster
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Check, Image as ImageIcon, Video as VideoIcon } from "lucide-vue-next";
import { nextTick, onMounted, ref, watch } from "vue";



const props = defineProps({
  initialTemplate: {
    type: Number,
    default: null,
  },
  goalId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["template-select"]);

const selectedTemplate = ref(props.initialTemplate);
const allowedTemplates = ref([1, 2, 3]);


watch(
  () => props.initialTemplate,
  (val) => {
    if (val !== null && val !== undefined) {
      selectedTemplate.value = val;
    }
  }
);

async function loadCampaignGoal() {
    const isTraffic = props.goalId === 2
   allowedTemplates.value = isTraffic ? [2, 3] : [1]
    if (!allowedTemplates.value.includes(selectedTemplate.value)) {
      await nextTick()
      selectTemplate(allowedTemplates.value[0])
    }
}

onMounted(loadCampaignGoal)
watch(() => props.goalId, loadCampaignGoal)

const selectTemplate = async (templateId) => {
  selectedTemplate.value = templateId;
  emit("template-select", templateId);
};
</script>
