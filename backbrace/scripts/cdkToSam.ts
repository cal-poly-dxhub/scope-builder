import fs from "fs";
import YAML from "yaml";

interface ResourceProperties {
  Type: string;
  Properties: {
    Runtime: string;
    Handler: string;
    CodeUri: string;
    Environment: {
      IS_LOCAL: boolean;
    };
    Events: {
      Api: {
        Type: string;
        Properties: {
          Path: string;
          Method: string;
        };
      };
    };
  };
}

interface Resources {
  [key: string]: ResourceProperties;
}

const _translate = JSON.parse(
  fs.readFileSync("backbrace/translate.json", "utf8")
);
const cdk = fs.readFileSync("cdk/lib/backbrace-app-stack.ts", "utf8");
const sam: {
  AWSTemplateFormatVersion: string;
  Transform: string;
  Description: string;
  Resources: Resources;
} = {
  AWSTemplateFormatVersion: "2010-09-09",
  Transform: "AWS::Serverless-2016-10-31",
  Description: "Local Backbrace API",
  Resources: {},
};

const cdkDefs = cdk.split("\n\n").filter((line) => line.includes("new "));
for (const def of cdkDefs) {
  if (def.includes("new lambda.Function")) {
    const name = def.match(/new lambda.Function\(this, "(.*?)"/);
    const handler = def.match(/handler: "(.*?)"/);
    const codeUri = def.match(/code: lambda.Code.fromAsset\("(.*?)"\),/);

    if (name === null || handler === null || codeUri === null) {
      console.warn(`Warning: ${def} not yet supported`);
      continue;
    }

    let props = { Path: "/", Method: "get" };
    for (const def2 of cdkDefs) {
      if (def2.toLowerCase().includes(name[1].toLowerCase())) {
        const path = def2.match(/api.root.addResource\("(.*?)"\)/);
        const method = def2.match(/addMethod\("(.*?)"\)/);
        props = {
          Path: path ? "/" + path[1] : "/",
          Method: method ? method[1].toLowerCase() : "get",
        };
      }
    }

    sam.Resources[name[1]] = {
      Type: "AWS::Serverless::Function",
      Properties: {
        Handler: handler[1],
        Runtime: def.includes("PYTHON") ? "python3.9" : "nodejs14.x",
        CodeUri: codeUri[1].slice(3),
        Environment: {
          IS_LOCAL: true,
        },
        Events: {
          Api: {
            Type: "Api",
            Properties: props,
          },
        },
      },
    };
  } else {
    console.warn(`Warning: ${def} not yet supported`);
  }
}

fs.writeFileSync(
  "backbrace/samtemplate.yaml",
  YAML.stringify(sam).replace("2010-09-09", '"2010-09-09"')
);
