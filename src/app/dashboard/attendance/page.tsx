"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Clock, Calendar } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { EthioDatePicker } from "@/components/ui/ethio-date-picker"
import { getTodayEthioDate } from "@/lib/ethiopian-date"

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(getTodayEthioDate())
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const { data: studentsData } = await supabase.from('students').select('id, first_name, last_name').eq('status', 'active')
      if (studentsData) setStudents(studentsData)

      const { data: existingAttendance } = await supabase.from('attendance').select('student_id, status').eq('date', selectedDate)
      if (existingAttendance) {
        const mapping: Record<string, string> = {}
        existingAttendance.forEach(a => mapping[a.student_id] = a.status)
        setAttendanceData(mapping)
      } else {
        setAttendanceData({})
      }
      setIsLoading(false)
    }
    fetchData()
  }, [selectedDate])

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const records = Object.keys(attendanceData).map(studentId => ({
      student_id: studentId,
      date: selectedDate,
      status: attendanceData[studentId]
    }))

    try {
      await supabase.from('attendance').delete().eq('date', selectedDate)

      if (records.length > 0) {
        const { error } = await supabase.from('attendance').insert(records)
        if (!error) {
          toast.success(`${t('attendance_success')} ${selectedDate}`)
        } else {
          toast.error("Error saving: " + error.message)
        }
      } else {
        toast.info(t('attendance_no_records'))
      }
    } catch {
      toast.error(t('attendance_error'))
    } finally {
      setIsSaving(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.08 } }
  }
  const itemVariants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            {t('attendance_title')}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-500 mt-1.5 font-medium">
            {t('attendance_roster_subtitle')}
          </motion.p>
        </div>
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
            <EthioDatePicker
              value={selectedDate}
              onChange={(val) => setSelectedDate(val)}
            />
          </div>
        </motion.div>
      </div>

      <Card className="shadow-md border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">{t('attendance_roster')}</CardTitle>
              <p className="text-sm text-slate-500">{t('attendance_roster_subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search student..."
                className="h-9 w-full sm:w-64 rounded-lg bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allPresent = { ...attendanceData }
                  students.forEach(s => allPresent[s.id] = 'present')
                  setAttendanceData(allPresent)
                }}
                className="whitespace-nowrap h-9 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Mark All Present
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left bg-slate-50/30">
                  <th className="py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">{t('attendance_col_name')}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 uppercase tracking-wider text-[10px] text-right">{t('attendance_col_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {students.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())).map((s, idx) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-slate-900">{s.first_name} {s.last_name}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <StatusButton
                            active={attendanceData[s.id] === 'present'}
                            onClick={() => handleStatusChange(s.id, 'present')}
                            variant="present"
                            label={t('attendance_present')}
                            icon={<CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                          />
                          <StatusButton
                            active={attendanceData[s.id] === 'late'}
                            onClick={() => handleStatusChange(s.id, 'late')}
                            variant="late"
                            label={t('attendance_late')}
                            icon={<Clock className="h-3.5 w-3.5 mr-1" />}
                          />
                          <StatusButton
                            active={attendanceData[s.id] === 'absent'}
                            onClick={() => handleStatusChange(s.id, 'absent')}
                            variant="absent"
                            label={t('attendance_absent')}
                            icon={<XCircle className="h-3.5 w-3.5 mr-1" />}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {!isLoading && students.length === 0 && (
                  <tr><td colSpan={2} className="py-12 text-center text-slate-500 italic">{t('attendance_no_students')}</td></tr>
                )}
                {isLoading && (
                  <tr><td colSpan={2} className="py-12 text-center text-slate-400 animate-pulse">{t('attendance_loading')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="px-10 h-11 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95">
              {isSaving ? t('attendance_saving') : t('attendance_save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatusButton({ active, onClick, variant, label, icon }: any) {
  const styles: Record<string, string> = {
    present: active ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30",
    late: active ? "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-amber-200 hover:bg-amber-50/30",
    absent: active ? "bg-red-500 text-white border-red-500 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-red-200 hover:bg-red-50/30",
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-200 ${styles[variant]}`}
    >
      {icon}{label}
    </button>
  )
}
