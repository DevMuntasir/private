<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { drugInteractionService } from "@/services/drug-interaction-service";
import { medicineService } from "@/services/medicine-service";
import type {
  DrugInteractionSummary,
  InteractionSeverity,
  MedicineSearchResult,
} from "@/types/medicine-types";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-vue-next";

interface PatientDetails {
  id: string;
  name: string;
  allergies: string[];
}

const prescribeForm = reactive({
  patient: {
    id: "patient-001",
    name: "Jane Smith",
    allergies: ["Penicillin", "Sulfa"],
  } as PatientDetails,
});

const searchQuery = ref("");
const searchResults = ref<MedicineSearchResult[]>([]);
const isSearching = ref(false);
const searchError = ref<string | null>(null);
const showDropdown = ref(false);

const selectedMedicines = ref<MedicineSearchResult[]>([]);
const interactionSummary = ref<DrugInteractionSummary | null>(null);
const interactionLoading = ref(false);
const interactionError = ref<string | null>(null);

const overrideState = reactive({
  allowOverride: false,
  justification: "",
});

const debouncedSearch = useDebounceFn(async (term: string) => {
  const query = term.trim();
  if (!query) {
    searchResults.value = [];
    searchError.value = null;
    return;
  }

  isSearching.value = true;
  searchError.value = null;

  try {
    const results = await medicineService.searchMedicine(query);
    searchResults.value = results;
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message ??
      (error instanceof Error ? error.message : "Unable to search medicines.");
    searchError.value = message;
  } finally {
    isSearching.value = false;
  }
}, 300);

watch(searchQuery, (value) => {
  debouncedSearch(value);
  showDropdown.value = Boolean(value.trim());
});

function closeDropdown() {
  showDropdown.value = false;
}

function addMedicine(medicine: MedicineSearchResult) {
  if (selectedMedicines.value.some((item) => item.id === medicine.id)) {
    closeDropdown();
    searchQuery.value = "";
    return;
  }

  selectedMedicines.value.push(medicine);
  searchQuery.value = "";
  searchResults.value = [];
  closeDropdown();
  runInteractionCheck();
}

function removeMedicine(id: string) {
  selectedMedicines.value = selectedMedicines.value.filter(
    (medicine) => medicine.id !== id
  );
  runInteractionCheck();
}

async function runInteractionCheck() {
  const medicationIds = selectedMedicines.value.map((item) => item.id);

  if (medicationIds.length === 0) {
    interactionSummary.value = null;
    interactionError.value = null;
    interactionLoading.value = false;
    overrideState.allowOverride = false;
    overrideState.justification = "";
    return;
  }

  interactionLoading.value = true;
  interactionError.value = null;

  try {
    const summary = await drugInteractionService.checkInteractions(
      medicationIds,
      prescribeForm.patient.allergies
    );
    interactionSummary.value = summary;
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message ??
      (error instanceof Error ? error.message : "Unable to check interactions.");
    interactionError.value = message;
  } finally {
    interactionLoading.value = false;
  }
}

const hasInteractions = computed(() => {
  if (!interactionSummary.value) {
    return false;
  }

  return (
    interactionSummary.value.interactions.length > 0 ||
    interactionSummary.value.allergyConflicts.length > 0
  );
});

const bannerVariant = computed(() => {
  if (!interactionSummary.value) {
    return "default" as const;
  }

  const highSeverity = interactionSummary.value.interactions.some(
    (interaction) => interaction.severity === "high"
  );

  if (interactionSummary.value.allergyConflicts.length > 0 || highSeverity) {
    return "destructive" as const;
  }

  if (interactionSummary.value.interactions.length > 0) {
    return "warning" as const;
  }

  if (interactionSummary.value.suggestedAlternatives.length > 0) {
    return "info" as const;
  }

  return "default" as const;
});

watch(hasInteractions, (value) => {
  if (!value) {
    overrideState.allowOverride = false;
    overrideState.justification = "";
  }
});

