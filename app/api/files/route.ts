import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const category = searchParams.get("category")
    const employeeId = searchParams.get("employeeId")

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 })
    }

    let query = supabase.from("files").select("*").eq("company_id", companyId).order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (employeeId) {
      query = query.eq("employee_id", employeeId)
    }

    const { data: files, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }

    // Transform database records to match StoredFile interface
    const transformedFiles = files.map((file) => ({
      id: file.id,
      filename: file.filename,
      originalName: file.original_name,
      size: file.size,
      mimeType: file.mime_type,
      category: file.category,
      employeeId: file.employee_id,
      companyId: file.company_id,
      uploadedAt: new Date(file.created_at),
      url: `/api/files/${file.id}/download`,
      metadata: file.metadata,
    }))

    return NextResponse.json(transformedFiles)
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
