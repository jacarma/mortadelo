import env from "dotenv";
env.config();

import fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({ input, output });

const promptTemplate = fs.readFileSync("prompt.txt", "utf8");
const mergeTemplate = fs.readFileSync("merge.txt", "utf8");

const toolsPath = path.join(__dirname, "tools");
const tools = await Promise.all(
  fs
    .readdirSync(toolsPath)
    .map((file) => import(path.join(toolsPath, file)).then((m) => m.default))
);

// use GPT-3.5 to complete a given prompts
const completePrompt = async (prompt) =>
  await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      stop: ["Observación:"],
    }),
  })
    .then((res) => res.json())
    .then((res) => res.choices[0].message.content)
    .then((res) => {
      // console.log("\x1b[90m" + prompt + "\x1b[0m");
      console.log("\x1b[90m" + res + "\x1b[0m");
      return res;
    });

const answerQuestion = async (question) => {
  // construct the prompt, with our question and the tools that the chain can use
  let prompt = promptTemplate
    .replace("${question}", question)
    .replace(
      "${tools}",
      tools.map(({ name, description }) => `${name}: ${description}`).join("\n")
    );
  prompt = prompt.replace("${toolNames}", tools.map((t) => t.name).join(", "));

  // allow the LLM to iterate until it finds a final answer
  while (true) {
    const response = await completePrompt(prompt);

    // add this to the prompt
    prompt += response;

    const action = response.match(/Acción: (.*)/i)?.[1];
    if (action) {
      // execute the action specified by the LLMs
      const actionInput = response.match(
        /Entrada de la acción: "?(.*)"?/i
      )?.[1];
      const tool = tools.find((t) => t.name === action.trim());
      const result = tool ? await tool.execute(actionInput) : "n/a";
      console.log(
        "\x1b[90m" + `${action}(${actionInput}): ${result}` + "\x1b[0m"
      );
      prompt += `Observación: ${result}\n`;
    } else {
      return response.match(/Respuesta final: (.*)/i)?.[1];
    }
  }
};

// merge the chat history with a new question
const mergeHistory = async (question, history) => {
  const prompt = mergeTemplate
    .replace("${question}", question)
    .replace("${history}", history);
  // console.log(prompt);
  return await completePrompt(prompt);
};

// main loop - answer the user's questions
let history = "";
while (true) {
  let question = await rl.question("Cómo puedo ayudarte? ");
  if (history.length > 0) {
    question = await mergeHistory(question, history);
  }
  const answer = await answerQuestion(question);
  console.log(answer);
  history += `Q:${question}\nA:${answer}\n`;
}
