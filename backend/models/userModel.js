const { poolPromise, sql } = require('../utils/db');

async function getUserByEmail(email) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .query('SELECT * FROM Usuarios WHERE Correo = @gmail');
  return result.recordset[0];
}

module.exports = {
  getUserByEmail,
};
