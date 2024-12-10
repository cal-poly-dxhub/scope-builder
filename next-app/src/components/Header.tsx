"use client";

import { useAuth } from "@/constants/AuthContext";
import { Anchor, Box, Button, Group, Text } from "@mantine/core";

export const Header = () => {
  const { email, handleLogout } = useAuth();

  return (
    <Box bg="black.0" h="70px">
      <header>
        <Group justify="space-between" h="100%" p="md">
          <Anchor href="/" px="md" style={{ textDecoration: "none" }}>
            <Text size="xl" style={{ fontWeight: "bold" }}>
              Scope Builder
            </Text>
          </Anchor>
          <Group visibleFrom="sm">
            <Group>
              <Button
                variant="light"
                component="a"
                href="/builder"
                style={{ textDecoration: "none" }}
              >
                SOW Generator
              </Button>
              <Button
                variant="light"
                component="a"
                href="/projects"
                style={{ textDecoration: "none" }}
              >
                Amend Clause
              </Button>
              {email ? (
                <Button
                  variant="outline"
                  style={{ textDecoration: "none" }}
                  onClick={() => {
                    handleLogout();
                    window.location.href = "/";
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="outline"
                  component="a"
                  style={{ textDecoration: "none" }}
                  href="/login"
                >
                  Login
                </Button>
              )}
            </Group>
          </Group>
        </Group>
      </header>
    </Box>
  );
};
