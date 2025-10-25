import type { ApiResponse } from "./common";

export interface ActiveIngredient {
  id: string;
  name: string;
  strength?: string | null;
}

export interface MedicineSearchResult {
  id: string;
  name: string;
  rxCui?: string | null;
  brandName?: string | null;
  form?: string | null;
  activeIngredients: ActiveIngredient[];
}

export type InteractionSeverity = "low" | "moderate" | "high" | "unknown";

export interface InteractionDetail {
  medicineId: string;
  medicineName: string;
  interactingWith: string[];
  severity: InteractionSeverity;
  description?: string | null;
}

export interface AllergyConflictDetail {
  medicineId: string;
  medicineName: string;
  allergen: string;
  description?: string | null;
}

export interface AlternativeRecommendation {
  medicineId: string;
  name: string;
  reason?: string | null;
}

export interface DrugInteractionSummary {
  interactions: InteractionDetail[];
  allergyConflicts: AllergyConflictDetail[];
  suggestedAlternatives: AlternativeRecommendation[];
}

export type DrugInteractionApiResponse = ApiResponse<DrugInteractionSummary>;
