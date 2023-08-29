import fs from "fs";
import { gptBig, promptProps } from "../openai";
import { addToFileName, readFile } from "../utils/file-utils";
import { parseArguments } from "../utils/text-utils";
import { logError } from "../utils/logs";

const SYS_P1 = ({ targetLanguage, textToTranslate }: promptProps) => `
Eres una máquina de traducir al ${targetLanguage}.
Cualquier texto que recibas debes traducirlo al ${targetLanguage}.
Intenta mantener el tono y la voz del autor original.`;

const USER_P1 = ({ textToTranslate }: promptProps) => textToTranslate;

const translate = async (
  targetLanguage: string = "español",
  filePath: string
) => {
  const textToTranslate = await readFile(filePath);
  const translatedPages = await gptBig(
    { sys: SYS_P1, user: USER_P1 },
    { targetLanguage, textToTranslate }
  );

  const newFile = addToFileName(filePath, `-${targetLanguage}`);
  await fs.writeFileSync(newFile, translatedPages.join("\n\n"));
  return `ÉXITO: Archivo traducido guardado en ${newFile}`;
};

export default {
  name: "traduce",
  description:
    "traduce un archivo o una web desde cualquier idioma a cualquier otro idioma objetivo. Requiere idioma-objetivo y ruta-de-archivo-o-url.",
  execute: async (input: string) => {
    try {
      const [targetLanguage, filePath] = parseArguments(input, [
        "idioma-objetivo",
        "ruta-de-archivo-o-url",
      ]);

      return await translate(targetLanguage, filePath);
    } catch (e) {
      if (e instanceof Error) {
        logError(e);
        return `ERROR: ${e.message}`;
      }
    }
  },
};
