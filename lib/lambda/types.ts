type _company = {
  name: string;
  members: _member[];
};

type _member = {
  first_name: string;
  last_name: string;
  permission: string;
};

type _document = {
  title: string;
  date: string;
  category: string;
  purpose: string;
  institution: string;
  supplier: string;
  clauses: _clause[];
};

type _clause = { title: string; content: string; notes: string };

type _clauseTemplate = {
  title: string;
  requirements: string;
};

type _message = {
  role: string;
  content: { type: string; text: string }[];
};

export type _context = {
  title: string;
  context: { role: string; content: { type: string; text: string }[] }[];
};

export type {
  _clause,
  _clauseTemplate,
  _company,
  _document,
  _member,
  _message,
};
