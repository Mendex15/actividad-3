/**
 * MODELO: User
 * 
 * Gestiona operaciones de usuarios en la base de datos
 * Principio SOLID: Single Responsibility
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

class User {
    /**
     * Crear nuevo usuario
     */
    static async create(username, email, password, fullName, role = 'usuario') {
        try {
            // Hashear contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = 'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)';
            const result = await query(sql, [username, email, hashedPassword, fullName, role]);

            return {
                id: result.insertId,
                username,
                email,
                full_name: fullName,
                role
            };
        } catch (error) {
            throw new Error(`Error creando usuario: ${error.message}`);
        }
    }

    /**
     * Buscar usuario por ID
     */
    static async findById(id) {
        try {
            const sql = 'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = ?';
            const result = await query(sql, [id]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error buscando usuario: ${error.message}`);
        }
    }

    /**
     * Obtener hash de contraseña por ID (solo uso interno)
     */
    static async getPasswordHashById(id) {
        try {
            const sql = 'SELECT password_hash FROM users WHERE id = ?';
            const result = await query(sql, [id]);
            return result[0]?.password_hash || null;
        } catch (error) {
            throw new Error(`Error obteniendo contraseña: ${error.message}`);
        }
    }

    /**
     * Actualizar hash de contraseña (solo uso interno)
     */
    static async updatePasswordHash(id, passwordHash) {
        try {
            const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
            await query(sql, [passwordHash, id]);
            return true;
        } catch (error) {
            throw new Error(`Error actualizando contraseña: ${error.message}`);
        }
    }

    /**
     * Buscar usuario por username
     */
    static async findByUsername(username) {
        try {
            const sql = 'SELECT * FROM users WHERE username = ?';
            const result = await query(sql, [username]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error buscando usuario: ${error.message}`);
        }
    }

    /**
     * Validar credenciales y generar token
     */
    static async authenticate(username, password) {
        try {
            const user = await this.findByUsername(username);

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            if (!user.is_active) {
                throw new Error('Usuario inactivo');
            }

            // Comparar contraseña
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                throw new Error('Contraseña incorrecta');
            }

            // Generar JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            return {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                }
            };
        } catch (error) {
            throw new Error(`Error autenticando: ${error.message}`);
        }
    }

    /**
     * Obtener todos los usuarios (solo admin)
     */
    static async getAll() {
        try {
            const sql = 'SELECT id, username, email, full_name, role, is_active, created_at FROM users';
            return await query(sql);
        } catch (error) {
            throw new Error(`Error obteniendo usuarios: ${error.message}`);
        }
    }

    /**
     * Actualizar usuario
     */
    static async update(id, data) {
        try {
            const fields = [];
            const values = [];

            if (data.email) {
                fields.push('email = ?');
                values.push(data.email);
            }
            if (data.full_name) {
                fields.push('full_name = ?');
                values.push(data.full_name);
            }
            if (data.role) {
                fields.push('role = ?');
                values.push(data.role);
            }

            values.push(id);

            const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            await query(sql, values);

            return this.findById(id);
        } catch (error) {
            throw new Error(`Error actualizando usuario: ${error.message}`);
        }
    }

    /**
     * Desactivar usuario
     */
    static async deactivate(id) {
        try {
            const sql = 'UPDATE users SET is_active = FALSE WHERE id = ?';
            await query(sql, [id]);
            return true;
        } catch (error) {
            throw new Error(`Error desactivando usuario: ${error.message}`);
        }
    }
}

module.exports = User;
