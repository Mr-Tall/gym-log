import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import WorkoutLogForm from './components/WorkoutLogForm';
import WorkoutHistory from './components/WorkoutHistory';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout'; // new layout component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
      <Routes>
        <Route
          path="/"
          element={
            <Layout user={user}>
              <WorkoutLogForm user={user} />
            </Layout>
          }
        />
        <Route
          path="/history"
          element={
            <Layout user={user}>
              <WorkoutHistory user={user} />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
