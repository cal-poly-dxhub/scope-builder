const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION as string,
  userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID as string,
  userPoolWebClientId: import.meta.env
    .VITE_AWS_USER_POOL_WEB_CLIENT_ID as string,
};

export default awsConfig;
