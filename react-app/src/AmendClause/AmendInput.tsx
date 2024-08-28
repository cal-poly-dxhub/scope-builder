import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { _style } from "../assets/types";

interface AmendInputProps {
  setClause: ({
    title,
    clause,
    summary,
  }: {
    title: string;
    clause: string;
    summary: string;
  }) => void;
  style: _style;
}

const AmendInput: React.FC<AmendInputProps> = ({ setClause, style }) => {
  const [localClause, setLocalClause] = useState<{
    title: string;
    clause: string;
    summary: string;
  }>({ title: "", clause: "", summary: "" });

  const handleSubmit = () => {
    setClause(localClause);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, ...style }}>
      <Typography variant="h5" gutterBottom>
        Enter the clause you would like to amend:
      </Typography>
      <TextField
        label="Clause title"
        value={localClause.title}
        onChange={(e) =>
          setLocalClause({ ...localClause, title: e.target.value })
        }
        fullWidth
        margin="normal"
      />
      <TextField
        label="Clause content"
        value={localClause.clause}
        onChange={(e) =>
          setLocalClause({ ...localClause, clause: e.target.value })
        }
        multiline
        rows={6}
        fullWidth
        margin="normal"
      />
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default AmendInput;
