import { getBedrockResponse } from "../bedrock";
import { putToS3 } from "../s3";
import { _message } from "../types";

export const handler = async (event: any) => {
  console.log("chat/assistant", event);
  try {
    const messages = event.messages;
    const session = event.session;
    const clauseTitle = event.clauseTitle;
    const response = await getAssistantChatResponse(
      messages,
      session,
      clauseTitle
    );
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

const getAssistantChatResponse = async (
  messages: _message[],
  session: string,
  clauseTitle: string
): Promise<_message> => {
  const res = await getBedrockResponse(messages);

  await logResponsesToCSV(res, session, clauseTitle);

  const resLength = res.length;
  return res[resLength - 1];
};

const logResponsesToCSV = async (
  responses: _message[],
  session: string,
  clauseTitle: string
) => {
  const csvHeaders = ["role", "content"];
  const csvData = responses.map((response) => {
    return [response.role, `"${response.content[0].text.replace(/"/g, '""')}"`];
  });

  const csvContent = [csvHeaders, ...csvData]
    .map((row) => row.join(","))
    .join("\n");
  const csvFileName = `${session}/${clauseTitle}.csv`;

  await putToS3("nextapi-usage-logs", csvFileName, csvContent);
  console.log("logged responses to s3");
};
