import "./App.css";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Navbar />
        <Route path="/" exact></Route>
        <Route path="/login"></Route>
        <Route path="/login/:type"></Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
