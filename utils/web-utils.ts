import { chromium } from "playwright";
import { convert } from "html-to-text";
import { get, Agent } from "https";
import { readPdf } from "./file-utils";
import { constants } from "crypto";
import fs from "fs";

const agent = new Agent({
  // for self signed you could also add
  // rejectUnauthorized: false,
  // allow legacy server
  secureOptions: constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

export const readHtml = async (url: string) => {
  if (await isPdf(url)) return await readPdf(url);

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content();

  const options = {
    wordwrap: 130,
    // ...
  };
  const text = convert(html, options);
  fs.writeFileSync("./test.md", text);
  return text;
};

const isPdf = (url: string) => {
  return new Promise((resolve) => {
    const request = get(url, { agent }, function (response) {
      const contentType = response.headers["content-type"];
      request.abort();
      const isPDF = (contentType || "").includes("pdf");
      resolve(isPDF);
    });
  });
};

readHtml("https://kinsta.com/es/blog/bibliotecas-de-componentes-react/");
