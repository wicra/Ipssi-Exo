/**
 * @author Wicramachine Sergio
 * Middleware d'authentification JWT
 */

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_super_securise";

/**
 * Middleware pour vérifier l'authentification via JWT stocké dans un cookie
 */
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Authentification requise" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expiré, veuillez vous reconnecter" });
        }
        return res.status(403).json({ error: "Token invalide" });
    }
};

/**
 * Middleware optionnel pour vérifier l'authentification sans bloquer
 */
const optionalAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
        } catch (error) {
            // Continue sans authentification
        }
    }
    next();
};

export { authenticateToken, optionalAuth };
