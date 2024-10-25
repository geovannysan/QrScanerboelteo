import React, { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import ExploreContainer from './components/ExploreContainer';
import Login from './pages/Index'; // Import Login page

setupIonicReact();

const App: React.FC = () => (

  <IonReactRouter>
    <IonRouterOutlet>
      <Switch>
        <Route exact path="/home" component={ExploreContainer} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/" render={() => <Redirect to="/login" />} />
      </Switch>
    </IonRouterOutlet>
  </IonReactRouter>

);

export default App;
