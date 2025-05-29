import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import WorkoutLogForm from './components/WorkoutLogForm';
import Navbar from './components/Navbar';
import AuthForm from './components/AuthForm';

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
    <>
      <Navbar />
      <main className="max-w-xl mx-auto mt-10 px-4">
        <WorkoutLogForm user={user} />
      </main>
    </>
  );
}