function formatSeverity(severity: InteractionSeverity) {
  if (!severity || severity === "unknown") {
    return "Unknown";
  }

  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

const canOverride = computed(
  () => overrideState.allowOverride && overrideState.justification.trim().length > 0
);

const showInteractionBanner = computed(() =>
  Boolean(
    interactionSummary.value &&
      (interactionSummary.value.interactions.length > 0 ||
        interactionSummary.value.allergyConflicts.length > 0 ||
        interactionSummary.value.suggestedAlternatives.length > 0)
  )
);
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Prescribe medicines</CardTitle>
        <CardDescription>
          Search for medications, review interaction warnings, and document
          overrides when clinically justified.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-8">
        <section class="space-y-3">
          <div class="flex items-baseline justify-between">
            <div>
              <h3 class="text-base font-semibold text-foreground">
                Patient
              </h3>
              <p class="text-sm text-muted-foreground">
                {{ prescribeForm.patient.name }}
              </p>
            </div>
            <div class="text-right text-sm text-muted-foreground">
              Allergy count: {{ prescribeForm.patient.allergies.length }}
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="allergy in prescribeForm.patient.allergies"
              :key="allergy"
              variant="destructive"
              class="bg-destructive/10 text-destructive border-destructive/40"
            >
              {{ allergy }}
            </Badge>
            <p
              v-if="prescribeForm.patient.allergies.length === 0"
              class="text-sm text-muted-foreground"
            >
              No documented allergies
            </p>
          </div>
        </section>

        <section class="space-y-3">
          <Label for="medicine-search" class="text-sm font-medium">Medicine</Label>
          <div class="relative">
            <Input
              id="medicine-search"
              v-model="searchQuery"
              autocomplete="off"
              placeholder="Search by name, RxNorm ID, or active ingredient"
              @focus="showDropdown = Boolean(searchQuery.trim())"
            />
            <Loader2
              v-if="isSearching"
              class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            />
            <div
              v-if="showDropdown"
              class="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-md border bg-popover p-2 shadow-lg"
            >
              <p
                v-if="!isSearching && searchResults.length === 0"
                class="px-2 py-1 text-sm text-muted-foreground"
              >
                No medicines found
              </p>
              <button
                v-for="medicine in searchResults"
                :key="medicine.id"
                type="button"
                class="flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                @click="addMedicine(medicine)"
              >
                <span class="font-medium text-foreground">
                  {{ medicine.name }}
                </span>
                <span
                  v-if="medicine.brandName || medicine.form"
                  class="text-xs text-muted-foreground"
                >
                  <template v-if="medicine.brandName">
                    Brand: {{ medicine.brandName }}
                  </template>
                  <template v-if="medicine.brandName && medicine.form"> · </template>
                  <template v-if="medicine.form">
                    {{ medicine.form }}
                  </template>
                </span>
                <span
                  v-if="medicine.activeIngredients.length"
                  class="text-xs text-muted-foreground"
                >
                  Ingredients:
                  {{
                    medicine.activeIngredients
                      .map((ingredient) =>
                        ingredient.strength
                          ? `${ingredient.name} (${ingredient.strength})`
                          : ingredient.name
                      )
                      .join(", ")
                  }}
                </span>
              </button>
            </div>
          </div>
          <p v-if="searchError" class="text-sm text-destructive">
            {{ searchError }}
          </p>
        </section>

        <section v-if="selectedMedicines.length" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Selected medicines
            </h3>
            <span class="text-xs text-muted-foreground">
              {{ selectedMedicines.length }} selected
            </span>
          </div>
          <div class="grid gap-3">
            <div
              v-for="medicine in selectedMedicines"
              :key="medicine.id"
              class="rounded-lg border border-border bg-muted/50 p-4"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="space-y-1">
                  <p class="text-base font-semibold text-foreground">
                    {{ medicine.name }}
                  </p>
                  <p
                    v-if="medicine.brandName"
                    class="text-sm text-muted-foreground"
                  >
                    Brand: {{ medicine.brandName }}
                  </p>
                  <p v-if="medicine.form" class="text-xs text-muted-foreground">
                    {{ medicine.form }}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  class="self-start text-muted-foreground"
                  @click="removeMedicine(medicine.id)"
                >
                  <X class="h-4 w-4" />
                  Remove
                </Button>
              </div>
              <div
                v-if="medicine.activeIngredients.length"
                class="mt-3 flex flex-wrap gap-2"
              >
                <Badge
                  v-for="ingredient in medicine.activeIngredients"
                  :key="`${medicine.id}-${ingredient.id}`"
                  variant="secondary"
                >
                  {{ ingredient.name }}
                  <span v-if="ingredient.strength" class="text-xs">
                    ({{ ingredient.strength }})
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <div v-if="interactionLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 class="h-4 w-4 animate-spin" />
          Checking for drug interactions…
        </div>

        <div
          v-if="interactionError"
          class="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {{ interactionError }}
        </div>

        <Alert v-if="showInteractionBanner" :variant="bannerVariant">
          <template v-if="bannerVariant === 'destructive' || bannerVariant === 'warning'">
            <AlertTriangle class="mt-0.5" />
          </template>
          <template v-else>
            <CheckCircle2 class="mt-0.5" />
          </template>
          <div class="space-y-3">
            <AlertTitle>
              <template v-if="hasInteractions">
                Potential medication issues detected
              </template>
              <template v-else>
                Suggested alternative medicines available
              </template>
            </AlertTitle>
            <AlertDescription class="space-y-3">
              <div v-if="interactionSummary?.interactions.length">
                <p class="font-medium text-foreground">Drug interactions</p>
                <ul class="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li
                    v-for="interaction in interactionSummary.interactions"
                    :key="interaction.medicineId + interaction.interactingWith.join('-')"
                    class="rounded-md border border-border/60 bg-background p-3"
                  >
                    <p class="font-semibold text-foreground">
                      {{ interaction.medicineName }} · Severity:
                      {{ formatSeverity(interaction.severity) }}
                    </p>
                    <p class="mt-1 text-sm text-muted-foreground">
                      Interacts with:
                      {{ interaction.interactingWith.join(", ") }}
                    </p>
                    <p v-if="interaction.description" class="mt-1 text-xs text-muted-foreground">
                      {{ interaction.description }}
                    </p>
                  </li>
                </ul>
              </div>

              <div v-if="interactionSummary?.allergyConflicts.length">
                <p class="font-medium text-foreground">Allergy conflicts</p>
                <ul class="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li
                    v-for="conflict in interactionSummary.allergyConflicts"
                    :key="conflict.medicineId + conflict.allergen"
                    class="rounded-md border border-destructive/40 bg-destructive/10 p-3"
                  >
                    <p class="font-semibold text-destructive">
                      {{ conflict.medicineName }} conflicts with
                      {{ conflict.allergen }}
                    </p>
                    <p v-if="conflict.description" class="mt-1 text-xs text-destructive/90">
                      {{ conflict.description }}
                    </p>
                  </li>
                </ul>
              </div>

              <div v-if="interactionSummary?.suggestedAlternatives.length">
                <p class="font-medium text-foreground">Suggested alternatives</p>
                <ul class="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li
                    v-for="alternative in interactionSummary.suggestedAlternatives"
                    :key="alternative.medicineId"
                    class="rounded-md border border-primary/30 bg-primary/10 p-3"
                  >
                    <p class="font-semibold text-foreground">
                      {{ alternative.name }}
                    </p>
                    <p v-if="alternative.reason" class="mt-1 text-xs text-muted-foreground">
                      {{ alternative.reason }}
                    </p>
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </div>
        </Alert>

        <div
          v-if="hasInteractions"
          class="space-y-4 rounded-lg border border-border bg-muted/40 p-4"
        >
          <div class="flex items-start gap-3">
            <Checkbox
              id="override-warning"
              :model-value="overrideState.allowOverride"
              @update:modelValue="(value) => (overrideState.allowOverride = Boolean(value))"
            />
            <Label for="override-warning" class="flex-1 text-sm font-medium">
              Override interaction warning
            </Label>
          </div>
          <p class="text-sm text-muted-foreground">
            Provide a clinical justification if you decide to proceed despite the
            warnings.
          </p>
          <textarea
            v-model="overrideState.justification"
            :disabled="!overrideState.allowOverride"
            rows="4"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Document your clinical reasoning, e.g. benefits outweigh the risks"
          ></textarea>
          <div class="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              :disabled="!canOverride"
            >
              Proceed with override
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
