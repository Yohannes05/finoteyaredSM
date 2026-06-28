"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarCheck, Cross, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/LanguageContext"

export default function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const tabs = [
    { nameKey: 'nav_dashboard' as const, href: '/dashboard', icon: LayoutDashboard },
    { nameKey: 'nav_students' as const, href: '/dashboard/students', icon: Users },
    { nameKey: 'nav_deacons' as const, href: '/dashboard/deacons', icon: Cross },
    { nameKey: 'nav_attendance' as const, href: '/dashboard/attendance', icon: CalendarCheck },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm z-20">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-50">
        <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 rounded-full overflow-hidden shadow-md shadow-indigo-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="School Logo" className="object-cover w-full h-full" />
            </div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 line-clamp-2">ፍኖተ ቅዱስ ያሬድ አብነት ት/ቤት</h1>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between py-6 px-4">
        <nav className="space-y-2">
            {tabs.map((tab) => {
            let isActive = false;
            if (tab.href === '/dashboard') {
                isActive = pathname === tab.href;
            } else {
                isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            }
            
            return (
                <Link
                key={tab.nameKey}
                href={tab.href}
                className={cn(
                    "group relative flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                    isActive 
                        ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
                >
                <tab.icon
                    className={cn(
                    "mr-3 h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                />
                {t(tab.nameKey)}
                {isActive && (
                    <motion.div 
                        layoutId="active-tab"
                        className="absolute right-3"
                    >
                        <ChevronRight className="h-3 w-3" />
                    </motion.div>
                )}
                </Link>
            )
            })}
        </nav>

        <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2">
                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                    AD
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-900">{t('nav_administrator')}</p>
                    <p className="text-[10px] text-slate-500">{t('nav_center_manager')}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
