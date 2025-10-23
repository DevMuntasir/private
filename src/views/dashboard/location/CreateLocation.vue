<template>


  <h2 class="text-[22px] font-primary mb-5 text-orange-highlight mt-4">
    Add New Location
  </h2>

  <div class="max-w-[550px] gap-8">
    <!-- Sequential Form -->
    <div class="rounded-lg p-6 border border-border bg-white">
      <div class="flex items-center justify-between">
        <span v-if="isLoadingAny" class="text-xs text-muted-foreground">
          Loading…
        </span>
      </div>

      <!-- Step 1: Country -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-card-foreground mb-2">
          Step 1: Select Country
        </label>
        <div class="flex gap-3">
          <select
            v-model.number="selectedCountryId"
            @change="onCountryChange"
            class="form-input"
          >
            <option :value="null">Choose a country</option>
            <option
              v-for="country in countries"
              :key="country.id ?? country.name"
              :value="country.id"
            >
              {{ country.name }}
              {{ countryHasStates(country.id!) ? "(Has States)" : "(No States)" }}
            </option>
          </select>

          <Button @click="showAddCountry = !showAddCountry" class="btn !h-[45px]">
            <PlusCircle /> Add New
          </Button>
        </div>

        <!-- Add Country Form -->
        <div v-if="showAddCountry" class="mt-4 p-4 bg-muted rounded-md">
          <div class="flex flex-col gap-3 mb-3 sm:flex-row">
            <input
              v-model="newCountry.name"
              placeholder="Enter country name"
              class="form-input bg-white flex-1"
            />
            <label
              class="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap !font-secondary-Regular"
            >
              <input
                type="checkbox"
                v-model="newCountry.hasStates"
                class="rounded w-5 h-5 accent-secondary !whitespace-nowrap border-border text-primary focus:ring-ring"
              />
              Has States
            </label>
          </div>

          <div class="flex gap-2">
            <Button :disabled="isSaving" @click="addCountry" class="btn !bg-primary">
              {{ isSaving ? "Adding…" : "Add Country" }}
            </Button>
            <Button variant="ghost" @click="showAddCountry = false" class="text-secondary">
              Cancel
            </Button>
          </div>

          <p v-if="errors.country" class="mt-2 text-sm text-destructive">
            {{ errors.country }}
          </p>
        </div>
      </div>

      <!-- Step 2: State (only if country has states) -->
      <div
        v-if="selectedCountryId && countryHasStates(selectedCountryId)"
        class="mb-6"
      >
        <label class="block text-sm font-medium text-card-foreground mb-2">
          Step 2: Select State
        </label>

        <div class="flex gap-3">
          <select
            v-model.number="selectedStateId"
            @change="onStateChange"
            class="form-input"
          >
            <option :value="null">Choose a state</option>
            <option
              v-for="state in availableStates"
              :key="state.id ?? state.name"
              :value="state.id"
            >
              {{ state.name }}
            </option>
          </select>

          <button
            @click="showAddState = !showAddState"
            class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Add New
          </button>
        </div>

        <!-- Add State Form -->
        <div v-if="showAddState" class="mt-4 p-4 bg-muted rounded-md">
          <div class="flex gap-3 mb-3">
            <input
              v-model="newState.name"
              placeholder="Enter state name"
              class="flex-1 px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          <div class="flex gap-2">
            <button
              :disabled="isSaving"
              @click="addState"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {{ isSaving ? "Adding…" : "Add State" }}
            </button>
            <button
              @click="showAddState = false"
              class="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </div>
          <p v-if="errors.state" class="mt-2 text-sm text-destructive">
            {{ errors.state }}
          </p>
        </div>
      </div>

      <!-- Step 3: City -->
      <div
        v-if="
          selectedCountryId &&
          (!countryHasStates(selectedCountryId) || selectedStateId)
        "
        class="mb-6"
      >
        <label class="block text-sm font-medium text-card-foreground mb-2">
          Step {{ countryHasStates(selectedCountryId!) ? "3" : "2" }}: Select City
        </label>

        <div class="flex gap-3">
          <select
            v-model.number="selectedCityId"
            @change="onCityChange"
            class="form-input"
          >
            <option :value="null">Choose a city</option>
            <option
              v-for="city in citiesOptions"
              :key="city.id ?? city.name"
              :value="city.id"
            >
              {{ city.name }}
            </option>
          </select>

          <Button @click="showAddCity = !showAddCity" class="btn !h-[45px]">
            <PlusCircle /> Add New
          </Button>
        </div>

        <!-- Add City Form -->
        <div v-if="showAddCity" class="mt-4 p-4 bg-muted rounded-md">
          <div class="flex gap-3 mb-3">
            <input
              v-model="newCity.name"
              placeholder="Enter city name"
              class="form-input flex-1"
            />
          </div>
          <div class="flex gap-2">
            <Button :disabled="isSaving" @click="addCity" class="btn">
              {{ isSaving ? "Adding…" : "Add City" }}
            </Button>
            <Button variant="ghost" @click="showAddCity = false" class="text-secondary">
              Cancel
            </Button>
          </div>
          <p v-if="errors.city" class="mt-2 text-sm text-destructive">
            {{ errors.city }}
          </p>
        </div>
      </div>

      <!-- Step 4: Area -->
      <div v-if="selectedCityId" class="mb-6">
        <label class="block text-sm font-medium text-card-foreground mb-2">
          Step {{ countryHasStates(selectedCountryId!) ? "4" : "3" }}: Add Location
        </label>
        <div class="flex gap-3">
          <input
            v-model="newArea.name"
            placeholder="Enter area/location name"
            class="form-input flex-1"
          />
          <Button :disabled="isSaving" @click="addArea" class="btn !h-[45px]">
            <PlusCircle /> Add New
          </Button>
        </div>
        <p v-if="errors.area" class="mt-2 text-sm text-destructive">
          {{ errors.area }}
        </p>
      </div>

      <!-- Progress Indicator -->
      <div class="mt-6 p-4 bg-muted rounded-md">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <div class="flex items-center gap-1">
            <div
              :class="selectedCountryId ? 'bg-primary' : 'bg-border'"
              class="w-3 h-3 rounded-full"
            ></div>
            <span>Country</span>
          </div>

          <div
            v-if="selectedCountryId && countryHasStates(selectedCountryId)"
            class="flex items-center gap-1"
          >
            <span>→</span>
            <div
              :class="selectedStateId ? 'bg-primary' : 'bg-border'"
              class="w-3 h-3 rounded-full"
            ></div>
            <span>State</span>
          </div>

          <div
            v-if="
              selectedCountryId &&
              (!countryHasStates(selectedCountryId) || selectedStateId)
            "
            class="flex items-center gap-1"
          >
            <span>→</span>
            <div
              :class="selectedCityId ? 'bg-primary' : 'bg-border'"
              class="w-3 h-3 rounded-full"
            ></div>
            <span>City</span>
          </div>

          <div v-if="selectedCityId" class="flex items-center gap-1">
            <span>→</span>
            <div class="bg-accent w-3 h-3 rounded-full"></div>
            <span>Location</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Button } from "@/components/ui/button";
