/* ============================================================
   HANAN FUSION — MAIN JAVASCRIPT
   Core interactions, animations, navigation
   ============================================================ */

'use strict';

// ─── DOM Ready ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHero();
  initScrollReveal();
  initCarousel();
  initCustomCursor();
  initReadingProgress();
  initLightbox();
  initToast();
  initCart();
  initOfferBanner();
  markActiveNav();
  initMobileNav();
  initParticles();
  initCounters();
  initMapFallback();
  checkDarkMode();
});

// ─── Navbar ──────────────────────────────────────────────────
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function markActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes(path) || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

function initMobileNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');
  if (!hamburger || !mobileNav) return;
  hamburger.addEventListener('click', () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const closeFn = () => { mobileNav.classList.remove('open'); document.body.style.overflow = ''; };
  mobileClose?.addEventListener('click', closeFn);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeFn));
}

// ─── Hero ────────────────────────────────────────────────────
function initHero() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  const img = new Image();
  img.onload = () => heroBg.classList.add('loaded');
  img.src = heroBg.style.backgroundImage.replace(/url\(["']?(.+?)["']?\)/, '$1');

  // Parallax on scroll
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (heroBg && scrolled < window.innerHeight) {
      heroBg.style.transform = `scale(1) translateY(${scrolled * 0.3}px)`;
    }
  }, { passive: true });
}

// ─── Scroll Reveal ───────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
}

// ─── Carousel ────────────────────────────────────────────────
function initCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const dots    = document.querySelectorAll('.carousel-dot');
  let current   = 0;
  const cards   = track.querySelectorAll('.dish-card');
  const total   = Math.max(0, cards.length - getVisible());

  function getVisible() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }
  function go(n) {
    current = Math.max(0, Math.min(n, Math.max(0, cards.length - getVisible())));
    const cardW = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * cardW}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }
  prevBtn?.addEventListener('click', () => go(current - 1));
  nextBtn?.addEventListener('click', () => go(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

  // Auto-play
  let timer = setInterval(() => go(current + 1 > total ? 0 : current + 1), 4000);
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', () => {
    timer = setInterval(() => go(current + 1 > total ? 0 : current + 1), 4000);
  });

  // Touch / drag
  let startX = 0, isDragging = false;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
  track.addEventListener('touchend',   e => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) go(diff > 0 ? current + 1 : current - 1);
    isDragging = false;
  });
  window.addEventListener('resize', () => go(0));
}

// ─── Custom Cursor ───────────────────────────────────────────
function initCustomCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  const dot    = document.querySelector('.cursor-dot');
  const circle = document.querySelector('.cursor-circle');
  if (!dot || !circle) return;
  let cx = 0, cy = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
  const animate = () => {
    rx += (cx - rx) * 0.12;
    ry += (cy - ry) * 0.12;
    dot.style.left    = `${cx}px`;
    dot.style.top     = `${cy}px`;
    circle.style.left = `${rx}px`;
    circle.style.top  = `${ry}px`;
    requestAnimationFrame(animate);
  };
  animate();
  document.querySelectorAll('a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.style.transform = 'translate(-50%,-50%) scale(2.5)'; circle.style.transform = 'translate(-50%,-50%) scale(1.5)'; });
    el.addEventListener('mouseleave', () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; circle.style.transform = 'translate(-50%,-50%) scale(1)'; });
  });
}

// ─── Reading Progress ─────────────────────────────────────────
function initReadingProgress() {
  const bar = document.querySelector('.reading-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    bar.style.width = `${(window.scrollY / total) * 100}%`;
  }, { passive: true });
}

// ─── Lightbox ────────────────────────────────────────────────
function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const img   = lb.querySelector('img');
  const close = lb.querySelector('.lightbox-close');
  document.querySelectorAll('.gallery-item, .masonry-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      if (!src) return;
      img.src = src;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  close?.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}

