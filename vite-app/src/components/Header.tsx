import { Anchor, Box, Button, Group, Text } from "@mantine/core";

export const Header = () => {
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
        </Group>
      </header>
    </Box>
  );
};
