import investiga from "./lee-y-extrae";
import { readFile } from "../utils/file-utils";
import { gptBig } from "../openai";

jest.mock("../openai", () => ({
  gptBig: jest.fn(),
}));

describe("lee", () => {
  it("has name, description and execute", () => {
    expect(investiga.name).toBeTruthy();
    expect(investiga.description).toBeTruthy();
    expect(investiga.execute).toBeTruthy();
  });

  describe("execute", () => {
    it("accepts a file path and a question", async () => {
      (readFile as jest.Mock).mockResolvedValue("file content");
      (gptBig as jest.Mock).mockResolvedValueOnce(["response1"]);

      const result = await investiga.execute(
        "http://example.com/very-interesting-article, what's AI?"
      );

      expect(readFile).toHaveBeenCalledWith(
        "http://example.com/very-interesting-article"
      );
      expect(gptBig).toHaveBeenCalledTimes(1);
      expect(gptBig).toHaveBeenCalledWith(
        expect.any(Function),
        {
          context: "file content",
          question: "what's AI?",
        },
        "prevAnswer"
      );

      expect(result).toEqual("response1");
    });
  });
});
