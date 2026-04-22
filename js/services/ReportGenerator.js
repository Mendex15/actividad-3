/**
 * SERVICIO: ReportGenerator
 * 
 * Genera reportes, gráficos y exporta datos
 * Principios SOLID: Single Responsibility - solo responsable de generar reportes
 */

class ReportGenerator {
    /**
     * Genera gráfico de distribución de salarios por tipo
     */
    static generateSalaryDistributionChart(employees) {
        const salaryByType = {
            'asalariado': 0,
            'horas': 0,
            'comision': 0,
            'temporal': 0
        };

        const countByType = {
            'asalariado': 0,
            'horas': 0,
            'comision': 0,
            'temporal': 0
        };

        employees.forEach(emp => {
            const type = emp.employee_type;
            countByType[type]++;

            if (emp.employee_type === 'asalariado' || emp.employee_type === 'temporal') {
                salaryByType[type] += emp.monthly_salary || 0;
            } else if (emp.employee_type === 'horas') {
                const salary = (emp.hours_worked || 0) * (emp.hourly_rate || 0);
                salaryByType[type] += salary;
            } else if (emp.employee_type === 'comision') {
                const salary = (emp.base_salary || 0) + ((emp.sales || 0) * (emp.commission_rate || 0));
                salaryByType[type] += salary;
            }
        });

        return { salaryByType, countByType };
    }

    /**
     * Crea gráfico con Chart.js
     */
    static createChart(canvasId, type, labels, data, title) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destruir gráfico anterior si existe
        if (window.charts && window.charts[canvasId]) {
            window.charts[canvasId].destroy();
        }

        if (!window.charts) window.charts = {};

        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

