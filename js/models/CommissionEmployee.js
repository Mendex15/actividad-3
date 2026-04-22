/**
 * CLASE: CommissionEmployee (Empleado por Comisión)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo responsable del cálculo de salario por comisión
 * - Liskov Substitution: Puede reemplazar a Employee sin romper funcionalidad
 * 
 * Características:
 * - Salario base + porcentaje de comisión sobre ventas
 * - Bono adicional: 3% sobre las ventas si éstas superan $20.000.000
 * - Beneficio: Bono Alimentación $1.000.000/mes
 */
class CommissionEmployee extends Employee {
    /**
     * Constructor para empleado por comisión
     * @param {string} id - Identificador único
     * @param {string} name - Nombre del empleado
     * @param {number} yearsInCompany - Años en la empresa
     * @param {number} baseSalary - Salario base mensual
     * @param {number} commissionRate - Porcentaje de comisión (ej: 0.05 para 5%)
     * @param {number} sales - Total de ventas realizadas
     */
    constructor(id, name, yearsInCompany, baseSalary, commissionRate, sales) {
        super(id, name, yearsInCompany);
        
        // Validación: Las ventas no pueden ser menores a $0
        if (sales < 0) {
            throw new Error("Las ventas no pueden ser menores a $0");
        }
        
        this.baseSalary = baseSalary;
        this.commissionRate = commissionRate;
        this.sales = sales;
        this.type = "Por Comisión";
    }

    /**
     * Calcula el salario bruto: salario base + comisión sobre ventas
     * @returns {number} Salario bruto
     */
    calculateGrossSalary() {
        const commission = this.sales * this.commissionRate;
        return this.baseSalary + commission;
    }

    /**
     * Calcula bonos especiales del empleado por comisión
     * - Bono adicional: 3% sobre ventas si éstas superan $20.000.000
     * @returns {number} Monto total de bonos
     */
    calculateBonuses() {
        let bonuses = 0;
        const bonusThreshold = 20000000; // $20 millones
        const bonusRate = 0.03; // 3%

        // Bono adicional si ventas superan $20 millones
        if (this.sales > bonusThreshold) {
            bonuses = this.sales * bonusRate;
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
     * Información específica del empleado por comisión
     * @returns {object} Información detallada
     */
    getEmployeeInfo() {
        const baseInfo = super.getEmployeeInfo();
        const bonusThreshold = 20000000;
        return {
            ...baseInfo,
            baseSalary: this.baseSalary,
            commissionRate: (this.commissionRate * 100).toFixed(2) + '%',
            sales: this.sales,
            qualifiesForBonus: this.sales > bonusThreshold,
            bonusThreshold: bonusThreshold
        };
    }
}
