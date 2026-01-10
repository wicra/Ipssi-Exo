/**
 * @author Wicramachine Sergio
 * Routes pour la gestion des articles
 */

import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticlesByUserId
} from "../controller/articleController.js";

const router = express.Router();

// Routes publiques
router.get("/", async (req, res) => { await getAllArticles(req, res) });
router.get("/:id", async (req, res) => { await getArticleById(req, res) });
router.get("/user/:userId", async (req, res) => { await getArticlesByUserId(req, res) });

// Routes protégées (nécessitent authentification)
router.post("/", authenticateToken, async (req, res) => { await createArticle(req, res) });
router.put("/:id", authenticateToken, async (req, res) => { await updateArticle(req, res) });
router.delete("/:id", authenticateToken, async (req, res) => { await deleteArticle(req, res) });

export default router;
