import Box from "@mui/material/Box";
import CategoryDocumentPanel from "../Document/CategoryDocumentPanel";
import RecentDocumentPanel from "../Document/RecentDocumentPanel";
import MemberPanel from "../Member/MemberPanel";

const Dashboard = () => {
  return (
    <Box display="flex" height="93vh">
      <Box width="22vw">
        <MemberPanel />
      </Box>
      <Box width="78vw" display="flex" flexDirection="column">
        <Box height="32vh">
          <RecentDocumentPanel />
        </Box>
        <Box height="50vh">
          <CategoryDocumentPanel />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
