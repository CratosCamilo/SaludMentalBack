const express = require("express");
const { User, UserAdmin, UserDoctor, UserSecretary, Pacient }  = require("../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");
const router = express.Router();

// Obtener datos del paciente
router.get("/", authenticatePatient, async function (req, res) {
    const { userCC } = req;

    try {
        const user = await Pacient.findUser(userCC);
        if (!user) {
            return res.status(404).json(jsonResponse(404, { error: "Usuario no encontrado" }));
        }
        return res.json(jsonResponse(200, { data: user }));
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

// Actualizar datos del usuario (paciente)
router.put("/", authenticatePatient, async function (req, res) {
    const { userCC } = req;
    const { nombreUsuario, apellidoUsuario, emailUsuario, pwdUsuario, direccion, telefonoUsuario, idEps } = req.body;

    try {
        let encryptedPwd = pwdUsuario ? await hashPassword(pwdUsuario) : null;

        const userData = {
            nombreUsuario,
            apellidoUsuario,
            emailUsuario,
            pwdUsuario: encryptedPwd,
            direccion,
            telefonoUsuario,
            idEps
        };

        const updatedUser = await UserPacient.userUpdate(userCC, userData);

        if (!updatedUser) {
            return res.status(404).json(jsonResponse(404, { error: "Usuario no encontrado" }));
        }

        return res.json(jsonResponse(200, { message: "Datos actualizados correctamente", data: updatedUser }));
    } catch (err) {
        console.error("Error al actualizar los datos del usuario:", err);
        return res.status(500).json(jsonResponse(500, { error: "Error del servidor" }));
    }
});

module.exports = router;
