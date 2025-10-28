import { getBedrockResponse } from "../bedrock";
import { getClauseTags } from "../finalize";
import { _clause } from "../types";

export const handler = async (event: any) => {
  console.log("getClause/edited", event);
  try {
    const clause = event.clause;
    const userInput = event.userInput;
    const selectedText = event.selectedText;
    const newClause = await getEditedClause(clause, userInput, selectedText);
    return {
      statusCode: 200,
      body: JSON.stringify(newClause),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred" }),
    };
  }
};

const getEditedClause = async (
  clause: _clause,
  userInput: string,
  selectedText: string
): Promise<_clause> => {
  const prompt = `You are LUCAS, a procurement manager assistant specialized in editing Scope of Work documents. You will be given an input user request, some selected text from the  document, and the working current clause. Your goal is to modify the current clause if and only if the requested modifications are required for the given clause. Note that the selected text may be one example of something that needs to change, if that is the case change everything similar to the selected text as the user requested.\nThe current user input is <Input>${userInput}</Input>. The selected text is <SelectedText>${selectedText}</SelectedText>\nThis is the current clause you are given, it is called: ${clause.title}: <CurrentClause>${clause.content}</CurrentClause>\nYou will split your response into Thought, Action, Observation and Clause. Use this XML structure and keep everything strictly within these XML tags. There should be no content outside these XML blocks:\n<Thought>Your internal thought process.</Thought><Action>Your actions or analyses.</Action><Observation>User feedback or clarifications.</Observation><Clause>The modified clause that contains the neccessary modifications. Only return this block if the clause requires modification.</Clause>`;

  const res = await getBedrockResponse([
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
    },
  ]);

  const newClause = getClauseTags(res[res.length - 1]);
  return {
    title: clause.title,
    content: newClause,
    notes: "",
  };
};
