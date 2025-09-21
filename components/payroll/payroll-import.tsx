"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, CheckCircle, AlertTriangle, X, Download } from "lucide-react"

interface PayrollData {
  employee_id: string
  employee_name: string
  period_month: number
  period_year: number
  base_salary: number
  overtime_hours: number
  bonuses: number
  deductions: number
  net_salary: number
  status: "valid" | "warning" | "error"
  errors?: string[]
}

export function PayrollImport() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [parsedData, setParsedData] = useState<PayrollData[]>([])
  const [importResults, setImportResults] = useState<{
    total: number
    success: number
    warnings: number
    errors: number
  } | null>(null)

  // Mock CSV parsing function
  const parseCSVData = (file: File): Promise<PayrollData[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock parsed data
        const mockData: PayrollData[] = [
          {
            employee_id: "EMP001",
            employee_name: "Jean Martin",
            period_month: 12,
            period_year: 2024,
            base_salary: 4500,
            overtime_hours: 8,
            bonuses: 200,
            deductions: 90,
            net_salary: 3650,
            status: "valid",
          },
          {
            employee_id: "EMP002",
            employee_name: "Sophie Durand",
            period_month: 12,
            period_year: 2024,
            base_salary: 5200,
            overtime_hours: 0,
            bonuses: 0,
            deductions: 104,
            net_salary: 4100,
            status: "valid",
          },
          {
            employee_id: "EMP003",
            employee_name: "Pierre Moreau",
            period_month: 12,
            period_year: 2024,
            base_salary: 3800,
            overtime_hours: 15,
            bonuses: 500,
            deductions: 76,
            net_salary: 3950,
            status: "warning",
            errors: ["Heures supplémentaires élevées (>10h)"],
          },
          {
            employee_id: "EMP004",
            employee_name: "Marie Leroy",
            period_month: 12,
            period_year: 2024,
            base_salary: 6500,
            overtime_hours: 0,
            bonuses: 1000,
            deductions: 130,
            net_salary: 5800,
            status: "error",
            errors: ["Salaire net incohérent avec les calculs", "Prime exceptionnellement élevée"],
          },
        ]
        resolve(mockData)
      }, 1500)
    })
  }

  const processImport = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Simulate processing steps
      setProcessingProgress(25)
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProcessingProgress(50)
      const data = await parseCSVData(uploadedFile)
      setParsedData(data)

      setProcessingProgress(75)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Calculate results
      const results = {
        total: data.length,
        success: data.filter((d) => d.status === "valid").length,
        warnings: data.filter((d) => d.status === "warning").length,
        errors: data.filter((d) => d.status === "error").length,
      }
      setImportResults(results)

      setProcessingProgress(100)
    } catch (error) {
      console.error("Import error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setParsedData([])
      setImportResults(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
  })

  const resetImport = () => {
    setUploadedFile(null)
    setParsedData([])
    setImportResults(null)
    setProcessingProgress(0)
  }

  return (
    <div className="space-y-6">
      {/* File upload area */}
      <Card>
        <CardHeader>
          <CardTitle>Import de matrice de paie</CardTitle>
          <CardDescription>
            Importez vos données de paie au format CSV ou Excel pour traitement automatique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive ? "Déposez le fichier ici" : "Glissez-déposez votre fichier"}
              </h3>
              <p className="text-muted-foreground mb-4">Formats acceptés: CSV, XLS, XLSX (max 10MB)</p>
              <Button variant="outline">Parcourir les fichiers</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetImport}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Traitement en cours...</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={processImport} disabled={isProcessing}>
                  {isProcessing ? "Traitement..." : "Traiter le fichier"}
                </Button>
                <Button variant="outline" onClick={resetImport} disabled={isProcessing}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Résultats de l'import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{importResults.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{importResults.success}</div>
                <div className="text-sm text-muted-foreground">Succès</div>
              </div>
              <div className="text-center p-4 bg-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{importResults.warnings}</div>
                <div className="text-sm text-muted-foreground">Avertissements</div>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <div className="text-2xl font-bold text-destructive">{importResults.errors}</div>
                <div className="text-sm text-muted-foreground">Erreurs</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button>Confirmer l'import</Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Rapport détaillé
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data preview */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu des données</CardTitle>
            <CardDescription>Vérifiez les données avant validation finale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Salaire de base</TableHead>
                    <TableHead>Heures sup.</TableHead>
                    <TableHead>Primes</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{row.employee_name}</p>
                          <p className="text-sm text-muted-foreground">{row.employee_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.period_month}/{row.period_year}
                      </TableCell>
                      <TableCell>€{row.base_salary.toLocaleString()}</TableCell>
                      <TableCell>{row.overtime_hours}h</TableCell>
                      <TableCell>€{row.bonuses.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">€{row.net_salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant={
                              row.status === "valid"
                                ? "default"
                                : row.status === "warning"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {row.status === "valid" ? "Valide" : row.status === "warning" ? "Attention" : "Erreur"}
                          </Badge>
                          {row.errors && row.errors.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {row.errors.map((error, i) => (
                                <div key={i}>• {error}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help section */}
      <Card>
        <CardHeader>
          <CardTitle>Format de fichier requis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Assurez-vous que votre fichier contient les colonnes suivantes dans l'ordre exact: ID Employé, Nom,
                Mois, Année, Salaire de base, Heures supplémentaires, Primes, Déductions, Salaire net
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le modèle CSV
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Guide d'utilisation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
