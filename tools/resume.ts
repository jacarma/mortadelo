import fs from "fs";
import { MAX_TOKENS, TOKENS_PER_WORD, gptBig, promptProps } from "../openai";
import { addToFileName } from "../utils/file-utils";
import { countWords, isTitle, lastPhrases } from "../utils/text-utils";
import { debug, logError } from "../utils/logs";
import { generateToc } from "./tabla-de-contenidos";

const MAX_WORDS = MAX_TOKENS / TOKENS_PER_WORD / 2;

const SYS_P1 = ({ context, wordFactor }: promptProps) => `
Eres un ghostwriter. 
Cada vez que el escritor te mande un texto debes reescribirlo en unas ${Math.floor(
  Math.ceil(countWords(context.toString()) * +wordFactor)
)} palabras y en español. 

Reglas:
- Utiliza la misma voz y tono que el autor de la página original.
- Todos los elementos de las enumeraciones de la página original también deben encontrarse en tu versión.
- Responde solo con el texto reescrito.
- No saludes ni te despidas.
`;

const USER_P1 = ({ context, prevBlockSummary, numBlock }: promptProps) =>
  lastPhrases(prevBlockSummary.toString()) + context.toString();

export const summarizeBySections = async (filePath: string) => {
  const { toc, sections, titles, fileWords } = await generateToc(filePath);
  const wordFactor = Math.min(1 / 3, MAX_WORDS / +fileWords);
  const TOC = toc
    .split("\n")
    .map((s: string) => ({ text: s.replace(/^[\d\.\s-]+/, ""), pointer: -1 }));
  const summarizedBlocks: string[] = [];

  let lastPointer = -1;
  for (let TOCPointer = 0; TOCPointer < TOC.length; TOCPointer++) {
    for (
      let sectionPointer = lastPointer + 1;
      sectionPointer < sections.length;
      sectionPointer++
    ) {
      if (
        isTitle(sections[sectionPointer]) &&
        sections[sectionPointer]
          .toLowerCase()
          .includes(TOC[TOCPointer].text.toLowerCase())
      ) {
        TOC[TOCPointer].pointer = sectionPointer;
        lastPointer = sectionPointer;
        break;
      }
    }
  }
  for (let i = TOC.length - 1; i >= 0; i--) {
    let originalTitlePosition = TOC[i].pointer;
    if (originalTitlePosition === -1) {
      debug(`No se ha encontrado el título ${TOC[i].text}`);
      continue;
    }
    const remain = sections.length - originalTitlePosition;
    const sectionContent = sections
      .splice(originalTitlePosition, remain)
      .join("\n\n");
    const sectionSummary = (
      await gptBig(
        { sys: SYS_P1, user: USER_P1 },
        {
          context: sectionContent,
          filePath,
          wordFactor: wordFactor.toString(),
        },
        "prevBlockSummary",
        undefined
        // { temperature: 0.1 }
      )
    ).join("\n\n");
    summarizedBlocks.unshift(sectionSummary);
    summarizedBlocks.unshift(TOC[i].text);
  }

  const summary = summarizedBlocks.join("\n\n");
  let content = summary;

  const newFile = addToFileName(filePath, `-RESUMEN`);
  await fs.writeFileSync(newFile, summary);

  while (countWords(content) > MAX_WORDS) {
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
      return await summarizeBySections(input);
    } catch (e) {
      logError(e);
      return `ERROR: ${(e as Error).message}`;
    }
  },
};
