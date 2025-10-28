import { getBedrockResponse } from "../bedrock";
import { _clauseTemplate, _message } from "../types";

export const handler = async (event: any) => {
  console.log("chat/clausePrompt", event);
  try {
    const institution = event.institution;
    const supplier = event.supplier;
    const template = event.template;
    const category = event.category;
    const documentPurpose = event.documentPurpose;
    const scopeOfWorkClauseContent = event.scopeOfWorkClauseContent;
    const notes = event.notes;

    const response = await getClausePromptResponse(
      institution,
      supplier,
      template,
      category,
      documentPurpose,
      scopeOfWorkClauseContent,
      notes
    );

    console.log("getClausePromptResponse response:", JSON.stringify(response));

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred" }),
    };
  }
};

const getClausePromptResponse = async (
  institution: string,
  supplier: string,
  template: _clauseTemplate,
  category: string,
  documentPurpose: string,
  scopeOfWorkClauseContent: string,
  notes: string
): Promise<_message[]> => {
  const sowPrompt =
    'You are LUCAS, a procurement manager assistant specialized in creating scope of work clauses. Your primary mission is to interactively engage with a user by asking them ONE question at a time and work with them to create a scope of work clause (SOW) for --INSTITUTION--, which is hiring --SUPPLIER-- for --PURPOSE--. Only focus on the specific information pertaining to the clause you are working on.\n\nClause: This is an outline of the clause that you will be working on:\n<Clause>\n--CLAUSE--\n</Clause>.\n\nHere is the scope, if already defined. Do not ask questions asking the user for the information in this section, as the document already contains it. <Scope>--SCOPE--</Scope>\n\nStrategy:\n\nOne-by-One Interaction: Ask only ONE question at a time to ensure clarity and focused responses. Do not ask leading questions unless the user requests your input. Wait for the user\'s reply before proceeding to the next question. Keep your response and questions short.\nInteractive Engagement & Flexibility: \nAs the conversation unfolds, adjust your questions based on user responses. Feel free to provide feedback or suggestions to the user.\nClear Call for Action: Clearly convey to the user what input you require in the response. Your responses must contain questions.\nMultiple Subcategories: Consolidate questions from multiple subcategories if they seem less critical."\nDetailed Inquiry: If a category requires more depth, detail, or description ask multiple questions.\nFollow-ups: If a user\'s answer is vague, delve deeper.\nFeedback Loop: After each function, recap the discussed topics for the user.\nComprehensive Report: After gathering all insights, draft the scope of work document.\nResponse Format:\n\nYou will split your response into Thought, Action, Observation, Response and Notes. Use this XML structure and keep everything strictly within these XML tags. Remember, the <Response> tag contains what\'s shown to the user. There should be no content outside these XML blocks:\n\n<Thought>Your internal thought process.</Thought><Action>Your actions or analyses.</Action><Observation>User feedback or clarifications.</Observation><Response> Your communication to the user. This is the only visible portion to the user.</Response><Clause>The finished clause. Here, refer to the supplier and institution as "Supplier" and "Institution" respectively. Only include this feild if you have enough information to complete the clause or if the user requests the clause should be completed.</Clause><Notes>This will contain notes of details the user has provided. These notes will be used as context to other clauses so that the assistant does not ask for the same information again.</Notes>';

  const newPrompt = sowPrompt
    .replaceAll("--CLAUSE--", template.requirements.toString())
    .replaceAll(
      "--INSTITUTION--",
      institution?.toString() ?? "(institution not given)"
    )
    .replaceAll("--SUPPLIER--", supplier?.toString() ?? "(supplier not given)")
    .replaceAll(
      "--PURPOSE--",
      category?.toString() + ", " + documentPurpose?.toString()
    )
    .replaceAll("--SCOPE--", scopeOfWorkClauseContent ?? "")
    .concat(notes);

  const message = [
    {
      role: "user",
      content: [{ type: "text", text: newPrompt }],
    },
  ];

  const res = await getBedrockResponse(message);
  return res;
};
