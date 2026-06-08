import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import MovieCard from '../components/MovieCard';
import FeaturedMovie from '../components/FeaturedMovie';
import UpcomingList from '../components/UpcomingList';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export default function Landing({ idioma, t }) {
  const [peliculas, setPeliculas] = useState([]);
  const [destacada, setDestacada] = useState(null);
  const [estrenoHero, setEstrenoHero] = useState(null);
  const [enCines, setEnCines] = useState([]); 
  const [proximos, setProximos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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

        const urlEstrenos = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`;
        const estrenosData = await fetchMixto(urlEstrenos);
        const estrenosFiltrados = estrenosData.results
          .filter(p => p.original_language === 'en' && p.vote_average >= 6 && p.vote_count >= 50 && p.overview?.trim() !== '')
          .sort((a, b) => b.popularity - a.popularity);
        
        const paginaRandom = Math.floor(Math.random() * 5) + 1;
        const urlCatalogo = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&vote_count.gte=3000&vote_average.gte=7.5&with_original_language=en&page=${paginaRandom}`;
        const catalogoData = await fetchMixto(urlCatalogo);
        const catalogoFiltrado = catalogoData.results.filter(p => p.overview?.trim() !== '');

        const urlProximos = `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&region=US`;
        const proximosData = await fetchMixto(urlProximos);
        const hoy = new Date();
        const pelisFuturas = proximosData.results
          .filter(p => new Date(p.release_date) >= hoy && p.original_language === 'en' && p.overview?.trim() !== '')
          .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

        if (estrenosFiltrados.length > 0) {
            const indexEstreno = Math.floor(Math.random() * Math.min(3, estrenosFiltrados.length));
            setEstrenoHero(estrenosFiltrados[indexEstreno]);
            setEnCines(estrenosFiltrados.filter((_, i) => i !== indexEstreno).slice(0, 4));
        }

        if (catalogoFiltrado.length > 0) {
            const indexAleatorio = Math.floor(Math.random() * Math.min(5, catalogoFiltrado.length));
            setDestacada(catalogoFiltrado[indexAleatorio]);
            setPeliculas(catalogoFiltrado.filter((_, i) => i !== indexAleatorio).slice(0, 4));
        }

        setProximos(pelisFuturas.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [idioma]);

  if (loading) return (
    <div className="min-h-screen bg-cine-bg flex items-center justify-center">
      <div className="text-cine-accent text-xl font-black animate-pulse tracking-widest uppercase">{t.loading}</div>
    </div>
  );

  return (
    <>
      <Hero estrenoHero={estrenoHero} t={t} />
      <BentoGrid t={t} />

      {enCines.length > 0 && (
        <section className="px-8 lg:px-24 py-24 bg-[#0f0f11]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center md:text-left">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{t.cines.title}</h2>
              <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">{t.cines.sub}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {enCines.map(peli => <MovieCard key={peli.id} peli={peli} subtitle={`${t.cines.star}${peli.vote_average.toFixed(1)} / 10`} />)}
            </div>
          </div>
        </section>
      )}

      {destacada && (
        <section className="px-8 lg:px-24 py-24 bg-black border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center md:text-left">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{t.aclamadas.title}</h2>
              <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">{t.aclamadas.sub}</p>
            </div>
            <FeaturedMovie destacada={destacada} t={t} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {peliculas.map(peli => <MovieCard key={peli.id} peli={peli} subtitle={peli.release_date.split('-')[0]} />)}
            </div>
          </div>
        </section>
      )}

      {proximos.length > 0 && (
        <section className="px-8 lg:px-24 py-24 bg-[#0a0a0a] border-b border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center md:text-left">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{t.proximos.title}</h2>
              <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">{t.proximos.sub}</p>
            </div>
            <UpcomingList proximos={proximos} t={t} />
          </div>
        </section>
      )}

      <section className="py-24 px-8 text-center bg-gradient-to-b from-black to-cine-bg">
        <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">{t.cta.title}</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">{t.cta.desc}</p>
        <button className="bg-cine-accent hover:bg-cine-accent-hover text-white font-black py-4 px-12 rounded-lg transition-all uppercase tracking-widest text-sm shadow-xl">
          {t.cta.btn}
        </button>
      </section>
    </>
  );
}