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
  subscription: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300",
  tip: "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300",
  ppv: "bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-300",
}

const statusColorMap: Record<string, string> = {
  completed: "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300",
  pending: "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300",
  failed: "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300",
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
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            {Object.entries(transactionHeaders).map(([key, label]) => (
              <th
                key={key}
                className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {transaction.customer.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.customer.email}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  ${transaction.amount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
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