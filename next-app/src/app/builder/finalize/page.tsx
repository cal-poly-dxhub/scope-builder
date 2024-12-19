"use client";

import ModalClause from "@/components/finalize/ModalClause";
import { _clause, _document } from "@/constants/types";
import { downloadDocument } from "@/scripts/docx";
import {
  getDefinitionsClause,
  getEditedClause,
  getEngagementClause,
} from "@/scripts/nextapi";
import {
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";

const Finalize = () => {
  const [finalizedClauses, setFinalizedClauses] = useState<_clause[]>([]);

  const [currentDocument, setCurrentDocument] = useState<_document>(
    {} as _document
  );

  const [modalShown, setModalShown] = useState<boolean>(false);
  const [incomingEditedClauses, setIncomingEditedClauses] = useState<_clause[]>(
    []
  );

  const [userInput, setUserInput] = useState<string>("");
  const [selectedText, setSelectedText] = useState<string>("");

  const handleSelectText = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    }
  };

  const handleSendUserEdit = async () => {
    const ui = userInput;
    setUserInput("");
    setModalShown(true);
    const promises = finalizedClauses.map((clause) =>
      getEditedClause(clause, ui, selectedText)
    );

    const editedClauses = await Promise.all(promises);
    console.log("editedClauses:", editedClauses);
    setIncomingEditedClauses(editedClauses);
  };

  const handleAcceptClause = (clause: _clause) => {
    const oldFinalizedClauseIndex = finalizedClauses.findIndex(
      (c) => c.title === clause.title
    );

    const newFinalizedClauses = [...finalizedClauses];
    newFinalizedClauses[oldFinalizedClauseIndex] = clause;
    setFinalizedClauses(newFinalizedClauses);

    const newDocument = { ...currentDocument, clauses: newFinalizedClauses };
    setCurrentDocument(newDocument);
    sessionStorage.setItem("document", JSON.stringify(newDocument));

    const newIncomingEditedClauses = incomingEditedClauses.filter(
      (c) => c.title !== clause.title
    );
    setIncomingEditedClauses(newIncomingEditedClauses);

    if (newIncomingEditedClauses.length === 0) {
      setModalShown(false);
    }
  };

  const handleExportToDocx = async () => {
    const newDocument = { ...currentDocument, clauses: finalizedClauses };
    setCurrentDocument(newDocument);
    downloadDocument(newDocument);
  };

  // get definitions and engagement clauses
  // sessionstorage
  useEffect(() => {
    const oldSessionDocument = JSON.parse(sessionStorage["document"]);
    const oldSessionClauses = oldSessionDocument?.clauses ?? [];
    setFinalizedClauses(oldSessionClauses);
    setCurrentDocument(oldSessionDocument);

    const getOtherClauses = async () => {
      const [definitionsClause, engagementClause] = await Promise.all([
        getDefinitionsClause(oldSessionDocument),
        getEngagementClause(oldSessionDocument),
      ]);

      const filteredClauses = oldSessionDocument.clauses.filter(
        (c: _clause) =>
          c === undefined ||
          (c.title !== "Definitions" && c.title !== "Engagement of Contractor")
      );

      setFinalizedClauses([
        definitionsClause,
        engagementClause,
        ...(filteredClauses ?? []),
      ]);
      sessionStorage.setItem(
        "document",
        JSON.stringify({
          ...oldSessionDocument,
          clauses: [
            definitionsClause,
            engagementClause,
            ...(filteredClauses ?? []),
          ],
        })
      );
    };

    if (
      oldSessionClauses[0].title !== "Definitions" ||
      oldSessionClauses[1].title !== "Engagement of Contractor"
    ) {
      const newFinalizedClauses = [
        { title: "Definitions", content: "loading...", notes: "" },
        { title: "Engagement of Contractor", content: "loading...", notes: "" },
        ...oldSessionClauses,
      ];
      setFinalizedClauses(newFinalizedClauses);
      getOtherClauses();
    } else if (
      oldSessionClauses[0].content === "loading..." ||
      oldSessionClauses[1].content === "loading..."
    ) {
      getOtherClauses();
    }
  }, []);

  return (
    <Stack
      align="center"
      ml="auto"
      mr="auto"
      pl="calc(50vw - 300px)"
      pr="calc(50vw - 300px)"
      pb="85px"
      onMouseUp={handleSelectText}
      style={{ overflowY: "auto" }}
    >
      <Text size="xl" fw="bold">
        New Scope of Work
      </Text>
      {finalizedClauses.map((clause, index) => (
        <Stack key={index}>
          <Text size="lg" fw="bold">
            {clause.title}
          </Text>
          <Text w="600px">{clause.content}</Text>
        </Stack>
      ))}
      <Box
        pos="fixed"
        bottom={10}
        bg="gray.0"
        p="sm"
        style={{ borderRadius: 8 }}
      >
        <Group w="60vw">
          <TextInput
            value={userInput}
            onChange={(e) => setUserInput(e.currentTarget.value)}
            placeholder="Edit document..."
            flex={1}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendUserEdit();
              }
            }}
          />
          <Button variant="outline" onClick={handleSendUserEdit}>
            Send
          </Button>
          <Button variant="light" onClick={handleExportToDocx}>
            Export to Word
          </Button>
        </Group>
      </Box>
      <Modal
        opened={modalShown}
        onClose={() => {
          setModalShown(false);
          setIncomingEditedClauses([]);
        }}
        title={
          <Text size="lg" fw="bold">
            Incoming Edited Clauses
          </Text>
        }
        mah="80vh"
        size="auto"
        style={{ overflowY: "auto" }}
      >
        <Stack w="75vw">
          {incomingEditedClauses.map((clause) => {
            const originalClause = finalizedClauses.find(
              (c) => c.title === clause.title
            )!;

            return (
              <Stack key={clause.title}>
                <ModalClause
                  original={originalClause}
                  incoming={clause}
                  handleSelect={handleAcceptClause}
                />
              </Stack>
            );
          })}
          {incomingEditedClauses.length === 0 && (
            <Text>Waiting on incoming clauses...</Text>
          )}
        </Stack>
      </Modal>
    </Stack>
  );
};

export default Finalize;
