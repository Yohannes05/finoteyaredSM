"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, Search, MoreHorizontal, User, Cross, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/LanguageContext"
import { toast } from "sonner"

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [acceptedFilter, setAcceptedFilter] = useState<'all' | 'accepted' | 'not_accepted'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null)
  const { t } = useLanguage()

  const handleDelete = async () => {
    if (!studentToDelete) return
    const id = studentToDelete.id
    setDeletingId(id)
    setStudentToDelete(null)
    try {
      const { error } = await supabase.from('students').delete().eq('id', id)
      if (error) throw error
      toast.success(t('delete_success_student'))
      setStudents(prev => prev.filter(s => s.id !== id))
    } catch (err: any) {
      toast.error(err.message || t('delete_error'))
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    async function getStudents() {
      const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false })
      if (data) setStudents(data)
      setIsLoading(false)
    }
    getStudents()
  }, [])

  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    // For non-deacon students, pass through all filters. For deacons, apply acceptedFilter.
    const matchesAccepted = acceptedFilter === 'all' || !s.is_deacon ||
      (acceptedFilter === 'accepted' && s.deacon_accepted) ||
      (acceptedFilter === 'not_accepted' && !s.deacon_accepted)
    return matchesSearch && matchesAccepted
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
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-slate-400 ml-2 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('students_search')}
              className="bg-transparent border-0 focus:ring-0 text-sm w-full placeholder:text-slate-400 text-black"
            />
          </div>
          {/* ሚስጥር አይተሀል filter */}
          <div className="flex items-center gap-1.5 shrink-0 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Filter:</span>
            {(['all', 'accepted', 'not_accepted'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setAcceptedFilter(filter)}
                className={`px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all active:scale-95 ${
                  acceptedFilter === filter
                    ? filter === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800 shadow-sm'
                      : filter === 'not_accepted'
                        ? 'bg-slate-200 text-slate-700 shadow-sm'
                        : 'bg-indigo-100 text-indigo-800 shadow-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {filter === 'all' ? t('common_all') : filter === 'accepted' ? t('deacon_accepted_yes') : t('deacon_accepted_no')}
              </button>
            ))}
          </div>
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{s.first_name} {s.last_name}</span>
                          {s.is_deacon && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              <Cross className="h-2.5 w-2.5" />
                              {t('nav_deacons')}
                            </span>
                          )}
                          {s.is_deacon && s.deacon_accepted && (
                            <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              ✅ {t('deacon_accepted_label')}
                            </span>
                          )}
                          {s.is_deacon && !s.deacon_accepted && (
                            <span className="flex items-center text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                              {t('deacon_accepted_no')}
                            </span>
                          )}
                        </div>
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
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/students/${s.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/students/${s.id}`} className="text-indigo-600 hover:text-indigo-900 font-bold text-xs whitespace-nowrap">
                          {t('students_view_details')}
                        </Link>
                        <button
                          onClick={() => setStudentToDelete(s)}
                          disabled={deletingId === s.id}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          {deletingId === s.id ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {studentToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => !deletingId && setStudentToDelete(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white p-6"
              onClick={(e: any) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {t('delete_confirm_title').replace('{{name}}', `${studentToDelete.first_name} ${studentToDelete.last_name}`)}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {t('delete_confirm_message_student')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setStudentToDelete(null)}
                  disabled={!!deletingId}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  {t('delete_cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!!deletingId}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      {t('delete_confirm_button')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
