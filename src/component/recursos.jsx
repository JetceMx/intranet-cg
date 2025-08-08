import { FileDown, Filter, User, Building } from "lucide-react";
import "../Style/recursos.modules.css";
import { useAuth } from "../context/context";
import { useState, useMemo } from "react";

export default function Recursos() {
  const { isLoggedIn, loading, user } = useAuth(); // Asumiendo que user contiene rol y area
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroArea, setFiltroArea] = useState('todas');

  // Configuración de recursos con permisos por rol y área
  const recursosConfig = [
    {
      id: 1,
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
        },
        {
          nombre: "Manual de Procedimientos",
          url: "/docs/manual-procedimientos.pdf",
          roles: ["admin", "supervisor"],
          areas: ["todas"]
        }
      ]
    },
    {
      id: 2,
      categoria: "Reglamentos",
      items: [
        {
          nombre: "Reglamento Interno",
          url: "/docs/reglamento-interno.pdf",
          roles: ["admin", "supervisor", "empleado"],
          areas: ["todas"]
        },
        {
          nombre: "Reglamento de Seguridad",
          url: "/docs/reglamento-seguridad.pdf",
          roles: ["admin", "supervisor", "empleado"],
          areas: ["todas"]
        },
        {
          nombre: "Reglamento IT",
          url: "/docs/reglamento-it.pdf",
          roles: ["admin", "supervisor"],
          areas: ["ti"]
        }
      ]
    },
    {
      id: 3,
      categoria: "Políticas",
      items: [
        {
          nombre: "Política de Privacidad",
          url: "/docs/politica-privacidad.pdf",
          roles: ["admin", "supervisor", "empleado"],
          areas: ["todas"]
        },
        {
          nombre: "Política de Seguridad",
          url: "/docs/politica-seguridad.pdf",
          roles: ["admin", "supervisor"],
          areas: ["todas"]
        },
        {
          nombre: "Política de RRHH",
          url: "/docs/politica-rrhh.pdf",
          roles: ["admin", "supervisor"],
          areas: ["rrhh"]
        }
      ]
    },
    {
      id: 4,
      categoria: "Formatos",
      items: [
        {
          nombre: "Formato de Vacaciones",
          url: "/docs/formato-vacaciones.pdf",
          roles: ["admin", "supervisor", "empleado"],
          areas: ["todas"]
        },
        {
          nombre: "Formato de Permisos",
          url: "/docs/formato-permisos.pdf",
          roles: ["admin", "supervisor", "empleado"],
          areas: ["todas"]
        },
        {
          nombre: "Formato de Evaluación",
          url: "/docs/formato-evaluacion.pdf",
          roles: ["admin", "supervisor"],
          areas: ["rrhh"]
        }
      ],
      proximamente: false
    }
  ];

  // Función para verificar si el usuario tiene acceso a un recurso
  const tieneAcceso = (item) => {
    if (!isLoggedIn || !user) return false;
    
    const tieneRol = item.roles.includes(user.rol) || item.roles.includes('todos');
    const tieneArea = item.areas.includes(user.area) || item.areas.includes('todas');
    
    return tieneRol && tieneArea;
  };

  // Filtrar recursos según los filtros seleccionados y permisos del usuario
  const recursosFiltrados = useMemo(() => {
    return recursosConfig.map(seccion => ({
      ...seccion,
      items: seccion.items.filter(item => {
        // Verificar acceso del usuario
        if (!tieneAcceso(item)) return false;
        
        // Aplicar filtros adicionales
        const cumpleFiltroRol = filtroRol === 'todos' || item.roles.includes(filtroRol);
        const cumpleFiltroArea = filtroArea === 'todas' || item.areas.includes(filtroArea);
        
        return cumpleFiltroRol && cumpleFiltroArea;
      })
    })).filter(seccion => seccion.items.length > 0 || seccion.proximamente);
  }, [filtroRol, filtroArea, isLoggedIn, user]);

  // Obtener roles y áreas únicos para los filtros
  const rolesDisponibles = useMemo(() => {
    const roles = new Set();
    recursosConfig.forEach(seccion => {
      seccion.items.forEach(item => {
        if (tieneAcceso(item)) {
          item.roles.forEach(rol => roles.add(rol));
        }
      });
    });
    return Array.from(roles).filter(rol => rol !== 'todos');
  }, [isLoggedIn, user]);

  const areasDisponibles = useMemo(() => {
    const areas = new Set();
    recursosConfig.forEach(seccion => {
      seccion.items.forEach(item => {
        if (tieneAcceso(item)) {
          item.areas.forEach(area => areas.add(area));
        }
      });
    });
    return Array.from(areas).filter(area => area !== 'todas');
  }, [isLoggedIn, user]);

  if (loading) {
    return <div className="centro-container">Cargando...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="centro-container">
        <h2 className="centro-title">Centro de Recursos</h2>
        <div className="acceso-denegado">
          <p>Debes iniciar sesión para acceder a los recursos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="centro-container">
      <h2 className="centro-title">Centro de Recursos</h2>

      {/* Panel de información del usuario */}
      <div className="usuario-info">
        <div className="usuario-datos">
          <User size={16} />
          <span>Rol: {user?.rol || 'No definido'}</span>
        </div>
        <div className="usuario-datos">
          <Building size={16} />
          <span>Área: {user?.area || 'No definida'}</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-grupo">
          <Filter size={16} />
          <span>Filtros:</span>
        </div>
        
        <div className="filtros-controles">
          <select 
            value={filtroRol} 
            onChange={(e) => setFiltroRol(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos los roles</option>
            {rolesDisponibles.map(rol => (
              <option key={rol} value={rol}>
                {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </option>
            ))}
          </select>

          <select 
            value={filtroArea} 
            onChange={(e) => setFiltroArea(e.target.value)}
            className="filtro-select"
          >
            <option value="todas">Todas las áreas</option>
            {areasDisponibles.map(area => (
              <option key={area} value={area}>
                {area.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="centro-grid">
        {recursosFiltrados.map(seccion => (
          <section key={seccion.id} className={`recurso-seccion ${seccion.proximamente ? 'deshabilitada' : ''}`}>
            <h3>{seccion.categoria}</h3>
            
            {seccion.proximamente ? (
              <p>Muy pronto podrás descargar formatos para vacaciones, permisos, etc.</p>
            ) : (
              <ul className="archivo-lista">
                {seccion.items.map((item, index) => (
                  <li key={index}>
                    <a href={item.url} download>
                      <FileDown size={18} /> {item.nombre}
                    </a>
                    <div className="permisos-info">
                      <small>
                        Roles: {item.roles.join(', ')} | 
                        Áreas: {item.areas.join(', ')}
                      </small>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {seccion.items.length === 0 && !seccion.proximamente && (
              <p className="sin-recursos">No hay recursos disponibles para tu rol/área con los filtros actuales.</p>
            )}
          </section>
        ))}

        {recursosFiltrados.length === 0 && (
          <div className="sin-acceso">
            <p>No tienes acceso a ningún recurso o no hay recursos que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}