import { readPdf } from "./file-utils";
import { splitIntoSections } from "./text-utils";

describe("text-utils", () => {
  it("splitIntoSections", async () => {
    const sections = splitIntoSections(text1);
    expect(sections).toContain(
      "4 Potentes Métodos de Resumen de Textos Largos con Ejemplos Reales"
    );
    expect(sections).toContain(
      "Diferencia entre la síntesis de textos largos y cortos"
    );
    expect(sections).toContain("TITULO ARTIFICIAL EN MAYÚSCULAS");
  });
});

const text1 = `
4 Potentes Métodos de Resumen de Textos Largos con Ejemplos Reales

La síntesis de texto es un proceso de procesamiento del lenguaje natural (PLN) que se centra en reducir la cantidad de texto de una entrada dada al tiempo que se preserva la información clave y el significado contextual. Con la cantidad de tiempo y recursos necesarios para la síntesis manual, no es sorprendente que la síntesis automática con PLN haya crecido en diferentes casos de uso y para diferentes longitudes de documentos. El espacio de la síntesis ha crecido rápidamente con un nuevo enfoque en el manejo de entradas de texto extremadamente largas para resumirlas en unas pocas líneas. La creciente demanda de síntesis de documentos más largos, como artículos de noticias y trabajos de investigación, ha impulsado el crecimiento en este espacio.

Los cambios clave que han llevado al nuevo impulso en la síntesis de texto largo son la introducción de modelos de transformador como BERT y GPT-3, que pueden manejar secuencias de texto de entrada mucho más largas en una sola ejecución, y una nueva comprensión de los algoritmos de fragmentación. Las arquitecturas pasadas, como las LSTMs o las RNN, no eran tan eficientes ni precisas como estos modelos basados en transformadores, lo que dificultaba mucho la síntesis de documentos largos. El aumento en la comprensión de cómo construir y utilizar algoritmos de fragmentación que mantengan la estructura de la información contextual y reduzcan la variabilidad de los datos en tiempo de ejecución también ha sido clave.

Diferencia entre la síntesis de textos largos y cortos
TITULO ARTIFICIAL EN MAYÚSCULAS
Empacar toda la información contextual de un documento en un breve resumen es mucho más difícil con textos largos. Si nuestro resumen tiene que ser, por ejemplo, de máximo 5 oraciones, es mucho más difícil decidir qué información es lo suficientemente valiosa para agregarse con 500 palabras en comparación con 50,000 palabras.
`;
