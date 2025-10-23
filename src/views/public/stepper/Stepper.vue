 <script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useToast } from "@/composeable/useToast";
import { CampaignConstant } from "@/constant/campaign";
import { useRoleStore } from "@/store/common/role-permission-store";
import { useAuthStore } from "@/store/auth-store";


import { Loader, MoveLeft, MoveRight } from "lucide-vue-next";
import { computed, nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import StepperHeader from "./StepperHeader.vue";
import { stepperSchemas } from "./stepper-schema";
import { useStepperStore } from "./store/stepper.store";
import BusinessInfo from "./steps/BusinessInfo.vue";
import GoalCampaign from "./steps/GoalCampaign.vue";
import { useUserStore } from "@/store/user-store";

const TOTAL_STEPS = 2;

const { showToast } = useToast();
const router = useRouter();
const store = useStepperStore();
const auth = useAuthStore();
const roleStore = useRoleStore();
const userStore = useUserStore();

const currentStep = ref(1);
const isLoading = ref(false);
const formReady = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);
const errors = ref<Record<string, string>>({});

const steps = [
  {
    title: "About your business",
    component: BusinessInfo,
    section: "businessInfo",
  },
  {
    title: "Campaign Objective",
    component: GoalCampaign,
    section: "goalCampaign",
  },
] as const;

const activeSectionKey = computed(() => steps[currentStep.value - 1].section);

const sectionErrors = computed(() =>
  Object.fromEntries(
    Object.entries(errors.value).filter(([key]) =>
      key.startsWith(`${activeSectionKey.value}.`)
    )
  )
);

const groupedSteps = [
  {
    title: "Get started",
    steps: [0],
  },
  {
    title: "Plan campaign",
    steps: [1],
  },
];

onMounted(async () => {
  formReady.value = false;
  await userStore.fetchAuthUserInfo();

  try {
    
    hydrateFromInitialResponse(data);
    const stepIndex = clampStep((data?.stepper_count ?? 0) + 1);
    currentStep.value = stepIndex;
    router.replace({
      query: { step: String(stepIndex) },
    });
  } catch (error) {
    console.error("Failed to load onboarding data", error);
  } finally {
    formReady.value = true;
  }
});

function clampStep(step: number) {
  if (!Number.isFinite(step)) return 1;
  return Math.min(Math.max(step, 1), TOTAL_STEPS);
}

function hydrateFromInitialResponse(data: InitialResponse) {
  if (!data) return;

  try {
    store.setClientId(data?.client?.id ?? null);
    if (data.client?.name || data.client?.reg_number) {
      store.updateSection("businessInfo", {
        name: data.client?.name ?? "",
        reg_number: data.client?.reg_number ?? "",
      });
      store.saveSnapshot("businessInfo");
    }

    if (data.campaign) {
      store.updateSection("goalCampaign", {
        goal_id: data.campaign.goals?.id ?? 1,
        name: data.campaign.name ?? "",
        budget_type: data.campaign.budget_type?.value ?? 1,
        budget: Number(data.campaign.budget ?? 0),
        start_time: data.campaign.start_time?.split(" ")[0] ?? "",
        end_time: data.campaign.end_time?.split(" ")[0] ?? "",
        location_ids:
          data.campaign?.location?.map((location) => location.id) ?? [],
        citys_id:
          data.campaign?.location?.map((location) => location.id) ?? [],
        out_url: data.campaign.out_url ?? "",
        type: data.campaign.type ?? "Video ads",
        format_ads: data.campaign.format_ads?.value ?? 1,
        bid_strategy: data.campaign.bid_strategy?.value ?? 1,
        id: data.campaign.id ?? null,
        count: calculatePtoVp(
          data.campaign.p,
          data.campaign.start_time,
          data.campaign.end_time
        ),
        campaign_type: data.campaign.campaign_type?.value
          ? Number(data.campaign.campaign_type?.value)
          : CampaignConstant.CAMPAIGN_TYPE_A,
      });
      store.saveSnapshot("goalCampaign");
    }

    auth.stepper_count = data.stepper_count ?? 0;
    auth.is_stepper_complete = data.is_stepper_complete ?? 0;
    localStorage.setItem(
      "stepper_count",
      JSON.stringify(data.stepper_count ?? 0)
    );
    localStorage.setItem(
      "is_stepper_complete",
      JSON.stringify(data.is_stepper_complete ?? 0)
    );
    store.saveSnapshot("businessInfo");
    store.saveSnapshot("goalCampaign");
  } catch (error) {
    console.error("Failed to hydrate onboarding store", error);
  }
}

