/**
 * MODELO: PayrollHistory
 * 
 * Gestiona el histórico de nóminas mensual
 * Permite consultar nóminas pasadas y hacer comparativas
 */

const { query } = require('../config/database');

class PayrollHistory {
    /**
     * Guardar nómina en histórico
     */
    static async create(employeeId, month, year, payrollData) {
        try {
            const sql = `
                INSERT INTO payroll_history 
                (employee_id, month, year, gross_salary, bonuses, benefits, 
                 mandatory_deductions, total_income, net_salary, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
                ON DUPLICATE KEY UPDATE
                gross_salary = VALUES(gross_salary),
                bonuses = VALUES(bonuses),
                benefits = VALUES(benefits),
                mandatory_deductions = VALUES(mandatory_deductions),
                total_income = VALUES(total_income),
                net_salary = VALUES(net_salary)
            `;

            const values = [
                employeeId,
                month,
                year,
                payrollData.gross_salary,
                payrollData.bonuses,
                payrollData.benefits,
                payrollData.mandatory_deductions,
                payrollData.total_income,
                payrollData.net_salary
            ];

            const result = await query(sql, values);
            return this.findByEmployeeAndPeriod(employeeId, month, year);
        } catch (error) {
            throw new Error(`Error guardando nómina: ${error.message}`);
        }
    }

    /**
     * Obtener nómina de un periodo específico
     */
    static async findByEmployeeAndPeriod(employeeId, month, year) {
        try {
            const sql = `
                SELECT * FROM payroll_history 
                WHERE employee_id = ? AND month = ? AND year = ?
            `;
            const result = await query(sql, [employeeId, month, year]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error obteniendo nómina: ${error.message}`);
        }
    }

    /**
     * Obtener histórico de un empleado
     */
    static async findByEmployeeId(employeeId, limit = 12) {
        try {
            const sql = `
                SELECT * FROM payroll_history 
                WHERE employee_id = ? 
                ORDER BY year DESC, month DESC 
                LIMIT ?
            `;
            return await query(sql, [employeeId, limit]);
        } catch (error) {
            throw new Error(`Error obteniendo histórico: ${error.message}`);
        }
    }

    /**
     * Obtener nóminas de un mes para todos los empleados
     */
    static async findByPeriod(userId, month, year) {
        try {
            const sql = `
                SELECT ph.*, e.name AS employee_name, e.employee_type
                FROM payroll_history ph
                INNER JOIN employees e ON ph.employee_id = e.id
                WHERE e.user_id = ? AND ph.month = ? AND ph.year = ? AND e.is_active = TRUE
                ORDER BY e.name ASC
            `;
            return await query(sql, [userId, month, year]);
        } catch (error) {
            throw new Error(`Error obteniendo período: ${error.message}`);
        }
    }

    /**
     * Obtener las nóminas más recientes de un usuario
     */
    static async findRecentByUser(userId, limit = 12) {
        try {
            const sql = `
                SELECT ph.*, e.name AS employee_name, e.employee_type
                FROM payroll_history ph
                INNER JOIN employees e ON ph.employee_id = e.id
                WHERE e.user_id = ? AND e.is_active = TRUE
                ORDER BY ph.year DESC, ph.month DESC, e.name ASC
                LIMIT ?
            `;
            return await query(sql, [userId, limit]);
        } catch (error) {
            throw new Error(`Error obteniendo nóminas recientes: ${error.message}`);
        }
    }

    /**
     * Obtener resumen de nómina mensual
     */
    static async getSummaryByPeriod(userId, month, year) {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_employees,
                    SUM(gross_salary) as total_gross,
                    SUM(bonuses) as total_bonuses,
                    SUM(benefits) as total_benefits,
                    SUM(mandatory_deductions) as total_deductions,
                    SUM(net_salary) as total_net
                FROM payroll_history ph
                INNER JOIN employees e ON ph.employee_id = e.id
                WHERE e.user_id = ? AND ph.month = ? AND ph.year = ? AND e.is_active = TRUE
            `;

            const result = await query(sql, [userId, month, year]);
            return result[0];
        } catch (error) {
            throw new Error(`Error obteniendo resumen: ${error.message}`);
        }
    }

    /**
     * Comparar dos períodos
     */
    static async comparesPeriods(userId, month1, year1, month2, year2) {
        try {
            const period1 = await this.getSummaryByPeriod(userId, month1, year1);
            const period2 = await this.getSummaryByPeriod(userId, month2, year2);

            return {
                period1: { month: month1, year: year1, ...period1 },
                period2: { month: month2, year: year2, ...period2 },
                comparison: {
                    employee_diff: (period2.total_employees || 0) - (period1.total_employees || 0),
                    gross_diff: (period2.total_gross || 0) - (period1.total_gross || 0),
                    net_diff: (period2.total_net || 0) - (period1.total_net || 0)
                }
            };
        } catch (error) {
            throw new Error(`Error comparando períodos: ${error.message}`);
        }
    }

    /**
     * Cambiar estado de nómina (pendiente -> pagado)
     */
    static async updateStatus(payrollId, status) {
        try {
            const sql = `
                UPDATE payroll_history 
                SET status = ? 
                WHERE id = ?
            `;
            await query(sql, [status, payrollId]);
            return true;
        } catch (error) {
            throw new Error(`Error actualizando estado: ${error.message}`);
        }
    }

    /**
     * Obtener nóminas pendientes
     */
    static async getPendingPayrolls(userId) {
        try {
            const sql = `
                SELECT ph.*, e.name AS employee_name, e.employee_type
                FROM payroll_history ph
                INNER JOIN employees e ON ph.employee_id = e.id
                WHERE e.user_id = ? AND ph.status = 'pendiente' AND e.is_active = TRUE
                ORDER BY ph.year DESC, ph.month DESC, e.name ASC
            `;
            return await query(sql, [userId]);
        } catch (error) {
            throw new Error(`Error obteniendo pendientes: ${error.message}`);
        }
    }
}

module.exports = PayrollHistory;
