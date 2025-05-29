import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import WorkoutLogForm from './components/WorkoutLogForm';
import WorkoutHistory from './components/WorkoutHistory';
import AuthForm from './components/AuthForm';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  if (!user) return <AuthForm onLogin={setUser} />;

  return (
    <Router>
      <nav className="bg-gray-100 p-4 flex justify-center space-x-6">
        <Link to="/" className="text-blue-600 hover:underline">Log Workout</Link>
        <Link to="/history" className="text-blue-600 hover:underline">View History</Link>
      </nav>

      <main className="max-w-xl mx-auto mt-10 px-4">
        <Routes>
          <Route path="/" element={<WorkoutLogForm user={user} />} />
          <Route path="/history" element={<WorkoutHistory user={user} />} />
        </Routes>
      </main>
    </Router>
  );
}

