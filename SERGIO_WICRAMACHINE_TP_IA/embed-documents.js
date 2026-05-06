require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');

// ÉTAPE 1 : Découper le texte en chunks avec chevauchement
function chunkText(text, chunkSize = 500, overlap = 50) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end).trim());
        start += chunkSize - overlap;
    }
    return chunks.filter(c => c.length > 0);
}

// ÉTAPE 2 : Obtenir l'embedding via l'API Mistral
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
        const error = await response.text();
        throw new Error(`Erreur Mistral API (${response.status}) : ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
}

// ÉTAPE 3 : Charger, chunker, vectoriser et stocker dans Pinecone
async function embedDocuments() {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX_NAME || 'recrutement-ia';
    const index = pc.index(indexName);

    const documentsDir = path.join(__dirname, 'documents');
    const files = fs.readdirSync(documentsDir).filter(f => f.endsWith('.txt'));

    if (files.length === 0) {
        console.error('Aucun fichier .txt trouvé dans le dossier documents/');
        process.exit(1);
    }

    console.log(`${files.length} document(s) trouvé(s) : ${files.join(', ')}\n`);

    for (const file of files) {
        const filePath = path.join(documentsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const chunks = chunkText(content);

        console.log(`Traitement de "${file}" — ${chunks.length} chunk(s)...`);

        const vectors = [];

        for (let i = 0; i < chunks.length; i++) {
            const embedding = await getEmbedding(chunks[i]);
            vectors.push({
                id: `${file}-chunk-${i}`,
                values: embedding,
                metadata: {
                    source: file,
                    text: chunks[i]
                }
            });
            console.log(`  Chunk ${i + 1}/${chunks.length} vectorisé`);
        }

        // Upsert par lot dans Pinecone
        await index.upsert(vectors);
        console.log(`  ✓ ${vectors.length} vecteurs indexés dans Pinecone\n`);
    }

    console.log('✓ Tous les documents ont été indexés avec succès !');
}

embedDocuments().catch(err => {
    console.error('Erreur lors de l\'indexation :', err.message);
    process.exit(1);
});
