import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { _document, _style } from "../assets/types";

const Document = ({ d, style }: { d: _document; style?: _style }) => {
  const navigate = useNavigate();
  const { title, date, category, description } = d;

  const readableDate = new Date(date).toDateString();

  const handleNavigateToEdit = () => {
    navigate("/edit-document", {
      state: { document: d },
    });
  };

  return (
    <Button
      onClick={handleNavigateToEdit}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        p: 2,
        mb: 2,
        borderRadius: 2,
        maxWidth: "15rem",
        maxHeight: "12rem",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: 3,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: 5,
          transform: "translateY(-4px)",
        },
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          {category}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {readableDate}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ mt: 1, color: "text.secondary", lineHeight: 1.5 }}
      >
        {description}
      </Typography>
    </Button>
  );
};

export default Document;
