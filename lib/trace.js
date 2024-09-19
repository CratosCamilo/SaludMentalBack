const bunyan = require("bunyan");

const log = bunyan.createLogger({
    name: "SaludMental",
    stream: process.stdout,
    level: 'info', // Puedes ajustar el nivel según lo que necesites
});

module.exports = log;
