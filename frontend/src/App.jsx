import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { traducciones } from './constants/translations';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Boveda from './pages/Boveda';
import Catalogo from './pages/Catalogo';
import MovieDetail from './pages/MovieDetail';
import Comunidad from './pages/Comunidad';

function App() {
  const [idioma, setIdioma] = useState('es');
  const t = traducciones[idioma];

  return (
    <Router>
      <div className="min-h-screen bg-cine-bg font-sans selection:bg-cine-accent selection:text-white">
        {/* El Navbar está afuera de Routes, así se muestra en TODAS las páginas */}
        <Navbar idioma={idioma} setIdioma={setIdioma} t={t} />

        <Routes>
          <Route path="/" element={<Landing idioma={idioma} t={t} />} />
          <Route path="/login" element={<Login t={t} />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/boveda" element={<Boveda />} />
          <Route path="/catalogo" element={<Catalogo idioma={idioma} t={t} />} />
          <Route path="/boveda/:id_amigo" element={<Boveda idioma={idioma} />} />
          <Route path="/comunidad" element={<Comunidad />} />
          
          {/* NUEVA RUTA DINÁMICA PARA EL DETALLE DE LA PELÍCULA */}
          <Route path="/pelicula/:id" element={<MovieDetail idioma={idioma} t={t} />} />
        </Routes>

        {/* El Footer también se muestra siempre al final */}
        <footer className="py-12 text-center bg-cine-bg border-t border-white/10 text-xs font-bold tracking-[0.3em] uppercase text-gray-600">
          CineSynth Archive // Proyecto Final de Facultad // Datos vía TMDb
        </footer>
      </div>
    </Router>
  );
}

export default App;