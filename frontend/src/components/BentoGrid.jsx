/*componente donde armo la bentogrid para mostrar las caracteristicas de la app en la pagina principal
  aca me conecto a la API de TMDb para traer fondos de peliculas populares en tiempo real y usarlos de fondo 
  en las tarjetas
*/

import React, { useState, useEffect } from 'react';

// seteo las constantes de la API usando mis variables de entorno
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/w1280';

export default function BentoGrid() {
  // aca creo un estado para guardar las rutas de los fondos de las peliculas
  const [fondos, setFondos] = useState([]);

  // uso este efecto para que busque los datos en la API apenas carge el componente
  useEffect(() => {
    const fetchFondos = async () => {
      try {
        // tiro fetch a la ruta de peliculas populares
        const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await res.json();
        
        // filtro los resultados para asegurarme de que la pelicula tenga imagen de fondo
        // agarro las primeras 4 y me guardo solo el texto de la ruta
        const backdrops = data.results
          .filter(peli => peli.backdrop_path)
          .slice(0, 4)
          .map(peli => peli.backdrop_path);
          
        // guardo esas 4 rutas en mi estado
        setFondos(backdrops);
      } catch (error) {
        console.error("Error cargando fondos para BentoGrid:", error);
      }
    };

    fetchFondos();
  }, []);

  return (
    // contenedor general de la seccion
    <section className="px-8 lg:px-24 py-32 relative z-20 bg-cine-bg border-b border-white/5">
      
      {/* encabezado de la seccion con el titulo y subtitulo */}
      <div className="mb-16 max-w-6xl mx-auto relative z-10 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic drop-shadow-xl">
          Diseñado para <span className="text-transparent bg-clip-text bg-gradient-to-r from-cine-accent to-red-600">Coleccionistas</span>
        </h2>
        <p className="text-gray-400 mt-4 max-w-2xl font-medium tracking-wide mx-auto md:mx-0">
          Tu archivo, tus reglas. Herramientas de precisión para verdaderos cinéfilos, con datos actualizados en tiempo real.
        </p>
      </div>
      
      {/* contenedor principal de la grilla que define cuantas columnas ocupan los elementos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
        
        {/* primera tarjeta: La Bitacora (es ancha ocupa 2 columnas en pantallas grandes) */}
        <div className="md:col-span-2 bg-black rounded-3xl border border-white/10 hover:border-cine-accent/50 transition-colors duration-500 relative overflow-hidden group shadow-2xl min-h-[280px] flex flex-col justify-end p-10">
          {/* si ya llego el primer fondo de la API pongo la imagen */}
          {fondos[0] && (
            <img 
              src={`${BACKDROP_URL}${fondos[0]}`} 
              alt="Fondo Película" 
              className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:grayscale-0 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
            />
          )}
          {/* le meto un degradado oscuro encima a la imagen para que el texto siempre se lea bien */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tight drop-shadow-md">La Bitácora Exacta.</h3>
            <p className="text-gray-300 max-w-md leading-relaxed text-sm md:text-base">Registrá fechas, puntuá con estrellas y dejá tu opinión crítica apenas terminan los créditos.</p>
          </div>
        </div>

        {/* segunda tarjeta: Buscador Local (ocupa 1 columna) */}
        <div className="md:col-span-1 bg-black rounded-3xl border border-white/10 hover:border-white/40 transition-colors duration-500 relative overflow-hidden group shadow-2xl min-h-[280px] flex flex-col justify-end p-8">
          {fondos[1] && (
            <img 
              src={`${BACKDROP_URL}${fondos[1]}`} 
              alt="Fondo Película" 
              className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:grayscale-0 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          
          <div className="relative z-10">
            {/* icono de lupa svg con contorno redondeado */}
            <div className="w-10 h-10 bg-cine-accent/20 rounded-xl flex items-center justify-center mb-4 border border-cine-accent/30 backdrop-blur-sm">
              <svg className="w-5 h-5 text-cine-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wider">Buscador Local</h3>
            <p className="text-gray-400 text-xs leading-relaxed">Integrado con TMDb para decirte en qué plataforma de tu país está disponible.</p>
          </div>
        </div>

        {/* tercera tarjeta: Watchlist (mismo tamaño y estructura que la segunda) */}
        <div className="md:col-span-1 bg-black rounded-3xl border border-white/10 hover:border-white/40 transition-colors duration-500 relative overflow-hidden group shadow-2xl min-h-[280px] flex flex-col justify-end p-8">
          {fondos[2] && (
            <img 
              src={`${BACKDROP_URL}${fondos[2]}`} 
              alt="Fondo Película" 
              className="absolute inset-0 w-full h-full object-cover opacity-100  group-hover:grayscale-0 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20 backdrop-blur-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wider">Watchlist</h3>
            <p className="text-gray-400 text-xs leading-relaxed">Guardá obras pendientes para no olvidar qué ver el fin de semana.</p>
          </div>
        </div>

        {/* cuarta tarjeta: Red Privada (ocupa 2 columnas) */}
        <div className="md:col-span-2 bg-black rounded-3xl border border-white/10 hover:border-cine-accent/50 transition-colors duration-500 relative overflow-hidden group shadow-2xl min-h-[280px] flex flex-col justify-end p-10">
          {fondos[3] && (
            <img 
              src={`${BACKDROP_URL}${fondos[3]}`} 
              alt="Fondo Película" 
              className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:grayscale-0 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 object-top"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tight drop-shadow-md">Red Privada Real</h3>
              <p className="text-gray-300 text-sm max-w-sm leading-relaxed">Sin algoritmos sociales. Vos decidís qué hacer público y a quién seguir. Un archivo libre de ruido exterior.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}