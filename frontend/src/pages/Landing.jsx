/*componente principal de la pagina de inicio 
  aca arme toda la estructura de la primera pantalla que ve el usuario traigo los componentes 
  que ya arme (Hero, BentoGrid, etc) y les paso la informacion que voy a buscar a la API de TMDb
  me encargo de traer peliculas en cartelera recomendadas al azar y proximos estrenos para que 
  la pagina siempre este fresca y dinamica cada vez que alguien entra.
*/

// traigo React Link para navegar y todos los componentes visuales que fui armando para construir esta pantalla
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import MovieCard from '../components/MovieCard';
import FeaturedMovie from '../components/FeaturedMovie';
import UpcomingList from '../components/UpcomingList';

// seteo las credenciales y rutas de la API usando mis variables de entorno
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export default function Landing() {
  // armo mis estados para guardar todas las distintas listas de peliculas que voy a mostrar en la pagina
  const [peliculas, setPeliculas] = useState([]);
  const [destacada, setDestacada] = useState(null);
  const [estrenoHero, setEstrenoHero] = useState(null);
  const [enCines, setEnCines] = useState([]); 
  const [proximos, setProximos] = useState([]);
  const [loading, setLoading] = useState(true);

  // me fijo en el almacenamiento del navegador si el usuario ya inicio sesion para cambiar algunos textos y botones
  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  // efecto gigante que arranca cuando carga la pagina para ir a buscar todos los datos juntos a la API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // esta funcion especial la arme para pegarle a TMDb en dos idiomas a la vez
        // asi tengo la sinopsis en español pero mantengo los titulos y posters originales en ingles
        const fetchMixto = async (urlBase) => {
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
              title: peliEN ? peliEN.title : peliES.title,
              original_title: peliEN ? peliEN.original_title : peliES.original_title,
              poster_path: peliEN ? peliEN.poster_path : peliES.poster_path,
              backdrop_path: peliEN ? peliEN.backdrop_path : peliES.backdrop_path
            };
          });
          return dataTextos;
        };

        // 1. busco las peliculas que estan en el cine ahora mismo
        const urlEstrenos = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`;
        const estrenosData = await fetchMixto(urlEstrenos);
        
        // filtro para quedarme solo con peliculas en ingles con nota mayor a 6 bastantes votos y que tengan resumen
        const estrenosFiltrados = estrenosData.results
          .filter(p => p.original_language === 'en' && p.vote_average >= 6 && p.vote_count >= 50 && p.overview?.trim() !== '')
          .sort((a, b) => b.popularity - a.popularity);
        
        // 2. busco un catalogo de peliculas muy bien valoradas
        // uso un numero al azar del 1 al 5 para la pagina de la API asi cada vez que entras ves peliculas distintas
        const paginaRandom = Math.floor(Math.random() * 5) + 1;
        const urlCatalogo = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&vote_count.gte=3000&vote_average.gte=8.0&with_original_language=en&page=${paginaRandom}`;
        const catalogoData = await fetchMixto(urlCatalogo);
        const catalogoFiltrado = catalogoData.results.filter(p => p.overview?.trim() !== '');

        // 3. busco los proximos estrenos filtrando por la region de estados unidos para que sean peliculas grandes
        const urlProximos = `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&region=US`;
        const proximosData = await fetchMixto(urlProximos);
        const hoy = new Date();
        
        // filtro para mostrar solo las peliculas que salen despues de la fecha de hoy
        const pelisFuturas = proximosData.results
          .filter(p => new Date(p.release_date) >= hoy && p.original_language === 'en' && p.overview?.trim() !== '')
          .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

        // si pude traer estrenos elijo uno al azar para el fondo del Hero y guardo 4 mas para las tarjetas
        if (estrenosFiltrados.length > 0) {
            const indexEstreno = Math.floor(Math.random() * Math.min(3, estrenosFiltrados.length));
            setEstrenoHero(estrenosFiltrados[indexEstreno]);
            setEnCines(estrenosFiltrados.filter((_, i) => i !== indexEstreno).slice(0, 4));
        }

        // si pude traer el catalogo aclamado elijo una al azar para destacar y guardo 4 para acompañarla
        if (catalogoFiltrado.length > 0) {
            const indexAleatorio = Math.floor(Math.random() * Math.min(5, catalogoFiltrado.length));
            setDestacada(catalogoFiltrado[indexAleatorio]);
            setPeliculas(catalogoFiltrado.filter((_, i) => i !== indexAleatorio).slice(0, 4));
        }

        // guardo solo los primeros 4 proximos estrenos para no saturar la pagina
        setProximos(pelisFuturas.slice(0, 4));
        
        // apago la pantalla de carga porque ya tengo todo listo
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, []); 

  // pantalla de carga super minimalista mientras la API me devuelve toda la info
  if (loading) return (
    <div className="min-h-screen bg-cine-bg flex items-center justify-center">
      <div className="text-cine-accent text-xl font-black animate-pulse tracking-widest uppercase">PREPARANDO LA SALA...</div>
    </div>
  );

  return (
    // aca voy apilando todos los bloques de la pagina de inicio usando Fragmentos
    <>
      {/* cabecera principal con la pelicula de estreno de fondo */}
      <Hero estrenoHero={estrenoHero} />
      
      {/* grilla informativa de caracteristicas de la app */}
      <BentoGrid />

      {/* Seccion 1: cartelera actual solo la renderizo si pude traer datos de la API */}
      {enCines.length > 0 && (
        <section className="px-8 lg:px-24 py-24 bg-[#0f0f11]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center md:text-left">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Cartelera Actual</h2>
              <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Las mejores películas que están en los cines</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {enCines.map(peli => <MovieCard key={peli.id} peli={peli} />)}
            </div>
          </div>
        </section>
      )}

      {/* Seccion 2: obras aclamadas rotativas aca uso el componente de pelicula destacada y un par de tarjetitas */}
      {destacada && (
        <section className="px-8 lg:px-24 py-24 bg-black border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center md:text-left">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Obras Aclamadas</h2>
              <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Catálogo rotativo con puntuación superior a 8.0</p>
            </div>
            <FeaturedMovie destacada={destacada} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {peliculas.map(peli => <MovieCard key={peli.id} peli={peli} />)}
            </div>
          </div>
        </section>
      )}

      {/* Seccion 3: proximos estrenos reciclando la lista vertical que arme en otro componente */}
      {proximos.length > 0 && (
        <section className="px-8 lg:px-24 py-24 bg-[#0a0a0a] border-b border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center md:text-left">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Próximos Estrenos</h2>
              <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">Lo que se viene a la pantalla grande</p>
            </div>
            <UpcomingList proximos={proximos} />
          </div>
        </section>
      )}

      {/* Seccion 4: llamado a la accion final es un cartel dinamico que cambia los textos y el boton segun si estas logueado o no */}
      <section className="py-24 px-8 text-center bg-gradient-to-b from-black to-cine-bg">
        <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">
          {usuario ? "El archivo mundial te espera" : "Tu colección te espera"}
        </h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          {usuario 
            ? "Explorá miles de películas, descubrí nuevas obras maestras y agregalas a tu Bóveda personal." 
            : "Unite a CineSynth hoy mismo. Organizá tu vida cinéfila de forma gratuita."}
        </p>
        <Link to={usuario ? "/catalogo" : "/registro"}>
          <button className="bg-cine-accent hover:bg-cine-accent-hover text-white font-black py-4 px-12 rounded-lg transition-all uppercase tracking-widest text-sm shadow-xl">
            {usuario ? "Explorar Catálogo" : "Crear Cuenta"}
          </button>
        </Link>
      </section>
    </>
  );
}