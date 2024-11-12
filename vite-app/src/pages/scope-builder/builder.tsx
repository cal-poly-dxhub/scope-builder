import { Container, Text } from "@mantine/core";

export default function Builder() {
  const formData = JSON.parse(sessionStorage.getItem("formData") || "{}");

  return (
    <Container style={styles.container}>
      <Text size="xl">{JSON.stringify(formData)}</Text>
    </Container>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
};
