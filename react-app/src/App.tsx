import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { AuthProvider } from "./Auth/AuthContext";
import AppRouter from "./AppRouter";

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
