/**
 * @module APIService
 * @description Servicio centralizado de comunicación con el backend REST API
 * @description Encapsula la lógica de requests HTTP, manejo de errores y tokens
 * @implements {Dependency Inversion Principle} - Las funciones no conocen detalles de implementación
 */

const APIService = (() => {
    // ====== CONFIGURACIÓN ======
    const BASE_URL = 'https://actividad-3-4mrx.onrender.com/api';
    const TOKEN_STORAGE_KEY = 'token';
    const REQUEST_TIMEOUT = 30000; // 30 segundos
    const HTTP_STATUS = {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        SERVER_ERROR: 500
    };

    // ====== MÉTODOS PRIVADOS ======

    /**
     * Obtiene el token almacenado
     * @private
     * @returns {string|null} Token JWT o null
     */
    const getStoredToken = () => {
        try {
            return localStorage.getItem(TOKEN_STORAGE_KEY);
        } catch (error) {
            console.warn('No se pudo acceder a localStorage:', error);
            return null;
        }
    };

    /**
     * Construye los headers para la request
     * @private
     * @param {Object} customHeaders - Headers adicionales
     * @returns {Object} Headers completos con autenticación
     */
    const buildHeaders = (customHeaders = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        const token = getStoredToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    };

    /**
     * Parsea la respuesta del servidor
     * @private
     * @param {Response} response - Respuesta HTTP
     * @returns {Promise<Object>} Datos parseados
     * @throws {Error} Si hay error en la parsificación
     */
    const parseResponse = async (response) => {
        try {
            return await response.json();
        } catch (error) {
            throw new Error('Respuesta del servidor inválida');
        }
    };

    /**
     * Maneja errores HTTP
     * @private
     * @param {Response} response - Respuesta HTTP
     * @throws {Error} Con descripción del error
     */
    const handleHTTPError = async (response) => {
        const data = await parseResponse(response);
        const errorMessage = data.message || data.error || 'Error en la solicitud';

        switch (response.status) {
            case HTTP_STATUS.UNAUTHORIZED:
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                window.location.reload();
                throw new Error('Sesión expirada');

            case HTTP_STATUS.FORBIDDEN:
                throw new Error('No tienes permiso para acceder a este recurso');

            case HTTP_STATUS.NOT_FOUND:
                throw new Error('Recurso no encontrado');

            case HTTP_STATUS.SERVER_ERROR:
                throw new Error('Error del servidor');

            default:
                throw new Error(errorMessage);
        }
    };

    /**
     * Realiza una solicitud HTTP con reintentos y timeout
     * @private
     * @param {string} endpoint - Ruta del endpoint
     * @param {Object} options - Opciones de fetch
     * @param {number} retries - Intentos restantes
     * @returns {Promise<Object>} Respuesta parseada
     * @throws {Error} Si hay error después de reintentos
     */
    const makeRequestWithRetry = async (endpoint, options = {}, retries = 1) => {
        try {
            // Crear AbortController para timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: buildHeaders(options.headers),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                await handleHTTPError(response);
            }

            return await parseResponse(response);

        } catch (error) {
            // Reintentar si es un error de red
            if (retries > 0 && error.name === 'AbortError') {
                console.warn(`Reintentando request a ${endpoint}...`);
                return makeRequestWithRetry(endpoint, options, retries - 1);
            }

            throw error;
        }
    };

    /**
     * Realiza una solicitud HTTP genérica
     * @private
     * @param {string} endpoint - Ruta del endpoint
     * @param {Object} options - Opciones de fetch
     * @returns {Promise<Object>} Respuesta del servidor
     */
    const makeRequest = async (endpoint, options = {}) => {
        if (!endpoint || typeof endpoint !== 'string') {
            throw new Error('Endpoint debe ser una cadena válida');
        }

        return makeRequestWithRetry(endpoint, options);
    };

    // ====== API PÚBLICA: AUTENTICACIÓN ======

    /**
     * Autentica un usuario
     * @async
     * @param {string} username - Usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Token JWT y datos del usuario
     * @throws {Error} Si las credenciales son inválidas
     */
    const login = async (username, password) => {
        const response = await makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response.token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
        }

        return response;
    };

    /**
     * Cambia la contraseña del usuario
     * @async
     * @param {string} oldPassword - Contraseña anterior
     * @param {string} newPassword - Nueva contraseña
     * @param {string} confirmPassword - Confirmación de contraseña
     * @returns {Promise<Object>} Respuesta del servidor
     * @throws {Error} Si hay validación fallida
     */
    const changePassword = async (oldPassword, newPassword, confirmPassword) => {
        return makeRequest('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
        });
    };

    /**
     * Cierra la sesión del usuario
     */
    const logout = () => {
        try {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch (error) {
            console.warn('Error limpiando sesión:', error);
        }
    };

    // ====== API PÚBLICA: EMPLEADOS ======

    /**
     * Obtiene lista de empleados
     * @async
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Array>} Array de empleados
     */
    const getEmployees = async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const queryString = params.toString() ? '?' + params.toString() : '';
        const response = await makeRequest(`/employees${queryString}`);
        return response.employees || [];
    };

    /**
     * Crea un nuevo empleado
     * @async
     * @param {Object} data - Datos del empleado
     * @returns {Promise<Object>} Empleado creado
     */
    const createEmployee = async (data) => {
        return makeRequest('/employees', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    };

    /**
     * Actualiza un empleado existente
     * @async
     * @param {number} id - ID del empleado
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<Object>} Empleado actualizado
     */
    const updateEmployee = async (id, data) => {
        if (!id) throw new Error('ID de empleado requerido');
        return makeRequest(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    };

    /**
     * Elimina un empleado
     * @async
     * @param {number} id - ID del empleado
     * @returns {Promise<Object>} Respuesta del servidor
     */
    const deleteEmployee = async (id) => {
        if (!id) throw new Error('ID de empleado requerido');
        return makeRequest(`/employees/${id}`, {
            method: 'DELETE'
        });
    };

    // ====== API PÚBLICA: NÓMINA ======

    /**
     * Calcula la nómina de un empleado
     * @async
     * @param {number} employeeId - ID del empleado
     * @returns {Promise<Object>} Detalle de cálculo de nómina
     */
    const calculatePayroll = async (employeeId) => {
        if (!employeeId) throw new Error('ID de empleado requerido');
        return makeRequest(`/employees/${employeeId}/payroll`, {
            method: 'POST'
        });
    };

    /**
     * Obtiene resumen de nómina por período
     * @async
     * @param {number} month - Mes (1-12)
     * @param {number} year - Año
     * @returns {Promise<Object>} Resumen de nómina
     */
    const getPayrollByPeriod = async (month, year) => {
        if (!month || !year) throw new Error('Mes y año son requeridos');
        return makeRequest(`/payroll/by-period?month=${month}&year=${year}`);
    };

    /**
     * Obtiene historial de nómina de un empleado
     * @async
     * @param {number} employeeId - ID del empleado
     * @param {number} limit - Cantidad máxima de registros
     * @returns {Promise<Array>} Array de registros de nómina
     */
    const getEmployeePayrollHistory = async (employeeId, limit = 12) => {
        if (!employeeId) throw new Error('ID de empleado requerido');
        return makeRequest(`/payroll/employee/${employeeId}?limit=${limit}`);
    };

    /**
     * Obtiene nómina de empleado en período específico
     * @async
     * @param {number} employeeId - ID del empleado
     * @param {number} month - Mes
     * @param {number} year - Año
     * @returns {Promise<Object>} Detalle de nómina
     */
    const getEmployeePayrollByPeriod = async (employeeId, month, year) => {
        if (!employeeId) throw new Error('ID de empleado requerido');
        return makeRequest(`/payroll/employee/${employeeId}/${month}/${year}`);
    };

    // ====== API PÚBLICA: AUDITORÍA ======

    /**
     * Obtiene registros de auditoría recientes
     * @async
     * @param {number} limit - Máximo de registros
     * @param {number} offset - Desplazamiento
     * @returns {Promise<Object>} Logs de auditoría
     */
    const getAuditLogs = async (limit = 50, offset = 0) => {
        if (limit < 1 || limit > 100) limit = 50;
        if (offset < 0) offset = 0;
        return makeRequest(`/audit/recent?limit=${limit}&offset=${offset}`);
    };

    // ====== API PÚBLICA: GESTIÓN DE TOKENS ======

    /**
     * Obtiene el token almacenado
     * @returns {string|null} Token JWT
     */
    const getToken = () => getStoredToken();

    /**
     * Guarda un token
     * @param {string} token - Token a guardar
     */
    const setToken = (token) => {
        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
    };

    /**
     * Elimina el token almacenado
     */
    const removeToken = () => {
        logout();
    };

    // ====== API PÚBLICA ======
    return {
        // Autenticación
        login,
        logout,
        changePassword,
        getToken,
        setToken,
        removeToken,

        // Empleados
        getEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,

        // Nómina
        calculatePayroll,
        getPayrollByPeriod,
        getEmployeePayrollHistory,
        getEmployeePayrollByPeriod,

        // Auditoría
        getAuditLogs
    };
})();

// Exponer globalmente para compatibilidad
window.APIService = APIService;
