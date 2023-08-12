import { Parser } from "expr-eval";

export default {
  name: "calculator",
  description:
    "Útil para obtener el resultado de una expresión matemática. La entrada a esta herramienta debe ser una expresión matemática válida que pueda ser ejecutada por una calculadora simple.",
  execute: (input) => {
    try {
      return Parser.evaluate(input).toString();
    } catch (e) {
      return "ERROR";
    }
  },
};
