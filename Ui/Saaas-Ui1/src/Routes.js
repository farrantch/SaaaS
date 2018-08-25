import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import AppliedRoute from "./components/AppliedRoute";
import Signup from "./containers/Signup";
// import NewReservation from "./containers/NewReservation";
// import Reservation from "./containers/Reservation";
// import Reservations from "./containers/Reservations";
// import Accounts from "./containers/Accounts";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import Dashboard from "./containers/Dashboard";
// import NewAccount from "./containers/NewAccount";
import Profile from "./containers/Profile";
import Billing from "./containers/Billing";
import Docs from "./containers/Docs";
// import Payment from "./containers/Payment";

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
	  <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
	  <UnauthenticatedRoute path="/docs" exact component={Docs} props={childProps} />
    <AuthenticatedRoute path="/profile" exact component={Profile} props={childProps} />
    {/* <AuthenticatedRoute path="/payment" exact component={Payment} props={childProps} /> */}
    {/* <AuthenticatedRoute path="/reservations" exact component={Reservations} props={childProps} />
    <AuthenticatedRoute path="/reservations/new" exact component={NewReservation} props={childProps} />
    <AuthenticatedRoute path="/reservations/:id" exact component={Reservation} props={childProps} /> */}
    {/* <AuthenticatedRoute path="/accounts/new" exact component={NewAccount} props={childProps} /> */}
    <AuthenticatedRoute path="/dashboard" exact component={Dashboard} props={childProps} />
    <AuthenticatedRoute path="/billing" exact component={Billing} props={childProps} />
    {/* <AuthenticatedRoute path="/accounts" exact component={Accounts} props={childProps} /> */}
    {/* <AuthenticatedRoute path="/accounts/:id" exact component={Account} props={childProps} /> */}
    { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;