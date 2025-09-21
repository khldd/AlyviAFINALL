"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PayrollImport } from "./payroll-import"
import { PayrollHistory } from "./payroll-history"
import { PayslipGeneration } from "./payslip-generation"
import { Upload, History, FileText, Download, AlertTriangle } from "lucide-react"

// Mock data for payroll overview
const mockPayrollStats = {
  currentMonth: "Décembre 2024",
  totalEmployees: 156,
  processedPayrolls: 142,
  pendingPayrolls: 14,
  totalAmount: "€487,250",
  anomaliesDetected: 3,
}

export function PayrollLayout() {
  const [activeTab, setActiveTab] = useState("import")

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestion de la paie</h1>
          <p className="text-muted-foreground">Import, traitement et génération des bulletins de paie</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Modèle CSV
          </Button>
          <Button size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import rapide
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Période actuelle</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPayrollStats.currentMonth}</div>
            <p className="text-xs text-muted-foreground">
              {mockPayrollStats.processedPayrolls}/{mockPayrollStats.totalEmployees} traités
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paies traitées</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPayrollStats.processedPayrolls}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">91%</span> de completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPayrollStats.totalAmount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+2.3%</span> vs mois précédent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPayrollStats.anomaliesDetected}</div>
            <p className="text-xs text-muted-foreground">ScanPaie IA</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import de données
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="payslips" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Bulletins de paie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <PayrollImport />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <PayrollHistory />
        </TabsContent>

        <TabsContent value="payslips" className="space-y-4">
          <PayslipGeneration />
        </TabsContent>
      </Tabs>
    </div>
  )
}
