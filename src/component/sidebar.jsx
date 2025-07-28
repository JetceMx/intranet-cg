import { useState, useEffect } from "react";
import { Home, FileText, LogOut, Menu } from "lucide-react";
import "../Style/sidebar.modules.css";

const navItems = [
  { icon: <Home size={20} />, label: "Inicio" },
  { icon: <FileText size={20} />, label: "Mis Solicitudes" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Colapsar automáticamente en pantallas pequeñas
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize(); // Inicial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
