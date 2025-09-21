"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Users } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface CreateDocumentRequestProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock employees data
const mockEmployees = [
  { id: "EMP001", name: "Jean Martin", email: "jean.martin@techcorp.fr" },
  { id: "EMP002", name: "Sophie Durand", email: "sophie.durand@techcorp.fr" },
  { id: "EMP003", name: "Pierre Moreau", email: "pierre.moreau@techcorp.fr" },
  { id: "EMP004", name: "Marie Leroy", email: "marie.leroy@techcorp.fr" },
  { id: "EMP005", name: "Thomas Bernard", email: "thomas.bernard@techcorp.fr" },
]

const documentTypes = [
  { value: "identity_document", label: "Pièce d'identité" },
  { value: "address_proof", label: "Justificatif de domicile" },
  { value: "medical_certificate", label: "Certificat médical" },
  { value: "training_certificate", label: "Attestation de formation" },
  { value: "bank_details", label: "RIB" },
  { value: "contract_amendment", label: "Avenant contrat" },
  { value: "other", label: "Autre" },
]

export function CreateDocumentRequest({ open, onOpenChange }: CreateDocumentRequestProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    documentType: "",
    selectedEmployees: [] as string[],
    isMandatory: false,
    dueDate: undefined as Date | undefined,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        selectedEmployees: [...prev.selectedEmployees, employeeId],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedEmployees: prev.selectedEmployees.filter((id) => id !== employeeId),
      }))
    }
  }

  const handleSelectAllEmployees = (checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        selectedEmployees: mockEmployees.map((emp) => emp.id),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedEmployees: [],
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Creating document request:", formData)

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        documentType: "",
        selectedEmployees: [],
        isMandatory: false,
        dueDate: undefined,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating document request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle demande de document</DialogTitle>
          <DialogDescription>Créez une demande de document à envoyer aux employés sélectionnés</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre de la demande *</Label>
              <Input
                id="title"
                placeholder="Ex: Certificat médical, Justificatif de domicile..."
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="documentType">Type de document *</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, documentType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez les détails de la demande, les critères requis..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mandatory"
                checked={formData.isMandatory}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isMandatory: checked as boolean }))}
              />
              <Label htmlFor="mandatory">Document obligatoire</Label>
            </div>

            <div>
              <Label>Date d'échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, dueDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Employee selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Employés concernés *</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={formData.selectedEmployees.length === mockEmployees.length}
                  onCheckedChange={handleSelectAllEmployees}
                />
                <Label htmlFor="selectAll" className="text-sm">
                  Sélectionner tous
                </Label>
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="space-y-3">
                {mockEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={employee.id}
                      checked={formData.selectedEmployees.includes(employee.id)}
                      onCheckedChange={(checked) => handleEmployeeToggle(employee.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={employee.id} className="font-medium cursor-pointer">
                        {employee.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formData.selectedEmployees.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{formData.selectedEmployees.length} employé(s) sélectionné(s)</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !formData.title || !formData.documentType || formData.selectedEmployees.length === 0
              }
            >
              {isSubmitting ? "Création..." : "Créer la demande"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
