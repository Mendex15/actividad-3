# 📋 Guía de Arquitectura y Buenas Prácticas - Sistema de Nómina

## 🏛️ Principios SOLID Aplicados

### 1. **Single Responsibility Principle (SRP)**
Cada módulo tiene una única responsabilidad bien definida:

- **AuthService.js**: Solo gestiona autenticación y JWT
- **UIStateManager.js**: Solo controla visibilidad de pantallas y actualización de DOM
- **MenuController.js**: Solo gestiona menú y permisos
- **APIService.js**: Solo comunica con el backend
- **DashboardApp.js**: Orquesta todos los servicios

```javascript
// ✅ BIEN - Cada componente con responsabilidad clara
AuthService.login(user, password);        // Autenticación
UIStateManager.showDashboard();           // Mostrar UI
MenuController.updateMenuVisibility(role); // Gestionar permisos
```

### 2. **Open/Closed Principle (OCP)**
El código es abierto para extensión, cerrado para modificación:

- Los servicios son facilmente extensibles sin modificar código existente
- Nuevos endpoints en APIService se agregan sin cambiar métodos existentes
- Los módulos pueden extenderse fácilmente

```javascript
// ✅ BIEN - Fácil agregar nuevos métodos sin romper existentes
const getNewEndpoint = async (id) => makeRequest(`/new-endpoint/${id}`);
```

### 3. **Liskov Substitution Principle (LSP)**
Los objetos pueden reemplazarse por subtipos sin afectar funcionamiento:

- AuthService puede remplazarse por otro servicio de autenticación
- APIService funciona independientemente del backend real
- Módulos son intercambiables respecto a su contrato

### 4. **Interface Segregation Principle (ISP)**
Los clientes solo dependen de la interfaz que necesitan:

```javascript
// ✅ BIEN - AuthService solo expone autenticación
return {
    login, logout, getCurrentUser, isAuthenticated
};

// Los clientes solo ven lo que necesitan
const user = AuthService.getCurrentUser();
```

### 5. **Dependency Inversion Principle (DIP)**
Los módulos dependen de abstracciones, no de detalles concretos:

```javascript
// ✅ BIEN - DashboardApp no conoce detalles de autenticación
const user = AuthService.getCurrentUser();  // Abstracción

// No trata directamente con localStorage
```

---

## ✨ Patrones de Código Limpio

### **JSDoc Completo**
Todo el código tiene documentación JSDoc detallada:

```javascript
/**
 * @module AuthService
 * @description Descripción del módulo
 * @async
 * @param {string} username - Descripción del parámetro
 * @returns {Promise<Object>} Descripción del retorno
 * @throws {Error} Errores posibles
 */
```

### **Nombrado Significativo**
Variables y funciones con nombres claros y descriptivos:

```javascript
// ❌ EVITAR
const u = getUserData();
const c = f1();

// ✅ BIEN
const currentUser = AuthService.getCurrentUser();
const menuContainer = UIStateManager.getModuleContainer();
```

### **Funciones Pequeñas y Enfocadas**
Cada función hace una sola cosa:

```javascript
// ✅ BIEN - Función dedicada a decodificar JWT
const decodeJWT = (token) => {
    // Solo decodifica, no hace otra cosa
};

// ✅ BIEN - Función dedicada a validar token
const isTokenValid = (decodedToken) => {
    // Solo valida
};
```

### **DRY (Don't Repeat Yourself)**
Código reutilizable, sin duplicación:

```javascript
// ❌ ANTES - Decodificado duplicado en 2 lugares
handleLogin() { const decoded = decodeJWT(token); }
checkAuth() { const decoded = decodeJWT(token); }

// ✅ AHORA - Centralizado en AuthService
const user = AuthService.getCurrentUser();
```

### **Error Handling Robusto**
Manejo completo de errores:

```javascript
try {
    const result = await AuthService.login(username, password);
    // Éxito
} catch (error) {
    showLoginError(error.message);
    console.error('Error específico:', error);
}
```

### **Validaciones de Entrada**
Validar parámetros antes de procesarlos:

```javascript
// ✅ BIEN - Validar entrada
const login = async (username, password) => {
    if (!username || !password) {
        throw new Error('Usuario y contraseña son requeridos');
    }
    // Procesar
};
```

