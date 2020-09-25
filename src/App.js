import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter as Router,
} from 'react-router-dom';

// components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Container from './components/Container';

// pages
import Home from './pages/Home';
import Login from './pages/Login';
import Landing from './pages/Landing';

// resources
import { routesAgent, routesClient } from './resources/data/sidebar/routes';

const pages = {
  Home,
};

function App() {
  const [routes, setRoutes] = useState([]);
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    switch (auth.type) {
      case 'client':
        setRoutes([...routesClient]);
        break;

      case 'agent':
        setRoutes([...routesAgent]);
        break;

      default:
        setRoutes([]);
        break;
    }
  }, [auth, auth.type]);

  return (
    <Router>
      <Header />
      {routes.length > 0 && <Sidebar />}
      <Container />
      <Switch>
        <Route exact path="/">
          <Landing />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        {routes.map((route, index) => (
          <Route key={index} path={route.path}>
            {React.createElement(pages[route.component])}
          </Route>
        ))}
      </Switch>
    </Router>
  );
}

export default App;
