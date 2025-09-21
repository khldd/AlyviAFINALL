import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = formData.get("category") as string
    const companyId = formData.get("companyId") as string
    const employeeId = formData.get("employeeId") as string | null
    const metadata = formData.get("metadata") as string | null

    if (!file || !category || !companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2)
    const extension = file.name.split(".").pop()
    const filename = `${category}_${timestamp}_${randomString}.${extension}`

    // Convert file to buffer for storage simulation
    const buffer = await file.arrayBuffer()
    const fileData = new Uint8Array(buffer)

    // In a real implementation, you would upload to Supabase Storage or another service
    // For now, we'll simulate the storage and return mock data
    const storedFile = {
      id: `file_${timestamp}_${randomString}`,
      filename,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      category,
      employeeId,
      companyId,
      uploadedAt: new Date(),
      url: `/api/files/file_${timestamp}_${randomString}/download`,
      metadata: metadata ? JSON.parse(metadata) : null,
    }

    // Store file record in database
    const { error: dbError } = await supabase.from("files").insert({
      id: storedFile.id,
      filename: storedFile.filename,
      original_name: storedFile.originalName,
      size: storedFile.size,
      mime_type: storedFile.mimeType,
      category: storedFile.category,
      employee_id: storedFile.employeeId,
      company_id: storedFile.companyId,
      metadata: storedFile.metadata,
      created_by: user.id,
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to store file record" }, { status: 500 })
    }

    return NextResponse.json(storedFile)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
