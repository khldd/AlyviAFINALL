"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Search, Filter, Download, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Mock audit log data
const auditLogs = [
  {
    id: "1",
    timestamp: "2024-01-15 14:30:25",
    user: "Marie Dubois",
    action: "Création employé",
    resource: "Employé #EMP001",
    company: "TechCorp SARL",
    ip_address: "192.168.1.100",
    status: "success",
    details: "Nouvel employé créé: Jean Martin",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:25:12",
    user: "Admin System",
    action: "Import paie",
    resource: "Matrice paie Janvier 2024",
    company: "TechCorp SARL",
    ip_address: "192.168.1.101",
    status: "success",
    details: "Import de 45 fiches de paie",
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:20:08",
    user: "Pierre Durand",
    action: "Tentative connexion",
    resource: "Authentification",
    company: "InnovCorp SAS",
    ip_address: "192.168.1.102",
    status: "failed",
    details: "Échec de connexion - mot de passe incorrect",
  },
  {
    id: "4",
    timestamp: "2024-01-15 14:15:33",
    user: "Sophie Martin",
    action: "Génération bulletin",
    resource: "Bulletin paie #BP2024001",
    company: "TechCorp SARL",
    ip_address: "192.168.1.103",
    status: "success",
    details: "Bulletin généré pour Jean Martin",
  },
  {
    id: "5",
    timestamp: "2024-01-15 14:10:45",
    user: "Admin System",
    action: "Suppression document",
    resource: "Document #DOC123",
    company: "InnovCorp SAS",
    ip_address: "192.168.1.104",
    status: "warning",
    details: "Document supprimé après expiration",
  },
]

export default function AuditPage() {
  const { userProfile } = useAuth()
  const router = useRouter()

  // Redirect non-super-admin users
  useEffect(() => {
    if (userProfile && userProfile.role !== "super_admin") {
      router.push("/")
    }
  }, [userProfile, router])

  if (!userProfile || userProfile.role !== "super_admin") {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Succès
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Échec</Badge>
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Attention
          </Badge>
        )
      default:
        return <Badge variant="outline">Info</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Journaux d'audit</h1>
            <p className="text-muted-foreground">Surveillance complète des activités système</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions aujourd'hui</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% par rapport à hier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connexions réussies</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">98.5% de taux de réussite</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tentatives échouées</CardTitle>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">-45% par rapport à hier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes sécurité</CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Nécessitent une attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Recherche dans les journaux</CardTitle>
            <CardDescription>Filtrez et recherchez dans l'historique des activités</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher par utilisateur, action, ressource..." className="pl-10" />
              </div>
              <Button variant="outline">Rechercher</Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>Historique détaillé des actions système</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horodatage</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        {log.action}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.resource}</TableCell>
                    <TableCell className="text-sm">{log.company}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip_address}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
