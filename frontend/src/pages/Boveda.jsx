import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

export default function Boveda({ idioma }) {
  // Extraemos el ID del amigo de la URL (en caso de que estemos visitando un perfil)
  const { id_amigo } = useParams();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  
  // --- NUEVO: Estado para guardar el nombre del amigo ---
  const [nombreAmigo, setNombreAmigo] = useState('');
  
  const user = JSON.parse(localStorage.getItem('usuario'));
  
  // Si hay id_amigo en la URL, buscamos esa bóveda. Si no, buscamos la del usuario logueado.
  const targetId = id_amigo || user?.id; 
  const esBovedaAjena = !!id_amigo;

  useEffect(() => {
    const fetchBoveda = async () => {
      if (!targetId) return;
      
      try {
        // --- NUEVO: Si estamos viendo la bóveda de un amigo, buscamos su nombre ---
        if (esBovedaAjena) {
          const resUser = await fetch(`http://127.0.0.1:8000/api/usuarios/${targetId}`);
          if (resUser.ok) {
            const dataUser = await resUser.json();
            setNombreAmigo(dataUser.nombre);
          }
        }

        // Le pedimos al backend la bóveda (nuestra o del amigo)
        const res = await fetch(`http://127.0.0.1:8000/api/boveda/${targetId}`);
        const data = await res.json();

        // Traemos la info de las películas desde TMDb
        const moviePromises = data.map(async (item) => {
          const movieRes = await fetch(
            `${BASE_URL}/movie/${item.id_pelicula}?api_key=${API_KEY}&language=${idioma === 'es' ? 'es-AR' : 'en-US'}`
          );
          const movieData = await movieRes.json();
          return { ...movieData, dbInfo: item }; 
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
  }, [idioma, targetId, esBovedaAjena]);

  // Si el usuario no está logueado y no está visitando una bóveda ajena
  if (!user && !esBovedaAjena) {
    return (
      <div className="min-h-screen bg-cine-bg flex flex-col items-center justify-center text-white p-8">
        <h2 className="text-3xl font-black mb-4 uppercase italic">Acceso Denegado</h2>
        <p className="text-gray-400 mb-8">Debes iniciar sesión para ver tu archivo personal.</p>
        <Link to="/login" className="bg-cine-accent px-8 py-3 rounded-full font-bold uppercase tracking-widest">Ir al Login</Link>
      </div>
    );
  }

  // Filtrado de las películas según la pestaña seleccionada
  const pelisMostradas = items.filter(peli => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendientes') return !peli.dbInfo.visto;
    if (filtro === 'vistas') return peli.dbInfo.visto && !peli.dbInfo.puntuacion;
    if (filtro === 'calificadas') return peli.dbInfo.puntuacion !== null;
    return true;
  });

  return (
    <div className="min-h-screen bg-cine-bg pt-32 px-8 lg:px-24 pb-20">
      
      {/* ENCABEZADO DE LA BÓVEDA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h4 className="text-cine-accent font-black uppercase tracking-[0.4em] text-xs mb-2">Terminal de Usuario</h4>
          <h1 className="text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tighter">
            {/* --- NUEVO: Título dinámico --- */}
            {esBovedaAjena ? `Bóveda de ${nombreAmigo}` : "Mi Bóveda"}
          </h1>
        </div>
        <div className="text-right">
          <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block">Registros totales</span>
          <span className="text-3xl font-black text-white italic">{items.length}</span>
        </div>
      </div>

      {/* PESTAÑAS (TABS) PARA FILTRAR */}
      {!loading && items.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-10">
          <button 
            onClick={() => setFiltro('todas')}
            className={`px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs transition-colors ${filtro === 'todas' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFiltro('pendientes')}
            className={`px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs transition-colors ${filtro === 'pendientes' ? 'bg-cine-accent text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => setFiltro('vistas')}
            className={`px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs transition-colors ${filtro === 'vistas' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Vistas
          </button>
          <button 
            onClick={() => setFiltro('calificadas')}
            className={`px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs transition-colors ${filtro === 'calificadas' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Calificadas
          </button>
        </div>
      )}

      {/* RENDERIZADO DE PELÍCULAS */}
      {loading ? (
        <div className="text-cine-accent animate-pulse font-black uppercase tracking-widest">Sincronizando archivo...</div>
      ) : pelisMostradas.length === 0 ? (
        <div className="bg-cine-panel border border-white/5 p-12 rounded-3xl text-center">
          <p className="text-gray-500 italic mb-6 text-lg">No hay películas en esta categoría.</p>
          {filtro === 'todas' && !esBovedaAjena && (
             <Link to="/catalogo" className="text-cine-accent font-black uppercase tracking-widest hover:underline">Ir al catálogo →</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {pelisMostradas.map((peli) => (
            <Link 
              to={`/pelicula/${peli.id}`} 
              key={peli.id}
              className="group relative bg-cine-panel rounded-2xl overflow-hidden border border-white/5 transition-all hover:scale-[1.03] hover:border-cine-accent/50 shadow-xl"
            >
              {/* INSIGNIA DE NOTA PERSONAL */}
              {peli.dbInfo.puntuacion && (
                <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-sm text-white text-xs font-black px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-lg">
                  <span className="text-cine-accent">★</span> {peli.dbInfo.puntuacion}
                </div>
              )}

              {/* INSIGNIA DE VISTA */}
              {peli.dbInfo.visto && !peli.dbInfo.puntuacion && (
                <div className="absolute top-2 right-2 z-10 bg-green-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-full uppercase shadow-lg">
                  Vista
                </div>
              )}

              <div className="aspect-[2/3] overflow-hidden bg-black/50">
                <img 
                  src={`${IMG_URL}${peli.poster_path}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={peli.title} 
                />
              </div>

              <div className="p-4 relative z-20 bg-cine-panel">
                <h3 className="text-white font-black uppercase italic text-sm truncate group-hover:text-cine-accent transition-colors">
                  {peli.title}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-500 text-[10px] font-bold uppercase">{peli.release_date?.split('-')[0]}</span>
                  <span className="text-gray-600 text-[10px] font-black tracking-widest">TMDb: {peli.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}