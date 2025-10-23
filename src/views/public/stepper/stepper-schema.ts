import { CampaignConstant, CAMPAIGN_GOAL } from "@/constant/campaign";
import * as yup from "yup";

export const stepperSchemas = {
  businessInfo: yup.object({
    name: yup
      .string()
      .trim()
      .max(255, "Max 255 characters")
      .required("Business name is required"),
    reg_number: yup
      .string()
      .trim()
      .max(100, "Max 100 characters")
      .matches(
        /^[A-Za-z0-9\-\/\s]+$/,
        "Use letters, numbers, dashes or slashes only"
      )
      .required("Registration number is required"),
  }),

  goalCampaign: yup.object({
    goal_id: yup.number().required(),
    name: yup.string().required("Campaign name required"),
    budget_type: yup.number().required(),
    out_url: yup
      .string()
      .trim()
      .when("goal_id", {
        is: CAMPAIGN_GOAL.trafic,
        then: (schema) =>
          schema.required("URL is required").url("Enter a valid URL"),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    start_time: yup
      .string()
      .required("Start date required")
      .test(
        "start-not-in-past",
        "Start date cannot be in the past",
        function (startValue) {
          if (!startValue) return true;
          const start = new Date(startValue);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          start.setHours(0, 0, 0, 0);
          return start >= today;
        }
      ),
    end_time: yup
      .string()
      .required("End date required")
      .test(
        "end-after-start",
        "End date must be after start date",
        function (endValue) {
          const { start_time } = this.parent;
          if (!start_time || !endValue) return true;
          const start = new Date(start_time);
          const end = new Date(endValue);
          return end > start;
        }
      ),
    location_ids: yup
      .array()
      .of(yup.number())
      .min(1, "At least one location must be selected")
      .optional(),
    citys_id: yup.array().of(yup.number()).optional(),
    count: yup
      .number()
      .nullable()
      .when("campaign_type", {
        is: CampaignConstant.CAMPAIGN_TYPE_B,
        then: (schema) => schema.required("Run count required").min(1),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    budget: yup
      .number()
      .nullable()
      .when("campaign_type", {
        is: CampaignConstant.CAMPAIGN_TYPE_A,
        then: (schema) =>
          schema.required("Budget is required").min(0, "Must be positive"),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
  }),
};
