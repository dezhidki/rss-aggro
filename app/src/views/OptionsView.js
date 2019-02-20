import React, { Component } from "react";

import { connect } from "react-redux";
import { setShowRead, clearReadItems } from "../actions";

class OptionsView extends Component {

    handleCheckbox = e => {
        this.props.setShowRead(e.target.checked);
    };

    handleClearHistory = () => {
        this.props.clearReadItems();
    };

    render() {
        return (
            <div>
                <h1>Options</h1>
                <hr />

                <div className="options">
                    <div>
                        <input type="checkbox" id="checkbox-hide-read" checked={this.props.showRead} onChange={this.handleCheckbox} />
                        <label htmlFor="checkbox-hide-read">Show already read items on feed page (does not affect Latest and Favourites).</label>
                    </div>
                    <div>
                        {this.props.readStories.length == 0 && <p>History is clean!</p>}
                        <button className="btn" disabled={this.props.readStories.length == 0} onClick={this.handleClearHistory}>Clear read history</button>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        showRead: state.app.options.showRead,
        readStories: state.app.user.read_stories
    };
}

function mapActionsToProps(dispatch) {
    return {
        setShowRead: value => dispatch(setShowRead(value)),
        clearReadItems: () => dispatch(clearReadItems())
    };
}

export default connect(mapStateToProps, mapActionsToProps)(OptionsView);