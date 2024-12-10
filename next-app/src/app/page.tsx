import { Button, Container, Group, Text } from "@mantine/core";

const Index = () => {
  return (
    <Container
      size="md"
      p="lg"
      bg="black.0"
      mt="xl"
      miw="40vw"
      style={{ borderRadius: 10 }}
    >
      <Text size="lg" fw="bold">
        DxHub Scope Builder
      </Text>
      <Group mt="md">
        <Button variant="light" component="a" href="/builder">
          Scope of Work Generator
        </Button>
        <Button variant="light" component="a" href="/amend">
          Amend Clause
        </Button>
      </Group>
    </Container>
  );
};

export default Index;
