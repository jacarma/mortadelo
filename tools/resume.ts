import fs from "fs";
import { MAX_TOKENS, TOKENS_PER_WORD, gptBig, promptProps } from "../openai";
import { addToFileName, readFile } from "../utils/file-utils";
import {
  countWords,
  firstPhrase,
  lastPhrase,
  lastPhrases,
} from "../utils/text-utils";
import { logError } from "../utils/logs";

const MAX_WORDS_PER_BLOCK = MAX_TOKENS / TOKENS_PER_WORD / 4;

const SYS_P1 = ({
  context,
  numBlock,
  totalBlocks,
  filePath,
  prevBlockSummary,
}: promptProps) => `
Eres una máquina de reescribir libros y artículos. 
Para cada página que recibas vas a devolver una versión de unas ${Math.floor(
  countWords(context.toString()) / 3
)} palabras y en español. 

Reglas:
- Conserva la estructura de secciones y subsecciones. 
- Mantén todos los títulos y subtítulos con sus números y pesos.
- No descartes el texto anterior a la primera sección.
- Utiliza la misma voz y tono que el autor de la página original.
- Todos los elementos de las enumeraciones de la página original también pueden encontrarse en tu versión.
- No añadas contenido que no esté en la página original.

La primera página que vas a recibir es la número ${numBlock} de un total de ${totalBlocks} obtenida de "${filePath}"

${
  parseInt(numBlock) > 1
    ? `Final de la página anterior: """\n${prevBlockSummary}\n"""`
    : ""
}

`;

// Para hacerlo primero extraerás la estructura de la página y luego reescribirás cada sección.
//- Prohibido usar: "este artículo", "esta página", "en resumen", "por lo que se recomienda"
// La primera frase del resumen debe ser: """
// ${firstPhrase(context.toString())}
// """

// La última frase del resumen debe ser: """
// ${lastPhrase(context.toString())}
// """

// - La página puede ser extraída de una web o pdf automáticamente. Elimina el contenido que no sea relevante (sidebars, contenido promocional, etc.)
// - No añadas introducción ni cierre.
// - No añadas conclusiones al final, termina el resumen igual que termina la página original.
// - La página original será sustituida por el resumen por lo que debe ser coherente con la anterior y siguiente.
// - La primera frase del resumen coincide con la primera frase de la página original.
// - La última frase del resumen coincide con la última frase de la página original.

const USER_P1 = ({ context, prevBlockSummary, numBlock }: promptProps) =>
  lastPhrases(prevBlockSummary.toString()) + context.toString();

export const summarize = async (filePath: string) => {
  const fileContent = await readFile(filePath);

  const summarizedBlocks = await gptBig(
    { sys: SYS_P1, user: USER_P1 },
    { context: fileContent, filePath },
    "prevBlockSummary",
    undefined
    // { temperature: 0.1 }
  );

  const summary = summarizedBlocks.join("\n\n");
  let content = summary;

  const newFile = addToFileName(filePath, `-RESUMEN`);
  await fs.writeFileSync(newFile, summary);

  while (countWords(content) > MAX_WORDS_PER_BLOCK) {
    console.log("Resumiendo más...");
    content = (
      await gptBig(
        { sys: SYS_P1, user: USER_P1 },
        { context: content, filePath },
        "prevBlockSummary"
      )
    ).join("\n\n");
  }

  return `ÉXITO: se ha almacenado el archivo ${newFile}. El contenido es: ${content}`;
};

export default {
  name: "resume",
  description:
    "resume un archivo o una página web. Requiere la ruta del archivo o la url de la web.",
  execute: async (input: string) => {
    try {
      return await summarize(input);
    } catch (e) {
      logError(e);
      return `ERROR: ${(e as Error).message}`;
    }
  },
};
