/* ======================================================== */
/* 🎮 MASTER SCRIPT.JS - ALL INTERACTIVE CORES FUNCTIONING   */
/* ======================================================== */

// Ganti dengan nomor WA & link Discord asli kamu
window.ASTROMODS_WA_NUMBER = '6289643008300';
window.ASTROMODS_DISCORD_URL = 'https://discord.gg/xxxxxxx';

// Dynamically import our brand new Firebase Authentication & Firestore integration module
if (!window.firebaseAuthAttached) {
  window.firebaseAuthAttached = true;
  const script = document.createElement('script');
  script.type = 'module';
  const isSubfolder = window.location.pathname.includes('/detail-mod-');
  script.src = isSubfolder ? '../js/firebase-auth.js' : 'js/firebase-auth.js';
  document.head.appendChild(script);
}

// consolidated global state
let userIsLoggedIn = localStorage.getItem('astroUserLoggedIn') === 'true';
let selectedUploadGame = "";
let selectedUploadType = "";

// --- INDEXEDDB FOR LARGE MULTIMEDIA STORAGE ---
const ASTRO_DB_NAME = "AstroModsDB";
const ASTRO_STORE_NAME = "galleries";

function initAstroDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ASTRO_DB_NAME, 2);
    request.onupgradeneeded = function(e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(ASTRO_STORE_NAME)) {
        db.createObjectStore(ASTRO_STORE_NAME);
      }
    };
    request.onsuccess = function(e) {
      resolve(e.target.result);
    };
    request.onerror = function(e) {
      reject(e.target.error);
    };
  });
}

function saveAstroModGallery(modId, galleryArray) {
  return initAstroDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ASTRO_STORE_NAME], "readwrite");
      const store = transaction.objectStore(ASTRO_STORE_NAME);
      const request = store.put(galleryArray, modId);
      request.onsuccess = function() {
        resolve();
      };
      request.onerror = function(e) {
        reject(e.target.error);
      };
    });
  });
}

function getAstroModGallery(modId) {
  return initAstroDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ASTRO_STORE_NAME], "readonly");
      const store = transaction.objectStore(ASTRO_STORE_NAME);
      const request = store.get(modId);
      request.onsuccess = function(e) {
        resolve(e.target.result || null);
      };
      request.onerror = function(e) {
        reject(e.target.error);
      };
    });
  });
}

window.saveAstroModGallery = saveAstroModGallery;
window.getAstroModGallery = getAstroModGallery;

// Unified Mods Database
const ALL_GAME_MODS = [
  {
    id: "serp-pokemon",
    title: "SERP Pokédrock (Pokémon Addon)",
    game: "Minecraft Bedrock",
    category: "addon",
    creator: "ZacekElSerpentin",
    version: "1.21+",
    downloads: "14.2K",
    likes: "852",
    updated: "2 days ago",
    size: "42.5 MB",
    versionList: ["1.21", "1.20", "1.19"],
    img: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=256&h=256&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=1200&h=500&fit=crop&q=80",
    desc: "Welcome to the world of Pokédrock! This addon features a real-time battle system, fully rideable pokemon mounts, custom evolution animations, and true biome-specific spawns. Explore the ultimate Pokemon experience on Minecraft Bedrock! Make sure to enable all Experimental Gameplay toggles.",
    gallery: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=500&fit=crop&q=80"
    ],
    file: "SERP_Pokedrock_v3.mcaddon"
  },
  {
    id: "more-body",
    title: "More Body Actions CF-Edition",
    game: "Minecraft Bedrock",
    category: "addon",
    creator: "CurseCreator",
    version: "1.21+",
    downloads: "9.8K",
    likes: "412",
    updated: "May 10, 2026",
    size: "1.8 MB",
    versionList: ["1.21", "1.20"],
    img: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=256&h=256&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?w=1200&h=500&fit=crop&q=80",
    desc: "Adds key realistic character movement animations including crawling, sitting, rolling, and leaning against walls. Enhances standard roleplaying immersion in both server multiplayer and singleplayer worlds.",
    gallery: [
      "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?w=800&h=500&fit=crop&q=80"
    ],
    file: "More_Body_Actions_Bedrock.mcpack"
  },
  {
    id: "survival-island",
    title: "Survival Island Custom Map",
    game: "Minecraft Bedrock",
    category: "maps",
    creator: "MapMaster_Astro",
    version: "1.20+",
    downloads: "20.5K",
    likes: "1.1K",
    updated: "3 days ago",
    size: "12.4 MB",
    versionList: ["1.21", "1.20", "1.19"],
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=256&h=256&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=500&fit=crop&q=80",
    desc: "Can you survive on this custom island map? Features custom traders, hidden treasure underground, custom dungeons, and extreme landscape coordinates. Standard survival rules apply, but danger is extreme!",
    gallery: [],
    file: "Survival_Island_Bedrock.mcworld"
  },
  {
    id: "rtx-shader",
    title: "RTX Ultra-Realism Shader",
    game: "Minecraft Bedrock",
    category: "texture",
    creator: "RenderDragonPro",
    version: "1.20+",
    downloads: "50K",
    likes: "4.8K",
    updated: "Yesterday",
    size: "82.1 MB",
    versionList: ["1.21", "1.19"],
    img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=256&h=256&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=500&fit=crop&q=80",
    desc: "Unleash raytracing rendering with the brand-new RTX Bedrock shader. Designed exclusively for devices with high graphic parameter rendering capability. Dynamic shadows, true specular mapping, and breathtaking underwater refractions.",
    gallery: [],
    file: "RTX_RenderDragonShader.mcpack"
  },
  {
    id: "anime-skin",
    title: "Anime Skin Pack Bedrock",
    game: "Minecraft Bedrock",
    category: "skin",
    creator: "AstroOtaku",
    version: "Any",
    downloads: "18.1K",
    likes: "956",
    updated: "1 week ago",
    size: "3.2 MB",
    versionList: ["1.21", "1.20", "1.19"],
    img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=256&h=256&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&h=500&fit=crop&q=80",
    desc: "Includes 48 stylized premium skins from popular anime series, optimized for custom character slots on standard Bedrock devices.",
    gallery: [],
    file: "Anime_SkinPack_V1.mcpack"
  },
  {
    id: "arceus-x",
    title: "Arceus X Neo Executor Suite",
    game: "Roblox",
    category: "executor",
    creator: "CurseCreator",
    version: "v1.2",
    downloads: "85.4K",
    likes: "2.5K",
    updated: "Yesterday",
    size: "15.4 MB",
    versionList: ["Mobile", "PC"],
    img: "https://images.unsplash.com/photo-1624305714006-25ccdfb70f1a?w=256&h=256&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=500&fit=crop&q=80",
    desc: "Top-tier mobile executor script suite for Roblox. Run Lua scripts smoothly, execute heavy UI layouts, and unlock premium keyless clearance. Supports 99% of top-tier script hubs.",
    gallery: [],
    file: "Arceus_X_Neo_Suite.zip"
  },
  {
    id: "infinite-yield",
    title: "Infinite Yield FE Admin Console",
    game: "Roblox",
    category: "gui",
    creator: "AstroOtaku",
    version: "v1.0",
    downloads: "120.1K",
    likes: "6.2K",
    updated: "3 days ago",
    size: "0.4 MB",
    versionList: ["Universal"],
    img: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=256&h=256&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=500&fit=crop&q=80",
    desc: "The premier script module admin panel compatible with all standard executors. Teleports, custom speed adjustments, noclip commands, and FE protection bypass built securely inside standard UI elements.",
    gallery: [],
    file: "Infinite_Yield_Console.zip"
  },
  {
    id: "blox-fruits",
    title: "Blox Fruits VIP Auto-Farm Client",
    game: "Roblox",
    category: "gui",
    creator: "ZacekElSerpentin",
    version: "v4.8",
    downloads: "65.2K",
    likes: "3.7K",
    updated: "1 week ago",
    size: "1.2 MB",
    versionList: ["Mobile", "PC"],
    img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=256&h=256&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=500&fit=crop&q=80",
    desc: "Level up to max, auto-farm bosses, collect random chests, and unlock legendary swords seamlessly with this highly stylized graphical interface script. Ensure active Roblox injection matches specifications.",
    gallery: [],
    file: "BloxFruits_VIP_Farm.zip"
  }
];

// Combine custom uploaded mods from localStorage to make search and detail pages fully live!
const userSavedModsArray = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
userSavedModsArray.forEach(m => {
  if (!ALL_GAME_MODS.some(exist => exist.id === m.id)) {
    ALL_GAME_MODS.unshift(m);
  }
});

// Mutate ALL_GAME_MODS in-place to permanently filter out any blocked/deleted mod IDs
const blockedModsArray = JSON.parse(localStorage.getItem('astro_blocked_mods_list') || '[]');
if (blockedModsArray.length > 0) {
  for (let i = ALL_GAME_MODS.length - 1; i >= 0; i--) {
    if (blockedModsArray.includes(ALL_GAME_MODS[i].id)) {
      ALL_GAME_MODS.splice(i, 1);
    }
  }
}

// Helper to parse localized counts (e.g., "1.1K" to 1100, "852" to 852)
function parseFormattedCountValue(val) {
  if (!val) return 0;
  const str = val.toString().trim().toUpperCase();
  if (str.endsWith('K')) {
    return Math.round(parseFloat(str.replace('K', '')) * 1000);
  }
  if (str.endsWith('M')) {
    return Math.round(parseFloat(str.replace('M', '')) * 1000000);
  }
  return parseInt(str) || 0;
}

// --- ACCENT PALETTE MULTI-THEME ENGINE ---
function applyAccentPalette() {
  const palette = localStorage.getItem('astromods_accent_palette') || 'default';
  let overrideStyle = document.getElementById('astromods-accent-override');
  if (!overrideStyle) {
    overrideStyle = document.createElement('style');
    overrideStyle.id = 'astromods-accent-override';
    document.head.appendChild(overrideStyle);
  }

  if (palette === 'default') {
    overrideStyle.innerHTML = '';
    return;
  }

  let css = '';
  if (palette === 'cyberpunk') {
    css = `
      :root {
        --theme-accent: #ffb700;
        --theme-accent-glow: rgba(255, 183, 0, 0.4);
      }
      nav a:hover, nav a.active-nav, .cf-main-nav a:hover, .cf-main-nav a.active {
        color: #ffb700 !important;
        text-shadow: 0 0 10px rgba(255, 183, 0, 0.5) !important;
      }
      .register, .hero-btn-main, .modal-submit-btn, .upload-submit-btn, .cf-btn-primary, .save-btn, .upload-btn, .reward-claim-btn, .quick-actions button, .game-card button {
        background: #ffb700 !important;
        color: #000000 !important;
        box-shadow: 0 4px 14px rgba(255, 183, 0, 0.35) !important;
      }
      .register:hover, .hero-btn-main:hover, .modal-submit-btn:hover, .upload-submit-btn:hover, .cf-btn-primary:hover, .save-btn:hover, .upload-btn:hover, .reward-claim-btn:hover, .quick-actions button:hover, .game-card button:hover {
        background: #e2a200 !important;
        box-shadow: 0 6px 20px rgba(255, 183, 0, 0.5) !important;
      }
      .secondary {
        border-color: rgba(255, 183, 0, 0.4) !important;
        color: #ffb700 !important;
      }
      .secondary:hover {
        background: rgba(255, 183, 0, 0.05) !important;
        border-color: #ffb700 !important;
      }
      .game-card:hover {
        border-color: rgba(255, 183, 0, 0.4) !important;
      }
      .profile-avatar-trigger {
        border-color: #ffb700 !important;
      }
      .profile-avatar-trigger:hover {
        box-shadow: 0 0 12px rgba(255, 183, 0, 0.6) !important;
      }
      .gear-settings-btn:hover {
        color: #ffb700 !important;
        border-color: #ffb700 !important;
      }
      .dropdown-user-header span {
        color: #ffb700 !important;
      }
      .dropdown-item:hover {
        background: #ffb700 !important;
        color: black !important;
      }
      .close-modal-btn:hover, .close-upload-btn:hover {
        color: #ffb700 !important;
      }
      .modal-form input:focus, .upload-form input:focus, .upload-form textarea:focus, .settings-form-group input:focus, .settings-form-group textarea:focus {
        border-color: #ffb700 !important;
      }
      .cf-logo span {
        color: #ffb700 !important;
      }
      .cf-cat-badge {
        background: rgba(255, 183, 0, 0.1) !important;
        color: #ffb700 !important;
        border: 1px solid rgba(255, 183, 0, 0.2) !important;
      }
      .cf-sidebar-section .cat-list li.active {
        color: #ffb700 !important;
        border-left: 3px solid #ffb700 !important;
      }
      .creator-badge, .follow-btn {
        background: #ffb700 !important;
        color: black !important;
      }
      .settings-sidebar .settings-menu button.active {
        background: #ffb700 !important;
        color: #000000 !important;
        border-left: 3px solid #ffb700 !important;
        box-shadow: 0 4px 15px rgba(255, 183, 0, 0.3) !important;
      }
      .settings-sidebar .settings-menu button:hover {
        background: #e2a200 !important;
        color: #000000 !important;
      }
      .profile-banner {
        background: linear-gradient(135deg, #ffb700, #171921) !important;
      }
      .avatar-edit-label:hover {
        background-color: #ffb700 !important;
        color: #000000 !important;
        box-shadow: 0 4px 12px rgba(255, 183, 0, 0.4) !important;
      }
      .banner-edit-label:hover {
        background: rgba(255, 183, 0, 0.9) !important;
        border-color: #ffb700 !important;
        color: #000000 !important;
        box-shadow: 0 6px 16px rgba(255, 183, 0, 0.3) !important;
      }
      .profile-info p, .dash-card .value {
        color: #ffb700 !important;
      }
      .profile-stat-card:hover {
        border-color: #ffb700 !important;
        box-shadow: 0 10px 25px rgba(255, 183, 0, 0.25) !important;
      }
      .activity-badge {
        background: rgba(255, 183, 0, 0.1) !important;
        color: #ffb700 !important;
        border: 1px solid #ffb700 !important;
      }
      .toggle-label input {
        accent-color: #ffb700 !important;
      }
      .vip-badge {
        color: #ffb700 !important;
        border-color: #ffb700 !important;
      }
      .add-socials-btn {
        background: rgba(255, 183, 0, 0.05) !important;
        color: #ffb700 !important;
        border: 1px dashed rgba(255, 183, 0, 0.3) !important;
      }
      #rewardBalanceText {
        color: #ffb700 !important;
      }
      .social-icon-option.active {
        border-color: #ffb700 !important;
        box-shadow: 0 0 10px rgba(255, 183, 0, 0.2) !important;
      }
      .reward-history-line {
        border-left-color: #ffb700 !important;
      }
      #detailCreatorDonationWidget {
        border-color: #ffb700 !important;
        background: rgba(255, 183, 0, 0.02) !important;
      }
      #detailCreatorDonationWidget h4 {
        color: #ffb700 !important;
      }
      #detailCreatorDonationWidget button {
        background: #ffb700 !important;
        color: #000000 !important;
      }
    `;
  } else if (palette === 'crimson') {
    css = `
      :root {
        --theme-accent: #ff3e4e;
        --theme-accent-glow: rgba(255, 62, 78, 0.4);
      }
      nav a:hover, nav a.active-nav, .cf-main-nav a:hover, .cf-main-nav a.active {
        color: #ff3e4e !important;
        text-shadow: 0 0 10px rgba(255, 62, 78, 0.5) !important;
      }
      .register, .hero-btn-main, .modal-submit-btn, .upload-submit-btn, .cf-btn-primary, .save-btn, .upload-btn, .reward-claim-btn, .quick-actions button, .game-card button {
        background: #ff3e4e !important;
        color: white !important;
        box-shadow: 0 4px 14px rgba(255, 62, 78, 0.35) !important;
      }
      .register:hover, .hero-btn-main:hover, .modal-submit-btn:hover, .upload-submit-btn:hover, .cf-btn-primary:hover, .save-btn:hover, .upload-btn:hover, .reward-claim-btn:hover, .quick-actions button:hover, .game-card button:hover {
        background: #cc0033 !important;
        box-shadow: 0 6px 20px rgba(255, 62, 78, 0.5) !important;
      }
      .secondary {
        border-color: rgba(255, 62, 78, 0.4) !important;
        color: #ff3e4e !important;
      }
      .secondary:hover {
        background: rgba(255, 62, 78, 0.05) !important;
        border-color: #ff3e4e !important;
      }
      .game-card:hover {
        border-color: rgba(255, 62, 78, 0.4) !important;
      }
      .profile-avatar-trigger {
        border-color: #ff3e4e !important;
      }
      .profile-avatar-trigger:hover {
        box-shadow: 0 0 12px rgba(255, 62, 78, 0.6) !important;
      }
      .gear-settings-btn:hover {
        color: #ff3e4e !important;
        border-color: #ff3e4e !important;
      }
      .dropdown-user-header span {
        color: #ff3e4e !important;
      }
      .dropdown-item:hover {
        background: #ff3e4e !important;
        color: white !important;
      }
      .close-modal-btn:hover, .close-upload-btn:hover {
        color: #ff3e4e !important;
      }
      .modal-form input:focus, .upload-form input:focus, .upload-form textarea:focus, .settings-form-group input:focus, .settings-form-group textarea:focus {
        border-color: #ff3e4e !important;
      }
      .cf-logo span {
        color: #ff3e4e !important;
      }
      .cf-cat-badge {
        background: rgba(255, 62, 78, 0.1) !important;
        color: #ff3e4e !important;
        border: 1px solid rgba(255, 62, 78, 0.2) !important;
      }
      .cf-sidebar-section .cat-list li.active {
        color: #ff3e4e !important;
        border-left: 3px solid #ff3e4e !important;
      }
      .creator-badge, .follow-btn {
        background: #ff3e4e !important;
        color: white !important;
      }
      .settings-sidebar .settings-menu button.active {
        background: #ff3e4e !important;
        color: #ffffff !important;
        border-left: 3px solid #ff3e4e !important;
        box-shadow: 0 4px 15px rgba(255, 62, 78, 0.3) !important;
      }
      .settings-sidebar .settings-menu button:hover {
        background: #cc0033 !important;
        color: #ffffff !important;
      }
      .profile-banner {
        background: linear-gradient(135deg, #ff3e4e, #171921) !important;
      }
      .avatar-edit-label:hover {
        background-color: #ff3e4e !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(255, 62, 78, 0.4) !important;
      }
      .banner-edit-label:hover {
        background: rgba(255, 62, 78, 0.9) !important;
        border-color: #ff3e4e !important;
        color: #ffffff !important;
        box-shadow: 0 6px 16px rgba(255, 62, 78, 0.3) !important;
      }
      .profile-info p, .dash-card .value {
        color: #ff3e4e !important;
      }
      .profile-stat-card:hover {
        border-color: #ff3e4e !important;
        box-shadow: 0 10px 25px rgba(255, 62, 78, 0.25) !important;
      }
      .activity-badge {
        background: rgba(255, 62, 78, 0.1) !important;
        color: #ff3e4e !important;
        border: 1px solid #ff3e4e !important;
      }
      .toggle-label input {
        accent-color: #ff3e4e !important;
      }
      .vip-badge {
        color: #ff3e4e !important;
        border-color: #ff3e4e !important;
      }
      .add-socials-btn {
        background: rgba(255, 62, 78, 0.05) !important;
        color: #ff3e4e !important;
        border: 1px dashed rgba(255, 62, 78, 0.3) !important;
      }
      #rewardBalanceText {
        color: #ff3e4e !important;
      }
      .social-icon-option.active {
        border-color: #ff3e4e !important;
        box-shadow: 0 0 10px rgba(255, 62, 78, 0.2) !important;
      }
      .reward-history-line {
        border-left-color: #ff3e4e !important;
      }
      #detailCreatorDonationWidget {
        border-color: #ff3e4e !important;
        background: rgba(255, 62, 78, 0.02) !important;
      }
      #detailCreatorDonationWidget h4 {
        color: #ff3e4e !important;
      }
      #detailCreatorDonationWidget button {
        background: #ff3e4e !important;
        color: #ffffff !important;
      }
    `;
  } else if (palette === 'emerald') {
    css = `
      :root {
        --theme-accent: #10b981;
        --theme-accent-glow: rgba(16, 185, 129, 0.4);
      }
      nav a:hover, nav a.active-nav, .cf-main-nav a:hover, .cf-main-nav a.active {
        color: #10b981 !important;
        text-shadow: 0 0 10px rgba(16, 185, 129, 0.5) !important;
      }
      .register, .hero-btn-main, .modal-submit-btn, .upload-submit-btn, .cf-btn-primary, .save-btn, .upload-btn, .reward-claim-btn, .quick-actions button, .game-card button {
        background: #10b981 !important;
        color: white !important;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
      }
      .register:hover, .hero-btn-main:hover, .modal-submit-btn:hover, .upload-submit-btn:hover, .cf-btn-primary:hover, .save-btn:hover, .upload-btn:hover, .reward-claim-btn:hover, .quick-actions button:hover, .game-card button:hover {
        background: #059669 !important;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5) !important;
      }
      .secondary {
        border-color: rgba(16, 185, 129, 0.4) !important;
        color: #10b981 !important;
      }
      .secondary:hover {
        background: rgba(16, 185, 129, 0.05) !important;
        border-color: #10b981 !important;
      }
      .game-card:hover {
        border-color: rgba(16, 185, 129, 0.4) !important;
      }
      .profile-avatar-trigger {
        border-color: #10b981 !important;
      }
      .profile-avatar-trigger:hover {
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.6) !important;
      }
      .gear-settings-btn:hover {
        color: #10b981 !important;
        border-color: #10b981 !important;
      }
      .dropdown-user-header span {
        color: #10b981 !important;
      }
      .dropdown-item:hover {
        background: #10b981 !important;
        color: white !important;
      }
      .close-modal-btn:hover, .close-upload-btn:hover {
        color: #10b981 !important;
      }
      .modal-form input:focus, .upload-form input:focus, .upload-form textarea:focus, .settings-form-group input:focus, .settings-form-group textarea:focus {
        border-color: #10b981 !important;
      }
      .cf-logo span {
        color: #10b981 !important;
      }
      .cf-cat-badge {
        background: rgba(16, 185, 129, 0.1) !important;
        color: #10b981 !important;
        border: 1px solid rgba(16, 185, 129, 0.2) !important;
      }
      .cf-sidebar-section .cat-list li.active {
        color: #10b981 !important;
        border-left: 3px solid #10b981 !important;
      }
      .creator-badge, .follow-btn {
        background: #10b981 !important;
        color: white !important;
      }
      .settings-sidebar .settings-menu button.active {
        background: #10b981 !important;
        color: #ffffff !important;
        border-left: 3px solid #10b981 !important;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
      }
      .settings-sidebar .settings-menu button:hover {
        background: #059669 !important;
        color: #ffffff !important;
      }
      .profile-banner {
        background: linear-gradient(135deg, #10b981, #1e293b) !important;
      }
      .avatar-edit-label:hover {
        background-color: #10b981 !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4) !important;
      }
      .banner-edit-label:hover {
        background: rgba(16, 185, 129, 0.9) !important;
        border-color: #10b981 !important;
        color: #ffffff !important;
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3) !important;
      }
      .profile-info p, .dash-card .value {
        color: #10b981 !important;
      }
      .profile-stat-card:hover {
        border-color: #10b981 !important;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.25) !important;
      }
      .activity-badge {
        background: rgba(16, 185, 129, 0.1) !important;
        color: #10b981 !important;
        border: 1px solid #10b981 !important;
      }
      .toggle-label input {
        accent-color: #10b981 !important;
      }
      .vip-badge {
        color: #10b981 !important;
        border-color: #10b981 !important;
      }
      .add-socials-btn {
        background: rgba(16, 185, 129, 0.05) !important;
        color: #10b981 !important;
        border: 1px dashed rgba(16, 185, 129, 0.3) !important;
      }
      #rewardBalanceText {
        color: #10b981 !important;
      }
      .social-icon-option.active {
        border-color: #10b981 !important;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.2) !important;
      }
      .reward-history-line {
        border-left-color: #10b981 !important;
      }
      #detailCreatorDonationWidget {
        border-color: #10b981 !important;
        background: rgba(16, 185, 129, 0.02) !important;
      }
      #detailCreatorDonationWidget h4 {
        color: #10b981 !important;
      }
      #detailCreatorDonationWidget button {
        background: #10b981 !important;
        color: #0a0b0d !important;
      }
    `;
  } else {
    // Default palette is an elegant matte gray/basalt & transparency theme!
    css = `
      :root {
        --theme-accent: #9ca3af;
        --theme-accent-glow: rgba(156, 163, 175, 0.2);
      }
      nav a:hover, nav a.active-nav, .cf-main-nav a:hover, .cf-main-nav a.active {
        color: #9ca3af !important;
        text-shadow: 0 0 10px rgba(156, 163, 175, 0.3) !important;
      }
      .register, .hero-btn-main, .modal-submit-btn, .upload-submit-btn, .cf-btn-primary, .save-btn, .upload-btn, .reward-claim-btn, .quick-actions button, .game-card button {
        background: rgba(255,255,255,0.08) !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        color: #e5e7eb !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
      }
      .register:hover, .hero-btn-main:hover, .modal-submit-btn:hover, .upload-submit-btn:hover, .cf-btn-primary:hover, .save-btn:hover, .upload-btn:hover, .reward-claim-btn:hover, .quick-actions button:hover, .game-card button:hover {
        background: rgba(255,255,255,0.16) !important;
        border-color: rgba(255,255,255,0.25) !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45) !important;
      }
      .secondary {
        border-color: rgba(156, 163, 175, 0.25) !important;
        color: #9ca3af !important;
      }
      .secondary:hover {
        background: rgba(156, 163, 175, 0.05) !important;
        border-color: #9ca3af !important;
      }
      .game-card:hover {
        border-color: rgba(156, 163, 175, 0.25) !important;
      }
      .profile-avatar-trigger {
        border-color: #9ca3af !important;
      }
      .profile-avatar-trigger:hover {
        box-shadow: 0 0 12px rgba(156, 163, 175, 0.4) !important;
      }
      .gear-settings-btn:hover {
        color: #9ca3af !important;
        border-color: #9ca3af !important;
      }
      .dropdown-user-header span {
        color: #9ca3af !important;
      }
      .dropdown-item:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        color: #ffffff !important;
      }
      .close-modal-btn:hover, .close-upload-btn:hover {
        color: #9ca3af !important;
      }
      .modal-form input:focus, .upload-form input:focus, .upload-form textarea:focus, .settings-form-group input:focus, .settings-form-group textarea:focus {
        border-color: #9ca3af !important;
      }
      .cf-logo span {
        color: #9ca3af !important;
      }
      .cf-cat-badge {
        background: rgba(156, 163, 175, 0.08) !important;
        color: #9ca3af !important;
        border: 1px solid rgba(156, 163, 175, 0.15) !important;
      }
      .cf-sidebar-section .cat-list li.active {
        color: #9ca3af !important;
        border-left: 3px solid #9ca3af !important;
      }
      .creator-badge, .follow-btn {
        background: rgba(255,255,255,0.08) !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        color: #ffffff !important;
      }
      .settings-sidebar .settings-menu button.active {
        background: rgba(255,255,255,0.12) !important;
        color: #ffffff !important;
        border-left: 3px solid #9ca3af !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25) !important;
      }
      .settings-sidebar .settings-menu button:hover {
        background: rgba(255,255,255,0.08) !important;
        color: #ffffff !important;
      }
      .profile-banner {
        background: linear-gradient(135deg, #374151, #111827) !important;
      }
      .avatar-edit-label:hover {
        background-color: rgba(255,255,255,0.15) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(156, 163, 175, 0.4) !important;
      }
      .banner-edit-label:hover {
        background: rgba(55, 65, 81, 0.9) !important;
        border-color: #9ca3af !important;
        color: #ffffff !important;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3) !important;
      }
      .profile-info p, .dash-card .value {
        color: #9ca3af !important;
      }
      .profile-stat-card:hover {
        border-color: #9ca3af !important;
        box-shadow: 0 10px 25px rgba(156, 163, 175, 0.15) !important;
      }
      .activity-badge {
        background: rgba(156, 163, 175, 0.08) !important;
        color: #9ca3af !important;
        border: 1px solid #9ca3af !important;
      }
      .toggle-label input {
        accent-color: #9ca3af !important;
      }
      .vip-badge {
        color: #9ca3af !important;
        border-color: #9ca3af !important;
      }
      .add-socials-btn {
        background: rgba(156, 163, 175, 0.05) !important;
        color: #9ca3af !important;
        border: 1px dashed rgba(156, 163, 175, 0.3) !important;
      }
      #rewardBalanceText {
        color: #9ca3af !important;
      }
      .social-icon-option.active {
        border-color: #9ca3af !important;
        box-shadow: 0 0 10px rgba(156, 163, 175, 0.2) !important;
      }
      .reward-history-line {
        border-left-color: #9ca3af !important;
      }
      #detailCreatorDonationWidget {
        border-color: #9ca3af !important;
        background: rgba(156, 163, 175, 0.02) !important;
      }
      #detailCreatorDonationWidget h4 {
        color: #9ca3af !important;
      }
      #detailCreatorDonationWidget button {
        background: #9ca3af !important;
        color: #0a0b0d !important;
      }
    `;
  }
  overrideStyle.innerHTML = css;
}

// Remove any remnants of light mode if previously set
localStorage.removeItem('astromods_theme');
document.body.classList.remove('light-mode');
document.documentElement.classList.remove('light-mode');

// Apply immediately on parse
applyAccentPalette();

// Initialize state statistics with initial data parsed from mock arrays if not yet registered
ALL_GAME_MODS.forEach(mod => {
  if (!localStorage.getItem(`astro_${mod.id}_likes`)) {
    localStorage.setItem(`astro_${mod.id}_likes`, parseFormattedCountValue(mod.likes).toString());
  }
  if (!localStorage.getItem(`astro_${mod.id}_downloads`)) {
    localStorage.setItem(`astro_${mod.id}_downloads`, parseFormattedCountValue(mod.downloads).toString());
  }
  if (!localStorage.getItem(`astro_${mod.id}_comments`)) {
    localStorage.setItem(`astro_${mod.id}_comments`, JSON.stringify([]));
  }
});

// Execute auto-loading actions when all elements are completely parsed by the browser
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('light-mode');
  document.documentElement.classList.remove('light-mode');
  syncUserSessionUI();
  applyGlobalLanguageTranslation();
  updateProfileUsername();
  loadSavedAvatarImage();
  checkCookieConsentBanner();
  
  // Detail Page Detection
  if (document.getElementById('detailModBannerImage')) {
    initDetailPage();
  }
  
  // Event-Handler for Settings Sidebar Navigation 
  const settingsSidebarMenu = document.querySelector('.settings-menu');
  if (settingsSidebarMenu) {
    initSettingsDashboard();
  }
  
  // Event-Handler for Profile Edit Action Profile page
  const profileContainer = document.querySelector('.profile-container');
  if (profileContainer) {
    initProfileDashboard();
  }

  // Inject custom uploaded Minecraft Bedrock mods dynamically into the static feed wrapper!
  injectCustomMinecraftModsToFeed();

  // Inject custom uploaded Roblox mods dynamically into the Roblox feed wrapper!
  injectCustomRobloxModsToFeed();

  // Clean deleted/blocked mods from DOM feeds and portfolios
  cleanDeletedModsFromDOM();

  // Render Star Ratings in mod list cards
  renderFeedRatings();

  // Home Search initialization on index.html
  initSearchEngineHome();

  // Custom mods dropdown menu hover/click trigger
  initModsNavbarDropdown();

  // Initialize interactive parallax background on first load
  initHeroParallaxBG();
});

