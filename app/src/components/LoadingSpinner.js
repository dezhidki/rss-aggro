import React, { Component } from "react";

class LoadingSpinner extends Component {
    render() {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <i className="icon-spin1 animate-spin spinner"></i>
            </div>
        );
    }
}

export default LoadingSpinner;