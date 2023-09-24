import fs from "fs";
import { splitIntoBlocks } from "./text-utils";
import { readHtml } from "./web-utils";
import pdf from "@cyber2024/pdf-parse-fixed";
import https from "https";
import crypto from "crypto";
import path from "node:path";

const MAX_BLOCK_TO_PROCESS = 25;

const agent = new https.Agent({
  // for self signed you could also add
  // rejectUnauthorized: false,
  // allow legacy server
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

export const readFile = async (filePath: string) => {
  let text = "";
  try {
    text = filePath.startsWith("http")
      ? await readHtml(filePath)
      : await readLocal(filePath);
    if (!text) throw new Error();
  } catch (e) {
    throw new Error(`No existe el archivo ${filePath} o es ilegible`);
  }
  return text;
};

const readLocal = async (filePath: string) => {
  if (filePath.endsWith(".pdf")) return readPdf(filePath);
  return fs.readFileSync(filePath, "utf8");
};

export const readIntoBlocks = async (maxWords: number, filePath: string) => {
  const text = await readFile(filePath);
  const blocks = splitIntoBlocks(maxWords, text);
  if (blocks.length > MAX_BLOCK_TO_PROCESS)
    throw new Error(
      `El archivo tiene demasiados bloques (${blocks.length}) para procesar.`
    );
  return blocks;
};

export const addToFileName = (filePath: string, suffix: string) => {
  if (filePath.startsWith("http"))
    return "./" + filePath.replace(/\W/g, "") + `${suffix}.txt`;
  const extension = /\.\w{1,4}$/.exec(filePath)?.[0];
  return extension
    ? filePath.replace(
        extension,
        (extension: string) => `${suffix}${extension}`
      )
    : filePath + `${suffix}`;
};

export const readPdf = async (filePath: string) => {
  const isOnline = filePath.startsWith("http");
  const localPath = isOnline
    ? "./" + filePath.replace(/\W/g, "") + ".pdf"
    : filePath;
  // console.log({ isOnline, localPath });

  if (isOnline) {
    await download(filePath, localPath);
  }
  let dataBuffer = fs.readFileSync(localPath);
  const pdfObject = await pdf(dataBuffer);
  return pdfObject.text;
};

const download = function (url: string, dest: string) {
  // console.log("download", { url, dest });
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = https
      .get(url, { agent }, function (response) {
        response.pipe(file);
        file.on("finish", function () {
          file.close(resolve);
          // console.log("downloaded".dest);
        });
      })
      .on("error", function (err) {
        // Handle errors
        fs.unlink(dest, console.log); // Delete the file async. (But we don't check the result)
        console.error(err);
        reject(err);
      });
  });
};

export interface Tool {
  name: string;
  description: string;
  execute: (input: string) => Promise<string>;
  disabled?: boolean;
}

export const getTools = async () => {
  const toolsPath = path.join(__dirname, "..", "tools");

  const fileNames = (await fs.readdirSync(toolsPath)).filter(
    (file) => !file.includes(".test.")
  );
  const modules = await Promise.all(
    fileNames.map((file) =>
      import(path.join(toolsPath, file)).then((m) => m.default)
    )
  );
  const tools = modules.filter(
    (m) => m.name && m.description && m.execute && !m.disabled
  );
  return tools as Tool[];
};
