/*componente gigante con la logica del catalogo
  aca muestro un carrusel con las tendencias de la semana meti un buscador avanzado con filtros 
  por decada genero y orden y ademas agregue una seccion especial abajo de todo que elige 
  a un director al azar de una lista y muestra sus mejores peliculas
*/

// traigo React los hooks que necesito y el componente de las tarjetas
import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';

// configuro las credenciales y la ruta base de la API de TMDb
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// me guardo una lista fija con los IDs de mis directores favoritos en TMDb
const DIRECTORES = [
  { id: 525, nombre: "Christopher Nolan" },
  { id: 138, nombre: "Quentin Tarantino" },
  { id: 1032, nombre: "Martin Scorsese" }, 
  { id: 7467, nombre: "David Fincher" },
  { id: 488, nombre: "Steven Spielberg" },
  { id: 2710, nombre: "James Cameron" },
  { id: 578, nombre: "Ridley Scott" },
  { id: 1776, nombre: "Francis Ford Coppola" },
  { id: 137427, nombre: "Denis Villenueve" },
  { id: 5655, nombre: "Wes Anderson" },
  { id: 510, nombre: "Tim Burton" },
  { id: 1, nombre: "George Lucas" },
  { id: 108, nombre: "Peter Jackson" },
  { id: 1145520, nombre: "Ari Aster" }
];

