/**
 * SERVICIO: PayrollCalculator
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo responsable de calcular la nómina
 * - Dependency Inversion: Trabaja con la abstracción Employee, no con clases concretas
 * 
 * Este servicio calcula y genera reportes de nómina.
 */
class PayrollCalculator {
    /**
     * Constructor del calculador de nómina
     */
    constructor() {
        this.name = "PayrollCalculator";
    }

    /**
     * Calcula la nómina completa de un empleado
     * @param {Employee} employee - Instancia de un empleado (de cualquier tipo)
     * @returns {object} Desglose completo de la nómina del empleado
     */
    calculateEmployeePayroll(employee) {
        try {
            const salary = employee.calculateNetSalary();
            
            return {
                employeeId: employee.id,
                employeeName: employee.name,
                employeeType: employee.type,
                yearsInCompany: employee.yearsInCompany,
                ...salary,
                calculationDate: new Date().toLocaleDateString('es-CO')
            };
        } catch (error) {
            throw new Error(`Error calculando nómina para ${employee.name}: ${error.message}`);
        }
    }

    /**
     * Calcula la nómina completa para un grupo de empleados
     * @param {Array<Employee>} employees - Array de empleados
     * @returns {object} Resumen de nómina total
     */
    calculateTotalPayroll(employees) {
        if (!Array.isArray(employees) || employees.length === 0) {
            return {
                totalEmployees: 0,
                totalGrossSalaries: 0,
                totalBonuses: 0,
                totalBenefits: 0,
                totalDeductions: 0,
                totalNetSalaries: 0,
                byType: {},
                employees: []
            };
        }

        const payrollDetails = employees.map(emp => this.calculateEmployeePayroll(emp));
        
        // Agrupar por tipo de empleado
        const byType = {};
        payrollDetails.forEach(detail => {
            if (!byType[detail.employeeType]) {
                byType[detail.employeeType] = {
                    count: 0,
                    totalGross: 0,
                    totalBonuses: 0,
                    totalBenefits: 0,
                    totalDeductions: 0,
                    totalNet: 0
                };
            }
            
            byType[detail.employeeType].count++;
            byType[detail.employeeType].totalGross += detail.grossSalary;
            byType[detail.employeeType].totalBonuses += detail.bonuses;
            byType[detail.employeeType].totalBenefits += detail.benefits;
            byType[detail.employeeType].totalDeductions += detail.deductions;
            byType[detail.employeeType].totalNet += detail.netSalary;
        });

        // Totales generales
        const totals = {
            totalEmployees: payrollDetails.length,
            totalGrossSalaries: 0,
            totalBonuses: 0,
            totalBenefits: 0,
            totalDeductions: 0,
            totalNetSalaries: 0,
            byType: byType,
            employees: payrollDetails
        };

        payrollDetails.forEach(detail => {
            totals.totalGrossSalaries += detail.grossSalary;
            totals.totalBonuses += detail.bonuses;
            totals.totalBenefits += detail.benefits;
            totals.totalDeductions += detail.deductions;
            totals.totalNetSalaries += detail.netSalary;
        });

        return totals;
    }

    /**
     * Genera un reporte formateado de la nómina
     * @param {object} payrollSummary - Resultado de calculateTotalPayroll
     * @returns {string} Reporte en formato texto
     */
    generatePayrollReport(payrollSummary) {
        let report = "\n========== REPORTE DE NÓMINA ==========\n\n";
        
        report += `Total de Empleados: ${payrollSummary.totalEmployees}\n`;
        report += `Total Salarios Brutos: $${payrollSummary.totalGrossSalaries.toLocaleString('es-CO')}\n`;
        report += `Total Bonos: $${payrollSummary.totalBonuses.toLocaleString('es-CO')}\n`;
        report += `Total Beneficios: $${payrollSummary.totalBenefits.toLocaleString('es-CO')}\n`;
        report += `Total Deducciones: $${payrollSummary.totalDeductions.toLocaleString('es-CO')}\n`;
        report += `TOTAL NETO A PAGAR: $${payrollSummary.totalNetSalaries.toLocaleString('es-CO')}\n`;
        
        report += "\n--- Desglose por Tipo de Empleado ---\n";
        for (const [type, data] of Object.entries(payrollSummary.byType)) {
            report += `\n${type}:\n`;
            report += `  Cantidad: ${data.count}\n`;
            report += `  Salarios Brutos: $${data.totalGross.toLocaleString('es-CO')}\n`;
            report += `  Bonos: $${data.totalBonuses.toLocaleString('es-CO')}\n`;
            report += `  Beneficios: $${data.totalBenefits.toLocaleString('es-CO')}\n`;
            report += `  Deducciones: $${data.totalDeductions.toLocaleString('es-CO')}\n`;
            report += `  Neto: $${data.totalNet.toLocaleString('es-CO')}\n`;
        }
        
        report += "\n======================================\n";
        return report;
    }

    /**
     * Valida que el cálculo de nómina sea válido
     * @param {Employee} employee - Empleado a validar
     * @returns {object} Resultado de la validación
     */
    validatePayroll(employee) {
        const issues = [];
        
        try {
            const salary = employee.calculateNetSalary();
            
            if (salary.netSalary < 0) {
                issues.push("El salario neto es negativo");
            }
            
            if (salary.grossSalary < 0) {
                issues.push("El salario bruto es negativo");
            }
            
            if (salary.deductions > salary.totalIncome) {
                issues.push("Las deducciones superan el ingreso total");
            }
        } catch (error) {
            issues.push(`Error en cálculo: ${error.message}`);
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }
}
