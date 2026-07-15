"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react"
import { Camera, Image as ImageIcon, X, ZoomIn } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { compressImage } from "@/lib/image"
import { useLanguage } from "@/lib/LanguageContext"

interface StudentPhotoUploadProps {
  /** Called when a file is selected (already compressed) */
  onFileSelect: (file: File | null) => void
  /** Optional existing photo URL to show as preview (edit mode) */
  existingPhotoUrl?: string | null
}

export default function StudentPhotoUpload({
  onFileSelect,
  existingPhotoUrl,
}: StudentPhotoUploadProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingPhotoUrl || null)
  const [showZoom, setShowZoom] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  // Update preview when existingPhotoUrl prop changes (e.g., navigating between edit pages)
  useEffect(() => {
    if (existingPhotoUrl) {
      setPreviewUrl(existingPhotoUrl)
    }
  }, [existingPhotoUrl])

  const handleFilePick = async (file: File) => {
    // Validate size first (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('photo_error_size'))
      return
    }

    setError(null)
    setIsCompressing(true)

    try {
      // Compress the image (heic2any handles HEIC conversion internally)
      const compressedBlob = await compressImage(file)
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), {
        type: 'image/jpeg',
      })

      // Show preview
      const objectUrl = URL.createObjectURL(compressedFile)
      // Clean up old preview
      if (previewUrl && previewUrl !== existingPhotoUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(objectUrl)
      onFileSelect(compressedFile)
      setShowOptions(false)
    } catch (err: any) {
      const msg = err.message || t('photo_error_generic')
      // Show a friendlier message for known error types
      if (msg.includes('HEIC') || msg.includes('heic')) {
        setError(t('photo_error_heic'))
      } else if (msg.includes('Failed to load image') || msg.includes('Failed to read file')) {
        setError(t('photo_error_unsupported'))
      } else {
        setError(msg)
      }
    } finally {
      setIsCompressing(false)
    }
  }

  const handleRemove = () => {
    if (previewUrl && previewUrl !== existingPhotoUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setError(null)
    onFileSelect(null)
    // Reset file inputs
    if (galleryInputRef.current) galleryInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-slate-700 font-bold ml-1 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-indigo-500" />
          {t('photo_title')}
          <span className="text-xs font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
            {t('photo_max_size')}
          </span>
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            {t('photo_remove')}
          </button>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e: any) => {
          if (e.target.files && e.target.files[0]) {
            handleFilePick(e.target.files[0])
          }
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e: any) => {
          if (e.target.files && e.target.files[0]) {
            handleFilePick(e.target.files[0])
          }
        }}
      />

      {/* Photo box */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !isCompressing && setShowOptions(true)}
          className={`
            relative w-full rounded-2xl border-2 border-dashed transition-all duration-200
            ${previewUrl
              ? 'border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/60'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
            }
            ${isCompressing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            group overflow-hidden
          `}
          style={{ minHeight: '180px' }}
        >
          {previewUrl ? (
            <>
              {/* Image preview */}
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <img
                  src={previewUrl}
                  alt="Student photo preview"
                  className="max-h-[170px] w-auto max-w-full rounded-xl object-contain"
                />
              </div>
              {/* Zoom button overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-2xl"
                onClick={(e: any) => {
                  e.stopPropagation()
                  setShowZoom(true)
                }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                  <ZoomIn className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              {/* Change photo hint */}
              <div className="absolute bottom-2 right-2 text-[10px] font-medium text-indigo-500 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {t('photo_tap_to_change')}
              </div>
            </>
          ) : (
            <>
              {/* Empty state */}
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <Camera className="h-7 w-7 text-indigo-500" />
                </div>
                <span className="text-sm font-semibold text-slate-600">
                  {isCompressing ? t('photo_optimizing') : t('photo_tap_to_add')}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  {t('photo_source_hint')}
                </span>
              </div>
            </>
          )}
        </button>

        {/* Compressing indicator */}
        {isCompressing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-2xl backdrop-blur-[1px]">
            <div className="flex items-center gap-2.5 bg-white shadow-lg rounded-xl px-5 py-3">
              <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">{t('photo_optimizing')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2"
          >
            <X className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Camera / Gallery options modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
            onClick={() => setShowOptions(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm rounded-3xl shadow-2xl bg-white overflow-hidden"
              onClick={(e: any) => e.stopPropagation()}
            >
              {/* Handle bar for mobile */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-300" />
              </div>

              {/* Header */}
              <div className="px-6 pt-5 pb-2">
                <h3 className="text-lg font-bold text-slate-900">{t('photo_choose_source')}</h3>
                <p className="text-sm text-slate-500 mt-1">{t('photo_choose_subtitle')}</p>
              </div>

              {/* Options */}
              <div className="px-6 pb-4 pt-2 space-y-2">
                {/* Camera option */}
                <button
                  type="button"
                  onClick={() => {
                    cameraInputRef.current?.click()
                    setShowOptions(false)
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:ring-2 hover:ring-indigo-200 transition-all group active:scale-[0.98]"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-slate-800">{t('photo_take')}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{t('photo_take_desc')}</span>
                  </div>
                </button>

                {/* Gallery option */}
                <button
                  type="button"
                  onClick={() => {
                    galleryInputRef.current?.click()
                    setShowOptions(false)
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:ring-2 hover:ring-emerald-200 transition-all group active:scale-[0.98]"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-slate-800">{t('photo_gallery')}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{t('photo_gallery_desc')}</span>
                  </div>
                </button>
              </div>

              {/* Cancel */}
              <div className="px-6 pb-5">
                <button
                  type="button"
                  onClick={() => setShowOptions(false)}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98]"
                >
                  {t('photo_cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom modal */}
      <AnimatePresence>
        {showZoom && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
            onClick={() => setShowZoom(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-lg max-h-[85vh]"
              onClick={(e: any) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowZoom(false)}
                className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors z-10"
              >
                <X className="h-4 w-4 text-slate-700" />
              </button>
              <img
                src={previewUrl}
                alt="Student photo enlarged"
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
