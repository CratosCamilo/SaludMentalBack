const log = require("../lib/trace");
const validateToken = require("./validateToken");
const { verifyAccessToken } = require("./verify");
const { query } = require("../lib/db"); // Asegúrate de que esto esté correcto

async function authenticateToken(req, res, next) {
  let token = null;
  log.info("headers", req.headers);

  try {
    token = validateToken(req.headers);
  } catch (error) {
    log.error(error.message);
    if (error.message === "Token not provided") {
      return res.status(401).json({ error: "Token no proporcionado" });
    }
    if (error.message === "Token format invalid") {
      return res.status(401).json({ error: "Token mal formado" });
    }
    return res.status(401).json({ error: "Error al validar el token" });
  }

  try {
    // Verifica si el token está en la base de datos
    const sql = 'SELECT * FROM Tokens WHERE token = ?';
    const [rows] = await query(sql, [token]);

    if (rows.length === 0) {
      return res.status(403).json({ error: "Token inválido" });
    }

    // Verifica la validez del token de acceso
    const decoded = await verifyAccessToken(token);
    req.user = { ...decoded.user };
    next();
  } catch (err) {
    log.error("Token inválido", token, err);
    return res.status(403).json({ error: "Token inválido" });
  }
}

module.exports = authenticateToken;
