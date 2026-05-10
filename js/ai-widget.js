/* ============================================================
   HANAN FUSION — AI WIDGET (Groq API)
   Floating chatbot, recommendations, smart search
   ============================================================ */

// ─── Configuration ──────────────────────────────────────────
const AI_CONFIG = {
  get groqApiKey() {
    return (window.APP_CONFIG && window.APP_CONFIG.groqApiKey) ||
           localStorage.getItem('GROQ_API_KEY') || '';
  },
  get model() {
    return (window.APP_CONFIG && window.APP_CONFIG.groqModel) || 'llama-3.3-70b-versatile';
  },
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  restaurantContext: `You are Hana, the friendly AI assistant for Hanan Fusion Restaurant. 
  You help customers with:
  - Menu recommendations based on preferences and dietary needs
  - Table reservations and booking information
  - Food details: ingredients, allergens, calories, spice levels
  - Restaurant hours, location, and contact
  - Order tracking
  - Special offers and promotions
  - Catering and event inquiries
  
  Restaurant Info:
  - Name: Hanan Fusion
  - Cuisine: Pakistani, Chinese, Italian, BBQ, Fast Food, Desserts
  - Address: Main Boulevard, F-7 Markaz, Islamabad
  - Hours: Mon-Thu 12pm-11pm, Fri-Sat 12pm-12am, Sun 1pm-10pm
  - Phone: +92 51 1234567
  - WhatsApp: +92 300 1234567
  - Delivery: Available 2km radius
  
  Popular Items: Desi BBQ Platter (Rs.1850), Karahi Gosht (Rs.950), Fusion Burger (Rs.650), Hanan Special Biryani (Rs.750), Tiramisu (Rs.480)
  
  Current Offers: 20% off on weekday lunch (12-4pm), Free delivery on orders above Rs.1500
  
  Be warm, helpful, and concise. Use emojis sparingly. Keep responses under 150 words unless complex questions require more.`
};

// ─── State ──────────────────────────────────────────────────
const aiState = {
  isOpen: false,
  isLoading: false,
  messages: [],
  currentMode: 'chat', // chat | recommend | search
  userPrefs: JSON.parse(localStorage.getItem('hf_user_prefs') || '{}'),
  sessionId: Date.now().toString(36)
};

// ─── Create Widget HTML ─────────────────────────────────────
function createAIWidget() {
  const widget = document.createElement('div');
  widget.id = 'ai-widget';
  widget.innerHTML = `
    <!-- Floating Trigger Button -->
    <button class="ai-trigger" id="aiTrigger" aria-label="AI Assistant">
      <div class="ai-trigger-inner">
        <div class="ai-avatar-ring"></div>
        <div class="ai-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 10h12M8 14h8M8 18h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="21" cy="18" r="3" fill="#D4AF37"/>
            <path d="M20 18h2M21 17v2" stroke="#0F0F0F" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="ai-notif-dot"></div>
      </div>
      <span class="ai-label">Hana AI</span>
    </button>

    <!-- Chat Window -->
    <div class="ai-window" id="aiWindow">
      <!-- Header -->
      <div class="ai-header">
        <div class="ai-header-info">
          <div class="ai-avatar">
            <span>🤖</span>
            <div class="ai-online-dot"></div>
          </div>
          <div>
            <div class="ai-name">Hana <span class="ai-badge">AI</span></div>
            <div class="ai-status">● Always online</div>
          </div>
        </div>
        <div class="ai-header-actions">
          <button class="ai-mode-btn" data-mode="recommend" title="Get Recommendations">🍽️</button>
          <button class="ai-mode-btn" data-mode="search" title="Smart Search">🔍</button>
          <button class="ai-clear-btn" title="Clear chat">🗑️</button>
          <button class="ai-close-btn" id="aiClose">✕</button>
        </div>
      </div>

      <!-- Mode Bar -->
      <div class="ai-modes" id="aiModes">
        <button class="ai-mode-tab active" data-mode="chat">💬 Chat</button>
        <button class="ai-mode-tab" data-mode="recommend">✨ Recommend</button>
        <button class="ai-mode-tab" data-mode="search">🔍 Search</button>
        <button class="ai-mode-tab" data-mode="advisor">💡 Advisor</button>
      </div>

      <!-- Messages -->
      <div class="ai-messages" id="aiMessages">
        <!-- Welcome injected on open -->
      </div>

      <!-- Typing Indicator -->
      <div class="ai-typing" id="aiTyping" style="display:none">
        <div class="typing-bubble"><span></span><span></span><span></span></div>
        <span class="typing-text">Hana is thinking...</span>
      </div>

      <!-- Quick Chips -->
      <div class="ai-chips" id="aiChips">
        <button class="ai-chip" data-msg="What's your best dish?">🌟 Best dish</button>
        <button class="ai-chip" data-msg="Show me today's offers">🏷️ Today's offers</button>
        <button class="ai-chip" data-msg="Book a table for tonight">📅 Reserve table</button>
        <button class="ai-chip" data-msg="Vegetarian options">🥗 Veg options</button>
      </div>

      <!-- Input -->
      <div class="ai-input-wrap">
        <input type="text" class="ai-input" id="aiInput" placeholder="Ask Hana anything..." maxlength="500" autocomplete="off"/>
        <button class="ai-send-btn" id="aiSend" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 9L16 2L10 9L16 16L2 9Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <div class="ai-footer-note">Powered by Groq • Llama 3</div>
    </div>
  `;
  document.body.appendChild(widget);
  injectAIStyles();
  initAIEvents();
}

