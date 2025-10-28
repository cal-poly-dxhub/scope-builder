#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "dotenv/config";
import { ScopeBuilderStack } from "../lib/scope-builder-stack";

const app = new cdk.App();
new ScopeBuilderStack(app, "ScopeBuilderStack", {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: "us-west-2" 
  },
});
