import { Box, Button, Container, Text, TextInput } from "@mantine/core";
import { useState } from "react";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {};

  return (
    <Container
      size="md"
      p="lg"
      bg="black.0"
      mt="xl"
      style={{ borderRadius: 10 }}
    >
      <Box>
        <Text size="xl" style={{ fontWeight: "bold" }}>
          Sign up
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
          <Button variant="filled" mt="lg" onClick={handleSignup}>
            Sign up
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
