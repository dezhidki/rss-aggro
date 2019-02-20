import React, { Component } from "react";

import { connect } from "react-redux";

import { getLatestStories } from "../actions";

import { FavouritesView, LatestView, OptionsView } from "../views";

class Header extends Component {

    onLatestClickHandler = e => {
        e.preventDefault();
        this.props.getLatestStories();
        this.props.onItemClicked(() => <LatestView />);
    };

    onFavClickHandler = e => {
        e.preventDefault();

        this.props.onItemClicked(() => <FavouritesView />);
    };

    onOptionsClickHandler = e => {
        e.preventDefault();

        this.props.onItemClicked(() => <OptionsView />);
    };

    render() {
        return (
            <div className="header">
                <span className="banner">RSSAggro</span>
                <div className="nav-items">
                    <a href="#" onClick={this.onLatestClickHandler}>Latest</a>
                    <a href="#" onClick={this.onFavClickHandler}>Favourites</a>
                    <a href="#" onClick={this.onOptionsClickHandler}>Options</a>
                </div>
                <span>{this.props.username}</span>
            </div>
        );
    }
}

/**
 * 
 * Specify to react-redux which part of the app's state this component will want to listen to.
 * 
 * This helps makes react-redux pass the state we want as props to the component.
 * 
 * In addition, react-redux will automatically handle component updates.
 * This means the component will update itself only when the specified app state is changed.
 * 
 * @param {*} state App's state.
 * 
 * @returns {*} An object that maps app's state to component's props.
 */
function mapStateToProps(state) {
    return {
        username: state.app.user.nickname
    };
}

/**
 * 
 * Specify to react-redux the actions that this component will possibly call.
 * 
 * This will make react-redux pass the given given functions as props.
 * 
 * @param {*} dispatch Redux's dispatch function used to trigger events.
 * 
 * @returns {*} An object that maps app's actions to component's props.
 */
function mapActionsToProps(dispatch) {
    return {
        getLatestStories: () => dispatch(getLatestStories())
    };
}

// Here (and in many other components) we use connect() function provided by react-redux
// The function creates a wrapper for our component that allows the component to react
// to app's state changes and even dispatch new actions to change the state!
export default connect(mapStateToProps, mapActionsToProps)(Header);