"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Settings, Languages, Menu, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useLanguage } from "@/lib/LanguageContext"

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const { language, toggleLanguage, t } = useLanguage()

  const handleSignOut = async () => {
    try {
        await supabase.auth.signOut()
        toast.success(language === "am" ? "ተሳክቶ ወጥቷል" : "Signed out successfully")
        router.push('/login')
    } catch {
        toast.error(language === "am" ? "መውጣት አልተሳካም" : "Failed to sign out")
    }
  }

  const getTitle = () => {
    const parts = pathname.split('/').filter(p => !['', 'dashboard'].includes(p))
    if (parts.length === 0) return t('dashboard_title')
    
    const last = parts[parts.length - 1]
    const isUUID = last.length > 20 && last.includes('-')
    
    if (last === 'students') return t('nav_students')
    if (last === 'attendance') return t('nav_attendance')
    if (last === 'payments') return t('nav_payments')
    if (last === 'new') return t('new_student_title')
    if (last === 'edit') return t('header_edit_student' as any)
    if (isUUID) return t('header_student_details' as any)
    
    return last.charAt(0).toUpperCase() + last.slice(1)
  }

  const getBackPath = () => {
    const paths = pathname.split('/').filter(Boolean)
    // Only show back button for sub-pages like /dashboard/students/UUID
    if (paths.length > 2) {
      return `/${paths.slice(0, -1).join('/')}`
    }
    return null
  }

  const backPath = getBackPath()

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 md:px-8 justify-between z-10 sticky top-0">
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {onMenuClick && (
          <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:bg-slate-100 shrink-0 h-9 w-9" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {backPath && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white text-slate-500 shrink-0" 
            onClick={() => router.push(backPath)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        <h2 className="hidden md:block text-sm font-bold text-slate-400 uppercase tracking-widest">{t('header_dashboard')}</h2>
        <div className="hidden md:block h-4 w-[1px] bg-slate-200"></div>
        <h3 className="text-base md:text-lg font-bold text-slate-900 truncate max-w-[120px] sm:max-w-xs">{getTitle()}</h3>
      </div>
      
      <div className="flex items-center gap-1 md:gap-2">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95 text-sm font-bold text-slate-700 shadow-sm"
          title={language === "en" ? "Switch to Amharic" : "Switch to English"}
        >
          <Languages className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-extrabold">{language === "en" ? "አማ" : "EN"}</span>
        </button>

        <div className="h-6 w-[1px] bg-slate-100 mx-1"></div>

        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/payments')} className="flex text-slate-400 hover:text-slate-600 rounded-full h-8 w-8">
            <Settings className="h-4 w-4" />
        </Button>
        <div className="hidden sm:block h-6 w-[1px] bg-slate-100 mx-1"></div>
        <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl h-9 font-bold px-2 md:px-4 flex items-center"
        >
            <LogOut className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t('nav_logout')}</span>
        </Button>
      </div>
    </header>
  )
}
