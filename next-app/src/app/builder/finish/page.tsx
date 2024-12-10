import { Container, Text } from "@mantine/core";

const Finish = () => {
  return (
    <Container style={styles.container}>
      <Text>Finish</Text>
    </Container>
  );
};

export default Finish;

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
};
