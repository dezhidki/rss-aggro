import React, { Component } from "react";

import { connect } from "react-redux";

import { FeedItem } from "../components";

class LatestView extends Component {

    render() {

        let content;

        if (this.props.latestStories.length > 0)
            content = this.props.latestStories.map(item => (
                <FeedItem key={item.key} item={item} />
            ));
        else
            content = (
                <p>It's empty! Maybe add more feeds with the "+" button?</p>
            );

        return (
            <div>
                <h1>Latest stories</h1>
                <hr />

                {content}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        latestStories: state.app.latest_stories
    };
}

export default connect(mapStateToProps)(LatestView);