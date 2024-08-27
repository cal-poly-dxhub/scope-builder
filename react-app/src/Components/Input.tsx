import { useState } from "react";
import { theme } from "../assets/theme";
import { _style } from "../assets/types";

const Input = ({
  placeholder,
  value,
  onChangeText,
  autoCapitalize,
  secureTextEntry,
  style,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
  style?: _style;
}) => {
  const [mouseHover, setMouseHover] = useState(false);

  const hoverStyle = {
    backgroundColor: mouseHover
      ? theme.colors.lightHover
      : theme.colors.alternateBackground,
    transition: "background-color 0.1s",
  };

  return (
    <input
      style={{ ...styles.input, ...hoverStyle, ...style }}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
      autoCapitalize={autoCapitalize}
      type={secureTextEntry ? "password" : "text"}
      onMouseEnter={() => setMouseHover(true)}
      onMouseLeave={() => setMouseHover(false)}
    />
  );
};

export default Input;

const styles = {
  input: {
    height: "40px",
    borderWidth: "1px",
    borderColor: theme.colors.border,
    borderRadius: "5px",
    paddingHorizontal: "10px",
    backgroundColor: theme.colors.alternateBackground,
    color: theme.colors.text,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
};
