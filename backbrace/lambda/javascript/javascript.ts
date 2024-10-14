import * as res from "./res";

export const javascript = (event: any, contex: any) => {
  const body = {
    message: "hello from javascript",
    event,
  };

  return res.send(200, body);
};
