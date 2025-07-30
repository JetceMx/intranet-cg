import { Home, FileText, LogOut, Menu, HatGlasses, Handshake } from "lucide-react";
import "../Style/sidebar.modules.css";

// 4 - Codigo

const navItems = [
  { icon: <Home size={20} />, label: "Inicio" },
  { icon: <FileText size={20} />, label: "Documentos" },
  { icon: <Handshake size={20} />, label: "Mis Solicitudes" },
  { icon: <HatGlasses size={20}/>, label: "Denuncias"},

];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <h1 className="logo">Mi App</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="toggle-btn"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => (
          <div className="nav-item" key={i}>
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item logout">
          <LogOut size={20} />
          {!collapsed && <span>Cerrar Sesión</span>}
        </div>
      </div>
    </aside>
  );
}
