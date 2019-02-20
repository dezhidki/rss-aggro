import React, { Component } from "react";

import { connect } from "react-redux";
import { isWebUri } from "valid-url";

import { addUserFeed } from "../actions";

function DatabaseFeed(props) {
    return (
        <div onClick={() => props.onClick(props.url, props.name)}>
            <p className="feed-name">{props.name}</p>
            <p className="feed-link">{props.url}</p>
        </div>
    );
}

class AddFeedView extends Component {
    constructor() {
        super();

        this.state = {
            feedUrl: "",
            feedName: "",
            feedUrlValid: false,
            nameValid: false
        };
    }

    onUrlChanged = e => {
        let val = e.target.value;

        let validUrl = isWebUri(e.target.value);

        this.setState({
            feedUrl: val,
            feedUrlValid: validUrl !== undefined
        });
    };

    onNameChanged = e => {
        this.setState({
            feedName: e.target.value,
            nameValid: e.target.value.trim().length > 0
        });
    };

    setSelectedFeed = (url, name) => {
        this.setState({
            feedName: name,
            feedUrl: url,
            feedUrlValid: true,
            nameValid: true
        });
    };

    submitForm = e => {
        e.preventDefault();
        this.props.addFeed(this.state.feedUrl, this.state.feedName);
    };

    render() {
        return (
            <div>
                <h1>Add Feed</h1>
                <hr />

                <h3>Enter info manually...</h3>

                <form className="add-feed-form" onSubmit={this.submitForm}>
                    <div>
                        <label htmlFor="feed-url" className="pr-2">RSS feed URL (must be a full, valid URL):</label>
                        <input className={this.state.feedUrlValid ? "" : "invalid"} type="text" id="feed-url" value={this.state.feedUrl} onChange={this.onUrlChanged} />
                    </div>
                    <div>
                        <label htmlFor="feed-name" className="pr-2">Custom feed name:</label>
                        <input className={this.state.nameValid ? "" : "invalid"} id="feed-name" type="text" value={this.state.feedName} onChange={this.onNameChanged} />
                    </div>
                    <div>
                        <input type="submit" value="Add Feed" disabled={!this.state.feedUrlValid || !this.state.nameValid} />
                    </div>
                </form>

                <h3>... or select from a list of known feeds!</h3>

                <div className="feed-list">
                    {this.props.feeds.map(feed => (
                        <DatabaseFeed key={feed.id} name={feed.name} url={feed.url} onClick={this.setSelectedFeed} />
                    ))}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        feeds: state.app.feeds
    };
}

function mapActionsToProps(dispatch) {
    return {
        addFeed: (url, name) => dispatch(addUserFeed(url, name))
    };
}

export default connect(mapStateToProps, mapActionsToProps)(AddFeedView);