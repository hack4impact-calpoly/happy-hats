import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
 
import Login from './Login';
//import Dashboard from './Dashboard';
//import Home from './Home';
 
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div>
          <div className="header">
            <NavLink activeClassName="active" to="/login">Login</NavLink><small>(Access without token only)</small>
          </div>
          <div className="content">
            <Switch>
              <Route path="/login" component={Login} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}
 
export default App;