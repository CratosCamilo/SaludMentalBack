const express = require("express");
const UserAdmin = require("../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");
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
router.put("/edit/:cedula", async function (req, res) {
    const { cedula } = req.params;
    const { Identification, Names, Surnames, Email, Address, CellphoneNumber, IdEps } = req.body;

    // Validación de campos obligatorios
    if (!Identification || !Names || !Surnames || !Email || !Address || !CellphoneNumber || !IdEps) {
        return res.status(400).json(jsonResponse(400, { error: "Todos los campos son obligatorios" }));
    }

    try {
        // Buscar usuario por cedula
        const user = await UserAdmin.findCedula(cedula);
        if (!user) {
            return res.status(404).json(jsonResponse(404, { error: "Usuario no encontrado" }));
        }

        // Validar y asignar el valor de IdEps
        let idEpsValue;
        switch (IdEps.toLowerCase()) {
            case "colsanitas": idEpsValue = 1; break;
            case "salud": idEpsValue = 2; break;
            case "sura": idEpsValue = 3; break;
            case "particular": idEpsValue = 4; break;
            default:
                return res.status(400).json(jsonResponse(400, { error: "Valor de EPS inválido" }));
        }

        // Actualizar los campos del usuario
        user.Identification = Identification;
        user.Names = Names;
        user.Surnames = Surnames;
        user.Email = Email;
        user.Address = Address;
        user.CellphoneNumber = CellphoneNumber;
        user.IdEps = idEpsValue;

        // Guardar los cambios en la base de datos
        const result = await user.save();

        return res.json(jsonResponse(200, { message: "Usuario actualizado satisfactoriamente", data: result }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Eliminar Usuario
router.delete("/delete/:cedula", async function (req, res) {
    const { cedula } = req.params;
    const { userId } = req; // Extraído desde el middleware de autenticación??????'

    try {
        const user = await UserAdmin.findCedula(cedula);
        if (!user) {
            return res.status(404).json(jsonResponse(404, { error: "Usuario no encontrado" }));
        }

        await UserAdmin.delete(cedula);

        const accion = "DELETE";
        const detalle = `Usuario con cédula ${cedula} eliminado satisfactoriamente.`;

        // Usar la función logAction para registrar la auditoría
        await AuditLogger.logAction(userId, accion, detalle);

        return res.json(jsonResponse(200, { message: "Usuario eliminado satisfactoriamente" }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Seleccionar Usuario
router.get("/select", async function (req, res) {
    try {
        const users = await UserAdmin.find({});
        return res.json(jsonResponse(200, { message: "Usuarios obtenidos satisfactoriamente", data: users }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

module.exports = router;