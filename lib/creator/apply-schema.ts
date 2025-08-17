import { z } from "zod"

export const socialMediaSchema = z.object({
  twitter: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  onlyfans: z.string().url().optional().or(z.literal("")),
})

export const pricingPreferenceSchema = z.object({
  _id: z.string(),
  cycle: z.enum(["monthly", "quarterly", "yearly"]),
  discount: z.number().min(0).max(100),
})

export const applyFormSchema = z.object({
  // Personal Information
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),

  // Categories
  categories: z.array(z.string()).min(1, "Please select at least one category").max(5, "Maximum 5 categories allowed"),

  // Social Media
  socialMedia: socialMediaSchema,

  // Pricing
  selectedPricing: z.string().min(1, "Please select a pricing option"),

  // Legal
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
  agreeToPrivacy: z.boolean().refine((val) => val === true, "You must agree to the privacy policy"),
})

export type ApplyFormData = z.infer<typeof applyFormSchema>
export type SocialMediaData = z.infer<typeof socialMediaSchema>
export type PricingPreference = z.infer<typeof pricingPreferenceSchema>

// Helper functions
export const validateSocialMediaUrl = (url: string, platform: string): string | null => {
  if (!url) return null

  const platformDomains: Record<string, string[]> = {
    twitter: ["twitter.com", "x.com"],
    instagram: ["instagram.com"],
    tiktok: ["tiktok.com"],
    youtube: ["youtube.com", "youtu.be"],
  }

  try {
    const urlObj = new URL(url)
    const domains = platformDomains[platform]

    if (!domains || !domains.some((domain) => urlObj.hostname.includes(domain))) {
      return `Please enter a valid ${platform} URL`
    }

    return null
  } catch {
    return `Please enter a valid ${platform} URL`
  }
}

export const calculatePricing = (basePrice: number, preference: PricingPreference): number => {
  const multiplier = preference.cycle === "quarterly" ? 3 : preference.cycle === "yearly" ? 12 : 1
  const totalPrice = basePrice * multiplier
  const discountAmount = (totalPrice * preference.discount) / 100
  return totalPrice - discountAmount
}

export const formatPricingDisplay = (price: number, cycle: string): string => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)

  return `${formatted}/${cycle}`
}

export const getAvailableCategories = (): string[] => {
  return [
    "Fitness & Health",
    "Beauty & Fashion",
    "Gaming",
    "Music & Entertainment",
    "Art & Design",
    "Food & Cooking",
    "Travel & Lifestyle",
    "Technology",
    "Education",
    "Business & Finance",
    "Sports",
    "Comedy",
    "Photography",
    "DIY & Crafts",
    "Pets & Animals",
  ]
}
