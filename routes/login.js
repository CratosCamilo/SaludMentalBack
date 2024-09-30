const express = require("express");
const { User, UserAdmin, UserDoctor, UserSecretary, Pacient } = require("../schema/user");
const { jsonResponse } = require("../lib/jsonResponse");
const getUserInfo = require("../lib/getUserInfo");
const router = express.Router();

router.post("/", async function (req, res, next) {
  const { username, password } = req.body;

  try {
    const userExists = await User.usernameExists(username);

    if (userExists) {
      const user = await User.getUserByCC(username);

      // Validar si el usuario está activo
      if (user.estadoUsuario !== 1) {
        return res.status(403).json(
          jsonResponse(403, {
            error: "El usuario está inactivo, no puede iniciar sesión",
          })
        );
      }

      const passwordCorrect = await User.isCorrectPassword(username, password);

      if (passwordCorrect) {
        const accessToken = User.createAccessToken(user);
        const refreshToken = await User.createRefreshToken(user);

        return res.json(
          jsonResponse(200, {
            accessToken,
            refreshToken,
            user: getUserInfo(user),
          })
        );
      } else {
        return res.status(401).json(
          jsonResponse(401, {
            error: "Nombre de usuario y/o contraseña incorrectos",
          })
        );
      }
    } else {
      return res.status(401).json(
        jsonResponse(401, {
          error: "El nombre de usuario no existe",
        })
      );
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(
      jsonResponse(500, {
        error: "Error interno del servidor",
      })
    );
  }
});

module.exports = router;
