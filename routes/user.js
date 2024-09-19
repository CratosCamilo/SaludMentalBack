const express = require("express");
const { jsonResponse } = require("../lib/jsonResponse");
const log = require("../lib/trace"); // Asegúrate de que este módulo está configurado correctamente
const authenticateToken = require("../auth/authenticateToken"); // Asegúrate de que la ruta sea correcta
const router = express.Router();

// Middleware para autenticar el token y establecer req.user
router.use(authenticateToken);

router.get("/", async function (req, res, next) {
  // Agrega un log para verificar el contenido de req.user
  log.info("Request User:", req.user);

  // Asegúrate de que req.user contiene el campo name
  res.json(jsonResponse(200, {
    name: req.user.name,
    // Otros datos del usuario si es necesario
  }));
});

module.exports = router;
