import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      onLogin(data.user);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to Gym Tracker</h1>
        <p className="mb-6 text-sm text-gray-300">Track your progress. Crush your goals. 💪</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 rounded bg-white text-black placeholder-gray-500 border border-gray-400"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 rounded bg-white text-black placeholder-gray-500 border border-gray-400"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
          >
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 text-sm text-yellow-300 hover:underline"
        >
          {isSignUp ? 'Already have an account? Log in.' : "Don't have an account? Sign up."}
        </button>
      </div>
    </div>
  );
}
