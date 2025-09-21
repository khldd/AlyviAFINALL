"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, FileText, Calendar, User } from "lucide-react"
import { FileManager, type StoredFile } from "@/lib/storage/file-manager"

interface PayslipViewerProps {
  companyId: string
  employeeId?: string
}

export function PayslipViewer({ companyId, employeeId }: PayslipViewerProps) {
  const [payslips, setPayslips] = useState<StoredFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPayslips()
  }, [companyId, employeeId])

  const loadPayslips = async () => {
    try {
      setLoading(true)
      const fileManager = FileManager.getInstance()
      const files = await fileManager.getFiles(companyId, "payslip", employeeId)
      setPayslips(files)
    } catch (err) {
      setError("Failed to load payslips")
      console.error("Error loading payslips:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const fileManager = FileManager.getInstance()
      const blob = await fileManager.downloadFile(fileId)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
    }
  }

  const handleView = (fileId: string) => {
    const fileManager = FileManager.getInstance()
    const url = fileManager.getFileUrl(fileId)
    window.open(url, "_blank")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
            <Button onClick={loadPayslips} variant="outline" className="mt-4 bg-transparent">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bulletins de paie</h3>
        <Badge variant="secondary">
          {payslips.length} bulletin{payslips.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {payslips.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun bulletin de paie disponible</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {payslips.map((payslip) => (
            <Card key={payslip.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FileText className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{payslip.originalName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{payslip.metadata?.payrollPeriod || "Période inconnue"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{(payslip.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(payslip.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(payslip.id, payslip.originalName)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