import { locationService } from "@/services/location-service";
import { City, Country, LocationsResponse, State } from "@/types/location-types";
import { PlusCircle } from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";

import { useToast } from "@/composeable/useToast";
/** ------- Reactive data from API ------- */
type CountryWithFlag = Country & { hasStates?: boolean; has_states?: boolean };
const countries = ref<CountryWithFlag[]>([]);
const states = ref<State[]>([]);
const locations = ref<LocationsResponse[]>([]);

// Cities are fetched dynamically for the current selection
const citiesOptions = ref<City[]>([]);
const {showToast} = useToast()
/** ------- Selections ------- */
const selectedCountryId = ref<number | null>(null);
const selectedStateId = ref<number | null>(null);
const selectedCityId = ref<number | null>(null);

/** ------- Form visibility ------- */
const showAddCountry = ref(false);
const showAddState = ref(false);
const showAddCity = ref(false);

/** ------- New item forms ------- */
const newCountry = ref({ name: "", hasStates: false });
const newState = ref<{ name: string }>({ name: "" });
const newCity = ref<{ name: string }>({ name: "" });
const newArea = ref<{ name: string }>({ name: "" });

/** ------- Loading & errors ------- */
const isLoadingCountries = ref(false);
const isLoadingStates = ref(false);
const isLoadingLocations = ref(false);
const isLoadingCitiesOptions = ref(false);
const isSaving = ref(false);
const errors = ref<{ [k: string]: string | null }>({
  country: null,
  state: null,
  city: null,
  area: null,
  table: null,
});

