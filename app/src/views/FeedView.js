import React, { Component } from "react";

import { connect } from "react-redux";
import { editFeed, deleteFeed } from "../actions";

import { FeedItem } from "../components";
import LatestView from "./LatestView";


class FeedView extends Component {
    constructor() {
        super();

        this.state = {
            feedName: "",
            editorMode: false
        };

        // Save feed info as a private paramater
        // This will be changed only by componentWillMount
        this.feedInfo = null;
    }

    handleNameInput = e => {
        this.setState({
            feedName: e.target.value
        });
    };

    changeName = e => {
        e.preventDefault();

        this.props.editFeed(this.props.feedKey, this.state.feedName);
    };

    cancelNameChange = e => {
        e.preventDefault();

        this.setState({
            displayFeedName: this.props.feedName,
            feedName: "",
            editorMode: false
        });
    }; 

    componentWillReceiveProps(nextProps) {
        if (this.props != nextProps)
            this.setState({
                feedName: "",
                editorMode: false
            });
    }

    enableEditMode(originalName) {
        return e => {
            e.preventDefault();

            this.setState({
                feedName: originalName,
                editorMode: true
            });
        };
    }

    deleteFeed = e => {
        e.preventDefault();

        this.props.deleteFeed(this.props.feedKey);
    };

    componentDidMount() {
        // The used does is not subscribed to the feed -- most likely it was deleted
        // Thus fire onDeleted with a link to LatestView
        if(!this.feedInfo)
            this.props.onDeleted(() => <LatestView/>);
    }

    render() {
        let feed = this.props.feedContents[this.props.feedKey];
        let feedContents;

        // We'll do a dirty trick here and get the feed info based on the feed key that was just passed
        // Harr harr
        this.feedInfo = this.props.feeds.find(f => f.feed == this.props.feedKey);
        

        // No feed info!
        // Means that the feed was deleted, and we will most likely move out of this page in a moment
        if(!this.feedInfo)
            return <div/>;

        if (!feed || feed.items.length == 0)
            feedContents = (
                <div className="flex items-center">
                    <h2 className="text-red">There are no items in the feed!</h2>
                </div>
            );
        else {
            let feedItems = feed.items;
            if(!this.props.showRead){
                let readStories = new Set(this.props.readStories);
                feedItems = feedItems.filter(item => !readStories.has(item.key));
            }
            feedContents = feedItems.map(item => <FeedItem item={item} key={item.key} />);
        }
        
        let buttons;
        let name;
        
        if (this.state.editorMode) {
            buttons = [
                <a key="0" href="#" className="btn-big save-name" onClick={this.changeName}>Save name</a>,
                <a key="1" href="#" className="btn-big cancel-name" onClick={this.cancelNameChange}>Cancel change</a>
            ];
            name = <input type="text" className="feed-header" value={this.state.feedName} onChange={this.handleNameInput} />;
        }
        else{
            buttons = <a href="#" className="btn-big change-name" onClick={this.enableEditMode(this.feedInfo.name)}>Change name</a>;
            name = <h1 className="feed-header">Stories from {this.feedInfo.name}</h1>;
        }
        
        return (
            <div>
                <div className="feed-view-header">
                    {name}
                    {buttons}
                    <a href="#" className="btn-big delete-feed" onClick={this.deleteFeed}>Delete</a>
                </div>
                <hr />
                {feedContents}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        feedContents: state.app.loaded_feeds,
        feeds: state.app.user.feeds,
        readStories: state.app.user.read_stories,
        showRead: state.app.options.showRead
    };
}

function mapActionsToProps(dispatch) {
    return {
        editFeed: (feedKey, newName) => dispatch(editFeed(feedKey, newName)),
        deleteFeed: feedKey => dispatch(deleteFeed(feedKey))
    };
}

export default connect(mapStateToProps, mapActionsToProps)(FeedView);