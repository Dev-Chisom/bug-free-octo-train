"use client"

import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface Subscriber {
  id: string
  name: string
  email: string
  avatar: string
  plan: "monthly" | "yearly"
  status: "active" | "expired" | "cancelled"
  totalRevenue: number
  joinedAt: string
}

interface BlockSubscriberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriber: Subscriber | null
  onConfirm: () => void
  loading: boolean
}

export function BlockSubscriberModal({
  open,
  onOpenChange,
  subscriber,
  onConfirm,
  loading,
}: BlockSubscriberModalProps) {
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-lg leading-6 font-medium text-foreground">
                {t("subscribers.blockTitle")}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-2">
            <p className="text-sm text-muted-foreground">
              {t("subscribers.blockConfirmation")}
            </p>
            {subscriber && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium text-foreground">
                  {subscriber.name}
                </p>
                <p className="text-sm text-muted-foreground">{subscriber.email}</p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
            >
              {t("subscribers.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("subscribers.blocking")}
                </>
              ) : (
                t("subscribers.block")
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 