import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Comunidad() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [amigos, setAmigos] = useState([]);
  const user = JSON.parse(localStorage.getItem('usuario'));

  // Cargar datos sociales al entrar
  useEffect(() => {
    if (!user) return;
    cargarPendientes();
    cargarAmigos();
  }, []);

  const cargarPendientes = async () => {
    const res = await fetch(`http://127.0.0.1:8000/api/amistades/pendientes/${user.id}`);
    setPendientes(await res.json());
  };

  const cargarAmigos = async () => {
    const res = await fetch(`http://127.0.0.1:8000/api/amistades/amigos/${user.id}`);
    setAmigos(await res.json());
  };

  const buscarUsuarios = async () => {
    if (busqueda.length < 2) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/usuarios/buscar/${busqueda}`);
      setResultados(await res.json());
    } catch (err) {
      console.error("Error al buscar:", err);
    }
  };

  const solicitarAmistad = async (id_destino) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/amistades/solicitar?id_origen=${user.id}&id_destino=${id_destino}`, { method: 'POST' });
      const data = await res.json();
      alert(data.mensaje);
    } catch (err) {
      console.error("Error al enviar:", err);
    }
  };

  const responderSolicitud = async (id_origen, aceptar) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/amistades/responder?id_origen=${id_origen}&id_destino=${user.id}&aceptar=${aceptar}`, { method: 'POST' });
      cargarPendientes(); // Recarga la lista para borrar la alerta
      cargarAmigos();     // Actualiza la lista de amigos si aceptaste
    } catch (err) {
      console.error("Error al responder:", err);
    }
  };

  if (!user) return <div className="min-h-screen bg-cine-bg text-white pt-32 text-center text-2xl font-black">Inicia sesión para usar la Comunidad.</div>;

  return (
    <div className="min-h-screen bg-cine-bg pt-32 px-8 lg:px-24 text-white">
      <h1 className="text-5xl font-black italic uppercase mb-12">Comunidad Social</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* COLUMNA IZQUIERDA: Buscador e Invitaciones */}
        <div>
          <h3 className="text-2xl font-black text-cine-accent mb-6 uppercase tracking-widest border-b border-white/10 pb-2">Buscar Usuarios</h3>
          <div className="flex gap-4 mb-8">
            <input 
              type="text" placeholder="Ej: Pedro..."
              className="bg-cine-panel border border-white/10 p-3 rounded-xl w-full outline-none focus:border-cine-accent"
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button onClick={buscarUsuarios} className="bg-cine-accent px-6 py-2 rounded-xl font-bold uppercase">Buscar</button>
          </div>

          <div className="flex flex-col gap-3 mb-12">
            {resultados.map((u) => (
              <div key={u.id} className="bg-cine-panel p-4 rounded-xl flex justify-between items-center border border-white/5">
                <span className="font-bold">{u.nombre}</span>
                {u.id !== user.id && (
                  <button onClick={() => solicitarAmistad(u.id)} className="bg-white/10 px-4 py-1 rounded text-xs font-bold uppercase hover:bg-cine-accent transition">
                    + Agregar
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Solicitudes Pendientes */}
          {pendientes.length > 0 && (
            <div className="bg-cine-accent/10 border border-cine-accent/30 p-6 rounded-2xl">
              <h3 className="text-xl font-black mb-4 uppercase flex items-center gap-2">
                <span className="bg-cine-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">{pendientes.length}</span>
                Solicitudes Pendientes
              </h3>
              <div className="flex flex-col gap-3">
                {pendientes.map((p) => (
                  <div key={p.id_origen} className="flex justify-between items-center bg-black/40 p-3 rounded-xl">
                    <span className="font-bold">{p.nombre} quiere ser tu amigo</span>
                    <div className="flex gap-2">
                      <button onClick={() => responderSolicitud(p.id_origen, true)} className="bg-green-600 px-3 py-1 rounded text-xs font-black uppercase hover:scale-105">Aceptar</button>
                      <button onClick={() => responderSolicitud(p.id_origen, false)} className="bg-red-600 px-3 py-1 rounded text-xs font-black uppercase hover:scale-105">X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Mis Amigos */}
        <div>
          <h3 className="text-2xl font-black text-cine-accent mb-6 uppercase tracking-widest border-b border-white/10 pb-2">Mis Amigos</h3>
          {amigos.length === 0 ? (
            <p className="text-gray-500 italic">Aún no tienes amigos. ¡Busca usuarios y agrégalos para ver sus películas!</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {amigos.map((amigo) => (
                <div key={amigo.id} className="bg-cine-panel p-6 rounded-2xl flex justify-between items-center border border-white/5 hover:border-cine-accent transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cine-accent rounded-full flex items-center justify-center font-black text-xl">{amigo.nombre[0].toUpperCase()}</div>
                    <span className="font-bold text-xl">{amigo.nombre}</span>
                  </div>
                  <Link to={`/boveda/${amigo.id}`} className="text-gray-400 font-black uppercase text-xs tracking-widest group-hover:text-white transition underline underline-offset-4">
                    Ver Bóveda →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}