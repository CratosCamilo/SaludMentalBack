const jwt = require("jsonwebtoken");
const { query } = require("../lib/db"); // Asegúrate de tener la función `query` aquí o en otro lugar accesible.
require("dotenv").config();

function sign(payload, isAccessToken) {
  return jwt.sign(
    payload,
    isAccessToken
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: isAccessToken ? '1h' : '7d', // Cambia la duración según lo que desees
      algorithm: "HS256",
    }
  );
}

function generateAccessToken(user) {
  return sign({ user }, true);
}

async function generateRefreshToken(user) {
  const refreshToken = sign({ user }, false);
  // Guarda el refreshToken en la base de datos
  const sql = 'INSERT INTO Tokens (token) VALUES (?)'; // Ajusta según tu tabla
  await query(sql, [refreshToken]);
  return refreshToken;
}

module.exports = { generateAccessToken, generateRefreshToken };
