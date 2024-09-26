const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'ProyectoIntegrador1',
  port: 3306
});

const query = async (sql, values) => {
  const [results] = await db.query(sql, values);
  console.log(sql, values)
  return results;
};

module.exports = { query };
