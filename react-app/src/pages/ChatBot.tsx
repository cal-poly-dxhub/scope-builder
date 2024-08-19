import React, { useState } from "react";
import "../styles/ChatBot.css";

interface Message {
  text: string;
  sender: "user" | "bot";
}

const ChatBot: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <div className="chat-app">
      <div className="chat-container">
        <div className="chat-header">
          <h2>react-lambda-chatbot</h2>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.sender === "user" ? "user" : "bot"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setMessages([...messages, { text: message, sender: "user" }]);
                setMessage("");
              }
            }}
          />
          <button>
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
