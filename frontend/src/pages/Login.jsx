/*componente para la pantalla de inicio de sesion de la app
  aca arme un formulario donde el usuario puede poner su mail y su clave 
  me conecto directamente a mi backend para validar los datos y si esta todo bien 
  le guardo la sesion en el navegador y lo devuelvo exactamente a la pagina donde estaba antes de loguearse
*/

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthBackground from '../components/AuthBackground';

export default function Login() {
  const navigate = useNavigate();
  
  // armo mis estados para guardar lo que escribe el usuario si quiere ver la clave los errores y la carga
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // funcion que se dispara cuando el usuario toca el boton de entrar
  const handleSubmit = async (e) => {
    // freno el comportamiento por defecto del formulario para que no me recargue la pagina
    e.preventDefault();
    
    // limpio cualquier error viejo y prendo el estado de carga
    setError('');
    setLoading(true);

    try {
      // le pego a mi API en el backend mandando los datos del formulario
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // si el backend me dice que algo fallo tiro un error y corto la ejecucion
      if (!response.ok) throw new Error(data.detail || 'Credenciales incorrectas');

      // si paso todo bien guardo al usuario en el almacenamiento local
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      
      // le paso un -1 al navigate para decirle al navegador que retroceda un paso en el historial
      navigate(-1);
    } catch (err) {
      // si atrape algun error lo guardo en el estado para mostrarlo en pantalla
      setError(err.message);
    } finally {
      // pase lo que pase apago el estado de carga
      setLoading(false);
    }
  };

  // componentes chiquitos de iconos SVG para el ojo de la clave
  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
  );
  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
  );

  return (
    // contenedor principal que ocupa toda la pantalla y esconde los desbordes
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center px-6 pt-24 relative">
      
      {/* fondo infinito animado con portadas de peliculas */}
      <AuthBackground /> 

      {/* tarjeta de cristal donde va el formulario de login */}
      <div className="w-full max-w-md bg-cine-panel/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        
        {/* detalle visual */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cine-accent to-transparent"></div>

        {/* textos de bienvenida */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-tighter">Bienvenido a Cine<span className="text-cine-accent">Synth</span>.</h2>
          <p className="text-gray-400 text-sm mt-2">Accede a tu boveda personal</p>
        </div>

        {/* bloque para mostrar el mensaje de error condicionalmente si es que hay uno */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-widest p-3 rounded text-center">
            {error}
          </div>
        )}

        {/* el formulario propiamente dicho atado a mi funcion handleSubmit */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* input para el correo electronico */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Email</label>
            <input 
              type="email" required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cine-accent transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          
          {/* input para la contraseña con boton de mostrar/ocultar integrado */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Contraseña</label>
            <div className="relative">
              {/* le cambio el type dinamicamente entre text y password segun el estado */}
              <input 
                type={showPassword ? "text" : "password"} required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black/50 border border-white/10 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-cine-accent transition-colors"
                placeholder="••••••••"
              />
              {/* boton posicionado de forma absoluta a la derecha para tocar el ojito */}
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cine-accent transition-colors"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          
          {/* boton de envio que se bloquea y cambia su texto cuando esta cargando */}
          <button type="submit" disabled={loading} className="w-full bg-cine-accent hover:bg-cine-accent-hover disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-sm mt-8 shadow-lg shadow-cine-accent/20">
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        {/* enlace para ir al formulario de registro si el usuario es nuevo */}
        <p className="text-gray-500 text-xs text-center mt-8 font-medium">
          ¿No tenes cuenta? <Link to="/registro" className="text-white hover:text-cine-accent font-black transition-colors">Registrate aca</Link>
        </p>
      </div>
      
      {/* boton para retroceder comodamente al home */}
      <Link to="/" className="mt-8 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors relative z-10 drop-shadow-md">
        ← Volver al inicio
      </Link>
    </div>
  );
}