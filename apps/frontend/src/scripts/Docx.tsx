import { _clause, _document } from "@/constants/types";
import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx";

const createDocument = (title: string, clauses: _clause[]) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: title + "\n",
                bold: true,
                size: 32,
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.CENTER, // Set alignment to CENTER
          }),
          ...clauses.map((clause, index) => {
            return new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. ${clause.title}\n`,
                  bold: true,
                  font: "Arial",
                }),
                new TextRun({
                  text: "\t" + clause.content,
                  font: "Arial",
                }),
              ],
            });
          }),
        ],
      },
    ],
  });

  return doc;
};

const createAmendment = (
  title: string,
  institution: string,
  supplier: string,
  clauses: _clause[]
) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: title + "\n",
                bold: true,
                size: 32,
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.CENTER, // Set alignment to CENTER
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `THIS AMENDMENT TO THIS AGREEMENT is made and entered into this ${new Date().toDateString()}, in the State of California, by and between the Trustees of the California State University, which is the State of California acting in a higher education capacity, through its duly appointed and acting office, hereinafter called the institution, and ${supplier}, hereinafter called the supplier.`,
                font: "Arial",
              }),
            ],
          }),
          ...clauses.map((clause, index) => {
            return new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. ${clause.title}\n`,
                  bold: true,
                  font: "Arial",
                }),
                new TextRun({
                  text: "\t" + clause.content,
                  font: "Arial",
                }),
              ],
            });
          }),
        ],
      },
    ],
  });

  return doc;
};

const downloadDocument = (d: _document) => {
  const doc = createDocument(d.title, d.clauses);

  Packer.toBlob(doc).then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = d.title + ".docx";
    a.click();
    window.URL.revokeObjectURL(url);
  });
};

const downloadAmendment = (
  title: string,
  institution: string,
  supplier: string,
  clauses: _clause[]
) => {
  const doc = createAmendment(title, institution, supplier, clauses);

  Packer.toBlob(doc).then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title + ".docx";
    a.click();
    window.URL.revokeObjectURL(url);
  });
};

export { createAmendment, createDocument, downloadAmendment, downloadDocument };
