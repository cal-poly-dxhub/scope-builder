"use client";

import Message from "@/components/Message";
import { useAuth } from "@/constants/AuthContext";
import { _style } from "@/constants/types";
import { Box, Button, Modal, Text, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  getBedrockResponse,
  getCaluseTags,
  getIncrementalTruths,
  getSummaryTags,
  getTruthsTags,
} from "../../scripts/LLMGeneral";

const Chat = ({
  loading,
  setLoading,
  contexts,
  setContexts,
  setAccepted,
  currentClause,
  setCurrentClause,
  document,
  debug = false,
  style,
}: {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  contexts: {
    title: string;
    context: { role: string; content: { type: string; text: string }[] }[];
  }[];
  setContexts: (
    contexts: {
      title: string;
      context: { role: string; content: { type: string; text: string }[] }[];
    }[]
  ) => void;
  setAccepted: (accepted: boolean) => void;
  currentClause: {
    title: string;
    clause: string;
    summary: string;
    truths: string;
  };
  setCurrentClause: (currentClause: {
    title: string;
    clause: string;
    summary: string;
    truths: string;
  }) => void;
  document: {
    title: string;
    content: string;
    summary: string;
    truths: string;
  }[];
  debug?: boolean;
  style?: _style;
}) => {
  const { token } = useAuth();
  const [inputValue, setInputValue] = useState<string>("");
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

    const ui = inputValue;
    setInputValue("");

    const oldContext = contexts.find(
      (c) => c.title === currentClause.title
    ) ?? {
      title: currentClause.title,
      context: [],
    };

    const incrementalTruths = getIncrementalTruths(document);
    if (oldContext.context.length > 0) {
      oldContext.context[0].content[0].text += incrementalTruths;
    }

    const newContext = [
      ...oldContext.context,
      { role: "user", content: [{ type: "text", text: ui }] },
    ];
    const newContexts = [
      ...contexts.filter((c) => c.title !== currentClause.title),
      { title: currentClause.title, context: newContext },
    ];

    setContexts(newContexts);

    setLoading(true);
    const r = await getBedrockResponse(newContext, token);
    const finishedClause = getCaluseTags(r);
    const summary = getSummaryTags(r);
    const truths = getTruthsTags(r);

    if (finishedClause) {
      setCurrentClause({
        title: currentClause.title,
        clause: finishedClause,
        summary,
        truths,
      });
      setClausePopup(true);
    }

    newContext.push({ role: "assistant", content: r });
    setContexts(newContexts);

    setLoading(false);
  };

  const getMessages = () => {
    const currentContext = contexts.find(
      (c) => c.title === currentClause.title
    )?.context;

    if (!currentContext) {
      return [];
    }

    return currentContext.map((message, index) => {
      if (
        message.role === "user" &&
        message.content[0].text.includes(
          "You are LUCAS, a procurement manager assistant specialized in creating scope of work"
        )
      ) {
        return (
          <Box
            key={index}
            style={{
              marginBottom: 2,
              backgroundColor: "#f0f0f0",
              padding: 1,
              borderRadius: 1,
              width: "100%",
            }}
          >
            <Text>Start working on {currentClause.title}</Text>
          </Box>
        );
      }

      return <Message key={index} message={message} />;
    });
  };

  useEffect(() => {
    const chatBox = window.document.querySelector(".message-container");
    chatBox?.scrollTo(0, chatBox.scrollHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contexts, loading]); // auto scroll to bottom

  return (
    <Box
      h="calc(100vh - 100px)"
      style={{
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <Box style={{ display: "flex", justifyContent: "center" }}>
        <Text size="lg" fw="bold">
          Scope of Work Generator
        </Text>
      </Box>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          marginTop: 2,
          padding: 2,
          overflowY: "auto",
        }}
      >
        <Box
          className="message-container"
          style={{
            width: "auto",
          }}
        >
          {getMessages()}
        </Box>
        {loading && (
          <Box style={{ marginTop: 2 }}>
            <Text variant="body1">Loading...</Text>
          </Box>
        )}
      </Box>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: 2,
          padding: 2,
        }}
      >
        <TextInput
          style={{ flexGrow: 1, marginRight: 2 }}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <Button variant="contained" onClick={handleSendMessage}>
          Send
        </Button>
        {debug && (
          <Button
            variant="contained"
            onClick={() => {
              console.log(contexts);
            }}
            style={{ marginLeft: 2 }}
          >
            Log Context
          </Button>
        )}
      </Box>
      <Modal opened={clausePopup} onClose={() => setClausePopup(false)}>
        <Text size="lg" fw="bold">
          {currentClause.title}
        </Text>
        <Text variant="body1">{currentClause.clause}</Text>
        <Button
          onClick={() => {
            setAccepted(true);
            setClausePopup(false);
          }}
        >
          Accept Clause
        </Button>
        <Button onClick={() => setClausePopup(false)}>Continue Editing</Button>
      </Modal>
    </Box>
  );
};

export default Chat;
