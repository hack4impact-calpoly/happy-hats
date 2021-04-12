
import './App.css';

import './components/Login/Login.css';
import Login from './components/Login/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Calendar from './components/calendar/Calendar';
import Navbar from "./components/Navbar";
import StandardPage from "./components/standard-page/StandardPage";
import AnnouncementPage from "./components/announcements/AnnouncementPage";
import CreateAnnouncementPage from "./components/announcements/CreateAnnouncementPage";
import GoogleSignIn from "./components/Login/GoogleSignIn";
import Store from './store/Store';

function App() {
  return (
    <Store>
      <BrowserRouter>
        <StandardPage>
          <Navbar />
          <Switch>
            <Route path="/" exact></Route>
            <Route path="/login"><Login /></Route>
            <Route path="/announcements"> <AnnouncementPage> </AnnouncementPage></Route>
            <Route path="/create-announcements"> <CreateAnnouncementPage> </CreateAnnouncementPage></Route>
            <Route path="/login/:type"></Route>
            <Route path="/calendar"> {/* Temporary route for now */}
              <Calendar />
            </Route>
          </Switch>
          <GoogleSignIn />
        </StandardPage>
      </BrowserRouter>
    </Store>
  );
}

export default App;
