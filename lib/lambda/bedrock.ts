import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { _message } from "./types";

export const getBedrockResponse = async (
  messages: _message[]
): Promise<_message[]> => {
  const model_id = "us.anthropic.claude-sonnet-4-5-20250929-v1:0";
  const client = new BedrockRuntimeClient({
    region: "us-west-2",
    credentials: {
      // accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      // lol idk why env doesnt work still
      // TODO: add keys
      accessKeyId: "",
      secretAccessKey: "",
    },
  });

  console.log("getting bedrock response");
  try {
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2048,
      messages,
    };

    const command = new InvokeModelCommand({
      contentType: "application/json",
      body: JSON.stringify(payload),
      modelId: model_id,
    });

    const response = await client.send(command);
    const decodedResponseBody = new TextDecoder().decode(response.body);
    const responseBody = JSON.parse(decodedResponseBody);
    const newMessages = [
      ...messages,
      {
        role: "assistant",
        content: responseBody.content,
      },
    ];
    return newMessages;
  } catch (e) {
    console.log("getbedrockresponse error:", e);
    return [
      {
        role: "assistant",
        content: [{ type: "text", text: "An error occurred" }],
      },
    ];
  }
};
