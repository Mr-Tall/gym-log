import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function WorkoutLogForm({ user }) {
  const [workoutId, setWorkoutId] = useState(null);
  const [title, setTitle] = useState('');
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState([{ weight: '', reps: '', toFailure: false }]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [loggedExercises, setLoggedExercises] = useState([]);

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
        setTitle(data.title || '');
      } else {
        const { data: newWorkout, error: insertError } = await supabase
          .from('workouts')
          .insert([{ user_id: user.id, date: today, title: '' }])
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

  useEffect(() => {
    const fetchLoggedExercises = async () => {
      if (!workoutId) return;

      const { data: exercises, error } = await supabase
        .from('exercises')
        .select('id, name, sets (id, weight, reps, to_failure)')
        .eq('workout_id', workoutId);

      if (error) console.error('Fetch error:', error.message);
      else setLoggedExercises(exercises);
    };

    fetchLoggedExercises();
  }, [workoutId, refreshCount]);

  const handleChange = (i, field, value) => {
    const newSets = [...sets];
    newSets[i][field] = value;
    setSets(newSets);
  };

  const addSet = () => {
    setSets([...sets, { weight: '', reps: '', toFailure: false }]);
  };

  const updateWorkoutTitle = async (newTitle) => {
    if (!workoutId) return;
    const { error } = await supabase
      .from('workouts')
      .update({ title: newTitle })
      .eq('id', workoutId);
    if (error) console.error('Error updating title:', error.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workoutId || !exercise) return;

    if (title) await updateWorkoutTitle(title);

    let exerciseId = null;
    const existing = loggedExercises.find(
      (e) => e.name.toLowerCase() === exercise.toLowerCase()
    );

    if (existing) {
      exerciseId = existing.id;
    } else {
      const { data: newEx, error } = await supabase
        .from('exercises')
        .insert([{ workout_id: workoutId, name: exercise }])
        .select()
        .single();

      if (error) return console.error('Error adding new exercise:', error.message);
      exerciseId = newEx.id;
    }

    const setsWithExerciseId = sets.map(set => ({
      weight: set.weight,
      reps: set.reps,
      to_failure: set.toFailure,
      exercise_id: exerciseId,
    }));

    const { error: setsErr } = await supabase.from('sets').insert(setsWithExerciseId);
    if (setsErr) return console.error('Error saving sets:', setsErr.message);

    setExercise('');
    setSets([{ weight: '', reps: '', toFailure: false }]);
    setRefreshCount(c => c + 1);
  };

  const deleteSet = async (setId) => {
    const { error } = await supabase.from('sets').delete().eq('id', setId);
    if (error) console.error('Error deleting set:', error.message);
    setRefreshCount(c => c + 1);
  };

  const deleteExercise = async (exerciseId) => {
    const { error } = await supabase.from('exercises').delete().eq('id', exerciseId);
    if (error) console.error('Error deleting exercise:', error.message);
    setRefreshCount(c => c + 1);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Workout Title (e.g., Day 1)"
          className="w-full p-2 rounded bg-white text-black placeholder-gray-500 border border-gray-300"
        />
        <input
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Exercise name"
          className="w-full p-2 rounded bg-white text-black placeholder-gray-500 border border-gray-300"
        />
        {sets.map((set, i) => (
          <div key={i} className="flex space-x-2">
            <input
              value={set.weight}
              onChange={(e) => handleChange(i, 'weight', e.target.value)}
              placeholder="Weight"
              className="p-2 rounded bg-white text-black placeholder-gray-500 border border-gray-300 w-1/3"
            />
            <input
              value={set.reps}
              onChange={(e) => handleChange(i, 'reps', e.target.value)}
              placeholder="Reps"
              className="p-2 rounded bg-white text-black placeholder-gray-500 border border-gray-300 w-1/3"
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
      </form>

      {loggedExercises.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Today's Exercises</h2>
          {loggedExercises.map((ex) => (
            <div key={ex.id} className="mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{ex.name}</h3>
                <button
                  onClick={() => deleteExercise(ex.id)}
                  className="text-red-500 text-sm underline"
                >
                  Delete Exercise
                </button>
              </div>
              <ul className="ml-4 list-disc">
                {ex.sets.map((set, i) => (
                  <li key={set.id} className="flex justify-between items-center">
                    <span>
                      {set.weight} lbs × {set.reps} {set.to_failure ? '(to failure)' : ''}
                    </span>
                    <button
                      onClick={() => deleteSet(set.id)}
                      className="text-sm text-red-500 ml-4"
                    >
                      Delete Set
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="mt-2 text-blue-600 underline"
                onClick={() => {
                  setExercise(ex.name);
                  setSets([{ weight: '', reps: '', toFailure: false }]);
                }}
              >
                Add more sets to this exercise
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
