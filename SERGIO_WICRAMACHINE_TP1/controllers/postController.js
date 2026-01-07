// CONTROLEUR POSTS - LOGIQUE CRUD
const { readAll, writeAll } = require('../models/postModel');

// RECUPERER TOUS LES POSTS
async function getAll(req, res) {
    try {
        const posts = await readAll();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture des posts' });
    }
}

// RECUPERER UN POST PAR ID
async function getById(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const postData = await readAll();
        const postRequest = postData.find(p => p.id === id);
        
        if (postRequest) {
            res.json(postRequest);
        } else {
            res.status(404).json({ error: 'Post non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture du post' });
    }
}

// CREER
async function create(req, res) {
    try {
        const postData = await readAll();
        const newId = postData.length > 0 ? Math.max(...postData.map(p => p.id)) + 1 : 1;
        
        const newPost = {
            id: newId,
            ...req.body
        };
        
        postData.push(newPost);
        await writeAll(postData);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du post' });
    }
}

// MAJ
async function update(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const postData = await readAll();
        const index = postData.findIndex(p => p.id === id);
        
        if (index !== -1) {
            postData[index] = {
                ...postData[index],
                ...req.body,
                id: id
            };
            await writeAll(postData);
            res.json(postData[index]);
        } else {
            res.status(404).json({ error: 'Post non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la modification du post' });
    }
}

// SUPPRESSION
async function remove(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        const postData = await readAll();
        const index = postData.findIndex(p => p.id === id);
        
        if (index !== -1) {
            postData.splice(index, 1);
            await writeAll(postData);
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Post non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression du post' });
    }
}

module.exports = { 
    getAll,
    getById,
    create,
    update,
    remove
};