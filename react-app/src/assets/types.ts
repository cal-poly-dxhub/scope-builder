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
  description: string;
  institution: string;
  supplier: string;
  clauses: _clause[];
};

type _clause = { title: string; content: string };

type _style = React.CSSProperties | undefined;

export type { _clause, _company, _document, _member, _style };
