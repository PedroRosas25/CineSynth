/*componente que arme para mostrar cada pelicula individual como una tarjeta en las grillas del catalogo
  recibe la informacion de la pelicula por props formatea el año de salida y la calificacion 
  y me arma un bloque entero clickeable que te lleva directo a la pantalla de detalles de esa obra
*/

// traigo React y Link para poder crear la tarjeta clickeable que cambie de ruta sin recargar la pagina
import React from 'react';
import { Link } from 'react-router-dom';

// seteo la ruta base de la API para traer las portadas en una resolucion optima para las tarjetas
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({ peli }) {
  // extraigo solo el año de la fecha de estreno completa Si no tiene fecha le pongo TBA por defecto
  const anio = peli.release_date ? peli.release_date.split('-')[0] : 'TBA';
  
  // formateo la nota para que muestre solo un decimal si todavia no tiene nota le mando S/R
  const rating = peli.vote_average ? peli.vote_average.toFixed(1) : 'S/R';
  
  // armo el titulo completo con el año para que aparezca cuando dejas el mouse quieto sobre la tarjeta
  const tituloHover = `${peli.original_title} (${anio})`;

  return (
    // envuelvo toda la tarjeta en un Link apuntando al ID de la pelicula y uso flex-col para empujar los textos abajo
    <Link to={`/pelicula/${peli.id}`} className="group cursor-pointer flex flex-col h-full" title={tituloHover}>
      
      {/* contenedor principal de la imagen con proporcion 2/3 */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 mb-3 shadow-xl bg-cine-panel">
        
        {/* imagen de la portada con un efecto de zoom suave que se activa con el hover del grupo */}
        <img 
          src={`${IMG_URL}${peli.poster_path}`} 
          alt={peli.original_title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
      </div>
      
      {/* contenedor para los textos que uso mt-auto para que quede siempre alineado abajo sin importar el alto */}
      <div className="mt-auto">
        
        {/* titulo de la pelicula cortado a una sola linea con line-clamp para que no rompa el diseño si es muy largo */}
        <h4 className="text-md font-black text-white uppercase italic leading-tight group-hover:text-cine-accent transition-colors line-clamp-1">
          {peli.original_title}
        </h4>
        
        {/* fila inferior para mostrar el año a la izquierda y la calificacion a la derecha */}
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-500 font-bold text-xs">{anio}</p>
          <p className="text-cine-accent font-bold text-xs">★ {rating}</p>
        </div>
      </div>
    </Link>
  );
}