// ─── Toast Notifications ──────────────────────────────────────
let toastContainer;
function initToast() {
  toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: '⭐', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '⭐'}</span><span class="toast-msg">${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
window.showToast = showToast;

// ─── Cart System ─────────────────────────────────────────────
const Cart = {
  items: JSON.parse(localStorage.getItem('hf_cart') || '[]'),

  add(item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) { existing.qty++; }
    else { this.items.push({ ...item, qty: 1 }); }
    this.save(); this.updateUI();
    showToast(`${item.name} added to cart! 🛒`, 'success');
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save(); this.updateUI(); this.renderCart();
  },

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.remove(id);
    else { this.save(); this.updateUI(); this.renderCart(); }
  },

  clear() { this.items = []; this.save(); this.updateUI(); this.renderCart(); },

  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },

  count() { return this.items.reduce((s, i) => s + i.qty, 0); },

  save() { localStorage.setItem('hf_cart', JSON.stringify(this.items)); },

  updateUI() {
    const cnt = this.count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = cnt;
      el.style.display = cnt > 0 ? 'flex' : 'none';
    });
  },

  renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    if (this.items.length === 0) {
      container.innerHTML = `<div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h4>Your cart is empty</h4>
        <p>Add some delicious items!</p>
        <a href="menu.html" class="btn btn-gold btn-sm" style="margin-top:16px;display:inline-flex">Browse Menu</a>
      </div>`;
    } else {
      container.innerHTML = this.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img class="cart-item-img" src="${item.img}" alt="${item.name}" loading="lazy">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">Rs.${(item.price * item.qty).toLocaleString()}</div>
          </div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', 1)">+</button>
          </div>
        </div>
      `).join('');
    }
    this.renderTotals();
  },

  renderTotals() {
    const subtotal = this.total();
    const delivery = subtotal > 1500 ? 0 : 150;
    const tax      = Math.round(subtotal * 0.05);
    const grand    = subtotal + delivery + tax;
    const el = document.getElementById('cartTotals');
    if (!el) return;
    el.innerHTML = `
      <div class="cart-total-row"><span>Subtotal</span><span>Rs.${subtotal.toLocaleString()}</span></div>
      <div class="cart-total-row"><span>Delivery</span><span>${delivery === 0 ? '<span style="color:#2ecc71">FREE</span>' : 'Rs.' + delivery}</span></div>
      <div class="cart-total-row"><span>Tax (5%)</span><span>Rs.${tax.toLocaleString()}</span></div>
      <div class="cart-total-row grand"><span>Total</span><span class="amount">Rs.${grand.toLocaleString()}</span></div>
    `;
  }
};
window.Cart = Cart;

function initCart() {
  Cart.updateUI();
  // Cart open/close
  const cartBtn = document.querySelectorAll('.nav-cart-btn, .open-cart');
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');
  const closeBtn= document.querySelector('.cart-close');
  const openCart = () => {
    overlay?.classList.add('open');
    sidebar?.classList.add('open');
    document.body.style.overflow = 'hidden';
    Cart.renderCart();
  };
  const closeCart = () => {
    overlay?.classList.remove('open');
    sidebar?.classList.remove('open');
    document.body.style.overflow = '';
  };
  cartBtn.forEach(b => b.addEventListener('click', openCart));
  overlay?.addEventListener('click', closeCart);
  closeBtn?.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
}

// ─── Particles ───────────────────────────────────────────────
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${Math.random() * 3 + 1}px;
      height:${Math.random() * 3 + 1}px;
      background:rgba(212,175,55,${Math.random() * 0.3 + 0.1});
      border-radius:50%;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation: floatUp ${Math.random() * 10 + 10}s linear ${Math.random() * 10}s infinite;
    `;
    container.appendChild(p);
  }
}

// ─── Counters ────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString();
        if (current >= target) clearInterval(timer);
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ─── Offer Banner ─────────────────────────────────────────────
function initOfferBanner() {
  const close = document.querySelector('.offer-close');
  const banner= document.querySelector('.offer-banner');
  if (!close || !banner) return;
  if (sessionStorage.getItem('hf_banner_closed')) { banner.style.display = 'none'; return; }
  close.addEventListener('click', () => {
    banner.style.display = 'none';
    sessionStorage.setItem('hf_banner_closed', '1');
  });
}

// ─── Dark/Light Mode ─────────────────────────────────────────
function checkDarkMode() {
  const toggle = document.querySelector('.mode-toggle');
  const isDark = localStorage.getItem('hf_theme') !== 'light';
  
  if (!isDark) {
    document.body.classList.add('light-mode');
  }
  
  if (!toggle) return;
  toggle.innerHTML = isDark ? '☀️' : '🌙';
  
  toggle.addEventListener('click', () => {
    const nowLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('hf_theme', nowLight ? 'light' : 'dark');
    toggle.innerHTML = nowLight ? '🌙' : '☀️';
  });
}

