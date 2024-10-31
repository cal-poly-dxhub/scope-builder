import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import AppRouter from "./AppRouter";
import { AuthProvider } from "./constants/AuthProvider";

const App = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#2c762c",
      },
      secondary: {
        main: "#85aa85",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
