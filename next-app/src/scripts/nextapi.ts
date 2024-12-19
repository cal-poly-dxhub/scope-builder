import {
  _clause,
  _clauseTemplate,
  _document,
  _message,
} from "@/constants/types";

const fetchEndpoint = (endpoint: string, body: unknown) => {
  const token = sessionStorage.getItem("token");
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
};

export const getClausePromptResponse = async (
  institution: string,
  supplier: string,
  template: _clauseTemplate,
  category: string,
  documentPurpose: string,
  scopeOfWorkClauseContent: string,
  notes: string
): Promise<_message[]> => {
  const res = await fetchEndpoint(
    process.env.NEXT_PUBLIC_NEXT_API_ENDPOINT + "clause-prompt",
    {
      institution,
      supplier,
      template,
      category,
      documentPurpose,
      scopeOfWorkClauseContent,
      notes,
    }
  );

  if (res.status !== 200) {
    console.error("status code", res.status);
  }

  const j = await res.json();
  return JSON.parse(j.body);
};

export const getAssistantChatResponse = async (
  messages: _message[],
  clauseTitle: string
): Promise<_message> => {
  try {
    const session = sessionStorage.getItem("session");
    const res = await fetchEndpoint(
      process.env.NEXT_PUBLIC_NEXT_API_ENDPOINT + "assistant-chat",
      { messages, session, clauseTitle }
    );

    if (res.status !== 200) {
      console.error("status code", res.status);
    }

    const j = await res.json();
    return JSON.parse(j.body);
  } catch (e) {
    console.log(e);
    return {
      role: "assistant",
      content: [{ type: "text", text: "An error occurred" }],
    };
  }
};

export const getDefinitionsClause = async (d: _document): Promise<_clause> => {
  try {
    const res = await fetchEndpoint(
      process.env.NEXT_PUBLIC_NEXT_API_ENDPOINT + "definitions-clause",
      { document: d }
    );

    if (res.status !== 200) {
      console.error("status code", res.status);
    }

    const j = await res.json();
    return JSON.parse(j.body);
  } catch (e) {
    console.log(e);
    return {
      title: "Definitions",
      content: "",
      notes: "",
    };
  }
};

export const getEngagementClause = async (d: _document): Promise<_clause> => {
  try {
    const res = await fetchEndpoint(
      process.env.NEXT_PUBLIC_NEXT_API_ENDPOINT + "engagement-clause",
      { document: d }
    );

    if (res.status !== 200) {
      console.error("status code", res.status);
    }

    const j = await res.json();
    return JSON.parse(j.body);
  } catch (e) {
    console.log(e);
    return {
      title: "Engagement of Contractor",
      content: "",
      notes: "",
    };
  }
};

export const getEditedClause = async (
  clause: _clause,
  userInput: string,
  selectedText: string
): Promise<_clause> => {
  try {
    const res = await fetchEndpoint(
      process.env.NEXT_PUBLIC_NEXT_API_ENDPOINT + "edited-clause",
      {
        clause,
        userInput,
        selectedText,
      }
    );

    if (res.status !== 200) {
      console.error("status code", res.status);
    }

    const j = await res.json();
    return JSON.parse(j.body);
  } catch (e) {
    console.log(e);
    return {
      title: clause.title,
      content: "",
      notes: "",
    };
  }
};
