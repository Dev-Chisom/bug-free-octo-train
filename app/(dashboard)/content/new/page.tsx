"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { PostForm } from "@/components/content/post-form"
import { useCreateContent } from "@/lib/content/content-hooks"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewContentPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const createMutation = useCreateContent()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Please log in to create content
          </h2>
          <Button onClick={() => (window.location.href = "/auth")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  const initialValues = {
    title: "",
    content: "",
    visibility: "public" as const,
    price: 4.99,
    mediaUrls: [],
  }

  const minScheduleDate = new Date()
  minScheduleDate.setMinutes(minScheduleDate.getMinutes() + 10)

  const handleSubmit = async (formData: any) => {
    createMutation.mutate(
      {
        title: formData.title,
        body: formData.body || formData.content,
        mediaFiles: formData.mediaFiles || [],
        visibility: formData.visibility,
        price: formData.visibility === "pay-to-view" ? formData.price : undefined,
        scheduledDate: formData.isScheduled ? formData.scheduledDate : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("notifications.contentCreated"))
          router.push("/content")
        },
        onError: () => {
          toast.error(t("notifications.contentCreateFailed"))
        },
      },
    )
  }

  const handleDraft = async (formData: any) => {
    createMutation.mutate(
      {
        title: formData.title || t("content.untitledDraft"),
        body: formData.body || formData.content || "",
        mediaFiles: formData.mediaFiles || [],
        visibility: formData.visibility || "public",
        price: formData.visibility === "pay-to-view" ? formData.price : undefined,
        isDraft: true,
      },
      {
        onSuccess: () => {
          toast.success(t("notifications.draftSaved"))
          router.push("/content")
        },
        onError: () => {
          toast.error(t("notifications.draftSaveFailed"))
        },
      },
    )
  }

  const handleCancel = () => {
    router.push("/content")
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <Link href="/content" className="mr-2 text-muted-foreground hover:text-foreground transition-colors">
            <Icons.arrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t("content.new.title")}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("content.new.description")}</p>
      </div>

      <div className="bg-card shadow-sm rounded-lg overflow-hidden border border-border">
        <PostForm
          initialValues={initialValues}
          loading={createMutation.isPending}
          minScheduleDate={minScheduleDate.toISOString().slice(0, 16)}
          onSubmit={handleSubmit}
          onDraft={handleDraft}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
