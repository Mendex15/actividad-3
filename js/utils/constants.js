/**
 * Constantes globales del sistema
 *
 * Roles, permisos, menús y configuraciones base.
 */

const Constants = {
    // Roles
    ROLES: {
        ADMIN: 'Admin',
        RH: 'RH',
        EMPLOYEE: 'Employee'
    },

    // Matriz de permisos por rol
    PERMISSIONS: {
        'Admin': {
            canRegisterEmployee: true,
            canEditEmployee: true,
            canDeleteEmployee: true,
            canViewPayroll: true,
            canGenerateReports: true,
            canManageUsers: true,
            canLockPeriods: true,
            canBackup: true,
            canViewAudit: true,
            canImportCSV: true
        },
        'RH': {
            canRegisterEmployee: true,
            canEditEmployee: true,
            canDeleteEmployee: true,
            canViewPayroll: true,
            canGenerateReports: true,
            canManageUsers: false,
            canLockPeriods: true,
            canBackup: false,
            canViewAudit: true,
            canImportCSV: true
        },
        'Employee': {
            canRegisterEmployee: false,
            canEditEmployee: false,
            canDeleteEmployee: false,
            canViewPayroll: true,
            canGenerateReports: false,
            canManageUsers: false,
            canLockPeriods: false,
            canBackup: false,
            canViewAudit: false,
            canImportCSV: false
        }
    },

    // Tipos de empleado
    EMPLOYEE_TYPES: {
        SALARIED: 'Salaried',
        HOURLY: 'Hourly',
        COMMISSION: 'Commission',
        TEMPORARY: 'Temporary'
    },

    // Configuracion del menu
    MENU_ITEMS: [
        { label: 'Dashboard', icon: '📊', module: 'dashboard', section: 'dashboard' },
        { label: 'Registrar Empleado', icon: '➕', module: 'employees', section: 'register' },
        { label: 'Empleados', icon: '👥', module: 'employees', section: 'list' },
        { label: 'Resumen Nómina', icon: '💰', module: 'payroll', section: 'summary' },
        { label: 'Historial Nóminas', icon: '📋', module: 'payroll', section: 'history' },
        { label: 'Períodos', icon: '🔒', module: 'periods', section: 'periods' },
        { label: 'Seguridad', icon: '🔐', module: 'security', section: 'security' },
        { label: 'Reportes', icon: '📈', module: 'reports', section: 'reports' }
    ],

    // Deducciones salariales
    DEDUCTIONS: {
        healthInsurance: 0.04,      // 4%
        pensionFund: 0.03,          // 3%
        taxRate: 0.05               // 5%
    },

    // Bonos y beneficios
    BENEFITS: {
        loyaltyBonus: 0.10,         // 10% for salaried >5 years
        commissionBonus: 0.03,      // 3% for commission employees
        mealVoucher: 1000000        // $1M for some employees
    },

    // Formatos de fecha
    DATE_FORMAT: 'YYYY-MM-DD',
    DISPLAY_DATE_FORMAT: 'DD/MM/YYYY',

    // Mensajes de API
    API_MESSAGES: {
        success: 'Operación completada exitosamente',
        error: 'Ocurrió un error en la operación',
        unauthorized: 'No autorizado para esta acción',
        notFound: 'Recurso no encontrado'
    }
};

// Exponer globalmente
window.Constants = Constants;
