import React, { Component } from "react";

import { LatestView } from "../views";
import { LoadingSpinner } from "../components";

import Sidebar from "./Sidebar";
import Header from "./Header";
import ContentViewer from "./ContentViewer";

class App extends Component {
    constructor() {
        super();

        this.state = {
            viewLoader: () => <LatestView />
        };
    }

    onItemClickedHandler = viewLoader => {
        this.setState({
            viewLoader: viewLoader
        });
    };

    render() {
        return (
            <div className="grid">
                <Header onItemClicked={this.onItemClickedHandler} />
                <Sidebar onItemClicked={this.onItemClickedHandler} />
                <ContentViewer>
                    {this.state.viewLoader()}
                </ContentViewer>
            </div>
        );
    }
}

export default App;