"use client";

import { _clause } from "@/constants/types";
import { getClauseTags, getNotesTags } from "@/scripts/extract";
import { getAssistantChatResponse } from "@/scripts/nextapi";
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
import Message from "../Message";

const Chat = ({
  loading,
  setLoading,
  messages,
  appendMessage,
  acceptClause,
  currentClauseTitle,
}: {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  messages: { role: string; content: { type: string; text: string }[] }[];
  appendMessage: (
    clauseTitle: string,
    message: {
      role: string;
      content: { type: string; text: string }[];
    }
  ) => void;
  acceptClause: (clause: _clause) => void;
  currentClauseTitle: string;
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [currentClause, setCurrentClause] = useState<_clause>({
    title: "",
    content: "",
    notes: "",
  });
  const [clausePopup, setClausePopup] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") {
      return;
    }

    if (loading) {
      return;
    }

    appendMessage(currentClauseTitle, {
      role: "user",
      content: [{ type: "text", text: inputValue }],
    });

    setInputValue("");
    setLoading(true);

    const response = await getAssistantChatResponse(
      [
        ...messages,
        {
          role: "user",
          content: [{ type: "text", text: inputValue }],
        },
      ],
      currentClauseTitle
    );

    const clause = getClauseTags(response);
    if (clause) {
      const notes = getNotesTags(response);
      setCurrentClause({
        title: currentClauseTitle,
        content: clause,
        notes,
      });
      setClausePopup(true);
    }

    appendMessage(currentClauseTitle, response);
    setLoading(false);
  };

  useEffect(() => {
    const chatBox = window.document.querySelector(".message-container");
    chatBox?.scrollTo(0, chatBox.scrollHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading]); // auto scroll to bottom

  return (
    <Stack h="calc(100vh - 93px)" pb="82px" style={{ overflowY: "auto" }}>
      <Text size="lg" fw="bold">
        Scope of Work Generator
      </Text>
      {messages.map((message, index) => (
        <Message
          key={index}
          message={message}
          currentClauseTitle={currentClauseTitle}
        />
      ))}
      {loading && (
        <Box style={{ marginTop: 2 }}>
          <Text variant="body1">Loading...</Text>
        </Box>
      )}
      <Box pos="fixed" bottom="15px" left="30vw" right="calc(30vw + 15px)">
        <Group bg="gray.0" p="xs" style={{ borderRadius: 8 }}>
          <TextInput
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            style={{ flex: 1 }}
          />
          <Button variant="outline" onClick={handleSendMessage}>
            Send
          </Button>
        </Group>
      </Box>
      {/* <Button
          variant="contained"
          onClick={() => {
            console.log(messages);
          }}
          style={{ marginLeft: 2 }}
        >
          Log Messages
        </Button> */}
      <Modal
        opened={clausePopup}
        onClose={() => setClausePopup(false)}
        title={
          <Text size="lg" fw="bold">
            {currentClauseTitle}
          </Text>
        }
      >
        <Stack>
          <Text>{currentClause.content}</Text>
          <Group>
            <Button
              variant="outline"
              onClick={() => {
                console.log(currentClause);
                acceptClause(currentClause);
                setClausePopup(false);
              }}
            >
              Accept Clause
            </Button>
            <Button variant="light" onClick={() => setClausePopup(false)}>
              Continue Editing
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default Chat;
