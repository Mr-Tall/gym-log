import { Link } from 'react-router-dom';

export default function Layout({ children, user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] text-white font-sans">
      <header className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-black/40 backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-wide text-yellow-400">🏋️ Gym Tracker</h1>
        <nav className="flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-yellow-400 transition">Log Workout</Link>
          <Link to="/history" className="hover:text-yellow-400 transition">Workout History</Link>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-[#1f1f1f] rounded-2xl shadow-lg p-6 md:p-10 border border-gray-800">
          {children}
        </div>
      </main>

      <footer className="text-center text-gray-400 text-sm pb-6">Made by a real gym rat 💪</footer>
    </div>
  );
}
