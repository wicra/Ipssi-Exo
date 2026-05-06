require('dotenv').config();
const readline = require('readline');
const { Pinecone } = require('@pinecone-database/pinecone');

// ÉTAPE 1 : Initialiser l'historique avec le system prompt RAG
const messages = [
    {
        role: 'system',
        content: `Tu es un assistant RH spécialisé dans le recrutement de développeurs IA.
Tu réponds UNIQUEMENT en te basant sur les documents fournis dans le contexte.
Si l'information n'est pas dans le contexte, réponds exactement : "Je ne trouve pas cette information dans les documents fournis."
Cite toujours le fichier source entre crochets, par exemple : [Source : faq_rh.txt]`
    }
];

// ÉTAPE 2 : Configurer readline (identique à chatbot.js)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// ÉTAPE 3 : Obtenir l'embedding d'une requête via Mistral
async function getEmbedding(text) {
    const response = await fetch('https://api.mistral.ai/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'mistral-embed',
            input: [text]
        })
    });

    if (!response.ok) {
        throw new Error(`Erreur Mistral API (${response.status}) : ${await response.text()}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
}

// ÉTAPE 4 : Récupérer le contexte pertinent depuis Pinecone
async function retrieveContext(query) {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX_NAME || 'recrutement-ia';
    const index = pc.index(indexName);

    const queryEmbedding = await getEmbedding(query);

    const results = await index.query({
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true
    });

    return results.matches.map(match => ({
        source: match.metadata.source,
        text: match.metadata.text,
        score: match.score
    }));
}

// ÉTAPE 5 : Appeler GROQ avec le contexte + tout l'historique (streaming)
async function generateCompletion(userInput, context) {
    // Construire le bloc de contexte à injecter
    const contextText = context
        .map(c => `[Source : ${c.source}]\n${c.text}`)
        .join('\n\n---\n\n');

    // Ajouter le contexte à la question de l'utilisateur
    const messagesWithContext = [
        ...messages,
        {
            role: 'user',
            content: `Contexte des documents :\n\n${contextText}\n\n---\n\nQuestion : ${userInput}`
        }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: messagesWithContext, // tout l'historique + contexte RAG
            stream: true,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        console.error('Erreur API GROQ :', response.status, await response.text());
        return null;
    }

    // ÉTAPE 6 : Lire la réponse en streaming (identique à chatbot.js)
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';

    process.stdout.write('\nAssistant : ');

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.replace('data: ', '').trim();

                if (data === '[DONE]') break;

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;

                    if (content) {
                        process.stdout.write(content); // affichage en direct
                        fullResponse += content;
                    }
                } catch (e) {
                    // Ignorer les lignes malformées
                }
            }
        }
    }

    console.log('\n');
    return fullResponse;
}

// ÉTAPE 7 : BOUCLE PRINCIPALE RAG
async function main() {
    console.log('Chatbot RAG — Assistant Recrutement Développeur IA');
    console.log('Tapez "exit" pour quitter.\n');

    while (true) {
        const userInput = await ask('Vous : ');

        if (userInput.trim().toLowerCase() === 'exit') {
            console.log('Au revoir !');
            rl.close();
            break;
        }

        console.log('\nRecherche dans les documents...');

        try {
            // Récupérer le contexte pertinent
            const context = await retrieveContext(userInput);

            // Appeler le LLM avec le contexte
            const reply = await generateCompletion(userInput, context);

            if (!reply) {
                console.log('Impossible d\'obtenir une réponse. Réessayez.\n');
                continue;
            }

            // Stocker dans l'historique (sans le contexte RAG pour ne pas surcharger)
            messages.push({ role: 'user', content: userInput });
            messages.push({ role: 'assistant', content: reply });

        } catch (error) {
            console.error('Erreur :', error.message, '\n');
        }
    }
}

main();
