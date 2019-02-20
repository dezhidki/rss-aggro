import React, { Component } from "react";

import { connect } from "react-redux";

import { LoadingSpinner, ErrorMessage } from "../components";

class ContentViewer extends Component {
    render() {
        let content;

        if (this.props.error)
            content = <ErrorMessage message={this.props.error} />;
        else if (this.props.loading)
            content = <LoadingSpinner />;
        else
            content = this.props.children;

        return (
            <div className="content">
                {content}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        loading: state.app.loading,
        error: state.app.lastError
    };
}

export default connect(mapStateToProps)(ContentViewer);