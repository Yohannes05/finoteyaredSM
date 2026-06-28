"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, Search, MoreHorizontal, User } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/LanguageContext"

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function getStudents() {
      const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false })
      if (data) setStudents(data)
      setIsLoading(false)
    }
    getStudents()
  }, [])

  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('students_title')}</h2>
          <p className="text-slate-500 mt-1">{t('students_subtitle')}</p>
        </div>
        <Link href="/dashboard/students/new">
          <Button className="rounded-xl shadow-lg shadow-emerald-100 bg-emerald-600 hover:bg-emerald-700 h-11 px-6 transition-all active:scale-95">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('students_add')}
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400 ml-2 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('students_search')}
            className="bg-transparent border-0 focus:ring-0 text-sm w-full placeholder:text-slate-400 text-black"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('students_col_info')}</th>
                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('students_col_contact')}</th>
                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('students_col_topic')}</th>
                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('students_col_status')}</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('students_col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic">{t('students_empty')}</td></tr>
                ) : filteredStudents.map((s, idx) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-900">{s.first_name} {s.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.phone}</td>
                    <td className="px-6 py-4">
                      {s.learning_topic ? (
                        <span className="text-slate-700 font-medium">{s.learning_topic}</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {t(`stage_${s.learning_stage || 1}` as any)}
                          </span>
                          <span className="text-xs text-slate-400">— {t('students_no_topic')}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide shadow-sm ${s.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                        {s.status === 'active' ? t('common_status_active') : t('common_status_inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/students/${s.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/students/${s.id}`} className="text-indigo-600 hover:text-indigo-900 font-bold text-xs">
                          {t('students_view_details')}
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
