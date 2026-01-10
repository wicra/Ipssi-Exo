/**
 * @author Wicramachine Sergio
 * Contrôleur pour gérer les articles du blog
 */

import db from "../models/index.cjs";

/**
 * Récupérer tous les articles avec les informations de l'auteur
 */
const getAllArticles = async (req, res) => {
    try {
        const articles = await db.Article.findAll({
            include: [{
                model: db.User,
                as: 'author',
                attributes: ['id', 'username', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: "Erreur lors de la récupération des articles" });
    }
};

/**
 * Récupérer un article par son ID
 */
const getArticleById = async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "ID invalide" });
    }

    try {
        const article = await db.Article.findByPk(id, {
            include: [{
                model: db.User,
                as: 'author',
                attributes: ['id', 'username', 'email']
            }]
        });

        if (!article) {
            return res.status(404).json({ error: "Article non trouvé" });
        }

        res.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: "Erreur lors de la récupération de l'article" });
    }
};

/**
 * Créer un nouvel article (nécessite authentification)
 */
const createArticle = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.userId; // Fourni par le middleware d'authentification

    // Validation
    if (!title || !content) {
        return res.status(400).json({ error: "Le titre et le contenu sont requis" });
    }

    try {
        const newArticle = await db.Article.create({
            title,
            content,
            userId
        });

        // Récupérer l'article avec les infos de l'auteur
        const articleWithAuthor = await db.Article.findByPk(newArticle.id, {
            include: [{
                model: db.User,
                as: 'author',
                attributes: ['id', 'username', 'email']
            }]
        });

        res.status(201).json(articleWithAuthor);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: "Erreur lors de la création de l'article" });
    }
};

/**
 * Mettre à jour un article (nécessite authentification et être l'auteur)
 */
const updateArticle = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, content } = req.body;
    const userId = req.userId;

    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "ID invalide" });
    }

    if (!title && !content) {
        return res.status(400).json({ error: "Aucune modification fournie" });
    }

    try {
        // Vérifier que l'article existe et appartient à l'utilisateur
        const article = await db.Article.findByPk(id);

        if (!article) {
            return res.status(404).json({ error: "Article non trouvé" });
        }

        if (article.userId !== userId) {
            return res.status(403).json({ error: "Non autorisé à modifier cet article" });
        }

        // Mettre à jour l'article
        const updateData = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;

        await article.update(updateData);

        // Récupérer l'article mis à jour avec les infos de l'auteur
        const updatedArticle = await db.Article.findByPk(id, {
            include: [{
                model: db.User,
                as: 'author',
                attributes: ['id', 'username', 'email']
            }]
        });

        res.json(updatedArticle);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'article" });
    }
};

/**
 * Supprimer un article (nécessite authentification et être l'auteur)
 */
const deleteArticle = async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;

    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "ID invalide" });
    }

    try {
        // Vérifier que l'article existe et appartient à l'utilisateur
        const article = await db.Article.findByPk(id);

        if (!article) {
            return res.status(404).json({ error: "Article non trouvé" });
        }

        if (article.userId !== userId) {
            return res.status(403).json({ error: "Non autorisé à supprimer cet article" });
        }

        await article.destroy();
        res.json({ message: "Article supprimé avec succès" });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: "Erreur lors de la suppression de l'article" });
    }
};

/**
 * Récupérer les articles d'un utilisateur spécifique
 */
const getArticlesByUserId = async (req, res) => {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || userId < 1) {
        return res.status(400).json({ error: "ID utilisateur invalide" });
    }

    try {
        const articles = await db.Article.findAll({
            where: { userId },
            include: [{
                model: db.User,
                as: 'author',
                attributes: ['id', 'username', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(articles);
    } catch (error) {
        console.error('Error fetching user articles:', error);
        res.status(500).json({ error: "Erreur lors de la récupération des articles" });
    }
};

export {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticlesByUserId
};
