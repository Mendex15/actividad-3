/**
 * SERVICIO: PayslipGenerator
 * 
 * Genera recibos de pago (payslips) en HTML y PDF
 * Principios SOLID: Single Responsibility - solo responsable de generar recibos
 */

class PayslipGenerator {
    /**
     * Genera HTML del recibo de pago
     */
    static generatePayslipHTML(employee, payroll, month, year) {
        const monthName = new Date(year, month - 1).toLocaleString('es-CO', { month: 'long' });
        const currentDate = new Date().toLocaleDateString('es-CO');

        let html = `
            <div class="payslip-content" id="payslip-${employee.id}">
                <div class="payslip-header">
                    <h3>RECIBO DE PAGO</h3>
                    <p class="payslip-period">${monthName} de ${year}</p>
                </div>

                <div class="payslip-employee">
                    <div class="payslip-field">
                        <label>Empleado</label>
                        <value>${employee.name}</value>
                    </div>
                    <div class="payslip-field">
                        <label>ID Empleado</label>
                        <value>#${employee.id}</value>
                    </div>
                    <div class="payslip-field">
                        <label>Tipo de Empleado</label>
                        <value>${this.formatEmployeeType(employee.employee_type)}</value>
                    </div>
                    <div class="payslip-field">
                        <label>Antigüedad</label>
                        <value>${employee.years_in_company} años</value>
                    </div>
        `;

        // Agregar campos específicos según tipo
        if (employee.employee_type === 'asalariado' || employee.employee_type === 'temporal') {
            html += `
                    <div class="payslip-field">
                        <label>Salario Mensual</label>
                        <value>$${this.formatCurrency(employee.monthly_salary)}</value>
                    </div>
            `;
        } else if (employee.employee_type === 'horas') {
            html += `
                    <div class="payslip-field">
                        <label>Tarifa por Hora</label>
                        <value>$${this.formatCurrency(employee.hourly_rate)}</value>
                    </div>
                    <div class="payslip-field">
                        <label>Horas Trabajadas</label>
                        <value>${employee.hours_worked}h</value>
                    </div>
            `;
        } else if (employee.employee_type === 'comision') {
            html += `
                    <div class="payslip-field">
                        <label>Salario Base</label>
                        <value>$${this.formatCurrency(employee.base_salary)}</value>
                    </div>
                    <div class="payslip-field">
                        <label>Ventas</label>
                        <value>$${this.formatCurrency(employee.sales)}</value>
                    </div>
            `;
        }

        html += `
                </div>

                <div class="payslip-calculations">
                    <div class="payslip-calc-row">
                        <span>Salario Bruto:</span>
                        <strong>$${this.formatCurrency(payroll.gross_salary)}</strong>
                    </div>
        `;

        if (payroll.bonuses > 0) {
            html += `
                    <div class="payslip-calc-row">
                        <span>+ Bonificaciones:</span>
                        <strong>$${this.formatCurrency(payroll.bonuses)}</strong>
                    </div>
            `;
        }

        if (payroll.benefits > 0) {
            html += `
                    <div class="payslip-calc-row">
                        <span>+ Beneficios:</span>
                        <strong>$${this.formatCurrency(payroll.benefits)}</strong>
                    </div>
            `;
        }

        html += `
                    <div class="payslip-calc-row total">
                        <span>Ingresos Totales:</span>
                        <strong>$${this.formatCurrency(payroll.gross_salary + payroll.bonuses + payroll.benefits)}</strong>
                    </div>

                    <div class="payslip-calc-row">
                        <span>- Pensión (4%):</span>
                        <strong>-$${this.formatCurrency(payroll.mandatory_deductions)}</strong>
                    </div>

                    <div class="payslip-calc-row net-salary">
                        <span>SALARIO NETO A RECIBIR:</span>
                        <strong>$${this.formatCurrency(payroll.net_salary)}</strong>
                    </div>
                </div>

                <div class="payslip-footer">
                    <p>Generado: ${currentDate}</p>
                    <p>Este recibo es válido como comprobante de pago</p>
                    <p>Sistema de Nómina © 2026</p>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Descarga recibo como PDF
     */
    static downloadPayslipPDF(employee, payroll, month, year) {
        const monthName = new Date(year, month - 1).toLocaleString('es-CO', { month: 'long' });
        const filename = `Recibo_${employee.name.replace(/\s+/g, '_')}_${year}-${String(month).padStart(2, '0')}.pdf`;

        const element = document.getElementById(`payslip-${employee.id}`);
        if (!element) {
            alert('Error generando PDF');
            return;
        }

        const opt = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'letter' }
        };

        html2pdf().set(opt).from(element).save();
    }

    /**
     * Imprime recibo
     */
    static printPayslip(employee) {
        const element = document.getElementById(`payslip-${employee.id}`);
        if (!element) {
            alert('Error al imprimir');
            return;
        }

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Recibo de Pago</title>');
        printWindow.document.write(`<style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .payslip-content { max-width: 600px; }
            .payslip-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .payslip-header h3 { margin: 0; }
            .payslip-calculations { margin: 20px 0; }
            .payslip-calc-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .payslip-calc-row.total { font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; margin-top: 10px; }
            .payslip-calc-row.net-salary { font-size: 18px; font-weight: bold; background: #d4edda; padding: 12px; margin-top: 10px; }
        </style>`);
        printWindow.document.write('</head><body>');
        printWindow.document.write(element.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    /**
     * Formatea tipo de empleado
     */
    static formatEmployeeType(type) {
        const types = {
            'asalariado': 'Empleado Asalariado',
            'horas': 'Empleado por Horas',
            'comision': 'Empleado por Comisión',
            'temporal': 'Empleado Temporal'
        };
        return types[type] || type;
    }

    /**
     * Formatea número a currency
     */
    static formatCurrency(value) {
        return Number(value).toLocaleString('es-CO', { minimumFractionDigits: 0 });
    }
}
