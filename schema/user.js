const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../auth/sign');
const Token = require('../schema/token');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'ProyectoIntegrador1',
  port: 3306
});

const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
};

const User = {
  async usernameExists(CC) {
    const sql = 'SELECT COUNT(*) AS count FROM ProyectoIntegrador1.USUARIOS WHERE CC = ?';
    try {
      const result = await query(sql, [CC]);
      return result[0].count > 0;
    } catch (error) {
      console.error(`Error ejecutando la consulta: ${error.message}`);
      throw error;
    }
  },

  async isCorrectPassword(CC, password) {
    const sql = 'SELECT pwdUsuario FROM ProyectoIntegrador1.USUARIOS WHERE CC = ?';
    const result = await query(sql, [CC]);
    if (result.length === 0) return false;
    const hashedPassword = result[0].pwdUsuario;
    return bcrypt.compare(password, hashedPassword);
  },
  async isCorrectPasswordNoEncrypt(CC, password) {
    const sql = 'SELECT pwdUsuario FROM ProyectoIntegrador1.USUARIOS WHERE CC = ?';
    const result = await query(sql, [CC]);
    if (result.length === 0) return false;
    const storedPassword = result[0].pwdUsuario;
    return storedPassword === password;
  },

  async getUserByCC(CC) {
    const sql = 'SELECT * FROM ProyectoIntegrador1.USUARIOS WHERE CC = ?';
    const result = await query(sql, [CC]);
    return result[0]; // Devuelve el primer usuario encontrado
  },

  async insertHojaVida(Address, userStatus, CellphoneNumber, IdEps) {
    try {
      const queryStr = `INSERT INTO HOJAS_VIDA (direccion, estadoUsuario, telefonoUsuario, idEps) VALUES (?, ?, ?, ?)`;
      const result = await query(queryStr, [Address, userStatus, CellphoneNumber, IdEps]);
      const idHojaVida = result.insertId;
      return idHojaVida;
    } catch (error) {
      console.error('Error inserting hoja de vida:', error);
      throw error;
    }
  },

  async createUser(userData) {
    const {
      Identification,
      Names,
      Surnames,
      Email,
      Password,
      IdBranch,
      IdRole,
      UserStatus,
      IdSpeciality,
      Address,
      userStatus,
      CellphoneNumber,
      IdEps,
      idHojaVida,
      IdTypePatient
    } = userData;

    try {
      const hashedPassword = await bcrypt.hash(Password, 10);
      const userQuery = `
        INSERT INTO USUARIOS (CC, nombreUsuario, apellidoUsuario, emailUsuario, pwdUsuario, idSede, idRol, estadoUsuario, idEspecialidad, idHoja_Vida, idTipoPaciente)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const userValues = [
        Identification,
        Names,
        Surnames,
        Email,
        hashedPassword,
        IdBranch,
        IdRole,
        UserStatus,
        IdSpeciality,
        idHojaVida,
        IdTypePatient
      ];
      await query(userQuery, userValues);
      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  },

  createAccessToken(user) {
    return generateAccessToken(user);
  },

  async createRefreshToken(user) {
    const refreshToken = await generateRefreshToken(user);
    try {
      await Token.save(refreshToken);
      return refreshToken;
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error('Error creating token');
    }
  }

};

const UserAdmin = {
  //logs
  async logAction(usuario, accion, detalle) {
    try {
      const queryStr = `
            INSERT INTO AUDITORIA (usuario, accion, detalle, fecha) 
            VALUES (?, ?, ?, NOW())
        `;
      const result = await query(queryStr, [usuario, accion, detalle]);
      return result;
    } catch (error) {
      console.error('Error al registrar la auditoría:', error);
      throw error; // Lanza el error para que pueda ser manejado en otro lugar
    }
  },

  ////////////////////////////////////
  //users
  async update(userData) {
    const {
      Identification,  // Se usa para identificar al usuario a actualizar
      Names,
      Surnames,
      Email,
      Password,  // Se hashea la contraseña antes de actualizar
      IdRol,
      IdTypePatient
    } = userData;
    try {
      // Hashea la contraseña si se proporciona una nueva
      const updatePass = await User.isCorrectPasswordNoEncrypt(Identification, Password);
      if (!updatePass) {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const updateQuery = `
        UPDATE USUARIOS 
        SET nombreUsuario = ?, 
            apellidoUsuario = ?, 
            emailUsuario = ?, 
            pwdUsuario = ?, 
            idRol = ?,  
            idTipoPaciente = ?
        WHERE CC = ?
      `;

        const updateValues = [
          Names,
          Surnames,
          Email,
          hashedPassword,
          IdRol,
          IdTypePatient,
          Identification
        ];
        await query(updateQuery, updateValues);

        return { success: true };
      } else {
        const updateQuery = `
        UPDATE USUARIOS 
        SET nombreUsuario = ?, 
            apellidoUsuario = ?, 
            emailUsuario = ?, 
            pwdUsuario = ?, 
            idRol = ?,  
            idTipoPaciente = ?
        WHERE CC = ?
      `;
        const updateValues = [
          Names,
          Surnames,
          Email,
          Password,
          IdRol,
          IdTypePatient,
          Identification
        ];
        await query(updateQuery, updateValues);

        return { success: true };
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  },

  async findAll() {
    try {
      const queryStr = `SELECT * FROM USUARIOS`;
      const result = await query(queryStr);
      return result;
    } catch (error) {
      console.error('Error fetching all usuarios:', error);
      throw error;
    }
  },

  async findCedula(Cedula) {
    try {
      const queryStr = `SELECT * FROM USUARIOS WHERE CC = ?`;
      const result = await query(queryStr, [Cedula]);
      return result;
    } catch (error) {
      console.error('Error fetching usuarios by cedula:', error);
      throw error;
    }
  },

  async toggleUserStatusByCC(CC) {
    try {
      const queryStrSelect = `SELECT estadoUsuario FROM USUARIOS WHERE CC = ?`;
      const resultSelect = await query(queryStrSelect, [CC]);
      if (resultSelect.length === 0) {
        throw new Error('Usuario no encontrado.');
      }
      const currentStatus = resultSelect[0].estadoUsuario;
      const newStatus = currentStatus === 1 ? 0 : 1;
      const queryStrUpdate = `UPDATE USUARIOS SET estadoUsuario = ? WHERE CC = ?`;
      const resultUpdate = await query(queryStrUpdate, [newStatus, CC]);
  
      if (resultUpdate.affectedRows === 0) {
        throw new Error('No se pudo actualizar el estado del usuario.');
      }
  
      return { success: true, newStatus };
    } catch (error) {
      console.error('Error al cambiar el estado del usuario:', error);
      throw error;
    }
  },
  

  async save(user) {
    try {
      const queryStr = `
            UPDATE USUARIOS 
            SET 
                nombreUsuario = ?, 
                apellidoUsuario = ?, 
                emailUsuario = ?, 
                pwdUsuario = ?, 
                idSede = ?, 
                idRol = ?, 
                estadoUsuario = ?, 
                idEspecialidad = ?, 
                idHoja_Vida = ?, 
                idTipoPaciente = ?
            WHERE CC = ?
        `;

      const result = await query(queryStr, [
        user.nombreUsuario,
        user.apellidoUsuario,
        user.emailUsuario,
        user.pwdUsuario,
        user.idSede,
        user.idRol,
        user.estadoUsuario,
        user.idEspecialidad,
        user.idHoja_Vida,
        user.idTipoPaciente,
        user.CC
      ]);

      if (result.affectedRows === 0) {
        throw new Error('No se pudo actualizar el usuario, CC no encontrado.');
      }

      return result;
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error;
    }
  },

  async insertHojaVida(Address, userStatus, CellphoneNumber, IdEps) {
    try {
      const queryStr = `INSERT INTO HOJAS_VIDA (direccion, estadoUsuario, telefonoUsuario, idEps) VALUES (?, ?, ?, ?)`;
      const result = await query(queryStr, [Address, userStatus, CellphoneNumber, IdEps]);
    } catch (error) {
      console.error('Error inserting hoja de vida:', error);
      throw error;
    }
  },

  async createUser(userData) {
    const {
      Identification,
      Names,
      Surnames,
      Email,
      Password,
      IdBranch,
      IdRole,
      UserStatus,
      IdSpeciality,
      Address,
      userStatus,
      CellphoneNumber,
      IdEps,
      IdTypePatient
    } = userData;

    try {
      const hashedPassword = await bcrypt.hash(Password, 10);

      const userQuery = `
        INSERT INTO USUARIOS (CC, nombreUsuario, apellidoUsuario, emailUsuario, pwdUsuario, idSede, idRol, estadoUsuario, idEspecialidad, idTipoPaciente)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const userValues = [
        Identification,
        Names,
        Surnames,
        Email,
        hashedPassword,
        IdBranch,
        IdRole,
        UserStatus,
        IdSpeciality,
        IdTypePatient
      ];
      await query(userQuery, userValues);

      return { success: true };
      await AuditLog.logAction(req.user.id, 'CREAR', `Usuario con CC ${newUser.cc} creado.`);

    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  },

  /////////////////////////////////////////////////
  //citas
  async findCitas(filter = {}) {
    try {
      const queryStr = `
            SELECT 
                idCita, 
                dia, 
                hora, 
                estadoCita, 
                idServicio, 
                idHistoria_Medica, 
                idUsuarioCC, 
                idDocCC 
            FROM CITAS
            WHERE 1=1
        `;

      const queryParams = [];

      // Aplicar filtros si existen
      if (filter.idCita) {
        queryStr += " AND idCita = ?";
        queryParams.push(filter.idCita);
      }
      if (filter.dia) {
        queryStr += " AND dia = ?";
        queryParams.push(filter.dia);
      }
      if (filter.idUsuarioCC) {
        queryStr += " AND idUsuarioCC = ?";
        queryParams.push(filter.idUsuarioCC);
      }
      if (filter.idDocCC) {
        queryStr += " AND idDocCC = ?";
        queryParams.push(filter.idDocCC);
      }

      const result = await query(queryStr, queryParams);

      return result;
    } catch (error) {
      console.error('Error al buscar citas:', error);
      throw error;
    }
  }


};

const UserDoctor = {
  // encontrar citas
  async findCitas(DoctorCC) {
    try {
      const queryStr = `
            SELECT 
                c.idCita, 
                c.dia, 
                c.hora, 
                c.estadoCita, 
                s.nombreServicio,  -- Traer el nombre del servicio
                c.idHistoria_Medica, 
                c.idUsuarioCC, 
                c.idDocCC
            FROM CITAS c
            JOIN SERVICIOS s ON c.idServicio = s.idServicio
            WHERE c.idDocCC = ?;
        `;

        const result = await query(queryStr, [DoctorCC]);
        return result;
    } catch (error) {
        console.error('Error al buscar citas:', error);
        throw error;
    }
  },

  async findCitasDia(DoctorCC) {
    try {
        const queryStr = `
            SELECT COUNT(idCita)
            FROM CITAS
            WHERE idDocCC = ? and DATE(Dia) = CURDATE();
        `;

        const result = await query(queryStr, [DoctorCC]);
        return result;
    } catch (error) {
        console.error('Error al buscar citas:', error);
        throw error;
    }
  },

  async findCitasT(DoctorCC) {
    try {
        const queryStr = `
            SELECT COUNT(idCita)
            FROM CITAS
            WHERE idDocCC = ?
        `;

      const result = await query(queryStr, [DoctorCC]);
      return result;
    } catch (error) {
      console.error('Error al buscar citas:', error);
      throw error;
    }
  },

  async findConsultas(DoctorCC) {
    try {
        const queryStr = `
            SELECT COUNT(DISTINCT idUsuarioCC) AS conteoPacientes
            FROM CITAS
            WHERE idDocCC = ?;
        `;

        const result = await query(queryStr, [DoctorCC]);
        return result;
    } catch (error) {
        console.error('Error al buscar consultas:', error);
        throw error;
    }
  },

  async findCitaId(idCita, DoctorCC) {
    try {
      const queryStr = `SELECT * FROM CITAS WHERE idUsuarioCC = ? and idDocCC = ?`;
      const result = await query(queryStr, [idCita, DoctorCC]);
      return result;
    } catch (error) {
      console.error('Error fetching citas by cedula u id:', error);
      throw error;
    }
  },
};

const UserSecretary = {
  //Encontrar citas
  async findCitas(filter = {}) {
    try {
      const queryStr = `
            SELECT 
                idCita, 
                dia, 
                hora, 
                estadoCita, 
                idServicio, 
                idHistoria_Medica, 
                idUsuarioCC, 
                idDocCC 
            FROM CITAS
            WHERE 1=1
        `;

      const queryParams = [];

      // Aplicar filtros si existen
      if (filter.idCita) {
        queryStr += " AND idCita = ?";
        queryParams.push(filter.idCita);
      }
      if (filter.dia) {
        queryStr += " AND dia = ?";
        queryParams.push(filter.dia);
      }
      if (filter.idUsuarioCC) {
        queryStr += " AND idUsuarioCC = ?";
        queryParams.push(filter.idUsuarioCC);
      }
      if (filter.idDocCC) {
        queryStr += " AND idDocCC = ?";
        queryParams.push(filter.idDocCC);
      }

      const result = await query(queryStr, queryParams);

      return result;
    } catch (error) {
      console.error('Error al buscar citas:', error);
      throw error;
    }
  },

  async findCitaId(citaId) {
    try {
      const queryStr = `SELECT * FROM CITAS WHERE idCita = ?`;
      const result = await query(queryStr, [citaId]);
      return result;
    } catch (error) {
      console.error('Error fetching citas by cedula:', error);
      throw error;
    }
  },

};

const Pacient = {
  ///////////////////////////////////////////
  //citas
  async insertCita(citaData) {
    const {
      dia,
      hora,
      estadoCita,
      idServicio,
      idHistoria_Medica,
      idUsuarioCC,
      idDocCC
    } = citaData;

    try {
      const citaQuery = `
        INSERT INTO CITAS (dia, hora, estadoCita, idServicio, idHistoria_Medica, idUsuarioCC, idDocCC)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const citaValues = [
        dia,
        hora,
        estadoCita,
        idServicio,
        idHistoria_Medica,
        idUsuarioCC,
        idDocCC
      ];
      await query(citaQuery, citaValues);

      return { success: true };

    } catch (error) {
      console.error('Error insertar cita:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteById(CitaId) {
    try {
      const queryStr = `DELETE FROM CITAS WHERE idCita = ?`;
      const result = await query(queryStr, [CitaId]);

      if (result.affectedRows === 0) {
        throw new Error('No se pudo eliminar la cita, Id no encontrado.');
      }

      return result;
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
      throw error;
    }
  },

  async findCitas(UserCC) {
    try {
      const queryStr = `
            SELECT 
                idCita, 
                dia, 
                hora, 
                estadoCita, 
                idServicio, 
                idHistoria_Medica, 
                idUsuarioCC, 
                idDocCC 
            FROM CITAS
            WHERE idUsuarioCC = ?
        `;

      const result = await query(queryStr, [UserCC]);
      return result;
    } catch (error) {
      console.error('Error al buscar citas:', error);
      throw error;
    }
  },

  async findCitaId(idCita) {
    try {
      const queryStr = `SELECT * FROM CITAS WHERE idUsuarioCC = ?`;
      const result = await query(queryStr, [idCita], [DoctorCC]);
      return result;
    } catch (error) {
      console.error('Error fetching citas by id:', error);
      throw error;
    }
  },

  ////////////////////////////////////////////
  //Historia medica

  ///////////////////////////////////////////
  //Historial pagos
  async findPagos(UserCC) {
    try {
      const queryStr = `
            SELECT 
                a.idFactura_Electronica,
                a.idCita,
                a.estadoFE,
                a.idColilla_Pago,
                a.idAutorizacion_Medica,
                a.idOrden_Medica 
            FROM FACTURA_ELECTRONICA a
            INNER JOIN CITAS b ON a.idCita = b.idCita
            WHERE b.idUsuarioCC = ?
        `;

      const result = await query(queryStr, [UserCC]);
      return result;
    } catch (error) {
      console.error('Error al buscar historial:', error);
      throw error;
    }
  },

  ///////////////////////////////////////////
  //Actualizar datos personales
  async userUpdate(userCC, user) {
    try {
      const queryStr = `
            UPDATE USUARIOS u
            JOIN hojadevida h ON u.idHoja_Vida = h.idHoja_Vida
            SET 
                u.emailUsuario = ?, 
                u.pwdUsuario = ?,
                h.direccion = ?, 
                h.telefonoUsuario = ?,
                h.idEps = ?
            WHERE u.CC = ?
        `;

      const result = await query(queryStr, [
        user.emailUsuario,
        user.pwdUsuario,
        user.direccion,
        user.telefonoUsuario,
        user.idEps,
        userCC
      ]);

      if (result.affectedRows === 0) {
        throw new Error('No se pudo actualizar el usuario, CC no encontrado.');
      }

      return result;
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw error;
    }
  },

  ///////////////////////////////////////////
  //Facturas pendientes
  async findFacturas(UserCC) {
    try {
      const queryStr = `
            SELECT 
                a.idFactura_Electronica,
                a.idCita,
                a.estadoFE,
                a.idColilla_Pago,
                a.idAutorizacion_Medica,
                a.idOrden_Medica 
            FROM FACTURA_ELECTRONICA a
            INNER JOIN CITAS b ON a.idCita = b.idCita
            WHERE b.idUsuarioCC = ? and a.estadoFE = 1
        `;

      const result = await query(queryStr, [UserCC]);
      return result;
    } catch (error) {
      console.error('Error al buscar facturas pendientes:', error);
      throw error;
    }
  },

};

module.exports = {
  User,
  UserAdmin,
  UserDoctor,
  UserSecretary,
  Pacient
};