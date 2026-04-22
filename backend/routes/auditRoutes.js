/**
 * RUTAS: Auditoría
 *
 * Endpoints para consultar el registro de auditoría.
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/audit/recent - Obtener logs recientes
router.get('/recent', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || 50), 100);
        const offset = parseInt(req.query.offset || 0);
        
        const logs = await AuditLog.getRecent(limit, offset);
        
        res.json({
            success: true,
            logs: logs,
            count: logs.length
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching audit logs',
            error: error.message
        });
    }
});

// GET /api/audit/entity/:type/:id - Obtener logs de una entidad específica
router.get('/entity/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const limit = Math.min(parseInt(req.query.limit || 50), 100);
        
        const logs = await AuditLog.getByEntity(type, id, limit);
        
        res.json({
            success: true,
            logs: logs,
            count: logs.length
        });
    } catch (error) {
        console.error('Error fetching entity audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching entity audit logs',
            error: error.message
        });
    }
});

// GET /api/audit/user/:userId - Obtener logs de un usuario
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = Math.min(parseInt(req.query.limit || 50), 100);
        
        const logs = await AuditLog.getByUser(userId, limit);
        
        res.json({
            success: true,
            logs: logs,
            count: logs.length
        });
    } catch (error) {
        console.error('Error fetching user audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user audit logs',
            error: error.message
        });
    }
});

// GET /api/audit/range - Obtener logs por rango de fechas
router.get('/range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate are required'
            });
        }

        const limit = Math.min(parseInt(req.query.limit || 50), 100);
        const logs = await AuditLog.getByDateRange(startDate, endDate, limit);
        
        res.json({
            success: true,
            logs: logs,
            count: logs.length
        });
    } catch (error) {
        console.error('Error fetching audit logs by date range:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching audit logs by date range',
            error: error.message
        });
    }
});

module.exports = router;