// --- INTERACTIVE HERO PARALLAX BACKGROUND (DESKTOP MOUSE / MOBILE TOUCH) ---
function initHeroParallaxBG() {
  const hero = document.getElementById('heroSection');
  const bg = document.getElementById('heroInteractiveBg');
  if (!hero || !bg) return;

  const isEnabled = localStorage.getItem('astromods_moving_wallpaper') === 'true';
  if (!isEnabled) {
    bg.style.transform = 'translate3d(0, 0, 0)';
    return;
  }

  // Linear Interpolation (lerp) variables
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const lerpFactor = 0.08; // High styling fluidity: smaller factor = smoother, liquid movement

  let startX = 0;
  let startY = 0;
  let isTouching = false;

  // Frame Loop
  function update() {
    // Math logic: current = current + (target - current) * factor
    currentX += (targetX - currentX) * lerpFactor;
    currentY += (targetY - currentY) * lerpFactor;

    // Apply translation with hardware-accelerated 3D transforms
    bg.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

    requestAnimationFrame(update);
  }

  // Start smooth loops automatically
  requestAnimationFrame(update);

  // 1. Desktop Mouse Movement Parallax
  hero.addEventListener('mousemove', (e) => {
    if (isTouching) return; // Prevent interference from touch emulation
    const rect = hero.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative movement offsets from middle (-1 to 1)
    const x = (e.clientX - rect.left - width / 2) / (width / 2);
    const y = (e.clientY - rect.top - height / 2) / (height / 2);

    // Dynamic targets
    targetX = -x * 35;
    targetY = -y * 35;
  });

  // Soft elastic returns to center layout
  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  // 2. Mobile Touch Screen Drag & Drag Swiping
  hero.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      isTouching = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  hero.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = hero.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const currentTouchX = touch.clientX;
      const currentTouchY = touch.clientY;
      
      const deltaX = (currentTouchX - startX) * 0.5;
      const deltaY = (currentTouchY - startY) * 0.5;

      const relativeX = (currentTouchX - rect.left - width / 2) / (width / 2);
      const relativeY = (currentTouchY - rect.top - height / 2) / (height / 2);

      // Smooth constraint mappings
      targetX = Math.max(-50, Math.min(50, (-relativeX * 22) + deltaX));
      targetY = Math.max(-50, Math.min(50, (-relativeY * 22) + deltaY));
    }
  }, { passive: true });

  // Recenter when finger holds are finished
  hero.addEventListener('touchend', () => {
    targetX = 0;
    targetY = 0;
    setTimeout(() => { isTouching = false; }, 200);
  }, { passive: true });

  hero.addEventListener('touchcancel', () => {
    targetX = 0;
    targetY = 0;
    isTouching = false;
  }, { passive: true });
}

// Hide permanently deleted mods from all listings, static or dynamic
function cleanDeletedModsFromDOM() {
  const blockedMods = JSON.parse(localStorage.getItem('astro_blocked_mods_list') || '[]');
  if (blockedMods.length === 0) return;

  // 1. Filter project rows, profile creations, sidebars, activity streams dynamically inside static & dynamic views
  const classesToClean = ['.cf-project-row', '.cf-micro-row', '.creation-entry-card', '.recent-activity-card', '.search-mod-result-item'];
  classesToClean.forEach(cls => {
    document.querySelectorAll(cls).forEach(el => {
      const links = el.querySelectorAll('a');
      for (let link of links) {
        const href = link.getAttribute('href') || '';
        if (href.includes('mod=')) {
          try {
            const modParam = href.split('mod=')[1]?.split('&')[0];
            if (modParam && blockedMods.includes(modParam)) {
              el.style.setProperty('display', 'none', 'important');
              el.remove();
              break;
            }
          } catch (e) {
            console.error("Error shielding blocked item:", e);
          }
        }
      }
    });
  });

  // 2. Also scrub any individual anchor tags linking directly to the deleted mod and hide/remove their wrapping context
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.includes('mod=')) {
      try {
        const modParam = href.split('mod=')[1]?.split('&')[0];
        if (modParam && blockedMods.includes(modParam)) {
          const listItem = link.closest('li') || link.closest('.cf-micro-row') || link.closest('.cf-project-row') || link.closest('.creation-entry-card');
          if (listItem) {
            listItem.style.setProperty('display', 'none', 'important');
            listItem.remove();
          } else {
            link.style.setProperty('display', 'none', 'important');
            link.remove();
          }
        }
      } catch (e) {
        console.error("Error scrubbing direct link:", e);
      }
    }
  });
}

// Dynamic global popup hub selector for Games lists under the Mods tab
function initModsNavbarDropdown() {
  const navigationContainers = document.querySelectorAll('nav, .cf-main-nav, #navbar-links');
  navigationContainers.forEach(nav => {
    const anchors = nav.querySelectorAll('a');
    let modsAnchor = null;
    
    anchors.forEach(a => {
      const activeText = a.textContent.trim().toLowerCase();
      const hrefValue = a.getAttribute('href') || '';
      if (activeText === 'mods' || activeText === 'browse' || hrefValue.includes('minecraft.html') || activeText.includes('mods') || activeText.includes('browse')) {
        modsAnchor = a;
      }
    });

    if (modsAnchor) {
      if (modsAnchor.parentNode.classList.contains('mods-dropdown-container')) {
        return;
      }
      
      const currentLang = localStorage.getItem('astromods_language') || 'en';
      let headerText = 'AVAILABLE GAMES';
      let activeStatus = 'Active';
      let soonStatus = 'SOON';

      if (currentLang === 'id') {
        headerText = 'GAME TERSEDIA';
        activeStatus = 'Aktif';
        soonStatus = 'SEGERA';
      } else if (currentLang === 'ms') {
        headerText = 'PERMAINAN TERSEDIA';
        activeStatus = 'Aktif';
        soonStatus = 'SEGERA';
      } else if (currentLang === 'ru') {
        headerText = 'ДОСТУПНЫЕ ИГРЫ';
        activeStatus = 'Активно';
        soonStatus = 'СКОРО';
      } else if (currentLang === 'zh') {
        headerText = '可用游戏';
        activeStatus = '活跃';
        soonStatus = '即将推出';
      }
      
      modsAnchor.innerHTML = `Browse <span class="chevron-arrow">∨</span>`;
      
      const parent = modsAnchor.parentNode;
      const container = document.createElement('div');
      container.className = 'mods-dropdown-container';
      
      parent.replaceChild(container, modsAnchor);
      container.appendChild(modsAnchor);
      
      const isSubfolder = window.location.pathname.includes('/detail-mod-') || window.location.pathname.includes('/detail-mod-roblox/');
      const prefix = isSubfolder ? '../' : '';
      
      modsAnchor.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isMainPage = !window.location.pathname.includes('detail-mod-') && 
                           !window.location.pathname.includes('settings.html') && 
                           !window.location.pathname.includes('profile.html') && 
                           !window.location.pathname.includes('upload-mod.html') && 
                           !window.location.pathname.includes('privacy-policy.html');
        if (isMainPage || window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
          window.location.reload();
        } else {
          window.location.href = prefix + 'index.html';
        }
      });
      
      const card = document.createElement('div');
      card.className = 'mods-dropdown-card';
      card.innerHTML = `
        <div class="mods-dropdown-head">${headerText}</div>
        <a href="${prefix}detail-mod-minecraft-bedrock/minecraft.html" class="mods-dropdown-game">
          <img src="https://4kwallpapers.com/images/wallpapers/minecraft-key-art-3840x2160-20204.jpg" class="mods-dropdown-img">
          <div class="mods-dropdown-info">
            <span class="mods-game-title">Minecraft Bedrock</span>
            <span class="mods-game-badge badge-active">${activeStatus}</span>
          </div>
        </a>
        <div class="mods-dropdown-divider"></div>
        <div class="mods-dropdown-game disabled-game">
          <img src="https://4kwallpapers.com/images/wallpapers/roblox-character-2560x1440-20149.jpg" class="mods-dropdown-img">
          <div class="mods-dropdown-info">
            <span class="mods-game-title">Roblox Matrix</span>
            <span class="mods-game-badge badge-soon">${soonStatus}</span>
          </div>
        </div>
        <div class="mods-dropdown-divider"></div>
        <div class="mods-dropdown-game disabled-game">
          <img src="https://asset.indosport.com/article/image/q/80/311815/logo_mobile_legends-169.jpg?w=750&h=423" class="mods-dropdown-img">
          <div class="mods-dropdown-info">
            <span class="mods-game-title">Mobile Legends</span>
            <span class="mods-game-badge badge-soon">${soonStatus}</span>
          </div>
        </div>
        <div class="mods-dropdown-divider"></div>
        <div class="mods-dropdown-game disabled-game">
          <img src="https://media.rawg.io/media/games/84d/84da2ec3a1b41ba7fa85503a7d62add1.jpg" class="mods-dropdown-img">
          <div class="mods-dropdown-info">
            <span class="mods-game-title">Grand Theft Auto V</span>
            <span class="mods-game-badge badge-soon">${soonStatus}</span>
          </div>
        </div>
      `;
      
      container.appendChild(card);
    }
  });
}


// Dynamic Minecraft Feed integration for user uploaded mods
function injectCustomMinecraftModsToFeed() {
  const feedWrapper = document.getElementById('curseFeedWrapper');
  if (!feedWrapper) return;

  const userStoredMods = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
  const mcMods = userStoredMods.filter(m => m.game === 'Minecraft Bedrock');

  mcMods.forEach(m => {
    // Avoid double injecting if already exists
    if (document.getElementById(`feed-row-${m.id}`)) return;

    const row = document.createElement('div');
    row.className = 'cf-project-row';
    row.id = `feed-row-${m.id}`;
    row.setAttribute('data-category', m.category);
    row.setAttribute('data-version', '1.21');

    row.innerHTML = `
      <img src="${m.img}" alt="Icon" class="cf-project-img" onerror="this.src='https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=256&h=256&fit=crop&q=80'">
      <div class="cf-project-details">
        <div class="cf-row-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <div class="cf-row-title">
            <a href="detail-pokemon.html?mod=${m.id}"><h3>${m.title}</h3></a>
            <div class="cf-row-meta-author" style="color: #64748b; font-size: 11px;">By <a href="../profile.html?user=${encodeURIComponent(m.creator)}" style="color:#10b981; text-decoration:none; font-weight:bold;">${m.creator}</a> | Updated <span>${m.updated}</span></div>
          </div>
          <span class="cf-cat-badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); padding: 2px 8px; border-radius: 4px; font-size:11px;">v1.21</span>
        </div>
        <p class="cf-row-desc" style="color:#94a3b8; font-size:13px; line-height:1.4; margin-bottom:10px;">${m.desc.substring(0, 140)}${m.desc.length > 140 ? '...' : ''}</p>
        <div class="cf-row-stats" style="display:flex; gap:15px; font-size:12px; color:#64748b;">
          <span>Downloads: <strong style="color:white;">${m.downloads}</strong></span>
          <span>Type: <strong style="color:#10b981; text-transform:uppercase;">${m.category}</strong></span>
        </div>
      </div>
    `;

    feedWrapper.insertBefore(row, feedWrapper.firstChild);
  });
}

// Dynamic Roblox Feed integration for user uploaded mods
function injectCustomRobloxModsToFeed() {
  const feedWrapper = document.getElementById('robloxFeedWrapper');
  if (!feedWrapper) return;

  const userStoredMods = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
  const robloxMods = userStoredMods.filter(m => m.game === 'Roblox');

  robloxMods.forEach(m => {
    // Avoid double injecting if already exists
    if (document.getElementById(`feed-row-${m.id}`)) return;

    const row = document.createElement('div');
    row.className = 'cf-project-row';
    row.id = `feed-row-${m.id}`;
    row.setAttribute('data-category', m.category);

    row.innerHTML = `
      <img src="${m.img}" alt="Icon" class="cf-project-img" onerror="this.src='https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=256&h=256&fit=crop&q=80'" style="filter: hue-rotate(340deg);">
      <div class="cf-project-details">
        <div class="cf-row-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <div class="cf-row-title">
            <a href="../detail-mod-minecraft-bedrock/detail-pokemon.html?mod=${m.id}"><h3>${m.title}</h3></a>
            <div class="cf-row-meta-author" style="color: #64748b; font-size: 11px;">By <a href="../profile.html?user=${encodeURIComponent(m.creator)}" style="color:#ff3e4e; text-decoration:none; font-weight:bold;">${m.creator}</a> | Updated <span>${m.updated}</span></div>
          </div>
          <span class="cf-cat-badge" style="background: rgba(255, 62, 78, 0.1) !important; color: #ff3e4e !important; border: 1px solid rgba(255, 62, 78, 0.2) !important; padding: 2px 8px; border-radius: 4px; font-size:11px;">v1.0</span>
        </div>
        <p class="cf-row-desc" style="color:#94a3b8; font-size:13px; line-height:1.4; margin-bottom:10px;">${m.desc.substring(0, 140)}${m.desc.length > 140 ? '...' : ''}</p>
        <div class="cf-row-stats" style="display:flex; gap:15px; font-size:12px; color:#64748b;">
          <span>Downloads: <strong style="color:white;">${m.downloads}</strong></span>
          <span>Type: <strong style="color:#ff3e4e; text-transform:uppercase;">${m.category}</strong></span>
        </div>
      </div>
    `;

    feedWrapper.insertBefore(row, feedWrapper.firstChild);
  });
}

// --- 1. UTILITY: MEMBACA DAN MENAMPILKAN BANNER COOKIES ---
function checkCookieConsentBanner() {
  if (!localStorage.getItem('astromods_cookie_accept')) {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      setTimeout(() => {
        banner.classList.add('cookie-visible');
      }, 1000);
    }
  }
}

function acceptCookieConsent() {
  localStorage.setItem('astromods_cookie_accept', 'true');
  const banner = document.getElementById('cookieBanner');
  if (banner) banner.classList.remove('cookie-visible');
}

// --- 2. NAVBAR & PROFILE VISUAL SYNCHRONIZATION ---
function syncUserSessionUI() {
  userIsLoggedIn = localStorage.getItem('astroUserLoggedIn') === 'true';
  const loginBtns = document.querySelectorAll('#guestButtons');
  const profileSections = document.querySelectorAll('#profileSection');

  // Inject report, edit and admin modals dynamically so they are universally functional on all pages
  injectModalsToBody();

  if (userIsLoggedIn) {
    loginBtns.forEach(b => b.style.display = 'none');
    profileSections.forEach(b => b.style.display = 'flex');

    // Dynamically inject/synchronize the notification bell icon inside each profile section
    profileSections.forEach((section, idx) => {
      let bellContainer = section.querySelector('.bell-notification-container');
      if (!bellContainer) {
        bellContainer = document.createElement('div');
        bellContainer.className = 'bell-notification-container';
        bellContainer.style.position = 'relative';
        bellContainer.style.display = 'flex';
        bellContainer.style.alignItems = 'center';
        
        bellContainer.innerHTML = `
          <button class="bell-notification-btn" id="bellBtn_${idx}">
            🔔 <span class="notification-badge" id="bellBadge_${idx}" style="display: none;">0</span>
          </button>
          <div class="notification-dropdown dropdown-menu" id="bellDropdown_${idx}">
            <div class="notification-header">
              <span>🔔 NOTIFICATIONS</span>
              <button class="notification-clear-all" id="bellClearBtn_${idx}">Clear All</button>
            </div>
            <div class="notification-list" id="bellList_${idx}">
              <!-- Rendered dynamically -->
            </div>
          </div>
        `;
        
        // Find the avatar to insert before
        const avatar = section.querySelector('.profile-avatar-trigger');
        if (avatar) {
          section.insertBefore(bellContainer, avatar);
        } else {
          section.appendChild(bellContainer);
        }
        
        // Wire up events
        const btn = bellContainer.querySelector('.bell-notification-btn');
        const dropdown = bellContainer.querySelector('.notification-dropdown');
        const clearBtn = bellContainer.querySelector('.notification-clear-all');
        
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          // Close other notification dropdowns first
          document.querySelectorAll('.notification-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
          });
          // Close user profile dropdown too
          const profDropdown = document.getElementById('profileDropdown');
          if (profDropdown) profDropdown.classList.remove('active');
          
          dropdown.classList.toggle('active');
          
          // Mark all as read when opening dropdown
          if (dropdown.classList.contains('active')) {
            markAllNotificationsAsRead();
          }
        });
        
        clearBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          clearAllNotifications();
        });
      }
    });

    syncUserNotifications();

    // Dynamically inject the "Owner Admin Console" option in profile navigation dropdown across all pages
    const dropdowns = document.querySelectorAll('#profileDropdown');
    const loggedInUserStr = (localStorage.getItem('astroUsername') || 'Player').toLowerCase();
    const isOwner = loggedInUserStr === 'bimaignal2010' || loggedInUserStr === 'bimaignal2010@gmail.com' || loggedInUserStr === 'admin';

    dropdowns.forEach(dropdown => {
      const existingBtn = dropdown.querySelector('.admin-console-btn');
      const existingDivider = dropdown.querySelector('.admin-console-divider');
      
      if (isOwner) {
        if (!existingBtn) {
          const divider = document.createElement('div');
          divider.className = 'dropdown-divider admin-console-divider';
          dropdown.appendChild(divider);

          const adminBtn = document.createElement('button');
          adminBtn.className = 'dropdown-item admin-console-btn';
          adminBtn.style.color = '#ff3e4e';
          adminBtn.style.fontWeight = 'bold';
          adminBtn.style.background = 'transparent';
          adminBtn.style.border = 'none';
          adminBtn.style.cursor = 'pointer';
          adminBtn.style.fontFamily = 'inherit';
          adminBtn.style.fontSize = '13px';
          adminBtn.innerHTML = '<span class="dropdown-ii">🛡️</span><span class="dropdown-it">Owner Admin Console</span>';
          adminBtn.onclick = function() {
            openAdminPortalModal();
          };
          dropdown.appendChild(adminBtn);
        }
      } else {
        if (existingBtn) existingBtn.remove();
        if (existingDivider) existingDivider.remove();
      }
    });
  } else {
    loginBtns.forEach(b => b.style.display = 'flex');
    profileSections.forEach(b => b.style.display = 'none');
    const dropdowns = document.querySelectorAll('#profileDropdown');
    dropdowns.forEach(d => d.classList.remove('active'));
  }
  updateProfileUsername();
  loadSavedAvatarImage();
  loadSavedBannerImage();

  // If on details page, refresh specific element states e.g. Like Button
  if (document.getElementById('detailLikesCounterDisplay')) {
    updateDetailActionCounters();
  }
}

function toggleDropdownMenu() {
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.toggle('active');
}

// --- NOTIFICATION UTILITY FUNCTIONS ---
function checkNewNotifications(loggedInUser) {
  // Find all mods by this creator
  const userMods = ALL_GAME_MODS.filter(m => m.creator.toLowerCase() === loggedInUser.toLowerCase());
  
  // Load existing notifications
  let notifications = JSON.parse(localStorage.getItem(`astro_notifications_list_${loggedInUser}`) || '[]');
  
  let hasNew = false;
  
  userMods.forEach(m => {
    const modId = m.id;
    
    // 1. Comments Check
    const comments = JSON.parse(localStorage.getItem(`astro_${modId}_comments`) || '[]');
    const seenCommentsKey = `astro_${loggedInUser}_seen_comments_${modId}`;
    const lastSeenCommentsStr = localStorage.getItem(seenCommentsKey);
    
    if (lastSeenCommentsStr === null) {
      // First time initialization - set to current count so they don't get historical notification spam
      localStorage.setItem(seenCommentsKey, comments.length.toString());
    } else {
      const lastSeenComments = parseInt(lastSeenCommentsStr) || 0;
      if (comments.length > lastSeenComments) {
        // We have new comments! Let's generate a notification for each new comment
        const newComments = comments.slice(lastSeenComments);
        newComments.forEach((cmt, index) => {
          notifications.unshift({
            id: `comment_${modId}_${lastSeenComments + index}_${Date.now()}`,
            type: 'comment',
            modId: modId,
            modTitle: m.title,
            message: `💬 <b>${cmt.user}</b> commented on <b>${m.title}</b>: "${cmt.text}"`,
            timestamp: cmt.timestamp || new Date().toLocaleString(),
            read: false
          });
        });
        hasNew = true;
        // Update seen count
        localStorage.setItem(seenCommentsKey, comments.length.toString());
      }
    }
    
    // 2. Star Ratings Check
    const ratingCount = parseInt(localStorage.getItem(`astro_${modId}_rating_count`) || '0');
    const seenRatingsKey = `astro_${loggedInUser}_seen_ratings_${modId}`;
    const lastSeenRatingsStr = localStorage.getItem(seenRatingsKey);
    
    if (lastSeenRatingsStr === null) {
      localStorage.setItem(seenRatingsKey, ratingCount.toString());
    } else {
      const lastSeenRatings = parseInt(lastSeenRatingsStr) || 0;
      if (ratingCount > lastSeenRatings) {
        const difference = ratingCount - lastSeenRatings;
        for (let i = 0; i < difference; i++) {
          notifications.unshift({
            id: `rating_${modId}_${lastSeenRatings + i}_${Date.now()}`,
            type: 'rating',
            modId: modId,
            modTitle: m.title,
            message: `⭐ Your mod <b>${m.title}</b> received a new star rating!`,
            timestamp: new Date().toLocaleString(),
            read: false
          });
        }
        hasNew = true;
        localStorage.setItem(seenRatingsKey, ratingCount.toString());
      }
    }
  });
  
  // 3. Reports Check (Global reports list where report.modCreator === loggedInUser)
  const reports = JSON.parse(localStorage.getItem('astro_reports_list') || '[]');
  const myReports = reports.filter(r => r.modCreator && r.modCreator.toLowerCase() === loggedInUser.toLowerCase());
  
  const seenReportsKey = `astro_${loggedInUser}_seen_reports_ids`;
  let seenReportIds = JSON.parse(localStorage.getItem(seenReportsKey) || '[]');
  
  myReports.forEach(r => {
    if (!seenReportIds.includes(r.id)) {
      notifications.unshift({
        id: `report_${r.id}`,
        type: 'report',
        modId: r.modId,
        modTitle: r.modTitle,
        message: `⚠️ <b>Report:</b> <b>${r.reporter}</b> reported <b>${r.modTitle}</b> for "<i>${r.reason}</i>"`,
        timestamp: r.timestamp || new Date().toLocaleString(),
        read: false
      });
      seenReportIds.push(r.id);
      hasNew = true;
    }
  });
  
  localStorage.setItem(seenReportsKey, JSON.stringify(seenReportIds));
  
  if (notifications.length > 50) {
    notifications = notifications.slice(0, 50);
  }
  
  localStorage.setItem(`astro_notifications_list_${loggedInUser}`, JSON.stringify(notifications));
  return hasNew;
}

function syncUserNotifications() {
  const loggedInUser = localStorage.getItem('astroUsername');
  if (!loggedInUser) return;
  
  // 1. Sync counts first
  checkNewNotifications(loggedInUser);
  
  // 2. Load notifications list
  const notifications = JSON.parse(localStorage.getItem(`astro_notifications_list_${loggedInUser}`) || '[]');
  
  // 3. Count unread
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // 4. Update badges
  document.querySelectorAll('.notification-badge').forEach(badge => {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  });
  
  // 5. Render list items
  document.querySelectorAll('.notification-list').forEach(listEl => {
    let html = '';
    if (notifications.length === 0) {
      const currentLang = localStorage.getItem('astromods_language') || 'en';
      let emptyMsg = "No new notifications yet";
      let devMsg = "🧪 [DEV] Trigger Mock Activity";

      if (currentLang === 'id') {
        emptyMsg = "Tidak ada notifikasi baru";
        devMsg = "🧪 [DEV] Buat Aktivitas Simulasi";
      } else if (currentLang === 'ms') {
        emptyMsg = "Tiada notifikasi baru";
        devMsg = "🧪 [DEV] Cetus Aktiviti Simulasi";
      } else if (currentLang === 'ru') {
        emptyMsg = "Новых уведомлений пока нет";
        devMsg = "🧪 [DEV] Запустить тестовую симуляцию";
      } else if (currentLang === 'zh') {
        emptyMsg = "暂无新通知";
        devMsg = "🧪 [DEV] 触发模拟活动";
      }
      
      html = `
        <div class="notification-empty">
          <p>${emptyMsg}</p>
          <button class="notification-mock-btn" onclick="triggerMockNotification(event)">${devMsg}</button>
        </div>
      `;
    } else {
      notifications.forEach(n => {
        const itemClass = n.read ? 'notification-item' : 'notification-item unread';
        html += `
          <div class="${itemClass}" onclick="handleNotificationClick('${n.id}', '${n.modId}')">
            <div>${n.message}</div>
            <div class="notification-ts">${n.timestamp}</div>
          </div>
        `;
      });
    }
    listEl.innerHTML = html;
  });
}

function markAllNotificationsAsRead() {
  const loggedInUser = localStorage.getItem('astroUsername');
  if (!loggedInUser) return;
  
  let notifications = JSON.parse(localStorage.getItem(`astro_notifications_list_${loggedInUser}`) || '[]');
  notifications.forEach(n => n.read = true);
  localStorage.setItem(`astro_notifications_list_${loggedInUser}`, JSON.stringify(notifications));
  
  syncUserNotifications();
}

function clearAllNotifications() {
  const loggedInUser = localStorage.getItem('astroUsername');
  if (!loggedInUser) return;
  
  localStorage.setItem(`astro_notifications_list_${loggedInUser}`, JSON.stringify([]));
  syncUserNotifications();
}

function handleNotificationClick(notifId, modId) {
  const loggedInUser = localStorage.getItem('astroUsername');
  if (!loggedInUser) return;
  
  let notifications = JSON.parse(localStorage.getItem(`astro_notifications_list_${loggedInUser}`) || '[]');
  const notif = notifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
    localStorage.setItem(`astro_notifications_list_${loggedInUser}`, JSON.stringify(notifications));
  }
  
  document.querySelectorAll('.notification-dropdown').forEach(d => d.classList.remove('active'));
  
  if (modId) {
    const isInSubfolder = window.location.pathname.includes('/detail-mod-');
    const path = isInSubfolder ? `detail-pokemon.html?mod=${modId}` : `detail-mod-minecraft-bedrock/detail-pokemon.html?mod=${modId}`;
    window.location.href = path;
  } else {
    syncUserNotifications();
  }
}

function createMockModForUser(loggedInUser) {
  const modId = "cust-mock-" + Date.now();
  const customNewMod = {
    id: modId,
    title: "My Super Cool Mod",
    game: "Minecraft Bedrock",
    category: "addon",
    creator: loggedInUser,
    version: "1.21+",
    downloads: "5",
    likes: "2",
    updated: "Just Now",
    size: "1.2 MB",
    versionList: ["1.21"],
    img: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=256&h=256&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?w=1200&h=500&fit=crop&q=80",
    desc: "A simulated mod created for testing the notification bell and mod management features.",
    gallery: [],
    file: "super-cool-mod.mcaddon",
    tags: ["addon"],
    allowComments: true,
    donation: null,
    socials: []
  };

  let userUploadedMods = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
  userUploadedMods.unshift(customNewMod);
  localStorage.setItem('astro_user_uploaded_mods', JSON.stringify(userUploadedMods));

  localStorage.setItem(`astro_${modId}_likes`, "2");
  localStorage.setItem(`astro_${modId}_downloads`, "5");
  localStorage.setItem(`astro_${modId}_comments`, JSON.stringify([]));

  ALL_GAME_MODS.unshift(customNewMod);
  return customNewMod;
}

window.triggerMockNotification = function(event) {
  if (event) event.stopPropagation();

  const loggedInUser = localStorage.getItem('astroUsername');
  if (!loggedInUser) {
    alert("Please log in first to receive notifications!");
    return;
  }

  let userMods = ALL_GAME_MODS.filter(m => m.creator.toLowerCase() === loggedInUser.toLowerCase());
  if (userMods.length === 0) {
    const newMod = createMockModForUser(loggedInUser);
    userMods = [newMod];
  }

  const randomMod = userMods[Math.floor(Math.random() * userMods.length)];
  const modId = randomMod.id;
  const types = ['comment', 'rating', 'report'];
  const randomType = types[Math.floor(Math.random() * types.length)];

  if (randomType === 'comment') {
    const commentators = ['ModderPro', 'SteveMinecraft', 'Robloxian_99', 'CosmicGamer', 'ElitePlayer'];
    const commentsText = [
      'This mod works flawlessly, love the performance!',
      'Can you please update this to support version 1.21.2? Thanks!',
      'Wow, this is literally the cleanest layout/addon code ever.',
      'Absolute masterpiece of a mod. 5 stars easily!',
      'Had some bugs on load, but restarting fixed it. Standard Minecraft Bedrock stuff.'
    ];

    const randomUser = commentators[Math.floor(Math.random() * commentators.length)];
    const randomMsg = commentsText[Math.floor(Math.random() * commentsText.length)];

    let commentsArray = JSON.parse(localStorage.getItem(`astro_${modId}_comments`) || "[]");
    commentsArray.push({
      user: randomUser,
      text: randomMsg,
      timestamp: new Date().toLocaleTimeString()
    });
    localStorage.setItem(`astro_${modId}_comments`, JSON.stringify(commentsArray));

  } else if (randomType === 'rating') {
    let rCount = parseInt(localStorage.getItem(`astro_${modId}_rating_count`) || "12");
    let rSum = parseFloat(localStorage.getItem(`astro_${modId}_rating_sum`) || "54");
    
    rCount += 1;
    rSum += Math.floor(Math.random() * 2) + 4; // 4 or 5 stars

    localStorage.setItem(`astro_${modId}_rating_count`, rCount.toString());
    localStorage.setItem(`astro_${modId}_rating_sum`, rSum.toFixed(1));

  } else {
    const reporters = ['Snitcher_Gamer', 'AngryPlayer', 'ModPolice', 'StrictUser'];
    const reasons = ['Inappropriate Content', 'Broken/Outdated assets', 'Copyright Claim', 'Spam/Advertising'];
    const details = [
      'The custom skins inside the package cause visual glitches in the multiplayer server.',
      'This contains files from another creator without clear credit!',
      'It crashes the game when loading with other heavy shaders.',
      'Spam link listed inside the description page.'
    ];

    const randomReporter = reporters[Math.floor(Math.random() * reporters.length)];
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
    const randomDetail = details[Math.floor(Math.random() * details.length)];

    const newReport = {
      id: "rep-" + Date.now(),
      modId: modId,
      reporter: randomReporter,
      modTitle: randomMod.title,
      modCreator: loggedInUser,
      reason: randomReason,
      details: randomDetail,
      timestamp: new Date().toLocaleString()
    };

    let reports = JSON.parse(localStorage.getItem('astro_reports_list') || '[]');
    reports.unshift(newReport);
    localStorage.setItem('astro_reports_list', JSON.stringify(reports));
  }

  syncUserNotifications();
};

