"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ApplyCreatorForm from "@/components/apply/apply-creator-form";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function ApplyPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    if (user?.data?.creatorProfile?.status === "approved") {
      router.replace("/");
    }
  }, [user, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div>
            <div className="text-left mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Become a Creator
              </h1>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div>
          <div className="text-left mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("nav.becomeCreator", "Become a Creator")}
            </h1>
          </div>
          <div className="overflow-hidden">
            <div>
              <ApplyCreatorForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
