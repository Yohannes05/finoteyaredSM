"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, Search, MoreHorizontal, Cross, Calendar } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/LanguageContext"

export default function DeaconsPage() {
  const [deacons, setDeacons] = useState<any[]>([])
  const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function loadData() {
      const { data: deaconsData } = await supabase.from('deacons').select('*').order('created_at', { ascending: false })
      if (deaconsData) setDeacons(deaconsData)

      // Get service counts for each deacon
      const { data: schedules } = await supabase.from('deacon_schedules').select('deacon_id, status')
      if (schedules) {
        const counts: Record<string, number> = {}
        schedules.forEach(s => {
          if (s.status === 'served') {
            counts[s.deacon_id] = (counts[s.deacon_id] || 0) + 1
          }
        })
        setServiceCounts(counts)
      }

      setIsLoading(false)
    }
    loadData()
  }, [])

  const filteredDeacons = deacons.filter(d => {
    const fullName = `${d.first_name} ${d.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('deacons_title')}</h2>
          <p className="text-slate-500 mt-1">{t('deacons_subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/deacons/schedule">
            <Button variant="outline" className="rounded-xl h-11 px-6 font-bold border-slate-200 text-slate-700 hover:text-slate-900">
              <Calendar className="h-4 w-4 mr-2" />
              {t('nav_schedule')}
            </Button>
          </Link>
          <Link href="/dashboard/deacons/new">
            <Button className="rounded-xl shadow-lg shadow-emerald-100 bg-emerald-600 hover:bg-emerald-700 h-11 px-6 transition-all active:scale-95">
              <UserPlus className="h-4 w-4 mr-2" />
              {t('deacons_add')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400 ml-2 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('deacons_search')}
            className="bg-transparent border-0 focus:ring-0 text-sm w-full placeholder:text-slate-400 text-black"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('deacons_col_name')}</th>
                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('deacons_col_phone')}</th>
                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('deacons_col_ordination')}</th>
                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('deacons_col_services')}</th>
                <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('deacons_col_status')}</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('deacons_col_actions')}</th>
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
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredDeacons.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-slate-500 italic">{t('deacons_empty')}</td></tr>
                ) : filteredDeacons.map((d, idx) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                          <Cross className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-900">{d.first_name} {d.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{d.phone || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{d.ordination_date || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-600">{serviceCounts[d.id] || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide shadow-sm ${d.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                        {d.status === 'active' ? t('common_status_active') : t('common_status_inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/deacons/${d.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/deacons/${d.id}`} className="text-indigo-600 hover:text-indigo-900 font-bold text-xs">
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
