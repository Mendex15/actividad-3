/**
 * Utilidades comunes del frontend
 *
 * Funciones para fechas, moneda, strings, arrays y DOM.
 */

const Helpers = {
    // Formateo de fechas
    formatDate(date, format = 'DD/MM/YYYY') {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        if (format === 'DD/MM/YYYY') {
            return `${day}/${month}/${year}`;
        } else if (format === 'YYYY-MM-DD') {
            return `${year}-${month}-${day}`;
        }
        return date.toLocaleDateString();
    },

    parseDate(dateString) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return new Date(dateString);
    },

    getCurrentDate() {
        return this.formatDate(new Date(), 'YYYY-MM-DD');
    },

    getCurrentMonth() {
        const now = new Date();
        return {
            month: now.getMonth() + 1,
            year: now.getFullYear()
        };
    },

    // Formateo de moneda
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    parseCurrency(value) {
        if (typeof value === 'string') {
            return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
        }
        return parseFloat(value) || 0;
    },

    // Formateo de porcentajes
    formatPercentage(value) {
        return `${(parseFloat(value) * 100).toFixed(2)}%`;
    },

    // Formateo de numeros
    formatNumber(num, decimals = 2) {
        return parseFloat(num).toFixed(decimals);
    },

    // Utilidades de cadenas
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    toCamelCase(str) {
        return str.replace(/[-_\s](.)/g, (_, c) => c.toUpperCase());
    },

    toSnakeCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : '_' + word.toLowerCase();
        });
    },

    // Utilidades de arreglos
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (typeof aVal === 'string') {
                return order === 'asc' 
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            
            return order === 'asc' ? aVal - bVal : bVal - aVal;
        });
    },

    filterBy(array, key, value) {
        return array.filter(item => item[key] === value);
    },

    groupBy(array, key) {
        return array.reduce((acc, item) => {
            const group = item[key];
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {});
    },

    // Utilidades de objetos
    cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    mergeObjects(obj1, obj2) {
        return { ...obj1, ...obj2 };
    },

    filterObject(obj, keys) {
        const result = {};
        keys.forEach(key => {
            if (key in obj) result[key] = obj[key];
        });
        return result;
    },

    // Utilidades de validacion
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isValidPhone(phone) {
        const re = /^[0-9]{7,15}$/;
        return re.test(phone.replace(/[^\d]/g, ''));
    },

    isValidCurrency(value) {
        return !isNaN(parseFloat(value)) && value >= 0;
    },

    // Utilidades de DOM
    createElement(tag, classes = '', attributes = {}) {
        const el = document.createElement(tag);
        if (classes) el.className = classes;
        Object.keys(attributes).forEach(key => {
            el.setAttribute(key, attributes[key]);
        });
        return el;
    },

    setAttributes(element, attributes) {
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        return element;
    },

    showElement(element) {
        if (element) element.style.display = '';
        return element;
    },

    hideElement(element) {
        if (element) element.style.display = 'none';
        return element;
    },

    toggleElement(element) {
        if (element) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
        return element;
    },

    // Almacenamiento local
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    getFromStorage(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },

    // Notificaciones
    showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 6px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#f39c12'};
            color: white;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    // Debounce & Throttle
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Exponer globalmente
window.Helpers = Helpers;

// Agregar estilos de animación al documento
if (!document.getElementById('helperStyles')) {
    const style = document.createElement('style');
    style.id = 'helperStyles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
