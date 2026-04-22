const mysql = require("mysql2/promise");

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "nomina_db"
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
