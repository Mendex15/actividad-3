const mysql = require("mysql2/promise");

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "nomina_db"
    });

    // Verificar si existe la tabla
    const [tables] = await conn.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME=?",
      ["nomina_db", "audit_log"]
    );

    if (tables.length === 0) {
      console.log("❌ TABLA audit_log NO EXISTE");
      console.log("\nNecesitas ejecutar: node init-db.js");
    } else {
      console.log("✅ TABLA audit_log EXISTE");

      // Mostrar estructura
      const [cols] = await conn.execute("DESCRIBE audit_log");
      console.log("\n📋 Estructura:");
      cols.forEach((c) =>
        console.log(`  - ${c.Field}: ${c.Type}`)
      );

      // Mostrar registros
      const [rows] = await conn.execute(
        "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 5"
      );
      console.log(`\n📊 Total registros: ${rows.length}`);
      if (rows.length > 0) {
        console.log("Últimos 5:");
        rows.forEach((r, i) => {
          console.log(
            `  ${i + 1}. ${r.action} | Usuario: ${r.user_id} | Entidad: ${
              r.entity_type
            }/${r.entity_id} | ${r.created_at}`
          );
        });
      } else {
        console.log(
          "ℹ️  Tabla vacía. Los cambios se registrarán a partir de ahora."
        );
      }
    }

    await conn.end();
  } catch (e) {
    console.error("Error:", e.message);
  }
})();
