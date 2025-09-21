"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Shield,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react"
import { ScanPaieDetector, type ScanPaieAnalysis } from "@/lib/ai/scanpaie-detector"

interface ScanPaieDashboardProps {
  companyId: string
}

export function ScanPaieDashboard({ companyId }: ScanPaieDashboardProps) {
  const [analysis, setAnalysis] = useState<ScanPaieAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastScanDate, setLastScanDate] = useState<Date | null>(null)

  useEffect(() => {
    runAnalysis()
  }, [companyId])

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const detector = ScanPaieDetector.getInstance()

      // Mock payroll data for demonstration
      const mockPayrollEntries = [
        {
          id: "entry_1",
          gross_salary: 12000, // Unusually high
          net_salary: 9500,
          social_charges: 1800,
          income_tax: 700,
          working_days: 22,
          overtime: 80, // Excessive
          bonuses: 2000,
          deductions: 0,
          employee: {
            id: "emp_1",
            first_name: "Jean",
            last_name: "Martin",
            position: "Développeur",
          },
        },
        {
          id: "entry_2",
          gross_salary: 4500,
          net_salary: 3600,
          social_charges: 650,
          income_tax: 250,
          working_days: 22,
          overtime: 15,
          bonuses: 0,
          deductions: 1200, // High deductions
          employee: {
            id: "emp_2",
            first_name: "Sophie",
            last_name: "Durand",
            position: "Chef de projet",
          },
        },
        {
          id: "entry_3",
          gross_salary: 3800,
          net_salary: 3100,
          social_charges: 550,
          income_tax: 150,
          working_days: 22,
          overtime: 5,
          bonuses: 0,
          deductions: 0,
          employee: {
            id: "emp_3",
            first_name: "Pierre",
            last_name: "Moreau",
            position: "Analyste",
          },
        },
      ]

      const result = await detector.analyzePayrollData(mockPayrollEntries)
      setAnalysis(result)
      setLastScanDate(new Date())
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4" />
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      case "medium":
        return <Clock className="w-4 h-4" />
      case "low":
        return <Eye className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      salary_spike: "Pic salarial",
      overtime_excessive: "Heures sup. excessives",
      deduction_unusual: "Déductions inhabituelles",
      tax_inconsistent: "Fiscalité incohérente",
      bonus_irregular: "Prime irrégulière",
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Analyse ScanPaie en cours...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Aucune analyse disponible</p>
            <Button onClick={runAnalysis}>
              <Zap className="w-4 h-4 mr-2" />
              Lancer l'analyse
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-600" />
            ScanPaie IA
          </h2>
          <p className="text-muted-foreground">Détection intelligente d'anomalies dans les données de paie</p>
        </div>
        <div className="flex items-center gap-2">
          {lastScanDate && (
            <span className="text-sm text-muted-foreground">
              Dernière analyse: {lastScanDate.toLocaleString("fr-FR")}
            </span>
          )}
          <Button onClick={runAnalysis} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Nouvelle analyse
          </Button>
        </div>
      </div>

      {/* Risk Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Score de risque global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{analysis.overallRiskScore}%</span>
              <Badge
                variant={
                  analysis.overallRiskScore > 70
                    ? "destructive"
                    : analysis.overallRiskScore > 40
                      ? "secondary"
                      : "default"
                }
              >
                {analysis.overallRiskScore > 70
                  ? "Risque élevé"
                  : analysis.overallRiskScore > 40
                    ? "Risque modéré"
                    : "Risque faible"}
              </Badge>
            </div>
            <Progress value={analysis.overallRiskScore} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{analysis.totalAnomalies}</div>
                <div className="text-muted-foreground">Anomalies totales</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-red-600">{analysis.criticalAnomalies}</div>
                <div className="text-muted-foreground">Critiques</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{analysis.anomaliesBySeverity.high || 0}</div>
                <div className="text-muted-foreground">Élevées</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{analysis.anomaliesBySeverity.medium || 0}</div>
                <div className="text-muted-foreground">Modérées</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>Recommandations IA</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Analysis */}
      <Tabs defaultValue="anomalies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="anomalies">Anomalies détectées</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies" className="space-y-4">
          {analysis.anomalies.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Aucune anomalie détectée</h3>
                <p className="text-muted-foreground">Toutes les données de paie semblent conformes aux attentes.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {analysis.anomalies.map((anomaly) => (
                <Card key={anomaly.id} className={`border-l-4 ${getSeverityColor(anomaly.severity)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(anomaly.severity)}
                        <div>
                          <CardTitle className="text-base">
                            {anomaly.employeeName} - {getTypeLabel(anomaly.type)}
                          </CardTitle>
                          <CardDescription>{anomaly.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(anomaly.confidence * 100)}% confiance
                        </Badge>
                        <Badge variant={anomaly.severity === "critical" ? "destructive" : "secondary"}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Valeur détectée:</span>
                        <span className="font-medium">€{anomaly.detectedValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Fourchette attendue:</span>
                        <span className="font-medium">
                          €{anomaly.expectedRange.min.toLocaleString()} - €{anomaly.expectedRange.max.toLocaleString()}
                        </span>
                      </div>
                      {anomaly.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Actions suggérées:</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {anomaly.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Anomalies by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analysis.anomaliesByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{getTypeLabel(type)}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Anomalies by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par sévérité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analysis.anomaliesBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(severity)}
                        <span className="text-sm capitalize">{severity}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
