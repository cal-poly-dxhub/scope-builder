import { _clause, _message } from "@/constants/types";

export const getClauseNotes = (d: _clause[]) => {
  const notes = d.map((doc) => doc.notes);
  const joinedNotes = notes.join("\n");
  return `\n\nHere is a list of all the notes in the document: <DocumentNotes>${joinedNotes}</DocumentNotes>`;
};

export const getResponseTags = (message: _message) => {
  return (
    message.content[0]?.text?.split("<Response>")[1]?.split("</Response>")[0] ??
    ""
  );
};

export const getClauseTags = (message: _message) => {
  return (
    message.content[0]?.text?.split("<Clause>")[1]?.split("</Clause>")[0] ?? ""
  );
};

export const getNotesTags = (message: _message) => {
  return (
    message.content[0]?.text?.split("<Notes>")[1]?.split("</Notes>")[0] ?? ""
  );
};