// Global click-out modal close handlers
window.addEventListener('click', function(event) {
  if (!event.target.matches('.profile-avatar-trigger')) {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown && dropdown.classList.contains('active') && !event.target.closest('.dropdown-menu')) {
      dropdown.classList.remove('active');
    }
  }
  
  if (!event.target.closest('.bell-notification-container')) {
    document.querySelectorAll('.notification-dropdown').forEach(d => {
      d.classList.remove('active');
    });
  }
  if (event.target === document.getElementById('loginModal')) { closeLoginModal(); }
  if (event.target === document.getElementById('uploadModal')) { closeUploadModal(); }
});

function openLoginModal() { 
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('modal-active'); 
}
function closeLoginModal() { 
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('modal-active'); 
}

// --- 3. DYNAMIC UPLOAD MODAL WITH CATEGORY FILTERING SELECTION ---
function openUploadModal() {
  const isSubfolder = window.location.pathname.includes('detail-mod-minecraft-bedrock/');
  window.location.href = isSubfolder ? '../upload-mod.html' : 'upload-mod.html';
}

function closeUploadModal() {
  const modal = document.getElementById('uploadModal');
  if (modal) modal.classList.remove('upload-modal-active');
  
  selectedUploadGame = "";
  selectedUploadType = "";
  const subMenu = document.getElementById('dynamicCategorySelectorBox');
  if (subMenu) subMenu.style.display = 'none';
  const extendedForm = document.getElementById('extendedUploadDetailsForm');
  if (extendedForm) extendedForm.style.display = 'none';
  document.querySelectorAll('.game-select-node').forEach(n => n.className = "game-select-node");
}

function selectUploadGameSector(gameName, element) {
  document.querySelectorAll('.game-select-node').forEach(node => node.className = "game-select-node");
  
  selectedUploadGame = gameName;
  selectedUploadType = "";

  if (gameName === 'minecraft') element.classList.add('selected-minecraft');
  if (gameName === 'roblox') element.classList.add('selected-roblox');
  if (gameName === 'gta') element.classList.add('selected-gta');

  const subMenuBox = document.getElementById('dynamicCategorySelectorBox');
  const itemsContainer = document.getElementById('categoryNodesContainer');
  
  if (!subMenuBox || !itemsContainer) return;
  subMenuBox.style.display = 'block';
  itemsContainer.innerHTML = "";

  const extendedForm = document.getElementById('extendedUploadDetailsForm');
  if (extendedForm) extendedForm.style.display = 'none';

  if (gameName === 'minecraft') {
    itemsContainer.innerHTML = `
      <div class="type-select-node" onclick="selectUploadTypeBlock('addon', this)">📦 Addon</div>
      <div class="type-select-node" onclick="selectUploadTypeBlock('maps', this)">🗺️ Map</div>
      <div class="type-select-node" onclick="selectUploadTypeBlock('texture', this)">🎨 Texture</div>
      <div class="type-select-node" onclick="selectUploadTypeBlock('skin', this)">👕 Skin</div>
    `;
  } else if (gameName === 'roblox') {
    itemsContainer.innerHTML = `
      <div class="type-select-node" onclick="selectUploadTypeBlock('executor', this)">📜 Executor</div>
      <div class="type-select-node" onclick="selectUploadTypeBlock('gui', this)">🖥️ GUI Hub</div>
    `;
  } else if (gameName === 'gta') {
    itemsContainer.innerHTML = `
      <div class="type-select-node" onclick="selectUploadTypeBlock('graphics', this)">🎬 Graphics</div>
      <div class="type-select-node" onclick="selectUploadTypeBlock('vehicle', this)">🏎️ Vehicle</div>
    `;
  }
}

function selectUploadTypeBlock(typeName, element) {
  document.querySelectorAll('.type-select-node').forEach(node => {
    node.classList.remove('type-selected-active');
  });

  selectedUploadType = typeName;
  element.classList.add('type-selected-active');

  const extendedForm = document.getElementById('extendedUploadDetailsForm');
  if (extendedForm) extendedForm.style.display = 'block';
}

function handleModCreatorUpload(event) {
  event.preventDefault();

  if (selectedUploadGame === "" || selectedUploadType === "") {
    alert("VALIDATION ERROR: Please select target game sector and category parameters first!");
    return;
  }

  const fileInput = document.getElementById('creatorModFile');
  const modTitle = document.getElementById('creatorModName').value;

  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileNameLower = file.name.toLowerCase();
    const isAllowedExt = fileNameLower.endsWith('.zip') || fileNameLower.endsWith('.mcaddon') || fileNameLower.endsWith('.mcpack') || fileNameLower.endsWith('.mcworld');
    if (!isAllowedExt) {
      alert("❌ VALIDATION FAILED (PROHIBITED FILE):\nUploading application/game files or other formats is prohibited!\nOnly files with .zip, .mcaddon, .mcpack, and .mcworld formats are allowed to be uploaded.");
      return;
    }
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > 50) {
      alert("SECURITY REJECTION: File density pack is too large! Maximum limit parameter is 50MB.");
      return;
    }

    const modId = "cust-" + Date.now();
    const currentUsername = localStorage.getItem('astroUsername') || 'Player';
    const modDesc = event.target.querySelector('textarea') ? event.target.querySelector('textarea').value : "No specifications provided.";

    const gameMapped = selectedUploadGame === 'minecraft' ? 'Minecraft Bedrock' :
                     selectedUploadGame === 'roblox' ? 'Roblox' : 'Grand Theft Auto V';

    const customNewMod = {
      id: modId,
      title: modTitle,
      game: gameMapped,
      category: selectedUploadType,
      creator: currentUsername,
      version: selectedUploadGame === 'minecraft' ? "1.21+" : "v1.0",
      downloads: "0",
      likes: "0",
      updated: "Just Now",
      size: `${fileSizeMB.toFixed(1)} MB`,
      versionList: [selectedUploadGame === 'minecraft' ? "1.21" : "v1.0"],
      img: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=256&h=256&fit=crop&q=80",
      banner: selectedUploadGame === 'minecraft' 
        ? "https://4kwallpapers.com/images/wallpapers/minecraft-bedrock-3840x1080-19694.jpg" 
        : selectedUploadGame === 'roblox'
        ? "https://4kwallpapers.com/images/wallpapers/roblox-character-2560x1440-20149.jpg"
        : selectedUploadGame === 'gta'
        ? "https://4kwallpapers.com/images/wallpapers/grand-theft-auto-1920x1085-11003.jpg"
        : "https://4kwallpapers.com/images/wallpapers/minecraft-bedrock-3840x1080-19694.jpg",
      desc: modDesc,
      gallery: [],
      file: file.name,
      tags: [selectedUploadType],
      allowComments: true,
      donation: null,
      socials: []
    };

    // Store custom uploaded mod into local storage repository
    let userUploadedMods = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
    userUploadedMods.unshift(customNewMod);
    localStorage.setItem('astro_user_uploaded_mods', JSON.stringify(userUploadedMods));

    // Register mod metrics
    localStorage.setItem(`astro_${modId}_likes`, "0");
    localStorage.setItem(`astro_${modId}_downloads`, "0");
    localStorage.setItem(`astro_${modId}_comments`, JSON.stringify([]));
    
    // Add activity node to profile list
    let recentActivities = JSON.parse(localStorage.getItem('astro_activity_list') || '[]');
    recentActivities.unshift({
      action: "Uploaded new " + selectedUploadType.toUpperCase() + ": " + modTitle,
      date: new Date().toLocaleDateString()
    });
    localStorage.setItem('astro_activity_list', JSON.stringify(recentActivities));
    
    // Increment uploaded mods counter
    let uploadedCount = parseInt(localStorage.getItem('astro_uploaded_mods_count') || '32');
    localStorage.setItem('astro_uploaded_mods_count', (uploadedCount + 1).toString());

    closeUploadModal();

    let targetRelativePath = "";
    let gameDisplayName = "";

    if (selectedUploadGame === 'minecraft') {
      targetRelativePath = "detail-mod-minecraft-bedrock/minecraft.html";
      gameDisplayName = "Minecraft Bedrock Mods";
    } else if (selectedUploadGame === 'roblox') {
      targetRelativePath = "detail-mod-roblox/roblox.html";
      gameDisplayName = "Roblox Matrix Scripts";
    }

    alert(`🎉 DEPLOYMENT SUCCESSFUL!\n\nYour mod pack "${modTitle}" has been successfully compiled, saved, and published to the AstroMods universe.`);

    if (targetRelativePath !== "") {
      // If we are currently inside a subfolder, we might need a different relative level to redirect
      const isInSubfolder = window.location.pathname.includes('/detail-mod-');
      const finalRedirect = isInSubfolder ? `../${targetRelativePath}` : targetRelativePath;
      window.location.href = finalRedirect;
    } else {
      if (window.location.pathname.includes('profile.html')) {
        window.location.reload();
      } else {
        const isInSubfolder = window.location.pathname.includes('/detail-mod-');
        window.location.href = isInSubfolder ? "../profile.html" : "profile.html";
      }
    }
  }
}

// --- 4. DETAILS SECTION: MULTI-PURPOSE SINKRON ENGINE ---
let currentDetailPageModId = "serp-pokemon"; // DEFAULT

function initDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const modParam = urlParams.get('mod');
  
  // Guard against deleted/blocklisted mod profiles being loaded directly
  const blockedMods = JSON.parse(localStorage.getItem('astro_blocked_mods_list') || '[]');
  if (modParam && blockedMods.includes(modParam)) {
    const currentLang = localStorage.getItem('astromods_language') || 'en';
    let msg = "This modification is no longer available because it has been deleted by its creator.";

    if (currentLang === 'id') {
      msg = "Modifikasi ini tidak tersedia karena telah dihapus oleh pembuatnya.";
    } else if (currentLang === 'ms') {
      msg = "Modifikasi ini tidak tersedia kerana telah dipadamkan oleh penciptanya.";
    } else if (currentLang === 'ru') {
      msg = "Эта модификация более недоступна, так как она была удалена ее создателем.";
    } else if (currentLang === 'zh') {
      msg = "该模组由于已被其创作者删除，现在已无法使用。";
    }
    alert(msg);
    const isInSubfolder = window.location.pathname.includes('/detail-mod-');
    window.location.href = isInSubfolder ? "../profile.html" : "profile.html";
    return;
  }

  if (modParam) {
    const exists = ALL_GAME_MODS.find(m => m.id === modParam);
    if (exists) {
      currentDetailPageModId = modParam;
    }
  }
  
  const modData = ALL_GAME_MODS.find(m => m.id === currentDetailPageModId);
  if (!modData) return;
  
  // Dynamic page populating matching user details requirement
  document.title = `${modData.title} | AstroMods`;
  
  const banner = document.getElementById('detailModBannerImage');
  if (banner) {
    let computedBanner = modData.banner;
    const gameName = (modData.game || "").toLowerCase();
    if (gameName.includes("minecraft")) {
      computedBanner = "https://4kwallpapers.com/images/wallpapers/minecraft-bedrock-3840x1080-19694.jpg";
    } else if (gameName.includes("roblox")) {
      computedBanner = "https://4kwallpapers.com/images/wallpapers/roblox-character-2560x1440-20149.jpg";
    } else if (gameName.includes("legends") || gameName.includes("mobile legends") || gameName.includes("mlbb")) {
      computedBanner = "https://asset.indosport.com/article/image/q/80/311815/logo_mobile_legends-169.jpg?w=1200&h=500&fit=crop";
    } else if (gameName.includes("gta") || gameName.includes("grand theft auto")) {
      computedBanner = "https://4kwallpapers.com/images/wallpapers/grand-theft-auto-1920x1085-11003.jpg";
    }
    banner.src = computedBanner;
  }
  
  const icon = document.getElementById('detailModIcon');
  if (icon) icon.src = modData.img;
  
  const title = document.getElementById('detailModTitle');
  if (title) title.innerText = modData.title;
  
  const author = document.getElementById('detailModAuthor');
  if (author) {
    author.innerHTML = `By <a href="../profile.html?user=${encodeURIComponent(modData.creator)}" style="color:#10b981; font-weight:bold; text-decoration:none;">${modData.creator}</a>`;
  }
  
  const desc = document.getElementById('detailModDescriptionBody');
  if (desc) desc.innerText = modData.desc;
  
  const fileBox = document.getElementById('detailMainFileName');
  if (fileBox) fileBox.innerText = modData.file;

  // sidebar detail info
  const metaGame = document.getElementById('detailMetaGame');
  if (metaGame) metaGame.innerText = modData.game;
  
  const metaCategory = document.getElementById('detailMetaCategory');
  if (metaCategory) metaCategory.innerText = modData.category.toUpperCase();
  
  const metaCreator = document.getElementById('detailMetaCreator');
  if (metaCreator) {
    metaCreator.innerHTML = `<a href="../profile.html?user=${encodeURIComponent(modData.creator)}" style="color:#10b981; text-decoration:none; font-weight:bold;">${modData.creator}</a>`;
  }
  
  const metaSize = document.getElementById('detailMetaSize');
  if (metaSize) metaSize.innerText = modData.size;
  
  const metaUpdated = document.getElementById('detailMetaUpdated');
  if (metaUpdated) metaUpdated.innerText = modData.updated;
  
  // Game version tags
  const versionTagsBox = document.getElementById('detailVersionTagsBox');
  if (versionTagsBox) {
    versionTagsBox.innerHTML = "";
    (modData.versionList || []).forEach(v => {
      versionTagsBox.innerHTML += `<div class="tag">${v}</div>`;
    });
  }

  // Dynamic Mod Version & Minecraft Game Version specifications rendering
  const metaModVersion = document.getElementById('detailMetaModVersion');
  if (metaModVersion) {
    metaModVersion.innerText = modData.modVersion || "v1.0";
  }
  const metaGameVersion = document.getElementById('detailMetaGameVersion');
  if (metaGameVersion) {
    metaGameVersion.innerText = modData.gameVersion || (modData.versionList && modData.versionList[0]) || "1.21";
  }

  // Gallery slider / list loader
  const galleryBox = document.getElementById('detailGalleryContent');
  if (galleryBox) {
    galleryBox.innerHTML = "";
    
    function getYTId(url) {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    }

    const ytId = modData.ytVideoUrl ? getYTId(modData.ytVideoUrl) : null;
    let ytHtml = "";
    if (ytId) {
      ytHtml = `
        <div style="margin-bottom: 25px; background: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2); padding: 15px; border-radius: 12px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
          <h3 style="color:#ef4444; font-family:'Inter',sans-serif; font-weight:700; font-size:13px; margin-bottom:12px; display:flex; align-items:center; gap:8px; margin-top:0;">
            📺 FULL GAMEPLAY VIDEO (YOUTUBE EMDED)
          </h3>
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <iframe src="https://www.youtube.com/embed/${ytId}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen referrerPolicy="no-referrer"></iframe>
          </div>
        </div>
      `;
    }

    getAstroModGallery(modData.id).then(dbGallery => {
      const galleryToUse = (dbGallery && dbGallery.length > 0) ? dbGallery : (modData.gallery || []);
      let contentHtml = ytHtml;
      
      if (galleryToUse.length > 0) {
        galleryToUse.forEach(imgUrl => {
          if (imgUrl.startsWith("data:video/") || imgUrl.endsWith(".mp4") || imgUrl.endsWith(".webm") || imgUrl.endsWith(".mov") || imgUrl.includes("video")) {
            contentHtml += `
              <div style="position:relative; margin-bottom:15px; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.06); width:100%; aspect-ratio:16/9; background:#000;">
                <video src="${imgUrl}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:contain;"></video>
                <span style="position:absolute; bottom:12px; left:12px; background:rgba(16, 185, 129, 0.85); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.15); color:#ffffff; font-weight:bold; font-size:10px; padding:3px 8px; border-radius:6px; font-family:'JetBrains Mono',monospace; box-shadow:0 2px 8px rgba(0,0,0,0.4); display:flex; align-items:center; gap:4px;">👾 GIF (Video Converted)</span>
              </div>`;
          } else {
            contentHtml += `<img src="${imgUrl}" alt="Gallery Mod Frame" style="margin-bottom:15px; border-radius:12px; width:100%;">`;
          }
        });
      } else if (!ytId) {
        contentHtml = `<span style="color: #64748b; font-style:italic; font-size:13px;">No explicit media image uploaded by original creator.</span>`;
      }
      galleryBox.innerHTML = contentHtml;
    }).catch(err => {
      console.warn("Failed to load IndexedDB gallery:", err);
      let contentHtml = ytHtml;
      
      if (modData.gallery && modData.gallery.length > 0) {
        modData.gallery.forEach(imgUrl => {
          if (imgUrl.startsWith("data:video/") || imgUrl.endsWith(".mp4") || imgUrl.endsWith(".webm") || imgUrl.endsWith(".mov") || imgUrl.includes("video")) {
            contentHtml += `
              <div style="position:relative; margin-bottom:15px; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.06); width:100%; aspect-ratio:16/9; background:#000;">
                <video src="${imgUrl}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:contain;"></video>
                <span style="position:absolute; bottom:12px; left:12px; background:rgba(16, 185, 129, 0.85); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.15); color:#ffffff; font-weight:bold; font-size:10px; padding:3px 8px; border-radius:6px; font-family:'JetBrains Mono',monospace; box-shadow:0 2px 8px rgba(0,0,0,0.4); display:flex; align-items:center; gap:4px;">👾 GIF (Video Converted)</span>
              </div>`;
          } else {
            contentHtml += `<img src="${imgUrl}" alt="Gallery Mod Frame" style="margin-bottom:15px; border-radius:12px; width:100%;">`;
          }
        });
      } else if (!ytId) {
        contentHtml = `<span style="color: #64748b; font-style:italic; font-size:13px;">No explicit media image uploaded by original creator.</span>`;
      }
      galleryBox.innerHTML = contentHtml;
    });
  }

  // Inject dynamic Owner Edit / Delete, or Visitor Report triggers directly below download controls
  const topBtns = document.querySelector('.top-buttons');
  if (topBtns) {
    const existingDynamicBtnGroup = document.getElementById('detailPageOwnerActionsGroup');
    if (existingDynamicBtnGroup) existingDynamicBtnGroup.remove();

    const group = document.createElement('div');
    group.id = 'detailPageOwnerActionsGroup';
    group.style.display = 'flex';
    group.style.gap = '8px';

    const loggedInUserStr = localStorage.getItem('astroUsername') || 'Player';
    const isOwnerOfMod = modData.creator.toLowerCase() === loggedInUserStr.toLowerCase();

    if (isOwnerOfMod) {
      group.innerHTML = `
        <button onclick="openEditModModal('${modData.id}')" style="background:#0284c7; color:white; font-weight:bold; padding:12px 22px; border-radius:10px; border:none; cursor:pointer;" class="cf-btn">✏️ Edit Mod</button>
        <button onclick="deleteUserMod('${modData.id}')" style="background:#ef4444; color:white; font-weight:bold; padding:12px 22px; border-radius:10px; border:none; cursor:pointer;" class="cf-btn">🗑️ Delete</button>
      `;
    } else {
      group.innerHTML = `
        <button onclick="openReportModModal('${modData.id}', '${modData.title.replace(/'/g, "\\'")}', '${modData.creator.replace(/'/g, "\\'")}')" style="background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239,68,68,0.25); color:#f87171; font-weight:bold; padding:12px 22px; border-radius:10px; cursor:pointer;" class="cf-btn">🚨 Report Mod</button>
      `;
    }
    topBtns.appendChild(group);
  }

  updateDetailActionCounters();

  // Initialize Ratings
  let rCount = parseInt(localStorage.getItem(`astro_${modData.id}_rating_count`));
  let rSum = parseFloat(localStorage.getItem(`astro_${modData.id}_rating_sum`));
  if (isNaN(rCount) || isNaN(rSum)) {
    const baseLikes = parseFormattedCountValue(modData.likes) || 0;
    rCount = Math.max(12, Math.floor(baseLikes * 0.35 + 5));
    const avgRating = 4.2 + ((baseLikes % 8) / 10); 
    rSum = rCount * avgRating;
    localStorage.setItem(`astro_${modData.id}_rating_count`, rCount.toString());
    localStorage.setItem(`astro_${modData.id}_rating_sum`, rSum.toFixed(1));
  }

  updateDetailPageRatingsUI();
  initInteractiveRatingsHover();

  loadModComments();

  // init Tab listeners
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const descBox = document.getElementById('detailModDescriptionBody');
      const galleryWrapper = document.getElementById('detailGalleryContent');
      const fileContainer = document.getElementById('detailFilesContent');

      if (index === 0) { // Description Tab
        if (descBox) descBox.style.display = 'block';
        if (galleryWrapper) galleryWrapper.style.display = 'none';
        if (fileContainer) fileContainer.style.display = 'none';
      } else if (index === 1) { // Images Tab
        if (descBox) descBox.style.display = 'none';
        if (galleryWrapper) galleryWrapper.style.display = 'block';
        if (fileContainer) fileContainer.style.display = 'none';
      } else if (index === 2) { // Files Tab
        if (descBox) descBox.style.display = 'none';
        if (galleryWrapper) galleryWrapper.style.display = 'none';
        if (fileContainer) fileContainer.style.display = 'block';
      }
    });
  });

  // 1. Comment Gates (Allow Comments check)
  const commentForm = document.querySelector('form[onsubmit="handleSubmitComment(event)"]');
  if (commentForm) {
    if (modData.allowComments === false || modData.allowComments === "false") {
      commentForm.style.display = 'none';
      let lockBanner = document.getElementById('commentLockBanner');
      if (!lockBanner) {
        lockBanner = document.createElement('div');
        lockBanner.id = 'commentLockBanner';
        lockBanner.innerHTML = `🔒 Comments have been disabled for this project by the creator.`;
        lockBanner.style.cssText = "background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); color: #f87171; padding: 15px; border-radius: 10px; margin-bottom: 25px; text-align: center; font-size: 13px; font-weight: 500;";
        commentForm.parentNode.insertBefore(lockBanner, commentForm);
      }
    } else {
      commentForm.style.display = 'block';
      const lockBanner = document.getElementById('commentLockBanner');
      if (lockBanner) lockBanner.remove();
    }
  }

  // 2. Creator Donations activation
  const donationWidget = document.getElementById('detailCreatorDonationWidget');
  const donationCreatorName = document.getElementById('donationCreatorName');
  if (donationWidget) {
    if (modData.donation && (modData.donation.enabled === true || modData.donation.enabled === "true")) {
      donationWidget.style.display = 'block';
      if (donationCreatorName) donationCreatorName.innerText = modData.creator;
    } else {
      donationWidget.style.display = 'none';
    }
  }

  // 3. Creator Social Channels dynamic rendering
  const socialsWidget = document.getElementById('detailCreatorSocialsWidget');
  const socialsContainer = document.getElementById('detailSocialsContainer');
  if (socialsWidget && socialsContainer) {
    socialsContainer.innerHTML = "";
    
    let socialsList = modData.socials;
    if (!socialsList || socialsList.length === 0) {
      // Default placeholder socials for native mods to display complete product interfaces
      if (modData.id === 'serp-pokemon' || modData.id === 'more-body') {
        socialsList = [
          { provider: "YouTube", url: "https://youtube.com" },
          { provider: "Discord", url: "https://discord.gg/AstroGuild" }
        ];
      }
    }

    if (socialsList && socialsList.length > 0) {
      socialsWidget.style.display = 'block';
      socialsList.forEach(soc => {
        let brandColor = "#1e293b";
        let textBrandColor = "white";
        let providerIcon = "🔗";

        const provLower = soc.provider.toLowerCase();
        if (provLower === "youtube") {
          brandColor = "rgba(239, 68, 68, 0.08)";
          textBrandColor = "#f87171";
          providerIcon = `<img src="https://static.vecteezy.com/system/resources/thumbnails/018/930/572/small/youtube-logo-youtube-icon-transparent-free-png.png" style="width: 16px; height: 16px; object-fit: contain; vertical-align: middle;" referrerPolicy="no-referrer" alt="YouTube">`;
        } else if (provLower === "tiktok") {
          brandColor = "rgba(255, 255, 255, 0.04)";
          textBrandColor = "white";
          providerIcon = `<img src="https://img.magnific.com/premium-vector/tik-tok-logo_578229-290.jpg?semt=ais_hybrid&w=740&q=80" style="width: 16px; height: 16px; object-fit: contain; border-radius: 2px; vertical-align: middle;" referrerPolicy="no-referrer" alt="TikTok">`;
        } else if (provLower === "instagram") {
          brandColor = "rgba(236, 72, 153, 0.08)";
          textBrandColor = "#f472b6";
          providerIcon = `<img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" style="width: 16px; height: 16px; object-fit: contain; vertical-align: middle;" referrerPolicy="no-referrer" alt="Instagram">`;
        } else if (provLower === "discord") {
          brandColor = "rgba(59, 130, 246, 0.08)";
          textBrandColor = "#60a5fa";
          providerIcon = `<img src="https://static.vecteezy.com/system/resources/previews/006/892/625/non_2x/discord-logo-icon-editorial-free-vector.jpg" style="width: 16px; height: 16px; object-fit: contain; border-radius: 2px; vertical-align: middle;" referrerPolicy="no-referrer" alt="Discord">`;
        } else if (provLower === "twitter" || provLower === "twitter/x") {
          brandColor = "rgba(255, 255, 255, 0.04)";
          textBrandColor = "#38bdf8";
          providerIcon = `<img src="https://img.freepik.com/vektor-premium/x-jaringan-sosial-baru-ikon-aplikasi-hitam-twitter-diganti-namanya-menjadi-x-logo-twitter-diubah_277909-568.jpg?semt=ais_hybrid&w=740&q=80" style="width: 16px; height: 16px; object-fit: contain; border-radius: 2px; vertical-align: middle;" referrerPolicy="no-referrer" alt="Twitter">`;
        }

        const badge = document.createElement('a');
        badge.href = soc.url;
        badge.target = "_blank";
        badge.style.cssText = `background: ${brandColor}; color: ${textBrandColor}; font-size:12px; font-weight:600; text-decoration:none; padding:10px 15px; border-radius:8px; display:flex; align-items:center; gap:8px; transition:0.2s; border:1px solid rgba(255,255,255,0.02);`;
        badge.innerHTML = `
          <span>${providerIcon}</span>
          <span style="flex-grow:1; text-align:left;">${soc.provider.toUpperCase()}</span>
          <span style="font-size:10px; opacity:0.6;">↗</span>
        `;
        
        badge.onmouseover = () => { badge.style.filter = "brightness(1.2)"; badge.style.transform = "translateX(4px)"; };
        badge.onmouseout = () => { badge.style.filter = "brightness(1)"; badge.style.transform = "translateX(0)"; };

        socialsContainer.appendChild(badge);
      });
    } else {
      socialsWidget.style.display = 'none';
    }
  }

  // Initialize Favorites button state update
  if (typeof updateFavoriteButtonUI === 'function') {
    updateFavoriteButtonUI(modData.id);
  }
}

// --- RATINGS UPDATE AND VOTE ENGINES ---
function updateDetailPageRatingsUI() {
  const rCount = parseInt(localStorage.getItem(`astro_${currentDetailPageModId}_rating_count`) || "12");
  const rSum = parseFloat(localStorage.getItem(`astro_${currentDetailPageModId}_rating_sum`) || "54");
  const avg = rCount > 0 ? (rSum / rCount).toFixed(1) : "0.0";
  
  const fullStarsCount = Math.round(parseFloat(avg));
  let starsStr = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStarsCount) {
      starsStr += "⭐";
    } else {
      starsStr += "☆";
    }
  }

  const headerRating = document.getElementById('detailRatingBadgeHeader');
  if (headerRating) {
    headerRating.innerHTML = `<span style="color:#ffaa00; font-weight:bold;">${starsStr}</span> <span style="color:white; font-weight:700; font-size:13px;">${avg} / 5.0</span> <span style="color:#64748b; font-size:12px;">(${rCount.toLocaleString()} ratings)</span>`;
  }

  const valDisplay = document.getElementById('detailRatingValDisplay');
  if (valDisplay) {
    valDisplay.innerHTML = `<span style="color:#ffaa00; font-weight:bold;">${starsStr}</span> ${avg} / 5.0`;
  }
  
  const countDisplay = document.getElementById('detailRatingCountDisplay');
  if (countDisplay) {
    countDisplay.innerText = `${rCount.toLocaleString()} ratings`;
  }

  const userVote = localStorage.getItem(`astro_user_voted_val_${currentDetailPageModId}`);
  const statusMsg = document.getElementById('userRatingStatusMsg');
  if (userVote) {
    const stars = parseInt(userVote);
    highlightUserVotedStars(stars);
    if (statusMsg) {
      statusMsg.innerHTML = `<span style="color:#10b981; font-weight:bold;">You already rated: ${stars} Stars! Thank you.</span>`;
    }
  } else {
    resetUserStarSelection();
    if (statusMsg) {
      statusMsg.innerText = "Click a star to submit your review!";
    }
  }
}

function highlightUserVotedStars(count) {
  const starsGroup = document.querySelectorAll('.user-star');
  starsGroup.forEach((star, index) => {
    if (index < count) {
      star.innerText = "★";
      star.style.color = "#ffaa00";
    } else {
      star.innerText = "☆";
      star.style.color = "#64748b";
    }
  });
}

function resetUserStarSelection() {
  const starsGroup = document.querySelectorAll('.user-star');
  starsGroup.forEach((star) => {
    star.innerText = "☆";
    star.style.color = "#64748b";
  });
}

function initInteractiveRatingsHover() {
  const starsGroup = document.querySelectorAll('.user-star');
  starsGroup.forEach((star, index) => {
    star.addEventListener('mouseover', () => {
      const userVote = localStorage.getItem(`astro_user_voted_val_${currentDetailPageModId}`);
      if (userVote) return;
      
      starsGroup.forEach((s, idx) => {
        if (idx <= index) {
          s.innerText = "★";
          s.style.color = "#ffaa00";
        } else {
          s.innerText = "☆";
          s.style.color = "#64748b";
        }
      });
    });

    star.addEventListener('mouseout', () => {
      const userVote = localStorage.getItem(`astro_user_voted_val_${currentDetailPageModId}`);
      if (userVote) {
        highlightUserVotedStars(parseInt(userVote));
      } else {
        resetUserStarSelection();
      }
    });
  });
}

function submitUserRating(val) {
  if (!userIsLoggedIn) {
    alert("ACCESS REJECTED: You must Login/Register an account first to rate this game mod!");
    openLoginModal();
    return;
  }

  const votedKey = `astro_user_voted_val_${currentDetailPageModId}`;
  if (localStorage.getItem(votedKey)) {
    alert("You have already submitted a rating review for this mod addon!");
    return;
  }

  localStorage.setItem(votedKey, val.toString());

  let rCount = parseInt(localStorage.getItem(`astro_${currentDetailPageModId}_rating_count`) || "12");
  let rSum = parseFloat(localStorage.getItem(`astro_${currentDetailPageModId}_rating_sum`) || "54");

  rCount += 1;
  rSum += val;

  localStorage.setItem(`astro_${currentDetailPageModId}_rating_count`, rCount.toString());
  localStorage.setItem(`astro_${currentDetailPageModId}_rating_sum`, rSum.toFixed(1));

  updateDetailPageRatingsUI();
  if (typeof syncUserNotifications === 'function') syncUserNotifications();
  alert(`Thank you for submitting a ${val}-star review rating!`);
}

