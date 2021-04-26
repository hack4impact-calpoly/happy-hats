
import './App.css';

import './components/Login/Login.css';
import Login from './components/Login/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Calendar from './components/calendar/Calendar';
import Navbar from "./components/Navbar";
import StandardPage from "./components/standard-page/StandardPage";
import AnnouncementPage from "./components/announcements/AnnouncementPage";
import Homepage from './components/homepage/Home.js'
import { useState } from 'react'
import Volunteer from "./components/volunteer/Volunteer";
import GoogleSignIn from "./components/Login/GoogleSignIn";
import Store from './store/Store';
import CreateAnnouncementBlock from "./components/announcements/CreateAnnouncementBlock";
import Footer from "./components/Footer/Footer";

function App() {
  const [userObj, setUserObj] = useState({
    username: null,
    name: null,
    role: null,
  })

  return (
    <Store>
      <BrowserRouter>
        <StandardPage>
          <Navbar />
          <Switch>
            <Route path="/" exact></Route>
            <Route path="/login"><Login /></Route>
            <Route path="/home"><Homepage user={userObj}/></Route>
            <Route path="/announcements"> <AnnouncementPage> </AnnouncementPage></Route>
            <Route path="/create-announcements"> <CreateAnnouncementBlock> </CreateAnnouncementBlock></Route>
            <Route path="/volunteer"> <Volunteer> </Volunteer></Route>
            <Route path="/login/:type"></Route>
            <Route path="/calendar"> {/* Temporary route for now */}
              <Calendar />
            </Route>
          </Switch>
        </StandardPage>
      </BrowserRouter>
    </Store>
  );
}

export default App;
