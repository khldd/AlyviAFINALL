import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { PayslipGenerator, type PayslipData } from "@/lib/pdf/payslip-generator"
import { FileManager } from "@/lib/storage/file-manager"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { payrollId, employeeIds } = await request.json()

    if (!payrollId || !employeeIds || !Array.isArray(employeeIds)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Fetch payroll data
    const { data: payroll, error: payrollError } = await supabase
      .from("payrolls")
      .select(`
        *,
        company:companies(*)
      `)
      .eq("id", payrollId)
      .single()

    if (payrollError || !payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 })
    }

    // Fetch employee data and payroll entries
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select(`
        *,
        payroll_entries!inner(*)
      `)
      .in("id", employeeIds)
      .eq("payroll_entries.payroll_id", payrollId)

    if (employeesError) {
      return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
    }

    const generator = new PayslipGenerator()
    const fileManager = FileManager.getInstance()
    const generatedPayslips = []

    // Generate payslips for each employee
    for (const employee of employees) {
      const payrollEntry = employee.payroll_entries[0] // Assuming one entry per employee per payroll

      const payslipData: PayslipData = {
        employee: {
          firstName: employee.first_name,
          lastName: employee.last_name,
          employeeId: employee.employee_id,
          position: employee.position,
          department: employee.department,
          email: employee.email,
        },
        company: {
          name: payroll.company.name,
          address: payroll.company.address,
          siret: payroll.company.siret,
        },
        payroll: {
          period: payroll.period,
          grossSalary: payrollEntry.gross_salary,
          netSalary: payrollEntry.net_salary,
          socialCharges: payrollEntry.social_charges,
          incomeTax: payrollEntry.income_tax,
          workingDays: payrollEntry.working_days,
          overtime: payrollEntry.overtime,
          bonuses: payrollEntry.bonuses,
          deductions: payrollEntry.deductions,
        },
        payslipId: `PAY-${payroll.period}-${employee.employee_id}`,
        generatedAt: new Date(),
      }

      // Generate PDF
      const pdfData = generator.generatePayslip(payslipData)

      // Upload to storage
      const filename = `payslip_${employee.employee_id}_${payroll.period}.pdf`
      const storedFile = await fileManager.uploadPayslipPDF(
        pdfData,
        filename,
        employee.id,
        payroll.company_id,
        payroll.period,
      )

      // Update payroll entry with payslip file ID
      await supabase.from("payroll_entries").update({ payslip_file_id: storedFile.id }).eq("id", payrollEntry.id)

      generatedPayslips.push({
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        fileId: storedFile.id,
        filename: storedFile.filename,
        downloadUrl: storedFile.url,
      })
    }

    return NextResponse.json({
      success: true,
      payslips: generatedPayslips,
      message: `Generated ${generatedPayslips.length} payslips successfully`,
    })
  } catch (error) {
    console.error("Payslip generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