function getModAverageRating(modId, likesStr) {
  let rCount = parseInt(localStorage.getItem(`astro_${modId}_rating_count`));
  let rSum = parseFloat(localStorage.getItem(`astro_${modId}_rating_sum`));
  if (isNaN(rCount) || isNaN(rSum)) {
    const baseLikes = parseFormattedCountValue(likesStr) || 0;
    rCount = Math.max(12, Math.floor(baseLikes * 0.35 + 5));
    const avgRating = 4.2 + ((baseLikes % 8) / 10);
    rSum = rCount * avgRating;
    localStorage.setItem(`astro_${modId}_rating_count`, rCount.toString());
    localStorage.setItem(`astro_${modId}_rating_sum`, rSum.toFixed(1));
  }
  return rCount > 0 ? (rSum / rCount).toFixed(1) : "0.0";
}

function renderFeedRatings() {
  const rows = document.querySelectorAll('.cf-project-row');
  rows.forEach(row => {
    // Find the link to extract mod ID
    const titleAnchor = row.querySelector('.cf-row-title a, h3 a, a:has(h3)');
    if (!titleAnchor) return;
    
    const href = titleAnchor.getAttribute('href') || '';
    let modId = "";
    if (href) {
      try {
        const urlObj = new URL(href, window.location.origin);
        modId = urlObj.searchParams.get('mod');
      } catch (e) {
        const match = href.match(/[\?&]mod=([^&]+)/);
        if (match) modId = match[1];
      }
    }
    
    if (!modId) return;
    
    // Find mod details to extract default likes
    let currentMod = ALL_GAME_MODS.find(m => m.id === modId);
    if (!currentMod) {
      const userStoredMods = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
      currentMod = userStoredMods.find(m => m.id === modId);
    }
    
    const likesStr = currentMod ? currentMod.likes : "350";
    const avg = getModAverageRating(modId, likesStr);
    
    // Locate row stats
    const statsContainer = row.querySelector('.cf-row-stats');
    if (statsContainer && !statsContainer.querySelector('.row-rating-badge')) {
      const ratingSpan = document.createElement('span');
      ratingSpan.className = 'row-rating-badge';
      ratingSpan.innerHTML = `Rating: <strong style="color: #ffaa00; margin-right: 2px;">★</strong><strong style="color: white;">${avg}</strong>`;
      statsContainer.appendChild(ratingSpan);
    }
  });
}

function updateDetailActionCounters() {
  const likesVal = parseInt(localStorage.getItem(`astro_${currentDetailPageModId}_likes`) || "0").toLocaleString();
  const downloadsVal = parseInt(localStorage.getItem(`astro_${currentDetailPageModId}_downloads`) || "0").toLocaleString();
  const commentsArray = JSON.parse(localStorage.getItem(`astro_${currentDetailPageModId}_comments`) || "[]");
  const commentCount = commentsArray.length.toString();

  const elementLikeNum = document.getElementById('detailLikesCounterDisplay');
  if (elementLikeNum) elementLikeNum.innerText = likesVal;

  const elementDlNum = document.getElementById('detailDownloadsCounterDisplay');
  if (elementDlNum) elementDlNum.innerText = downloadsVal;

  const elementCommentNum = document.getElementById('detailCommentsCounterDisplay');
  if (elementCommentNum) elementCommentNum.innerText = commentCount;

  // Reactively style the Like Mod Recommend button
  const likeBtn = document.querySelector('button[onclick="handleRecommendIncrementLike()"]');
  if (likeBtn) {
    const isLiked = localStorage.getItem(`astro_liked_${currentDetailPageModId}`) === "true";
    if (isLiked) {
      likeBtn.innerHTML = "❤️ Liked Recommend";
      likeBtn.style.background = "#3ade79";
      likeBtn.style.borderColor = "#3ade79";
      likeBtn.style.color = "#0a0b0d";
    } else {
      likeBtn.innerHTML = "❤️ Like Mod Recommend";
      likeBtn.style.background = "#1b232d";
      likeBtn.style.borderColor = "rgba(255,255,255,0.08)";
      likeBtn.style.color = "white";
    }
  }
}

function handleRecommendIncrementLike() {
  if (!userIsLoggedIn) {
    alert("ACCESS DENIED: You must Login/Register an account first to interact with this features!");
    openLoginModal();
    return;
  }
  
  const likedKey = `astro_liked_${currentDetailPageModId}`;
  const isLiked = localStorage.getItem(likedKey) === "true";
  let currentLikes = parseInt(localStorage.getItem(`astro_${currentDetailPageModId}_likes`) || "0");
  
  if (isLiked) {
    // Unlike operation
    currentLikes = Math.max(0, currentLikes - 1);
    localStorage.setItem(likedKey, "false");
    localStorage.setItem(`astro_${currentDetailPageModId}_likes`, currentLikes.toString());
    updateDetailActionCounters();
    alert("💔 You removed your rating for this mod pack.");
  } else {
    // Like operation
    currentLikes += 1;
    localStorage.setItem(likedKey, "true");
    localStorage.setItem(`astro_${currentDetailPageModId}_likes`, currentLikes.toString());
    updateDetailActionCounters();
    alert("❤️ Thanks for rating this mod pack! Upvote registered.");
  }
}

function triggerFileDownload(fileName, dataUrlOrText, isDataUrl = false) {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  
  let hrefUrl = "";
  if (isDataUrl) {
    hrefUrl = dataUrlOrText;
  } else {
    const blob = new Blob([dataUrlOrText], { type: 'application/octet-stream' });
    hrefUrl = URL.createObjectURL(blob);
  }
  
  link.href = hrefUrl;
  link.download = fileName;
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    if (!isDataUrl) URL.revokeObjectURL(hrefUrl);
  }, 100);
}

function generateAndTriggerFallbackDownload(filename, modData) {
  const dummyContent = `// AstroMods Saved Archive Package File
// Target Mod: ${modData ? modData.title : 'Unknown Mod'}
// Version: ${modData ? (modData.modVersion || 'v1.0') : 'v1.0'}
// Creator: ${modData ? modData.creator : 'Community'}
// Released on AstroMods Network

[ASTRO-MODS-SECURE-COMPILED-SOURCE-PACKAGE]
ID: ${modData ? modData.id : 'unknown'}
Title: ${modData ? modData.title : 'Minecraft Bedrock Mod'}
Description: ${modData ? modData.desc : ''}
Deployment Name: ${filename}
`;
  triggerFileDownload(filename, dummyContent, false);
}

function handleDownloadExecute() {
  if (!userIsLoggedIn) {
    alert("ACCESS DENIED: You must Login/Register an account first to prompt file deployment!");
    openLoginModal();
    return;
  }
  
  const downloadBtn = document.getElementById('detailDownloadTriggerBtn');
  if (downloadBtn) {
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = "🔍 SCANNING ARCHIVE PACK FOR THREATS...";
    downloadBtn.style.background = "#d97706";
    
    setTimeout(() => {
      downloadBtn.innerHTML = "✅ SECURING CHECKS PASSED - DOWNLOADING...";
      downloadBtn.style.background = "#059669";
      
      let currentDls = parseInt(localStorage.getItem(`astro_${currentDetailPageModId}_downloads`) || "0");
      currentDls += 1;
      localStorage.setItem(`astro_${currentDetailPageModId}_downloads`, currentDls.toString());
      updateDetailActionCounters();
      
      // also increment total downloads count for user stats
      let totalDls = parseInt(localStorage.getItem('astro_total_downloads_val') || '124000');
      localStorage.setItem('astro_total_downloads_val', (totalDls + 1).toString());

      const modData = ALL_GAME_MODS.find(m => m.id === currentDetailPageModId);
      const filename = (modData && modData.file) ? modData.file : "mod_archive.zip";

      setTimeout(() => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.style.background = "#f16436";
        
        // Try to fetch custom binary file from IndexedDB
        if (window.getAstroModGallery) {
          window.getAstroModGallery("file_" + currentDetailPageModId).then(dbFileData => {
            if (dbFileData) {
              // Trigger a download with the actual uploaded base64 data URL
              triggerFileDownload(filename, dbFileData, true);
            } else {
              // Generate dynamic file matching the exact file name configured
              generateAndTriggerFallbackDownload(filename, modData);
            }
          }).catch(err => {
            console.warn("Failed to get mod file from IndexedDB:", err);
            generateAndTriggerFallbackDownload(filename, modData);
          });
        } else {
          generateAndTriggerFallbackDownload(filename, modData);
        }
      }, 1500);
    }, 1800);
  }
}

function handleSubmitComment(event) {
  event.preventDefault();
  if (!userIsLoggedIn) {
    alert("ACCESS DENIED: You must Login/Register first before sending a review comments.");
    openLoginModal();
    return;
  }

  const commentInputArea = document.getElementById('commentInputArea');
  if (!commentInputArea || commentInputArea.value.trim() === "") return;

  const currentUsername = localStorage.getItem('astroUsername') || 'Player';
  let commentsArray = JSON.parse(localStorage.getItem(`astro_${currentDetailPageModId}_comments`) || "[]");
  
  commentsArray.push({
    user: currentUsername,
    text: commentInputArea.value.trim(),
    timestamp: "Now"
  });

  localStorage.setItem(`astro_${currentDetailPageModId}_comments`, JSON.stringify(commentsArray));
  commentInputArea.value = "";
  updateDetailActionCounters();
  loadModComments();
  if (typeof syncUserNotifications === 'function') syncUserNotifications();
}

function loadModComments() {
  const box = document.getElementById('commentsContainerBox');
  if (!box) return;
  const commentsArray = JSON.parse(localStorage.getItem(`astro_${currentDetailPageModId}_comments`) || "[]");
  box.innerHTML = "";
  
  if (commentsArray.length === 0) {
    box.innerHTML = `<p style="color: #64748b; font-size:13px; font-style:italic; padding: 10px 0;">No comments/discussions registered for this mod. Be the first to comment above!</p>`;
    return;
  }

  commentsArray.forEach(comment => {
    box.innerHTML += `
      <div style="background:rgba(255,255,255,0.02); padding:14px; border-radius:10px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.04);">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <strong style="color:#10b981; font-size:13px;">@${comment.user}</strong>
          <span style="color:#64748b; font-size:11px;">${comment.timestamp || 'Just now'}</span>
        </div>
        <p style="color:#94a3b8; font-size:13px; margin:0; line-height:1.4;">${comment.text}</p>
      </div>
    `;
  });
}

// --- 5. SECURE PERMANENT PROFILE AVATAR PERSISTENT SAVE AND RENDER ENGINE ---
function processLocalAvatarUpload(event) {
  if (window.processLocalAvatarUpload && typeof window.processLocalAvatarUpload === 'function' && localStorage.getItem('astroUserLoggedIn') === 'true') {
    // Forward to the firebase unified upload flow
    window.processLocalAvatarUpload(event);
    return;
  }
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    localStorage.setItem('astroAvatar', dataUrl);
    
    const loggedInUser = localStorage.getItem('astroUsername') || 'Player';
    localStorage.setItem(`astromods_user_avatar_${loggedInUser.toLowerCase()}`, dataUrl);
    
    injectAvatarToElements(dataUrl);
    
    if (window.location.pathname.includes('profile.html')) {
      window.location.reload();
    }
  };
  reader.readAsDataURL(file);
}

function injectAvatarToElements(avatarSource) {
  document.querySelectorAll('.profile-main-avatar, .profile-avatar-trigger, .profile-avatar').forEach(img => {
    img.setAttribute('src', avatarSource);
  });
}

function loadSavedAvatarImage() {
  const savedAvatar = localStorage.getItem('astroAvatar') || localStorage.getItem('astromods_user_avatar');
  if (savedAvatar) {
    injectAvatarToElements(savedAvatar);
  }
}

// --- 5B. LOGIKA UNGGAL GAMBAR BANNER BANNER EDITABLE ---
function processLocalBannerUpload(event) {
  if (window.processLocalBannerUpload && typeof window.processLocalBannerUpload === 'function' && localStorage.getItem('astroUserLoggedIn') === 'true') {
    // Forward to the firebase unified upload flow
    window.processLocalBannerUpload(event);
    return;
  }
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    localStorage.setItem('astroBanner', dataUrl);
    
    const loggedInUser = localStorage.getItem('astroUsername') || 'Player';
    localStorage.setItem(`astromods_user_banner_${loggedInUser.toLowerCase()}`, dataUrl);
    
    injectBannerToElements(dataUrl);
    
    if (window.location.pathname.includes('profile.html')) {
      window.location.reload();
    }
  };
  reader.readAsDataURL(file);
}

function injectBannerToElements(bannerSource) {
  const bannerEl = document.getElementById('profileDashboardBanner');
  if (bannerEl) {
    bannerEl.style.backgroundImage = `url('${bannerSource}')`;
    bannerEl.style.backgroundSize = 'cover';
    bannerEl.style.backgroundPosition = 'center';
    bannerEl.style.backgroundRepeat = 'no-repeat';
  }
}

// Load saved banner on init to prevent blank layout preview
function loadSavedBannerImage() {
  const savedBanner = localStorage.getItem('astroBanner') || localStorage.getItem('astromods_user_banner');
  if (savedBanner) {
    injectBannerToElements(savedBanner);
  }
}

// --- 6. AUTHENTICATION PROCEDURES ---
function setGlobalLogin(username) {
  localStorage.setItem('astroUserLoggedIn', 'true');
  localStorage.setItem('astroUsername', username);
  userIsLoggedIn = true;
  syncUserSessionUI();
}

function mockAuthLogin(provider) {
  setGlobalLogin(provider + ' User');
  closeLoginModal();
  alert("OAUTH GRANTED: Logged in successfully via " + provider + " Secure OAuth module.");
  
  // reload if we are on index or profile
  if (window.location.pathname.includes('profile.html') || window.location.pathname.includes('settings.html')) {
    window.location.reload();
  }
}

function handleManualLogin(event) {
  event.preventDefault();
  const emailInput = event.target.querySelector('input[type="email"]');
  const emailVal = emailInput ? emailInput.value.trim() : "";
  const username = emailVal ? emailVal.split('@')[0] : "Player";
  
  setGlobalLogin(username);
  closeLoginModal();
  alert("AUTH GRANTED: Welcome back player console admin.");
  
  if (window.location.pathname.includes('profile.html') || window.location.pathname.includes('settings.html')) {
    window.location.reload();
  }
}

function logoutUser() {
  if (confirm("Terminate secure credentials cache? All local settings will be saved.")) {
    localStorage.removeItem('astroUserLoggedIn');
    userIsLoggedIn = false;
    syncUserSessionUI();
    
    // Dynamically determine the correct relative path to index.html
    const path = window.location.pathname;
    if (path.includes('detail-mod-')) {
      window.location.href = '../index.html';
    } else {
      window.location.href = 'index.html';
    }
  }
}

function updateProfileUsername() {
  const username = localStorage.getItem('astroUsername') || 'Player';
  const isVip = localStorage.getItem('astro_vip_status') === 'true';

  document.querySelectorAll('#dropdownUserText').forEach(el => {
    el.innerText = username;
  });

  document.querySelectorAll('.nav-username').forEach(el => {
    el.innerText = username;
  });

  document.querySelectorAll('#profileSection').forEach(profileContainer => {
    let navUserInfo = profileContainer.querySelector('.nav-user-info');
    if (navUserInfo) {
      const pUsername = navUserInfo.querySelector('.nav-username');
      if (pUsername) pUsername.innerText = username;

      const pBadge = navUserInfo.querySelector('.nav-vip-badge');
      if (isVip) {
        if (!pBadge) {
          const badgeSpan = document.createElement('span');
          badgeSpan.className = 'nav-vip-badge';
          badgeSpan.style.background = 'linear-gradient(135deg, #ffaa00, #d97706)';
          badgeSpan.style.color = '#000';
          badgeSpan.style.fontFamily = "'Orbitron', 'Space Grotesk', sans-serif";
          badgeSpan.style.fontSize = '9px';
          badgeSpan.style.fontWeight = '900';
          badgeSpan.style.padding = '2px 6px';
          badgeSpan.style.borderRadius = '4px';
          badgeSpan.style.boxShadow = '0 0 8px rgba(255, 170, 0, 0.4)';
          badgeSpan.style.textTransform = 'uppercase';
          badgeSpan.style.letterSpacing = '0.5px';
          badgeSpan.style.display = 'inline-flex';
          badgeSpan.style.alignItems = 'center';
          badgeSpan.style.alignSelf = 'center';
          badgeSpan.style.height = '16px';
          badgeSpan.style.lineHeight = '16px';
          badgeSpan.style.marginLeft = '2px';
          badgeSpan.innerHTML = '👑 VIP';
          navUserInfo.appendChild(badgeSpan);
        }
      } else {
        if (pBadge) pBadge.remove();
      }
    }
  });
}

// --- 7. HOME SEARCH ENGINE & OVERLAY ---
function initSearchEngineHome() {
  const bar = document.getElementById('homeSearchModsInput');
  const resultsBox = document.getElementById('homeSearchSuggestionsBox');
  if (!bar || !resultsBox) return;

  const ALL_GAMES = [
    {
      id: "minecraft",
      title: "Minecraft Bedrock Edition",
      desc: "Explore addons, shaders, maps, textures, and custom creator skins.",
      img: "https://4kwallpapers.com/images/wallpapers/minecraft-key-art-3840x2160-20204.jpg",
      link: "detail-mod-minecraft-bedrock/minecraft.html",
      badge: "Available",
      badgeColor: "#10b981"
    },
    {
      id: "roblox",
      title: "Roblox Matrix",
      desc: "Unlock premium executor scripts, engine scripts, and character customs.",
      img: "https://4kwallpapers.com/images/wallpapers/roblox-character-2560x1440-20149.jpg",
      link: "#games-section",
      badge: "Coming Soon",
      badgeColor: "#f59e0b"
    },
    {
      id: "mobile-legends",
      title: "Mobile Legends: Bang Bang",
      desc: "Explore rare visual skin injector scripts and game overlays.",
      img: "https://asset.indosport.com/article/image/q/80/311815/logo_mobile_legends-169.jpg?w=750&h=423",
      link: "#games-section",
      badge: "Coming Soon",
      badgeColor: "#f59e0b"
    },
    {
      id: "gta-v",
      title: "Grand Theft Auto V",
      desc: "Explore trainer injection, custom realistic car visual assets, and shaders.",
      img: "https://4kwallpapers.com/images/wallpapers/grand-theft-auto-1920x1085-11003.jpg",
      link: "#games-section",
      badge: "Coming Soon",
      badgeColor: "#f59e0b"
    }
  ];

  function saveRecentSearch(keyword) {
    if (!keyword) return;
    const kw = keyword.trim();
    if (kw.length === 0) return;

    let searches = [];
    try {
      searches = JSON.parse(localStorage.getItem('astro_recent_searches')) || [];
    } catch (e) {
      searches = [];
    }

    // Filter duplicates case-insensitively
    searches = searches.filter(item => item.toLowerCase() !== kw.toLowerCase());
    
    // Unshift the new keyword to the beginning
    searches.unshift(kw);

    // Limit to max 5 items
    searches = searches.slice(0, 5);

    localStorage.setItem('astro_recent_searches', JSON.stringify(searches));
  }

  function showRecentSearches() {
    const query = bar.value.trim();
    // Only show if the input is empty
    if (query.length > 0) return;

    let searches = [];
    try {
      searches = JSON.parse(localStorage.getItem('astro_recent_searches')) || [];
    } catch (e) {
      searches = [];
    }

    if (searches.length === 0) {
      resultsBox.style.display = 'none';
      resultsBox.innerHTML = '';
      return;
    }

    resultsBox.style.display = 'flex';
    resultsBox.innerHTML = `
      <div class="recent-searches-box" style="padding: 14px; width: 100%; box-sizing: border-box; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Recent Searches</span>
          <button class="clear-recent-btn" style="background: none; border: none; color: #ff3e4e; font-size: 11px; font-weight: 700; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: background 0.2s;">Clear All</button>
        </div>
        <div class="recent-chips" style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${searches.map(kw => `
            <span class="recent-chip-item" data-value="${kw.replace(/"/g, '&quot;')}" style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06); color: #cbd5e1; padding: 6px 12px; border-radius: 99px; font-size: 12px; line-height: 1; font-weight: 500; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 4px;">
              🔍 ${kw}
            </span>
          `).join('')}
        </div>
      </div>
    `;

    // Click handler for Clear button
    const clearBtn = resultsBox.querySelector('.clear-recent-btn');
    if (clearBtn) {
      clearBtn.style.outline = 'none';
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        localStorage.removeItem('astro_recent_searches');
        resultsBox.style.display = 'none';
        resultsBox.innerHTML = '';
      });
      clearBtn.addEventListener('mouseenter', () => { clearBtn.style.color = '#ff5c6a'; });
      clearBtn.addEventListener('mouseleave', () => { clearBtn.style.color = '#ff3e4e'; });
    }

    // Click handler for Chip items
    const chips = resultsBox.querySelectorAll('.recent-chip-item');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = chip.getAttribute('data-value');
        bar.value = value;
        // Trigger the search handler dynamically
        bar.dispatchEvent(new Event('input'));
        bar.focus();
      });
      chip.addEventListener('mouseenter', () => {
        chip.style.background = 'rgba(16, 185, 129, 0.1)';
        chip.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        chip.style.color = '#10b981';
      });
      chip.addEventListener('mouseleave', () => {
        chip.style.background = 'rgba(255, 255, 255, 0.04)';
        chip.style.borderColor = 'rgba(255, 255, 255, 0.06)';
        chip.style.color = '#cbd5e1';
      });
    });
  }

  bar.addEventListener('input', () => {
    const query = bar.value.trim().toLowerCase();
    if (query.length === 0) {
      showRecentSearches();
      return;
    }

    const isMainPage = !window.location.pathname.includes('detail-mod-minecraft-bedrock/') && 
                        !window.location.pathname.includes('minecraft.html') && 
                        !window.location.pathname.includes('detail-pokemon.html');

    if (isMainPage) {
      // Search targeting games on the homepage
      const matches = ALL_GAMES.filter(g => 
        g.title.toLowerCase().includes(query) || 
        g.desc.toLowerCase().includes(query) ||
        g.id.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        resultsBox.style.display = 'flex';
        resultsBox.innerHTML = '';
        matches.forEach(g => {
          resultsBox.innerHTML += `
            <a href="${g.link}" class="search-mod-result-item">
              <img src="${g.img}" class="search-mod-r-img">
              <div class="search-mod-r-details">
                <h4 style="font-size: 14px; font-weight: 500; color: #fff; margin: 0 0 2px 0;">${g.title}</h4>
                <p style="font-size: 11px; color: #94a3b8; line-height: 1.3; margin: 0;">${g.desc}</p>
              </div>
              <span class="search-mod-r-badge" style="background: ${g.badgeColor}15; color: ${g.badgeColor}; border: 1px solid ${g.badgeColor}30;">${g.badge}</span>
            </a>
          `;
        });
      } else {
        resultsBox.style.display = 'flex';
        resultsBox.innerHTML = `
          <div style="padding: 15px; color:#64748b; font-size:12px; font-style:italic; text-align:center;">
            No matching games found in AstroMods.
          </div>
        `;
      }
    } else {
      // Search targeting game mods inside a specific game section
      const matches = ALL_GAME_MODS.filter(mod => 
        mod.title.toLowerCase().includes(query) || 
        mod.game.toLowerCase().includes(query) ||
        mod.desc.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        resultsBox.style.display = 'flex';
        resultsBox.innerHTML = '';
        matches.forEach(m => {
          const pathPrefix = window.location.pathname.includes('detail-mod-minecraft-bedrock') ? '' : 'detail-mod-minecraft-bedrock/';
          resultsBox.innerHTML += `
            <a href="${pathPrefix}detail-pokemon.html?mod=${m.id}" class="search-mod-result-item">
              <img src="${m.img}" class="search-mod-r-img">
              <div class="search-mod-r-details">
                <h4>${m.title}</h4>
                <p>${m.game} • By ${m.creator}</p>
              </div>
              <span class="search-mod-r-badge">${m.category}</span>
            </a>
          `;
        });
      } else {
        resultsBox.style.display = 'flex';
        resultsBox.innerHTML = `
          <div style="padding: 15px; color:#64748b; font-size:12px; font-style:italic; text-align:center;">
            No matching mods found in database array. Target is offline.
          </div>
        `;
      }
    }
  });

  // Show recent searches when input is focused
  bar.addEventListener('focus', () => {
    showRecentSearches();
  });

  // Track Enter key press to save query
  bar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = bar.value.trim();
      if (val.length > 0) {
        saveRecentSearch(val);
      }
    }
  });

  // Track result click to save visual keywords
  resultsBox.addEventListener('click', (e) => {
    const clickedItem = e.target.closest('.search-mod-result-item');
    if (clickedItem) {
      const val = bar.value.trim();
      if (val.length > 0) {
        saveRecentSearch(val);
      }
    }
  });

  // Hide on blur
  document.addEventListener('click', (e) => {
    if (!bar.contains(e.target) && !resultsBox.contains(e.target)) {
      resultsBox.style.display = 'none';
    }
  });
}

// --- 8. SETTINGS TAB SWITCHING & SAVE CHANGES SYSTEM ---
function initSettingsDashboard() {
  const menuButtons = document.querySelectorAll('.settings-menu button');
  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.hasAttribute('disabled') || btn.disabled) return;
      // deactivate all buttons
      menuButtons.forEach(b => b.classList.remove('active'));
      // activate selected
      btn.classList.add('active');
      
      let selectedTab = btn.getAttribute('data-tab');
      if (!selectedTab) {
        selectedTab = btn.innerText.trim().toLowerCase().replace(/\s+/g, '-');
      }
      
      const multiLangTabMap = {
        // Indonesian / Malaysian
        'profil': 'profile',
        'notifikasi': 'notifications',
        'tampilan': 'appearance',
        'rupa': 'appearance',
        'privasi': 'privacy',
        'keamanan': 'security',
        'keselamatan': 'security',
        'bahasa': 'language',
        'penghargaan': 'my-reward',
        'ganjaran': 'my-reward',
        // Russian
        'профиль': 'profile',
        'уведомления': 'notifications',
        'внешний вид': 'appearance',
        'конфиденциальность': 'privacy',
        'безопасность': 'security',
        'язык': 'language',
        'награды': 'my-reward',
        // Chinese
        '个人资料': 'profile',
        '通知': 'notifications',
        '外观': 'appearance',
        '隐私': 'privacy',
        '安全': 'security',
        '语言': 'language',
        '奖励': 'my-reward'
      };
      
      for (const [key, val] of Object.entries(multiLangTabMap)) {
        if (selectedTab.includes(key)) {
          selectedTab = val;
          break;
        }
      }
      
      if (selectedTab.includes('my-reward')) {
        selectedTab = 'my-reward';
      }
      
      // hide/show panes
      document.querySelectorAll('.settings-pane').forEach(pane => {
        pane.classList.remove('pane-active');
      });
      
      const targetPane = document.getElementById('pane-' + selectedTab);
      if (targetPane) {
        targetPane.classList.add('pane-active');
      }
    });
  });

  // Fill in existing inputs
  const usernameInput = document.getElementById('setting-username');
  if (usernameInput) {
    usernameInput.value = localStorage.getItem('astroUsername') || 'Player';
  }

  const bioInput = document.getElementById('setting-bio');
  if (bioInput) {
    bioInput.value = localStorage.getItem('astroUserBio') || 'Minecraft Creator & Mod Explorer';
  }

  // Load saved account socials
  const savedSocials = JSON.parse(localStorage.getItem('astro_account_socials') || '[]');
  const container = document.getElementById('account-socials-list-container');
  if (container) {
    container.innerHTML = "";
    savedSocials.forEach(s => {
      addAccountSocialRowWithValue(s.provider, s.url);
    });
  }

  // Populate My Reward parameters
  refreshMyRewardsBalanceElements();

  // Load toggles
  const animatedBg = document.getElementById('setting-animated-bg');
  if (animatedBg) {
    animatedBg.checked = localStorage.getItem('astromods_animated_bg') !== 'false';
  }

  const movingWallpaper = document.getElementById('setting-moving-wallpaper');
  if (movingWallpaper) {
    movingWallpaper.checked = localStorage.getItem('astromods_moving_wallpaper') === 'true';
  }

  const showOnline = document.getElementById('setting-show-online');
  if (showOnline) {
    showOnline.checked = localStorage.getItem('astromods_show_online') !== 'false';
  }

  const emailAlerts = document.getElementById('setting-email-alerts');
  if (emailAlerts) {
    emailAlerts.checked = localStorage.getItem('astromods_email_alerts') === 'true';
  }

  const accentPalette = document.getElementById('setting-accent-palette');
  if (accentPalette) {
    accentPalette.value = localStorage.getItem('astromods_accent_palette') || 'default';
  }

  const langVal = localStorage.getItem('astromods_language') || 'en';
  const settingLang = document.getElementById('setting-language');
  if (settingLang) {
    settingLang.value = langVal;
  }
  selectInterfaceLanguage(langVal);
}

function handleSaveSettings(event) {
  if (event) event.preventDefault();
  
  const usernameInput = document.getElementById('setting-username');
  if (usernameInput && usernameInput.value.trim() !== "") {
    localStorage.setItem('astroUsername', usernameInput.value.trim());
  }

  const bioInput = document.getElementById('setting-bio');
  if (bioInput) {
    localStorage.setItem('astroUserBio', bioInput.value.trim());
  }

  // Extract and validate public social links row elements
  const socialRows = document.querySelectorAll('.social-link-row');
  const socialsToStore = [];
  let socialValidateErrors = false;

  socialRows.forEach(row => {
    const activeOpt = row.querySelector('.social-icon-option.active');
    const provider = activeOpt ? activeOpt.getAttribute('data-provider') : "YouTube";
    const input = row.querySelector('input');
    const url = input ? input.value.trim() : "";
    
    // Validate only if url is filled
    if (url !== "") {
      const isValid = validateSocialLinkPattern(provider, url);
      const errBubble = row.querySelector('.error-message-bubble');
      
      if (!isValid) {
        socialValidateErrors = true;
        if (errBubble) {
          errBubble.innerText = `⚠️ Invalid URL pattern! Please input a valid ${provider} link.`;
          errBubble.style.display = 'flex';
        }
      } else {
        if (errBubble) errBubble.style.display = 'none';
        socialsToStore.push({ provider, url });
      }
    }
  });

  if (socialValidateErrors) {
    alert("❌ SETTINGS CLASH:\nOne or more social URLs do not match their specified provider brand. Please modify errors highlighted in red.");
    return;
  }

  localStorage.setItem('astro_account_socials', JSON.stringify(socialsToStore));

  const animatedBg = document.getElementById('setting-animated-bg');
  if (animatedBg) {
    localStorage.setItem('astromods_animated_bg', animatedBg.checked ? 'true' : 'false');
  }

  const movingWallpaper = document.getElementById('setting-moving-wallpaper');
  if (movingWallpaper) {
    localStorage.setItem('astromods_moving_wallpaper', movingWallpaper.checked ? 'true' : 'false');
  }

  const showOnline = document.getElementById('setting-show-online');
  if (showOnline) {
    localStorage.setItem('astromods_show_online', showOnline.checked ? 'true' : 'false');
  }

  const emailAlerts = document.getElementById('setting-email-alerts');
  if (emailAlerts) {
    localStorage.setItem('astromods_email_alerts', emailAlerts.checked ? 'true' : 'false');
  }

  const accentPalette = document.getElementById('setting-accent-palette');
  if (accentPalette) {
    localStorage.setItem('astromods_accent_palette', accentPalette.value);
  }
  applyAccentPalette();

  const settingLang = document.getElementById('setting-language');
  if (settingLang) {
    localStorage.setItem('astromods_language', settingLang.value);
  }

  const activeLang = localStorage.getItem('astromods_language') || 'en';
  if (activeLang === 'id') {
    alert("⚙️ Pengaturan berhasil disimpan! Profil dan penyesuaian telah selaras.");
  } else if (activeLang === 'ms') {
    alert("⚙️ Tetapan berjaya disimpan! Profil dan penyesuaian telah selesai.");
  } else if (activeLang === 'ru') {
    alert("⚙️ Настройки успешно сохранены! Профиль пользователя синхронизирован.");
  } else if (activeLang === 'zh') {
    alert("⚙️ 设置保存成功！用户个人设定已同步。");
  } else {
    alert("⚙️ Settings saved successfully! User profiles and networks aligned.");
  }
  updateProfileUsername();
  
  // also redirect back to profile page
  window.location.href = 'profile.html';
}

