"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Post } from "@/types/dashboard"

interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  post: Post | null
  onSendTip: (amount: number) => Promise<void>
}

export default function TipModal({ isOpen, onClose, post, onSendTip }: TipModalProps) {
  const { t } = useTranslation()
  const [tipAmount, setTipAmount] = useState(1000)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendTip = async () => {
    if (!post || tipAmount < 100) return

    setIsLoading(true)
    try {
      await onSendTip(tipAmount)
      onClose()
      setTipAmount(1000) // Reset amount
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false)
    }
  }

  const quickAmounts = [500, 1000, 2500, 5000, 10000]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>{t("home.sendTipTo", { name: post?.creator.name })}</span>
          </DialogTitle>
          <DialogDescription>Show your appreciation with a tip</DialogDescription>
        </DialogHeader>

        {post && (
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Avatar>
                <AvatarImage src={post.creator.avatar || "/placeholder.svg"} alt={post.creator.name} />
                <AvatarFallback>{post.creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{post.creator.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Content Creator</p>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">Quick amounts</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={tipAmount === amount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTipAmount(amount)}
                    className="text-xs"
                  >
                    ${(amount / 100).toFixed(0)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <Label htmlFor="tip-amount" className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
                {t("home.amount")} (cents)
              </Label>
              <Input
                id="tip-amount"
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value))}
                min={100}
                step={100}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum: $1.00 (100 cents)</p>
            </div>

            {/* Total Display */}
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Total:</span>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  ${(tipAmount / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Send Button */}
            <Button onClick={handleSendTip} disabled={isLoading || tipAmount < 100} className="w-full">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                t("home.sendTip")
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
