import { ReactNode, useState } from "react";
import { theme } from "../assets/theme";
import { _style } from "../assets/types";

const Container = ({
  children,
  className,
  regularBackgroundColor = theme.colors.background,
  hoverBackgroundColor = theme.colors.alternateBackground,
  transition = "0.4",
  style,
}: {
  children: ReactNode | ReactNode[];
  className?: string;
  regularBackgroundColor?: string;
  hoverBackgroundColor?: string;
  transition?: string;
  style?: _style;
}) => {
  const [hover, setHover] = useState<boolean>(false);

  const bgColor = {
    backgroundColor: hover ? hoverBackgroundColor : regularBackgroundColor,
    transition: `background-color ${transition}s`,
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...bgColor, ...style }}
      className={className}
    >
      {children}
    </div>
  );
};

export default Container;
