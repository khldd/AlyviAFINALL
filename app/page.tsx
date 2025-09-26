"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export default function HomePage() {
  const { userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && userProfile?.role === "employee") {
      router.replace("/payroll")
    }
  }, [userProfile, loading, router])

  if (loading || userProfile?.role === "employee") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Chargement...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  )
}
