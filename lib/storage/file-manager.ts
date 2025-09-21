// File storage and management utilities
export interface FileUpload {
  file: File
  category: "payslip" | "document" | "contract" | "other"
  employeeId?: string
  companyId: string
  metadata?: Record<string, any>
}

export interface StoredFile {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  category: string
  employeeId?: string
  companyId: string
  uploadedAt: Date
  url: string
  metadata?: Record<string, any>
}

export class FileManager {
  private static instance: FileManager
  private baseUrl = "/api/files"

  static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager()
    }
    return FileManager.instance
  }

  async uploadFile(upload: FileUpload): Promise<StoredFile> {
    const formData = new FormData()
    formData.append("file", upload.file)
    formData.append("category", upload.category)
    formData.append("companyId", upload.companyId)

    if (upload.employeeId) {
      formData.append("employeeId", upload.employeeId)
    }

    if (upload.metadata) {
      formData.append("metadata", JSON.stringify(upload.metadata))
    }

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload file")
    }

    return response.json()
  }

  async uploadPayslipPDF(
    pdfData: Uint8Array,
    filename: string,
    employeeId: string,
    companyId: string,
    payrollPeriod: string,
  ): Promise<StoredFile> {
    const blob = new Blob([pdfData], { type: "application/pdf" })
    const file = new File([blob], filename, { type: "application/pdf" })

    return this.uploadFile({
      file,
      category: "payslip",
      employeeId,
      companyId,
      metadata: {
        payrollPeriod,
        generatedAt: new Date().toISOString(),
      },
    })
  }

  async getFiles(companyId: string, category?: string, employeeId?: string): Promise<StoredFile[]> {
    const params = new URLSearchParams({ companyId })

    if (category) params.append("category", category)
    if (employeeId) params.append("employeeId", employeeId)

    const response = await fetch(`${this.baseUrl}?${params}`)

    if (!response.ok) {
      throw new Error("Failed to fetch files")
    }

    return response.json()
  }

  async deleteFile(fileId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${fileId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete file")
    }
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${fileId}/download`)

    if (!response.ok) {
      throw new Error("Failed to download file")
    }

    return response.blob()
  }

  getFileUrl(fileId: string): string {
    return `${this.baseUrl}/${fileId}/download`
  }

  validateFile(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
    // Max 10MB by default
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`)
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error("File type not allowed")
    }

    return true
  }
}
