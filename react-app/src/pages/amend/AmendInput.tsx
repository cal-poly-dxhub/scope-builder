import { useState } from "react";
import "./AmendInput.css";

const AmendInput = ({
  setClause,
}: {
  setClause: ({ title, clause }: { title: string; clause: string }) => void;
}) => {
  const [localClause, setLocalClause] = useState<{
    title: string;
    clause: string;
  }>({ title: "", clause: "" });

  const handleSubmit = () => {
    setClause(localClause);
  };

  return (
    <div className="amend-container">
      <h2 className="title">Enter the clause you would like to amend:</h2>
      <div className="input-group">
        <input
          className="input"
          onChange={(e) =>
            setLocalClause({ ...localClause, title: e.target.value })
          }
          placeholder="Clause title"
        />
        <textarea
          className="input-tall"
          onChange={(e) =>
            setLocalClause({ ...localClause, clause: e.target.value })
          }
          placeholder="Clause content"
        />
      </div>
      <button className="button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default AmendInput;