        const chartConfig = {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    fill: type === 'doughnut' || type === 'pie'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: title
                    }
                }
            }
        };

        window.charts[canvasId] = new Chart(ctx, chartConfig);
    }

    /**
     * Genera reporte mensual con totales y promedios
     */
    static generateMonthlyReport(employees, payrolls) {
        const report = {
            totalEmployees: employees.length,
            totalGrossSalary: 0,
            totalDeductions: 0,
            totalNetSalary: 0,
            totalBonuses: 0,
            totalBenefits: 0,
            averageNetSalary: 0,
            byType: {}
        };

        // Inicializar por tipo
        const types = ['asalariado', 'horas', 'comision', 'temporal'];
        types.forEach(type => {
            report.byType[type] = {
                count: 0,
                grossSalary: 0,
                deductions: 0,
                netSalary: 0,
                bonuses: 0,
                benefits: 0
            };
        });

        // Sumar payrolls
        payrolls.forEach(payroll => {
            const emp = employees.find(e => e.id === payroll.employee_id);
            if (!emp) return;

            const type = emp.employee_type;
            report.byType[type].count++;
            report.byType[type].grossSalary += payroll.gross_salary || 0;
            report.byType[type].deductions += payroll.mandatory_deductions || 0;
            report.byType[type].netSalary += payroll.net_salary || 0;
            report.byType[type].bonuses += payroll.bonuses || 0;
            report.byType[type].benefits += payroll.benefits || 0;

            report.totalGrossSalary += payroll.gross_salary || 0;
            report.totalDeductions += payroll.mandatory_deductions || 0;
            report.totalNetSalary += payroll.net_salary || 0;
            report.totalBonuses += payroll.bonuses || 0;
            report.totalBenefits += payroll.benefits || 0;
        });

        if (payrolls.length > 0) {
            report.averageNetSalary = Math.round(report.totalNetSalary / payrolls.length);
        }

        return report;
    }

    /**
     * Exporta empleados a CSV
     */
    static exportToCSV(employees) {
        let csv = 'ID,Nombre,Tipo,Años,Salario/Tarifa,Ventas,Datos Adicionales\n';

        employees.forEach(emp => {
            const salaryField = emp.employee_type === 'asalariado' || emp.employee_type === 'temporal' 
                ? emp.monthly_salary 
                : emp.employee_type === 'horas' 
                ? emp.hourly_rate 
                : emp.base_salary;

            const sales = emp.employee_type === 'comision' ? emp.sales : '';
            const additional = emp.employee_type === 'horas' ? `${emp.hours_worked}h,${emp.has_savings_fund ? 'Ahorro' : ''}` : '';

            csv += `${emp.id},"${emp.name}","${emp.employee_type}",${emp.years_in_company},${salaryField},"${sales}","${additional}"\n`;
        });

        return csv;
    }

    /**
     * Exporta reporte mensual a CSV
     */
    static exportReportToCSV(report, month, year) {
        let csv = `REPORTE DE NÓMINA - ${month}/${year}\n`;
        csv += `Generado: ${new Date().toLocaleString('es-CO')}\n\n`;

        csv += 'RESUMEN GENERAL\n';
        csv += `Total de Empleados,${report.totalEmployees}\n`;
        csv += `Salario Bruto Total,"$${this.formatCurrency(report.totalGrossSalary)}"\n`;
        csv += `Bonificaciones Total,"$${this.formatCurrency(report.totalBonuses)}"\n`;
        csv += `Beneficios Total,"$${this.formatCurrency(report.totalBenefits)}"\n`;
        csv += `Deducciones Total,"$${this.formatCurrency(report.totalDeductions)}"\n`;
        csv += `Salario Neto Total,"$${this.formatCurrency(report.totalNetSalary)}"\n`;
        csv += `Promedio de Salario Neto,"$${this.formatCurrency(report.averageNetSalary)}"\n\n`;

        csv += 'POR TIPO DE EMPLEADO\n';
        csv += 'Tipo,Cantidad,Salario Bruto,Bonificaciones,Beneficios,Deducciones,Salario Neto\n';

        Object.entries(report.byType).forEach(([type, data]) => {
            if (data.count > 0) {
                csv += `${type},${data.count},"$${this.formatCurrency(data.grossSalary)}","$${this.formatCurrency(data.bonuses)}","$${this.formatCurrency(data.benefits)}","$${this.formatCurrency(data.deductions)}","$${this.formatCurrency(data.netSalary)}"\n`;
            }
        });

        return csv;
    }

    /**
     * Descarga archivo CSV
     */
    static downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Formatea número a currency
     */
    static formatCurrency(value) {
        return Number(value).toLocaleString('es-CO', { minimumFractionDigits: 0 });
    }

    /**
     * Genera HTML de reporte mensual
     */
    static generateMonthlyReportHTML(report, month, year) {
        const monthName = new Date(year, month - 1).toLocaleString('es-CO', { month: 'long', year: 'numeric' });

        let html = `
            <div class="report-header">
                <h4>Periodo: ${monthName}</h4>
                <p class="report-generated">Generado: ${new Date().toLocaleString('es-CO')}</p>
            </div>

            <div class="report-grid">
                <div class="report-card">
                    <div class="report-label">Total de Empleados</div>
                    <div class="report-value">${report.totalEmployees}</div>
                </div>
                <div class="report-card">
                    <div class="report-label">Salario Bruto Total</div>
                    <div class="report-value">$${this.formatCurrency(report.totalGrossSalary)}</div>
                </div>
                <div class="report-card">
                    <div class="report-label">Bonificaciones</div>
                    <div class="report-value">$${this.formatCurrency(report.totalBonuses)}</div>
                </div>
                <div class="report-card">
                    <div class="report-label">Beneficios</div>
                    <div class="report-value">$${this.formatCurrency(report.totalBenefits)}</div>
                </div>
                <div class="report-card">
                    <div class="report-label">Deducciones</div>
                    <div class="report-value">-$${this.formatCurrency(report.totalDeductions)}</div>
                </div>
                <div class="report-card highlight">
                    <div class="report-label">Salario Neto Total</div>
                    <div class="report-value">$${this.formatCurrency(report.totalNetSalary)}</div>
                </div>
            </div>

            <table class="report-table">
                <thead>
                    <tr>
                        <th>Tipo de Empleado</th>
                        <th>Cantidad</th>
                        <th>Salario Bruto</th>
                        <th>Bonificaciones</th>
                        <th>Beneficios</th>
                        <th>Deducciones</th>
                        <th>Salario Neto</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.entries(report.byType).forEach(([type, data]) => {
            if (data.count > 0) {
                html += `
                    <tr>
                        <td>${type.toUpperCase()}</td>
                        <td>${data.count}</td>
                        <td>$${this.formatCurrency(data.grossSalary)}</td>
                        <td>$${this.formatCurrency(data.bonuses)}</td>
                        <td>$${this.formatCurrency(data.benefits)}</td>
                        <td>-$${this.formatCurrency(data.deductions)}</td>
                        <td><strong>$${this.formatCurrency(data.netSalary)}</strong></td>
                    </tr>
                `;
            }
        });

        html += `
                </tbody>
            </table>
        `;

        return html;
    }
}
