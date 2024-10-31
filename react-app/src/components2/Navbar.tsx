import { Button, Container, HStack, Link, Text } from "@chakra-ui/react";

const Navbar = () => {
  const goTo = (path: string) => () => {
    window.location.href = path;
  };

  return (
    <nav>
      <Container maxW="100vw" h="5vh">
        <HStack justifyContent="space-between">
          <Link href="/" style={styles.title}>
            Scope Builder
          </Link>
          <HStack>
            <Button onClick={goTo("/about")}>
              <Text>Logout</Text>
            </Button>
          </HStack>
        </HStack>
      </Container>
    </nav>
  );
};

const styles = {
  title: {
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "red",
  },
};

export default Navbar;
