"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, BookOpen, Cross, GraduationCap, UserCheck, Activity, CheckCircle2, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/LanguageContext"

export default function Dashboard() {
  const [studentsCount, setStudentsCount] = useState(0)
  const [boysCount, setBoysCount] = useState(0)
  const [activeStudentsCount, setActiveStudentsCount] = useState(0)
  const [deaconsCount, setDeaconsCount] = useState(0)
  const [acceptedDeaconsCount, setAcceptedDeaconsCount] = useState(0)
  const [girlsCount, setGirlsCount] = useState(0)
  const [demographics, setDemographics] = useState({
    children: { boys: 0, girls: 0 },
    teens: { boys: 0, girls: 0 },
    adults: { boys: 0, girls: 0 }
  })
  const [stagesCount, setStagesCount] = useState<Record<number, number>>({})
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function loadData() {
      const { data: studentsData } = await supabase.from('students').select('gender, age, learning_stage, learning_topic')
      const studentsArray = studentsData || []

      let totalBoys = 0
      let totalGirls = 0
      const newDemographics = {
        children: { boys: 0, girls: 0 },
        teens: { boys: 0, girls: 0 },
        adults: { boys: 0, girls: 0 }
      }
      const newStagesCount: Record<number, number> = {}
      for (let i = 1; i <= 10; i++) newStagesCount[i] = 0

      const newTopicCounts: Record<string, number> = {
        "ወንጌለ ዮሐንስ": 0,
        "ውዳሴ ማርያም": 0,
        "አንቀጸ ብርሃን": 0,
        "ይወድስዋ መላእክት": 0,
        "መልክዐ ማርያም / መልክዐ ኢየሱስ": 0
      }

      studentsArray.forEach(s => {
        const isBoy = s.gender === 'male'
        if (isBoy) totalBoys++
        else totalGirls++

        const age = s.age || 0
        if (age < 13) {
          if (isBoy) newDemographics.children.boys++
          else newDemographics.children.girls++
        } else if (age >= 13 && age <= 17) {
          if (isBoy) newDemographics.teens.boys++
          else newDemographics.teens.girls++
        } else {
          if (isBoy) newDemographics.adults.boys++
          else newDemographics.adults.girls++
        }

        const stage = s.learning_stage || 1
        if (stage >= 1 && stage <= 10) {
          if (!newStagesCount[stage]) newStagesCount[stage] = 0
          newStagesCount[stage]++
        }

        if (stage === 1 && s.learning_topic) {
          if (newTopicCounts[s.learning_topic] !== undefined) {
            newTopicCounts[s.learning_topic]++
          } else {
            if (!newTopicCounts["Other"]) newTopicCounts["Other"] = 0;
            newTopicCounts["Other"]++
          }
        }
      })

      setStudentsCount(studentsArray.length)
      setBoysCount(totalBoys)
      setGirlsCount(totalGirls)
      setDemographics(newDemographics)
      setStagesCount(newStagesCount)
      setTopicCounts(newTopicCounts)

      const { count: activeCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active')
      setActiveStudentsCount(activeCount || 0)

      const { count: deaconsCountData } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_deacon', true)
      setDeaconsCount(deaconsCountData || 0)

      const { count: acceptedDeaconsCountData } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_deacon', true).eq('deacon_accepted', true)
      setAcceptedDeaconsCount(acceptedDeaconsCountData || 0)

      setIsLoading(false)
    }
    loadData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.08 } }
  }
  const itemVariants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } }

  const maxStageCount = Math.max(...Object.values(stagesCount), 1)

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const activePercent = studentsCount > 0 ? Math.round((activeStudentsCount / studentsCount) * 100) : 0

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            {t('dashboard_title')}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-500 mt-1.5 font-medium">
            {t('dashboard_subtitle')}
          </motion.p>
        </div>
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {t('common_live')}
          </div>
        </motion.div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants} className="group">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50/50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100 mb-4">
                <Users className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('dashboard_total_students')}</p>
              <p className="text-3xl font-black text-slate-900">{studentsCount}</p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> {boysCount} {t('dashboard_boys' as any)}
                <span className="mx-1">·</span>
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500" /> {girlsCount} {t('dashboard_girls' as any)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="group">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 mb-4">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('dashboard_active_students')}</p>
              <p className="text-3xl font-black text-slate-900">{activeStudentsCount}</p>
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${activePercent}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">{activePercent}% {t('dashboard_currently_enrolled')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="group">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-50/50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-100 mb-4">
                <Cross className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('dashboard_deacons')}</p>
              <p className="text-3xl font-black text-slate-900">{deaconsCount}</p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">{t('dashboard_all_deacons')}</p>
              {/* Accepted vs Not Accepted breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t('deacon_accepted_yes')}
                  </span>
                  <span className="font-bold text-slate-900">{acceptedDeaconsCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" />
                    {t('deacon_accepted_no')}
                  </span>
                  <span className="font-bold text-slate-900">{deaconsCount - acceptedDeaconsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="group">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-50/50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-100 mb-4">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('dashboard_attendance_check')}</p>
              <p className="text-3xl font-black text-slate-900">{t('common_live')}</p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">{t('dashboard_mark_today')}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Demographic Breakdown */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
          {[
            { label: "Children (< 13)", data: demographics.children, badgeClass: "bg-pink-50 text-pink-700 border-pink-100" },
            { label: "Teens (13 - 17)", data: demographics.teens, badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-100" },
            { label: "Adults (18+)", data: demographics.adults, badgeClass: "bg-amber-50 text-amber-700 border-amber-100" }
          ].map((group, gi) => {
            const total = group.data.boys + group.data.girls
            const boyPercent = total > 0 ? (group.data.boys / total) * 100 : 0
            return (
              <div key={gi} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700">{group.label}</h3>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${group.badgeClass}`}>
                    {total} Total
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" /> {t('dashboard_boys' as any)}
                      </span>
                      <span className="font-bold text-slate-900">{group.data.boys}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${boyPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-pink-500" /> {t('dashboard_girls' as any)}
                      </span>
                      <span className="font-bold text-slate-900">{group.data.girls}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{ width: `${100 - boyPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Stages Overview */}
      <motion.div variants={itemVariants}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-transparent">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              {t('dashboard_stages_overview' as any) || "Stages Overview"}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Array.from({length: 10}).map((_, idx) => {
                const stage = idx + 1
                const count = stagesCount[stage] || 0
                const barWidth = maxStageCount > 0 ? (count / maxStageCount) * 100 : 0
                return (
                  <div key={stage} className="group bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-default">
                    <p className="text-[10px] font-bold text-slate-500 mb-2 line-clamp-1 leading-relaxed" title={t(`stage_${stage}` as any)}>
                      {t(`stage_${stage}` as any)}
                    </p>
                    <p className="text-2xl font-black text-indigo-600 mb-2">{count}</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-700 group-hover:from-indigo-500 group-hover:to-purple-600"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Students</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stage 1 Subjects */}
      <motion.div variants={itemVariants}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-transparent">
            <h3 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              {t('dashboard_stage1_subjects' as any)}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(topicCounts).map(([topic, count], idx) => {
                const maxTopicCount = Math.max(...Object.values(topicCounts), 1)
                const barWidth = (count / maxTopicCount) * 100
                return (
                  <div key={idx} className="group bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-default">
                    <p className="text-[10px] font-bold text-slate-500 mb-2 line-clamp-2 leading-relaxed" title={topic}>
                      {topic}
                    </p>
                    <p className="text-2xl font-black text-indigo-600 mb-2">{count}</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-700 group-hover:from-indigo-500 group-hover:to-purple-600"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Students</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
