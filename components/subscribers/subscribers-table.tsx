"use client"

import { useTranslation } from "react-i18next"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Ban, Loader2 } from "lucide-react"

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

interface SubscribersTableProps {
  subscribers: Subscriber[]
  onMessage: (subscriber: Subscriber) => void
  onBlock: (subscriber: Subscriber) => void
  loadingMessage: boolean
  blockLoading: boolean
}

export function SubscribersTable({
  subscribers,
  onMessage,
  onBlock,
  loadingMessage,
  blockLoading,
}: SubscribersTableProps) {
  const { t } = useTranslation()

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "cancelled":
        return "secondary"
      case "expired":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "cancelled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return ""
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("subscribers.table.subscriber")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("subscribers.table.plan")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("subscribers.table.status")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("subscribers.table.revenue")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("subscribers.table.joined")}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("subscribers.table.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {subscribers.map((subscriber) => (
            <tr key={subscriber.id} className="hover:bg-muted">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={subscriber.avatar} alt={subscriber.name} />
                    <AvatarFallback>{subscriber.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-foreground">
                      {subscriber.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-foreground">
                  {t(`subscribers.filters.${subscriber.plan}`)}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${subscriber.plan === "monthly" ? "9.99" : "99.99"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  variant={getStatusBadgeVariant(subscriber.status)}
                  className={getStatusBadgeColor(subscriber.status)}
                >
                  {t(`subscribers.filters.${subscriber.status}`)}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-foreground">
                  ${subscriber.totalRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("subscribers.table.lifetimeValue")}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {formatDate(subscriber.joinedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMessage(subscriber)}
                    disabled={loadingMessage}
                    title={t("subscribers.actions.message")}
                  >
                    {loadingMessage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <MessageCircle className="h-5 w-5" />
                    )}
                  </Button>
                  {subscriber.status === "active" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onBlock(subscriber)}
                      disabled={blockLoading}
                      title={t("subscribers.actions.block")}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {blockLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Ban className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 