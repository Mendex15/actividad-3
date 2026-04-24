/**
 * CONTROLADOR: Employees
 * 
 * Gestiona CRUD de empleados y cálculos de nómina
 */

const Employee = require('../models/Employee');
const PayrollHistory = require('../models/PayrollHistory');
const AuditLog = require('../models/AuditLog');

/**
 * Crear nuevo empleado
 */
exports.create = async (req, res) => {
    try {
        const employeeData = req.body;

        // Validaciones básicas
        if (!employeeData.name || !employeeData.employee_type) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y tipo de empleado requeridos'
            });
        }

        // Validar según tipo
        if (employeeData.employee_type === 'asalariado' || employeeData.employee_type === 'temporal') {
            if (!employeeData.monthly_salary) {
                return res.status(400).json({
                    success: false,
                    message: 'Salario mensual requerido'
                });
            }
        } else if (employeeData.employee_type === 'horas') {
            if (!employeeData.hourly_rate || employeeData.hours_worked === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Tarifa horaria y horas trabajadas requeridas'
                });
            }
        } else if (employeeData.employee_type === 'comision') {
            if (!employeeData.base_salary || !employeeData.commission_rate || employeeData.sales === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Salario base, tasa de comisión y ventas requeridas'
                });
            }
        }

        const employee = await Employee.create(req.user.id, employeeData);

        // Registrar en auditoría
        try {
            await AuditLog.log(
                req.user.id,
                'employee',
                employee.id,
                'CREATE',
                null,
                employeeData,
                req.ip
            );
        } catch (auditError) {
            console.error('Error logging audit:', auditError);
            // No fallar la operación si la auditoría falla
        }

        res.status(201).json({
            success: true,
            message: 'Empleado creado exitosamente',
            employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener todos los empleados del usuario
 */
exports.getAll = async (req, res) => {
    try {
        const filters = req.query;
        const employees = await Employee.findByUserId(req.user.id, filters);

        res.json({
            success: true,
            total: employees.length,
            employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener empleado por ID
 */
exports.getById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee || employee.user_id !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        res.json({
            success: true,
            employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Actualizar empleado
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || employee.user_id !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        // Guardar valores antiguos para auditoría
        const oldValues = {
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            employee_type: employee.employee_type,
            monthly_salary: employee.monthly_salary,
            years_in_company: employee.years_in_company
        };

        const updatedEmployee = await Employee.update(id, req.body);

        // Registrar en auditoría
        try {
            console.log('🔍 Intentando registrar auditoría:');
            console.log('  - user_id:', req.user.id);
            console.log('  - entity_type:', 'employee');
            console.log('  - entity_id:', id);
            console.log('  - action:', 'UPDATE');
            console.log('  - oldValues keys:', Object.keys(oldValues));
            console.log('  - newValues keys:', Object.keys(req.body));
            
            const auditResult = await AuditLog.log(
                req.user.id,
                'employee',
                id,
                'UPDATE',
                oldValues,
                req.body,
                req.ip
            );
            console.log('✅ Auditoría registrada:', auditResult);
        } catch (auditError) {
            console.error('❌ Error logging audit:', auditError.message);
            console.error('Stack:', auditError.stack);
            // No fallar la operación si la auditoría falla
        }

        res.json({
            success: true,
            message: 'Empleado actualizado',
            employee: updatedEmployee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Eliminar empleado
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || employee.user_id !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        const deletedData = {
            id: employee.id,
            name: employee.name,
            employee_type: employee.employee_type
        };

        await Employee.delete(id);

        // Registrar en auditoría
        try {
            await AuditLog.log(
                req.user.id,
                'employee',
                id,
                'DELETE',
                deletedData,
                null,
                req.ip
            );
        } catch (auditError) {
            console.error('Error logging audit:', auditError);
            // No fallar la operación si la auditoría falla
        }

        res.json({
            success: true,
            message: 'Empleado eliminado'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Calcular nómina de un empleado
 */
exports.calculatePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await Employee.calculatePayroll(id, req.user.id);

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const savedPayroll = await PayrollHistory.create(id, month, year, payroll);

        res.json({
            success: true,
            saved: true,
            period: { month, year },
            payroll: savedPayroll || payroll
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Calcular y guardar nómina de un mes
 */
exports.generatePayroll = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Mes y año requeridos'
            });
        }

        // Obtener todos los empleados
        const employees = await Employee.findByUserId(req.user.id);

        if (!employees || employees.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay empleados activos para generar nómina'
            });
        }

        const payrolls = [];
        const failedEmployees = [];
        for (const employee of employees) {
            try {
                const payroll = await Employee.calculatePayroll(employee.id, req.user.id);
                await PayrollHistory.create(employee.id, month, year, payroll);
                payrolls.push({
                    employee_id: employee.id,
                    employee_name: employee.name,
                    ...payroll
                });
            } catch (error) {
                console.error(`Error calculando nómina para ${employee.name}:`, error);
                failedEmployees.push({
                    employee_id: employee.id,
                    employee_name: employee.name,
                    reason: error.message
                });
            }
        }

        if (payrolls.length === 0) {
            const firstReason = failedEmployees[0]?.reason;
            return res.status(400).json({
                success: false,
                message: firstReason
                    ? `No se pudo generar nómina para ningún empleado. Primera causa: ${firstReason}`
                    : 'No se pudo generar nómina para ningún empleado. Revisa la configuración salarial de cada empleado.',
                failedEmployees
            });
        }

        // Obtener resumen
        const summary = await PayrollHistory.getSummaryByPeriod(req.user.id, month, year);

        res.json({
            success: true,
            message: `Nómina de ${month}/${year} generada`,
            payrolls,
            failedEmployees,
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
 * Obtener estadísticas de empleados
 */
exports.getStatistics = async (req, res) => {
    try {
        const stats = await Employee.getStatistics(req.user.id);

        res.json({
            success: true,
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
