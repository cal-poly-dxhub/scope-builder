import { ReactNode } from "react";
import { _style } from "../assets/types";

const Text = ({
  children,
  type = "regular",
  lines,
  style,
}: {
  children: ReactNode | ReactNode[] | string;
  type?: "title" | "subtitle" | "big" | "bold" | "regular" | "background";
  lines?: number;
  style?: _style;
}) => {
  if (type === "title") {
    return <p style={{ ...styles.title, ...style }}>{children}</p>;
  } else if (type === "subtitle") {
    return <p style={{ ...styles.subtitle, ...style }}>{children}</p>;
  } else if (type === "big") {
    return <p style={{ ...styles.big, ...style }}>{children}</p>;
  } else if (type === "bold") {
    return <p style={{ ...styles.bold, ...style }}>{children}</p>;
  } else if (type === "background") {
    return <p style={{ ...styles.background, ...style }}>{children}</p>;
  } else {
    return <p style={{ ...styles.regular, ...style }}>{children}</p>;
  }
};

export default Text;

const styles = {
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  big: {
    fontSize: 16,
  },
  bold: {
    fontSize: 14,
    fontWeight: "bold",
  },
  regular: {
    fontSize: 14,
  },
  background: {
    fontSize: 12,
    color: "#777",
  },
};
