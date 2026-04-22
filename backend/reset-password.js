/**
 * SCRIPT: Resetear contraseña del admin
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./config/database');

async function resetAdminPassword() {
    try {
        console.log('🔧 Reseteando contraseña del admin...\n');

        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Hash generado: ${hashedPassword}`);

        const sql = 'UPDATE users SET password_hash = ? WHERE username = ?';
        await query(sql, [hashedPassword, 'admin']);

        console.log('\n✅ Contraseña actualizada correctamente');
        console.log('\n👤 Puedes iniciar sesión con:');
        console.log('  Usuario: admin');
        console.log('  Contraseña: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetAdminPassword();
