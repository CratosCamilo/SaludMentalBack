const express = require("express");
const { User, UserAdmin, UserDoctor, UserSecretary, Pacient }  = require("../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");
const router = express.Router();

// Crear Nueva Cita
router.post("/new", async function (req, res) {
    const { dia, hora, estadoCita, idServicio, idHistoriaMed, idUser, idDoctor } = req.body;

    // Validación de campos obligatorios
    if (!dia || !hora || !estadoCita || !idServicio || !idHistoriaMed || !idUser || !idDoctor) {
        return res.status(400).json(jsonResponse(400, { error: "Todos los campos son obligatorios" }));
    }

    try {
        const newCita = {
            dia,
            hora,
            estadoCita,
            idServicio,
            idHistoriaMed,
            idUsuarioCC: idUser,
            idDocCC: idDoctor
        };

        const result = await UserPacient.insertCita(newCita);
        return res.json(jsonResponse(201, { message: "Cita creada satisfactoriamente", data: result }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Editar Cita
router.put("/edit/:idCita", async function (req, res) {
    const { idCita } = req.params;
    const { dia, hora, estadoCita, idServicio } = req.body;

    
    if (!dia || !hora || !estadoCita || !idServicio) {
        return res.status(400).json(jsonResponse(400, { error: "Todos los campos son obligatorios" }));
    }

    try {
        const cita = await UserPacient.findById(idCita);
        if (!cita) {
            return res.status(404).json(jsonResponse(404, { error: "Cita no encontrada" }));
        }

        cita.dia = dia;
        cita.hora = hora;
        cita.estadoCita = estadoCita;
        cita.idServicio = idServicio;

        const result = await cita.save();

        return res.json(jsonResponse(200, { message: "Cita actualizada satisfactoriamente", data: result }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Cancelar Cita
router.delete("/cancel/:idCita", async function (req, res) {
    const { idCita } = req.params;

    try {
        const cita = await UserPacient.findById(idCita);
        if (!cita) {
            return res.status(404).json(jsonResponse(404, { error: "Cita no encontrada" }));
        }

        await UserPacient.deleteCita(idCita);

        return res.json(jsonResponse(200, { message: "Cita cancelada satisfactoriamente" }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Ver Citas Asignadas
router.get("/citas/:idUser", async function (req, res) {
    const { idUser } = req.params;

    try {
        const citas = await UserPacient.findCitas(idUser);
        return res.json(jsonResponse(200, { message: "Citas obtenidas satisfactoriamente", data: citas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

module.exports = router;
