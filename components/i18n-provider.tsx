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
        // Wait for i18n to be fully initialized
        if (!i18n.isInitialized) {
          await i18n.init()
        }
        
        // Ensure we have the right language loaded
        const currentLang = i18n.language || "en"
        const supportedLanguages = ["en", "es", "fr"]
        const baseLang = currentLang.split("-")[0].toLowerCase()
        const normalizedLang = supportedLanguages.includes(baseLang) ? baseLang : "en"
        
        // Load the language resources if not already loaded
        if (!i18n.hasResourceBundle(normalizedLang, "translation")) {
          await i18n.loadLanguages([normalizedLang])
        }
        
        // Change to normalized language if needed
        if (currentLang !== normalizedLang) {
          await i18n.changeLanguage(normalizedLang)
        }
        
        setIsReady(true)
      } catch (error) {
        console.error("Failed to initialize i18n:", error)
        // Fallback to English
        try {
          if (!i18n.hasResourceBundle("en", "translation")) {
            await i18n.loadLanguages(["en"])
          }
          await i18n.changeLanguage("en")
        } catch (fallbackError) {
          console.error("Failed to load fallback language:", fallbackError)
        }
        setIsReady(true)
      }
    }
    
    // Only initialize if not already ready
    if (!isReady) {
      initializeI18n()
    }
  }, [isReady])

  // Show loading state until client-side hydration is complete and i18n is ready
  if (!isClient || !isReady) {
    return <BuildLoading />
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
