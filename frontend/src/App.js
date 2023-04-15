import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import HomePage from "./components/HomePage";
import DetailPage from "./components/DetailPage";
import CreateSpot from "./components/CreateSpot";
import ManageSpots from "./components/ManageSpots";
import UpdateSpotForm from "./components/UpdateSpotForm";
import LoginFormPage from "./components/LoginFormPage";
import SignupFormPage from "./components/SignupFormPage";
import { fetchSpots } from "./store/spots";
import { fetchUserSpots } from "./store/spots";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(()=> dispatch(fetchSpots())).then(()=> dispatch(fetchUserSpots())).then(() => setIsLoaded(true));
  }, [dispatch]);


  //dont need login and signup but kep them in might delete or comment out
  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route path="/spots/new">
            <CreateSpot />
          </Route>
          <Route path="/spots/current">
            <ManageSpots />
          </Route>
          <Route path="/spots/:spotId/edit">
            <UpdateSpotForm />
          </Route>
          <Route path="/spots/:spotId">
            <DetailPage />
          </Route>
          <Route exact path="/login">
            <LoginFormPage />
          </Route>
          <Route exact path="/signup">
            <SignupFormPage />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;