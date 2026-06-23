/*archivo de configuracion de Tailwind CSS. 
  aca defino los colores personalizados de CineSynth, las animaciones especiales y la tipografia 
  para poder usar todas estas clases en cualquier parte
*/

/** @type {import('tailwindcss').Config} */
export default {
  // le digo a Tailwind en que carpetas y archivos tiene que buscar las clases que estoy usando para armar el CSS final
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    // extiendo el tema que trae Tailwind por defecto para sumar mis cosas sin borrar las que ya vienen
    extend: {
      
      // aca defino la paleta de colores
      colors: {
        'cine-bg': '#0a0a0a',
        'cine-panel': '#171717',
        'cine-accent': '#dc2626',
        'cine-accent-hover': '#b91c1c',
      },
      
      // configuro los fotogramas clave para una animacion personalizada que mueve cosas hacia arriba
      keyframes: {
        'marquee-vertical': {
          '0%': { transform: 'translateY(0%)' },
          // mueve la mitad del contenido para lograr el efecto de deslizamiento infinito sin que se corte brusco
          '100%': { transform: 'translateY(-50%)' }, 
        },
      },
      
      // aca armo la animacion usando los fotogramas de arriba para que sea lineal y no pare nunca
      animation: {
        'marquee-vertical': 'marquee-vertical linear infinite',
      },
      
      // seteo la fuente Inter como la principal de tipo sans-serif para toda la pagina
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  
  // espacio para agregar plugins extras de Tailwind en el futuro
  plugins: [],
}