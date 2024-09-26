const express = require("express");
const UserAdmin = require("../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");
const router = express.Router();

// Obtener todas las citas
router.get("/select", async function (req, res) {
    const { idCita, dia, idUsuarioCC, idDocCC } = req.query;

    try {
        const filter = {};
        if (idCita) filter.idCita = idCita;
        if (dia) filter.dia = dia;
        if (idUsuarioCC) filter.idUsuarioCC = idUsuarioCC;
        if (idDocCC) filter.idDocCC = idDocCC;

        const citas = await CitaAdmin.findCitas(filter);
        return res.json(jsonResponse(200, { message: "Citas obtenidas satisfactoriamente", data: citas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

module.exports = router;
