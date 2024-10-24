import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export class BackbraceAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const secret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "ApiKeySecret",
      "backbraceApikey"
    );

    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      "BackbraceUserPool",
      "us-west-2_2XcV6B9WY"
    );

    const userPoolClient = new cognito.UserPoolClient(
      this,
      "BackbraceUserPoolClient",
      {
        userPool,
        userPoolClientName: "BackbraceUserPoolClient",
      }
    );

    const bedrockFunction = new lambda.Function(this, "BedrockFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler.handler",
      code: lambda.Code.fromAsset("../dist/lambda/javascript"),
      environment: {
        API_KEY: secret.secretValue.toString(),
      },
      timeout: cdk.Duration.seconds(60),
    });

    const api = new apigateway.RestApi(this, "backbraceApi", {
      restApiName: "Backbrace Service",
      deployOptions: {
        stageName: "prod",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ["http://localhost:3000"],
        allowMethods: ["OPTIONS", "POST"],
        allowHeaders: ["Content-Type", "Authorization", "X-Api-Key"],
        allowCredentials: true,
        maxAge: cdk.Duration.days(1),
      },
    });

    const authorizer = new apigateway.CfnAuthorizer(this, "CognitoAuthorizer", {
      name: "CognitoAuthorizer",
      type: apigateway.AuthorizationType.COGNITO,
      providerArns: [userPool.userPoolArn],
      identitySource: "method.request.header.Authorization",
      restApiId: api.restApiId,
    });

    const apiKey = api.addApiKey("ApiKey", {
      apiKeyName: "BackbraceApiKey",
      value: secret.secretValue.toString(),
    });

    const usagePlan = api.addUsagePlan("UsagePlan", {
      name: "Basic",
      apiStages: [
        {
          api: api,
          stage: api.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    const rootResource = api.root;
    const bedrockIntegration = new apigateway.LambdaIntegration(
      bedrockFunction,
      {
        proxy: false,
        // requestTemplates: {
        //   "application/json": JSON.stringify({
        //     path: "$context.resourcePath",
        //     body: '$input.json("$")',
        //   }),
        // },
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin":
                "'http://localhost:3000'",
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,POST'",
            },
          },
        ],
      }
    );

    const bedrockResource = api.root.addResource("bedrock");
    bedrockResource.addMethod("POST", bedrockIntegration, {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref,
      },
      apiKeyRequired: true,
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
        },
      ],
    });

    secret.grantRead(bedrockFunction);
  }
}
