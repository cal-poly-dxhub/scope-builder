const awsConfig = {
  region: process.env.REACT_APP_AWS_REGION as string,
  userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID as string,
  userPoolWebClientId: process.env
    .REACT_APP_AWS_USER_POOL_WEB_CLIENT_ID as string,
};

export default awsConfig;
