/**
 * @author Wicramachine Sergio
 * Script pour la page d'inscription
 */

const form = document.getElementById('register-form');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
        messageDiv.textContent = 'Les mots de passe ne correspondent pas';
        messageDiv.className = 'error';
        return;
    }
    
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageDiv.textContent = 'Inscription réussie ! Redirection vers la page de connexion...';
            messageDiv.className = 'success';
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            messageDiv.textContent = data.error || 'Erreur lors de l\'inscription';
            messageDiv.className = 'error';
        }
    } catch (error) {
        console.error('Erreur:', error);
        messageDiv.textContent = 'Erreur de connexion au serveur';
        messageDiv.className = 'error';
    }
});
