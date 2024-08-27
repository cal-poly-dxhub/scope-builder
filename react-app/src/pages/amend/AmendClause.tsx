import { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import "./AmendClause.css";
import AmendInput from "./AmendInput";

import j from "../../assets/prompt.json";
import { downloadDocument } from "../../scripts/Docx";
import {
  getBedrockResponse,
  getCaluseTags,
  getNumberTags,
  getTitleTags,
} from "../../scripts/LLMGeneral";
import AmendChat from "./AmendChat";
const initial_prompt = j["amend_clause"];
const finalize_prompt = j["amend_finalize"];

const DEBUG = false;

const AmendClause = () => {
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
  }>({
    title: "",
    clause: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [document, setDocument] = useState<
    | {
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
      const r = await getBedrockResponse(newContext.context ?? []);

      newContext.context.push({ role: "assistant", content: r });
      setContext(newContext);
      setLoading(false);
    };

    if (currentClause.title !== "" && currentClause.clause !== "") {
      handleAddClause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClause]); // handle loading

  useEffect(() => {
    const handleExport = async (docu: { title: string; content: string }[]) => {
      const message =
        finalize_prompt + docu.map((doc) => doc.content).join(" ");
      const context = {
        role: "user",
        content: [{ type: "text", text: message }],
      };

      const response = await getBedrockResponse([context]);
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
      // createDocument(title, clauses);
      downloadDocument(title, clauses);
    };

    if (accepted) {
      if (context) {
        console.log("context:", context);
        const response =
          context?.context[context.context.length - 2]?.content ??
          context?.context[context.context.length - 1]?.content ??
          "no clause found"; // -2 and -1?
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accepted]); // handle accepted clause

  return (
    <div>
      <Navbar />
      <div className="horizontal">
        <AmendInput setClause={setCurrentClause} />
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
        />
      </div>
    </div>
  );
};

export default AmendClause;
