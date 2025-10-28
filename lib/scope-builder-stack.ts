import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as custom_resources from "aws-cdk-lib/custom-resources";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export class ScopeBuilderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const secret = new secretsmanager.Secret(this, "ApiKeySecret", {
      secretName: "ApiKey",
      generateSecretString: {
        excludePunctuation: true,
        passwordLength: 32,
      },
    });

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "UserPool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      userPoolClientName: "UserPoolClient",
    });

    const api = new apigateway.RestApi(this, "RestApi", {
      restApiName: "RestApi",
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
      apiKeyName: "ApiKey",
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
        code: lambda.Code.fromAsset("dist/lib/lambda"),
        timeout: cdk.Duration.seconds(120),
      }
    );
    secret.grantRead(assistantChatLambda);
    assistantChatLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      })
    );

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
      code: lambda.Code.fromAsset("dist/lib/lambda"),
      timeout: cdk.Duration.seconds(120),
    });
    secret.grantRead(clausePromptLambda);
    clausePromptLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      })
    );

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
        code: lambda.Code.fromAsset("dist/lib/lambda"),
        timeout: cdk.Duration.seconds(120),
      }
    );
    secret.grantRead(definitionsClauseLambda);
    definitionsClauseLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      })
    );

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
      code: lambda.Code.fromAsset("dist/lib/lambda"),
      timeout: cdk.Duration.seconds(120),
    });
    secret.grantRead(editedClauseLambda);
    editedClauseLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      })
    );

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
        code: lambda.Code.fromAsset("dist/lib/lambda"),
        timeout: cdk.Duration.seconds(120),
      }
    );
    secret.grantRead(engagementClauseLambda);
    engagementClauseLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      })
    );

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

    const usageLogsBucket = new s3.Bucket(this, "UsageLogs", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    usageLogsBucket.grantReadWrite(assistantChatLambda);

    // frontend

    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessControl = new cloudfront.S3OriginAccessControl(
      this,
      "OAC"
    );

    const rewriteFunction = new cloudfront.Function(this, "RewriteFunction", {
      code: cloudfront.FunctionCode.fromFile({
        filePath: "lib/cloudfront-rewrite.js",
      }),
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket, {
          originAccessControl,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: rewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      defaultRootObject: "index.html",
    });

    const buildProject = new codebuild.Project(this, "BuildProject", {
      source: codebuild.Source.gitHub({
        owner: "cal-poly-dxhub",
        repo: "scope-builder",
        branchOrRef: "main",
        cloneDepth: 1,
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL,
      },
      environmentVariables: {
        NEXT_PUBLIC_AWS_REGION: {
          value: cdk.Aws.REGION,
        },
        NEXT_PUBLIC_AWS_USER_POOL_ID: {
          value: userPool.userPoolId,
        },
        NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID: {
          value: userPoolClient.userPoolClientId,
        },
        NEXT_PUBLIC_NEXT_API_ENDPOINT: {
          value: api.url,
        },
        NEXT_PUBLIC_API_KEY: {
          value: secret.secretValue.unsafeUnwrap(),
        },
      },
      artifacts: codebuild.Artifacts.s3({
        bucket: websiteBucket,
        includeBuildId: false,
        packageZip: false,
        name: "/",
        encryption: false,
      }),
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: "20",
            },
          },
          pre_build: {
            commands: [
              "cd apps/frontend",
              "echo API Endpoint: $NEXT_PUBLIC_NEXT_API_ENDPOINT",
              "echo API Key: $NEXT_PUBLIC_API_KEY",
              "yarn install",
            ],
          },
          build: {
            commands: ["yarn build"],
          },
          post_build: {
            commands: [
              `aws cloudfront create-invalidation --distribution-id ${distribution.distributionId} --paths "/*"`,
            ],
          },
        },
        artifacts: {
          "base-directory": "apps/frontend/out",
          files: ["**/*"],
        },
      }),
      logging: {
        cloudWatch: {
          logGroup: new logs.LogGroup(this, "BuildLogGroup", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.ONE_WEEK,
          }),
        },
      },
    });

    distribution.grant(buildProject.role!, "cloudfront:CreateInvalidation");
    websiteBucket.grantWrite(buildProject);

    buildProject.node.addDependency(distribution);
    buildProject.node.addDependency(userPool);
    buildProject.node.addDependency(userPoolClient);
    buildProject.node.addDependency(api);

    const triggerBuild = new custom_resources.AwsCustomResource(
      this,
      "TriggerBuild",
      {
        onCreate: {
          service: "CodeBuild",
          action: "startBuild",
          parameters: {
            projectName: buildProject.projectName,
          },
          physicalResourceId: custom_resources.PhysicalResourceId.of(
            `trigger-${Date.now()}`
          ),
          outputPaths: ["build.id"],
        },
        onUpdate: {
          service: "CodeBuild",
          action: "startBuild",
          parameters: {
            projectName: buildProject.projectName,
          },
          physicalResourceId: custom_resources.PhysicalResourceId.of(
            `trigger-${Date.now()}`
          ),
          outputPaths: ["build.id"],
        },
        policy: custom_resources.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["codebuild:StartBuild"],
            resources: [buildProject.projectArn],
          }),
        ]),
      }
    );

    triggerBuild.node.addDependency(buildProject);

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url,
    });

    new cdk.CfnOutput(this, "WebsiteBucketName", {
      value: websiteBucket.bucketName,
    });
  }
}
