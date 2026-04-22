/**
 * SCRIPT: Inicializar Base de Datos
 * 
 * Ejecuta el schema.sql en la base de datos MySQL
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    let connection;
    try {
        console.log('🔧 Inicializando base de datos...\n');

        // Crear conexión inicial sin especificar BD
        console.log('📡 Conectando a MySQL...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('✓ Conexión exitosa\n');

        // Leer el archivo schema.sql
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Eliminar comentarios de línea y bloque
        let cleanedSql = schemaSql
            .split('\n')
            .map(line => {
                // Eliminar comentarios de línea (--)
                const index = line.indexOf('--');
                if (index !== -1) {
                    return line.substring(0, index);
                }
                return line;
            })
            .join('\n');

        // Ejecutar todo el SQL de una vez
        console.log('📋 Ejecutando schema SQL...\n');
        await connection.query(cleanedSql);

        console.log('\n✅ Base de datos inicializada correctamente');
        console.log('\n📊 Información de acceso:');
        console.log(`  Host: ${process.env.DB_HOST}`);
        console.log(`  Database: ${process.env.DB_NAME}`);
        console.log(`  User: ${process.env.DB_USER}`);
        console.log('\n👤 Usuario por defecto:');
        console.log(`  username: admin`);
        console.log(`  password: admin123`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error inicializando base de datos:');
        console.error(error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

initializeDatabase();
