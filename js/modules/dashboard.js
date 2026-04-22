/**
 * Módulo: Dashboard
 *
 * Renderiza el resumen general con estadísticas rápidas.
 */

const dashboard = (() => {
    /**
     * Renderiza el panel principal del dashboard
     * @param {HTMLElement} container - Contenedor destino
     * @param {string} section - Sección solicitada (no usada aquí)
     */
    const render = async (container, section) => {
        try {
            let employees = await APIService.getEmployees();
            
            // Asegurar que employees es un array
            if (!Array.isArray(employees)) {
                console.warn('Employees response is not an array:', employees);
                employees = [];
            }
            
            const isActiveEmployee = (e) => {
                if (typeof e.is_active === 'boolean') return e.is_active;
                const status = String(e.status || '').toLowerCase();
                if (!status) return true;
                return status !== 'inactive' && status !== 'inactivo';
            };

            container.innerHTML = `
                <div class="dashboard-content">
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-info">
                                <h3>Total Empleados</h3>
                                <p class="stat-value">${employees.length}</p>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon">💼</div>
                            <div class="stat-info">
                                <h3>Empleados Activos</h3>
                                <p class="stat-value">${employees.filter(isActiveEmployee).length}</p>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-info">
                                <h3>Nómina del Mes</h3>
                                <p class="stat-value">${Helpers.formatCurrency(calculateMonthlyPayroll(employees))}</p>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-info">
                                <h3>Promedio Salario</h3>
                                <p class="stat-value">${Helpers.formatCurrency(calculateAverageSalary(employees))}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error rendering dashboard:', error);
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const calculateMonthlyPayroll = (employees) => {
        return employees.reduce((total, emp) => {
            const salary = parseFloat(emp.monthly_salary) || 0;
            return total + salary;
        }, 0);
    };

    const calculateAverageSalary = (employees) => {
        if (employees.length === 0) return 0;
        return calculateMonthlyPayroll(employees) / employees.length;
    };

    const renderRecentEmployees = (container, employees) => {
        const recentList = document.getElementById('recentEmployeesList');
        if (!recentList) return;

        const recent = employees.slice(0, 5);
        
        if (recent.length === 0) {
            recentList.innerHTML = '<p class="empty-message">No hay empleados registrados</p>';
            return;
        }

        recentList.innerHTML = `
            <table class="employees-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Salario</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${recent.map(emp => `
                        <tr>
                            <td>${emp.first_name} ${emp.last_name}</td>
                            <td>${emp.email}</td>
                            <td><span class="badge">${emp.employment_type}</span></td>
                            <td>${Helpers.formatCurrency(emp.monthly_salary)}</td>
                            <td>
                                <span class="status-badge status-${emp.status}">
                                    ${emp.status}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    };

    const renderCharts = (employees) => {
        // Distribucion por tipo de empleado
        renderEmployeeTypeChart(employees);

        // Distribucion salarial
        renderSalaryDistributionChart(employees);
    };

    const renderEmployeeTypeChart = (employees) => {
        const ctx = document.getElementById('employeeTypeChart');
        if (!ctx) return;

        const types = Constants.EMPLOYEE_TYPES;
        const typeData = {
            'Salaried': employees.filter(e => e.employment_type === 'Salaried').length,
            'Hourly': employees.filter(e => e.employment_type === 'Hourly').length,
            'Commission': employees.filter(e => e.employment_type === 'Commission').length,
            'Temporary': employees.filter(e => e.employment_type === 'Temporary').length
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Asalariados', 'Por Horas', 'Comisión', 'Temporal'],
                datasets: [{
                    data: [typeData['Salaried'], typeData['Hourly'], typeData['Commission'], typeData['Temporary']],
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#e74c3c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    };

    const renderSalaryDistributionChart = (employees) => {
        const ctx = document.getElementById('salaryDistributionChart');
        if (!ctx) return;

        // Salarios agrupados por rangos
        const ranges = {
            '0-500k': 0,
            '500k-1M': 0,
            '1M-2M': 0,
            '2M-5M': 0,
            '5M+': 0
        };

        employees.forEach(emp => {
            const salary = parseFloat(emp.monthly_salary) || 0;
            if (salary < 500000) ranges['0-500k']++;
            else if (salary < 1000000) ranges['500k-1M']++;
            else if (salary < 2000000) ranges['1M-2M']++;
            else if (salary < 5000000) ranges['2M-5M']++;
            else ranges['5M+']++;
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges),
                datasets: [{
                    label: 'Cantidad de Empleados',
                    data: Object.values(ranges),
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'x',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    };

    return {
        render
    };
})();

// Exposer globally
window.dashboard = dashboard;
