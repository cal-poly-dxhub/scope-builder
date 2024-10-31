import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { _clause, _document } from "../assets/types";
import { useAuth } from "../constants/AuthProvider";
import { downloadDocument } from "../scripts/Docx";
import { getBedrockResponse, getCaluseTags } from "../scripts/LLMGeneral";

const Finish = () => {
  const { token } = useAuth();
  const location = useLocation();
  const documentTitle = location.state?.documentTitle || null;
  const navigate = useNavigate();
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
    clauses: {
      title: string;
      content: string;
      summary: string;
      truths: string;
    }[];
    currentClause: { title: string; clause: string; summary: string };
  } = location.state;

  const generated = useRef(false);
  const [document, setDocument] = useState<_document>(location.state?.document);
  const [previousDocument, setPreviousDocument] = useState<_document>(
    location.state?.document
  );
  const [selectedText, setSelectedText] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");

  const makeDocumentLLMReady = (document: _document) => {
    let newDoc: string = "";
    document.clauses.forEach((clause) => {
      newDoc += `<${clause.title}>${clause.content}</${clause.title}>`;
    });

    return newDoc;
  };

  const generateDefinitionsClause = async () => {
    if (document.clauses.find((doc) => doc.title === "Definitions and Terms")) {
      return;
    }

    const llmdoc = makeDocumentLLMReady(document);
    const prompt = `You are LUCAS, a specialist in generating scope of work documents. You are tasked with creating an definitions clause for the following document: <Document>${llmdoc}</Document>. Please review it and synthesize a definitions clause taht will be attached above the document. This clause will contain definitions of terms such as institution, supplier, and various other things relating to the document as a whole. The clause should be concise and clear, and should not contain any unnecessary information. The clause should also be free of any grammatical errors.\n\nRespond in the following XML structure. All text outside of these blocks will be ignored:<Thought>Your internal thought process</Thought><Clause>The modified clause</Clause>`;
    const message = [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ];

    const res = await getBedrockResponse(message, token);
    const clauseContent = getCaluseTags(res);
    return { title: "Definitions", content: clauseContent } as _clause;
  };

  const generateEngagementClause = async () => {
    if (
      document.clauses.find((doc) => doc.title === "Engagement of Contractor")
    ) {
      return;
    }

    const llmdoc = makeDocumentLLMReady(document);
    const prompt = `You are LUCAS, a specialist in generating scope of work documents. You are tasked with creating an engagement clause for the following document: <Document>${llmdoc}</Document>. Please review it and synthesize an engagement clause that will be attached above the document. This clause will contain the engagement of the supplier and the institution. The clause should be concise and clear, and should not contain any unnecessary information. The clause should also be free of any grammatical errors.\n\nRespond in the following XML structure. All text outside of these blocks will be ignored:<Thought>Your internal thought process</Thought><Clause>The modified clause</Clause>`;
    const message = [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ];

    const res = await getBedrockResponse(message, token);
    const clauseContent = getCaluseTags(res);
    return {
      title: "Engagement of Contractor",
      content: clauseContent,
    } as _clause;
  };

  const changeClauseWording = async (clause: _clause, definitions: _clause) => {
    const llmClause = `<${clause.title}>${clause.content}</${clause.title}>`;
    const llmDefinitions = `<${definitions.title}>${definitions.content}</${definitions.title}>`;
    const prompt = `You are LUCAS, a specialist in generating scope of work documents. You are tasked with modifying the following clause and definitions clause:\n${llmClause}\n${llmDefinitions}\nYour task is to exchange the wording in the ${clause.title} clause and replace any instances of a word or phrase that is defined in the definitions clause with the word or phrase that defines that definition.\nRespond in the following XML structure. All text outside of these blocks will be ignored:\n<Thought>Your internal thought process</Thought><Clause>The modified clause</Clause>`;
    const message = [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ];

    const res = await getBedrockResponse(message, token);
    const clauseContent = getCaluseTags(res);
    return { title: clause.title, content: clauseContent } as _clause;
  };

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
    console.log(clause.title, res);
    return newClause;
  };

  const handleEditDocument = async () => {
    const newClauses: _clause[] = [];

    for (const clause of document.clauses) {
      const modifiedClause = await getEditedClause(clause);
      if (modifiedClause !== "") {
        newClauses.push({ title: clause.title, content: modifiedClause });
      } else {
        newClauses.push(clause);
      }
    }

    setPreviousDocument(document);
    setDocument({
      ...document,
      clauses: newClauses,
    });
    setSelectedText("");
    setInputText("");
  };

  const handleUndo = () => {
    setDocument(previousDocument);
  };

  useEffect(() => {
    const handleGenerateClause = async () => {
      const newClauses: _clause[] = [];
      const engagementClause = await generateEngagementClause();
      const definitionsClause = await generateDefinitionsClause();

      if (!engagementClause || !definitionsClause) {
        console.error("Failed to generate clauses");
        alert("Failed to generate clauses, please try again.");
        return;
      }

      newClauses.push(definitionsClause);
      newClauses.push(engagementClause);

      for (const c of document.clauses) {
        const newClause = await changeClauseWording(c, definitionsClause);
        newClauses.push(newClause);
      }

      setDocument({
        ...document,
        clauses: newClauses,
      });

      generated.current = true;
    };

    handleGenerateClause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // generate clauses on start

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
          {generated ? (
            document.clauses.map((doc, index) => (
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
            ))
          ) : (
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

              downloadDocument(document);
            }}
          >
            Download Document
          </Button>
          {previousDocument.clauses.length > 0 && (
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
