/**
 * CLASE: HourlyEmployee (Empleado por Horas)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo responsable del cálculo de salario por horas
 * - Liskov Substitution: Puede reemplazar a Employee sin romper funcionalidad
 * 
 * Características:
 * - Pago por horas trabajadas (tarifa base por hora)
 * - Horas extras (más de 40 horas) se pagan a 1.5x la tarifa normal
 * - No recibe Bonos
 * - Con más de 1 año: Acceso a fondo de ahorro (2% del salario) - opcional
 */
class HourlyEmployee extends Employee {
    /**
     * Constructor para empleado por horas
     * @param {string} id - Identificador único
     * @param {string} name - Nombre del empleado
     * @param {number} yearsInCompany - Años en la empresa
     * @param {number} hourlyRate - Tarifa por hora
     * @param {number} hoursWorked - Horas trabajadas en el período
     * @param {boolean} hasSavingsFund - ¿Desea acceso al fondo de ahorro?
     */
    constructor(id, name, yearsInCompany, hourlyRate, hoursWorked, hasSavingsFund = false) {
        super(id, name, yearsInCompany);
        
        // Validación: Horas trabajadas no pueden ser negativas
        if (hoursWorked < 0) {
            throw new Error("Las horas trabajadas no pueden ser negativas");
        }
        
        this.hourlyRate = hourlyRate;
        this.hoursWorked = hoursWorked;
        this.hasSavingsFund = hasSavingsFund;
        this.type = "Por Horas";
    }

    /**
     * Calcula el salario bruto con horas normales y extras
     * - Primeras 40 horas: tarifa normal
     * - Horas adicionales: 1.5x la tarifa
     * @returns {number} Salario bruto
     */
    calculateGrossSalary() {
        const regularHours = 40;
        const overtimeMultiplier = 1.5;

        if (this.hoursWorked <= regularHours) {
            // Solo horas regulares
            return this.hoursWorked * this.hourlyRate;
        } else {
            // Horas regulares + horas extras
            const regularPay = regularHours * this.hourlyRate;
            const extraHours = this.hoursWorked - regularHours;
            const extraPay = extraHours * this.hourlyRate * overtimeMultiplier;
            return regularPay + extraPay;
        }
    }

    /**
     * Empleados por horas NO reciben bonos
     * @returns {number} 0 - No hay bonos
     */
    calculateBonuses() {
        return 0;
    }

    /**
     * Calcula beneficios adicionales
     * - Fondo de ahorro (2% del salario) si:
     *   - Tiene más de 1 año en la empresa
     *   - Ha aceptado el acceso al fondo
     * @returns {number} Monto total de beneficios
     */
    calculateAdditionalBenefits() {
        let benefits = 0;

        // Fondo de ahorro: 2% del salario si cumple requisitos
        if (this.yearsInCompany > 1 && this.hasSavingsFund) {
            const grossSalary = this.calculateGrossSalary();
            benefits = grossSalary * 0.02;
        }

        return benefits;
    }

    /**
     * Información específica del empleado por horas
     * @returns {object} Información detallada
     */
    getEmployeeInfo() {
        const baseInfo = super.getEmployeeInfo();
        return {
            ...baseInfo,
            hourlyRate: this.hourlyRate,
            hoursWorked: this.hoursWorked,
            hasSavingsFund: this.hasSavingsFund && this.yearsInCompany > 1,
            isEligibleForSavingsFund: this.yearsInCompany > 1
        };
    }
}
