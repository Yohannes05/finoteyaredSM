"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, History, PlusCircle, CheckCircle2, AlertCircle, Search, ChevronDown, X } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { EthioDatePicker } from "@/components/ui/ethio-date-picker"
import { getTodayEthioDate } from "@/lib/ethiopian-date"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()
  const [formData, setFormData] = useState({ student_id: "", amount: "20", extra_contribution: "0", payment_date: getTodayEthioDate(), for_month: "", status: "paid" })
  const [totalReceived, setTotalReceived] = useState("")
  const [paymentsSum, setPaymentsSum] = useState(0)
  const [paymentsExtraSum, setPaymentsExtraSum] = useState(0)
  const [paymentsTodaySum, setPaymentsTodaySum] = useState(0)
  const [paymentsTodayExtraSum, setPaymentsTodayExtraSum] = useState(0)
  const [historySearchQuery, setHistorySearchQuery] = useState("")
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState<any>(null)
  const MONTHLY_FEE = 20
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  const selectedStudent = students.find(s => s.id === formData.student_id)

  const fetchPayments = async () => {
    const { data } = await supabase.from('payments').select('*, students(first_name, last_name)').order('payment_date', { ascending: false })
    if(data) {
      setPayments(data)
      const sum = data.filter(p => p.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0)
      setPaymentsSum(sum)
      const extraSum = data.filter(p => p.status === 'paid').reduce((acc, curr) => acc + Number(curr.extra_contribution || 0), 0)
      setPaymentsExtraSum(extraSum)
      
      const today = getTodayEthioDate();
      const todaySum = data.filter(p => p.status === 'paid' && p.payment_date === today).reduce((acc, curr) => acc + Number(curr.amount), 0)
      setPaymentsTodaySum(todaySum)
      const todayExtraSum = data.filter(p => p.status === 'paid' && p.payment_date === today).reduce((acc, curr) => acc + Number(curr.extra_contribution || 0), 0)
      setPaymentsTodayExtraSum(todayExtraSum)
    }
  }

  const filteredPayments = payments.filter(p => {
    if (!historySearchQuery) return true;
    const name = `${p.students?.first_name} ${p.students?.last_name}`.toLowerCase()
    return name.includes(historySearchQuery.toLowerCase())
  })

  useEffect(() => {
    async function loadResources() {
      setIsLoading(true)
      const { data: s } = await supabase.from('students').select('id, first_name, last_name').eq('status', 'active')
      if(s) setStudents(s)
      await fetchPayments()
      setIsLoading(false)
    }
    loadResources()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.student_id) {
      toast.error(t('payments_select_student') || "Please select a student")
      return
    }
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('payments').insert([formData])
      if(!error) {
        toast.success(t('payments_success'))
        setFormData({ student_id: "", amount: "20", extra_contribution: "0", payment_date: getTodayEthioDate(), for_month: "", status: "paid" })
        setTotalReceived("")
        await fetchPayments()
      } else {
        toast.error("Error: " + error.message)
      }
    } catch {
      toast.error(t('payments_error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('payments_title')}</h2>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-sm border border-blue-100">
           <CreditCard className="h-3 w-3 mr-1" /> {t('payments_financial')}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{t('dashboard_total_revenue' as any) || 'Total Revenue'}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{t('currency_prefix' as any)}{paymentsSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}{t('currency_suffix' as any)}</span>
                    <span className="text-xs font-bold text-emerald-600">+{t('currency_prefix' as any)}{paymentsExtraSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}{t('currency_suffix' as any)} Extra</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{t('dashboard_daily_collection' as any) || 'Collections Today'}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{t('currency_prefix' as any)}{paymentsTodaySum.toLocaleString(undefined, { minimumFractionDigits: 2 })}{t('currency_suffix' as any)}</span>
                    <span className="text-xs font-bold text-emerald-600">+{t('currency_prefix' as any)}{paymentsTodayExtraSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}{t('currency_suffix' as any)} Extra</span>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4"
        >
          <Card className="shadow-md border-slate-200 sticky top-6">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-xl mb-4">
              <CardTitle className="flex items-center text-lg">
                <PlusCircle className="h-5 w-5 mr-2 text-blue-600" />
                {t('payments_record')}
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2 relative" ref={dropdownRef}>
                  <Label className="text-slate-600 font-semibold">{t('payments_student')}</Label>
                  <div className="relative">
                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <span className={formData.student_id ? "text-slate-900 line-clamp-1" : "text-slate-500"}>
                        {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : t('payments_select_student')}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </div>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl"
                        >
                          <div className="sticky top-0 bg-white p-2 border-b z-10">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                              <Input 
                                type="text" 
                                placeholder="Search name (e.g. ተማሪ)..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-slate-50"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="p-1">
                            {filteredStudents.length === 0 ? (
                              <div className="p-3 text-sm text-center text-slate-500">No students found</div>
                            ) : (
                              filteredStudents.map(s => (
                                <div 
                                  key={s.id}
                                  onClick={() => {
                                    setFormData({...formData, student_id: s.id})
                                    setIsDropdownOpen(false)
                                    setSearchQuery("")
                                  }}
                                  className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors ${formData.student_id === s.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                                >
                                  {s.first_name} {s.last_name}
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">{t('payments_total_received' as any)}</Label>
                  <Input 
                    required 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={totalReceived} 
                    onChange={(e) => {
                      const val = e.target.value
                      setTotalReceived(val)
                      const total = parseFloat(val) || 0
                      const extra = Math.max(0, total - MONTHLY_FEE)
                      const amount = total >= MONTHLY_FEE ? MONTHLY_FEE : total
                      setFormData(f => ({...f, amount: String(amount), extra_contribution: String(extra)}))
                    }}
                    className="h-11 rounded-xl" 
                    placeholder="e.g. 100" 
                  />
                </div>

                {totalReceived !== "" && (
                  <div className={`rounded-xl p-3 border text-sm space-y-1.5 ${
                    parseFloat(totalReceived) < MONTHLY_FEE 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">{t('payments_monthly_fee' as any)}</span>
                      <span className="font-bold text-slate-900">{t('currency_prefix' as any)}{MONTHLY_FEE}{t('currency_suffix' as any)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">{t('payments_extra_auto' as any)}</span>
                      <span className="font-bold text-emerald-700">{t('currency_prefix' as any)}{Math.max(0, (parseFloat(totalReceived)||0) - MONTHLY_FEE).toFixed(2)}{t('currency_suffix' as any)}</span>
                    </div>
                    {parseFloat(totalReceived) < MONTHLY_FEE && (
                      <div className="text-red-700 font-bold text-xs pt-1 border-t border-red-200">
                        {t('payments_underpayment' as any)} — {(MONTHLY_FEE - (parseFloat(totalReceived)||0)).toFixed(2)} {t('currency_suffix' as any) || 'Birr'} short
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">{t('payments_date')}</Label>
                  <EthioDatePicker 
                    value={formData.payment_date} 
                    onChange={(val) => setFormData({...formData, payment_date: val})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">{t('payments_month')}</Label>
                  <select required value={formData.for_month} onChange={(e: any) => setFormData({...formData, for_month: e.target.value})} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    <option value="" disabled>Select month...</option>
                    <option value="Meskerem / መስከረም">Meskerem / መስከረም</option>
                    <option value="Tikimt / ጥቅምት">Tikimt / ጥቅምት</option>
                    <option value="Hidar / ኅዳር">Hidar / ኅዳር</option>
                    <option value="Tahsas / ታኅሣሥ">Tahsas / ታኅሣሥ</option>
                    <option value="Tir / ጥር">Tir / ጥር</option>
                    <option value="Yekatit / የካቲት">Yekatit / የካቲት</option>
                    <option value="Megabit / መጋቢት">Megabit / መጋቢት</option>
                    <option value="Miyazia / ሚያዝያ">Miyazia / ሚያዝያ</option>
                    <option value="Ginbot / ግንቦት">Ginbot / ግንቦት</option>
                    <option value="Sene / ሰኔ">Sene / ሰኔ</option>
                    <option value="Hamle / ሐምሌ">Hamle / ሐምሌ</option>
                    <option value="Nehase / ነሐሴ">Nehase / ነሐሴ</option>
                    <option value="Pagumen / ጳጉሜን">Pagumen / ጳጉሜን</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">{t('payments_status')}</Label>
                  <select value={formData.status} onChange={(e: any) => setFormData({...formData, status: e.target.value})} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
                    <option value="paid">{t('payments_paid')}</option>
                    <option value="pending">{t('payments_pending')}</option>
                  </select>
                </div>
              </CardContent>
              <div className="px-6 pb-6 mt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl shadow-lg shadow-blue-100 bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 text-white font-bold">
                  {isSubmitting ? t('payments_processing') : t('payments_log')}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8"
        >
          <Card className="shadow-md border-slate-200 h-full overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center text-lg">
                <History className="h-5 w-5 mr-2 text-slate-600" />
                {t('payments_history')}
              </CardTitle>
              <div className="relative w-full sm:w-48 mt-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search student..." 
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm bg-white border-slate-200" 
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/30 border-b border-slate-100">
                    <tr>
                      <th className="py-4 px-6 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('payments_col_date')}</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('payments_col_student')}</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('payments_col_month')}</th>
                      <th className="py-4 px-6 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('payments_col_amount')}</th>
                      <th className="py-4 px-6 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Extra</th>
                      <th className="py-4 px-6 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('payments_col_status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                    {filteredPayments.length === 0 && !isLoading && (
                      <tr><td colSpan={6} className="py-12 text-center text-slate-500 italic">{t('payments_empty')}</td></tr>
                    )}
                    {isLoading && (
                      <tr><td colSpan={6} className="py-12 text-center text-slate-400 animate-pulse font-medium">{t('payments_loading')}</td></tr>
                    )}
                    {filteredPayments.map((p, idx) => (
                      <motion.tr 
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-6 text-slate-600 font-medium">{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td 
                          className="py-4 px-6 font-bold text-indigo-600 cursor-pointer hover:underline"
                          onClick={() => setSelectedHistoryStudent(p.students)}
                        >
                          {p.students?.first_name} {p.students?.last_name}
                        </td>
                        <td className="py-4 px-6 text-slate-600">{p.for_month}</td>
                        <td className="py-4 px-6 text-right font-bold text-slate-900">{t('currency_prefix' as any)}{Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}{t('currency_suffix' as any)}</td>
                        <td className="py-4 px-6 text-right text-emerald-600 font-bold">{t('currency_prefix' as any)}{Number(p.extra_contribution || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}{t('currency_suffix' as any)}</td>
                        <td className="py-4 px-6 text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-[10px] border tracking-wide shadow-sm transition-all ${
                            p.status === 'paid' 
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                              : 'text-amber-700 bg-amber-50 border-amber-100'
                          }`}>
                            {p.status === 'paid' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                            {p.status === 'paid' ? t('payments_paid') : t('payments_pending')}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
      <AnimatePresence>
        {selectedHistoryStudent && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedHistoryStudent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl bg-white overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {selectedHistoryStudent.first_name.charAt(0)}
                  </div>
                  {selectedHistoryStudent.first_name} {selectedHistoryStudent.last_name}&apos;s {t('student_payment_history_title' as any)}
                </h3>
                <button 
                  onClick={() => setSelectedHistoryStudent(null)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 rounded-lg">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('payments_col_date')}</th>
                      <th className="py-3 px-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('payments_col_month')}</th>
                      <th className="py-3 px-4 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('payments_col_amount')}</th>
                      <th className="py-3 px-4 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Extra</th>
                      <th className="py-3 px-4 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{t('payments_col_status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.filter(p => p.students?.first_name === selectedHistoryStudent.first_name && p.students?.last_name === selectedHistoryStudent.last_name).map(p => (
                      <tr key={p.id}>
                        <td className="py-4 px-4 text-slate-600">{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td className="py-4 px-4 font-bold text-slate-900">{p.for_month}</td>
                        <td className="py-4 px-4 text-right font-bold text-slate-900">{t('currency_prefix' as any)}{Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}{t('currency_suffix' as any)}</td>
                        <td className="py-4 px-4 text-right text-emerald-600 font-bold">{t('currency_prefix' as any)}{Number(p.extra_contribution || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}{t('currency_suffix' as any)}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-[10px] ${
                            p.status === 'paid' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-amber-700 bg-amber-50 border border-amber-100'
                          }`}>
                            {p.status === 'paid' ? <CheckCircle2 className="h-3 w-3 mr-1"/> : <AlertCircle className="h-3 w-3 mr-1"/>}
                            {p.status === 'paid' ? t('payments_paid') : t('payments_pending')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
