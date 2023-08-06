import env from "dotenv";
env.config();

import fs from "fs";
import { Parser } from "expr-eval";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
const rl = readline.createInterface({ input, output });

const promptTemplate = fs.readFileSync("prompt.txt", "utf8");
const mergeTemplate = fs.readFileSync("merge.txt", "utf8");

// use serpapi to answer the question
const googleSearch = async (question) =>
  await fetch(
    `https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${question}`
  )
    .then((res) => res.json())
    .then(
      (res) =>
        // try to pull the answer from various components of the response
        res.answer_box?.answer ||
        res.answer_box?.snippet ||
        res.organic_results?.[0]?.snippet
    );

// tools that can be used to answer questions
const tools = {
  search: {
    description:
      "un motor de búsqueda. útil para cuando se necesita responder a preguntas sobre la actualidad. la entrada debe ser una consulta de búsqueda.",
    execute: googleSearch,
  },
  calculator: {
    description:
      "Útil para obtener el resultado de una expresión matemática. La entrada a esta herramienta debe ser una expresión matemática válida que pueda ser ejecutada por una calculadora simple.",
    execute: (input) => Parser.evaluate(input).toString(),
  },
};

// use GPT-3.5 to complete a given prompts
const completePrompt = async (prompt) =>
  await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt,
      max_tokens: 256,
      temperature: 0.7,
      stream: false,
      stop: ["Observación:"],
    }),
  })
    .then((res) => res.json())
    .then((res) => res.choices[0].text)
    .then((res) => {
      // console.log("\x1b[90m" + prompt + "\x1b[0m");
      console.log("\x1b[90m" + res + "\x1b[0m");
      return res;
    });

const answerQuestion = async (question) => {
  // construct the prompt, with our question and the tools that the chain can use
  let prompt = promptTemplate.replace("${question}", question).replace(
    "${tools}",
    Object.keys(tools)
      .map((toolname) => `${toolname}: ${tools[toolname].description}`)
      .join("\n")
  );
  prompt = prompt.replace("${toolNames}", Object.keys(tools).join(", "));

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
      const result = await tools[action.trim()].execute(actionInput);
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
