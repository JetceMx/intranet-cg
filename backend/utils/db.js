const { Connection } = require('tedious');

const config = {
  server: "DESKTOP-UB7IMQF\\SQLSERVER", // Instancia con nombre
  authentication: {
    type: 'default',
    options: {
      userName: "sa",
      password: "ABC123#"
    }
  },
  options: {
    database: "CarnesG",
    trustServerCertificate: true,
    encrypt: false,
    port: 14330
  }
};


const connection = new Connection(config);

connection.connect();

connection.on('connect', (err) => {
  if (err) {
    console.error('❌ Error al conectar:', err.message);
  } else {
    console.log('✅ Conectado con éxito');
    executeStatement();
  }
});

function executeStatement() {
  console.log("🎉 Conexión hecha mi bro");
}
