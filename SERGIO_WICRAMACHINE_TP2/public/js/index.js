/**
 * @author Wicramachine Sergio
 * Script pour la page d'accueil - Catalogue des articles
 */

const articlesContainer = document.getElementById('articles-container');
const loading = document.getElementById('loading');
const usernameDisplay = document.getElementById('username-display');
const loginLink = document.getElementById('login-link');
const registerLink = document.getElementById('register-link');
const logoutBtn = document.getElementById('logout-btn');
const backofficeLink = document.getElementById('backoffice-link');

// Vérifier si l'utilisateur est connecté
async function checkAuth() {
    try {
        const response = await fetch('/api/users/profile');
        if (response.ok) {
            const user = await response.json();
            // Utilisateur connecté
            usernameDisplay.textContent = `Bonjour, ${user.username}`;
            usernameDisplay.classList.remove('hidden');
            backofficeLink.classList.remove('hidden');
            loginLink.classList.add('hidden');
            registerLink.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
        }
    } catch (error) {
        // Utilisateur non connecté
        console.log('Non connecté');
    }
}

// Déconnexion
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/users/logout', { method: 'POST' });
        window.location.reload();
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
});

// Charger tous les articles
async function loadArticles() {
    try {
        const response = await fetch('/api/articles');
        const articles = await response.json();
        
        loading.classList.add('hidden');
        
        if (articles.length === 0) {
            articlesContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Aucun article disponible.</p>';
            return;
        }
        
        articlesContainer.innerHTML = articles.map(article => {
            const date = new Date(article.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const preview = article.content.length > 150 
                ? article.content.substring(0, 150) + '...'
                : article.content;
            
            return `
                <div class="article-card">
                    <h2>${escapeHtml(article.title)}</h2>
                    <div class="meta">
                        Par ${escapeHtml(article.author?.username || 'Anonyme')} • ${date}
                    </div>
                    <div class="content">${escapeHtml(preview)}</div>
                    <a href="/article/${article.id}">Lire la suite</a>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Erreur lors du chargement des articles:', error);
        loading.textContent = 'Erreur lors du chargement des articles.';
    }
}

// Fonction pour échapper les caractères HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialisation
checkAuth();
loadArticles();
