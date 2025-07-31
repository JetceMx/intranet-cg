import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/home';
import Docs from './Pages/documentos';
import Login from './Pages/login';

function App() {
  return (
    <div>
      
      {/* 1 - Codigo */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/documentos' element={<Docs />} />
        <Route path='/login' element={<Login />} />
      </Routes>

    </div>
  );
}

export default App;

