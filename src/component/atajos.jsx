import React, { useState } from "react";
import "../Style/atajos.modules.css";

const shortcuts = [
  {
    id: 1,
    title: "Políticas",
    description: "Consulta las políticas internas y lineamientos.",
    file: "/docs/politicas.txt",
  },
  {
    id: 2,
    title: "Reglamento",
    description: "Revisa el reglamento general vigente.",
    file: "/docs/reglamentos.txt",
  },
  {
    id: 3,
    title: "Reconocimientos",
    description: "Conoce a los empleados destacados.",
    file: "/docs/reconocimientos.txt",
  },
];

function Atajos() {
  const [activeShortcut, setActiveShortcut] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = async (shortcut) => {
    setLoading(true);
    setActiveShortcut(shortcut);

    try {
      const response = await fetch(shortcut.file);
      const text = await response.text();
      setContent(text);
    } catch (error) {
      setContent("No se pudo cargar el contenido.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setActiveShortcut(null);
    setContent("");
  };

  return (
    <div className="quick-links-container">
      <h2 className="quick-links-title"> Atajos Rápidos</h2>
      <div className="quick-links-grid">
        {shortcuts.map((item) => (
          <div
            key={item.id}
            className="quick-card"
            onClick={() => openModal(item)}
          >
            <h3 className="quick-card-title">{item.title}</h3>
            <p className="quick-card-desc">{item.description}</p>
          </div>
        ))}
      </div>

      {activeShortcut && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h3>{activeShortcut.title}</h3>
            {loading ? (
              <p>Cargando contenido...</p>
            ) : (
              <pre style={{ whiteSpace: "pre-wrap" }}>{content}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Atajos;

