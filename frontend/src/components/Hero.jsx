import React from 'react';

const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

export default function Hero({ estrenoHero, t }) {
  if (!estrenoHero) return null;

  return (
    <header className="relative pt-52 pb-32 px-8 lg:px-24 bg-cine-bg overflow-hidden border-b border-white/5 flex items-center min-h-[90vh]">
      <img 
        src={`${BACKDROP_URL}${estrenoHero.backdrop_path}`} 
        alt="Fondo estreno" 
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-100 transform scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/60 to-cine-bg/20 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cine-bg via-transparent to-transparent z-10"></div>
      
      <div className="relative z-20 max-w-4xl mx-auto lg:mx-0 text-center lg:text-left whitespace-pre-line">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
          <span className="bg-cine-accent text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-lg">
            {t.hero.tag}
          </span>
          <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">
            {t.hero.fondo} {estrenoHero.original_title}
          </span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tighter mb-6 drop-shadow-xl">
          {t.hero.title}
        </h1>
        <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl font-medium drop-shadow-md mx-auto lg:mx-0">
          {t.hero.desc}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
          <button className="bg-white hover:bg-gray-200 text-black font-black py-4 px-10 rounded-lg transition-all uppercase tracking-widest text-sm shadow-xl w-full sm:w-auto">
            {t.hero.btn}
          </button>
        </div>
      </div>
    </header>
  );
}