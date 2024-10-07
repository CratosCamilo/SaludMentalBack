const express = require("express");
const { User, UserAdmin, UserDoctor, UserSecretary, Pacient } = require("../../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");
const router = express.Router();

// Asignar Cita
router.put("/secretary/insertAppointments/:idCita", async function (req, res) {
    const { idCita } = req.params;
    const { dia, hora, estadoCita, idServicio, idHistoriaMed, idUser, idDoctor } = req.body;

    if (!dia || !hora || !estadoCita || !idServicio || !idHistoriaMed || !idUser || !idDoctor) {
        return res.status(400).json(jsonResponse(400, { error: "Todos los campos son obligatorios" }));
    }

    try {
        const cita = await UserSecretary.findCitaId(idCita);
        if (!cita) {
            return res.status(404).json(jsonResponse(404, { error: "Cita no encontrada" }));
        }

        cita.dia = dia;
        cita.hora = hora;
        cita.estadoCita = estadoCita;
        cita.idServicio = idServicio;
        cita.idHistoria_Medica = idHistoriaMed;
        cita.idUsuarioCC = idUser;
        cita.idDocCC = idDoctor;

        const result = await cita.save();

        await AuditLog.logAction(idUser, 'ASIGNAR_CITA', `Cita con ID ${idCita} asignada a usuario con CC ${idUser} para la fecha ${dia} a las ${hora}.`);

        return res.json(jsonResponse(200, { message: "Cita asignada y actualizada satisfactoriamente", data: result }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});


// obtiene todas las citas
router.get("/secretary/select", async function (req, res) {
    const { idCita, dia, idUsuarioCC, idDocCC } = req.query;

    try {
        const filter = {};
        if (idCita) filter.idCita = idCita;
        if (dia) filter.dia = dia;
        if (idUsuarioCC) filter.idUsuarioCC = idUsuarioCC;
        if (idDocCC) filter.idDocCC = idDocCC;

        const citas = await UserSecretary.findCitas(filter);
        return res.json(jsonResponse(200, { message: "Citas obtenidas satisfactoriamente", data: citas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});
router.get("/citas", async function (req, res) {    

    try {
        const citas = await UserSecretary.findAllCitas();
        return res.json(jsonResponse(200, { message: "Citas obtenidas satisfactoriamente", data: citas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});


module.exports = router;
