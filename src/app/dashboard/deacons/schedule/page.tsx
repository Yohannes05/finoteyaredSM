"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Cross, CheckCircle2, XCircle, UserPlus, UserX, RotateCcw, FileText } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { getTodayEthioDate } from "@/lib/ethiopian-date"

const ETHIOPIAN_MONTHS = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"
]

const ETHIOPIAN_MONTHS_EN = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miyazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagumen"
]

interface ScheduleEntry {
  id: string
  deacon_id: string
  service_date: string
  status: string
  notes: string
  deacon_name?: string
}

export default function SchedulePage() {
  const { t, language } = useLanguage()
  const today = getTodayEthioDate()
  const todayParts = today.split('-')

  const [currentYear, setCurrentYear] = useState(parseInt(todayParts[0]))
  const [currentMonth, setCurrentMonth] = useState(parseInt(todayParts[1]))
  const [selectedDate, setSelectedDate] = useState(today)
  const [deacons, setDeacons] = useState<any[]>([])
  const [schedules, setSchedules] = useState<Record<string, ScheduleEntry[]>>({})

  const [isSaving, setIsSaving] = useState(false)

  // Assignment panel state
  const [deaconsNeeded, setDeaconsNeeded] = useState(1)
  const [assignmentsForDate, setAssignmentsForDate] = useState<any[]>([])

  const monthsList = language === 'am' ? ETHIOPIAN_MONTHS : ETHIOPIAN_MONTHS_EN

  const daysInMonth = currentMonth === 13 ? 6 : 30


  // Load deacons and schedules (deacons are students with is_deacon = true)
  useEffect(() => {
    async function loadData() {
      const { data: deaconsData } = await supabase.from('students').select('*').eq('is_deacon', true).eq('status', 'active').order('created_at', { ascending: true })
      if (deaconsData) setDeacons(deaconsData)

      // Load all schedules for this month
      const monthStr = String(currentMonth).padStart(2, '0')
      const yearStr = String(currentYear)
      const monthStart = `${yearStr}-${monthStr}-01`
      const monthEnd = `${yearStr}-${monthStr}-${daysInMonth}`

      const { data: schedulesData } = await supabase
        .from('deacon_schedules')
        .select('*, students!inner(first_name, last_name)')
        .gte('service_date', monthStart)
        .lte('service_date', monthEnd)
        .order('service_date', { ascending: true })

      if (schedulesData) {
        const grouped: Record<string, ScheduleEntry[]> = {}
        schedulesData.forEach((s: any) => {
          const date = s.service_date
          if (!grouped[date]) grouped[date] = []
          grouped[date].push({
            id: s.id,
            deacon_id: s.deacon_id,
            service_date: s.service_date,
            status: s.status,
            notes: s.notes || '',
            deacon_name: `${s.students?.first_name || ''} ${s.students?.last_name || ''}`
          })
        })
        setSchedules(grouped)
      }
    }
    loadData()
  }, [currentYear, currentMonth, daysInMonth])

  // Load assignments when selected date changes
  useEffect(() => {
    const dateAssignments = schedules[selectedDate] || []
    setAssignmentsForDate(dateAssignments)
    setDeaconsNeeded(Math.max(1, dateAssignments.length || 1))
  }, [selectedDate, schedules])

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction
    let newYear = currentYear
    if (newMonth < 1) { newMonth = 13; newYear-- }
    else if (newMonth > 13) { newMonth = 1; newYear++ }
    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
  }

  const getDateString = (day: number) => {
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isToday = (day: number) => getDateString(day) === today

  // Get the available deacons sorted by fair rotation (those who served longest ago first)
  const getAvailableDeacons = useCallback(() => {
    const assignedIds = new Set(assignmentsForDate.map(a => a.deacon_id))

    return deacons
      .filter(d => !assignedIds.has(d.id))
      .map(d => {
        // Find when they last served
        const allServices = Object.values(schedules).flat()
        const lastService = allServices
          .filter(s => s.deacon_id === d.id && s.status === 'served')
          .sort((a, b) => b.service_date.localeCompare(a.service_date))[0]

        const totalServed = allServices.filter(s => s.deacon_id === d.id && s.status === 'served').length

        return {
          ...d,
          lastServiceDate: lastService?.service_date || null,
          totalServed
        }
      })
      .sort((a, b) => {
        // Sort by those who served longest ago first (fair rotation)
        if (!a.lastServiceDate && !b.lastServiceDate) return a.totalServed - b.totalServed
        if (!a.lastServiceDate) return -1
        if (!b.lastServiceDate) return 1
        return a.lastServiceDate.localeCompare(b.lastServiceDate)
      })
  }, [deacons, assignmentsForDate, schedules])

  const assignDeacon = async (deacon: any) => {
    const newAssignment = {
      deacon_id: deacon.id,
      deacon_name: `${deacon.first_name} ${deacon.last_name}`,
      status: 'scheduled',
      notes: ''
    }
    setAssignmentsForDate(prev => [...prev, newAssignment as any])
  }

  const removeAssignment = (index: number) => {
    setAssignmentsForDate(prev => prev.filter((_, i) => i !== index))
  }

  const updateAssignmentNote = (index: number, note: string) => {
    setAssignmentsForDate(prev => prev.map((a, i) =>
      i === index ? { ...a, notes: note } : a
    ))
  }

  const markAsServed = (index: number) => {
    setAssignmentsForDate(prev => prev.map((a, i) =>
      i === index ? { ...a, status: 'served' } : a
    ))
  }

  const markAsCancelled = (index: number) => {
    setAssignmentsForDate(prev => prev.map((a, i) =>
      i === index ? { ...a, status: 'cancelled', notes: a.notes || 'Sick / Unavailable' } : a
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Delete existing schedules for this date
      await supabase.from('deacon_schedules').delete().eq('service_date', selectedDate)

      // Insert new schedules
      if (assignmentsForDate.length > 0) {
        const records = assignmentsForDate.map(a => ({
          deacon_id: a.deacon_id,
          service_date: selectedDate,
          status: a.status || 'scheduled',
          notes: a.notes || ''
        }))

        const { error } = await supabase.from('deacon_schedules').insert(records)
        if (error) throw error
      }

      toast.success(`${t('schedule_save_success')} ${selectedDate}`)

      // Refresh schedules
      const { data: updatedSchedules } = await supabase
        .from('deacon_schedules')
        .select('*, students!inner(first_name, last_name)')
        .gte('service_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
        .lte('service_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-${daysInMonth}`)

      if (updatedSchedules) {
        const grouped: Record<string, ScheduleEntry[]> = {}
        updatedSchedules.forEach((s: any) => {
          const date = s.service_date
          if (!grouped[date]) grouped[date] = []
          grouped[date].push({
            id: s.id,
            deacon_id: s.deacon_id,
            service_date: s.service_date,
            status: s.status,
            notes: s.notes || '',
            deacon_name: `${s.students?.first_name || ''} ${s.students?.last_name || ''}`
          })
        })
        setSchedules(grouped)
      }
    } catch (err: any) {
      toast.error(err.message || t('schedule_save_error'))
    } finally {
      setIsSaving(false)
    }
  }

  const getDayAssignments = (day: number) => {
    const dateStr = getDateString(day)
    return schedules[dateStr] || []
  }

  const getDayStatusColor = (day: number) => {
    const dayAssignments = getDayAssignments(day)
    if (dayAssignments.length === 0) return 'bg-white'
    const allServed = dayAssignments.every(a => a.status === 'served')
    const hasScheduled = dayAssignments.some(a => a.status === 'scheduled')
    if (allServed) return 'bg-emerald-50 border-emerald-200'
    if (hasScheduled) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  const availableDeacons = getAvailableDeacons()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('schedule_title')}</h2>
        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-sm border border-indigo-100">
           <Cross className="h-3 w-3 mr-1" /> {deacons.length} {t('nav_deacons')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card className="shadow-md border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div className="text-center">
                  <CardTitle className="text-lg font-bold text-slate-800">
                    {monthsList[currentMonth - 1]} {currentYear}
                  </CardTitle>
                </div>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1
                  const dateStr = getDateString(day)
                  const dayAssignments = getDayAssignments(day)
                  const isSelected = dateStr === selectedDate
                  const isCurrentDay = isToday(day)

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`relative min-h-[80px] sm:min-h-[95px] rounded-xl border-2 transition-all p-1.5 text-left
                        ${isSelected ? 'border-indigo-500 bg-indigo-50/50 shadow-md' : isCurrentDay ? 'border-indigo-300 bg-indigo-50/30' : getDayStatusColor(day) + ' border-slate-100 hover:border-indigo-200 hover:shadow-sm'}
                      `}
                    >
                      <span className={`text-xs font-bold ${isCurrentDay ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayAssignments.slice(0, 3).map((a, i) => (
                          <div
                            key={i}
                            className={`px-1 py-0.5 rounded ${
                              a.status === 'served' ? 'bg-emerald-100 text-emerald-800' :
                              a.status === 'cancelled' ? 'bg-red-100 text-red-800 line-through' :
                              'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            <div className="text-[8px] font-bold truncate leading-tight">
                              {a.deacon_name?.split(' ')[0]}
                            </div>
                            {a.notes && (
                              <div className="text-[7px] italic opacity-75 truncate leading-tight mt-px">
                                {a.notes}
                              </div>
                            )}
                          </div>
                        ))}
                        {dayAssignments.length > 3 && (
                          <div className="text-[8px] text-slate-400 font-bold">+{dayAssignments.length - 3} more</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Panel */}
        <div className="lg:col-span-1">
          <Card className="shadow-md border-slate-200 h-full">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Calendar className="h-4 w-4 text-indigo-500" />
                {selectedDate}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Deacons Needed */}
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('schedule_deacons_needed')}</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={deaconsNeeded}
                  onChange={(e) => setDeaconsNeeded(parseInt(e.target.value) || 1)}
                  className="h-10 rounded-xl mt-1"
                />
              </div>

              {/* Current Assignments */}
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  {t('schedule_current')} ({assignmentsForDate.length}/{deaconsNeeded})
                </Label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {assignmentsForDate.length === 0 ? (
                    <p className="text-sm text-slate-400 italic py-4 text-center">{t('schedule_no_assignments')}</p>
                  ) : (
                    assignmentsForDate.map((a, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-2.5 rounded-xl border ${
                          a.status === 'served' ? 'bg-emerald-50 border-emerald-200' :
                          a.status === 'cancelled' ? 'bg-red-50 border-red-200' :
                          'bg-indigo-50 border-indigo-100'
                        }`}
                      >
                        {/* Deacon name + action buttons */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Cross className={`h-3 w-3 shrink-0 ${
                              a.status === 'served' ? 'text-emerald-600' :
                              a.status === 'cancelled' ? 'text-red-600' :
                              'text-indigo-600'
                            }`} />
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {a.deacon_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {a.status === 'scheduled' && (
                              <>
                                <button
                                  onClick={() => markAsServed(idx)}
                                  className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                                  title={t('schedule_mark_served')}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => markAsCancelled(idx)}
                                  className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                  title={t('schedule_mark_cancelled')}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => removeAssignment(idx)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Per-deacon notes input */}
                        {a.status === 'scheduled' && (
                          <div className="relative">
                            <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                              placeholder={t('schedule_notes_placeholder')}
                              value={a.notes || ''}
                              onChange={(e) => updateAssignmentNote(idx, e.target.value)}
                              className="h-8 pl-8 rounded-lg text-xs border-slate-200 bg-white/60 focus:bg-white transition-all"
                            />
                          </div>
                        )}

                        {/* Show note as text when not scheduled */}
                        {(a.status === 'served' || a.status === 'cancelled') && a.notes && (
                          <div className="flex items-center gap-1.5 px-1">
                            <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="text-[11px] text-slate-500 italic truncate">{a.notes}</span>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Available Deacons (sorted by fair rotation) */}
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  {t('schedule_available')} ({t('schedule_rotation_queue')})
                </Label>
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                  {availableDeacons.length === 0 ? (
                    <p className="text-sm text-slate-400 italic py-4 text-center">{t('schedule_no_available')}</p>
                  ) : (
                    availableDeacons.map((d) => (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                        onClick={() => assignDeacon(d)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Cross className="h-3 w-3 text-indigo-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{d.first_name} {d.last_name}</p>
                            <p className="text-[10px] text-slate-400">
                              {d.lastServiceDate 
                                ? `${t('schedule_last_served')}: ${d.lastServiceDate}`
                                : t('schedule_not_yet_served')}
                              {' · '}{d.totalServed} {t('schedule_times_served')}
                            </p>
                          </div>
                        </div>
                        <UserPlus className="h-4 w-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 font-bold mt-4"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    {t('schedule_saving')}
                  </div>
                ) : t('schedule_save')}
              </Button>

              {/* Legend */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-indigo-100 border border-indigo-200" /> {t('schedule_scheduled')}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-emerald-100 border border-emerald-200" /> {t('schedule_served')}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-red-100 border border-red-200" /> {t('schedule_cancelled')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
