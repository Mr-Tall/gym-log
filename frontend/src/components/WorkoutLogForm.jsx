import { useState } from 'react';

export default function WorkoutLogForm({ onSubmit }) {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState([{ weight: '', reps: '', toFailure: false }]);

  const handleChange = (i, field, value) => {
    const newSets = [...sets];
    newSets[i][field] = value;
    setSets(newSets);
  };

  const addSet = () => {
    setSets([...sets, { weight: '', reps: '', toFailure: false }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ exercise, sets });
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
      <button type="button" onClick={addSet} className="bg-gray-300 px-3 py-1 rounded">
        + Set
      </button>
      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded ml-2">
        Save
      </button>
    </form>
  );
}