// ─── Map Fallback ─────────────────────────────────────────────
function initMapFallback() {
  const mapContainer = document.querySelector('.map-embed');
  if (!mapContainer) return;
  mapContainer.innerHTML = `
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3319.7!2d73.0479!3d33.7294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDQzJzQ1LjkiTiA3M8KwMDInNTIuNyJF!5e0!3m2!1sen!2s!4v1234567890"
      width="100%" height="100%" style="border:0;filter:grayscale(1) invert(0.85)" allowfullscreen loading="lazy">
    </iframe>
  `;
}

// ─── Reservation Form ─────────────────────────────────────────
function initReservation() {
  const form = document.getElementById('reservationForm');
  if (!form) return;
  const timeSlots = document.querySelectorAll('.time-slot:not(.unavailable)');
  timeSlots.forEach(s => s.addEventListener('click', () => {
    timeSlots.forEach(t => t.classList.remove('selected'));
    s.classList.add('selected');
    document.getElementById('selectedTime').value = s.dataset.time;
  }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.innerHTML = '⏳ Processing...'; btn.disabled = true;
    await new Promise(r => setTimeout(r, 1500));
    form.style.display = 'none';
    document.querySelector('.booking-success')?.classList.add('show');
    showToast('Table reserved successfully! 🎉', 'success', 5000);
  });

  // Date picker: disable past dates
  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }
}
document.addEventListener('DOMContentLoaded', initReservation);

// ─── Supabase Initialization ─────────────────────────────────────
window.initSupabase = function() {
  const cfg = window.APP_CONFIG || {};
  const url = cfg.supabaseUrl || localStorage.getItem('SUPABASE_URL') || '';
  const key = cfg.supabaseAnonKey || localStorage.getItem('SUPABASE_ANON_KEY') || '';
  if (url && url !== 'YOUR_SUPABASE_URL_HERE' && key && key !== 'YOUR_SUPABASE_ANON_KEY_HERE' && window.supabase) {
    window.supabaseClient = window.supabase.createClient(url, key);
  }
  // Never overwrite an already-valid client with null
};
window.initSupabase(); // call on load

// ─── Menu Data & Rendering ─────────────────────────────────────
window.menuData = [];

window.fetchMenuData = async function() {
  // Re-try init in case SDK wasn't fully ready on page load
  if (!window.supabaseClient) {
    window.initSupabase();
  }
  if (!window.supabaseClient) {
    console.warn("Supabase not configured. Please add URL and Anon Key in Admin Panel Settings.");
    return;
  }
  try {
    const { data, error } = await window.supabaseClient.from('menu_items').select('*').order('name');
    if (error) throw error;
    if (data) {
      window.menuData = data;
      if (document.getElementById('menuGrid')) {
        renderMenuItems(window.menuData);
      }
      if (document.getElementById('adminMenuGrid')) {
        renderAdminMenu();
      }
    }
  } catch (err) {
    console.error('Failed to fetch menu', err);
  }
};

