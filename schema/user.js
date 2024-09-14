const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../auth/sign');
const Token = require('../schema/token');

const db = mysql.createPool({
    host: 'localhost',
    user: 'usuario',
    password: 'user34Aurea',
    database: 'ProyectoIntegrador1', 
    port: 3307
});

const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => {
      if (error) reject(error);
      resolve(results);3
    });
  });
};

const User = {
  async usernameExists(username) {
    const sql = 'SELECT COUNT(*) AS count FROM USUARIOS WHERE emailUsuario = ?';
    const result = await query(sql, [username]);
    return result[0].count > 0;
  },

  async isCorrectPassword(email, password) {
    const sql = 'SELECT pwdUsuario FROM USUARIOS WHERE emailUsuario = ?';
    const result = await query(sql, [email]);
    if (result.length === 0) return false;

    const hashedPassword = result[0].pwdUsuario;
    return bcrypt.compare(password, hashedPassword);
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
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  },

  createAccessToken(user) {
    return generateAccessToken(user);
  },

  async createRefreshToken(user) {
    const refreshToken = generateRefreshToken(user);

    try {
      await new Token({ token: refreshToken }).save();
      console.log('Token saved', refreshToken);
      return refreshToken;
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error('Error creating token');
    }
  }
};

module.exports = User;
