import { Box, Button, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import prompts from "../assets/prompt.json";
import Navbar from "../Components/Navbar";
import { downloadDocument } from "../scripts/Docx";
import {
  getBedrockResponse,
  getCaluseTags,
  getNumberTags,
  getTitleTags,
} from "../scripts/LLMGeneral";

const sow_finalize = prompts["sow_finalize"];

const Finish = () => {
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

  const handleExport = async () => {
    const message = sow_finalize + document.map((doc) => doc.content).join(" ");
    const context = {
      role: "user",
      content: [{ type: "text", text: message }],
    };

    const response = await getBedrockResponse([context]);

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
  };

  useEffect(() => {
    if (!generated.current) {
      generated.current = true;
      handleExport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generated.current]); // generate document on start

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar />
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
            border: "1px solid #ccc",
            borderRadius: 1,
            marginBottom: 2,
          }}
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
          <Button
            variant="contained"
            onClick={() => {
              if (!generated.current) {
                return;
              }

              setFormattedDocument([]);
              generated.current = false;
            }}
          >
            Reformat Document
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Finish;
