import { ScanPaieDashboard } from "@/components/ai/scanpaie-dashboard"

export default function ScanPaiePage() {
  // In a real implementation, this would come from the user's session
  const companyId = "company_123"

  return (
    <div className="container mx-auto py-6">
      <ScanPaieDashboard companyId={companyId} />
    </div>
  )
}
