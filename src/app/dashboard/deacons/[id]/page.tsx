"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Calendar, Cross, Activity, X, User, CheckCircle2, XCircle } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

export default function DeaconDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const deaconId = params.id
  const [deacon, setDeacon] = useState<any>(null)
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPhotoPopup, setShowPhotoPopup] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    async function loadDetails() {
      const { data: deaconData } = await supabase.from('deacons').select('*').eq('id', deaconId).single()
      if(deaconData) setDeacon(deaconData)
      const { data: scheduleData } = await supabase.from('deacon_schedules').select('*').eq('deacon_id', deaconId).order('service_date', { ascending: false }).limit(20)
      if(scheduleData) setSchedules(scheduleData)
      setIsLoading(false)
    }
    loadDetails()
  }, [deaconId])

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-1" />
          <Skeleton className="h-64 col-span-2" />
        </div>
      </div>
    )
  }

  if (!deacon) return <div className="p-8 text-red-500 font-bold bg-red-50 rounded-xl border border-red-100 text-center">{t('deacon_not_found')}</div>

  const servedCount = schedules.filter(s => s.status === 'served').length

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Deacon Profile Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 bg-white">
        <div className="pt-16 sm:pt-20 px-4 sm:px-10 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 relative z-10">
          <div className="relative">
            {deacon.photo_url ? (
              <button onClick={() => setShowPhotoPopup(true)} className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white cursor-pointer hover:opacity-95 transition-opacity ring-4 ring-indigo-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={deacon.photo_url} alt={`${deacon.first_name}`} className="h-full w-full object-cover" />
              </button>
            ) : (
              <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 border-4 border-white shadow-xl flex items-center justify-center ring-4 ring-indigo-50">
                <Cross className="h-12 w-12 text-indigo-400" />
              </div>
            )}
            <div className={`absolute -bottom-3 -right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md border-2 border-white ${
                deacon.status === 'active' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-400 text-white'
            }`}>
              {deacon.status === 'active' ? t('common_status_active') : t('common_status_inactive')}
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left mt-0 sm:mt-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
              <Cross className="h-6 w-6 inline mr-2 text-indigo-500" />
              {deacon.first_name} {deacon.last_name}
            </h2>
            <div className="flex items-center justify-center sm:justify-start text-sm font-semibold text-slate-500 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-flex border border-slate-200/50 shadow-sm">
              <Calendar className="h-4 w-4 mr-2 text-indigo-500" /> {t('deacon_details_ordination')}: {deacon.ordination_date || 'N/A'}
            </div>
          </div>
          
          <div className="shrink-0 mt-2 sm:mt-0 w-full sm:w-auto">
            <button onClick={() => router.push(`/dashboard/deacons/${deaconId}/edit`)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2">
              <User className="h-4 w-4" /> {t('deacon_edit_profile')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/80 backdrop-blur-xl">
             <CardHeader className="border-b border-slate-100/50 pb-4 bg-slate-50/30">
               <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                 <User className="h-4 w-4 text-indigo-500" /> {t('deacon_details_title')}
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-6">
               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                     <Phone className="h-5 w-5 text-emerald-500" />
                 </div>
                 <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('deacon_details_phone')}</p>
                     <p className="text-sm font-bold text-slate-900">{deacon.phone || 'N/A'}</p>
                 </div>
               </div>

               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                     <Cross className="h-5 w-5 text-indigo-500" />
                 </div>
                 <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('deacons_col_ordination')}</p>
                     <p className="text-sm font-bold text-slate-900">{deacon.ordination_date || 'N/A'}</p>
                 </div>
               </div>

               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">
                     <Activity className="h-5 w-5 text-amber-500" />
                 </div>
                 <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('deacons_col_services')}</p>
                     <p className="text-sm font-bold text-slate-900">{servedCount} times</p>
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column - Service History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/80 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100/50 pb-4 bg-slate-50/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Activity className="h-4 w-4 text-emerald-500" />
                {t('deacon_details_services')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {schedules.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Cross className="h-8 w-8 mb-3 opacity-20" />
                  <p className="italic text-sm">{t('deacon_details_no_services')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left bg-slate-50/30">
                        <th className="py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('deacon_details_service_date')}</th>
                        <th className="py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('deacon_details_service_status')}</th>
                        <th className="py-3 px-4 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('deacon_details_notes')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {schedules.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-medium text-slate-900">{s.service_date}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide shadow-sm ${
                              s.status === 'served' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : s.status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {s.status === 'served' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : s.status === 'cancelled' ? <XCircle className="h-3 w-3 mr-1" /> : <Calendar className="h-3 w-3 mr-1" />}
                              {s.status === 'served' ? t('schedule_served') : s.status === 'cancelled' ? t('schedule_cancelled') : t('schedule_scheduled')}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-500 italic">{s.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showPhotoPopup && deacon.photo_url && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
            onClick={() => setShowPhotoPopup(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-white"
              onClick={(e: any) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowPhotoPopup(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md"
              >
                <X className="h-5 w-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={deacon.photo_url} alt={`${deacon.first_name}`} className="max-w-full max-h-[85vh] object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
