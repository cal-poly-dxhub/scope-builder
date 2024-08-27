import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { _company, _style } from "../assets/types";

const MemberPanel = ({ style }: { style?: _style }) => {
  const company: _company = {} as _company;

  return (
    <Box sx={{ padding: 2, ...style }} overflow="auto" height="100%">
      <Typography variant="h6" mb={2}>
        {/* {company.name} Members */}
        Cal Poly Members
      </Typography>
      {/* {company.members.map((m, index) => (
        <div key={m.first_name}>
          <Member m={m} />
          {index < company.members.length - 1 && <Box my={1} />}
        </div>
      ))} */}
    </Box>
  );
};

export default MemberPanel;
