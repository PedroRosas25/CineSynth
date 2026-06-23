/*componente que arme para mostrar la lista de las peliculas que estan por salir proximamente en los cines
  recibo el array de estrenos por props lo recorro y armo una lista vertical donde cada tarjeta 
  es clickeable y te lleva directamente a ver los detalles
*/

// traigo React y el componente Link para poder armar tarjetas que te hagan navegar sin recargar la pagina
import React from 'react';
import { Link } from 'react-router-dom';

// defino la ruta base de las imagenes de la API de TMDb en un tamaño medio (w500) para que carguen rapido
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

export default function UpcomingList({ proximos }) {
  return (
    // contenedor principal que apila todas las tarjetas de la lista una abajo de la otra con una pequeña separacion
    <div className="flex flex-col gap-4">
      
      {/* recorro el array de las peliculas y por cada una construyo una tarjeta */}
      {proximos.map((peli) => (
        
        // uso un Link en vez de un div para envolver toda la tarjeta asi se vuelve un boton gigante navegable
        // lo configuro para que en celulares se apile en columna y en pantallas grandes se vea en fila
        <Link 
          to={`/pelicula/${peli.id}`} 
          key={peli.id} 
          className="flex flex-col sm:flex-row gap-6 bg-cine-panel hover:bg-[#1f1f23] transition-colors p-4 rounded-2xl items-center border border-white/5 group cursor-pointer"
        >
          
          {/* contenedor de la miniatura de la pelicula le doy tamaños fijos para celu y PC y escondo lo que sobra */}
          <div className="w-full sm:w-32 h-48 sm:h-24 shrink-0 rounded-xl overflow-hidden shadow-md">
            
            {/* muestro la imagen de fondo de la peli (o el poster si no tiene fondo) y le meto el efecto de zoom al hacer hover */}
            <img 
              src={`${IMG_URL}${peli.backdrop_path || peli.poster_path}`} 
              alt={peli.original_title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          {/* contenedor central para la informacion le pongo flex-grow para que ocupe todo el espacio libre que quede */}
          <div className="flex-grow text-center sm:text-left">
            
            {/* titulo en mayusculas cursiva y que cambia de color al rojo de acento cuando paso el mouse por la tarjeta */}
            <h4 className="text-xl font-black text-white uppercase italic leading-tight group-hover:text-cine-accent transition-colors">
              {peli.original_title}
            </h4>
            
            {/* breve resumen de la trama cortado a 2 lineas maximo con line-clamp para mantener la estetica de la tarjeta */}
            <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">
              {peli.overview}
            </p>
          </div>

          {/* contenedor derecho con la fecha le pongo bordes separadores segun el tamaño de pantalla */}
          <div className="shrink-0 mt-4 sm:mt-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
            
            {/* etiqueta de LLega */}
            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block mb-1">
              Llega el
            </span>
            
            {/* fecha exacta de estreno destacada en rojo y con tipografia gruesa */}
            <span className="text-cine-accent font-black text-lg">{peli.release_date}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}