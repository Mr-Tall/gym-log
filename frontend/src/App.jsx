import WorkoutLogForm from './components/WorkoutLogForm.jsx';
import Navbar from './components/Navbar.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto mt-10 px-4">
        <WorkoutLogForm onSubmit={(data) => console.log('Workout submitted:', data)} />
      </main>
    </>
  );
}
