/*
 * Action and event definitions.
 * 
 * This file contains all possible events that change the app's state.
 * In addition, we also define actions that trigger these events.
 * 
 * Since we use API middleware, our actions define options for the fetch() function.
 * When the action is called (that is, dispatched), API middleware will trigger
 * state change event and call fetch() with the provided parameters.
 * 
 * When the API call is complete, API middleware fill fire the success or failure event that
 * will in turn modify the state again.
 * 
 * The way how the state is changed is defined in Reducers.js!
 */

import { RSAA } from "redux-api-middleware";

export const API_FAILURE = "API_FAILURE";

export const GET_USER = "GET_USER";
export const GET_USER_SUCCESS = "GET_USER_SUCCESS";

export const GET_LATEST_STORIES = "GET_LATEST_STORIES";
export const GET_LATEST_STORIES_SUCCESS = "GET_LATEST_STORIES_SUCCESS";

export const GET_FEEDS = "GET_FEEDS";
export const GET_FEEDS_SUCCESS = "GET_FEEDS_SUCCESS";

export const GET_FEED_CONTENTS = "GET_FEED_CONTENTS";
export const GET_FEED_CONTENTS_SUCCESS = "GET_FEED_CONTENTS_SUCCESS";

export const SET_FEEDS_ORDER = "SET_FEEDS_ORDER";
export const SET_FEEDS_ORDER_SUCCESS = "SET_FEEDS_ORDER_SUCCESS";

export const EDIT_FEED = "EDIT_FEED";
export const EDIT_FEED_SUCCESS = "EDIT_FEED_SUCCESS";

export const DELETE_FEED = "DELETE_FEED";
export const DELETE_FEED_SUCCESS = "DELETE_FEED_SUCCESS";

export const ADD_USER_FEED = "ADD_USER_FEED";
export const ADD_USER_FEED_SUCCESS = "ADD_USER_FEED_SUCCESS";

export const ADD_FAVOURITE_ITEM = "ADD_FAVOURITE_ITEM";
export const ADD_FAVOURITE_ITEM_SUCCESS = "ADD_FAVOURITE_ITEM_SUCCESS";

export const DELETE_FAVOURITE_ITEM = "DELETE_FAVOURITE_ITEM";
export const DELETE_FAVOURITE_ITEM_SUCCESS = "DELETE_FAVOURITE_ITEM_SUCCESS";

export const SET_FAVOURITES_ORDER = "SET_FAVOURITES_ORDER";
export const SET_FAVOURITES_ORDER_SUCCESS = "SET_FAVOURITES_ORDER_SUCCESS";

export const SET_ITEM_READ = "SET_ITEM_READ";
export const SET_ITEM_READ_SUCCESS = "SET_ITEM_READ_SUCCESS";

export const CLEAR_READ_ITEMS = "CLEAR_READ_ITEMS";
export const CLEAR_READ_ITEMS_SUCCESS = "CLEAR_READ_ITEMS_SUCCESS";

export const SET_SHOW_READ = "SET_SHOW_READ";

export const getUser = () => ({
    [RSAA]: {
        types: [GET_USER, GET_USER_SUCCESS, API_FAILURE],
        endpoint: "/api/user",
        method: "GET",
        credentials: "same-origin"
    }
});

export const getFeeds = () => ({
    [RSAA]: {
        types: [GET_FEEDS, GET_FEEDS_SUCCESS, API_FAILURE],
        endpoint: "/api/feeds",
        method: "GET",
        credentials: "same-origin"
    }
});

export const getFeedContents = feedKey => ({
    [RSAA]: {
        types: [GET_FEED_CONTENTS, GET_FEED_CONTENTS_SUCCESS, API_FAILURE],
        endpoint: `/api/feed/${feedKey}/read`,
        method: "GET",
        credentials: "same-origin"
    }
});

export const setFeedsOrder = newOrder => ({
    [RSAA]: {
        types: [SET_FEEDS_ORDER, SET_FEEDS_ORDER_SUCCESS, API_FAILURE],
        endpoint: "/api/user/feeds/order",
        method: "POST",
        body: JSON.stringify({
            "new_order": newOrder
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin"
    }
});

export const editFeed = (feedKey, newName) => ({
    [RSAA]: {
        types: [EDIT_FEED, EDIT_FEED_SUCCESS, API_FAILURE],
        endpoint: `/api/user/feeds/${feedKey}`,
        method: "PATCH",
        body: JSON.stringify({
            "name": newName
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin"
    }
});

export const deleteFeed = feedKey => ({
    [RSAA]: {
        types: [DELETE_FEED, DELETE_FEED_SUCCESS, API_FAILURE],
        endpoint: `/api/user/feeds/${feedKey}`,
        method: "DELETE",
        credentials: "same-origin"
    }
});

export const addUserFeed = (url, name) => ({
    [RSAA]: {
        types: [ADD_USER_FEED, ADD_USER_FEED_SUCCESS, API_FAILURE],
        endpoint: "/api/user/feeds",
        method: "POST",
        body: JSON.stringify({
            "url": url,
            "name": name
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin"
    }
});

export const addFavouriteItem = (feedKey, title, description, link, pubDate) => ({
    [RSAA]: {
        types: [ADD_FAVOURITE_ITEM, ADD_FAVOURITE_ITEM_SUCCESS, API_FAILURE],
        endpoint: "/api/user/favourites/add",
        method: "POST",
        body: JSON.stringify({
            "feed": feedKey,
            "title": title,
            "description": description,
            "link": link,
            "pubDate": pubDate
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin"
    }
});

export const deleteFavouriteItem = key => ({
    [RSAA]: {
        types: [DELETE_FAVOURITE_ITEM, DELETE_FAVOURITE_ITEM_SUCCESS, API_FAILURE],
        endpoint: `/api/user/favourites/${key}`,
        method: "DELETE",
        credentials: "same-origin"
    }
});

export const setFavouritesOrder = newOrder => ({
    [RSAA]: {
        types: [SET_FAVOURITES_ORDER, SET_FAVOURITES_ORDER_SUCCESS, API_FAILURE],
        endpoint: "/api/user/favourites/order",
        method: "POST",
        body: JSON.stringify({
            "new_order": newOrder
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin"
    }
});

export const setItemRead = itemKey => ({
    [RSAA]: {
        types: [SET_ITEM_READ, SET_ITEM_READ_SUCCESS, API_FAILURE],
        endpoint: `/api/user/read_items/${itemKey}`,
        method: "PUT",
        credentials: "same-origin"
    }
});

export const clearReadItems = () => ({
    [RSAA]: {
        types: [CLEAR_READ_ITEMS, CLEAR_READ_ITEMS_SUCCESS, API_FAILURE],
        endpoint: "/api/user/read_items/clear",
        method: "POST",
        credentials: "same-origin"
    }
});

export const getLatestStories = () => ({
    [RSAA]: {
        types: [GET_LATEST_STORIES, GET_LATEST_STORIES_SUCCESS, API_FAILURE],
        endpoint: "/api/feeds/latest",
        method: "GET",
        credentials: "same-origin"
    }
});

export const setShowRead = val => ({
    type: SET_SHOW_READ,
    showRead: val
});