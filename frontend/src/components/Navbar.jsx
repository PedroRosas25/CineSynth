import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Agregamos useNavigate

export default function Navbar({ idioma, setIdioma, t }) {
  const navigate = useNavigate();
  
  // Leemos el usuario del localStorage si existe
  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const handleLogout = () => {
    localStorage.removeItem('usuario'); // Borramos la sesión
    navigate('/'); // Mandamos al usuario a la landing
    window.location.reload(); // Recargamos para limpiar estados globales
  };

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 lg:px-24 py-6 bg-gradient-to-b from-cine-bg/90 to-transparent backdrop-blur-md">
      <Link to="/" className="text-3xl font-black text-white tracking-tighter hover:scale-105 transition-transform">
        Cine<span className="text-cine-accent">Synth</span>.
      </Link>

      <div className="hidden md:flex space-x-8 text-xs font-bold tracking-[0.2em] uppercase items-center drop-shadow-md">
        <Link to="/" className="text-white hover:text-cine-accent transition-colors">{t.nav.char}</Link>
        <Link to="/catalogo" className="text-white hover:text-cine-accent transition-colors">{t.nav.cat}</Link>
        
        {/* Solo mostramos el acceso a la Bóveda si está logueado */}
        {usuario && (
          <Link to="/boveda" className="text-white hover:text-cine-accent transition-colors">Mi Bóveda</Link>
        )}

        {usuario && (
          // En tu Navbar.jsx dentro del menú de navegación:
          <Link to="/comunidad" className="text-gray-400 hover:text-white font-bold uppercase text-xs tracking-widest transition-colors">Comunidad</Link>
        )}
        
        <div className="flex bg-black/50 border border-white/20 rounded-full overflow-hidden ml-4">
          <button onClick={() => setIdioma('es')} className={`px-4 py-2 transition-colors ${idioma === 'es' ? 'bg-cine-accent text-white' : 'text-gray-400 hover:text-white'}`}>ESP</button>
          <button onClick={() => setIdioma('en')} className={`px-4 py-2 transition-colors ${idioma === 'en' ? 'bg-cine-accent text-white' : 'text-gray-400 hover:text-white'}`}>ENG</button>
        </div>

        {/* LÓGICA DINÁMICA: ¿Usuario o Login? */}
        {usuario ? (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 font-black tracking-widest">Archivo de</span>
              <span className="text-white font-black italic">{usuario.nombre}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-full hover:bg-cine-accent transition-all uppercase text-[10px]"
            >
              Salir
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-cine-accent text-white px-6 py-2 rounded-full hover:bg-cine-accent-hover transition-all shadow-lg shadow-cine-accent/20">
            {t.nav.login}
          </Link>
        )}
      </div>
    </nav>
  );
}