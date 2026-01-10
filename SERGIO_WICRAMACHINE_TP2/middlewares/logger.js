/**
 * @author Wicramachine Sergio
 * Middleware de logging pour tracer toutes les requêtes
 */

/**
 * Logger middleware - Log toutes les requêtes au format demandé
 * Format: ${Date} - ${method} ${path de la requête}
 */
const logger = (req, res, next) => {
    const date = new Date().toISOString();
    const method = req.method;
    const path = req.originalUrl || req.url;
    
    console.log(`${date} - ${method} ${path}`);
    
    next();
};

export default logger;
