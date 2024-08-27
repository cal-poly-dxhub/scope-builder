import { ReactNode, useState } from "react";
import { theme } from "../assets/theme";
import { _style } from "../assets/types";

const Item = ({
  children,
  className,
  regularBackgroundColor = theme.colors.background,
  hoverBackgroundColor = theme.colors.alternate,
  clickBackgroundColor = theme.colors.click,
  onClick,
  transition = "0.1",
  style,
}: {
  children: ReactNode | ReactNode[];
  className?: string;
  regularBackgroundColor?: string;
  hoverBackgroundColor?: string;
  clickBackgroundColor?: string;
  onClick?: () => void;
  transition?: string;
  style?: _style;
}) => {
  const [hover, setHover] = useState<boolean>(false);
  const [mouseDown, setMouseDown] = useState<boolean>(false);

  const bgColor = {
    backgroundColor: mouseDown
      ? clickBackgroundColor
      : hover
      ? hoverBackgroundColor
      : regularBackgroundColor,
    transition: `background-color ${transition}s`,
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onClick={onClick}
      style={{ ...bgColor, ...style }}
      className={className}
    >
      {children}
    </div>
  );
};

export default Item;
