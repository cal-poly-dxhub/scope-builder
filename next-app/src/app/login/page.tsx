"use client";

import { Box, Button, Container, Text, TextInput } from "@mantine/core";
import { useState } from "react";
import { useAuth } from "../../constants/AuthContext";

export default function Login() {
  const { handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSuccessfulLogin = () => {
    window.location.href = "/";
  };

  const onFailedLogin = (err: unknown) => {
    alert("Failed to log in. Check your email and password.");
    console.error(err);
  };

  return (
    <Container
      size="md"
      p="lg"
      bg="black.0"
      mt="xl"
      miw="40vw"
      style={{ borderRadius: 10 }}
    >
      <Box>
        <Text size="xl" style={{ fontWeight: "bold" }}>
          Log in
        </Text>
        <Box mt="md">
          <TextInput
            label="Email"
            placeholder="Your email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
          <TextInput
            label="Password"
            placeholder="Your password"
            type="password"
            mt="sm"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <Button
            variant="filled"
            mt="lg"
            onClick={() =>
              handleLogin(email, password, onSuccessfulLogin, onFailedLogin)
            }
          >
            Log in
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
