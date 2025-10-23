export const CAMPAIGN_GOAL = {
  awarness: 1,
  trafic: 2,
  default: 1,
};
export const CAMPAIGN_BUDGET_TYPE = {
  total: 1,
  daily: 2,
  default: 1,
};

export const CampaignConstant = {
  // Format Ads options
  FORMAT_ADS_VIDEO: 1,

  // Bid Strategy options
  BID_STRATEGY_TARGET_CPP: 1,

  // Budget Type options
  BUDGET_TYPE_CAMPAIGN_TOTAL: 1,
  BUDGET_TYPE_DAILY: 2,

  // Location options
  LOCATION_ALL_BD: 1,

  // Status options
  STATUS_REVIEW: 1,
  STATUS_ACTIVE: 2,
  STATUS_PAUSE: 3,
  STATUS_COMPLETED: 4,
  STATUS_REJECT: 5,

  CAMPAIGN_TYPE_A: 1,
  CAMPAIGN_TYPE_B: 2,
  // Get Format Ads Options
  getFormatAdsOptions() {
    return {
      [this.FORMAT_ADS_VIDEO]: "Video",
    };
  },

  // Get Bid Strategy Options
  getBidStrategyOptions() {
    return {
      [this.BID_STRATEGY_TARGET_CPP]: "Target CPP",
    };
  },

  // Get Budget Type Options
  getBudgetTypeOptions() {
    return {
      [this.BUDGET_TYPE_CAMPAIGN_TOTAL]: "Campaign Total",
      [this.BUDGET_TYPE_DAILY]: "Daily",
    };
  },

  // Get Location Options
  getLocationOptions() {
    return {
      [this.LOCATION_ALL_BD]: "All Bangladesh",
    };
  },

  // Get Status Options
getCampaignStatusOptions() {
  return [
    { value: this.STATUS_REVIEW, label: "Under Review" },
    { value: this.STATUS_ACTIVE, label: "Active" },
    { value: this.STATUS_PAUSE, label: "Paused" },
    { value: this.STATUS_REJECT, label: "Rejected" },
    { value: this.STATUS_COMPLETED, label: "Completed" },
  ];
},
  getCampaignTypeOptions() {
    return {
      [this.CAMPAIGN_TYPE_A]: "A",
      [this.CAMPAIGN_TYPE_B]: "B",
    };
  },
};
