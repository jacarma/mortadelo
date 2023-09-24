import { last } from "./utils/collection-utils";
import { debug } from "./utils/logs";
import { splitIntoBlocks, countWords, firstPhrase } from "./utils/text-utils";
import { appendFileSync } from "node:fs";

export const TOKENS_PER_WORD = 3;

export const MODELS = [
  {
    id: "gpt-3.5-turbo-16k",
    max_tokens: 16384,
  },
  {
    id: "gpt-3.5-turbo",
    max_tokens: 4096,
  },
];
export const MAX_TOKENS = MODELS.map((m) => m.max_tokens).reduce((a, b) =>
  Math.max(a, b)
);

export const MAX_WORDS = MAX_TOKENS / TOKENS_PER_WORD / 2;

let model16kCount = 0;

const fiveSeconds = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });

export const gpt = async (text: string, options = {}, sys?: string) => {
  const wordCount = countWords(text);
  const requiredTokens = wordCount * TOKENS_PER_WORD * 3;
  const sortedModels = MODELS.filter(
    (m) => m.max_tokens >= requiredTokens
  ).sort((a, b) => a.max_tokens - b.max_tokens);
  const model = sortedModels.length > 0 ? sortedModels[0] : MODELS[0];

  if (model.id === "gpt-3.5-turbo-16k") {
    model16kCount++;
    if (model16kCount > 1) {
      // console.log("Waiting one minute to use 16k model again");
      await fiveSeconds();
      model16kCount = 0;
    }
  }

  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      ...options,
      model: model.id,
      // max_tokens: model.max_tokens / 2,
      messages: [
        ...(sys ? [{ role: "system", content: sys }] : []),
        {
          role: "user",
          content: text,
        },
      ],
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      const now = new Date();

      if (res.error) throw new Error(res.error.message);
      appendFileSync(
        "openai.log",
        [
          now.toISOString(),
          model.id,
          wordCount,
          res.usage.prompt_tokens,
          res.usage.completion_tokens,
          res.usage.total_tokens,
        ].join("\t") + "\n"
      );
      // console.log("gpt", {
      //   prompt: text,
      //   message: res.choices[0].message.content,
      //   res,
      // });
      const content = res.choices[0].message.content;
      return content;
    });
};

export type promptPropsInput = {
  [k: string]: string;
};
export type promptProps = {
  numBlock: string;
  totalBlocks: string;
} & promptPropsInput;

type promptFn = (props: promptProps) => string;
type prompts = {
  sys?: promptFn;
  user: promptFn;
};

export const gptBig = async (
  prompts: promptFn | prompts,
  props: promptPropsInput,
  accResponseProp: string | undefined = undefined,
  maxWords = MAX_WORDS,
  gptOptions = {}
): Promise<string[]> => {
  const longProp = longerProp(props);
  const responses = [];

  const blocks = splitIntoBlocks(maxWords, props[longProp].toString());

  let numBlock = 0;
  const totalBlocks = blocks.length;
  for (const block of blocks) {
    const ctx: promptProps = {
      ...props,
      [longProp]: block,
      numBlock: "" + (responses.length + 1),
      totalBlocks: "" + blocks.length,
    };
    if (accResponseProp) {
      ctx[accResponseProp] = last(responses) || "";
    }
    const ps = typeof prompts === "function" ? { user: prompts } : prompts;
    try {
      const response = await gpt(ps.user(ctx), gptOptions, ps.sys?.(ctx));
      debug({
        numBlock: responses.length + 1,
        original: block, //firstPhrase(block),
        response, //: firstPhrase(response),
      });
      responses.push(response);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes("maximum context length")
      ) {
        const subCtx = {
          ...ctx,
          [longProp]: block,
          numBlock: "" + responses.length + 1,
          totalBlocks: "" + blocks.length,
        };
        const subMax = countWords(block) / 2;

        const subRes: string[] = await gptBig(
          ps,
          subCtx,
          accResponseProp,
          subMax,
          gptOptions
        );
        responses.push(...subRes);
      } else {
        throw error;
      }
    }
  }
  return responses;
};

const longerProp = (props: promptPropsInput) => {
  const longProp = Object.entries(props).reduce(
    (acc, [k, v]) => {
      const wordCount = countWords(v.toString() || "");
      if (acc.wordCount < wordCount) return { wordCount, k };
      return acc;
    },
    { wordCount: -1, k: "" }
  );
  return longProp.k;
};
