/*
 *  State store -- the place that stores all the app's state (user data, loaded feeds, etc.)
 * 
 *  State changing and updating is done through redux -- a library that simply provides an 
 *  API to manage state and its change through events.
 * 
 *  The main reason for using redux is because of support for middleware -- libraries that
 *  handle communication between front-end and back-end.
 * 
 *  More info:
 * 
 *  actions.js -- Contains the actions that trigger state change events.
 *  Reducers.js -- Contains the functions that modify the state based on the caught event.
 */

import { createStore, applyMiddleware, combineReducers, compose} from "redux";

// We use API middleware that automatically communicates with our server using AJAX
// (Except it uses the newer Fetch API instead of the ancient XMLHttpRequest)
import { apiMiddleware } from "redux-api-middleware";

import * as app from "./reducers/Reducers";

const middleware = [apiMiddleware];

// This allows to debug the state using redux devtools extension for Chrome or Firefox
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Combines the reducers to to the state
// We store our state only in app parameter, but there can be more if needed
const reducers = combineReducers({
    app: app.default
});

// This creates the redux store that handles the state, event delegation and state modification
const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(...middleware))
);

export default store;