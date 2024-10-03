const express = require("express");
const cors = require("cors");
const mysql = require('mysql2/promise');
const authenticateToken = require("./auth/authenticateToken");
const log = require("./lib/trace");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

const config = {
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  port: process.env.DB_PORT
};

const pool = mysql.createPool(config);

async function main() {
  try {
    const connection = await pool.getConnection();
    console.log("Conectado a la base de datos MySQL!");
    connection.release();
  } catch (error) {
    console.error('Error al conectar a la base de datos MySQL:', error);
  }
}

main().catch((err) => console.log(err));

// Rutas
app.use("/api/signup", require("./routes/signup"));
app.use("/api/login", require("./routes/login"));
app.use("/api/signout", require("./routes/logout"));
app.use("/api/refresh-token", require("./routes/refreshToken"));
app.use("/api/Admin", authenticateToken, require("./routes/Admin/insertUser"));
app.use("/api/Pacient", authenticateToken, require("./routes/Pacient/PacientAppointments"));
app.use("/api/user", authenticateToken, require("./routes/user"));


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

module.exports = app;
