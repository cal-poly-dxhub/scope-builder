"use client";

import { categories } from "@/constants/categories";
import {
  Box,
  Button,
  Container,
  InputLabel,
  Select,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

const Begin = () => {
  const [userInstitution, setUserInstitution] = useState("");
  const [supplier, setSupplier] = useState("");
  const [documentPurpose, setDocumentPurpose] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = () => {
    const token = sessionStorage.getItem("token");
    if (
      token === null ||
      token === undefined ||
      (jwtDecode<{ exp: number }>(token).exp ?? 0) < Date.now() / 1000
    ) {
      alert("Session expired. Please log in.");
      window.location.href = "/login";
      return;
    }

    const formData = {
      userInstitution,
      supplier,
      documentPurpose,
      category,
    };

    sessionStorage.setItem("scopeData", JSON.stringify(formData));
    sessionStorage.removeItem("context");
    sessionStorage.removeItem("document");
    const date = new Date().getTime();
    const email = sessionStorage.getItem("email");
    const session = `${email}-${date}`;
    sessionStorage.setItem("session", session);
    window.location.href = "/builder/clauses";
  };

  return (
    <Container
      mt="md"
      bg="black.0"
      miw="50vw"
      p="md"
      style={{ borderRadius: 10 }}
    >
      <Text size="xl" fw="bold">
        Scope of Work Document Generator
      </Text>
      <Box
        mt="sm"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={(i) => setCategory(i || "")}
          placeholder="Select a category"
          data={categories.map((c) => c.title)}
        />
        <TextInput
          label="Your Institution"
          id="userInstitution"
          value={userInstitution}
          onChange={(e) => setUserInstitution(e.target.value)}
          placeholder="Enter your institution name"
        />
        <TextInput
          label="Supplier You're Hiring"
          id="supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Enter the supplier name"
        />
        <Textarea
          label="Document Purpose"
          id="documentPurpose"
          value={documentPurpose}
          onChange={(e) => setDocumentPurpose(e.target.value)}
          placeholder="General purpose of the document"
        />
        <Button
          variant="light"
          onClick={handleSubmit}
          mt="sm"
          style={{ alignSelf: "flex-start" }}
        >
          Generate Document
        </Button>
      </Box>
    </Container>
  );
};

export default Begin;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
};
