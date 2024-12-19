import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import json from "../assets/SOWCategories.json";

const categories = json.Categories;

const InitialInfo = () => {
  const navigate = useNavigate();
  const [userInstitution, setUserInstitution] = useState("");
  const [supplier, setSupplier] = useState("");
  const [documentPurpose, setDocumentPurpose] = useState("");
  const [category, setCategory] = useState("");

  const startTime = new Date().getTime();

  const handleSubmit = () => {
    navigate(
      `/sow-gen?category=${encodeURIComponent(
        category
      )}&userInstitution=${encodeURIComponent(
        userInstitution
      )}&supplier=${encodeURIComponent(
        supplier
      )}&documentPurpose=${encodeURIComponent(
        documentPurpose
      )}&startTime=${startTime}`
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Scope of Work Document Generator
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "50%",
          }}
        >
          <FormControl>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as string)}
            >
              <MenuItem value="">Select a category</MenuItem>
              {categories.map((cat: any) => (
                <MenuItem key={cat.title} value={cat.title}>
                  {cat.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Your Institution"
            id="userInstitution"
            value={userInstitution}
            onChange={(e) => setUserInstitution(e.target.value)}
            placeholder="Enter your institution name"
          />
          <TextField
            label="Supplier You're Hiring"
            id="supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Enter the supplier name"
          />
          <TextField
            label="Document Purpose"
            id="documentPurpose"
            value={documentPurpose}
            onChange={(e) => setDocumentPurpose(e.target.value)}
            placeholder="General purpose of the document"
            multiline
          />
          <Button variant="contained" onClick={handleSubmit}>
            Generate Document
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InitialInfo;
