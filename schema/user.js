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
    console.log(`Consulta SQL: ${sql} | Parámetro: ${CC}`);
    try {
      const result = await query(sql, [CC]);
      console.log(`Resultado de la consulta: ${JSON.stringify(result)}`);
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

  async getUserByCC(CC) {
    const sql = 'SELECT * FROM ProyectoIntegrador1.USUARIOS WHERE CC = ?';
    const result = await query(sql, [CC]);
    return result[0]; // Devuelve el primer usuario encontrado
  },

  async insertHojaVida(Address, userStatus, CellphoneNumber, IdEps) {
    try {
      const queryStr = `INSERT INTO HOJAS_VIDA (direccion, estadoUsuario, telefonoUsuario, idEps) VALUES (?, ?, ?, ?)`;
      await query(queryStr, [Address, userStatus, CellphoneNumber, IdEps]);
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
      await Token.save(refreshToken);
      return refreshToken;
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error('Error creating token');
    }
  }
  
};

module.exports = User;
