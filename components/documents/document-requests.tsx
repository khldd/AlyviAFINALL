"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Eye, Send, Clock, AlertTriangle, CheckCircle } from "lucide-react"

// Mock document requests data
const mockDocumentRequests = [
  {
    id: "1",
    employee: {
      id: "EMP001",
      name: "Jean Martin",
      email: "jean.martin@techcorp.fr",
      avatar: "/placeholder.svg",
    },
    title: "Certificat médical",
    description: "Certificat médical pour arrêt maladie du 15-20 novembre",
    documentType: "medical_certificate",
    isMandatory: true,
    dueDate: "2024-12-15",
    status: "pending",
    createdAt: "2024-11-25T10:00:00Z",
    requestedBy: "Marie Dubois",
  },
  {
    id: "2",
    employee: {
      id: "EMP002",
      name: "Sophie Durand",
      email: "sophie.durand@techcorp.fr",
      avatar: "/placeholder.svg",
    },
    title: "Justificatif de domicile",
    description: "Justificatif de domicile récent (moins de 3 mois)",
    documentType: "address_proof",
    isMandatory: false,
    dueDate: "2024-12-20",
    status: "submitted",
    createdAt: "2024-11-20T14:30:00Z",
    requestedBy: "Marie Dubois",
    submittedAt: "2024-11-28T09:15:00Z",
  },
  {
    id: "3",
    employee: {
      id: "EMP003",
      name: "Pierre Moreau",
      email: "pierre.moreau@techcorp.fr",
      avatar: "/placeholder.svg",
    },
    title: "Attestation de formation",
    description: "Certificat de formation sécurité au travail",
    documentType: "training_certificate",
    isMandatory: true,
    dueDate: "2024-12-10",
    status: "overdue",
    createdAt: "2024-11-15T16:45:00Z",
    requestedBy: "Marie Dubois",
  },
  {
    id: "4",
    employee: {
      id: "EMP004",
      name: "Marie Leroy",
      email: "marie.leroy@techcorp.fr",
      avatar: "/placeholder.svg",
    },
    title: "Copie carte d'identité",
    description: "Copie recto-verso de la carte d'identité mise à jour",
    documentType: "identity_document",
    isMandatory: true,
    dueDate: "2024-12-31",
    status: "approved",
    createdAt: "2024-11-10T11:20:00Z",
    requestedBy: "Marie Dubois",
    submittedAt: "2024-11-22T15:30:00Z",
    reviewedAt: "2024-11-23T10:00:00Z",
  },
]

export function DocumentRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredRequests = mockDocumentRequests.filter((request) => {
    const matchesSearch =
      request.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.documentType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "submitted":
        return <CheckCircle className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string, isMandatory: boolean) => {
    const baseVariant =
      status === "approved"
        ? "default"
        : status === "submitted"
          ? "secondary"
          : status === "overdue"
            ? "destructive"
            : "outline"

    const statusText =
      status === "approved"
        ? "Approuvé"
        : status === "submitted"
          ? "Soumis"
          : status === "overdue"
            ? "En retard"
            : "En attente"

    return (
      <div className="flex items-center gap-2">
        <Badge variant={baseVariant}>{statusText}</Badge>
        {isMandatory && (
          <Badge variant="outline" className="text-xs">
            Obligatoire
          </Badge>
        )}
      </div>
    )
  }

  const sendReminder = (requestId: string) => {
    console.log("Sending reminder for request:", requestId)
    // Implement reminder logic
  }

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
                  placeholder="Rechercher par employé ou document..."
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
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="submitted">Soumis</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="identity_document">Pièce d'identité</SelectItem>
                <SelectItem value="address_proof">Justificatif domicile</SelectItem>
                <SelectItem value="medical_certificate">Certificat médical</SelectItem>
                <SelectItem value="training_certificate">Attestation formation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests table */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de documents</CardTitle>
          <CardDescription>Gérez les demandes de documents envoyées aux employés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Document demandé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Demandé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={request.employee.avatar || "/placeholder.svg"}
                            alt={request.employee.name}
                          />
                          <AvatarFallback>
                            {request.employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.employee.name}</p>
                          <p className="text-sm text-muted-foreground">{request.employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {request.documentType === "identity_document"
                          ? "Identité"
                          : request.documentType === "address_proof"
                            ? "Domicile"
                            : request.documentType === "medical_certificate"
                              ? "Médical"
                              : request.documentType === "training_certificate"
                                ? "Formation"
                                : request.documentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span
                          className={`text-sm ${request.status === "overdue" ? "text-destructive font-medium" : ""}`}
                        >
                          {new Date(request.dueDate).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status, request.isMandatory)}</TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {request.status === "pending" && (
                          <Button variant="ghost" size="sm" onClick={() => sendReminder(request.id)}>
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune demande trouvée pour les filtres sélectionnés</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
            <h3 className="font-medium mb-1">Documents en retard</h3>
            <p className="text-sm text-muted-foreground">4 documents dépassent l'échéance</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <h3 className="font-medium mb-1">Rappels à envoyer</h3>
            <p className="text-sm text-muted-foreground">8 employés à relancer</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">À valider</h3>
            <p className="text-sm text-muted-foreground">12 documents soumis</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
