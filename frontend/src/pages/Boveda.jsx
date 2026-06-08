import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

export default function Boveda({ idioma }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    const fetchBoveda = async () => {
      if (!user) return;
      
      try {
        // 1. Traer los IDs desde nuestro backend
        const res = await fetch(`http://127.0.0.1:8000/api/boveda/${user.id}`);
        const data = await res.json();

        // 2. Por cada película en la bóveda, traer su info desde TMDb
        const moviePromises = data.map(async (item) => {
          const movieRes = await fetch(
            `${BASE_URL}/movie/${item.id_pelicula}?api_key=${API_KEY}&language=${idioma === 'es' ? 'es-AR' : 'en-US'}`
          );
          const movieData = await movieRes.json();
          return { ...movieData, dbInfo: item }; // Combinamos info de TMDb con la de nuestra DB
        });

        const fullMovies = await Promise.all(moviePromises);
        setItems(fullMovies);
      } catch (error) {
        console.error("Error cargando la bóveda:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoveda();
  }, [idioma]);

  if (!user) {
    return (
      <div className="min-h-screen bg-cine-bg flex flex-col items-center justify-center text-white p-8">
        <h2 className="text-3xl font-black mb-4 uppercase italic">Acceso Denegado</h2>
        <p className="text-gray-400 mb-8">Debes iniciar sesión para ver tu archivo personal.</p>
        <Link to="/login" className="bg-cine-accent px-8 py-3 rounded-full font-bold uppercase tracking-widest">Ir al Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cine-bg pt-32 px-8 lg:px-24 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h4 className="text-cine-accent font-black uppercase tracking-[0.4em] text-xs mb-2">Terminal de Usuario</h4>
          <h1 className="text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tighter">Mi Bóveda</h1>
        </div>
        <div className="text-right">
          <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block">Registros totales</span>
          <span className="text-3xl font-black text-white italic">{items.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-cine-accent animate-pulse font-black uppercase tracking-widest">Sincronizando archivo...</div>
      ) : items.length === 0 ? (
        <div className="bg-cine-panel border border-white/5 p-12 rounded-3xl text-center">
          <p className="text-gray-500 italic mb-6 text-lg">Tu bóveda está vacía. Empieza a explorar el catálogo para guardar tus películas favoritas.</p>
          <Link to="/catalogo" className="text-cine-accent font-black uppercase tracking-widest hover:underline">Ir al catálogo →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((peli) => (
            <Link 
              to={`/pelicula/${peli.id}`} 
              key={peli.id}
              className="group relative bg-cine-panel rounded-2xl overflow-hidden border border-white/5 transition-all hover:scale-[1.03] hover:border-cine-accent/50 shadow-xl"
            >
              {/* Badge de "Visto" (opcional para el futuro) */}
              {peli.dbInfo.visto && (
                <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">Vista</div>
              )}

              <div className="aspect-[2/3] overflow-hidden">
                <img 
                  src={`${IMG_URL}${peli.poster_path}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={peli.title} 
                />
              </div>

              <div className="p-4">
                <h3 className="text-white font-black uppercase italic text-sm truncate group-hover:text-cine-accent transition-colors">
                  {peli.title}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">{peli.release_date?.split('-')[0]}</span>
                  <span className="text-cine-accent text-[10px] font-black">★ {peli.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}