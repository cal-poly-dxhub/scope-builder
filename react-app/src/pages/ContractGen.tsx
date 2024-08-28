import { useState } from "react";
import "./ContractGen.css";

import { useAuth } from "../Auth/AuthContext";
import Navbar from "../Components/Navbar";
import { generateContract } from "../scripts/LLMGeneral";

const ContractGen = () => {
  const { token } = useAuth();
  const firstMessages = [
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Hello, I am LUCAS, your Legal Understanding and Contract Assistance System. I can help you fill in a contract template.",
        },
      ],
    },
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Please type the number of the clause to start with:",
        },
      ],
    },
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "OUIGYKFCJHGVUHGYHCMVLUHIGFHCFNVBM<KGJFHCNVB MNHJG"
            .split("\n\n")
            .map((clause: string, index: number) => {
              if (index !== 0) {
                return `${clause.split("\n")[0]}`;
              }
              return "";
            })
            .join("\n\n"),
        },
      ],
    },
  ];
  const [messages, setMessages] =
    useState<{ role: string; content: { type: string; text: string }[] }[]>(
      firstMessages
    );
  const [inputValue, setInputValue] = useState<string>("");
  const [showContext, setShowContext] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [context, setContext] = useState<
    { role: string; content: { type: string; text: string }[] }[]
  >([]);

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

    const userMessage = {
      role: "user",
      content: [{ type: "text", text: inputValue }],
    };
    setMessages([...messages, userMessage]);
    setInputValue("");

    setLoading(true);
    const response = await generateContract(context, inputValue, token);
    if (!response) {
      setLoading(false);
      return;
    }

    const responseText = response.content[0].text
      .split("<Response>")[1]
      .split("</Response>")[0];
    const assistantMessage = {
      role: "assistant",
      content: [{ type: "text", text: responseText }],
    };
    setMessages([...messages, userMessage, assistantMessage]);
    if (!isNaN(parseInt(userMessage.content[0].text, 10))) {
      setContext([...context, response]);
    } else {
      setContext([...context, response]);
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div className="chat-box-title">Contract Generator Chat</div>
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
            {showContext ? "Hide" : "Show"} Context
          </button>
        </div>
      </div>
      {showContext && <div>{JSON.stringify(context)}</div>}
    </div>
  );
};

export default ContractGen;
