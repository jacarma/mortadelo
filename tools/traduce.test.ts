import fs from "fs";
import { MAX_WORDS } from "../openai";
import { addToFileName, readFile } from "../utils/file-utils";
import { mockFetchGptOk } from "../utils/test-utils";
import traduce from "./traduce";

describe("traduce", () => {
  it("has name, description and execute", () => {
    expect(traduce.name).toBeTruthy();
    expect(traduce.description).toBeTruthy();
    expect(traduce.execute).toBeTruthy();
  });

  it("translates and writes the translation to file", async () => {
    (readFile as jest.Mock).mockResolvedValue("word\n".repeat(MAX_WORDS + 1));
    (addToFileName as jest.Mock).mockImplementation(
      jest.requireActual("../utils/file-utils").addToFileName
    );
    mockFetchGptOk("translation for page 1");
    mockFetchGptOk("translation for page 2");
    const writeFileSync = jest.fn();
    jest.spyOn(fs, "writeFileSync").mockImplementation(writeFileSync);

    const result = await traduce.execute(
      "español, http://example.com/very-interesting-article"
    );

    expect(writeFileSync).toHaveBeenCalledWith(
      "./httpexamplecomveryinterestingarticle-español.txt",
      "translation for page 1\n\ntranslation for page 2"
    );
    const expectation = `ÉXITO: Archivo traducido guardado en ./httpexamplecomveryinterestingarticle-español.txt`;
    expect(result).toEqual(expectation);

    expect(writeFileSync).toHaveBeenCalledWith(
      "./httpexamplecomveryinterestingarticle-español.txt",
      "translation for page 1\n\ntranslation for page 2"
    );
  });
});
