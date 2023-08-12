import env from "dotenv";
env.config();

import fs from "fs";

const promptTemplate = fs.readFileSync("prompt.txt", "utf8");
const mergeTemplate = fs.readFileSync("merge.txt", "utf8");

const request = async (command, text) =>
  await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "user",
          content: command + ":\n" + text,
        },
      ],
    }),
  })
    .then((res) => res.json())
    .then((res) => res.choices[0].message.content)
    .then((res) => {
      console.log(res);
      return res;
    });

const trans = fs.readFileSync(
  "/Users/javiercarrascomarimon/Downloads/Meet - zoy-eytw-bcr - [04_08_2023, 08_59_38].txt",
  "utf8"
);

const summaries = [];
let block = "";
let blockWords = 0;
const paragraphs = trans
  .split(/\n\n+/)
  .map((p) => ({ p, words: countWords(p) }));

while (paragraphs.length) {
  while (paragraphs.length && blockWords + paragraphs[0].words < 8000) {
    const { p, words } = paragraphs.shift();
    block += p + "\n\n";
    blockWords += words;
  }
  if (blockWords) {
    const summary = await request(
      "Resume y corrige este trozo de la transcripción automática de una reunión. " +
        "Elimina partes repetidas, problemas técnicos con la reunion y arregla los errores de la trascripción. ",
      block
    );
    summaries.push(summary);
    block = "";
    blockWords = 0;
  }
}

const { date, time } = parseDate("04_08_2023, 08_59_38");

// console.log(trans);
const acta = await request(
  "Genera el acta de la reunión. Debe incluir fecha y hora, asistentes, puntos tratados y conclusiones y acciones. " +
    "Elimina la pequeña charla antes y después de la reunión." +
    "Yo asistí y me llamo Javier Carrasco" +
    `La reunión fue el ${date} a las ${time}`,
  summaries.join("\n\n")
);

await fs.writeFileSync(
  "/Users/javiercarrascomarimon/Downloads/Meet - zoy-eytw-bcr - [04_08_2023, 08_59_38] - ACTA.txt",
  acta
);

function countWords(str) {
  return str.trim().split(/\s+/).length;
}

function parseDate(str) {
  const [day, month, year, hours, minutes, seconds] = str.split(/\W+/);
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}
