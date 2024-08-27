import { _style } from "../assets/types";
import Container from "./Container";
import Text from "./Text";
import TextField from "./TextField";

const ChatBox = ({
  onSubmit,
  style,
}: {
  onSubmit: (s: string) => void;
  style?: _style;
}) => {
  return (
    <Container style={{ ...styles.container, ...style }} className="column">
      <Text type="subtitle">Enter requirements for selected text</Text>
      <TextField onSubmit={onSubmit} button autoFocus />
    </Container>
  );
};

export default ChatBox;

const styles = {
  container: {
    width: "30vw",
    minHeight: "10rem",
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    marginBottom: "1rem",
    color: "#333",
    fontWeight: "bold",
  },
  textField: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    padding: "0.5rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
};
