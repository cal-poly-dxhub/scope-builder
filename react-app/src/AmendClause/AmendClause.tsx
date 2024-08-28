import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import j from "../assets/prompt.json";
import { useAuth } from "../Auth/AuthContext";
import { downloadDocument } from "../scripts/Docx";
import {
  getBedrockResponse,
  getCaluseTags,
  getNumberTags,
  getTitleTags,
} from "../scripts/LLMGeneral";
import AmendChat from "./AmendChat";
import AmendInput from "./AmendInput";

const initial_prompt = j["amend_clause"];
const finalize_prompt = j["amend_finalize"];
const DEBUG = false;

const AmendClause = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [accepted, setAccepted] = useState<boolean>(false);
  const [context, setContext] = useState<{
    title: string;
    context: {
      role: string;
      content: { type: string; text: string }[];
    }[];
  }>({
    title: "",
    context: [],
  });
  const [currentClause, setCurrentClause] = useState<{
    title: string;
    clause: string;
    summary: string;
  }>({
    title: "",
    clause: "",
    summary: "",
  });
  const [document, setDocument] = useState<
    {
      title: string;
      content: string;
      summary: string;
      truths: string;
    }[]
  >([]);

  useEffect(() => {
    const handleAddClause = async () => {
      const newPrompt = initial_prompt.replaceAll(
        "--CLAUSE--",
        currentClause.title + " " + currentClause.clause.toString()
      );

      const newContext = {
        title: currentClause.title,
        context: [
          { role: "user", content: [{ type: "text", text: newPrompt }] },
        ],
      };

      setContext(newContext);

      setLoading(true);
      const r = await getBedrockResponse(newContext.context ?? [], token);

      newContext.context.push({ role: "assistant", content: r });
      setContext(newContext);
      setLoading(false);
    };

    if (currentClause.title !== "" && currentClause.clause !== "") {
      handleAddClause();
    }
  }, [currentClause, token]);

  useEffect(() => {
    const handleExport = async (docu: { title: string; content: string }[]) => {
      const message =
        finalize_prompt + docu.map((doc) => doc.content).join(" ");
      const context = {
        role: "user",
        content: [{ type: "text", text: message }],
      };

      const response = await getBedrockResponse([context], token);
      console.log("response:", JSON.stringify(response, null, 2));

      const clauses = [];
      while (true) {
        const currentClause = getNumberTags(clauses.length + 1, response);
        if (currentClause === "") {
          break;
        }

        const title = getTitleTags([{ type: "text", text: currentClause }]);
        const clause = getCaluseTags([{ type: "text", text: currentClause }]);
        clauses.push({ title, content: clause });
      }

      console.log("clauses:", JSON.stringify(clauses, null, 2));

      const title = `Scope of Work Amendment - ${new Date().toDateString()}`;
      downloadDocument(title, clauses);
    };

    if (accepted) {
      if (context) {
        console.log("context:", context);
        const response =
          context?.context[context.context.length - 2]?.content ??
          context?.context[context.context.length - 1]?.content ??
          "no clause found";
        const clause = getCaluseTags(response);
        const doc = [
          {
            title: currentClause.title,
            content: clause,
          },
        ];

        handleExport(doc);
      } else {
        console.log("context not found");
      }

      setAccepted(false);
    }
  }, [accepted, context, currentClause.title, token]);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography variant="h4" gutterBottom marginBottom={3} marginTop={2}>
        Amend Clause
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Box sx={{ display: "flex", gap: 4 }}>
          <AmendInput setClause={setCurrentClause} style={{ width: "50vw" }} />
          <AmendChat
            loading={loading}
            setLoading={setLoading}
            context={context}
            setContext={setContext}
            setAccepted={setAccepted}
            currentClause={{ ...currentClause, summary: "" }}
            setCurrentClause={setCurrentClause}
            document={document}
            debug={DEBUG}
            style={{ width: "50vw" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AmendClause;
