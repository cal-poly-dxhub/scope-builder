import { useState } from "react";
import "./ContractRead.css";

import { useAuth } from "../Auth/AuthContext";
import Navbar from "../Components/Navbar";
import { readContract } from "../scripts/LLMGeneral";

const ContractRead = () => {
  const { token } = useAuth();
  const firstMessages = [
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Hello, I am LUCAS, your Legal Understanding and Contract Assistance System. I can help you read a contract.",
        },
      ],
    },
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Please enter the contract text you would like me to read:",
        },
      ],
    },
  ];
  const [inputValue, setInputValue] = useState<string>("");
  const [showContext, setShowContext] = useState<boolean>(false);
  const [messages, setMessages] = useState<
    {
      role: string;
      content: { type: string; text: string }[];
    }[]
  >(firstMessages);
  const [context, setContext] = useState<
    {
      role: string;
      content: { type: string; text: string }[];
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue === "") {
      return;
    }

    if (loading) {
      alert("Please wait for the response.");
      return;
    }

    const userInput = inputValue;
    const oldMessages = messages;
    setInputValue("");

    setMessages([
      ...oldMessages,
      { role: "user", content: [{ type: "text", text: userInput }] },
    ]);

    if (userInput === "") {
      return;
    }

    setLoading(true);

    const response = await readContract(context, userInput, token);
    const responseText = response.content[0].text
      .split("<Response>")[1]
      .split("</Response>")[0];
    setContext([...context, response]);
    setMessages([
      ...oldMessages,
      { role: "user", content: [{ type: "text", text: userInput }] },
      { role: "assistant", content: [{ type: "text", text: responseText }] },
    ]);

    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div className="chat-box-title">Contract Analysis Chat</div>
      <div className="contract-gen">
        <div className="message-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.role === "user" ? "user" : "assistant"
              }`}
            >
              {message?.content[0]?.text}
            </div>
          ))}
          {loading && <div className="message assistant">Loading...</div>}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage}>Send</button>
          <button onClick={() => setMessages([])}>Clear</button>
          <button onClick={() => setShowContext(!showContext)}>
            {showContext ? "Hide Context" : "Show Context"}
          </button>
        </div>
      </div>
      {showContext && <div>{JSON.stringify(context)}</div>}
    </div>
  );
};

export default ContractRead;
