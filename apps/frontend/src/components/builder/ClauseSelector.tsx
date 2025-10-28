import { templates } from "@/constants/templates";
import { _clause, _clauseTemplate } from "@/constants/types";
import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";

const ClauseSelector = ({
  category,
  currentClauseTitle,
  handleAddClauseTemplate,
}: {
  category: string;
  currentClauseTitle: string;
  handleAddClauseTemplate: (clause: _clauseTemplate) => Promise<void>;
  debug?: boolean;
}) => {
  const [modalShown, setModalShown] = useState<boolean>(false);
  const [customClause, setCustomClause] = useState<_clauseTemplate>({
    title: "",
    requirements: "",
  });
  const [startedClauseTitles, setStartedClauseTitles] = useState<string[]>([]);

  const clauseTemplates = templates.filter(
    (clause) => clause.category === category || clause.category === "All"
  );

  const [customClauses, setCustomClauses] = useState<_clauseTemplate[]>([]);

  const handleCreateCustomClause = () => {
    setCustomClauses([...customClauses, customClause]);
    setCustomClause({ title: "", requirements: "" });
    setModalShown(false);
  };

  // sessionstorage
  useEffect(() => {
    setStartedClauseTitles(
      JSON.parse(sessionStorage["document"] ?? "[]")?.clauses?.map(
        (clause: _clause) => clause.title
      ) ?? []
    );
  }, []);

  // set started clause titles
  useEffect(() => {
    const oldStartedClauseTitles = startedClauseTitles;
    if (
      currentClauseTitle &&
      !oldStartedClauseTitles.includes(currentClauseTitle)
    ) {
      setStartedClauseTitles([...oldStartedClauseTitles, currentClauseTitle]);
    }
  }, [currentClauseTitle]);

  return (
    <Stack
      h="calc(100vh - 93px)"
      px="sm"
      pb="21px"
      style={{ overflowY: "auto" }}
    >
      <Text size="lg" fw="bold">
        Add Clauses
      </Text>
      {clauseTemplates.map((template, index) => {
        return (
          <Stack key={index}>
            <Text fw="bold">{template.category}</Text>
            {[...template.clauses, ...customClauses].map((clause, index) => {
              const selected = currentClauseTitle === clause.title;
              const started = startedClauseTitles.includes(clause.title);
              return (
                <Group
                  key={index}
                  bg={selected ? "green.0" : started ? "gray.0" : "transparent"}
                  justify="space-between"
                  p="xs"
                  style={{ borderRadius: 8 }}
                >
                  <Text>{clause.title}</Text>
                  <Button
                    variant="light"
                    disabled={selected}
                    onClick={() => {
                      handleAddClauseTemplate(clause);
                    }}
                  >
                    {selected
                      ? "Editing Clause"
                      : started
                      ? "Edit Clause"
                      : "Add Clause"}
                  </Button>
                </Group>
              );
            })}
          </Stack>
        );
      })}
      <Group justify="space-between">
        <Text>Custom Clause</Text>
        <Button variant="light" onClick={() => setModalShown(true)}>
          Add a Custom Clause
        </Button>
      </Group>
      <Modal
        opened={modalShown}
        onClose={() => setModalShown(false)}
        title={
          <Text size="lg" fw="bold">
            Add Custom Clause
          </Text>
        }
      >
        <Stack>
          <TextInput
            placeholder="Enter the title of the clause..."
            value={customClause.title}
            size="md"
            fw="bold"
            onChange={(e) =>
              setCustomClause({
                ...customClause,
                title: e.target.value,
              })
            }
          />
          <Textarea
            placeholder="Enter your custom clause here..."
            value={customClause.requirements}
            onChange={(e) =>
              setCustomClause({
                ...customClause,
                requirements: e.target.value,
              })
            }
          />
          <Group>
            <Button variant="light" onClick={handleCreateCustomClause}>
              Add Clause
            </Button>
            <Button
              variant="light"
              onClick={() => {
                setCustomClause({ title: "", requirements: "" });
                setModalShown(false);
              }}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default ClauseSelector;
