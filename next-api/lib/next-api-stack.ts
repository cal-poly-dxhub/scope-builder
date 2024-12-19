import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export class NextApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const secret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "ApiKeySecret",
      "NextApiApikey"
    );

    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      "NextApiUserPool",
      process.env.USER_POOL_ID!
    );

    // const userPoolClient = new cognito.UserPoolClient(
    //   this,
    //   "NextApiUserPoolClient",
    //   {
    //     userPool,
    //     userPoolClientName: "NextApiUserPoolClient",
    //   }
    // );

    const api = new apigateway.RestApi(this, "NextRestApi", {
      restApiName: "NextApi Service",
      deployOptions: {
        stageName: "prod",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
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

    const usagePlan = api.addUsagePlan("UsagePlan", {
      name: "Basic",
      apiStages: [
        {
          api: api,
          stage: api.deploymentStage,
        },
      ],
    });

    const apiKey = api.addApiKey("ApiKey", {
      apiKeyName: "NextApiApiKey",
      value: secret.secretValue.unsafeUnwrap().toString(),
    });
    usagePlan.addApiKey(apiKey);

    // lambdas --

    const assistantChatLambda = new lambda.Function(
      this,
      "AssistantChatLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "chat/assistant.handler",
        code: lambda.Code.fromAsset("dist/lambda/"),
        environment: {
          ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
          SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        timeout: cdk.Duration.seconds(60),
      }
    );
    secret.grantRead(assistantChatLambda);

    const assistantChatLambdaIntegration = new apigateway.LambdaIntegration(
      assistantChatLambda,
      {
        proxy: false,
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,POST'",
            },
          },
        ],
      }
    );

    const assistantChatResource = api.root.addResource("assistant-chat");
    assistantChatResource.addMethod("POST", assistantChatLambdaIntegration, {
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

    const clausePromptLambda = new lambda.Function(this, "ClausePromptLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "chat/clausePrompt.handler",
      code: lambda.Code.fromAsset("dist/lambda/"),
      environment: {
        ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
        SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      timeout: cdk.Duration.seconds(60),
    });
    secret.grantRead(clausePromptLambda);

    const clausePromptLambdaIntegration = new apigateway.LambdaIntegration(
      clausePromptLambda,
      {
        proxy: false,
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,POST'",
            },
          },
        ],
      }
    );

    const clausePromptResource = api.root.addResource("clause-prompt");
    clausePromptResource.addMethod("POST", clausePromptLambdaIntegration, {
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

    const definitionsClauseLambda = new lambda.Function(
      this,
      "DefinitionsClauseLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "getClause/definitions.handler",
        code: lambda.Code.fromAsset("dist/lambda/"),
        environment: {
          ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
          SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        timeout: cdk.Duration.seconds(60),
      }
    );
    secret.grantRead(definitionsClauseLambda);

    const definitionsClauseLambdaIntegration = new apigateway.LambdaIntegration(
      definitionsClauseLambda,
      {
        proxy: false,
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,POST'",
            },
          },
        ],
      }
    );

    const definitionsClauseResource =
      api.root.addResource("definitions-clause");
    definitionsClauseResource.addMethod(
      "POST",
      definitionsClauseLambdaIntegration,
      {
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
      }
    );

    const editedClauseLambda = new lambda.Function(this, "EditedClauseLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "getClause/edited.handler",
      code: lambda.Code.fromAsset("dist/lambda/"),
      environment: {
        ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
        SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      timeout: cdk.Duration.seconds(60),
    });
    secret.grantRead(editedClauseLambda);

    const editedClauseLambdaIntegration = new apigateway.LambdaIntegration(
      editedClauseLambda,
      {
        proxy: false,
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,POST'",
            },
          },
        ],
      }
    );

    const editedClauseResource = api.root.addResource("edited-clause");
    editedClauseResource.addMethod("POST", editedClauseLambdaIntegration, {
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

    const engagementClauseLambda = new lambda.Function(
      this,
      "EngagementClauseLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "getClause/engagement.handler",
        code: lambda.Code.fromAsset("dist/lambda/"),
        environment: {
          ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
          SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        timeout: cdk.Duration.seconds(60),
      }
    );
    secret.grantRead(engagementClauseLambda);

    const engagementClauseLambdaIntegration = new apigateway.LambdaIntegration(
      engagementClauseLambda,
      {
        proxy: false,
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              "method.response.header.Access-Control-Allow-Methods":
                "'OPTIONS,POST'",
            },
          },
        ],
      }
    );

    const engagementClauseResource = api.root.addResource("engagement-clause");
    engagementClauseResource.addMethod(
      "POST",
      engagementClauseLambdaIntegration,
      {
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
      }
    );

    // s3

    const nextapiUsageLogsBucket = new s3.Bucket(this, "NextApiUsageLogs", {
      bucketName: "nextapi-usage-logs",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    nextapiUsageLogsBucket.grantReadWrite(assistantChatLambda);
  }
}
