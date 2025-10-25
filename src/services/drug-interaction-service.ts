import { apiService } from "./api-service";
import type {
  AllergyConflictDetail,
  AlternativeRecommendation,
  DrugInteractionSummary,
  InteractionDetail,
  InteractionSeverity,
} from "@/types/medicine-types";

interface RawInteraction {
  medicineId?: string | number;
  medicine_id?: string | number;
  medicineName?: string;
  medicine_name?: string;
  interactingWith?: Array<string | number>;
  interacting_with?: Array<string | number>;
  severity?: string;
  description?: string | null;
}

interface RawAllergyConflict {
  medicineId?: string | number;
  medicine_id?: string | number;
  medicineName?: string;
  medicine_name?: string;
  allergen?: string;
  description?: string | null;
}

interface RawAlternative {
  medicineId?: string | number;
  medicine_id?: string | number;
  name?: string;
  reason?: string | null;
}

interface RawInteractionSummary {
  interactions?: RawInteraction[];
  allergyConflicts?: RawAllergyConflict[];
  allergy_conflicts?: RawAllergyConflict[];
  suggestedAlternatives?: RawAlternative[];
  suggested_alternatives?: RawAlternative[];
}

interface CheckInteractionPayload {
  medication_ids: string[];
  allergies: string[];
}

const severityPriority: Record<string, InteractionSeverity> = {
  high: "high",
  severe: "high",
  major: "high",
  moderate: "moderate",
  medium: "moderate",
  low: "low",
  minor: "low",
};

function normaliseSeverity(input?: string | null): InteractionSeverity {
  if (!input) {
    return "unknown";
  }

  const normalised = input.trim().toLowerCase();
  return severityPriority[normalised] ?? "unknown";
}

function normaliseInteraction(raw: RawInteraction): InteractionDetail {
  const id = raw.medicineId ?? raw.medicine_id ?? "";
  const interactions = raw.interactingWith ?? raw.interacting_with ?? [];

  return {
    medicineId: String(id),
    medicineName: raw.medicineName ?? raw.medicine_name ?? "Unknown medicine",
    interactingWith: interactions.map((value) => String(value)),
    severity: normaliseSeverity(raw.severity),
    description: raw.description ?? null,
  };
}

function normaliseAllergyConflict(raw: RawAllergyConflict): AllergyConflictDetail {
  const id = raw.medicineId ?? raw.medicine_id ?? "";

  return {
    medicineId: String(id),
    medicineName: raw.medicineName ?? raw.medicine_name ?? "Unknown medicine",
    allergen: raw.allergen ?? "Unknown allergen",
    description: raw.description ?? null,
  };
}

function normaliseAlternative(raw: RawAlternative): AlternativeRecommendation {
  const id = raw.medicineId ?? raw.medicine_id ?? raw.name ?? "";

  return {
    medicineId: String(id),
    name: raw.name ?? "Alternative option",
    reason: raw.reason ?? null,
  };
}

function normaliseSummary(summary: RawInteractionSummary): DrugInteractionSummary {
  const interactionsSource = summary.interactions ?? [];

  const allergySource =
    summary.allergyConflicts ?? summary.allergy_conflicts ?? [];

  const alternativesSource =
    summary.suggestedAlternatives ?? summary.suggested_alternatives ?? [];

  return {
    interactions: interactionsSource.map(normaliseInteraction),
    allergyConflicts: allergySource.map(normaliseAllergyConflict),
    suggestedAlternatives: alternativesSource.map(normaliseAlternative),
  };
}

class DrugInteractionService {
  async checkInteractions(
    medicationIds: string[],
    allergies: string[]
  ): Promise<DrugInteractionSummary> {
    const payload: CheckInteractionPayload = {
      medication_ids: medicationIds,
      allergies,
    };

    const response = await apiService.post<RawInteractionSummary>(
      "/clinical/medicines/interactions",
      payload,
      { invalidateUrls: ["/clinical/medicines/interactions"] }
    );

    const summary = response.data ?? {
      interactions: [],
      allergyConflicts: [],
      suggestedAlternatives: [],
    };

    return normaliseSummary(summary);
  }
}

export const drugInteractionService = new DrugInteractionService();
