import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function WorkoutLogForm({ user }) {
  const [workoutId, setWorkoutId] = useState(null);
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState([{ weight: '', reps: '', toFailure: false }]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [loggedExercises, setLoggedExercises] = useState([]);
  const [dayType, setDayType] = useState('');
  const [suggestions, setSuggestions] = useState({});

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
        setDayType(data.day_type || '');
      } else {
        if (!dayType) return;
        const { data: newWorkout, error: insertError } = await supabase
          .from('workouts')
          .insert([{ user_id: user.id, date: today, day_type: dayType }])
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
  }, [user, dayType]);

  useEffect(() => {
    const fetchLoggedExercises = async () => {
      if (!workoutId) return;

      const { data: exercises, error } = await supabase
        .from('exercises')
        .select('id, name, sets (weight, reps, to_failure)')
        .eq('workout_id', workoutId);

      if (error) console.error('Fetch error:', error.message);
      else setLoggedExercises(exercises);
    };

    fetchLoggedExercises();
  }, [workoutId, refreshCount]);

  useEffect(() => {
    const loadPreviousWorkoutSuggestions = async () => {
      if (!dayType || !user) return;

      const { data: previousWorkouts } = await supabase
        .from('workouts')
        .select('id, date')
        .eq('user_id', user.id)
        .eq('day_type', dayType)
        .lt('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(1);

      if (!previousWorkouts || previousWorkouts.length === 0) return;

      const lastWorkoutId = previousWorkouts[0].id;
      const { data: previousExercises } = await supabase
        .from('exercises')
        .select('name, sets (weight, reps)')
        .eq('workout_id', lastWorkoutId);

      const suggestMap = {};
      for (const ex of previousExercises) {
        const topSet = ex.sets.reduce((a, b) => (+a.weight > +b.weight ? a : b), { weight: 0 });
        suggestMap[ex.name.toLowerCase()] = {
          lastWeight: topSet.weight,
          suggested: parseFloat(topSet.weight) + 5
        };
      }
      setSuggestions(suggestMap);
    };

    loadPreviousWorkoutSuggestions();
  }, [dayType, user]);

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
    if (!workoutId || !exercise) return;

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

  return (
    <>
      {!workoutId && (
        <div className="mb-4">
          <label className="block font-semibold">What kind of day is this?</label>
          <select
            value={dayType}
            onChange={(e) => setDayType(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select a workout type</option>
            <option value="push">Push</option>
            <option value="pull">Pull</option>
            <option value="legs">Legs</option>
            <option value="full">Full Body</option>
            <option value="rest">Rest</option>
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Exercise name"
          className="border w-full p-2"
        />
        {suggestions[exercise.toLowerCase()] && (
          <p className="text-sm text-blue-600">
            Last: {suggestions[exercise.toLowerCase()].lastWeight} lbs → Try: {suggestions[exercise.toLowerCase()].suggested} lbs
          </p>
        )}
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
      </form>

      {loggedExercises.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Today's Exercises</h2>
          {loggedExercises.map((ex) => (
            <div key={ex.id} className="mb-6">
              <h3 className="text-lg font-semibold">{ex.name}</h3>
              <ul className="ml-4 list-disc">
                {ex.sets.map((set, i) => (
                  <li key={i}>
                    {set.weight} lbs × {set.reps} {set.to_failure ? '(to failure)' : ''}
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
