/**
 * MODELO: AuditLog
 *
 * Registra y consulta eventos de auditoría del sistema.
 */

const { query: dbQuery } = require('../config/database');

class AuditLog {
    static _toSafeInt(value, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
        const n = Number.parseInt(value, 10);
        if (!Number.isFinite(n)) return fallback;
        return Math.min(Math.max(n, min), max);
    }

    static async log(userId, entityType, entityId, action, oldValues = null, newValues = null, ipAddress = null) {
        try {
            const sql = `
                INSERT INTO audit_log (user_id, entity_type, entity_id, action, old_values, new_values, ip_address)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const result = await dbQuery(sql, [
                userId,
                entityType,
                entityId,
                action,
                oldValues ? JSON.stringify(oldValues) : null,
                newValues ? JSON.stringify(newValues) : null,
                ipAddress || null
            ]);

            return result;
        } catch (error) {
            console.error('Error logging audit:', error);
            throw error;
        }
    }

    static async getRecent(limit = 50, offset = 0) {
        try {
            const safeLimit = this._toSafeInt(limit, 50, { min: 1, max: 100 });
            const safeOffset = this._toSafeInt(offset, 0, { min: 0, max: 1_000_000 });

            const sql = `
                SELECT 
                    a.id,
                    a.action,
                    a.entity_type,
                    a.entity_id,
                    a.old_values,
                    a.new_values,
                    a.created_at,
                    u.username,
                    u.full_name,
                    e.name as employee_name
                FROM audit_log a
                JOIN users u ON a.user_id = u.id
                LEFT JOIN employees e ON a.entity_type = 'employee' AND a.entity_id = e.id
                ORDER BY a.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            return await dbQuery(sql);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            throw error;
        }
    }

    static async getByEntity(entityType, entityId, limit = 50) {
        try {
            const safeLimit = this._toSafeInt(limit, 50, { min: 1, max: 100 });

            const sql = `
                SELECT 
                    a.id,
                    a.action,
                    a.entity_type,
                    a.entity_id,
                    a.old_values,
                    a.new_values,
                    a.created_at,
                    u.username,
                    u.full_name
                FROM audit_log a
                JOIN users u ON a.user_id = u.id
                WHERE a.entity_type = ? AND a.entity_id = ?
                ORDER BY a.created_at DESC
                LIMIT ${safeLimit}
            `;

            return await dbQuery(sql, [entityType, entityId]);
        } catch (error) {
            console.error('Error fetching entity audit logs:', error);
            throw error;
        }
    }

    static async getByUser(userId, limit = 50) {
        try {
            const safeLimit = this._toSafeInt(limit, 50, { min: 1, max: 100 });

            const sql = `
                SELECT 
                    a.id,
                    a.action,
                    a.entity_type,
                    a.entity_id,
                    a.old_values,
                    a.new_values,
                    a.created_at,
                    u.username,
                    u.full_name,
                    e.name as employee_name
                FROM audit_log a
                JOIN users u ON a.user_id = u.id
                LEFT JOIN employees e ON a.entity_type = 'employee' AND a.entity_id = e.id
                WHERE a.user_id = ?
                ORDER BY a.created_at DESC
                LIMIT ${safeLimit}
            `;

            return await dbQuery(sql, [userId]);
        } catch (error) {
            console.error('Error fetching user audit logs:', error);
            throw error;
        }
    }

    static async getByDateRange(startDate, endDate, limit = 50) {
        try {
            const safeLimit = this._toSafeInt(limit, 50, { min: 1, max: 100 });

            const sql = `
                SELECT 
                    a.id,
                    a.action,
                    a.entity_type,
                    a.entity_id,
                    a.old_values,
                    a.new_values,
                    a.created_at,
                    u.username,
                    u.full_name,
                    e.name as employee_name
                FROM audit_log a
                JOIN users u ON a.user_id = u.id
                LEFT JOIN employees e ON a.entity_type = 'employee' AND a.entity_id = e.id
                WHERE a.created_at BETWEEN ? AND ?
                ORDER BY a.created_at DESC
                LIMIT ${safeLimit}
            `;

            return await dbQuery(sql, [startDate, endDate]);
        } catch (error) {
            console.error('Error fetching audit logs by date range:', error);
            throw error;
        }
    }
}

module.exports = AuditLog;
