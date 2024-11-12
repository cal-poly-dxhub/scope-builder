import { Box, Button, Container, Select, Text, TextInput } from "@mantine/core";
import { useState } from "react";
import categories from "../../assets/categories.json";

export default function Categories() {
  const [userInstitution, setUserInstitution] = useState("");
  const [supplier, setSupplier] = useState("");
  const [documentPurpose, setDocumentPurpose] = useState("");
  const [category, setCategory] = useState<string | null>("");

  const handleSubmit = () => {
    const formData = {
      userInstitution,
      supplier,
      documentPurpose,
      category,
    };

    sessionStorage.setItem("formData", JSON.stringify(formData));
    window.location.href = "/scope-builder/builder";
  };

  return (
    <Container
      size="md"
      p="lg"
      bg="black.0"
      mt="xl"
      style={{ borderRadius: 10 }}
    >
      <Text size="xl" fw="bold">
        Select document information
      </Text>
      <Box>
        <TextInput
          label="User institution"
          placeholder="The hiring institution"
          value={userInstitution}
          onChange={(event) => setUserInstitution(event.currentTarget.value)}
          mt="xs"
        />
        <TextInput
          label="Supplier"
          placeholder="Supplier your're hiring"
          value={supplier}
          onChange={(event) => setSupplier(event.currentTarget.value)}
          mt="xs"
        />
        <Select
          label="Category"
          data={categories.map((c) => c.title)}
          placeholder="Select category"
          value={category}
          onChange={(value) => setCategory(value)}
          mt="xs"
        />
        <TextInput
          label="Document purpose"
          placeholder="General document purpose information"
          value={documentPurpose}
          onChange={(event) => setDocumentPurpose(event.currentTarget.value)}
          mt="xs"
        />
      </Box>
      <Box mt="lg">
        <Text style={{ color: "red" }}>Note:</Text>
        <Text>
          This tool is not a substitute for legal advice. This is intended for
          preliminary drafting of scope of work documents. Please consult with a
          legal professional before finalizing any documents.
        </Text>
      </Box>
      <Button variant="filled" mt="lg" onClick={handleSubmit}>
        Submit
      </Button>
    </Container>
  );
}
