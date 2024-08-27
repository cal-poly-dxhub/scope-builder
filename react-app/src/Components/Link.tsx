import { ReactNode, useState } from "react";
import { theme } from "../assets/theme";
import { _style } from "../assets/types";

const Link = ({
  children,
  href,
  className,
  style,
}: {
  children: ReactNode | ReactNode[];
  href: string;
  className?: string;
  style?: _style;
}) => {
  const [hover, setHover] = useState<boolean>(false);
  const [mouseDown, setMouseDown] = useState<boolean>(false);

  const colorStyle = {
    color: mouseDown
      ? theme.colors.click
      : hover
      ? theme.colors.alternate
      : theme.colors.text,
  };

  return (
    <a
      href={href}
      style={{ ...styles.link, ...colorStyle, ...style }}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
    >
      {children}
    </a>
  );
};

export default Link;

const styles = {
  link: {
    textDecoration: "none",
  },
};
