import { useState } from "react";
import {
  getBedrockResponse,
  getCaluseTags,
  getIncrementalContext,
  getResponseTags,
  getSummaryTags,
} from "../../scripts/LLMGeneral";
import "./AmendChat.css";

const AmendChat = ({
  loading,
  setLoading,
  context,
  setContext,
  setAccepted,
  currentClause,
  setCurrentClause,
  document,
  debug,
}: {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  context: {
    title: string;
    context: { role: string; content: { type: string; text: string }[] }[];
  };
  setContext: (context: {
    title: string;
    context: { role: string; content: { type: string; text: string }[] }[];
  }) => void;
  setAccepted: (accepted: boolean) => void;
  currentClause: { title: string; clause: string; summary: string };
  setCurrentClause: (currentClause: {
    title: string;
    clause: string;
    summary: string;
  }) => void;
  document: {
    title: string;
    content: string;
    summary: string;
    truths: string;
  }[];
  debug?: boolean;
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [clausePopup, setClausePopup] = useState<boolean>(false);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") {
      return;
    }

    const ui = inputValue;
    setInputValue("");

    const oldContext = context;

    const incrementalContext = getIncrementalContext(document);
    if (oldContext.context.length > 0) {
      oldContext.context[0].content[0].text += incrementalContext;
    }

    const newContext = [
      ...oldContext.context,
      { role: "user", content: [{ type: "text", text: ui }] },
    ];
    const newContexts = { title: currentClause.title, context: newContext };
    setContext(newContexts);

    setLoading(true);
    const r = await getBedrockResponse(newContext);
    const finishedClause = getCaluseTags(r);
    const summary = getSummaryTags(r);

    if (finishedClause) {
      setCurrentClause({
        title: currentClause.title,
        clause: finishedClause,
        summary,
      });
      setClausePopup(true);
    }

    newContext.push({ role: "assistant", content: r });
    const finalContexts = { title: currentClause.title, context: newContext };
    setContext(finalContexts);

    setLoading(false);
  };

  const getMessages = () => {
    const currentContext = context.context;

    if (!currentContext) {
      return [];
    }

    return currentContext.map((message, index) => {
      if (message.role === "assistant") {
        if (getCaluseTags(message.content) !== "") {
          return (
            <div key={index} className="message assistant">
              {getCaluseTags(message.content)}
            </div>
          );
        }

        return (
          <div key={index} className="message assistant">
            {getResponseTags(message.content)}
          </div>
        );
      }

      if (
        message.role === "user" &&
        message.content[0].text.includes(
          "You are LUCAS, a procurement manager assistant specialized in creating scope of work"
        )
      ) {
        return (
          <div key={index} className="message user">
            Start working on {currentClause.title}
          </div>
        );
      }

      return (
        <div
          key={index}
          className={`message ${
            message.role === "user" ? "user" : "assistant"
          }`}
        >
          {message?.content[0]?.text}
        </div>
      );
    });
  };

  return (
    <div className="sow-container">
      <div className="chat-box-title">
        <h2>Scope of Work Generator</h2>
      </div>
      <div className="contract-gen">
        <div className="message-container">
          {getMessages()}
          {loading && <div className="message assistant">Loading...</div>}
          {clausePopup && (
            <div className="clause-popup-background">
              <div className="clause-popup">
                <div className="clause">
                  <h3 className="clause-title">{currentClause.title}</h3>
                  <p className="clause-content">{currentClause.clause}</p>
                </div>
                <div className="clause-buttons">
                  <button
                    className="button"
                    onClick={() => {
                      setAccepted(true);
                      setClausePopup(false);
                    }}
                  >
                    Accept Clause
                  </button>
                  <button
                    className="button"
                    onClick={() => setClausePopup(false)}
                  >
                    Continue Editing
                  </button>
                </div>
              </div>
            </div>
          )}
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
          {debug && (
            <button
              onClick={() => {
                console.log("amendchat context", context);
              }}
            >
              Log Context
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmendChat;
