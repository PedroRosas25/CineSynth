/*componente de la barra de navegacion principal de la app
  aca mantuve el menu desplegable para celulares con bloqueo de scroll
*/

// traigo React el hook useState para el estado del menu y useEffect para detectar cuando se abre y bloquear el scroll
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// importo el logo de mi aplicacion desde la carpeta assets
import LogoCineSynth from '../assets/logosinfondogrande.png'; 

export default function Navbar() {
  const navigate = useNavigate();
  
  // creo el estado para el menu lateral arranca cerrado
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  // me fijo si el usuario ya inicio sesion leyendo el almacenamiento del navegador
  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  // aca armo el bloqueo del scroll de la pagina cuando abro el menu lateral
  useEffect(() => {
    if (menuAbierto) {
      // si el estado dice que el menu se abrio le corto el scroll al elemento principal del documento
      document.body.style.overflow = 'hidden';
    } else {
      // si se cierra le devuelvo el comportamiento automatico normal
      document.body.style.overflow = 'auto';
    }
    
    // esta funcion de limpieza se ejecuta por si el componente desaparece de golpe por alguna razon
    // asi me aseguro de no dejar la pagina trabada para siempre por accidente
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuAbierto]);

  // funcion para cerrar sesion limpiar todo y mandarte al inicio
  const handleLogout = () => {
    localStorage.removeItem('usuario'); 
    setMenuAbierto(false); // Cierro el panel por las dudas
    navigate('/'); 
    window.location.reload(); 
  };

  // funcion para que al tocar el logo haga un scroll suave hasta arriba
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuAbierto(false); // si esta en celu y toca el logo tambien cierro el panel
  };

  return (
    // envuelvo todo en un fragmento vacio porque tengo el menu normal y el panel lateral sueltos
    <>
      {/* barra superior fija*/}
      <nav className="fixed top-0 w-full z-40 flex justify-between items-center px-8 lg:px-24 py-6 bg-gradient-to-b from-cine-bg/90 to-transparent backdrop-blur-md">
        
        {/* bloque izquierdo: el logo y nombre de la app */}
        <Link 
          to="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-4 group"
        >
          <img 
            src={LogoCineSynth} 
            alt="CineSynth Logo" 
            className="w-10 h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
          />
          <span className="text-xl md:text-2xl font-bold text-white tracking-[0.2em] uppercase">
            Cine<span className="text-cine-accent">Synth</span>
          </span>
        </Link>

        {/* navegacion para Computadora */}
        <div className="hidden md:flex space-x-8 text-xs font-bold tracking-[0.2em] uppercase items-center drop-shadow-md">
          <Link to="/catalogo" className="text-white hover:text-cine-accent transition-colors">Catálogo</Link>
          
          {usuario && (
            <>
              <Link to="/boveda" className="text-white hover:text-cine-accent transition-colors">Bóveda</Link>
              <Link to="/comunidad" className="text-white hover:text-cine-accent transition-colors">Comunidad</Link>
            </>
          )}

          {usuario ? (
            <div className="flex items-center gap-6 ml-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Archivo de</span>
                <span className="text-white font-black italic normal-case tracking-normal text-sm">{usuario.nombre}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-full hover:bg-cine-accent transition-all uppercase text-[10px]"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-cine-accent text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors shadow-lg ml-4">
              Ingresar
            </Link>
          )}
        </div>

        {/* boton del menu desplegable de tres lineas */}
        <button 
          className="md:hidden text-white focus:outline-none z-40"
          onClick={() => setMenuAbierto(true)}
        >
          <svg className="w-8 h-8 hover:text-cine-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </nav>

      {/* overlay oscuro: este es el telon negro que oscurece el fondo de la pagina para que resalte el menu */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-500 md:hidden ${
          menuAbierto ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setMenuAbierto(false)}
      ></div>

      {/* panel lateral: detalle rojo
          sigue ocupando todo el alto y se esconde hacia la derecha cuando no lo uso */}
      <div 
        className={`fixed top-0 right-0 h-screen w-4/5 max-w-sm bg-gradient-to-b from-[#0a0a0c] to-[#050505] border-l-[3px] border-cine-accent shadow-[-10px_0_30px_rgba(220,38,38,0.15)] z-[60] transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col md:hidden ${
          menuAbierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end p-6 border-b border-white/5 relative">
          
          {/* brillo rojo difuminado del menu desplegable */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cine-accent/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <button 
            onClick={() => setMenuAbierto(false)}
            className="text-gray-400 hover:text-cine-accent transition-colors p-2 relative z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* lista de enlaces principal para navegar */}
        <div className="flex flex-col px-8 py-10 gap-8 relative z-10">
          <Link to="/catalogo" onClick={() => setMenuAbierto(false)} className="text-white text-xl font-black tracking-[0.2em] uppercase hover:text-cine-accent transition-colors w-fit">
            Catálogo
          </Link>
          
          {usuario && (
            <>
              <Link to="/boveda" onClick={() => setMenuAbierto(false)} className="text-white text-xl font-black tracking-[0.2em] uppercase hover:text-cine-accent transition-colors w-fit">
                Bóveda
              </Link>
              <Link to="/comunidad" onClick={() => setMenuAbierto(false)} className="text-white text-xl font-black tracking-[0.2em] uppercase hover:text-cine-accent transition-colors w-fit">
                Comunidad
              </Link>
            </>
          )}
        </div>

        {/* pie del menu lateral donde controlo la sesion del usuario */}
        <div className="mt-auto border-t border-white/5 p-8 bg-black/20 relative z-10">
          {usuario ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase mb-1">Archivo de</span>
                <span className="text-cine-accent font-black italic text-2xl truncate">{usuario.nombre}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full hover:bg-cine-accent transition-all uppercase text-xs font-bold tracking-widest shadow-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setMenuAbierto(false)} 
              className="block w-full text-center bg-cine-accent text-white px-8 py-4 rounded-full hover:bg-red-700 transition-colors shadow-lg uppercase text-xs font-bold tracking-widest"
            >
              Ingresar a mi Bóveda
            </Link>
          )}
        </div>
      </div>
    </>
  );
}