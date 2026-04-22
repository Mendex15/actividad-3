/**
 * @module DashboardApp
 * @description Orquestador principal de la aplicación
 * @description Coordina autenticación, UI, routing y gestión de permisos
 * @implements {Dependency Inversion Principle}
 * @implements {Single Responsibility Principle}
 * 
 * IMPORTANTE: Este módulo actúa como orquestador, delegando responsabilidades
 * a servicios especializados (AuthService, UIStateManager, MenuController, Router)
 */

const DashboardApp = (() => {
    // ====== ESTADO PRIVADO ======
    let currentUser = null;

    // ====== CONSTANTES ======
    const DOM_SELECTORS = {
        loginForm: '#loginForm',
        loginUsername: '#loginUsername',
        loginPassword: '#loginPassword',
        loginError: '#loginError',
        logoutBtn: '#logoutBtn',
        toggleSidebarBtn: '.btn-toggle-sidebar',
        pageTitle: '#pageTitle'
    };

    // ====== VALIDACIÓN ======

    /**
     * Valida que todas las dependencias necesarias estén disponibles
     * @private
     * @throws {Error} Si falta alguna dependencia
     */
    const validateDependencies = () => {
        const required = ['AuthService', 'UIStateManager', 'MenuController', 'Router', 'APIService', 'Helpers'];
        const missing = required.filter(dep => typeof window[dep] === 'undefined');

        if (missing.length > 0) {
            throw new Error(`Dependencias faltantes: ${missing.join(', ')}`);
        }
    };

    // ====== MANEJADORES DE EVENTOS ======

    /**
     * Maneja el envío del formulario de login
     * @private
     * @param {Event} e - Evento del formulario
     */
    const handleLogin = async (e) => {
        e.preventDefault();

        const username = document.querySelector(DOM_SELECTORS.loginUsername)?.value?.trim();
        const password = document.querySelector(DOM_SELECTORS.loginPassword)?.value;
        const errorElement = document.querySelector(DOM_SELECTORS.loginError);

        // Validación de entrada
        if (!username || !password) {
            showLoginError('Usuario y contraseña son requeridos');
            return;
        }

        try {
            // Intenta autenticar al usuario
            const result = await AuthService.login(username, password);
            currentUser = result.user;

            // Actualiza la UI
            UIStateManager.updateUserInfo(currentUser);
            UIStateManager.showDashboard();

            // Inicializa componentes
            initializeDashboard();

            // Mensaje de bienvenida
            Helpers.showNotification(`¡Bienvenido, ${currentUser.username}!`, 'success');

            // Limpia el formulario
            document.querySelector(DOM_SELECTORS.loginForm).reset();
            hideLoginError();

        } catch (error) {
            console.error('Error en login:', error);
            showLoginError(error.message || 'Error en inicio de sesión');
        }
    };

    /**
     * Maneja el cierre de sesión
     * @private
     */
    const handleLogout = () => {
        if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            return;
        }

        try {
            // Limpia la sesión
            AuthService.logout();
            currentUser = null;

            // Resetea la UI
            UIStateManager.showLoginScreen();
            UIStateManager.clearModuleContainer();

            // Notificación
            Helpers.showNotification('Sesión cerrada correctamente', 'success');

        } catch (error) {
            console.error('Error cerrando sesión:', error);
            Helpers.showNotification('Error cerrando sesión', 'error');
        }
    };

    /**
     * Maneja clicks en el menú
     * @private
     * @param {Object} menuItem - Item seleccionado {module, section}
     */
    const handleMenuClick = (menuItem) => {
        if (!menuItem || !menuItem.module) {
            console.warn('Item de menú inválido');
            return;
        }

        // Actualiza el menú activo
        MenuController.setActiveMenuItem(menuItem.module, menuItem.section);

        // Navega al módulo
        Router.navigate(menuItem.module, menuItem.section);

        // Actualiza el título
        updatePageTitle(menuItem.module);

        // Cierra sidebar en móvil
        document.querySelector(DOM_SELECTORS.toggleSidebarBtn)?.click();
    };

    /**
     * Maneja el toggle del sidebar
     * @private
     */
    const handleToggleSidebar = () => {
        UIStateManager.toggleSidebar();
    };

    // ====== UTILIDADES DE UI ======

    /**
     * Muestra un mensaje de error en el login
     * @private
     * @param {string} message - Mensaje de error
     */
    const showLoginError = (message) => {
        const errorElement = document.querySelector(DOM_SELECTORS.loginError);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    };

    /**
     * Oculta el mensaje de error en el login
     * @private
     */
    const hideLoginError = () => {
        const errorElement = document.querySelector(DOM_SELECTORS.loginError);
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    };

    /**
     * Actualiza el título de la página según el módulo
     * @private
     * @param {string} module - Módulo actual
     */
    const updatePageTitle = (module) => {
        const titleElement = document.querySelector(DOM_SELECTORS.pageTitle);
        if (!titleElement) return;

        const titles = {
            dashboard: 'Dashboard',
            employees: 'Empleados',
            payroll: 'Nómina',
            periods: 'Períodos',
            security: 'Seguridad',
            reports: 'Reportes'
        };

        titleElement.textContent = titles[module] || module;
    };

    // ====== INICIALIZACIÓN ======

    /**
     * Configura los listeners de eventos de la aplicación
     * @private
     */
    const setupEventListeners = () => {
        // Login
        const loginForm = document.querySelector(DOM_SELECTORS.loginForm);
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        // Logout
        const logoutBtn = document.querySelector(DOM_SELECTORS.logoutBtn);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        // Toggle sidebar
        const toggleBtn = document.querySelector(DOM_SELECTORS.toggleSidebarBtn);
        if (toggleBtn) {
            toggleBtn.addEventListener('click', handleToggleSidebar);
        }

        // Menú
        MenuController.setupMenuListeners(handleMenuClick);
    };

    /**
     * Verifica la autenticación actual
     * @private
     */
    const checkAuthentication = () => {
        const user = AuthService.getCurrentUser();

        if (user) {
            currentUser = user;
            UIStateManager.updateUserInfo(currentUser);
            UIStateManager.showDashboard();
            initializeDashboard();
        } else {
            UIStateManager.showLoginScreen();
        }
    };

    /**
     * Inicializa el dashboard después de login
     * @private
     */
    const initializeDashboard = () => {
        if (!currentUser) {
            console.error('No hay usuario autenticado');
            return;
        }

        try {
            // Actualiza visibilidad del menú según permisos
            MenuController.updateMenuVisibility(currentUser.role);

            // Inicializa el router
            Router.init();

            // Navega al dashboard por defecto
            Router.navigate('dashboard', 'dashboard');
            MenuController.setActiveMenuItem('dashboard', 'dashboard');

        } catch (error) {
            console.error('Error inicializando dashboard:', error);
            Helpers.showNotification('Error inicializando dashboard', 'error');
        }
    };

    /**
     * Inicializa toda la aplicación
     * @throws {Error} Si falta alguna dependencia o elemento DOM
     */
    const init = () => {
        try {
            // Validar dependencias
            validateDependencies();

            // Inicializar UIStateManager
            UIStateManager.init();

            // Configurar listeners
            setupEventListeners();

            // Verificar autenticación
            checkAuthentication();

            console.log('✅ Dashboard inicializado correctamente');

        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            Helpers.showNotification('Error iniciando aplicación: ' + error.message, 'error');
        }
    };

    /**
     * Obtiene el usuario actual
     * @returns {Object|null} Datos del usuario o null
     */
    const getCurrentUser = () => currentUser;

    // ====== API PÚBLICA ======
    return {
        init,
        getCurrentUser
    };
})();

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
    DashboardApp.init();
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DashboardApp.init();
    });
} else {
    DashboardApp.init();
}
