// PDF generation utility for payslips using jsPDF
import jsPDF from "jspdf"

export interface PayslipData {
  employee: {
    firstName: string
    lastName: string
    employeeId: string
    position: string
    department: string
    email: string
  }
  company: {
    name: string
    address: string
    siret: string
    logo?: string
  }
  payroll: {
    period: string
    grossSalary: number
    netSalary: number
    socialCharges: number
    incomeTax: number
    workingDays: number
    overtime: number
    bonuses: number
    deductions: number
  }
  payslipId: string
  generatedAt: Date
}

export class PayslipGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin = 20

  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
  }

  generatePayslip(data: PayslipData): Uint8Array {
    this.addHeader(data.company)
    this.addEmployeeInfo(data.employee)
    this.addPayrollDetails(data.payroll)
    this.addFooter(data.payslipId, data.generatedAt)

    return this.doc.output("arraybuffer") as Uint8Array
  }

  private addHeader(company: any) {
    // Company logo and info
    this.doc.setFontSize(20)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(company.name, this.margin, 30)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(company.address, this.margin, 40)
    this.doc.text(`SIRET: ${company.siret}`, this.margin, 45)

    // Title
    this.doc.setFontSize(16)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("BULLETIN DE PAIE", this.pageWidth / 2, 60, { align: "center" })

    // Horizontal line
    this.doc.line(this.margin, 65, this.pageWidth - this.margin, 65)
  }

  private addEmployeeInfo(employee: any) {
    let yPos = 80

    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("INFORMATIONS EMPLOYÉ", this.margin, yPos)

    yPos += 10
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")

    this.doc.text(`Nom: ${employee.lastName} ${employee.firstName}`, this.margin, yPos)
    yPos += 5
    this.doc.text(`ID Employé: ${employee.employeeId}`, this.margin, yPos)
    yPos += 5
    this.doc.text(`Poste: ${employee.position}`, this.margin, yPos)
    yPos += 5
    this.doc.text(`Département: ${employee.department}`, this.margin, yPos)
    yPos += 5
    this.doc.text(`Email: ${employee.email}`, this.margin, yPos)
  }

  private addPayrollDetails(payroll: any) {
    let yPos = 130

    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("DÉTAILS DE PAIE", this.margin, yPos)

    yPos += 15

    // Table headers
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Description", this.margin, yPos)
    this.doc.text("Montant (€)", this.pageWidth - 60, yPos)

    yPos += 5
    this.doc.line(this.margin, yPos, this.pageWidth - this.margin, yPos)
    yPos += 10

    // Payroll items
    this.doc.setFont("helvetica", "normal")

    const items = [
      { label: "Salaire brut", amount: payroll.grossSalary },
      { label: "Heures supplémentaires", amount: payroll.overtime },
      { label: "Primes", amount: payroll.bonuses },
      { label: "Charges sociales", amount: -payroll.socialCharges },
      { label: "Impôt sur le revenu", amount: -payroll.incomeTax },
      { label: "Déductions", amount: -payroll.deductions },
    ]

    items.forEach((item) => {
      this.doc.text(item.label, this.margin, yPos)
      this.doc.text(item.amount.toFixed(2), this.pageWidth - 60, yPos, { align: "right" })
      yPos += 8
    })

    // Net salary
    yPos += 5
    this.doc.line(this.margin, yPos, this.pageWidth - this.margin, yPos)
    yPos += 10

    this.doc.setFont("helvetica", "bold")
    this.doc.text("SALAIRE NET", this.margin, yPos)
    this.doc.text(payroll.netSalary.toFixed(2) + " €", this.pageWidth - 60, yPos, { align: "right" })
  }

  private addFooter(payslipId: string, generatedAt: Date) {
    const yPos = this.pageHeight - 30

    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(`ID Bulletin: ${payslipId}`, this.margin, yPos)
    this.doc.text(`Généré le: ${generatedAt.toLocaleDateString("fr-FR")}`, this.pageWidth - this.margin, yPos, {
      align: "right",
    })

    this.doc.text("Document généré par AlyviaHR", this.pageWidth / 2, yPos + 10, { align: "center" })
  }
}
