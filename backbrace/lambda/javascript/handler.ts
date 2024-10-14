import { javascript } from "./javascript";
import * as res from "./res";

export const handler = async (
  event: { path: any; headers: any },
  context: any
) => {
  const path = event.path;

  switch (path) {
    case "/javascript":
      return javascript(event, context);
    default:
      return res.send(404, { message: "Not Found" });
  }
};