---

## 🔒 Características de Seguridad

### **Token JWT Seguro**
- Decodificación segura con validación
- Verificación de expiración
- Almacenamiento seguro en localStorage
- Limpieza en logout

### **Gestión de Permisos**
```javascript
// Verificar permisos antes de mostrar opciones
MenuController.updateMenuVisibility(user.role);
```

### **Manejo de Sesión**
- Detección automática de tokens expirados
- Recarga limpia de página
- Logout seguro

---

## 📦 Estructura de Módulos

```
js/
├── services/
│   ├── api.js              ← Comunicación backend
│   ├── AuthService.js      ← Autenticación JWT
│   ├── UIStateManager.js   ← Control de vistas
│   ├── MenuController.js   ← Gestión de menú/permisos
│   └── router.js           ← Enrutamiento SPA
├── modules/
│   ├── dashboard.js        ← Dashboard principal
│   ├── employees.js        ← Gestión de empleados
│   ├── payroll.js          ← Nómina
│   ├── periods.js          ← Períodos y auditoría
│   ├── security.js         ← Seguridad
│   └── reports.js          ← Reportes
├── utils/
│   ├── constants.js        ← Constantes globales
│   ├── helpers.js          ← Funciones utilitarias
│   └── Validators.js       ← Validaciones
├── models/
│   └── [Tipos de empleados]
└── dashboard-app.js        ← Orquestador principal
```

---

## 🚀 Flujo de Aplicación

```
1. DOMContentLoaded
   ↓
2. DashboardApp.init()
   ├─ ValidateDependencies()
   ├─ UIStateManager.init()
   ├─ SetupEventListeners()
   │  ├─ handleLogin
   │  ├─ handleLogout
   │  ├─ MenuController.setupMenuListeners()
   │  └─ handleToggleSidebar
   │
   ├─ CheckAuthentication()
   │  └─ AuthService.getCurrentUser()
   │     ├─ Si es válido → showDashboard()
   │     └─ Si es inválido → showLoginScreen()
   │
   └─ InitializeDashboard()
      ├─ MenuController.updateMenuVisibility()
      ├─ Router.init()
      └─ Router.navigate('dashboard')
```

---

## 💡 Mejores Prácticas Implementadas

### **1. Separación de Responsabilidades**
Cada módulo hace una sola cosa bien

### **2. DRY (Don't Repeat Yourself)**
Código reutilizable centralizado

### **3. KISS (Keep It Simple, Stupid)**
Código simple, legible, mantenible

### **4. Error Handling**
Manejo completo de errores con mensajes claros

### **5. Documentación**
JSDoc en todos los módulos y funciones

### **6. Validación**
Entrada siempre validada

### **7. Testing**
Código diseñado para ser testeable

### **8. Performance**
- Caching de referencias DOM
- Lazy loading de módulos
- Timeout en requests HTTP
- Reintentos automáticos

---

## 🔄 Actualización de Versiones

Cuando se modifique cualquier archivo, actualizar `?v=X` en el HTML:

```html
<!-- Antes -->
<script src="js/services/api.js?v=5"></script>

<!-- Después de cambios -->
<script src="js/services/api.js?v=6"></script>
```

Esto previene caché de navegador con código viejo.

---

## 📝 Ejemplo: Agregar Nueva Funcionalidad

Si necesitas agregar un nuevo endpoint:

### 1. Agregar a APIService
```javascript
const getNuevoRecurso = async (id) => {
    return makeRequest(`/nuevo-recurso/${id}`);
};
```

### 2. Usar en el módulo
```javascript
const data = await APIService.getNuevoRecurso(id);
```

### 3. No modificar AuthService, UIStateManager, etc.
Reutilizar lo existente.

---

## ✅ Checklist para Nuevo Código

- [ ] ¿Tiene documentación JSDoc?
- [ ] ¿Tiene una única responsabilidad?
- [ ] ¿Valida todas las entradas?
- [ ] ¿Tiene manejo de errores?
- [ ] ¿Es reutilizable?
- [ ] ¿Evita duplicación?
- [ ] ¿Tiene nombres significativos?
- [ ] ¿Es testeable?

---

**Última actualización**: Abril 2026
**Versión**: 2.0
**Principios**: SOLID + Clean Code + Best Practices
