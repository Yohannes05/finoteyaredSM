"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, Save, Cross, Trash2, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { EthioDatePicker } from "@/components/ui/ethio-date-picker"
import StudentPhotoUpload from "@/components/StudentPhotoUpload"

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const studentId = params.id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useLanguage()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Delete photo from storage if exists
      if (formData.photo_url) {
        const photoPath = formData.photo_url.split('/').pop()
        if (photoPath) {
          await supabase.storage.from('avatars').remove([photoPath])
        }
      }

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
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", age: "", gender: "male", phone: "", photo_url: "", learning_topic: "", learning_stage: 1, enrollment_date: "", is_deacon: false, ordination_date: "", deacon_accepted: false
  })

  useEffect(() => {
    async function loadStudent() {
      const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single()
      if (student) {
        setFormData({
            first_name: student.first_name || "",
            last_name: student.last_name || "",
            age: student.age?.toString() || "",
            gender: student.gender || "male",
            phone: student.phone || "",
            photo_url: student.photo_url || "",
            learning_topic: student.learning_topic || "",
            learning_stage: student.learning_stage || 1,
            enrollment_date: student.enrollment_date || "",
            is_deacon: student.is_deacon || false,
            ordination_date: student.ordination_date || "",
            deacon_accepted: student.deacon_accepted || false
        })
      }
    }
    loadStudent()
  }, [studentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let finalPhotoUrl = formData.photo_url

      if (imageFile) {
        const compressedBlob = imageFile as Blob
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

      const { error } = await supabase.from('students').update(dataToInsert).eq('id', studentId)
      if(!error) {
        toast.success("Student updated successfully!")
        router.push(`/dashboard/students/${studentId}`)
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('header_edit_student')}</h2>
        <p className="text-sm text-slate-500 mt-0.5">Update the details below.</p>
      </div>

      <Card className="shadow-xl border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 mb-6">
            <CardTitle className="flex items-center text-lg">
                <UserPlus className="h-5 w-5 mr-2 text-indigo-600" />
                Update Information
            </CardTitle>
            <CardDescription>Fill out the needed attributes to update.</CardDescription>
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
              <div className="space-y-0">
                <StudentPhotoUpload
                  onFileSelect={(file) => setImageFile(file)}
                  existingPhotoUrl={formData.photo_url}
                />
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
                  </div>                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="deacon_accepted"
                        checked={formData.deacon_accepted || false}
                        onChange={(e) => setFormData({...formData, deacon_accepted: e.target.checked})}
                        className="h-5 w-5 rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <Label htmlFor="deacon_accepted" className="text-sm font-bold text-slate-700 cursor-pointer flex items-center gap-2">
                        <Cross className="h-4 w-4 text-amber-500" />
                        {t('deacon_accepted_label')}
                      </Label>
                    </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center gap-3 bg-slate-50/50 border-t border-slate-100 p-6 mt-8">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 border-2 border-red-200 hover:border-red-300 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
            <div className="flex-1" />
            <Button type="button" variant="outline" className="rounded-xl h-11 px-6 font-bold" onClick={() => router.back()}>
                {t('new_student_cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2">
                {isSubmitting ? t('new_student_processing') : (
                    <>
                        <Save className="h-4 w-4" />
                        Save Changes
                    </>
                )}
            </Button>
          </CardFooter>
        </form>
      </Card>

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
                    {t('delete_confirm_title').replace('{{name}}', `${formData.first_name} ${formData.last_name}`)}
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
