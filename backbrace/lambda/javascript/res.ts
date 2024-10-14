export const send = (statusCode: number, body: any) => {
  /* if local return json body
  if lambda, needs to return stringified json */

  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
