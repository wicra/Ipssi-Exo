/**
 * @author Wicramachine Sergio
 * Contrôleur pour gérer les utilisateurs et l'authentification
 */

import db from "../models/index.cjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_super_securise";
const SALT_ROUNDS = 10;

/**
 * Récupérer tous les utilisateurs
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await db.User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
};

/**
 * Récupérer un utilisateur par son ID
 */
const getUserById = async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "ID invalide" });
    }

    try {
        const user = await db.User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
};

/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res) => {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await db.User.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({ error: "Cet email ou nom d'utilisateur existe déjà" });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Créer l'utilisateur
        const newUser = await db.User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
    }
};

/**
 * Connexion d'un utilisateur
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    try {
        // Trouver l'utilisateur
        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Stocker le token dans un cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 heures
        });

        res.json({
            message: "Connexion réussie",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: "Erreur lors de la connexion" });
    }
};

/**
 * Déconnexion d'un utilisateur
 */
const logout = async (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Déconnexion réussie" });
};

/**
 * Obtenir le profil de l'utilisateur connecté
 */
const getProfile = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.userId, {
            attributes: { exclude: ['password'] },
            include: [{
                model: db.Article,
                as: 'articles'
            }]
        });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: "Erreur lors de la récupération du profil" });
    }
};

/**
 * Mettre à jour un utilisateur
 */
const updateUser = async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "ID invalide" });
    }

    // Vérifier que l'utilisateur ne peut modifier que son propre profil
    if (req.userId !== id) {
        return res.status(403).json({ error: "Non autorisé" });
    }

    const { username, email, password } = req.body;

    try {
        const user = await db.User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        await user.update(updateData);

        res.json({
            message: "Utilisateur mis à jour",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};

/**
 * Supprimer un utilisateur
 */
const deleteUser = async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "ID invalide" });
    }

    // Vérifier que l'utilisateur ne peut supprimer que son propre compte
    if (req.userId !== id) {
        return res.status(403).json({ error: "Non autorisé" });
    }

    try {
        const user = await db.User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        await user.destroy();
        res.clearCookie('token');
        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};

export {
    getAllUsers,
    getUserById,
    register,
    login,
    logout,
    getProfile,
    updateUser,
    deleteUser
};