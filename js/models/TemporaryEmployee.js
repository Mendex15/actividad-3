/**
 * CLASE: TemporaryEmployee (Empleado Temporal)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo responsable del cálculo de salario temporal
 * - Liskov Substitution: Puede reemplazar a Employee sin romper funcionalidad
 * 
 * Características:
 * - Salario fijo mensual
 * - Contrato por tiempo definido
 * - No aplican bonos ni beneficios adicionales
 */
class TemporaryEmployee extends Employee {
    /**
     * Constructor para empleado temporal
     * @param {string} id - Identificador único
     * @param {string} name - Nombre del empleado
     * @param {number} yearsInCompany - Años en la empresa (generalmente 0 o menor a 1)
     * @param {number} monthlySalary - Salario fijo mensual
     */
    constructor(id, name, yearsInCompany, monthlySalary) {
        super(id, name, yearsInCompany);
        this.monthlySalary = monthlySalary;
        this.type = "Temporal";
    }

    /**
     * Calcula el salario bruto del empleado temporal
     * @returns {number} Salario bruto mensual
     */
    calculateGrossSalary() {
        return this.monthlySalary;
    }

    /**
     * Empleados temporales NO reciben bonos
     * @returns {number} 0 - No hay bonos
     */
    calculateBonuses() {
        return 0;
    }

    /**
     * Empleados temporales NO reciben beneficios adicionales
     * @returns {number} 0 - No hay beneficios
     */
    calculateAdditionalBenefits() {
        return 0;
    }

    /**
     * Información específica del empleado temporal
     * @returns {object} Información detallada
     */
    getEmployeeInfo() {
        const baseInfo = super.getEmployeeInfo();
        return {
            ...baseInfo,
            monthlySalary: this.monthlySalary,
            hasNoAdditionalBenefits: true
        };
    }
}
