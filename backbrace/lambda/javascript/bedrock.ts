import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { S3 } from "@aws-sdk/client-s3";
import * as res from "./res";

const s3 = new S3({ region: "us-west-2" }); // Initialize the S3 client

const model_id = "anthropic.claude-3-sonnet-20240229-v1:0";
const client = new BedrockRuntimeClient({
  region: "us-west-2",
  credentials: {
    // don't know how to use env for this
    accessKeyId: "REMOVED",
    secretAccessKey: "7cSoCjIpZPh8/2cDfsf0D5tkagGOcoVPVUomJ3F9",
  },
});

export const bedrock = (event: any, contex: any) => {
  // console.log("Full event:", JSON.stringify(event, null, 2));
  // console.log("body:", JSON.stringify(event.body, null, 2));

  // console.log("event.query:", JSON.stringify(event.query, null, 2));

  const session = event.session || "defaultSession";
  const clause = event.clause || "defaultClause";
  const log = event.log || false;

  console.log("session:", session, "clause:", clause, "log:", log);

  const messages = event.messages;
  if (!messages) {
    return res.send(400, { message: "Bad Request (missing messages)" });
  }

  return getBedrockResponse(log, session, clause, messages).then(
    (responses) => {
      return res.send(200, { responses });
    }
  );
};

// const test = [
//   {
//     role: "user",
//     content: [{ type: "text", text: "tell me a joke" }],
//   },
// ];

const getBedrockResponse = async (
  log: boolean,
  session: string,
  clause: string,
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

    // Log to CSV
    if (log) {
      await logResponseToCSV(session, clause, responses);
    }

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

const streamToString = (stream: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};

const logResponseToCSV = async (
  session: string,
  clause: string,
  responses: any
) => {
  console.log("Logging to CSV in S3");
  const bucketName = "scopebuilder-usage-logs";
  const csvKey = `sessions/${session}/${clause}.csv`;
  const timestamp = new Date().toISOString();
  const csvData = [
    { timestamp, clause, assistant_response: responses[0]?.text || "" },
  ];

  const csvHeader = "timestamp,clause,assistant_response\n";
  const csvRow = csvData
    .map(
      (row) =>
        `${row.timestamp},${row.clause},"${row.assistant_response.replace(
          /"/g,
          '""'
        )}"`
    )
    .join("\n");

  try {
    const getObjectResponse = await s3
      .getObject({
        Bucket: bucketName,
        Key: csvKey,
      })
      .catch(() => null);

    let newCsvData;
    if (getObjectResponse) {
      console.log("CSV exists in S3");
      const currentCsvData = await streamToString(getObjectResponse.Body);
      console.log("current csv data:", currentCsvData);
      newCsvData = currentCsvData + csvRow + "\n";
    } else {
      console.log("CSV does not exist in S3");
      newCsvData = csvHeader + csvRow + "\n";
    }

    console.log("new csv data:", newCsvData);

    await s3.putObject({
      Bucket: bucketName,
      Key: csvKey,
      Body: newCsvData,
      ContentType: "text/csv",
    });

    console.log(`Logged to ${csvKey} in S3`);
  } catch (err) {
    console.error("Error logging to CSV in S3:", err);
  }
};
