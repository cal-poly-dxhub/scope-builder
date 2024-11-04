import { createTheme, MantineColorsTuple } from "@mantine/core";

const calPolyGreen: MantineColorsTuple = [
  "#f0f9f0",
  "#e0f1e0",
  "#bce2bc",
  "#95d395",
  "#75c774",
  "#61bf5f",
  "#56bb53",
  "#46a444",
  "#3c923b",
  "#2f7e2f",
];

export const theme = createTheme({
  colors: {
    calPolyGreen,
  },
  primaryColor: "calPolyGreen",
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
