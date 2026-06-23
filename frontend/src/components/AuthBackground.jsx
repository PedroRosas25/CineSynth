/* componente que arme para poner de fondo en las pantallas de login y registro. 
  aca me conecto a la API de TMDb, traigo un monton de portadas de peliculas en tendencia, 
  las mezclo al azar y las pinto en una grilla fija que no se puede scrollear para que de un efecto visual de fondo de catalogo infinito.
*/

import React, { useState, useEffect } from 'react';

// seteo las constantes que necesito para armar las peticiones a la API usando mi variable de entorno
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// funcion auxiliar que arme para agarrar un array y mezclar sus elementos de forma aleatoria
function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function AuthBackground() {
  // estado donde guardo todas las rutas de los posters de las peliculas ya procesadas
  const [posters, setPosters] = useState([]);

  // efecto que arranca apenas se monta el componente para ir a buscar la data
  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const urlBase = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
        
        // armo 5 peticiones al mismo tiempo para traerme 5 paginas distintas de peliculas populares de una vez
        const pageRequests = [1, 2, 3, 4, 5].map(page => 
          fetch(`${urlBase}&page=${page}`).then(res => res.json())
        );
        const pagesData = await Promise.all(pageRequests);

        // aca junto todos los resultados de esas 5 paginas en un solo array gigante
        let allMovies = [];
        pagesData.forEach(data => {
          if (data.results) allMovies = [...allMovies, ...data.results];
        });

        // filtro el array para quedarme solo con las peliculas que si o si tienen imagen de portada y me guardo esa ruta
        const validPosters = allMovies
          .filter(p => p.poster_path)
          .map(p => p.poster_path);

        // le saco los duplicados por las dudas y uso mi funcion para mezclarlos todos
        const uniquePosters = [...new Set(validPosters)];
        setPosters(shuffleArray(uniquePosters));
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchPosters();
  }, []);

  return (
    // contenedor principal clavado al fondo que ocupa toda la pantalla y esconde lo que sobra para que no deje scrollear
    <div className="fixed inset-0 w-full h-screen bg-cine-bg overflow-hidden pointer-events-none z-0">
      
      {/* grilla dinamica que acomoda las portadas segun el ancho disponible sin que se pisen las filas */}
      <div className="grid w-full h-full gap-2 p-2 pt-24"
           style={{ 
             gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
             gridAutoRows: 'min-content', 
             alignContent: 'start' 
           }}
      >
        {/* recorro el array mezclado y dibujo cada portada */}
        {posters.map((path, i) => (
          <div key={i} className="w-full aspect-[2/3] rounded-md overflow-hidden bg-cine-panel shadow-lg">
            <img 
              src={`${IMG_URL}${path}`} 
              alt="Poster" 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>

      {/* capa de degradado oscuro por encima para que las portadas no molesten visualmente a los formularios que van adelante */}
      <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-transparent to-cine-bg/50 z-10"></div>
    </div>
  );
}