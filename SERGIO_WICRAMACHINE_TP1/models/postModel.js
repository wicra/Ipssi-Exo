// MODELE DE POST - LECTURE / ECRITURE FICHIER JSON
import fs from 'fs/promises';
import path from 'path';

const fs = require('fs').promises;
const path = './Data/postData.json';

// FONCTIONS LECTURE FICHIER  
async function readAll(){
  const raw = await fs.readFile(path, 'utf8');
  return JSON.parse(raw);
}

// FONCTIONS ECRITURE FICHIER
async function writeAll(data){
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}

module.exports = { readAll, writeAll };