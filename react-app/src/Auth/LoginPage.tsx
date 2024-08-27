import { Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { theme } from "../assets/theme";
import { useAuth } from "./AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleLogin } = useAuth();

  const onSuccess = (result: any) => {
    window.location.href = "/";
  };

  const onFailure = (err: any) => {
    alert("Login failed, please try again");
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
        padding: 2,
        marginTop: "5rem",
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Login to DxHub Procurement
      </Typography>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ width: "80%", marginBottom: 1 }}
        autoComplete="email"
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ width: "80%", marginBottom: 1 }}
        autoComplete="current-password"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleLogin(email, password, onSuccess, onFailure)}
        sx={{ width: "80%", marginTop: 2 }}
      >
        Log In
      </Button>
      {/* <Button
        variant="outlined"
        color="primary"
        onClick={handleSignUp}
        sx={{ width: "40%", marginTop: 1 }}
      >
        Sign Up Instead
      </Button> */}
    </Container>
  );
};

export default LoginPage;
