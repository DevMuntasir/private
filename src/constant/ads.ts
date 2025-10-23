// src/constants/AdConstant.js
export const AdConstant = {
  // Gender
  AUDIENCE_TARGET_MALE: "male",
  AUDIENCE_TARGET_FEMALE: "female",

  // Age groups
  AGE_GROUP_00_09: 1,
  AGE_GROUP_10_19: 2,
  AGE_GROUP_20_29: 3,
  AGE_GROUP_30_39: 4,
  AGE_GROUP_40_49: 5,
  AGE_GROUP_50_59: 6,
  AGE_GROUP_60_69: 7,
  AGE_GROUP_70_PLUS: 8,

  // Status options
  STATUS_REVIEW: 1,
  STATUS_ACTIVE: 2,
  STATUS_PAUSE: 3,
  STATUS_REJECTED: 4,

  // Template options
  TEMPLATE_A: 1,
  TEMPLATE_B: 2,
  TEMPLATE_C: 3,

  // Methods
  getGenderOptions() {
    return {
      [this.AUDIENCE_TARGET_MALE]: "Male",
      [this.AUDIENCE_TARGET_FEMALE]: "Female",
    };
  },

  getAgeGroupOptions() {
    return {
      [this.AGE_GROUP_00_09]: "0–9",
      [this.AGE_GROUP_10_19]: "10–19",
      [this.AGE_GROUP_20_29]: "20–29",
      [this.AGE_GROUP_30_39]: "30–39",
      [this.AGE_GROUP_40_49]: "40–49",
      [this.AGE_GROUP_50_59]: "50–59",
      [this.AGE_GROUP_60_69]: "60–69",
      [this.AGE_GROUP_70_PLUS]: "70+",
    };
  },

  getAdStatusOptions() {
    return {
      [this.STATUS_REVIEW]: "Under Review",
      [this.STATUS_ACTIVE]: "Active",
      [this.STATUS_PAUSE]: "Paused",
      [this.STATUS_REJECTED]: "Rejected",
    };
  },

  getAdTemplateOptions() {
    return {
      [this.TEMPLATE_A]: "Only Video",
      [this.TEMPLATE_B]: "Landscape video + Portrait poster",
      [this.TEMPLATE_C]: "Portrait video + Landscape poster",
    };
  },
};
