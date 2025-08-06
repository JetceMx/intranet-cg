const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('../models/userModel');
require('dotenv').config();

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // aqui se compara la contraseña
    if (password !== user.Contraseña) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // se genera el token JWT
    const token = jwt.sign({ id: user.IdUsuario, email: user.Correo }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.IdUsuario, email: user.Correo, nombre: user.Nombre } });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
}

module.exports = {
  login,
};
