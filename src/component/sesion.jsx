import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import styles from "../Style/sesion.module.css";
import { useAuth } from "../context/context";

const Login = () => {
  const { login, isLoggedIn, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si ya está logueado, redirigir a home
  if (!loading && isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Cargando...
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      console.log('📧 Email enviado:', email);
      console.log('🔐 Password enviado:', password);
      
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (!response.ok) {
        setError(data.message || "Error al iniciar sesión");
        console.error('❌ Error en login:', data);
        return;
      }

      // Verificar que la respuesta tenga la estructura esperada
      if (!data.token || !data.user) {
        console.error('❌ Respuesta incompleta:', data);
        setError("Error en la respuesta del servidor");
        return;
      }

      console.log('✅ Login exitoso:', {
        token: data.token ? 'Presente' : 'Ausente',
        user: data.user
      });
      
      // El login del contexto maneja la navegación automáticamente
      login(data.token, data.user);
      
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error('❌ Error de conexión:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.loginBox} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Iniciar Sesión</h2>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            placeholder="tucorreo@ejemplo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="●●●●●●●●"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p style={{ 
            color: "red", 
            textAlign: "center", 
            marginTop: "10px",
            backgroundColor: "#ffebee",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ffcdd2"
          }}>
            {error}
          </p>
        )}

        <button 
          type="submit" 
          className={styles.loginButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
        
        {/* Panel de información de desarrollo (puedes quitarlo en producción) */}
      </form>
    </div>
  );
};

export default Login;