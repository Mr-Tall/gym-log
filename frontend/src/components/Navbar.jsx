// components/Navbar.jsx
export default function Navbar({ onLogout, onNavigate }) {
  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
      <div className="text-xl font-bold">Gym Tracker</div>
      <div className="space-x-4">
        <button
          onClick={() => onNavigate('log')}
          className="hover:underline"
        >
          Log Workout
        </button>
        <button
          onClick={() => onNavigate('history')}
          className="hover:underline"
        >
          Workout History
        </button>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
