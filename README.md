# 🏢 Sistema de Nómina Empresarial

**Aplicación web de gestión de nómina desarrollada con Principios SOLID**

## 📋 Descripción General

Este sistema de nómina es una aplicación web completa que permite gestionar diferentes tipos de empleados con distintas formas de calcular salarios, beneficios y deducciones. La arquitectura está diseñada siguiendo los **Principios SOLID** para garantizar código limpio, mantenible y escalable.

## ✨ Características Principales

### Tipos de Empleados Soportados

1. **Empleado Asalariado**
   - Salario fijo mensual
   - Bono de antigüedad: 10% si tiene >5 años
   - Bono alimentación: $1.000.000/mes

2. **Empleado por Horas**
   - Pago por horas trabajadas
   - Horas extras (>40h): 1.5x la tarifa
   - Fondo de ahorro opcional: 2% (si tiene >1 año)

3. **Empleado por Comisión**
   - Salario base + comisión por ventas
   - Bono adicional: 3% si ventas >$20.000.000
   - Bono alimentación: $1.000.000/mes

4. **Empleado Temporal**
   - Salario fijo mensual
   - Sin bonos ni beneficios adicionales

### Cálculos Automáticos

- ✅ **Deducciones Obligatorias**: Seguro Social y Pensión (4% del salario bruto)
- ✅ **Validaciones**: Salario neto nunca negativo, horas no negativas, ventas ≥ $0
- ✅ **Formatos**: Moneda colombiana ($COP) automática
- ✅ **Reportes**: Resumen completo de nómina por tipo de empleado

## 🏗️ Arquitectura - Principios SOLID

### 1. **Single Responsibility Principle (SRP)**

Cada clase tiene una única responsabilidad:

```
Employee.js          → Define el contrato de empleado
SalariedEmployee.js  → Calcula nómina de asalariados
HourlyEmployee.js    → Calcula nómina por horas
CommissionEmployee.js→ Calcula nómina por comisión
TemporaryEmployee.js → Calcula nómina temporal
PayrollCalculator.js → Calcula totales y reportes
EmployeeManager.js   → Gestiona colección de empleados
Validators.js        → Valida datos de entrada
```

### 2. **Open/Closed Principle (OCP)**

- ✅ **Abierto para extensión**: Se pueden crear nuevos tipos de empleados sin modificar el código existente
- ✅ **Cerrado para modificación**: La clase `Employee` no cambia cuando se añaden nuevos tipos

**Ejemplo**: Para añadir un nuevo tipo (ej: Empleado Ejecutivo), solo creas una nueva clase que extienda `Employee`.

### 3. **Liskov Substitution Principle (LSP)**

Todos los tipos de empleados pueden sustituir a `Employee` sin romper la funcionalidad:

```javascript
const employees = [
    new SalariedEmployee(...),
    new HourlyEmployee(...),
    new CommissionEmployee(...),
    new TemporaryEmployee(...)
];

// Todos pueden ser tratados uniformemente
employees.forEach(emp => {
    const salary = emp.calculateNetSalary(); // ✅ Funciona para todos
});
```

### 4. **Interface Segregation Principle (ISP)**

Las clases no dependen de interfaces que no usan:

- `SalariedEmployee` no incluye campos de `HourlyEmployee` (hourlyRate, hoursWorked)
- `HourlyEmployee` no incluye campos de `CommissionEmployee` (sales, commissionRate)
- Cada clase define solo sus campos necesarios

### 5. **Dependency Inversion Principle (DIP)**

Los servicios dependen de abstracciones, no de concreciones:

```javascript
// ✅ CORRECTO: EmployeeManager usa la abstracción Employee
calculateTotalPayroll(employees) {
    return employees.map(emp => this.calculateEmployeePayroll(emp));
}

// ❌ INCORRECTO: Dependería de clases concretas
if (emp instanceof SalariedEmployee) { ... }
```

## 📁 Estructura de Archivos

```
Sistema-Nomina/
│
├── index.html                 # Página principal
├── styles.css                 # Estilos de la aplicación
│
├── js/
│   ├── app.js                 # Aplicación principal (UI)
│   │
│   ├── models/                # Modelos de dominio
│   │   ├── Employee.js        # Clase base abstracta
│   │   ├── SalariedEmployee.js
│   │   ├── HourlyEmployee.js
│   │   ├── CommissionEmployee.js
│   │   └── TemporaryEmployee.js
│   │
│   ├── services/              # Servicios de lógica de negocio
│   │   ├── PayrollCalculator.js
│   │   └── EmployeeManager.js
│   │
│   └── utils/                 # Utilidades
│       └── Validators.js      # Validaciones y formateos
│
├── README.md                  # Este archivo
└── SOLID_PRINCIPLES.md        # Documentación detallada de SOLID
```

