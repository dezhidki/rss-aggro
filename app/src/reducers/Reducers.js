/*
 * State reducers.
 * 
 * This file contains the reducers that modify the state.
 * 
 * The reducers are functions that, based on the event they react to,
 * take the app's state and return the new one.
 * 
 * Since we are not interesting in returning back in history, we are fine with only doing
 * shallow copying using the spread operator.
 */

// Redux Actions is a helper library that hides some of the boilerplate code
import { createAction, handleActions } from "redux-actions";
import * as action from "../actions";

const defaultUser = {
    nickname: undefined,
    favourite_stories: [],
    feeds: [],
    read_stories: []
};

const defaultState = {
    user: defaultUser,
    latest_stories: [],
    feeds: [],
    loaded_feeds: {},
    loading: false,
    lastError: null,
    options: {
        showRead: true
    }
};

// We create the final callable actions here.
// These mainly hide the boilerplate code for creating actions.

const getUser = createAction(action.GET_USER);
const getUserSuccess = createAction(action.GET_USER_SUCCESS);

const getFeeds = createAction(action.GET_FEEDS);
const getFeedsSuccess = createAction(action.GET_FEEDS_SUCCESS);

const getFeedContents = createAction(action.GET_FEED_CONTENTS);
const getFeedContentsSuccess = createAction(action.GET_FEED_CONTENTS_SUCCESS);

const setFeedsOrder = createAction(action.SET_FEEDS_ORDER);
const setFeedsOrderSuccess = createAction(action.SET_FEEDS_ORDER_SUCCESS);

const editFeed = createAction(action.EDIT_FEED);
const editFeedSuccess = createAction(action.EDIT_FEED_SUCCESS);

const deleteFeed = createAction(action.DELETE_FEED);
const deleteFeedSuccess = createAction(action.DELETE_FEED_SUCCESS);

const addUserFeed = createAction(action.ADD_USER_FEED);
const addUserFeedSuccess = createAction(action.ADD_USER_FEED_SUCCESS);

const addFavouriteItem = createAction(action.ADD_FAVOURITE_ITEM);
const addFavouriteItemSuccess = createAction(action.ADD_FAVOURITE_ITEM_SUCCESS);

const deleteFavouriteItem = createAction(action.DELETE_FAVOURITE_ITEM);
const deleteFavouriteItemSuccess = createAction(action.DELETE_FAVOURITE_ITEM_SUCCESS);

const setFavouritesOrder = createAction(action.SET_FAVOURITES_ORDER);
const setFavouritesOrderSuccess = createAction(action.SET_FAVOURITES_ORDER_SUCCESS);

const setItemRead = createAction(action.SET_ITEM_READ);
const setItemReadSuccess = createAction(action.SET_ITEM_READ_SUCCESS);

const clearReadItems = createAction(action.CLEAR_READ_ITEMS);
const clearReadItemsSuccess = createAction(action.CLEAR_READ_ITEMS_SUCCESS);

const getLatestStories = createAction(action.GET_LATEST_STORIES);
const getLatestStoriesSuccess = createAction(action.GET_LATEST_STORIES_SUCCESS);

const setShowRead = createAction(action.SET_SHOW_READ);

