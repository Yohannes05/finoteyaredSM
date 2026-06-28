"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, User, AlertCircle, Loader2, Languages, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t, toggleLanguage, language } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
        const email = username.trim()
            
        console.log("DEBUG: Sending this exact email to Supabase ->", email)

        const allowedEmailsStr = process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS
        if (allowedEmailsStr) {
            const allowedEmails = allowedEmailsStr.split(',').map(e => e.trim().toLowerCase())
            if (!allowedEmails.includes(email.toLowerCase())) {
                setError(language === "am" ? "ያልተፈቀደ ኢሜይል ነው።" : "Unauthorized email address.")
                setIsLoading(false)
                return
            }
        }
        
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) {
            setError(error.message)
            setIsLoading(false)
        } else {
            router.push("/dashboard")
        }
    } catch {
        setError(language === "am" ? "ያልተጠበቀ ስህተት ተፈጥሯል።" : "An unexpected error occurred.")
        setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60" />
      </div>

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 shadow-md active:scale-95"
      >
        <Languages className="h-4 w-4 text-indigo-500" />
        <span className="text-xs font-extrabold">{language === "en" ? "አማርኛ" : "English"}</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md px-4 sm:px-4 z-10"
      >
        <div className="flex flex-col items-center mb-8">
            <div className="relative h-32 w-32 mb-4 rounded-full overflow-hidden shadow-2xl shadow-indigo-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                   src="/logo.jpg" 
                   alt="School Logo" 
                   className="object-cover w-full h-full"
                />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-center">ፍኖተ ቅዱስ ያሬድ አብነት ት/ቤት</h1>
            <p className="text-slate-500 mt-2 font-medium">{t('login_brand_tagline')}</p>
        </div>

        <Card className="border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border-white/50">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">{t('login_title')}</CardTitle>
            <CardDescription className="text-center font-medium">{t('login_subtitle')}</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 mb-2"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-bold ml-1">{t('login_username' as any)}</Label>
                <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        id="username" 
                        type="email" 
                        placeholder={t('login_username_placeholder' as any)} 
                        className="h-12 pl-11 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all"
                        value={username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        required
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-bold ml-1">{t('login_password')}</Label>
                <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        className="h-12 pl-11 pr-11 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-8">
              <Button 
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-base shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{t('login_loading')}</span>
                    </div>
                ) : t('login_button')}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center text-slate-400 text-xs mt-8">{t('login_copyright')}</p>
      </motion.div>
    </div>
  )
}
