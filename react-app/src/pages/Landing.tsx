import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography variant="h4" gutterBottom>
        DxHub Automated Procurement
      </Typography>
      <Typography variant="h6" gutterBottom marginBottom={4}>
        Powered by AWS
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Link to="/sow-intro" style={{ textDecoration: "none" }}>
          <Button variant="contained" color="primary">
            Scope of Work Generator
          </Button>
        </Link>
        <Link to="/amend-clause" style={{ textDecoration: "none" }}>
          <Button variant="contained" color="primary">
            Amend Clause
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default Landing;