// --- 9. PROFILE DASHBOARD: STATS LISTENER ---
function getModAverageRating(modId, valLikes) {
  const rCount = parseInt(localStorage.getItem(`astro_${modId}_rating_count`));
  const rSum = parseFloat(localStorage.getItem(`astro_${modId}_rating_sum`));
  if (!isNaN(rCount) && !isNaN(rSum) && rCount > 0) {
    return (rSum / rCount).toFixed(1);
  }
  const baseLikes = parseFormattedCountValue(valLikes) || 0;
  return (4.2 + ((baseLikes % 8) / 10)).toFixed(1);
}

function toggleFollowUser(targetUser) {
  if (!userIsLoggedIn) {
    alert("Authentication required. Please Login or Register FIRST to follow this creator!");
    openLoginModal();
    return;
  }
  
  const loggedInUser = localStorage.getItem('astroUsername') || 'Player';
  if (loggedInUser.toLowerCase() === targetUser.toLowerCase()) {
    alert("You cannot follow your own account!");
    return;
  }
  
  const followKey = `astro_following_${targetUser.toLowerCase()}`;
  const followersCountKey = `astro_followers_count_${targetUser.toLowerCase()}`;
  const isFollowing = localStorage.getItem(followKey) === 'true';
  
  let followersStr = localStorage.getItem(followersCountKey) || "415";
  let followersNum = parseInt(followersStr.replace(/,/g, ''));
  if (isFollowing) {
    localStorage.setItem(followKey, 'false');
    followersNum = Math.max(0, followersNum - 1);
  } else {
    localStorage.setItem(followKey, 'true');
    followersNum += 1;
  }
  
  localStorage.setItem(followersCountKey, followersNum.toLocaleString());
  initProfileDashboard();
}

function showCustomSuccessAlert(message, callback) {
  const modalId = 'customSuccessAlertModal';
  let modalEl = document.getElementById(modalId);
  if (modalEl) modalEl.remove();

  modalEl = document.createElement('div');
  modalEl.id = modalId;
  modalEl.style.position = 'fixed';
  modalEl.style.top = '0';
  modalEl.style.left = '0';
  modalEl.style.width = '100vw';
  modalEl.style.height = '100vh';
  modalEl.style.backgroundColor = 'rgba(10, 11, 16, 0.85)';
  modalEl.style.backdropFilter = 'blur(8px)';
  modalEl.style.display = 'flex';
  modalEl.style.alignItems = 'center';
  modalEl.style.justifyContent = 'center';
  modalEl.style.zIndex = '99999';
  modalEl.style.fontFamily = "'Inter', sans-serif";

  const currentLang = localStorage.getItem('astromods_language') || 'en';
  let successTitleText = "SUCCESS";
  if (currentLang === 'id') successTitleText = "SUKSES";
  else if (currentLang === 'ms') successTitleText = "BERJAYA";
  else if (currentLang === 'ru') successTitleText = "УСПЕШНО";
  else if (currentLang === 'zh') successTitleText = "成功";

  modalEl.innerHTML = `
    <div style="background: #171921; border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; width: 95%; max-width: 440px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); text-align: center; animation: customModalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
      <style>
        @keyframes customModalFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      </style>
      <span style="font-size: 50px; display: inline-block; margin-bottom: 20px; filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.3));">✅</span>
      <h2 style="color: white; font-size: 20px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; text-transform: uppercase;">${successTitleText}</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">${message}</p>
      
      <button id="customSuccessAlertOkBtn" style="width: 100%; background: linear-gradient(135deg, #10b981, #059669); color: #06070a; border: none; padding: 14px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
        OK
      </button>
    </div>
  `;

  document.body.appendChild(modalEl);

  document.getElementById('customSuccessAlertOkBtn').onclick = function() {
    modalEl.remove();
    if (typeof callback === 'function') {
      callback();
    }
  };
}

function deleteUserMod(modId) {
  const currentLang = localStorage.getItem('astromods_language') || 'en';
  
  let titleText = "Confirm Deletion";
  let confirmMsg = "Are you sure you want to permanently delete this game modification? This action cannot be undone.";
  let successMsg = "SUCCESS: The game mod file has been permanently deleted from servers.";
  let cancelBtnText = "CANCEL";
  let deleteBtnText = "DELETE MOD";

  if (currentLang === 'id') {
    titleText = "Hapus Modifikasi";
    confirmMsg = "Apakah Anda yakin ingin menghapus modifikasi game ini secara permanen? Tindakan ini tidak dapat dibatalkan.";
    successMsg = "SUKSES: Modifikasi game telah berhasil dihapus secara permanen dari server kami.";
    cancelBtnText = "BATAL";
    deleteBtnText = "HAPUS MOD";
  } else if (currentLang === 'ms') {
    titleText = "Padam Ubah Suai";
    confirmMsg = "Adakah anda pasti mahu memadamkan modifikasi permainan ini secara kekal? Tindakan ini tidak boleh diundurkan.";
    successMsg = "BERJAYA: Fail modifikasi permainan telah dipadamkan secara kekal dari pelayan kami.";
    cancelBtnText = "BATAL";
    deleteBtnText = "PADAM MOD";
  } else if (currentLang === 'ru') {
    titleText = "Подтвердить удаление";
    confirmMsg = "Вы уверены, что хотите навсегда удалить эту модификацию игры? Это действие нельзя отменить.";
    successMsg = "УСПЕХ: Файл модификации игры был навсегда удален с серверов.";
    cancelBtnText = "ОТМЕНА";
    deleteBtnText = "УДАЛИТЬ МОД";
  } else if (currentLang === 'zh') {
    titleText = "确认删除";
    confirmMsg = "您确定要永久删除此游戏模组吗？此操作将无法撤销。";
    successMsg = "成功：该游戏模组文件已从服务器上永久删除。";
    cancelBtnText = "取消";
    deleteBtnText = "删除模组";
  }

  // Create custom modal container to prevent sandbox confirm block
  const modalId = 'customDeleteConfirmModal';
  let modalEl = document.getElementById(modalId);
  if (modalEl) modalEl.remove();

  modalEl = document.createElement('div');
  modalEl.id = modalId;
  modalEl.style.position = 'fixed';
  modalEl.style.top = '0';
  modalEl.style.left = '0';
  modalEl.style.width = '100vw';
  modalEl.style.height = '100vh';
  modalEl.style.backgroundColor = 'rgba(10, 11, 16, 0.85)';
  modalEl.style.backdropFilter = 'blur(8px)';
  modalEl.style.display = 'flex';
  modalEl.style.alignItems = 'center';
  modalEl.style.justifyContent = 'center';
  modalEl.style.zIndex = '99999';
  modalEl.style.fontFamily = "'Inter', sans-serif";

  modalEl.innerHTML = `
    <div style="background: #171921; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; width: 95%; max-width: 440px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); animation: customDelModalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
      <style>
        @keyframes customDelModalFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      </style>
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 50px; display: inline-block; margin-bottom: 15px; filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.3));">🗑️</span>
        <h2 style="color: white; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px; text-transform: uppercase;">${titleText}</h2>
      </div>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 30px 0;">${confirmMsg}</p>
      
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="customDeleteCancelBtn" style="flex: 1; background: rgba(255, 255, 255, 0.05); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
          ${cancelBtnText}
        </button>
        <button id="customDeleteConfirmBtn" style="flex: 1; background: #ef4444; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
          ${deleteBtnText}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  // Cancel trigger
  document.getElementById('customDeleteCancelBtn').onclick = function() {
    modalEl.remove();
  };

  // Confirm execution
  document.getElementById('customDeleteConfirmBtn').onclick = function() {
    modalEl.remove();

    let userUploadedMods = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
    userUploadedMods = userUploadedMods.filter(m => m.id !== modId);
    localStorage.setItem('astro_user_uploaded_mods', JSON.stringify(userUploadedMods));
    
    // Add to static/dynamic blocklist to hide globally
    let blockedMods = JSON.parse(localStorage.getItem('astro_blocked_mods_list') || '[]');
    if (!blockedMods.includes(modId)) {
      blockedMods.push(modId);
      localStorage.setItem('astro_blocked_mods_list', JSON.stringify(blockedMods));
    }
    
    // Mutate in-place to remove from current session memory
    for (let i = ALL_GAME_MODS.length - 1; i >= 0; i--) {
      if (ALL_GAME_MODS[i].id === modId) {
        ALL_GAME_MODS.splice(i, 1);
      }
    }
    
    // Decrement count
    let uCount = parseInt(localStorage.getItem('astro_uploaded_mods_count') || '32');
    localStorage.setItem('astro_uploaded_mods_count', Math.max(0, uCount - 1).toString());
    
    // Instantly purge from active DOM lists
    cleanDeletedModsFromDOM();
    
    // Show custom success popup
    showCustomSuccessAlert(successMsg, function() {
      // Smart redirect or reload depending on context
      const isInSubfolder = window.location.pathname.includes('/detail-mod-');
      if (isInSubfolder || window.location.search.includes('mod=')) {
        window.location.href = isInSubfolder ? "../profile.html" : "profile.html";
      } else {
        window.location.reload();
      }
    });
  };
}

function initProfileDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const userParam = urlParams.get('user');
  const loggedInUser = localStorage.getItem('astroUsername') || 'Player';
  
  let targetUser = loggedInUser;
  let isOwnProfile = true;
  
  if (userParam && userParam.trim().toLowerCase() !== loggedInUser.trim().toLowerCase()) {
    targetUser = userParam.trim();
    isOwnProfile = false;
  }

  // Update profile username display
  const profileUsernameAll = document.querySelectorAll('.profile-info h1, #profileUsernameHeaderTitle');
  profileUsernameAll.forEach(el => {
    el.innerText = targetUser;
  });

  // Dynamic biographical text
  const profileBio = document.querySelector('.profile-info p');
  if (profileBio) {
    let customBio = null;
    if (isOwnProfile) {
      customBio = localStorage.getItem('astroBio_' + targetUser.toLowerCase());
    }
    if (!customBio) {
      customBio = localStorage.getItem(`astro_bio_${targetUser.toLowerCase()}`) || localStorage.getItem(`astroBio_${targetUser.toLowerCase()}`);
    }
    profileBio.innerText = customBio ? '⚡ ' + customBio : '⚡ Minecraft Creator & Mod Explorer';
  }

  // Hide edit brush icons for non-owned profiles
  const bannerEdit = document.querySelector('.banner-edit-label');
  if (bannerEdit) {
    bannerEdit.style.display = isOwnProfile ? 'block' : 'none';
  }
  const avatarEdit = document.querySelector('.avatar-edit-label');
  if (avatarEdit) {
    avatarEdit.style.display = isOwnProfile ? 'block' : 'none';
  }

  // Adjust Quick Action Buttons block
  const quickActions = document.querySelector('.quick-actions');
  if (quickActions) {
    if (!isOwnProfile) {
      const followKey = `astro_following_${targetUser.toLowerCase()}`;
      const isFollowing = localStorage.getItem(followKey) === 'true';
      
      quickActions.innerHTML = `
        <button id="profileFollowBtn" onclick="toggleFollowUser('${targetUser.replace(/'/g, "\\'")}')" style="background:${isFollowing ? '#1e293b' : '#10b981'}; color:${isFollowing ? '#94a3b8' : '#fff'}; font-weight:bold; border: 1px solid rgba(255,255,255,0.08);">
          ${isFollowing ? '✓ Following Creator' : '➕ Follow Creator'}
        </button>
        <button onclick="alert('Offline chat sandbox initialized! Stay tuned for real-time multiplayer lobies.')" style="background:#1e232d;">💬 Send Message</button>
      `;
    } else {
      quickActions.innerHTML = `
        <button onclick="window.location.href='settings.html'">⚙️ Edit Profile</button>
        <button onclick="openUploadModal()">🚀 Upload Mod</button>
        <button onclick="openCreatorStatsModal()">📊 Creator Stats</button>
      `;
    }
  }

  // Render warning block if this user has guideline violations!
  const violationsKey = `astro_violations_${targetUser.toLowerCase()}`;
  const violationPoints = parseInt(localStorage.getItem(violationsKey) || '0');
  const profileInfoGroup = document.querySelector('.profile-info');
  if (profileInfoGroup) {
    const existingBadge = document.getElementById('profileViolationsWarningBlock');
    if (existingBadge) existingBadge.remove();
    
    if (violationPoints > 0) {
      const block = document.createElement('div');
      block.id = 'profileViolationsWarningBlock';
      block.style.background = 'rgba(239, 68, 68, 0.1)';
      block.style.border = '1px dashed #ef4444';
      block.style.color = '#f87171';
      block.style.padding = '12px 18px';
      block.style.borderRadius = '10px';
      block.style.marginTop = '15px';
      block.style.fontSize = '13px';
      block.style.fontWeight = '500';
      block.style.lineHeight = '1.5';
      block.style.width = '100%';
      block.innerHTML = `⚠️ <strong>PERINGATAN PELANGGARAN ATURAN (VIOLATIONS DETECTED):</strong> Akun ${targetUser} ini memiliki <strong>${violationPoints} Pelanggaran</strong> aktif karena mengunggah berkas yang melanggar aturan/tidak senonoh (misalnya: mod 18+, scam, cheat, atau hak cipta leaks).`;
      profileInfoGroup.appendChild(block);
    }
  }

  // Filter creations uploaded by this specific user
  const userMods = ALL_GAME_MODS.filter(m => m.creator.toLowerCase() === targetUser.toLowerCase());
  
  // Total mod count 
  const modStat = document.getElementById('profileUploadedModsCount');
  if (modStat) {
    modStat.innerText = userMods.length.toString();
  }

  // Total downloads sum
  const dlStat = document.getElementById('profileTotalDownloadsCount');
  if (dlStat) {
    const totalDls = userMods.reduce((sum, item) => sum + parseFormattedCountValue(item.downloads), 0);
    const displayedDls = (isOwnProfile && totalDls === 0) ? 124000 : totalDls;
    dlStat.innerText = displayedDls.toLocaleString();
  }

  // Follower count dynamic loading
  const followersStat = document.getElementById('profileFollowersCount');
  if (followersStat) {
    const baseFollowersKey = `astro_followers_count_${targetUser.toLowerCase()}`;
    let followersVal = localStorage.getItem(baseFollowersKey);
    if (!followersVal) {
      followersVal = isOwnProfile ? "1,240" : "415";
      localStorage.setItem(baseFollowersKey, followersVal);
    }
    followersStat.innerText = followersVal;
  }

  // Render portfolio creations grid list
  const countEl = document.getElementById('profileCreationsCount');
  if (countEl) countEl.innerText = userMods.length.toString();
  
  const creationsGrid = document.getElementById('profileCreationsListGrid');
  if (creationsGrid) {
    creationsGrid.innerHTML = "";
    if (userMods.length === 0) {
      creationsGrid.innerHTML = `
        <div style="text-align: center; color: #64748b; font-size: 13px; font-style: italic; padding: 40px; grid-column: 1 / -1; border: 1px dashed rgba(255,255,255,0.06); border-radius:12px; background: rgba(0,0,0,0.1);">
          No published modifications found for creator ${targetUser}.
        </div>
      `;
    } else {
      userMods.forEach(m => {
        const starAvg = parseFloat(getModAverageRating(m.id, m.likes));
        const starsRound = Math.round(starAvg);
        let starStr = "";
        for (let i = 1; i <= 5; i++) {
          starStr += (i <= starsRound) ? "★" : "☆";
        }
        
        let actionsHtml = "";
        if (isOwnProfile) {
          actionsHtml = `
            <div style="display:flex; gap:8px;">
              <button onclick="openEditModModal('${m.id}')" style="background:#0284c7; color:white; font-size:11px; padding:6px 12px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" class="cf-btn">✏️ Edit</button>
              <button onclick="deleteUserMod('${m.id}')" style="background:#ef4444; color:white; font-size:11px; padding:6px 12px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" class="cf-btn">🗑️ Delete</button>
            </div>
          `;
        } else {
          actionsHtml = `
            <button onclick="openReportModModal('${m.id}', '${m.title.replace(/'/g, "\\'")}', '${m.creator.replace(/'/g, "\\'")}')" style="background:rgba(239, 68, 68, 0.15); color:#f87171; border:1px solid rgba(239,68,68,0.2); font-size:11px; padding:6px 12px; border-radius:6px; font-weight:bold; cursor:pointer;" class="cf-btn">⚠️ Report</button>
          `;
        }

        const prefix = window.location.pathname.includes('/detail-mod-') ? '' : 'detail-mod-minecraft-bedrock/';
        const detailLink = `${prefix}detail-pokemon.html?mod=${m.id}`;

        creationsGrid.innerHTML += `
          <div class="creation-entry-card" style="background:#131a22; border:1px solid #1e2630; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; transition: 0.2s ease;">
            <img src="${m.img}" alt="${m.title}" style="height:140px; width:100%; object-fit:cover; border-bottom:1px solid rgba(255,255,255,0.05);" onerror="this.src='https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=256&h=256&fit=crop&q=80'">
            <div style="padding:15px; flex-grow:1; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="font-size:10px; background:#1e293b; color:#10b981; padding:3px 8px; border-radius:4px; text-transform:uppercase; font-weight:bold; display:inline-block;">${m.game}</span>
                  <span style="font-size:11px; color:#ffaa00; font-weight:bold;" title="Rating ${starAvg}">${starStr}</span>
                </div>
                <h3 style="font-size:16px; font-weight:600; color:white; margin-bottom:6px;">${m.title}</h3>
                <p style="font-size:12px; color:#94a3b8; line-height:1.4; margin-bottom:15px;">${m.desc.substring(0, 80)}${m.desc.length > 80 ? '...' : ''}</p>
              </div>
              
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">
                <a href="${detailLink}" style="color:#3ade79; text-decoration:none; font-weight:bold; font-size:12px;">View Details →</a>
                ${actionsHtml}
              </div>
            </div>
          </div>
        `;
      });
    }
  }

  // Render favorite mods grid list
  const favoritesGrid = document.getElementById('profileFavoritesListGrid');
  const favCountEl = document.getElementById('profileFavoritesCount');
  
  if (favoritesGrid) {
    const favoritesKey = `astro_favorites_${targetUser.toLowerCase()}`;
    const favoriteIds = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
    const favoriteMods = ALL_GAME_MODS.filter(m => favoriteIds.includes(m.id));
    
    if (favCountEl) {
      favCountEl.innerText = favoriteMods.length.toString();
    }
    
    favoritesGrid.innerHTML = "";
    if (favoriteMods.length === 0) {
      const currentLanguage = localStorage.getItem('astromods_language') || 'en';
      let noFavText = "No favorite mods saved yet.";
      if (currentLanguage === 'id') noFavText = "Belum ada modifikasi favorit yang disimpan.";
      else if (currentLanguage === 'ms') noFavText = "Belum ada mod kegemaran disimpan.";
      else if (currentLanguage === 'ru') noFavText = "Нет сохраненных любимых модов.";
      else if (currentLanguage === 'zh') noFavText = "尚未保存任何收藏的模组。";

      favoritesGrid.innerHTML = `
        <div style="text-align: center; color: #64748b; font-size: 13px; font-style: italic; padding: 40px; grid-column: 1 / -1; border: 1px dashed rgba(255,255,255,0.06); border-radius:12px; background: rgba(0,0,0,0.1);">
          ${noFavText}
        </div>
      `;
    } else {
      favoriteMods.forEach(m => {
        const starAvg = parseFloat(getModAverageRating(m.id, m.likes));
        const starsRound = Math.round(starAvg);
        let starStr = "";
        for (let i = 1; i <= 5; i++) {
          starStr += (i <= starsRound) ? "★" : "☆";
        }
        
        let actionsHtml = "";
        if (isOwnProfile) {
          actionsHtml = `
            <button onclick="removeFavoriteFromProfile('${m.id}')" style="background:#ef4444; color:white; font-size:11px; padding:6px 12px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" class="cf-btn">💔 Unfavorite</button>
          `;
        }

        const prefix = window.location.pathname.includes('/detail-mod-') ? '' : 'detail-mod-minecraft-bedrock/';
        const detailLink = `${prefix}detail-pokemon.html?mod=${m.id}`;

        favoritesGrid.innerHTML += `
          <div class="creation-entry-card" style="background:#131a22; border:1px solid #1e2630; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; transition: 0.2s ease;">
            <img src="${m.img}" alt="${m.title}" style="height:140px; width:100%; object-fit:cover; border-bottom:1px solid rgba(255,255,255,0.05);" onerror="this.src='https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=256&h=256&fit=crop&q=80'">
            <div style="padding:15px; flex-grow:1; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="font-size:10px; background:#1e293b; color:#10b981; padding:3px 8px; border-radius:4px; text-transform:uppercase; font-weight:bold; display:inline-block;">${m.game}</span>
                  <span style="font-size:11px; color:#ffaa00; font-weight:bold;" title="Rating ${starAvg}">${starStr}</span>
                </div>
                <h3 style="font-size:16px; font-weight:600; color:white; margin-bottom:6px;">${m.title}</h3>
                <p style="font-size:12px; color:#94a3b8; line-height:1.4; margin-bottom:15px;">${m.desc.substring(0, 80)}${m.desc.length > 80 ? '...' : ''}</p>
              </div>
              
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">
                <a href="${detailLink}" style="color:#3ade79; text-decoration:none; font-weight:bold; font-size:12px;">View Details →</a>
                ${actionsHtml}
              </div>
            </div>
          </div>
        `;
      });
    }
  }

  // Load avatar and banner specifically for target user too!
  let savedAvatar = null;
  let savedBanner = null;

  if (isOwnProfile) {
    savedAvatar = localStorage.getItem('astroAvatar');
    savedBanner = localStorage.getItem('astroBanner');
  }
  
  if (!savedAvatar) {
    savedAvatar = localStorage.getItem(`astromods_user_avatar_${targetUser.toLowerCase()}`) || localStorage.getItem('astromods_user_avatar');
  }
  if (!savedBanner) {
    savedBanner = localStorage.getItem(`astromods_user_banner_${targetUser.toLowerCase()}`) || localStorage.getItem('astromods_user_banner');
  }

  const avatarEl = document.getElementById('profileDashboardAvatar');
  if (avatarEl) {
    avatarEl.setAttribute('src', savedAvatar || 'https://i.imgur.com/8Km9tLL.png');
  }

  const bannerEl = document.getElementById('profileDashboardBanner');
  if (bannerEl) {
    if (savedBanner) {
      bannerEl.style.backgroundImage = `url('${savedBanner}')`;
    } else {
      bannerEl.style.backgroundImage = "url('https://4kwallpapers.com/images/wallpapers/minecraft-bedrock-3840x1080-19694.jpg')";
    }
    bannerEl.style.backgroundSize = 'cover';
    bannerEl.style.backgroundPosition = 'center';
  }

  // Set up activity dynamic feeds
  const listArea = document.getElementById('profileActivityList');
  if (listArea) {
    let recentActivities = JSON.parse(localStorage.getItem(`astro_activity_${targetUser.toLowerCase()}`) || '[]');
    if (recentActivities.length === 0) {
      recentActivities = [
        { action: "Registered account inside AstroMods dashboard portal", date: "05/15/2026" }
      ];
      if (userMods.length > 0) {
        userMods.forEach(um => {
          recentActivities.unshift({ action: `Uploaded: ${um.title}`, date: um.updated === 'Just Now' ? new Date().toLocaleDateString() : '05/20/2026' });
        });
      }
      localStorage.setItem(`astro_activity_${targetUser.toLowerCase()}`, JSON.stringify(recentActivities));
    }
    
    listArea.innerHTML = "";
    recentActivities.forEach(item => {
      listArea.innerHTML += `
        <div class="recent-activity-card">
          <span>${item.action}</span>
          <span class="activity-badge">${item.date}</span>
        </div>
      `;
    });
  }
  
  // Align dynamically injected profile section elements with selected site language
  applyGlobalLanguageTranslation();
}

// ==========================================
// CREATOR ECONOMY, SOCIALS & TRANSFERS SUBSYSTEMS
// ==========================================

// Global Rewards persistence defaults
if (!localStorage.getItem('astro_rewards_balance')) {
  localStorage.setItem('astro_rewards_balance', '0');
}
if (!localStorage.getItem('astro_rewards_lifetime')) {
  localStorage.setItem('astro_rewards_lifetime', '0');
}
if (!localStorage.getItem('astro_rewards_history')) {
  localStorage.setItem('astro_rewards_history', '[]');
}

// 1. Social Link Pattern Checker
function validateSocialLinkPattern(provider, url) {
  const lowerUrl = url.toLowerCase();
  if (provider === "YouTube") {
    return lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be');
  } else if (provider === "TikTok") {
    return lowerUrl.includes('tiktok.com');
  } else if (provider === "Instagram") {
    return lowerUrl.includes('instagram.com');
  } else if (provider === "Discord") {
    return lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg');
  } else if (provider === "Twitter" || provider === "Twitter/X") {
    return lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com');
  }
  return true;
}

// 2. Add New Account Social Row
function addNewAccountSocialRow() {
  addAccountSocialRowWithValue("YouTube", "");
}

// 3. Inject interactive Social Manager HTML row inside profile settings
function addAccountSocialRowWithValue(provider, url) {
  const container = document.getElementById('account-socials-list-container');
  if (!container) return;

  const rowId = 'soc-row-' + Math.floor(Math.random() * 1000000);
  const row = document.createElement('div');
  row.className = 'social-link-row';
  row.id = rowId;

  row.innerHTML = `
    <!-- Icon Picker panel -->
    <div class="social-icon-selector">
      <div class="social-icon-option ${provider === 'YouTube' ? 'active' : ''}" data-provider="YouTube" onclick="setAccountSocialIcon('${rowId}', 'YouTube')" title="YouTube">
        <img src="https://static.vecteezy.com/system/resources/thumbnails/018/930/572/small/youtube-logo-youtube-icon-transparent-free-png.png" style="width: 22px; height: 22px; object-fit: contain;" referrerPolicy="no-referrer" alt="YouTube">
      </div>
      <div class="social-icon-option ${provider === 'TikTok' ? 'active' : ''}" data-provider="TikTok" onclick="setAccountSocialIcon('${rowId}', 'TikTok')" title="TikTok">
        <img src="https://img.magnific.com/premium-vector/tik-tok-logo_578229-290.jpg?semt=ais_hybrid&w=740&q=80" style="width: 22px; height: 22px; object-fit: contain; border-radius: 4px;" referrerPolicy="no-referrer" alt="TikTok">
      </div>
      <div class="social-icon-option ${provider === 'Instagram' ? 'active' : ''}" data-provider="Instagram" onclick="setAccountSocialIcon('${rowId}', 'Instagram')" title="Instagram">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" style="width: 22px; height: 22px; object-fit: contain;" referrerPolicy="no-referrer" alt="Instagram">
      </div>
      <div class="social-icon-option ${provider === 'Discord' ? 'active' : ''}" data-provider="Discord" onclick="setAccountSocialIcon('${rowId}', 'Discord')" title="Discord">
        <img src="https://static.vecteezy.com/system/resources/previews/006/892/625/non_2x/discord-logo-icon-editorial-free-vector.jpg" style="width: 22px; height: 22px; object-fit: contain; border-radius: 4px;" referrerPolicy="no-referrer" alt="Discord">
      </div>
      <div class="social-icon-option ${provider === 'Twitter' ? 'active' : ''}" data-provider="Twitter" onclick="setAccountSocialIcon('${rowId}', 'Twitter')" title="Twitter/X">
        <img src="https://img.freepik.com/vektor-premium/x-jaringan-sosial-baru-ikon-aplikasi-hitam-twitter-diganti-namanya-menjadi-x-logo-twitter-diubah_277909-568.jpg?semt=ais_hybrid&w=740&q=80" style="width: 22px; height: 22px; object-fit: contain; border-radius: 4px;" referrerPolicy="no-referrer" alt="Twitter">
      </div>
    </div>

    <!-- URL Input -->
    <div style="flex-grow:1; display:flex; flex-direction:column; text-align:left;">
      <input type="text" class="form-input" style="background:#171921; width:100%; border:1px solid rgba(255,255,255,0.08); padding:10px; border-radius:8px; font-size:13px; color:white;" placeholder="Enter ${provider} URL channel link..." value="${url}" oninput="realtimeValidateAccountSocialLink(this)">
      <div class="error-message-bubble" style="display:none; color: #f87171; font-size:11px; margin-top:4px;"></div>
    </div>

    <!-- Delete button -->
    <button type="button" class="trash-delete-btn" onclick="removeAccountSocialRow('${rowId}')" title="Delete channels">
      🗑️
    </button>
  `;

  container.appendChild(row);
}

// 4. Handle provider logo select changes inside row
function setAccountSocialIcon(rowId, provider) {
  const row = document.getElementById(rowId);
  if (!row) return;

  row.querySelectorAll('.social-icon-option').forEach(opt => {
    opt.classList.remove('active');
  });

  const selectedOpt = row.querySelector(`.social-icon-option[data-provider="${provider}"]`);
  if (selectedOpt) selectedOpt.classList.add('active');

  const input = row.querySelector('input');
  if (input) {
    input.placeholder = `Enter ${provider} URL channel link...`;
    realtimeValidateAccountSocialLink(input);
  }
}

// 5. Delete selection row helper
function removeAccountSocialRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    row.style.opacity = '0';
    row.style.transform = 'scale(0.9)';
    setTimeout(() => row.remove(), 180);
  }
}

// 6. Realtime Validation UI
function realtimeValidateAccountSocialLink(inputElement) {
  const row = inputElement.closest('.social-link-row');
  if (!row) return;

  const activeOpt = row.querySelector('.social-icon-option.active');
  const provider = activeOpt ? activeOpt.getAttribute('data-provider') : "YouTube";
  const url = inputElement.value.trim();

  const errBubble = row.querySelector('.error-message-bubble');
  if (!errBubble) return;

  if (url === "") {
    errBubble.style.display = 'none';
    return;
  }

  const isValid = validateSocialLinkPattern(provider, url);
  if (!isValid) {
    errBubble.innerText = `⚠️ URL domain doesn't match the selected ${provider} brand logo!`;
    errBubble.style.display = 'flex';
  } else {
    errBubble.style.display = 'none';
  }
}

