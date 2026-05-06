require("dotenv").config();

// Récupération du provider et de la question de test éventuelle.
const providerName = (process.argv[2] || "mistral").toLowerCase();
const userQuestion = process.argv.slice(3).join(" ") || "Combien fait 15 x 8 + 32 ?";

const PROVIDERS = {
  mistral: {
    url: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY,
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama3-8b-8192",
    apiKey: process.env.GROQ_API_KEY,
  },
  huggingface: {
    url: "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1/v1/chat/completions",
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  },
};

const provider = PROVIDERS[providerName];

if (!provider) {
  console.error("Provider inconnu. Utilisez : mistral | groq | huggingface");
  process.exit(1);
}

if (!provider.apiKey) {
  console.error(`Clé API manquante pour le provider ${providerName}. Vérifiez le fichier .env.`);
  process.exit(1);
}

// définition de l'outil en JSON Schema.
const tools = [
  {
    type: "function",
    function: {
      name: "calculate",
      description: "Effectue un calcul mathematique a partir d'une expression.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Expression mathematique a evaluer (ex: 15 * 8 + 32)",
          },
        },
        required: ["expression"],
      },
    },
  },
];

function calculate(expression) {
  return eval(expression);
}

async function callModel(messages, extra = {}) {
  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      ...extra,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} : ${errorText}`);
  }

  return response.json();
}

async function main() {
  const messages = [
    {
      role: "system",
      content:
        "Tu es un assistant en francais. Utilise l'outil calculate quand un calcul est necessaire.",
    },
    {
      role: "user",
      content: userQuestion,
    },
  ];

  // 1er appel avec tools.
  const firstResponse = await callModel(messages, { tools, tool_choice: "auto" });
  const firstChoice = firstResponse.choices && firstResponse.choices[0];

  if (!firstChoice || !firstChoice.message) {
    throw new Error("Reponse invalide du modele (pas de message). ");
  }

  const assistantMessage = firstChoice.message;
  messages.push(assistantMessage);

  //  détection du tool_call dans la réponse.
  const finishReason = firstChoice.finish_reason;
  const toolCalls = assistantMessage.tool_calls || [];

  if (finishReason === "tool_calls" && toolCalls.length > 0) {
    //  exécuter l'outil et renvoyer le résultat.
    for (const toolCall of toolCalls) {
      if (!toolCall.function || toolCall.function.name !== "calculate") continue;

      const args = JSON.parse(toolCall.function.arguments || "{}");
      const expression = args.expression;

      let result;
      try {
        result = String(calculate(expression));
      } catch (err) {
        result = `Erreur de calcul: ${err.message}`;
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });

      console.log(`Outil appele: calculate(${expression}) => ${result}`);
    }

    // 2e appel avec historique complet + résultat outil.
    const secondResponse = await callModel(messages);
    const finalMessage =
      secondResponse.choices &&
      secondResponse.choices[0] &&
      secondResponse.choices[0].message &&
      secondResponse.choices[0].message.content;

    console.log("\nReponse finale du modele:");
    console.log(finalMessage || "(pas de contenu)");
  } else {
    const directContent = assistantMessage.content || "(pas de contenu)";
    console.log("\nLe modele n'a pas appele l'outil.");
    console.log("Reponse directe:");
    console.log(directContent);
  }

  console.log("\nQuestion de reflexion:");
  console.log(
    "Si la question ne necessite pas de calcul, le modele peut repondre directement sans appeler l'outil."
  );
}

main().catch((err) => {
  console.error(`Erreur: ${err.message}`);
  process.exit(1);
});
