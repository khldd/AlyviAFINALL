import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { cin, email, firstName, lastName, position, hireDate } = body

    // Get current user's company
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("user_profiles").select("company_id, role").eq("id", user.id).single()

    if (!profile || !["hr_manager", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Call the database function to create employee
    const { data, error } = await supabase.rpc("create_employee_account", {
      p_company_id: profile.company_id,
      p_cin: cin,
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName,
      p_position: position,
      p_hire_date: hireDate || new Date().toISOString().split("T")[0],
    })

    if (error) {
      console.error("Error creating employee:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      employeeId: data,
      message: `Employee account created. Login credentials: Username=${cin}, Password=${cin}`,
    })
  } catch (error) {
    console.error("Error in create-employee API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
