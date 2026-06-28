"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, CalendarCheck, TrendingUp, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/LanguageContext"

export default function Dashboard() {
  const [studentsCount, setStudentsCount] = useState(0)
  const [boysCount, setBoysCount] = useState(0)
  const [activeStudentsCount, setActiveStudentsCount] = useState(0)
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
            // For older records where topics might be arbitrary
            if (!newTopicCounts["Other"]) newTopicCounts["Other"] = 0;
            newTopicCounts["Other"]++
          }
        }
      })
      
      setStudentsCount(studentsArray.length)
      setBoysCount(totalBoys)
      setDemographics(newDemographics)
      setStagesCount(newStagesCount)
      setTopicCounts(newTopicCounts)

      const { count: activeCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active')
      setActiveStudentsCount(activeCount || 0)


      setIsLoading(false)
    }
    loadData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
  }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('dashboard_title')}</h2>
          <p className="text-slate-500 mt-1">{t('dashboard_subtitle')}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-sm border border-emerald-100">
           <TrendingUp className="h-3 w-3 mr-1" /> System Active
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-pink-50/50 rounded-t-xl">
              <CardTitle className="text-base font-bold text-pink-700">Children {"(< 13)"}</CardTitle>
              <div className="text-xs font-bold bg-pink-100 text-pink-700 px-2 py-1 rounded-full">{demographics.children.boys + demographics.children.girls} Total</div>
            </CardHeader>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500"></div><span className="font-semibold text-slate-600">{t('dashboard_boys' as any)}</span></div>
                <span className="font-bold text-slate-900">{demographics.children.boys}</span>
              </div>
              <div className="h-px w-full bg-slate-100 my-2"></div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-pink-500"></div><span className="font-semibold text-slate-600">{t('dashboard_girls' as any)}</span></div>
                <span className="font-bold text-slate-900">{demographics.children.girls}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-indigo-50/50 rounded-t-xl">
              <CardTitle className="text-base font-bold text-indigo-700">Teens {"(13 - 17)"}</CardTitle>
              <div className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{demographics.teens.boys + demographics.teens.girls} Total</div>
            </CardHeader>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500"></div><span className="font-semibold text-slate-600">{t('dashboard_boys' as any)}</span></div>
                <span className="font-bold text-slate-900">{demographics.teens.boys}</span>
              </div>
              <div className="h-px w-full bg-slate-100 my-2"></div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-pink-500"></div><span className="font-semibold text-slate-600">{t('dashboard_girls' as any)}</span></div>
                <span className="font-bold text-slate-900">{demographics.teens.girls}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-50/50 rounded-t-xl">
              <CardTitle className="text-base font-bold text-amber-700">Adults {"(18+)"}</CardTitle>
              <div className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{demographics.adults.boys + demographics.adults.girls} Total</div>
            </CardHeader>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500"></div><span className="font-semibold text-slate-600">{t('dashboard_boys' as any)}</span></div>
                <span className="font-bold text-slate-900">{demographics.adults.boys}</span>
              </div>
              <div className="h-px w-full bg-slate-100 my-2"></div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-pink-500"></div><span className="font-semibold text-slate-600">{t('dashboard_girls' as any)}</span></div>
                <span className="font-bold text-slate-900">{demographics.adults.girls}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{t('dashboard_total_students')}</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                  <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{studentsCount}</div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{boysCount} {t('dashboard_boys' as any)} &bull; {studentsCount - boysCount} {t('dashboard_girls' as any)}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{t('dashboard_active_students')}</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                  <Users className="h-5 w-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{activeStudentsCount}</div>
              <p className="text-xs text-slate-500 mt-1">{t('dashboard_currently_enrolled')}</p>
            </CardContent>
          </Card>
        </motion.div>



        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{t('dashboard_attendance_check')}</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                  <CalendarCheck className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{t('common_live')}</div>
              <p className="text-xs text-slate-500 mt-1">{t('dashboard_mark_today')}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 rounded-t-xl">
            <CardTitle className="text-lg flex items-center font-bold text-slate-800">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
              {t('dashboard_stages_overview' as any) || "Stages Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Array.from({length: 10}).map((_, idx) => {
                const stage = idx + 1;
                const count = stagesCount[stage] || 0;
                return (
                  <div key={stage} className="bg-white border text-center border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-bold text-slate-500 mb-1 line-clamp-1" title={t(`stage_${stage}` as any)}>
                      {t(`stage_${stage}` as any)}
                    </p>
                    <p className="text-2xl font-black text-indigo-600">{count}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Students</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-slate-200">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-4 rounded-t-xl">
            <CardTitle className="text-lg flex items-center font-bold text-indigo-800">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
              {t('dashboard_stage1_subjects' as any)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Object.entries(topicCounts).map(([topic, count], idx) => (
                  <div key={idx} className="bg-white border text-center border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-bold text-slate-500 mb-1 line-clamp-1" title={topic}>
                      {topic}
                    </p>
                    <p className="text-2xl font-black text-indigo-600">{count}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Students</p>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
