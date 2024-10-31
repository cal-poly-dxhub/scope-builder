import { useState } from "react";
import { useLocation } from "react-router-dom";
import { _clause, _document } from "../assets/types";
import ChatBox from "../Components/ChatBox";
import Container from "../Components/Container";
import Navbar from "../Components/Navbar";
import { useAuth } from "../constants/AuthProvider";
import { getBedrockResponse } from "../scripts/LLMGeneral";
import DocumentEditor from "./DocumentEditor";

const EditPage = () => {
  const { document } = useLocation().state;
  const [d, setD] = useState<_document>(document);
  const [selectedText, setSelectedText] = useState<string>("");

  const { token } = useAuth();

  const handleSelectedText = (s: string) => {
    setSelectedText(s);
  };

  const handleSubmit = async (s: string) => {
    setSelectedText("");
    const newClauses: _clause[] = [];

    for (const c of d.clauses) {
      console.log(c);

      const prompt = getPrompt(s, selectedText, c);
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ];

      const response = await getBedrockResponse(messages, token);
      const modifiedClause = getModifiedClause(response);

      if (modifiedClause !== "") {
        newClauses.push({ title: c.title, content: modifiedClause });
      } else {
        newClauses.push(c);
      }
    }

    setD({ ...d, clauses: newClauses });
    console.log(newClauses);
  };

  const getModifiedClause = (response: any) => {
    const textResponse: string = response[0]?.text;

    if (textResponse.includes("<ModifiedClause>")) {
      return (
        textResponse
          ?.split("<ModifiedClause>")[1]
          .split("</ModifiedClause>")[0] ?? ""
      );
    } else {
      return "";
    }
  };

  const getPrompt = (
    input: string,
    selectedText: string,
    currentClause: _clause
  ) => {
    return `You are LUCAS, a procurement manager assistant specialized in editing Scope of Work documents. You will be given an input user request, some selected text from the  document, and the working current clause. Your goal is to modify the current clause if and only if the requested modifications are required for the given clause. \nThe current user input is <Input>${input}</Input>. The selected text is <SelectedText>${selectedText}</SelectedText>\nThis is the current clause you are given, it is called: ${currentClause.title}: <CurrentClause>${currentClause.content}</CurrentClause>\nYou will split your response into Thought, Action, Observation and ModifiedClause. Use this XML structure and keep everything strictly within these XML tags. There should be no content outside these XML blocks:\n<Thought>Your internal thought process.</Thought><Action>Your actions or analyses.</Action><Observation>User feedback or clarifications.</Observation><ModifiedClause>The modified clause that contains the neccessary modifications. Only return this block if the clause requires modification.</ModifiedClause>`;
  };

  return (
    <Container className="column">
      <Navbar />
      <div style={styles.container}>
        <div style={styles.width}>
          <DocumentEditor document={d} onSelection={handleSelectedText} />
          {selectedText && <div style={{ height: "15rem" }} />}
          {selectedText && (
            <div
              style={{
                position: "fixed",
                bottom: "2rem",
                left: "35vw",
                right: "35vw",
              }}
            >
              <ChatBox onSubmit={handleSubmit} style={styles.chatBox} />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default EditPage;

const styles = {
  container: {
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  },
  width: {
    width: "60vw",
    maxWidth: "800px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: "2rem",
  },
  boxContainer: {
    display: "block",
  },
  chatBox: {
    marginTop: "1rem",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
};
