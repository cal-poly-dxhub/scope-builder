import { _document, _message } from "./types";

export const makeDocumentLLMReady = (document: _document) => {
  let newDoc: string = "";
  document.clauses.forEach((clause) => {
    newDoc += `<${clause.title}>${clause.content}</${clause.title}>`;
  });

  return newDoc;
};

export const getClauseTags = (message: _message) => {
  return (
    message.content[0]?.text?.split("<Clause>")[1]?.split("</Clause>")[0] ?? ""
  );
};
