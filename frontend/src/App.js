import './App.css';
import './components/Login/Login.css';
import Login from './components/Login/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Calendar from './components/calendar/Calendar';
import Navbar from "./components/Navbar";
import AnnouncementPage from "./components/announcements/AnnouncementPage";
import Homepage from './components/homepage/Home.js'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Switch>
        <Route path="/" exact></Route>
        <Route path="/login"><Login /></Route>
        <Route path="/announcements"> <AnnouncementPage> </AnnouncementPage></Route>
        <Route path="/login/:type"></Route>
        <Route path="/home"><Homepage /></Route>
        <Route path="/calendar"> {/* Temporary route for now */}
          <Calendar accountType="volunteer" />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
