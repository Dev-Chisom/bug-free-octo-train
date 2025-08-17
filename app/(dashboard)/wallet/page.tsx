"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { useWalletBalance, useTransactionHistory, usePaystackPayment, useBaniPayment } from "@/lib/wallet/wallet-hooks"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export default function WalletPage() {
  const { t } = useTranslation()
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)
  const [fundingAmount, setFundingAmount] = useState(1000)
  const [isClient, setIsClient] = useState(false)

  // Get user from auth store
  const { user, isAuthenticatedFn } = useAuthStore()

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Wallet queries - only run on client
  const { data: walletData, isLoading: walletLoading, error: walletError } = useWalletBalance()
  const { data: transactions, isLoading: transactionsLoading } = useTransactionHistory()

  // Payment mutations
  const paystackMutation = usePaystackPayment()
  const baniMutation = useBaniPayment()

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  // Check authentication only after client hydration
  if (!isAuthenticatedFn()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{t("auth.pleaseLogin")}</h2>
          <Button onClick={() => (window.location.href = "/auth")}>{t("auth.goToLogin")}</Button>
        </div>
      </div>
    )
  }

  const balance = walletData?.balance || 0
  const recentTransactions = transactions?.slice(0, 5) || []

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-NG")
  }

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const initializePaystack = async () => {
    if (!user?.data?.email) {
      toast.error(t("wallet.userEmailNotFound"))
      return
    }

    paystackMutation.mutate({
      amount: fundingAmount,
      email: user.data.email,
      callback_url: `${window.location.origin}/wallet/callback?provider=paystack`,
    })
  }

  const initializeBani = async () => {
    if (!user?.data?.email) {
      toast.error(t("wallet.userInfoNotFound"))
      return
    }

    // Extract name parts from user.data.name or use defaults
    const nameParts = user.data.name?.split(" ") || ["User", "Name"]
    const firstName = nameParts[0] || "User"
    const lastName = nameParts.slice(1).join(" ") || "Name"

    baniMutation.mutate({
      amount: fundingAmount,
      email: user.data.email,
      firstName,
      lastName,
      phoneNumber: "08012345678",
    })
  }

  if (walletLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (walletError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-4">{t("wallet.failedToLoad")}</h2>
          <Button onClick={() => window.location.reload()}>{t("common.retry")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("nav.wallet")}</h1>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("walletBalance")}</h1>
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">₦{formatAmount(balance)}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="w-full" onClick={() => setShowFundingModal(true)}>
              {t("fundWallet")}
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => setShowTransactionHistory(true)}>
              {t("transactionHistory")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions Card */}
      <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("recentTransactions")}</h2>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex justify-between items-center p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.type === "credit"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₦{formatAmount(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t("wallet.noTransactions")}</div>
          )}
        </CardContent>
      </Card>

      {/* Funding Modal */}
      <Dialog open={showFundingModal} onOpenChange={setShowFundingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("fundYourWallet")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("amount")} (₦)
              </Label>
              <Input
                type="number"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(Number(e.target.value))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500"
                min={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={initializePaystack}
                disabled={paystackMutation.isPending || baniMutation.isPending}
                className="w-full"
              >
                {paystackMutation.isPending ? <Icons.spinner className="h-4 w-4 animate-spin mr-2" /> : null}
                {t("payWithPaystack")}
              </Button>
              <Button
                onClick={initializeBani}
                disabled={paystackMutation.isPending || baniMutation.isPending}
                variant="secondary"
                className="w-full"
              >
                {baniMutation.isPending ? <Icons.spinner className="h-4 w-4 animate-spin mr-2" /> : null}
                {t("payWithBani")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History Modal */}
      <Dialog open={showTransactionHistory} onOpenChange={setShowTransactionHistory}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("transactionHistory")}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {transaction.id}</p>
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.type === "credit"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₦{formatAmount(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
