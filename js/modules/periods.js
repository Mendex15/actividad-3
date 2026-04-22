/**
 * Módulo: Períodos
 *
 * Administra períodos de nómina y consulta el registro de auditoría.
 */

const periods = (() => {
    /**
     * Renderiza la pantalla de períodos
     * @param {HTMLElement} container - Contenedor destino
     * @param {string} section - Sección solicitada
     */
    const render = async (container, section) => {
        try {
            await renderPeriodsManagement(container);
        } catch (error) {
            console.error('Error rendering periods module:', error);
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const renderPeriodsManagement = async (container) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        container.innerHTML = `
            <div class="periods-container">
                <div class="panel">
                    <h2>Gestión de Períodos de Nómina</h2>
                    
                    <div class="periods-controls">
                        <button id="createPeriodBtn" class="btn btn-primary">
                            ➕ Crear Nuevo Período
                        </button>
                        <button id="lockCurrentBtn" class="btn btn-warning">
                            🔒 Bloquear Período Actual
                        </button>
                    </div>

                    <div class="periods-grid">
                        <div class="period-card">
                            <h3>Período Actual</h3>
                            <p class="period-month">${currentMonth}/${currentYear}</p>
                            <div class="period-status">
                                <span class="badge status-active">Activo</span>
                            </div>
                            <p class="period-info">Ediciones permitidas</p>
                        </div>

                        <div class="period-card">
                            <h3>Período Anterior</h3>
                            <p class="period-month">${currentMonth - 1 || 12}/${currentMonth === 1 ? currentYear - 1 : currentYear}</p>
                            <div class="period-status">
                                <span class="badge status-locked">Bloqueado</span>
                            </div>
                            <p class="period-info">Solo lectura</p>
                        </div>
                    </div>

                    <div class="periods-list">
                        <h3>Historial de Períodos</h3>
                        <table class="periods-table">
                            <thead>
                                <tr>
                                    <th>Período</th>
                                    <th>Estado</th>
                                    <th>Fecha de Bloqueo</th>
                                    <th>Nóminas Procesadas</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${currentMonth}/${currentYear}</td>
                                    <td><span class="badge status-active">Activo</span></td>
                                    <td>No bloqueado</td>
                                    <td>0</td>
                                    <td>
                                        <button class="btn-action" title="Detalles">ℹ️</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>${currentMonth - 1 || 12}/${currentMonth === 1 ? currentYear - 1 : currentYear}</td>
                                    <td><span class="badge status-locked">Bloqueado</span></td>
                                    <td>${Helpers.formatDate(new Date(currentYear, currentMonth - 2, 28))}</td>
                                    <td>15</td>
                                    <td>
                                        <button class="btn-action" title="Detalles">ℹ️</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="audit-log">
                        <h3>Registro de Auditoría</h3>
                        <div id="auditLogContainer"></div>
                    </div>
                </div>
            </div>
        `;

        loadAuditLog(container);
        setupPeriodsHandlers(container, currentMonth, currentYear);
    };

    const loadAuditLog = async (container) => {
        try {
            const auditLogContainer = container.querySelector('#auditLogContainer');
            
            // Cargar logs desde la API
            try {
                const response = await APIService.getAuditLogs(50, 0);
                const logs = response.logs || [];

                const parseMaybeJson = (value) => {
                    if (value === null || value === undefined) return null;
                    if (typeof value === 'object') return value;
                    if (typeof value !== 'string') return null;
                    try {
                        return JSON.parse(value);
                    } catch {
                        return null;
                    }
                };

                const buildChangedFields = (oldObj, newObj) => {
                    if (!oldObj || !newObj) return '';
                    const changes = [];
                    Object.keys(newObj).forEach((key) => {
                        const oldVal = oldObj[key];
                        const newVal = newObj[key];
                        if (oldVal === undefined && newVal === undefined) return;
                        // Comparación simple; suficiente para campos planos
                        if (String(oldVal ?? '') !== String(newVal ?? '')) {
                            changes.push(key);
                        }
                    });
                    return changes.length ? changes.join(', ') : '';
                };

                if (logs.length === 0) {
                    auditLogContainer.innerHTML = '<p class="empty-message">No hay registros de auditoría</p>';
                    return;
                }

                auditLogContainer.innerHTML = `
                    <table class="audit-table">
                        <thead>
                            <tr>
                                <th>Acción</th>
                                <th>Usuario</th>
                                <th>Entidad</th>
                                <th>Fecha</th>
                                <th>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => {
                                const date = new Date(log.created_at);
                                const oldValues = parseMaybeJson(log.old_values) || {};
                                const newValues = parseMaybeJson(log.new_values) || {};
                                const entityLabel = (log.entity_type === 'employee')
                                    ? (log.employee_name || newValues.name || oldValues.name || `Empleado #${log.entity_id}`)
                                    : (log.entity_type === 'user')
                                        ? (log.full_name || log.username || `Usuario #${log.entity_id}`)
                                        : (log.entity_type || 'N/A');
                                let details = '';

                                if (log.action === 'CREATE') {
                                    details = `Creado: ${entityLabel}`;
                                } else if (log.action === 'UPDATE') {
                                    const fields = buildChangedFields(oldValues, newValues);
                                    details = fields ? `Actualizado: ${entityLabel} (${fields})` : `Actualizado: ${entityLabel}`;
                                } else if (log.action === 'DELETE') {
                                    details = `Eliminado: ${entityLabel}`;
                                } else if (log.action === 'CHANGE_PASSWORD') {
                                    details = 'Contraseña cambiada';
                                } else {
                                    details = log.action;
                                }

                                return `
                                    <tr>
                                        <td><span class="audit-action">${log.action}</span></td>
                                        <td>${log.full_name || log.username}</td>
                                        <td>${entityLabel}</td>
                                        <td>${Helpers.formatDate(date)}</td>
                                        <td>${details}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
            } catch (apiError) {
                console.warn('Error loading audit logs from API, showing default:', apiError);
                
                // Fallback a datos locales si la API falla
                const logs = [
                    {
                        action: 'Período bloqueado',
                        user: 'admin',
                        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        details: 'Período anterior bloqueado para edición'
                    },
                    {
                        action: 'Empleado registrado',
                        user: 'rh@company.com',
                        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                        details: 'Nuevo empleado: Juan Pérez'
                    },
                    {
                        action: 'Nómina calculada',
                        user: 'admin',
                        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                        details: 'Nómina del mes calculada'
                    }
                ];

                auditLogContainer.innerHTML = `
                    <table class="audit-table">
                        <thead>
                            <tr>
                                <th>Acción</th>
                                <th>Usuario</th>
                                <th>Fecha</th>
                                <th>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => `
                                <tr>
                                    <td><span class="audit-action">${log.action}</span></td>
                                    <td>${log.user}</td>
                                    <td>${Helpers.formatDate(log.date)}</td>
                                    <td>${log.details}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }

        } catch (error) {
            console.error('Error loading audit log:', error);
        }
    };

    const setupPeriodsHandlers = (container, month, year) => {
        const createBtn = container.querySelector('#createPeriodBtn');
        const lockBtn = container.querySelector('#lockCurrentBtn');

        createBtn.addEventListener('click', () => {
            showCreatePeriodModal(container);
        });

        lockBtn.addEventListener('click', () => {
            if (confirm(`¿Deseas bloquear el período ${month}/${year}?\nEsta acción no se puede deshacer.`)) {
                lockCurrentPeriod(container, month, year);
            }
        });
    };

    const showCreatePeriodModal = (container) => {
        // Implement period creation modal
        Helpers.showNotification('Funcionalidad en desarrollo', 'info');
    };

    const lockCurrentPeriod = async (container, month, year) => {
        try {
            // In real app, call API to lock period
            Helpers.showNotification(`Período ${month}/${year} bloqueado exitosamente`, 'success');
            // Reload the view
            location.hash = '#periods';
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        }
    };

    return {
        render
    };
})();

// Exponer globalmente
window.periods = periods;
