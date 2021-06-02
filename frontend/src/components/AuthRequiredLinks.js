import { Redirect, Switch } from "react-router-dom";
import Calendar from '../components/calendar/Calendar';
import AnnouncementPage from "../components/announcements/AnnouncementPage";
import Homepage from '../components/homepage/Home.js'
import Volunteer from "../components/volunteer/Volunteer";
import CreateAnnouncementBlock from "../components/announcements/CreateAnnouncementBlock";
import PrivateRoute from "./AuthRequiredRoute";

function AuthRequiredLinks() {
  return (
    <>
      <Switch>
        <PrivateRoute path="/" exact>
          <Redirect to="/home" />
        </PrivateRoute>
        <PrivateRoute path="/home">
          <Homepage />
        </PrivateRoute>
        <PrivateRoute requireValidRole path="/announcements">
          <AnnouncementPage />
        </PrivateRoute>
        <PrivateRoute requireValidRole path="/create-announcements">
          <CreateAnnouncementBlock />
        </PrivateRoute>
        <PrivateRoute requireSuperUserRole path="/volunteers">
          <Volunteer />
        </PrivateRoute>
        <PrivateRoute requireValidRole path="/calendar">
          <Calendar />
        </PrivateRoute>
      </Switch>
    </>
  );
}

export default AuthRequiredLinks;
