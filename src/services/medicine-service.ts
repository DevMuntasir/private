import { apiService } from "./api-service";
import type { ActiveIngredient, MedicineSearchResult } from "@/types/medicine-types";

interface RawActiveIngredient {
  id?: string | number;
  name?: string;
  ingredientName?: string;
  displayName?: string;
  strength?: string;
  strength_text?: string;
  strengthText?: string;
}

interface RawMedicine {
  id?: string | number;
  name?: string;
  displayName?: string;
  label?: string;
  rxCui?: string | number;
  rx_cui?: string | number;
  brandName?: string | null;
  brand_name?: string | null;
  form?: string | null;
  dosageForm?: string | null;
  dosage_form?: string | null;
  activeIngredients?: Array<RawActiveIngredient | string>;
  active_ingredients?: Array<RawActiveIngredient | string>;
  ingredients?: Array<RawActiveIngredient | string>;
}

function normaliseActiveIngredients(
  list: Array<RawActiveIngredient | string> | undefined,
  fallbackId: string
): ActiveIngredient[] {
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map((item, index) => {
      if (typeof item === "string") {
        if (!item.trim()) {
          return null;
        }
        return {
          id: `${fallbackId}-${index}`,
          name: item,
          strength: null,
        };
      }

      const rawName =
        item.name ?? item.ingredientName ?? item.displayName ?? "";

      if (!rawName) {
        return null;
      }

      const rawStrength =
        item.strength ?? item.strength_text ?? item.strengthText ?? null;

      return {
        id: String(item.id ?? `${fallbackId}-${index}`),
        name: rawName,
        strength: rawStrength,
      };
    })
    .filter((ingredient): ingredient is ActiveIngredient => Boolean(ingredient));
}

function normaliseMedicine(raw: RawMedicine, index: number): MedicineSearchResult {
  const idSource =
    raw.id ?? raw.rxCui ?? raw.rx_cui ?? raw.name ?? raw.displayName ?? index;
  const id = String(idSource);
  const name =
    raw.name ?? raw.displayName ?? raw.label ?? `Medicine ${index + 1}`;

  const activeIngredients = normaliseActiveIngredients(
    raw.activeIngredients ?? raw.active_ingredients ?? raw.ingredients,
    id
  );

  return {
    id,
    name,
    rxCui: raw.rxCui ? String(raw.rxCui) : raw.rx_cui ? String(raw.rx_cui) : null,
    brandName: raw.brandName ?? raw.brand_name ?? null,
    form: raw.form ?? raw.dosageForm ?? raw.dosage_form ?? null,
    activeIngredients,
  };
}

class MedicineService {
  async searchMedicine(searchTerm: string): Promise<MedicineSearchResult[]> {
    const query = searchTerm.trim();

    if (!query) {
      return [];
    }

    const response = await apiService.get<RawMedicine[]>(
      "/clinical/medicines/search",
      {
        params: { query },
      }
    );

    const rawResults = Array.isArray(response.data) ? response.data : [];

    return rawResults.map((item, index) => normaliseMedicine(item, index));
  }
}

export const medicineService = new MedicineService();
