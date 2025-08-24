"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { PostForm } from "@/components/content/post-form"
import { useContentById, useUpdateContent } from "@/lib/content/content-hooks"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import type { PostFormValues } from "@/components/content/post-form"

export default function EditContentPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const [isClient, setIsClient] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const contentId = params.id as string
  const { data: contentData, isLoading: loading, error } = useContentById(contentId)
  const updateMutation = useUpdateContent()



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
          <h2 className="text-xl font-semibold text-foreground mb-4">Please log in to edit content</h2>
          <Button onClick={() => (window.location.href = "/auth")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  const minScheduleDate = new Date()
  minScheduleDate.setMinutes(minScheduleDate.getMinutes() + 10)

  const handleSubmit = async (formData: PostFormValues) => {
    const mediaFileIds = Array.isArray(formData.mediaFiles) ? formData.mediaFiles.filter(Boolean) : []

    const updateData = {
      title: formData.title,
      body: formData.content,
      visibility: formData.visibility,
      mediaFiles: mediaFileIds,
      ...(formData.visibility === "pay-to-view" && { price: formData.price }),
    }

    updateMutation.mutate(
      { id: contentId, data: updateData },
      {
        onSuccess: () => {
          toast.success(t("notifications.contentUpdated"))
          router.push("/content")
        },
        onError: () => {
          toast.error(t("notifications.contentUpdateFailed"))
        },
      },
    )
  }

  const handleDraft = async (formData: PostFormValues) => {
    toast.success(t("notifications.draftSaved"))
  }

  const handleCancel = () => {
    router.push("/content")
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center">
            <Link href="/content" className="mr-2 text-muted-foreground hover:text-foreground transition-colors">
              <Icons.arrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{t("content.edit.title")}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("content.edit.description")}</p>
        </div>

        <div className="bg-card shadow-sm rounded-lg overflow-hidden border border-border">
          <div className="p-8">
            <div className="space-y-6">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-32 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error only if we're not loading and there's an actual error
  if (!loading && error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive mb-4">{t("content.edit.loadFailed")}</h2>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  // Show error if no data after loading is complete and no error (meaning content doesn't exist)
  if (!loading && !error && !contentData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive mb-4">Content not found</h2>
          <Button onClick={() => router.push("/content")}>Back to Content</Button>
        </div>
      </div>
    )
  }

  const initialValues = {
    title: contentData?.title || "",
    content: contentData?.body || "",
    visibility: (contentData?.visibility === "private"
      ? "subscribers"
      : contentData?.visibility === "premium"
      ? "pay-to-view"
      : "public") as "public" | "subscribers" | "pay-to-view",
    price: contentData?.price || 4.99,
    mediaUrls: contentData?.mediaFiles
      ? contentData?.mediaFiles.map((mediaFile: any) => ({
          id: mediaFile._id || mediaFile.id,
          url: mediaFile.url || "",
          type: (mediaFile.type || "image") as "image" | "video",
          name: mediaFile.url ? mediaFile.url.split('/').pop() || 'media' : 'media',
          thumbnailUrl: mediaFile.thumbnailUrl || mediaFile.url || "",
          cover: mediaFile.coverUrl || "",
          duration: mediaFile.duration || 0,
          size: mediaFile.size || 0,
        }))
      : [],
  }
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <Link href="/content" className="mr-2 text-muted-foreground hover:text-foreground transition-colors">
            <Icons.arrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t("content.edit.title")}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("content.edit.description")}</p>
      </div>

        

      <div className="bg-card shadow-sm rounded-lg overflow-hidden border border-border">
        <PostForm
          initialValues={initialValues}
          loading={updateMutation.isPending}
          minScheduleDate={minScheduleDate.toISOString().slice(0, 16)}
          isEditMode={true}
          onSubmit={handleSubmit}
          onDraft={handleDraft}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
