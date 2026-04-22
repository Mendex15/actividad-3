/**
 * UTILIDADES: Validators
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo valida datos
 * - Interface Segregation: Métodos específicos de validación
 * 
 * Módulo para centralizar todas las validaciones del sistema.
 */
class Validators {
    /**
     * Valida que un nombre no esté vacío
     * @param {string} name - Nombre a validar
     * @returns {object} {isValid: boolean, error: string|null}
     */
    static validateName(name) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return {
                isValid: false,
                error: 'El nombre no puede estar vacío'
            };
        }
        if (name.length < 3) {
            return {
                isValid: false,
                error: 'El nombre debe tener al menos 3 caracteres'
            };
        }
        return { isValid: true, error: null };
    }

    /**
     * Valida que los años en la empresa sean válidos
     * @param {number} years - Años a validar
     * @returns {object} {isValid: boolean, error: string|null}
     */
    static validateYearsInCompany(years) {
        const yearsNum = Number(years);
        if (isNaN(yearsNum) || yearsNum < 0) {
            return {
                isValid: false,
                error: 'Los años en la empresa no pueden ser negativos'
            };
        }
        if (yearsNum > 100) {
            return {
                isValid: false,
                error: 'Los años en la empresa no pueden superar 100'
            };
        }
        return { isValid: true, error: null };
    }

    /**
     * Valida que un salario sea válido
     * @param {number} salary - Salario a validar
     * @param {string} fieldName - Nombre del campo (para el mensaje)
     * @returns {object} {isValid: boolean, error: string|null}
     */
    static validateSalary(salary, fieldName = 'Salario') {
        const salaryNum = Number(salary);
        if (isNaN(salaryNum) || salaryNum < 0) {
            return {
                isValid: false,
                error: `${fieldName} no puede ser negativo`
            };
        }
        if (salaryNum > 1000000000) {
            return {
                isValid: false,
                error: `${fieldName} parece ser un valor inusualmente alto`
            };
        }
        return { isValid: true, error: null };
    }

    /**
     * Valida que las horas trabajadas sean válidas
     * @param {number} hours - Horas a validar
     * @returns {object} {isValid: boolean, error: string|null}
     */
    static validateHours(hours) {
        const hoursNum = Number(hours);
        if (isNaN(hoursNum) || hoursNum < 0) {
            return {
                isValid: false,
                error: 'Las horas trabajadas no pueden ser negativas'
            };
        }
        if (hoursNum > 168) { // 7 días x 24 horas
            return {
                isValid: false,
                error: 'Las horas trabajadas no pueden superar 168 por semana'
            };
        }
        return { isValid: true, error: null };
    }

    /**
     * Valida una tarifa horaria
     * @param {number} rate - Tarifa a validar
     * @returns {object} {isValid: boolean, error: string|null}
     */
    static validateHourlyRate(rate) {
        const rateNum = Number(rate);
        if (isNaN(rateNum) || rateNum <= 0) {
            return {
                isValid: false,
                error: 'La tarifa horaria debe ser mayor a 0'
            };
        }
        return { isValid: true, error: null };
    }

    /**
     * Valida una tasa de comisión
     * @param {number} rate - Tasa a validar (entre 0 y 1)
     * @returns {object} {isValid: boolean, error: string|null}
     */
    static validateCommissionRate(rate) {
        const rateNum = Number(rate);
        if (isNaN(rateNum) || rateNum < 0 || rateNum > 1) {
            return {
                isValid: false,
                error: 'La tasa de comisión debe estar entre 0 y 1 (0% a 100%)'
            };
        }
        return { isValid: true, error: null };
    }

    /**
     * Valida el monto de ventas
     * @param {number} sales - Ventas a validar
     * @returns {object} {isValid: boolean, error: string|null}
     */
    static validateSales(sales) {
        const salesNum = Number(sales);
        if (isNaN(salesNum) || salesNum < 0) {
            return {
                isValid: false,
                error: 'Las ventas no pueden ser menores a $0'
            };
        }
        return { isValid: true, error: null };
    }

    /**
     * Valida que el tipo de empleado sea válido
     * @param {string} type - Tipo a validar
     * @returns {object} {isValid: boolean, error: string|null}
     */
    static validateEmployeeType(type) {
        const validTypes = ['asalariado', 'horas', 'comision', 'temporal'];
        if (!validTypes.includes(type)) {
            return {
                isValid: false,
                error: `El tipo de empleado debe ser: ${validTypes.join(', ')}`
            };
        }
        return { isValid: true, error: null };
    }

    /**
     * Valida múltiples campos de un empleado
     * @param {object} employeeData - Datos del empleado a validar
     * @returns {object} {isValid: boolean, errors: []}
     */
    static validateEmployeeData(employeeData) {
        const errors = [];

        // Validaciones comunes
        const nameValidation = this.validateName(employeeData.name);
        if (!nameValidation.isValid) errors.push(nameValidation.error);

        const typeValidation = this.validateEmployeeType(employeeData.type);
        if (!typeValidation.isValid) errors.push(typeValidation.error);

        const yearsValidation = this.validateYearsInCompany(employeeData.yearsInCompany);
        if (!yearsValidation.isValid) errors.push(yearsValidation.error);

        // Validaciones específicas por tipo
        if (employeeData.type === 'asalariado' || employeeData.type === 'temporal') {
            const salaryValidation = this.validateSalary(employeeData.salary, 'Salario');
            if (!salaryValidation.isValid) errors.push(salaryValidation.error);
        }

        if (employeeData.type === 'horas') {
            const rateValidation = this.validateHourlyRate(employeeData.hourlyRate);
            if (!rateValidation.isValid) errors.push(rateValidation.error);

            const hoursValidation = this.validateHours(employeeData.hoursWorked);
            if (!hoursValidation.isValid) errors.push(hoursValidation.error);
        }

        if (employeeData.type === 'comision') {
            const salaryValidation = this.validateSalary(employeeData.salary, 'Salario base');
            if (!salaryValidation.isValid) errors.push(salaryValidation.error);

            const rateValidation = this.validateCommissionRate(employeeData.commissionRate);
            if (!rateValidation.isValid) errors.push(rateValidation.error);

            const salesValidation = this.validateSales(employeeData.sales);
            if (!salesValidation.isValid) errors.push(salesValidation.error);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Formatea un número como moneda colombiana
     * @param {number} amount - Monto a formatear
     * @returns {string} Monto formateado
     */
    static formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Convierte un porcentaje a decimal
     * @param {number} percentage - Porcentaje (0-100)
     * @returns {number} Decimal (0-1)
     */
    static percentageToDecimal(percentage) {
        return percentage / 100;
    }

    /**
     * Convierte un decimal a porcentaje
     * @param {number} decimal - Decimal (0-1)
     * @returns {number} Porcentaje (0-100)
     */
    static decimalToPercentage(decimal) {
        return decimal * 100;
    }
}
