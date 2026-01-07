// MODELE DE POST - LECTURE / ECRITURE FICHIER JSON
const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, '../Data/postData.json');

// FONCTIONS LECTURE FICHIER  
async function readAll(){
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
}

// FONCTIONS ECRITURE FICHIER
async function writeAll(data){
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readAll, writeAll };