import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import PubNub from "pubnub";
import { PubNubProvider } from "pubnub-react";
import "bootstrap/dist/css/bootstrap.min.css";

const pubnub = new PubNub({
  publishKey: process.env.REACT_APP_PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY,
  uuid: localStorage.getItem("userId"),
});

ReactDOM.render(
  <PubNubProvider client={pubnub}>
    <Router>
      <App />
    </Router>
  </PubNubProvider>,
  document.getElementById("root")
);
