"use client"

import type React from "react"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/lib/auth/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Camera, Loader2, Trash2 } from "lucide-react"

interface ProfileForm {
  displayName: string
  username: string
  bio: string
}

interface EmailForm {
  current: string
  new: string
  password: string
}

interface PasswordForm {
  current: string
  new: string
  confirm: string
}

interface NotificationPreferences {
  newSubscriber: boolean
  newMessage: boolean
  newComment: boolean
  newTip: boolean
  marketing: boolean
  newsletter: boolean
}

interface FormErrors {
  displayName?: string
  username?: string
  bio?: string
  email?: string
  password?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function CreatorSettingsPage() {
  const { t } = useTranslation()
  const { user, setUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isClient, setIsClient] = useState(false)

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Loading states
  const [loading, setLoading] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)

  // Profile image
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg?height=96&width=96&text=Avatar")

  // Form states
  const [profile, setProfile] = useState<ProfileForm>({
    displayName: user?.data?.creatorProfile?.displayName || user?.data?.name || "",
    username: user?.data?.creatorProfile?.username || "",
    bio: user?.data?.creatorProfile?.bio || "",
  })

  const [email, setEmail] = useState<EmailForm>({
    current: user?.data?.email || "",
    new: "",
    password: "",
  })

  const [password, setPassword] = useState<PasswordForm>({
    current: "",
    new: "",
    confirm: "",
  })

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    newSubscriber: true,
    newMessage: true,
    newComment: true,
    newTip: true,
    marketing: false,
    newsletter: true,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  // Computed user initials
  const userInitials = useMemo(() => {
    const name = profile.displayName
    if (!name) return "?"

    const parts = name.split(" ")
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }, [profile.displayName])

  // Notification labels and descriptions
  const getNotificationLabel = useCallback(
    (key: keyof NotificationPreferences) => {
      const labels = {
        newSubscriber: t("settings.notifications.newSubscriber"),
        newMessage: t("settings.notifications.newMessage"),
        newComment: t("settings.notifications.newComment"),
        newTip: t("settings.notifications.newTip"),
        marketing: t("settings.notifications.marketing"),
        newsletter: t("settings.notifications.newsletter"),
      }
      return labels[key] || key
    },
    [t],
  )

  const getNotificationDescription = useCallback(
    (key: keyof NotificationPreferences) => {
      const descriptions = {
        newSubscriber: t("settings.notifications.newSubscriberDesc"),
        newMessage: t("settings.notifications.newMessageDesc"),
        newComment: t("settings.notifications.newCommentDesc"),
        newTip: t("settings.notifications.newTipDesc"),
        marketing: t("settings.notifications.marketingDesc"),
        newsletter: t("settings.notifications.newsletterDesc"),
      }
      return descriptions[key] || ""
    },
    [t],
  )

  // Handle image upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    const imageUrl = URL.createObjectURL(file)
    setProfileImage(imageUrl)
    toast.success("Profile image updated successfully")
  }, [])

  // Form handlers
  const updateProfile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setErrors({})

      try {
        // Validation
        const newErrors: FormErrors = {}
        if (!profile.displayName.trim()) {
          newErrors.displayName = "Display name is required"
        }
        if (!profile.username.trim()) {
          newErrors.username = "Username is required"
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          return
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast.success("Profile updated successfully")
      } catch (error) {
        toast.error("Failed to update profile")
      } finally {
        setLoading(false)
      }
    },
    [profile],
  )

  const updateEmail = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setErrors({})

      try {
        // Validation
        const newErrors: FormErrors = {}
        if (!email.new.trim()) {
          newErrors.email = "New email is required"
        }
        if (!email.password.trim()) {
          newErrors.password = "Password is required"
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          return
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast.success("Email updated successfully")
        setEmail((prev) => ({
          current: prev.new,
          new: "",
          password: "",
        }))
      } catch (error) {
        toast.error("Failed to update email")
      } finally {
        setLoading(false)
      }
    },
    [email],
  )

  const updatePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setErrors({})

      try {
        // Validation
        const newErrors: FormErrors = {}
        if (!password.current.trim()) {
          newErrors.currentPassword = "Current password is required"
        }
        if (!password.new.trim()) {
          newErrors.newPassword = "New password is required"
        }
        if (password.new !== password.confirm) {
          newErrors.confirmPassword = "Passwords do not match"
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          return
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast.success("Password updated successfully")
        setPassword({ current: "", new: "", confirm: "" })
      } catch (error) {
        toast.error("Failed to update password")
      } finally {
        setLoading(false)
      }
    },
    [password],
  )

  const updateNotifications = useCallback(async () => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Notification preferences saved")
    } catch (error) {
      toast.error("Failed to save preferences")
    } finally {
      setLoading(false)
    }
  }, [notifications])

  const confirmDeleteAccount = useCallback(async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setLoadingDelete(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("Account deleted successfully")
      // In real app, would redirect to login
    } catch (error) {
      toast.error("Failed to delete account")
    } finally {
      setLoadingDelete(false)
    }
  }, [])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>{t("settings.profile.title")}</CardTitle>
            <CardDescription>Update your profile information and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback className="text-xl font-medium">{userInitials}</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full p-2 h-8 w-8 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click the camera icon to update your profile picture
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max size 5MB.</p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={updateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile((prev) => ({ ...prev, displayName: e.target.value }))}
                    className={errors.displayName ? "border-red-500" : ""}
                  />
                  {errors.displayName && <p className="text-sm text-red-500">{errors.displayName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile((prev) => ({ ...prev, username: e.target.value }))}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                  className={errors.bio ? "border-red-500" : ""}
                />
                {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>{t("settings.email.title")}</CardTitle>
            <CardDescription>Change your email address</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentEmail">Current Email</Label>
                <Input id="currentEmail" type="email" value={email.current} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email *</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={email.new}
                  onChange={(e) => setEmail((prev) => ({ ...prev, new: e.target.value }))}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPassword">Current Password *</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={email.password}
                  onChange={(e) => setEmail((prev) => ({ ...prev, password: e.target.value }))}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Email
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>{t("settings.password.title")}</CardTitle>
            <CardDescription>Change your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={updatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword((prev) => ({ ...prev, current: e.target.value }))}
                  className={errors.currentPassword ? "border-red-500" : ""}
                />
                {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword((prev) => ({ ...prev, new: e.target.value }))}
                  className={errors.newPassword ? "border-red-500" : ""}
                />
                {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword((prev) => ({ ...prev, confirm: e.target.value }))}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>{t("settings.notifications.title")}</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-start space-x-3">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [key]: checked === true,
                    }))
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor={key} className="text-sm font-medium">
                    {getNotificationLabel(key as keyof NotificationPreferences)}
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getNotificationDescription(key as keyof NotificationPreferences)}
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-6">
              <Button onClick={updateNotifications} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">{t("settings.deleteAccount.title")}</CardTitle>
            <CardDescription>{t("settings.deleteAccount.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={confirmDeleteAccount} disabled={loadingDelete}>
              {loadingDelete ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
