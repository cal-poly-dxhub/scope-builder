import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { AuthProvider } from "./constants/AuthProvider";
import Home from "./pages/home";
import { NotFound } from "./pages/notfound";
import { theme } from "./theme";

import { AuthRouter } from "./pages/auth";
import { ScopeBuilderRouter } from "./pages/scope-builder";

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider>
        <Header />
        <BrowserRouter>
          <Routes>
            <Route index element={<Home />} />
            <Route path="auth/*" element={<AuthRouter />} />
            <Route path="scope-builder/*" element={<ScopeBuilderRouter />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  );
}
