import { Anchor, Box, Button, Group, Text } from "@mantine/core";
import { useAuth } from "../constants/AuthProvider";

export const Header = () => {
  const { token, handleLogout } = useAuth();

  return (
    <Box bg="black.0">
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
                variant="subtle"
                component="a"
                href="/scope-builder"
                style={{ textDecoration: "none" }}
              >
                Scope Building Tool
              </Button>
              <Button
                variant="subtle"
                component="a"
                href="/clause-amendment"
                style={{ textDecoration: "none" }}
              >
                Clause Amendment Tool
              </Button>
            </Group>
            {token ? (
              <Group>
                <Button variant="light" onClick={handleLogout}>
                  Log out
                </Button>
              </Group>
            ) : (
              <Group>
                <Button
                  variant="light"
                  component="a"
                  href="/auth/login"
                  style={{ textDecoration: "none" }}
                >
                  Log in
                </Button>
                <Button
                  variant="filled"
                  component="a"
                  href="/auth/signup"
                  style={{ textDecoration: "none" }}
                >
                  Sign up
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </header>
    </Box>
  );
};
