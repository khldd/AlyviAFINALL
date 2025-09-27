import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import Papa from "papaparse"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check company
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check if user has permission to import payroll data
    if (userProfile.role !== "hr_manager" && userProfile.role !== "super_admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileContent = await file.text()

    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ error: "Failed to parse CSV file", details: parseResult.errors }, { status: 400 })
    }

    const records = parseResult.data

    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (const record of records) {
      const {
        period_month,
        period_year,
        base_salary,
        overtime_hours,
        bonuses,
        deductions,
        net_salary,
        ...raw_data
      } = record as any

      const { error } = await supabase.from("payroll_matrices").insert({
        company_id: userProfile.company_id,
        period_month: parseInt(period_month, 10),
        period_year: parseInt(period_year, 10),
        base_salary: parseFloat(base_salary),
        overtime_hours: parseFloat(overtime_hours),
        bonuses: parseFloat(bonuses),
        deductions: parseFloat(deductions),
        net_salary: parseFloat(net_salary),
        raw_data: raw_data,
      })

      if (error) {
        errorCount++
        errors.push({ record, error: error.message })
      } else {
        successCount++
      }
    }

    return NextResponse.json({
      total: records.length,
      success: successCount,
      errors: errorCount,
      errorDetails: errors,
    })
  } catch (error) {
    console.error("Payroll import error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}