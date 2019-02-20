import React, { Component } from "react";

import { connect } from "react-redux";
import store from "../store";
import { getFeedContents, getFeeds, setFeedsOrder } from "../actions";

// Not going to bother with manually implementing sorting -- just use a well-done library for that!
import { SortableContainer, SortableElement, arrayMove } from "react-sortable-hoc";
import { FeedView, OptionsView, AddFeedView } from "../views";

class SidebarButton extends Component {

    handleClick = e => {
        e.preventDefault();

        this.props.onClick();
    }

    render() {
        let className = "sidebar-button";

        if (this.props.type)
            className += " " + this.props.type;

        let content;

        if (this.props.text)
            content = this.props.text;
        else if (this.props.icon)
            content = <i className={this.props.icon}></i>;

        return (
            <a className={className} href="#" onClick={this.handleClick}>{content}</a>
        );
    }
}

const SortableButton = SortableElement(({ value }) => (
    <li className="sorted"><SidebarButton text={value.name.substring(0, Math.min(value.name.length, 3))} /></li>
));

const SortableButtonList = SortableContainer(({ items, indices }) => {
    return (
        <ul className="sidebar-contents">
            {indices.map((index, i) => (
                <SortableButton key={items[index].feed} value={items[index]} index={i} />
            ))}
        </ul>
    );
});

class Sidebar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editorMode: false,
            itemIndices: [],
            axis: window.innerWidth <= 768 ? "x" : "y"
        };
    }

    makeFeedViewLink(feedKey) {
        return () => {

            let state = store.getState();
            let feed = state.app.loaded_feeds[feedKey];

            // If we are out of TTL, do a hard update!
            if (!feed || Date.now() - feed.lastChecked >= +feed.ttl * 60 * 1000)
                this.props.loadFeed(feedKey);
            this.props.onItemClicked(() => {
                return <FeedView feedKey={feedKey} onDeleted={this.props.onItemClicked} />;
            });
        };
    }

    handleAddButtonClick = () => {
        this.props.getFeeds();
        this.props.onItemClicked(() => <AddFeedView />);
    };

    enableSort = () => {
        this.setState({
            editorMode: true,
            itemIndices: new Array(this.props.feeds.length).fill().map((v, index) => index)
        });
    };

    cancelSort = () => {

        this.setState({
            editorMode: false,
            itemIndices: []
        });
    };

    handleWindowResize = () => {
        if (window.innerWidth <= 768 && this.state.axis != "x")
            this.setState({
                axis: "x"
            });
        else if (window.innerWidth > 768 && this.state.axis != "y")
            this.setState({
                axis: "y"
            });
    };

    handleSort = ({ oldIndex, newIndex }) => {
        this.setState({
            itemIndices: arrayMove(this.state.itemIndices, oldIndex, newIndex)
        });
    };

    saveSortOrder = () => {
        let newIndices = [...this.state.itemIndices];

        this.setState({
            editorMode: false,
            newIndices: []
        });

        this.props.setFeedsOrder(newIndices);
    };

    resetSortOrder = () => {
        this.setState({
            editorMode: false,
            newIndices: []
        });

        this.props.setFeedsOrder(null);
    }

    componentWillReceiveProps(newProps) {
        // If the props were reset (e.g. feed got deleted), disable editor mode
        if (newProps != this.state.props)
            this.setState({
                editorMode: false,
                itemIndices: []
            });
    }

    componentDidMount() {
        // We'll use good ol' resize handler to change the axis of the SortableButtonList (since there is no other way to do so with, say, CSS)
        window.addEventListener("resize", this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
    }

    render() {
        let buttons;

        if (this.state.editorMode)
            buttons = [
                <li key="0"><SidebarButton type="dotted green" icon="icon-ok" onClick={this.saveSortOrder} /></li>,
                <li key="1"><SidebarButton type="dotted red" icon="icon-cancel" onClick={this.cancelSort} /></li>,
                <li key="2"><SidebarButton type="dotted" icon="icon-sort-name-up" onClick={this.resetSortOrder} /></li>
            ];
        else
            buttons = [
                <li key="3"><SidebarButton type="dotted" text="+" onClick={this.handleAddButtonClick} /></li>,
                <li key="4"><SidebarButton type="dotted" icon="icon-sort" onClick={this.enableSort} /></li>
            ];

        let content;

        if (this.state.editorMode)
            content = (
                <SortableButtonList onSortEnd={this.handleSort} items={this.props.feeds} indices={this.state.itemIndices} axis={this.state.axis} lockAxis={this.state.axis} />
            );
        else
            content = (
                <ul className="sidebar-contents">
                    {this.props.feeds.map(feed => (
                        <li key={feed.feed}><SidebarButton text={feed.name.substring(0, Math.min(feed.name.length, 3))} onClick={this.makeFeedViewLink(feed.feed)} /></li>
                    ))}
                </ul>
            );

        return (
            <div className="sidebar">
                <ul className="perma-block">
                    {buttons}
                </ul>
                {content}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        feeds: state.app.user.feeds
    };
}

function mapActionsToProps(dispatch) {
    return {
        loadFeed: (feedKey) => dispatch(getFeedContents(feedKey)),
        getFeeds: () => dispatch(getFeeds()),
        setFeedsOrder: newOrder => dispatch(setFeedsOrder(newOrder))
    };
}

export default connect(mapStateToProps, mapActionsToProps)(Sidebar);