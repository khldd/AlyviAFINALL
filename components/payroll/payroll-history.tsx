"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, Search, Filter, Calendar } from "lucide-react"

// Mock payroll history data
const mockPayrollHistory = [
  {
    id: "1",
    period: "Novembre 2024",
    month: 11,
    year: 2024,
    employees: 156,
    totalAmount: "€475,890",
    status: "completed",
    processedAt: "2024-11-30T10:30:00Z",
    processedBy: "Marie Dubois",
  },
  {
    id: "2",
    period: "Octobre 2024",
    month: 10,
    year: 2024,
    employees: 154,
    totalAmount: "€468,320",
    status: "completed",
    processedAt: "2024-10-31T09:15:00Z",
    processedBy: "Marie Dubois",
  },
  {
    id: "3",
    period: "Septembre 2024",
    month: 9,
    year: 2024,
    employees: 152,
    totalAmount: "€461,750",
    status: "completed",
    processedAt: "2024-09-30T11:45:00Z",
    processedBy: "Marie Dubois",
  },
  {
    id: "4",
    period: "Août 2024",
    month: 8,
    year: 2024,
    employees: 150,
    totalAmount: "€455,200",
    status: "completed",
    processedAt: "2024-08-31T08:20:00Z",
    processedBy: "Jean Dupont",
  },
]

export function PayrollHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  const filteredHistory = mockPayrollHistory.filter((payroll) => {
    const matchesSearch =
      payroll.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.processedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || payroll.status === statusFilter
    const matchesYear = yearFilter === "all" || payroll.year.toString() === yearFilter

    return matchesSearch && matchesStatus && matchesYear
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par période ou utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paies</CardTitle>
          <CardDescription>Consultez l'historique complet des traitements de paie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Employés</TableHead>
                  <TableHead>Montant total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Traité par</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{payroll.period}</span>
                      </div>
                    </TableCell>
                    <TableCell>{payroll.employees}</TableCell>
                    <TableCell className="font-medium">{payroll.totalAmount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payroll.status === "completed"
                            ? "default"
                            : payroll.status === "processing"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {payroll.status === "completed"
                          ? "Terminé"
                          : payroll.status === "processing"
                            ? "En cours"
                            : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell>{payroll.processedBy}</TableCell>
                    <TableCell>
                      {new Date(payroll.processedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun résultat trouvé pour les filtres sélectionnés</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total traité (2024)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€1,861,160</div>
            <p className="text-xs text-muted-foreground">612 employés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Moyenne mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€465,290</div>
            <p className="text-xs text-muted-foreground">153 employés/mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dernière paie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Novembre 2024</div>
            <p className="text-xs text-muted-foreground">156 employés traités</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
