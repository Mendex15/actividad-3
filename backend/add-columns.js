/**
 * SCRIPT: Agregar columnas faltantes
 *
 * Agrega las columnas email y phone a la tabla employees
 * si no existen.
 */

const mysql = require("mysql2/promise");

(async () => {
  try {
    const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

    console.log("🔧 Agregando columnas email y phone a tabla employees...\n");

    // Agregar email si no existe
    try {
      await conn.execute("ALTER TABLE employees ADD COLUMN email VARCHAR(100) AFTER ci");
      console.log("✅ Columna email agregada");
    } catch (e) {
      if (e.message.includes("already exists")) {
        console.log("ℹ️  Columna email ya existe");
      } else {
        throw e;
      }
    }

    // Agregar phone si no existe
    try {
      await conn.execute("ALTER TABLE employees ADD COLUMN phone VARCHAR(20) AFTER email");
      console.log("✅ Columna phone agregada");
    } catch (e) {
      if (e.message.includes("already exists")) {
        console.log("ℹ️  Columna phone ya existe");
      } else {
        throw e;
      }
    }

    console.log("\n✅ Tabla employees actualizada correctamente");
    await conn.end();
  } catch (e) {
    console.error("Error:", e.message);
  }
})();
