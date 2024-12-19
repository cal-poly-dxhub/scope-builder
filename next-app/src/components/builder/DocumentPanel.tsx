"use client";

import { _clause, _style } from "@/constants/types";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";

const DocumentPanel = ({
  finishedClauses,
  setFinishedClauses,
  handleChangeClause,
  style,
}: {
  finishedClauses: _clause[];
  setFinishedClauses: (clauses: _clause[]) => void;
  handleChangeClause: (title: string) => void;
  style?: _style;
}) => {
  const handleExport = async () => {
    const oldDocument = JSON.parse(sessionStorage["document"]);
    const newDocument = { ...oldDocument, clauses: finishedClauses };
    sessionStorage.setItem("document", JSON.stringify(newDocument));
    window.location.href = "/builder/finalize";
  };

  return (
    <Stack h="calc(100vh - 93px)" pb="21px" style={{ overflowY: "auto" }}>
      <Text size="xl" fw="bold">
        Completed Clauses
      </Text>
      {finishedClauses?.length > 0 &&
        finishedClauses.map((clause, index) => (
          <Paper key={index} p="sm" bg="gray.0">
            <Text size="lg">{clause.title}</Text>
            <Text lineClamp={3}>{clause.content}</Text>
            <Group mt="sm">
              <Button
                variant="light"
                disabled={
                  clause.title === "Definitions" ||
                  clause.title === "Engagement of Contractor"
                }
                onClick={() => {
                  handleChangeClause(clause.title);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                color="red"
                onClick={() => {
                  setFinishedClauses(
                    finishedClauses.filter((c) => c.title !== clause.title)
                  );
                }}
                style={{ alignSelf: "flex-start" }}
              >
                Remove
              </Button>
            </Group>
          </Paper>
        ))}
      <Group>
        {finishedClauses.length > 0 && (
          <Button variant="outline" onClick={handleExport}>
            Export Document
          </Button>
        )}
        {/* <Button
          variant="contained"
          ml="sm"
          onClick={() => console.log(document)}
        >
          Log Document
        </Button> */}
      </Group>
    </Stack>
  );
};

export default DocumentPanel;
