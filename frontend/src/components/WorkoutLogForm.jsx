import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function WorkoutLogForm({ user }) {
  const [workoutId, setWorkoutId] = useState(null);
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState([{ weight: '', reps: '', toFailure: false }]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadOrCreateWorkout = async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading workout:', error.message);
        return;
      }

      if (data) {
        setWorkoutId(data.id);
      } else {
        // Create new workout
        const { data: newWorkout, error: insertError } = await supabase
          .from('workouts')
          .insert([{ user_id: user.id, date: today }])
          .select()
          .single();
        if (insertError) {
          console.error('Error creating workout:', insertError.message);
        } else {
          setWorkoutId(newWorkout.id);
        }
      }
    };

    if (user) loadOrCreateWorkout();
  }, [user]);

  const handleChange = (i, field, value) => {
    const newSets = [...sets];
    newSets[i][field] = value;
    setSets(newSets);
  };

  const addSet = () => {
    setSets([...sets, { weight: '', reps: '', toFailure: false }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workoutId) return;

    const { data: exerciseData, error: exErr } = await supabase
      .from('exercises')
      .insert([{ workout_id: workoutId, name: exercise }])
      .select()
      .single();

    if (exErr) return console.error('Error adding exercise:', exErr.message);

    const setsWithExerciseId = sets.map(set => ({
      ...set,
      exercise_id: exerciseData.id,
    }));

    const { error: setsErr } = await supabase.from('sets').insert(setsWithExerciseId);
    if (setsErr) return console.error('Error saving sets:', setsErr.message);

    setStatus('Saved!');
    setExercise('');
    setSets([{ weight: '', reps: '', toFailure: false }]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        placeholder="Exercise name"
        className="border w-full p-2"
      />
      {sets.map((set, i) => (
        <div key={i} className="flex space-x-2">
          <input
            value={set.weight}
            onChange={(e) => handleChange(i, 'weight', e.target.value)}
            placeholder="Weight"
            className="border p-2 w-1/3"
          />
          <input
            value={set.reps}
            onChange={(e) => handleChange(i, 'reps', e.target.value)}
            placeholder="Reps"
            className="border p-2 w-1/3"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={set.toFailure}
              onChange={(e) => handleChange(i, 'toFailure', e.target.checked)}
              className="mr-1"
            />
            Failure
          </label>
        </div>
      ))}
      <div className="space-x-2">
        <button type="button" onClick={addSet} className="bg-gray-300 px-3 py-1 rounded">+ Set</button>
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
      </div>
      {status && <p className="text-green-500">{status}</p>}
    </form>
  );
}
