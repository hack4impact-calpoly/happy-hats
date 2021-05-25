import './App.css';
import Login from './components/Login/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route } from "react-router-dom";
import StandardPage from "./components/standard-page/StandardPage";
import Store from './store/Store';
import AuthRequiredLinks from './components/AuthRequiredLinks';


function App() {
  return (
    <Store>
      <BrowserRouter>
        <StandardPage>
          <Route path="/login"><Login /></Route>
          <AuthRequiredLinks />
        </StandardPage>
      </BrowserRouter>
    </Store>
  );
}

export default App;
