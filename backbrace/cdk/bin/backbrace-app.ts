#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { BackbraceAppStack } from "../lib/backbrace-app-stack";

const app = new cdk.App();
new BackbraceAppStack(app, "BackbraceAppStack");