// ─── Menu Rendering ───────────────────────────────────────────
function renderMenuItems(items) {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  if (!items || items.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px 20px">
      <div style="font-size:3rem;margin-bottom:12px">🍽️</div>
      <h3>No items found</h3><p style="margin-top:8px">Try a different search or filter.</p>
    </div>`; return;
  }
  grid.innerHTML = items.map(item => `
    <div class="menu-item-card reveal" data-category="${item.category}" data-id="${item.id}">
      <div class="menu-item-img">
        <img src="${item.img}" alt="${item.name}" loading="lazy">
        <div class="menu-item-labels">
          ${item.veg ? '<span class="badge badge-green">🌿 Veg</span>' : '<span class="badge badge-red">🥩 Non-Veg</span>'}
          ${item.offer ? '<span class="badge badge-gold">🏷️ Offer</span>' : ''}
        </div>
        <div class="spice-indicator" title="Spice level ${item.spice}/3">
          ${[1,2,3].map(i => `<div class="spice-dot ${i <= item.spice ? 'active' : ''}"></div>`).join('')}
        </div>
        ${item.offer ? '<div class="promo-ribbon">Special</div>' : ''}
      </div>
        <div class="menu-item-body">
          <h3 class="menu-item-name">${item.name}</h3>
          <p class="menu-item-desc">${item.description}</p>
          <div class="menu-item-meta">
            <span style="text-transform:capitalize;background:rgba(212,175,55,0.1);color:var(--gold);padding:2px 8px;border-radius:20px;font-size:0.72rem;font-weight:600">${item.category}</span>
            ${(item.tags && item.tags.length > 0 && item.tags[0]) ? `<span style="font-size:0.72rem;color:var(--gray)">${Array.isArray(item.tags) ? item.tags.filter(t=>['popular','best-seller','signature','chef-special'].includes(t)).map(t=>t.replace('-',' ')).join(' · ').toUpperCase() : ''}</span>` : ''}
          </div>
          <div class="menu-item-footer">
            <div class="menu-item-price">Rs.${item.price.toLocaleString()}</div>
            <button class="add-to-cart-btn" onclick="Cart.add(window.menuData.find(m=>m.id==='${item.id}'))">
              <span>+</span> Add
            </button>
          </div>
        </div>
    </div>
  `).join('');
  // Re-observe new elements
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    el.classList.add('visible');
  });
}
window.renderMenuItems = renderMenuItems;

// ─── Menu Init ────────────────────────────────────────────────
function initMenu() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  fetchMenuData();

  // Filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      const filtered = cat === 'all' ? window.menuData : window.menuData.filter(i => i.category === cat);
      renderMenuItems(filtered);
    });
  });

  // Search
  const searchInput = document.querySelector('.menu-search');
  searchInput?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    if (!q) { renderMenuItems(window.menuData); return; }
    const filtered = window.menuData.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.tags || []).some(t => t.includes(q))
    );
    renderMenuItems(filtered);
  });
}
document.addEventListener('DOMContentLoaded', initMenu);

// ─── Checkout ─────────────────────────────────────────────────
function initCheckout() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;
  Cart.renderCart();
  renderOrderSummary();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.innerHTML = '⏳ Processing Order...'; btn.disabled = true;
    
    const orderId = 'HF' + Date.now().toString(36).toUpperCase();
    
    try {
      if (!window.supabaseClient) throw new Error("Supabase is not configured yet.");
      const { error } = await window.supabaseClient.from('orders').insert({
        id: orderId,
        total: Cart.total(),
        items: Cart.items,
        status: 'Pending'
      });
      if (error) throw error;
      
      Cart.clear();
      document.getElementById('checkoutSection').style.display = 'none';
      document.getElementById('orderSuccess').style.display = 'block';
      document.getElementById('orderNum').textContent = orderId;
      showToast('Order placed successfully! 🎉', 'success', 6000);
    } catch(err) {
      console.error(err);
      showToast('Error placing order.', 'error');
      btn.innerHTML = 'Place Order'; btn.disabled = false;
    }
  });
}

function renderOrderSummary() {
  const el = document.getElementById('orderSummaryItems');
  if (!el) return;
  const items = Cart.items;
  el.innerHTML = items.map(i => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
      <div style="display:flex;align-items:center;gap:10px">
        <img src="${i.img}" style="width:44px;height:44px;border-radius:8px;object-fit:cover">
        <div><div style="font-size:0.88rem;font-weight:600">${i.name} × ${i.qty}</div></div>
      </div>
      <div style="color:#D4AF37;font-weight:700">Rs.${(i.price * i.qty).toLocaleString()}</div>
    </div>
  `).join('');
}
document.addEventListener('DOMContentLoaded', initCheckout);

// ─── Newsletter ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (!input?.value) return;
    showToast('🎉 Subscribed! You\'ll receive exclusive offers.', 'success');
    input.value = '';
  });
});

// ─── Promo Code ───────────────────────────────────────────────
const PROMO_CODES = { 'HANA20': 20, 'FUSION10': 10, 'NEWUSER': 15, 'WELCOME': 25 };
window.applyPromo = function() {
  const input = document.getElementById('promoCode');
  const code  = input?.value.toUpperCase().trim();
  if (!code) return;
  const discount = PROMO_CODES[code];
  if (discount) {
    showToast(`✅ Code "${code}" applied! ${discount}% off your order.`, 'success');
    input.style.borderColor = '#2ecc71';
    document.getElementById('promoResult').innerHTML = `<span style="color:#2ecc71;font-size:0.82rem">✅ ${discount}% discount applied!</span>`;
  } else {
    showToast('❌ Invalid promo code. Try HANA20!', 'error');
    input.style.borderColor = '#E74C3C';
  }
};

// ─── Smooth Page Transitions ──────────────────────────────────
document.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (!link || !link.href || link.href.includes('#') || link.target === '_blank') return;
  if (!link.href.startsWith(window.location.origin)) return;
  // Light page transition effect
  document.body.style.opacity = '0.95';
  setTimeout(() => { document.body.style.opacity = '1'; }, 300);
});
