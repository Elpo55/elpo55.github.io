const GITHUB_CLIENT_ID = 'your_github_client_id';
const GITHUB_REDIRECT_URI = 'http://localhost:3000/callback';

export class AuthManager {
    constructor() {
        this.user = null;
        this.checkAuthStatus();
        this.setupElements();
        this.setupEventListeners();
        this.currentTab = 'login';
    }

    checkAuthStatus() {
        const token = localStorage.getItem('github_token');
        if (token) {
            this.fetchUserData(token);
        }
    }

    async login() {
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=user`;
        window.location.href = authUrl;
    }

    async handleCallback(code) {
        try {
            const response = await fetch('/api/auth/github/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code })
            });
            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('github_token', data.access_token);
                await this.fetchUserData(data.access_token);
                return true;
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return false;
        }
    }

    async fetchUserData(token) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            this.user = await response.json();
            return this.user;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    logout() {
        localStorage.removeItem('github_token');
        this.user = null;
        window.location.href = '/';
    }

    isAuthenticated() {
        return !!localStorage.getItem('github_token');
    }

    setupElements() {
        // Tabs
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        
        // Social auth buttons
        this.githubBtn = document.querySelector('.social-btn.github');
        this.googleBtn = document.querySelector('.social-btn.google');
    }

    setupEventListeners() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        // Social auth
        this.githubBtn.addEventListener('click', () => this.handleGithubAuth());
        this.googleBtn.addEventListener('click', () => this.handleGoogleAuth());
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update active tab button
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Show/hide appropriate form
        this.loginForm.style.display = tab === 'login' ? 'flex' : 'none';
        this.registerForm.style.display = tab === 'register' ? 'flex' : 'none';
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // Ici, vous intégrerez votre logique d'authentification
            const user = await this.signInWithEmailPassword(email, password);
            if (user) {
                this.redirectToChat();
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showError("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            // Ici, vous intégrerez votre logique d'inscription
            const user = await this.createUserWithEmailPassword(email, password, username);
            if (user) {
                this.showSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
                this.switchTab('login');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleGithubAuth() {
        try {
            // Intégrez ici l'authentification GitHub
            const user = await this.signInWithGithub();
            if (user) {
                this.redirectToChat();
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleGoogleAuth() {
        try {
            // Intégrez ici l'authentification Google
            const user = await this.signInWithGoogle();
            if (user) {
                this.redirectToChat();
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Méthodes d'authentification à implémenter avec votre backend
    async signInWithEmailPassword(email, password) {
        // Implémentez l'authentification par email/password
        return null;
    }

    async createUserWithEmailPassword(email, password, username) {
        // Implémentez la création de compte
        return null;
    }

    async signInWithGithub() {
        // Implémentez l'authentification GitHub
        return null;
    }

    async signInWithGoogle() {
        // Implémentez l'authentification Google
        return null;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const activeForm = this.currentTab === 'login' ? this.loginForm : this.registerForm;
        const existingError = activeForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        activeForm.insertBefore(errorDiv, activeForm.firstChild);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const activeForm = this.currentTab === 'login' ? this.loginForm : this.registerForm;
        const existingSuccess = activeForm.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        activeForm.insertBefore(successDiv, activeForm.firstChild);
    }

    redirectToChat() {
        window.location.href = 'ai-chat.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

export { AuthManager };