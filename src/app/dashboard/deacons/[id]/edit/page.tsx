"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EditDeaconRedirect({ params }: { params: { id: string } }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/dashboard/students/${params.id}/edit`)
  }, [router, params.id])

  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-slate-500 text-sm">Redirecting to student edit — deacons are now managed through the student system...</p>
    </div>
  )
}
