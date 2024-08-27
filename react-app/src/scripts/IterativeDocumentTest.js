const documents = require("../assets/documents.json");
const { getBedrockResponse } = require("./LLMGeneral.ts");

const doc = documents[0];
const selection =
  "Services will encompass regular mowing, trimming, pruning, weeding, fertilizing, and general upkeep of planted areas.";
const input = "make this part ";

// iterate through clauses
// // at each iteration send same prompt:

const getPrompt = (input, selectedText, currentClause) =>
  `You are LUCAS, a procurement manager assistant specialized in editing Scope of Work documents. You will be given an input user request, some selected text from the  document, and the working current clause. Your goal is to modify the current clause if and onlt if the requested modifications seem applicable. \nThe current user input is <Input>${input}</Input>. The selected text is <SelectedText>${selectedText}</SelectedText>\nThis is the current clause you are given: <CurrentClause>${currentClause}</CurrentClause>\nYou will split your response into Thought, Action, Observation and ModifiedClause. Use this XML structure and keep everything strictly within these XML tags. There should be no content outside these XML blocks:\n<Thought>Your internal thought process.</Thought><Action>Your actions or analyses.</Action><Observation>User feedback or clarifications.</Observation><ModifiedClause>The modified clause that contains the neccessary modifications. Only return this block if the clause requires modification.</ModifiedClause>`;

// const getModifiedClause = (response) => {
//   return "";
// };

const main = async () => {
  for (const c of doc.clauses) {
    const prompt = getPrompt(input, selection, c);
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ];
    const response = await getBedrockResponse(messages);

    console.log(JSON.stringify(response));
  }
};

main();

// export {};
