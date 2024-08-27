import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { useState } from "react";
import json from "../assets/SOWCategories.json";
import { _style } from "../assets/types";

interface CustomTemplate {
  title: string;
  clause: string;
}

const ClauseSelector = ({
  currentCategory,
  currentClause,
  handleAddClause,
  document,
  debug = false,
  style,
}: {
  currentCategory: string;
  currentClause: { title: string; clause: string };
  handleAddClause: (clause: any) => void;
  document: { title: string; content: string }[];
  debug?: boolean;
  style?: _style;
}) => {
  const [customModal, setCustomModal] = useState<boolean>(false);
  const [customTemplate, setCustomTemplate] = useState<CustomTemplate>({
    title: "",
    clause: "",
  });

  const templates = json.Clauses.filter(
    (clause) => clause.category === currentCategory || clause.category === "All"
  );

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  const handleAddCustomClause = () => {
    setCustomTemplates([...customTemplates, customTemplate]);
    setCustomTemplate({ title: "", clause: "" });
    setCustomModal(false);
  };

  return (
    <Box sx={style}>
      <Typography variant="h4">Add Clauses</Typography>
      <Box>
        {templates.map((clause, index) => {
          return (
            <Box key={index}>
              <Typography variant="h6">{clause.category}</Typography>
              <Box>
                {clause.clauses.map((clause, index) => {
                  const selected = currentClause.title === clause.title;
                  const inDocument = document.find(
                    (doc) => doc.title === clause.title
                  )
                    ? true
                    : false;
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 5px 10px 15px",
                        borderRadius: "5px",
                        borderBottom:
                          selected || inDocument
                            ? `1px solid var(--background-color)`
                            : `1px solid var(--border-color)`,
                        backgroundColor: selected
                          ? "var(--alternate-color)"
                          : inDocument
                          ? "#c0c0c0"
                          : "transparent",
                      }}
                    >
                      <Typography variant="body1">{clause.title}</Typography>
                      <Button
                        variant="contained"
                        disabled={selected || inDocument}
                        onClick={() => {
                          handleAddClause(clause);
                        }}
                      >
                        Add Clause
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
        <Box>
          <Typography variant="h6">Custom Clauses</Typography>
          {customTemplates.map((clause, index) => {
            const selected = currentClause.title === clause.title;
            const inDocument = document.find(
              (doc) => doc.title === clause.title
            )
              ? true
              : false;
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 5px 10px 15px",
                  borderRadius: "5px",
                  borderBottom: `1px solid var(--background-color)`,
                  backgroundColor: selected
                    ? "var(--alternate-color)"
                    : inDocument
                    ? "#c0c0c0"
                    : "transparent",
                }}
              >
                <Typography variant="body1">{clause.title}</Typography>
                <Button
                  variant="contained"
                  onClick={() => handleAddClause(clause)}
                  disabled={selected || inDocument}
                >
                  Add Clause
                </Button>
              </Box>
            );
          })}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 5px 10px 15px",
              borderRadius: "5px",
              borderBottom: `1px solid var(--border-color)`,
            }}
          >
            <Typography variant="body1">Custom Clause</Typography>
            <Button variant="contained" onClick={() => setCustomModal(true)}>
              Add Clause
            </Button>
          </Box>
        </Box>
      </Box>
      <Modal
        open={customModal}
        onClose={() => setCustomModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <Typography variant="h6">Add Custom Clause</Typography>
          <Box>
            <TextField
              placeholder="Enter the title of the clause..."
              value={customTemplate.title}
              onChange={(e) =>
                setCustomTemplate({
                  ...customTemplate,
                  title: e.target.value,
                })
              }
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              placeholder="Enter your custom clause here..."
              value={customTemplate.clause}
              onChange={(e) =>
                setCustomTemplate({
                  ...customTemplate,
                  clause: e.target.value,
                })
              }
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              margin="normal"
            />
          </Box>
          <Box>
            <Button variant="contained" onClick={handleAddCustomClause}>
              Add Clause
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setCustomTemplate({ title: "", clause: "" });
                setCustomModal(false);
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ClauseSelector;
