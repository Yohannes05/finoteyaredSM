"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, BookOpen, Calendar, Activity, X, User, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

export default function StudentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const studentId = params.id
  const [student, setStudent] = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPhotoPopup, setShowPhotoPopup] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    async function loadDetails() {
      const { data: studentData } = await supabase.from('students').select('*').eq('id', studentId).single()
      if(studentData) setStudent(studentData)
      const { data: attendanceData } = await supabase.from('attendance').select('*').eq('student_id', studentId).order('date', { ascending: false }).limit(10)
      if(attendanceData) setAttendance(attendanceData)
      setIsLoading(false)
    }
    loadDetails()
  }, [studentId])

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

  if (!student) return <div className="p-8 text-red-500 font-bold bg-red-50 rounded-xl border border-red-100 text-center">{t('student_not_found')}</div>

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Student Profile Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 bg-white">
        <div className="pt-16 sm:pt-20 px-4 sm:px-10 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 relative z-10">
          <div className="relative">
            {student.photo_url ? (
              <button onClick={() => setShowPhotoPopup(true)} className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white cursor-pointer hover:opacity-95 transition-opacity ring-4 ring-indigo-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={student.photo_url} alt={`${student.first_name}`} className="h-full w-full object-cover" />
              </button>
            ) : (
              <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 border-4 border-white shadow-xl flex items-center justify-center ring-4 ring-indigo-50">
                <span className="text-indigo-400 font-black text-5xl">{student.first_name.charAt(0)}</span>
              </div>
            )}
            <div className={`absolute -bottom-3 -right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md border-2 border-white ${
                student.status === 'active' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-400 text-white'
            }`}>
              {student.status === 'active' ? t('common_status_active') : t('common_status_inactive')}
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left mt-0 sm:mt-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">{student.first_name} {student.last_name}</h2>
            <div className="flex items-center justify-center sm:justify-start text-sm font-semibold text-slate-500 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-flex border border-slate-200/50 shadow-sm">
              <Calendar className="h-4 w-4 mr-2 text-indigo-500" /> {t('student_details_enrolled')} {student.enrollment_date}
            </div>
          </div>
          
          <div className="shrink-0 mt-2 sm:mt-0 w-full sm:w-auto">
            <button onClick={() => router.push(`/dashboard/students/${studentId}/edit`)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2">
              <User className="h-4 w-4" /> {t('student_edit_profile' as any)}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/80 backdrop-blur-xl">
             <CardHeader className="border-b border-slate-100/50 pb-4 bg-slate-50/30">
               <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800"><User className="h-4 w-4 text-indigo-500" /> {t('student_details_contact')}</CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-6">
               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 shadow-sm">
                     <User className="h-5 w-5 text-orange-500" />
                 </div>
                 <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('common_gender' as any)} & {t('student_details_age' as any)}</p>
                     <p className="text-sm font-bold text-slate-900 capitalize">{student.gender === 'male' ? t('gender_male' as any) : student.gender === 'female' ? t('gender_female' as any) : 'Not specified'}, {student.age ? `${student.age} yrs` : 'Unknown'}</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                     <Phone className="h-5 w-5 text-emerald-500" />
                 </div>
                 <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('student_details_phone')}</p>
                     <p className="text-sm font-bold text-slate-900">{student.phone}</p>
                 </div>
               </div>

               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                     <BookOpen className="h-5 w-5 text-blue-500" />
                 </div>
                 <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('student_details_topic')}</p>
                     <p className="text-sm font-bold text-slate-900">{student.learning_topic}</p>
                 </div>
               </div>

               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100 shadow-sm">
                     <BookOpen className="h-5 w-5 text-purple-500" />
                 </div>
                 <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Academic Grade / ክፍል</p>
                     <p className="text-sm font-bold text-slate-900">{student.academic_grade || 'N/A'}</p>
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column - Attendance and Stage */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/80 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100/50 pb-4 bg-slate-50/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Activity className="h-4 w-4 text-emerald-500" />
                {t('student_details_attendance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {attendance.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Activity className="h-8 w-8 mb-3 opacity-20" />
                  <p className="italic text-sm">{t('student_details_no_attendance')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {attendance.map(a => (
                    <div key={a.id} className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all hover:-translate-y-1 cursor-default ${
                        a.status === 'present' 
                            ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600' 
                            : a.status === 'absent' 
                                ? 'bg-red-50/50 border-red-100 hover:border-red-300 hover:bg-red-50 text-red-600' 
                                : 'bg-amber-50/50 border-amber-100 hover:border-amber-300 hover:bg-amber-50 text-amber-600'
                    }`}>
                      <p className="text-[11px] font-bold text-slate-500 mb-1.5">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        a.status === 'present' ? 'bg-emerald-200 text-emerald-800' : a.status === 'absent' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                      }`}>
                        {a.status === 'present' ? t('attendance_present') : a.status === 'absent' ? t('attendance_absent') : t('attendance_late')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/80 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100/50 pb-4 bg-slate-50/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                {t('student_details_stage' as any) || "Learning Track Progress"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto p-6 scrollbar-hide py-10 pb-20">
                 <div className="flex min-w-max gap-4 items-center">
                   {Array.from({length: 10}).map((_, idx) => {
                     const stageNum = idx + 1;
                     const isCompleted = stageNum < (student.learning_stage || 1);
                     const isCurrent = stageNum === (student.learning_stage || 1);
                     const isFuture = stageNum > (student.learning_stage || 1);
                     return (
                       <div key={stageNum} className="flex items-center">
                         {idx !== 0 && (
                           <div className={`h-1 w-8 sm:w-12 mx-2 rounded-full transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${isCompleted ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                         )}
                         <div className="flex flex-col items-center group cursor-default relative">
                           <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-all shadow-md z-10 ${
                             isCompleted ? 'bg-indigo-500 border-indigo-600 text-white' : 
                             isCurrent ? 'bg-white border-indigo-600 text-indigo-700 shadow-lg shadow-indigo-100 ring-4 ring-indigo-50 scale-125' : 
                             'bg-slate-50 border-slate-100 text-slate-300'
                           }`}>
                             {isCompleted ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" /> : <span className="text-sm sm:text-base font-black">{stageNum}</span>}
                           </div>
                           <p className={`mt-4 text-[10px] sm:text-xs font-bold whitespace-nowrap ${isCurrent ? 'text-indigo-700' : isFuture ? 'text-slate-400' : 'text-slate-700'}`}>
                             {t(`stage_${stageNum}` as any)}
                           </p>
                           {isCurrent && stageNum === 1 && (
                             <div className="absolute top-16 left-0 sm:left-1/2 sm:-translate-x-1/2 mt-3 w-48 sm:w-52 text-xs text-slate-600 bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-500/10 z-20">
                               <p className="font-bold text-indigo-900 mb-2 border-b border-indigo-100 pb-1.5 text-center">Current Focus:</p>
                               <ul className="list-disc pl-4 space-y-1.5 font-medium">
                                 <li>ወንጌለ ዮሐንስ</li>
                                 <li>ውዳሴ ማርያም</li>
                                 <li>አንቀጸ ብርሃን</li>
                                 <li>ይወድስዋ መላእክት</li>
                               </ul>
                             </div>
                           )}
                         </div>
                       </div>
                     )
                   })}
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showPhotoPopup && student.photo_url && (
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
              <img src={student.photo_url} alt={`${student.first_name}`} className="max-w-full max-h-[85vh] object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
