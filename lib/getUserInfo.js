function getUserInfo(user) {
    return {
        username: user.CC, // Suponiendo que 'CC' se usa como nombre de usuario
        name: user.nombreUsuario, // Nombre del usuario
        lastName: user.apellidoUsuario, // Apellido del usuario
        email: user.emailUsuario, // Email del usuario
        sedeId: user.idSede, // ID de sede
        roleId: user.idRol, // ID de rol
        status: user.estadoUsuario, // Estado del usuario
        specialtyId: user.idEspecialidad, // ID de especialidad
        resumeId: user.idHoja_Vida, // ID de hoja de vida
        patientTypeId: user.idTipoPaciente, // ID de tipo de paciente
    };
}

module.exports = getUserInfo;
