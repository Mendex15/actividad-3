/**
 * MODELO: Employee
 * 
 * Gestiona operaciones de empleados en la base de datos
 * Implementa todas las reglas de negocio de cálculo de nómina
 */

const { query } = require('../config/database');

class Employee {
    /**
     * Crear nuevo empleado
     */
    static async create(userId, employeeData) {
        try {
            const sql = `
                INSERT INTO employees 
                (user_id, name, employee_type, years_in_company, monthly_salary, 
                 hourly_rate, hours_worked, has_savings_fund, base_salary, 
                 commission_rate, sales, ci, email, phone, department)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                userId,
                employeeData.name,
                employeeData.employee_type,
                employeeData.years_in_company || 0,
                employeeData.monthly_salary || null,
                employeeData.hourly_rate || null,
                employeeData.hours_worked || null,
                employeeData.has_savings_fund || false,
                employeeData.base_salary || null,
                employeeData.commission_rate || null,
                employeeData.sales || null,
                employeeData.ci || null,
                employeeData.email || null,
                employeeData.phone || null,
                employeeData.department || null
            ];

            const result = await query(sql, values);
            return this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Error creando empleado: ${error.message}`);
        }
    }

    /**
     * Obtener empleado por ID
     */
    static async findById(id) {
        try {
            const sql = 'SELECT * FROM employees WHERE id = ?';
            const result = await query(sql, [id]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error buscando empleado: ${error.message}`);
        }
    }

    /**
     * Obtener todos los empleados de un usuario
     */
    static async findByUserId(userId, filters = {}) {
        try {
            let sql = 'SELECT * FROM employees WHERE user_id = ? AND is_active = TRUE';
            const values = [userId];

            // Filtro por tipo de empleado
            if (filters.employee_type) {
                sql += ' AND employee_type = ?';
                values.push(filters.employee_type);
            }

            // Búsqueda por nombre
            if (filters.name) {
                sql += ' AND name LIKE ?';
                values.push(`%${filters.name}%`);
            }

            // Ordenamiento
            sql += ' ORDER BY name ASC';

            return await query(sql, values);
        } catch (error) {
            throw new Error(`Error obteniendo empleados: ${error.message}`);
        }
    }

    /**
     * Actualizar empleado
     */
    static async update(id, employeeData) {
        try {
            const fields = [];
            const values = [];

            const updateableFields = [
                'name', 'employee_type', 'years_in_company',
                'monthly_salary', 'hourly_rate', 'hours_worked',
                'has_savings_fund', 'base_salary', 'commission_rate',
                'sales', 'ci', 'email', 'phone', 'department'
            ];

            for (const field of updateableFields) {
                if (employeeData[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(employeeData[field]);
                }
            }

            if (fields.length === 0) {
                return this.findById(id);
            }

            values.push(id);

            const sql = `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`;
            await query(sql, values);

            return this.findById(id);
        } catch (error) {
            throw new Error(`Error actualizando empleado: ${error.message}`);
        }
    }

    /**
     * Eliminar empleado (soft delete)
     */
    static async delete(id) {
        try {
            const sql = 'UPDATE employees SET is_active = FALSE WHERE id = ?';
            await query(sql, [id]);
            return true;
        } catch (error) {
            throw new Error(`Error eliminando empleado: ${error.message}`);
        }
    }

    /**
     * Calcular nómina de un empleado
     */
    static async calculatePayroll(employeeId, userId) {
        try {
            const employee = await this.findById(employeeId);

            if (!employee || employee.user_id !== userId) {
                throw new Error('Empleado no encontrado');
            }

            let grossSalary = 0;
            let bonuses = 0;
            let benefits = 0;

            // Obtener configuración de la empresa
            const settings = await query(
                'SELECT * FROM company_settings WHERE user_id = ?',
                [userId]
            );
            const config = settings[0];

            // Calcular según tipo de empleado
            switch (employee.employee_type) {
                case 'asalariado':
                    grossSalary = parseFloat(employee.monthly_salary) || 0;
                    
                    // Bono por antigüedad: 10% si > 5 años
                    if (employee.years_in_company > config.seniority_years_threshold) {
                        bonuses = grossSalary * config.seniority_bonus_rate;
                    }
                    
                    // Bono alimentación
                    benefits = parseFloat(config.food_allowance) || 0;
                    break;

                case 'horas':
                    // Horas regulares (40) + extras (1.5x)
                    const regularHours = Math.min(employee.hours_worked, 40);
                    const extraHours = Math.max(0, employee.hours_worked - 40);
                    grossSalary = (regularHours * parseFloat(employee.hourly_rate)) + 
                                 (extraHours * parseFloat(employee.hourly_rate) * 1.5);
                    
                    // Fondo de ahorro: 2% si > 1 año
                    if (employee.years_in_company > 1 && employee.has_savings_fund) {
                        benefits = grossSalary * 0.02;
                    }
                    break;

                case 'comision':
                    // Salario base + comisión
                    const baseSal = parseFloat(employee.base_salary) || 0;
                    const commRate = parseFloat(employee.commission_rate) || 0;
                    const sales = parseFloat(employee.sales) || 0;
                    const commission = sales * commRate;
                    grossSalary = baseSal + commission;
                    
                    // Bono adicional: 3% si ventas > $20M
                    if (sales > parseFloat(config.commission_bonus_threshold)) {
                        bonuses = sales * parseFloat(config.commission_bonus_rate);
                    }
                    
                    // Bono alimentación
                    benefits = parseFloat(config.food_allowance) || 0;
                    break;

                case 'temporal':
                    grossSalary = parseFloat(employee.monthly_salary) || 0;
                    bonuses = 0;
                    benefits = 0;
                    break;
            }

            // Deducciones obligatorias (4% seguro social)
            const mandatoryDeductions = grossSalary * parseFloat(config.pension_rate);

            // Total
            const totalIncome = grossSalary + bonuses + benefits;
            const netSalary = totalIncome - mandatoryDeductions;

            console.log('DEBUG calculatePayroll:', {
                employee_type: employee.employee_type,
                grossSalary,
                bonuses,
                benefits,
                mandatoryDeductions,
                totalIncome,
                netSalary
            });

            // Validar que no sea negativo
            if (netSalary < 0) {
                throw new Error(`Salario neto negativo para ${employee.name}`);
            }

            return {
                employee_id: employeeId,
                gross_salary: Math.round(grossSalary),
                bonuses: Math.round(bonuses),
                benefits: Math.round(benefits),
                mandatory_deductions: Math.round(mandatoryDeductions),
                total_income: Math.round(totalIncome),
                net_salary: Math.round(netSalary)
            };
        } catch (error) {
            throw new Error(`Error calculando nómina: ${error.message}`);
        }
    }

    /**
     * Obtener estadísticas de empleados
     */
    static async getStatistics(userId) {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_employees,
                    employee_type,
                    COUNT(*) as count
                FROM employees
                WHERE user_id = ? AND is_active = TRUE
                GROUP BY employee_type
            `;

            return await query(sql, [userId]);
        } catch (error) {
            throw new Error(`Error obteniendo estadísticas: ${error.message}`);
        }
    }
}

module.exports = Employee;
