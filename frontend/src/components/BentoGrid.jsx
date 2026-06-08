import React from 'react';

export default function BentoGrid({ t }) {
  return (
    <section className="px-8 lg:px-24 py-24 relative z-20 bg-cine-bg border-b border-white/5">
      <div className="mb-12 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic text-center md:text-left">{t.bento.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="md:col-span-2 bg-cine-panel p-10 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-3">{t.bento.b1_title}</h3>
            <p className="text-gray-400 max-w-sm">{t.bento.b1_desc}</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl group-hover:scale-110 transition-transform -rotate-12">📝</div>
        </div>

        <div className="md:col-span-1 bg-cine-panel p-10 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors flex flex-col justify-between">
          <h3 className="text-xl font-bold text-white mb-2">{t.bento.b2_title}</h3>
          <p className="text-gray-400 text-sm">{t.bento.b2_desc}</p>
        </div>

        <div className="md:col-span-1 bg-cine-panel p-10 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors">
          <h3 className="text-xl font-bold text-white mb-2">{t.bento.b3_title}</h3>
          <p className="text-gray-400 text-sm">{t.bento.b3_desc}</p>
        </div>

        <div className="md:col-span-2 bg-gradient-to-r from-cine-panel to-black p-10 rounded-2xl border border-gray-800 hover:border-cine-accent/50 transition-colors">
          <h3 className="text-2xl font-black text-white mb-3">{t.bento.b4_title}</h3>
          <p className="text-gray-400 max-w-md">{t.bento.b4_desc}</p>
        </div>
      </div>
    </section>
  );
}