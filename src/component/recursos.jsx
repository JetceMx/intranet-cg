import { FileDown } from "lucide-react";
import "../Style/recursos.modules.css";

export default function Recursos() {
  return (
    <div className="centro-container">
      <h2 className="centro-title">Centro de Recursos</h2>

      <div className="centro-grid">

        {/* 13 - codigo */}
        <section className="recurso-seccion">
          <h3>Manuales</h3>
          <ul className="archivo-lista">
            <li>
              <a href="/docs/manual-usuario.pdf" download>
                <FileDown size={18} /> Manual del Usuario
              </a>
            </li>
            <li>
              <a href="/docs/manual-tecnico.pdf" download>
                <FileDown size={18} /> Manual Técnico
              </a>
            </li>
          </ul>
        </section>

        
        <section className="recurso-seccion">
          <h3>Reglamentos</h3>
          <ul className="archivo-lista">
            <li>
              <a href="/docs/reglamento-interno.pdf" download>
                <FileDown size={18} /> Reglamento Interno
              </a>
            </li>
            <li>
              <a href="/docs/reglamento-seguridad.pdf" download>
                <FileDown size={18} /> Reglamento de Seguridad
              </a>
            </li>
          </ul>
        </section>

      
        <section className="recurso-seccion">
          <h3>Políticas</h3>
          <ul className="archivo-lista">
            <li>
              <a href="/docs/politica-privacidad.pdf" download>
                <FileDown size={18} /> Política de Privacidad
              </a>
            </li>
            <li>
              <a href="/docs/politica-seguridad.pdf" download>
                <FileDown size={18} /> Política de Seguridad
              </a>
            </li>
          </ul>
        </section>

        {/* 13.1 - Codigo */}
        <section className="recurso-seccion deshabilitada">
          <h3>Formatos (Próximamente)</h3>
          <p>Muy pronto podrás descargar formatos para vacaciones, permisos, etc.</p>
        </section>

      </div>
    </div>
  );
}
