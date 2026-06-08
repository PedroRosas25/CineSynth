import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const DIRECTORES = [
  { id: 525, nombre: "Christopher Nolan" },
  { id: 138, nombre: "Quentin Tarantino" },
  { id: 1032, nombre: "Martin Scorsese" }, 
  { id: 7467, nombre: "David Fincher" },
  { id: 488, nombre: "Steven Spielberg" } 
];

export default function Catalogo({ t, idioma }) {
  const [tendencias, setTendencias] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [directorData, setDirectorData] = useState({ info: null, peliculas: [] });
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [filtroOrden, setFiltroOrden] = useState('popularity.desc');

  const [carruselIndex, setCarruselIndex] = useState(0);

  const fetchMixto = async (urlBase) => {
    if (idioma === 'en') {
      const res = await fetch(`${urlBase}&language=en-US`);
      return await res.json();
    } else {
      const [resTextos, resImagenes] = await Promise.all([
        fetch(`${urlBase}&language=es-AR`),
        fetch(`${urlBase}&language=en-US`)
      ]);
      const dataTextos = await resTextos.json();
      const dataImagenes = await resImagenes.json();

      dataTextos.results = dataTextos.results.map(peliES => {
        const peliEN = dataImagenes.results.find(p => p.id === peliES.id);
        return {
          ...peliES,
          poster_path: peliEN ? peliEN.poster_path : peliES.poster_path,
          backdrop_path: peliEN ? peliEN.backdrop_path : peliES.backdrop_path
        };
      });
      return dataTextos;
    }
  };

  useEffect(() => {
    const fetchIniciales = async () => {
      try {
        // 1. TENDENCIAS (Ahora pedimos Página 1 y Página 2 para tener 40 resultados brutos)
        const [dataTendencias1, dataTendencias2] = await Promise.all([
          fetchMixto(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=1`),
          fetchMixto(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=2`)
        ]);
        
        // Fusionamos, filtramos por calidad/inglés y nos quedamos con 30 exactas (múltiplo de 3)
        const filtradas = [...dataTendencias1.results, ...dataTendencias2.results]
          .filter(p => p.original_language === 'en' && p.poster_path)
          .slice(0, 30);
        
        setTendencias(filtradas);

        // 2. Foco del Director
        const directorElegido = DIRECTORES[Math.floor(Math.random() * DIRECTORES.length)];
        
        const fetchDirectorPelis = async (lang) => {
          const res = await fetch(`${BASE_URL}/person/${directorElegido.id}/movie_credits?api_key=${API_KEY}&language=${lang}`);
          const data = await res.json();
          return data.crew ? data.crew.filter(p => p.job === 'Director') : [];
        };

        let pelisDirigidas = [];
        if (idioma === 'en') {
          pelisDirigidas = await fetchDirectorPelis('en-US');
        } else {
          const [pelisES, pelisEN] = await Promise.all([
            fetchDirectorPelis('es-AR'),
            fetchDirectorPelis('en-US')
          ]);
          pelisDirigidas = pelisES.map(peliES => {
            const peliEN = pelisEN.find(p => p.id === peliES.id);
            return {
              ...peliES,
              poster_path: peliEN ? peliEN.poster_path : peliES.poster_path,
              backdrop_path: peliEN ? peliEN.backdrop_path : peliES.backdrop_path
            };
          });
        }

        const mejoresDelDirector = pelisDirigidas
          .sort((a, b) => b.vote_count - a.vote_count)
          .filter(p => p.poster_path)
          .slice(0, 4);

        setDirectorData({
          info: directorElegido,
          peliculas: mejoresDelDirector
        });

      } catch (error) {
        console.error("Error cargando iniciales:", error);
      }
    };
    fetchIniciales();
  }, [idioma]);

  useEffect(() => {
    const fetchResultados = async () => {
      setLoading(true);
      try {
        let urlBase = '';
        if (busqueda !== '') {
          urlBase = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${busqueda}`;
        } else {
          let extraQuery = '';
          const hoy = new Date().toISOString().split('T')[0];
          
          if (filtroAnio) {
            const decada = parseInt(filtroAnio);
            let prefijo = decada < 30 ? '20' : '19';
            const anioInicio = `${prefijo}${filtroAnio}-01-01`;
            const anioFin = `${prefijo}${filtroAnio.substring(0,1)}9-12-31`;
            extraQuery += `&primary_release_date.gte=${anioInicio}&primary_release_date.lte=${anioFin}`;
          }
          
          if (filtroGenero) extraQuery += `&with_genres=${filtroGenero}`;

          if (filtroOrden === 'primary_release_date.desc') {
            extraQuery += `&primary_release_date.lte=${hoy}&vote_count.gte=50`;
          } else if (filtroOrden.includes('vote_average')) {
            extraQuery += `&vote_count.gte=3000`; 
          }

          urlBase = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${filtroOrden}${extraQuery}&with_original_language=en`;
        }

        const data = await fetchMixto(urlBase);
        setResultados(data.results.filter(p => p.poster_path && p.overview));
        setLoading(false);
      } catch (error) {
        console.error("Error en búsqueda:", error);
      }
    };

    const timeoutId = setTimeout(() => { fetchResultados(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [busqueda, filtroAnio, filtroGenero, filtroOrden, idioma]);

  // Funciones del carrusel (Se deslizan 3 espacios. Si llega al final, hace un "rewind" rápido al principio)
  const nextSlide = () => setCarruselIndex((prev) => (prev + 3 >= tendencias.length ? 0 : prev + 3));
  const prevSlide = () => setCarruselIndex((prev) => (prev - 3 < 0 ? Math.max(0, tendencias.length - 3) : prev - 3));

  return (
    <div className="min-h-screen bg-cine-bg pt-32 pb-24 overflow-hidden">
      
      {/* 1. CARRUSEL ANIMADO CON CSS TRANSFORM */}
      <section className="px-8 lg:px-24 mb-20 max-w-7xl mx-auto">
        <div className="mb-8 border-b border-white/10 pb-4">
          <h2 className="text-3xl font-black text-white uppercase italic">{t.cat.tend_title}</h2>
          <span className="text-cine-accent font-bold uppercase tracking-widest text-xs">{t.cat.tend_sub}</span>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-8">
          <button onClick={prevSlide} className="flex-shrink-0 w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-black border border-gray-600 hover:border-cine-accent hover:bg-cine-accent/10 flex items-center justify-center text-white transition-all shadow-xl z-20">
            <svg className="w-5 h-5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          {/* El contenedor "ventana" que oculta todo lo que sobra */}
          <div className="flex-grow overflow-hidden px-1">
            {/* El contenedor que realmente se desplaza (El rollo de película) */}
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${carruselIndex * (100 / 3)}%)` }}
            >
              {tendencias.map(peli => (
                // Cada película ocupa exactamente un 33.333% del contenedor
                <div key={peli.id} className="w-1/3 flex-shrink-0 px-3">
                  <MovieCard peli={peli} />
                </div>
              ))}
            </div>
          </div>

          <button onClick={nextSlide} className="flex-shrink-0 w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-black border border-gray-600 hover:border-cine-accent hover:bg-cine-accent/10 flex items-center justify-center text-white transition-all shadow-xl z-20">
            <svg className="w-5 h-5 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </section>

      {/* 2. BUSCADOR PRO Y FILTROS */}
      <section className="px-8 lg:px-24 mb-16 relative z-20 max-w-7xl mx-auto">
        <div className="bg-cine-panel border border-white/10 p-4 lg:p-6 rounded-3xl shadow-2xl flex flex-col lg:flex-row gap-4 items-center">
          <div className="w-full lg:w-1/3 relative group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cine-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder={t.cat.search} 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-black border border-gray-800 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cine-accent/50 transition-all font-medium"
            />
          </div>

          <div className="w-full lg:w-2/3 flex flex-wrap gap-4">
            <div className="relative flex-1 group min-w-[150px]">
              <select disabled={busqueda !== ''} value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-300 pl-4 pr-10 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cine-accent/50 appearance-none disabled:opacity-50 font-medium cursor-pointer">
                <option value="">{t.cat.filtros.decada}</option>
                <option value="20">{t.cat.filtros.f20}</option>
                <option value="10">{t.cat.filtros.f10}</option>
                <option value="00">{t.cat.filtros.f00}</option>
                <option value="90">{t.cat.filtros.f90}</option>
                <option value="80">{t.cat.filtros.f80}</option>
                <option value="70">{t.cat.filtros.f70}</option>
                <option value="60">{t.cat.filtros.f60}</option>
                <option value="50">{t.cat.filtros.f50}</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none group-focus-within:text-cine-accent group-focus-within:rotate-180 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            <div className="relative flex-1 group min-w-[150px]">
              <select disabled={busqueda !== ''} value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-300 pl-4 pr-10 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cine-accent/50 appearance-none disabled:opacity-50 font-medium cursor-pointer">
                <option value="">{t.cat.filtros.genero}</option>
                <option value="28">{t.cat.filtros.g28}</option>
                <option value="12">{t.cat.filtros.g12}</option>
                <option value="878">{t.cat.filtros.g878}</option>
                <option value="35">{t.cat.filtros.g35}</option>
                <option value="18">{t.cat.filtros.g18}</option>
                <option value="27">{t.cat.filtros.g27}</option>
                <option value="53">{t.cat.filtros.g53}</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none group-focus-within:text-cine-accent group-focus-within:rotate-180 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            <div className="relative flex-1 group min-w-[150px]">
              <select disabled={busqueda !== ''} value={filtroOrden} onChange={(e) => setFiltroOrden(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-300 pl-4 pr-10 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cine-accent/50 appearance-none disabled:opacity-50 font-medium cursor-pointer">
                <option value="popularity.desc">{t.cat.filtros.orden}</option>
                <option value="vote_average.desc">{t.cat.filtros.o_rate_desc}</option>
                <option value="vote_average.asc">{t.cat.filtros.o_rate_asc}</option>
                <option value="primary_release_date.desc">{t.cat.filtros.o_date}</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none group-focus-within:text-cine-accent group-focus-within:rotate-180 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GRILLA DE RESULTADOS */}
      <section className="px-8 lg:px-24 mb-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-cine-accent font-black tracking-widest uppercase animate-pulse">{t.cat.buscando}</span>
          </div>
        ) : resultados.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {resultados.map(peli => (
              <MovieCard key={peli.id} peli={peli} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl">
            <p className="text-gray-500 font-bold uppercase tracking-widest">{t.cat.vacio}</p>
          </div>
        )}
      </section>

      {/* 4. FOCO DEL DIRECTOR */}
      {directorData.info && (
        <section className="px-8 lg:px-24 py-24 bg-[#050505] border-y border-cine-accent/20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-cine-accent/5 blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-cine-accent/30 pb-6">
              <div>
                <span className="bg-cine-accent text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg shadow-cine-accent/30">
                  {t.cat.director.title}
                </span>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
                  {directorData.info.nombre}
                </h2>
                <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs max-w-xl">
                  {t.cat.director.sub}
                </p>
              </div>
            </div>

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