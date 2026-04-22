/**
 * Módulo: Nómina
 *
 * Renderiza el resumen y el historial de nómina.
 */

const payroll = (() => {
    /**
     * Renderiza la sección de nómina solicitada
     * @param {HTMLElement} container - Contenedor destino
     * @param {string} section - Sección a renderizar
     */
    const render = async (container, section) => {
        try {
            if (section === 'summary') {
                await renderPayrollSummary(container);
            } else if (section === 'history') {
                await renderPayrollHistory(container);
            }
        } catch (error) {
            console.error('Error rendering payroll module:', error);
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const renderPayrollSummary = async (container) => {
        try {
            const { month, year } = Helpers.getCurrentMonth();
            let payroll = [];

            try {
                const response = await APIService.getPayrollByPeriod(month, year);
                payroll = response.payrolls || response || [];
                if (!Array.isArray(payroll)) {
                    payroll = [];
                }
            } catch (error) {
                // Si no hay nóminas para el período, mostrar opción de generar
                if (error.message && error.message.includes('No se encontraron')) {
                    payroll = [];
                } else {
                    throw error;
                }
            }

            const totalAmount = payroll.reduce((sum, item) => sum + parseFloat(item.net_salary || 0), 0);
            const totalDeductions = payroll.reduce((sum, item) => sum + parseFloat(item.mandatory_deductions || item.total_deductions || 0), 0);
            const totalBenefits = payroll.reduce((sum, item) => sum + parseFloat(item.benefits || 0), 0);

            let html = `
                <div class="panel">
                    <h2>Resumen de Nómina - ${month}/${year}</h2>
            `;

            // Si no hay nóminas, mostrar botón para generar
            if (payroll.length === 0) {
                html += `
                    <div style="padding: 30px; text-align: center; background: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #64748b; margin-bottom: 15px;">No hay nóminas calculadas para ${month}/${year}</p>
                        <button id="generatePayrollBtn" class="btn btn-primary" style="display: inline-block;">
                            📊 Generar Nómina del Mes
                        </button>
                    </div>
                `;
            }

            html += `
                    <div class="payroll-summary-cards">
                        <div class="summary-card">
                            <h4>Total Empleados</h4>
                            <p class="summary-value">${payroll.length}</p>
                        </div>
                        <div class="summary-card">
                            <h4>Nómina Total</h4>
                            <p class="summary-value">${Helpers.formatCurrency(totalAmount)}</p>
                        </div>
                        <div class="summary-card">
                            <h4>Total Deducciones</h4>
                            <p class="summary-value">${Helpers.formatCurrency(totalDeductions)}</p>
                        </div>
                        <div class="summary-card">
                            <h4>Total Beneficios</h4>
                            <p class="summary-value">${Helpers.formatCurrency(totalBenefits)}</p>
                        </div>
                    </div>
            `;

            // Tabla de detalle si hay nóminas
            if (payroll.length > 0) {
                html += `
                    <div class="payroll-table-container">
                        <h3>Detalle de Nómina</h3>
                        <table class="payroll-table">
                            <thead>
                                <tr>
                                    <th>Empleado</th>
                                    <th>Tipo</th>
                                    <th>Salario Base</th>
                                    <th>Deducciones</th>
                                    <th>Beneficios</th>
                                    <th>Neto</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payroll.map(item => `
                                    <tr>
                                        <td>${item.employee_name || item.name || ''}</td>
                                        <td><span class="badge">${item.employee_type || item.employment_type}</span></td>
                                        <td>${Helpers.formatCurrency(item.gross_salary)}</td>
                                        <td>${Helpers.formatCurrency(item.mandatory_deductions || item.total_deductions || 0)}</td>
                                        <td>${Helpers.formatCurrency(item.benefits || 0)}</td>
                                        <td><strong>${Helpers.formatCurrency(item.net_salary)}</strong></td>
                                        <td>
                                            <button class="btn-action view-slip" data-id="${item.employee_id}">📄</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }

            html += `
                </div>
            `;

            container.innerHTML = html;
            setupPayrollHandlers(container, payroll);

        } catch (error) {
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const renderPayrollHistory = async (container) => {
        try {
            let employees = await APIService.getEmployees();
            
            // Asegurar que employees es un array
            if (!Array.isArray(employees)) {
                console.warn('Employees response is not an array:', employees);
                employees = [];
            }

            container.innerHTML = `
                <div class="panel">
                    <h2>Historial de Nóminas</h2>
                    
                    <div class="history-filters">
                        <select id="employeeFilter" class="filter-select">
                            <option value="">Todos los empleados</option>
                            ${employees.map(emp => `
                                <option value="${emp.id}">
                                    ${emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()}
                                </option>
                            `).join('')}
                        </select>
                        <input type="month" id="monthFilter" class="filter-input">
                    </div>

                    <div id="historyTableContainer"></div>
                </div>
            `;

            setupHistoryHandlers(container, employees);

        } catch (error) {
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const setupPayrollHandlers = (container, payroll) => {
        const generateBtn = container.querySelector('#generatePayrollBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', async () => {
                try {
                    generateBtn.disabled = true;
                    generateBtn.textContent = 'Generando...';

                    const { month, year } = Helpers.getCurrentMonth();
                    
                    // Llamar a endpoint de generación de nómina
                    const response = await fetch('http://localhost:3001/api/employees/generate-payroll', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${APIService.getToken()}`
                        },
                        body: JSON.stringify({ month, year })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Error generando nómina');
                    }

                    const result = await response.json();
                    Helpers.showNotification('Nómina generada exitosamente', 'success');

                    // Recargar el módulo
                    setTimeout(() => {
                        renderPayrollSummary(container);
                    }, 1000);
                } catch (error) {
                    Helpers.showNotification(error.message || 'Error generando nómina', 'error');
                    generateBtn.disabled = false;
                    generateBtn.textContent = '📊 Generar Nómina del Mes';
                }
            });
        }

        container.querySelectorAll('.view-slip').forEach(btn => {
            btn.addEventListener('click', async () => {
                const employeeId = btn.dataset.id;
                const item = payroll.find(p => p.employee_id == employeeId);
                if (item) {
                    showPayslipModal(item);
                }
            });
        });
    };

    const setupHistoryHandlers = (container, employees) => {
        const employeeFilter = container.querySelector('#employeeFilter');
        const monthFilter = container.querySelector('#monthFilter');

        const loadHistory = async () => {
            const historyContainer = container.querySelector('#historyTableContainer');
            const employeeId = employeeFilter.value;
            const monthValue = monthFilter.value;

            const parseMonthValue = (value) => {
                if (!value || typeof value !== 'string') return null;
                const parts = value.split('-');
                if (parts.length !== 2) return null;
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10);
                if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return null;
                return { month: m, year: y };
            };

            const employeeMap = new Map((employees || []).map(e => [String(e.id), e]));
            const selectedEmployee = employeeId ? employeeMap.get(String(employeeId)) : null;
            const period = parseMonthValue(monthValue);

            const renderRows = (rows, opts = {}) => {
                const title = opts.title || 'Historial de Nóminas';
                if (!rows || rows.length === 0) {
                    historyContainer.innerHTML = `<p class="empty-message">No se encontraron nóminas para el filtro seleccionado</p>`;
                    return;
                }

                const showPeriodCol = Boolean(opts.showPeriodCol);
                historyContainer.innerHTML = `
                    <div class="payroll-table-container">
                        <h3>${title}</h3>
                        <table class="payroll-table">
                            <thead>
                                <tr>
                                    ${showPeriodCol ? '<th>Período</th>' : ''}
                                    <th>Empleado</th>
                                    <th>Tipo</th>
                                    <th>Salario Base</th>
                                    <th>Deducciones</th>
                                    <th>Beneficios</th>
                                    <th>Neto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.map(r => {
                                    const periodLabel = (r.month && r.year) ? `${r.month}/${r.year}` : '';
                                    const name = r.employee_name || r.name || (selectedEmployee && selectedEmployee.name) || '';
                                    const type = r.employee_type || r.employment_type || (selectedEmployee && selectedEmployee.employee_type) || '';
                                    return `
                                        <tr>
                                            ${showPeriodCol ? `<td>${periodLabel}</td>` : ''}
                                            <td>${name}</td>
                                            <td><span class="badge">${type}</span></td>
                                            <td>${Helpers.formatCurrency(r.gross_salary || 0)}</td>
                                            <td>${Helpers.formatCurrency(r.mandatory_deductions || r.total_deductions || 0)}</td>
                                            <td>${Helpers.formatCurrency(r.benefits || 0)}</td>
                                            <td><strong>${Helpers.formatCurrency(r.net_salary || 0)}</strong></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            };

            historyContainer.innerHTML = `<p class="empty-message">Cargando...</p>`;

            try {
                // Caso 1: Todos los empleados + mes seleccionado => by-period
                if (!employeeId) {
                    if (!period) {
                        historyContainer.innerHTML = `<p class="empty-message">Selecciona un mes para ver el historial</p>`;
                        return;
                    }
                    const response = await APIService.getPayrollByPeriod(period.month, period.year);
                    const payrolls = response.payrolls || response || [];
                    renderRows(payrolls, {
                        title: `Nóminas del período ${period.month}/${period.year}`,
                        showPeriodCol: false
                    });
                    return;
                }

                // Caso 2: Empleado seleccionado + mes seleccionado => nómina específica
                if (employeeId && period) {
                    const resp = await APIService.getEmployeePayrollByPeriod(employeeId, period.month, period.year);
                    const payroll = resp && resp.payroll ? [resp.payroll] : [];
                    renderRows(payroll, {
                        title: `Nómina de ${selectedEmployee ? selectedEmployee.name : 'empleado'} - ${period.month}/${period.year}`,
                        showPeriodCol: false
                    });
                    return;
                }

                // Caso 3: Empleado seleccionado sin mes => histórico del empleado
                const resp = await APIService.getEmployeePayrollHistory(employeeId, 24);
                const history = resp.history || [];

                // En este endpoint, el nombre viene en employee_name, pero el registro no incluye tipo.
                const rows = history.map(h => ({
                    ...h,
                    employee_name: resp.employee_name || (selectedEmployee && selectedEmployee.name) || h.employee_name,
                    employee_type: (selectedEmployee && selectedEmployee.employee_type) || h.employee_type
                }));

                renderRows(rows, {
                    title: `Histórico de ${selectedEmployee ? selectedEmployee.name : 'empleado'}`,
                    showPeriodCol: true
                });
            } catch (err) {
                historyContainer.innerHTML = `<p class="empty-message">${err.message || 'Error cargando historial'}</p>`;
            }
        };

        employeeFilter.addEventListener('change', loadHistory);
        monthFilter.addEventListener('change', loadHistory);

        // Cargar por defecto el mes actual
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        if (!monthFilter.value) {
            monthFilter.value = `${yyyy}-${mm}`;
        }
        loadHistory();
    };

    const showPayslipModal = (payrollItem) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const empName = payrollItem.employee_name || payrollItem.name || 'Empleado';
        const month = payrollItem.month || Helpers.getCurrentMonth().month;
        const year = payrollItem.year || Helpers.getCurrentMonth().year;
        
        const grossSalary = Number(payrollItem.gross_salary || 0);
        const bonuses = Number(payrollItem.bonuses || 0);
        const benefits = Number(payrollItem.benefits || 0);
        const deductions = Number(payrollItem.mandatory_deductions || payrollItem.total_deductions || 0);
        const netSalary = Number(payrollItem.net_salary || 0);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Comprobante de Nómina - ${empName}</h3>
                    <button class="modal-close" type="button">&times;</button>
                </div>
                <div id="payslipContent" style="padding: 25px;">
                    <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <p style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Empleado</p>
                                <p style="font-weight: 600; color: #2c3e50;">${empName}</p>
                            </div>
                            <div>
                                <p style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Período</p>
                                <p style="font-weight: 600; color: #2c3e50;">${month}/${year}</p>
                            </div>
                            <div>
                                <p style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Tipo de Empleado</p>
                                <p style="font-weight: 600; color: #2c3e50;">${payrollItem.employee_type || payrollItem.employment_type || 'N/A'}</p>
                            </div>
                            <div>
                                <p style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Estado</p>
                                <p style="font-weight: 600; color: #2c3e50;">${payrollItem.status || 'Pendiente'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f9fafb; border-radius: 8px; padding: 20px;">
                        <div style="display: grid; gap: 15px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <p style="color: #64748b; font-size: 13px; margin-bottom: 5px; text-transform: uppercase;">Salario Base</p>
                                    <p style="font-size: 20px; font-weight: 700; color: #27ae60;">${Helpers.formatCurrency(grossSalary)}</p>
                                </div>
                                <div>
                                    <p style="color: #64748b; font-size: 13px; margin-bottom: 5px; text-transform: uppercase;">Bonos</p>
                                    <p style="font-size: 20px; font-weight: 700; color: #27ae60;">${Helpers.formatCurrency(bonuses)}</p>
                                </div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <p style="color: #64748b; font-size: 13px; margin-bottom: 5px; text-transform: uppercase;">Beneficios</p>
                                    <p style="font-size: 20px; font-weight: 700; color: #3498db;">${Helpers.formatCurrency(benefits)}</p>
                                </div>
                                <div>
                                    <p style="color: #64748b; font-size: 13px; margin-bottom: 5px; text-transform: uppercase;">Deducciones</p>
                                    <p style="font-size: 20px; font-weight: 700; color: #e74c3c;">${Helpers.formatCurrency(deductions)}</p>
                                </div>
                            </div>
                            
                            <div style="border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 10px;">
                                <p style="color: #64748b; font-size: 13px; margin-bottom: 5px; text-transform: uppercase;">Salario Neto</p>
                                <p style="font-size: 28px; font-weight: 700; color: #2c3e50;">${Helpers.formatCurrency(netSalary)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #ecf0f1; border-radius: 6px; font-size: 12px; color: #64748b;">
                        <p>📄 Comprobante de nómina generado el ${new Date().toLocaleDateString()}</p>
                        <p style="margin-top: 5px;">ID Nómina: ${payrollItem.id || 'N/A'}</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" id="printPayslipBtn">🖨️ Imprimir</button>
                    <button type="button" class="btn btn-secondary modal-close-btn">Cerrar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const closeBtnAlt = modal.querySelector('.modal-close-btn');
        const printBtn = modal.querySelector('#printPayslipBtn');

        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        closeBtnAlt.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        printBtn.addEventListener('click', () => {
            const printWindow = window.open('', '', 'height=600,width=800');
            const contentDiv = modal.querySelector('#payslipContent');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Comprobante de Nómina - ${empName}</title>
                    <style>
                        body { font-family: Arial; margin: 20px; }
                        h1 { text-align: center; color: #2c3e50; }
                        .section { margin: 20px 0; padding: 15px; border-bottom: 1px solid #ccc; }
                        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 10px 0; }
                        .item { }
                        .label { color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
                        .value { font-weight: bold; font-size: 16px; }
                        .amount { color: #27ae60; font-size: 24px; font-weight: bold; }
                        .deduction { color: #e74c3c; }
                        .net { border-top: 2px solid #333; padding-top: 15px; margin-top: 15px; }
                        .net-value { font-size: 32px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Comprobante de Nómina</h1>
                    <div class="section">
                        <div class="row">
                            <div class="item">
                                <div class="label">Empleado</div>
                                <div class="value">${empName}</div>
                            </div>
                            <div class="item">
                                <div class="label">Período</div>
                                <div class="value">${month}/${year}</div>
                            </div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="row">
                            <div class="item">
                                <div class="label">Salario Base</div>
                                <div class="value amount">${Helpers.formatCurrency(grossSalary)}</div>
                            </div>
                            <div class="item">
                                <div class="label">Bonos</div>
                                <div class="value amount">${Helpers.formatCurrency(bonuses)}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="item">
                                <div class="label">Beneficios</div>
                                <div class="value amount">${Helpers.formatCurrency(benefits)}</div>
                            </div>
                            <div class="item">
                                <div class="label">Deducciones</div>
                                <div class="value amount deduction">-${Helpers.formatCurrency(deductions)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="section net">
                        <div class="label">Salario Neto a Pagar</div>
                        <div class="net-value">${Helpers.formatCurrency(netSalary)}</div>
                    </div>
                    <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 12px;">
                        <p>Documento generado el ${new Date().toLocaleDateString()}</p>
                        <p>Este es un comprobante de nómina válido</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            setTimeout(() => printWindow.print(), 250);
        });
    };

    return {
        render
    };
})();

// Exponer globalmente
window.payroll = payroll;