const isLoadingAny = computed(
  () =>
    isLoadingCountries.value ||
    isLoadingStates.value ||
    isLoadingLocations.value ||
    isLoadingCitiesOptions.value
);

const availableStates = computed(() =>
  selectedCountryId.value == null
    ? []
    : states.value.filter((s) => s.country_id === selectedCountryId.value)
);

/** ------- Event handlers ------- */
const onCountryChange = () => {
  /* handled by watcher */
};
const onStateChange = () => {
  /* handled by watcher */
};
const onCityChange = () => {
  showAddCity.value = false;
};
const emit = defineEmits<{
  (e: "refresh-locations"): void;
}>();
/** ------- API Creators ------- */
const addCountry = async () => {
  const name = newCountry.value.name.trim();
  if (!name) {
    errors.value.country = "Country name is required";
    return;
  }
  errors.value.country = null;
  isSaving.value = true;
  try {
    // Send both camel & snake to be safe with varying backends
    const res = await locationService.createCountry({
      name,
      has_states: newCountry.value.hasStates,
      hasStates: newCountry.value.hasStates,
    });

    
    if (res.success) {
      showToast(res.message,'', 'success')
      await fetchCountries();
      selectedCountryId.value = res.data.id!;
      newCountry.value = { name: "", hasStates: false };
      showAddCountry.value = false;
    }
      //eslint-disable-next-line
  } catch (e: any) {
    console.log(e);
    
    showToast('Fail','Failed to save location.', 'error')
    errors.value.country = e?.response.data.message || "Failed to add country";
  } finally {
    isSaving.value = false;
  }
};

const addState = async () => {
  const name = newState.value.name.trim();
  if (!name || !selectedCountryId.value) {
    errors.value.state = !name
      ? "State name is required"
      : "Select a country first";
    return;
  }
  if (!countryHasStates(selectedCountryId.value)) {
    errors.value.state = "This country doesn't support states";
    return;
  }
  errors.value.state = null;
  isSaving.value = true;
  try {
    const res = await locationService.createState({
      name,
      country_id: selectedCountryId.value,
    });
    await fetchStates();
    selectedStateId.value = res.data.id!;
    newState.value = { name: "" };
    showAddState.value = false;
      //eslint-disable-next-line
  } catch (e: any) {
    errors.value.state = e?.message || "Failed to add state";
  } finally {
    isSaving.value = false;
  }
};

const addCity = async () => {
  const name = newCity.value.name.trim();
  if (!name || !selectedCountryId.value) {
    errors.value.city = !name ? "City name is required" : "Select a country first";
    return;
  }
  if (countryHasStates(selectedCountryId.value) && !selectedStateId.value) {
    errors.value.city = "Select a state first";
    return;
  }
  errors.value.city = null;
  isSaving.value = true;
  try {
    const payload = countryHasStates(selectedCountryId.value)
      ? {
          name,
          typeable_type: "State" as const,
          typeable_id: selectedStateId.value!,
        }
      : {
          name,
          typeable_type: "App\\Models\\PNCountry" as const,
          typeable_id: selectedCountryId.value,
        };

    const res = await locationService.createCity(payload);
    if (res.success) {
      await fetchCitiesForSelection();
      selectedCityId.value = res.data.id!;
      newCity.value = { name: "" };
      showAddCity.value = false;
            showToast(res.message,'','success')

    }
      //eslint-disable-next-line
  } catch (e: any) {
    errors.value.city = e?.message || "Failed to add city";
  } finally {
    isSaving.value = false;
  }
};

const addArea = async () => {
  const name = newArea.value.name.trim();
  if (!name || !selectedCityId.value) {
    errors.value.area = !name ? "Area name is required" : "Select a city first";
    return;
  }
  errors.value.area = null;
  isSaving.value = true;
  try {
   let res = await locationService.createLocation({
      name,
      city_id: selectedCityId.value,
    });
    if (res.success) {
      showToast(res.message,'','success')
      await fetchLocations();
      emit("refresh-locations"); 
      newArea.value = { name: "" };
    }
    //eslint-disable-next-line
  } catch (e: any) {
    errors.value.area = e?.message || "Failed to add area";
  } finally {
    isSaving.value = false;
  }
};