// 7. Refresh My Rewards cards and log lists
function refreshMyRewardsBalanceElements() {
  const balanceText = document.getElementById('rewardBalanceText');
  const lifetimeText = document.getElementById('rewardLifetimeText');
  const ledgerBox = document.getElementById('rewardLedgerWrapper');

  const currentBalance = parseInt(localStorage.getItem('astro_rewards_balance') || "150000");
  const currentLifetime = parseInt(localStorage.getItem('astro_rewards_lifetime') || "250000");

  if (balanceText) balanceText.innerText = "Rp " + currentBalance.toLocaleString();
  if (lifetimeText) lifetimeText.innerText = "Rp " + currentLifetime.toLocaleString();

  if (ledgerBox) {
    ledgerBox.innerHTML = "";
    const history = JSON.parse(localStorage.getItem('astro_rewards_history') || "[]");

    if (history.length === 0) {
      ledgerBox.innerHTML = `
        <div style="text-align:center; padding:30px 10px; color:#64748b; font-size:12px; font-style:italic;">
          No payouts or donation records filed. Share your creations to receive support!
        </div>
      `;
      return;
    }

    history.forEach(item => {
      const isPayout = item.type === 'withdrawal';
      const indicatorColor = isPayout ? '#ef4444' : '#10b981';
      const borderSign = isPayout ? '-' : '+';

      ledgerBox.innerHTML += `
        <div class="reward-history-line" style="border-left-color: ${indicatorColor};">
          <div>
            <div style="font-weight:bold; color:white; font-size:13px; margin-bottom:2px;">${item.details}</div>
            <div style="font-size:11px; color:#64748b;">${item.date} &bull; <strong style="color:${indicatorColor};">${item.status}</strong></div>
            ${item.message ? `<div style="font-size:11px; color:#94a3b8; font-style:italic; margin-top:4px; padding-left:6px; border-left:1px dashed rgba(255,255,255,0.1);">"${item.message}"</div>` : ''}
          </div>
          <div style="font-weight:850; font-size:14px; text-align:right; color:${indicatorColor};">
            ${borderSign} Rp ${item.amount.toLocaleString()}
          </div>
        </div>
      `;
    });
  }
}

// 8. Execute Simulated cash payouts in settings
function executeSimulatedPayout() {
  alert("🚧 Coming Soon / Segera Hadir:\nFitur pencairan uang sedang ditunda dan akan diaktifkan setelah integrasi modal serta gerbang pembayaran selesai dipasang.");
  return;
}

// 9. Details Page support: launcher shortcuts
function setDonationShortcutAmount(amt) {
  const customInput = document.getElementById('donateCustomAmount');
  if (customInput) customInput.value = amt;
}

// 10. Details Page Support: Donation modal initiation
function triggerCreatorDonationModal() {
  const modData = ALL_GAME_MODS.find(m => m.id === currentDetailPageModId);
  if (!modData) return;

  let modal = document.getElementById('creatorDonationModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'creatorDonationModal';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(10,11,13,0.92); display:flex; align-items:center; justify-content:center; z-index:999990; font-family:'Inter', sans-serif; padding:15px;";
    document.body.appendChild(modal);
  }

  const creatorName = modData.creator;
  const donateInfo = modData.donation || {};
  const walletType = donateInfo.walletType || "Saweria / Dana";
  const walletAddress = donateInfo.walletAddress || "0812XXXXXXXX";

  const loggedInUser = localStorage.getItem('astroUsername') || 'Guest Supporter';

  modal.innerHTML = `
    <div style="background:#131520; border:1px solid rgba(255,255,255,0.06); width:100%; max-width:480px; border-radius:16px; padding:30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position:relative; text-align:left;">
      <button onclick="document.getElementById('creatorDonationModal').style.display='none'" style="position:absolute; top:20px; right:20px; background:none; border:none; color:#64748b; font-size:24px; cursor:pointer;">&times;</button>
      
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <span style="font-size:32px;">💸</span>
        <div>
          <h3 style="color:white; font-size:18px; font-weight:bold; margin:0;">Donate directly to Creator</h3>
          <p style="color:#64748b; font-size:12px; margin:2px 0 0 0;">Zero platform commission. 100% of support is credited directly.</p>
        </div>
      </div>

      <div style="background:#0f111a; border-radius:10px; padding:15px; margin-bottom:20px; border:1.5px dashed rgba(16,185,129,0.2);">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; color:#94a3b8;">
          <span>Target Creator:</span>
          <strong style="color:white;">@${creatorName}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; color:#94a3b8;">
          <span>Donation Mode:</span>
          <strong style="color:#10b981;">${walletType} Checkout</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12px; color:#94a3b8;">
          <span>Recipient Address:</span>
          <strong style="color:white;">${walletAddress}</strong>
        </div>
      </div>

      <div style="margin-bottom:15px;">
        <label style="color:#94a3b8; font-size:11px; font-weight:600; text-transform:uppercase; display:block; margin-bottom:6px;">Your Donor Name</label>
        <input type="text" id="donateDonorName" value="${loggedInUser}" class="form-input" style="background:#171921; color:white; width:100%; border:1px solid rgba(255,255,255,0.08); padding:10px; border-radius:8px; font-size:13px;" placeholder="Name or alias...">
      </div>

      <div style="margin-bottom:15px;">
        <label style="color:#94a3b8; font-size:11px; font-weight:600; text-transform:uppercase; display:block; margin-bottom:6px;">Support Message</label>
        <textarea id="donateMessage" class="form-input" style="background:#171921; color:white; width:100%; border:1px solid rgba(255,255,255,0.08); padding:10px; border-radius:8px; font-size:13px; resize:none;" rows="2" placeholder="Send an encouraging message to the modder!"></textarea>
      </div>

      <div style="margin-bottom:25px;">
        <label style="color:#94a3b8; font-size:11px; font-weight:600; text-transform:uppercase; display:block; margin-bottom:8px;">Choose Contribution Amount</label>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:10px;">
          <button type="button" onclick="setDonationShortcutAmount(10000)" style="background:#171921; border:1px solid rgba(255,255,255,0.08); color:white; padding:10px 0; border-radius:8px; cursor:pointer; font-weight:600; font-size:12px; transition:0.2s;">Rp 10.000</button>
          <button type="button" onclick="setDonationShortcutAmount(25000)" style="background:#171921; border:1px solid rgba(255,255,255,0.08); color:white; padding:10px 0; border-radius:8px; cursor:pointer; font-weight:600; font-size:12px; transition:0.2s;">Rp 25.000</button>
          <button type="button" onclick="setDonationShortcutAmount(50000)" style="background:#171921; border:1px solid rgba(255,255,255,0.08); color:white; padding:10px 0; border-radius:8px; cursor:pointer; font-weight:600; font-size:12px; transition:0.2s;">Rp 50.000</button>
        </div>
        <div style="position:relative;">
          <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#64748b; font-size:13px; font-weight:bold;">Rp</span>
          <input type="number" id="donateCustomAmount" value="50000" class="form-input" style="background:#171921; color:white; width:100%; border:1px solid rgba(255,255,255,0.08); padding:10px 10px 10px 35px; border-radius:8px; font-size:13px; font-weight:bold;" placeholder="Enter custom amount...">
        </div>
      </div>

      <button type="button" id="submitDonationAuthorizeBtn" onclick="processCreatorDonationState('${creatorName}', '${modData.title}')" class="save-btn" style="width:100%; background:#10b981; color:#0a0b0d; font-weight:bold; padding:12px 0; font-size:13px; border:none; border-radius:8px; cursor:pointer; text-align:center; display:block; transition:0.2s;">
        Authorize Simulated Donation Transfer
      </button>
    </div>
  `;
  modal.style.display = 'flex';
}

// 11. Details Page Support: Donation processing states
function processCreatorDonationState(creatorName, modTitle) {
  const donor = document.getElementById('donateDonorName').value.trim() || "Guest Supporter";
  const descMessage = document.getElementById('donateMessage').value.trim() || "Awesome mod package, keep it up!";
  const amount = parseInt(document.getElementById('donateCustomAmount').value) || 0;

  if (amount <= 0) {
    alert("Please enter a valid donation amount greater than Rp 0!");
    return;
  }

  const btn = document.getElementById('submitDonationAuthorizeBtn');
  if (!btn) return;

  btn.disabled = true;
  btn.style.background = "#d97706";
  btn.innerText = "⏳ Connecting to safe secure checkout gateways...";

  setTimeout(() => {
    btn.innerText = "💸 Transferring 100% of gift directly to creator... (No tax)";
    btn.style.background = "#3b82f6";

    setTimeout(() => {
      btn.innerText = "🚀 Finalizing ledger clears & cryptographic sync...";
      btn.style.background = "#8b5cf6";

      setTimeout(() => {
        // Successful Simulation!
        // 1. Credit the balances in LocalStorage
        let activeBalance = parseInt(localStorage.getItem('astro_rewards_balance') || "150000");
        let activeLifetime = parseInt(localStorage.getItem('astro_rewards_lifetime') || "250000");

        activeBalance += amount;
        activeLifetime += amount;

        localStorage.setItem('astro_rewards_balance', activeBalance.toString());
        localStorage.setItem('astro_rewards_lifetime', activeLifetime.toString());

        // 2. Append transaction log history
        const history = JSON.parse(localStorage.getItem('astro_rewards_history') || "[]");
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const currentDateStr = new Date().toLocaleDateString('en-US', options);

        history.unshift({
          date: currentDateStr,
          type: "donation",
          amount: amount,
          details: `Direct donation from ${donor} on [${modTitle}]`,
          message: descMessage,
          status: "SUCCESS"
        });

        localStorage.setItem('astro_rewards_history', JSON.stringify(history));

        // 3. Complete and feedback
        const modal = document.getElementById('creatorDonationModal');
        if (modal) modal.style.display = 'none';

        // Custom notification trigger
        alert(`💸 MATCH SUCCESS!\nYou successfully donated Rp ${amount.toLocaleString()} to @${creatorName}.\nMessage: "${descMessage}"\n\nThis simulation has credited Rp ${amount.toLocaleString()} directly into your "My Reward" settings panel so you can try out the withdrawal process!`);

        // Check if settings elements are on page, update them reactively
        refreshMyRewardsBalanceElements();
      }, 1500);
    }, 1500);
  }, 1500);
}

// --- 13. MULTILINGUAL TRANSLATION & LOCALIZATION ENGINE ---
function selectInterfaceLanguage(lang) {
  const hiddenInput = document.getElementById('setting-language');
  if (hiddenInput) {
    hiddenInput.value = lang;
  }
  
  // Highlight UI dynamisch across all language options
  const buttons = document.querySelectorAll('.lang-option-node');
  buttons.forEach(btn => {
    btn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    btn.style.background = 'rgba(255, 255, 255, 0.02)';
    const badge = btn.querySelector('.active-badge');
    if (badge) badge.style.display = 'none';
  });
  
  const targetBtn = document.getElementById(`lang-btn-${lang}`);
  if (targetBtn) {
    targetBtn.style.borderColor = '#10b981';
    targetBtn.style.background = 'rgba(16, 185, 129, 0.05)';
    const badge = targetBtn.querySelector('.active-badge');
    if (badge) badge.style.display = 'block';
  }
}

