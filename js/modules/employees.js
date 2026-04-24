/**
 * Módulo: Empleados
 *
 * Gestiona el registro y el listado de empleados.
 */

const employees = (() => {
    /**
     * Renderiza la vista solicitada del módulo de empleados
     * @param {HTMLElement} container - Contenedor destino
     * @param {string} section - Sección a renderizar
     */
    const render = async (container, section) => {
        try {
            if (section === 'register') {
                renderRegisterForm(container);
            } else if (section === 'list') {
                await renderEmployeesList(container);
            }
        } catch (error) {
            console.error('Error rendering employees module:', error);
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const renderRegisterForm = (container) => {
        container.innerHTML = `
            <div class="panel">
                <h2>Registrar Nuevo Empleado</h2>
                <form id="employeeForm" class="employee-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" name="first_name" required>
                        </div>
                        <div class="form-group">
                            <label>Apellido *</label>
                            <input type="text" name="last_name" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                      <div class="form-group">
                            <label>CI *</label>
                            <input type="text" name="ci" required>
                         </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" name="phone">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo de Empleado *</label>
                            <select name="employee_type" id="employmentType" required>
                                <option value="">Selecciona...</option>
                                <option value="asalariado">Asalariado</option>
                                <option value="horas">Por Horas</option>
                                <option value="comision">Comisión</option>
                                <option value="temporal">Temporal</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado *</label>
                            <select name="status" required>
                                <option value="">Selecciona...</option>
                                <option value="Active">Activo</option>
                                <option value="Inactive">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Salario Mensual *</label>
                            <input type="number" name="monthly_salary" required min="0">
                        </div>
                        <div class="form-group">
                            <label>Antigüedad (años)</label>
                            <input type="number" name="years_in_company" min="0" value="0">
                        </div>
                    </div>

                    <div class="form-row" id="hourlyFieldsRow" style="display: none;">
                        <div class="form-group">
                            <label>Tarifa por Hora *</label>
                            <input type="number" name="hourly_rate" min="0" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Horas Trabajadas *</label>
                            <input type="number" name="hours_worked" min="0" step="0.01">
                        </div>
                    </div>

                    <div class="form-row" id="hourlyExtrasRow" style="display: none;">
                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="has_savings_fund">
                                Tiene fondo de ahorro
                            </label>
                        </div>
                    </div>

                    <div class="form-row" id="commissionFieldsRow" style="display: none;">
                        <div class="form-group">
                            <label>Salario Base *</label>
                            <input type="number" name="base_salary" min="0" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Comisión (%) *</label>
                            <input type="number" name="commission_rate_pct" min="0" max="100" step="0.01">
                        </div>
                    </div>

                    <div class="form-row" id="commissionSalesRow" style="display: none;">
                        <div class="form-group">
                            <label>Ventas del Mes *</label>
                            <input type="number" name="sales" min="0" step="0.01">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Registrar Empleado</button>
                        <button type="reset" class="btn btn-secondary">Limpiar</button>
                    </div>
                </form>
            </div>
        `;

        // Configurar manejo del formulario
        setupRegisterFormHandlers();
    };

    const setupRegisterFormHandlers = () => {
        const form = document.getElementById('employeeForm');
        const employmentType = document.getElementById('employmentType');
        const hourlyFieldsRow = document.getElementById('hourlyFieldsRow');
        const hourlyExtrasRow = document.getElementById('hourlyExtrasRow');
        const commissionFieldsRow = document.getElementById('commissionFieldsRow');
        const commissionSalesRow = document.getElementById('commissionSalesRow');

        const showOnlyTypeFields = (type) => {
            const isHourly = type === 'horas';
            const isCommission = type === 'comision';

            hourlyFieldsRow.style.display = isHourly ? 'grid' : 'none';
            hourlyExtrasRow.style.display = isHourly ? 'grid' : 'none';
            commissionFieldsRow.style.display = isCommission ? 'grid' : 'none';
            commissionSalesRow.style.display = isCommission ? 'grid' : 'none';
        };

        employmentType.addEventListener('change', (e) => {
            showOnlyTypeFields(e.target.value);
        });

        // Estado inicial (por si hay valores persistidos/autocompletado)
        showOnlyTypeFields(employmentType.value);

        // Submit handler del formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const raw = Object.fromEntries(formData);

            const firstName = String(raw.first_name || '').trim();
            const lastName = String(raw.last_name || '').trim();
            const employeeType = String(raw.employee_type || '').trim();

            if (!firstName || !lastName || !employeeType) {
                Helpers.showNotification('Nombre, apellido y tipo de empleado son requeridos', 'error');
                return;
            }

            if (!raw.ci) {
                Helpers.showNotification('CI es obligatorio', 'error');
                return;
            }

            if (raw.email && !Helpers.isValidEmail(raw.email)) {
                Helpers.showNotification('Email inválido', 'error');
                return;
            }

            const payload = {
                name: `${firstName} ${lastName}`.trim(),
                ci: raw.ci,
                email: raw.email || null,
                phone: raw.phone || null,
                employee_type: employeeType,
                years_in_company: raw.years_in_company ? Number(raw.years_in_company) : 0
            };

            if (employeeType === 'asalariado' || employeeType === 'temporal') {
                if (raw.monthly_salary === '' || raw.monthly_salary === undefined) {
                    Helpers.showNotification('Salario mensual requerido', 'error');
                    return;
                }
                payload.monthly_salary = Number(raw.monthly_salary);
            }

            if (employeeType === 'horas') {
                if (raw.hourly_rate === '' || raw.hours_worked === '' || raw.hourly_rate === undefined || raw.hours_worked === undefined) {
                    Helpers.showNotification('Tarifa horaria y horas trabajadas requeridas', 'error');
                    return;
                }
                payload.hourly_rate = Number(raw.hourly_rate);
                payload.hours_worked = Number(raw.hours_worked);
                payload.has_savings_fund = raw.has_savings_fund === 'on';
            }

            if (employeeType === 'comision') {
                if (raw.base_salary === '' || raw.commission_rate_pct === '' || raw.sales === '' || raw.base_salary === undefined || raw.commission_rate_pct === undefined || raw.sales === undefined) {
                    Helpers.showNotification('Salario base, comisión (%) y ventas requeridas', 'error');
                    return;
                }
                payload.base_salary = Number(raw.base_salary);
                payload.commission_rate = Number(raw.commission_rate_pct) / 100;
                payload.sales = Number(raw.sales);
            }

            try {
                await APIService.createEmployee(payload);
                Helpers.showNotification('Empleado registrado exitosamente', 'success');
                form.reset();
                showOnlyTypeFields('');
            } catch (error) {
                Helpers.showNotification(error.message, 'error');
            }
        });
    };
    

    const renderEmployeesList = async (container) => {
        try {
            let employees = await APIService.getEmployees();
            
            // Asegurar que employees es un array
            if (!Array.isArray(employees)) {
                console.warn('Employees response is not an array:', employees);
                employees = [];
            }

            container.innerHTML = `
                <div class="panel">
                    <h2>Listado de Empleados</h2>
                    
                    <div class="list-controls">
                        <input type="text" id="searchInput" class="search-input" placeholder="Buscar por nombre...">
                        <select id="statusFilter" class="filter-select">
                            <option value="">Todos los estados</option>
                            <option value="Active">Activos</option>
                            <option value="Inactive">Inactivos</option>
                        </select>
                        <select id="typeFilter" class="filter-select">
                            <option value="">Todos los tipos</option>
                            <option value="asalariado">Asalariados</option>
                            <option value="horas">Por Horas</option>
                            <option value="comision">Comisión</option>
                            <option value="temporal">Temporal</option>
                        </select>
                    </div>

                    <div id="employeesTableContainer"></div>
                </div>
            `;

            renderEmployeesTable(container, employees);
            setupListHandlers(container, employees);

        } catch (error) {
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const renderEmployeesTable = (container, employees) => {
        const tableContainer = container.querySelector('#employeesTableContainer');
        
        if (employees.length === 0) {
            tableContainer.innerHTML = '<p class="empty-message">No hay empleados registrados</p>';
            return;
        }

        tableContainer.innerHTML = `
            <table class="employees-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Salario</th>
                        <th>Antigüedad</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(emp => `
                        <tr>
                            <td>${emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()}</td>
                            <td>${emp.email || '-'}</td>
                            <td><span class="badge">${emp.employee_type || emp.employment_type || '-'}</span></td>
                            <td>${Helpers.formatCurrency(emp.monthly_salary || emp.base_salary || 0)}</td>
                            <td>${emp.years_in_company ?? emp.years_of_service ?? 0} años</td>
                            <td>
                                <span class="status-badge status-${emp.status || (emp.is_active === false ? 'Inactive' : 'Active')}">
                                    ${emp.status || (emp.is_active === false ? 'Inactive' : 'Active')}
                                </span>
                            </td>
                            <td>
                                <button class="btn-action edit-btn" data-id="${emp.id}" title="Editar">✏️</button>
                                <button class="btn-action delete-btn" data-id="${emp.id}" title="Eliminar">🗑️</button>
                                <button class="btn-action payslip-btn" data-id="${emp.id}" title="Ver Nómina">📄</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    };

    const setupListHandlers = (container, allEmployees) => {
        const searchInput = container.querySelector('#searchInput');
        const statusFilter = container.querySelector('#statusFilter');
        const typeFilter = container.querySelector('#typeFilter');

        const getEmployeeName = (emp) => {
            const name = emp?.name;
            if (typeof name === 'string' && name.trim()) return name.trim();
            return `${emp?.first_name || ''} ${emp?.last_name || ''}`.trim();
        };

        const getEmployeeType = (emp) => String(emp?.employee_type || emp?.employment_type || '').trim();

        const getEmployeeStatus = (emp) => {
            if (emp?.status) return String(emp.status);
            if (emp?.is_active === 0 || emp?.is_active === false) return 'Inactive';
            return 'Active';
        };

        const applyFilters = () => {
            let filtered = [...allEmployees];

            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                filtered = filtered.filter(emp =>
                    getEmployeeName(emp).toLowerCase().includes(searchTerm)
                );
            }

            const status = statusFilter.value;
            if (status) {
                filtered = filtered.filter(emp => getEmployeeStatus(emp) === status);
            }

            const type = typeFilter.value;
            if (type) {
                filtered = filtered.filter(emp => getEmployeeType(emp).toLowerCase() === type.toLowerCase());
            }

            renderEmployeesTable(container, filtered);
            setupActionHandlers(container, filtered);
        };

        searchInput.addEventListener('input', applyFilters);
        statusFilter.addEventListener('change', applyFilters);
        typeFilter.addEventListener('change', applyFilters);

        setupActionHandlers(container, allEmployees);
    };

    const setupActionHandlers = (container, employees) => {
        // Edit handlers
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const employee = employees.find(e => e.id == id);
                if (employee) {
                    showEditModal(employee);
                }
            });
        });

        // Delete handlers
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (confirm('¿Estás seguro de eliminar este empleado?')) {
                    try {
                        await APIService.deleteEmployee(id);
                        Helpers.showNotification('Empleado eliminado', 'success');
                        location.hash = '#employees/list';
                    } catch (error) {
                        Helpers.showNotification(error.message, 'error');
                    }
                }
            });
        });

        // Payslip handlers
        container.querySelectorAll('.payslip-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const employee = employees.find(e => e.id == id);
                if (employee) {
                    showPayslipModal(employee);
                }
            });
        });
    };

    const showEditModal = async (employee) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Editar Empleado</h3>
                    <button class="modal-close" type="button">&times;</button>
                </div>
                <form id="editEmployeeForm" class="employee-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" name="first_name" value="${employee.first_name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Apellido *</label>
                            <input type="text" name="last_name" value="${employee.last_name || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" value="${employee.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" name="phone" value="${employee.phone || ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo de Empleado *</label>
                            <select name="employee_type" required>
                                <option value="asalariado" ${employee.employee_type === 'asalariado' ? 'selected' : ''}>Asalariado</option>
                                <option value="horas" ${employee.employee_type === 'horas' ? 'selected' : ''}>Por Horas</option>
                                <option value="comision" ${employee.employee_type === 'comision' ? 'selected' : ''}>Comisión</option>
                                <option value="temporal" ${employee.employee_type === 'temporal' ? 'selected' : ''}>Temporal</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Salario Mensual *</label>
                            <input type="number" name="monthly_salary" value="${employee.monthly_salary || 0}" required min="0">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Antigüedad (años)</label>
                            <input type="number" name="years_in_company" value="${employee.years_in_company || 0}" min="0">
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                        <button type="button" class="btn btn-secondary modal-close-btn">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const closeBtnAlt = modal.querySelector('.modal-close-btn');
        const form = modal.querySelector('#editEmployeeForm');

        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        closeBtnAlt.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            const payload = {
                name: `${data.first_name} ${data.last_name}`.trim(),
                email: data.email,
                phone: data.phone,
                employee_type: data.employee_type,
                monthly_salary: Number(data.monthly_salary),
                years_in_company: Number(data.years_in_company)
            };

            try {
                await APIService.updateEmployee(employee.id, payload);
                Helpers.showNotification('Empleado actualizado exitosamente', 'success');
                closeModal();
                setTimeout(() => {
                    location.hash = '#employees/list';
                }, 500);
            } catch (error) {
                Helpers.showNotification(error.message, 'error');
            }
        });
    };

    const showPayslipModal = async (employee) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Nóminas de ${employee.name || `${employee.first_name} ${employee.last_name}`}</h3>
                    <button class="modal-close" type="button">&times;</button>
                </div>
                <div id="payslipContent" style="padding: 20px;">
                    <p>Cargando histórico...</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" id="downloadPayslipBtn">📥 Descargar PDF</button>
                    <button type="button" class="btn btn-secondary modal-close-btn">Cerrar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const closeBtnAlt = modal.querySelector('.modal-close-btn');
        const contentDiv = modal.querySelector('#payslipContent');
        const downloadBtn = modal.querySelector('#downloadPayslipBtn');

        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        closeBtnAlt.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        try {
            const payrollData = await APIService.getEmployeePayrollHistory(employee.id, 24);
            const history = payrollData.history || [];

            if (history.length === 0) {
                contentDiv.innerHTML = '<p class="empty-message">No hay nóminas registradas para este empleado</p>';
                downloadBtn.disabled = true;
                return;
            }

            contentDiv.innerHTML = `
                <table class="payroll-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th>Período</th>
                            <th>Salario Base</th>
                            <th>Bonos</th>
                            <th>Deducciones</th>
                            <th>Beneficios</th>
                            <th>Neto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${history.map(h => `
                            <tr>
                                <td>${h.month}/${h.year}</td>
                                <td>${Helpers.formatCurrency(h.gross_salary)}</td>
                                <td>${Helpers.formatCurrency(h.bonuses || 0)}</td>
                                <td>${Helpers.formatCurrency(h.mandatory_deductions || 0)}</td>
                                <td>${Helpers.formatCurrency(h.benefits || 0)}</td>
                                <td><strong>${Helpers.formatCurrency(h.net_salary)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            downloadBtn.addEventListener('click', () => {
                downloadPayslipHTML(employee, history);
            });
        } catch (error) {
            contentDiv.innerHTML = `<p class="error" style="color: #e74c3c;">${error.message}</p>`;
            downloadBtn.disabled = true;
        }
    };

    const downloadPayslipHTML = (employee, history) => {
        const empName = employee.name || `${employee.first_name} ${employee.last_name}`;
        
        let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nóminas - ${empName}</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; }
        h1 { text-align: center; color: #333; }
        .employee-info { margin: 20px 0; padding: 10px; background: #f9f9f9; border-left: 4px solid #e74c3c; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
        th { background: #f0f0f0; font-weight: bold; }
        td:first-child, th:first-child { text-align: left; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Histórico de Nóminas</h1>
        <div class="employee-info">
            <p><strong>Empleado:</strong> ${empName}</p>
            <p><strong>Tipo:</strong> ${employee.employee_type}</p>
            <p><strong>Generado:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Período</th>
                    <th>Salario Base</th>
                    <th>Bonos</th>
                    <th>Deducciones</th>
                    <th>Beneficios</th>
                    <th>Neto</th>
                </tr>
            </thead>
            <tbody>`;

        history.forEach(h => {
            html += `
                <tr>
                    <td>${h.month}/${h.year}</td>
                    <td>$${Number(h.gross_salary || 0).toLocaleString()}</td>
                    <td>$${Number(h.bonuses || 0).toLocaleString()}</td>
                    <td>$${Number(h.mandatory_deductions || 0).toLocaleString()}</td>
                    <td>$${Number(h.benefits || 0).toLocaleString()}</td>
                    <td>$${Number(h.net_salary || 0).toLocaleString()}</td>
                </tr>`;
        });

        html += `
            </tbody>
        </table>
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `nomina_${empName.replace(/\\s+/g, '_')}.html`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Helpers.showNotification('Nómina descargada como HTML (puedes guardarla como PDF desde el navegador: Ctrl+P)', 'success');
    };

    return {
        render
    };
})();

// Exponer globalmente
window.employees = employees;
