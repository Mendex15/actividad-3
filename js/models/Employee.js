/**
 * CLASE BASE: Employee
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Define solo las propiedades y métodos comunes de todo empleado
 * - Open/Closed: Abierta para extensión (subclases), cerrada para modificación
 * - Liskov Substitution: Las subclases pueden reemplazar esta clase
 * 
 * Esta clase abstracta define el contrato que todos los empleados deben cumplir.
 */
class Employee {
    /**
     * Constructor base para todos los empleados
     * @param {string} id - Identificador único del empleado
     * @param {string} name - Nombre del empleado
     * @param {number} yearsInCompany - Años de antigüedad en la empresa
     */
    constructor(id, name, yearsInCompany) {
        if (new.target === Employee) {
            throw new TypeError("No se puede instanciar directamente Employee. Use una subclase específica.");
        }
        
        this.id = id;
        this.name = name;
        this.yearsInCompany = yearsInCompany;
        this.type = null; // Será definido por las subclases
    }

    /**
     * Calcula el salario bruto base del empleado
     * DEBE ser implementado por cada subclase
     * @returns {number} Salario bruto
     */
    calculateGrossSalary() {
        throw new Error("calculateGrossSalary() debe ser implementado por la subclase");
    }

    /**
     * Calcula bonos específicos del empleado
     * @returns {number} Total de bonos
     */
    calculateBonuses() {
        throw new Error("calculateBonuses() debe ser implementado por la subclase");
    }

    /**
     * Calcula deducciones obligatorias
     * Seguro Social y Pensión: 4% del salario bruto
     * @param {number} grossSalary - Salario bruto base
     * @returns {number} Total de deducciones obligatorias
     */
    calculateMandatoryDeductions(grossSalary) {
        // Seguro Social y Pensión: 4% del salario bruto
        return grossSalary * 0.04;
    }

    /**
     * Calcula beneficios adicionales del empleado
     * @returns {number} Total de beneficios
     */
    calculateAdditionalBenefits() {
        throw new Error("calculateAdditionalBenefits() debe ser implementado por la subclase");
    }

    /**
     * Calcula el salario neto final
     * @returns {object} Desglose del cálculo
     */
    calculateNetSalary() {
        const grossSalary = this.calculateGrossSalary();
        const bonuses = this.calculateBonuses();
        const deductions = this.calculateMandatoryDeductions(grossSalary);
        const benefits = this.calculateAdditionalBenefits();

        const totalIncome = grossSalary + bonuses + benefits;
        const netSalary = totalIncome - deductions;

        // Validación: Ningún empleado puede tener salario neto negativo
        if (netSalary < 0) {
            throw new Error(`Salario neto no puede ser negativo. Empleado: ${this.name}`);
        }

        return {
            grossSalary: Math.round(grossSalary),
            bonuses: Math.round(bonuses),
            benefits: Math.round(benefits),
            totalIncome: Math.round(totalIncome),
            deductions: Math.round(deductions),
            netSalary: Math.round(netSalary)
        };
    }

    /**
     * Obtiene toda la información del empleado formateada
     * @returns {object} Información completa del empleado
     */
    getEmployeeInfo() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            yearsInCompany: this.yearsInCompany
        };
    }

    /**
     * Obtiene una representación en string del empleado
     * @returns {string}
     */
    toString() {
        return `${this.name} (${this.type}) - ${this.yearsInCompany} años en la empresa`;
    }
}
