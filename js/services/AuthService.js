/**
 * @module AuthService
 * @description Servicio de autenticación - Responsable únicamente de gestionar JWT y sesiones
 * @implements {SingleResponsibilityPrinciple}
 */

const AuthService = (() => {
    // ====== CONSTANTES ======
    const TOKEN_STORAGE_KEY = 'token';
    const JWT_PARTS = 3;
    const JWT_PAYLOAD_INDEX = 1;

    // ====== MÉTODOS PRIVADOS ======

    /**
     * Decodifica un JWT y extrae la información de usuario
     * @private
     * @param {string} token - Token JWT a decodificar
     * @returns {Object} Objeto con datos del usuario (id, username, role)
     * @throws {Error} Si el token es inválido
     */
    const decodeJWT = (token) => {
        try {
            // Validar estructura del token
            if (!token || typeof token !== 'string' || token.split('.').length !== JWT_PARTS) {
                throw new Error('Formato de token inválido');
            }

            // Extraer y decodificar payload
            const base64Url = token.split('.')[JWT_PAYLOAD_INDEX];
            const base64 = base64Url
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error(`Error decodificando token: ${error.message}`);
        }
    };

    /**
     * Valida que el token no haya expirado
     * @private
     * @param {Object} decodedToken - Token decodificado
     * @returns {boolean} true si el token es válido
     */
    const isTokenValid = (decodedToken) => {
        if (!decodedToken || !decodedToken.exp) {
            return false;
        }
        return Math.floor(Date.now() / 1000) < decodedToken.exp;
    };

    /**
     * Extrae información del usuario del token decodificado
     * @private
     * @param {Object} decodedToken - Token decodificado
     * @returns {Object} Objeto usuario con id, username, role
     */
    const extractUserData = (decodedToken) => {
        return {
            id: decodedToken.id,
            username: decodedToken.username,
            role: decodedToken.role
        };
    };

    // ====== MÉTODOS PÚBLICOS ======

    /**
     * Autentica un usuario con credenciales
     * @async
     * @param {string} username - Usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Token JWT y datos del usuario
     * @throws {Error} Si las credenciales son inválidas
     */
    const login = async (username, password) => {
        // Validación de entrada
        if (!username || !password) {
            throw new Error('Usuario y contraseña son requeridos');
        }

        const response = await APIService.login(username, password);
        
        if (!response || !response.token) {
            throw new Error('Respuesta de servidor inválida');
        }

        const decodedToken = decodeJWT(response.token);
        const user = extractUserData(decodedToken);

        // Guardar token
        storeToken(response.token);

        return { token: response.token, user };
    };

    /**
     * Valida y recupera el usuario del token almacenado
     * @returns {Object|null} Datos del usuario si el token es válido, null en caso contrario
     */
    const getCurrentUser = () => {
        const token = getToken();
        
        if (!token) {
            return null;
        }

        try {
            const decodedToken = decodeJWT(token);
            
            if (!isTokenValid(decodedToken)) {
                logout();
                return null;
            }

            return extractUserData(decodedToken);
        } catch (error) {
            console.error('Error validando token:', error);
            logout();
            return null;
        }
    };

    /**
     * Guarda el token en localStorage
     * @param {string} token - Token JWT a guardar
     */
    const storeToken = (token) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    };

    /**
     * Obtiene el token almacenado
     * @returns {string|null} Token JWT o null
     */
    const getToken = () => {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    };

    /**
     * Limpia la sesión del usuario
     */
    const logout = () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    };

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} true si hay una sesión válida
     */
    const isAuthenticated = () => {
        return getCurrentUser() !== null;
    };

    // ====== API PÚBLICA ======
    return {
        login,
        logout,
        getCurrentUser,
        getToken,
        isAuthenticated,
        isTokenValid
    };
})();

// Exponer como variable global
window.AuthService = AuthService;
