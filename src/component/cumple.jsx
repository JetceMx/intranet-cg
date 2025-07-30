import React, { useEffect, useState } from 'react';
import '../Style/cumple.modules.css';

// 7 - Codigo

const frasesCumple = [
  "¡Feliz Cumpleaños a David Fernandez!",
  "Hora de felicitar a David por otro año lleno de logros.",
  "¡Hoy celebramos a David, un año más de sabiduría y experiencias!",
  "David, que este nuevo año te traiga aún más éxitos y alegrías.",
  "¡Brindemos por David en su cumpleaños! Que sea un día lleno de sorpresas y felicidad.",
];

function getSaludoPorHora() {
  const hora = new Date().getHours();
  if (hora < 12) return "Hoy en este día te deseamos un feliz cumpleaños";
  if (hora < 18) return "En esta hermosa tarde de cumpleaños te enviamos nuestros mejores deseos";
  return "En esta mágica noche de cumpleaños, que todos tus sueños se hagan realidad.";
}

export default function Cumple({ collapsed }) {
  const [frase, setFrase] = useState("");
  const [saludo, setSaludo] = useState("");

  useEffect(() => {
    setSaludo(getSaludoPorHora());
    const aleatorio = frasesCumple[Math.floor(Math.random() * frasesCumple.length)];
    setFrase(aleatorio);
  }, []);

  return (
    <header className={`cumple-header ${collapsed ? "collapsed" : ""}`}>
      <div>
        <h3>{saludo}</h3>
        <p className="motivacion">{frase}</p>
      </div>
    </header>
  );
}