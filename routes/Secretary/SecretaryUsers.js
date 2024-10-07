const express = require("express");
const { User, UserAdmin, UserDoctor, UserSecretary, Pacient } = require("../../schema/user");
const { jsonResponse } = require("../../lib/jsonResponse");
const router = express.Router();

// Registrar Usuario
router.post("/register", async function (req, res) {
    const { Identification, Names, Surnames, Email, Password, IdBranch, IdSpeciality, Address, CellphoneNumber, IdEps } = req.body;

    if (!Identification || !Names || !Surnames || !Email || !Password || !Address || !CellphoneNumber || !IdEps) {
        return res.status(400).json(
            jsonResponse(400, { error: "All fields are required" })
        );
    }

    try {
        const userExists = await UserAdmin.usernameExists(Identification);
        if (userExists) {
            return res.status(409).json(
                jsonResponse(409, { error: "El usuario ya existe" })
            );
        }

        let idRol;
        switch (IdRole) {
            case "Administrador": idEpsValue = 1; break;
            case "Operador": idEpsValue = 2; break;
            case "Medico": idEpsValue = 3; break;
            case "Paciente": idEpsValue = 4; break;
            default:
                return res.status(400).json(
                    jsonResponse(400, { error: "Valor de eps inválido" })
                );
        }

        let idEpsValue;
        switch (IdEps) {
            case "colsanitas": idEpsValue = 1; break;
            case "salud": idEpsValue = 2; break;
            case "sura": idEpsValue = 3; break;
            case "particular": idEpsValue = 4; break;
            default:
                return res.status(400).json(
                    jsonResponse(400, { error: "Valor de eps inválido" })
                );
        }

        const idHojaVida = await UserAdmin.insertHojaVida(Address, 1, CellphoneNumber, idEpsValue);

        const result = await UserAdmin.createUser({
            Identification,
            Names,
            Surnames,
            Email,
            Password,
            IdBranch: 3,
            IdRole: 4,
            UserStatus: 1,
            IdSpeciality,
            IdTypePatient: 1,
        });

        if (result && result.success) {
            return res.json(jsonResponse(200, { message: "Usuario creado satisfactoriamente" }));
        } else {
            return res.status(500).json(jsonResponse(500, { error: result?.error || "Error al crear usuario" }));
        }
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Editar Usuario
router.put("/edit/:CC", async function (req, res) {
    const { CC } = req.params;
    const { Identification, Names, Surnames, Email, Password, IdRol, IdTypePatient } = req.body;

    // Validación de campos obligatorios
    if (!Identification || !Names || !Surnames || !Email || !IdRol || !Password) {
        return res.status(400).json(jsonResponse(400, { error: "Todos los campos son obligatorios" }));
    }

    try {
        // Buscar usuario por cedula
        const user = await UserAdmin.findCedula(CC);
        if (!user) {
            return res.status(404).json(jsonResponse(404, { error: "Usuario no encontrado" }));
        }
        // Guardar los cambios en la base de datos
        const result = await UserAdmin.update({
            Identification,
            Names,
            Surnames,
            Email,
            Password,
            IdRol,
            IdTypePatient
        });
        if (result && result.success) {
            return res.json(
                jsonResponse(200, {
                    message: "Usuario actualizado satisfactoriamente",
                })
            );
        } else {
            return res.status(500).json(
                jsonResponse(500, {
                    error: result?.error || "Error al actualizar usuario",
                })
            );
        }
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Intercambiar estado Usuario
router.put("/toggle-status/:cedula", async function (req, res) {
    const { cedula } = req.params;

    try {
        const user = await UserAdmin.findCedula(cedula);
        if (!user) {
            return res.status(404).json(jsonResponse(404, { error: "Usuario no encontrado" }));
        }

        // Cambiar el estado del usuario
        const result = await UserAdmin.toggleUserStatusByCC(cedula);

        const accion = "TOGGLE_STATUS";
        const detalle = `Estado del usuario con cédula ${cedula} cambiado a ${result.newStatus === 1 ? 'activo' : 'inactivo'}.`;

        // Usar la función logAction para registrar la auditoría
        //await AuditLogger.logAction(accion, detalle);

        return res.json(jsonResponse(200, { message: `Estado del usuario cambiado a ${result.newStatus === 1 ? 'activo' : 'inactivo'} satisfactoriamente.` }));
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

router.put("/toggle-status-cita/:idCita", async function (req, res) {
    const { idCita } = req.params
    try {       
        const result = await UserSecretary.toggleCitaStatusByidCita(idCita);
        return res.json(jsonResponse(200, { message: `Estado de la cita cambiado a ${result.newStatus === 1 ? 'activa' : 'cancelada'} satisfactoriamente.` }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});
// Seleccionar Usuario
router.get("/select", async function (req, res) {
    try {
        const users = await UserSecretary.findAll({});
        //|| users.length === 0
        if (!users) {
            return res.status(404).json(jsonResponse(404, { error: "Usuarios no encontrados" }));
        } else {
            return res.json(jsonResponse(200, { message: "Usuarios obtenidos satisfactoriamente", data: users }));
        }

    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Cargar Datos Usuario a editar

router.get("/fetch-user/:CC", async function (req, res) {
    const { CC } = req.params; // Obtiene la identificación desde los parámetros de la URL

    try {
        const exists = await User.usernameExists(CC);

        // Verifica si el usuario existe
        if (!exists) {
            return res.status(404).json(jsonResponse(404, { error: "Usuario no encontrado" }));
        }

        // Si el usuario existe, carga los datos
        const user = await User.getUserByCC(CC);
        return res.json(jsonResponse(200, { message: "Usuario obtenido satisfactoriamente", data: user }));

    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});



module.exports = router;