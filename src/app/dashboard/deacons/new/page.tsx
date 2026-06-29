"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewDeaconRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/students/new")
  }, [router])

  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-slate-500 text-sm">Redirecting to student registration — deacons are now registered through the student form...</p>
    </div>
  )
}
