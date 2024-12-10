import { clauses } from "@/constants/categories";
import { _style } from "@/constants/types";
import { Box, Button, Modal, Text, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";

interface CustomTemplate {
  title: string;
  clause: string;
}

const ClauseSelector = ({
  currentCategory,
  currentClause,
  handleAddClause,
  document,
  style,
}: {
  currentCategory: string;
  currentClause: { title: string; clause: string };
  handleAddClause: (clause: { title: string; clause: string }) => Promise<void>;
  document: { title: string; content: string }[];
  debug?: boolean;
  style?: _style;
}) => {
  const [customModal, setCustomModal] = useState<boolean>(false);
  const [customTemplate, setCustomTemplate] = useState<CustomTemplate>({
    title: "",
    clause: "",
  });

  const templates = clauses.filter(
    (clause) => clause.category === currentCategory || clause.category === "All"
  );

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  const handleAddCustomClause = () => {
    setCustomTemplates([...customTemplates, customTemplate]);
    setCustomTemplate({ title: "", clause: "" });
    setCustomModal(false);
  };

  return (
    <Box style={style}>
      <Text variant="h4">Add Clauses</Text>
      <Box>
        {templates.map((clause, index) => {
          return (
            <Box key={index}>
              <Text variant="h6">{clause.category}</Text>
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
                      style={{
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
                      <Text variant="body1">{clause.title}</Text>
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
          <Text variant="h6">Custom Clauses</Text>
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
                style={{
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
                <Text variant="body1">{clause.title}</Text>
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
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 5px 10px 15px",
              borderRadius: "5px",
              borderBottom: `1px solid var(--border-color)`,
            }}
          >
            <Text variant="body1">Custom Clause</Text>
            <Button variant="contained" onClick={() => setCustomModal(true)}>
              Add Clause
            </Button>
          </Box>
        </Box>
      </Box>
      <Modal
        opened={customModal}
        onClose={() => setCustomModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <Text variant="h6">Add Custom Clause</Text>
          <Box>
            <TextInput
              placeholder="Enter the title of the clause..."
              value={customTemplate.title}
              onChange={(e) =>
                setCustomTemplate({
                  ...customTemplate,
                  title: e.target.value,
                })
              }
              variant="outlined"
            />
            <Textarea
              placeholder="Enter your custom clause here..."
              value={customTemplate.clause}
              onChange={(e) =>
                setCustomTemplate({
                  ...customTemplate,
                  clause: e.target.value,
                })
              }
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