async function nextStep() {
  const section = steps[currentStep.value - 1].section;
  const validator = stepperSchemas[section];

  errors.value = {};

  try {
    isLoading.value = true;
    await validator.validate(store[section], { abortEarly: false });

    if (store.hasChanged(section)) {
      await saveStepData(section);
      store.saveSnapshot(section);
    }

    if (currentStep.value < steps.length) {
      const next = currentStep.value + 1;
      updateStepperCount(next - 1);
      currentStep.value = next;
      await nextTick();
      scrollContainer.value?.scrollTo({ top: 0, behavior: "smooth" });
      router.replace({
        query: { step: String(currentStep.value) },
      });
    } else {
      await markStepperComplete();
    }
  } catch (error: any) {
    handleValidationError(error, section);
  } finally {
    isLoading.value = false;
  }
}

async function markStepperComplete() {
  updateStepperCount(TOTAL_STEPS);
  auth.is_stepper_complete = 1;
  localStorage.setItem("is_stepper_complete", JSON.stringify(1));
  await roleStore.fetchSignlePermissions().catch(() => {});
  showToast("Success", "Onboarding complete. Redirecting to dashboard.", "success");
  setTimeout(() => {
    router.push("/private/overview");
  }, 1500);
}

async function saveStepData(section: (typeof steps)[number]["section"]) {
  switch (section) {
    case "businessInfo": {
      await campaignService.submitAboutBusiness({
        name: store.businessInfo.name,
        reg_number: store.businessInfo.reg_number ?? "",
      });
      await userStore.fetchAuthUserInfo();
      break;
    }
    case "goalCampaign": {
      if (!store.clientId) {
        showToast(
          "Missing client information",
          "Please refresh the page to reload your onboarding data.",
          "error"
        );
        throw new Error("Missing clientId for onboarding");
      }
      const payload = {
        ...store.goalCampaign,
        start_time: appendTime(store.goalCampaign.start_time),
        end_time: appendTime(store.goalCampaign.end_time),
        p: calculateP({
          start_time: store.goalCampaign.start_time,
          end_time: store.goalCampaign.end_time,
          count: store.goalCampaign.count ?? 0,
        }),
      };

      if (!store.goalCampaign.id) {
        const { data } = await campaignService.create(
          payload,
          store.clientId ?? 0
        );
        store.updateSection("goalCampaign", { id: data.id });
      } else {
        await campaignService.updateCampaign(
          Number(store.goalCampaign.id),
          payload,
          store.clientId ?? 0
        );
      }
      break;
    }
  }
}

function appendTime(date: string) {
  if (!date) return "";
  return `${date} 00:00:00`;
}

function calculateP(values: {
  start_time: string;
  end_time: string;
  count: number;
}) {
  const start = new Date(values.start_time);
  const end = new Date(values.end_time);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (24 * 3600 * 1000)));
  const result = values.count / dayCount;

  if (result < 1) {
    errors.value["goalCampaign.count"] =
      "Run count must be increased or campaign duration shortened";
    return result;
  }
  return Math.ceil(result);
}

function calculatePtoVp(p?: number, start?: string, end?: string) {
  if (!p || !start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  const dayCount = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000))
  );
  return Math.ceil(p * dayCount);
}

async function prevStep() {
  if (currentStep.value <= 1) return;
  currentStep.value -= 1;
  router.replace({ query: { step: String(currentStep.value) } });
  await nextTick();
  scrollContainer.value?.scrollTo({ top: 0, behavior: "smooth" });
}

