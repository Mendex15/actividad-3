/**
 * RUTAS: Empleados
 */

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, verifyContador } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// CRUD de empleados
router.post('/', employeeController.create);
router.get('/', employeeController.getAll);
router.get('/statistics', employeeController.getStatistics);
router.get('/:id', employeeController.getById);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.delete);

// Nómina
router.post('/:id/payroll', employeeController.calculatePayroll);
router.post('/generate-payroll', verifyContador, employeeController.generatePayroll);

module.exports = router;
