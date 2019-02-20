import React, { Component } from "react";

import { setFavouritesOrder } from "../actions";
import { connect } from "react-redux";

import { SortableContainer, SortableElement, arrayMove } from "react-sortable-hoc";
import { FeedItem } from "../components";

const SortableItem = SortableElement(({ value }) => {
    return (
        <FeedItem item={value} />
    );
});

const SortableList = SortableContainer(({ items, indices }) => {
    return (
        <div>
            {indices.map((index, i) => (
                <SortableItem key={items[index].key} value={items[index]} index={i} />
            ))}
        </div>
    );
});

class FavouritesView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sortMode: false,
            items: []
        };
    }

    enableSortMode = e => {
        e.preventDefault();

        this.setState({
            sortMode: true,
            items: new Array(this.props.favouriteItems.length).fill().map((v, index) => index)
        });
    };

    cancelSort = e => {
        e.preventDefault();

        this.setState({
            sortMode: false,
            items: []
        });
    };

    handleSort = ({ oldIndex, newIndex }) => {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex)
        });
    };

    saveChanges = e => {
        e.preventDefault();

        let newIndices = [...this.state.items];

        this.setState({
            sortMode: false,
            items: []
        });

        this.props.setFavouritesOrder(newIndices);
    };

    resetSort = e => {
        e.preventDefault();

        this.props.setFavouritesOrder(null);
    };

    render() {

        let content;

        if (this.props.favouriteItems.length > 0) {
            if (this.state.sortMode)
                content = <SortableList items={this.props.favouriteItems} indices={this.state.items} onSortEnd={this.handleSort} lockAxis="y" />;
            else
                content = this.props.favouriteItems.map(item => (
                    <FeedItem key={item.key} item={item} />
                ));
        }
        else
            content = (
                <p>You don't have anything favourited :(</p>
            );

        let button;

        if (this.state.sortMode)
            button = [
                <a key="0" href="#" className="btn-big save-name" onClick={this.saveChanges}>Save</a>,
                <a key="1" href="#" className="btn-big cancel-name" onClick={this.cancelSort}>Cancel changes</a>
            ];
        else
            button = [
                <a key="2" href="#" className="btn-big change-name" onClick={this.enableSortMode}>Sort</a>,
                <a key="3" href="#" className="btn-big delete-feed" onClick={this.resetSort}>Reset sort order</a>,
            ];

        return (
            <div>
                <div className="feed-view-header">
                    <h1 className="feed-header">Favourites</h1>
                    {this.props.favouriteItems.length > 0 && button}
                </div>
                <hr />

                {content}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        favouriteItems: state.app.user.favourite_stories
    };
}

function mapActionsToProps(dispatch) {
    return {
        setFavouritesOrder: order => dispatch(setFavouritesOrder(order))
    };
}

export default connect(mapStateToProps, mapActionsToProps)(FavouritesView);