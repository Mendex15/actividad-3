/**
 * SERVICIO: EmployeeManager
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo gestiona empleados (crear, leer, actualizar, eliminar)
 * - Dependency Inversion: Usa PayrollCalculator como dependencia
 * 
 * Este servicio gestiona la colección de empleados del sistema.
 */
class EmployeeManager {
    /**
     * Constructor del gestor de empleados
     * @param {PayrollCalculator} payrollCalculator - Inyección de dependencia del calculador
     */
    constructor(payrollCalculator) {
        this.employees = [];
        this.payrollCalculator = payrollCalculator;
        this.nextId = 1;
    }

    /**
     * Añade un nuevo empleado al sistema
     * @param {Employee} employee - Instancia del empleado a añadir
     * @returns {Employee} El empleado añadido
     */
    addEmployee(employee) {
        if (!employee || !(employee instanceof Employee)) {
            throw new Error("El objeto no es una instancia válida de Employee");
        }
        
        this.employees.push(employee);
        return employee;
    }

    /**
     * Obtiene un empleado por su ID
     * @param {string} id - ID del empleado
     * @returns {Employee|null} El empleado encontrado o null
     */
    getEmployeeById(id) {
        return this.employees.find(emp => emp.id === id) || null;
    }

    /**
     * Obtiene todos los empleados
     * @returns {Array<Employee>} Lista de todos los empleados
     */
    getAllEmployees() {
        return [...this.employees];
    }

    /**
     * Obtiene empleados por tipo
     * @param {string} type - Tipo de empleado (Asalariado, Por Horas, etc.)
     * @returns {Array<Employee>} Empleados del tipo especificado
     */
    getEmployeesByType(type) {
        return this.employees.filter(emp => emp.type === type);
    }

    /**
     * Obtiene la cantidad total de empleados
     * @returns {number} Total de empleados
     */
    getTotalEmployees() {
        return this.employees.length;
    }

    /**
     * Obtiene la cantidad de empleados por tipo
     * @returns {object} Conteo por tipo
     */
    getEmployeeCountByType() {
        const count = {};
        this.employees.forEach(emp => {
            count[emp.type] = (count[emp.type] || 0) + 1;
        });
        return count;
    }

    /**
     * Elimina un empleado por su ID
     * @param {string} id - ID del empleado a eliminar
     * @returns {boolean} true si se eliminó, false si no se encontró
     */
    removeEmployee(id) {
        const index = this.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            this.employees.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Obtiene la información de payroll de todos los empleados
     * @returns {object} Resumen de nómina completo
     */
    getPayrollSummary() {
        return this.payrollCalculator.calculateTotalPayroll(this.employees);
    }

    /**
     * Obtiene el detalle de payroll de un empleado específico
     * @param {string} id - ID del empleado
     * @returns {object|null} Detalle de nómina o null si no existe
     */
    getEmployeePayrollDetail(id) {
        const employee = this.getEmployeeById(id);
        if (!employee) return null;
        
        return this.payrollCalculator.calculateEmployeePayroll(employee);
    }

    /**
     * Exporta todos los empleados como JSON
     * @returns {string} JSON con los datos de los empleados
     */
    exportToJSON() {
        const data = this.employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            type: emp.type,
            yearsInCompany: emp.yearsInCompany,
            additionalData: emp.getEmployeeInfo()
        }));
        return JSON.stringify(data, null, 2);
    }

    /**
     * Limpia todos los empleados del sistema
     * @returns {number} Cantidad de empleados eliminados
     */
    clearAllEmployees() {
        const count = this.employees.length;
        this.employees = [];
        return count;
    }

    /**
     * Obtiene estadísticas del sistema
     * @returns {object} Estadísticas generales
     */
    getStatistics() {
        const payroll = this.getPayrollSummary();
        
        return {
            totalEmployees: this.employees.length,
            employeesByType: this.getEmployeeCountByType(),
            totalPayroll: payroll.totalNetSalaries,
            averageSalary: this.employees.length > 0 ? 
                Math.round(payroll.totalNetSalaries / this.employees.length) : 0,
            byType: payroll.byType
        };
    }
}
