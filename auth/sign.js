const jwt = require("jsonwebtoken");
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
function generateRefreshToken(user) {
  return sign({ user }, false);
}



module.exports = { generateAccessToken, generateRefreshToken };
