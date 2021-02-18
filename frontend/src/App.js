import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Calendar from './components/calendar/Calendar';
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Switch>
        <Route path="/" exact></Route>
        <Route path="/login"></Route>
        <Route path="/login/:type"></Route>
        <Route path="/calendar"> {/* Temporary route for now */}
          <Calendar accountType="volunteer" />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
