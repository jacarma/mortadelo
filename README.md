# Mortadelo 👓 El agente IA español

Un agente de inteligencia artificial (IA) es un sistema que puede percibir su entorno a través de sensores, procesar esa información y luego realizar acciones para alcanzar objetivos específicos.
Esto se basa en una comprensión del entorno y una toma de decisiones correspondiente, y puede incluir la capacidad de aprender de la experiencia.

Mortadelo es una aplicación que utiliza GPT-3.5 y algunos plugins para tener conversaciones y responder preguntas. Puede buscar en Google, usar la calculadora y mostrar su proceso de razonamiento.
Mortadelo piensa y habla en la lengua de Cervantes.

He aquí un ejemplo:

```
Cómo puedo ayudarte? Cual es el temario de cuarto curso de primaria en Valencia?

No conozco el temario de cuarto curso de primaria en Valencia, por lo que necesitaré buscar esa información en Internet.
Acción: search
Entrada de la acción: "temario cuarto curso primaria Valencia"
search(temario cuarto curso primaria Valencia"): Áreas · Servicio de Ordenación Académica · Organismos · Portales · Normativa - Ed. Secundaria · Distribución de las horas lectivas semanales de la ESO.

Pensamiento: El resultado de la búsqueda no fue satisfactorio, necesito buscar nuevamente.
Acción: search
Entrada de la acción: "temario cuarto curso primaria Valencia distribución de las horas lectivas semanales"
search(temario cuarto curso primaria Valencia distribución de las horas lectivas semanales"): Distribución de las horas lectivas · Programa de diversificación curricular · Organización y funcionamiento de centros · Evaluación, promoción y titulación ...

Pensamiento: Aunque esta información se refiere a la ESO, puedo inferir que el temario de cuarto curso de primaria en Valencia incluirá asignaturas similares. Sin embargo, todavía necesito más detalles sobre las materias específicas.
Acción: search
Entrada de la acción: "materias cuarto curso primaria Valencia"
search(materias cuarto curso primaria Valencia"): Decreto 108/2014, de 4 de julio, del Consell, por el que establece el currículo y desarrolla la ordenación general de la educación primaria en la Comunitat ...

Pensamiento: El decreto mencionado podría contener la información que necesito sobre las materias de cuarto curso de primaria en Valencia.
Acción: search
Entrada de la acción: "Decreto 108/2014 materias cuarto curso primaria Valencia"
search(Decreto 108/2014 materias cuarto curso primaria Valencia"): DECRETO 108/2014, de 4 de julio, del Consell, por el que ... la educación primaria en la Comunitat Valenciana. [2014/6347]. Preàmbul.

Respuesta final: Según el Decreto 108/2014 del Consell de la Comunitat Valenciana, el temario de cuarto curso de primaria en Valencia incluye las siguientes materias:

- Matemáticas
- Valenciano
- Lengua castellana
- Ciencias Naturales
- Ciencias Sociales
- Educación Física
- Religión o Valores Sociales y Cívicos
- Música
- Plástica y Visual
- Inglés
```

## Cómo Ejecutar

Clonar e instalar las dependencias

```
% git clone git@github.com:jacarma/mortadelo.git
% cd mortadelo
% npm install
```

Necesitarás tener las claves [OpenAI](https://openai.com/blog/openai-api) y [SerpApi](https://serpapi.com/). Estas pueden ser suministradas a la aplicación a través de un archivo `.env` como el siguiente:

```
OPENAI_API_KEY="..."
SERPAPI_API_KEY="..."
```

Ejecutar Mortadelo:

```
% node index.mjs
Como puedo ayudarte?
```

Este proyecto es un fork de [langchain-mini](https://github.com/ColinEberhardt/langchain-mini) una [reimplementación básica de Langchain en 100 líneas de código](https://blog.scottlogic.com/2023/05/04/langchain-mini.html)
