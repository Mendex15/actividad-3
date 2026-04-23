/**
 * SCRIPT: Verificar Base de Datos
 * 
 * Verifica que la base de datos MySQL está configurada correctamente
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyDatabase() {
    let connection;
    try {
        console.log('🔧 Verificando base de datos...\n');

        // Conectar a MySQL
        console.log('📡 Conectando a MySQL...');
        const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

        console.log('✓ Conexión exitosa\n');

        // Verificar tablas
        console.log('📋 Verificando tablas...\n');
        const [tables] = await connection.query(
            'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
            [process.env.DB_NAME || 'nomina_db']
        );

        const requiredTables = [
            'users',
            'employees',
            'payroll_history',
            'company_settings',
            'audit_log'
        ];

        const existingTables = tables.map(t => t.TABLE_NAME);
        let allTablesExist = true;

        for (const table of requiredTables) {
            if (existingTables.includes(table)) {
                console.log(`  ✓ ${table}`);
            } else {
                console.log(`  ✗ ${table} FALTA`);
                allTablesExist = false;
            }
        }

        if (!allTablesExist) {
            console.log('\n⚠️  Faltan tablas. Ejecuta: node init-db.js\n');
            process.exit(1);
        }

        // Verificar usuario admin
        console.log('\n👤 Verificando usuario admin...');
        const [users] = await connection.query(
            'SELECT username, role FROM users WHERE username = ?',
            ['admin']
        );

        if (users.length > 0) {
            console.log(`  ✓ admin (${users[0].role})`);
        } else {
            console.log('  ✗ admin NO EXISTE');
        }

        console.log('\n✅ Base de datos lista');
        console.log('\n📊 Información:');
        console.log(`  Host: ${process.env.DB_HOST}`);
        console.log(`  Database: ${process.env.DB_NAME}`);
        console.log(`  User: ${process.env.DB_USER}`);
        console.log(`  Tablas: ${existingTables.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error verificando base de datos:');
        console.error(error.message);
        
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n💡 La base de datos no existe. Ejecuta: node init-db.js\n');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Verifica la contraseña en .env\n');
        }
        
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

verifyDatabase();
