// ScanPaie AI anomaly detection system
export interface PayrollAnomaly {
  id: string
  type: "salary_spike" | "overtime_excessive" | "deduction_unusual" | "tax_inconsistent" | "bonus_irregular"
  severity: "low" | "medium" | "high" | "critical"
  employeeId: string
  employeeName: string
  description: string
  detectedValue: number
  expectedRange: { min: number; max: number }
  confidence: number
  suggestions: string[]
  detectedAt: Date
  payrollPeriod: string
  metadata?: Record<string, any>
}

export interface ScanPaieAnalysis {
  totalAnomalies: number
  criticalAnomalies: number
  anomaliesByType: Record<string, number>
  anomaliesBySeverity: Record<string, number>
  overallRiskScore: number
  recommendations: string[]
  anomalies: PayrollAnomaly[]
}

export class ScanPaieDetector {
  private static instance: ScanPaieDetector

  static getInstance(): ScanPaieDetector {
    if (!ScanPaieDetector.instance) {
      ScanPaieDetector.instance = new ScanPaieDetector()
    }
    return ScanPaieDetector.instance
  }

  async analyzePayrollData(payrollEntries: any[], historicalData?: any[]): Promise<ScanPaieAnalysis> {
    const anomalies: PayrollAnomaly[] = []

    // Analyze each payroll entry for anomalies
    for (const entry of payrollEntries) {
      const entryAnomalies = await this.detectEntryAnomalies(entry, historicalData)
      anomalies.push(...entryAnomalies)
    }

    // Calculate overall statistics
    const anomaliesByType = this.groupAnomaliesByType(anomalies)
    const anomaliesBySeverity = this.groupAnomaliesBySeverity(anomalies)
    const overallRiskScore = this.calculateRiskScore(anomalies)
    const recommendations = this.generateRecommendations(anomalies)

    return {
      totalAnomalies: anomalies.length,
      criticalAnomalies: anomalies.filter((a) => a.severity === "critical").length,
      anomaliesByType,
      anomaliesBySeverity,
      overallRiskScore,
      recommendations,
      anomalies: anomalies.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return severityOrder[b.severity] - severityOrder[a.severity]
      }),
    }
  }

  private async detectEntryAnomalies(entry: any, historicalData?: any[]): Promise<PayrollAnomaly[]> {
    const anomalies: PayrollAnomaly[] = []
    const employeeName = `${entry.employee.first_name} ${entry.employee.last_name}`

    // 1. Salary spike detection
    const salaryAnomaly = this.detectSalarySpike(entry, historicalData)
    if (salaryAnomaly) {
      anomalies.push({
        ...salaryAnomaly,
        employeeId: entry.employee.id,
        employeeName,
        payrollPeriod: entry.payroll?.period || "Current",
        detectedAt: new Date(),
      })
    }

    // 2. Excessive overtime detection
    const overtimeAnomaly = this.detectExcessiveOvertime(entry)
    if (overtimeAnomaly) {
      anomalies.push({
        ...overtimeAnomaly,
        employeeId: entry.employee.id,
        employeeName,
        payrollPeriod: entry.payroll?.period || "Current",
        detectedAt: new Date(),
      })
    }

    // 3. Unusual deductions detection
    const deductionAnomaly = this.detectUnusualDeductions(entry)
    if (deductionAnomaly) {
      anomalies.push({
        ...deductionAnomaly,
        employeeId: entry.employee.id,
        employeeName,
        payrollPeriod: entry.payroll?.period || "Current",
        detectedAt: new Date(),
      })
    }

    // 4. Tax inconsistency detection
    const taxAnomaly = this.detectTaxInconsistency(entry)
    if (taxAnomaly) {
      anomalies.push({
        ...taxAnomaly,
        employeeId: entry.employee.id,
        employeeName,
        payrollPeriod: entry.payroll?.period || "Current",
        detectedAt: new Date(),
      })
    }

    // 5. Irregular bonus detection
    const bonusAnomaly = this.detectIrregularBonus(entry, historicalData)
    if (bonusAnomaly) {
      anomalies.push({
        ...bonusAnomaly,
        employeeId: entry.employee.id,
        employeeName,
        payrollPeriod: entry.payroll?.period || "Current",
        detectedAt: new Date(),
      })
    }

    return anomalies
  }

  private detectSalarySpike(entry: any, historicalData?: any[]): Partial<PayrollAnomaly> | null {
    const currentSalary = entry.gross_salary

    // If no historical data, use position-based expectations
    if (!historicalData || historicalData.length === 0) {
      const positionExpectedRange = this.getPositionSalaryRange(entry.employee.position)

      if (currentSalary > positionExpectedRange.max * 1.5) {
        return {
          id: `salary_spike_${entry.id}`,
          type: "salary_spike",
          severity: currentSalary > positionExpectedRange.max * 2 ? "critical" : "high",
          description: `Salaire brut (€${currentSalary}) significativement supérieur à la fourchette attendue pour le poste ${entry.employee.position}`,
          detectedValue: currentSalary,
          expectedRange: positionExpectedRange,
          confidence: 0.85,
          suggestions: [
            "Vérifier si une promotion ou augmentation a été accordée",
            "Confirmer les heures supplémentaires et primes incluses",
            "Valider avec le service RH",
          ],
        }
      }
    } else {
      // Use historical data for comparison
      const avgHistoricalSalary = historicalData.reduce((sum, h) => sum + h.gross_salary, 0) / historicalData.length
      const threshold = avgHistoricalSalary * 1.3 // 30% increase threshold

      if (currentSalary > threshold) {
        return {
          id: `salary_spike_${entry.id}`,
          type: "salary_spike",
          severity: currentSalary > avgHistoricalSalary * 1.5 ? "high" : "medium",
          description: `Augmentation salariale de ${((currentSalary / avgHistoricalSalary - 1) * 100).toFixed(1)}% par rapport à la moyenne historique`,
          detectedValue: currentSalary,
          expectedRange: { min: avgHistoricalSalary * 0.9, max: avgHistoricalSalary * 1.1 },
          confidence: 0.92,
          suggestions: [
            "Vérifier la justification de l'augmentation",
            "Confirmer l'approbation hiérarchique",
            "Documenter les raisons de l'ajustement",
          ],
        }
      }
    }

    return null
  }

  private detectExcessiveOvertime(entry: any): Partial<PayrollAnomaly> | null {
    const overtime = entry.overtime || 0
    const workingDays = entry.working_days || 22
    const dailyOvertimeLimit = 2 * 8 // 2 hours per day max recommended
    const monthlyOvertimeLimit = workingDays * dailyOvertimeLimit

    if (overtime > monthlyOvertimeLimit) {
      return {
        id: `overtime_excessive_${entry.id}`,
        type: "overtime_excessive",
        severity: overtime > monthlyOvertimeLimit * 1.5 ? "critical" : "high",
        description: `Heures supplémentaires excessives: ${overtime}h (limite recommandée: ${monthlyOvertimeLimit}h)`,
        detectedValue: overtime,
        expectedRange: { min: 0, max: monthlyOvertimeLimit },
        confidence: 0.95,
        suggestions: [
          "Vérifier la conformité avec le code du travail",
          "Évaluer la charge de travail de l'employé",
          "Considérer un recrutement supplémentaire",
          "Valider les heures avec le manager direct",
        ],
      }
    }

    return null
  }

  private detectUnusualDeductions(entry: any): Partial<PayrollAnomaly> | null {
    const deductions = entry.deductions || 0
    const grossSalary = entry.gross_salary
    const deductionPercentage = (deductions / grossSalary) * 100

    // Unusual if deductions > 15% of gross salary
    if (deductionPercentage > 15) {
      return {
        id: `deduction_unusual_${entry.id}`,
        type: "deduction_unusual",
        severity: deductionPercentage > 25 ? "high" : "medium",
        description: `Déductions inhabituelles: €${deductions} (${deductionPercentage.toFixed(1)}% du salaire brut)`,
        detectedValue: deductions,
        expectedRange: { min: 0, max: grossSalary * 0.15 },
        confidence: 0.88,
        suggestions: [
          "Vérifier la nature des déductions",
          "Confirmer l'autorisation de l'employé",
          "Valider les calculs de déduction",
          "Documenter les raisons des déductions",
        ],
      }
    }

    return null
  }

  private detectTaxInconsistency(entry: any): Partial<PayrollAnomaly> | null {
    const incomeTax = entry.income_tax || 0
    const grossSalary = entry.gross_salary
    const expectedTaxRate = this.calculateExpectedTaxRate(grossSalary)
    const actualTaxRate = (incomeTax / grossSalary) * 100
    const deviation = Math.abs(actualTaxRate - expectedTaxRate)

    // Flag if deviation > 5%
    if (deviation > 5) {
      return {
        id: `tax_inconsistent_${entry.id}`,
        type: "tax_inconsistent",
        severity: deviation > 10 ? "high" : "medium",
        description: `Taux d'imposition incohérent: ${actualTaxRate.toFixed(1)}% (attendu: ~${expectedTaxRate.toFixed(1)}%)`,
        detectedValue: actualTaxRate,
        expectedRange: { min: expectedTaxRate - 2, max: expectedTaxRate + 2 },
        confidence: 0.82,
        suggestions: [
          "Vérifier le taux d'imposition appliqué",
          "Confirmer la situation fiscale de l'employé",
          "Valider les paramètres de calcul fiscal",
          "Consulter un expert comptable si nécessaire",
        ],
      }
    }

    return null
  }

  private detectIrregularBonus(entry: any, historicalData?: any[]): Partial<PayrollAnomaly> | null {
    const bonuses = entry.bonuses || 0
    const grossSalary = entry.gross_salary
    const bonusPercentage = (bonuses / grossSalary) * 100

    // Flag unusual bonus amounts
    if (bonusPercentage > 50) {
      // Bonus > 50% of salary
      return {
        id: `bonus_irregular_${entry.id}`,
        type: "bonus_irregular",
        severity: bonusPercentage > 100 ? "high" : "medium",
        description: `Prime exceptionnellement élevée: €${bonuses} (${bonusPercentage.toFixed(1)}% du salaire)`,
        detectedValue: bonuses,
        expectedRange: { min: 0, max: grossSalary * 0.3 },
        confidence: 0.78,
        suggestions: [
          "Vérifier la justification de la prime",
          "Confirmer l'approbation de la direction",
          "Documenter la nature de la prime",
          "Vérifier l'impact fiscal",
        ],
      }
    }

    return null
  }

  private getPositionSalaryRange(position: string): { min: number; max: number } {
    // Simplified position-based salary ranges (in EUR)
    const ranges: Record<string, { min: number; max: number }> = {
      Développeur: { min: 3000, max: 6000 },
      "Chef de projet": { min: 4000, max: 8000 },
      Analyste: { min: 3500, max: 6500 },
      Manager: { min: 5000, max: 10000 },
      Directeur: { min: 8000, max: 15000 },
      Stagiaire: { min: 600, max: 1500 },
      Assistant: { min: 2000, max: 3500 },
    }

    return ranges[position] || { min: 2000, max: 8000 } // Default range
  }

  private calculateExpectedTaxRate(grossSalary: number): number {
    // Simplified French tax calculation (approximate)
    if (grossSalary <= 3000) return 8
    if (grossSalary <= 5000) return 12
    if (grossSalary <= 8000) return 18
    if (grossSalary <= 12000) return 25
    return 30
  }

  private groupAnomaliesByType(anomalies: PayrollAnomaly[]): Record<string, number> {
    return anomalies.reduce(
      (acc, anomaly) => {
        acc[anomaly.type] = (acc[anomaly.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private groupAnomaliesBySeverity(anomalies: PayrollAnomaly[]): Record<string, number> {
    return anomalies.reduce(
      (acc, anomaly) => {
        acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }

  private calculateRiskScore(anomalies: PayrollAnomaly[]): number {
    const weights = { critical: 10, high: 6, medium: 3, low: 1 }
    const totalScore = anomalies.reduce((sum, anomaly) => sum + weights[anomaly.severity], 0)
    const maxPossibleScore = anomalies.length * weights.critical
    return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0
  }

  private generateRecommendations(anomalies: PayrollAnomaly[]): string[] {
    const recommendations = new Set<string>()

    if (anomalies.some((a) => a.type === "salary_spike")) {
      recommendations.add("Mettre en place un processus de validation pour les augmentations salariales importantes")
    }

    if (anomalies.some((a) => a.type === "overtime_excessive")) {
      recommendations.add("Réviser la gestion des heures supplémentaires et la charge de travail")
    }

    if (anomalies.some((a) => a.severity === "critical")) {
      recommendations.add("Effectuer un audit complet des données de paie critiques")
    }

    if (anomalies.length > 10) {
      recommendations.add("Considérer une formation sur les bonnes pratiques de gestion de paie")
    }

    return Array.from(recommendations)
  }
}
