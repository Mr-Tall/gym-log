import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import WorkoutLogForm from './components/WorkoutLogForm';
import Navbar from './components/Navbar';
import AuthForm from './components/AuthForm';
import WorkoutHistory from './components/WorkoutHistory';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('log'); // 'log' or 'history'

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setUser(null);
    else console.error('Logout error:', error.message);
  };

  if (!user) return <AuthForm onLogin={setUser} />;

  return (
    <>
      <Navbar onLogout={handleLogout} onNavigate={setView} />
      <main className="max-w-xl mx-auto mt-10 px-4">
        {view === 'log' ? (
          <WorkoutLogForm user={user} />
        ) : (
          <WorkoutHistory user={user} />
        )}
      </main>
    </>
  );
}
