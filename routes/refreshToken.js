const express = require("express");
const { jsonResponse } = require("../lib/jsonResponse");
const log = require("../lib/trace");
const { verifyRefreshToken } = require("../auth/verify");
const { generateAccessToken } = require("../auth/sign");
const getUserInfo = require("../lib/getUserInfo");
const Token = require("../schema/token"); // Deberías tener un método para interactuar con la tabla de tokens
const router = express.Router();
const { query } = require("../lib/db"); 

router.post("/", async function (req, res, next) {
    log.info("POST /api/refresh-token");
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        console.log("No se proporcionó token de actualización", refreshToken);
        return res.status(401).json({ error: "Token de actualización no proporcionado" });
    }

    try {
        // Cambiar la búsqueda de Mongoose a una consulta SQL
        const sql = 'SELECT * FROM proyectointegrador1.tokens WHERE token = ?';
        const result = await query(sql, [refreshToken]);
        if (result.length === 0) {
            return res.status(403).json({ error: "Token de actualización inválido" });
        }

        const payload = await verifyRefreshToken(refreshToken);
        const accessToken = generateAccessToken(getUserInfo(payload.user));
        res.json(jsonResponse(200, { accessToken }));
    } catch (error) {
        console.error("Error al refrescar el token:", error);
        return res.status(403).json({ error: "Token de actualización inválido" });
    }
});

module.exports = router;
