"use client"

import { useTranslation } from "react-i18next"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Customer {
  name: string
  email: string
  avatar: string
}

interface Transaction {
  id: string
  date: Date
  type: "subscription" | "tip" | "ppv"
  customer: Customer
  amount: number
  status: "completed" | "pending" | "failed"
}

interface TransactionsTableProps {
  transactions: Transaction[]
  formatDate: (date: Date) => string
}

const typeColorMap: Record<string, string> = {
  subscription: "bg-primary/10 text-primary",
  tip: "bg-secondary/10 text-secondary",
  ppv: "bg-accent/10 text-accent",
}

const statusColorMap: Record<string, string> = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  failed: "bg-destructive/10 text-destructive",
}

export function TransactionsTable({ transactions, formatDate }: TransactionsTableProps) {
  const { t } = useTranslation()

  const transactionHeaders = {
    date: t("earnings.transactions.headers.date"),
    type: t("earnings.transactions.headers.type"),
    customer: t("earnings.transactions.headers.customer"),
    amount: t("earnings.transactions.headers.amount"),
    status: t("earnings.transactions.headers.status"),
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr>
            {Object.entries(transactionHeaders).map(([key, label]) => (
              <th
                key={key}
                className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-card divide-y divide-border">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-muted">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {formatDate(transaction.date)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={typeColorMap[transaction.type]}>
                  {t(`earnings.transactions.types.${transaction.type}`)}
                </Badge>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={transaction.customer.avatar} alt={transaction.customer.name} />
                    <AvatarFallback>
                      {transaction.customer.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="ml-4">
                    <div className="text-sm font-medium text-foreground">
                      {transaction.customer.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.customer.email}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-foreground">
                  ${transaction.amount.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("earnings.transactions.afterFees", { amount: (transaction.amount * 0.8).toFixed(2) })}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={statusColorMap[transaction.status]}>
                  {t(`earnings.transactions.status.${transaction.status}`)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 