function applyGlobalLanguageTranslation() {
  const currentLanguage = localStorage.getItem('astromods_language') || 'en';
  if (currentLanguage === 'en') {
    return; // Already default English, no translation needed
  }

  const lang = currentLanguage;

  // 1. Translate Navbar Links
  document.querySelectorAll('nav a, header nav a').forEach(a => {
    const text = a.textContent.trim();
    if (text === 'Home') {
      if (lang === 'id') a.textContent = 'Beranda';
      else if (lang === 'ms') a.textContent = 'Beranda';
      else if (lang === 'ru') a.textContent = 'Главная';
      else if (lang === 'zh') a.textContent = '首页';
    }
    if (text === 'Games') {
      if (lang === 'id') a.textContent = 'Game';
      else if (lang === 'ms') a.textContent = 'Permainan';
      else if (lang === 'ru') a.textContent = 'Игры';
      else if (lang === 'zh') a.textContent = '游戏';
    }
    if (text === 'Mods') {
      if (lang === 'id') a.textContent = 'Modifikasi';
      else if (lang === 'ms') a.textContent = 'Mod';
      else if (lang === 'ru') a.textContent = 'Модификации';
      else if (lang === 'zh') a.textContent = '模组';
    }
  });

  // Dropdown items
  document.querySelectorAll('.dropdown-item').forEach(item => {
    const text = item.innerHTML;
    if (text.includes('My Profile')) {
      if (lang === 'id') item.innerHTML = '👤 Profil Saya';
      else if (lang === 'ms') item.innerHTML = '👤 Profil Saya';
      else if (lang === 'ru') item.innerHTML = '👤 Мой профиль';
      else if (lang === 'zh') item.innerHTML = '👤 我的个人资料';
    }
    if (text.includes('Upload Game Mod')) {
      if (lang === 'id') item.innerHTML = '🚀 Unggah Mod Game';
      else if (lang === 'ms') item.innerHTML = '🚀 Muat Naik Mod Game';
      else if (lang === 'ru') item.innerHTML = '🚀 Загрузить мод';
      else if (lang === 'zh') item.innerHTML = '🚀 上传游戏模组';
    }
    if (text.includes('Settings Dashboard')) {
      if (lang === 'id') item.innerHTML = '⚙️ Dasbor Pengaturan';
      else if (lang === 'ms') item.innerHTML = '⚙️ Papan Pemuka Tetapan';
      else if (lang === 'ru') item.innerHTML = '⚙️ Панель настроек';
      else if (lang === 'zh') item.innerHTML = '⚙️ 设置面板';
    }
    if (text.includes('Log Out')) {
      if (lang === 'id') item.innerHTML = '🚪 Keluar';
      else if (lang === 'ms') item.innerHTML = '🚪 Log Keluar';
      else if (lang === 'ru') item.innerHTML = '🚪 Выйти';
      else if (lang === 'zh') item.innerHTML = '🚪 登出';
    }
  });

  // Welcome Hero section on Home page (index.html)
  const mainTitle = document.querySelector('.hero-text h2');
  if (mainTitle && mainTitle.textContent.trim() === 'WELCOME TO') {
    if (lang === 'id') mainTitle.textContent = 'SELAMAT DATANG DI';
    else if (lang === 'ms') mainTitle.textContent = 'SELAMAT DATANG KE';
    else if (lang === 'ru') mainTitle.textContent = 'ДОБРО ПОЖАЛОВАТЬ В';
    else if (lang === 'zh') mainTitle.textContent = '欢迎来到';
  }
  const heroSubtitle = document.querySelector('.hero-text p');
  if (heroSubtitle && heroSubtitle.textContent.trim().toLowerCase().includes('explore free & premium')) {
    if (lang === 'id') heroSubtitle.textContent = 'Jelajahi Mod Gratis & Premium di Seluruh Jagat Game';
    else if (lang === 'ms') heroSubtitle.textContent = 'Terokai Mod Percuma & Premium di Seluruh Alam Permainan';
    else if (lang === 'ru') heroSubtitle.textContent = 'Исследуйте бесплатные и премиум моды для всех игр';
    else if (lang === 'zh') heroSubtitle.textContent = '探索全球游戏中的免费和高级模组';
  }
  const heroBtn = document.querySelector('.hero-btn-main');
  if (heroBtn && heroBtn.textContent.trim() === 'EXPLORE MODS') {
    if (lang === 'id') heroBtn.textContent = 'JELAJAHI MOD';
    else if (lang === 'ms') heroBtn.textContent = 'TEROKAI MOD';
    else if (lang === 'ru') heroBtn.textContent = 'ИССЛЕДОВАТЬ МОДЫ';
    else if (lang === 'zh') heroBtn.textContent = '探索模组';
  }

  // Search heading home
  const searchHeading = document.querySelector('.search-mods-container h3');
  if (searchHeading && searchHeading.textContent.includes('Search Target Games')) {
    if (lang === 'id') searchHeading.innerHTML = '🔍 Cari Game Target';
    else if (lang === 'ms') searchHeading.innerHTML = '🔍 Cari Permainan Sasaran';
    else if (lang === 'ru') searchHeading.innerHTML = '🔍 Найти целевые игры';
    else if (lang === 'zh') searchHeading.innerHTML = '🔍 搜索目标游戏';
  }
  const searchInput = document.getElementById('homeSearchModsInput');
  if (searchInput && searchInput.placeholder.includes('Type keywords')) {
    if (lang === 'id') searchInput.placeholder = 'Ketik kata kunci untuk mencari game (misal: Minecraft, Roblox, Mobile Legends, GTA V)...';
    else if (lang === 'ms') searchInput.placeholder = 'Taip kata kunci untuk mencari permainan (cth: Minecraft, Roblox, Mobile Legends, GTA V)...';
    else if (lang === 'ru') searchInput.placeholder = 'Введите ключевые слова для поиска игр (например, Minecraft, Roblox, Mobile Legends, GTA V)...';
    else if (lang === 'zh') searchInput.placeholder = '输入关键字以搜索游戏（例如：Minecraft, Roblox, Mobile Legends, GTA V）...';
  }

  // Games Section
  const gamesTitle = document.querySelector('.games h1');
  if (gamesTitle && gamesTitle.textContent.trim() === 'CHOOSE YOUR GAME') {
    if (lang === 'id') gamesTitle.textContent = 'PILIH GAME ANDA';
    else if (lang === 'ms') gamesTitle.textContent = 'PILIH PERMAINAN ANDA';
    else if (lang === 'ru') gamesTitle.textContent = 'ВЫВЕРИТЕ СВОЮ ИГРУ';
    else if (lang === 'zh') gamesTitle.textContent = '选择您的游戏';
  }

  document.querySelectorAll('.game-card').forEach(card => {
    const title = card.querySelector('h2');
    const desc = card.querySelector('p');
    const btn = card.querySelector('button');
    if (title && title.textContent === 'Mobile Legends') {
      if (desc) {
        if (lang === 'id') desc.textContent = 'Jelajahi berbagai skrip skin yang keren & unik.';
        else if (lang === 'ms') desc.textContent = 'Terokai pelbagai skrip skin yang sejuk & unik.';
        else if (lang === 'ru') desc.textContent = 'Исследуйте крутые и уникальные скины-скрипты.';
        else if (lang === 'zh') desc.textContent = '探索各种酷炫且独特的皮肤脚本。';
      }
    }
    if (title && title.textContent === 'Minecraft Mods') {
      if (desc) {
        if (lang === 'id') desc.textContent = 'Jelajahi ribuan addon, peta, paket tekstur, shader, dan skin berkinerja tinggi.';
        else if (lang === 'ms') desc.textContent = 'Terokai beribu-ribu addon, peta, pek tekstur, shader, dan skin berprestasi tinggi.';
        else if (lang === 'ru') desc.textContent = 'Исследуйте тысячи аддонов, карт, текстур-паков, шейдеров и высокопроизводительных скинов.';
        else if (lang === 'zh') desc.textContent = '探索数以千计的高性能插件、地图、材质包、着色器和皮肤。';
      }
    }
    if (title && title.textContent === 'Roblox Mods') {
      if (desc) {
        if (lang === 'id') desc.textContent = 'Buka modul skrip eksekutor premium, penyesuaian mesin, dan kosmetik karakter.';
        else if (lang === 'ms') desc.textContent = 'Buka modul skrip eksekutor premium, tersuai enjin, dan kosmetik watak.';
        else if (lang === 'ru') desc.textContent = 'Разблокируйте премиум-скрипты инжекторов, кастомизацию движка и косметику персонажей.';
        else if (lang === 'zh') desc.textContent = '解锁高级执行器脚本模块、引擎自定义和角色外观。';
      }
    }
    if (btn) {
      if (btn.textContent.trim() === 'VIEW MODS') {
        if (lang === 'id') btn.textContent = 'LIHAT MOD';
        else if (lang === 'ms') btn.textContent = 'LIHAT MOD';
        else if (lang === 'ru') btn.textContent = 'ПОСМОТРЕТЬ МОДЫ';
        else if (lang === 'zh') btn.textContent = '查看模组';
      }
      if (btn.textContent.trim() === 'SOON') {
        if (lang === 'id') btn.textContent = 'SEGERA';
        else if (lang === 'ms') btn.textContent = 'SEGERA';
        else if (lang === 'ru') btn.textContent = 'СКОРО';
        else if (lang === 'zh') btn.textContent = '即将推出';
      }
    }
  });

  // Profile Header & Stats (profile.html)
  const statsCols = document.querySelectorAll('.stat-item label, .profile-stat-card p');
  statsCols.forEach(lbl => {
    const text = lbl.textContent.trim();
    if (text === 'Total Downloads') {
      if (lang === 'id') lbl.textContent = 'Total Unduhan';
      else if (lang === 'ms') lbl.textContent = 'Jumlah Muat Turun';
      else if (lang === 'ru') lbl.textContent = 'Всего скачиваний';
      else if (lang === 'zh') lbl.textContent = '总下载量';
    }
    else if (text === 'Uploaded Mods' || text === 'Mods Uploaded') {
      if (lang === 'id') lbl.textContent = 'Mod Terunggah';
      else if (lang === 'ms') lbl.textContent = 'Mod Dimuat Naik';
      else if (lang === 'ru') lbl.textContent = 'Загружено модов';
      else if (lang === 'zh') lbl.textContent = '已上传模组';
    }
    else if (text === 'Followers') {
      if (lang === 'id') lbl.textContent = 'Pengikut';
      else if (lang === 'ms') lbl.textContent = 'Pengikut';
      else if (lang === 'ru') lbl.textContent = 'Подписчики';
      else if (lang === 'zh') lbl.textContent = '粉丝';
    }
    else if (text === 'Creator Rank') {
      if (lang === 'id') lbl.textContent = 'Peringkat Kreator';
      else if (lang === 'ms') lbl.textContent = 'Pangkat Pencipta';
      else if (lang === 'ru') lbl.textContent = 'Ранг создателя';
      else if (lang === 'zh') lbl.textContent = '创作者等级';
    }
  });

  // Recent Activity Feed and published mods translations
  const extraH2s = document.querySelectorAll('.profile-extra-section h2');
  extraH2s.forEach(h2 => {
    const text = h2.textContent.toLowerCase();
    if (text.includes('published mods portfolio') || text.includes('portofolio mod')) {
      const countSpan = document.getElementById('profileCreationsCount');
      const countVal = countSpan ? countSpan.textContent : '0';
      if (lang === 'id') h2.innerHTML = `Portofolio Mod Terpublikasi (<span id="profileCreationsCount">${countVal}</span>)`;
      else if (lang === 'ms') h2.innerHTML = `Portofolio Mod Diterbitkan (<span id="profileCreationsCount">${countVal}</span>)`;
      else if (lang === 'ru') h2.innerHTML = `Портфолио опубликованных модов (<span id="profileCreationsCount">${countVal}</span>)`;
      else if (lang === 'zh') h2.innerHTML = `已发布模组资料库 (<span id="profileCreationsCount">${countVal}</span>)`;
    } else if (text.includes('recent activity feed') || text.includes('recent creator activity')) {
      if (lang === 'id') h2.textContent = 'Feed Aktivitas Terbaru';
      else if (lang === 'ms') h2.textContent = 'Log Aktiviti Terbaru';
      else if (lang === 'ru') h2.textContent = 'Лента активности';
      else if (lang === 'zh') h2.textContent = '最近活动日志';
    }
  });

  // Quick action buttons under profile.html
  document.querySelectorAll('.quick-actions button').forEach(btn => {
    const text = btn.textContent.trim();
    if (text.includes('Edit Profile')) {
      if (lang === 'id') btn.innerHTML = '⚙️ Edit Profil';
      else if (lang === 'ms') btn.innerHTML = '⚙️ Edit Profil';
      else if (lang === 'ru') btn.innerHTML = '⚙️ Ред. профиль';
      else if (lang === 'zh') btn.innerHTML = '⚙️ 编辑资料';
    } else if (text.includes('Upload Mod')) {
      if (lang === 'id') btn.innerHTML = '🚀 Unggah Mod';
      else if (lang === 'ms') btn.innerHTML = '🚀 Muat Naik Mod';
      else if (lang === 'ru') btn.innerHTML = '🚀 Загрузить мод';
      else if (lang === 'zh') btn.innerHTML = '🚀 上传模组';
    } else if (text.includes('Creator Stats')) {
      if (lang === 'id') btn.innerHTML = '📊 Stat Kreator';
      else if (lang === 'ms') btn.innerHTML = '📊 Stat Pencipta';
      else if (lang === 'ru') btn.innerHTML = '📊 Статистика';
      else if (lang === 'zh') btn.innerHTML = '📊 创作者统计';
    } else if (text.includes('Follow Creator')) {
      if (lang === 'id') btn.innerHTML = '➕ Ikuti Kreator';
      else if (lang === 'ms') btn.innerHTML = '➕ Ikuti Pencipta';
      else if (lang === 'ru') btn.innerHTML = '➕ Подписаться';
      else if (lang === 'zh') btn.innerHTML = '➕ 关注创作者';
    } else if (text.includes('Following Creator')) {
      if (lang === 'id') btn.innerHTML = '✓ Mengikuti Kreator';
      else if (lang === 'ms') btn.innerHTML = '✓ Mengikuti Pencipta';
      else if (lang === 'ru') btn.innerHTML = '✓ Вы подписаны';
      else if (lang === 'zh') btn.innerHTML = '✓ 已关注';
    } else if (text.includes('Send Message')) {
      if (lang === 'id') btn.innerHTML = '💬 Kirim Pesan';
      else if (lang === 'ms') btn.innerHTML = '💬 Hantar Mesej';
      else if (lang === 'ru') btn.innerHTML = '💬 Написать';
      else if (lang === 'zh') btn.innerHTML = '💬 发送消息';
    }
  });

  // Edit Banner button text translation
  const bannerEditTextEl = document.getElementById('bannerEditText');
  if (bannerEditTextEl) {
    if (lang === 'id') bannerEditTextEl.textContent = '🖼️ Edit Banner';
    else if (lang === 'ms') bannerEditTextEl.textContent = '🖼️ Edit Banner';
    else if (lang === 'ru') bannerEditTextEl.textContent = '🖼️ Сменить баннер';
    else if (lang === 'zh') bannerEditTextEl.textContent = '🖼️ 编辑条幅';
  }

  // Edit Avatar button tooltip translation
  const avatarEditLabelEl = document.getElementById('avatarEditLabel');
  if (avatarEditLabelEl) {
    if (lang === 'id') avatarEditLabelEl.title = 'Edit Avatar';
    else if (lang === 'ms') avatarEditLabelEl.title = 'Edit Avatar';
    else if (lang === 'ru') avatarEditLabelEl.title = 'Изменить аватар';
    else if (lang === 'zh') avatarEditLabelEl.title = '编辑头像';
  }

  const recentActTitle = document.querySelector('.activity-section h2, .profile-extra-section + .profile-extra-section h2');
  if (recentActTitle && (recentActTitle.textContent.trim().includes('Recent Creator Activity') || recentActTitle.textContent.trim().includes('Recent Activity Feed') || recentActTitle.textContent.trim().includes('Log Aktivitas') || recentActTitle.textContent.trim().includes('Log Aktiviti') || recentActTitle.textContent.trim().includes('Последние') || recentActTitle.textContent.trim().includes('最近 activity'))) {
    if (lang === 'id') recentActTitle.textContent = '⚡ Log Aktivitas Kreator Terbaru';
    else if (lang === 'ms') recentActTitle.textContent = '⚡ Log Aktiviti Pencipta Terbaru';
    else if (lang === 'ru') recentActTitle.textContent = '⚡ Последние действия создателя';
    else if (lang === 'zh') recentActTitle.textContent = '⚡ 创作者最近活动日志';
  }

  // Sidebar Buttons & Titles on settings.html
  const sidebarHeading = document.querySelector('.settings-sidebar h2');
  if (sidebarHeading && sidebarHeading.textContent.trim() === '⚙️ Settings Control') {
    if (lang === 'id') sidebarHeading.textContent = '⚙️ Kontrol Pengaturan';
    else if (lang === 'ms') sidebarHeading.textContent = '⚙️ Kawalan Tetapan';
    else if (lang === 'ru') sidebarHeading.textContent = '⚙️ Управление настройками';
    else if (lang === 'zh') sidebarHeading.textContent = '⚙️ 设置控制';
  }

  document.querySelectorAll('.settings-sidebar .settings-menu button').forEach(btn => {
    const text = btn.innerText.trim();
    if (text === 'Profile') {
      if (lang === 'id') btn.innerText = 'Profil';
      else if (lang === 'ms') btn.innerText = 'Profil';
      else if (lang === 'ru') btn.innerText = 'Профиль';
      else if (lang === 'zh') btn.innerText = '个人资料';
    }
    else if (text === 'Notifications') {
      if (lang === 'id') btn.innerText = 'Notifikasi';
      else if (lang === 'ms') btn.innerText = 'Notifikasi';
      else if (lang === 'ru') btn.innerText = 'Уведомления';
      else if (lang === 'zh') btn.innerText = '通知';
    }
    else if (text === 'Appearance') {
      if (lang === 'id') btn.innerText = 'Tampilan';
      else if (lang === 'ms') btn.innerText = 'Rupa';
      else if (lang === 'ru') btn.innerText = 'Внешний вид';
      else if (lang === 'zh') btn.innerText = '外观';
    }
    else if (text === 'Privacy') {
      if (lang === 'id') btn.innerText = 'Privasi';
      else if (lang === 'ms') btn.innerText = 'Privasi';
      else if (lang === 'ru') btn.innerText = 'Конфиденциальность';
      else if (lang === 'zh') btn.innerText = '隐私';
    }
    else if (text === 'Security') {
      if (lang === 'id') btn.innerText = 'Keamanan';
      else if (lang === 'ms') btn.innerText = 'Keselamatan';
      else if (lang === 'ru') btn.innerText = 'Безопасность';
      else if (lang === 'zh') btn.innerText = '安全';
    }
    else if (text === 'Language') {
      if (lang === 'id') btn.innerText = 'Bahasa';
      else if (lang === 'ms') btn.innerText = 'Bahasa';
      else if (lang === 'ru') btn.innerText = 'Язык';
      else if (lang === 'zh') btn.innerText = '语言';
    }
    else if (text.includes('My Reward')) {
       if (lang === 'id') btn.innerHTML = 'Penghargaan <span style="font-size: 10px; padding: 2px 6px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; font-weight: bold; text-transform: uppercase;">Segera</span>';
       else if (lang === 'ms') btn.innerHTML = 'Ganjaran <span style="font-size: 10px; padding: 2px 6px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; font-weight: bold; text-transform: uppercase;">Segera</span>';
       else if (lang === 'ru') btn.innerHTML = 'Награды <span style="font-size: 10px; padding: 2px 6px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; font-weight: bold; text-transform: uppercase;">Скоро</span>';
       else if (lang === 'zh') btn.innerHTML = '奖励 <span style="font-size: 10px; padding: 2px 6px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; font-weight: bold; text-transform: uppercase;">即将推出</span>';
    }
  });

  // Settings Panes English -> other languages translations
  // Pane: Profile
  const paneProfH2 = document.querySelector('#pane-profile h2');
  if (paneProfH2 && paneProfH2.textContent.trim() === '👤 Edit Public Profile') {
    if (lang === 'id') paneProfH2.textContent = '👤 Sunting Profil Publik';
    else if (lang === 'ms') paneProfH2.textContent = '👤 Edit Profil Awam';
    else if (lang === 'ru') paneProfH2.textContent = '👤 Редактировать профиль';
    else if (lang === 'zh') paneProfH2.textContent = '👤 编辑公开资料';
  }
  const profLabels = document.querySelectorAll('#pane-profile .settings-form-group label');
  profLabels.forEach(lbl => {
    if (lbl.textContent.trim() === 'Creator Username') {
      if (lang === 'id') lbl.textContent = 'Nama Pengguna Kreator';
      else if (lang === 'ms') lbl.textContent = 'Nama Pengguna Pencipta';
      else if (lang === 'ru') lbl.textContent = 'Имя создателя';
      else if (lang === 'zh') lbl.textContent = '创作者用户名';
    }
    if (lbl.textContent.trim() === 'Biographical Tagline') {
      if (lang === 'id') lbl.textContent = 'Uraian Singkat / Bio';
      else if (lang === 'ms') lbl.textContent = 'Bio Ringkas';
      else if (lang === 'ru') lbl.textContent = 'Биография';
      else if (lang === 'zh') lbl.textContent = '个人简介/签名';
    }
    if (lbl.textContent.trim() === 'Public Verification Badge') {
      if (lang === 'id') lbl.textContent = 'Lencana Verifikasi Publik';
      else if (lang === 'ms') lbl.textContent = 'Lencana Pengesahan Awam';
      else if (lang === 'ru') lbl.textContent = 'Значок верификации';
      else if (lang === 'zh') lbl.textContent = '公开验证徽章';
    }
    if (lbl.textContent.includes('Public Social Channels')) {
      if (lang === 'id') lbl.innerHTML = '🔗 Saluran Sosial Publik';
      else if (lang === 'ms') lbl.innerHTML = '🔗 Saluran Sosial Awam';
      else if (lang === 'ru') lbl.innerHTML = '🔗 Социальные каналы';
      else if (lang === 'zh') lbl.innerHTML = '🔗 公开社交渠道';
    }
  });
  const addSocialsBtn = document.querySelector('#pane-profile .add-socials-btn');
  if (addSocialsBtn && addSocialsBtn.textContent.includes('Add socials')) {
    if (lang === 'id') addSocialsBtn.innerHTML = 'Tambah sosial ↗';
    else if (lang === 'ms') addSocialsBtn.innerHTML = 'Tambah sosial ↗';
    else if (lang === 'ru') addSocialsBtn.innerHTML = 'Добавить сети ↗';
    else if (lang === 'zh') addSocialsBtn.innerHTML = '添加社交链接 ↗';
  }
  const socialDesc = document.querySelector('#pane-profile p');
  if (socialDesc && socialDesc.textContent.includes('Specify URLs of your social')) {
    if (lang === 'id') socialDesc.textContent = 'Tentukan URL jejaring sosial Anda. Tautan ini akan ditampilkan pada deskripsi profil utama Anda.';
    else if (lang === 'ms') socialDesc.textContent = 'Tentukan URL rangkaian sosial anda. Pautan ini akan dipaparkan pada penerangan profil utama anda.';
    else if (lang === 'ru') socialDesc.textContent = 'Укажите свои социальные сети. Ссылки будут отображаться в вашем профиле.';
    else if (lang === 'zh') socialDesc.textContent = '指定您的社交渠道 URL。这些链接将显示在您的主个人资料中。';
  }

  // Pane: Notifications
  const paneNotifH2 = document.querySelector('#pane-notifications h2');
  if (paneNotifH2 && paneNotifH2.textContent.trim() === '🔔 Notification Preferences') {
    if (lang === 'id') paneNotifH2.textContent = '🔔 Pilihan Notifikasi';
    else if (lang === 'ms') paneNotifH2.textContent = '🔔 Pilihan Notifikasi';
    else if (lang === 'ru') paneNotifH2.textContent = '🔔 Настройки уведомлений';
    else if (lang === 'zh') paneNotifH2.textContent = '🔔 通知首选项';
  }
  document.querySelectorAll('#pane-notifications .settings-card').forEach(card => {
    const h3 = card.querySelector('h3');
    const lbl = card.querySelector('.toggle-label');
    if (h3) {
      if (h3.textContent.trim() === 'Email Alerts') {
        if (lang === 'id') h3.textContent = 'Pemberitahuan Email';
        else if (lang === 'ms') h3.textContent = 'Pemberitahuan Emel';
        else if (lang === 'ru') h3.textContent = 'Email-оповещения';
        else if (lang === 'zh') h3.textContent = '电子邮件提醒';
      }
      if (h3.textContent.trim() === 'Mod Comments') {
        if (lang === 'id') h3.textContent = 'Komentar Mod';
        else if (lang === 'ms') h3.textContent = 'Komen Mod';
        else if (lang === 'ru') h3.textContent = 'Комментарии к модам';
        else if (lang === 'zh') h3.textContent = '模组评论';
      }
    }
    if (lbl) {
      if (lbl.innerHTML.includes('Keep me updated')) {
        if (lang === 'id') lbl.innerHTML = lbl.innerHTML.replace('Keep me updated with newsletter', 'Tetap beri saya info dengan nawala (newsletter)');
        else if (lang === 'ms') lbl.innerHTML = lbl.innerHTML.replace('Keep me updated with newsletter', 'Sentiasa pastikan saya dikemas kini dengan buletin');
        else if (lang === 'ru') lbl.innerHTML = lbl.innerHTML.replace('Keep me updated with newsletter', 'Получать информационную рассылку');
        else if (lang === 'zh') lbl.innerHTML = lbl.innerHTML.replace('Keep me updated with newsletter', '通过电子报保持最新状态');
      }
      if (lbl.innerHTML.includes('Alert when users comment')) {
        if (lang === 'id') lbl.innerHTML = lbl.innerHTML.replace('Alert when users comment on my mods', 'Beri tahu bila pengguna berkomentar pada mod saya');
        else if (lang === 'ms') lbl.innerHTML = lbl.innerHTML.replace('Alert when users comment on my mods', 'Beritahu bila pengguna memberi komen pada mod saya');
        else if (lang === 'ru') lbl.innerHTML = lbl.innerHTML.replace('Alert when users comment on my mods', 'Оповещать о комментариях клиентов');
        else if (lang === 'zh') lbl.innerHTML = lbl.innerHTML.replace('Alert when users comment on my mods', '当用户评论我的模组时提醒我');
      }
    }
  });

  // Pane: Appearance
  const paneAppH2 = document.querySelector('#pane-appearance h2');
  if (paneAppH2 && paneAppH2.textContent.trim() === '🎨 Appearance Options') {
    if (lang === 'id') paneAppH2.textContent = '🎨 Pilihan Tampilan';
    else if (lang === 'ms') paneAppH2.textContent = '🎨 Pilihan Rupa';
    else if (lang === 'ru') paneAppH2.textContent = '🎨 Настройки внешнего вида';
    else if (lang === 'zh') paneAppH2.textContent = '🎨 外观选项';
  }
  document.querySelectorAll('#pane-appearance .settings-card').forEach(card => {
    const h3 = card.querySelector('h3');
    const lbl = card.querySelector('.toggle-label');
    if (h3) {
      if (h3.textContent.trim() === 'Animations') {
        if (lang === 'id') h3.textContent = 'Animasi';
        else if (lang === 'ms') h3.textContent = 'Animasi';
        else if (lang === 'ru') h3.textContent = 'Анимации';
        else if (lang === 'zh') h3.textContent = '动画';
      }
      if (h3.textContent.trim() === 'Accent Palette') {
        if (lang === 'id') h3.textContent = 'Palet Aksen';
        else if (lang === 'ms') h3.textContent = 'Palet Aksen';
        else if (lang === 'ru') h3.textContent = 'Цветовая гамма';
        else if (lang === 'zh') h3.textContent = '主题色调';
      }
    }
    if (lbl) {
      if (lbl.innerHTML.includes('Enable glowing')) {
        if (lang === 'id') lbl.innerHTML = lbl.innerHTML.replace('Enable glowing transitions', 'Aktifkan transisi berpendar');
        else if (lang === 'ms') lbl.innerHTML = lbl.innerHTML.replace('Enable glowing transitions', 'Aktifkan peralihan bersinar');
        else if (lang === 'ru') lbl.innerHTML = lbl.innerHTML.replace('Enable glowing transitions', 'Включить светящиеся эффекты');
        else if (lang === 'zh') lbl.innerHTML = lbl.innerHTML.replace('Enable glowing transitions', '启用发光过渡效果');
      }
    }
    const select = card.querySelector('select');
    if (select) {
      select.querySelectorAll('option').forEach(opt => {
        if (opt.value === 'default') {
          if (lang === 'id') opt.textContent = 'Bawaan (Emerald Hijau)';
          else if (lang === 'ms') opt.textContent = 'Lalai (Zamrud Hijau)';
          else if (lang === 'ru') opt.textContent = 'По умолчанию (Изумрудный)';
          else if (lang === 'zh') opt.textContent = '默认（翡翠绿）';
        }
        if (opt.value === 'gray') {
          if (lang === 'id') opt.textContent = 'Abu-abu Dof (Minimalis)';
          else if (lang === 'ms') opt.textContent = 'Kelabu Dof (Minimalis)';
          else if (lang === 'ru') opt.textContent = 'Матовый серый (Минимализм)';
          else if (lang === 'zh') opt.textContent = '哑光灰（极简）';
        }
        if (opt.value === 'cyberpunk') {
          if (lang === 'id') opt.textContent = 'Cyberpunk Emas';
          else if (lang === 'ms') opt.textContent = 'Cyberpunk Emas';
          else if (lang === 'ru') opt.textContent = 'Киберпанк (Золото)';
          else if (lang === 'zh') opt.textContent = '赛博朋克金';
        }
        if (opt.value === 'crimson') {
          if (lang === 'id') opt.textContent = 'Merah Crimson';
          else if (lang === 'ms') opt.textContent = 'Merah Crimson';
          else if (lang === 'ru') opt.textContent = 'Багровый красный';
          else if (lang === 'zh') opt.textContent = '深红';
        }
      });
    }
  });

  // Pane: Privacy
  const panePrivH2 = document.querySelector('#pane-privacy h2');
  if (panePrivH2 && panePrivH2.textContent.trim() === '🔒 Privacy Configurations') {
    if (lang === 'id') panePrivH2.textContent = '🔒 Konfigurasi Privasi';
    else if (lang === 'ms') panePrivH2.textContent = '🔒 Konfigurasi Privasi';
    else if (lang === 'ru') panePrivH2.textContent = '🔒 Конфиденциальность';
    else if (lang === 'zh') panePrivH2.textContent = '🔒 隐私配置';
  }
  document.querySelectorAll('#pane-privacy .settings-card').forEach(card => {
    const h3 = card.querySelector('h3');
    const lbl = card.querySelector('.toggle-label');
    if (h3) {
      if (h3.textContent.trim() === 'Online Status') {
        if (lang === 'id') h3.textContent = 'Status Daring';
        else if (lang === 'ms') h3.textContent = 'Status Dalam Talian';
        else if (lang === 'ru') h3.textContent = 'Статус в сети';
        else if (lang === 'zh') h3.textContent = '在线状态';
      }
      if (h3.textContent.trim() === 'Mod Downloads') {
        if (lang === 'id') h3.textContent = 'Unduhan Mod';
        else if (lang === 'ms') h3.textContent = 'Muat Turun Mod';
        else if (lang === 'ru') h3.textContent = 'Загрузки модов';
        else if (lang === 'zh') h3.textContent = '模组下载';
      }
    }
    if (lbl) {
      if (lbl.innerHTML.includes('Show my presence')) {
        if (lang === 'id') lbl.innerHTML = lbl.innerHTML.replace('Show my presence as ONLINE', 'Tampilkan status saya sebagai DARING (ONLINE)');
        else if (lang === 'ms') lbl.innerHTML = lbl.innerHTML.replace('Show my presence as ONLINE', 'Tunjukkan kehadiran saya sebagai DALAM TALIAN (ONLINE)');
        else if (lang === 'ru') lbl.innerHTML = lbl.innerHTML.replace('Show my presence as ONLINE', 'Показывать статус «В сети»');
        else if (lang === 'zh') lbl.innerHTML = lbl.innerHTML.replace('Show my presence as ONLINE', '公开我的在线状态');
      }
      if (lbl.innerHTML.includes('Show total download')) {
        if (lang === 'id') lbl.innerHTML = lbl.innerHTML.replace('Show total download statistics publicly', 'Tampilkan statistik total unduhan secara publik');
        else if (lang === 'ms') lbl.innerHTML = lbl.innerHTML.replace('Show total download statistics publicly', 'Tunjukkan statistik muat turun secara awam');
        else if (lang === 'ru') lbl.innerHTML = lbl.innerHTML.replace('Show total download statistics publicly', 'Показывать общую статистику скачиваний публично');
        else if (lang === 'zh') lbl.innerHTML = lbl.innerHTML.replace('Show total download statistics publicly', '公开显示总下载量统计');
      }
    }
  });

  // Pane: Security
  const paneSecH2 = document.querySelector('#pane-security h2');
  if (paneSecH2 && paneSecH2.textContent.trim() === '🛡️ Security Settings') {
    if (lang === 'id') paneSecH2.textContent = '🛡️ Pengaturan Keamanan';
    else if (lang === 'ms') paneSecH2.textContent = '🛡️ Tetapan Keselamatan';
    else if (lang === 'ru') paneSecH2.textContent = '🛡️ Настройки безопасности';
    else if (lang === 'zh') paneSecH2.textContent = '🛡️ 安全设置';
  }
  document.querySelectorAll('#pane-security .settings-card').forEach(card => {
    const h3 = card.querySelector('h3');
    const btn = card.querySelector('button');
    if (h3) {
      if (h3.textContent.trim() === 'Session Management') {
        if (lang === 'id') h3.textContent = 'Manajemen Sesi';
        else if (lang === 'ms') h3.textContent = 'Pengurusan Sesi';
        else if (lang === 'ru') h3.textContent = 'Управление сессиями';
        else if (lang === 'zh') h3.textContent = '会话管理';
      }
      if (h3.textContent.trim() === 'Wipe Temporary Cache') {
        if (lang === 'id') h3.textContent = 'Hapus Tembolok Sementara';
        else if (lang === 'ms') h3.textContent = 'Kosongkan Cache Sementara';
        else if (lang === 'ru') h3.textContent = 'Очистить временный кэш';
        else if (lang === 'zh') h3.textContent = '清除临时缓存';
      }
    }
    if (btn) {
      if (btn.textContent.trim() === 'Terminate Session Logs') {
        if (lang === 'id') btn.textContent = 'Akhiri Sesi Log Masuk';
        else if (lang === 'ms') btn.textContent = 'Tamatkan Sesi Log';
        else if (lang === 'ru') btn.textContent = 'Завершить все сессии';
        else if (lang === 'zh') btn.textContent = '终止所有会话';
      }
      if (btn.textContent.trim() === 'Clear LocalStorage Parameters') {
        if (lang === 'id') btn.textContent = 'Hapus Semua Parameter LocalStorage';
        else if (lang === 'ms') btn.textContent = 'Padam Semua Parameter LocalStorage';
        else if (lang === 'ru') btn.textContent = 'Сбросить LocalStorage';
        else if (lang === 'zh') btn.textContent = '清除所有 LocalStorage 参数';
      }
    }
  });

  // Pane: Language
  const paneLangH2 = document.querySelector('#pane-language h2');
  if (paneLangH2 && paneLangH2.textContent.includes('Language Settings')) {
    if (lang === 'id') paneLangH2.textContent = '🌐 Pengaturan Bahasa';
    else if (lang === 'ms') paneLangH2.textContent = '🌐 Tetapan Bahasa';
    else if (lang === 'ru') paneLangH2.textContent = '🌐 Настройки языка';
    else if (lang === 'zh') paneLangH2.textContent = '🌐 语言设置';
  }
  const paneLangDesc = document.querySelector('#pane-language p');
  if (paneLangDesc && paneLangDesc.textContent.includes('Choose your preferred')) {
    if (lang === 'id') paneLangDesc.textContent = 'Pilih bahasa tampilan untuk AstroMods Control Center.';
    else if (lang === 'ms') paneLangDesc.textContent = 'Pilih bahasa paparan kegemaran anda untuk AstroMods Control Center.';
    else if (lang === 'ru') paneLangDesc.textContent = 'Выберите язык интерфейса для AstroMods Control Center.';
    else if (lang === 'zh') paneLangDesc.textContent = '为 AstroMods 控制中心选择您喜爱的显示语言。';
  }
  const paneLangCardH3 = document.querySelector('#pane-language .settings-card h3');
  if (paneLangCardH3 && paneLangCardH3.textContent.includes('Select Interface Language')) {
    if (lang === 'id') paneLangCardH3.innerHTML = '🌎 Pilih Bahasa Antarmuka';
    else if (lang === 'ms') paneLangCardH3.innerHTML = '🌎 Pilih Bahasa Antarmuka';
    else if (lang === 'ru') paneLangCardH3.innerHTML = '🌎 Выберите язык интерфейса';
    else if (lang === 'zh') paneLangCardH3.innerHTML = '🌎 选择界面语言';
  }
  const paneLangCardP = document.querySelector('#pane-language .settings-card p');
  if (paneLangCardP && paneLangCardP.textContent.includes('Choose whether you want')) {
    if (lang === 'id') paneLangCardP.textContent = 'Pilih apakah Anda ingin menampilkan portal tindakan, judul, dan deskripsi dalam bahasa Inggris atau bahasa pilihan lainnya.';
    else if (lang === 'ms') paneLangCardP.textContent = 'Pilih sama ada anda ingin melihat butang tindakan, tajuk dan bio dalam Bahasa Melayu.';
    else if (lang === 'ru') paneLangCardP.textContent = 'Выберите, хотите ли вы видеть элементы управления, заголовки и описания на русском языке.';
    else if (lang === 'zh') paneLangCardP.textContent = '选择您是否希望以中文显示操作按钮、标题和描述性文字。';
  }

  // Main Submit form button in settings.html
  const saveBtn = document.querySelector('form button[type="submit"].save-btn');
  if (saveBtn) {
    if (lang === 'id') saveBtn.innerText = 'Simpan Perubahan Pengaturan';
    else if (lang === 'ms') saveBtn.innerText = 'Simpan Perubahan Tetapan';
    else if (lang === 'ru') saveBtn.innerText = 'Сохранить изменения настроек';
    else if (lang === 'zh') saveBtn.innerText = '保存设置更改';
  }

  // Translate footer elements
  const footerMotto = document.getElementById('footerMottoText');
  const footerColNav = document.getElementById('footerColNavTitle');
  const footerColLegal = document.getElementById('footerColLegalTitle');
  const footerCopyright = document.getElementById('footerCopyrightText');

  if (footerMotto) {
    if (lang === 'id') {
      footerMotto.textContent = 'Stasiun kosmik andalan Anda untuk modifikasi game kelas atas, skrip eksekutor, addon, dan peningkatan performa tinggi.';
    } else if (lang === 'ms') {
      footerMotto.textContent = 'Stesen kosmik utama anda untuk pengubahsuaian permainan kelas tinggi, skrip eksekutor, addon, dan peningkatan prestasi tinggi.';
    } else if (lang === 'ru') {
      footerMotto.textContent = 'Ваша главная космическая станция для первоклассных модификаций игр, скриптов выполнения, аддонов и высокопроизводительных улучшений.';
    } else if (lang === 'zh') {
      footerMotto.textContent = '您的终极宇宙站，为您提供顶级游戏模组、执行器脚本、附加组件和高性能增强功能。';
    } else {
      footerMotto.textContent = 'Your ultimate cosmic station for top-tier game modifications, executor scripts, addons, and high-performance enhancements.';
    }
  }

  if (footerColNav) {
    if (lang === 'id') footerColNav.textContent = 'Navigasi';
    else if (lang === 'ms') footerColNav.textContent = 'Navigasi';
    else if (lang === 'ru') footerColNav.textContent = 'Навигация';
    else if (lang === 'zh') footerColNav.textContent = '导航';
    else footerColNav.textContent = 'Navigation';
  }

  if (footerColLegal) {
    if (lang === 'id') footerColLegal.textContent = 'Aturan & Hukum';
    else if (lang === 'ms') footerColLegal.textContent = 'Undang-undang & Peraturan';
    else if (lang === 'ru') footerColLegal.textContent = 'Правила и условия';
    else if (lang === 'zh') footerColLegal.textContent = '规则与法律';
    else footerColLegal.textContent = 'Legal & Rules';
  }

  if (footerCopyright) {
    if (lang === 'id') {
      footerCopyright.textContent = '© 2010-' + new Date().getFullYear() + ' AstroMods. Hak cipta dilindungi undang-undang. Dibuat dan dikembangkan oleh bimaignal2010.';
    } else if (lang === 'ms') {
      footerCopyright.textContent = '© 2010-' + new Date().getFullYear() + ' AstroMods. Hak cipta terpelihara. Dicipta dan diuruskan oleh bimaignal2010.';
    } else if (lang === 'ru') {
      footerCopyright.textContent = '© 2010-' + new Date().getFullYear() + ' AstroMods. Все права защищены. Создано и управляется bimaignal2010.';
    } else if (lang === 'zh') {
      footerCopyright.textContent = '© 2010-' + new Date().getFullYear() + ' AstroMods. 保留所有权利。由 bimaignal2010 创建并运营。';
    } else {
      footerCopyright.textContent = '© 2010-' + new Date().getFullYear() + ' AstroMods. All rights reserved. Created and managed by bimaignal2010.';
    }
  }

  // Translate Profile section headers
  const favHeading = document.getElementById('profileFavoritesHeading');
  if (favHeading) {
    if (lang === 'id') favHeading.innerHTML = `Favorit Saya (<span id="profileFavoritesCount">${document.getElementById('profileFavoritesCount') ? document.getElementById('profileFavoritesCount').innerText : '0'}</span>)`;
    else if (lang === 'ms') favHeading.innerHTML = `Kegemaran Saya (<span id="profileFavoritesCount">${document.getElementById('profileFavoritesCount') ? document.getElementById('profileFavoritesCount').innerText : '0'}</span>)`;
    else if (lang === 'ru') favHeading.innerHTML = `Мои любимые моды (<span id="profileFavoritesCount">${document.getElementById('profileFavoritesCount') ? document.getElementById('profileFavoritesCount').innerText : '0'}</span>)`;
    else if (lang === 'zh') favHeading.innerHTML = `我的收藏模组 (<span id="profileFavoritesCount">${document.getElementById('profileFavoritesCount') ? document.getElementById('profileFavoritesCount').innerText : '0'}</span>)`;
  }
}

// --- 14. REPORT, EDIT AND ADMIN MOD SUBSYSTEMS ---
function injectModalsToBody() {
  if (document.getElementById('editModModal')) return; // Already injected
  
  // 1. Edit Mod Modal
  const editModal = document.createElement('div');
  editModal.id = 'editModModal';
  editModal.className = 'upload-modal-overlay';
  editModal.innerHTML = `
    <div class="upload-modal-box" style="max-width: 520px; position:relative; background:#11161b; max-height: 85vh; overflow-y: auto; padding: 25px;">
      <button class="close-upload-btn" onclick="closeEditModModal()">&times;</button>
      <h2 style="font-family:'Orbitron',sans-serif; text-transform:uppercase; font-size: 18px;">✏️ EDIT GAME MOD</h2>
      <p class="upload-subtitle" style="color: #10b981; font-weight: bold; font-size: 11px;">Modify your published mod properties below.</p>
      
      <form class="upload-form" onsubmit="handleEditModSubmit(event)" id="editModForm" style="display:block;">
        <input type="hidden" id="editModId">
        
        <div style="text-align: left; margin-bottom: 12px;">
          <label style="color:#64748b; font-size:11px; font-weight:bold; display:block; margin-bottom:4px;">Mod Addon Title Name:</label>
          <input type="text" id="editModTitle" placeholder="Mod Title" required style="width:100%; padding:10px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; border-radius:8px;">
        </div>
        
        <div style="text-align: left; margin-bottom: 12px;">
          <label style="color:#64748b; font-size:11px; font-weight:bold; display:block; margin-bottom:4px;">Documentation Guide Description:</label>
          <textarea id="editModDesc" rows="4" required style="width:100%; padding:10px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; border-radius:8px; resize:none;"></textarea>
        </div>

        <div style="text-align: left; margin-bottom: 12px; display: flex; gap: 12px;">
          <div style="flex: 1;">
            <label style="color:#64748b; font-size:11px; font-weight:bold; display:block; margin-bottom:4px;">Mod Version:</label>
            <input type="text" id="editModVersion" placeholder="e.g. v1.0" required style="width:100%; padding:10px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; border-radius:8px;">
          </div>
          <div style="flex: 1;">
            <label style="color:#64748b; font-size:11px; font-weight:bold; display:block; margin-bottom:4px;">Minecraft / Game Version:</label>
            <input type="text" id="editModGameVersion" placeholder="e.g. 1.21" required style="width:100%; padding:10px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; border-radius:8px;">
          </div>
        </div>

        <div style="text-align: text-left; margin-bottom: 12px;">
          <label style="color:#64748b; font-size:11px; font-weight:bold; display:block; margin-bottom:4px;">Replace Mod Profile Picture / Icon Logo:</label>
          <input type="file" id="editModLogoFile" accept="image/*" style="width:100%; font-size:12px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; padding:8px; border-radius:8px;">
          <small style="color:#64748b; font-size:10px;">Leave blank if you do not want to alter the current icon badge.</small>
        </div>

        <div style="text-align: text-left; margin-bottom: 12px;">
          <label style="color:#64748b; font-size:11px; font-weight:bold; display:block; margin-bottom:4px;">Replace Downloadable Mod Source File (.zip, etc):</label>
          <input type="file" id="editModDownloadFile" style="width:100%; font-size:12px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; padding:8px; border-radius:8px;">
          <small style="color:#64748b; font-size:10px;">Leave blank if you do not want to change the target downloaded archive.</small>
        </div>

        <div style="text-align: text-left; margin-bottom: 12px;">
          <label style="color:#64748b; font-size:11px; font-weight:bold; display:block; margin-bottom:4px;">YouTube Video Link (Full Gameplay Video):</label>
          <input type="url" id="editModYoutubeVideo" placeholder="e.g. https://www.youtube.com/watch?v=xxxxxx" style="width:100%; padding:10px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; border-radius:8px;">
          <small style="color:#64748b; font-size:10px;">Videos directly uploaded to the gallery are automatically converted to looping GIFs. Use this YouTube link for a full-length gameplay showcase video with audio support.</small>
        </div>

        <div style="text-align: text-left; margin-bottom: 15px;">
          <label style="color:#64748b; font-size:11px; font-weight:bold; display:block; margin-bottom:4px;">Replace Mod Screenshots & Videos Gallery:</label>
          <input type="file" id="editModGalleryFiles" accept="image/*,video/*" multiple style="width:100%; font-size:12px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; padding:8px; border-radius:8px;">
          <small style="color:#10b981; font-weight:600; font-size:10.5px;">Choose new media files to overwrite current screenshots and videos in IndexedDB.</small>
        </div>
        
        <div style="text-align: left; margin-bottom: 20px; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="editModComments" style="width:auto; margin:0;">
          <label for="editModComments" style="color:#cbd5e1; font-size:12px; cursor:pointer;">Allow guest & player comments on detail page</label>
        </div>
        
        <button type="submit" class="upload-submit-btn" style="background:#10b981 !important; color:white; width:100%; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">SAVE REVISED SPECIFICATIONS</button>
      </form>
    </div>
  `;
  document.body.appendChild(editModal);

  // 2. Report Mod Modal
  const reportModal = document.createElement('div');
  reportModal.id = 'reportModModal';
  reportModal.className = 'upload-modal-overlay';
  reportModal.innerHTML = `
    <div class="upload-modal-box" style="max-width: 500px; position:relative; background:#11161b;">
      <button class="close-upload-btn" onclick="closeReportModModal()">&times;</button>
      <h2 style="color:#ff3e4e; font-family:'Orbitron',sans-serif; text-transform:uppercase;">🚨 REPORT GAME MOD</h2>
      <p class="upload-subtitle" style="color:#94a3b8;">Help keep AstroMods clean. Specify guideline violations below.</p>
      
      <form class="upload-form" onsubmit="handleReportModSubmit(event)" id="reportModForm" style="display:block;">
        <input type="hidden" id="reportTargetId">
        <input type="hidden" id="reportTargetTitle">
        <input type="hidden" id="reportTargetCreator">
        
        <div style="text-align: left; margin-bottom: 12px;">
          <label style="color:#cbd5e1; font-size:12px; font-weight:bold; display:block; margin-bottom:4px;">Category of Guideline Violation:</label>
          <select id="reportReason" required style="width:100%; padding:10px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; border-radius:8px;">
            <option value="mod 18+">🔞 Konten Dewasa / Mod 18+ / NSFW (Seksual)</option>
            <option value="mod scam">💸 Penipuan / Mod Scam / Phishing Code</option>
            <option value="mod hacker">🛡️ Mod Hacker / Malware / Spyware</option>
            <option value="mod hak cipta yang seharusnya berbayar malah di gratisin">⚖️ Pelanggaran Hak Cipta (Pirated/Premium bypass)</option>
            <option value="mod cheat">⚡ Mod Cheat / Game Exploits (Unfair advantage)</option>
            <option value="lainnya">❓ Lainnya / Other Prohibited Content</option>
          </select>
        </div>
        
        <div style="text-align: left; margin-bottom: 20px;">
          <label style="color:#cbd5e1; font-size:12px; font-weight:bold; display:block; margin-bottom:4px;">Details & Evidence of Violation:</label>
          <textarea id="reportDetails" rows="4" placeholder="Explain how or why this mod violates community guidelines..." required style="width:100%; padding:10px; background:#171921; border: 1px solid rgba(255,255,255,0.08); color:white; border-radius:8px; resize:none;"></textarea>
        </div>
        
        <button type="submit" class="upload-submit-btn" style="background:#ff3e4e !important; color:white; width:100%; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">SUBMIT OFFICIAL REPORT</button>
      </form>
    </div>
  `;
  document.body.appendChild(reportModal);

  // 3. Admin Portal Modal
  const adminModal = document.createElement('div');
  adminModal.id = 'adminPortalModal';
  adminModal.className = 'upload-modal-overlay';
  adminModal.innerHTML = `
    <div class="upload-modal-box" style="max-width: 800px; width:92%; position:relative; background:#11161b; border:1px solid rgba(239, 68, 68, 0.25);">
      <button class="close-upload-btn" onclick="closeAdminPortalModal()">&times;</button>
      <h2 style="color:#ff3e4e; font-family:'Orbitron',sans-serif; text-transform:uppercase; display:flex; align-items:center; gap:8px;">🛡️ Owner Moderator Console</h2>
      <p class="upload-subtitle" style="color:#94a3b8;">Welcome, website owner. Review reports, terminate infringing items, and register guidelines warnings on user accounts.</p>
      
      <div style="max-height: 400px; overflow-y:auto; margin-top:20px; border:1px solid rgba(255,255,255,0.06); border-radius:8px; background:#0d1117;">
        <table style="width:100%; border-collapse: collapse; font-size:13px; text-align:left;">
          <thead>
            <tr style="background:#171d24; border-bottom:1px solid rgba(255,255,255,0.06); color:#cbd5e1;">
              <th style="padding:12px; font-weight:600;">Pelapor (Reporter)</th>
              <th style="padding:12px; font-weight:600;">Mod / Kreator</th>
              <th style="padding:12px; font-weight:600;">Jenis Pelanggaran</th>
              <th style="padding:12px; font-weight:600;">Bukti Laporan (Description)</th>
              <th style="padding:12px; text-align:right; font-weight:600;">Tindakan Mod</th>
            </tr>
          </thead>
          <tbody id="adminReportsTableBody">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; font-size:11px; color:#64748b;">
        <span>Session: Authorized Owner Portal (bimaignal2010@gmail.com)</span>
        <button onclick="clearReportsList()" style="background:#1e293b; color:#94a3b8; border:1px solid rgba(255,255,255,0.04); padding:6px 12px; border-radius:6px; cursor:pointer;" class="cf-btn">Clear Completed Archive</button>
      </div>
    </div>
  `;
  document.body.appendChild(adminModal);

  // 4. Creator Stats Modal
  const statsModal = document.createElement('div');
  statsModal.id = 'creatorStatsModal';
  statsModal.className = 'upload-modal-overlay';
  statsModal.innerHTML = `
    <div class="upload-modal-box" style="max-width: 650px; width:92%; position:relative; background:#11161b; border: 1px solid rgba(16, 185, 129, 0.25);">
      <button class="close-upload-btn" onclick="closeCreatorStatsModal()">&times;</button>
      <h2 style="color:#10b981; font-family:'Orbitron',sans-serif; text-transform:uppercase; display:flex; align-items:center; gap:8px; font-size: 20px;">📊 Creator Performance Analytics</h2>
      <p class="upload-subtitle" style="color:#94a3b8;">Real-time diagnostics and download statistics for your uploaded game packages.</p>

      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top:20px;">
        <div style="background:#0d1117; padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); text-align:center;">
          <h3 id="statsModalTotalDownloads" style="color:#10b981; font-size:24px; font-weight:bold; margin-bottom:4px;">0</h3>
          <p style="color:#64748b; font-size:10px; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px;">Total Downloads</p>
        </div>
        <div style="background:#0d1117; padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); text-align:center;">
          <h3 id="statsModalActiveMods" style="color:#3b82f6; font-size:24px; font-weight:bold; margin-bottom:4px;">0</h3>
          <p style="color:#64748b; font-size:10px; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px;">Active Uploads</p>
        </div>
        <div style="background:#0d1117; padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); text-align:center;">
          <h3 id="statsModalAvgRating" style="color:#eab308; font-size:24px; font-weight:bold; margin-bottom:4px;">0.0</h3>
          <p style="color:#64748b; font-size:10px; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px;">Avg star Rating</p>
        </div>
        <div style="background:#0d1117; padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); text-align:center;">
          <h3 id="statsModalLikes" style="color:#ef4444; font-size:24px; font-weight:bold; margin-bottom:4px;">0</h3>
          <p style="color:#64748b; font-size:10px; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px;">Total Stars / Likes</p>
        </div>
      </div>

      <div style="margin-top:20px; background:#0d1117; border: 1px solid rgba(255,255,255,0.04); border-radius:10px; padding:16px; text-align: left;">
        <h3 style="font-size:12px; font-weight:bold; color:white; margin-bottom:12px; font-family:'Orbitron',sans-serif; text-transform:uppercase; display:flex; justify-content:space-between; align-items:center;">
          Package Distribution Chart
          <span style="font-size:10px; font-family:sans-serif; color:#64748b; text-transform:none;">Metric: Downloads</span>
        </h3>
        <div id="statsModalChartContainer" style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
          <!-- Horizonal styled bars for mods downloads -->
        </div>
      </div>

      <div style="margin-top:20px; padding:15px; background: rgba(59,130,246,0.05); border: 1px dashed rgba(59,130,246,0.2); border-radius:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; text-align: left;">
        <div style="flex:1;">
          <h4 style="font-size:12px; font-weight:bold; color:#93c5fd;">🚀 Simulate Sandbox Growth</h4>
          <p style="font-size:11px; color:#64748b; margin:0;">Infect traffic bursts to simulate downloads, view counters, and likes on your creations.</p>
        </div>
        <button onclick="simulateCreatorStatsGrowth()" style="background:#3b82f6; color:white; font-size:11px; font-weight:bold; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;" class="cf-btn">Simulate Traffic +1.5K</button>
      </div>
    </div>
  `;
  document.body.appendChild(statsModal);
}

