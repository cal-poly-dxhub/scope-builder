import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Message from "../Components/Message";
import { useAuth } from "../constants/AuthProvider";
import {
  getBedrockResponse,
  getCaluseTags,
  getIncrementalContext,
  getResponseTags,
  getSummaryTags,
} from "../scripts/LLMGeneral";

const AmendChat = ({
  loading,
  setLoading,
  context,
  setContext,
  setAccepted,
  currentClause,
  setCurrentClause,
  document,
  debug,
  style,
}: {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  context: {
    title: string;
    context: {
      role: string;
      content: { type: string; text: string }[];
    }[];
  };
  setContext: (context: {
    title: string;
    context: {
      role: string;
      content: { type: string; text: string }[];
    }[];
  }) => void;
  setAccepted: (accepted: boolean) => void;
  currentClause: {
    title: string;
    clause: string;
    summary: string;
  };
  setCurrentClause: (currentClause: {
    title: string;
    clause: string;
    summary: string;
  }) => void;
  document: {
    title: string;
    content: string;
    summary: string;
    truths: string;
  }[];
  debug: boolean;
  style?: React.CSSProperties;
}) => {
  const { token } = useAuth();
  const [inputValue, setInputValue] = useState<string>("");
  const [clausePopup, setClausePopup] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") {
      return;
    }

    const ui = inputValue;
    setInputValue("");

    const oldContext = context;

    const incrementalContext = getIncrementalContext(document);
    if (oldContext.context.length > 0) {
      oldContext.context[0].content[0].text += incrementalContext;
    }

    const newContext = [
      ...oldContext.context,
      { role: "user", content: [{ type: "text", text: ui }] },
    ];
    const newContexts = { title: currentClause.title, context: newContext };
    setContext(newContexts);

    setLoading(true);
    const r = await getBedrockResponse(newContext, token);
    const finishedClause = getCaluseTags(r);
    const summary = getSummaryTags(r);

    if (finishedClause) {
      setCurrentClause({
        title: currentClause.title,
        clause: finishedClause,
        summary,
      });
      setClausePopup(true);
    }

    newContext.push({ role: "assistant", content: r });
    const finalContexts = { title: currentClause.title, context: newContext };
    setContext(finalContexts);

    setLoading(false);
  };

  const getMessages = () => {
    const currentContext = context.context;

    if (!currentContext) {
      return [];
    }

    return currentContext.map((message, index) => {
      if (message.role === "assistant") {
        if (getCaluseTags(message.content) !== "") {
          return (
            <Box key={index} sx={{ marginBottom: 2 }}>
              {getCaluseTags(message.content)}
            </Box>
          );
        }

        return (
          <Box key={index} sx={{ marginBottom: 2 }}>
            {getResponseTags(message.content)}
          </Box>
        );
      }

      if (
        message.role === "user" &&
        message.content[0].text.includes(
          "You are LUCAS, a procurement manager assistant specialized in creating scope of work"
        )
      ) {
        return (
          <Box
            key={index}
            sx={{
              marginBottom: 2,
              backgroundColor: "#f0f0f0",
              padding: 1,
              borderRadius: 1,
              width: "100%",
            }}
          >
            <Typography variant="body1" color="secondary">
              Start working on {currentClause.title}
            </Typography>
          </Box>
        );
      }

      return <Message key={index} message={message} />;
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [context, loading]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        height: "85vh",
        ...style,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
        <Typography variant="h4">Clause Amendment Chat</Typography>
      </Box>
      <Box
        sx={{
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
          sx={{
            width: "auto",
          }}
        >
          {getMessages()}
          <div ref={messagesEndRef} />
        </Box>
        {loading && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="body1">Loading...</Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginTop: 2,
          padding: 2,
        }}
      >
        <TextField
          sx={{ flexGrow: 1, marginRight: 2 }}
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
              console.log(context);
            }}
            sx={{ marginLeft: 2 }}
          >
            Log Context
          </Button>
        )}
      </Box>
      <Dialog open={clausePopup} onClose={() => setClausePopup(false)}>
        <DialogTitle>{currentClause.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{currentClause.clause}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAccepted(true);
              setClausePopup(false);
            }}
          >
            Accept Clause
          </Button>
          <Button onClick={() => setClausePopup(false)}>
            Continue Editing
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AmendChat;
