import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Para mostrar loading inicial
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si hay sesión guardada al cargar la app
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        // Si hay error al parsear, limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false); // Terminar loading
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    console.log('✅ Usuario logueado:', newUser);
    
    // Redirigir a donde estaba intentando ir, o a home
    const intendedDestination = location.state?.from?.pathname || '/';
    navigate(intendedDestination, { replace: true });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    console.log('👋 Usuario deslogueado');
    navigate('/login');
  };

  // Función para verificar si el token está expirado (opcional)
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  const value = {
    isLoggedIn,
    user,
    token,
    loading,
    login,
    logout,
    isTokenExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};