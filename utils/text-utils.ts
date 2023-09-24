import { parse } from "dotenv";
import { last } from "./collection-utils";

export function countWords(str: string) {
  return str.trim().split(/\s+/).length;
}

const CLEAN_REGEX = /^['\\[ \\t\<"]+|['\]" \\t\>]+$/gm;

const WORD = "\\S+";
const SEPARATOR = "[\\t ]+";
const LESS_THAN_20_WORDS = `(?:${WORD}${SEPARATOR}){0,19}${WORD}`;
const UPPERCASE_CHAR = "[^\\sa-záéíóúàèìòùñü]";
const SPACES_SEPARATED_TITLE = `(?<=\n\n)(${UPPERCASE_CHAR}\\S*\\s*${LESS_THAN_20_WORDS})\\s*\\n`;

const UPPERCASE_WORD = `${UPPERCASE_CHAR}+`;
const UPPERCASE_TITLE = `^\\s*((?:${UPPERCASE_WORD}${SEPARATOR}){0,19}${UPPERCASE_WORD})\\s*$`;

const NUMBERED_TITLE = `^\\s*((?:\\d+\\.)?\\d+\\.?\\s+${LESS_THAN_20_WORDS})\\s*$`;

const TITLE = `${SPACES_SEPARATED_TITLE}|${UPPERCASE_TITLE}|${NUMBERED_TITLE}`;

const TITLES_REGEX = new RegExp(TITLE, "gsm");

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
  const sections = splitIntoSections(text).map((p) => ({
    p,
    words: countWords(p),
  }));

  while (sections.length) {
    if (!blockWords && sections[0].words > maxWords) {
      // Section doesn't fit in openai
      const words = sections[0].p.split(/\W+/).filter((a) => /\w/.test(a));
      const newSection = words.splice(0, maxWords);
      sections[0] = { p: words.join(" "), words: words.length };
      sections.unshift({
        p: newSection.join(" "),
        words: newSection.length,
      });
    }
    while (sections.length && blockWords + sections[0].words <= maxWords) {
      const { p, words } = sections.shift()!;
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

export const splitIntoSections = (text: string) => {
  const sections = ("\n\n" + text).split(TITLES_REGEX);
  if (!sections || !sections.length) return [text];
  return sections
    .filter(Boolean)
    .filter((s) => !/^\s*$/.test(s))
    .map((section) =>
      section.replace(/[\n\s]+([a-záéíóúàèìòùüñ])/g, (a, foundChar, i) => {
        return ` ${foundChar}`;
      })
    );
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

export const isTitle = (s: string) =>
  countWords(s) <= 20 && !s.includes("\n") && !!s;
