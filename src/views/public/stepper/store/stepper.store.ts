import { CampaignConstant } from "@/constant/campaign";
import { CampaignPayload } from "@/types/campaign";
import { defineStore } from "pinia";

interface BusinessInfoState {
  name: string;
  reg_number: string;
}

type GoalCampaignState = CampaignPayload & {
  id?: number | null;
  citys_id?: number[] | null;
  location_ids?: number[] | null;
};

export interface StepperState {
  businessInfo: BusinessInfoState;
  goalCampaign: GoalCampaignState;
  clientId: number | null;
  snapshots: Record<string, unknown>;
}

export const useStepperStore = defineStore("private-stepper", {
  state: (): StepperState => ({
    businessInfo: {
      name: "",
      reg_number: "",
    },
    goalCampaign: {
      goal_id: 1,
      name: "",
      budget_type: 1,
      budget: 0,
      start_time: "",
      end_time: "",
      out_url: "",
      type: "Video ads",
      format_ads: 1,
      bid_strategy: 1,
      campaign_type: CampaignConstant.CAMPAIGN_TYPE_A,
      citys_id: [],
      location_ids: [],
      count: null,
      id: null,
      status: undefined,
    },
    clientId: null,
    snapshots: {},
  }),

  actions: {
    updateSection<T extends keyof StepperState>(
      section: T,
      data: Partial<StepperState[T]>
    ) {
      if (section === "snapshots") {
        return;
      }
      Object.assign(this[section], data);
    },

    setClientId(id: number | null) {
      this.clientId = id;
    },

    resetStore() {
      this.$reset();
    },

    saveSnapshot(section: keyof StepperState) {
      if (section === "snapshots") {
        return;
      }
      this.snapshots[section] = JSON.parse(
        JSON.stringify(this[section as keyof StepperState])
      );
    },

    hasChanged(section: keyof StepperState) {
      if (section === "snapshots") {
        return false;
      }
      const current = JSON.stringify(this[section]);
      const last = JSON.stringify(this.snapshots[section] || {});
      return current !== last;
    },
  },
});
