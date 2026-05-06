require('dotenv').config();
const readline = require('readline');

//  ÉTAPE 1 : Initialiser l'historique avec le system prompt 
const messages = [
    { role: 'system', content: 'Tu es un assistant pédagogique. Tu réponds en français de façon claire et concise.' }
];

//  ÉTAPE 2 : Configurer readline 
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//  ÉTAPE 3 : Fonction ask() — retourne une Promise 
function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

//  ÉTAPE 5 : Appeler GROQ avec TOUT l'historique 
async function callGroq() {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages, // tout l'historique est envoyé à chaque appel
            stream: true
        })
    });

    if (!response.ok) {
        console.error('Erreur API GROQ:', response.status, await response.text());
        return null;
    }

    // ÉTAPE 6 : Lire la réponse en streaming
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
                process.stdout.write(content); //  affichage en direct
                fullResponse += content;
            }
            } catch (e) {
            }
        }
        }
    }

    console.log('\n');
    return fullResponse;
}

//  ÉTAPE 7 : BOUCLE PRINCIPALE 
async function main() {
    console.log('Chatbot démarré. Tapez "exit" pour quitter.\n');

    while (true) {
        //  ÉTAPE 4 : Lire la saisie et l'ajouter à l'historique
        const userInput = await ask('Vous : ');

        if (userInput.trim().toLowerCase() === 'exit') {
            console.log('Au revoir !');
            rl.close();
            break;
        }

        messages.push({ role: 'user', content: userInput });

        //  ÉTAPE 5 : Appel API avec tout l'historique
        const reply = await callGroq();

        if (!reply) {
            console.log('Impossible d\'obtenir une réponse. Réessayez.\n');
            // retirer le dernier message user pour ne pas polluer l'historique
            messages.pop();
            continue;
        }

        //  ÉTAPE 6 : Stocker la réponse et afficher
        messages.push({ role: 'assistant', content: reply });
        console.log('\nAssistant :', reply, '\n');
    }
}

main();
