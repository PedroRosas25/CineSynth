/*componente que arme para mostrar la pelicula destacada en la cabecera del catalogo
  recibe los datos de una pelicula especifica por props y arma un banner
  al que le podes hacer click para ir directamente a ver los detalles de esa obra.
*/

// traigo React y el componente Link para poder navegar entre pantallas sin recargar la pagina
import React from 'react';
import { Link } from 'react-router-dom';

// defino la ruta base de la API para traerme la imagen de fondo en su calidad original
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

export default function FeaturedMovie({ destacada }) {
  // si por alguna razon la API todavia no me devolvio la pelicula devuelvo null para que no se rompa nada
  if (!destacada) return null;

  return (
    // envuelvo todo el banner en un Link que me lleva a la ruta de la pelicula usando su ID.
    // le doy forma rectangular ancha (aspect-[21/9]) bordes redondeados y preparo el grupo para el hover
    <Link to={`/pelicula/${destacada.id}`} className="block relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl shadow-cine-accent/5 mb-12 group border border-white/10 cursor-pointer">
      
      {/* imagen de fondo de la pelicula tiene una transicion que hace un zoom suave cuando le pasas el mouse por arriba */}
      <img 
        src={`${BACKDROP_URL}${destacada.backdrop_path}`} 
        alt={destacada.original_title} 
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-60"
      />
      
      {/* capa de degradado negro que va de abajo hacia arriba para oscurecer la imagen y que las letras blancas resalten */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      
      {/* contenedor absoluto para acomodar todo el bloque de texto en la esquina inferior izquierda */}
      <div className="absolute bottom-0 left-0 p-8 lg:p-12 w-full lg:w-2/3 z-10">
        
        {/* etiqueta estetica de obra maestra arriba del titulo de la pelicula */}
        <span className="bg-cine-panel text-white border border-gray-600 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest mb-4 inline-block">
          Obra Maestra
        </span>
        
        {/* titulo de la pelicula */}
        <h3 className="text-5xl lg:text-7xl font-black text-white mb-4 italic uppercase drop-shadow-lg leading-none">
          {destacada.original_title}
        </h3>
        
        {/* sinopsis de la pelicula le puse line-clamp para que se corte con puntos suspensivos si es muy larga */}
        <p className="text-gray-300 font-medium mb-6 line-clamp-2 md:line-clamp-3 text-lg drop-shadow-md">
          {destacada.overview}
        </p>
        
        {/* contenedor flexible para poner la nota de la pelicula */}
        <div className="flex gap-4">
          {/* muestro la nota redondeado a un solo decimal acompañado de una estrella */}
          <span className="bg-cine-accent backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
            ★ {destacada.vote_average?.toFixed(1)}
          </span>
        </div>

      </div>
    </Link>
  );
}