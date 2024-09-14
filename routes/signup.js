const express = require("express");
const User = require("../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");
const router = express.Router();

router.post("/", async function (req, res) {
    const { Identification, Names, Surnames, Email, Password, IdBranch, IdSpeciality, Address, CellphoneNumber, IdEps } = req.body;
    console.log(req.body);

    // Validación de campos obligatorios
    if (!Identification || !Names || !Surnames || !Email || !Password || !Address || !CellphoneNumber || !IdEps) {
        return res.status(400).json(
            jsonResponse(400, {
                error: "All fields are required",
            })
        );
    }

    try {
        // Verifica si el usuario ya existe
        const userExists = await User.usernameExists(Email);
        if (userExists) {
            return res.status(409).json(
                jsonResponse(409, {
                    error: "El usuario ya existe",
                })
            );
        } else {
            let idEps;
            if (IdEps === "colsanitas") {
                idEps = 1;
            } else if (IdEps === "salud") {
                idEps = 2;
            } else if (IdEps === "sura") {
                idEps = 3;
            } else if (IdEps === "particular") {
                idEps = 4;
            } else {
                return res.status(400).json(
                    jsonResponse(400, {
                        error: "Valor de eps inválido",
                    })
                );
            }

            const idHojaVida = await User.insertHojaVida(Address, 1, CellphoneNumber, idEps);

            const result = await User.createUser({
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
                return res.json(
                    jsonResponse(200, {
                        message: "Usuario creado satisfactoriamente",
                    })
                );
            } else {
                return res.status(500).json(
                    jsonResponse(500, {
                        error: result?.error || "Error al crear usuario",
                    })
                );
            }
        }
    } catch (err) {
        console.error("Error interno del servidor:", err);
        res.status(500).json(
            jsonResponse(500, {
                error: "Error del servidor",
            })
        );
    }
});

module.exports = router;
