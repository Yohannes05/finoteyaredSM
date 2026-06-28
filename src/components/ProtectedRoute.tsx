"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setIsAuthenticated(false)
        if (pathname !== "/login") {
          router.push("/login")
        } else {
            setIsLoading(false)
        }
      } else {
        setIsAuthenticated(true)
        if (pathname === "/login") {
          router.push("/dashboard")
        }
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        router.push("/login")
      } else if (session) {
        setIsAuthenticated(true)
        if (pathname === "/login") {
            router.push("/dashboard")
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  // If on login page, just render the children (login page handles its own layout)
  if (pathname === "/login") {
      return children;
  }

  // Only render the authenticated children if we have a valid session
  return isAuthenticated ? <>{children}</> : null
}
