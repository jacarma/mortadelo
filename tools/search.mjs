// use serpapi to answer the question
const googleSearch = async (question) =>
  await fetch(
    `https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${question}`
  )
    .then((res) => res.json())
    .then(
      (res) =>
        // try to pull the answer from various components of the response
        res.answer_box?.answer ||
        res.answer_box?.snippet ||
        res.organic_results?.[0]?.snippet
    )
    .then((answer) => answer.replace(/\n/g, " "));

export default {
  name: "search",
  description:
    "un motor de búsqueda. útil para cuando se necesita responder a preguntas sobre la actualidad. la entrada debe ser una consulta de búsqueda.",
  execute: googleSearch,
};
