// const google = require('googlethis');
import google from "googlethis";
import { answerQuestion, investigate } from "./lee-y-extrae";
import { parseArguments } from "../utils/text-utils";
import { logError } from "../utils/logs";

const NO_LO_SE = "NO LO SÉ.";
const URL_REGEX = /https?:\/\/[^\s]+/g;
const options = {
  page: 0,
  safe: false, // Safe Search
  parse_ads: false, // If set to true sponsored results will be parsed
  additional_params: {
    // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
    hl: "es",
  },
};

const googleSearch = async (q: string, ignoreFeatured = false) =>
  await google.search(q, options).then((res) => {
    const featured =
      res.knowledge_panel.description || res.featured_snippet.description;
    if (!ignoreFeatured && featured) return featured;
    return res.results
      .map(
        ({ title, description, url }) => ` ${title}\n ${description}\n ${url}`
      )
      .join("\n\n");
  });

const research = async (queries: string[]) => {
  let answer = NO_LO_SE;
  let qIndex = 0;
  const alreadyUsed: string[] = [];

  while (answer === NO_LO_SE && qIndex < queries.length) {
    const query = queries[qIndex];
    // console.log({ query });
    const searchResponse = await googleSearch(query);
    // console.log({ searchResponse });
    let urls = searchResponse.match(URL_REGEX);
    if (!urls || urls.length <= 1) {
      const prompt = `Google, ante la query "${query}" ha devuelto el siguiente texto.\n${searchResponse}`;
      answer = await answerQuestion(query, prompt);
      // console.log({ prompt, answer });
      if (answer === NO_LO_SE || answer.includes("NADA")) {
        const searchAgain = await googleSearch(query, true);
        // console.log({ searchAgain });
        urls = searchAgain.match(URL_REGEX);
      }
    }
    if (answer === NO_LO_SE && !urls)
      throw new Error("No se han encontrado resultados en Google.");

    while (answer === NO_LO_SE && urls!.length > 0) {
      const url = urls!.shift();
      console.log("\x1b[90m- " + url + "\x1b[0m");
      if (!url || alreadyUsed.includes(url)) continue;
      alreadyUsed.push(url);

      try {
        answer = await investigate(url, query);
        // console.log({ url, query, answer });

        // answer = await answerQuestion(query, content, url);
        if (answer.includes("NO LO SE") || answer.includes("NADA"))
          answer = NO_LO_SE;
      } catch (e) {
        logError(e);
      }
    }
  }
  return answer;
};

export default {
  name: "search",
  description:
    "un motor de búsqueda (google). Útil para buscar información que no poseas ya. " +
    "Requiere una query. Queries may be in english except when they are about subjects that are only relevant in spanish. " +
    "Cuando ya conoces un archivo o url donde se encuentra la información que buscas, es mejor usar lee-y-extrae.",
  execute: async (input: string) => {
    try {
      const queries = parseArguments(input);

      return await research(queries);
    } catch (e) {
      if (e instanceof Error) {
        logError(e);
        return `ERROR: ${e.message}. Tal vez puedas hacer una búsqueda más genérica?`;
      }
    }
  },
};
