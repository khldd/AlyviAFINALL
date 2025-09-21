import { PayrollLayout } from "@/components/payroll/payroll-layout"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function PayrollPage() {
  return (
    <DashboardLayout>
      <PayrollLayout />
    </DashboardLayout>
  )
}
