const mysql = require("mysql2/promise");

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "nomina_db"
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
