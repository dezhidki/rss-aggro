import React, { Component } from "react";

import { connect } from "react-redux";

import { addFavouriteItem, deleteFavouriteItem, setItemRead } from "../actions";

class FeedItem extends Component {

    makeFavHandler(isFavouritedNow) {
        return e => {
            e.preventDefault();

            if(!isFavouritedNow)
                this.props.addFavourite(this.props.item);
            else
                this.props.removeFavourite(this.props.item);
        };
    }

    makeHandleClick(isRead) {
        return e => {
            e.preventDefault();

            if(!isRead)
                this.props.setItemRead(this.props.item);
            
            window.open(e.target.href, "_blank");
        };
    }

    makeHandleOpen(isRead) {
        return () => {
            if (!isRead)
                this.props.setItemRead(this.props.item);
        };
    }

    render() {

        let isFavourited = this.props.userFavourites.find(item => item.key == this.props.item.key) !== undefined;
        let isRead = this.props.readStories.find(key => key == this.props.item.key) !== undefined;

        let favIcon = isFavourited ? "icon-star" : "icon-star-empty";

        let className = "story";

        if(isRead)
            className += " read";

        /*
            AAAAAAAAAAAAAAAA!
            We use dangerouslySetInnerHTML, since some RSS feeds put the story as pure HTML!
            I tried to sanitize it some premade libraries (safely-set-inner-html and html-react-parser), but both broke :(
            For the sake of sanity, I'll leave this one open for now.
    
            Pls no angery
        */
        return (
            <div className={className}>
                <div className="story-side">
                    <a href="#" className="fav-button" onClick={this.makeFavHandler(isFavourited)}><i className={favIcon}></i></a>
                    {this.props.item.pubDate && <span>{new Date(this.props.item.pubDate + "Z").toLocaleString()}</span>}
                </div>
                <details onClick={this.makeHandleOpen(isRead)}>
                    <summary>
                        <h2>{this.props.item.title}</h2>
                        <a href={this.props.item.link || "#"} className="read-button" onClick={this.makeHandleClick(isRead)}>Read full article</a>
                    </summary>
                    <hr />
                    <div className="story-details" dangerouslySetInnerHTML={{ __html: this.props.item.description ? this.props.item.description : "" }} />
                </details>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        userFavourites: state.app.user.favourite_stories,
        readStories: state.app.user.read_stories
    };
}

function mapActionToProps(dispatch) {
    return {
        addFavourite: item => dispatch(addFavouriteItem(item.feed, item.title, item.description, item.link, item.pubDate)),
        removeFavourite: item => dispatch(deleteFavouriteItem(item.key)),
        setItemRead: item => dispatch(setItemRead(item.key))
    };
}

export default connect(mapStateToProps, mapActionToProps)(FeedItem);