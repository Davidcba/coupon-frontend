import { useState } from 'react';
import { signInWithEmailAndPassword, getIdTokenResult } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await getIdTokenResult(cred.user);
      if (tokenResult.claims.admin || tokenResult.claims.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Email o contraseña inválidos');
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center pb-50 p-4 relative overflow-hidden">
    {/* Responsive backgrounds */}
    <div className="absolute inset-0 block md:hidden">
      <img src="/LoginBackgroundMobile.png" alt="background mobile" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 hidden md:block">
      <img src="/LogginBackgroundDesktop.png" alt="background desktop" className="w-full h-full object-cover" />
    </div>

    {/* Optional arrows background */}
    <div className="absolute left-0 top-1/3 transform -translate-y-1/2 opacity-10 z-0">
      <svg width="150" height="150" viewBox="0 0 24 24" fill="none">
        <path d="M2 12L22 2V22L2 12Z" fill="white" fillOpacity="0.2"/>
      </svg>
    </div>

    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative z-10">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        ¡Bienvenido de vuelta!
      </h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        Ingresa con tu cuenta
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input
          type="email"
          placeholder="userexample@.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="text-right text-sm">
          <a href="#" className="text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña? Haz click aquí para recuperarla.
          </a>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#E55049] text-white font-bold rounded-xl hover:bg-red-600"
        >
          Ingresar
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        ¿No tienes una cuenta?{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Contacta con tu administrador.
        </a>
      </p>
    </div>
  </div>
);

}