## 🚀 Cómo Usar

### 1. Abrir la Aplicación

```bash
# Simplemente abre index.html en tu navegador
# O usa un servidor local
python -m http.server 8000
# Luego accede a: http://localhost:8000
```

### 2. Registrar un Empleado

1. Completa el formulario "Registrar Nuevo Empleado"
2. Selecciona el tipo de empleado
3. Los campos específicos se mostrarán automáticamente
4. Haz clic en "Registrar Empleado"

### 3. Ver Resultados

- **Tarjetas de Empleados**: Información detallada de cada empleado
- **Resumen de Nómina**: Totales y análisis por tipo
- **Tabla Estadística**: Desglose completo de la nómina

## 💻 Ejemplos de Uso

### Empleado Asalariado

```javascript
const emp = new SalariedEmployee(
    "EMP-001",
    "Juan Pérez",
    6,              // 6 años de antigüedad
    3000000         // Salario: $3.000.000
);

const payroll = emp.calculateNetSalary();
// {
//   grossSalary: 3000000,
//   bonuses: 300000,        // 10% por antigüedad
//   benefits: 1000000,      // Bono alimentación
//   totalIncome: 4300000,
//   deductions: 120000,     // 4% seguro social
//   netSalary: 4180000
// }
```

### Empleado por Horas

```javascript
const emp = new HourlyEmployee(
    "EMP-002",
    "María García",
    2,              // 2 años de antigüedad
    25000,          // $25.000 por hora
    45,             // 45 horas trabajadas
    true            // Quiere fondo de ahorro
);

const payroll = emp.calculateNetSalary();
// {
//   grossSalary: 1187500,   // 40*25000 + 5*25000*1.5
//   bonuses: 0,
//   benefits: 23750,        // 2% fondo de ahorro
//   totalIncome: 1211250,
//   deductions: 47500,      // 4% seguro social
//   netSalary: 1163750
// }
```

## 🧪 Validaciones Implementadas

✅ Nombres no vacíos (mínimo 3 caracteres)
✅ Años en empresa: 0-100
✅ Salarios no negativos
✅ Horas trabajadas no negativas
✅ Tarifa horaria > $0
✅ Tasa de comisión entre 0% y 100%
✅ Ventas ≥ $0
✅ Salario neto nunca negativo

## 📊 Cálculos Incluidos

### Para Todos los Empleados
- Salario Bruto (específico por tipo)
- Bonos (según antigüedad y desempeño)
- Beneficios Adicionales (alimentación, ahorro)
- **Deducciones Obligatorias: 4% Seguro Social**
- **Salario Neto Final**

### Reportes Disponibles
- Nómina individual detallada
- Nómina total de todos los empleados
- Desglose por tipo de empleado
- Estadísticas del sistema

## 🔒 Características de Seguridad

- ✅ Validación de entrada en todos los campos
- ✅ Manejo de errores robusto
- ✅ Restricción de valores negativos
- ✅ Mensajes de error claros al usuario
- ✅ Confirmación antes de eliminar empleados

## 🎨 Interfaz de Usuario

- Diseño moderno y responsivo
- Gradientes de color atractivos
- Cards interactivos para empleados
- Formulario dinámico según tipo
- Alertas de confirmación
- Tabla de estadísticas

## 📱 Responsive Design

La aplicación se adapta a:
- 💻 Pantallas de escritorio (1200px+)
- 📱 Tablets (768px-1199px)
- 📱 Móviles (<768px)

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura de la página
- **CSS3**: Estilos y animaciones
- **JavaScript ES6+**: Lógica de negocio
- **Principios SOLID**: Arquitectura del código

## 📝 Notas de Implementación

1. **Abstracción**: La clase `Employee` es abstracta y no se puede instanciar directamente
2. **Herencia**: Todos los tipos de empleado heredan de `Employee`
3. **Polimorfismo**: Cada tipo implementa los métodos de cálculo de manera específica
4. **Inyección de Dependencias**: `EmployeeManager` recibe `PayrollCalculator` en el constructor
5. **Validación Centralizada**: Todas las validaciones están en `Validators.js`

## 🚀 Próximas Mejoras Sugeridas

- [ ] Persistencia en base de datos
- [ ] Sistema de autenticación
- [ ] Exportación a PDF/Excel
- [ ] Histórico de nóminas
- [ ] Comparación de períodos
- [ ] Análisis gráfico de datos
- [ ] Integración con pasarela de pagos

## 👨‍💻 Autor

 **william mendez**

**Desarrollado con Principios SOLID**  
_Aplicación de Gestión de Nómina_  
2026

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**¿Necesitas ayuda?** Revisa el archivo `SOLID_PRINCIPLES.md` para una explicación detallada de cómo se aplican los principios SOLID en este proyecto.
