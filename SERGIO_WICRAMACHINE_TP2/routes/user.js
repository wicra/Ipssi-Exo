/**
 * @author Wicramachine Sergio
 * Routes pour la gestion des utilisateurs et l'authentification
 */

import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import {
    getAllUsers,
    getUserById,
    register,
    login,
    logout,
    getProfile,
    updateUser,
    deleteUser
} from "../controller/userController.js";

const router = express.Router();

// Routes publiques
router.post("/register", async (req, res) => { await register(req, res) });
router.post("/login", async (req, res) => { await login(req, res) });
router.post("/logout", async (req, res) => { await logout(req, res) });

// Routes protégées
router.get("/profile", authenticateToken, async (req, res) => { await getProfile(req, res) });
router.get("/", async (req, res) => { await getAllUsers(req, res) });
router.get("/:id", async (req, res) => { await getUserById(req, res) });
router.put("/:id", authenticateToken, async (req, res) => { await updateUser(req, res) });
router.delete("/:id", authenticateToken, async (req, res) => { await deleteUser(req, res) });

export default router;