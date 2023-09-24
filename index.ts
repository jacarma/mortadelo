//  ⌐--OOっ

import env from "dotenv";
env.config();

import fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { gpt } from "./openai";
import { getTools } from "./utils/file-utils";
import { debug } from "./utils/logs";
import { cleanPrompt } from "./utils/text-utils";

const rl = readline.createInterface({ input, output });

const promptTemplate = fs.readFileSync("prompt.txt", "utf8");
const mergeTemplate = fs.readFileSync("merge.txt", "utf8");

const main = async () => {
  const tools = await getTools();

  const actionHistory: {
    action: string;
    actionInput: string;
    result: string;
  }[] = [];

  // use GPT-3.5 to complete a given prompts
  const answerPrompt = async (prompt: string) => {
    // console.log(prompt.replace(/.*Inicio\n/s, ""));
    return await gpt(prompt, {
      stop: ["Observación:", "Observación 1:", "Observación 2:"],
    }).then((gptResponse) => {
      console.log("\x1b[90m" + gptResponse.replace(/[\n ]+$/s, "") + "\x1b[0m");
      return gptResponse;
    });
  };

  const answerQuestion = async (question: string) => {
    // construct the prompt, with our question and the tools that the chain can use
    let prompt = promptTemplate
      .replace("${question}", question)
      .replace(
        "${tools}",
        tools
          .map(({ name, description }) => `  ${name}: ${description}`)
          .join("\n")
      );
    prompt = prompt.replace(
      "${toolNames}",
      tools.map((t) => t.name).join(", ")
    );

    // allow the LLM to iterate until it finds a final answer
    while (true) {
      const response = await answerPrompt(prompt);

      const regex = new RegExp(
        `^\s*(Pensamiento|Acción|Entrada de la acción)[ \\d]*:`,
        "gmi"
      );
      const resAsArray = ("Pensamiento: " + response)
        .split(regex)
        .map(cleanPrompt)
        .filter(Boolean);
      const parsedRes: { [key: string]: string } = {};
      for (let i = 0; i < resAsArray.length; i += 2) {
        parsedRes[resAsArray[i]] = resAsArray[i + 1];
      }

      debug({ response, resAsArray, parsedRes });

      // add this to the prompt
      prompt += response.replace(/\n/s, "\n  ");

      const action = response.match(/Acción[ \d]*: (.*)/i)?.[1];
      if (action) {
        // execute the action specified by the LLMs
        const actionInput = response.match(
          /Entrada de la acción[ \d]*: "?(.*)"?/i
        )?.[1];

        const previousAction = actionHistory.find(
          (a) => a.action === action && a.actionInput === actionInput
        );

        const tool = tools.find((t) => t.name === action.trim());
        const result = previousAction
          ? previousAction.result
          : tool
          ? await tool.execute(actionInput)
          : `ERROR: la Acción "${action}" no existe. Debe ser una de: ${tools
              .map((t) => t.name)
              .join(", ")}`;
        console.log("\x1b[90m" + `Observación: ${result}` + "\x1b[0m");
        actionHistory.push({ action, actionInput, result });
        prompt += `Observación: ${result}\n`;
      } else {
        return response.match(/Respuesta final: (.*)/is)?.[1];
      }
    }
  };

  // merge the chat history with a new question
  const mergeHistory = async (question: string, history: string) => {
    const prompt = mergeTemplate
      .replace("${question}", question)
      .replace("${history}", history);
    // console.log(prompt);
    return await answerPrompt(prompt);
  };

  // main loop - answer the user's questions
  let history = "";
  while (true) {
    let question = await rl.question("Cómo puedo ayudarte? ");
    if (history.length > 0) {
      question = await mergeHistory(question, history);
    }
    const answer = await answerQuestion(question);
    // console.log("\n" + answer);
    history += `Q:${question}\nA:${answer}\n`;
  }
};

main();