async function validateField(path: string, value: unknown) {
  const [section, field] = path.split(".");
  const validator = stepperSchemas[section as keyof typeof stepperSchemas];
  if (!validator) {
    return;
  }

  try {
    await validator.validateAt(field, { [field]: value });
    delete errors.value[path];
  } catch (error: any) {
    errors.value[path] = error.message;
  }
}

function handleValidationError(error: any, section: string) {
  if (error?.name === "ValidationError") {
    error.inner.forEach((innerError: any) => {
      if (innerError.path) {
        errors.value[`${section}.${innerError.path}`] = innerError.message;
      }
    });
    const feedback = Object.values(sectionErrors.value).slice(0, 3);
    if (feedback.length) {
      showToast(
        "Please review inputs",
        feedback.join(", "),
        "error"
      );
    }
    scrollToFirstError(section);
  } else if (error?.response?.data?.errors) {
    Object.entries(error.response.data.errors).forEach(
      ([key, val]: [string, any]) => {
        errors.value[`${section}.${key}`] = Array.isArray(val) ? val[0] : val;
      }
    );
  } else if (error?.response?.data?.message) {
    showToast("Error", error.response.data.message, "error");
  } else {
    console.error("Unexpected error", error);
  }
}

function scrollToFirstError(section: string) {
  const fieldKey = Object.keys(errors.value).find((key) =>
    key.startsWith(section)
  );
  if (!fieldKey) return;
  const field = fieldKey.replace(`${section}.`, "");
  nextTick(() => {
    const el = scrollContainer.value?.querySelector(
      `[data-field="${field}"]`
    );
    if (el && "scrollIntoView" in el) {
      (el as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });
}

function updateStepperCount(value: number) {
  auth.stepper_count = value;
  localStorage.setItem("stepper_count", JSON.stringify(value));
}
</script>

<template>
  <div class="min-h-screen bg-[#e0dcd6e2] flex flex-col">
    <StepperHeader />
    <div class="flex flex-1">
      <aside
        class="w-[260px] bg-[#F5F2EE] py-10 px-6 border-r text-[#FF501F] border-[#E0DCD6] font-primary hidden md:block"
      >
        <div>
          <div
            v-for="(group, index) in groupedSteps"
            :key="group.title"
            class="relative pb-5"
          >
            <div class="flex items-start gap-3">
              <div>
                <div
                  class="w-4 h-4 rounded-full border border-[#E08C23] flex items-center justify-center text-sm z-10 bg-[#F5F2EE]"
                ></div>
                <div
                  v-if="index < groupedSteps.length - 1"
                  class="absolute top-4 left-[7px] w-0.5 h-full bg-[#E08C23]"
                ></div>
              </div>
              <div
                :class="{
                  'text-primary font-semibold text-md': group.steps.includes(
                    currentStep - 1
                  ),
                  'text-[#4f4f4f] font-semibold text-md': !group.steps.includes(
                    currentStep - 1
                  ),
                }"
              >
                {{ group.title }}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <section class="flex-1 p-6 overflow-y-auto" ref="scrollContainer">
        <div class="mx-auto w-fit">
          <div v-if="!formReady" class="space-y-6 animate-pulse w-[600px]">
            <div class="h-8 w-1/2 bg-gray-300 rounded"></div>
            <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
            <div class="space-y-4 mt-6">
              <div class="h-10 bg-gray-200 rounded"></div>
              <div class="h-10 bg-gray-200 rounded"></div>
              <div class="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>

          <component
            v-else
            :is="steps[currentStep - 1].component"
            :errors="errors"
            :validateField="validateField"
          />

          <div class="mt-6 flex justify-end gap-6">
            <Button
              type="button"
              variant="ghost"
              class="!w-fit text-secondary"
              @click="prevStep"
              :disabled="currentStep === 1 || isLoading"
            >
              <MoveLeft class="mr-2" />
              Back
            </Button>
            <Button
              type="button"
              class="btn"
              :disabled="isLoading"
              @click="nextStep"
            >
              <Loader v-if="isLoading" class="animate-spin mr-2" />
              {{ currentStep === steps.length ? "Finish" : "Next" }}
              <MoveRight class="ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template> 
