import { createTheme, MantineColorsTuple } from "@mantine/core";

const red: MantineColorsTuple = [
  "#ffeaec",
  "#fcd4d7",
  "#f4a7ac",
  "#ec777e",
  "#e64f57",
  "#e3353f",
  "#e22732",
  "#c91a25",
  "#b41220",
  "#9e0419",
];

const blue: MantineColorsTuple = [
  "#e5f3ff",
  "#cde2ff",
  "#9ac2ff",
  "#64a0ff",
  "#3884fe",
  "#1d72fe",
  "#0969ff",
  "#0058e4",
  "#004ecd",
  "#0043b5",
];

const black: MantineColorsTuple = [
  "#f5f5f5",
  "#e7e7e7",
  "#cdcdcd",
  "#b2b2b2",
  "#9a9a9a",
  "#8b8b8b",
  "#848484",
  "#717171",
  "#656565",
  "#575757",
];

const dark: MantineColorsTuple = [
  "#f5f5f5",
  "#e7e7e7",
  "#cdcdcd",
  "#b2b2b2",
  "#9a9a9a",
  "#8b8b8b",
  "#848484",
  "#717171",
  "#656565",
  "#575757",
];

export const theme = createTheme({
  colors: { red, blue, black, dark },
  primaryColor: "green",
  primaryShade: {
    light: 5,
    dark: 7,
  },
  shadows: {
    md: "1px 1px 3px rgba(0, 0, 0, .25)",
    xl: "5px 5px 3px rgba(0, 0, 0, .25)",
  },
  headings: {
    fontFamily: "Roboto, sans-serif",
    sizes: {},
  },
});
