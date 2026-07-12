"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { UserPlus, Save, Cross } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { EthioDatePicker } from "@/components/ui/ethio-date-picker"
import { getTodayEthioDate } from "@/lib/ethiopian-date"
import { compressImage } from "@/lib/image"

export default function NewStudentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", age: "", academic_grade: "", gender: "male", phone: "", photo_url: "", learning_topic: "", learning_stage: 1, enrollment_date: getTodayEthioDate(), is_deacon: false, ordination_date: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let finalPhotoUrl = formData.photo_url

      if (imageFile) {
        // Compress image client-side before uploading (10MB → ~100KB)
        const compressedBlob = await compressImage(imageFile)
        const fileExt = 'jpg'
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, compressedBlob, { contentType: 'image/jpeg' })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        finalPhotoUrl = publicUrlData.publicUrl
      }

      const dataToInsert = {
        ...formData,
        photo_url: finalPhotoUrl,
        enrollment_date: formData.enrollment_date || null,
        ordination_date: formData.ordination_date || null,
        age: formData.age || null,
      }

      const { error } = await supabase.from('students').insert([dataToInsert])
      if(!error) {
        toast.success(t('new_student_success'))
        router.push('/dashboard/students')
      } else {
        toast.error("Error: " + error.message)
      }
    } catch (err: any) {
        toast.error(err.message || t('new_student_error'))
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('new_student_title')}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t('new_student_subtitle')}</p>
      </div>

      <Card className="shadow-xl border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 mb-6">
            <CardTitle className="flex items-center text-lg">
                <UserPlus className="h-5 w-5 mr-2 text-indigo-600" />
                {t('new_student_enrollment')}
            </CardTitle>
            <CardDescription>{t('new_student_fill')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('new_student_first_name')}</Label>
                <Input required placeholder="e.g. John" className="h-11 rounded-xl" value={formData.first_name} onChange={(e: any) => setFormData({...formData, first_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('new_student_last_name')}</Label>
                <Input required placeholder="e.g. Doe" className="h-11 rounded-xl" value={formData.last_name} onChange={(e: any) => setFormData({...formData, last_name: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('new_student_age')}</Label>
                <Input type="number" min="1" max="100" placeholder="e.g. 14" className="h-11 rounded-xl" value={formData.age} onChange={(e: any) => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('common_gender' as any)}</Label>
                <select required value={formData.gender} onChange={(e: any) => setFormData({...formData, gender: e.target.value})} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                  <option value="male">{t('gender_male' as any)}</option>
                  <option value="female">{t('gender_female' as any)}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('new_student_phone')}</Label>
                <Input required placeholder="+123 456 7890" className="h-11 rounded-xl" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('new_student_academic_grade' as any)}</Label>
                <Input placeholder="e.g. Grade 10" className="h-11 rounded-xl" value={formData.academic_grade} onChange={(e: any) => setFormData({...formData, academic_grade: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">
                  {t('new_student_topic')}
                  {formData.learning_stage !== 1 && <span className="text-slate-400 font-normal text-xs ml-2">(optional)</span>}
                </Label>
                {formData.learning_stage === 1 ? (
                  <select required value={formData.learning_topic} onChange={(e: any) => setFormData({...formData, learning_topic: e.target.value})} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                    <option value="" disabled>Select course...</option>
                    <option value="ወንጌለ ዮሐንስ">ወንጌለ ዮሐንስ</option>
                    <option value="ውዳሴ ማርያም">ውዳሴ ማርያም</option>
                    <option value="አንቀጸ ብርሃን">አንቀጸ ብርሃን</option>
                    <option value="ይወድስዋ መላእክት">ይወድስዋ መላእክት</option>
                    <option value="መልክዐ ማርያም / መልክዐ ኢየሱስ">መልክዐ ማርያም / መልክዐ ኢየሱስ</option>
                  </select>
                ) : (
                  <Input placeholder="Optional — e.g. General Studies" className="h-11 rounded-xl" value={formData.learning_topic} onChange={(e: any) => setFormData({...formData, learning_topic: e.target.value})} />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('new_student_stage' as any)}</Label>
                <select required value={formData.learning_stage} onChange={(e: any) => {
                  const newStage = parseInt(e.target.value);
                  setFormData({...formData, learning_stage: newStage, learning_topic: ""});
                }} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                  <option value={1}>{t('stage_1' as any)}</option>
                  <option value={2}>{t('stage_2' as any)}</option>
                  <option value={3}>{t('stage_3' as any)}</option>
                  <option value={4}>{t('stage_4' as any)}</option>
                  <option value={5}>{t('stage_5' as any)}</option>
                  <option value={6}>{t('stage_6' as any)}</option>
                  <option value={7}>{t('stage_7' as any)}</option>
                  <option value={8}>{t('stage_8' as any)}</option>
                  <option value={9}>{t('stage_9' as any)}</option>
                  <option value={10}>{t('stage_10' as any)}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Student Photo (optional) <span className="text-xs font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">Max 10MB</span></Label>
                <Input type="file" accept="image/*" className="h-[46px] rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer text-slate-500 pt-[7px]" onChange={(e: any) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0]
                    if (file.size > 10 * 1024 * 1024) {
                      toast.error("Photo must be less than 10MB")
                      e.target.value = ''
                      return
                    }
                    setImageFile(file)
                  }
                }} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Registration Date</Label>
                <EthioDatePicker 
                  value={formData.enrollment_date} 
                  onChange={(val) => setFormData({...formData, enrollment_date: val})} 
                />
              </div>
            </div>

            {/* Deacon toggle */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="is_deacon"
                  checked={formData.is_deacon || false}
                  onChange={(e) => setFormData({...formData, is_deacon: e.target.checked})}
                  className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <Label htmlFor="is_deacon" className="text-sm font-bold text-slate-700 cursor-pointer flex items-center gap-2">
                  <Cross className="h-4 w-4 text-indigo-500" />
                  {t('deacon_toggle_label')}
                </Label>
              </div>
              {formData.is_deacon && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-8">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">{t('deacon_ordination_date')}</Label>
                    <EthioDatePicker 
                      value={formData.ordination_date || ''} 
                      onChange={(val) => setFormData({...formData, ordination_date: val})} 
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-slate-50/50 border-t border-slate-100 p-6 mt-8">
            <Button type="button" variant="outline" className="rounded-xl h-11 px-6 font-bold" onClick={() => router.back()}>
                {t('new_student_cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2">
                {isSubmitting ? t('new_student_processing') : (
                    <>
                        <Save className="h-4 w-4" />
                        {t('new_student_submit')}
                    </>
                )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
