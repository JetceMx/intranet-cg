// syncADtoSQL.js
const ActiveDirectory = require('activedirectory2');
const sql = require('mssql');
require('dotenv').config();

// 🔹 CONFIGURACIÓN Active Directory
const configAD = {
    url: process.env.AD_URL, 
    baseDN: process.env.AD_BASE_DN,   
    username: process.env.AD_USER,
    password: process.env.AD_PASSWORD
};

const ad = new ActiveDirectory(configAD);

// 🔹 CONFIGURACIÓN SQL Server (usa tus variables .env)
const configSQL = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    port: parseInt(process.env.DB_PORT, 10)
};

async function syncUsers() {
    try {
        // Conectar a SQL
        let pool = await sql.connect(configSQL);

        console.log('🔍 Buscando usuarios en Active Directory...');
        // Puedes filtrar por OU o Grupo si quieres segmentar
        ad.findUsers('*', true, async (err, users) => {
            if (err) {
                console.error('❌ Error buscando en AD:', err);
                return;
            }

            if (!users || users.length === 0) {
                console.log('⚠ No se encontraron usuarios en AD.');
                return;
            }

            console.log(`✅ ${users.length} usuarios encontrados en AD.`);

            for (const u of users) {
                const usuarioAD = u.sAMAccountName || '';
                const nombre = u.displayName || '';
                const correo = u.mail || '';
                const area = u.department || ''; // Esto vendría de AD
                const rol = 'Empleado'; // Rol por defecto (puedes mapearlo)

                if (!usuarioAD) continue; // Saltar si no hay usuario

                // 🔹 Verificar si el área existe en la tabla Areas, si no, la creamos
                let idArea = null;
                if (area) {
                    const areaResult = await pool.request()
                        .input('nombreArea', sql.NVarChar, area)
                        .query(`
                            MERGE Areas AS target
                            USING (SELECT @nombreArea AS nombreArea) AS source
                            ON target.NombreArea = source.nombreArea
                            WHEN NOT MATCHED THEN
                                INSERT (NombreArea) VALUES (@nombreArea)
                            OUTPUT inserted.IdArea;
                        `);
                    if (areaResult.recordset.length > 0) {
                        idArea = areaResult.recordset[0].IdArea;
                    } else {
                        const query = await pool.request()
                            .input('nombreArea', sql.NVarChar, area)
                            .query(`SELECT IdArea FROM Areas WHERE NombreArea = @nombreArea`);
                        if (query.recordset.length > 0) idArea = query.recordset[0].IdArea;
                    }
                }

                // 🔹 Verificar si el rol existe en la tabla Roles, si no, lo creamos
                let idRol = null;
                if (rol) {
                    const rolResult = await pool.request()
                        .input('nombreRol', sql.NVarChar, rol)
                        .query(`
                            MERGE Roles AS target
                            USING (SELECT @nombreRol AS nombreRol) AS source
                            ON target.NombreRol = source.nombreRol
                            WHEN NOT MATCHED THEN
                                INSERT (NombreRol) VALUES (@nombreRol)
                            OUTPUT inserted.IdRol;
                        `);
                    if (rolResult.recordset.length > 0) {
                        idRol = rolResult.recordset[0].IdRol;
                    } else {
                        const query = await pool.request()
                            .input('nombreRol', sql.NVarChar, rol)
                            .query(`SELECT IdRol FROM Roles WHERE NombreRol = @nombreRol`);
                        if (query.recordset.length > 0) idRol = query.recordset[0].IdRol;
                    }
                }

                // 🔹 Insertar o actualizar el usuario en la tabla Usuarios
                await pool.request()
                    .input('usuarioAD', sql.NVarChar, usuarioAD)
                    .input('nombre', sql.NVarChar, nombre)
                    .input('correo', sql.NVarChar, correo)
                    .input('idArea', sql.Int, idArea)
                    .input('idRol', sql.Int, idRol)
                    .query(`
                        MERGE Usuarios AS target
                        USING (SELECT @usuarioAD AS usuarioAD) AS source
                        ON target.UsuarioAD = source.usuarioAD
                        WHEN MATCHED THEN
                            UPDATE SET Nombre = @nombre, Correo = @correo, IdArea = @idArea, IdRol = @idRol
                        WHEN NOT MATCHED THEN
                            INSERT (UsuarioAD, Nombre, Correo, IdArea, IdRol, Activo)
                            VALUES (@usuarioAD, @nombre, @correo, @idArea, @idRol, 1);
                    `);
            }

            console.log('🎯 Sincronización completada.');
            sql.close();
        });
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

syncUsers();
