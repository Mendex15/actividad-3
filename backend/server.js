/**
 * SERVIDOR PRINCIPAL
 * 
 * Inicializa la aplicación Express y configura:
 * - Variables de entorno
 * - Middleware
 * - Conexión a base de datos
 * - Rutas de API
 * - Manejo de errores
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';
const ALLOWED_ORIGINS = FRONTEND_URL
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

/**
 * Middleware
 */

// CORS
app.use(cors({
    origin: (origin, callback) => {
        // origin puede ser undefined/null (por ejemplo al abrir desde file://) o en algunas herramientas.
        if (!origin || origin === 'null') {
            return callback(null, true);
        }

        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS bloqueado para el origen: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Logging básico
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

/**
 * Rutas de API
 */
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/audit', auditRoutes);

/**
 * Health Check
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * Raíz del servidor
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Sistema de Nómina API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            employees: '/api/employees',
            payroll: '/api/payroll',
            health: '/health'
        }
    });
});

/**
 * Error 404
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

/**
 * Manejo de errores global
 */
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Errores típicos de CORS (provenientes del middleware cors)
    if (err && typeof err.message === 'string' && err.message.startsWith('CORS bloqueado')) {
        return res.status(403).json({
            success: false,
            message: err.message
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
});

/**
 * Iniciar servidor
 */
async function startServer() {
    try {
        // Verificar conexión a base de datos
        console.log('Verificando conexión a base de datos...');
        await testConnection();
        console.log('✓ Conexión a base de datos exitosa');

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║  SISTEMA DE NÓMINA - SERVIDOR ACTIVO  ║
╚════════════════════════════════════════╝

📍 URL: http://localhost:${PORT}
🌐 Frontend: ${FRONTEND_URL}
📊 API Base: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health

Presiona Ctrl+C para detener el servidor
            `);
        });
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error.message);
        process.exit(1);
    }
}

// Iniciar
startServer();

// Manejo de señales de terminación
process.on('SIGINT', () => {
    console.log('\n\nServidor detenido');
    process.exit(0);
});
