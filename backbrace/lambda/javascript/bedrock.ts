import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import * as res from "./res";

const model_id = "anthropic.claude-3-sonnet-20240229-v1:0";
const client = new BedrockRuntimeClient({
  region: "us-west-2",
  credentials: {
    // don't know how to use env for this
    accessKeyId: "",
    secretAccessKey: "",
  },
});

export const bedrock = (event: any, contex: any) => {
  // console.log("Full event:", JSON.stringify(event, null, 2));
  // console.log("body:", JSON.stringify(event.body, null, 2));

  const messages = event.messages;
  if (!messages) {
    return res.send(400, { message: "Bad Request (missing messages)" });
  }

  return getBedrockResponse(messages).then((responses) => {
    return res.send(200, { responses });
  });
};

const test = [
  {
    role: "user",
    content: [{ type: "text", text: "tell me a joke" }],
  },
];

const getBedrockResponse = async (
  messages: { role: string; content: { type: string; text: string }[] }[]
) => {
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
    // console.log(JSON.stringify(response));
    const decodedResponseBody = new TextDecoder().decode(response.body);
    // console.log(JSON.stringify(decodedResponseBody));
    const responseBody = JSON.parse(decodedResponseBody);
    const responses = responseBody.content;
    return responses;
  } catch (e) {
    console.log(e);
    return [
      {
        role: "assistant",
        content: [{ type: "text", text: "An error occurred" }],
      },
    ];
  }
};
