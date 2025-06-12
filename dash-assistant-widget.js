(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        API_URL: window.DASH_ASSISTANT_API_URL || 'http://dash-api-prod.us-east-1.elasticbeanstalk.com',
        THEME: window.DASH_ASSISTANT_THEME || 'light',
        REMEMBER_DEALER: window.DASH_REMEMBER_DEALER !== false // Default true
    };

    // CSS styles for the widget
    const styles = `
        .dash-assistant-modal {
            display: none;
            position: fixed;
            z-index: 999999;
            right: 20px;
            bottom: 20px;
            width: 400px;
            height: 600px;
            max-width: 90vw;
            max-height: 80vh;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
            animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .dash-assistant-header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: move;
        }

        .dash-assistant-title {
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .dash-assistant-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
        }

        .dash-assistant-close:hover {
            background: rgba(255,255,255,0.2);
        }

        .dash-assistant-messages {
            height: calc(100% - 140px);
            overflow-y: auto;
            padding: 20px;
            background: #f8f9fa;
        }

        .dash-message {
            margin-bottom: 16px;
            display: flex;
            gap: 10px;
            animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .dash-message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            flex-shrink: 0;
        }

        .dash-message.user .dash-message-avatar {
            background: #e3f2fd;
            color: #1976d2;
        }

        .dash-message.assistant .dash-message-avatar {
            background: #1e3c72;
            color: white;
        }

        .dash-message-content {
            background: white;
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 80%;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .dash-message.user .dash-message-content {
            background: #e3f2fd;
            margin-left: auto;
        }

        .dash-message.assistant .dash-message-content {
            background: white;
        }

        .dash-assistant-input-container {
            padding: 16px;
            background: white;
            border-top: 1px solid #e0e0e0;
        }

        .dash-assistant-input-wrapper {
            display: flex;
            gap: 8px;
        }

        .dash-assistant-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #e0e0e0;
            border-radius: 24px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }

        .dash-assistant-input:focus {
            border-color: #1976d2;
        }

        .dash-assistant-send {
            background: #1e3c72;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
        }

        .dash-assistant-send:hover {
            background: #2a5298;
        }

        .dash-assistant-send:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .dash-wand-icon {
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: #1e3c72;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.2s;
            position: relative;
        }

        .dash-wand-icon:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .dash-wand-icon::before {
            content: "✨";
            font-size: 24px;
        }

        .dash-assistant-typing {
            display: none;
            padding: 16px 20px;
            color: #666;
            font-size: 14px;
            font-style: italic;
        }

        .dash-assistant-typing.show {
            display: block;
        }

        .dash-assistant-status {
            display: none;
            padding: 8px 16px;
            background: #fff3cd;
            color: #856404;
            font-size: 13px;
            text-align: center;
        }

        .dash-assistant-status.error {
            background: #f8d7da;
            color: #721c24;
        }

        .dash-assistant-status.show {
            display: block;
        }

        .dash-dealer-input-screen {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: calc(100% - 60px);
            padding: 40px;
            text-align: center;
        }

        .dash-dealer-input-icon {
            font-size: 64px;
            margin-bottom: 24px;
        }

        .dash-dealer-input-title {
            font-size: 24px;
            font-weight: 600;
            color: #1e3c72;
            margin-bottom: 12px;
        }

        .dash-dealer-input-subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 32px;
        }

        .dash-dealer-input-form {
            width: 100%;
            max-width: 300px;
        }

        .dash-dealer-input-field {
            width: 100%;
            padding: 12px 16px;
            font-size: 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 16px;
            text-align: center;
            transition: border-color 0.2s;
        }

        .dash-dealer-input-field:focus {
            outline: none;
            border-color: #1e3c72;
        }

        .dash-dealer-input-button {
            width: 100%;
            padding: 12px 24px;
            background: #1e3c72;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }

        .dash-dealer-input-button:hover {
            background: #2a5298;
        }

        .dash-dealer-input-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .dash-dealer-input-remember {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            color: #666;
        }

        .dash-dealer-input-remember input {
            cursor: pointer;
        }

        .dash-dealer-change-link {
            position: absolute;
            top: 16px;
            right: 60px;
            font-size: 14px;
            color: #1976d2;
            cursor: pointer;
            text-decoration: none;
        }

        .dash-dealer-change-link:hover {
            text-decoration: underline;
        }

        .dash-chat-interface {
            display: none;
            height: 100%;
            flex-direction: column;
        }

        .dash-chat-interface.active {
            display: flex;
        }

        .dash-dealer-info {
            background: #e8f0fe;
            padding: 8px 16px;
            font-size: 13px;
            color: #1967d2;
            text-align: center;
            border-bottom: 1px solid #dadce0;
        }

        @media (max-width: 480px) {
            .dash-assistant-modal {
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                border-radius: 0;
            }
            
            .dash-dealer-input-screen {
                padding: 20px;
            }
        }
    `;

    // Widget HTML template
    const modalHTML = `
        <div class="dash-assistant-modal" id="dashAssistantModal">
            <div class="dash-assistant-header" id="dashAssistantHeader">
                <div class="dash-assistant-title">
                    <span>🚗</span>
                    <span>Dash AI Assistant</span>
                </div>
                <a class="dash-dealer-change-link" id="dashDealerChangeLink" style="display: none;">Change Dealer</a>
                <button class="dash-assistant-close" id="dashAssistantClose">&times;</button>
            </div>
            
            <!-- Dealer ID Input Screen -->
            <div class="dash-dealer-input-screen" id="dashDealerInputScreen">
                <div class="dash-dealer-input-icon">🏢</div>
                <div class="dash-dealer-input-title">Welcome to Dash Assistant</div>
                <div class="dash-dealer-input-subtitle">Please enter your Dealer ID to continue</div>
                <form class="dash-dealer-input-form" id="dashDealerForm">
                    <input 
                        type="text" 
                        class="dash-dealer-input-field" 
                        id="dashDealerIdInput" 
                        placeholder="Enter Dealer ID"
                        required
                        autocomplete="off"
                    >
                    <div class="dash-dealer-input-remember">
                        <input type="checkbox" id="dashRememberDealer" checked>
                        <label for="dashRememberDealer">Remember my Dealer ID</label>
                    </div>
                    <button type="submit" class="dash-dealer-input-button" id="dashDealerSubmit">
                        Start Chat
                    </button>
                </form>
            </div>
            
            <!-- Chat Interface -->
            <div class="dash-chat-interface" id="dashChatInterface">
                <div class="dash-dealer-info" id="dashDealerInfo">
                    Dealer ID: <strong id="dashCurrentDealerId">-</strong>
                </div>
                <div class="dash-assistant-status" id="dashAssistantStatus"></div>
                <div class="dash-assistant-messages" id="dashAssistantMessages">
                    <div class="dash-message assistant">
                        <div class="dash-message-avatar">AI</div>
                        <div class="dash-message-content">
                            Hello! I'm your Dash AI Assistant. I can help you with:
                            <ul style="margin: 8px 0; padding-left: 20px;">
                                <li>Booking services</li>
                                <li>Customer management</li>
                                <li>Parts inventory</li>
                                <li>Workshop scheduling</li>
                            </ul>
                            How can I help you today?
                        </div>
                    </div>
                </div>
                <div class="dash-assistant-typing" id="dashAssistantTyping">
                    Assistant is typing...
                </div>
                <div class="dash-assistant-input-container">
                    <div class="dash-assistant-input-wrapper">
                        <input 
                            type="text" 
                            class="dash-assistant-input" 
                            id="dashAssistantInput" 
                            placeholder="Type your message..."
                            autocomplete="off"
                        >
                        <button class="dash-assistant-send" id="dashAssistantSend">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Widget class
    class DashAssistantWidget {
        constructor() {
            this.sessionId = null;
            this.dealerId = null;
            this.isOpen = false;
            this.isDragging = false;
            this.dragOffset = { x: 0, y: 0 };
            this.position = { x: null, y: null };
            
            this.init();
        }

        init() {
            // Inject styles
            this.injectStyles();
            
            // Create modal
            this.createModal();
            
            // Attach to all dash-wand-icon elements
            this.attachToIcons();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load saved dealer ID if remember is enabled
            if (CONFIG.REMEMBER_DEALER) {
                this.dealerId = localStorage.getItem('dashDealerId');
            }
        }

        injectStyles() {
            const styleElement = document.createElement('style');
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }

        createModal() {
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer.firstElementChild);
            
            // Cache DOM elements
            this.modal = document.getElementById('dashAssistantModal');
            this.messages = document.getElementById('dashAssistantMessages');
            this.input = document.getElementById('dashAssistantInput');
            this.sendButton = document.getElementById('dashAssistantSend');
            this.closeButton = document.getElementById('dashAssistantClose');
            this.header = document.getElementById('dashAssistantHeader');
            this.typing = document.getElementById('dashAssistantTyping');
            this.status = document.getElementById('dashAssistantStatus');
            
            // New elements for dealer ID flow
            this.dealerInputScreen = document.getElementById('dashDealerInputScreen');
            this.chatInterface = document.getElementById('dashChatInterface');
            this.dealerForm = document.getElementById('dashDealerForm');
            this.dealerIdInput = document.getElementById('dashDealerIdInput');
            this.rememberCheckbox = document.getElementById('dashRememberDealer');
            this.dealerChangeLink = document.getElementById('dashDealerChangeLink');
            this.currentDealerIdSpan = document.getElementById('dashCurrentDealerId');
        }

        attachToIcons() {
            const icons = document.querySelectorAll('.dash-wand-icon');
            icons.forEach(icon => {
                // Add default icon if empty
                if (!icon.innerHTML.trim()) {
                    icon.innerHTML = '✨';
                }
                
                icon.addEventListener('click', () => this.open());
            });
        }

        setupEventListeners() {
            // Close button
            this.closeButton.addEventListener('click', () => this.close());
            
            // Dealer form submission
            this.dealerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitDealerId();
            });
            
            // Change dealer link
            this.dealerChangeLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDealerInput();
            });
            
            // Send message
            this.sendButton.addEventListener('click', () => this.sendMessage());
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Dragging
            this.header.addEventListener('mousedown', (e) => this.startDrag(e));
            document.addEventListener('mousemove', (e) => this.drag(e));
            document.addEventListener('mouseup', () => this.endDrag());
            
            // Touch support for dragging
            this.header.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
            document.addEventListener('touchmove', (e) => {
                if (this.isDragging) {
                    e.preventDefault();
                    this.drag(e.touches[0]);
                }
            });
            document.addEventListener('touchend', () => this.endDrag());
        }

        async checkAPIHealth() {
            try {
                const response = await fetch(`${CONFIG.API_URL}/health`);
                const data = await response.json();
                
                if (data.status !== 'healthy') {
                    console.warn('Dash Assistant API health check failed:', data);
                    this.showStatus('API service is experiencing issues', 'error');
                }
            } catch (error) {
                console.error('Failed to connect to Dash Assistant API:', error);
                this.showStatus('Unable to connect to assistant service', 'error');
            }
        }

        open() {
            this.modal.style.display = 'block';
            this.isOpen = true;
            
            // Show appropriate screen
            if (this.dealerId) {
                this.showChatInterface();
            } else {
                this.showDealerInput();
            }
            
            // Restore position if it was moved
            if (this.position.x !== null && this.position.y !== null) {
                this.modal.style.right = 'auto';
                this.modal.style.bottom = 'auto';
                this.modal.style.left = this.position.x + 'px';
                this.modal.style.top = this.position.y + 'px';
            }
        }

        showDealerInput() {
            this.dealerInputScreen.style.display = 'flex';
            this.chatInterface.classList.remove('active');
            this.dealerChangeLink.style.display = 'none';
            this.dealerIdInput.value = this.dealerId || '';
            this.dealerIdInput.focus();
        }

        showChatInterface() {
            this.dealerInputScreen.style.display = 'none';
            this.chatInterface.classList.add('active');
            this.dealerChangeLink.style.display = 'block';
            this.currentDealerIdSpan.textContent = this.dealerId;
            this.input.focus();
            
            // Check API health when showing chat
            this.checkAPIHealth();
        }

        async submitDealerId() {
            const dealerId = this.dealerIdInput.value.trim();
            if (!dealerId) {
                this.dealerIdInput.focus();
                return;
            }
            
            // Disable form while processing
            this.dealerIdInput.disabled = true;
            this.dealerForm.querySelector('button').disabled = true;
            
            try {
                // Test the dealer ID by making a health check
                const response = await fetch(`${CONFIG.API_URL}/health`);
                if (!response.ok) {
                    throw new Error('API not available');
                }
                
                // Set dealer ID
                this.dealerId = dealerId;
                
                // Save if remember is checked
                if (CONFIG.REMEMBER_DEALER && this.rememberCheckbox.checked) {
                    localStorage.setItem('dashDealerId', dealerId);
                } else {
                    localStorage.removeItem('dashDealerId');
                }
                
                // Clear any existing session when dealer changes
                this.sessionId = null;
                
                // Clear chat messages except the welcome message
                const messages = this.messages.querySelectorAll('.dash-message');
                messages.forEach((msg, index) => {
                    if (index > 0) msg.remove();
                });
                
                // Show chat interface
                this.showChatInterface();
                
            } catch (error) {
                console.error('Error validating dealer ID:', error);
                this.showStatus('Unable to connect to service. Please try again.', 'error');
            } finally {
                // Re-enable form
                this.dealerIdInput.disabled = false;
                this.dealerForm.querySelector('button').disabled = false;
            }
        }

        close() {
            this.modal.style.display = 'none';
            this.isOpen = false;
        }

        // Public method to set dealer ID programmatically
        setDealerId(dealerId) {
            if (dealerId) {
                this.dealerId = dealerId;
                if (CONFIG.REMEMBER_DEALER) {
                    localStorage.setItem('dashDealerId', dealerId);
                }
                if (this.isOpen) {
                    this.showChatInterface();
                }
            }
        }

        // Public method to clear dealer ID and session
        clearDealer() {
            this.dealerId = null;
            this.sessionId = null;
            localStorage.removeItem('dashDealerId');
            if (this.isOpen) {
                this.showDealerInput();
            }
        }

        startDrag(e) {
            this.isDragging = true;
            const rect = this.modal.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            this.modal.style.cursor = 'move';
        }

        drag(e) {
            if (!this.isDragging) return;
            
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            
            // Keep within viewport
            const maxX = window.innerWidth - this.modal.offsetWidth;
            const maxY = window.innerHeight - this.modal.offsetHeight;
            
            this.position.x = Math.max(0, Math.min(x, maxX));
            this.position.y = Math.max(0, Math.min(y, maxY));
            
            this.modal.style.right = 'auto';
            this.modal.style.bottom = 'auto';
            this.modal.style.left = this.position.x + 'px';
            this.modal.style.top = this.position.y + 'px';
        }

        endDrag() {
            this.isDragging = false;
            this.modal.style.cursor = 'default';
        }

        addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `dash-message ${isUser ? 'user' : 'assistant'}`;
            
            messageDiv.innerHTML = `
                <div class="dash-message-avatar">${isUser ? 'You' : 'AI'}</div>
                <div class="dash-message-content">${this.escapeHtml(content)}</div>
            `;
            
            this.messages.appendChild(messageDiv);
            this.messages.scrollTop = this.messages.scrollHeight;
        }

        async sendMessage() {
            const message = this.input.value.trim();
            if (!message || !this.dealerId) return;
            
            // Add user message
            this.addMessage(message, true);
            this.input.value = '';
            
            // Disable input while processing
            this.input.disabled = true;
            this.sendButton.disabled = true;
            this.typing.classList.add('show');
            
            try {
                const response = await fetch(`${CONFIG.API_URL}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        session_id: this.sessionId,
                        dealer_id: this.dealerId
                    })
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    this.sessionId = data.session_id;
                    this.addMessage(data.response);
                } else {
                    throw new Error(data.error || 'Failed to get response');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                this.addMessage('Sorry, I encountered an error. Please try again.');
                this.showStatus('Connection error. Please check your internet connection.', 'error');
            } finally {
                this.input.disabled = false;
                this.sendButton.disabled = false;
                this.typing.classList.remove('show');
                this.input.focus();
            }
        }

        showStatus(message, type = 'info') {
            this.status.textContent = message;
            this.status.className = `dash-assistant-status show ${type}`;
            setTimeout(() => {
                this.status.classList.remove('show');
            }, 5000);
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.dashAssistant = new DashAssistantWidget();
        });
    } else {
        window.dashAssistant = new DashAssistantWidget();
    }
})();