import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { _document, _style } from "../assets/types";

const DocumentPanel = ({
  document,
  setDocument,
  documentTitle,
  setCurrentClause,
  sowgenContext,
  debug = false,
  style,
}: {
  document: {
    title: string;
    content: string;
    summary: string;
    truths: string;
  }[];
  setDocument: (
    document: {
      title: string;
      content: string;
      summary: string;
      truths: string;
    }[]
  ) => void;
  documentTitle: string | null;
  setCurrentClause: (currentClause: {
    title: string;
    clause: string;
    summary: string;
    truths: string;
  }) => void;
  sowgenContext: {
    contexts: {
      title: string;
      context: { role: string; content: { type: string; text: string }[] }[];
    }[];
    category: string | null;
    userInstitution: string | null;
    supplier: string | null;
    documentPurpose: string | null;
    document: _document;
    currentClause: {
      title: string;
      clause: string;
      summary: string;
      truths: string;
    };
    documentTitle: string | null;
  };
  debug?: boolean;
  style?: _style;
}) => {
  const navigate = useNavigate();

  const handleExport = async () => {
    navigate("/sow-finish", {
      state: sowgenContext,
    });
  };

  return (
    <Box sx={style} height="auto">
      <Typography variant="h4" gutterBottom>
        Current Document
      </Typography>
      <Box>
        {document.map((doc, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{doc.title}</Typography>
              <Typography variant="body1">{doc.content}</Typography>
            </CardContent>
            <Divider />
            <CardActions>
              <Button
                variant="contained"
                onClick={() => {
                  setCurrentClause({
                    title: doc.title,
                    clause: doc.content,
                    summary: "",
                    truths: "",
                  });
                }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setDocument(document.filter((_, i) => i !== index));
                }}
              >
                Remove
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      <Box sx={{ mt: 2 }}>
        {document.length > 0 && (
          <Button variant="contained" onClick={handleExport}>
            Export Document
          </Button>
        )}
        {debug && (
          <Button
            variant="contained"
            sx={{ ml: 2 }}
            onClick={() => console.log(document)}
          >
            Log Document
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default DocumentPanel;
