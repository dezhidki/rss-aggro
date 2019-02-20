/*
 * The entry point of the application. 
 */

// Parcel allows to import CSS files directly through JS
import "./css/fontello.css";

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

// This is the app's state store. We keep ALL of the app's state in here to modify it (with the help of redux).
import store from "./store";
import { getUser, getLatestStories } from "./actions";

import { App } from "./containers";

// Here is the entry point of React components
// We wrap the App in a Provider that connects redux and React together.
// Later, we will also use connect() function that binds the redux state to React component state through props
ReactDOM.render((
    <Provider store={store}>
        <App />
    </Provider>)
    , document.getElementById("root"));

// We subscribe to the next events
// This is done to wait until getUser action is complete
// Otherwise the App will display an error message for new users
const unsubscribe = store.subscribe(() => {
    let state = store.getState();

    if (state.app.user.nickname !== undefined) {
        unsubscribe();

        // We'll also get the latest stories beforehand, since it's the default view
        // We'll set a timeout due to server's slow write times
        // We do this in the hope that writes won't take too long. Otherwise, we'll just ask user to refresh...
        setTimeout(() => store.dispatch(getLatestStories()), 100);
    }
});

// We'll call getUser first to get user data!
store.dispatch(getUser());






