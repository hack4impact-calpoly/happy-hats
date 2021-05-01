import './App.css';
import './components/Login/Login.css';
import Login from './components/Login/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import StandardPage from "./components/standard-page/StandardPage";
import Store from './store/Store';
import AuthRequiredLinks from './components/AuthRequiredLinks';


function App() {
  return (
    <Store>
      <BrowserRouter>
        <StandardPage>
          <Route path="/login"><Login></Login></Route>
          <AuthRequiredLinks></AuthRequiredLinks>
        </StandardPage>
      </BrowserRouter>
    </Store>
  );
}

export default App;
