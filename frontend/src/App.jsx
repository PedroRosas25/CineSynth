/* archivo principal de CineSynth. 
  aca arme el esqueleto de toda la aplicación. Configuro el enrutador para navegar entre las distintas pantallas
  renderizo la animación del cassette VHS que carga al principio y meto el administrador de scroll 
  para que no se me mueva la posición cuando recargo la pagina o toco volver
*/

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Boveda from './pages/Boveda';
import Catalogo from './pages/Catalogo';
import MovieDetail from './pages/MovieDetail';
import Comunidad from './pages/Comunidad';

// pantalla de carga inicial con diseño de VHS
function CinematicLoader({ isVisible }) {
  // estado para controlar cuando sacar el componente del DOM
  const [render, setRender] = useState(isVisible);

  // efecto para darle tiempo a la transición de opacidad antes de borrarlo definitivamente
  useEffect(() => {
    if (isVisible) setRender(true);
    else setTimeout(() => setRender(false), 700);
  }, [isVisible]);

  if (!render) return null;

  return (
    // contenedor principal de la pantalla de carga
    <div 
      className={`fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-700 pointer-events-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* animacion de la cinta de VHS */}
      <style>
        {`
          @keyframes slideTape {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0%); }
          }
        `}
      </style>
      
      {/* estructura principal del VHS */}
      <div className="relative w-72 md:w-80 h-44 md:h-48 bg-[#151515] rounded-xl border-t-[12px] border-x-[4px] border-[#0a0a0c] shadow-2xl flex flex-col justify-between p-4 mb-10 overflow-hidden">
        
        {/* etiqueta del VHS */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-12 bg-[#e0e0e0] rounded-b-md flex items-center justify-between px-4 border-b-4 border-cine-accent shadow-sm z-10">
          <span className="text-black font-black text-[11px] tracking-widest uppercase">CineSynth</span>
          <span className="text-red-600 font-black text-xs font-mono border border-red-600 px-1.5 rounded animate-pulse">REC</span>
        </div>

        {/* los puntos en la parte de arriba del VHS */}
        <div className="w-full flex justify-between px-2 pt-1">
           <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0c] shadow-inner"></div>
           <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0c] shadow-inner"></div>
        </div>

        {/* sector del medio del VHS */}
        <div className="flex items-center justify-center gap-6 mt-4">
          
          {/* carrete izquierdo */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-black/90 rounded-full border-2 border-white/10 flex items-center justify-center relative shadow-inner overflow-hidden">
            <div className="w-16 h-16 rounded-full border-[6px] border-gray-700 animate-[spin_1.5s_linear_infinite]">
               <div className="absolute w-full h-1.5 bg-gray-300 top-1/2 -translate-y-1/2"></div>
               <div className="absolute w-1.5 h-full bg-gray-300 left-1/2 -translate-x-1/2"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-black rounded-full"></div>
               </div>
            </div>
          </div>

          {/* Plástico separador del medio */}
          <div className="w-6 h-10 bg-black/60 rounded-sm"></div>

          {/* carrete derecho */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-black/90 rounded-full border-2 border-white/10 flex items-center justify-center relative shadow-inner overflow-hidden">
            <div className="w-16 h-16 rounded-full border-[6px] border-gray-700 animate-[spin_1.5s_linear_infinite]">
               <div className="absolute w-full h-1.5 bg-gray-300 top-1/2 -translate-y-1/2"></div>
               <div className="absolute w-1.5 h-full bg-gray-300 left-1/2 -translate-x-1/2"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-black rounded-full"></div>
               </div>
            </div>
          </div>
        </div>

        {/* espacio donde va la barra de carga */}
        <div className="absolute bottom-0 left-0 w-full h-5 bg-black border-t-2 border-[#1a1a1a] overflow-hidden">
          {/* barra de carga */}
          <div 
            className="w-full h-full bg-gradient-to-r from-red-900 via-cine-accent to-[#ff4d4d] relative"
            style={{ animation: 'slideTape 1.75s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
          >
          </div>
        </div>
      </div>
      
      {/* texto abajo del VHS */}
      <h2 className="text-2xl font-black text-white tracking-[0.3em] uppercase mb-2 drop-shadow-lg">
        Cine<span className="text-cine-accent">Synth</span>
      </h2>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
        Leyendo VHS . . .
      </p>
    </div>
  );
}

// manager de scroll
function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();

  // apagar scrool automatico
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // guardar posicio en tiempo real en el sessionStorage
  useEffect(() => {
    const saveScroll = () => sessionStorage.setItem(`scroll-${location.pathname}`, window.scrollY);
    window.addEventListener('scroll', saveScroll);
    window.addEventListener('beforeunload', saveScroll); 
    return () => {
      window.removeEventListener('scroll', saveScroll);
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, [location.pathname]);

  // logica para restaurar la posicion cuando navego o toco volver o refresco
  useEffect(() => {
    // si es una pagina nueva el scroll es 0
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
      return;
    }

    // si se toca volver o F5 te deja donde estabas esperando a que se traiga todo de la API
    const savedPosition = sessionStorage.getItem(`scroll-${location.pathname}`);
    if (savedPosition) {
      const targetPosition = parseInt(savedPosition, 10);
      let intentos = 0;
      
      const intervalo = setInterval(() => {
        const alturaActual = document.documentElement.scrollHeight;
        if (alturaActual >= targetPosition || intentos > 15) {
          window.scrollTo(0, targetPosition);
        }
        intentos++;
        if (intentos >= 25) clearInterval(intervalo);
      }, 100);

      // si se scrollea de forma normal se cancela el auto scroll
      const liberarAncla = () => clearInterval(intervalo);
      window.addEventListener('wheel', liberarAncla, { once: true });
      window.addEventListener('touchstart', liberarAncla, { once: true });

      return () => {
        clearInterval(intervalo);
        window.removeEventListener('wheel', liberarAncla);
        window.removeEventListener('touchstart', liberarAncla);
      };
    }
  }, [location.pathname, navType]);

  return null;
}

// componente principal de la app
function App() {
  // estado para manejar cuando mostrar la pantalla de carga
  const [isBooting, setIsBooting] = useState(true);

  // apagar la carga inicial despues de 1.8s 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    // envuelvo todo en el Router para manejar la navegación general
    <Router>
      {/* ejecuto la pantalla de carga y el gestor de scroll por detrás */}
      <CinematicLoader isVisible={isBooting} />
      <ScrollManager />
      
      {/* contenedor general con el fondo de la app y el color de selección de texto */}
      <div className="min-h-screen bg-cine-bg font-sans selection:bg-cine-accent selection:text-white">
        
        {/* barra de navegación principal */}
        <Navbar />

        {/* cargado de componentes segun la URL */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/boveda" element={<Boveda />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/boveda/:id_amigo" element={<Boveda />} />
          <Route path="/pelicula/:id" element={<MovieDetail />} />
          <Route path="/comunidad" element={<Comunidad />} />
        </Routes>

        {/* pie de pagina */}
        <footer className="py-12 text-center bg-cine-bg border-t border-white/10 text-xs font-bold tracking-[0.3em] uppercase text-gray-600">
          CineSynth Archive // Proyecto Final de Facultad // Datos vía TMDb
        </footer>
      </div>
    </Router>
  );
}

export default App;