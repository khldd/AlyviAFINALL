"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, FileText, AlertTriangle, Download, Upload, Eye } from "lucide-react"

// Mock data for other sections
const mockRecentPayrolls = [
  { id: 1, month: "Novembre 2024", employees: 156, status: "completed", amount: "€487,250" },
  { id: 2, month: "Octobre 2024", employees: 154, status: "completed", amount: "€475,890" },
  { id: 3, month: "Septembre 2024", employees: 152, status: "completed", amount: "€468,320" },
]

const mockPendingDocuments = [
  { id: 1, employee: "Jean Martin", document: "Certificat médical", dueDate: "2024-12-15", priority: "high" },
  { id: 2, employee: "Sophie Durand", document: "Justificatif domicile", dueDate: "2024-12-20", priority: "medium" },
  { id: 3, employee: "Pierre Moreau", document: "Attestation formation", dueDate: "2024-12-25", priority: "low" },
]

const mockAnomalies = [
  {
    id: 1,
    employee: "Marie Leroy",
    type: "Écart salaire",
    severity: "high",
    description: "Salaire 15% supérieur à la moyenne",
  },
  {
    id: 2,
    employee: "Thomas Bernard",
    type: "Heures supplémentaires",
    severity: "medium",
    description: "45h supplémentaires ce mois",
  },
  {
    id: 3,
    employee: "Claire Petit",
    type: "Prime irrégulière",
    severity: "low",
    description: "Prime non déclarée précédemment",
  },
]

export function DashboardOverview() {
  const [employeeCount, setEmployeeCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/users")
        if (!response.ok) {
          throw new Error("Failed to fetch employees")
        }
        const employees = await response.json()
        setEmployeeCount(employees.length)
      } catch (error) {
        console.error(error)
        setEmployeeCount(0) // or handle error state differently
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const mockStats = {
    activePayrolls: 12,
    pendingDocuments: 8,
    anomaliesDetected: 3,
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Vue d'ensemble</h1>
          <p className="text-muted-foreground">Tableau de bord de gestion RH et paie - TechCorp Solutions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importer paie
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés actifs</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <div className="text-2xl font-bold">{employeeCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+2</span> ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paies en cours</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activePayrolls}</div>
            <p className="text-xs text-muted-foreground">Décembre 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents en attente</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pendingDocuments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">3 urgents</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies détectées</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.anomaliesDetected}</div>
            <p className="text-xs text-muted-foreground">ScanPaie IA</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent payrolls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Paies récentes
            </CardTitle>
            <CardDescription>Historique des dernières paies traitées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentPayrolls.map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{payroll.month}</p>
                    <p className="text-sm text-muted-foreground">
                      {payroll.employees} employés • {payroll.amount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Terminé</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents en attente
            </CardTitle>
            <CardDescription>Demandes de documents en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPendingDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{doc.employee}</p>
                    <p className="text-sm text-muted-foreground">{doc.document}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        doc.priority === "high" ? "destructive" : doc.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {doc.priority === "high" ? "Urgent" : doc.priority === "medium" ? "Moyen" : "Faible"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{new Date(doc.dueDate).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Anomalies détectées par ScanPaie IA
          </CardTitle>
          <CardDescription>Détection automatique d'irrégularités dans les données de paie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnomalies.map((anomaly) => (
              <div key={anomaly.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium">{anomaly.employee}</p>
                    <Badge
                      variant={
                        anomaly.severity === "high"
                          ? "destructive"
                          : anomaly.severity === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {anomaly.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Examiner
                  </Button>
                  <Button variant="ghost" size="sm">
                    Ignorer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Raccourcis vers les tâches les plus courantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Upload className="w-6 h-6" />
              Importer matrice paie
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <FileText className="w-6 h-6" />
              Nouvelle demande document
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Users className="w-6 h-6" />
              Ajouter employé
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}