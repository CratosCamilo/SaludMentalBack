const express = require("express");
const { User, UserAdmin, UserDoctor, UserSecretary, Pacient }  = require("../../schema/user");
const { jsonResponse } = require("../../lib/jsonResponse");
const router = express.Router();

// Crear Nueva Cita
router.post("/new", async function (req, res) {
    const { dia, hora, idServicio, idUser, idDoctor } = req.body;

    // Validación de campos obligatorios
    if (!dia || !hora  || !idServicio  || !idUser || !idDoctor) {
        return res.status(400).json(jsonResponse(400, { error: "Todos los campos son obligatorios" }));
    }

    try {
        const newCita = {
            dia,
            hora,
            idServicio,
            idUser,
            idDoctor
        };

        const result = await Pacient.insertCita(newCita);
        return res.json(jsonResponse(201, { message: "Cita creada satisfactoriamente", data: result }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Editar Cita
router.put("/edit/:idCita", async function (req, res) {
    const { idCita } = req.params;
    const { dia, hora } = req.body;   
        
    try {
        
        const result = await Pacient.update({
            dia,
            hora,
            idCita,
        });
        if (result && result.success) {
            return res.json(
                jsonResponse(200, {
                    message: "Cita actualizada satisfactoriamente",
                })
            );
        } else {
            return res.status(500).json(
                jsonResponse(500, {
                    error: result?.error || "Error al actualizar cita",
                })
            );
        }
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Ruta para obtener horas disponibles
router.get("/fetch-available-times/:dia/:idDocCC", async function (req, res) {
    const { dia, idDocCC } = req.params; // Obtiene el día y el id del doctor desde los parámetros de la URL

    try {
        const availableTimes = await Pacient.fetchAvailableTimes(dia, idDocCC);

        // Verifica si hay horas disponibles
        if (availableTimes.length === 0) {
            return res.status(404).json(jsonResponse(404, { message: "No hay horas disponibles para esta fecha y doctor." }));
        }

        return res.json(jsonResponse(200, { message: "Horas disponibles obtenidas satisfactoriamente", data: availableTimes }));

    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

router.get("/fetch-doctors", async function (req, res) {
    try {
        const doctors = await Pacient.fetchDoctors();

        // Verifica si hay doctores disponibles
        if (doctors.length === 0) {
            return res.status(404).json(jsonResponse(404, { message: "No hay doctores disponibles." }));
        }

        return res.json(jsonResponse(200, { message: "Doctores obtenidos satisfactoriamente", data: doctors }));

    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});
router.get("/fetch-services", async function (req, res) {
    try {
        const services = await Pacient.fetchServices();

        // Verifica si hay doctores disponibles
        if (services.length === 0) {
            return res.status(404).json(jsonResponse(404, { message: "No hay servicios disponibles." }));
        }

        return res.json(jsonResponse(200, { message: "Servicios obtenidos satisfactoriamente", data: services }));

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
        const citas = await Pacient.findCitas(idUser);
        return res.json(jsonResponse(200, { message: "Citas obtenidas satisfactoriamente", data: citas }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

router.get("/fetch-cita/:idCita", async function (req, res) {
    const { idCita } = req.params; // Obtiene la identificación desde los parámetros de la URL

    try {               
        const cita = await Pacient.findCitaId(idCita);
        return res.json(jsonResponse(200, { message: "Cita obtenido satisfactoriamente", data: cita }));

    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});
module.exports = router;
