import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import {
  getBedrockResponse,
  getIncrementalTruths,
} from "../scripts/LLMGeneral";

import prompts from "../assets/prompt.json";
import templates from "../assets/SOWCategories.json";
import Chat from "./Chat";
import ClauseSelector from "./ClauseSelector";
import DocumentPanel from "./DocumentPanel";
const sow_prompt = prompts["sow_prompt"];
const ScopeOfWork = templates.Clauses.find(
  (clause) => clause.category === "All"
)?.clauses.find((clause) => clause.title === "Scope of Work");

const DEBUG = false;

const MainPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const sowgenContext: {
    contexts: {
      title: string;
      context: { role: string; content: { type: string; text: string }[] }[];
    }[];
    category: string;
    userInstitution: string;
    supplier: string;
    documentPurpose: string;
    document: {
      title: string;
      content: string;
      summary: string;
      truths: string;
    }[];
    currentClause: {
      title: string;
      clause: string;
      summary: string;
      truths: string;
    };
    documentTitle: string;
  } = location?.state?.sowgenContext;

  // from params
  const category = sowgenContext?.category ?? searchParams.get("category");
  const userInstitution =
    sowgenContext?.category ?? searchParams.get("userInstitution");
  const supplier = sowgenContext?.category ?? searchParams.get("supplier");
  const documentPurpose =
    sowgenContext?.category ?? searchParams.get("documentPurpose");

  // for sowchat
  const [loading, setLoading] = useState<boolean>(false);
  const [contexts, setContexts] = useState<
    {
      title: string;
      context: {
        role: string;
        content: { type: string; text: string }[];
      }[];
    }[]
  >(sowgenContext?.contexts ?? []);

  // for curdocument
  const [accepted, setAccepted] = useState<boolean>(false);
  const [currentClause, setCurrentClause] = useState<{
    title: string;
    clause: string;
    summary: string;
    truths: string;
  }>(
    sowgenContext?.currentClause ?? {
      title: "",
      clause: "",
      summary: "",
      truths: "",
    }
  );
  const clauseRef = useRef<string>("");
  const [document, setDocument] = useState<
    {
      title: string;
      content: string;
      summary: string;
      truths: string;
    }[]
  >(sowgenContext?.document ?? []);

  const handleAddClause = async (clause: {
    title: string;
    clause: string;
    summary: string;
    truths: string;
  }) => {
    setCurrentClause(clause);
    if (contexts.find((c) => c.title === clause.title) !== undefined) {
      return;
    }

    const incrementalTruths = getIncrementalTruths(document);

    const newPrompt = sow_prompt
      .replaceAll("--CLAUSE--", clause.clause.toString())
      .replaceAll(
        "--INSTITUTION--",
        userInstitution?.toString() ?? "(institution not given)"
      )
      .replaceAll(
        "--SUPPLIER--",
        supplier?.toString() ?? "(supplier not given)"
      )
      .replaceAll(
        "--PURPOSE--",
        category?.toString() + ", " + documentPurpose?.toString()
      )
      .replaceAll(
        "--SCOPE--",
        document
          .find((doc) => doc.title === "Scope of Work")
          ?.content.toString() ?? ""
      )
      .concat(incrementalTruths);

    const newContext = [
      ...contexts,
      {
        title: clause.title,
        context: [
          { role: "user", content: [{ type: "text", text: newPrompt }] },
        ],
      },
    ];

    setContexts(newContext);

    setLoading(true);
    const r = await getBedrockResponse(
      newContext.find((c) => c.title === clause.title)?.context ?? []
    );

    newContext
      .find((c) => c.title === clause.title)
      ?.context.push({ role: "assistant", content: r });
    setContexts(newContext);
    setLoading(false);
  };

  // if accepted add to document
  useEffect(() => {
    if (!accepted) {
      return;
    }

    const existingDocumentIndex = document.findIndex(
      (doc) => doc.title === currentClause.title
    );
    if (existingDocumentIndex !== -1) {
      const newDocument = [...document];
      newDocument[existingDocumentIndex] = {
        title: currentClause.title,
        content: currentClause.clause,
        summary: currentClause.summary,
        truths: currentClause.truths,
      };
      setDocument(newDocument);
    } else {
      const newDocument = [
        ...document,
        {
          title: currentClause.title,
          content: currentClause.clause,
          summary: currentClause.summary,
          truths: currentClause.truths,
        },
      ];
      setDocument(newDocument);
    }

    setAccepted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accepted]);

  // auto select Scope of Work clause
  useEffect(() => {
    if (clauseRef.current === "" && ScopeOfWork && contexts.length === 0) {
      clauseRef.current = ScopeOfWork.title;
      handleAddClause({
        ...ScopeOfWork,
        summary: "",
        truths: "",
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          padding: 2,
          gap: 2,
          overflowY: "auto",
        }}
      >
        <ClauseSelector
          currentCategory={category ?? ""}
          currentClause={currentClause}
          handleAddClause={handleAddClause}
          document={document}
          debug={DEBUG}
          style={{ width: "25vw" }}
        />
        <Chat
          loading={loading}
          setLoading={setLoading}
          contexts={contexts}
          setContexts={setContexts}
          setAccepted={setAccepted}
          currentClause={currentClause}
          setCurrentClause={setCurrentClause}
          document={document}
          debug={DEBUG}
          style={{ width: "50vw" }}
        />
        <DocumentPanel
          document={document}
          setDocument={setDocument}
          documentTitle={category + " Scope of Work"}
          sowgenContext={{
            contexts,
            category,
            userInstitution,
            supplier,
            documentPurpose,
            document,
            currentClause,
            documentTitle: category + " Scope of Work",
          }}
          setCurrentClause={setCurrentClause}
          debug={DEBUG}
          style={{ width: "25vw" }}
        />
      </Box>
    </Box>
  );
};

export default MainPage;
