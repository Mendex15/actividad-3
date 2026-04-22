/**
 * @module UIStateManager
 * @description Gestor de estado de UI - Responsable únicamente de mostrar/ocultar pantallas
 * @implements {SingleResponsibilityPrinciple}
 */

const UIStateManager = (() => {
    // ====== ELEMENTOS DOM ======
    const elements = {
        loginScreen: null,
        dashboardScreen: null,
        sidebarUserName: null,
        sidebarUserRole: null,
        moduleContainer: null
    };

    /**
     * Inicializa referencias a elementos DOM
     * @private
     */
    const cacheElements = () => {
        elements.loginScreen = document.getElementById('loginScreen');
        elements.dashboardScreen = document.getElementById('dashboardScreen');
        elements.sidebarUserName = document.getElementById('sidebarUserName');
        elements.sidebarUserRole = document.getElementById('sidebarUserRole');
        elements.moduleContainer = document.getElementById('moduleContainer');
    };

    /**
     * Valida que todos los elementos DOM requeridos existan
     * @private
     * @returns {boolean} true si todos los elementos existen
     */
    const validateElements = () => {
        const required = ['loginScreen', 'dashboardScreen', 'moduleContainer'];
        return required.every(key => elements[key] !== null);
    };

    // ====== MÉTODOS PÚBLICOS ======

    /**
     * Inicializa el gestor de estado de UI
     * @throws {Error} Si falta algún elemento DOM requerido
     */
    const init = () => {
        cacheElements();
        
        if (!validateElements()) {
            throw new Error('Elementos DOM requeridos no encontrados');
        }
    };

    /**
     * Muestra la pantalla de login
     */
    const showLoginScreen = () => {
        if (elements.loginScreen) elements.loginScreen.style.display = 'flex';
        if (elements.dashboardScreen) elements.dashboardScreen.style.display = 'none';
        window.location.hash = '';
    };

    /**
     * Muestra el dashboard
     */
    const showDashboard = () => {
        if (elements.loginScreen) elements.loginScreen.style.display = 'none';
        if (elements.dashboardScreen) elements.dashboardScreen.style.display = 'flex';
    };

    /**
     * Actualiza la información del usuario en el sidebar
     * @param {Object} user - Objeto usuario con username y role
     */
    const updateUserInfo = (user) => {
        if (!user) return;

        if (elements.sidebarUserName) {
            elements.sidebarUserName.textContent = user.username || 'Usuario';
        }

        if (elements.sidebarUserRole) {
            elements.sidebarUserRole.textContent = user.role || 'Sin rol';
        }
    };

    /**
     * Obtiene el contenedor de módulos
     * @returns {HTMLElement} Contenedor donde cargar módulos
     */
    const getModuleContainer = () => {
        return elements.moduleContainer;
    };

    /**
     * Limpia el contenedor de módulos
     */
    const clearModuleContainer = () => {
        if (elements.moduleContainer) {
            elements.moduleContainer.innerHTML = '';
        }
    };

    /**
     * Muestra/oculta el sidebar (móvil)
     */
    const toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    };

    // ====== API PÚBLICA ======
    return {
        init,
        showLoginScreen,
        showDashboard,
        updateUserInfo,
        getModuleContainer,
        clearModuleContainer,
        toggleSidebar
    };
})();

// Exponer como variable global
window.UIStateManager = UIStateManager;
