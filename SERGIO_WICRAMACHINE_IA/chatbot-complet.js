require("dotenv").config();
const readline = require("readline");

// Récupération du provider choisi en argument de ligne de commande.
const providerName = process.argv[2];

if (!providerName) {
  console.error("Usage : node chatbot-complet.js mistral|groq|huggingface");
  process.exit(1);
}

// Configuration des 3 providers demandés.
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

const provider = PROVIDERS[providerName.toLowerCase()];

if (!provider) {
  console.error(
    `Provider inconnu : "${providerName}". Choisissez parmi : mistral, groq, huggingface.`
  );
  process.exit(1);
}

if (!provider.apiKey) {
  const envKey = `${providerName.toUpperCase()}_API_KEY`;
  console.error(`Erreur : ${envKey} manquant dans le fichier .env`);
  process.exit(1);
}

// Historique: on met un message système au début.
const messages = [
  {
    role: "system",
    content:
      "Tu es un assistant pédagogique. Tu réponds en français de façon claire et concise.",
  },
];

// Petite fonction utilitaire pour extraire le texte du token renvoyé.
function extractToken(json) {
  if (json && json.choices && json.choices[0] && json.choices[0].delta) {
    return json.choices[0].delta.content || "";
  }

  if (json && json.choices && json.choices[0] && json.choices[0].message) {
    return json.choices[0].message.content || "";
  }

  return "";
}

// Appel API avec stream:true + affichage en direct.
async function streamAssistantResponse() {
  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} : ${errorText}`);
  }

  if (!response.body) {
    throw new Error("Le provider n'a pas retourné de flux de streaming.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let fullReply = "";

  process.stdout.write("Assistant : ");

  // On lit le flux morceau par morceau.
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const json = JSON.parse(payload);
        const token = extractToken(json);

        if (token) {
          process.stdout.write(token);
          fullReply += token;
        }
      } catch (_err) {
        // Certaines lignes du stream peuvent être incomplètes.
      }
    }
  }

  process.stdout.write("\n\n");
  return fullReply.trim() || "(pas de réponse)";
}

// Readline pour lire les questions dans le terminal.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`\nChatbot demarre avec le provider : ${providerName}`);
console.log('    Tapez votre message et appuyez sur Entrée. ("exit" pour quitter)\n');

function prompt() {
  rl.question("Vous : ", async (userInput) => {
    const trimmed = userInput.trim();

    if (!trimmed) {
      prompt();
      return;
    }

    if (trimmed.toLowerCase() === "exit") {
      console.log("Au revoir !");
      rl.close();
      return;
    }

    // On ajoute la question dans l'historique.
    messages.push({ role: "user", content: trimmed });

    try {
      const reply = await streamAssistantResponse();
      // On garde la réponse pour la mémoire des prochains tours.
      messages.push({ role: "assistant", content: reply });
    } catch (err) {
      console.error(`\nErreur : ${err.message}\n`);
    }

    prompt();
  });
}

prompt();
