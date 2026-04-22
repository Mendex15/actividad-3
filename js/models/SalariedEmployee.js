/**
 * CLASE: SalariedEmployee (Empleado Asalariado)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo responsable del cálculo de salario asalariado
 * - Liskov Substitution: Puede reemplazar a Employee sin romper funcionalidad
 * - Open/Closed: Cerrada para modificación, abierta para extensión
 * 
 * Características:
 * - Salario fijo mensual
 * - Bono: 10% del salario si tiene más de 5 años en la empresa
 * - Beneficio: Bono Alimentación $1.000.000/mes
 */
class SalariedEmployee extends Employee {
    /**
     * Constructor para empleado asalariado
     * @param {string} id - Identificador único
     * @param {string} name - Nombre del empleado
     * @param {number} yearsInCompany - Años en la empresa
     * @param {number} monthlySalary - Salario fijo mensual
     */
    constructor(id, name, yearsInCompany, monthlySalary) {
        super(id, name, yearsInCompany);
        this.monthlySalary = monthlySalary;
        this.type = "Asalariado";
    }

    /**
     * Calcula el salario bruto del empleado asalariado
     * @returns {number} Salario bruto mensual
     */
    calculateGrossSalary() {
        return this.monthlySalary;
    }

    /**
     * Calcula bonos del empleado asalariado
     * - 10% del salario si tiene más de 5 años en la empresa
     * @returns {number} Monto total de bonos
     */
    calculateBonuses() {
        let bonuses = 0;

        // Bono de antigüedad: 10% si tiene más de 5 años
        if (this.yearsInCompany > 5) {
            bonuses += this.monthlySalary * 0.10;
        }

        return bonuses;
    }

    /**
     * Calcula beneficios adicionales para empleados permanentes
     * - Bono Alimentación: $1.000.000/mes
     * @returns {number} Monto total de beneficios
     */
    calculateAdditionalBenefits() {
        // Bono alimentación para empleados permanentes
        const foodAllowance = 1000000;
        return foodAllowance;
    }

    /**
     * Información específica del empleado asalariado
     * @returns {object} Información detallada
     */
    getEmployeeInfo() {
        const baseInfo = super.getEmployeeInfo();
        return {
            ...baseInfo,
            monthlySalary: this.monthlySalary,
            hasAnniversaryBonus: this.yearsInCompany > 5
        };
    }
}
