"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"
import { BuildLoading } from "@/components/ui/build-loading"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const initializeI18n = async () => {
      try {
        if (!i18n.isInitialized) {
          await i18n.init()
        }
        const currentLang = i18n.language || "en"
        const supportedLanguages = ["en", "es", "fr"]
        const baseLang = currentLang.split("-")[0].toLowerCase()
        const normalizedLang = supportedLanguages.includes(baseLang) ? baseLang : "en"
        if (currentLang !== normalizedLang) {
          await i18n.changeLanguage(normalizedLang)
        }
        setIsReady(true)
      } catch (error) {
        await i18n.changeLanguage("en")
        setIsReady(true)
      }
    }
    
    initializeI18n()
  }, [])

  // Show loading state until client-side hydration is complete and i18n is ready
  if (!isClient || !isReady) {
    return <BuildLoading />
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
