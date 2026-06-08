import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

export default function MovieDetail({ idioma, t }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [peli, setPeli] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalImagen, setModalImagen] = useState(null);

  // --- ESTADOS PARA EL BACKEND (Bóveda) ---
  const [agregando, setAgregando] = useState(false);
  const [mensajeBoveda, setMensajeBoveda] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const langQuery = idioma === 'es' ? 'es-AR' : 'en-US';
        const region = idioma === 'es' ? 'AR' : 'US';

        const [resES, resEN] = await Promise.all([
          fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=${langQuery}&append_to_response=videos,credits,watch/providers,reviews`),
          fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,images,reviews&include_image_language=en,null`)
        ]);

        const dataTextos = await resES.json();
        const dataImagenes = await resEN.json();

        if (dataTextos.success === false) throw new Error("404");

        const trailersOriginales = dataImagenes.videos?.results?.filter(v => v.type === "Trailer" && v.site === "YouTube") || [];
        dataTextos.official_trailer = trailersOriginales.find(v => v.name.toLowerCase().includes('official')) || trailersOriginales[0];

        const resenasTotales = [...(dataTextos.reviews?.results || []), ...(dataImagenes.reviews?.results || [])];
        dataTextos.filtered_reviews = Array.from(new Map(resenasTotales.map(r => [r.id, r])).values()).slice(0, 6);

        dataTextos.poster_path = dataImagenes.poster_path || dataTextos.poster_path;
        dataTextos.backdrop_path = dataImagenes.backdrop_path || dataTextos.backdrop_path;
        dataTextos.all_images = dataImagenes.images;

        dataTextos.providers = dataTextos['watch/providers']?.results?.[region]?.flatrate || [];
        dataTextos.watch_link = dataTextos['watch/providers']?.results?.[region]?.link;
        dataTextos.director = dataTextos.credits?.crew?.find(persona => persona.job === 'Director')?.name;

        setPeli(dataTextos);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false); 
      }
    };

    fetchDetail();
  }, [id, idioma]);

  // --- FUNCIÓN PARA AGREGAR A LA BÓVEDA (Habla con FastAPI) ---
  const agregarABoveda = async () => {
    const userJson = localStorage.getItem('usuario');
    if (!userJson) {
      setMensajeBoveda("Inicia sesión");
      return;
    }
    
    const user = JSON.parse(userJson);
    setAgregando(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/boveda/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: Number(user.id),
          id_pelicula: Number(id)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setMensajeBoveda("¡Guardada!");
    } catch (err) {
      setMensajeBoveda(err.message === "La película ya está en tu bóveda" ? "Ya la tienes" : "Error");
    } finally {
      setAgregando(false);
      setTimeout(() => setMensajeBoveda(''), 3000);
    }
  };

  if (loading || !peli) return (
    <div className="min-h-screen bg-cine-bg flex items-center justify-center">
      <div className="text-cine-accent text-xl font-black animate-pulse tracking-widest uppercase">{t?.loading || "CARGANDO..."}</div>
    </div>
  );

  const textos = t?.detail || {
    volver: "← Volver", sinopsis: "Sinopsis", elenco: "Reparto Principal", trailer: "Tráiler Oficial",
    donde_ver: "Dónde Ver", no_providers: "No disponible actualmente.",
    no_trailer: "Tráiler no disponible.", resenas: "Reseñas de Usuarios", galeria: "Galería Visual"
  };

  return (
    <div className="min-h-screen bg-cine-bg pb-24 relative">
      
      {modalImagen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer" onClick={() => setModalImagen(null)}>
          <img src={modalImagen} alt="Ampliada" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
          <span className="absolute top-6 right-8 text-white font-black text-3xl hover:text-cine-accent transition-colors">✕</span>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-[75vh] z-0">
        <img src={`${BACKDROP_URL}${peli.backdrop_path}`} className="w-full h-full object-cover object-top opacity-100" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-cine-bg/10 via-cine-bg/80 to-cine-bg"></div>
      </div>

      <div className="relative z-10 pt-[40vh] px-8 lg:px-24">
        <button onClick={() => navigate(-1)} className="mb-8 text-gray-300 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest flex items-center gap-2 bg-black/60 w-fit px-4 py-2 rounded-full border border-white/10">
          {textos.volver}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-cine-panel">
              <img src={`${IMG_URL}${peli.poster_path}`} alt={peli.original_title} className="w-full h-auto" />
            </div>
          </div>

          <div className="lg:col-span-9 mt-4 lg:mt-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-2">
              <h1 className="text-5xl lg:text-7xl font-black text-white uppercase italic leading-none tracking-tighter shadow-black drop-shadow-md">
                {peli.original_title}
              </h1>
              
              {/* --- EL BOTÓN DE BÓVEDA INTEGRADO AQUÍ --- */}
              <button 
                onClick={agregarABoveda}
                disabled={agregando}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-xl ${
                  mensajeBoveda 
                    ? (mensajeBoveda === "¡Guardada!" ? 'bg-green-600' : 'bg-orange-600') 
                    : 'bg-cine-accent hover:bg-cine-accent-hover hover:scale-105 active:scale-95 shadow-cine-accent/20'
                }`}
              >
                <span>{mensajeBoveda === "¡Guardada!" ? '✓' : (agregando ? '...' : '+')}</span>
                {mensajeBoveda || (agregando ? '...' : 'Añadir a Bóveda')}
              </button>
            </div>
            
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">
              Dirigida por: <span className="text-cine-accent">{peli.director || 'Desconocido'}</span>
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-black text-gray-300 tracking-widest uppercase mb-8">
              <span className="bg-cine-accent text-white px-3 py-1 rounded">★ {peli.vote_average.toFixed(1)}</span>
              <span className="bg-black/50 px-3 py-1 rounded border border-white/10">{peli.release_date?.split('-')[0]}</span>
              <span className="bg-black/50 px-3 py-1 rounded border border-white/10">{peli.runtime} MIN</span>
              {peli.genres?.map(g => <span key={g.id} className="text-gray-400 border border-gray-700 px-2 py-1 rounded">{g.name}</span>)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white uppercase italic border-l-4 border-cine-accent pl-4">{textos.sinopsis}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{peli.overview || "Sinopsis no disponible."}</p>
                
                <div className="pt-6">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">{textos.donde_ver}</h3>
                  <div className="flex flex-wrap gap-3">
                    {peli.providers.length > 0 ? (
                      peli.providers.map(prov => (
                        <a key={prov.provider_id} href={peli.watch_link} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl overflow-hidden hover:scale-105 transition-transform border border-white/10">
                          <img src={`https://image.tmdb.org/t/p/w200${prov.logo_path}`} alt={prov.provider_name} />
                        </a>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">{textos.no_providers}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-white uppercase italic border-l-4 border-cine-accent pl-4">{textos.trailer}</h3>
                {peli.official_trailer ? (
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-black">
                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${peli.official_trailer.key}`} title="YouTube trailer" frameBorder="0" allowFullScreen></iframe>
                  </div>
                ) : (
                  <div className="aspect-video bg-cine-panel rounded-2xl flex items-center justify-center text-gray-500 italic border border-white/5">{textos.no_trailer}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* REPARTO */}
        <section className="mb-20 max-w-7xl">
          <h3 className="text-2xl font-black text-white uppercase italic border-b border-white/10 pb-3 mb-6">{textos.elenco}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {peli.credits?.cast?.slice(0, 6).map(actor => (
              <div key={actor.id} className="bg-cine-panel rounded-xl overflow-hidden border border-white/5">
                <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : 'https://via.placeholder.com/500x750?text=No+Image'} className="w-full h-56 object-cover object-top" alt={actor.name} />
                <div className="p-3 text-center">
                  <p className="text-white font-bold text-sm truncate">{actor.name}</p>
                  <p className="text-gray-500 text-xs truncate">{actor.character}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GALERÍA VISUAL */}
        {peli.all_images?.backdrops?.length > 0 && (
          <section className="mb-20 max-w-7xl">
            <h3 className="text-2xl font-black text-white uppercase italic border-b border-white/10 pb-3 mb-6">{textos.galeria}</h3>
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {peli.all_images.backdrops.slice(0, 10).map((img, i) => (
                <div key={i} onClick={() => setModalImagen(`${BACKDROP_URL}${img.file_path}`)} className="flex-shrink-0 h-40 md:h-48 rounded-xl overflow-hidden border border-white/10 hover:border-cine-accent transition-colors cursor-pointer">
                  <img src={`${IMG_URL}${img.file_path}`} className="h-full w-auto object-cover" alt="Escena" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RESEÑAS */}
        <section className="max-w-7xl">
          <h3 className="text-2xl font-black text-white uppercase italic border-b border-white/10 pb-3 mb-6">{textos.resenas}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {peli.filtered_reviews.length > 0 ? (
              peli.filtered_reviews.map(rev => (
                <div key={rev.id} className="bg-[#0f0f11] p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cine-accent rounded-full flex items-center justify-center font-black text-white">{rev.author[0]}</div>
                    <div>
                      <p className="text-white font-bold text-sm">{rev.author}</p>
                      <p className="text-cine-accent text-xs font-black">★ {rev.author_details?.rating || '10'}/10</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 italic">"{rev.content}"</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No hay reseñas disponibles aún.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}