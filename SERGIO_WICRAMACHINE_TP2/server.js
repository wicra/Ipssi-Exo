/**
 * @author Wicramachine Sergio
 * Serveur Express pour l'application de blog
 */

import express from "express";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import users from "./routes/user.js";
import articles from "./routes/article.js";
import logger from "./middlewares/logger.js";
import { connectDatabase } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger);

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'login.html'));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'register.html'));
});

app.get("/article/:id", (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'article.html'));
});

app.get("/backoffice", (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'backoffice.html'));
});

// Routes API
app.use("/api/users", users);
app.use("/api/articles", articles);

// Démarrage du serveur
app.listen(PORT, async () => {
    await connectDatabase();
    console.log(`Blog API listening on http://localhost:${PORT}`);
    console.log(`By Wicramachine Sergio`);
});