/** ------- API Fetchers ------- */
const fetchLocations = async () => {
  isLoadingLocations.value = true;
  errors.value.table = null;
  try {
    const res = await locationService.getAllLocation();
    locations.value = res.data || [];
       //eslint-disable-next-line
  } catch (e: any) {
    errors.value.table = e?.message || "Failed to load locations";
  } finally {
    isLoadingLocations.value = false;
  }
};

const fetchStates = async () => {
  isLoadingStates.value = true;
  errors.value.state = null;
  try {
    const res = await locationService.getAllStates();
    states.value = res.data || [];
      //eslint-disable-next-line
  } catch (e: any) {
    errors.value.state = e?.message || "Failed to load states";
  } finally {
    isLoadingStates.value = false;
  }
};

const fetchCountries = async () => {
  isLoadingCountries.value = true;
  errors.value.country = null;
  try {
    const res = await locationService.getAllCountry();
    console.log(res);
    
    // Normalize has_states/hasStates to hasStates boolean when present
      //eslint-disable-next-line
    countries.value = (res.data || []).map((c: any) => ({
      ...c,
      hasStates:
        typeof c.hasStates === "boolean"
          ? c.hasStates
          : typeof c.has_states === "boolean"
          ? c.has_states
          : undefined, // legacy rows without the flag
    }));
      //eslint-disable-next-line
  } catch (e: any) {
    errors.value.country = e?.message || "Failed to load countries";
  } finally {
    isLoadingCountries.value = false;
  }
};

/** ------- Helpers ------- */
// Prefer country.hasStates flag; fallback to whether any states exist for that country
const countryHasStates = (countryId: number) => {
  const c = countries.value.find((x) => x.id === countryId);
  if (c && typeof c.hasStates === "boolean") return c.hasStates;
  return states.value.some((s) => s.country_id === countryId);
};

const cityParentMap = ref<Record<number, { countryName?: string; stateName?: string }>>(
  {}
);

const fetchCitiesForSelection = async () => {
  citiesOptions.value = [];
  if (!selectedCountryId.value) return;

  isLoadingCitiesOptions.value = true;
  errors.value.city = null;
  try {
    if (countryHasStates(selectedCountryId.value)) {
      if (!selectedStateId.value) {
        isLoadingCitiesOptions.value = false;
        return;
      }
      const res = await locationService.getCitiesByCountryId(
        selectedStateId.value
      );
      citiesOptions.value = res.data.cities || [];
      const countryName = countries.value.find(
        (c) => c.id === selectedCountryId.value
      )?.name;
      const stateName = states.value.find((s) => s.id === selectedStateId.value)?.name;
      for (const c of citiesOptions.value) {
        if (c.id != null) cityParentMap.value[c.id] = { countryName, stateName };
      }
    } else {
      const res = await locationService.getCitiesByCountryId(
        selectedCountryId.value
      );
      console.log(res);
      
      citiesOptions.value = res.data.cities
      const countryName = countries.value.find(
        (c) => c.id === selectedCountryId.value
      )?.name;
      for (const c of citiesOptions.value) {
        if (c.id != null) cityParentMap.value[c.id] = { countryName };
      }
    }
      //eslint-disable-next-line
  } catch (e: any) {
    errors.value.city = e?.message || "Failed to load cities";
  } finally {
    isLoadingCitiesOptions.value = false;
  }
};

/** ------- Watchers ------- */
watch([selectedCountryId], async () => {
  // reset downstream selections
  selectedStateId.value = null;
  selectedCityId.value = null;
  showAddCountry.value = false;
  await fetchCitiesForSelection();
});

watch([selectedStateId], async () => {
  selectedCityId.value = null;
  showAddState.value = false;
  await fetchCitiesForSelection();
});

/** ------- Deleter (API) ------- */
// const removeArea = async (areaId: number) => {
//   isSaving.value = true;
//   try {
//     await locationService.deleteLocation(areaId);
//     await fetchLocations();
//   } catch (e: any) {
//     errors.value.table = e?.message || "Failed to remove area";
//   } finally {
//     isSaving.value = false;
//   }
// };

onMounted(async () => {
  await Promise.all([fetchCountries(), fetchStates(), fetchLocations()]);
});
</script>
