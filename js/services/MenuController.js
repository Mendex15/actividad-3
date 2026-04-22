/**
 * @module MenuController
 * @description Controlador de menú - Responsable de gestionar permisos y navegación
 * @implements {SingleResponsibilityPrinciple}
 */

const MenuController = (() => {
    // ====== CONSTANTES ======
    const MENU_ITEM_SELECTOR = '.menu-item';

    // ====== MAPEO DE PERMISOS ======
    /**
     * Mapea módulos a permisos requeridos
     * @private
     */
    const modulePermissionMap = {
        employees: ['canRegisterEmployee', 'canEditEmployee'],
        payroll: ['canViewPayroll'],
        periods: ['canLockPeriods'],
        security: [], // Security siempre accesible (cambiar contraseña)
        reports: ['canGenerateReports'],
        dashboard: [] // Dashboard siempre accesible
    };

    /**
     * Verifica si el usuario tiene permiso para acceder al módulo
     * @private
     * @param {string} module - Nombre del módulo
     * @param {Object} permissions - Permisos del usuario
     * @returns {boolean} true si tiene permiso
     */
    const hasPermissionForModule = (module, permissions) => {
        const requiredPermissions = modulePermissionMap[module] || [];
        
        // Si no hay permisos requeridos, acceso permitido
        if (requiredPermissions.length === 0) {
            return true;
        }

        // Verificar si tiene al menos uno de los permisos requeridos
        return requiredPermissions.some(permission => permissions[permission] === true);
    };

    /**
     * Obtiene los permisos del usuario por rol
     * @private
     * @param {string} role - Rol del usuario
     * @returns {Object} Objeto de permisos
     */
    const getPermissionsForRole = (role) => {
        if (!role || !Constants.PERMISSIONS) {
            return {};
        }

        const roleKey = Object.keys(Constants.PERMISSIONS).find(
            key => key.toLowerCase() === String(role).toLowerCase()
        );

        return Constants.PERMISSIONS[roleKey] || {};
    };

    // ====== MÉTODOS PÚBLICOS ======

    /**
     * Configura los listeners de los items del menú
     * @param {Function} onMenuClick - Callback cuando se hace click en un item
     */
    const setupMenuListeners = (onMenuClick) => {
        if (typeof onMenuClick !== 'function') {
            throw new Error('onMenuClick debe ser una función');
        }

        const menuItems = document.querySelectorAll(MENU_ITEM_SELECTOR);

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const module = item.dataset.module;
                const section = item.dataset.section;

                if (module && section) {
                    onMenuClick({ module, section });
                }
            });
        });
    };

    /**
     * Actualiza la visibilidad del menú basado en permisos
     * @param {string} role - Rol del usuario
     */
    const updateMenuVisibility = (role) => {
        if (!role) {
            console.warn('Rol no proporcionado para actualizar visibilidad del menú');
            return;
        }

        const permissions = getPermissionsForRole(role);
        const menuItems = document.querySelectorAll(MENU_ITEM_SELECTOR);

        menuItems.forEach(item => {
            const module = item.dataset.module;
            
            if (!module) {
                return;
            }

            const hasAccess = hasPermissionForModule(module, permissions);
            item.style.display = hasAccess ? 'flex' : 'none';

            // Agregar atributo para testing
            item.setAttribute('aria-disabled', hasAccess ? 'false' : 'true');
        });
    };

    /**
     * Marca un item del menú como activo
     * @param {string} module - Módulo activo
     * @param {string} section - Sección activa
     */
    const setActiveMenuItem = (module, section) => {
        const menuItems = document.querySelectorAll(MENU_ITEM_SELECTOR);

        menuItems.forEach(item => {
            const isActive = item.dataset.module === module && item.dataset.section === section;
            item.classList.toggle('active', isActive);
        });
    };

    /**
     * Obtiene el item del menú que está activo
     * @returns {Object|null} Objeto con module y section del item activo
     */
    const getActiveMenuItem = () => {
        const activeItem = document.querySelector(`${MENU_ITEM_SELECTOR}.active`);
        
        if (!activeItem) {
            return null;
        }

        return {
            module: activeItem.dataset.module,
            section: activeItem.dataset.section
        };
    };

    // ====== API PÚBLICA ======
    return {
        setupMenuListeners,
        updateMenuVisibility,
        setActiveMenuItem,
        getActiveMenuItem
    };
})();

// Exponer como variable global
window.MenuController = MenuController;
