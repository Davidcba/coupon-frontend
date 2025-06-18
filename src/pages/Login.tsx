import { useState } from 'react';
import { signInWithEmailAndPassword, getIdTokenResult } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const tokenResult = await getIdTokenResult(cred.user)
      if (tokenResult.claims.admin || tokenResult.claims.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error(err)
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3B3B98] p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/tucheck.svg" alt="TUCHECK Logo" className="h-10" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Welcome Back 👋
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Sign in to your account
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-500 text-white font-bold rounded hover:bg-red-600"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Contact your company admin.
          </a>
        </p>
      </div>
    </div>
  );
}
