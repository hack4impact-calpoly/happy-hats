import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Calendar from './components/calendar/Calendar';

function App() {
  return (
    <div className="App">
      <Calendar accountType="volunteer" />
    </div>
  );
}

export default App;
