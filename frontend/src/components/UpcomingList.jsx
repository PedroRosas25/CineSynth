import React from 'react';

const IMG_URL = 'https://image.tmdb.org/t/p/w500';

export default function UpcomingList({ proximos, t }) {
  return (
    <div className="flex flex-col gap-4">
      {proximos.map((peli) => (
        <div key={peli.id} className="flex flex-col sm:flex-row gap-6 bg-cine-panel hover:bg-[#1f1f23] transition-colors p-4 rounded-2xl items-center border border-white/5 group cursor-pointer">
          <div className="w-full sm:w-32 h-48 sm:h-24 shrink-0 rounded-xl overflow-hidden shadow-md">
            <img 
              src={`${IMG_URL}${peli.backdrop_path || peli.poster_path}`} 
              alt={peli.original_title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <div className="flex-grow text-center sm:text-left">
            <h4 className="text-xl font-black text-white uppercase italic leading-tight group-hover:text-cine-accent transition-colors">
              {peli.original_title}
            </h4>
            <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">
              {peli.overview}
            </p>
          </div>

          <div className="shrink-0 mt-4 sm:mt-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
            <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest block mb-1">{t.proximos.llega}</span>
            <span className="text-cine-accent font-black text-lg">{peli.release_date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}