class ChatApp {
    constructor() {
        this.conversations = new Map();
        this.currentConversationId = null;
        this.setupElements();
        this.setupEventListeners();
        this.loadConversations();
    }

    setupElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.userInput = document.getElementById('userInput');
        this.chatForm = document.getElementById('chatForm');
        this.newChatBtn = document.querySelector('.new-chat');
        this.clearChatsBtn = document.querySelector('.clear-chats');
        this.conversationsContainer = document.querySelector('.conversations');
    }

    setupEventListeners() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
        this.clearChatsBtn.addEventListener('click', () => this.clearAllChats());

        // Auto-resize textarea
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 200) + 'px';
        });

        // Example prompts
        document.querySelectorAll('.example-box[data-prompt]').forEach(box => {
            box.addEventListener('click', () => {
                const prompt = box.dataset.prompt;
                this.userInput.value = prompt;
                this.handleSubmit(new Event('submit'));
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const message = this.userInput.value.trim();
        if (!message) return;

        if (!this.currentConversationId) {
            this.createNewChat();
        }

        this.hideWelcomeScreen();
        this.addMessage(message, true);
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        const typingIndicator = this.addTypingIndicator();
        
        try {
            const response = await this.getAIResponse(message);
            typingIndicator.remove();
            this.addMessage(response, false);
            this.saveCurrentConversation();
        } catch (error) {
            console.error('Error:', error);
            typingIndicator.remove();
            this.addMessage("Désolé, une erreur s'est produite. Veuillez réessayer.", false);
        }
    }

    addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user' : 'assistant');
        
        // Format code blocks
        content = this.formatMessage(content);
        
        messageDiv.innerHTML = content;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(content) {
        // Convert line breaks to <br>
        content = content.replace(/\n/g, '<br>');
        
        // Format code blocks
        content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            return `<pre><code class="${language || ''}">${this.escapeHtml(code.trim())}</code></pre>`;
        });
        
        return content;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.classList.add('message', 'assistant', 'typing');
        indicatorDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        this.chatMessages.appendChild(indicatorDiv);
        this.scrollToBottom();
        return indicatorDiv;
    }

    async getAIResponse(message) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Placeholder response - Replace with actual API call
        return "Je suis une simulation de réponse. Dans une version réelle, cette réponse viendrait d'une API d'IA comme GPT-3.5 ou une autre API similaire.";
    }

    createNewChat() {
        this.currentConversationId = Date.now().toString();
        this.conversations.set(this.currentConversationId, []);
        this.chatMessages.innerHTML = '';
        this.hideWelcomeScreen();
        this.updateConversationsList();
    }

    hideWelcomeScreen() {
        this.welcomeScreen.style.display = 'none';
    }

    loadConversations() {
        const saved = localStorage.getItem('conversations');
        if (saved) {
            this.conversations = new Map(JSON.parse(saved));
            this.updateConversationsList();
        }
    }

    saveCurrentConversation() {
        if (!this.currentConversationId) return;

        const messages = Array.from(this.chatMessages.children).map(msg => ({
            content: msg.innerHTML,
            isUser: msg.classList.contains('user')
        }));

        this.conversations.set(this.currentConversationId, messages);
        localStorage.setItem('conversations', JSON.stringify([...this.conversations]));
        this.updateConversationsList();
    }

    updateConversationsList() {
        this.conversationsContainer.innerHTML = '';
        for (const [id, messages] of this.conversations) {
            const conv = document.createElement('div');
            conv.classList.add('conversation-item');
            if (id === this.currentConversationId) {
                conv.classList.add('active');
            }
            conv.textContent = messages[0]?.content?.slice(0, 30) || 'Nouvelle conversation';
            conv.addEventListener('click', () => this.loadConversation(id));
            this.conversationsContainer.appendChild(conv);
        }
    }

    loadConversation(id) {
        this.currentConversationId = id;
        this.chatMessages.innerHTML = '';
        const messages = this.conversations.get(id);
        messages.forEach(msg => this.addMessage(msg.content, msg.isUser));
        this.hideWelcomeScreen();
        this.updateConversationsList();
    }

    clearAllChats() {
        if (confirm('Voulez-vous vraiment effacer toutes les conversations ?')) {
            this.conversations.clear();
            this.currentConversationId = null;
            this.chatMessages.innerHTML = '';
            this.welcomeScreen.style.display = 'block';
            localStorage.removeItem('conversations');
            this.updateConversationsList();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});