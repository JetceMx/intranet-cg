import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/home';
import Docs from './Pages/documentos';

function App() {
  return (
    <div>
      
      {/* 1 - Codigo */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/documentos' element={<Docs />} />
      </Routes>

    </div>
  );
}

export default App;

