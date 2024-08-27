import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const Member = ({
  m,
}: {
  m: {
    first_name: string;
    last_name: string;
    permission: string;
  };
}) => {
  const { first_name, last_name, permission } = m;

  return (
    <Button>
      <Typography
        sx={{
          display: "flex",
          gap: 0.25,
          maxWidth: "11rem",
          overflow: "hidden",
        }}
        noWrap
      >
        {first_name} {last_name}
      </Typography>
      <Typography>{permission}</Typography>
    </Button>
  );
};

export default Member;
