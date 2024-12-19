import { getBedrockResponse } from "../bedrock";
import { getClauseTags, makeDocumentLLMReady } from "../finalize";
import { _clause, _document } from "../types";

export const handler = async (event: any) => {
  console.log("getClause/engagement", event);
  try {
    const document = event.document;
    const clause = await getEngagementClause(document);
    return {
      statusCode: 200,
      body: JSON.stringify(clause),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred" }),
    };
  }
};

const getEngagementClause = async (d: _document): Promise<_clause> => {
  const llmdoc = makeDocumentLLMReady(d);
  const prompt = `You are LUCAS, a specialist in generating scope of work documents. You are tasked with creating an engagement clause for the following document: <Document>${llmdoc}</Document>. Please review it and synthesize an engagement clause that will be attached above the document. This clause will contain the engagement of the supplier and the institution. The clause should be concise and clear, and should not contain any unnecessary information. The clause should also be free of any grammatical errors.\n\nRespond in the following XML structure. All text outside of these blocks will be ignored:<Thought>Your internal thought process</Thought><Clause>The modified clause</Clause>`;

  const message = [
    {
      role: "user",
      content: [{ type: "text", text: prompt }],
    },
  ];

  const res = await getBedrockResponse(message);
  const clause = getClauseTags(res[res.length - 1]);
  return {
    title: "Engagement of Contractor",
    content: clause,
    notes: "",
  };
};
