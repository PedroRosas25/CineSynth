import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthBackground from '../components/AuthBackground';

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para ocultar/mostrar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para medir la fuerza de la contraseña
  const calcularFuerza = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // De 0 a 5
  };

  const fuerza = calcularFuerza(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación extra antes de enviar al backend
    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'Error al registrarse');

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Iconos SVG para el ojito
  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
  );
  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center px-6 pt-24 relative">
      
      <AuthBackground /> {/* El fondo de pósteres */}

      <div className="w-full max-w-md bg-cine-panel/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cine-accent to-transparent"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-tighter">Crear Cuenta</h2>
          <p className="text-gray-400 text-sm mt-2">Iniciá tu archivo en CineSynth.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-widest p-3 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Nombre de Usuario</label>
            <input 
              type="text" required
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cine-accent transition-colors"
              placeholder="Ej: PedroCinefilo"
            />
          </div>
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
          
          {/* CAMPO: CONTRASEÑA */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black/50 border border-white/10 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-cine-accent transition-colors"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cine-accent transition-colors"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            
            {/* MEDIDOR DE SEGURIDAD */}
            {formData.password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-grow h-1.5">
                  <div className={`flex-1 rounded-full ${fuerza >= 1 ? (fuerza < 3 ? 'bg-red-500' : fuerza < 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-800'}`}></div>
                  <div className={`flex-1 rounded-full ${fuerza >= 3 ? (fuerza < 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-800'}`}></div>
                  <div className={`flex-1 rounded-full ${fuerza >= 5 ? 'bg-green-500' : 'bg-gray-800'}`}></div>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-500 w-12 text-right">
                  {fuerza < 3 ? 'Débil' : fuerza < 4 ? 'Buena' : 'Fuerte'}
                </span>
              </div>
            )}
          </div>

          {/* CAMPO: REPETIR CONTRASEÑA */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Repetir Contraseña</label>
            <div className="relative">
              <input 
                type={showConfirm ? "text" : "password"} required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-black/50 border text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none transition-colors ${confirmPassword && formData.password !== confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-cine-accent'}`}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cine-accent transition-colors"
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-cine-accent hover:bg-cine-accent-hover disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-sm mt-8 shadow-lg shadow-cine-accent/20">
            {loading ? 'Procesando...' : 'Registrarme'}
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-8 font-medium">
          ¿Ya tenés cuenta? <Link to="/login" className="text-white hover:text-cine-accent font-black transition-colors">Ingresá acá</Link>
        </p>
      </div>
      
      <Link to="/" className="mt-8 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors relative z-10 drop-shadow-md">
        ← Volver al inicio
      </Link>
    </div>
  );
}