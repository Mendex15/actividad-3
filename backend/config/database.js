/**
 * CONFIGURACIÓN: Conexión a MySQL
 * 
 * Este módulo gestiona la conexión a la base de datos MySQL
 * Usa mysql2/promise para operaciones asincrónicas
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nomina_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
});

/**
 * Probar conexión a la base de datos
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL exitosa');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        return false;
    }
}

/**
 * Ejecutar query
 */
async function query(sql, values = []) {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.execute(sql, values);
        return results;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    query,
    testConnection
};
