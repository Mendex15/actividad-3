# Sistema de Nomina Empresarial

Aplicacion web de gestion de nomina con backend en Node.js/Express y frontend en JavaScript sin framework. La arquitectura sigue principios SOLID para mantener responsabilidades claras y codigo mantenible.

## Caracteristicas principales

- Autenticacion con JWT y control de permisos por rol.
- Gestion de empleados con multiples tipos de contrato.
- Calculo de nomina por periodo y resumenes mensuales.
- Reportes con graficos y exportacion a CSV.
- Registro de auditoria (altas, cambios y eliminaciones).

## Tecnologias

- Backend: Node.js, Express, MySQL (mysql2), JWT, bcryptjs
- Frontend: HTML5, CSS3, JavaScript ES6+, Chart.js, html2pdf

## Requisitos

- Node.js 18+
- MySQL 8+
- Python 3 (solo para servir el frontend con http.server)

## Instalacion y configuracion

### 1) Backend

```bash
cd backend
npm install
```

Crear archivo .env a partir del ejemplo:

```bash
copy .env.example .env
```

Configura las variables principales en .env:

```
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=nomina_db
JWT_SECRET=tu_clave_secreta
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:8000
```

Inicializa la base de datos:

```bash
node init-db.js
```

Verifica la conexion:

```bash
node verify-db.js
```

Inicia el servidor:

```bash
npm start
```

### Configuracion de produccion

Si el frontend esta desplegado en Vercel y el backend en Render o Railway, configura la URL de la API antes de cargar los scripts.

Opcion recomendada en `index.html`:

```html
<script>
    window.__API_BASE_URL__ = 'https://tu-backend.en.render.o.railway/api';
</script>
```

Tambien puedes guardar el valor en el navegador para pruebas locales:

```javascript
localStorage.setItem('API_BASE_URL', 'https://tu-backend.en.render.o.railway/api');
```

El proyecto usa esta prioridad para resolver la API:

1. `window.__API_BASE_URL__`
2. `localStorage.API_BASE_URL`
3. URL por defecto de produccion

Importante: el esquema de base de datos que esta en Railway es la referencia real en produccion. Si un campo no existe en esa tabla, el modelo de Node no debe intentar insertarlo ni actualizarlo.

### 2) Frontend

En la raiz del proyecto:

```bash
python -m http.server 8000
```

Abre en el navegador:

```
http://localhost:8000/dashboard.html
```

## Credenciales de prueba

- Usuario: admin
- Contrasena: admin123

## Estructura de archivos

```
Sistema-Nomina/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── add-columns.js
│   ├── check-audit.js
│   ├── check-employee.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   └── payrollController.js
│   ├── database/
│   │   └── schema.sql
│   ├── init-db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── AuditLog.js
│   │   ├── Employee.js
│   │   ├── PayrollHistory.js
│   │   └── User.js
│   ├── package.json
│   ├── package-lock.json
│   ├── reset-password.js
│   ├── routes/
│   │   ├── auditRoutes.js
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   └── payrollRoutes.js
│   ├── server.js
│   └── verify-db.js
├── dashboard.html
├── GUIA_ARQUITECTURA.md
├── js/
│   ├── dashboard-app.js
│   ├── models/
│   │   ├── CommissionEmployee.js
│   │   ├── Employee.js
│   │   ├── HourlyEmployee.js
│   │   ├── SalariedEmployee.js
│   │   └── TemporaryEmployee.js
│   ├── modules/
│   │   ├── dashboard.js
│   │   ├── employees.js
│   │   ├── payroll.js
│   │   ├── periods.js
│   │   ├── reports.js
│   │   └── security.js
│   ├── services/
│   │   ├── api.js
│   │   ├── AuthService.js
│   │   ├── EmployeeManager.js
│   │   ├── MenuController.js
│   │   ├── PayrollCalculator.js
│   │   ├── PayslipGenerator.js
│   │   ├── ReportGenerator.js
│   │   ├── router.js
│   │   └── UIStateManager.js
│   └── utils/
│       ├── constants.js
│       ├── helpers.js
│       └── Validators.js
├── REFACTORING_CHANGELOG.md
├── PRUEBAS_UNITARIAS.js
├── README.md
├── styles-dashboard.css
└── test-dependencies.html
```

Nota: node_modules/ no se incluye en el arbol.

## API principal

Base URL: configurable desde `window.__API_BASE_URL__` o `localStorage.API_BASE_URL`. Si no se define, el frontend usa la URL de produccion por defecto.

- Auth
    - POST /auth/login
    - POST /auth/register
    - GET /auth/profile
    - PUT /auth/profile
    - POST /auth/change-password

- Empleados
    - GET /employees
    - POST /employees
    - GET /employees/:id
    - PUT /employees/:id
    - DELETE /employees/:id
    - GET /employees/statistics
    - POST /employees/:id/payroll
    - POST /employees/generate-payroll

- Nomina
    - GET /payroll/by-period
    - GET /payroll/summary
    - GET /payroll/compare
    - GET /payroll/pending
    - GET /payroll/employee/:id
    - GET /payroll/employee/:id/:month/:year
    - PUT /payroll/:id/status

- Auditoria
    - GET /audit/recent
    - GET /audit/entity/:type/:id
    - GET /audit/user/:userId
    - GET /audit/range

## Scripts utiles (backend)

- node init-db.js (crea el esquema y usuario admin)
- node verify-db.js (verifica estructura y conexion)
- node reset-password.js (restablece admin a admin123)
- node add-columns.js (agrega email/phone en employees)
- node check-audit.js (inspecciona audit_log)
- node check-employee.js (inspecciona empleados)

