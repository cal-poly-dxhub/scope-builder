import { useState } from "react";
import { _clause } from "../assets/types";

const DocumentSidebar = ({
  clauses,
  currentDocument,
  setCurrentDocument,
  handleAddClause,
  handleRemoveClause,
  onSubmit,
}: {
  clauses: _clause[];
  currentDocument: _clause[];
  setCurrentDocument: (document: _clause[]) => void;
  handleAddClause: (clause: _clause) => void;
  handleRemoveClause: (index: number) => void;
  onSubmit: () => void;
}) => {
  const [clauseText, setClauseText] = useState("");
  const [showDocument, setShowDocument] = useState(false);
  const [currentClause, setCurrentClause] = useState<number | undefined>();

  const handleSubmitClause = () => {
    if (currentClause !== undefined) {
      const newDocument = [
        ...currentDocument,
        { title: clauses[currentClause].title, content: clauseText },
      ];
      setCurrentDocument(newDocument);
      setClauseText("");
      setCurrentClause(undefined);
      onSubmit();
    }
  };

  const handleCancelClause = () => {
    setClauseText("");
    setCurrentClause(undefined);
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <h1>Document Sidebar</h1>
        <div style={styles.clauseList}>
          {clauses.map((clause, index) => (
            <div
              key={index}
              style={{
                ...styles.clauseItem,
                backgroundColor: currentClause === index ? "#eee" : "#fff",
              }}
            >
              <span>{clause.title}</span>
              <button
                style={styles.addButton}
                onClick={() => {
                  setCurrentClause(index);
                  handleAddClause(clause);
                }}
                disabled={currentClause !== undefined}
              >
                Add
              </button>
            </div>
          ))}
        </div>
        {currentDocument.length > 0 && (
          <div>
            <h2>Current Document</h2>
            {currentDocument.map((clause, index) => (
              <div key={index}>
                <h3>{clause.title}</h3>
                <button onClick={() => handleRemoveClause(index)}>
                  Remove
                </button>
                <p>{clause.content}</p>
              </div>
            ))}
          </div>
        )}
        {currentClause !== undefined && (
          <div style={styles.clauseInput}>
            <textarea
              value={clauseText}
              onChange={(e) => setClauseText(e.target.value)}
              placeholder="Paste the clause content here..."
            />
            <button onClick={handleSubmitClause}>Submit Clause</button>
            <button onClick={handleCancelClause}>Cancel</button>
            <button
              onClick={() => {
                setShowDocument(!showDocument);
              }}
            >
              {showDocument ? "Hide Document" : "Show Document"}
            </button>
          </div>
        )}
      </div>
      {showDocument && (
        <div>
          <h2>Generated Document</h2>
          {currentDocument.map((clause, index) => (
            <div key={index}>
              <h3>{clause.title}</h3>
              <p>{clause.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: any = {
  container: {
    backgroundColor: "#fff",
    position: "fixed",
    bottom: 0,
    right: 0,
    height: "96vh",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderLeft: "2px solid #aaa",
    textAlign: "center",
    zIndex: 999,
  },
  contentWrapper: {
    flex: 1,
    overflowY: "auto",
    width: "100%",
    padding: "10px",
  },
  clauseList: {
    overflowY: "auto",
    maxHeight: "calc(96vh - 300px)", // Adjust this value based on the height of other elements
  },
  clauseItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
  },
  addButton: {
    padding: "5px 10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  clauseInput: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};

export default DocumentSidebar;
