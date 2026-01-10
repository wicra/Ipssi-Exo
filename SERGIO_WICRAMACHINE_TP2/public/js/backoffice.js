/**
 * @author Wicramachine Sergio
 * Script pour le back-office de gestion des articles
 */

const logoutBtn = document.getElementById('logout-btn');
const articleForm = document.getElementById('article-form');
const articlesBody = document.getElementById('articles-body');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const messageContainer = document.getElementById('message-container');

let currentUserId = null;
let editingArticleId = null;

// Vérifier l'authentification
async function checkAuth() {
    try {
        const response = await fetch('/api/users/profile');
        if (!response.ok) {
            window.location.href = '/login';
            return null;
        }
        const user = await response.json();
        currentUserId = user.id;
        return user;
    } catch (error) {
        window.location.href = '/login';
        return null;
    }
}

// Afficher un message
function showMessage(message, type = 'success') {
    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 5000);
}

// Déconnexion
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/users/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Erreur:', error);
    }
});

// Charger les articles de l'utilisateur
async function loadMyArticles() {
    try {
        const response = await fetch(`/api/articles/user/${currentUserId}`);
        const articles = await response.json();
        
        if (articles.length === 0) {
            articlesBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Aucun article pour le moment.</td></tr>';
            return;
        }
        
        articlesBody.innerHTML = articles.map(article => {
            const date = new Date(article.createdAt).toLocaleDateString('fr-FR');
            return `
                <tr>
                    <td>${article.id}</td>
                    <td>${escapeHtml(article.title)}</td>
                    <td>${date}</td>
                    <td class="actions">
                        <button class="btn-edit" onclick="editArticle(${article.id})">Modifier</button>
                        <button class="btn-delete" onclick="deleteArticle(${article.id})">Supprimer</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Erreur:', error);
        articlesBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erreur lors du chargement des articles.</td></tr>';
    }
}

// Soumettre le formulaire (créer ou mettre à jour)
articleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    try {
        let response;
        
        if (editingArticleId) {
            // Mise à jour
            response = await fetch(`/api/articles/${editingArticleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            });
        } else {
            // Création
            response = await fetch('/api/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(editingArticleId ? 'Article mis à jour avec succès !' : 'Article créé avec succès !');
            articleForm.reset();
            resetForm();
            loadMyArticles();
        } else {
            showMessage(data.error || 'Erreur lors de l\'opération', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    }
});

// Modifier un article
window.editArticle = async function(id) {
    try {
        const response = await fetch(`/api/articles/${id}`);
        const article = await response.json();
        
        if (response.ok) {
            editingArticleId = id;
            document.getElementById('title').value = article.title;
            document.getElementById('content').value = article.content;
            formTitle.textContent = 'Modifier l\'article';
            submitBtn.textContent = 'Mettre à jour';
            cancelBtn.classList.remove('hidden');
            
            // Scroll vers le formulaire
            articleForm.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur lors du chargement de l\'article', 'error');
    }
}

// Supprimer un article
window.deleteArticle = async function(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/articles/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Article supprimé avec succès !');
            loadMyArticles();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur lors de la suppression', 'error');
    }
}

// Réinitialiser le formulaire
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    editingArticleId = null;
    articleForm.reset();
    formTitle.textContent = 'Créer un nouvel article';
    submitBtn.textContent = 'Créer l\'article';
    cancelBtn.classList.add('hidden');
}

// Fonction pour échapper les caractères HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialisation
(async () => {
    await checkAuth();
    loadMyArticles();
})();
