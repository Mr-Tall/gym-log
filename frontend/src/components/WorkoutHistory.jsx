import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function WorkoutHistory({ user }) {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, title, date, exercises (name, sets (weight, reps, to_failure))')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) console.error('Error fetching history:', error.message);
      else setWorkouts(data);
    };

    if (user) fetchWorkouts();
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Workout History</h1>
      {workouts.length === 0 && <p>No workouts found.</p>}

      {workouts.map(workout => (
        <div key={workout.id} className="mb-6 border rounded p-4">
          <h2 className="text-xl font-semibold">{workout.title || 'Untitled'} - {workout.date}</h2>

          {workout.exercises.map((ex, i) => (
            <div key={i} className="mt-2">
              <h3 className="font-medium text-lg">{ex.name}</h3>
              <ul className="ml-4 list-disc">
                {ex.sets.map((set, j) => (
                  <li key={j}>
                    {set.weight} lbs × {set.reps} {set.to_failure ? '(to failure)' : ''}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
