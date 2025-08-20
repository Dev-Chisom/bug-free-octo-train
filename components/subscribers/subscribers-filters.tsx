"use client"

import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface Filters {
  search: string
  plan: string
  status: string
}

interface SubscribersFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function SubscribersFilters({ filters, onFiltersChange }: SubscribersFiltersProps) {
  const { t } = useTranslation()

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handlePlanChange = (value: string) => {
    onFiltersChange({ ...filters, plan: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("subscribers.filters.search")}
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Plan Filter */}
      <Select value={filters.plan} onValueChange={handlePlanChange}>
        <SelectTrigger>
          <SelectValue placeholder={t("subscribers.filters.allPlans")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("subscribers.filters.allPlans")}</SelectItem>
          <SelectItem value="monthly">{t("subscribers.filters.monthly")}</SelectItem>
          <SelectItem value="yearly">{t("subscribers.filters.yearly")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder={t("subscribers.filters.allStatus")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("subscribers.filters.allStatus")}</SelectItem>
          <SelectItem value="active">{t("subscribers.filters.active")}</SelectItem>
          <SelectItem value="expired">{t("subscribers.filters.expired")}</SelectItem>
          <SelectItem value="cancelled">{t("subscribers.filters.cancelled")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 