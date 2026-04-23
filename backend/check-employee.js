/**
 * SCRIPT: Verificar estructura y datos de empleados
 *
 * Consulta columnas de employees y un ejemplo de registro.
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

    const [cols] = await conn.execute("DESCRIBE employees");
    console.log("📋 Columnas de tabla employees:");
    cols.forEach((c) => console.log(`  - ${c.Field}: ${c.Type}`));

    // Ver datos del empleado #1
    const [emp] = await conn.execute("SELECT * FROM employees WHERE id=1");
    if (emp.length > 0) {
      console.log("\n👤 Empleado #1:");
      const e = emp[0];
      console.log(`  - id: ${e.id}`);
      console.log(`  - name: ${e.name}`);
      console.log(`  - email: ${e.email || "(no existe)"}`);
      console.log(`  - phone: ${e.phone || "(no existe)"}`);
      console.log(`  - employee_type: ${e.employee_type}`);
      console.log(`  - monthly_salary: ${e.monthly_salary}`);
      console.log(`  - updated_at: ${e.updated_at}`);
    }

    await conn.end();
  } catch (e) {
    console.error("Error:", e.message);
  }
})();
