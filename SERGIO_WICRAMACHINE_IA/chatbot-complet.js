require("dotenv").config();
const https = require("https");
const http = require("http");
const readline = require("readline");

// ─── Étape 1 : Récupérer le provider ────────────────────────────────────────
const provider = process.argv[2];

if (!provider) {
  console.error(
    "Usage : node chatbot-complet.js <provider>\n" +
      "Providers disponibles : openai, ollama"
  );
  process.exit(1);
}

// ─── Étape 2 : Configuration par provider ───────────────────────────────────
const PROVIDERS = {
  openai: {
    host: "api.openai.com",
    port: 443,
    path: "/v1/chat/completions",
    protocol: https,
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    apiKey: process.env.OPENAI_API_KEY,
    buildHeaders(body) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Length": Buffer.byteLength(body),
      };
    },
    buildBody(messages) {
      return JSON.stringify({ model: this.model, messages });
    },
    extractReply(parsed) {
      return parsed.choices?.[0]?.message?.content?.trim() ?? "(pas de réponse)";
    },
  },
  ollama: {
    host: process.env.OLLAMA_HOST || "localhost",
    port: parseInt(process.env.OLLAMA_PORT || "11434", 10),
    path: "/api/chat",
    protocol: http,
    model: process.env.OLLAMA_MODEL || "llama3",
    buildHeaders(body) {
      return {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      };
    },
    buildBody(messages) {
      return JSON.stringify({ model: this.model, messages, stream: false });
    },
    extractReply(parsed) {
      return parsed.message?.content?.trim() ?? "(pas de réponse)";
    },
  },
};

const config = PROVIDERS[provider.toLowerCase()];

if (!config) {
  console.error(
    `Provider inconnu : "${provider}". Choisissez parmi : ${Object.keys(PROVIDERS).join(", ")}`
  );
  process.exit(1);
}

if (provider.toLowerCase() === "openai" && !config.apiKey) {
  console.error("Erreur : OPENAI_API_KEY manquant dans le fichier .env");
  process.exit(1);
}

// ─── Étape 3 : Fonction d'envoi de la requête ────────────────────────────────
function sendMessage(messages) {
  return new Promise((resolve, reject) => {
    const body = config.buildBody(messages);
    const headers = config.buildHeaders(body);

    const options = {
      hostname: config.host,
      port: config.port,
      path: config.path,
      method: "POST",
      headers,
    };

    const req = config.protocol.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
          } else {
            resolve(config.extractReply(parsed));
          }
        } catch (e) {
          reject(new Error(`Réponse non-JSON : ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Étape 4 : Boucle de conversation ────────────────────────────────────────
const conversationHistory = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`\n🤖  Chatbot démarré avec le provider : ${provider}`);
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

    conversationHistory.push({ role: "user", content: trimmed });

    try {
      const reply = await sendMessage(conversationHistory);
      conversationHistory.push({ role: "assistant", content: reply });
      console.log(`\nAssistant : ${reply}\n`);
    } catch (err) {
      console.error(`\nErreur : ${err.message}\n`);
    }

    prompt();
  });
}

prompt();
