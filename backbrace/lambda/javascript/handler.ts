import { bedrock } from "./bedrock";
import { send } from "./res";

export const handler = async (event: any, context: any) => {
  try {
    console.log("Full event:", JSON.stringify(event, null, 2));
    const path =
      event.resource || event.requestContext?.resourcePath || event.path;
    console.log("Path:", path); // mess w cdk stack incoming to get path

    return bedrock(event, context);

    // switch (path) {
    //   case "/bedrock":
    //     return bedrock(event, context);
    //   default:
    //     return send(404, { message: "Not Found" });
    // }
  } catch (error) {
    console.error("Error processing request:", error);
    return send(500, {
      message: "Internal Server Error",
      details: (error as any).message,
    });
  }
};
