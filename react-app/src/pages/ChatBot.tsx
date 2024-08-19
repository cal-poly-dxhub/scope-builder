import { useState, useEffect } from "react";
import useBedrockWebSocket from "../hooks/useBedrockWebSocket"
import "../styles/ChatBot.css";

interface Message {
  text: string;
  sender: "user" | "bot";
}

const ChatBot: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const {startBedrockProcess, lastJsonMessage, connectionStatus} = useBedrockWebSocket();
  
  useEffect(()=>{
    console.log(message)
  }, [message])
  
  const handleSubmit = (userInput: string) => {
    startBedrockProcess(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: "Awaiting Response...", sender: "bot" }
    ]);
  };
  
  useEffect(() =>{
    console.log(lastJsonMessage)
    
    if (lastJsonMessage?.Payload?.body){
      const parsedBody = JSON.parse(lastJsonMessage.Payload.body);
      console.log(parsedBody.search_answer)
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => msg.text !== "Awaiting Response..."),
        { text: parsedBody.search_answer, sender: "bot" }
      ]);
    }
  },[lastJsonMessage])

  return (
    <div className="chat-app">
      <div className="chat-container">
        <div className="chat-header">
          <h2>react-lambda-chatbot</h2>
          <h3>Connection Status - {connectionStatus}</h3>
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
                handleSubmit(message)
                setMessage("");
              }
            }}
          />
          <button onClick={() => handleSubmit(message)}>
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
