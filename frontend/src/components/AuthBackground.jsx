import React, { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function AuthBackground() {
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const urlBase = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
        const pageRequests = [1, 2, 3, 4, 5].map(page => 
          fetch(`${urlBase}&page=${page}`).then(res => res.json())
        );
        const pagesData = await Promise.all(pageRequests);

        let allMovies = [];
        pagesData.forEach(data => {
          if (data.results) allMovies = [...allMovies, ...data.results];
        });

        const validPosters = allMovies
          .filter(p => p.poster_path)
          .map(p => p.poster_path);

        const uniquePosters = [...new Set(validPosters)];
        setPosters(shuffleArray(uniquePosters));
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchPosters();
  }, []);

  return (
    // 'fixed inset-0' y 'h-screen' con 'overflow-hidden' asegura que NADA se scrollee
    <div className="fixed inset-0 w-full h-screen bg-cine-bg overflow-hidden pointer-events-none z-0">
      
      {/* GRILLA: Usamos 'grid-cols' dinámico pero con 'grid-auto-rows' fijo para evitar que se pisen */}
      <div className="grid w-full h-full gap-2 p-2 pt-24"
           style={{ 
             gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
             gridAutoRows: 'min-content', // Las filas toman solo el espacio necesario
             alignContent: 'start' // Empieza arriba y rellena hacia abajo
           }}
      >
        {posters.map((path, i) => (
          // Usamos 'aspect-[2/3]' para mantener la forma de póster
          <div key={i} className="w-full aspect-[2/3] rounded-md overflow-hidden bg-cine-panel shadow-lg">
            <img 
              src={`${IMG_URL}${path}`} 
              alt="Poster" 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>

      {/* GRADIENTE SUPERIOR E INFERIOR (Opcional pero recomendado para que el corte de la última fila no sea brusco) */}
      <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-transparent to-cine-bg/50 z-10"></div>
    </div>
  );
}