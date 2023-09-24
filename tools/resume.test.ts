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

  it("summarizes and writes the summary to file", async () => {
    (readFile as jest.Mock).mockResolvedValue(sampleFile);
    (addToFileName as jest.Mock).mockImplementation(
      jest.requireActual("../utils/file-utils").addToFileName
    );
    mockFetchGptOk(`Tabla de contenido:
    SECCIÓN 1
    SECCIÓN 2`);
    mockFetchGptOk("summary2");
    mockFetchGptOk("summary1");
    const writeFileSync = jest.fn();
    jest.spyOn(fs, "writeFileSync").mockImplementation(writeFileSync);

    const result = await resume.execute(
      "http://example.com/very-interesting-article"
    );

    expect(writeFileSync).toHaveBeenLastCalledWith(
      "./httpexamplecomveryinterestingarticle-RESUMEN.txt",
      "SECCIÓN 1\n\nsummary1\n\nSECCIÓN 2\n\nsummary2"
    );
    const expectation = `ÉXITO: se ha almacenado el archivo ./httpexamplecomveryinterestingarticle-RESUMEN.txt. El contenido es: SECCIÓN 1\n\nsummary1\n\nSECCIÓN 2\n\nsummary2`;
    expect(result).toEqual(expectation);
  });
});

const sampleFile = `
SECCIÓN 1
Esto es un párrafo

SECCIÓN 2
Esto es otro párrafo`;
