import { Link } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { _style } from "../assets/types";
import { useAuth } from "../Auth/AuthContext";

const Navbar = ({ style }: { style?: _style }) => {
  const { email, handleLogout } = useAuth();

  return (
    <Box>
      <AppBar position="static" style={style}>
        <Toolbar>
          <Link href="/" color="inherit" underline="none">
            <Typography variant="h6">DxHub Automated Procurement</Typography>
          </Link>
          <Box ml="auto" display="flex" alignItems="center">
            <Link href="/sow-intro" color="inherit" underline="none" mx={2}>
              <Typography variant="body1">SOW Generator</Typography>
            </Link>
            <Link href="/amend-clause" color="inherit" underline="none" mx={2}>
              <Typography variant="body1">Amend Clause</Typography>
            </Link>
            {email ? (
              <Link
                color="inherit"
                underline="none"
                mx={2}
                onClick={handleLogout}
              >
                <Typography variant="body1">Logout {email}</Typography>
              </Link>
            ) : (
              <Link href="/login" color="inherit" underline="none" mx={2}>
                <Typography variant="body1">Login</Typography>
              </Link>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
