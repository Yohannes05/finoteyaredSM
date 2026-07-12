"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, BookOpen, Calendar, Activity, X, User, CheckCircle2, Cross, Trash2, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { toast } from "sonner"

export default function StudentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const studentId = params.id
  const [student, setStudent] = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPhotoPopup, setShowPhotoPopup] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useLanguage()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Delete photo from storage if exists
      if (student?.photo_url) {
        const photoPath = student.photo_url.split('/').pop()
        if (photoPath) {
          await supabase.storage.from('avatars').remove([photoPath])
        }
      }

      // Deletes student; CASCADE handles attendance, payments, and deacon_schedules
      const { error } = await supabase.from('students').delete().eq('id', studentId)
      if (error) throw error
      toast.success(t('delete_success_student'))
      router.push('/dashboard/students')
    } catch (err: any) {
      toast.error(err.message || t('delete_error'))
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

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
                <img src={student.photo_url} alt={`${student.first_name}`} className="h-full w-full object-cover" loading="lazy" />
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
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">{student.first_name} {student.last_name}</h2>
              {student.is_deacon && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                  <Cross className="h-3 w-3" />
                  {t('nav_deacons')}
                </span>
              )}
            </div>
            <div className="flex items-center justify-center sm:justify-start text-sm font-semibold text-slate-500 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-flex border border-slate-200/50 shadow-sm">
              <Calendar className="h-4 w-4 mr-2 text-indigo-500" /> {t('student_details_enrolled')} {student.enrollment_date}
            </div>
          </div>
          
          <div className="shrink-0 mt-2 sm:mt-0 w-full sm:w-auto flex items-center gap-2">
            <button onClick={() => router.push(`/dashboard/students/${studentId}/edit`)} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2">
              <User className="h-4 w-4" /> {t('student_edit_profile' as any)}
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-red-600 hover:bg-red-50 border-2 border-red-200 hover:border-red-300 shadow-lg shadow-red-100/50 transition-all active:scale-95 flex items-center justify-center gap-2">
              <Trash2 className="h-4 w-4" />
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
                     <p className="text-sm font-bold text-slate-900">{student.learning_topic || t(`stage_${student.learning_stage || 1}` as any)}</p>
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

          <Card className="border-slate-200/60 shadow-sm bg-white/80 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100/50 pb-4 bg-slate-50/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                {t('student_details_stage' as any) || "Learning Track Progress"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto p-4 sm:p-6 scrollbar-hide py-10">
                <div className="flex min-w-max gap-4 items-center">
                  {Array.from({length: 10}).map((_, idx) => {
                    const stageNum = idx + 1;
                    const isCompleted = stageNum < (student.learning_stage || 1);
                    const isCurrent = stageNum === (student.learning_stage || 1);
                    const isFuture = stageNum > (student.learning_stage || 1);
                    return (
                      <div key={stageNum} className="flex items-center">
                        {idx !== 0 && (
                          <div className={`h-1 w-6 sm:w-12 mx-1.5 sm:mx-2 rounded-full transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${isCompleted ? 'bg-indigo-500' : 'bg-slate-200'}`} />
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
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Current Focus section - rendered below the scrollable stages, not clipped */}
              <div className="px-4 sm:px-6 pb-6">
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    <p className="font-bold text-indigo-900 text-sm sm:text-base">
                      {t('student_details_current_focus' as any) || "Current Focus"}: {t(`stage_${student.learning_stage || 1}` as any)}
                    </p>
                  </div>
                  {(student.learning_stage || 1) === 1 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {["ወንጌለ ዮሐንስ", "ውዳሴ ማርያም", "አንቀጸ ብርሃን", "ይወድስዋ መላእክት"].map((subject, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm sm:text-base text-slate-700 font-medium bg-white/80 rounded-xl px-3.5 py-2.5 border border-indigo-50 shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                          {subject}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-700 font-medium bg-white/80 rounded-xl px-3.5 py-2.5 border border-indigo-50 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                      {student.learning_topic || `${t('student_details_no_topic' as any)} — ${t('student_details_no_topic_hint' as any)}`}
                    </div>
                  )}
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
              <img src={student.photo_url} alt={`${student.first_name}`} className="max-w-full max-h-[85vh] object-contain" loading="lazy" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
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
                    {t('delete_confirm_title').replace('{{name}}', `${student.first_name} ${student.last_name}`)}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {t('delete_confirm_message_student')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  {t('delete_cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
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
    </motion.div>
  )
}
