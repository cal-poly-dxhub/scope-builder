import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { AuthProvider } from "./constants/AuthProvider";
import { AuthRouter } from "./pages/auth";
import Home from "./pages/home";
import { NotFound } from "./pages/notfound";
import { theme } from "./theme";

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider>
        <Header />
        <BrowserRouter>
          <Routes>
            <Route index element={<Home />} />
            <Route path="auth/*" element={<AuthRouter />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  );
}
