import { z } from "zod"

// Placeholder for i18n messages - replace with your i18n solution
const t = (key: string, fallback: string) => fallback

export const socialLinksSchema = z
  .object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional(),
  })
  .refine(
    (data) => {
      // This validation logic is conditional in the Vue code based on `socialTouched`.
      // For simplicity here, we'll make it always check if at least one is provided if any is touched.
      // A more complex setup could involve form.state.touchedFields in the component.
      const const_values = Object.values(data)
      const const_hasValue = const_values.some((val) => val && val.trim() !== "")
      // If any field is touched and none have value, it's an error.
      // This is a simplified version of the Vue logic.
      // A full implementation might require checking form.getFieldValue('socialTouched')
      return const_hasValue || const_values.every((val) => !val) // Valid if all empty or at least one has value
    },
    {
      message: t(
        "validation.atLeastOneSocial",
        "Please provide at least one social media link if you start filling this section.",
      ),
      path: [], // General error for the object
    },
  )

export const applyFormSchema = z.object({
  displayName: z
    .string()
    .min(2, t("validation.displayNameMin", "Display name must be at least 2 characters"))
    .max(50, t("validation.displayNameMax", "Display name must be at most 50 characters")),
  username: z
    .string()
    .min(3, t("validation.usernameMin", "Username must be at least 3 characters"))
    .max(30, t("validation.usernameMax", "Username must be at most 30 characters"))
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      t("validation.usernamePattern", "Username can only contain letters, numbers, underscores, and hyphens"),
    ),
  bio: z
    .string()
    .min(10, t("validation.bioMin", "Bio must be at least 10 characters"))
    .max(500, t("validation.bioMax", "Bio must be at most 500 characters")),
  categories: z.array(z.string()).min(1, t("apply.basicInfo.required", "Please select at least one category")),
  social: socialLinksSchema,
  monthlyPrice: z.coerce
    .number()
    .min(4.99, t("validation.priceMin", "Monthly price must be at least $4.99")),
  discounts: z.record(z.string(), z.string().optional()), // cycle: preferenceId
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: t("apply.legal.acceptTermsRequired", "You must accept the terms and conditions"),
  }),
  confirmAge: z.boolean().refine((val) => val === true, {
    message: t("apply.legal.confirmAgeRequired", "You must confirm you are of legal age"),
  }),
})

export type ApplyFormValues = z.infer<typeof applyFormSchema>

// Mock data similar to what the Vue component expects
export const availableCategoriesData = [
  "Art",
  "Music",
  "Photography",
  "Writing",
  "Technology",
  "Education",
  "Entertainment",
  "Lifestyle",
  "Sports",
  "Gaming",
]

export interface PricingPreference {
  _id: string
  cycle: "monthly" | "quarterly" | "yearly"
  discount: number // e.g., 0, 10, 20
  // any other fields your API returns
}
