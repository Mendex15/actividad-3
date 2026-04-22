/**
 * Reports Module - Charts and reports
 */

const reports = (() => {
    const render = async (container, section) => {
        try {
            await renderReportsPanel(container);
        } catch (error) {
            console.error('Error rendering reports module:', error);
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const renderReportsPanel = async (container) => {
        try {
            let employees = await APIService.getEmployees();
            
            // Asegurar que employees es un array
            if (!Array.isArray(employees)) {
                console.warn('Employees response is not an array:', employees);
                employees = [];
            }

            container.innerHTML = `
                <div class="reports-container">
                    <div class="panel">
                        <h2>Reportes y Análisis</h2>
                        
                        <div class="reports-controls">
                            <select id="reportTypeSelect" class="filter-select">
                                <option value="salaries">Distribución de Salarios</option>
                                <option value="employees">Empleados por Tipo</option>
                                <option value="status">Estado de Empleados</option>
                                <option value="monthly">Nómina Mensual</option>
                            </select>
                            <button id="exportReportBtn" class="btn btn-secondary">
                                📥 Exportar a CSV
                            </button>
                            <button id="printReportBtn" class="btn btn-secondary">
                                🖨️ Imprimir
                            </button>
                        </div>

                        <div class="reports-charts">
                            <div class="chart-container">
                                <canvas id="reportChart"></canvas>
                            </div>
                        </div>

                        <div class="reports-stats">
                            <h3>Estadísticas Generales</h3>
                            <div id="statsContainer"></div>
                        </div>
                    </div>
                </div>
            `;

            renderSalariesReport(container, employees);
            setupReportsHandlers(container, employees);

        } catch (error) {
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const renderSalariesReport = (container, employees) => {
        if (!employees || employees.length === 0) return;

        // Calculate salary statistics
        const salaries = employees.map(e => parseFloat(e.monthly_salary) || 0);
        const totalSalary = salaries.reduce((a, b) => a + b, 0);
        const avgSalary = totalSalary / salaries.length;
        const minSalary = Math.min(...salaries);
        const maxSalary = Math.max(...salaries);

        // Salary ranges
        const ranges = {
            '0-500k': salaries.filter(s => s < 500000).length,
            '500k-1M': salaries.filter(s => s >= 500000 && s < 1000000).length,
            '1M-2M': salaries.filter(s => s >= 1000000 && s < 2000000).length,
            '2M-5M': salaries.filter(s => s >= 2000000 && s < 5000000).length,
            '5M+': salaries.filter(s => s >= 5000000).length
        };

        renderChart('Distribución de Salarios', Object.keys(ranges), Object.values(ranges), 'bar');
        
        const statsContainer = container.querySelector('#statsContainer');
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-box">
                    <h4>Total en Nómina</h4>
                    <p class="stat-big">${Helpers.formatCurrency(totalSalary)}</p>
                </div>
                <div class="stat-box">
                    <h4>Promedio</h4>
                    <p class="stat-big">${Helpers.formatCurrency(avgSalary)}</p>
                </div>
                <div class="stat-box">
                    <h4>Mínimo</h4>
                    <p class="stat-big">${Helpers.formatCurrency(minSalary)}</p>
                </div>
                <div class="stat-box">
                    <h4>Máximo</h4>
                    <p class="stat-big">${Helpers.formatCurrency(maxSalary)}</p>
                </div>
            </div>
        `;
    };

    const renderChart = (title, labels, data, type = 'bar') => {
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js no está cargado');
        }

        const canvas = document.getElementById('reportChart');
        if (!canvas) return;

        // Destroy existing chart if any
        if (window.reportChart && typeof window.reportChart.destroy === 'function') {
            window.reportChart.destroy();
        } else if (window.reportChart) {
            // Si quedó algo viejo/no compatible en la variable global
            window.reportChart = null;
        }

        window.reportChart = new Chart(canvas, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#e74c3c',
                        '#9b59b6'
                    ],
                    borderColor: [
                        '#2980b9',
                        '#27ae60',
                        '#d68910',
                        '#c0392b',
                        '#8e44ad'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: title
                    }
                }
            }
        });
    };

    const setupReportsHandlers = (container, employees) => {
        const reportTypeSelect = container.querySelector('#reportTypeSelect');
        const exportBtn = container.querySelector('#exportReportBtn');
        const printBtn = container.querySelector('#printReportBtn');

        reportTypeSelect.addEventListener('change', (e) => {
            const reportType = e.target.value;
            switch (reportType) {
                case 'salaries':
                    renderSalariesReport(container, employees);
                    break;
                case 'employees':
                    renderEmployeeTypesReport(container, employees);
                    break;
                case 'status':
                    renderStatusReport(container, employees);
                    break;
                case 'monthly':
                    renderMonthlyReport(container, employees);
                    break;
            }
        });

        exportBtn.addEventListener('click', () => {
            exportReportToCSV(employees);
        });

        printBtn.addEventListener('click', () => {
            window.print();
        });
    };

    const renderEmployeeTypesReport = (container, employees) => {
        const types = {
            'Asalariados': employees.filter(e => e.employee_type === 'asalariado').length,
            'Por Horas': employees.filter(e => e.employee_type === 'horas').length,
            'Comisión': employees.filter(e => e.employee_type === 'comision').length,
            'Temporal': employees.filter(e => e.employee_type === 'temporal').length
        };

        renderChart('Empleados por Tipo', Object.keys(types), Object.values(types), 'doughnut');

        const statsContainer = container.querySelector('#statsContainer');
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-box">
                    <h4>Asalariados</h4>
                    <p class="stat-big">${types['Asalariados']}</p>
                </div>
                <div class="stat-box">
                    <h4>Por Horas</h4>
                    <p class="stat-big">${types['Por Horas']}</p>
                </div>
                <div class="stat-box">
                    <h4>Comisión</h4>
                    <p class="stat-big">${types['Comisión']}</p>
                </div>
                <div class="stat-box">
                    <h4>Temporal</h4>
                    <p class="stat-big">${types['Temporal']}</p>
                </div>
            </div>
        `;
    };

    const renderStatusReport = (container, employees) => {
        const activeCount = employees.filter(e => e.is_active === true || e.is_active === 1).length;
        const inactiveCount = employees.length - activeCount;
        const statuses = {
            'Activos': activeCount,
            'Inactivos': inactiveCount
        };

        renderChart('Estado de Empleados', Object.keys(statuses), Object.values(statuses), 'bar');

        const statsContainer = container.querySelector('#statsContainer');
        const activePercent = employees.length > 0 ? ((activeCount / employees.length) * 100).toFixed(1) : 0;

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-box">
                    <h4>Activos</h4>
                    <p class="stat-big">${activeCount}</p>
                    <small>${activePercent}%</small>
                </div>
                <div class="stat-box">
                    <h4>Inactivos</h4>
                    <p class="stat-big">${inactiveCount}</p>
                    <small>${(100 - activePercent).toFixed(1)}%</small>
                </div>
            </div>
        `;
    };

    const renderMonthlyReport = (container, employees) => {
        if (!employees || employees.length === 0) {
            const statsContainer = container.querySelector('#statsContainer');
            statsContainer.innerHTML = '<p class="empty-message">No hay empleados para mostrar</p>';
            return;
        }

        // Calculate salary ranges for payroll
        const salaries = employees.map(e => parseFloat(e.monthly_salary) || 0);
        const ranges = {
            '0-500k': salaries.filter(s => s < 500000).length,
            '500k-1M': salaries.filter(s => s >= 500000 && s < 1000000).length,
            '1M-2M': salaries.filter(s => s >= 1000000 && s < 2000000).length,
            '2M-5M': salaries.filter(s => s >= 2000000 && s < 5000000).length,
            '5M+': salaries.filter(s => s >= 5000000).length
        };

        const totalPayroll = salaries.reduce((sum, s) => sum + s, 0);
        const avgSalary = totalPayroll / employees.length;

        renderChart('Nómina Mensual por Rango', 
            Object.keys(ranges),
            Object.values(ranges),
            'bar'
        );

        const statsContainer = container.querySelector('#statsContainer');
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-box">
                    <h4>Total Nómina</h4>
                    <p class="stat-big">${Helpers.formatCurrency(totalPayroll)}</p>
                </div>
                <div class="stat-box">
                    <h4>Promedio por Empleado</h4>
                    <p class="stat-big">${Helpers.formatCurrency(avgSalary)}</p>
                </div>
                <div class="stat-box">
                    <h4>Total Empleados</h4>
                    <p class="stat-big">${employees.length}</p>
                </div>
            </div>
        `;
    };

    const exportReportToCSV = (employees) => {
        try {
            const headers = ['Nombre', 'Email', 'Teléfono', 'Tipo', 'Salario', 'Antigüedad', 'Estado'];
            const rows = employees.map(emp => {
                const statusText = (emp.is_active === true || emp.is_active === 1) ? 'Activo' : 'Inactivo';
                const typeText = {
                    'asalariado': 'Asalariado',
                    'horas': 'Por Horas',
                    'comision': 'Comisión',
                    'temporal': 'Temporal'
                }[emp.employee_type] || emp.employee_type;
                
                return [
                    emp.name || '',
                    emp.email || '',
                    emp.phone || '',
                    typeText,
                    emp.monthly_salary || 0,
                    emp.years_in_company || 0,
                    statusText
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => {
                    // Escape comillas y espacios en las celdas
                    const cellStr = String(cell);
                    return cellStr.includes(',') || cellStr.includes('"') 
                        ? `"${cellStr.replace(/"/g, '""')}"` 
                        : cellStr;
                }).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reportes_empleados_${Helpers.getCurrentDate()}.csv`;
            a.click();

            Helpers.showNotification('Reporte exportado exitosamente', 'success');
        } catch (error) {
            Helpers.showNotification('Error exportando reporte: ' + error.message, 'error');
        }
    };

    return {
        render
    };
})();

// Expose globally
window.reports = reports;
