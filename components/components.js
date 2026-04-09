(function () {
    console.log('[GetMEDS] Global Component Loader v3 active');

    function executeScripts(container) {
        const scripts = Array.from(container.querySelectorAll('script'));
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
        });
    }

    function loadComponent(placeholderId, componentPath) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            return;
        }

        const rootPath = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + componentPath;
        const noCachePath = rootPath + '?v=' + new Date().getTime();

        fetch(noCachePath)
            .then(function (res) {
                if (!res.ok) throw new Error('Could not load ' + componentPath);
                return res.text();
            })
            .then(function (html) {
                const parent = placeholder.parentNode;
                const temp = document.createElement('div');
                temp.innerHTML = html;
                
                // 1. Prepare scripts
                const scripts = Array.from(temp.querySelectorAll('script'));
                
                // 2. Insert all nodes except scripts into DOM
                while(temp.firstChild) {
                    const node = temp.firstChild;
                    if (node.tagName === 'SCRIPT') {
                        temp.removeChild(node);
                    } else {
                        parent.insertBefore(node, placeholder);
                    }
                }
                
                // 3. Remove placeholder
                parent.removeChild(placeholder);
                
                // 4. Manually execute the scripts we saved
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }
                    document.body.appendChild(newScript);
                });
                
                console.log(`[GetMEDS] Successfully loaded and executed ${componentPath}`);
            })
            .catch(function (err) {
                console.warn(`[GetMEDS] Failed to load ${componentPath}:`, err);
            });
    }

    function init() {
        if (window.getmeds_inited_hardened) return;
        window.getmeds_inited_hardened = true;

        try {
            console.log('[GetMEDS] Initializing UI components (Hardened)...');

            // Set Favicon dynamically
            injectFavicon();

            // Inject Scroll and AI
            injectScrollToTop();
            injectAIAssistant();
            
            // Watchdogs to ensure they stay in DOM
            setInterval(() => {
                injectScrollToTop();
                injectAIAssistant();
            }, 3000);

            loadComponent('navbar-placeholder', 'components/navbar.html');
            loadComponent('footer-placeholder', 'components/footer.html');

            // Load Auth Modals
            const authContainer = document.createElement('div');
            authContainer.id = 'auth-modal-container';
            document.body.appendChild(authContainer);

            fetch('components/auth_modals.html?v=' + new Date().getTime())
                .then(res => res.text())
                .then(html => {
                    authContainer.innerHTML = html;
                    executeScripts(authContainer);
                })
                .catch(err => console.warn('[GetMEDS] Auth Modal failed:', err));

        } catch (e) {
            console.error('[GetMEDS] Loader Initialization Error:', e);
        }
    }

    function injectAIAssistant() {
        if (!document.body) return;
        if (document.getElementById('zap-ai-trigger')) return;

        // Styles for AI Assistant
        const styleId = 'getmeds-ai-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #zap-ai-trigger {
                    position: fixed !important;
                    bottom: 95px !important;
                    right: 30px !important;
                    width: 50px !important;
                    height: 50px !important;
                    background: linear-gradient(135deg, #61A644 0%, #1D9FDA 100%) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 15px !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-shadow: 0 10px 25px rgba(29, 159, 218, 0.3) !important;
                    z-index: 9999998 !important;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    font-size: 20px !important;
                }
                #zap-ai-trigger:hover {
                    transform: scale(1.1) rotate(5deg) !important;
                    box-shadow: 0 15px 30px rgba(29, 159, 218, 0.4) !important;
                }
                
                #zap-chat-window {
                    position: fixed !important;
                    bottom: 30px !important;
                    right: 95px !important; /* To the left of the scroll/AI buttons */
                    width: 380px !important;
                    height: 500px !important;
                    max-height: calc(100vh - 130px) !important;
                    max-width: calc(100vw - 120px) !important;
                    background: linear-gradient(135deg, rgba(97, 166, 68, 0.95) 0%, rgba(29, 159, 218, 0.95) 100%) !important;
                    backdrop-filter: blur(25px) !important;
                    z-index: 40 !important; /* Below navbar z-50 */
                    border-radius: 24px !important;
                    overflow: hidden !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    opacity: 0 !important;
                    transform: translateX(30px) scale(0.9) !important;
                    visibility: hidden !important;
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                    border: 1px solid rgba(255,255,255,0.2) !important;
                }
                #zap-chat-window.active {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateX(0) scale(1) !important;
                }
                
                .zap-glass {
                    background: rgba(255, 255, 255, 0.1) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .zap-gradient-bg {
                    background: transparent !important; /* Managed by parent container now */
                }

                #zap-messages {
                    flex: 1 !important;
                    overflow-y: auto !important;
                    padding: 20px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 12px !important;
                    scrollbar-width: none !important;
                }
                #zap-messages::-webkit-scrollbar { display: none; }

                .zap-msg {
                    padding: 10px 16px !important;
                    border-radius: 18px !important;
                    font-size: 13.5px !important;
                    line-height: 1.5 !important;
                    max-width: 85% !important;
                    word-wrap: break-word !important;
                    color: white !important;
                }
                .zap-msg.ai {
                    background: rgba(255,255,255,0.15) !important;
                    align-self: flex-start !important;
                    border-bottom-left-radius: 4px !important;
                }
                .zap-msg.user {
                    background: rgba(0,0,0,0.15) !important;
                    align-self: flex-end !important;
                    border-bottom-right-radius: 4px !important;
                }
                
                @keyframes zap-typing {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .zap-dot {
                    display: inline-block;
                    width: 4px;
                    height: 4px;
                    background: white;
                    border-radius: 50%;
                    margin: 0 1px;
                    animation: zap-typing 1s infinite ease-in-out;
                }
                .zap-dot:nth-child(2) { animation-delay: 0.2s; }
                .zap-dot:nth-child(3) { animation-delay: 0.4s; }
            `;
            document.head.appendChild(style);
        }

        // Trigger Button
        const btn = document.createElement('button');
        btn.id = 'zap-ai-trigger';
        btn.innerHTML = '<i class="fa-solid fa-face-smile-wink"></i>';
        btn.title = "Ask GetAssist";
        document.body.appendChild(btn);

        // Chat Window HTML
        const chatWindow = document.createElement('div');
        chatWindow.id = 'zap-chat-window';
        chatWindow.innerHTML = `
            <div class="p-5 flex items-center justify-between shadow-sm border-b border-white/10">
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                        <i class="fa-solid fa-robot text-white text-lg"></i>
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm tracking-wide">GetAssist</h4>
                        <div class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            <span class="text-white/60 text-[10px] font-bold tracking-widest uppercase">Online</span>
                        </div>
                    </div>
                </div>
                <button id="zap-close-win" class="text-white/50 hover:text-white transition"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            
            <div id="zap-messages">
                <div class="zap-msg ai">Hi! I'm GetAssist, your GetMEDS health assistant. How can I help you navigate our system today?</div>
            </div>
            
            <div class="p-4 bg-white/5 backdrop-blur-xl border-t border-white/10">
                <div class="zap-glass p-1.5 rounded-2xl flex items-center gap-2">
                    <input type="text" id="zap-input" placeholder="Type your message..." class="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-white placeholder-white/30">
                    <button id="zap-send-btn" class="h-9 w-9 bg-[#61A644] text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg">
                        <i class="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                </div>
                <div class="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                    <button class="zap-chip whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 text-[11px] font-medium transition" onclick="document.dispatchEvent(new CustomEvent('zapAsk', {detail: 'Where is my cart?'}))">Where is my cart?</button>
                    <button class="zap-chip whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 text-[11px] font-medium transition" onclick="document.dispatchEvent(new CustomEvent('zapAsk', {detail: 'Search products'}))">Search products</button>
                </div>
            </div>
        `;
        document.body.appendChild(chatWindow);

        // Logic
        const zapInput = chatWindow.querySelector('#zap-input');
        const zapMessages = chatWindow.querySelector('#zap-messages');
        const zapSend = chatWindow.querySelector('#zap-send-btn');

        btn.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
            if (chatWindow.classList.contains('active')) {
                zapInput.focus();
            }
        });
        
        chatWindow.querySelector('#zap-close-win').addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });

        function addMessage(text, type) {
            const msg = document.createElement('div');
            msg.className = `zap-msg ${type}`;
            msg.innerHTML = text; // Fix: rendering HTML links properly
            zapMessages.appendChild(msg);
            zapMessages.scrollTop = zapMessages.scrollHeight;
            return msg;
        }

        function showTyping() {
            const typing = document.createElement('div');
            typing.className = 'zap-msg ai typing';
            typing.innerHTML = '<span class="zap-dot"></span><span class="zap-dot"></span><span class="zap-dot"></span>';
            zapMessages.appendChild(typing);
            zapMessages.scrollTop = zapMessages.scrollHeight;
            return typing;
        }

        async function handleResponse(query) {
            const typing = showTyping();
            
            // Site Navigation Logic
            let response = "I'm still learning! You can ask me to help you find products, check your cart, manage your profile, or learn about our company.";
            const q = query.toLowerCase();
            
            // Shopping & Products
            if (q.includes('cart') || q.includes('checkout') || q.includes('bag')) {
                response = 'You can view your items and checkout by visiting your <a href="cart.html" class="font-bold underline text-blue-200 hover:text-blue-100">Shopping Cart</a>.';
            } else if (q.includes('search') || q.includes('product') || q.includes('medicine') || q.includes('shop') || q.includes('buy')) {
                response = `We have a wide variety of medicines. Some of our top products include:<br>
                <ul class="list-disc pl-5 mt-2 mb-2 space-y-1">
                    <li><b>Cytarabine 100 MG / 16.7 ML</b></li>
                    <li><b>Pemetrexed 100 MG / 500 MG</b></li>
                    <li><b>Everolimus 10 MG</b></li>
                    <li><b>Bicalutamide 50 MG</b></li>
                </ul>
                View our complete catalog on the <a href="product-range.html" class="font-bold underline text-blue-200 hover:text-blue-100">Product Range</a> page.`;
            } else if (q.includes('order medicine') || q.includes('prescription')) {
                response = 'If you need to fulfill a prescription or order specific medicines, head over to the <a href="order-medicines.html" class="font-bold underline text-blue-200 hover:text-blue-100">Order Medicines</a> section.';
            } else if (q.includes('home') || q.includes('start')) {
                response = 'You can always return to the main dashboard by going <a href="index.html" class="font-bold underline text-blue-200 hover:text-blue-100">Home</a>.';
            }
            
            // User Profile & Account
            else if (q.includes('profile') || q.includes('account') || q.includes('edit')) {
                response = 'Manage your personal details and account settings in your <a href="edit-profile.html" class="font-bold underline text-blue-200 hover:text-blue-100">Profile Settings</a>.';
            } else if (q.includes('order') || q.includes('purchase') || q.includes('track') || q.includes('history')) {
                response = 'You can track all your past and current orders in the <a href="profile.html" class="font-bold underline text-blue-200 hover:text-blue-100">My Purchases</a> section of your profile.';
            } else if (q.includes('notification') || q.includes('update')) {
                response = 'Check your latest updates and alerts under <a href="profile.html" class="font-bold underline text-blue-200 hover:text-blue-100">Notifications</a>.';
            } else if (q.includes('voucher') || q.includes('discount') || q.includes('coupon')) {
                response = 'View your available discounts in the <a href="profile.html" class="font-bold underline text-blue-200 hover:text-blue-100">My Vouchers</a> tab.';
            } else if (q.includes('coin') || q.includes('reward') || q.includes('point')) {
                response = 'Check your reward balance in the <a href="profile.html" class="font-bold underline text-blue-200 hover:text-blue-100">My Coins</a> section.';
            }
            
            // Company Info & Support
            else if (q.includes('about') || q.includes('company') || q.includes('who are we')) {
                response = 'Learn more about our mission and vision on the <a href="about-us.html" class="font-bold underline text-blue-200 hover:text-blue-100">About Us</a> page.';
            } else if (q.includes('contact') || q.includes('support') || q.includes('help') || q.includes('message')) {
                response = 'Need help? Reach out to our support team via the <a href="contact-us.html" class="font-bold underline text-blue-200 hover:text-blue-100">Contact Us</a> page. We are available 24/7!';
            } else if (q.includes('career') || q.includes('job') || q.includes('hiring')) {
                response = 'Looking to join our team? Check out open positions on our <a href="careers.html" class="font-bold underline text-blue-200 hover:text-blue-100">Careers</a> page.';
            } else if (q.includes('csr') || q.includes('charity') || q.includes('advocacy')) {
                response = 'Discover our community initiatives on the <a href="csr.html" class="font-bold underline text-blue-200 hover:text-blue-100">Corporate Social Responsibility</a> page.';
            } else if (q.includes('global') || q.includes('presence') || q.includes('international')) {
                response = 'See our worldwide operations on the <a href="global-presence.html" class="font-bold underline text-blue-200 hover:text-blue-100">Global Presence</a> page.';
            } else if (q.includes('ungc') || q.includes('united nations')) {
                response = 'Read about our commitment to global standards on the <a href="ungc.html" class="font-bold underline text-blue-200 hover:text-blue-100">UN Global Compact</a> page.';
            }
            
            // General AI queries
            else if (q.includes('who are you') || q.includes('what are you')) {
                response = "I'm GetAssist, your AI wellness partner. I can guide you through the GetMEDS platform, find products, and direct you to the right support channels!";
            } else if (q.includes('delivery') || q.includes('shipping')) {
                response = "We offer nationwide delivery! Standard shipping takes 1-3 business days depending on your location.";
            }
            
            setTimeout(() => {
                typing.remove();
                addMessage(response, 'ai');
                // Ensure links inside AI message work smoothly within the chat interface window
                const newMsg = zapMessages.lastElementChild;
                const links = newMsg.querySelectorAll('a');
                links.forEach(l => {
                    l.addEventListener('click', (e) => {
                        // Let the browser handle standard navigation
                    });
                });
            }, 800 + Math.random() * 1000);
        }

        const sendMessage = () => {
            const val = zapInput.value.trim();
            if (!val) return;
            addMessage(val, 'user');
            zapInput.value = '';
            handleResponse(val);
        };

        zapSend.addEventListener('click', sendMessage);
        zapInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
        
        // Listen for internal chips
        document.addEventListener('zapAsk', (e) => {
            addMessage(e.detail, 'user');
            handleResponse(e.detail);
        });
    }

    function injectFavicon() {
        // Find or create favicon link
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        // Always force the GetMEDS logo
        link.href = 'assets/getmedslogo.png';
        console.log('[GetMEDS] Favicon standardized');
    }

    function injectScrollToTop() {
        if (!document.body) return;
        if (document.getElementById('scroll-to-top')) {
            // Ensure it has highest z-index if already exists
            const existing = document.getElementById('scroll-to-top');
            if (existing.style.zIndex !== '9999999') {
                existing.style.setProperty('z-index', '9999999', 'important');
            }
            return;
        }

        const styleId = 'getmeds-scroll-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #scroll-to-top {
                    position: fixed !important;
                    bottom: 30px !important;
                    right: 30px !important;
                    width: 50px !important;
                    height: 50px !important;
                    background: linear-gradient(135deg, #61A644 0%, #1D9FDA 100%) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 15px !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
                    z-index: 9999999 !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    transform: translateY(20px) !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                #scroll-to-top.show {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) !important;
                }
                #scroll-to-top:hover {
                    transform: translateY(-5px) !important;
                    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.3) !important;
                    filter: brightness(1.1) !important;
                }
            `;
            document.head.appendChild(style);
        }

        const btn = document.createElement('button');
        btn.id = 'scroll-to-top';
        btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        btn.title = "Back to Top";
        document.body.appendChild(btn);

        const toggleVisible = () => {
            if (window.scrollY > 300) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        };

        window.addEventListener('scroll', toggleVisible);
        toggleVisible();

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        console.log('[GetMEDS] Scroll-to-top button injected and secured');
    }

    // Run loader
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Safety fallback
    window.addEventListener('load', init);

})();
