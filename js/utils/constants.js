/**
 * Constants - Configuraciones y definiciones globales
 */

const Constants = {
    // Roles
    ROLES: {
        ADMIN: 'Admin',
        RH: 'RH',
        EMPLOYEE: 'Employee'
    },

    // Role Permissions Matrix
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

    // Employee Types
    EMPLOYEE_TYPES: {
        SALARIED: 'Salaried',
        HOURLY: 'Hourly',
        COMMISSION: 'Commission',
        TEMPORARY: 'Temporary'
    },

    // Menu Configuration
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

    // Salary Deductions
    DEDUCTIONS: {
        healthInsurance: 0.04,      // 4%
        pensionFund: 0.03,          // 3%
        taxRate: 0.05               // 5%
    },

    // Bonuses and Benefits
    BENEFITS: {
        loyaltyBonus: 0.10,         // 10% for salaried >5 years
        commissionBonus: 0.03,      // 3% for commission employees
        mealVoucher: 1000000        // $1M for some employees
    },

    // Date Formats
    DATE_FORMAT: 'YYYY-MM-DD',
    DISPLAY_DATE_FORMAT: 'DD/MM/YYYY',

    // API Messages
    API_MESSAGES: {
        success: 'Operación completada exitosamente',
        error: 'Ocurrió un error en la operación',
        unauthorized: 'No autorizado para esta acción',
        notFound: 'Recurso no encontrado'
    }
};

// Expose globally
window.Constants = Constants;
