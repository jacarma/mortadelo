import { gptBig, promptProps } from "../openai";
import { parseArguments } from "../utils/text-utils";
import { last } from "../utils/collection-utils";
import { readFile } from "../utils/file-utils";
import { logError } from "../utils/logs";
import resume, { summarize } from "./resume";

// const P1 = ({ question, context }: promptProps) => `
// Del siguiente contexto extrae aquel que podría servir para responder a la pregunta.

// Reglas:
// Si no hubiese contenido relevante para responder, responde con la palabra NADA

// Pregunta:
// ${question}

// Contexto: """
// ${context}
// """`;

const P2 = ({ question, context, prevAnswer }: promptProps) => `
Mejora y completa la respuesta previa con toda la información relevante del contexto.

Reglas:
Es suficiente si tu respuesta es una respuesta parcial.
Si la respuesta previa ya es completa o el contexto no permite mejorarla, responde con esa misma respuesta previa.
Tu respuesta siempre debe ser mejor o igual que la respuesta previa.

Contenido deseado: """
${question}
"""

Respuesta previa: """
${prevAnswer || question + ":"}
"""

Contexto: """
${context}
"""`;

export const answerQuestion = async (question: string, context: string) => {
  const answers = await gptBig(P2, { question, context }, "prevAnswer");
  return last(answers);
};

export const investigate = async (filePath: string, question: string) => {
  const context = await readFile(filePath);

  // const relevantExtracts = await gptBig(P1, { context, question });
  // console.log({ relevantExtracts });
  // const relevantText = relevantExtracts
  //   .filter((l) => !l.includes("NADA"))
  //   .join("\n\n");
  // console.log({ relevantText });

  // if (!relevantText) return "No he encontrado texto relevante";

  return answerQuestion(question, context);
};

export default {
  name: "lee-y-extrae",
  description:
    "lee un archivo o una página web y extrae el contenido deseado. Requiere ruta-de-archivo-o-url y contenido-deseado. contenido-deseado es una frase en lenguaje natural o una pregunta.",
  execute: async (input: string) => {
    try {
      const args = parseArguments(input);
      if (args.length === 1) return await summarize(input);
      if (args.length === 2) return await investigate(args[0], args[1]);
      parseArguments(input, [
        "ruta-de-archivo-o-url",
        "pregunta-que-responder",
      ]);
    } catch (e) {
      logError(e);
      return `ERROR: ${(e as Error).message}`;
    }
  },
};
