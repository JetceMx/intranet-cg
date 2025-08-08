const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Connection, Request, TYPES } = require('tedious');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT; 
const SECRET_KEY = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de conexión a SQL Server

const dbConfig = {
  server: process.env.DB_SERVER,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    database: process.env.DB_DATABASE,
    trustServerCertificate: true,
    encrypt: false,
    port: parseInt(process.env.DB_PORT, 10)  // ← Cambiado: agregado parseInt para hacerlo entero
  }
};

// Función para probar la conexión
const testConnection = () => {
  const connection = new Connection(dbConfig);
  
  connection.on('connect', (err) => {
    if (err) {
      console.error('❌ Error de conexión:', err.message);
    } else {
      console.log('✅ Conexión exitosa a SQL Server');
      connection.close();
    }
  });
  
  connection.connect();
};

// Probar conexión al iniciar
testConnection();

// Ruta POST: /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('📧 Email recibido:', email);
  console.log('🔐 Password recibido:', password);

  const connection = new Connection(dbConfig);
  
  connection.on('connect', (err) => {
    if (err) {
      console.error('❌ Error al conectar con la BD:', err.message);
      return res.status(500).json({ message: "Error al conectar con la base de datos" });
    }
    
    console.log('✅ Conectado a la BD para login');

    // Primero verificar si el usuario existe
    const checkUserSql = `SELECT * FROM Usuarios WHERE Correo = @correo`;
    let foundUser = null;
    
    const checkRequest = new Request(checkUserSql, (err, rowCount) => {
      connection.close();
      
      if (err) {
        console.error('❌ Error en consulta de verificación:', err.message);
        return res.status(500).json({ message: "Error en la consulta" });
      }

      console.log('📊 Filas encontradas:', rowCount);
      
      if (rowCount === 0 || !foundUser) {
        console.log('❌ Usuario no encontrado con email:', email);
        return res.status(401).json({ message: "Usuario no encontrado" });
      }
      
      console.log('👤 Usuario encontrado:', foundUser.Correo);
      console.log('🔐 Contraseña en BD:', foundUser.Contrasena || foundUser.Password || foundUser.password);
      console.log('🔐 Contraseña enviada:', password);
      
      // Verificar contraseña (probamos diferentes nombres de columna)
      const dbPassword = foundUser.Contrasena || foundUser.Password || foundUser.password || foundUser.contraseña;
      
      if (!dbPassword) {
        console.log('❌ No se encontró columna de contraseña en la BD');
        return res.status(500).json({ message: "Error: columna de contraseña no encontrada" });
      }
      
      if (dbPassword !== password) {
        console.log('❌ Contraseña incorrecta');
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      console.log('✅ Login exitoso');
      
      // Generar token JWT
      const userId = foundUser.IdUsuario || foundUser.Id || foundUser.id;
      const token = jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '2h' });
      
      // Crear copia del usuario sin contraseña
      const userResponse = { ...foundUser };
      delete userResponse.Contrasena;
      delete userResponse.Password;
      delete userResponse.password;
      delete userResponse.contraseña;
      
      return res.json({ token, user: userResponse });
    });

    // Evento 'row' para capturar los datos del usuario
    checkRequest.on('row', (columns) => {
      console.log('🔍 Datos del usuario recibidos:', columns);
      foundUser = {};
      
      columns.forEach(column => {
        console.log('🔍 Columna:', column.metadata.colName, '- Valor:', column.value);
        foundUser[column.metadata.colName] = column.value;
      });
      
      console.log('👤 Usuario procesado:', foundUser);
    });

    checkRequest.addParameter('correo', TYPES.VarChar, email);
    connection.execSql(checkRequest);
  });
  
  connection.connect();
});

// Ruta para verificar la estructura de la tabla (solo para debug)
app.get('/api/debug/usuarios', (req, res) => {
  const connection = new Connection(dbConfig);
  
  connection.on('connect', (err) => {
    if (err) {
      console.error('❌ Error al conectar:', err.message);
      return res.status(500).json({ error: err.message });
    }

    const sql = `SELECT TOP 5 * FROM Usuarios`;
    const users = []; // Array para recolectar usuarios
    
    const request = new Request(sql, (err, rowCount) => {
      connection.close();
      
      if (err) {
        console.error('❌ Error en consulta debug:', err.message);
        return res.status(500).json({ error: err.message });
      }

      console.log('✅ Consulta completada. Usuarios encontrados:', users.length);
      res.json({ rowCount, users, totalFound: users.length });
    });

    // Evento 'row' para capturar cada fila
    request.on('row', (columns) => {
      console.log('🔍 Fila recibida:', columns);
      const user = {};
      
      columns.forEach(column => {
        console.log('🔍 Columna:', column.metadata.colName, '- Valor:', column.value);
        user[column.metadata.colName] = column.value;
      });
      
      console.log('👤 Usuario procesado:', user);
      users.push(user);
    });

    connection.execSql(request);
  });
  
  connection.connect();
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});