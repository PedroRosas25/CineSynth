/*archivo de entrada de la aplicacion React. 
  aca es donde agarro el componente principal (App) y lo inyecto en el HTML del navegador 
*/

// importo las herramientas basicas de React para renderizar la app en la web
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// importo los estilos globales de CSS que ya configure con Tailwind
import './index.css'

// importo mi componente principal que arme con todas las rutas y la pantalla de carga
import App from './App.jsx'

// busco el div con el id 'root' en el index.html y le digo a React que construya toda la aplicacion ahi adentro
createRoot(document.getElementById('root')).render(
  // envuelvo la app en StrictMode para que React me tire advertencias en consola si uso algo desactualizado o hay errores
  <StrictMode>
    {/* renderizo el componente App que tiene toda la logica del proyecto */}
    <App />
  </StrictMode>,
)