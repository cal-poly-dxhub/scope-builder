import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import AmendClause from "./AmendClause/AmendClause";
import SOWFinish from "./ScopeOfWork/Finish";
import IntroPage from "./ScopeOfWork/InitialInfo";
import SOWGen from "./ScopeOfWork/MainPage";
import SOWReadthrough from "./ScopeOfWork/Readthrough";

// import Dashboard from "./Dashboard/Dashboard";
import EditPage from "./Document/EditPage";
import Landing from "./pages/Landing";

import { useAuth } from "./Auth/AuthContext";
import ConfirmPage from "./Auth/ConfirmPage";
import LoginPage from "./Auth/LoginPage";
import SignupPage from "./Auth/SignupPage";
import Navbar from "./Components/Navbar";

const AppRouter = () => {
  const { token } = useAuth();

  // delete below pre prod
  // const sent = useRef(false);
  // useEffect(() => {
  //   if (sent.current) {
  //     return;
  //   }

  //   sent.current = true;

  //   getBedrockResponse(
  //     [
  //       {
  //         role: "user",
  //         content: [
  //           {
  //             type: "text",
  //             text: "clams and hams",
  //           },
  //         ],
  //       },
  //     ],
  //     ""
  //   ).then((res) => {
  //     console.log(res);
  //   });
  // }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        {token ? (
          <>
            <Route path="/" element={<Landing />} />
            <Route path="/sow-intro" element={<IntroPage />} />
            <Route path="/sow-gen" element={<SOWGen />} />
            <Route path="/sow-finish" element={<SOWFinish />} />
            <Route path="/sow-readthrough" element={<SOWReadthrough />} />
            <Route path="/amend-clause" element={<AmendClause />} />
            <Route path="/edit-document" element={<EditPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/confirm" element={<ConfirmPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default AppRouter;
