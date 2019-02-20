import React, { Component } from "react";

class ErrorMessage extends Component {
    render() {
        return (
            <div className="error-message">
                <i className="icon-emo-unhappy spinner"></i>
                <p className="error-header">Oh noes!</p>
                <p>{this.props.message}</p>
            </div>
        );
    }
}
export default ErrorMessage;