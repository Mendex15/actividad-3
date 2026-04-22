/**
 * CONTROLADOR: PayrollHistory
 * 
 * Gestiona el histórico de nóminas y reportes
 */

const PayrollHistory = require('../models/PayrollHistory');
const Employee = require('../models/Employee');

/**
 * Obtener nóminas de un período
 */
exports.getByPeriod = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año requeridos'
            });
        }

        const payrolls = await PayrollHistory.findByPeriod(req.user.id, month, year);

        if (payrolls.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron nóminas para este período'
            });
        }

        const summary = await PayrollHistory.getSummaryByPeriod(req.user.id, month, year);

        res.json({
            success: true,
            period: { month, year },
            payrolls,
            summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener histórico de un empleado
 */
exports.getEmployeeHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit } = req.query;

        // Verificar que el empleado pertenece al usuario
        const employee = await Employee.findById(id);
        if (!employee || employee.user_id !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        const history = await PayrollHistory.findByEmployeeId(id, limit || 12);

        res.json({
            success: true,
            employee_id: id,
            employee_name: employee.name,
            total_records: history.length,
            history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener nómina específica de un empleado
 */
exports.getSpecific = async (req, res) => {
    try {
        const { id, month, year } = req.params;

        // Verificar que el empleado pertenece al usuario
        const employee = await Employee.findById(id);
        if (!employee || employee.user_id !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        const payroll = await PayrollHistory.findByEmployeeAndPeriod(id, month, year);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Nómina no encontrada'
            });
        }

        res.json({
            success: true,
            payroll
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Comparar dos períodos
 */
exports.comparePeriods = async (req, res) => {
    try {
        const { month1, year1, month2, year2 } = req.query;

        if (!month1 || !year1 || !month2 || !year2) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren dos períodos para comparar'
            });
        }

        const comparison = await PayrollHistory.comparesPeriods(
            req.user.id,
            month1,
            year1,
            month2,
            year2
        );

        res.json({
            success: true,
            comparison
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener nóminas pendientes de pago
 */
exports.getPending = async (req, res) => {
    try {
        const pending = await PayrollHistory.getPendingPayrolls(req.user.id);

        res.json({
            success: true,
            total: pending.length,
            payrolls: pending
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Actualizar estado de pago de nómina
 */
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pendiente', 'pagado', 'cancelado'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido'
            });
        }

        await PayrollHistory.updateStatus(id, status);

        res.json({
            success: true,
            message: `Nómina marcada como ${status}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener resumen mensual
 */
exports.getSummary = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año requeridos'
            });
        }

        const summary = await PayrollHistory.getSummaryByPeriod(req.user.id, month, year);

        res.json({
            success: true,
            period: { month, year },
            summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
