/**
 * @author Wicramachine Sergio
 * Script pour la page de connexion
 */

const form = document.getElementById('login-form');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageDiv.textContent = 'Connexion réussie ! Redirection...';
            messageDiv.className = 'success';
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            messageDiv.textContent = data.error || 'Erreur lors de la connexion';
            messageDiv.className = 'error';
        }
    } catch (error) {
        console.error('Erreur:', error);
        messageDiv.textContent = 'Erreur de connexion au serveur';
        messageDiv.className = 'error';
    }
});
