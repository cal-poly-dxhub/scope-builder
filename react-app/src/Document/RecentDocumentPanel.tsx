import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { _document, _style } from "../assets/types";
import Document from "./Document";

const RecentDocumentPanel = ({ style }: { style?: _style }) => {
  const documents: _document[] = [];
  return (
    <Box sx={{ p: 2, ...style }}>
      <Typography variant="h6" mb={1}>
        Recent Documents
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {documents.map((d) => (
          <Document key={d.title} d={d} style={{ width: "30%" }} />
        ))}
      </Box>
    </Box>
  );
};

export default RecentDocumentPanel;
