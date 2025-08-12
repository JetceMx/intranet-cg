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
    port: parseInt(process.env.DB_PORT, 10)
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

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(403).json({ message: 'Token requerido' });
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    req.userId = decoded.id;
    next();
  });
};

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

    // Consulta con JOIN para obtener información del rol y área
    const checkUserSql = `
      SELECT 
        u.*,
        r.NombreRol as Rol,
        a.NombreArea as Area
      FROM Usuarios u
      LEFT JOIN Roles r ON u.IdRol = r.IdRol
      LEFT JOIN Areas a ON u.IdArea = a.IdArea
      WHERE u.Correo = @correo
    `;
    
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
      
      // Generar token JWT con información adicional
      const userId = foundUser.IdUsuario || foundUser.Id || foundUser.id;
      const userRole = foundUser.Rol || 'empleado'; // rol por defecto
      const userArea = foundUser.Area || 'general'; // área por defecto
      
      const token = jwt.sign({ 
        id: userId, 
        rol: userRole, 
        area: userArea 
      }, SECRET_KEY, { expiresIn: '2h' });
      
      // Crear copia del usuario sin contraseña para la respuesta
      const userResponse = {
        id: userId,
        nombre: foundUser.Nombre || foundUser.NombreCompleto,
        email: foundUser.Correo,
        rol: userRole.toLowerCase(),
        area: userArea.toLowerCase(),
        activo: foundUser.Activo || foundUser.Estado
      };
      
      // Limpiar todas las posibles columnas de contraseña
      delete userResponse.Contrasena;
      delete userResponse.Password;
      delete userResponse.password;
      delete userResponse.contraseña;
      
      console.log('📤 Respuesta enviada:', { user: userResponse, hasToken: !!token });
      
      return res.json({ 
        token, 
        user: userResponse,
        message: "Login exitoso"
      });
    });

    // Evento 'row' para capturar los datos del usuario
    checkRequest.on('row', (columns) => {
      console.log('🔍 Datos del usuario recibidos:', columns.length, 'columnas');
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

// Ruta para obtener información del usuario actual (protegida)
app.get('/api/auth/me', verifyToken, (req, res) => {
  const connection = new Connection(dbConfig);
  
  connection.on('connect', (err) => {
    if (err) {
      return res.status(500).json({ message: "Error de conexión" });
    }
    
    const sql = `
      SELECT 
        u.IdUsuario,
        u.Nombre,
        u.Correo,
        u.Activo,
        r.NombreRol as Rol,
        a.NombreArea as Area
      FROM Usuarios u
      LEFT JOIN Roles r ON u.IdRol = r.IdRol
      LEFT JOIN Areas a ON u.IdArea = a.IdArea
      WHERE u.IdUsuario = @userId
    `;
    
    let user = null;
    
    const request = new Request(sql, (err, rowCount) => {
      connection.close();
      
      if (err) {
        return res.status(500).json({ message: "Error en consulta" });
      }
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      res.json({
        id: user.IdUsuario,
        nombre: user.Nombre,
        email: user.Correo,
        rol: (user.Rol || 'empleado').toLowerCase(),
        area: (user.Area || 'general').toLowerCase(),
        activo: user.Activo
      });
    });
    
    request.on('row', (columns) => {
      user = {};
      columns.forEach(column => {
        user[column.metadata.colName] = column.value;
      });
    });
    
    request.addParameter('userId', TYPES.Int, req.userId);
    connection.execSql(request);
  });
  
  connection.connect();
});


// Ruta para obtener todos los recursos con filtros (protegida)
app.get('/api/recursos', verifyToken, (req, res) => {
  const connection = new Connection(dbConfig);
  
  connection.on('connect', (err) => {
    if (err) {
      return res.status(500).json({ message: "Error de conexión" });
    }
    
    // Si tienes una tabla de recursos, úsala; si no, devuelve datos estáticos
    const sql = `
      SELECT 
        r.*,
        rp.Rol,
        rp.Area
      FROM Recursos r
      LEFT JOIN RecursosPermisos rp ON r.IdRecurso = rp.IdRecurso
      WHERE rp.Rol IS NULL 
         OR rp.Rol = 'todos' 
         OR rp.Area = 'todas'
      ORDER BY r.Categoria, r.Nombre
    `;
    
    // Como probablemente no tienes esta tabla aún, devolvemos datos estáticos
    const recursosEstaticos = [
      {
        categoria: "Manuales",
        items: [
          {
            nombre: "Manual del Usuario",
            url: "/docs/manual-usuario.pdf",
            roles: ["admin", "supervisor", "empleado"],
            areas: ["todas"]
          },
          {
            nombre: "Manual Técnico",
            url: "/docs/manual-tecnico.pdf",
            roles: ["admin", "supervisor"],
            areas: ["ti", "ingenieria"]
          }
        ]
      }
    ];
    
    connection.close();
    res.json(recursosEstaticos);
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

    const sql = `
      SELECT TOP 5 
        u.*,
        r.NombreRol,
        a.NombreArea
      FROM Usuarios u
      LEFT JOIN Roles r ON u.IdRol = r.IdRol
      LEFT JOIN Areas a ON u.IdArea = a.IdArea
    `;
    
    const users = [];
    
    const request = new Request(sql, (err, rowCount) => {
      connection.close();
      
      if (err) {
        console.error('❌ Error en consulta debug:', err.message);
        return res.status(500).json({ error: err.message });
      }

      console.log('✅ Consulta completada. Usuarios encontrados:', users.length);
      res.json({ rowCount, users, totalFound: users.length });
    });

    request.on('row', (columns) => {
      const user = {};
      columns.forEach(column => {
        // No mostrar contraseñas en debug
        if (!['Contrasena', 'Password', 'password', 'contraseña'].includes(column.metadata.colName)) {
          user[column.metadata.colName] = column.value;
        }
      });
      users.push(user);
    });

    connection.execSql(request);
  });
  
  connection.connect();
});


// Ruta para obtener usuarios que cumplen años el dia actual
app.get("/api/cumple-hoy", (req, res) => {
  const connection = new Connection(dbConfig);

  connection.on("connect", (err) => {
    if (err) {
      console.error("❌ Error al conectar:", err.message);
      return res.status(500).json({ error: "Error de conexión" });
    }

    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.getMonth() + 1;

    console.log(`📅 Buscando cumpleaños para el día ${dia} / ${mes}`);

    const sql = `
      SELECT Nombre, FechaNacimiento
      FROM Usuarios
      WHERE DAY(FechaNacimiento) = @dia
        AND MONTH(FechaNacimiento) = @mes
    `;

    const cumpleanieros = [];

    const request = new Request(sql, (err) => {
      connection.close();

      if (err) {
        console.error("❌ Error en consulta:", err.message);
        return res.status(500).json({ error: "Error en consulta" });
      }

      console.log(`✅ Total cumpleaños encontrados: ${cumpleanieros.length}`);
      res.json({
        tieneCumple: cumpleanieros.length > 0,
        nombres: cumpleanieros.map(c => c.Nombre),
        detalles: cumpleanieros // 👈 Esto es solo para debug
      });
    });

    request.on("row", (columns) => {
      const persona = {};
      columns.forEach(col => {
        persona[col.metadata.colName] = col.value;
      });
      console.log("🎯 Cumpleañero encontrado:", persona);
      cumpleanieros.push(persona);
    });

    request.addParameter("dia", TYPES.Int, dia);
    request.addParameter("mes", TYPES.Int, mes);
    connection.execSql(request);
  });

  connection.connect();
});



// Ruta para logout (opcional)
app.post('/api/auth/logout', verifyToken, (req, res) => {
  // En una implementación más robusta, podrías invalidar el token en una blacklist
  res.json({ message: 'Logout exitoso' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  /*
  console.log(`📋 Rutas disponibles:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/recursos`);
  console.log(`   POST /api/auth/logout`);
  console.log(`   GET  /api/debug/usuarios`);
  */

});