/**
 * @author Wicramachine Sergio
 * Script pour la page de détail d'un article
 */

const articleId = window.location.pathname.split('/').pop();
const loading = document.getElementById('loading');
const articleContent = document.getElementById('article-content');
const articleTitle = document.getElementById('article-title');
const articleAuthor = document.getElementById('article-author');
const articleDate = document.getElementById('article-date');
const articleText = document.getElementById('article-text');
const articleActions = document.getElementById('article-actions');
const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');
const editFormContainer = document.getElementById('edit-form-container');

let currentUserId = null;
let article = null;

// Vérifier si l'utilisateur est connecté
async function checkAuth() {
    try {
        const response = await fetch('/api/users/profile');
        if (response.ok) {
            const user = await response.json();
            currentUserId = user.id;
            return user;
        }
    } catch (error) {
        console.log('Non connecté');
    }
    return null;
}

// Charger l'article
async function loadArticle() {
    try {
        const response = await fetch(`/api/articles/${articleId}`);
        
        if (!response.ok) {
            throw new Error('Article non trouvé');
        }
        
        article = await response.json();
        
        loading.classList.add('hidden');
        articleContent.classList.remove('hidden');
        
        // Afficher l'article
        articleTitle.textContent = article.title;
        articleAuthor.textContent = article.author?.username || 'Anonyme';
        articleDate.textContent = new Date(article.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        articleText.textContent = article.content;
        
        // Vérifier si l'utilisateur peut modifier/supprimer
        const user = await checkAuth();
        if (user && user.id === article.userId) {
            articleActions.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Erreur:', error);
        loading.textContent = 'Article non trouvé ou erreur lors du chargement.';
    }
}

// Afficher le formulaire d'édition
editBtn.addEventListener('click', () => {
    editFormContainer.innerHTML = `
        <div class="edit-form">
            <h3>Modifier l'article</h3>
            <form id="edit-form">
                <input type="text" id="edit-title" value="${escapeHtml(article.title)}" required>
                <textarea id="edit-content" required>${escapeHtml(article.content)}</textarea>
                <button type="submit" class="btn-save">Enregistrer</button>
                <button type="button" id="cancel-edit" class="btn-cancel">Annuler</button>
            </form>
        </div>
    `;
    
    editFormContainer.classList.remove('hidden');
    articleContent.classList.add('hidden');
    
    // Gérer la soumission du formulaire
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateArticle();
    });
    
    // Gérer l'annulation
    document.getElementById('cancel-edit').addEventListener('click', () => {
        editFormContainer.classList.add('hidden');
        articleContent.classList.remove('hidden');
    });
});

// Mettre à jour l'article
async function updateArticle() {
    const title = document.getElementById('edit-title').value;
    const content = document.getElementById('edit-content').value;
    
    try {
        const response = await fetch(`/api/articles/${articleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            alert('Article mis à jour avec succès !');
            window.location.reload();
        } else {
            const data = await response.json();
            alert(data.error || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour');
    }
}

// Supprimer l'article
deleteBtn.addEventListener('click', async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/articles/${articleId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Article supprimé avec succès !');
            window.location.href = '/';
        } else {
            const data = await response.json();
            alert(data.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
});

// Fonction pour échapper les caractères HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialisation
loadArticle();
