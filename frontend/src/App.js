import "./App.css";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Header from './components/Header';
import AnnouncementPage from './pages/AnnouncementPage.js';

function App() {
  return (
    <BrowserRouter>
    <Header></Header>
      <Switch>
        <Route path="/" exact></Route>
        <Route path="/login"></Route>
        <Route path="/announcements">
          <AnnouncementPage></AnnouncementPage>
        </Route>
        <Route path="/login/:type"></Route>
      </Switch>
    </BrowserRouter>

  );
}

export default App;