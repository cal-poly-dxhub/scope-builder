import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import categories from "../assets/categories.json";
import { _document, _style } from "../assets/types";
import Document from "./Document";

const CategoryDocumentPanel = ({ style }: { style?: _style }) => {
  const [category, setCategory] = useState("General Services");

  const documents: _document[] = [];

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value);
  };

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        ...style,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Select value={category} onChange={handleCategoryChange} sx={{ mr: 2 }}>
          {categories.map((c) => (
            <MenuItem key={c.title} value={c.title}>
              <Typography variant="subtitle1">{c.title}</Typography>
            </MenuItem>
          ))}
        </Select>
        <Typography variant="h6">Documents</Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {documents
            .filter((d) => d.category === category)
            .map((d) => (
              <Document key={d.title} d={d} style={{ width: "30%" }} />
            ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryDocumentPanel;
