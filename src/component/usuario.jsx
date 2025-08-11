import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { NavLink } from "react-router-dom";
import '../Style/usuario.modules.css';
import { useAuth } from "../context/context";

const frasesMotivacionales = [
  "¡Hoy es un buen día para aprender algo nuevo!",
  "Recuerda: cada paso te acerca a tu meta.",
  "El esfuerzo de hoy es el éxito de mañana.",
  "Confía en tu proceso.",
  "No te rindas, lo mejor está por venir.",
];

function getSaludoPorHora() {
  const hora = new Date().getHours();
  if (hora < 12) return "¡Buenos días!";
  if (hora < 18) return "¡Buenas tardes!";
  return "¡Buenas noches!";
}

export default function UserHeader({ collapsed }) {

  const [frase, setFrase] = useState("");
  const [saludo, setSaludo] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    setSaludo(getSaludoPorHora());
    const aleatorio = frasesMotivacionales[Math.floor(Math.random() * frasesMotivacionales.length)];
    setFrase(aleatorio);
    
    // Verificar si hay un usuario autenticado
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
  };

  return (
    <header className={`user-header ${collapsed ? "collapsed" : ""}`}>
      <div className="user-header-left">
        <h2 className="saludo">{saludo}</h2>
        <p className="motivacion">"{frase}"</p>
      </div>

      <div className="user-header-right">
        {user ? (
          // Usuario autenticado - mostrar nombre
          <div className="user-info">
            <div className="user-profile">
              <User size={20} />
              <span className="user-name">{user.nombre || user.email}</span>
            </div>
          </div>
        ) : (
          // Usuario no autenticado - mostrar enlace de inicio de sesión
          <NavLink to="/login" className="login-placeholder">
            <User size={20} />
            Iniciar Sesión
          </NavLink>
        )}
      </div>
    </header>
  );
}