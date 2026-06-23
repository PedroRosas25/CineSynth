/*componente donde arme toda la seccion social de la aplicacion
  aca podes buscar a otras personas en la base de datos mandarles solicitud de amistad
  aceptar o rechazar las que te mandan a vos y ver tu lista de amigos para entrar a sus bovedas y ver sus peliculas
*/

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Comunidad() {
  // armo mis estados para manejar lo que escribo en el buscador lo que me devuelve mis solicitudes y mis amigos
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [amigos, setAmigos] = useState([]);
  
  // saco mis datos de usuario del almacenamiento local del navegador
  const user = JSON.parse(localStorage.getItem('usuario'));

  // efecto que arranca cuando entro a la pagina si estoy logueado carga mis datos sociales
  useEffect(() => {
    if (!user) return;
    cargarPendientes();
    cargarAmigos();
  }, []);

  // funcion para pedirle a mi backend la lista de gente que me mando solicitud y todavia no conteste
  const cargarPendientes = async () => {
    const res = await fetch(`http://127.0.0.1:8000/api/amistades/pendientes/${user.id}`);
    setPendientes(await res.json());
  };

  // funcion para traer la lista de usuarios que ya son mis amigos confirmados
  const cargarAmigos = async () => {
    const res = await fetch(`http://127.0.0.1:8000/api/amistades/amigos/${user.id}`);
    setAmigos(await res.json());
  };

  // funcion que le pega a la API para buscar a otros usuarios por su nombre
  const buscarUsuarios = async () => {
    // le pongo un freno para que no busque si escribi menos de 2 letras
    if (busqueda.length < 2) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/usuarios/buscar/${busqueda}`);
      setResultados(await res.json());
    } catch (err) {
      console.error("Error al buscar:", err);
    }
  };

  // funcion para mandarle una solicitud de amistad a otro usuario usando su ID
  const solicitarAmistad = async (id_destino) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/amistades/solicitar?id_origen=${user.id}&id_destino=${id_destino}`, { method: 'POST' });
      const data = await res.json();
      // muestro un cartelito nativo del navegador con la respuesta del servidor
      alert(data.mensaje);
    } catch (err) {
      console.error("Error al enviar:", err);
    }
  };

  // funcion para aceptar o rechazar la solicitud que me mandaron
  const responderSolicitud = async (id_origen, aceptar) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/amistades/responder?id_origen=${id_origen}&id_destino=${user.id}&aceptar=${aceptar}`, { method: 'POST' });
      // si todo salio bien recargo las listas para que desaparezca la notificacion y aparezca en amigos si lo acepte
      cargarPendientes(); 
      cargarAmigos();     
    } catch (err) {
      console.error("Error al responder:", err);
    }
  };

  // pantalla de bloqueo rapida por si alguien intenta entrar por la URL sin iniciar sesion
  if (!user) return <div className="min-h-screen bg-cine-bg text-white pt-32 text-center text-2xl font-black">Inicia sesion para usar la Comunidad.</div>;

  return (
    // contenedor principal de la pantalla con margenes y fondo oscuro
    <div className="min-h-screen bg-cine-bg pt-32 px-8 lg:px-24 text-white">
      <h1 className="text-5xl font-black italic uppercase mb-12">Comunidad Social</h1>
      
      {/* grilla que divide la pantalla en dos columnas grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* COLUMNA IZQUIERDA: aca pongo el buscador de gente y las notificaciones de solicitudes */}
        <div>
          <h3 className="text-2xl font-black text-cine-accent mb-6 uppercase tracking-widest border-b border-white/10 pb-2">Buscar Usuarios</h3>
          
          {/* fila del buscador con su input y su boton */}
          <div className="flex gap-4 mb-8">
            <input 
              type="text" placeholder="Ej: Pedro..."
              className="bg-cine-panel border border-white/10 p-3 rounded-xl w-full outline-none focus:border-cine-accent"
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button onClick={buscarUsuarios} className="bg-cine-accent px-6 py-2 rounded-xl font-bold uppercase">Buscar</button>
          </div>

          {/* lista donde renderizo los resultados de la busqueda */}
          <div className="flex flex-col gap-3 mb-12">
            {resultados.map((u) => (
              <div key={u.id} className="bg-cine-panel p-4 rounded-xl flex justify-between items-center border border-white/5">
                <span className="font-bold">{u.nombre}</span>
                {/* me aseguro de no mostrar el boton de agregar si el resultado soy yo mismo */}
                {u.id !== user.id && (
                  <button onClick={() => solicitarAmistad(u.id)} className="bg-white/10 px-4 py-1 rounded text-xs font-bold uppercase hover:bg-cine-accent transition">
                    + Agregar
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* bloque de notificaciones: solo lo renderizo si tengo alguna solicitud pendiente */}
          {pendientes.length > 0 && (
            <div className="bg-cine-accent/10 border border-cine-accent/30 p-6 rounded-2xl">
              <h3 className="text-xl font-black mb-4 uppercase flex items-center gap-2">
                {/* circulito rojo que marca la cantidad de notificaciones */}
                <span className="bg-cine-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">{pendientes.length}</span>
                Solicitudes Pendientes
              </h3>
              
              {/* lista de las solicitudes con sus botones para aceptar o rechazar */}
              <div className="flex flex-col gap-3">
                {pendientes.map((p) => (
                  <div key={p.id_origen} className="flex justify-between items-center bg-black/40 p-3 rounded-xl">
                    <span className="font-bold">{p.nombre} quiere ser tu amigo</span>
                    <div className="flex gap-2">
                      {/* Le paso true para aceptar y false para rechazar a mi funcion */}
                      <button onClick={() => responderSolicitud(p.id_origen, true)} className="bg-green-600 px-3 py-1 rounded text-xs font-black uppercase hover:scale-105">Aceptar</button>
                      <button onClick={() => responderSolicitud(p.id_origen, false)} className="bg-red-600 px-3 py-1 rounded text-xs font-black uppercase hover:scale-105">X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: aca muestro la lista definitiva de mis amigos */}
        <div>
          <h3 className="text-2xl font-black text-cine-accent mb-6 uppercase tracking-widest border-b border-white/10 pb-2">Mis Amigos</h3>
          
          {/* renderizado condicional por si todavia no agregue a nadie */}
          {amigos.length === 0 ? (
            <p className="text-gray-500 italic">Aun no tienes amigos. ¡Busca usuarios y agregalos para ver sus peliculas!</p>
          ) : (
            // lista de mis amigos confirmados
            <div className="grid grid-cols-1 gap-4">
              {amigos.map((amigo) => (
                <div key={amigo.id} className="bg-cine-panel p-6 rounded-2xl flex justify-between items-center border border-white/5 hover:border-cine-accent transition-colors group">
                  <div className="flex items-center gap-4">
                    {/* le armo un avatar provisorio agarrando la primera letra de su nombre */}
                    <div className="w-12 h-12 bg-cine-accent rounded-full flex items-center justify-center font-black text-xl">{amigo.nombre[0].toUpperCase()}</div>
                    <span className="font-bold text-xl">{amigo.nombre}</span>
                  </div>
                  {/* link que me lleva a la boveda de este amigo pasando su ID por la URL */}
                  <Link to={`/boveda/${amigo.id}`} className="text-gray-400 font-black uppercase text-xs tracking-widest group-hover:text-white transition underline underline-offset-4">
                    Ver Boveda →
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