const jwt = require("jsonwebtoken");
const { query } = require("../lib/db"); // Asegúrate de que este camino sea correcto
require("dotenv").config();

async function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Token de acceso inválido");
  }
}

async function verifyRefreshToken(token) {
  try {
    // Verifica si el token existe en la base de datos SQL
    const sql = 'SELECT * FROM Tokens WHERE token = ?';
    const [rows] = await query(sql, [token]);
    if (rows.length === 0) {
      throw new Error("Token de actualización inválido");
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Token de actualización inválido");
  }
}

module.exports = { verifyAccessToken, verifyRefreshToken };
