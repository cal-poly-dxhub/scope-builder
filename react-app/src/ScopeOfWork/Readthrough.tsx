import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { createDocument } from "../scripts/Docx";

const Readthrough = () => {
  const { documentTitle, document: dc } = useLocation().state as {
    documentTitle: string;
    document: { title: string; content: string }[];
  };

  const [document, setDocument] =
    useState<{ title: string; content: string }[]>(dc);

  const handleExport = () => {
    if (!document) {
      return alert("No document to export");
    }

    if (!documentTitle) {
      const title = `ScopeOfWork${new Date().getTime()}`;
      createDocument(title, document);
      return;
    }

    createDocument(documentTitle, document);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Whole Readthrough
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          marginBottom: 4,
        }}
      >
        {document.map((doc, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginBottom: 2,
              padding: 2,
              border: "1px solid #ccc",
              borderRadius: 1,
            }}
          >
            <Typography variant="h6">{doc.title}</Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setDocument(document.filter((_, i) => i !== index));
              }}
            >
              Remove
            </Button>
          </Box>
        ))}
      </Box>
      <Button variant="contained" onClick={handleExport}>
        Export Document
      </Button>
    </Box>
  );
};

export default Readthrough;
