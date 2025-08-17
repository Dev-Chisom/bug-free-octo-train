"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface Tab {
  key: string
  label: string
  icon: React.ReactNode
}

interface MediaTabsProps {
  activeTab: string
  tabs: Tab[]
  onUpdateActiveTab: (tab: string) => void
}

export default function MediaTabs({ activeTab, tabs, onUpdateActiveTab }: MediaTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-all duration-200 cursor-pointer",
              activeTab === tab.key
                ? "bg-white dark:bg-gray-900 text-primary-400 border-b-2 border-primary-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-primary-600",
            )}
            onClick={() => onUpdateActiveTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
