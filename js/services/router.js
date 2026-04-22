/**
 * Simple SPA Router - without framework
 * Gestiona navegación sin recargar la página
 */

const Router = (() => {
    const routes = {
        'dashboard': { module: 'dashboard', section: 'dashboard' },
        'employees/register': { module: 'employees', section: 'register' },
        'employees/list': { module: 'employees', section: 'list' },
        'payroll/summary': { module: 'payroll', section: 'summary' },
        'payroll/history': { module: 'payroll', section: 'history' },
        'periods': { module: 'periods', section: 'periods' },
        'security': { module: 'security', section: 'security' },
        'reports': { module: 'reports', section: 'reports' }
    };

    const moduleCache = {};

    const loadModule = async (moduleName) => {
        if (typeof window[moduleName] === 'undefined') {
            throw new Error(`Módulo ${moduleName} no cargado`);
        }
        return window[moduleName];
    };

    const navigateTo = async (routeKey) => {
        try {
            let resolvedRouteKey = routeKey;
            let route = routes[resolvedRouteKey];
            if (!route && resolvedRouteKey.includes('/')) {
                const baseKey = resolvedRouteKey.split('/')[0];
                if (routes[baseKey]) {
                    resolvedRouteKey = baseKey;
                    route = routes[resolvedRouteKey];
                }
            }
            if (!route) {
                console.warn(`Ruta no encontrada: ${routeKey}`);
                return;
            }

            // Actualizar URL hash
            window.location.hash = `#${resolvedRouteKey}`;

            // Obtener el módulo
            const module = await loadModule(route.module);
            
            // Obtener el contenedor
            const container = document.getElementById('moduleContainer');
            if (!container) {
                throw new Error('Container no encontrado');
            }

            // Limpiar contenedor
            container.innerHTML = '';

            // Mostrar módulo
            if (typeof module.render === 'function') {
                await module.render(container, route.section);
            } else {
                throw new Error(`Módulo ${route.module} no tiene método render`);
            }

            // Actualizar título
            updatePageTitle(resolvedRouteKey);

            // Actualizar estado activo del menú
            updateActiveMenuItem(resolvedRouteKey);

        } catch (error) {
            console.error('Error navegando a ruta:', routeKey, error);
            showErrorMessage('Error cargando el módulo: ' + error.message);
        }
    };

    const updatePageTitle = (routeKey) => {
        const titles = {
            'dashboard': 'Home',
            'employees/register': 'Registrar Empleado',
            'employees/list': 'Empleados',
            'payroll/summary': 'Resumen de Nómina',
            'payroll/history': 'Historial de Nóminas',
            'periods': 'Períodos',
            'security': 'Seguridad',
            'reports': 'Reportes'
        };
        
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[routeKey] || 'Dashboard';
        }
    };

    const updateActiveMenuItem = (routeKey) => {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeItem = document.querySelector(
            `.menu-item[data-module="${routes[routeKey].module}"][data-section="${routes[routeKey].section}"]`
        );
        if (activeItem) {
            activeItem.classList.add('active');
        }
    };

    const handleHashChange = () => {
        let hash = window.location.hash.slice(1);
        if (!hash) hash = 'dashboard';
        navigateTo(hash);
    };

    const init = () => {
        // Escuchar cambios en hash
        window.addEventListener('hashchange', handleHashChange);

        // Setup menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const module = item.dataset.module;
                const section = item.dataset.section;
                const routeKey = section === module ? module : `${module}/${section}`;
                navigateTo(routeKey);
            });
        });

        // Cargar ruta inicial
        handleHashChange();
    };

    const showErrorMessage = (message) => {
        const container = document.getElementById('moduleContainer');
        if (container) {
            container.innerHTML = `
                <div class="panel">
                    <div class="error-message" style="color: #e74c3c; padding: 20px; background: #fadbd8; border-radius: 6px;">
                        ${message}
                    </div>
                </div>
            `;
        }
    };

    return {
        init,
        navigateTo,
        getCurrentRoute: () => window.location.hash.slice(1) || 'dashboard'
    };
})();

// Expose globally
window.Router = Router;
