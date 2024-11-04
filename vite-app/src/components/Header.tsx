import { Anchor, Box, Button, Group, Text } from "@mantine/core";

export const Header = () => {
  return (
    <Box pb={120}>
      <header>
        <Group justify="space-between" h="100%" p="md">
          <Anchor href="/" px="md" style={{ textDecoration: "none" }}>
            <Text size="xl" style={{ fontWeight: "bold" }}>
              Scope Builder
            </Text>
          </Anchor>
          <Group visibleFrom="sm">
            <Group>
              <Anchor href="/scope-builder">Scope Building Tool</Anchor>
              <Anchor href="/clause-amend">Claude Amendment Tool</Anchor>
            </Group>
            <Button variant="default">Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </Group>
      </header>
    </Box>
  );
};
