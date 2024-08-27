import { ReactNode, useEffect, useState } from "react";
import { theme } from "../assets/theme";
import { _style } from "../assets/types";

const Button = ({
  children,
  onClick,
  onHover,
  style,
}: {
  children: ReactNode | ReactNode[] | undefined;
  onClick: () => void;
  onHover?: () => void;
  style: _style;
}) => {
  const [mouseHover, setMouseHover] = useState(false);

  const hoverStyle = {
    backgroundColor: mouseHover
      ? theme.colors.alternate
      : theme.colors.alternateBackground,
    transition: "background-color 0.1s",
  };

  useEffect(() => {
    if (mouseHover && onHover) {
      onHover();
    }
  }, [mouseHover, onHover]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setMouseHover(true)}
      onMouseLeave={() => setMouseHover(false)}
      style={{ ...styles.container, ...hoverStyle, ...style }}
    >
      {children}
    </button>
  );
};

export default Button;

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
};
