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

        if (!token || typeof token !== 'string' || token.trim() === '') {
            return { success: false, error: 'Invalid token value' };
        }

        try {
            const result = await query(sql, [token]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    async deleteToken(token) {
        if (!token) {
            return { success: false, error: 'Invalid token value' };
        }
    
        try {
            const sql = 'DELETE FROM Tokens WHERE token = ?'; 
            const result = await query(sql, [token]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};


module.exports = Token;