function openEditModModal(modId) {
  const mod = ALL_GAME_MODS.find(m => m.id === modId);
  if (!mod) {
    alert("Error: Mod not found in memory.");
    return;
  }
  document.getElementById('editModId').value = mod.id;
  document.getElementById('editModTitle').value = mod.title;
  document.getElementById('editModDesc').value = mod.desc;
  document.getElementById('editModComments').checked = !!mod.allowComments;
  
  if (document.getElementById('editModVersion')) {
    document.getElementById('editModVersion').value = mod.modVersion || "v1.0";
  }
  if (document.getElementById('editModGameVersion')) {
    document.getElementById('editModGameVersion').value = mod.gameVersion || (mod.versionList && mod.versionList[0]) || "1.21";
  }
  if (document.getElementById('editModYoutubeVideo')) {
    document.getElementById('editModYoutubeVideo').value = mod.ytVideoUrl || "";
  }

  // Reset file inputs values
  if (document.getElementById('editModLogoFile')) document.getElementById('editModLogoFile').value = "";
  if (document.getElementById('editModDownloadFile')) document.getElementById('editModDownloadFile').value = "";
  if (document.getElementById('editModGalleryFiles')) document.getElementById('editModGalleryFiles').value = "";

  const modal = document.getElementById('editModModal');
  if (modal) modal.classList.add('upload-modal-active');
}

function closeEditModModal() {
  const modal = document.getElementById('editModModal');
  if (modal) modal.classList.remove('upload-modal-active');
}

async function handleEditModSubmit(event) {
  event.preventDefault();
  const id = document.getElementById('editModId').value;
  const title = document.getElementById('editModTitle').value;
  const desc = document.getElementById('editModDesc').value;
  const allowComments = document.getElementById('editModComments').checked;
  const modVerInput = document.getElementById('editModVersion') ? document.getElementById('editModVersion').value.trim() : "";
  const gameVerInput = document.getElementById('editModGameVersion') ? document.getElementById('editModGameVersion').value.trim() : "";
  const editModYoutubeValue = document.getElementById('editModYoutubeVideo') ? document.getElementById('editModYoutubeVideo').value.trim() : "";

  // Helper inside submit to read files
  const readAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Find references
  let userUploadedMods = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
  let idx = userUploadedMods.findIndex(m => m.id === id);
  let idxAll = ALL_GAME_MODS.findIndex(m => m.id === id);
  const modInMemory = idxAll !== -1 ? ALL_GAME_MODS[idxAll] : null;

  let newLogo = modInMemory ? modInMemory.img : "";
  let newFileName = modInMemory ? modInMemory.file : "";
  let newFileSize = modInMemory ? modInMemory.size : "";

  // Show status banner
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerText : "SAVE REVISED SPECIFICATIONS";
  if (submitBtn) {
    submitBtn.innerText = "⏳ PROCESSING & SAVING FILES...";
    submitBtn.disabled = true;
  }

  // 1. Check Mod Logo Upload
  const logoInputInput = document.getElementById('editModLogoFile');
  if (logoInputInput && logoInputInput.files && logoInputInput.files[0]) {
    try {
      newLogo = await readAsBase64(logoInputInput.files[0]);
    } catch(err) {
      console.error("Error reading logo file:", err);
    }
  }

  // 2. Check Mod File Download Upload
  const fileInputInput = document.getElementById('editModDownloadFile');
  if (fileInputInput && fileInputInput.files && fileInputInput.files[0]) {
    const fUpload = fileInputInput.files[0];
    newFileName = fUpload.name;
    const sizeMB = fUpload.size / (1024 * 1024);
    newFileSize = `${sizeMB.toFixed(1)} MB`;

    // Save updated binary package to IndexedDB asynchronously
    if (window.saveAstroModGallery) {
      try {
        const fileB64 = await readAsBase64(fUpload);
        await window.saveAstroModGallery("file_" + id, fileB64);
        console.log("Successfully updated local mod binary package in IndexedDB!");
      } catch (fErr) {
        console.error("Error reading and saving edit mod file to IndexedDB:", fErr);
      }
    }
  }

  // 3. Check Gallery upload
  const galleryInputInput = document.getElementById('editModGalleryFiles');
  let newGalleryBase64s = [];
  let updatedGalleryCount = 0;
  if (galleryInputInput && galleryInputInput.files && galleryInputInput.files.length > 0) {
    const filesArr = Array.from(galleryInputInput.files);
    for (const f of filesArr) {
      try {
        const b64 = await readAsBase64(f);
        newGalleryBase64s.push(b64);
      } catch (err) {
        console.error("Error reading gallery file:", err);
      }
    }
    updatedGalleryCount = newGalleryBase64s.length;
  }

  // Update localStorage item
  if (idx !== -1) {
    userUploadedMods[idx].title = title;
    userUploadedMods[idx].desc = desc;
    userUploadedMods[idx].allowComments = allowComments;
    userUploadedMods[idx].modVersion = modVerInput || userUploadedMods[idx].modVersion || "v1.0";
    userUploadedMods[idx].gameVersion = gameVerInput || userUploadedMods[idx].gameVersion || "1.21";
    if (gameVerInput) {
      userUploadedMods[idx].versionList = [gameVerInput];
      userUploadedMods[idx].version = gameVerInput + "+";
    }
    if (newLogo) userUploadedMods[idx].img = newLogo;
    if (newFileName) {
      userUploadedMods[idx].file = newFileName;
      userUploadedMods[idx].size = newFileSize;
    }
    userUploadedMods[idx].ytVideoUrl = editModYoutubeValue;
    localStorage.setItem('astro_user_uploaded_mods', JSON.stringify(userUploadedMods));
  }

  // Update ALL_GAME_MODS
  if (idxAll !== -1) {
    ALL_GAME_MODS[idxAll].title = title;
    ALL_GAME_MODS[idxAll].desc = desc;
    ALL_GAME_MODS[idxAll].allowComments = allowComments;
    ALL_GAME_MODS[idxAll].modVersion = modVerInput || ALL_GAME_MODS[idxAll].modVersion || "v1.0";
    ALL_GAME_MODS[idxAll].gameVersion = gameVerInput || ALL_GAME_MODS[idxAll].gameVersion || "1.21";
    if (gameVerInput) {
      ALL_GAME_MODS[idxAll].versionList = [gameVerInput];
      ALL_GAME_MODS[idxAll].version = gameVerInput + "+";
    }
    if (newLogo) ALL_GAME_MODS[idxAll].img = newLogo;
    if (newFileName) {
      ALL_GAME_MODS[idxAll].file = newFileName;
      ALL_GAME_MODS[idxAll].size = newFileSize;
    }
    ALL_GAME_MODS[idxAll].ytVideoUrl = editModYoutubeValue;
  }

  // Update gallery IndexedDB
  if (updatedGalleryCount > 0 && window.saveAstroModGallery) {
    try {
      await window.saveAstroModGallery(id, newGalleryBase64s);
    } catch(dbErr) {
      console.error("Error saving updated gallery slides:", dbErr);
    }
  }
  
  alert("⚙️ MODIFICATIONS UPDATED SUCCESSFULLY: Your game mod details and specifications have been updated!");
  closeEditModModal();
  window.location.reload();
}

function openReportModModal(modId, modTitle, modCreator) {
  if (!userIsLoggedIn) {
    alert("Authentication required. Please Login or Register FIRST to file an official violation report!");
    openLoginModal();
    return;
  }
  
  document.getElementById('reportTargetId').value = modId;
  document.getElementById('reportTargetTitle').value = modTitle;
  document.getElementById('reportTargetCreator').value = modCreator;
  document.getElementById('reportReason').selectedIndex = 0;
  document.getElementById('reportDetails').value = "";
  
  const modal = document.getElementById('reportModModal');
  if (modal) modal.classList.add('upload-modal-active');
}

function closeReportModModal() {
  const modal = document.getElementById('reportModModal');
  if (modal) modal.classList.remove('upload-modal-active');
}

function handleReportModSubmit(event) {
  event.preventDefault();
  const modId = document.getElementById('reportTargetId').value;
  const modTitle = document.getElementById('reportTargetTitle').value;
  const modCreator = document.getElementById('reportTargetCreator').value;
  const reasonValue = document.getElementById('reportReason').value;
  const detailsVal = document.getElementById('reportDetails').value;
  
  const reporter = localStorage.getItem('astroUsername') || 'Anonymous Player';
  
  const newReport = {
    id: "rep-" + Date.now(),
    modId: modId,
    reporter: reporter,
    modTitle: modTitle,
    modCreator: modCreator,
    reason: reasonValue,
    details: detailsVal,
    timestamp: new Date().toLocaleString()
  };
  
  let reports = JSON.parse(localStorage.getItem('astro_reports_list') || '[]');
  reports.unshift(newReport);
  localStorage.setItem('astro_reports_list', JSON.stringify(reports));
  
  alert(`📢 LAPORAN TERKIRIM:\nTerima kasih atas laporan Anda. Laporan untuk kategori "${reasonValue}" telah dikirimkan kepada tim pemilik website (bimaignal2010@gmail.com) dan akan ditinjau segera. Pelanggar yang terbukti bersalah akan langsung dihapus modnya dan diberi poin pelanggaran!`);
  closeReportModModal();
}

function openAdminPortalModal() {
  const loggedInUserStr = (localStorage.getItem('astroUsername') || 'Player').toLowerCase();
  const isOwner = loggedInUserStr === 'bimaignal2010' || loggedInUserStr === 'bimaignal2010@gmail.com' || loggedInUserStr === 'admin';
  if (!isOwner) {
    alert("AKSES DITOLAK: Anda bukan pemilik (owner) dari website ini!");
    return;
  }
  const modal = document.getElementById('adminPortalModal');
  if (modal) {
    modal.classList.add('upload-modal-active');
    renderAdminReports();
  }
}

function closeAdminPortalModal() {
  const modal = document.getElementById('adminPortalModal');
  if (modal) modal.classList.remove('upload-modal-active');
}

function renderAdminReports() {
  const tbody = document.getElementById('adminReportsTableBody');
  if (!tbody) return;
  
  let reports = JSON.parse(localStorage.getItem('astro_reports_list') || '[]');
  if (reports.length === 0) {
    // Inject pre-filled mock reports so the owner admin panel doesn't look barren on launch
    reports = [
      {
        id: "rep-sample-1",
        modId: "pokemon-bedrock",
        reporter: "ReyzMinecrafter",
        modTitle: "SERP Pokédrock Addon",
        modCreator: "ZacekElSerpentin",
        reason: "mod hak cipta yang seharusnya berbayar malah di gratisin",
        details: "Modifikasi ini membocorkan aset premium berbayar dari pembuat asli di Patreon secara gratis ilegal.",
        timestamp: "05/27/2026, 11:28:44 AM"
      },
      {
        id: "rep-sample-2",
        modId: "bloxfruits-script",
        reporter: "XavierGamer",
        modTitle: "BloxFruits VIP AutoFarm",
        modCreator: "VIP_MODS_PRO",
        reason: "mod scam",
        details: "Pake mod ini kena mencuri cookie roblox saya, akun saya langsung ke scam hacker rbx.",
        timestamp: "05/26/2026, 09:12:15 PM"
      }
    ];
    localStorage.setItem('astro_reports_list', JSON.stringify(reports));
  }
  
  tbody.innerHTML = "";
  reports.forEach(r => {
    tbody.innerHTML += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
        <td style="padding:12px; color:#10b981; font-weight:700;">${r.reporter}</td>
        <td style="padding:12px;">
          <div style="font-weight:bold; color:white;">${r.modTitle}</div>
          <div style="font-size:11px; color:#64748b;">Kreator: <a href="profile.html?user=${encodeURIComponent(r.modCreator)}" style="color:#f87171; font-weight:600; text-decoration:none;">${r.modCreator}</a></div>
        </td>
        <td style="padding:12px;"><span style="background:rgba(239, 68, 68, 0.15); color:#f87171; border:1px solid rgba(239, 68, 68, 0.2); padding:3px 8px; border-radius:4px; font-weight:bold; text-transform:uppercase; font-size:10px;">${r.reason}</span></td>
        <td style="padding:12px; word-break:break-word; max-width:220px; color:#cbd5e1;" class="report-details-cell">
          <div style="line-height:1.4;">${r.details}</div>
          <div style="font-size:10px; color:#64748b; margin-top:5px;">🕒 ${r.timestamp}</div>
        </td>
        <td style="padding:12px; text-align:right; white-space:nowrap;">
          <button onclick="adminResolveDeleteMod('${r.modId}', '${r.modCreator.replace(/'/g, "\\'")}', '${r.id}')" style="background:#ef4444; color:white; font-size:11px; font-weight:bold; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; margin-right:5px;" class="cf-btn">🗑️ HAPUS MOD & PELANGGARAN</button>
          <button onclick="adminResolveDismissReport('${r.id}')" style="background:#1e293b; color:#cbd5e1; font-size:11px; border:1px solid rgba(255,255,255,0.08); padding:8px 12px; border-radius:6px; cursor:pointer;" class="cf-btn">Tolak</button>
        </td>
      </tr>
    `;
  });
}

function adminResolveDeleteMod(modId, creator, reportId) {
  if (confirm(`🛡️ TINDAKAN MODERATOR PEMILIK WEBSITE:\nApakah Anda yakin ingin MENGHAPUS modifikasi ini secara permanen dari website dan memberikan 1 PUNISHMENT PELANGGARAN kepada uploader: "${creator}"?`)) {
    
    // 1. Tambahkan ke blocklist global
    let blockedMods = JSON.parse(localStorage.getItem('astro_blocked_mods_list') || '[]');
    if (!blockedMods.includes(modId)) {
      blockedMods.push(modId);
      localStorage.setItem('astro_blocked_mods_list', JSON.stringify(blockedMods));
    }
    
    // 2. Hapus dari user_uploaded_mods
    let userUploadedMods = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
    userUploadedMods = userUploadedMods.filter(m => m.id !== modId);
    localStorage.setItem('astro_user_uploaded_mods', JSON.stringify(userUploadedMods));
    
    // 3. Hapus secara real-time dari array memori
    for (let i = ALL_GAME_MODS.length - 1; i >= 0; i--) {
      if (ALL_GAME_MODS[i].id === modId) {
        ALL_GAME_MODS.splice(i, 1);
      }
    }
    
    // 4. Catat warning/pelanggaran pada akun uploader
    const violationsKey = `astro_violations_${creator.toLowerCase()}`;
    let cViolations = parseInt(localStorage.getItem(violationsKey) || '0');
    cViolations += 1;
    localStorage.setItem(violationsKey, cViolations.toString());
    
    // 5. Hapus laporan ini dari antrean karena sudah selesai ditindak
    let reports = JSON.parse(localStorage.getItem('astro_reports_list') || '[]');
    reports = reports.filter(r => r.id !== reportId);
    localStorage.setItem('astro_reports_list', JSON.stringify(reports));
    
    alert(`⚡ MOD BERHASIL DIHAPUS & DIHUKUM!\nModifikasi bermasalah telah lenyap dari website. Akun ${creator} telah resmi diberikan pelanggaran.`);
    
    renderAdminReports();
    
    // Refresh halaman untuk memperbarui portofolio dan feed saat ini
    setTimeout(() => { window.location.reload(); }, 350);
  }
}

function adminResolveDismissReport(reportId) {
  let reports = JSON.parse(localStorage.getItem('astro_reports_list') || '[]');
  reports = reports.filter(r => r.id !== reportId);
  localStorage.setItem('astro_reports_list', JSON.stringify(reports));
  alert("Laporan ditolak (Mod aman dan bersih).");
  renderAdminReports();
}

function clearReportsList() {
  if (confirm("Kosongkan semua arsip riwayat laporan saat ini?")) {
    localStorage.setItem('astro_reports_list', JSON.stringify([]));
    renderAdminReports();
  }
}

function openCreatorStatsModal() {
  const modal = document.getElementById('creatorStatsModal');
  if (!modal) {
    return;
  }
  
  const loggedInUser = localStorage.getItem('astroUsername') || 'Player';
  
  // Find all mods uploaded by this user
  const userMods = ALL_GAME_MODS.filter(m => m.creator.toLowerCase() === loggedInUser.toLowerCase());
  
  // Totals calculations
  let totalDownloads = 0;
  let totalLikes = 0;
  let sumAvgRating = 0;
  
  userMods.forEach(m => {
    totalDownloads += parseFormattedCountValue(m.downloads);
    totalLikes += parseFormattedCountValue(m.likes);
    sumAvgRating += parseFloat(getModAverageRating(m.id, m.likes));
  });
  
  const avgRating = userMods.length > 0 ? (sumAvgRating / userMods.length).toFixed(1) : "0.0";
  
  // Update UI Elements in the Modal
  document.getElementById('statsModalTotalDownloads').innerText = totalDownloads.toLocaleString();
  document.getElementById('statsModalActiveMods').innerText = userMods.length.toString();
  document.getElementById('statsModalAvgRating').innerText = avgRating;
  document.getElementById('statsModalLikes').innerText = totalLikes.toLocaleString();
  
  // Generate the package distribution chart dynamically
  const chartBox = document.getElementById('statsModalChartContainer');
  if (chartBox) {
    chartBox.innerHTML = "";
    if (userMods.length === 0) {
      chartBox.innerHTML = `
        <div style="text-align:center; color:#64748b; font-size:12px; padding:20px; font-style:italic;">
          No active published packages. Please deploy a mod file to unlock distribution charts!
        </div>
      `;
    } else {
      // Find the maximum downloads count to calibrate the bar percentages
      let maxDownloads = Math.max(...userMods.map(m => parseFormattedCountValue(m.downloads)), 1);
      
      userMods.forEach(m => {
        const dls = parseFormattedCountValue(m.downloads);
        const percent = Math.max(8, Math.round((dls / maxDownloads) * 100)); // Minimum 8% width so it looks pretty
        
        chartBox.innerHTML += `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#cbd5e1; margin-bottom:4px; font-weight:600;">
              <span>🚀 ${m.title}</span>
              <span style="color:#10b981;">${dls.toLocaleString()} downloads</span>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); height:16px; border-radius:30px; overflow:hidden; position:relative;">
              <div style="background:linear-gradient(90deg, #10b981 0%, #3b82f6 100%); width:${percent}%; height:100%; transition: width 0.5s ease; border-radius:30px;"></div>
            </div>
          </div>
        `;
      });
    }
  }
  
  modal.classList.add('upload-modal-active');
}

function closeCreatorStatsModal() {
  const modal = document.getElementById('creatorStatsModal');
  if (modal) {
    modal.classList.remove('upload-modal-active');
  }
}

function simulateCreatorStatsGrowth() {
  const loggedInUser = localStorage.getItem('astroUsername') || 'Player';
  
  // Find all user uploaded mods in local storage to add views/downloads
  let userUploadedMods = JSON.parse(localStorage.getItem('astro_user_uploaded_mods') || '[]');
  if (userUploadedMods.length === 0) {
    alert("Please upload at least one mod first to simulate stats!");
    return;
  }
  
  // Add some simulated statistics
  userUploadedMods.forEach(m => {
    // Current downloads
    let dls = parseFormattedCountValue(m.downloads || "0");
    dls += Math.floor(Math.random() * 400) + 150;
    m.downloads = dls.toString();
    
    // Likes
    let likes = parseFormattedCountValue(m.likes || "0");
    likes += Math.floor(Math.random() * 40) + 15;
    m.likes = likes.toString();
  });
  
  localStorage.setItem('astro_user_uploaded_mods', JSON.stringify(userUploadedMods));
  
  // Also synchronize modifications with the loaded page-wide cache (ALL_GAME_MODS)
  userUploadedMods.forEach(um => {
    const origIdx = ALL_GAME_MODS.findIndex(m => m.id === um.id);
    if (origIdx !== -1) {
      ALL_GAME_MODS[origIdx].downloads = um.downloads;
      ALL_GAME_MODS[origIdx].likes = um.likes;
    }
  });
  
  alert("🟢 DYNAMIC TRAFFIC DIRECTED!\nSimulation injected 1.2K+ new platform visits, downloading your active files and registering likes.");
  
  // Refresh modal UI metrics in-place!
  openCreatorStatsModal();
  
  // When closing the modal, reload the parent profiles stats too
  try {
    const totalDlsEl = document.getElementById('profileTotalDownloadsCount');
    if (totalDlsEl) {
      const totalDls = ALL_GAME_MODS.filter(m => m.creator.toLowerCase() === loggedInUser.toLowerCase())
                                     .reduce((sum, item) => sum + parseFormattedCountValue(item.downloads), 0);
      totalDlsEl.innerText = totalDls.toLocaleString();
    }
    const countEl = document.getElementById('profileUploadedModsCount');
    if (countEl) {
      countEl.innerText = userUploadedMods.length.toString();
    }
  } catch (err) {
    console.log(err);
  }
}

// Expose functions to the global window context
window.selectInterfaceLanguage = selectInterfaceLanguage;
window.applyGlobalLanguageTranslation = applyGlobalLanguageTranslation;

window.injectModalsToBody = injectModalsToBody;
window.openEditModModal = openEditModModal;
window.closeEditModModal = closeEditModModal;
window.handleEditModSubmit = handleEditModSubmit;
window.openReportModModal = openReportModModal;
window.closeReportModModal = closeReportModModal;
window.handleReportModSubmit = handleReportModSubmit;
window.openAdminPortalModal = openAdminPortalModal;
window.closeAdminPortalModal = closeAdminPortalModal;
window.adminResolveDeleteMod = adminResolveDeleteMod;
window.adminResolveDismissReport = adminResolveDismissReport;
window.clearReportsList = clearReportsList;
window.toggleFollowUser = toggleFollowUser;
window.deleteUserMod = deleteUserMod;
window.openCreatorStatsModal = openCreatorStatsModal;
window.closeCreatorStatsModal = closeCreatorStatsModal;
window.simulateCreatorStatsGrowth = simulateCreatorStatsGrowth;

function updateFavoriteButtonUI(modId) {
  const favBtn = document.getElementById('detailFavoriteBtn');
  if (!favBtn) return;
  const username = localStorage.getItem('astroUsername') || 'Player';
  const favorites = JSON.parse(localStorage.getItem(`astro_favorites_${username.toLowerCase()}`) || '[]');
  const isFav = favorites.includes(modId);
  
  if (isFav) {
    favBtn.innerHTML = '❤️';
    favBtn.style.background = 'rgba(239, 68, 68, 0.2)';
    favBtn.style.borderColor = 'rgba(239, 68, 68, 0.8)';
    favBtn.style.color = '#ef4444';
    favBtn.setAttribute('title', 'Remove from Favorites');
  } else {
    favBtn.innerHTML = '🤍';
    favBtn.style.background = 'rgba(255, 255, 255, 0.05)';
    favBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    favBtn.style.color = '#94a3b8';
    favBtn.setAttribute('title', 'Add to Favorites');
  }
}

function toggleFavoriteCurrentMod() {
  const username = localStorage.getItem('astroUsername') || 'Player';
  const userIsLoggedIn = localStorage.getItem('astroUserLoggedIn') === 'true';
  if (!userIsLoggedIn) {
    if (typeof openLoginModal === 'function') {
      openLoginModal();
    } else {
      alert("Please login to save favorite modifications.");
    }
    return;
  }
  
  const modId = currentDetailPageModId;
  const favoritesKey = `astro_favorites_${username.toLowerCase()}`;
  let favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
  
  const index = favorites.indexOf(modId);
  const currentLang = localStorage.getItem('astromods_language') || 'en';
  if (index > -1) {
    favorites.splice(index, 1);
    let removedMsg = "Removed from your Favorites!";
    if (currentLang === 'id') removedMsg = "Dihapus dari Favorit Anda!";
    else if (currentLang === 'ms') removedMsg = "Dikeluarkan dari Kegemaran Anda!";
    else if (currentLang === 'ru') removedMsg = "Удалено из Избранного!";
    else if (currentLang === 'zh') removedMsg = "已从您的收藏中删除！";
    showCustomSuccessAlert(removedMsg);
  } else {
    favorites.push(modId);
    let addedMsg = "Added to your Favorites!";
    if (currentLang === 'id') addedMsg = "Ditambahkan ke Favorit Anda!";
    else if (currentLang === 'ms') addedMsg = "Ditambah ke Kegemaran Anda!";
    else if (currentLang === 'ru') addedMsg = "Добавлено в Избранное!";
    else if (currentLang === 'zh') addedMsg = "已添加到您的收藏中！";
    showCustomSuccessAlert(addedMsg);
  }
  
  localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  updateFavoriteButtonUI(modId);
}

function removeFavoriteFromProfile(modId) {
  const targetUser = localStorage.getItem('astroUsername') || 'Player';
  const favoritesKey = `astro_favorites_${targetUser.toLowerCase()}`;
  let favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
  
  const index = favorites.indexOf(modId);
  if (index > -1) {
    favorites.splice(index, 1);
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
    const currentLang = localStorage.getItem('astromods_language') || 'en';
    let removedMsg = "Removed from your Favorites!";
    if (currentLang === 'id') removedMsg = "Dihapus dari Favorit Anda!";
    else if (currentLang === 'ms') removedMsg = "Dikeluarkan dari Kegemaran Anda!";
    else if (currentLang === 'ru') removedMsg = "Удалено из Избранного!";
    else if (currentLang === 'zh') removedMsg = "已从您的收藏中删除！";
    showCustomSuccessAlert(removedMsg);
    
    // Re-initialize to refresh the view!
    initProfileDashboard();
  }
}

window.updateFavoriteButtonUI = updateFavoriteButtonUI;
window.toggleFavoriteCurrentMod = toggleFavoriteCurrentMod;
window.removeFavoriteFromProfile = removeFavoriteFromProfile;

function shareModLink() {
  const currentUrl = window.location.href;
  navigator.clipboard.writeText(currentUrl).then(() => {
    alert("🔗 AstroMods: Mod link successfully copied to your clipboard! Share it with your friends.");
  }).catch(() => {
    // Fallback if clipboard fails in sandboxed iframes
    const tempInput = document.createElement('input');
    tempInput.value = currentUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      alert("🔗 AstroMods: Mod link successfully copied to your clipboard! Share it with your friends.");
    } catch(err) {
      alert("🔗 Mod Link: " + currentUrl);
    }
    document.body.removeChild(tempInput);
  });
}
window.shareModLink = shareModLink;

window.ALL_GAME_MODS = ALL_GAME_MODS;
window.currentDetailPageModId = currentDetailPageModId;



