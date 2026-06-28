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
import { motion } from "framer-motion"
import { Cross, Save } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { EthioDatePicker } from "@/components/ui/ethio-date-picker"

export default function EditDeaconPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const deaconId = params.id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", phone: "", photo_url: "", ordination_date: ""
  })

  useEffect(() => {
    async function loadDeacon() {
      const { data: deacon } = await supabase.from('deacons').select('*').eq('id', deaconId).single()
      if (deacon) {
        setFormData({
            first_name: deacon.first_name || "",
            last_name: deacon.last_name || "",
            phone: deacon.phone || "",
            photo_url: deacon.photo_url || "",
            ordination_date: deacon.ordination_date || ""
        })
      }
    }
    loadDeacon()
  }, [deaconId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let finalPhotoUrl = formData.photo_url

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `deacon-${Math.random()}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        finalPhotoUrl = publicUrlData.publicUrl
      }

      const dataToInsert = { ...formData, photo_url: finalPhotoUrl }

      const { error } = await supabase.from('deacons').update(dataToInsert).eq('id', deaconId)
      if(!error) {
        toast.success(t('deacon_edit_success'))
        router.push(`/dashboard/deacons/${deaconId}`)
      } else {
        toast.error("Error: " + error.message)
      }
    } catch (err: any) {
        toast.error(err.message || t('deacon_new_error'))
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('deacon_edit_title')}</h2>
        <p className="text-sm text-slate-500 mt-0.5">Update deacon details below.</p>
      </div>

      <Card className="shadow-xl border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 mb-6">
            <CardTitle className="flex items-center text-lg">
                <Cross className="h-5 w-5 mr-2 text-indigo-600" />
                {t('deacon_edit_title')}
            </CardTitle>
            <CardDescription>Update the details below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('deacon_new_first_name')}</Label>
                <Input required placeholder="e.g. Abba" className="h-11 rounded-xl" value={formData.first_name} onChange={(e: any) => setFormData({...formData, first_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('deacon_new_last_name')}</Label>
                <Input required placeholder="e.g. Kebede" className="h-11 rounded-xl" value={formData.last_name} onChange={(e: any) => setFormData({...formData, last_name: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('deacon_new_phone')}</Label>
                <Input required placeholder="+251 912 345 678" className="h-11 rounded-xl" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">{t('deacon_new_ordination')}</Label>
                <EthioDatePicker 
                  value={formData.ordination_date} 
                  onChange={(val) => setFormData({...formData, ordination_date: val})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold ml-1">Photo (optional)</Label>
              <Input type="file" accept="image/*" className="h-[46px] rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer text-slate-500 pt-[7px]" onChange={(e: any) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0])
                }
              }} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-slate-50/50 border-t border-slate-100 p-6 mt-8">
            <Button type="button" variant="outline" className="rounded-xl h-11 px-6 font-bold" onClick={() => router.back()}>
                {t('deacon_new_cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2">
                {isSubmitting ? t('deacon_new_processing') : (
                    <>
                        <Save className="h-4 w-4" />
                        Save Changes
                    </>
                )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
