"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Filter, Eye, Download, Check, X, FileText } from "lucide-react"

// Mock document submissions data
const mockDocumentSubmissions = [
  {
    id: "1",
    requestId: "2",
    employee: {
      id: "EMP002",
      name: "Sophie Durand",
      email: "sophie.durand@techcorp.fr",
      avatar: "/placeholder.svg",
    },
    documentTitle: "Justificatif de domicile",
    fileName: "justificatif_domicile_durand.pdf",
    fileSize: "245 KB",
    fileUrl: "/documents/justificatif_domicile_durand.pdf",
    submittedAt: "2024-11-28T09:15:00Z",
    status: "pending_review",
    reviewNotes: "",
  },
  {
    id: "2",
    requestId: "4",
    employee: {
      id: "EMP004",
      name: "Marie Leroy",
      email: "marie.leroy@techcorp.fr",
      avatar: "/placeholder.svg",
    },
    documentTitle: "Copie carte d'identité",
    fileName: "carte_identite_leroy.pdf",
    fileSize: "1.2 MB",
    fileUrl: "/documents/carte_identite_leroy.pdf",
    submittedAt: "2024-11-22T15:30:00Z",
    status: "approved",
    reviewNotes: "Document conforme et lisible",
    reviewedAt: "2024-11-23T10:00:00Z",
    reviewedBy: "Marie Dubois",
  },
  {
    id: "3",
    requestId: "5",
    employee: {
      id: "EMP005",
      name: "Thomas Bernard",
      email: "thomas.bernard@techcorp.fr",
      avatar: "/placeholder.svg",
    },
    documentTitle: "Certificat médical",
    fileName: "certificat_medical_bernard.jpg",
    fileSize: "890 KB",
    fileUrl: "/documents/certificat_medical_bernard.jpg",
    submittedAt: "2024-11-26T14:20:00Z",
    status: "rejected",
    reviewNotes: "Document illisible, merci de soumettre une version de meilleure qualité",
    reviewedAt: "2024-11-27T09:30:00Z",
    reviewedBy: "Marie Dubois",
  },
]

export function DocumentSubmissions() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")

  const filteredSubmissions = mockDocumentSubmissions.filter((submission) => {
    const matchesSearch =
      submission.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const openReviewDialog = (submission: any) => {
    setSelectedSubmission(submission)
    setReviewNotes(submission.reviewNotes || "")
    setReviewDialogOpen(true)
  }

  const handleApprove = () => {
    console.log("Approving submission:", selectedSubmission?.id, "with notes:", reviewNotes)
    setReviewDialogOpen(false)
    setSelectedSubmission(null)
    setReviewNotes("")
  }

  const handleReject = () => {
    console.log("Rejecting submission:", selectedSubmission?.id, "with notes:", reviewNotes)
    setReviewDialogOpen(false)
    setSelectedSubmission(null)
    setReviewNotes("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review":
        return <Badge variant="secondary">En attente</Badge>
      case "approved":
        return <Badge variant="default">Approuvé</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
                <SelectItem value="pending_review">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents soumis</CardTitle>
          <CardDescription>Examinez et validez les documents soumis par les employés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Fichier</TableHead>
                  <TableHead>Soumis le</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={submission.employee.avatar || "/placeholder.svg"}
                            alt={submission.employee.name}
                          />
                          <AvatarFallback>
                            {submission.employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{submission.employee.name}</p>
                          <p className="text-sm text-muted-foreground">{submission.employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{submission.documentTitle}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{submission.fileName}</p>
                          <p className="text-xs text-muted-foreground">{submission.fileSize}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submittedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {submission.status === "pending_review" && (
                          <Button variant="ghost" size="sm" onClick={() => openReviewDialog(submission)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun document soumis trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Examiner le document</DialogTitle>
            <DialogDescription>
              Approuvez ou rejetez le document soumis par {selectedSubmission?.employee.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Document: {selectedSubmission?.documentTitle}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>{selectedSubmission?.fileName}</span>
                <span>({selectedSubmission?.fileSize})</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes de révision</label>
              <Textarea
                placeholder="Ajoutez vos commentaires sur le document..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <X className="w-4 h-4 mr-2" />
              Rejeter
            </Button>
            <Button onClick={handleApprove}>
              <Check className="w-4 h-4 mr-2" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
