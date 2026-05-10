# 🍽️ Hanan Fusion — Premium Full-Stack Restaurant Platform

![Hanan Fusion Banner](https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

Hanan Fusion is a state-of-the-art, full-stack restaurant management system and customer experience platform. It combines a high-end, dark-luxury aesthetic with a powerful cloud backend and cutting-edge Artificial Intelligence.

---

## 🌟 Project Vision
To bridge the gap between traditional dining and modern technology by providing a seamless, AI-driven interface for both customers and restaurant administrators.

---

## 🚀 Core Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JavaScript (ES6+) |
| **Backend** | [Supabase](https://supabase.com/) (Real-time PostgreSQL, Storage, Auth) |
| **Artificial Intelligence** | [Groq Cloud](https://groq.com/) (Llama 3.3 70B Versatile) |
| **Maps & Location** | Leaflet.js with MapTiler Dark Theme |
| **Data Persistence** | Supabase DB + Browser LocalStorage |

---

## 📁 Comprehensive Project Structure

```text
hanan-fusion/
├── index.html              # Home Page (Hero, Parallax, Featured Sections)
├── menu.html               # Live Digital Menu (Supabase Dynamic Data)
├── reservation.html        # Table Booking System (Real-time slots)
├── order.html              # Online Ordering + Advanced Checkout
├── about.html              # Brand Story, Team & Philosophy
├── gallery.html            # Masonry Gallery with Lightbox Previews
├── contact.html            # Interactive Map & Contact Vectors
├── admin/
│   ├── index.html          # Secure Admin Dashboard (Stats, CRUD, AI)
│   └── login.html          # Protected Admin Authentication Gateway
├── js/
│   ├── config.js           # [SECURE] Centralized Developer API Keys
│   ├── main.js             # Core Application & Supabase SDK Logic
│   └── ai-widget.js        # AI Chatbot & Recommendation Engine
├── css/
│   └── main.css            # Global Design System & Variables
└── .gitignore              # Security protection for sensitive files
```

---

## 🤖 The "Fusion-8" AI Ecosystem
Hanan Fusion is powered by 8 distinct AI modules designed to optimize conversion and operations.

### 1. 🤖 AI Chatbot (Hana)
*   **Location**: All Pages (Floating Widget)
*   **Purpose**: A 24/7 digital concierge. Hana knows every ingredient in your menu, the history of your restaurant, and can even crack a joke. She handles general FAQs instantly, reducing staff phone time.

### 2. 🍽️ AI Recommendations Engine
*   **Location**: Chatbot "Recommend" Tab
*   **Purpose**: Analyzes the menu items in real-time. If a user says "I want something light for lunch," the AI cross-references categories and tags to suggest the perfect salad or starter.

### 3. 🔍 AI Smart Search
*   **Location**: Menu Page & Chatbot Search
*   **Purpose**: Traditional search only looks for keywords. Smart Search understands intent. Searching for "spicy chicken" will find items tagged with chili even if "chili" isn't in the name.

### 4. 🥂 AI Product Advisor
*   **Location**: Chatbot "Advisor" Tab
*   **Purpose**: Acts as a digital sommelier/planner. Users can ask, "What should I order for a romantic anniversary dinner for two?" and get a curated 3-course meal suggestion.

### 5. 🧠 AI Admin Assistant
*   **Location**: Admin Dashboard → AI Section
*   **Purpose**: A private tool for managers. Ask, "Which dish should we run a promotion on?" and the AI analyzes current menu performance to give business advice.

### 6. 📊 AI Analytics Dashboard
*   **Location**: Admin Panel Main View
*   **Purpose**: Translates raw database numbers into human insights. Instead of just seeing "Rs. 50,000," the AI tells you, "Your BBQ sales are up 20% compared to last Tuesday."

### 7. 🎯 AI Conversion Optimizer
*   **Location**: Global (Triggered on Idle)
*   **Purpose**: Monitors user behavior. If a user stays on the menu page for 30 seconds without clicking, a small AI prompt appears with a tailored offer to keep them engaged.

### 8. ✍️ AI Response Generator
*   **Location**: Admin Review/Order Management
*   **Purpose**: Helps staff draft professional responses to customer reviews or complex order inquiries in seconds, maintaining a premium brand voice.

---

## ⚙️ Setup & Installation

### Step 1: Database Initialization (Supabase)
Run the following SQL in your Supabase project to create the required architecture:

```sql
-- Menu Items Table
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC,
  description TEXT,
  img TEXT,
  tags TEXT[],
  offer BOOLEAN DEFAULT false
);

-- Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT 'ORD-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  total NUMERIC,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customers Table
CREATE TABLE customers (
  email TEXT PRIMARY KEY,
  name TEXT,
  orders_count INT DEFAULT 0,
  points INT DEFAULT 0,
  joined_date DATE DEFAULT now()
);
```

### Step 2: Configure Developer Keys
Edit `js/config.js` to link your local site to your cloud services:

```javascript
window.APP_CONFIG = {
  supabaseUrl:      'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey:  'YOUR_PUBLIC_ANON_KEY',
  groqApiKey:       'YOUR_GROQ_API_KEY',
  groqModel:        'llama-3.3-70b-versatile'
};
```

---

## 🔒 Security Framework
- **Config Lockdown**: `js/config.js` is included in `.gitignore`. Your production keys will never be public.
- **Auth Guard**: Every admin page checks for a valid Supabase Session. If not found, users are instantly booted to `login.html`.
- **Credential Masking**: The Admin UI hides sensitive keys once they are loaded into the application state.

---

## 🎨 Design System

| Token | Value | Hex |
|---|---|---|
| **Background** | Obsidian Black | `#0F0F0F` |
| **Primary** | Heritage Gold | `#D4AF37` |
| **Accent** | Crimson Red | `#C0392B` |
| **Glass** | Translucent White | `rgba(255,255,255,0.05)` |

---

## 🆘 Support & Documentation
This project is maintained by **Antigravity AI**.
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Groq API Reference**: [https://console.groq.com/docs](https://console.groq.com/docs)
- **Leaflet Maps**: [https://leafletjs.com/](https://leafletjs.com/)

---
*© 2024 Hanan Fusion. All Rights Reserved.*
