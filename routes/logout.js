const express = require("express");
const { query } = require("../lib/db"); 
const router = express.Router();
const Token = require("../schema/token");

router.delete("/", async (req, res) => {
    // Cambiar esto para obtener el token del encabezado
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Esto extrae el token del encabezado

    if (!token) {
        return res.status(400).json({
            error: "Token is required for signout"
        });
    }

    try {
        await Token.deleteToken(token);
        return res.status(200).json({
            message: "User signed out successfully"
        });
    } catch (error) {
        console.error("Error signing out:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

module.exports = router;