const reducer = handleActions({
    [action.GET_USER]: state => {
        return { ...state, user: defaultUser, loading: true, lastError: null };
    },
    [action.GET_USER_SUCCESS]: (state, action) => {
        return { ...state, user: action.payload };  // Don't disable loading, since we will call other method after getting user info!
    },
    [action.GET_FEEDS]: state => {
        return { ...state, feeds: [], loading: true, lastError: null };
    },
    [action.GET_FEEDS_SUCCESS]: (state, action) => {
        return { ...state, feeds: action.payload, loading: false };
    },
    [action.GET_FEED_CONTENTS]: state => {
        return { ...state, loading: true, lastError: null };
    },
    [action.GET_FEED_CONTENTS_SUCCESS]: (state, action) => {
        let new_state = { ...state, loading: false };
        action.payload["lastChecked"] = Date.now();
        new_state.loaded_feeds[action.payload["key"]] = action.payload;
        return new_state;
    },
    [action.SET_FEEDS_ORDER]: state => {
        return { ...state, lastError: null };
    },
    [action.SET_FEEDS_ORDER_SUCCESS]: (state, action) => {
        let new_state = { ...state };
        new_state.user.feeds = action.payload;
        return new_state;
    },
    [action.EDIT_FEED]: state => {
        return { ...state, lastError: null };           
    },
    [action.EDIT_FEED_SUCCESS]: (state, action) => {
        let new_state = { ...state };
        new_state.user.feeds = action.payload;
        return new_state;
    },
    [action.DELETE_FEED]: state => {
        return { ...state, loading: true, lastError: null };
    },
    [action.DELETE_FEED_SUCCESS]: (state, action) => {
        let new_state = { ...state, loading: false };
        new_state.user.feeds = action.payload;
        return new_state;
    },
    [action.ADD_USER_FEED]: state => {
        return { ...state, loading: true, lastError: null };
    },
    [action.ADD_USER_FEED_SUCCESS]: (state, action) => {
        let new_state = { ...state, loading: false };
        new_state.user.feeds = action.payload;
        return new_state;
    },
    [action.ADD_FAVOURITE_ITEM]: state => {
        return { ...state, lastError: null };
    },
    [action.ADD_FAVOURITE_ITEM_SUCCESS]: (state, action) => {
        let new_state = { ...state };
        new_state.user.favourite_stories = action.payload;
        return new_state;
    },
    [action.DELETE_FAVOURITE_ITEM]: state => {          // We don't raise loading flag on some events to prevent the spinner form appearing
        return { ...state, lastError: null };
    },
    [action.DELETE_FAVOURITE_ITEM_SUCCESS]: (state, action) => {
        let new_state = { ...state };
        new_state.user.favourite_stories = action.payload;
        return new_state;
    },
    [action.SET_FAVOURITES_ORDER]: state => {
        return { ...state, loading: true };
    },
    [action.SET_FAVOURITES_ORDER_SUCCESS]: (state, action) => {
        let new_state = { ...state, loading: false };
        new_state.user.favourite_stories = action.payload;
        return new_state;
    },
    [action.SET_ITEM_READ]: state => {
        return { ...state, lastError: null };
    },
    [action.SET_ITEM_READ_SUCCESS]: (state, action) => {
        let new_state = { ...state };
        new_state.user.read_stories = action.payload;
        return new_state;
    },
    [action.CLEAR_READ_ITEMS]: state => {
        return { ...state, loading: true, lastError: null };
    },
    [action.CLEAR_READ_ITEMS_SUCCESS]: state => {
        let new_state = { ...state, loading: false };
        new_state.user.read_stories = [];
        return new_state;
    },
    [action.GET_LATEST_STORIES]: state => {
        return { ...state, loading: true, lastError: null };
    },
    [action.GET_LATEST_STORIES_SUCCESS]: (state, action) => {
        return { ...state, latest_stories: action.payload, loading: false };
    },
    [action.API_FAILURE]: (state, action) => {
        let message;
        if(action.payload.response)
            message = action.payload.response.error;
        else
            message = action.payload.message + " (This is an unexpected error! Please inform the developer!)";
        return {...state, loading: false, lastError: message};
    },
    [action.SET_SHOW_READ]: (state, action) => {
        let new_state = {...state};
        new_state.options.showRead = action.showRead;
        return new_state;
    }
}, defaultState);


export default reducer;
export const actions = {
    getUser,
    getUserSuccess,
    getFeeds,
    getFeedsSuccess,
    getFeedContents,
    getFeedContentsSuccess,
    setFeedsOrder,
    setFeedsOrderSuccess,
    editFeed,
    editFeedSuccess,
    deleteFeed,
    deleteFeedSuccess,
    addUserFeed,
    addUserFeedSuccess,
    addFavouriteItem,
    addFavouriteItemSuccess,
    deleteFavouriteItem,
    deleteFavouriteItemSuccess,
    setFavouritesOrder,
    setFavouritesOrderSuccess,
    setItemRead,
    setItemReadSuccess,
    clearReadItems,
    clearReadItemsSuccess,
    getLatestStories,
    getLatestStoriesSuccess,
    setShowRead
};



