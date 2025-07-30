import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/home';

function App() {
  return (
    <div>
      
      {/* 1 - Codigo */}
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>

    </div>
  );
}

export default App;

