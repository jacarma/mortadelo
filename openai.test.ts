import { gptBig } from "./openai";
import {
  expectFetch,
  expectFetchBodyMatches,
  mockFetchGptFail,
  mockFetchGptOk,
  testPrompt,
} from "./utils/test-utils";

describe("openai", () => {
  describe("gptBig", () => {
    const props = {
      context: `esto es
          un contexto`,
      question: "que tal",
    };

    it("returns an array of responses", async () => {
      mockFetchGptOk("response");

      const responses = await gptBig(testPrompt, props);

      expect(responses).toEqual(["response"]);
    });

    it("calls gpt several times", async () => {
      mockFetchGptOk("response1");
      mockFetchGptOk("response2");

      const responses = await gptBig(testPrompt, props, undefined, 2);

      expectFetch().toHaveBeenCalledTimes(2);
      expect(responses).toEqual(["response1", "response2"]);
    });

    it("retries on 'maximum context length' error", async () => {
      mockFetchGptFail("maximum context length");
      mockFetchGptOk("response2");
      mockFetchGptOk("response3");

      const responses = await gptBig(testPrompt, props);

      expectFetch().toHaveBeenCalledTimes(3);
      expect(responses).toEqual(["response2", "response3"]);
    });

    it("accumulates the responses", async () => {
      mockFetchGptOk("response1");
      mockFetchGptOk("response2");

      const responses = await gptBig(testPrompt, props, "prevAnswer", 2);

      expectFetch().toHaveBeenCalledTimes(2);
      expectFetchBodyMatches(
        /context: esto es\\n, question: que tal, numBlock: 1, totalBlocks: 2, prevAnswer: ,/
      );
      expectFetchBodyMatches(
        /un contexto\\n, question: que tal, numBlock: 2, totalBlocks: 2, prevAnswer: response1/
      );
      expect(responses).toEqual(["response1", "response2"]);
    });
  });
});
