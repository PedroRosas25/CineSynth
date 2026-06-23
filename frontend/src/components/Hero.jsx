/*componente que arme para la seccion principal de la pagina de inicio
  recibe la pelicula de estreno por props y la pone de fondo ademas muestra el titulo de la app 
  y un boton dinamico que te manda al catalogo o a registrarte dependiendo de si ya iniciaste sesion o no
*/

// traigo React y el componente Link para manejar la navegacion interna sin tener que recargar la web
import React from 'react';
import { Link } from 'react-router-dom'; 

// guardo la ruta base de TMDb para cargar la imagen de fondo en su maxima calidad posible
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

export default function Hero({ estrenoHero }) {
  // me fijo en el almacenamiento del navegador si hay una sesion activa y la guardo en una variable
  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  // si por alguna razon la API todavia no mando la pelicula corto la ejecucion aca para que no se rompa la pantalla
  if (!estrenoHero) return null;

  return (
    // contenedor principal de la cabecera le doy un alto minimo de 100vh para que ocupe toda la pantalla inicial
    <header className="relative pt-52 pb-32 px-8 lg:px-24 bg-cine-bg overflow-hidden border-b border-white/5 flex items-center min-h-[100vh]">
      
      {/* imagen de fondo sacada de la pelicula de estreno */}
      <img 
        src={`${BACKDROP_URL}${estrenoHero.backdrop_path}`} 
        alt="Fondo estreno" 
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-100 transform scale-100"
      />
      
      {/* capas de degradado oscuro para que se peuda leer el texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/60 to-cine-bg/20 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cine-bg via-transparent to-transparent z-10"></div>
      
      {/* contenedor relativo que va por encima de los fondos (z-20) para agrupar todos los textos y que no queden tapados */}
      <div className="relative z-20 max-w-4xl mx-auto lg:mx-0 text-center lg:text-left whitespace-pre-line">
        
        {/* etiquetas para decir que peliculas es la del fondo */}
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
          <span className="bg-cine-accent text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-lg">
            En Cines Hoy
          </span>
          <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">
            Fondo: {estrenoHero.original_title}
          </span>
        </div>
        
        {/* titulo principal de la pagina gigante en negrita y con sombra para resaltar */}
        <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tighter mb-6 drop-shadow-xl">
          Llevá el registro de{"\n"}las películas que te marcan.
        </h1>
        
        {/* parrafo explicativo con la descripcion general de lo que hace la aplicacion */}
        <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl font-medium drop-shadow-md mx-auto lg:mx-0">
          Tu archivo digital para catalogar cada visionado, calificar obras maestras y armar listas de lo que querés ver. Sin recomendaciones raras, solo tu historia en el cine.
        </p>
        
        {/* contenedor de botones de accion se adaptan a celulares poniendose en columna y en PC en fila */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            
            {/* aca armo el boton dinamico inteligente: 
                si tengo guardado al usuario el boton dice "Explorar Catalogo" y lo lleva al catalogo 
                si no hay nadie logueado dice "Crear mi Boveda" y lo manda a iniciar sesion */}
            <Link to={usuario ? "/catalogo" : "/login"}>
              <button className="bg-cine-accent hover:bg-red-700 text-white font-black uppercase tracking-widest px-8 py-4 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                {usuario ? "Explorar Catálogo" : "Crear mi Bóveda"}
              </button>
            </Link>

        </div>
      </div>
    </header>
  );
}