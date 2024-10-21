const express = require("express");
const { User, UserAdmin, UserDoctor, UserSecretary, Pacient }  = require("../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");
const router = express.Router();

// Obtener datos del paciente
router.get("/facturas/:idUser", authenticatePatient, async function (req, res) {
    const { idUser } = req;
    try {
        const facturas = await Pacient.findFacturasP(idUser);
        return res.json(jsonResponse(200, { message: "Facturas obtenidas satisfactoriamente", data: facturas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// añadir factura
router.put("/addColilla", authenticatePatient, async function (req, res) {
    try {
        const { idFactura } = req.body;
        
        if (!idFactura) {
            return res.status(400).json(jsonResponse(400, { error: "Faltan parámetros requeridos" }));
        }

        const colilla = await Pacient.addColillaEditFactura(idFactura);

        return res.json(jsonResponse(200, { message: "Colilla generada y factura editada satisfactoriamente", data: colilla }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Obtener datos del paciente
router.get("/HistorialPagos/:idUser", authenticatePatient, async function (req, res) {
    const { idUser } = req;
    try {
        const facturas = await Pacient.findPagos(idUser);
        return res.json(jsonResponse(200, { message: "Facturas obtenidas satisfactoriamente", data: facturas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

module.exports = router;