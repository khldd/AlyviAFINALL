"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, CheckCircle, AlertTriangle, X, Download } from "lucide-react"

interface ImportResults {
  total: number
  success: number
  errors: number
  warnings?: number
  errorDetails?: any[]
}

export function PayrollImport() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [importResults, setImportResults] = useState<ImportResults | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const processImport = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setProcessingProgress(0)
    setErrorMessage(null)
    setImportResults(null)

    const formData = new FormData()
    formData.append("file", uploadedFile)

    try {
      setProcessingProgress(30)
      const response = await fetch("/api/payroll/import", {
        method: "POST",
        body: formData,
      })
      setProcessingProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create import batch")
      }

      const results: ImportResults = await response.json()
      setImportResults(results)
      setProcessingProgress(100)
    } catch (error: any) {
      console.error("Import error:", error)
      setErrorMessage(error.message || "An unexpected error occurred.")
      setProcessingProgress(100)
    } finally {
      setIsProcessing(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setImportResults(null)
      setErrorMessage(null)
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
    setImportResults(null)
    setProcessingProgress(0)
    setErrorMessage(null)
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

      {/* Error message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

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
                <div className="text-2xl font-bold text-yellow-600">{importResults.warnings ?? 0}</div>
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