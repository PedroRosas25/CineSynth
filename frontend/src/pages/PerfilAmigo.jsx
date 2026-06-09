import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function PerfilAmigo() {
  const { id_amigo } = useParams();
  const [bovedaAmigo, setBovedaAmigo] = useState([]);

  useEffect(() => {
    // Acá llamarías a un nuevo endpoint que crearemos:
    // GET /api/boveda/{id_amigo}
    const fetchBovedaAmigo = async () => {
      const res = await fetch(`http://127.0.0.1:8000/api/boveda/${id_amigo}`);
      const data = await res.json();
      setBovedaAmigo(data);
    };
    fetchBovedaAmigo();
  }, [id_amigo]);

  return (
    <div className="min-h-screen bg-cine-bg pt-32 px-24 text-white">
      <h1 className="text-4xl font-black mb-10">Bóveda del Amigo</h1>
      {/* Aquí renderizas las películas igual que en Boveda.jsx */}
    </div>
  );
}