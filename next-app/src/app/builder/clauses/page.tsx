"use client";

import Chat from "@/components/builder/Chat";
import ClauseSelector from "@/components/builder/ClauseSelector";
import DocumentPanel from "@/components/builder/DocumentPanel";
import { templates } from "@/constants/templates";
import {
  _clause,
  _clauseTemplate,
  _document,
  _message,
} from "@/constants/types";
import { getClausePromptResponse } from "@/scripts/nextapi";
import { Grid, GridCol } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

const Clauses = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [finishedClauses, setFinishedClauses] = useState<_clause[]>(
    JSON.parse(sessionStorage["document"] ?? "[]")?.clauses ?? []
  );

  // console.log("sessionStorage:", sessionStorage);

  const contexts = useRef<
    {
      clause: _clause;
      messages: _message[];
    }[]
  >(JSON.parse(sessionStorage["context"] ?? "[]") || []);
  const [currentMessages, setCurrentMessages] = useState<_message[]>(
    contexts.current[0]?.messages ?? []
  );
  const [currentClauseTitle, setCurrentClauseTitle] = useState<string>("");

  const category = JSON.parse(sessionStorage["scopeData"])?.category;
  const userInstitution = JSON.parse(
    sessionStorage["scopeData"]
  )?.userInstitution;
  const supplier = JSON.parse(sessionStorage["scopeData"])?.supplier;
  const documentPurpose = JSON.parse(
    sessionStorage["scopeData"]
  )?.documentPurpose;

  const appendMessage = (clauseTitle: string, message: _message) => {
    const contextIndex = contexts.current.findIndex(
      (c) => c.clause.title === clauseTitle
    );

    if (contextIndex === -1) {
      return;
    }

    setCurrentMessages((prevMessages) => {
      const newMessages = [...prevMessages, message];
      contexts.current[contextIndex].messages = newMessages;
      return newMessages;
    });

    sessionStorage.setItem("context", JSON.stringify(contexts.current));
  };

  // when clause is added to chat
  const handleAddClauseTemplate = async (clause: _clauseTemplate) => {
    let cc = contexts.current.find((c) => c.clause.title === clause.title);
    if (cc === undefined) {
      setLoading(true);
      setCurrentClauseTitle(clause.title);
      const initialMessage = {
        role: "user",
        content: [{ type: "text", text: "Start working on " + clause.title }],
      };
      setCurrentMessages([initialMessage]);

      const responses = await getClausePromptResponse(
        userInstitution,
        supplier,
        clause,
        category,
        documentPurpose,
        contexts.current.find((c) => c.clause.title === "Scope of Work")?.clause
          .content ?? "",
        ""
      );

      setCurrentMessages(responses);
      contexts.current.push({
        clause: {
          title: clause.title,
          content: "",
          notes: "",
        },
        messages: responses,
      });

      setLoading(false);
    }

    cc = contexts.current.find((c) => c.clause.title === clause.title);
    setCurrentClauseTitle(cc!.clause.title);
    setCurrentMessages(cc!.messages);
    sessionStorage.setItem("context", JSON.stringify(contexts.current));
  };

  // when clause is accepted
  const acceptClause = (clause: _clause) => {
    const filteredFinishedClauses = finishedClauses.filter(
      (c) => c.title !== clause.title
    );

    setFinishedClauses([...filteredFinishedClauses, clause]);

    const newDocument: _document = {
      title: "New Scope of Work",
      date: new Date().toISOString(),
      category: category ?? "",
      institution: userInstitution ?? "",
      supplier: supplier ?? "",
      purpose: documentPurpose ?? "",
      clauses: [...filteredFinishedClauses, clause],
    };
    sessionStorage.setItem("document", JSON.stringify(newDocument));
  };

  // on clause edit button
  const handleChangeClause = (clauseTitle: string) => {
    const cc = contexts.current.find((c) => c.clause.title === clauseTitle);
    if (cc === undefined) {
      console.error("Could not find clause in context");
      return;
    }

    setCurrentClauseTitle(cc.clause.title);
    setCurrentMessages(cc.messages);
  };

  // auto select Scope of Work clause
  useEffect(() => {
    const initialClause = templates
      .find((t) => t.category === "All")
      ?.clauses.find((c) => c.title === "Scope of Work");

    if (initialClause) {
      handleAddClauseTemplate(initialClause);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid h="calc(100vh - 70px)" p={0} w="99vw">
      {/* <Button
        variant="outline"
        onClick={() => {
          console.log("currentClauseTitle:", currentClauseTitle);
          console.log("currentMessages:", currentMessages);
          console.log("contexts:", contexts.current);
        }}
      >
        Log Context
      </Button> */}
      <GridCol span={3}>
        <ClauseSelector
          category={category ?? ""}
          currentClauseTitle={currentClauseTitle}
          handleAddClauseTemplate={handleAddClauseTemplate}
        />
      </GridCol>
      <GridCol span={6}>
        <Chat
          loading={loading}
          setLoading={setLoading}
          messages={currentMessages}
          appendMessage={appendMessage}
          acceptClause={acceptClause}
          currentClauseTitle={currentClauseTitle}
        />
      </GridCol>
      <GridCol span={3}>
        <DocumentPanel
          finishedClauses={finishedClauses}
          setFinishedClauses={setFinishedClauses}
          handleChangeClause={handleChangeClause}
        />
      </GridCol>
    </Grid>
  );
};

export default Clauses;
