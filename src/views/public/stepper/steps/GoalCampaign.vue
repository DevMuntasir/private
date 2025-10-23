<template>
  <div class="w-[750px] space-y-6">
    <section>
      <h2 class="font-primary text-[22px] mb-5 text-[#4C4C4D]">
        What is your campaign objective?
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          class="rounded-none cursor-pointer"
          :class="
            store.goalCampaign.goal_id === CAMPAIGN_GOAL.awarness
              ? activeCardClass
              : baseCardClass
          "
          @click="selectGoal(CAMPAIGN_GOAL.awarness)"
        >
          <CardContent class="flex flex-col items-start space-y-2">
            <div class="text-[#E6B71D] text-2xl">
              <img src="/public/icons/1.svg" alt="Awareness" />
            </div>
            <h3 class="font-medium">Awareness</h3>
            <p class="text-sm text-muted-foreground">
              Reach a broad, hyper-local and ready-to-buy audience.
            </p>
          </CardContent>
        </Card>

        <Card
          class="rounded-none cursor-pointer"
          :class="
            store.goalCampaign.goal_id === CAMPAIGN_GOAL.trafic
              ? activeCardClass
              : baseCardClass
          "
          @click="selectGoal(CAMPAIGN_GOAL.trafic)"
        >
          <CardContent class="flex flex-col items-start space-y-2">
            <div class="text-[#E6B71D] text-2xl">
              <img src="/public/icons/2.svg" alt="Traffic" />
            </div>
            <h3 class="font-medium">Traffic</h3>
            <p class="text-sm text-muted-foreground">
              Get people to visit your website.
            </p>
          </CardContent>
        </Card>
      </div>
      <p v-if="errors['goalCampaign.goal_id']" class="text-red-500 text-xs mt-1">
        {{ errors["goalCampaign.goal_id"] }}
      </p>
    </section>

    <section class="bg-white p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-[#4C4C4D]" for="campaign_name"
          >Campaign name <span class="text-red-500">*</span></label
        >
        <Input
          id="campaign_name"
          v-model="store.goalCampaign.name"
          placeholder="Give your campaign a clear name"
          data-field="name"
          :class="{ 'border-red-500': errors['goalCampaign.name'] }"
          @blur="() => validateField('goalCampaign.name', store.goalCampaign.name)"
        />
        <p v-if="errors['goalCampaign.name']" class="text-xs text-red-600 mt-1">
          {{ errors["goalCampaign.name"] }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-[#4C4C4D]" for="start_time"
            >Start date <span class="text-red-500">*</span></label
          >
          <Input
            id="start_time"
            type="date"
            v-model="store.goalCampaign.start_time"
            data-field="start_time"
            :class="{ 'border-red-500': errors['goalCampaign.start_time'] }"
            @blur="
              () =>
                validateField(
                  'goalCampaign.start_time',
                  store.goalCampaign.start_time
                )
            "
          />
          <p
            v-if="errors['goalCampaign.start_time']"
            class="text-xs text-red-600 mt-1"
          >
            {{ errors["goalCampaign.start_time"] }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-[#4C4C4D]" for="end_time"
            >End date <span class="text-red-500">*</span></label
          >
          <Input
            id="end_time"
            type="date"
            v-model="store.goalCampaign.end_time"
            data-field="end_time"
            :class="{ 'border-red-500': errors['goalCampaign.end_time'] }"
            @blur="
              () =>
                validateField(
                  'goalCampaign.end_time',
                  store.goalCampaign.end_time
                )
            "
          />
          <p
            v-if="errors['goalCampaign.end_time']"
            class="text-xs text-red-600 mt-1"
          >
            {{ errors["goalCampaign.end_time"] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-[#4C4C4D]">
            Campaign type <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="campaignType"
            @update:modelValue="handleCampaignTypeChange"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select campaign type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="(label, value) in campaignTypeOptions"
                  :key="value"
                  :value="String(value)"
                >
                  {{ label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label class="block text-sm font-medium text-[#4C4C4D]">
            Budget type <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="budgetType"
            @update:modelValue="handleBudgetTypeChange"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select budget type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="(label, value) in budgetTypeOptions"
                  :key="value"
                  :value="String(value)"
                >
                  {{ label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p
            v-if="errors['goalCampaign.budget_type']"
            class="text-xs text-red-600 mt-1"
          >
            {{ errors["goalCampaign.budget_type"] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="store.goalCampaign.campaign_type === CampaignConstant.CAMPAIGN_TYPE_A">
          <label class="block text-sm font-medium text-[#4C4C4D]" for="budget"
            >Campaign budget <span class="text-red-500">*</span></label
          >
          <Input
            id="budget"
            type="number"
            min="0"
            v-model.number="store.goalCampaign.budget"
            data-field="budget"
            :class="{ 'border-red-500': errors['goalCampaign.budget'] }"
            @blur="
              () =>
                validateField('goalCampaign.budget', store.goalCampaign.budget)
            "
          />
          <p v-if="errors['goalCampaign.budget']" class="text-xs text-red-600 mt-1">
            {{ errors['goalCampaign.budget'] }}
          </p>
        </div>

        <div v-else>
          <label class="block text-sm font-medium text-[#4C4C4D]" for="count"
            >Number of runs <span class="text-red-500">*</span></label
          >
          <Input
            id="count"
            type="number"
            min="1"
            v-model.number="store.goalCampaign.count"
            data-field="count"
            :class="{ 'border-red-500': errors['goalCampaign.count'] }"
            @blur="
              () => validateField('goalCampaign.count', store.goalCampaign.count)
            "
          />
          <p v-if="errors['goalCampaign.count']" class="text-xs text-red-600 mt-1">
            {{ errors['goalCampaign.count'] }}
          </p>
        </div>

        <div v-if="store.goalCampaign.goal_id === CAMPAIGN_GOAL.trafic">
          <label class="block text-sm font-medium text-[#4C4C4D]" for="out_url"
            >Destination URL <span class="text-red-500">*</span></label
          >
          <Input
            id="out_url"
            type="url"
            v-model="store.goalCampaign.out_url"
            placeholder="https://example.com"
            data-field="out_url"
            :class="{ 'border-red-500': errors['goalCampaign.out_url'] }"
            @blur="
              () => validateField('goalCampaign.out_url', store.goalCampaign.out_url)
            "
          />
          <p
            v-if="errors['goalCampaign.out_url']"
            class="text-xs text-red-600 mt-1"
          >
            {{ errors['goalCampaign.out_url'] }}
          </p>
        </div>
      </div>
    </section>

    <section class="bg-white p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-[#4C4C4D]">
          Target cities <span class="text-red-500">*</span>
        </label>
        <MultiSelect
          v-model="store.goalCampaign.citys_id"
          placeholder="Select cities"
          :options="cityOptions"
          @change="
            () =>
              validateField(
                'goalCampaign.citys_id',
                store.goalCampaign.citys_id
              )
          "
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-[#4C4C4D]">
          Target locations <span class="text-red-500">*</span>
        </label>
        <MultiSelect
          v-model="store.goalCampaign.location_ids"
          placeholder="Select locations"
          :options="locationOptions"
          @change="
            () =>
              validateField(
                'goalCampaign.location_ids',
                store.goalCampaign.location_ids
              )
          "
        />
        <p
          v-if="errors['goalCampaign.location_ids']"
          class="text-xs text-red-600 mt-1"
        >
          {{ errors['goalCampaign.location_ids'] }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multiselect/MultiSelect.vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignConstant, CAMPAIGN_GOAL } from "@/constant/campaign";
import { locationService } from "@/services/location-service";
import { City, CityLocation } from "@/types/location-types";
import { computed, onMounted, ref, watch } from "vue";
import { useStepperStore } from "../store/stepper.store";

const props = defineProps<{
  errors: Record<string, string>;
  validateField: (path: string, value: unknown) => void;
}>();

const store = useStepperStore();

const cityOptions = ref<{ label: string; value: number }[]>([]);
const locationOptions = ref<{ label: string; value: number }[]>([]);

const baseCardClass =
  "border bg-white hover:border-[#E6B71D] transition-colors";
const activeCardClass =
  "border-2 border-[#E6B71D] bg-[#E6B71D]/10 font-secondary-regular";

const campaignTypeOptions = CampaignConstant.getCampaignTypeOptions();
const budgetTypeOptions = CampaignConstant.getBudgetTypeOptions();

const campaignType = ref(String(store.goalCampaign.campaign_type ?? ""));
const budgetType = ref(String(store.goalCampaign.budget_type ?? ""));

function selectGoal(goal: number) {
  if (store.goalCampaign.goal_id === goal) {
    return;
  }
  store.goalCampaign.goal_id = goal;
  props.validateField("goalCampaign.goal_id", goal);
}

function handleCampaignTypeChange(value: string) {
  const numericValue = Number.parseInt(value, 10);
  store.goalCampaign.campaign_type = numericValue;
  if (numericValue === CampaignConstant.CAMPAIGN_TYPE_A) {
    store.goalCampaign.count = null;
  } else {
    store.goalCampaign.budget = 0;
  }
}

function handleBudgetTypeChange(value: string) {
  const numericValue = Number.parseInt(value, 10);
  store.goalCampaign.budget_type = numericValue;
  props.validateField("goalCampaign.budget_type", numericValue);
}

async function fetchCities() {
  try {
    const res = await locationService.getAllCity();
    cityOptions.value = res.data.map((city: City) => ({
      value: city.id,
      label: city.name,
    }));
  } catch (error) {
    console.error("Failed to fetch cities", error);
  }
}

async function fetchSubAreas(cityIds: number[] | null | undefined) {
  if (!cityIds || cityIds.length === 0) {
    locationOptions.value = [];
    store.goalCampaign.location_ids = [];
    return;
  }
  try {
    const res = await locationService.getSubAreaByCity(cityIds);
    const options = (res.data ?? []).flatMap((city: CityLocation) =>
      (city.locations ?? []).map((location) => ({
        value: Number(location.id),
        label: `${location.name}${city.name ? ` (${city.name})` : ""}`,
      }))
    );
    locationOptions.value = options;

    const validSelection =
      store.goalCampaign.location_ids?.filter((id) =>
        options.some((location) => location.value === id)
      ) ?? [];
    store.goalCampaign.location_ids = validSelection;
  } catch (error) {
    console.error("Failed to fetch locations", error);
  }
}

watch(
  () => store.goalCampaign.citys_id,
  (newValue) => {
    fetchSubAreas(newValue ?? []);
  },
  { deep: true }
);

watch(
  () => store.goalCampaign.campaign_type,
  (value) => {
    campaignType.value = value != null ? String(value) : "";
  }
);

watch(
  () => store.goalCampaign.budget_type,
  (value) => {
    budgetType.value = value != null ? String(value) : "";
  }
);

onMounted(async () => {
  await fetchCities();
  if (store.goalCampaign.citys_id?.length) {
    await fetchSubAreas(store.goalCampaign.citys_id);
  }
});
</script>

<style scoped>

</style>
