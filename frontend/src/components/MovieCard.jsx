import React from 'react';
import { Link } from 'react-router-dom'; // IMPORTAR LINK

const IMG_URL = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({ peli }) {
  const anio = peli.release_date ? peli.release_date.split('-')[0] : 'TBA';
  const rating = peli.vote_average ? peli.vote_average.toFixed(1) : 'S/R';
  const tituloHover = `${peli.original_title} (${anio})`;

  return (
    // CAMBIAMOS DIV POR LINK
    <Link to={`/pelicula/${peli.id}`} className="group cursor-pointer flex flex-col h-full" title={tituloHover}>
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 mb-3 shadow-xl bg-cine-panel">
        <img 
          src={`${IMG_URL}${peli.poster_path}`} 
          alt={peli.original_title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
      </div>
      <div className="mt-auto">
        <h4 className="text-md font-black text-white uppercase italic leading-tight group-hover:text-cine-accent transition-colors line-clamp-1">
          {peli.original_title}
        </h4>
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-500 font-bold text-xs">{anio}</p>
          <p className="text-cine-accent font-bold text-xs">★ {rating}</p>
        </div>
      </div>
    </Link>
  );
}