import { Box, Text } from "@mantine/core";
import { getCaluseTags, getResponseTags } from "../scripts/LLMGeneral";

interface MessageProps {
  message: {
    role: string;
    content: { type: string; text: string }[];
  };
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const getMessageContent = () => {
    if (isAssistant) {
      const clauseText = getCaluseTags(message.content);
      if (clauseText) {
        return clauseText;
      }

      return getResponseTags(message.content);
    }

    return message.content.map((content) => content.text).join(" ");
  };

  return (
    <Box
      style={{
        marginBottom: 2,
        backgroundColor: isUser ? "#aca" : "#e0e0e0",
        padding: 1,
        borderRadius: 1,
        width: "auto",
      }}
    >
      <Text c={message.role === "user" ? "blue.0" : "black.0"}>
        {getMessageContent()}
      </Text>
    </Box>
  );
};

export default Message;
