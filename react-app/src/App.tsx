import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import AmendClause from "./pages/amend/AmendClause";
import ContractGen from "./pages/ContractGen";
import ContractRead from "./pages/ContractRead";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import SOWFinish from "./ScopeOfWork/Finish";
import IntroPage from "./ScopeOfWork/InitialInfo";
import SOWGen from "./ScopeOfWork/MainPage";
import SOWReadthrough from "./ScopeOfWork/Readthrough";

import Dashboard from "./Dashboard/Dashboard";
import EditPage from "./Document/EditPage";

import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { AuthProvider } from "./Auth/AuthContext";
import ConfirmPage from "./Auth/ConfirmPage";
import LoginPage from "./Auth/LoginPage";
import SignupPage from "./Auth/SignupPage";
import Navbar from "./Components/Navbar";

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
        <Router>
          <Navbar />
          <Routes>
            {/* <Route path="/" element={<Landing />} /> */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/contract-gen" element={<ContractGen />} />
            <Route path="/contract-read" element={<ContractRead />} />
            <Route path="/sow-intro" element={<IntroPage />} />
            <Route path="/sow-gen" element={<SOWGen />} />
            <Route path="/sow-finish" element={<SOWFinish />} />
            <Route path="/sow-readthrough" element={<SOWReadthrough />} />
            <Route path="/amend-clause" element={<AmendClause />} />
            {/* not in nav */}
            <Route path="/edit-document" element={<EditPage />} />
            {/* auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/confirm" element={<ConfirmPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
