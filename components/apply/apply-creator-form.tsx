"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import {
  applyFormSchema,
  type ApplyFormValues,
  availableCategoriesData,
  type PricingPreference,
} from "@/lib/apply-schema";
import {
  useCreateCreator,
  useCreatorPreferences,
  useSubmitApplication,
} from "@/lib/creator/creator-hooks";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Facebook,
  Instagram,
  Twitter,
  Music,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";

const initialFormValues: ApplyFormValues = {
  displayName: "",
  username: "",
  bio: "",
  categories: [],
  social: { facebook: "", instagram: "", twitter: "", tiktok: "" },
  monthlyPrice: 4.99,
  discounts: {},
  acceptTerms: false,
  confirmAge: false,
};

export default function ApplyCreatorForm() {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [periodPrices, setPeriodPrices] = useState<Record<string, number>>({});

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only run the query on the client side
  // const { data: preferencesData, isLoading: isLoadingPreferences } = useCreatorPreferences()
  const submitApplicationMutation = useSubmitApplication();

  // Use empty array during SSR to prevent build issues
  const pricingPreferences: any[] = [];
  const isLoadingPreferences = false;

  const preferencesByCycle = useMemo(() => {
    const grouped: Record<string, PricingPreference[]> = {};
    for (const pref of pricingPreferences) {
      if (!grouped[pref.cycle]) grouped[pref.cycle] = [];
      grouped[pref.cycle].push(pref);
    }
    return grouped;
  }, [pricingPreferences]);

  const form = useForm({
    defaultValues: initialFormValues,
    onSubmit: async ({ value }) => {
      setFormError(null);
      setFormSuccess(null);

      if (submitApplicationMutation.isPending) {
        return;
      }

      try {
        // Validate with Zod
        const validatedData = applyFormSchema.parse(value);

        // Transform form data to match API payload
        const allowedPlatforms = [
          "facebook",
          "instagram",
          "twitter",
          "tiktok",
          "youtube",
        ] as const;
        const socialUrlMap = {
          facebook: (username: string) => `https://facebook.com/${username}`,
          instagram: (username: string) => `https://instagram.com/${username}`,
          twitter: (username: string) => `https://twitter.com/${username}`,
          tiktok: (username: string) => `https://tiktok.com/@${username}`,
          youtube: (username: string) => `https://youtube.com/${username}`,
        };

        const payload = {
          personalInfo: {
            fullName: validatedData.displayName,
            email: "", // This should come from user context
            phone: "",
            dateOfBirth: "",
            nationality: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
          },
          creatorInfo: {
            displayName: validatedData.displayName,
            username: validatedData.username,
            bio: validatedData.bio,
            categories: validatedData.categories,
            experience: "",
            portfolio: [],
            socialMedia: Object.entries(validatedData.social)
              .filter(
                ([platform, username]) =>
                  allowedPlatforms.includes(platform as any) &&
                  username &&
                  username.trim()
              )
              .map(([platform, username]) => ({
                platform: platform as (typeof allowedPlatforms)[number],
                username: username,
                followers: 0,
              })),
          },
          preferences: {
            pricing: [],
            availability: {
              timezone: "",
              workingHours: {
                start: "",
                end: "",
              },
              workingDays: [],
            },
          },
          legal: {
            termsAccepted: validatedData.acceptTerms,
            privacyAccepted: validatedData.acceptTerms,
            ageVerified: validatedData.confirmAge,
            backgroundCheck: false,
          },
        };

        await submitApplicationMutation.mutateAsync(payload);
        setFormSuccess(
          t("apply.success", "Application submitted successfully!")
        );

        // Reset form
        form.reset();

        // Reset discounts to default values
        if (pricingPreferences.length > 0) {
          const initialDiscounts: Record<string, string> = {};
          Object.entries(preferencesByCycle).forEach(([cycle, prefs]) => {
            const zeroDiscount = prefs.find((p) => p.discount === 0);
            if (zeroDiscount) {
              initialDiscounts[cycle] = zeroDiscount._id;
            } else if (prefs.length > 0) {
              initialDiscounts[cycle] = prefs[0]._id;
            }
          });
          form.setFieldValue("discounts", initialDiscounts);
          form.setFieldValue("monthlyPrice", initialFormValues.monthlyPrice);
        }
      } catch (error: any) {
        if (error.errors) {
          // Zod validation errors
          setFormError(error.errors.map((e: any) => e.message).join(", "));
        } else {
          setFormError(
            error.message || t("common.error", "An unknown error occurred.")
          );
        }
      }
    },
  });

  // Set initial discount values once preferences are loaded
  useEffect(() => {
    if (mounted && pricingPreferences.length > 0) {
      const initialDiscounts: Record<string, string> = {};
      Object.entries(preferencesByCycle).forEach(([cycle, prefs]) => {
        const zeroDiscount = prefs.find((p) => p.discount === 0);
        if (zeroDiscount) {
          initialDiscounts[cycle] = zeroDiscount._id;
        } else if (prefs.length > 0) {
          initialDiscounts[cycle] = prefs[0]._id;
        }
      });
      if (Object.keys(form.getFieldValue("discounts") || {}).length === 0) {
        form.setFieldValue("discounts", initialDiscounts);
      }
    }
  }, [mounted, pricingPreferences, preferencesByCycle, form]);

  // Calculate period prices when monthly price or discounts change
  const calculatePeriodPrices = (
    monthlyPrice: number,
    discounts: Record<string, string>
  ) => {
    const calculatedPrices: Record<string, number> = {};

    if (
      !monthlyPrice ||
      Object.keys(discounts || {}).length === 0 ||
      pricingPreferences.length === 0
    ) {
      setPeriodPrices(calculatedPrices);
      return;
    }

    Object.entries(discounts).forEach(([cycle, selectedId]) => {
      const cyclePrefs = preferencesByCycle[cycle];
      if (!cyclePrefs || !selectedId) return;

      const option = cyclePrefs.find((opt) => opt._id === selectedId);
      if (option) {
        let multiplier = 1;
        if (cycle === "quarterly") multiplier = 3;
        if (cycle === "yearly") multiplier = 12;
        calculatedPrices[cycle] =
          Math.round(
            monthlyPrice * multiplier * (1 - option.discount / 100) * 100
          ) / 100;
      }
    });

    setPeriodPrices(calculatedPrices);
  };

  const FieldInfo = ({ field }: { field: any }) => (
    <>
      {field.state.meta.touchedErrors &&
      field.state.meta.touchedErrors.length > 0 ? (
        <p className="text-sm text-red-500 mt-1">
          {field.state.meta.touchedErrors.join(", ")}
        </p>
      ) : null}
    </>
  );

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 w-full my-8">
      <CardHeader>
        <CardTitle>{t("apply.title", "Apply to be a Creator")}</CardTitle>
        <CardDescription>
          {t(
            "apply.description",
            "Fill out the form below to start your journey."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-8"
        >
          {/* Basic Information */}
          <section>
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              {t("apply.basicInfo.title", "Basic Information")}
            </h2>
            <div className="space-y-6">
              <form.Field
                name="displayName"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name}>
                      {t("apply.basicInfo.displayName", "Display Name")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t(
                        "apply.basicInfo.displayNamePlaceholder",
                        "Your public name"
                      )}
                      className="mt-1"
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              <form.Field
                name="username"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name}>
                      {t("apply.basicInfo.username", "Username")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t(
                        "apply.basicInfo.usernamePlaceholder",
                        "your_unique_username"
                      )}
                      className="mt-1"
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              <form.Field
                name="bio"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name}>
                      {t("apply.basicInfo.bio", "Bio")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t(
                        "apply.basicInfo.bioPlaceholder",
                        "Tell us about yourself..."
                      )}
                      rows={3}
                      className="mt-1"
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              <form.Field
                name="categories"
                children={(field) => (
                  <div>
                    <Label>
                      {t("apply.basicInfo.categories", "Categories")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {availableCategoriesData.map((cat) => (
                        <Button
                          key={cat}
                          type="button"
                          variant={
                            field.state.value.includes(cat)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            const currentCategories = field.state.value;
                            const newCategories = currentCategories.includes(
                              cat
                            )
                              ? currentCategories.filter((c) => c !== cat)
                              : [...currentCategories, cat];
                            field.handleChange(newCategories);
                          }}
                        >
                          {cat}
                          {field.state.value.includes(cat) && (
                            <X className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      ))}
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              />
            </div>
          </section>

          {/* Social Media */}
          <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              {t("apply.social.title", "Social Media")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["facebook", "instagram", "twitter", "tiktok"] as const).map(
                (socialPlatform) => (
                  <form.Field
                    key={socialPlatform}
                    name={`social.${socialPlatform}`}
                    children={(field) => (
                      <div>
                        <Label
                          htmlFor={field.name}
                          className="capitalize flex items-center"
                        >
                          {socialPlatform === "facebook" && (
                            <Facebook className="mr-2 h-4 w-4" />
                          )}
                          {socialPlatform === "instagram" && (
                            <Instagram className="mr-2 h-4 w-4" />
                          )}
                          {socialPlatform === "twitter" && (
                            <Twitter className="mr-2 h-4 w-4" />
                          )}
                          {socialPlatform === "tiktok" && (
                            <Music className="mr-2 h-4 w-4" />
                          )}
                          {t(`apply.social.${socialPlatform}`, socialPlatform)}
                        </Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value || ""}
                          onBlur={(e) => {
                            field.handleBlur();
                            // Mark social as touched when any social field is blurred
                            form.setFieldValue("socialTouched", true);
                          }}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder={t(
                            "apply.social.usernamePlaceholder",
                            "Your username"
                          )}
                          className="mt-1"
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  />
                )
              )}
            </div>
            <form.Field
              name="social"
              children={(field) => <FieldInfo field={field} />}
            />
          </section>

          {/* Pricing Section */}
          <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              {t("apply.pricing.title", "Pricing")}
            </h2>
            <div className="space-y-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {t(
                    "apply.pricing.monthlySubscription",
                    "Monthly Subscription"
                  )}
                </h3>
                <form.Field
                  name="monthlyPrice"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name}>
                        {t("apply.pricing.monthlyPrice", "Monthly Price (USD)")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const value = Number.parseFloat(e.target.value) || 0;
                          field.handleChange(value);
                          calculatePeriodPrices(
                            value,
                            form.getFieldValue("discounts") || {}
                          );
                        }}
                        placeholder="4.99"
                        min="4.99"
                        step="0.01"
                        className="mt-1"
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {t("apply.pricing.subscriptionPlans", "Subscription Plans")}
              </h3>
              {isLoadingPreferences && (
                <p>{t("common.loading", "Loading pricing options...")}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(preferencesByCycle).map(
                  ([cycle, cyclePrefs]) => (
                    <div
                      key={cycle}
                      className="p-4 border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm"
                    >
                      <div className="flex md:items-center justify-between flex-col md:flex-row mb-3">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">
                            {t(`apply.pricing.${cycle}Plan`, `${cycle} Plan`)}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t(
                              `apply.pricing.${cycle}Description`,
                              `Discount for ${cycle} subscription.`
                            )}
                          </p>
                        </div>
                        <form.Field
                          name={`discounts.${cycle}`}
                          children={(field) => (
                            <Select
                              value={field.state.value || ""}
                              onValueChange={(value) => {
                                field.handleChange(value);
                                const currentDiscounts = {
                                  ...form.getFieldValue("discounts"),
                                  [cycle]: value,
                                };
                                calculatePeriodPrices(
                                  form.getFieldValue("monthlyPrice") || 0,
                                  currentDiscounts
                                );
                              }}
                            >
                              <SelectTrigger className="border rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                                <SelectValue
                                  placeholder={t("common.select", "Select")}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {cyclePrefs.map((option) => (
                                  <SelectItem
                                    key={option._id}
                                    value={option._id}
                                  >
                                    {option.discount}%
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div>
                        <Label>
                          {t(
                            `apply.pricing.total${
                              cycle.charAt(0).toUpperCase() + cycle.slice(1)
                            }Price`,
                            `Total ${cycle} Price`
                          )}
                        </Label>
                        <Input
                          value={
                            periodPrices[cycle]?.toFixed(2) ||
                            t("apply.pricing.calculating", "Calculating...")
                          }
                          readOnly
                          className="mt-1 bg-gray-100 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* Legal Section */}
          <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <form.Field
              name="acceptTerms"
              children={(field) => (
                <div className="flex items-center my-2">
                  <div className="flex items-center h-5">
                    <Checkbox
                      id="accept-terms"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(Boolean(checked))
                      }
                      onBlur={field.handleBlur}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label
                      htmlFor="accept-terms"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t(
                        "apply.legal.acceptTerms",
                        "I accept the terms and conditions"
                      )}
                    </Label>
                    <FieldInfo field={field} />
                  </div>
                </div>
              )}
            />

            <form.Field
              name="confirmAge"
              children={(field) => (
                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <Checkbox
                      id="confirm-age"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(Boolean(checked))
                      }
                      onBlur={field.handleBlur}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label
                      htmlFor="confirm-age"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t(
                        "apply.legal.confirmAge",
                        "I confirm I am of legal age to create content"
                      )}
                    </Label>
                    <FieldInfo field={field} />
                  </div>
                </div>
              )}
            />
          </section>

          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("common.error", "Error")}</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {formSuccess && (
            <Alert
              variant="default"
              className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
            >
              <AlertCircle className="h-4 w-4 text-green-700 dark:text-green-300" />
              <AlertTitle className="text-green-800 dark:text-green-200">
                {t("common.success", "Success")}
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                {formSuccess}
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-6 flex justify-end">
            <Button
              type="submit"
              disabled={
                submitApplicationMutation.isPending || !form.state.canSubmit
              }
              className="w-full sm:w-auto px-6 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              {submitApplicationMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("apply.processing", "Processing...")}</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>{t("apply.button", "Submit Application")}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
