import { parse } from "dotenv";
import { last } from "./collection-utils";

export function countWords(str: string) {
  return str.trim().split(/\s+/).length;
}

const CLEAN_REGEX = /^['\[ \t\<"]+|['\]" \t\>]+$/gm;
export function parseArguments(input: string, expectedArgs?: string[]) {
  const args = input?.split(",").map((s) => s.replace(CLEAN_REGEX, ""));
  // console.log(args);
  if (expectedArgs && args.length !== expectedArgs.length)
    throw new Error(
      `Entrada de la acción incorrecta. Debe ser: ${expectedArgs
        .map((a) => `<${a}>`)
        .join(", ")}`
    );
  return args;
}

const trimRegex = /^\s+|\s+$/gm;
export function cleanPrompt(prompt: string) {
  return prompt.replace(trimRegex, "");
}

export const splitIntoBlocks = (maxWords: number, text: string) => {
  const blocks = [];

  let block = "";
  let blockWords = 0;
  const lines = text.split(/\n/).map((p) => ({ p, words: countWords(p) }));

  while (lines.length) {
    // TOOD: handle line too big
    while (lines.length && blockWords + lines[0].words <= maxWords) {
      const { p, words } = lines.shift()!;
      block += p + "\n";
      blockWords += words;
    }
    if (blockWords) {
      blocks.push(block);
      block = "";
      blockWords = 0;
    }
  }
  return blocks.filter((b) => b.match(/\w/));
};

const LAST_PHRASES_WORDS = 200;
export const lastPhrases = (text: string) => {
  const phrases = text.split(/\n/);
  let res = phrases.pop() || "";
  while (
    phrases.length &&
    countWords(res) + countWords(last(phrases)) <= LAST_PHRASES_WORDS
  ) {
    res = phrases.pop() + "\n" + res;
  }
  return res;
};

export const firstPhrase = (text: string) => {
  return text.split(/\n/)[0];
};

export const lastPhrase = (text: string) => {
  return last(text.split(/\n/));
};
