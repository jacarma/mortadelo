# Mortadelo 👓 El agente IA español

Un agente de inteligencia artificial (IA) es un sistema que puede percibir su entorno a través de sensores, procesar esa información y luego realizar acciones para alcanzar objetivos específicos.
Esto se basa en una comprensión del entorno y una toma de decisiones correspondiente, y puede incluir la capacidad de aprender de la experiencia.

Mortadelo es una aplicación que utiliza GPT-3.5 y algunos plugins para tener conversaciones y responder preguntas. Puede buscar en Google, usar la calculadora y mostrar su proceso de razonamiento.
Mortadelo piensa y habla en la lengua de Cervantes.

He aquí un ejemplo:

```
Quién fue el primer ser humano en pisar la luna?
Neil Armstrong fue el primer ser humano en pisar la luna en julio de 1969.

quien viajaba con él?
Edwin F. Aldrin fue el segundo astronauta en acompañar a Neil Armstrong a la luna durante la misión Apolo 11.

alguno más?
La tripulación de la misión Apolo 11 consistió en Neil Armstrong, Buzz Aldrin, Michael Collins y el entonces presidente de los Estados Unidos, Richard Nixon.

seguro que nixon viajó a la luna?
No, Richard Nixon no viajó a la luna durante la misión Apolo 11.
```

_Muy muy listo todavía no es :D_

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