// ─── Inject Styles ──────────────────────────────────────────
function injectAIStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* AI Widget Container */
    #ai-widget { position: fixed; bottom: 24px; right: 24px; z-index: 1000; font-family: 'Poppins', sans-serif; }

    /* Trigger Button */
    .ai-trigger {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      background: none; border: none; cursor: pointer;
    }
    .ai-trigger-inner {
      position: relative; width: 60px; height: 60px;
      background: linear-gradient(135deg, #D4AF37, #B8961F);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 25px rgba(212,175,55,0.5);
      transition: all 0.3s ease;
      color: #0F0F0F;
    }
    .ai-trigger:hover .ai-trigger-inner { transform: scale(1.08); box-shadow: 0 6px 35px rgba(212,175,55,0.7); }
    .ai-avatar-ring {
      position: absolute; inset: -4px;
      border-radius: 50%;
      border: 2px solid rgba(212,175,55,0.4);
      animation: ai-ring 2.5s ease infinite;
    }
    @keyframes ai-ring {
      0%,100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.12); opacity: 0.2; }
    }
    .ai-notif-dot {
      position: absolute; top: 3px; right: 3px;
      width: 12px; height: 12px; border-radius: 50%;
      background: #2ecc71; border: 2px solid #0F0F0F;
    }
    .ai-label {
      font-size: 0.65rem; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: #D4AF37;
    }
    .ai-trigger.hidden { display: none; }

    /* Chat Window */
    .ai-window {
      position: absolute; bottom: 80px; right: 0;
      width: 380px; height: 580px;
      background: #1A1A1A;
      border: 1px solid rgba(212,175,55,0.2);
      border-radius: 20px;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7);
      overflow: hidden;
      transform: scale(0.85) translateY(20px);
      transform-origin: bottom right;
      opacity: 0; pointer-events: none;
      transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    .ai-window.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

    /* Header */
    .ai-header {
      padding: 16px 18px;
      background: linear-gradient(135deg, #0F0F0F, #1A1A1A);
      border-bottom: 1px solid rgba(212,175,55,0.15);
      display: flex; align-items: center; justify-content: space-between;
    }
    .ai-header-info { display: flex; align-items: center; gap: 12px; }
    .ai-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37, #C0392B);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; position: relative;
    }
    .ai-online-dot {
      position: absolute; bottom: 1px; right: 1px;
      width: 10px; height: 10px; border-radius: 50%;
      background: #2ecc71; border: 2px solid #1A1A1A;
    }
    .ai-name { font-size: 0.95rem; font-weight: 700; color: #FFF; }
    .ai-badge { 
      background: rgba(212,175,55,0.2); color: #D4AF37;
      font-size: 0.6rem; padding: 2px 6px; border-radius: 4px;
      vertical-align: middle; margin-left: 4px;
    }
    .ai-status { font-size: 0.72rem; color: #2ecc71; }
    .ai-header-actions { display: flex; gap: 6px; align-items: center; }
    .ai-mode-btn, .ai-clear-btn, .ai-close-btn {
      width: 30px; height: 30px; border-radius: 8px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: #888; font-size: 0.8rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .ai-mode-btn:hover { background: rgba(212,175,55,0.15); color: #D4AF37; }
    .ai-close-btn:hover { background: rgba(192,57,43,0.2); color: #E74C3C; }
    .ai-clear-btn:hover { background: rgba(255,255,255,0.1); color: #FFF; }

    /* Mode Tabs */
    .ai-modes {
      display: flex; gap: 4px; padding: 8px 12px;
      background: #151515;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      overflow-x: auto; scrollbar-width: none;
    }
    .ai-modes::-webkit-scrollbar { display: none; }
    .ai-mode-tab {
      white-space: nowrap; padding: 6px 12px; border-radius: 20px;
      font-size: 0.72rem; font-weight: 600; cursor: pointer;
      background: transparent; border: 1px solid rgba(255,255,255,0.08);
      color: #888; transition: all 0.25s;
    }
    .ai-mode-tab.active, .ai-mode-tab:hover { background: rgba(212,175,55,0.15); color: #D4AF37; border-color: rgba(212,175,55,0.3); }

    /* Messages */
    .ai-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      scrollbar-width: thin; scrollbar-color: #333 transparent;
    }
    .ai-messages::-webkit-scrollbar { width: 4px; }
    .ai-messages::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
    
    .ai-msg { display: flex; gap: 8px; max-width: 85%; animation: msgIn 0.3s ease; }
    @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .ai-msg.user { align-self: flex-end; flex-direction: row-reverse; }
    .ai-msg-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37, #B8961F);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; flex-shrink: 0; color: #0F0F0F; font-weight: 700;
    }
    .ai-msg.user .ai-msg-avatar { background: linear-gradient(135deg, #3498db, #2980b9); color: #FFF; }
    .ai-msg-bubble {
      padding: 10px 14px;
      border-radius: 16px 16px 16px 4px;
      background: #222; border: 1px solid rgba(255,255,255,0.06);
      font-size: 0.83rem; color: #CCC; line-height: 1.65;
    }
    .ai-msg.user .ai-msg-bubble {
      background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1));
      border-color: rgba(212,175,55,0.25);
      border-radius: 16px 16px 4px 16px;
      color: #F0D060;
    }
    .ai-msg-bubble a { color: #D4AF37; text-decoration: underline; }
    .ai-msg-time { font-size: 0.65rem; color: #555; margin-top: 4px; padding: 0 4px; }

    /* Product Recommendation Card in Chat */
    .ai-rec-card {
      background: #222; border: 1px solid rgba(212,175,55,0.2);
      border-radius: 12px; overflow: hidden;
      margin-top: 8px; cursor: pointer;
      transition: all 0.25s;
    }
    .ai-rec-card:hover { border-color: #D4AF37; transform: translateY(-2px); }
    .ai-rec-card img { width: 100%; height: 100px; object-fit: cover; }
    .ai-rec-body { padding: 10px 12px; }
    .ai-rec-name { font-size: 0.85rem; font-weight: 600; color: #FFF; margin-bottom: 2px; }
    .ai-rec-price { font-size: 0.9rem; color: #D4AF37; font-weight: 700; }
    .ai-rec-add { 
      width: 100%; margin-top: 8px; padding: 7px;
      background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3);
      border-radius: 8px; color: #D4AF37; font-size: 0.75rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .ai-rec-add:hover { background: #D4AF37; color: #0F0F0F; }

    /* Typing */
    .ai-typing {
      padding: 8px 16px; display: flex; align-items: center; gap: 10px;
    }
    .typing-bubble {
      display: flex; gap: 4px; align-items: center;
      background: #222; border-radius: 12px; padding: 8px 12px;
    }
    .typing-bubble span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #D4AF37; animation: typingDot 1.4s infinite;
    }
    .typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
    .typing-bubble span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingDot {
      0%,100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(-5px); opacity: 1; }
    }
    .typing-text { font-size: 0.72rem; color: #555; }

    /* Quick Chips */
    .ai-chips {
      padding: 6px 12px; display: flex; gap: 6px;
      overflow-x: auto; scrollbar-width: none;
    }
    .ai-chips::-webkit-scrollbar { display: none; }
    .ai-chip {
      white-space: nowrap; padding: 6px 12px; border-radius: 20px;
      font-size: 0.72rem; font-weight: 500; cursor: pointer;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      color: #888; transition: all 0.2s;
    }
    .ai-chip:hover { background: rgba(212,175,55,0.12); color: #D4AF37; border-color: rgba(212,175,55,0.3); }

    /* Input */
    .ai-input-wrap {
      display: flex; gap: 8px; padding: 10px 14px;
      background: #151515; border-top: 1px solid rgba(255,255,255,0.06);
      align-items: center;
    }
    .ai-input {
      flex: 1; background: #222; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 10px 14px;
      color: #FFF; font-size: 0.85rem; font-family: 'Poppins', sans-serif;
      transition: border-color 0.2s;
    }
    .ai-input:focus { border-color: rgba(212,175,55,0.5); outline: none; }
    .ai-input::placeholder { color: #555; }
    .ai-send-btn {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, #D4AF37, #B8961F);
      color: #0F0F0F; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
    }
    .ai-send-btn:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(212,175,55,0.4); }
    .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .ai-footer-note {
      text-align: center; font-size: 0.6rem; color: #444;
      padding: 4px; background: #151515;
    }

    /* Recommend Mode */
    .ai-pref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px 0; }
    .ai-pref-btn {
      padding: 10px; border-radius: 10px; text-align: center;
      background: #222; border: 1px solid rgba(255,255,255,0.1);
      color: #888; font-size: 0.78rem; cursor: pointer; transition: all 0.2s;
    }
    .ai-pref-btn:hover, .ai-pref-btn.sel { background: rgba(212,175,55,0.15); color: #D4AF37; border-color: rgba(212,175,55,0.3); }

    /* Search Mode */
    .ai-search-results { display: flex; flex-direction: column; gap: 8px; }
    .ai-search-result-item {
      display: flex; gap: 10px; padding: 10px; border-radius: 10px;
      background: #222; border: 1px solid rgba(255,255,255,0.08);
      cursor: pointer; transition: all 0.2s;
    }
    .ai-search-result-item:hover { border-color: rgba(212,175,55,0.3); }
    .ai-search-result-item img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .ai-sri-name { font-size: 0.83rem; font-weight: 600; color: #FFF; margin-bottom: 2px; }
    .ai-sri-price { font-size: 0.8rem; color: #D4AF37; }
    .ai-sri-cat { font-size: 0.7rem; color: #666; }

    @media (max-width: 480px) {
      .ai-window { width: calc(100vw - 32px); right: -8px; }
      #ai-widget { right: 16px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Events ─────────────────────────────────────────────────
function initAIEvents() {
  const trigger = document.getElementById('aiTrigger');
  const window_ = document.getElementById('aiWindow');
  const closeBtn = document.getElementById('aiClose');
  const sendBtn = document.getElementById('aiSend');
  const input = document.getElementById('aiInput');
  const clearBtn = document.querySelector('.ai-clear-btn');
  const chips = document.querySelectorAll('.ai-chip');
  const modeTabs = document.querySelectorAll('.ai-mode-tab');

  trigger.addEventListener('click', toggleAI);
  closeBtn.addEventListener('click', closeAI);
  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
  clearBtn.addEventListener('click', clearChat);
  chips.forEach(c => c.addEventListener('click', () => {
    input.value = c.dataset.msg;
    handleSend();
  }));
  modeTabs.forEach(tab => tab.addEventListener('click', () => {
    modeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    switchMode(tab.dataset.mode);
  }));

  // Header mode buttons
  document.querySelectorAll('.ai-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      modeTabs.forEach(t => { t.classList.toggle('active', t.dataset.mode === mode); });
      switchMode(mode);
    });
  });
}

function toggleAI() {
  aiState.isOpen ? closeAI() : openAI();
}

function openAI() {
  aiState.isOpen = true;
  document.getElementById('aiWindow').classList.add('open');
  document.getElementById('aiTrigger').classList.add('hidden');
  if (aiState.messages.length === 0) showWelcome();
  setTimeout(() => document.getElementById('aiInput').focus(), 350);
}

function closeAI() {
  aiState.isOpen = false;
  document.getElementById('aiWindow').classList.remove('open');
  document.getElementById('aiTrigger').classList.remove('hidden');
}

function clearChat() {
  aiState.messages = [];
  document.getElementById('aiMessages').innerHTML = '';
  showWelcome();
}

function switchMode(mode) {
  aiState.currentMode = mode;
  const chipsEl = document.getElementById('aiChips');
  switch (mode) {
    case 'recommend':
      chipsEl.innerHTML = `
        <button class="ai-chip" data-msg="Recommend something spicy">🌶️ Spicy</button>
        <button class="ai-chip" data-msg="Best vegetarian dishes">🥗 Veg</button>
        <button class="ai-chip" data-msg="Popular BBQ dishes">🔥 BBQ</button>
        <button class="ai-chip" data-msg="Light meal options">🥗 Light</button>
      `;
      appendBotMessage("🍽️ I'll find the perfect dish for you! What are you in the mood for? (spicy, light, vegetarian, BBQ...)");
      break;
    case 'search':
      chipsEl.innerHTML = `
        <button class="ai-chip" data-msg="Search chicken dishes">🐔 Chicken</button>
        <button class="ai-chip" data-msg="Under Rs.500">💰 Budget</button>
        <button class="ai-chip" data-msg="Chinese food options">🥢 Chinese</button>
        <button class="ai-chip" data-msg="Italian pasta">🍝 Italian</button>
      `;
      appendBotMessage("🔍 Smart search is ready! Tell me what you're looking for — dish name, cuisine, ingredient, price range...");
      break;
    case 'advisor':
      chipsEl.innerHTML = `
        <button class="ai-chip" data-msg="Best meal for a romantic dinner?">❤️ Romantic</button>
        <button class="ai-chip" data-msg="Family dinner suggestions">👨‍👩‍👧 Family</button>
        <button class="ai-chip" data-msg="Business lunch recommendations">💼 Business</button>
        <button class="ai-chip" data-msg="Birthday celebration ideas">🎂 Birthday</button>
      `;
      appendBotMessage("💡 I'm your personal dining advisor! Tell me about your occasion, guests, or preferences and I'll craft the perfect experience.");
      break;
    default:
      chipsEl.innerHTML = `
        <button class="ai-chip" data-msg="What's your best dish?">🌟 Best dish</button>
        <button class="ai-chip" data-msg="Show me today's offers">🏷️ Today's offers</button>
        <button class="ai-chip" data-msg="Book a table for tonight">📅 Reserve table</button>
        <button class="ai-chip" data-msg="Vegetarian options">🥗 Veg options</button>
      `;
  }
  chipsEl.querySelectorAll('.ai-chip').forEach(c => c.addEventListener('click', () => {
    document.getElementById('aiInput').value = c.dataset.msg;
    handleSend();
  }));
}

// ─── Welcome Message ─────────────────────────────────────────
function showWelcome() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const offers = ['🏷️ 20% off weekday lunch!', '🚚 Free delivery over Rs.1500', '🎂 Birthday discount available'];
  appendBotMessage(`${greeting}! 👋 I'm **Hana**, your AI dining companion at **Hanan Fusion**.

I can help you with:
• 🍽️ Menu recommendations
• 📅 Table reservations  
• 🛒 Order assistance
• 💡 Personalized suggestions

✨ *Today's offer: ${offers[Math.floor(Math.random() * offers.length)]}*

What can I do for you?`, true);
}

// ─── Message Handling ────────────────────────────────────────
async function handleSend() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text || aiState.isLoading) return;

  input.value = '';
  appendUserMessage(text);
  aiState.messages.push({ role: 'user', content: text });

  // Smart local responses first
  const localResponse = getLocalResponse(text.toLowerCase());
  if (localResponse) {
    await simulateTyping(600);
    appendBotMessage(localResponse);
    aiState.messages.push({ role: 'assistant', content: localResponse });
    return;
  }

  // Call Groq API
  await callGroqAPI(text);
}

// ─── Local Smart Responses ───────────────────────────────────
function getLocalResponse(text) {
  if (text.includes('hour') || text.includes('open') || text.includes('time') || text.includes('timing')) {
    return `🕐 **Our Hours:**
• Monday – Thursday: 12:00 PM – 11:00 PM
• Friday – Saturday: 12:00 PM – 12:00 AM  
• Sunday: 1:00 PM – 10:00 PM

🎉 Happy hours: Mon-Thu 3pm-6pm (10% off!)`;
  }
  if (text.includes('location') || text.includes('address') || text.includes('where')) {
    return `📍 **Find Us:**
Main Boulevard, F-7 Markaz, Islamabad
Near F-7 Super Market

🚗 Free parking available
📞 +92 51 1234567
💬 WhatsApp: +92 300 1234567`;
  }
  if (text.includes('book') || text.includes('reserv') || text.includes('table')) {
    return `📅 **Reserve Your Table**
[Click here to book →](/reservation.html)

Or call us: **+92 51 1234567**

⏰ Reservations open 30 days in advance
👥 Groups of 10+: call for private dining`;
  }
  if (text.includes('offer') || text.includes('discount') || text.includes('deal')) {
    return `🏷️ **Today's Offers:**
• 20% off weekday lunch (12–4pm)
• Free delivery on orders above Rs.1,500
• Tuesday Family Deal: 4 mains + 2 desserts for Rs.3,500
• Loyalty points on every order!

Use code **HANA20** for 20% off your first online order!`;
  }
  if (text.includes('deliver') || text.includes('order online')) {
    return `🛵 **Delivery Info:**
• Delivery radius: 2km from restaurant
• Delivery time: 30-45 minutes
• Minimum order: Rs.500
• Free delivery: Orders above Rs.1,500
• [Order Now →](/order.html)`;
  }
  return null;
}

// ─── Groq API Call ───────────────────────────────────────────
async function callGroqAPI(userMessage) {
  aiState.isLoading = true;
  showTyping(true);
  document.getElementById('aiSend').disabled = true;

  try {
    let systemPrompt = AI_CONFIG.restaurantContext;
    if (aiState.currentMode === 'recommend') {
      systemPrompt += "\n\nCURRENT MODE: Recommendation Mode. Focus strictly on suggesting dishes based on user's taste, dietary needs, or occasion. Format with bullet points.";
    } else if (aiState.currentMode === 'search') {
      systemPrompt += "\n\nCURRENT MODE: Search Mode. The user is searching for specific items. Provide price, ingredients, and matching dishes. Be very concise.";
    } else if (aiState.currentMode === 'advisor') {
      systemPrompt += "\n\nCURRENT MODE: Advisor Mode. Act as a dining consultant. Help them plan an event, a romantic dinner, or a family gathering. Provide a complete experience suggestion.";
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...aiState.messages.slice(-10) // Last 10 messages for context
    ];

    const response = await fetch(AI_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.groqApiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages,
        max_tokens: 400,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `API Error ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again!";

    showTyping(false);
    appendBotMessage(reply);
    aiState.messages.push({ role: 'assistant', content: reply });

  } catch (err) {
    showTyping(false);
    console.error('AI Error:', err);
    if (err.message.includes('YOUR_GROQ_API_KEY')) {
      appendBotMessage("⚠️ AI features need a Groq API key. Please add your key in `js/ai-widget.js` (line 10). Get a free key at [console.groq.com](https://console.groq.com)");
    } else {
      appendBotMessage("😕 I had trouble connecting. Please check your internet connection or try again in a moment!");
    }
  } finally {
    aiState.isLoading = false;
    document.getElementById('aiSend').disabled = false;
  }
}

// ─── Append Messages ─────────────────────────────────────────
function appendUserMessage(text) {
  const msgs = document.getElementById('aiMessages');
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const el = document.createElement('div');
  el.className = 'ai-msg user';
  el.innerHTML = `
    <div class="ai-msg-avatar">You</div>
    <div>
      <div class="ai-msg-bubble">${escapeHtml(text)}</div>
      <div class="ai-msg-time">${time}</div>
    </div>
  `;
  msgs.appendChild(el);
  scrollMessages();
}

function appendBotMessage(text, welcome = false) {
  const msgs = document.getElementById('aiMessages');
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const el = document.createElement('div');
  el.className = 'ai-msg bot';
  const formatted = formatMarkdown(text);
  el.innerHTML = `
    <div class="ai-msg-avatar">🤖</div>
    <div>
      <div class="ai-msg-bubble">${formatted}</div>
      <div class="ai-msg-time">Hana · ${time}</div>
    </div>
  `;
  msgs.appendChild(el);
  scrollMessages();
}

function showTyping(show) {
  document.getElementById('aiTyping').style.display = show ? 'flex' : 'none';
  if (show) scrollMessages();
}

async function simulateTyping(ms) {
  showTyping(true);
  await new Promise(r => setTimeout(r, ms));
  showTyping(false);
}

function scrollMessages() {
  const msgs = document.getElementById('aiMessages');
  setTimeout(() => msgs.scrollTop = msgs.scrollHeight, 50);
}

// ─── Utilities ───────────────────────────────────────────────
function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatMarkdown(text) {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul style="padding-left:20px;margin:8px 0">$1</ul>');
  
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/<\/li><br>/g, '</li>');
  
  return html;
}

// ─── AI Personalization Engine ───────────────────────────────
const AIPersonalization = {
  trackPageVisit(page) {
    const visits = JSON.parse(localStorage.getItem('hf_visits') || '{}');
    visits[page] = (visits[page] || 0) + 1;
    localStorage.setItem('hf_visits', JSON.stringify(visits));
  },
  trackDishView(dishId, category) {
    const views = JSON.parse(localStorage.getItem('hf_dish_views') || '{}');
    views[category] = (views[category] || 0) + 1;
    localStorage.setItem('hf_dish_views', JSON.stringify(views));
    this.updateRecommendations();
  },
  updateRecommendations() {
    const views = JSON.parse(localStorage.getItem('hf_dish_views') || '{}');
    const topCat = Object.entries(views).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topCat) {
      localStorage.setItem('hf_top_category', topCat);
    }
  },
  getPersonalizedGreeting() {
    const topCat = localStorage.getItem('hf_top_category');
    if (topCat) return `Based on your interest in ${topCat}, I have great recommendations! 🌟`;
    return null;
  }
};

// ─── Smart Search Integration ────────────────────────────────
function initSmartSearch() {
  const searchInputs = document.querySelectorAll('.menu-search, #smartSearch');
  searchInputs.forEach(input => {
    let timeout;
    input.addEventListener('input', e => {
      clearTimeout(timeout);
      timeout = setTimeout(() => performSmartSearch(e.target.value), 300);
    });
  });
}

async function performSmartSearch(query) {
  if (!query || query.length < 2) return;
  // AI-enhanced search: use Groq to understand intent
  // For now, filter from local menu data
  const items = window.menuData || [];
  const q = query.toLowerCase();
  const results = items.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q) ||
    item.tags?.some(t => t.includes(q))
  );
  displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
  const container = document.getElementById('menuGrid') || document.getElementById('searchResults');
  if (!container) return;
  if (results.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888;">
      <div style="font-size:3rem;margin-bottom:12px">🔍</div>
      <h3 style="color:#FFF;margin-bottom:8px">No results for "${query}"</h3>
      <p>Try asking Hana for suggestions!</p>
    </div>`;
    return;
  }
  // Trigger menu render with filtered results
  if (window.renderMenuItems) window.renderMenuItems(results);
}

// ─── Initialize ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createAIWidget();
  initSmartSearch();
  AIPersonalization.trackPageVisit(window.location.pathname);

  // Auto-suggest after 30 seconds
  setTimeout(() => {
    if (!aiState.isOpen) {
      const trigger = document.getElementById('aiTrigger');
      trigger.style.animation = 'none';
      trigger.querySelector('.ai-avatar-ring').style.animation = 'ai-ring 0.5s ease 3';
    }
  }, 30000);
});

// Export for external use
window.HananAI = { openAI, closeAI, appendBotMessage, AIPersonalization };
