import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePubNub } from "pubnub-react";
import "../styles/Messages.css";
import Post from "../components/Post";
import PostModal from "../components/PostModal";

const MessagesList = ({ users, onSelectUser }) => {
  return (
    <div className="messages-list">
      {users.map((user) => (
        <div
          key={user._id}
          className="message-item"
          onClick={() => onSelectUser(user)}
        >
          <div className="user-avatar">
            <img
              src={user.profilePicture || "/defaultProfile.png"}
              alt={user.name || "User"}
            />
          </div>
          <div className="user-info">
            <h3>{user.name || "User"}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

const MessageChat = ({
  selectedUser,
  onClose,
  messages,
  sendMessage,
  handlePostClick,
}) => {
  const loggedInUserId = localStorage.getItem("userId");
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="message-chat">
      <div className="chat-header">
        <div className="user-avatar">
          <img
            src={selectedUser?.profilePicture || "/defaultProfile.png"}
            alt={selectedUser?.name || "User"}
          />
        </div>
        <h2>{selectedUser?.name || "User"}</h2>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender._id === loggedInUserId ? "sent" : "received"
            }`}
          >
            {/* Regular message text */}
            {msg.text && <div className="message-content">{msg.text}</div>}

            {/* Shared post */}
            {msg.post && (
              <div
                className="shared-post"
                onClick={() => handlePostClick(msg.post)}
              >
                {/* Render the Post component here */}
                <Post post={msg.post} small />
              </div>
            )}

            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

const Messages = () => {
  const pubnub = usePubNub();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [channel, setChannel] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const loggedInUserId = localStorage.getItem("userId");
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(response.data.filter((user) => user._id !== loggedInUserId));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (channel) {
      pubnub.subscribe({ channels: [channel] });

      const listener = {
        message: (event) => {
          const newMessage = {
            sender: {
              _id: event.message.sender,
              name: event.message.senderName || "User",
              profilePicture:
                event.message.senderProfilePicture || "/defaultProfile.png",
            },
            text: event.message.text,
            timestamp: event.message.timestamp,
            post: event.message.post,
          };

          setMessages((prevMessages) => {
            const isDuplicate = prevMessages.some(
              (msg) => msg.timestamp === newMessage.timestamp
            );
            return isDuplicate ? prevMessages : [...prevMessages, newMessage];
          });
        },
      };

      pubnub.addListener(listener);

      return () => {
        pubnub.unsubscribeAll();
        pubnub.removeListener(listener);
      };
    }
  }, [channel, pubnub]);

  const handleSelectUser = async (user) => {
    try {
      setSelectedUser(user);
      const loggedInUserId = localStorage.getItem("userId");
      const response = await axios.get(
        `http://localhost:5000/api/chats/${user._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessages(response.data.messages);
      setChannel(
        `chat-${Math.min(loggedInUserId, user._id)}-${Math.max(
          loggedInUserId,
          user._id
        )}`
      );
    } catch (error) {
      console.error("Error fetching or creating chat:", error);
      alert("Could not fetch or create chat.");
    }
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    setMessages([]);
    setChannel(null);
  };

  const sendMessage = async (messageText, sharedPost = null) => {
    if (selectedUser) {
      try {
        const loggedInUserId = localStorage.getItem("userId");
        const timestamp = new Date().toISOString();

        const message = {
          text: messageText,
          sender: loggedInUserId,
          senderName: "You",
          senderProfilePicture: "/defaultProfile.png",
          receiver: selectedUser._id,
          timestamp,
          post: sharedPost ? sharedPost._id : null,
        };

        pubnub.publish({ channel, message }, (status, response) => {
          if (status.error) {
            console.error("Error publishing message:", status);
          }
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: {
              _id: loggedInUserId,
              name: "You",
              profilePicture: "/defaultProfile.png",
            },
            text: messageText,
            timestamp,
            post: sharedPost,
          },
        ]);

        const chatResponse = await axios.get(
          `http://localhost:5000/api/chats/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const chatId = chatResponse.data._id;

        await axios.post(
          `http://localhost:5000/api/chats/${chatId}/message`,
          {
            text: messageText,
            chatId,
            sender: loggedInUserId,
            timestamp,
            post: sharedPost ? sharedPost._id : null,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Could not send message.");
      }
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const closePostModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <MessagesList users={users} onSelectUser={handleSelectUser} />
        {selectedUser && (
          <MessageChat
            selectedUser={selectedUser}
            messages={messages}
            onClose={handleCloseChat}
            sendMessage={sendMessage}
            handlePostClick={handlePostClick}
          />
        )}
      </div>

      {/* Post Modal to show the shared post */}
      <PostModal post={selectedPost} onClose={closePostModal} />
    </div>
  );
};

export default Messages;
