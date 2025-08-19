"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Languages, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Locale {
  code: string
  name: string
  flag: string
}

const SUPPORTED_LANGUAGES = ["en", "es", "fr"]

const normalizeLanguage = (lang: string): string => {
  if (!lang) return "en"
  const baseLang = lang.split("-")[0].toLowerCase()
  return SUPPORTED_LANGUAGES.includes(baseLang) ? baseLang : "en"
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [currentLocale, setCurrentLocale] = useState("en")
  const [isChanging, setIsChanging] = useState(false)

  const availableLocales: Locale[] = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ]

  const currentLocaleName = availableLocales.find((l) => l.code === currentLocale)?.name || "English"
  const currentLocaleFlag = availableLocales.find((l) => l.code === currentLocale)?.flag || "🇺🇸"

  useEffect(() => {
    // Set initial language from i18n
    const initialLang = normalizeLanguage(i18n.language || "en")
    setCurrentLocale(initialLang)

    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      const normalizedLng = normalizeLanguage(lng)
      setCurrentLocale(normalizedLng)
      setIsChanging(false)
    }

    i18n.on("languageChanged", handleLanguageChange)
    return () => {
      i18n.off("languageChanged", handleLanguageChange)
    }
  }, [i18n])

  const switchLanguage = async (code: string) => {
    if (isChanging || code === currentLocale) return
    
    try {
      setIsChanging(true)
      const normalizedCode = normalizeLanguage(code)

      // Change language in i18n
      await i18n.changeLanguage(normalizedCode)
      
      // Store in localStorage and cookie for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("i18nextLng", normalizedCode)
        document.cookie = `i18next=${normalizedCode}; path=/; max-age=${7 * 24 * 60 * 60}`
      }
      
      setCurrentLocale(normalizedCode)
    } catch (error) {
      console.error("Failed to switch language:", error)
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2" disabled={isChanging}>
          <Languages className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium flex items-center gap-1">
            <span>{currentLocaleFlag}</span>
            <span>{isChanging ? "Changing..." : currentLocaleName}</span>
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLocales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => switchLanguage(locale.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{locale.flag}</span>
              <span>{locale.name}</span>
            </span>
            {locale.code === currentLocale && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
