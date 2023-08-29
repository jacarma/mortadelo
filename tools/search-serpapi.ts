import { logError } from "../utils/logs";

// use serpapi to answer the question
const serpapiSearch = async (question: string) =>
  await fetch(
    `https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${question}`
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.error) {
        logError(res.error);
        return "ERROR: " + res.error;
      }
      return (
        res.answer_box?.answer ||
        res.answer_box?.snippet ||
        res.organic_results?.[0]?.snippet
      );
    })
    .then((answer) => answer.replace(/\n/g, " "));

export default {
  name: "search-serpapi",
  description:
    "un motor de búsqueda. útil para cuando se necesita, respuestas cortas y sencillas sobre la actualidad. la entrada debe ser una consulta de búsqueda.",
  execute: serpapiSearch,
  disabled: !process.env.SERPAPI_API_KEY,
};
