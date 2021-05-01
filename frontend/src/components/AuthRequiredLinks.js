import withUser from "../store/user/WithUser";
import { Redirect, Route, Switch } from "react-router-dom";
import Calendar from '../components/calendar/Calendar';
import Navbar from "../components/Navbar";
import AnnouncementPage from "../components/announcements/AnnouncementPage";
import Homepage from '../components/homepage/Home.js'
import Volunteer from "../components/volunteer/Volunteer";
import CreateAnnouncementBlock from "../components/announcements/CreateAnnouncementBlock";


function AuthRequiredLinks(props) {
    if(!props.user || !props.user.loggedIn){
        return <Redirect to='/login' />;
    }
    return (
        <>
        <Navbar />
        <Switch>
            <Route path="/" exact></Route>
            <Route path="/home"><Homepage /></Route>
            <Route path="/announcements"> <AnnouncementPage> </AnnouncementPage></Route>
            <Route path="/create-announcements"> <CreateAnnouncementBlock> </CreateAnnouncementBlock></Route>
            <Route path="/volunteer"> <Volunteer> </Volunteer></Route>
            <Route path="/login/:type"></Route>
            <Route path="/calendar"> {/* Temporary route for now */}
            <Calendar />
            </Route>
        </Switch>
        </>
    );
  }
  
  export default withUser(AuthRequiredLinks);
  