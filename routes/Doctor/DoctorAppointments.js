const express = require("express");
const { jsonResponse } = require("../../lib/jsonResponse");
const router = express.Router();
const { User, UserAdmin, UserDoctor, UserSecretary, Pacient }  = require("../../schema/user");

// confirma una cita
router.put("/doctor/modificarCita/:idCita", async function (req, res) {
    const { idCita, idDocCC } = req.params;
    const { estadoCita } = req.body; // EstadoCita = 0 para confirmar, 1 para cancelar

    if (!estadoCita || (estadoCita !== 1 && estadoCita !== 2)) {
        return res.status(400).json(jsonResponse(400, { error: "Estado de cita inválido" }));
    }

    try {
        const cita = await UserDoctor.findCitaId(idCita, idDocCC);
        if (cita) {
            return res.status(404).json(jsonResponse(404, { error: "Cita no encontrada" }));
        }

        // Actualizar el estado de la cita
        cita.estadoCita = estadoCita;
        const result = await cita.save();

        // Auditoría de la acción del doctor
        await AuditLog.logAction(cita.idDocCC, 'CONFIRMAR_CITA', `Cita con ID ${idCita} ${estadoCita === 0 ? 'confirmada' : 'cancelada'} por el doctor.`);

        return res.json(jsonResponse(200, { message: `Cita ${estadoCita === 0 ? 'confirmada' : 'cancelada'} satisfactoriamente`, data: result }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Obtener todas las citas
router.get("/citas/:CC", async function (req, res) {
    const { CC } = req.params;

    try {
        const citas = await UserDoctor.findCitas(CC);
        return res.json(jsonResponse(200, { message: "Citas obtenidas satisfactoriamente", data: citas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

router.get("/doctor/cantUserT/:idDocCC", async function (req, res) {
    const { idDocCC } = req.params;

    try {
        const citas = await UserDoctor.findConsultas({ idDocCC });
        return res.json(jsonResponse(200, { message: "Cantidad de usuarios obtenidos satisfactoriamente", data: citas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

router.get("/doctor/cantCitasH/:idDocCC", async function (req, res) {
    const { idDocCC } = req.params;

    try {
        const citas = await UserDoctor.findCitasDia({ idDocCC });
        return res.json(jsonResponse(200, { message: "Cantidad de citas obtenidas satisfactoriamente", data: citas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

router.get("/doctor/cantCitasT/:idDocCC", async function (req, res) {
    const { idDocCC } = req.params;

    try {
        const citas = await UserDoctor.findCitasT({ idDocCC });
        return res.json(jsonResponse(200, { message: "Cantidad de consultas obtenidas satisfactoriamente", data: citas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

module.exports = router;
