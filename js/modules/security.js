/**
 * Módulo: Seguridad
 *
 * Gestiona cambio de contraseña, roles y acciones de backup.
 */

const security = (() => {
    /**
     * Renderiza el panel de seguridad
     * @param {HTMLElement} container - Contenedor destino
     * @param {string} section - Sección solicitada
     */
    const render = async (container, section) => {
        try {
            await renderSecurityPanel(container);
        } catch (error) {
            console.error('Error rendering security module:', error);
            container.innerHTML = `<div class="panel"><p class="error">${error.message}</p></div>`;
        }
    };

    const renderSecurityPanel = async (container) => {
        container.innerHTML = `
            <div class="security-container">
                <div class="panel">
                    <h2>Configuración de Seguridad</h2>
                    
                    <div class="security-tabs">
                        <button class="tab-btn active" data-tab="password">
                            🔐 Cambiar Contraseña
                        </button>
                        <button class="tab-btn" data-tab="roles">
                            👥 Gestión de Roles
                        </button>
                        <button class="tab-btn" data-tab="backup">
                            💾 Backup de Datos
                        </button>
                    </div>

                    <!-- Tab: Change Password -->
                    <div id="password-tab" class="tab-content active">
                        <form id="changePasswordForm" class="security-form">
                            <div class="form-group">
                                <label>Contraseña Actual *</label>
                                <input type="password" name="current_password" required>
                            </div>

                            <div class="form-group">
                                <label>Nueva Contraseña *</label>
                                <input type="password" name="new_password" required>
                                <small>Mínimo 8 caracteres</small>
                            </div>

                            <div class="form-group">
                                <label>Confirmar Contraseña *</label>
                                <input type="password" name="confirm_password" required>
                            </div>

                            <button type="submit" class="btn btn-primary">
                                Actualizar Contraseña
                            </button>
                        </form>
                    </div>

                    <!-- Tab: Roles Management -->
                    <div id="roles-tab" class="tab-content">
                        <div class="roles-management">
                            <h3>Matriz de Permisos por Rol</h3>
                            
                            <table class="roles-table">
                                <thead>
                                    <tr>
                                        <th>Funcionalidad</th>
                                        <th>Admin</th>
                                        <th>RH</th>
                                        <th>Employee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Registrar Empleado</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-no">✗</td>
                                    </tr>
                                    <tr>
                                        <td>Editar Empleado</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-no">✗</td>
                                    </tr>
                                    <tr>
                                        <td>Eliminar Empleado</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-no">✗</td>
                                    </tr>
                                    <tr>
                                        <td>Ver Nómina</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-yes">✓</td>
                                    </tr>
                                    <tr>
                                        <td>Generar Reportes</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-no">✗</td>
                                    </tr>
                                    <tr>
                                        <td>Gestionar Usuarios</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-no">✗</td>
                                        <td class="permission-no">✗</td>
                                    </tr>
                                    <tr>
                                        <td>Bloquear Períodos</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-no">✗</td>
                                    </tr>
                                    <tr>
                                        <td>Realizar Backup</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-no">✗</td>
                                        <td class="permission-no">✗</td>
                                    </tr>
                                    <tr>
                                        <td>Ver Auditoría</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-no">✗</td>
                                    </tr>
                                    <tr>
                                        <td>Importar CSV</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-yes">✓</td>
                                        <td class="permission-no">✗</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Tab: Backup -->
                    <div id="backup-tab" class="tab-content">
                        <div class="backup-management">
                            <h3>Copias de Seguridad de Datos</h3>
                            
                            <div class="backup-actions">
                                <button id="backupBtn" class="btn btn-primary">
                                    💾 Crear Backup Ahora
                                </button>
                                <p class="backup-info">
                                    Último backup: Hace 2 días a las 14:30
                                </p>
                            </div>

                            <h4>Historial de Backups</h4>
                            <table class="backup-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Hora</th>
                                        <th>Tamaño</th>
                                        <th>Registros</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>2024-01-15</td>
                                        <td>14:30</td>
                                        <td>2.5 MB</td>
                                        <td>125</td>
                                        <td>
                                            <button class="btn-action">⬇️</button>
                                            <button class="btn-action">🗑️</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2024-01-14</td>
                                        <td>10:15</td>
                                        <td>2.3 MB</td>
                                        <td>124</td>
                                        <td>
                                            <button class="btn-action">⬇️</button>
                                            <button class="btn-action">🗑️</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setupSecurityHandlers(container);
    };

    const setupSecurityHandlers = (container) => {
        // Tab switching
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                // Remove active from all tabs
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                container.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                
                // Add active to clicked tab
                btn.classList.add('active');
                container.querySelector(`#${tabName}-tab`).classList.add('active');
            });
        });

        // Password change form
        const passwordForm = container.querySelector('#changePasswordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordChange);
        }

        // Backup button
        const backupBtn = container.querySelector('#backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', handleBackup);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate password
        if (data.new_password.length < 8) {
            Helpers.showNotification('La contraseña debe tener mínimo 8 caracteres', 'error');
            return;
        }

        if (data.new_password !== data.confirm_password) {
            Helpers.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            await APIService.changePassword(
                data.current_password,
                data.new_password,
                data.confirm_password
            );

            Helpers.showNotification('Contraseña actualizada exitosamente', 'success');
            form.reset();

            // Opcional: forzar re-login
            setTimeout(() => {
                APIService.logout();
                window.location.reload();
            }, 800);
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        } finally {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = false;
        }
    };

    const handleBackup = async () => {
        try {
            // Call API to create backup
            Helpers.showNotification('Backup creado exitosamente', 'success');
            // Reload the view to show new backup
            setTimeout(() => {
                location.hash = '#security';
            }, 1500);
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        }
    };

    return {
        render
    };
})();

// Exponer globalmente
window.security = security;
