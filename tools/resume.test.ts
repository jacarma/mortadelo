import resume from "./resume";
import { addToFileName, readFile } from "../utils/file-utils";
import { mockFetchGptOk } from "../utils/test-utils";
import fs from "fs";
import { MAX_WORDS } from "../openai";

describe("resume", () => {
  it("has name, description and execute", () => {
    expect(resume.name).toBeTruthy();
    expect(resume.description).toBeTruthy();
    expect(resume.execute).toBeTruthy();
  });

  it.only("summarizes and writes the summary to file", async () => {
    (readFile as jest.Mock).mockResolvedValue("word\n".repeat(MAX_WORDS + 1));
    (addToFileName as jest.Mock).mockImplementation(
      jest.requireActual("../utils/file-utils").addToFileName
    );
    mockFetchGptOk("summary1");
    mockFetchGptOk("summary2");
    const writeFileSync = jest.fn();
    jest.spyOn(fs, "writeFileSync").mockImplementation(writeFileSync);

    const result = await resume.execute(
      "http://example.com/very-interesting-article"
    );

    expect(writeFileSync).toHaveBeenCalledWith(
      "./httpexamplecomveryinterestingarticle-RESUMEN.txt",
      "summary1\n\nsummary2"
    );
    const expectation = `ÉXITO: se ha almacenado el archivo ./httpexamplecomveryinterestingarticle-RESUMEN.txt. El contenido es: summary1\n\nsummary2`;
    expect(result).toEqual(expectation);
  });
});
