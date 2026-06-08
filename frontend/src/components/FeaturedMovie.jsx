import React from 'react';
import { Link } from 'react-router-dom';

const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

export default function FeaturedMovie({ destacada, t }) {
  if (!destacada) return null;

  return (
    // ACÁ ESTÁ LA MAGIA: destacada.id en lugar de peli.id, y sumamos 'block' al className
    <Link to={`/pelicula/${destacada.id}`} className="block relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl shadow-cine-accent/5 mb-12 group border border-white/10 cursor-pointer">
      <img 
        src={`${BACKDROP_URL}${destacada.backdrop_path}`} 
        alt={destacada.original_title} 
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-8 lg:p-12 w-full lg:w-2/3 z-10">
        <span className="bg-cine-panel text-white border border-gray-600 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest mb-4 inline-block">
          {t.aclamadas.tag}
        </span>
        <h3 className="text-5xl lg:text-7xl font-black text-white mb-4 italic uppercase drop-shadow-lg leading-none">
          {destacada.original_title}
        </h3>
        <p className="text-gray-300 font-medium mb-6 line-clamp-2 md:line-clamp-3 text-lg drop-shadow-md">
          {destacada.overview}
        </p>
        <div className="flex items-center gap-4">
          <span className="text-white font-bold bg-black/50 border border-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            ★ {destacada.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}