/*componente que arme para mostrar la boveda personal de peliculas
  aca cargo las peliculas guardadas del usuario logueado o las de un amigo si entre a su perfil
  primero ne comunico con el backend para saber que peliculas tiene guardadas esa persona
  y despues cruzo esos datos con la API de TMDb para traerme los posters y la info completa
  tambien le arme un sistema de pestañas para filtrar rapido entre lo que falta ver lo que ya se vio y lo calificado
*/

// traigo React los estados los efectos y las herramientas de enrutamiento para leer la URL
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

// configuro las constantes de la API de TMDb usando mis variables de entorno
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

export default function Boveda({ idioma }) {
  // extraigo el id del amigo directamente de la URL por si estoy visitando el perfil de otra persona
  const { id_amigo } = useParams();
  
  // armo mis estados para guardar la lista de peliculas el estado de carga y el filtro actual
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  
  // estado extra para guardar el nombre del amigo si estoy en una boveda ajena
  const [nombreAmigo, setNombreAmigo] = useState('');
  
  // busco mis propios datos de usuario en el almacenamiento local del navegador
  const user = JSON.parse(localStorage.getItem('usuario'));
  
  // defino de quien es la boveda que voy a buscar: si hay un id en la URL uso ese sino uso el mio
  // tambien me armo una bandera booleana (esBovedaAjena) para saber rapido si estoy en la boveda de un amigo
  const targetId = id_amigo || user?.id; 
  const esBovedaAjena = !!id_amigo;

  // efecto principal que se dispara cuando carga el componente para ir a buscar toda la data
  useEffect(() => {
    const fetchBoveda = async () => {
      // si no hay un objetivo para buscar (no estoy logueado y no busco a nadie) corto aca
      if (!targetId) return;
      
      try {
        // si resulta que estoy en la boveda de un amigo primero le pido al backend su nombre para ponerlo en el titulo
        if (esBovedaAjena) {
          const resUser = await fetch(`http://127.0.0.1:8000/api/usuarios/${targetId}`);
          if (resUser.ok) {
            const dataUser = await resUser.json();
            setNombreAmigo(dataUser.nombre);
          }
        }

        // le pido al backend la lista de peliculas guardadas de esta persona (solo me trae IDs y mis datos locales)
        const res = await fetch(`http://127.0.0.1:8000/api/boveda/${targetId}`);
        const data = await res.json();

        // por cada pelicula que me devolvio el backend le hago un pedido a TMDb para traer la info (poster, titulo original, etc)
        const moviePromises = data.map(async (item) => {
          const movieRes = await fetch(
            `${BASE_URL}/movie/${item.id_pelicula}?api_key=${API_KEY}&language=${idioma === 'es' ? 'es-AR' : 'en-US'}`
          );
          const movieData = await movieRes.json();
          // combino la info de TMDb con mi info local (si la vio la nota que le puso) en un solo objeto
          return { ...movieData, dbInfo: item }; 
        });

        // espero a que todas las peticiones a TMDb terminen al mismo tiempo y lo guardo en mi estado
        const fullMovies = await Promise.all(moviePromises);
        setItems(fullMovies);
      } catch (error) {
        console.error("Error cargando la boveda:", error);
      } finally {
        // pase lo que pase apago el estado de carga al terminar
        setLoading(false);
      }
    };

    fetchBoveda();
  }, [idioma, targetId, esBovedaAjena]);

  // pantalla de bloqueo: Si no inicie sesion y tampoco estoy tratando de ver la boveda de un amigo publico no lo dejo pasar
  if (!user && !esBovedaAjena) {
    return (
      <div className="min-h-screen bg-cine-bg flex flex-col items-center justify-center text-white p-8">
        <h2 className="text-3xl font-black mb-4 uppercase italic">Acceso Denegado</h2>
        <p className="text-gray-400 mb-8">Debes iniciar sesion para ver tu archivo personal.</p>
        <Link to="/login" className="bg-cine-accent px-8 py-3 rounded-full font-bold uppercase tracking-widest">Ir al Login</Link>
      </div>
    );
  }

  // logica para filtrar el array gigante de peliculas segun el boton que toco el usuario en las pestañas
  const pelisMostradas = items.filter(peli => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendientes') return !peli.dbInfo.visto;
    if (filtro === 'vistas') return peli.dbInfo.visto && !peli.dbInfo.puntuacion;
    if (filtro === 'calificadas') return peli.dbInfo.puntuacion !== null;
    return true;
  });

  return (
    // contenedor principal de la pagina con margenes para no pisar la barra de navegacion
    <div className="min-h-screen bg-cine-bg pt-32 px-8 lg:px-24 pb-20">
      
      {/* encabezado superior con el titulo y el contador de peliculas */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h4 className="text-cine-accent font-black uppercase tracking-[0.4em] text-xs mb-2">Terminal de Usuario</h4>
          <h1 className="text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tighter">
            {/* titulo dinamico inteligente: cambia dependiendo de si estoy en mi boveda o en la de otro */}
            {esBovedaAjena ? `Boveda de ${nombreAmigo}` : "Mi Boveda"}
          </h1>
        </div>
        <div className="text-right">
          <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block">Registros totales</span>
          <span className="text-3xl font-black text-white italic">{items.length}</span>
        </div>
      </div>

      {/* botones de pestañas para cambiar el filtro solo la muestro si ya cargo todo y hay peliculas */}
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

      {/* zona de renderizado condicional principal */}
      {loading ? (
        // pantalla de carga mientras cruzo los datos con TMDb
        <div className="text-cine-accent animate-pulse font-black uppercase tracking-widest">Sincronizando archivo...</div>
      ) : pelisMostradas.length === 0 ? (
        // estado vacio por si la categoria que toco no tiene peliculas
        <div className="bg-cine-panel border border-white/5 p-12 rounded-3xl text-center">
          <p className="text-gray-500 italic mb-6 text-lg">No hay peliculas en esta categoria.</p>
          {/* si es mi propia boveda y esta completamente vacia le ofrezco un acceso rapido al catalogo */}
          {filtro === 'todas' && !esBovedaAjena && (
             <Link to="/catalogo" className="text-cine-accent font-black uppercase tracking-widest hover:underline">Ir al catalogo →</Link>
          )}
        </div>
      ) : (
        // grilla responsiva que acomoda las tarjetas dependiendo de la pantalla
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {pelisMostradas.map((peli) => (
            // tarjeta de pelicula individual le pongo position relative para poder clavarle etiquetas en las esquinas
            <Link 
              to={`/pelicula/${peli.id}`} 
              key={peli.id}
              className="group relative bg-cine-panel rounded-2xl overflow-hidden border border-white/5 transition-all hover:scale-[1.03] hover:border-cine-accent/50 shadow-xl"
            >
              
              {/* etiqueta flotante de calificacion: aparece en la esquina superior izquierda solo si la pelicula tiene puntuacion */}
              {peli.dbInfo.puntuacion && (
                <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-sm text-white text-xs font-black px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-lg">
                  <span className="text-cine-accent">★</span> {peli.dbInfo.puntuacion}
                </div>
              )}

              {/* etiqueta flotante de vista: aparece en la esquina superior derecha verde solo si esta marcada como vista pero no tiene nota */}
              {peli.dbInfo.visto && !peli.dbInfo.puntuacion && (
                <div className="absolute top-2 right-2 z-10 bg-green-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-full uppercase shadow-lg">
                  Vista
                </div>
              )}

              {/* contenedor del poster con efecto zoom al pasar el mouse por arriba */}
              <div className="aspect-[2/3] overflow-hidden bg-black/50">
                <img 
                  src={`${IMG_URL}${peli.poster_path}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={peli.title} 
                />
              </div>

              {/* bloque inferior oscuro de la tarjeta con titulo y data extra */}
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