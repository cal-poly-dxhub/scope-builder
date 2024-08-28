import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import prompts from "../assets/prompt.json";
import { _clause } from "../assets/types";
import { useAuth } from "../Auth/AuthContext";
import { downloadDocument } from "../scripts/Docx";
import {
  getBedrockResponse,
  getCaluseTags,
  getNumberTags,
  getTitleTags,
} from "../scripts/LLMGeneral";

const sow_finalize = prompts["sow_finalize"];

const Finish = () => {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const document: { title: string; content: string; summary: string }[] =
    location.state?.document || [];
  const documentTitle = location.state?.documentTitle || null;
  const sowgenContext: {
    contexts: {
      title: string;
      context: { role: string; content: { type: string; text: string }[] }[];
    }[];
    category: string;
    userInstitution: string;
    supplier: string;
    documentPurpose: string;
    document: { title: string; content: string; summary: string }[];
    currentClause: { title: string; clause: string; summary: string };
  } = location.state;

  // for going back to edit document
  const generated = useRef(false);
  const [formattedDocument, setFormattedDocument] = useState<
    { title: string; content: string }[]
  >([]);
  const [previousDocument, setPreviousDocument] = useState<
    { title: string; content: string }[]
  >([]);
  const [selectedText, setSelectedText] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");

  const handleExport = async () => {
    const message = sow_finalize + document.map((doc) => doc.content).join(" ");
    const context = {
      role: "user",
      content: [{ type: "text", text: message }],
    };

    const response = await getBedrockResponse([context], token);

    const clauses = [];
    while (true) {
      const currentClause = getNumberTags(clauses.length + 1, response);
      if (currentClause === "") {
        break;
      }

      const title = getTitleTags([{ type: "text", text: currentClause }]);
      const clause = getCaluseTags([{ type: "text", text: currentClause }]);
      clauses.push({ title, content: clause });
    }

    setFormattedDocument(clauses);
    setPreviousDocument(clauses);
  };

  useEffect(() => {
    if (!generated.current) {
      generated.current = true;
      handleExport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generated.current]); // generate document on start

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const getEditedClause = async (clause: _clause) => {
    const prompt = `You are LUCAS, a procurement manager assistant specialized in editing Scope of Work documents. You will be given an input user request, some selected text from the  document, and the working current clause. Your goal is to modify the current clause if and only if the requested modifications are required for the given clause.\nThe current user input is <Input>${inputText}</Input>. The selected text is <SelectedText>${selectedText}</SelectedText>\nThis is the current clause you are given, it is called: ${clause.title}: <CurrentClause>${clause.content}</CurrentClause>\nYou will split your response into Thought, Action, Observation and Clause. Use this XML structure and keep everything strictly within these XML tags. There should be no content outside these XML blocks:\n<Thought>Your internal thought process.</Thought><Action>Your actions or analyses.</Action><Observation>User feedback or clarifications.</Observation><Clause>The modified clause that contains the neccessary modifications. Only return this block if the clause requires modification.</Clause>`;

    const res = await getBedrockResponse(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      token
    );

    const newClause = getCaluseTags(res);
    return newClause;
  };

  const handleEditDocument = async () => {
    const newClauses: _clause[] = [];

    for (const clause of document) {
      console.log(clause.title);
      const modifiedClause = await getEditedClause(clause);
      if (modifiedClause !== "") {
        newClauses.push({ title: clause.title, content: modifiedClause });
      } else {
        newClauses.push(clause);
      }
    }

    setPreviousDocument(formattedDocument);
    setFormattedDocument(newClauses);
    setSelectedText("");
    setInputText("");
  };

  const handleUndo = () => {
    setFormattedDocument(previousDocument);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Finalize and Export Document
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 2,
            borderRadius: 1,
            marginBottom: 2,
            width: "60%",
          }}
          onMouseUp={handleTextSelect}
        >
          <Typography variant="h5" gutterBottom>
            {documentTitle}
          </Typography>
          {formattedDocument &&
            formattedDocument.map((doc, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {doc.title}
                </Typography>
                <Typography variant="body1">{doc.content}</Typography>
              </Box>
            ))}
          {formattedDocument.length === 0 && (
            <Typography variant="body1">Generating Document...</Typography>
          )}
        </Box>
        {selectedText !== "" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
              width: "60%",
              backgroundColor: "#fff",
              padding: 2,
            }}
          >
            <Typography variant="h4" gutterBottom>
              Edit Document
            </Typography>
            <Typography variant="body1" gutterBottom>
              Selected Text: {selectedText}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                value={inputText}
                onChange={handleInputChange}
                placeholder="Enter text..."
              />
              <Button variant="contained" onClick={handleEditDocument}>
                Send
              </Button>
            </Box>
          </Box>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              navigate(
                `/sow-gen?category=${sowgenContext.category}&userInstitution=${sowgenContext.userInstitution}&supplier=${sowgenContext.supplier}&documentPurpose=${sowgenContext.documentPurpose}`,
                {
                  state: {
                    sowgenContext,
                  },
                }
              );
            }}
          >
            Edit Document
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!generated.current) {
                return;
              }

              downloadDocument(documentTitle, formattedDocument);
            }}
          >
            Download Document
          </Button>
          {previousDocument.length > 0 && (
            <Button variant="contained" onClick={handleUndo}>
              Undo
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Finish;
