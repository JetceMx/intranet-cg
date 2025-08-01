import React from "react";
import styles from "../Style/sesion.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/context";

const Login = () => {

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(); // Simula login
    navigate("/"); // Redirige al inicio
  };

  return (
    <div className={styles.container}>
      <form className={styles.loginBox} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Iniciar Sesión</h2>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Correo electrónico</label>
          <input type="email" id="email" placeholder="tucorreo@ejemplo.com" required/>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" placeholder="●●●●●●●●" required />
        </div>

        <button type="submit" className={styles.loginButton}>
          Entrar
        </button>

        <p className={styles.helperText}>
          ¿No tienes cuenta? <NavLink to="/register">Regístrate</NavLink>
        </p>
      </form>
    </div>
  );
};

export default Login;
