import { _document } from "../assets/types";
import Text from "../Components/Text";

const DocumentEditor = ({
  document,
  onSelection,
}: {
  document: _document;
  onSelection: (s: string) => void;
}) => {
  const handleTextSelection = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const selection = window.getSelection();
    if (selection) {
      onSelection(selection?.toString() ?? "");
    }
  };

  return (
    <div>
      {document.clauses?.map((d) => {
        const splitContent = d.content.split("\n");

        return (
          <div
            style={styles.clause}
            onMouseUp={handleTextSelection}
            key={d.title}
          >
            <Text type="subtitle">{d.title}</Text>
            {splitContent.map((c) => (
              <Text>{c}</Text>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default DocumentEditor;

const styles = {
  clause: {
    margin: 10,
  },
};
