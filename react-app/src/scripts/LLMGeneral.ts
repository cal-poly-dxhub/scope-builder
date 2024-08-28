import p from "../assets/prompt.json";

const gen_prompt = p["gen_prompt"];
const read_prompt = p["read_prompt"];

const generateContract = async (
  context: any[],
  userInput: string,
  token: string
) => {
  const ctx = context;
  if (userInput.length < 4 && !isNaN(parseInt(userInput, 10))) {
    const clauses = "TFGCFTJGCNHVGKFJTDGNCVHGJ".split("\n\n");
    const clause = clauses[parseInt(userInput, 10)];
    ctx.push({
      role: "user",
      content: [
        {
          type: "text",
          text: gen_prompt.replace("--CLAUSE--", clause.toString()),
        },
      ],
    });
  } else {
    ctx.push({
      role: "user",
      content: [
        {
          type: "text",
          text: userInput,
        },
      ],
    });
  }

  try {
    const responses = await getBedrockResponse(ctx, token);
    const response = {
      role: "assistant",
      content: responses,
    };

    return response;
  } catch (e) {
    console.log(e);
    return {
      role: "assistant",
      content: [
        { type: "text", text: "<Response>An error occurred</Response>" },
      ],
    };
  }
};

const readContract = async (
  context: any[],
  userInput: string,
  token: string
) => {
  const ctx = context;
  if (ctx.length === 0) {
    const propmt = read_prompt.replace("--CONTRACT--", userInput);
    ctx.push({
      role: "user",
      content: [
        {
          type: "text",
          text: propmt,
        },
      ],
    });
  } else {
    ctx.push({
      role: "user",
      content: [
        {
          type: "text",
          text: userInput,
        },
      ],
    });
  }

  try {
    const responses = await getBedrockResponse(ctx, token);

    const response = {
      role: "assistant",
      content: responses,
    };
    return response;
  } catch (e) {
    console.log(e);
    return {
      role: "assistant",
      content: [
        { type: "text", text: "<Response>An error occurred</Response>" },
      ],
    };
  }
};

const getBedrockResponse = async (
  messages: { role: string; content: { type: string; text: string }[] }[],
  token: string
) => {
  try {
    const body = JSON.stringify({
      msg: messages,
      system_prompt: "",
    });
    const url = process.env.REACT_APP_LAMBDA_ENDPOINT as string;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "x-auth-token": token,
        Authorization: `Bearer ${token}`,
      },
      body,
    };

    const response = await fetch(url, options);
    const data = (await response.json()) as {
      search_answer: string;
    };

    return [
      // {
      //   role: data.role,
      // content: [
      {
        type: "text",
        text: data.search_answer,
      },
      //   ],
      // },
    ];
  } catch (e) {
    console.log(e);
    return [
      // {
      //   role: "assistant",
      //   content:
      // [
      { type: "text", text: "An error occurred" },
    ];
    //   },
    // ];
  }
};

const getIncrementalContext = (
  d: { title: string; content: string; summary: string; truths: string }[]
) => {
  const summaries = d.map((doc) => doc.summary);
  const joinedSummaries = summaries.join("\n");
  return `\n\nHere is a running summary of what the document currently contains: <DocumentContext>${joinedSummaries}</DocumentContext>`;
};

const getIncrementalTruths = (
  d: { title: string; content: string; summary: string; truths: string }[]
) => {
  const truths = d.map((doc) => doc.truths);
  const joinedTruths = truths.join("\n");
  return `\n\nHere is a list of all the truths in the document: <DocumentTruths>${joinedTruths}</DocumentTruths>`;
};

// shouldnt return clause, need separate function for that
const getInnerResponse = (response: { type: string; text: string }[]) => {
  return {
    response:
      response[0]?.text?.split("<Response>")[1]?.split("</Response>")[0] ??
      "No response found",
    clause:
      response[0]?.text?.split("<Clause>")[1]?.split("</Clause>")[0] ?? "",
  };
};

const getResponseTags = (response: { type: string; text: string }[]) => {
  return (
    response[0]?.text?.split("<Response>")[1]?.split("</Response>")[0] ?? ""
  );
};

const getCaluseTags = (response: { type: string; text: string }[]) => {
  return response[0]?.text?.split("<Clause>")[1]?.split("</Clause>")[0] ?? "";
};

const getTruthsTags = (response: { type: string; text: string }[]) => {
  return response[0]?.text?.split("<Truths>")[1]?.split("</Truths>")[0] ?? "";
};

const getSummaryTags = (response: { type: string; text: string }[]) => {
  return response[0]?.text?.split("<Summary>")[1]?.split("</Summary>")[0] ?? "";
};

const getTitleTags = (response: { type: string; text: string }[]) => {
  return response[0]?.text?.split("<Title>")[1]?.split("</Title>")[0] ?? "";
};

const getNumberTags = (
  number: number,
  response: { type: string; text: string }[]
) => {
  return (
    response[0]?.text?.split(`<${number}>`)[1]?.split(`</${number}>`)[0] ?? ""
  );
};

export {
  generateContract,
  getBedrockResponse,
  getCaluseTags,
  getIncrementalContext,
  getIncrementalTruths,
  getInnerResponse,
  getNumberTags,
  getResponseTags,
  getSummaryTags,
  getTitleTags,
  getTruthsTags,
  readContract,
};
