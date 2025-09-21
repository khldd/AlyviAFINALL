"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, Send, Eye, Search, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface PayrollEntry {
  id: string
  employee_id: string
  payroll_id: string
  gross_salary: number
  net_salary: number
  social_charges: number
  income_tax: number
  working_days: number
  overtime: number
  bonuses: number
  deductions: number
  payslip_file_id?: string
  employee: {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    email: string
    position: string
    department: string
  }
}

interface GenerationResult {
  success: boolean
  payslips: Array<{
    employeeId: string
    employeeName: string
    fileId: string
    filename: string
    downloadUrl: string
  }>
  message: string
}

export function PayslipGeneration() {
  const { user } = useAuth()
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([])
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPayrollId, setCurrentPayrollId] = useState<string | null>(null)

  useEffect(() => {
    loadPayrollEntries()
  }, [user])

  const loadPayrollEntries = async () => {
    if (!user?.user_metadata?.company_id) return

    try {
      setLoading(true)
      // In a real implementation, this would fetch from /api/payroll/entries
      // For now, using mock data that matches the real structure
      const mockEntries: PayrollEntry[] = [
        {
          id: "entry_1",
          employee_id: "emp_1",
          payroll_id: "payroll_dec_2024",
          gross_salary: 4500,
          net_salary: 3650,
          social_charges: 650,
          income_tax: 200,
          working_days: 22,
          overtime: 0,
          bonuses: 0,
          deductions: 0,
          payslip_file_id: "file_123",
          employee: {
            id: "emp_1",
            employee_id: "EMP001",
            first_name: "Jean",
            last_name: "Martin",
            email: "jean.martin@techcorp.fr",
            position: "Développeur",
            department: "IT",
          },
        },
        {
          id: "entry_2",
          employee_id: "emp_2",
          payroll_id: "payroll_dec_2024",
          gross_salary: 5200,
          net_salary: 4100,
          social_charges: 750,
          income_tax: 350,
          working_days: 22,
          overtime: 150,
          bonuses: 200,
          deductions: 0,
          employee: {
            id: "emp_2",
            employee_id: "EMP002",
            first_name: "Sophie",
            last_name: "Durand",
            email: "sophie.durand@techcorp.fr",
            position: "Chef de projet",
            department: "IT",
          },
        },
        {
          id: "entry_3",
          employee_id: "emp_3",
          payroll_id: "payroll_dec_2024",
          gross_salary: 4800,
          net_salary: 3950,
          social_charges: 700,
          income_tax: 150,
          working_days: 22,
          overtime: 0,
          bonuses: 0,
          deductions: 0,
          employee: {
            id: "emp_3",
            employee_id: "EMP003",
            first_name: "Pierre",
            last_name: "Moreau",
            email: "pierre.moreau@techcorp.fr",
            position: "Analyste",
            department: "Finance",
          },
        },
      ]

      setPayrollEntries(mockEntries)
      setCurrentPayrollId("payroll_dec_2024")
    } catch (err) {
      setError("Erreur lors du chargement des données de paie")
      console.error("Error loading payroll entries:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayslips = payrollEntries.filter((entry) => {
    const employeeName = `${entry.employee.first_name} ${entry.employee.last_name}`
    const matchesSearch =
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())

    const status = entry.payslip_file_id ? "generated" : "draft"
    const matchesStatus = statusFilter === "all" || status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayslips(filteredPayslips.map((p) => p.id))
    } else {
      setSelectedPayslips([])
    }
  }

  const handleSelectPayslip = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayslips([...selectedPayslips, entryId])
    } else {
      setSelectedPayslips(selectedPayslips.filter((id) => id !== entryId))
    }
  }

  const generatePayslips = async () => {
    if (!currentPayrollId || selectedPayslips.length === 0) return

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Get employee IDs from selected entries
      const selectedEntries = payrollEntries.filter((entry) => selectedPayslips.includes(entry.id))
      const employeeIds = selectedEntries.map((entry) => entry.employee.id)

      // Call the real PDF generation API
      const response = await fetch("/api/payroll/generate-payslips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payrollId: currentPayrollId,
          employeeIds: employeeIds,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate payslips")
      }

      const result: GenerationResult = await response.json()

      // Simulate progress for better UX
      for (let i = 0; i <= 100; i += 20) {
        setGenerationProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      // Update local state with generated payslips
      setPayrollEntries((prev) =>
        prev.map((entry) => {
          const generatedPayslip = result.payslips.find((p) => p.employeeId === entry.employee.id)
          if (generatedPayslip) {
            return { ...entry, payslip_file_id: generatedPayslip.fileId }
          }
          return entry
        }),
      )

      console.log(`Generated ${result.payslips.length} payslips successfully`)
    } catch (err) {
      console.error("Error generating payslips:", err)
      setError("Erreur lors de la génération des bulletins de paie")
    } finally {
      setIsGenerating(false)
      setSelectedPayslips([])
    }
  }

  const sendPayslips = async () => {
    const selectedEntries = payrollEntries.filter(
      (entry) => selectedPayslips.includes(entry.id) && entry.payslip_file_id,
    )

    console.log(
      "Sending payslips to:",
      selectedEntries.map((e) => e.employee.email),
    )
    // In a real implementation, this would call an API to send emails
  }

  const downloadPayslip = async (fileId: string, employeeName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`)
      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `bulletin_paie_${employeeName.replace(" ", "_")}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
    }
  }

  const viewPayslip = (fileId: string) => {
    window.open(`/api/files/${fileId}/download`, "_blank")
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
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
            <Button onClick={loadPayrollEntries} variant="outline" className="mt-4 bg-transparent">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Génération des bulletins de paie
          </CardTitle>
          <CardDescription>Générez et envoyez les bulletins de paie pour la période sélectionnée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="generated">Généré</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={generatePayslips} disabled={selectedPayslips.length === 0 || isGenerating}>
                <FileText className="w-4 h-4 mr-2" />
                Générer ({selectedPayslips.length})
              </Button>
              <Button variant="outline" onClick={sendPayslips} disabled={selectedPayslips.length === 0}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </div>

          {isGenerating && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Génération en cours...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payslips table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPayslips.length === filteredPayslips.length && filteredPayslips.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Salaire net</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.map((entry) => {
                  const employeeName = `${entry.employee.first_name} ${entry.employee.last_name}`
                  const status = entry.payslip_file_id ? "generated" : "draft"

                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPayslips.includes(entry.id)}
                          onCheckedChange={(checked) => handleSelectPayslip(entry.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employeeName}</p>
                          <p className="text-sm text-muted-foreground">{entry.employee.employee_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.employee.position}</p>
                          <p className="text-sm text-muted-foreground">{entry.employee.department}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">€{entry.net_salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={status === "generated" ? "default" : "destructive"}>
                          {status === "generated" ? "Généré" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.payslip_file_id ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => viewPayslip(entry.payslip_file_id!)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadPayslip(entry.payslip_file_id!, employeeName)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Non généré</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredPayslips.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun bulletin de paie trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollEntries.length}</div>
            <p className="text-xs text-muted-foreground">bulletins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Générés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {payrollEntries.filter((p) => p.payslip_file_id).length}
            </div>
            <p className="text-xs text-muted-foreground">prêts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {payrollEntries.filter((p) => !p.payslip_file_id).length}
            </div>
            <p className="text-xs text-muted-foreground">à générer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              €{payrollEntries.reduce((sum, entry) => sum + entry.net_salary, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">salaires nets</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
