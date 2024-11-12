import { Box, Container, Text } from "@mantine/core";

export default function NotFound() {
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
          Page Not Found
        </Text>
      </Box>
    </Container>
  );
}
