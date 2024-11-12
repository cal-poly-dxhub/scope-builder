import { Route, Routes } from "react-router-dom";

import { Login } from "./login";
import { Signup } from "./signup";

export const AuthRouter = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
    </Routes>
  );
};
