/**
 * MIDDLEWARE: Autenticación con JWT
 * 
 * Verifica que el usuario esté autenticado antes de acceder a rutas protegidas
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar JWT
 */
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

/**
 * Middleware para verificar rol de admin
 */
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo administradores'
        });
    }
    next();
};

/**
 * Middleware para verificar rol de contador
 */
const verifyContador = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'contador') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo contadores y administradores'
        });
    }
    next();
};

/**
 * Middleware para capturar errores
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyContador,
    errorHandler
};
