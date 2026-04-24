/**
 * RUTAS: Histórico de Nóminas
 */

const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { verifyToken, verifyContador } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Consultas generales
router.get('/by-period', payrollController.getByPeriod);
router.get('/summary', payrollController.getSummary);
router.get('/recent', payrollController.getRecent);
router.get('/compare', payrollController.comparePeriods);
router.get('/pending', payrollController.getPending);

// Histórico de empleado
router.get('/employee/:id', payrollController.getEmployeeHistory);
router.get('/employee/:id/:month/:year', payrollController.getSpecific);

// Actualizar estado
router.put('/:id/status', verifyContador, payrollController.updateStatus);

module.exports = router;
