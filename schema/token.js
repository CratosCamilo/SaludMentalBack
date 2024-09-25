const mysql = require('mysql2');

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

const Token = {
    async save(token) {
        const sql = 'INSERT INTO Tokens (token) VALUES (?)';
        try {
            await query(sql, [token]);
            console.log('Token saved:', token);
            return { success: true };
        } catch (error) {
            console.error('Error saving token:', error);
            return { success: false, error: error.message };
        }
    },
    async deleteToken(token) {
        const sql = 'DELETE FROM tokens WHERE token = ?'; // Ajusta según tu tabla de tokens
        return await query(sql, [token]);
    }


};

module.exports = Token;