## Pruebas

Se incluye un archivo de pruebas unitarias simples sin framework:

- PRUEBAS_UNITARIAS.js

Ejecucion:

```bash
node PRUEBAS_UNITARIAS.js
```

Cobertura actual de pruebas:

- Validacion de limites en `AuditLog._toSafeInt`.
- Middleware `verifyToken` (token valido y token ausente).
- Middleware `verifyAdmin` (permite admin y bloquea otros roles).
- Middleware `verifyContador` (permite contador/admin y bloquea usuario).

Ultima ejecucion registrada: 8/8 pruebas aprobadas.

## Metodologia de desarrollo de software

El proyecto sigue una metodologia iterativa e incremental, combinando buenas practicas de Agile con enfoque tecnico en calidad de codigo.

1. Levantamiento y priorizacion de requerimientos.
2. Planificacion por entregas pequenas (features y correcciones).
3. Desarrollo por modulos con responsabilidad unica (SRP).
4. Refactorizacion continua para mantener bajo acoplamiento.
5. Validacion funcional manual por flujo de usuario.
6. Pruebas unitarias de funciones y middleware criticos.
7. Documentacion tecnica actualizada (arquitectura, changelog, README).

Principios aplicados en la metodologia:

- SOLID para diseno y mantenibilidad.
- Clean Code para legibilidad.
- DRY para evitar duplicacion.
- Trazabilidad basica de cambios en `REFACTORING_CHANGELOG.md`.

## Verificacion de cumplimiento SOLID

Esta verificacion se realizo sobre frontend y backend con base en la estructura actual del proyecto.

### 1. Single Responsibility Principle (SRP)

Estado: Cumplimiento alto.

Evidencias:

- `AuthService` concentra autenticacion y ciclo de token en [js/services/AuthService.js](js/services/AuthService.js).
- `MenuController` concentra permisos y estado de menu en [js/services/MenuController.js](js/services/MenuController.js).
- `UIStateManager` concentra estado visual y transiciones de pantalla en [js/services/UIStateManager.js](js/services/UIStateManager.js).
- Modelos de dominio separados por tipo de empleado en [js/models/Employee.js](js/models/Employee.js), [js/models/SalariedEmployee.js](js/models/SalariedEmployee.js), [js/models/HourlyEmployee.js](js/models/HourlyEmployee.js), [js/models/CommissionEmployee.js](js/models/CommissionEmployee.js), [js/models/TemporaryEmployee.js](js/models/TemporaryEmployee.js).

Oportunidad de mejora:

- Algunos controladores de backend mezclan validacion, orquestacion y auditoria en un mismo flujo, por ejemplo [backend/controllers/employeeController.js](backend/controllers/employeeController.js). Se puede extraer validacion y auditoria a servicios dedicados.

### 2. Open/Closed Principle (OCP)

Estado: Cumplimiento medio-alto.

Evidencias:

- La jerarquia de empleados permite extender nuevos tipos sin modificar la clase base en [js/models/Employee.js](js/models/Employee.js).
- La navegacion por modulos permite agregar nuevas rutas y modulos en [js/services/router.js](js/services/router.js).

Oportunidad de mejora:

- Algunos mapeos de roles y permisos son estaticos en [js/services/MenuController.js](js/services/MenuController.js) y [js/utils/constants.js](js/utils/constants.js). Podrian cargarse por configuracion para extender sin tocar codigo.

### 3. Liskov Substitution Principle (LSP)

Estado: Cumplimiento alto.

Evidencias:

- Todas las subclases de empleado implementan el contrato de calculo esperado por el sistema y pueden usarse donde se espera `Employee`, especialmente en [js/services/PayrollCalculator.js](js/services/PayrollCalculator.js).

### 4. Interface Segregation Principle (ISP)

Estado: Cumplimiento medio.

Evidencias:

- Las APIs de servicios frontend estan segmentadas por responsabilidad: autenticacion, UI, menu, API, en [js/services/AuthService.js](js/services/AuthService.js), [js/services/UIStateManager.js](js/services/UIStateManager.js), [js/services/MenuController.js](js/services/MenuController.js), [js/services/api.js](js/services/api.js).

Oportunidad de mejora:

- En backend, varios controladores exponen funciones amplias por modulo en lugar de contratos mas finos por caso de uso, por ejemplo [backend/controllers/authController.js](backend/controllers/authController.js).

### 5. Dependency Inversion Principle (DIP)

Estado: Cumplimiento medio.

Evidencias:

- `EmployeeManager` recibe el calculador por constructor (inyeccion de dependencia) en [js/services/EmployeeManager.js](js/services/EmployeeManager.js).
- `DashboardApp` orquesta servicios en lugar de implementar internamente toda la logica en [js/dashboard-app.js](js/dashboard-app.js).

Oportunidad de mejora:

- Parte del frontend sigue acoplado a variables globales de `window` y `localStorage` en [js/dashboard-app.js](js/dashboard-app.js), [js/services/router.js](js/services/router.js) y [js/services/AuthService.js](js/services/AuthService.js). Para mayor DIP se recomienda inyectar adaptadores (storage, router y notificaciones).

### Resumen ejecutivo

- Nivel general de adopcion SOLID: Bueno.
- Principios con mayor madurez: SRP y LSP.
- Principios a fortalecer: ISP y DIP en backend y en acoplamientos globales del frontend.
- Prioridad sugerida: extraer validaciones/auditoria a servicios y reducir dependencias globales de `window`.

## Documentacion adicional

- GUIA_ARQUITECTURA.md
- REFACTORING_CHANGELOG.md
