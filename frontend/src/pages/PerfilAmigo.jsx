/*componente provisorio que arme para ver el perfil y la boveda de un amigo 
  aca agarro el ID del amigo desde la URL le pego a mi backend para traerme sus peliculas 
  y armo la estructura basica de la pagina
*/

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function PerfilAmigo() {
  // extraigo el parametro del ID del amigo directamente desde la ruta en la barra de direcciones
  const { id_amigo } = useParams();
  
  // armo un estado para guardar el array con las peliculas que tiene este amigo
  const [bovedaAmigo, setBovedaAmigo] = useState([]);

  // efecto que se dispara cuando entro a la pagina o si cambia el ID del amigo en la URL
  useEffect(() => {
    // funcion asincrona para ir a buscar los datos a mi API
    const fetchBovedaAmigo = async () => {
      // le pego al endpoint especifico pasando el ID que saque de la URL
      const res = await fetch(`http://127.0.0.1:8000/api/boveda/${id_amigo}`);
      const data = await res.json();
      
      // guardo la respuesta del servidor en mi estado local
      setBovedaAmigo(data);
    };
    
    // ejecuto la funcion
    fetchBovedaAmigo();
  }, [id_amigo]);

  return (
    // contenedor principal de la pantalla con el fondo oscuro y margenes
    <div className="min-h-screen bg-cine-bg pt-32 px-24 text-white">
      
      {/* titulo principal de la seccion */}
      <h1 className="text-4xl font-black mb-10">Boveda del Amigo</h1>
    </div>
  );
}