import { bedrock } from "./bedrock";
import { send } from "./res";

export const handler = async (event: any, context: any) => {
  try {
    // Debug logging
    console.log("Full event:", JSON.stringify(event, null, 2));
    const path =
      event.resource || event.requestContext?.resourcePath || event.path;

    return bedrock(event, context);

    switch (path) {
      case "/bedrock":
        return bedrock(event, context);
      default:
        return send(404, { message: "Not Found" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return send(500, {
      message: "Internal Server Error",
      details: (error as any).message,
    });
  }
};
