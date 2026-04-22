/**
 * CONTROLADOR: Authentication
 * 
 * Maneja login, registro y autenticación de usuarios
 */

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * Login de usuario
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username y password requeridos'
            });
        }

        const result = await User.authenticate(username, password);

        res.json({
            success: true,
            message: 'Login exitoso',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Registro de nuevo usuario
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        // Validaciones básicas
        if (!username || !email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar si usuario ya existe
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }

        // Crear usuario
        const newUser = await User.create(username, email, password, full_name);

        // Autenticar automáticamente
        const authResult = await User.authenticate(username, password);

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            token: authResult.token,
            user: authResult.user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener datos del usuario autenticado
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Actualizar perfil del usuario
 */
exports.updateProfile = async (req, res) => {
    try {
        const { email, full_name } = req.body;

        const updatedUser = await User.update(req.user.id, {
            email,
            full_name
        });

        res.json({
            success: true,
            message: 'Perfil actualizado',
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Cambiar contraseña
 */
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Las contraseñas no coinciden'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Validar contraseña antigua
        const bcrypt = require('bcryptjs');
        const passwordHash = await User.getPasswordHashById(req.user.id);
        if (!passwordHash) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const isValid = await bcrypt.compare(oldPassword, passwordHash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePasswordHash(req.user.id, hashedPassword);

        // Registrar en auditoría
        try {
            await AuditLog.log(
                req.user.id,
                'user',
                req.user.id,
                'CHANGE_PASSWORD',
                { timestamp: new Date() },
                { timestamp: new Date() },
                req.ip
            );
        } catch (auditError) {
            console.error('Error logging audit:', auditError);
            // No fallar la operación si la auditoría falla
        }

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
