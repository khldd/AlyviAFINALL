import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

    // Only HR managers and super admins can view employee lists
    if (userProfile.role !== "hr_manager" && userProfile.role !== "super_admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Fetch employees of the same company
    const { data: employees, error: employeesError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("company_id", userProfile.company_id)
      .eq("role", "employee")

    if (employeesError) {
      console.error("Error fetching employees:", employeesError)
      return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
    }

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error in /api/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}