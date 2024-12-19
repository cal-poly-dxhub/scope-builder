import { _message } from "@/constants/types";
import { Paper, Text } from "@mantine/core";
import { getClauseTags, getResponseTags } from "../scripts/extract";

const Message = ({
  message,
  currentClauseTitle,
}: {
  message: _message;
  currentClauseTitle?: string;
}) => {
  const isAssistant = message.role === "assistant";

  const messageContent = message.content[0].text.includes(
    "You are LUCAS, a procurement manager assistant specialized in creating"
  )
    ? "Start working on " + (currentClauseTitle ?? "clause")
    : isAssistant
    ? getClauseTags(message)
      ? getClauseTags(message)
      : getResponseTags(message)
    : message.content[0].text;

  return (
    <Paper bg={isAssistant ? "gray.0" : "green.1"} p="xs">
      <Text c="black">{messageContent || "Error: No message content"}</Text>
    </Paper>
  );
};

export default Message;
