/**
 * ESQUEMA DE BASE DE DATOS
 * 
 * Ejecutar este SQL en MySQL para crear la estructura de la base de datos
 * 
 * Pasos:
 * 1. Abre MySQL Workbench o línea de comandos
 * 2. Copia todo este contenido
 * 3. Ejecuta en tu conexión MySQL
 */

--  
-- CREAR BASE DE DATOS
--  

CREATE DATABASE IF NOT EXISTS nomina_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nomina_db;

-- 
-- TABLA: users (Usuarios del sistema)
-- 

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'contador', 'usuario') DEFAULT 'usuario',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- TABLA: employees (Empleados)
-- ======

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    employee_type ENUM('asalariado', 'horas', 'comision', 'temporal') NOT NULL,
    years_in_company INT DEFAULT 0,
    
    -- Salario Asalariado
    monthly_salary DECIMAL(12, 2),
    
    -- Empleado por Horas
    hourly_rate DECIMAL(10, 2),
    hours_worked DECIMAL(5, 2),
    has_savings_fund BOOLEAN DEFAULT FALSE,
    
    -- Empleado por Comisión
    base_salary DECIMAL(12, 2),
    commission_rate DECIMAL(5, 4),
    sales DECIMAL(15, 2),
    
    -- General
    ci VARCHAR(20) UNIQUE,
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_type (employee_type),
    INDEX idx_name (name)
);

-- TABLA: payroll_history (Histórico de Nóminas)
-- 
CREATE TABLE payroll_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    
    -- Cálculos
    gross_salary DECIMAL(12, 2) NOT NULL,
    bonuses DECIMAL(12, 2) DEFAULT 0,
    benefits DECIMAL(12, 2) DEFAULT 0,
    mandatory_deductions DECIMAL(12, 2) DEFAULT 0,
    total_income DECIMAL(12, 2) NOT NULL,
    net_salary DECIMAL(12, 2) NOT NULL,
    
    -- Notas
    notes TEXT,
    status ENUM('pendiente', 'pagado', 'cancelado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_period (month, year),
    UNIQUE KEY unique_payroll (employee_id, month, year)
);

-- 
-- TABLA: company_settings (Configuración de la Empresa)
--

CREATE TABLE company_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(100),
    company_nit VARCHAR(20),
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    
    -- Configuración de cálculos
    pension_rate DECIMAL(5, 4) DEFAULT 0.04,  -- 4%
    arl_rate DECIMAL(5, 4) DEFAULT 0.02,      -- 2%
    food_allowance DECIMAL(12, 2) DEFAULT 1000000,
    
    -- Parámetros de bonos
    seniority_bonus_rate DECIMAL(5, 4) DEFAULT 0.10,  -- 10%
    seniority_years_threshold INT DEFAULT 5,           -- >5 años
    commission_bonus_threshold DECIMAL(15, 2) DEFAULT 20000000,  -- $20M
    commission_bonus_rate DECIMAL(5, 4) DEFAULT 0.03,  -- 3%
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_company (user_id)
);

-- 
-- TABLA: audit_log (Registro de Auditoría)
-- 

CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    action VARCHAR(50),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- 
-- INSERTS DE PRUEBA
-- 

-- Usuario Admin (password: admin123)
-- Hash generado con bcrypt
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@nomina.com', '$2a$10$YPCxqQKr.XVBzJhM3q6R/.0vYuKvNZa7x3zzQKXGq3aJfCnO5LXHO', 'Administrador', 'admin');

-- Configuración por defecto
INSERT INTO company_settings (user_id, company_name) VALUES (1, 'Mi Empresa');

--
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- 

CREATE INDEX idx_payroll_employee_period ON payroll_history(employee_id, year, month);
CREATE INDEX idx_audit_timestamp ON audit_log(created_at DESC);
