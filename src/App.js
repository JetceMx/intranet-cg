import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './context/ProtectedRoute';

// Importa tus páginas existentes
import Home from './Pages/home';
import Docs from './Pages/documentos';
import Login from './Pages/login';
import Denuncias from './Pages/denuncias';
// import Solicitudes from './Pages/solicitudes'; // Descomenta cuando la tengas

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div>
      <Routes>
        {/* Rutas públicas */}
        <Route path='/' element={<Home />} />
        <Route path='/documentos' element={<Docs />} />
        <Route path='/login' element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route 
          path='/denuncias' 
          element={
            <ProtectedRoute>
              <Denuncias />
            </ProtectedRoute>
          } 
        />
        
        {/* Descomenta cuando tengas la página de solicitudes */}
        {/* <Route 
          path='/solicitudes' 
          element={
            <ProtectedRoute>
              <Solicitudes />
            </ProtectedRoute>
          } 
        /> */}
        
        {/* Ruta por defecto - redirigir a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
