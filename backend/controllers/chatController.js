const Chat = require("../models/chats");
const pubnub = require("../config/pubnub");

const createChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingChat = await Chat.findOne({
      members: { $all: [req.user.userId, userId] },
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = new Chat({
      members: [req.user.userId, userId],
      channel: `chat-${new mongoose.Types.ObjectId()}`,
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ message: "Error creating chat" });
  }
};

const getChat = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let chat = await Chat.findOne({
      members: { $all: [req.user.userId, userId] },
    })
      .populate("messages.sender", "name profilePicture")
      .populate("messages.post");

    if (!chat) {
      console.log("No existing chat found, creating a new one...");
      const channel = `chat-${req.user.userId}-${userId}`;

      chat = new Chat({
        members: [req.user.userId, userId],
        channel,
        messages: [],
      });

      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching or creating chat:", error);
    res.status(500).json({ message: "Error fetching or creating chat" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId, text, postId } = req.body;
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const newMessage = { sender: req.user.userId, text };
    if (postId) {
      const post = await Post.findById(postId);
      if (post) {
        newMessage.post = post;
      }
    }

    chat.messages.push(newMessage);
    await chat.save();

    pubnub.publish(
      {
        channel: chat.channel,
        message: {
          senderId: req.user.userId,
          text,
          timestamp: new Date().toISOString(),
          post: newMessage.post, // Include post in the message
        },
      },
      (status, response) => {
        if (status.error) {
          console.error("PubNub publish error:", status.message);
        } else {
          console.log("Message published to PubNub:", response);
        }
      }
    );

    res
      .status(200)
      .json(await chat.populate("messages.sender", "name profilePicture"));
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

// Presence event handlers
const handlePresence = (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ message: "User ID and action are required" });
  }

  pubnub.publish(
    {
      channel: "presence",
      message: { userId, action },
    },
    (status, response) => {
      if (status.error) {
        console.error("PubNub presence error:", status.message);
        return res.status(500).json({ message: "Error handling presence" });
      } else {
        console.log("Presence event published to PubNub:", response);
        return res.status(200).json({ message: "Presence event handled" });
      }
    }
  );
};

module.exports = {
  createChat,
  getChat,
  sendMessage,
  handlePresence,
};
