"use client";

import Chat from "@/components/builder/Chat";
import ClauseSelector from "@/components/builder/ClauseSelector";
import { useAuth } from "@/constants/AuthContext";
import { clauses } from "@/constants/categories";
import { sow_prompt } from "@/constants/prompt";
import { _document } from "@/constants/types";
import { getBedrockResponse, getIncrementalTruths } from "@/scripts/LLMGeneral";
import { Grid, GridCol } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

const ScopeOfWork = clauses
  .find((clause) => clause.category === "All")
  ?.clauses.find((clause) => clause.title === "Scope of Work");

const Clauses = () => {
  const { token } = useAuth();

  const sowgenContext: {
    contexts: {
      title: string;
      context: { role: string; content: { type: string; text: string }[] }[];
    }[];
    category: string;
    userInstitution: string;
    supplier: string;
    documentPurpose: string;
    document: _document;
    clauses: {
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
  } = JSON.parse(sessionStorage["sowgenContext"] ?? "{}");

  // from params
  const category =
    sowgenContext?.category ??
    JSON.parse(sessionStorage["scopeData"]?.category ?? "{}");
  const userInstitution =
    sowgenContext?.category ??
    JSON.parse(sessionStorage["scopeData"]?.userInstitution ?? "{}");
  const supplier =
    sowgenContext?.category ??
    JSON.parse(sessionStorage["scopeData"]?.supplier ?? "{}");
  const documentPurpose =
    sowgenContext?.category ??
    JSON.parse(sessionStorage["scopeData"]?.documentPurpose ?? "{}");
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
  const [clauses, setClauses] = useState<
    {
      title: string;
      content: string;
      summary: string;
      truths: string;
    }[]
  >(sowgenContext?.clauses ?? []);

  const handleAddClause = async (clause: { title: string; clause: string }) => {
    setCurrentClause({ ...clause, summary: "", truths: "" });
    if (contexts.find((c) => c.title === clause.title) !== undefined) {
      return;
    }

    const incrementalTruths = getIncrementalTruths(clauses);

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
        clauses
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
      newContext.find((c) => c.title === clause.title)?.context ?? [],
      token
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

    const existingDocumentIndex = clauses.findIndex(
      (c) => c.title === currentClause.title
    );
    if (existingDocumentIndex !== -1) {
      const newDocument = [...clauses];
      newDocument[existingDocumentIndex] = {
        title: currentClause.title,
        content: currentClause.clause,
        summary: currentClause.summary,
        truths: currentClause.truths,
      };
      setClauses(newDocument);
    } else {
      const newDocument = [
        ...clauses,
        {
          title: currentClause.title,
          content: currentClause.clause,
          summary: currentClause.summary,
          truths: currentClause.truths,
        },
      ];
      setClauses(newDocument);
    }

    setAccepted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accepted]);

  // auto select Scope of Work clause
  useEffect(() => {
    if (clauseRef.current === "" && ScopeOfWork && contexts.length === 0) {
      clauseRef.current = ScopeOfWork.title;
      handleAddClause(ScopeOfWork);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid h="calc(100vh - 70px)" p={0}>
      <GridCol span={4}>
        <ClauseSelector
          currentCategory={category ?? ""}
          currentClause={currentClause}
          handleAddClause={handleAddClause}
          document={clauses}
        />
      </GridCol>
      <GridCol span={4}>
        <Chat
          loading={loading}
          setLoading={setLoading}
          contexts={contexts}
          setContexts={setContexts}
          setAccepted={setAccepted}
          currentClause={currentClause}
          setCurrentClause={setCurrentClause}
          document={clauses}
        />
      </GridCol>
      <GridCol span={4}></GridCol>
    </Grid>
  );
};

export default Clauses;
