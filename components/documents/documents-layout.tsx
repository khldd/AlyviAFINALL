"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentRequests } from "./document-requests"
import { DocumentSubmissions } from "./document-submissions"
import { CreateDocumentRequest } from "./create-document-request"
import { FileText, Clock, CheckCircle, AlertTriangle, Plus } from "lucide-react"

// Mock data for document overview
const mockDocumentStats = {
  totalRequests: 24,
  pendingRequests: 8,
  submittedDocuments: 12,
  overdueDocs: 4,
}

export function DocumentsLayout() {
  const [activeTab, setActiveTab] = useState("requests")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestion des documents</h1>
          <p className="text-muted-foreground">Demandes et suivi des documents employés</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDocumentStats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockDocumentStats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">À traiter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumis</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockDocumentStats.submittedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">50%</span> de completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{mockDocumentStats.overdueDocs}</div>
            <p className="text-xs text-muted-foreground">Échéance dépassée</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Demandes de documents
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Documents soumis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <DocumentRequests />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <DocumentSubmissions />
        </TabsContent>
      </Tabs>

      {/* Create document request dialog */}
      <CreateDocumentRequest open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}
