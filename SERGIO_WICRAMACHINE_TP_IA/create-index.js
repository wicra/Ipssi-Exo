require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function createIndex() {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX_NAME;

    // Vérifier si l'index existe déjà
    const existing = await pc.listIndexes();
    const existingNames = existing.indexes?.map(i => i.name) || [];

    if (existingNames.includes(indexName)) {
        console.log(`L'index "${indexName}" existe déjà.`);
        return;
    }

    // Créer l'index avec les dimensions de mistral-embed (1024)
    await pc.createIndex({
        name: indexName,
        dimension: 384,
        metric: 'cosine',
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1'
            }
        }
    });

    console.log(`✓ Index "${indexName}" créé avec succès !`);
    console.log('  Dimension : 384');
    console.log('  Métrique  : cosine');
    console.log('  Spécification : serverless sur AWS us-east-1');
}

createIndex().catch(err => {
    console.error('Erreur lors de la création de l\'index :', err.message);
    process.exit(1);
});
