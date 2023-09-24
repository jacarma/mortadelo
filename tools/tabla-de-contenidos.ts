import { gpt, promptPropsInput } from "../openai";
import { readFile } from "../utils/file-utils";
import { logError } from "../utils/logs";
import { countWords, isTitle, splitIntoSections } from "../utils/text-utils";

const USER_P1 = ({ filePath, titles, fileWords }: promptPropsInput) => `
La siguiente lista de posibles títulos y subtítulos se ha extraido automáticamente de ${filePath}
Genera la tabla de contenidos. 

Reglas:
- Debería tener ${Math.floor(+fileWords / 1000)} entradas o más.
- Todas las entradas de la tabla de contenidos deben aparecer en la lista de posibles títulos.
- Puedes descartar líneas de la lista de posibles títulos pero no puede añadir nuevas.

Lista de posibles títulos: """
${titles}
"""`;

export const generateToc = async (filePath: string) => {
  const fileContent = await readFile(filePath);
  const fileWords = countWords(fileContent).toString();
  const sections = splitIntoSections(fileContent);

  const titles = sections.filter(isTitle);
  if (titles.length === 0) throw new Error("No se han encontrado títulos");

  const toc = await gpt(
    USER_P1({
      filePath,
      titles: titles.join("\n"),
      fileWords,
    }),
    {}
  );

  return { toc, fileWords, sections, titles };
};

export default {
  name: "tabla-de-contenidos",
  description:
    "muestra la tabla de contenidos de un archivo o una página web. Requiere la ruta del archivo o la url de la web.",
  execute: async (input: string) => {
    try {
      const { toc } = await generateToc(input);
      return toc;
    } catch (e) {
      logError(e);
      return `ERROR: ${(e as Error).message}`;
    }
  },
};
