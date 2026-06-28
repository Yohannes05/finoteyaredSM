"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { translations, Language, TranslationKey } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language | null
    if (saved && (saved === "en" || saved === "am")) {
      setLanguage(saved)
    }
  }, [])

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === "en" ? "am" : "en"
      localStorage.setItem("language", next)
      return next
    })
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] ?? translations.en[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