export default function Catalogo() {
  // armo todos los estados que me van a hacer falta para guardar la data
  const [tendencias, setTendencias] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [directorData, setDirectorData] = useState({ info: null, peliculas: [] });
  const [loading, setLoading] = useState(true);

  // estados para controlar lo que el usuario escribe o selecciona en el buscador y los filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [filtroOrden, setFiltroOrden] = useState('popularity.desc');

  // estado para saber en que posicion de pagina esta el carrusel superior
  const [carruselIndex, setCarruselIndex] = useState(0);

  // funcion especial que arme para hacer peticiones a la API dos veces al mismo tiempo
  // traigo la version en español para tener las sinopsis y la version en ingles para tener los posters y titulos originales
  const fetchMixto = async (urlBase) => {
    const [resTextos, resImagenes] = await Promise.all([
      fetch(`${urlBase}&language=es-AR`),
      fetch(`${urlBase}&language=en-US`)
    ]);
    const dataTextos = await resTextos.json();
    const dataImagenes = await resImagenes.json();

    // recorro los resultados en español y los piso con los titulos e imagenes de la version en ingles
    dataTextos.results = dataTextos.results.map(peliES => {
      const peliEN = dataImagenes.results.find(p => p.id === peliES.id);
      return {
        ...peliES,
        title: peliEN ? peliEN.title : peliES.title,
        original_title: peliEN ? peliEN.original_title : peliES.original_title,
        poster_path: peliEN ? peliEN.poster_path : peliES.poster_path,
        backdrop_path: peliEN ? peliEN.backdrop_path : peliES.backdrop_path
      };
    });
    return dataTextos;
  };

  // efecto que arranca apenas entras a la pagina para cargar el carrusel y el director
  useEffect(() => {
    const fetchIniciales = async () => {
      try {
        // traigo las dos primeras paginas de tendencias mundiales usando mi funcion mixta
        const [dataTendencias1, dataTendencias2] = await Promise.all([
          fetchMixto(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=1`),
          fetchMixto(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=2`)
        ]);
        
        // filtro todo eso para quedarme solo con peliculas originarias en ingles que tengan poster y agarro 30 justas
        const filtradas = [...dataTendencias1.results, ...dataTendencias2.results]
          .filter(p => p.original_language === 'en' && p.poster_path)
          .slice(0, 30);
        
        setTendencias(filtradas);

        // aca elijo un director al azar de mi lista usando math random
        const directorElegido = DIRECTORES[Math.floor(Math.random() * DIRECTORES.length)];
        
        // funcion local para buscar los creditos de ese director en la API
        const fetchDirectorPelis = async (lang) => {
          const res = await fetch(`${BASE_URL}/person/${directorElegido.id}/movie_credits?api_key=${API_KEY}&language=${lang}`);
          const data = await res.json();
          // me quedo solo con los trabajos donde participo especificamente como director
          return data.crew ? data.crew.filter(p => p.job === 'Director') : [];
        };

        // hago lo mismo de traer español e ingles para mezclar los datos del director
        const [pelisES, pelisEN] = await Promise.all([
          fetchDirectorPelis('es-AR'),
          fetchDirectorPelis('en-US')
        ]);
        
        const pelisDirigidas = pelisES.map(peliES => {
          const peliEN = pelisEN.find(p => p.id === peliES.id);
          return {
            ...peliES,
            title: peliEN ? peliEN.title : peliES.title,
            original_title: peliEN ? peliEN.original_title : peliES.original_title,
            poster_path: peliEN ? peliEN.poster_path : peliES.poster_path,
            backdrop_path: peliEN ? peliEN.backdrop_path : peliES.backdrop_path
          };
        });

        // ordeno las peliculas del director por cantidad de votos para mostrar solo las 4 mejores y mas conocidas
        const mejoresDelDirector = pelisDirigidas
          .sort((a, b) => b.vote_count - a.vote_count)
          .filter(p => p.poster_path)
          .slice(0, 4);

        // guardo la data del director y sus peliculas en el estado
        setDirectorData({
          info: directorElegido,
          peliculas: mejoresDelDirector
        });

      } catch (error) {
        console.error("Error cargando iniciales:", error);
      }
    };
    fetchIniciales();
  }, []); 

  // efecto que escucha cualquier cambio en el buscador o los filtros para actualizar la grilla
  useEffect(() => {
    const fetchResultados = async () => {
      setLoading(true);
      try {
        let urlBase = '';
        
        // si el usuario escribio algo le pego al endpoint de busqueda directa
        if (busqueda !== '') {
          urlBase = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${busqueda}`;
        } else {
          // si no escribio nada armo una URL super compleja juntando todos los filtros
          let extraQuery = '';
          const hoy = new Date().toISOString().split('T')[0];
          
          // logica para calcular las decadas restando y sumando años a las fechas limite
          if (filtroAnio) {
            const decada = parseInt(filtroAnio);
            let prefijo = decada < 30 ? '20' : '19';
            const anioInicio = `${prefijo}${filtroAnio}-01-01`;
            const anioFin = `${prefijo}${filtroAnio.substring(0,1)}9-12-31`;
            extraQuery += `&primary_release_date.gte=${anioInicio}&primary_release_date.lte=${anioFin}`;
          }
          
          if (filtroGenero) extraQuery += `&with_genres=${filtroGenero}`;

          // logica para garantizar que los resultados tengan un minimo de calidad
          if (filtroOrden === 'primary_release_date.desc') {
            extraQuery += `&primary_release_date.lte=${hoy}&vote_count.gte=50`;
          } else if (filtroOrden.includes('vote_average')) {
            extraQuery += `&vote_count.gte=3000`; 
          }

          // le pego a discover con todo el query gigante armado y fuerzo que el idioma original sea ingles
          urlBase = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${filtroOrden}${extraQuery}&with_original_language=en`;
        }

        const data = await fetchMixto(urlBase);
        // filtro por las dudas que no vengan peliculas sin poster o sin resumen
        setResultados(data.results.filter(p => p.poster_path && p.overview));
        setLoading(false);
      } catch (error) {
        console.error("Error en busqueda:", error);
      }
    };

    // le meto un pequeño retraso de medio segundo para no saturar a la API mientras el usuario tipea rapido
    const timeoutId = setTimeout(() => { fetchResultados(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [busqueda, filtroAnio, filtroGenero, filtroOrden]);

  // funciones para avanzar o retroceder el carrusel de a 3 elementos controlando que no se pase de los limites
  const nextSlide = () => setCarruselIndex((prev) => (prev + 3 >= tendencias.length ? 0 : prev + 3));
  const prevSlide = () => setCarruselIndex((prev) => (prev - 3 < 0 ? Math.max(0, tendencias.length - 3) : prev - 3));

  return (
    <div className="min-h-screen bg-cine-bg pt-32 pb-24 overflow-hidden">
      
      {/* SECCION 1: carrusel de peliculas populares con botones laterales */}
      <section className="px-8 lg:px-24 mb-20 max-w-7xl mx-auto">
        <div className="mb-8 border-b border-white/10 pb-4">
          <h2 className="text-3xl font-black text-white uppercase italic">Populares de la Semana</h2>
          <span className="text-cine-accent font-bold uppercase tracking-widest text-xs">Top Global</span>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-8">
          {/* boton para retroceder en el carrusel */}
          <button onClick={prevSlide} className="flex-shrink-0 w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-black border border-gray-600 hover:border-cine-accent hover:bg-cine-accent/10 flex items-center justify-center text-white transition-all shadow-xl z-20">
            <svg className="w-5 h-5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          {/* contenedor con overflow hidden donde deslizo la pista de tarjetas usando translateX */}
          <div className="flex-grow overflow-hidden px-1">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${carruselIndex * (100 / 3)}%)` }}
            >
              {tendencias.map(peli => (
                <div key={peli.id} className="w-1/3 flex-shrink-0 px-3">
                  <MovieCard peli={peli} />
                </div>
              ))}
            </div>
          </div>

          {/* boton para avanzar en el carrusel */}
          <button onClick={nextSlide} className="flex-shrink-0 w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-black border border-gray-600 hover:border-cine-accent hover:bg-cine-accent/10 flex items-center justify-center text-white transition-all shadow-xl z-20">
            <svg className="w-5 h-5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </section>

      {/* SECCION 2: panel de busqueda y filtros */}
      <section className="px-8 lg:px-24 mb-16 relative z-20 max-w-7xl mx-auto">
        <div className="bg-cine-panel border border-white/10 p-4 lg:p-6 rounded-3xl shadow-2xl flex flex-col lg:flex-row gap-4 items-center">
          
          {/* input de busqueda libre por titulo */}
          <div className="w-full lg:w-1/3 relative group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cine-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Buscar pelicula..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-black border border-gray-800 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cine-accent/50 transition-all font-medium"
            />
          </div>

          {/* contenedor de filtros los deshabilito si el usuario escribio algo en el input para que no choquen las busquedas */}
          <div className="w-full lg:w-2/3 flex flex-wrap gap-4">
            <div className="relative flex-1 group min-w-[150px]">
              <select disabled={busqueda !== ''} value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-300 pl-4 pr-10 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cine-accent/50 appearance-none disabled:opacity-50 font-medium cursor-pointer">
                <option value="">Cualquier Decada</option>
                <option value="20">Años 2020s</option>
                <option value="10">Años 2010s</option>
                <option value="00">Años 2000s</option>
                <option value="90">Años 90s</option>
                <option value="80">Años 80s</option>
                <option value="70">Años 70s</option>
                <option value="60">Años 60s</option>
                <option value="50">Años 50s</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none group-focus-within:text-cine-accent group-focus-within:rotate-180 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            <div className="relative flex-1 group min-w-[150px]">
              <select disabled={busqueda !== ''} value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-300 pl-4 pr-10 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cine-accent/50 appearance-none disabled:opacity-50 font-medium cursor-pointer">
                <option value="">Todos los Generos</option>
                <option value="28">Accion</option>
                <option value="12">Aventura</option>
                <option value="878">Ciencia Ficcion</option>
                <option value="35">Comedia</option>
                <option value="18">Drama</option>
                <option value="27">Terror</option>
                <option value="53">Suspense</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none group-focus-within:text-cine-accent group-focus-within:rotate-180 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            <div className="relative flex-1 group min-w-[150px]">
              <select disabled={busqueda !== ''} value={filtroOrden} onChange={(e) => setFiltroOrden(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-300 pl-4 pr-10 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cine-accent/50 appearance-none disabled:opacity-50 font-medium cursor-pointer">
                <option value="popularity.desc">Mas Populares</option>
                <option value="vote_average.desc">Mejor Valoradas (Rating ↑)</option>
                <option value="vote_average.asc">Peor Valoradas (Rating ↓)</option>
                <option value="primary_release_date.desc">Estrenos Recientes</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none group-focus-within:text-cine-accent group-focus-within:rotate-180 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </section>

      {/* SECCION 3: grilla con los resultados de la busqueda o los filtros */}
      <section className="px-8 lg:px-24 mb-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-cine-accent font-black tracking-widest uppercase animate-pulse">Buscando en los archivos...</span>
          </div>
        ) : resultados.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {resultados.map(peli => (
              <MovieCard key={peli.id} peli={peli} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl">
            <p className="text-gray-500 font-bold uppercase tracking-widest">No se encontraron resultados en la boveda.</p>
          </div>
        )}
      </section>

      {/* SECCION 4: foco del director aleatorio de la lista (solo se renderiza si logre cargar la info al principio) */}
      {directorData.info && (
        <section className="px-8 lg:px-24 py-24 bg-[#050505] border-y border-cine-accent/20 relative overflow-hidden">
          
          {/* brillo rojo difuminado de fondo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-cine-accent/5 blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-cine-accent/30 pb-6">
              <div>
                <span className="bg-cine-accent text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg shadow-cine-accent/30">
                  Foco del Director
                </span>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
                  {directorData.info.nombre}
                </h2>
                <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs max-w-xl">
                  Explora la filmografia de los grandes maestros del cine
                </p>
              </div>
            </div>

            {/* muestro las 4 mejores peliculas de este director */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {directorData.peliculas.map((peli) => (
                <MovieCard key={peli.id} peli={peli} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}