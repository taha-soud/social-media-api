require("dotenv").config();

const PubNub = require("pubnub");

const pubnub = new PubNub({
  publishKey: process.env.PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
  uuid: "server",
});

module.exports = pubnub;
