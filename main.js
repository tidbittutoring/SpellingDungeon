/**
 * Spelling Dungeon
 * 
 * This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/
 * 
 * Copyright (c) 2026 The Spelling Dungeon Authors
 */

// Spelling Dungeon v6.2-alpha - Main Game Logic
// ── Game States ────────────────────────────────────────────────────────────
const GameState = {
    MENU: 'menu',
    PROFILES: 'profiles',
    CREATE_CHAR: 'create_char',
    SCORES: 'scores',
    SETTINGS: 'settings',
    GRAPHICS: 'graphics',
    DRASTIC: 'drastic',
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
    PAUSE: 'pause',
    MCQ: 'mcq',
    REPORT_BUG: 'report_bug'
};

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let lastSettingsEntryState = GameState.MENU;

const CHALLENGE_TEXTS = {
    random: "CHALLENGE",
    adventure: "ADVENTURE",
    puzzle: "PUZZLE",
    bossrush: "BOSS RUSH"
};

// Hook for future achievements/unlocks
const GameUnlocks = {
    puzzleMode: false,
    bossRush: false
};

const MageConfig = {
    name: "Unknown Mage",
    spellColor: "#00d4ff",
    wordList: "inkling",
    mode: "adventure"
};

// ── Persistence ────────────────────────────────────────────────────────────
class ProfileManager {
    static getProfiles() {
        return JSON.parse(localStorage.getItem('sd_profiles') || '[]');
    }

    static saveProfiles(profiles) {
        localStorage.setItem('sd_profiles', JSON.stringify(profiles));
    }

    static getActiveProfileId() {
        return localStorage.getItem('sd_active_profile');
    }

    static setActiveProfileId(id) {
        localStorage.setItem('sd_active_profile', id);
    }

    static getActiveProfile() {
        const profiles = this.getProfiles();
        const activeId = this.getActiveProfileId();
        return profiles.find(p => p.id === activeId) || null;
    }

    static saveActiveProfile(profile) {
        const profiles = this.getProfiles();
        const index = profiles.findIndex(p => p.id === profile.id);
        if (index !== -1) {
            profiles[index] = profile;
        } else {
            profiles.push(profile);
        }
        this.saveProfiles(profiles);
    }

    static createProfile(name, spellColor) {
        const id = 'profile_' + Date.now();
        const newProfile = {
            id,
            name,
            spellColor,
            wordList: MageConfig.wordList,
            maxRoom: 1,
            totalWords: 0,
            spelledWords: [],
            itemData: { storage: [], hat: null, utensils: [], maxStorageSize: 9, maxUtensilsSize: 1 },
            graduateCapStats: {}, // Permanent stats for the special item
            diaryWordCount: 0, // Persistent progress for Fancy Diary
            puzzleModeUnlocked: false, // Check for the 100 word milestone
            bossCycle: [], // Track types to prevent repeats
            savedRun: null
        };
        const profiles = this.getProfiles();
        profiles.push(newProfile);
        this.saveProfiles(profiles);
        return newProfile;
    }

    static deleteProfile(id) {
        let profiles = this.getProfiles();
        profiles = profiles.filter(p => p.id !== id);
        this.saveProfiles(profiles);
        if (this.getActiveProfileId() === id) {
            this.setActiveProfileId(profiles.length > 0 ? profiles[0].id : null);
        }
    }
}

class Persistence {
    static getHighScores() {
        return JSON.parse(localStorage.getItem('sd_highscores') || '[]');
    }
    static saveScore(name, rooms, words, wordList, mode) {
        const scores = this.getHighScores();
        scores.push({
            name,
            rooms,
            words,
            wordList,
            mode,
            date: new Date().toLocaleDateString()
        });
        // Sort by rooms (primary) then words (secondary)
        scores.sort((a, b) => b.rooms - a.rooms || b.words - a.words);
        localStorage.setItem('sd_highscores', JSON.stringify(scores.slice(0, 10)));
    }

    // Global Settings
    static saveSettings(settings) {
        localStorage.setItem('sd_global_settings', JSON.stringify(settings));
    }

    static loadSettings() {
        const saved = JSON.parse(localStorage.getItem('sd_global_settings') || '{}');
        return {
            candlesEnabled: saved.candlesEnabled ?? true,
            errorsEnabled: saved.errorsEnabled ?? true,
            volume: saved.volume ?? 80,
            wordList: saved.wordList ?? MageConfig.wordList,
            mode: saved.mode ?? MageConfig.mode,
            preferredVoice: saved.preferredVoice ?? null,
            performanceMode: saved.performanceMode ?? true,
            headBobEnabled: saved.headBobEnabled ?? true,
            autoUpgradeEnabled: saved.autoUpgradeEnabled ?? true,
            autoForgeEnabled: saved.autoForgeEnabled ?? true,
            tutorialEnabled: saved.tutorialEnabled ?? true,
            skeletonsEnabled: saved.skeletonsEnabled ?? true
        };
    }

    // Active Run (survives page close via beforeunload)
    static saveRun(snapshot) {
        localStorage.setItem('sd_active_run', JSON.stringify(snapshot));
    }
    static loadRun() {
        try { return JSON.parse(localStorage.getItem('sd_active_run') || 'null'); }
        catch (e) { return null; }
    }
    static clearRun() {
        localStorage.removeItem('sd_active_run');
    }

    // Migrate old config format to new profile system if needed
    static attemptMigration() {
        const oldConfigStr = localStorage.getItem('sd_config');
        if (oldConfigStr) {
            try {
                const oldConfig = JSON.parse(oldConfigStr);
                const profiles = ProfileManager.getProfiles();

                // If there are no profiles, create one from the old config
                if (profiles.length === 0) {
                    const migratedProfile = ProfileManager.createProfile(oldConfig.name || "Default Mage", oldConfig.spellColor || "#00d4ff");
                    ProfileManager.setActiveProfileId(migratedProfile.id);
                    console.log("Migrated old config to new profile:", migratedProfile);
                }

                // Migrate global settings as well
                const settings = this.loadSettings();
                settings.candlesEnabled = oldConfig.candlesEnabled ?? settings.candlesEnabled;
                settings.wordList = oldConfig.wordList ?? settings.wordList;
                settings.mode = oldConfig.mode ?? settings.mode;
                this.saveSettings(settings);

                // Clean up old config
                localStorage.removeItem('sd_config');
            } catch (e) {
                console.error("Migration failed:", e);
            }
        }
    }
}

let GlobalSettings = Persistence.loadSettings();

const WALL_CARVINGS = [
    "watch out for the silent letters...",
    "Tell my family.... I should have studied more",
    "what's in the next room?",
    "eighth.... eighth.... ghth...",
    "I DON'T KNOW THESE WORDS!",
    "how do you get out of here",
    "what is this place",
    "it's not a real word... It's not real... It's a hallucination!",
    "I've been down here... so long.",
    "If anyone sees this message, turn back now.",
    "my pen is almost out of ink",
    "this piece of chalk is down to a nub",
    "these aren't words people use!",
    "Big_Speller_75 wuz hear",
    "Greatingz frum SpellMystro",
    "VoCab4QT 2026",
    "1864 expeddishion",
    "my teacher sent me down here",
    "please... help",
    "one more silent letter and I'm done for",
    "We lost three people down here during the expedition of 1792",
    "leave no trace",
    "I can't remember which of these doors leads out",
    "$P3LL3R_XTREME iz duh besst!",
    "Watch out for snakes!",
    "this is a fire hazard",
    "when does it end",
    "are we there yet?",
    "why.. just why?",
    "this is an outrage!",
    "wut is up wit the creepy gnome",
    "elf guy haz sen sum stuff",
    "has anyone seen my diary?",
    "it gets eezeer evry time i grajuate",
    "need... more... ink...",
    "BRO, the silent boss is op, bro",
    "look and click. trust.",
    "c u goons @ gradguasion!!",
];

const TUTORIAL_TIPS = {
    1: "Press ESC to open your inventory.",
    2: "Use your ink to cast spells.",
    3: "Spells are located at the bottom of the screen.",
    4: "Compare and equip items on the inventory screen. (ESC)",
    6: "Don't let your eraser run out.",
    7: "Missed letters do damage which increases every 2 levels.",
    10: "Every 10th room is a timed challenge!"
};

// ── UI Elements ────────────────────────────────────────────────────────────
const SCREENS = {
    [GameState.MENU]: document.querySelector('#main-menu'),
    [GameState.PROFILES]: document.querySelector('#profiles-menu'),
    [GameState.CREATE_CHAR]: document.querySelector('#create-char-menu'),
    [GameState.SCORES]: document.querySelector('#scores-menu'),
    [GameState.SETTINGS]: document.querySelector('#settings-menu'),
    [GameState.GRAPHICS]: document.querySelector('#graphics-menu'),
    [GameState.DRASTIC]: document.querySelector('#drastic-measures-menu'),
    [GameState.PLAYING]: document.querySelector('#game-ui'),
    [GameState.GAME_OVER]: document.querySelector('#game-over-screen'),
    [GameState.PAUSE]: document.querySelector('#pause-menu'),
    [GameState.MCQ]: document.querySelector('#game-ui'), // Map MCQ to the main game-ui as well
    [GameState.REPORT_BUG]: document.querySelector('#bug-report-modal'),
};

// ── Transition Helper ──────────────────────────────────────────────────────
function runFadeTransition(durationMs, callback) {
    const overlay = document.getElementById('transition-overlay');
    if (!overlay) { if (callback) callback(); return; }

    overlay.classList.add('active');
    setTimeout(() => {
        if (callback) callback();
        // Slightly delayed fade-out to ensure state change is rendered
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 350);
    }, durationMs);
}

// ── Item Snapshot System ──────────────────────────────────────────────────
const ThumbnailManager = {
    renderer: null,
    scene: null,
    camera: null,
    cache: new Map(),

    init() {
        // Create a headless renderer for thumbnails
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(128, 128);
        this.scene = new THREE.Scene();

        // Isometric-style camera for thumbnails
        this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
        this.camera.position.set(1.5, 1.2, 1.5);
        this.camera.lookAt(0, 0, 0);

        this.scene.add(new THREE.AmbientLight(0xffffff, 2.5));
        const sun = new THREE.DirectionalLight(0xffffff, 1.5);
        sun.position.set(5, 5, 5);
        this.scene.add(sun);
    },

    getThumbnail(itemName) {
        if (!itemName) return '';
        if (this.cache.has(itemName)) return this.cache.get(itemName);

        if (!this.renderer) this.init();

        // Generate model
        const model = createItemModel(itemName);

        // Center and scale to fit unit sphere
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) model.scale.setScalar(1.0 / maxDim); // Fit roughly to window

        // Give it a default pleasant rotation
        model.rotation.y = Math.PI / 4;
        model.rotation.x = 0.2;

        this.scene.add(model);
        this.renderer.render(this.scene, this.camera);

        const dataUrl = this.renderer.domElement.toDataURL('image/png');

        this.scene.remove(model);
        // Clean up geometries/materials if necessary, but here we expect models 
        // to be small and ITEM_MODEL_MAP to handle instantiation.

        this.cache.set(itemName, dataUrl);
        return dataUrl;
    }
};

const WORD_INPUT = document.querySelector('#word-input');
const HEAR_BTN = document.querySelector('#hear-btn');
const SKIP_CHEST_BTN = document.querySelector('#skip-chest-btn');
const LEAVE_SHOP_BTN = document.querySelector('#leave-shop-btn');
const HUD_LEAVE_SHOP_BTN = document.querySelector('#hud-leave-shop-btn');
const MODE_BTNS = document.querySelectorAll('.mode-btn');
const nameInput = document.querySelector('#player-name-input');
let activeRats = [];
let finalBossRewardPending = false;

const items = new ItemManager();
const baseMaxHealth = 20;
const baseMaxInk = 20;

// ── Three.js Initialization ────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040608); // Cooler darkness
scene.fog = new THREE.FogExp2(0x040608, 0.08); // Use FogExp2 for better atmosphere

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#game-canvas'),
    antialias: !GlobalSettings.performanceMode
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(GlobalSettings.performanceMode ? 1 : Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased to 0.6 for better overall visibility
scene.add(ambientLight);

const mainLight = new THREE.PointLight(0xff7733, 18, 44); // Slightly cooler/softer torchlight, 10% radius increase
mainLight.position.set(0, 5, 5);
mainLight.castShadow = true; // Enable shadow potential
scene.add(mainLight);

const fillLight = new THREE.PointLight(0x556688, 6, 33); // Cool grey-blue fill light, 10% radius increase
fillLight.position.set(0, 5.5, -5); // Moved down to be below the new roof
scene.add(fillLight);

const hemLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5); // Soft "sky" and "ground" light
scene.add(hemLight);

const dungeonGroup = new THREE.Group();
scene.add(dungeonGroup);

// ── Visual Enhancements: Texture Generation ─────────────────────────────────
function generateBrickTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base color - Cool Dark Grey
    ctx.fillStyle = '#2c2e30';
    ctx.fillRect(0, 0, 512, 512);

    // Stone Grit & Noise
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const shade = Math.random() * 40;
        ctx.fillStyle = `rgba(${shade + 40}, ${shade + 42}, ${shade + 45}, 0.3)`;
        ctx.fillRect(x, y, 2 + Math.random() * 2, 2 + Math.random() * 2);
    }

    // Cracks and Pits (Instead of tiny brick grid)
    ctx.strokeStyle = '#1a1a1c';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        const startX = Math.random() * 512;
        const startY = Math.random() * 512;
        ctx.moveTo(startX, startY);
        for (let j = 0; j < 5; j++) {
            ctx.lineTo(startX + (Math.random() - 0.5) * 50, startY + (Math.random() - 0.5) * 50);
        }
        ctx.stroke();
    }

    const diffuse = new THREE.CanvasTexture(canvas);
    diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;

    // Displacement/Bump map (Greyscale)
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const bctx = bumpCanvas.getContext('2d');
    bctx.fillStyle = '#888888';
    bctx.fillRect(0, 0, 512, 512);

    // Deep pits for bump map
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const shade = Math.random() * 100;
        bctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        bctx.fillRect(x, y, 3, 3);
    }

    // Bump Map Cracks
    bctx.strokeStyle = '#222222';
    bctx.lineWidth = 3;
    for (let i = 0; i < 50; i++) {
        bctx.beginPath();
        const startX = Math.random() * 512;
        const startY = Math.random() * 512;
        bctx.moveTo(startX, startY);
        for (let j = 0; j < 5; j++) {
            bctx.lineTo(startX + (Math.random() - 0.5) * 50, startY + (Math.random() - 0.5) * 50);
        }
        bctx.stroke();
    }

    const bump = new THREE.CanvasTexture(bumpCanvas);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

    return { diffuse, bump };
}

function generateWordBrickTextures() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base color - Slightly Darker Grey
    ctx.fillStyle = '#404244';
    ctx.fillRect(0, 0, 512, 512);

    // Stone Grit & Noise (increased count for rougher look)
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const shade = Math.random() * 50;
        ctx.fillStyle = `rgba(${shade + 80}, ${shade + 82}, ${shade + 85}, 0.4)`;
        ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    // More Cracks and Pits
    ctx.strokeStyle = '#2a2a2c';
    ctx.lineWidth = 2;
    for (let i = 0; i < 80; i++) {
        ctx.beginPath();
        const startX = Math.random() * 512;
        const startY = Math.random() * 512;
        ctx.moveTo(startX, startY);
        for (let j = 0; j < 6; j++) {
            ctx.lineTo(startX + (Math.random() - 0.5) * 60, startY + (Math.random() - 0.5) * 60);
        }
        ctx.stroke();
    }

    const diffuse = new THREE.CanvasTexture(canvas);
    diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;

    // Displacement/Bump map (Greyscale)
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const bctx = bumpCanvas.getContext('2d');
    bctx.fillStyle = '#999999';
    bctx.fillRect(0, 0, 512, 512);

    // Deep pits for bump map
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const shade = Math.random() * 120;
        bctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        bctx.fillRect(x, y, 3, 3);
    }

    // Bump Map Cracks
    bctx.strokeStyle = '#111111';
    bctx.lineWidth = 4;
    for (let i = 0; i < 80; i++) {
        bctx.beginPath();
        const startX = Math.random() * 512;
        const startY = Math.random() * 512;
        bctx.moveTo(startX, startY);
        for (let j = 0; j < 6; j++) {
            bctx.lineTo(startX + (Math.random() - 0.5) * 60, startY + (Math.random() - 0.5) * 60);
        }
        bctx.stroke();
    }

    const bump = new THREE.CanvasTexture(bumpCanvas);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;

    return { diffuse, bump };
}

function generateDoorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base color
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, 512, 1024);

    // Stone Grit
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 1024;
        const gray = 20 + Math.random() * 30;
        ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
        ctx.fillRect(x, y, 2, 2);
    }

    // Large Stone Blocks
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 12;
    for (let y = 0; y < 1024; y += 256) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(256, y);
        ctx.lineTo(256, y + 256);
        ctx.stroke();
    }

    const diffuse = new THREE.CanvasTexture(canvas);

    // Bump map for door
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 1024;
    const bctx = bumpCanvas.getContext('2d');
    bctx.fillStyle = '#888888';
    bctx.fillRect(0, 0, 512, 1024);

    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 1024;
        const shade = Math.random() * 80;
        bctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        bctx.fillRect(x, y, 4, 4);
    }

    const bump = new THREE.CanvasTexture(bumpCanvas);
    return { diffuse, bump };
}

function generateWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base brown
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(0, 0, 512, 512);

    // Grain
    ctx.strokeStyle = '#3d2b1f';
    ctx.lineWidth = 2;
    for (let i = 0; i < 100; i++) {
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < 512; x += 20) {
            ctx.lineTo(x, y + Math.sin(x * 0.05) * 10 + (Math.random() - 0.5) * 5);
        }
        ctx.stroke();
    }

    // Knots
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, 10 + Math.random() * 10, 0, Math.PI * 2);
        ctx.stroke();
    }

    const diffuse = new THREE.CanvasTexture(canvas);
    diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;

    return diffuse;
}

// ── Parameterized Skin Texture Generator ────────────────────────────────────
function generateSkinStoneTexture(cfg) {
    const w = cfg.w || 512, h = cfg.h || 512;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = cfg.base;
    ctx.fillRect(0, 0, w, h);

    // Grit & noise
    const gc = cfg.gritCount || 30000, gs = cfg.gritSize || 2;
    for (let i = 0; i < gc; i++) {
        const x = Math.random() * w, y = Math.random() * h;
        const s = Math.random() * (cfg.gritRange || 40);
        ctx.fillStyle = `rgba(${s + cfg.grit[0]},${s + cfg.grit[1]},${s + cfg.grit[2]},${cfg.gritAlpha || 0.3})`;
        ctx.fillRect(x, y, gs + Math.random() * gs, gs + Math.random() * gs);
    }

    // Moss / stain patches
    if (cfg.patches) {
        cfg.patches.forEach(p => {
            ctx.globalAlpha = p.alpha || 0.15;
            ctx.fillStyle = p.color;
            for (let i = 0; i < (p.count || 20); i++) {
                const px = Math.random() * w, py = Math.random() * h;
                ctx.beginPath();
                ctx.arc(px, py, p.minR + Math.random() * (p.maxR - p.minR), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        });
    }

    // Cracks
    const cc = cfg.crackCount || 50, csp = cfg.crackSpread || 50, csg = cfg.crackSegs || 5;
    ctx.strokeStyle = cfg.crackColor || '#1a1a1c';
    ctx.lineWidth = cfg.crackWidth || 1.5;
    for (let i = 0; i < cc; i++) {
        ctx.beginPath();
        const sx = Math.random() * w, sy = Math.random() * h;
        ctx.moveTo(sx, sy);
        for (let j = 0; j < csg; j++)
            ctx.lineTo(sx + (Math.random() - 0.5) * csp, sy + (Math.random() - 0.5) * csp);
        ctx.stroke();
    }

    // Veins (ice fractures, lava lines, crystal seams)
    if (cfg.veins) {
        ctx.strokeStyle = cfg.veins.color;
        ctx.lineWidth = cfg.veins.width || 2;
        ctx.globalAlpha = cfg.veins.alpha || 0.3;
        for (let i = 0; i < (cfg.veins.count || 12); i++) {
            ctx.beginPath();
            let vx = Math.random() * w, vy = Math.random() * h;
            ctx.moveTo(vx, vy);
            for (let j = 0; j < (cfg.veins.segs || 8); j++) {
                vx += (Math.random() - 0.5) * (cfg.veins.spread || 80);
                vy += (Math.random() - 0.5) * (cfg.veins.spread || 80);
                ctx.lineTo(vx, vy);
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
    }

    const diffuse = new THREE.CanvasTexture(canvas);
    diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;

    // Bump map
    const bc = document.createElement('canvas');
    bc.width = w; bc.height = h;
    const bctx = bc.getContext('2d');
    bctx.fillStyle = cfg.bumpBase || '#888888';
    bctx.fillRect(0, 0, w, h);
    for (let i = 0; i < gc; i++) {
        const bx = Math.random() * w, by = Math.random() * h;
        const bs = Math.random() * (cfg.bumpRange || 100);
        bctx.fillStyle = `rgb(${bs},${bs},${bs})`;
        bctx.fillRect(bx, by, 3, 3);
    }
    bctx.strokeStyle = cfg.bumpCrack || '#222222';
    bctx.lineWidth = cfg.bumpCrackW || 3;
    for (let i = 0; i < cc; i++) {
        bctx.beginPath();
        const sx = Math.random() * w, sy = Math.random() * h;
        bctx.moveTo(sx, sy);
        for (let j = 0; j < csg; j++)
            bctx.lineTo(sx + (Math.random() - 0.5) * csp, sy + (Math.random() - 0.5) * csp);
        bctx.stroke();
    }
    const bump = new THREE.CanvasTexture(bc);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    return { diffuse, bump };
}

function generateFloorTexture(cfg) {
    const w = 1024, h = 1024; // High res for floor slabs
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Base surface
    ctx.fillStyle = cfg.base;
    ctx.fillRect(0, 0, w, h);

    // 2x2 Large Stone Slabs
    const gutter = 12;
    const slabW = w / 2;
    const slabH = h / 2;

    for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
            const x = c * slabW;
            const y = r * slabH;

            // Subtle color variation per slab
            const varVal = (Math.random() - 0.5) * 10;
            ctx.fillStyle = cfg.base;
            ctx.fillRect(x + gutter, y + gutter, slabW - gutter * 2, slabH - gutter * 2);

            // Grit & Texture within slab
            ctx.globalAlpha = cfg.gritAlpha || 0.3;
            for (let i = 0; i < 4000; i++) {
                const px = x + gutter + Math.random() * (slabW - gutter * 2);
                const py = y + gutter + Math.random() * (slabH - gutter * 2);
                const s = Math.random() * (cfg.gritRange || 40);
                ctx.fillStyle = `rgb(${s + cfg.grit[0]},${s + cfg.grit[1]},${s + cfg.grit[2]})`;
                ctx.fillRect(px, py, 1 + Math.random() * 2, 1 + Math.random() * 2);
            }

            // "Wear" patch in center of slab
            const grad = ctx.createRadialGradient(x + slabW / 2, y + slabH / 2, 20, x + slabW / 2, y + slabH / 2, slabW / 2);
            grad.addColorStop(0, 'rgba(255,255,255,0.05)'); // Highlight center
            grad.addColorStop(1, 'rgba(0,0,0,0.1)'); // Darken edges
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.4;
            ctx.fillRect(x + gutter, y + gutter, slabW - gutter * 2, slabH - gutter * 2);
            ctx.globalAlpha = 1.0;
        }
    }

    // Large Grout Lines
    ctx.strokeStyle = cfg.crackColor || '#1a1a1c';
    ctx.lineWidth = gutter;
    ctx.strokeRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    const diffuse = new THREE.CanvasTexture(canvas);
    diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;

    // Bump Map
    const bc = document.createElement('canvas');
    bc.width = w; bc.height = h;
    const bctx = bc.getContext('2d');
    bctx.fillStyle = '#777777';
    bctx.fillRect(0, 0, w, h);

    // Dark grooves for grout
    bctx.fillStyle = '#222222';
    bctx.fillRect(w / 2 - gutter / 2, 0, gutter, h);
    bctx.fillRect(0, h / 2 - gutter / 2, w, gutter);

    // Surface noise for bump
    for (let i = 0; i < 4000; i++) {
        const bx = Math.random() * w, by = Math.random() * h;
        const bs = Math.random() * 60;
        bctx.fillStyle = `rgb(${bs},${bs},${bs})`;
        bctx.fillRect(bx, by, 3, 3);
    }

    const bump = new THREE.CanvasTexture(bc);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    return { diffuse, bump };
}

// ── Room Skin Definitions ───────────────────────────────────────────────────
const ROOM_SKINS = [
    { // Classic Dungeon — dark slate stone, moderate cracks
        name: 'Classic Dungeon',
        brick: { base: '#252628', grit: [32, 34, 36], crackColor: '#151517', crackWidth: 1.5, crackCount: 50, crackSegs: 5, crackSpread: 50, bumpCrack: '#1c1c1e', bumpCrackW: 3 },
        wordBrick: { base: '#353638', grit: [60, 62, 65], gritAlpha: 0.4, gritCount: 40000, crackColor: '#222224', crackWidth: 2, crackCount: 80, crackSegs: 6, crackSpread: 60, bumpCrack: '#111111', bumpCrackW: 4 },
        door: { base: '#2a2a2c', grit: [18, 18, 18], gritRange: 25, crackColor: '#101012', crackWidth: 3, crackCount: 8, crackSegs: 2, crackSpread: 200, bumpCrack: '#282828', bumpCrackW: 6 },
        mat: { brickColor: 0x6b7a88, wordColor: 0x8a9098, doorColor: 0x6a6a6e, brickRough: 0.95, brickMetal: 0.05, bumpScale: 0.1 },
        atmos: { fog: 0x080a0e, mainLight: 0xcc8844, mainInt: 22, fillLight: 0x3a4455, fillInt: 8, flame: 0xdd9944, candleLight: 0xcc8833 },
    },
    { // Catacombs — deep ochre bone, many small pits, dusty
        name: 'Catacombs',
        brick: { base: '#2e2820', grit: [40, 36, 28], gritAlpha: 0.35, gritCount: 35000, gritSize: 3, crackColor: '#1a1510', crackWidth: 1, crackCount: 70, crackSegs: 4, crackSpread: 35, bumpCrack: '#161008', bumpCrackW: 2 },
        wordBrick: { base: '#3a3428', grit: [70, 62, 50], gritAlpha: 0.45, gritCount: 45000, gritSize: 3, crackColor: '#28221a', crackWidth: 1.5, crackCount: 90, crackSegs: 5, crackSpread: 40, bumpCrack: '#140c04', bumpCrackW: 3 },
        door: { base: '#302818', grit: [25, 20, 14], gritRange: 22, crackColor: '#161008', crackWidth: 4, crackCount: 6, crackSegs: 2, crackSpread: 180, bumpCrack: '#1c1408', bumpCrackW: 5 },
        mat: { brickColor: 0x8a7558, wordColor: 0x9a8868, doorColor: 0x786548, brickRough: 0.98, brickMetal: 0.02, bumpScale: 0.15 },
        atmos: { fog: 0x0c0a08, mainLight: 0xcc8833, mainInt: 16.5, fillLight: 0x4a3d2e, fillInt: 3, flame: 0xddaa55, candleLight: 0xbb8822 },
    },
    { // Frozen Cavern — muted steel-blue, smooth with ice fractures
        name: 'Frozen Cavern',
        brick: { base: '#222830', grit: [28, 33, 42], gritAlpha: 0.2, gritCount: 20000, crackColor: '#121620', crackWidth: 2.5, crackCount: 25, crackSegs: 3, crackSpread: 80, bumpCrack: '#141a24', bumpCrackW: 4, veins: { color: '#5588aa', width: 1.5, alpha: 0.15, count: 18, segs: 10, spread: 60 } },
        wordBrick: { base: '#2e3440', grit: [50, 58, 72], gritAlpha: 0.25, gritCount: 25000, crackColor: '#1a2028', crackWidth: 3, crackCount: 30, crackSegs: 3, crackSpread: 70, bumpCrack: '#0a1018', bumpCrackW: 5, veins: { color: '#6699bb', width: 1, alpha: 0.18, count: 15, segs: 8, spread: 50 } },
        door: { base: '#242c38', grit: [24, 28, 36], gritRange: 18, crackColor: '#0a0e18', crackWidth: 5, crackCount: 4, crackSegs: 2, crackSpread: 250, bumpCrack: '#0a1220', bumpCrackW: 7, veins: { color: '#447788', width: 2, alpha: 0.12, count: 8, segs: 6, spread: 100 } },
        mat: { brickColor: 0x5a6e80, wordColor: 0x6e8090, doorColor: 0x556070, brickRough: 0.7, brickMetal: 0.15, bumpScale: 0.08 },
        atmos: { fog: 0x080c10, mainLight: 0x7799aa, mainInt: 14, fillLight: 0x334466, fillInt: 7.5, flame: 0x6699aa, candleLight: 0x446688 },
    },
    { // Infernal Depths — dark burnt umber, dense cracks, ember veins
        name: 'Infernal Depths',
        brick: { base: '#281810', grit: [40, 22, 16], gritAlpha: 0.4, gritCount: 35000, gritSize: 3, crackColor: '#180c06', crackWidth: 2, crackCount: 80, crackSegs: 6, crackSpread: 45, bumpCrack: '#1a0808', bumpCrackW: 4, veins: { color: '#aa4410', width: 2, alpha: 0.25, count: 10, segs: 12, spread: 50 } },
        wordBrick: { base: '#382018', grit: [72, 40, 28], gritAlpha: 0.45, gritCount: 40000, gritSize: 3, crackColor: '#24120c', crackWidth: 2.5, crackCount: 100, crackSegs: 7, crackSpread: 50, bumpCrack: '#140606', bumpCrackW: 5, veins: { color: '#cc6622', width: 1.5, alpha: 0.2, count: 8, segs: 10, spread: 40 } },
        door: { base: '#2c140c', grit: [32, 16, 12], gritRange: 25, crackColor: '#120606', crackWidth: 4, crackCount: 10, crackSegs: 3, crackSpread: 150, bumpCrack: '#180606', bumpCrackW: 6, veins: { color: '#993300', width: 3, alpha: 0.18, count: 5, segs: 6, spread: 120 } },
        mat: { brickColor: 0x7a4a38, wordColor: 0x8a5a48, doorColor: 0x6a4030, brickRough: 0.92, brickMetal: 0.08, bumpScale: 0.12 },
        atmos: { fog: 0x080808, mainLight: 0xc4a484, mainInt: 21, fillLight: 0x222222, fillInt: 2, flame: 0xdd9944, candleLight: 0xcc8833 },
    },
    { // Overgrown Ruins — dark olive, moss patches, earthy green
        name: 'Overgrown Ruins',
        brick: { base: '#1e2618', grit: [24, 38, 26], gritAlpha: 0.35, gritCount: 30000, crackColor: '#0c1608', crackWidth: 1.5, crackCount: 45, crackSegs: 5, crackSpread: 55, bumpCrack: '#0a140a', bumpCrackW: 3, patches: [{ color: '#1e3a18', alpha: 0.18, count: 30, minR: 8, maxR: 25 }, { color: '#2a4a22', alpha: 0.1, count: 15, minR: 12, maxR: 35 }] },
        wordBrick: { base: '#283224', grit: [42, 62, 44], gritAlpha: 0.4, gritCount: 35000, crackColor: '#142014', crackWidth: 2, crackCount: 55, crackSegs: 6, crackSpread: 50, bumpCrack: '#081408', bumpCrackW: 4, patches: [{ color: '#264826', alpha: 0.15, count: 20, minR: 6, maxR: 20 }] },
        door: { base: '#222c1e', grit: [20, 32, 22], gritRange: 22, crackColor: '#0a140a', crackWidth: 3, crackCount: 6, crackSegs: 2, crackSpread: 200, bumpCrack: '#0a140a', bumpCrackW: 5, patches: [{ color: '#1e3a18', alpha: 0.2, count: 12, minR: 10, maxR: 30 }] },
        mat: { brickColor: 0x586850, wordColor: 0x687860, doorColor: 0x4e5c48, brickRough: 0.97, brickMetal: 0.03, bumpScale: 0.12 },
        atmos: { fog: 0x081008, mainLight: 0x88883a, mainInt: 14, fillLight: 0x334430, fillInt: 6.5, flame: 0x99aa44, candleLight: 0x667722 },
    },
    { // Shadow Vault — dusky charcoal-violet, wide cracks, faint crystal veins
        name: 'Shadow Vault',
        brick: { base: '#221e26', grit: [34, 28, 40], gritAlpha: 0.3, gritCount: 28000, crackColor: '#120e18', crackWidth: 2.5, crackCount: 35, crackSegs: 4, crackSpread: 65, bumpCrack: '#100c16', bumpCrackW: 4, veins: { color: '#664488', width: 1.5, alpha: 0.14, count: 14, segs: 6, spread: 70 } },
        wordBrick: { base: '#2e2836', grit: [58, 50, 70], gritAlpha: 0.35, gritCount: 32000, crackColor: '#1e1826', crackWidth: 3, crackCount: 40, crackSegs: 5, crackSpread: 55, bumpCrack: '#0e0818', bumpCrackW: 5, veins: { color: '#886699', width: 1, alpha: 0.14, count: 10, segs: 5, spread: 50 } },
        door: { base: '#282232', grit: [28, 22, 36], gritRange: 25, crackColor: '#0e0818', crackWidth: 4, crackCount: 5, crackSegs: 2, crackSpread: 220, bumpCrack: '#0e0818', bumpCrackW: 6, veins: { color: '#664488', width: 2.5, alpha: 0.12, count: 6, segs: 4, spread: 130 } },
        mat: { brickColor: 0x5e5468, wordColor: 0x6e6478, doorColor: 0x504858, brickRough: 0.88, brickMetal: 0.12, bumpScale: 0.1 },
        atmos: { fog: 0x0c0812, mainLight: 0x886688, mainInt: 15.5, fillLight: 0x3a2e44, fillInt: 6.5, flame: 0x9977aa, candleLight: 0x665577 },
    },
];

function buildSkinMaterials(skin) {
    const bTex = generateSkinStoneTexture(skin.brick);
    const wTex = generateSkinStoneTexture(skin.wordBrick);
    const dTex = generateSkinStoneTexture(Object.assign({}, skin.door, { w: 512, h: 1024 }));
    const fTex = generateFloorTexture(skin.brick); // Use brick config for floor as base

    return {
        name: skin.name,
        brickMat: new THREE.MeshStandardMaterial({ map: bTex.diffuse, bumpMap: bTex.bump, bumpScale: skin.mat.bumpScale, roughness: skin.mat.brickRough, metalness: skin.mat.brickMetal, color: skin.mat.brickColor }),
        wordBrickMat: new THREE.MeshStandardMaterial({ map: wTex.diffuse, bumpMap: wTex.bump, bumpScale: skin.mat.bumpScale * 2.5, roughness: 1.0, metalness: 0.0, color: skin.mat.wordColor }),
        doorMat: new THREE.MeshStandardMaterial({ map: dTex.diffuse, bumpMap: dTex.bump, bumpScale: 0.15, roughness: 0.8, metalness: 0.2, color: skin.mat.doorColor }),
        floorMat: GlobalSettings.classicFloor ?
            new THREE.MeshStandardMaterial({ map: bTex.diffuse, bumpMap: bTex.bump, bumpScale: skin.mat.bumpScale, roughness: skin.mat.brickRough, metalness: skin.mat.brickMetal, color: skin.mat.brickColor }) :
            new THREE.MeshStandardMaterial({ map: fTex.diffuse, bumpMap: fTex.bump, bumpScale: skin.mat.bumpScale * 1.5, roughness: skin.mat.brickRough * 0.9, metalness: skin.mat.brickMetal, color: skin.mat.brickColor }),
        atmos: skin.atmos,
    };
}

const skinMaterialSets = ROOM_SKINS.map(buildSkinMaterials);
let currentSkin = skinMaterialSets[0];

// Backward-compat aliases for non-skin code (chestRoom MCQ etc)
let brickMat = currentSkin.brickMat;
let wordBrickMat = currentSkin.wordBrickMat;
let vowelHighlightMat = new THREE.MeshStandardMaterial(); // Generic, will be copied from skin
let consonantHighlightMat = new THREE.MeshStandardMaterial();
let doorMat = currentSkin.doorMat;
let floorMat = currentSkin.floorMat;
let brickMaterialPool = [];
const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
const coinMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 1.0,
    roughness: 0.02,
    emissive: 0xffaa00,
    emissiveIntensity: 0.5,
    name: 'gold'
});

function updateBrickMaterialPool() {
    // Shared brick materials with slight shade variations to avoid draw call explosion 
    // while still giving color variety.
    brickMaterialPool = [];
    const baseColor = brickMat.color;
    for (let i = 0; i < 8; i++) {
        const m = brickMat.clone();
        const shade = 0.75 + (i / 7) * 0.4; // 0.75 to 1.15 range
        m.color.setRGB(baseColor.r * shade, baseColor.g * shade, baseColor.b * shade);
        brickMaterialPool.push(m);
    }
}
updateBrickMaterialPool();

function applyRoomSkin(roomNum = currentRoom) {
    if (challenger && (challenger.currentMode === ChallengeMode.ADVENTURE ||
        challenger.currentMode === ChallengeMode.PUZZLE ||
        challenger.currentMode === ChallengeMode.BOSSRUSH)) {
        const currentLevel = Math.max(1, Math.ceil(roomNum / 10));
        let skinIndex = 0;
        if (currentLevel >= 5) {
            skinIndex = 3; // Infernal (Lava)
        } else if (currentLevel >= 3) {
            skinIndex = 1; // Catacombs (Sandstone)
        } else {
            skinIndex = 0; // Classic
        }
        currentSkin = skinMaterialSets[skinIndex];
    } else {
        currentSkin = skinMaterialSets[Math.floor(Math.random() * skinMaterialSets.length)];
    }
    brickMat = currentSkin.brickMat;
    wordBrickMat = currentSkin.wordBrickMat;
    doorMat = currentSkin.doorMat;
    floorMat = currentSkin.floorMat;
    updateBrickMaterialPool();

    // Update highlight materials to match the stone styles but with a soft highlight
    if (vowelHighlightMat && wordBrickMat) {
        vowelHighlightMat.copy(wordBrickMat);
        vowelHighlightMat.emissive.set(0x333300); // Soft amber glow
        vowelHighlightMat.emissiveIntensity = 0.8;
        vowelHighlightMat.color.set(0xffffdd); // Warm tint
    }
    if (consonantHighlightMat && wordBrickMat) {
        consonantHighlightMat.copy(wordBrickMat);
        consonantHighlightMat.emissive.set(0x003366); // Soft blue glow
        consonantHighlightMat.emissiveIntensity = 0.8;
        consonantHighlightMat.color.set(0xddeeff); // Cool tint
    }
}

function transitionSkinAtmosphere(duration = 1500) {
    const currentLevel = Math.floor((currentRoom - 1) / 10) + 1;
    const depthRatio = Math.min(Math.max(currentLevel - 1, 0) / 9, 1);
    const intensityMult = 1.25 - (depthRatio * 0.5); // Scaled from 1.25 (Level 1) down to 0.75 (Level 10)

    const targetFog = new THREE.Color(currentSkin.atmos.fog);
    const startFog = scene.fog.color.clone();
    const startMainColor = mainLight.color.clone();
    const targetMainColor = new THREE.Color(currentSkin.atmos.mainLight);
    const startMainInt = mainLight.intensity;
    const targetMainInt = currentSkin.atmos.mainInt * intensityMult;
    const startFillColor = fillLight.color.clone();
    const targetFillColor = new THREE.Color(currentSkin.atmos.fillLight);
    const startFillInt = fillLight.intensity;
    const targetFillInt = currentSkin.atmos.fillInt * intensityMult;
    const startAmbientInt = ambientLight.intensity;
    const targetAmbientInt = 1.3 - (depthRatio * 0.45); // 1.3 at Level 1, 0.85 at deepest

    const startTime = Date.now();

    function updateAtmos() {
        const p = Math.min((Date.now() - startTime) / duration, 1);
        const ease = p * p * (3 - 2 * p); // smoothstep
        scene.fog.color.lerpColors(startFog, targetFog, ease);
        scene.background.copy(scene.fog.color);
        mainLight.color.lerpColors(startMainColor, targetMainColor, ease);
        mainLight.intensity = startMainInt + (targetMainInt - startMainInt) * ease;
        fillLight.color.lerpColors(startFillColor, targetFillColor, ease);
        fillLight.intensity = startFillInt + (targetFillInt - startFillInt) * ease;
        ambientLight.intensity = startAmbientInt + (targetAmbientInt - startAmbientInt) * ease;
        if (p < 1) requestAnimationFrame(updateAtmos);
    }
    updateAtmos();
}

function applySkinAtmosphereImmediate() {
    const currentLevel = Math.floor((currentRoom - 1) / 10) + 1;
    const depthRatio = Math.min(Math.max(currentLevel - 1, 0) / 9, 1);
    const intensityMult = 1.25 - (depthRatio * 0.5);

    const fc = new THREE.Color(currentSkin.atmos.fog);
    scene.background = fc;
    scene.fog.color = fc;
    mainLight.color.set(currentSkin.atmos.mainLight);
    mainLight.intensity = currentSkin.atmos.mainInt * intensityMult;
    fillLight.color.set(currentSkin.atmos.fillLight);
    fillLight.intensity = currentSkin.atmos.fillInt * intensityMult;
    ambientLight.intensity = 1.3 - (depthRatio * 0.45); // 1.3 at Level 1, 0.85 at deepest
}

const woodTex = generateWoodTexture();
const chestMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.8,
    metalness: 0.1,
    color: 0xaa9988
});

const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.9,
    roughness: 0.2
});

const silverMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.1
});

// ── Run Snapshot ────────────────────────────────────────────────────────────

function buildRunSnapshot() {
    const activeProfile = ProfileManager.getActiveProfile();
    return {
        profileId: activeProfile ? activeProfile.id : null,
        room: currentRoom,
        score,
        health,
        ink,
        playerGold,
        consonantPool,
        vowelPool,
        roomProgress,
        currentTier: library.currentTier,
        wordList: library.currentSetKey,
        mode: challenger.currentMode,
        bossActive: bossActive,
        bossWordsCompleted: bossWordsCompleted,
        bossTargetWords: bossTargetWords,
        currentBossType: currentBossType,
        bossCycle: activeProfile ? (activeProfile.bossCycle || []) : [],
        roomRoll: currentRoomRoll, // SAVE the room type roll
        // Save the exact current word to prevent save-scumming
        currentWord: challenger.currentWordData ? challenger.currentWordData.word : null,

        lockpickConsumableBonus: lockpickConsumableBonus,
        doctorsNoteUsedCount: doctorsNoteUsedCount,
        shopRoomItems: shopRoomItems,
        itemData: items.serialize()
    };
}

function saveGameData() {
    // DO NOT save while we are in character creation, to prevent overwriting 
    // the currently active profile with temporary creation state.
    if (currentState === GameState.CREATE_CHAR) return;

    // Save Global Settings
    GlobalSettings.wordList = library.currentSetKey;
    GlobalSettings.mode = challenger.currentMode;
    const candleToggle = document.querySelector('#candles-toggle');
    if (candleToggle) GlobalSettings.candlesEnabled = candleToggle.checked;
    const errorToggle = document.querySelector('#errors-toggle');
    if (errorToggle) GlobalSettings.errorsEnabled = errorToggle.checked;
    const voiceSelector = document.querySelector('#voice-selector');
    if (voiceSelector) GlobalSettings.preferredVoice = voiceSelector.value;
    const volSlider = document.querySelector('#volume-slider');
    if (volSlider) GlobalSettings.volume = parseInt(volSlider.value);
    Persistence.saveSettings(GlobalSettings);

    // Update profile stats (best run tracking)
    const activeProfile = ProfileManager.getActiveProfile();
    if (activeProfile) {
        activeProfile.name = MageConfig.name || activeProfile.name;
        activeProfile.spellColor = MageConfig.spellColor || activeProfile.spellColor;
        activeProfile.itemData = items.serialize();
        if (typeof currentRoom !== 'undefined')
            activeProfile.maxRoom = Math.max(activeProfile.maxRoom || 1, currentRoom);
        if (typeof score !== 'undefined') {
            activeProfile.totalWords = (activeProfile.totalWords || 0) + (score - (activeProfile.lastSavedScore || 0));
            activeProfile.lastSavedScore = score;
        }

        // Persist the active run state directly to the profile
        const inRun = currentState === GameState.PLAYING || currentState === GameState.MCQ
            || currentState === GameState.PAUSE;
        if (inRun) {
            const snapshot = buildRunSnapshot();
            activeProfile.savedRun = snapshot;
            Persistence.saveRun(snapshot); // Also keep global emergency save
        }

        ProfileManager.saveActiveProfile(activeProfile);
    }
}

// Guarantee save even on accidental tab close / refresh
window.addEventListener('beforeunload', () => {
    const inRun = currentState === GameState.PLAYING || currentState === GameState.MCQ
        || currentState === GameState.PAUSE;
    if (inRun) Persistence.saveRun(buildRunSnapshot());
});

// ── Game Logic ─────────────────────────────────────────────────────────────
const library = new WordLibrary();
const challenger = new ChallengeManager(library);

let score = 0;
let health = 20;
let ink = 20;
let playerGold = 0;
let consonantPool = 0;
let vowelPool = 0;
let lastMistakeTime = 0;
let currentRoom = 1;
let roomProgress = 0;

const WORDS_PER_ROOM = 1;
let currentState = GameState.MENU;
let wordMistakes = 0;
let definitionMesh = null;
let originMesh = null;
let showDefinition = true; // Enabled by default as requested
let isTransitioning = false; // Guard to prevent multiple onSuccess triggers
let activeSpells = []; // Spells triggered for the current room
let spellTimeoutId = null; // Track pending spell timer
let isChestRoom = false;
let isShopRoom = false;
let shopRoomItems = null; // PERSISTENT shop stock to prevent savescumming
let chestAttempts = 3;
let chestMesh = null;
let bossWarningSignMesh = null;

// Boss Mechanics State
let bossActive = false;
let currentBossType = 'standard';
let bossBaseTime = 30.0;
let bossWordsCompleted = 0;
let currentRoomRoll = null; // Track current room's random roll for seed stability
let lockpickConsumableBonus = 0; // Bonus attempts from using Lockpick items
let doctorsNoteUsedCount = 0; // Each use doubles the shop price

// Tooltip formatting
const percentStats = ['shop_discount', 'gold_bonus', 'first_letter_chance', 'last_letter_chance', 'double_letter_chance', 'random_letter_chance', 'glow', 'time_warp', 'interest', 'rummage', 'cascade', 'chaos', 'foresight', 'conclusion', 'echo'];

let bossTargetWords = 0;
let bossTimeLeft = 30.0;
let bossTimerId = null;

const BOSS_VARIANTS = ['standard', 'pop-quiz', 'silent', 'blind', 'obscured'];

// [SHELVED] Branch Room - Do not remove. 
// This feature adds 3-way branching paths with side doors and labels. 
// Currently disabled but logic is ready for word/category integration.
let isBranchRoom = false;
let branchDoorMeshes = []; // Track door meshes and labels for cleanup

let synonymMeshes = [];
let revealedSynonyms = [];
function createSideWallDoor(xPos, zPos, label, roomNum) {
    // Door mesh on side wall
    const doorGeo = new THREE.BoxGeometry(0.4, 4.2, 3.2); // Thin in X, tall, wide in Z
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(xPos, 2.1, zPos);
    door.userData.roomNumber = roomNum;
    const edges = new THREE.EdgesGeometry(doorGeo);
    const lines = new THREE.LineSegments(edges, lineMat);
    door.add(lines);
    dungeonGroup.add(door);
    branchDoorMeshes.push(door);

    // Label sign above the door
    const labelGeo = new THREE.PlaneGeometry(3, 1);
    const labelMat = new THREE.MeshBasicMaterial({
        map: getWrappedTextTexture(label, "#ffcc66", true, 70),
        transparent: true,
        side: THREE.DoubleSide
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(xPos > 0 ? xPos - 0.3 : xPos + 0.3, 4.8, zPos);
    labelMesh.rotation.y = xPos > 0 ? -Math.PI / 2 : Math.PI / 2;
    labelMesh.userData.roomNumber = roomNum;
    dungeonGroup.add(labelMesh);
    branchDoorMeshes.push(labelMesh);
}

function showBranchRoom() {
    isBranchRoom = true;
    isChestRoom = false;
    isShopRoom = false;

    const absZCenter = 2.5 - (currentRoom - 1) * 15;

    // Create side wall doors with labels
    createSideWallDoor(-5.5, absZCenter, "LEFT", currentRoom);   // Left wall
    createSideWallDoor(5.5, absZCenter, "RIGHT", currentRoom);    // Right wall

    // Add label above the forward door (already exists from spawnRoom)
    const fwdLabelGeo = new THREE.PlaneGeometry(3, 1);
    const fwdLabelMat = new THREE.MeshBasicMaterial({
        map: getWrappedTextTexture("FORWARD", "#66ffcc", true, 70),
        transparent: true,
        side: THREE.DoubleSide
    });
    const fwdLabelMesh = new THREE.Mesh(fwdLabelGeo, fwdLabelMat);
    const entranceZ = 10 - (currentRoom - 1) * 15;
    fwdLabelMesh.position.set(0, 4.8, entranceZ - 15 + 0.5); // At the far wall
    fwdLabelMesh.userData.roomNumber = currentRoom;
    dungeonGroup.add(fwdLabelMesh);
    branchDoorMeshes.push(fwdLabelMesh);

    // Show the branch choice overlay
    const overlay = document.getElementById('branch-choice-overlay');
    if (overlay) overlay.style.display = 'block';

    // Hide word input and spells
    WORD_INPUT.style.display = 'none';
    WORD_INPUT.disabled = true;

    // Show tool-bar for inventory/look but hide spells
    const TOOL_BAR = document.getElementById('tool-bar');
    if (TOOL_BAR) TOOL_BAR.style.display = 'flex';
    const spellLabel = document.getElementById('spell-label');
    const revealBtn = document.getElementById('reveal-btn');
    const abilityBar = document.getElementById('ability-bar');
    if (spellLabel) spellLabel.style.display = 'none';
    if (revealBtn) revealBtn.style.display = 'none';
    if (abilityBar) abilityBar.style.display = 'none';
}

function handleBranchChoice(direction) {
    if (!isBranchRoom) return;

    // Hide the overlay immediately
    const overlay = document.getElementById('branch-choice-overlay');
    if (overlay) overlay.style.display = 'none';

    // Determine camera rotation for the chosen direction
    let targetRotY = 0; // forward (looking -Z)
    if (direction === 'left') targetRotY = Math.PI / 2;   // face left wall (-X)
    if (direction === 'right') targetRotY = -Math.PI / 2;  // face right wall (+X)

    // Rotate camera to face chosen door, then proceed to next room
    animateCamera(null, targetRotY, 600, () => {
        // Brief pause looking at the door, then transition
        setTimeout(() => {
            isBranchRoom = false;

            // Clean up branch door meshes
            branchDoorMeshes.forEach(m => {
                dungeonGroup.remove(m);
                disposeHierarchy(m);
            });
            branchDoorMeshes = [];

            // Same transition as onSuccess: spawn next room, glide through
            const currentDoor = dungeonDoor;
            const nextRoomNum = currentRoom + 1;
            const nextAbsZ = 10 - (nextRoomNum - 1) * 15;
            spawnRoom(nextAbsZ, nextRoomNum);
            renderer.render(scene, camera);

            // Turn forward first
            animateCamera(null, 0, 600, () => {
                slideDoorOpen(currentDoor);
                transitionSkinAtmosphere(2000);
                const finalGoalZ = 2.5 - (nextRoomNum - 1) * 15;
                animateCamera(new THREE.Vector3(0, 2, finalGoalZ), null, 2500, () => {
                    clearMCQWall();
                    completeRoom();
                    enterRoomSequence(true);
                });
            });
        }, 400);
    });
}

// Wire up branch button clicks
document.querySelectorAll('.branch-btn').forEach(btn => {
    btn.addEventListener('click', () => handleBranchChoice(btn.dataset.dir));
});

let shopGroup = null;

function getDiscountedCost(baseCost, itemName = null) {
    let cost = baseCost;
    if (itemName === "Doctor's Note") {
        cost = baseCost * Math.pow(2, doctorsNoteUsedCount);
    }
    const stats = items.getTotalStats();
    const discount = stats.shop_discount || 0; // percentage
    const multiplier = 1 - (discount / 100);
    return Math.max(1, Math.floor(cost * multiplier));
}

function showShopRoom(savedItems = null) {
    isChestRoom = false;
    isShopRoom = true;

    // Restore or initialize persistent shop items
    if (savedItems) {
        shopRoomItems = savedItems;
    }

    saveGameData();

    wordBricks.forEach(b => dungeonGroup.remove(b));
    wordBricks = [];
    if (chestMesh) dungeonGroup.remove(chestMesh);

    // FIX: Remove existing shop if it exists to prevent duplicates on refresh
    if (shopGroup) {
        disposeHierarchy(shopGroup);
        dungeonGroup.remove(shopGroup);
    }

    const absZCenter = 2.5 - (currentRoom - 1) * 15;
    const shopZPos = absZCenter;

    shopGroup = new THREE.Group();
    shopGroup.position.set(4.4, 0, shopZPos);
    shopGroup.rotation.y = -Math.PI / 2;
    shopGroup.userData.roomNum = currentRoom; // Tag for cleanup
    dungeonGroup.add(shopGroup);

    // 1. Display Case
    const caseWidth = 6.6;
    const caseDepth = 0.8;
    const counterMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

    const baseGeo = new THREE.BoxGeometry(caseWidth, 0.5, caseDepth);
    const baseMesh = new THREE.Mesh(baseGeo, counterMat);
    baseMesh.position.set(0, 0.25, 1.15);
    shopGroup.add(baseMesh);

    const glassMat = new THREE.MeshStandardMaterial({
        color: 0xaaddff, transparent: true, opacity: 0.25, metalness: 0.8, roughness: 0.1, depthWrite: false
    });
    const glassGeo = new THREE.BoxGeometry(caseWidth, 0.6, caseDepth);
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.renderOrder = 1;
    glassMesh.position.set(0, 0.8, 1.15);
    shopGroup.add(glassMesh);

    // 2. Register
    const regBaseGeo = new THREE.BoxGeometry(0.7, 0.4, 0.5);
    const regMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const reg = new THREE.Mesh(regBaseGeo, regMat);
    reg.position.set(1.2, 1.3, 1.15);
    shopGroup.add(reg);

    const regScreen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.1), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    regScreen.position.set(1.2, 1.6, 1.15);
    shopGroup.add(regScreen);

    // Wall Shelves and Items
    const shelfGeo = new THREE.BoxGeometry(6.6, 0.05, 0.35);

    // --- SHOP SELECTION LOGIC ---
    let selectedItems = [];

    // These variables are needed for item selection logic regardless of whether items are restored or rolled
    const dwc = activeProfile ? (activeProfile.diaryWordCount || 0) : 0;
    let currentDiaryName = "Diary";
    if (dwc >= 10) currentDiaryName = "Memoir";
    else if (dwc >= 5) currentDiaryName = "Manuscript";
    const ownsDiaryVariant = items.hasItem("Diary") || items.hasItem("Manuscript") || items.hasItem("Memoir");

    if (shopRoomItems && Array.isArray(shopRoomItems) && shopRoomItems.length > 0) {
        // Restore from previous state
        selectedItems = shopRoomItems;
    } else {
        // Roll NEW items
        const purchasableItems = items.allItems.filter(it => {
            if (it.name === "Ring" || it.name === "Necklace") return false;

            // DIARY PROGRESSION: Only show the currently earned "best" version if unowned
            if (it.name === "Diary" || it.name === "Manuscript" || it.name === "Memoir") {
                return (!ownsDiaryVariant && it.name === currentDiaryName);
            }

            if (it.cost <= 0) return false;

            const isCommonConsumable = it.name === "Ink Refill" || it.name === "Eraser Refill" || it.name === "Lock Picks";

            // Explicitly allowed repeatable storage items based on player preference
            const repeatableBagNames = ["Backpack", "Purse", "Brief Case", "Brown Shopping Bag", "Fanny Pack", "Satchel", "Messenger Bag", "Duffle Bag", "Sling Bag", "Pencil Pouch"];
            const isRepeatableBag = repeatableBagNames.some(name => it.name.toLowerCase() === name.toLowerCase());

            // Filter out owned items UNLESS they are consumables or explicit repeatable bags
            if (items.hasItemNamed(it.name)) {
                if (isCommonConsumable) return true;
                if (isRepeatableBag) return true;
                return false;
            }

            return true;
        });

        // --- DOUBLE SAFETY: Ensure name uniqueness in the final shop pool for this specific shelf instance ---
        const uniquePoolNames = new Set();
        const onceFiltered = purchasableItems.filter(it => {
            if (uniquePoolNames.has(it.name)) return false;
            uniquePoolNames.add(it.name);
            return true;
        });

        const pool = onceFiltered.map(it => {
            let weight = 1.0;
            let cost = it.cost;
            const lowerName = it.name.toLowerCase();

            // Detect if storage for boosting logic
            const statsStr = it.statsStr || it.stats_raw || "";
            const isStorageItem = statsStr.toLowerCase().includes("capacity") || statsStr.toLowerCase().includes("cc") || statsStr.toLowerCase().includes("utensil");

            // Force Diary price (40) for evolved versions if they appear in shop pool
            if (it.name === "Manuscript" || it.name === "Memoir") {
                cost = 40;
            }

            // Weighted frequency boosts
            const p150 = ["diary", "manuscript", "memoir", "notebook", "pocket notebook", "graduate's cap", "ink refill", "eraser refill", "lock picks", "backpack", "fanny pack", "brief case", "brown shopping bag", "sling bag", "satchel"];
            if (p150.includes(lowerName)) weight = 1.5;

            const p125 = ["messenger bag", "duffle bag", "trunk"];
            if (p125.includes(lowerName)) weight = 1.25;

            return { item: { ...it, cost: cost }, weight: weight, isStorage: isStorageItem };
        });

        // GUARANTEE CURRENT DIARY (if unowned)
        if (!ownsDiaryVariant) {
            const diaryEntry = pool.find(entry => entry.item.name === currentDiaryName);
            if (diaryEntry) {
                selectedItems.push(diaryEntry.item);
                const idx = pool.indexOf(diaryEntry);
                if (idx !== -1) pool.splice(idx, 1);
            }
        }

        // Select remaining items up to 20 unique items (allowing repeats for common/storage items)
        while (selectedItems.length < 20 && pool.length > 0) {
            const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
            const r = Math.random() * totalWeight;
            let cumulative = 0;
            for (let i = 0; i < pool.length; i++) {
                cumulative += pool[i].weight;
                if (r <= cumulative) {
                    const selectedEntry = pool[i];
                    selectedItems.push(selectedEntry.item);

                    // Splice immediately to ensure no duplicate items spawn in the shop at the same time
                    pool.splice(i, 1);
                    break;
                }
            }
        }

        // PERSIST the rolled items for this visit
        shopRoomItems = selectedItems;
    }

    let itemIdx = 0;
    for (let i = 0; i < 4; i++) {
        let shelfY, baseZOffset;
        if (i < 3) {
            shelfY = 2.0 + i * 0.9;
            baseZOffset = -0.15;
            const shelf = new THREE.Mesh(shelfGeo, counterMat);
            shelf.position.set(0, shelfY, baseZOffset);
            shopGroup.add(shelf);
        } else {
            shelfY = 0.5;
            baseZOffset = 1.15;
        }

        for (let j = 0; j < 5; j++) {
            if (itemIdx < selectedItems.length) {
                const item = selectedItems[itemIdx];
                if (!item) continue;

                const itemModel = createItemModel(item.name);

                const itemX = -2.6 + (j * 1.3);
                let itemYOffset = 0.05;
                let itemZOffset = baseZOffset;

                // Basic auto-scaling based on box bounds (simplified)
                // Use multiplyScalar so that individual model base-scales (like Big Eraser's reduction) are preserved
                itemModel.scale.multiplyScalar(0.5);

                const discountedCost = getDiscountedCost(item.cost, item.name);
                const priceTag = createPriceTag(discountedCost);
                if (i === 3) {
                    // Glass Case items - smaller tag, closer to item
                    priceTag.scale.set(0.5, 0.5, 0.5);
                    priceTag.position.set(itemX, shelfY + 0.05, itemZOffset + 0.25); // Moved further from item
                } else {
                    priceTag.position.set(itemX, shelfY - 0.14, itemZOffset + 0.18); // Lowered a bit more for double size
                }
                shopGroup.add(priceTag);

                itemModel.userData = { shopItem: item, priceTag: priceTag };
                priceTag.userData = { shopItem: item, isPriceTag: true };
                itemModel.position.set(itemX, shelfY + itemYOffset, itemZOffset);
                shopGroup.add(itemModel);

                itemIdx++;
            }
        }
    }

    const gnome = createGnome();
    gnome.position.set(-0.2, 0, -0.1);
    gnome.rotation.y = 0.4;
    shopGroup.add(gnome);

    // 4. LEAVE SHOP sign (Physical 3D button)
    const leaveSign = createLeaveSign();
    leaveSign.position.set(-1.2, 1.35, 0.5); // Move up by .25 (1.1 + .25 = 1.35)
    leaveSign.rotation.y = 0.5; // Angled towards player
    leaveSign.userData.isLeaveSign = true;
    shopGroup.add(leaveSign);

    updateUI();

    animateCamera(null, -Math.PI / 2, 800, () => {
        isTransitioning = false;
        setGameState(GameState.PLAYING, true);
        updateUI(); // Ensure HUD elements refresh after transition
    });
}

function exitShop() {
    if (!isShopRoom || isTransitioning) return;

    // Hide tooltips when leaving
    hideTooltip();
    if (typeof shopHoverTooltip !== 'undefined') {
        shopHoverTooltip.style.display = 'none';
    }

    onSuccess(true, true);
}

if (LEAVE_SHOP_BTN) {
    LEAVE_SHOP_BTN.onclick = exitShop;
}
if (HUD_LEAVE_SHOP_BTN) {
    HUD_LEAVE_SHOP_BTN.onclick = exitShop;
}

function createItemModel(name) {
    if (!name) return createToolModel();
    // Try exact match first
    if (ITEM_MODEL_MAP[name]) return ITEM_MODEL_MAP[name]();
    // Try case-insensitive fallback
    const lowerName = name.toLowerCase();
    const mapKey = Object.keys(ITEM_MODEL_MAP).find(k => k.toLowerCase() === lowerName);
    if (mapKey) return ITEM_MODEL_MAP[mapKey]();

    return createToolModel();
}

function createLeaveSign() {
    const group = new THREE.Group();
    const signColor = '#881111'; // Noteworthy red

    // Sign Board
    const boardGeo = new THREE.BoxGeometry(0.8, 0.4, 0.05);
    const boardMat = new THREE.MeshStandardMaterial({ color: signColor, roughness: 0.8 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    group.add(board);

    // Canvas texture for "LEAVE"
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = signColor;
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LEAVE', 128, 44);
    ctx.fillText('SHOP', 128, 92);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 236, 108);

    const texture = new THREE.CanvasTexture(canvas);
    const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), textMat);
    textMesh.position.z = 0.03;
    group.add(textMesh);

    // Post/Stand for the sign
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
    const postMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(0, -0.55, -0.05);
    group.add(post);

    return group;
}

function createPriceTag(price) {
    const group = new THREE.Group();
    const parchmentColor = '#e8d8b0'; // Warm parchment tan

    // Tag geometry
    const tagGeo = new THREE.PlaneGeometry(0.7, 0.32); // Doubled from 0.35, 0.16
    const tagMat = new THREE.MeshStandardMaterial({ color: parchmentColor, side: THREE.DoubleSide, roughness: 0.9 });
    const tag = new THREE.Mesh(tagGeo, tagMat);
    tag.rotation.x = -Math.PI / 6; // Tilted up
    group.add(tag);

    // Canvas texture for price
    const canvas = document.createElement('canvas');
    canvas.width = 256; // Doubled
    canvas.height = 128; // Doubled
    const ctx = canvas.getContext('2d');

    // Fill with parchment background
    ctx.fillStyle = parchmentColor;
    ctx.fillRect(0, 0, 256, 128);

    // Text style
    ctx.fillStyle = '#222222';
    ctx.font = 'bold 72px serif'; // Doubled from 36
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${price}g`, 128, 64); // Centered at 128, 64 now

    // Add a tiny border
    ctx.strokeStyle = '#8b4513'; // Saddle brown
    ctx.lineWidth = 8; // Doubled
    ctx.strokeRect(4, 4, 248, 120); // Doubled margins/size

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const textMesh = new THREE.Mesh(tagGeo, textMat);
    textMesh.position.z = 0.005;
    tag.add(textMesh);

    return group;
}

function createGnome() {
    const gnomeGroup = new THREE.Group();
    gnomeGroup.name = "gnomeman";

    const fleshMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const clothesMat = new THREE.MeshStandardMaterial({ color: 0x3e4530, roughness: 0.8 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xccaa33, metalness: 0.9, roughness: 0.1 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    // Tunic (Body)
    const tunic = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.5, 1.2, 12),
        clothesMat
    );
    tunic.position.y = 0.6;
    gnomeGroup.add(tunic);

    // Belt
    const belt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.52, 0.15, 12),
        new THREE.MeshStandardMaterial({ color: 0x4a2c11 }) // Brown Leather
    );
    belt.position.y = 0.5;
    gnomeGroup.add(belt);

    // Buttons
    for (let i = 0; i < 2; i++) {
        const btn = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), metalMat);
        btn.position.set(0, 0.8 + i * 0.2, 0.4);
        gnomeGroup.add(btn);
    }

    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 12),
        fleshMat
    );
    head.position.y = 1.6;
    gnomeGroup.add(head);

    // Textured Beard (Layered)
    const beardGroup = new THREE.Group();
    const mainBeard = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.8, 12), whiteMat);
    beardGroup.add(mainBeard);

    // Add tufts to the side for texture
    for (let i = 0; i < 6; i++) {
        const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), whiteMat);
        const ang = (i / 6) * Math.PI * 2;
        tuft.position.set(Math.cos(ang) * 0.3, -0.1, Math.sin(ang) * 0.2);
        tuft.scale.set(1, 1.5, 1);
        beardGroup.add(tuft);
    }
    beardGroup.position.set(0, 1.15, 0.25);
    beardGroup.rotation.x = Math.PI - 0.1;
    gnomeGroup.add(beardGroup);

    // Nose
    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffa0a0 })
    );
    nose.position.set(0, 1.65, 0.4);
    gnomeGroup.add(nose);

    // Eyes (Upgraded with highlights)
    const eyeBaseGeo = new THREE.SphereGeometry(0.06, 10, 10);
    const pupilGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const glintGeo = new THREE.SphereGeometry(0.01, 6, 6);

    [-0.15, 0.15].forEach(x => {
        const eyeBase = new THREE.Mesh(eyeBaseGeo, whiteMat);
        eyeBase.position.set(x, 1.75, 0.35);
        gnomeGroup.add(eyeBase);

        const pupil = new THREE.Mesh(pupilGeo, blackMat);
        pupil.position.set(x, 1.75, 0.4);
        gnomeGroup.add(pupil);

        const glint = new THREE.Mesh(glintGeo, whiteMat);
        glint.position.set(x + 0.02, 1.77, 0.41);
        gnomeGroup.add(glint);
    });

    // Bushy Eyebrows
    const browGeo = new THREE.BoxGeometry(0.2, 0.08, 0.1);
    const browL = new THREE.Mesh(browGeo, whiteMat);
    browL.position.set(-0.2, 1.88, 0.32);
    browL.rotation.z = 0.2;
    gnomeGroup.add(browL);

    const browR = new THREE.Mesh(browGeo, whiteMat);
    browR.position.set(0.2, 1.88, 0.32);
    browR.rotation.z = -0.2;
    gnomeGroup.add(browR);

    // Conical Hat
    const hat = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 1.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x225522, roughness: 0.6 })
    );
    hat.position.y = 2.45;
    hat.rotation.x = -0.15;
    gnomeGroup.add(hat);

    // Arms & Hands
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11 });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.15), clothesMat);
    armL.position.set(-0.45, 1.1, 0.2);
    armL.rotation.z = -0.5;
    gnomeGroup.add(armL);

    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), gloveMat);
    handL.position.set(-0.65, 0.8, 0.28);
    gnomeGroup.add(handL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.15), clothesMat);
    armR.position.set(0.45, 1.1, 0.2);
    armR.rotation.z = 0.5;
    gnomeGroup.add(armR);

    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), gloveMat);
    handR.position.set(0.65, 0.8, 0.28);
    gnomeGroup.add(handR);

    // Final Scale
    gnomeGroup.scale.set(0.7, 0.7, 0.7);

    return gnomeGroup;
}

function bossTimerTick() {
    if (!bossActive || isTransitioning || currentState !== GameState.PLAYING) return;
    bossTimeLeft -= 0.1;

    if (bossTimeLeft <= 0) {
        bossTimeLeft = 0;
        clearInterval(bossTimerId);
        bossTimerId = null;
        updateBossTimerUI();

        // Calculate penalty based on remaining letters
        const hiddenBricks = wordBricks.filter(b => !b.userData.revealed).length;

        const currentLvl = Math.max(1, Math.ceil(currentRoom / 10));
        const damageMultiplier = Math.floor((currentLvl - 1) / 2) + 1;
        let damage = hiddenBricks * damageMultiplier;

        const totalArmor = items.getTotalStats().armor || 0;
        if (totalArmor > 0) {
            damage = Math.max(1, damage - totalArmor);
            if (damage < hiddenBricks * damageMultiplier) {
                showToast(`TIME OUT! Armor blocked ${(hiddenBricks * damageMultiplier) - damage} DMG!`);
            }
        } else {
            showToast(`TIME OUT! Took ${damage} DMG!`);
        }

        health = Math.max(0, health - damage);

        // Spellonomicon logic (Timed out damage counts)
        if (damage > 0 && items.hasItem("Spellonomicon")) {
            updateSpellonomicon(damage);
        }

        console.log(`[BOSS] Time out! damage:${damage} newHealth:${health}`);
        createSpellBurst("#ff0000"); // Red burst indicates damage

        updateUI(); // Ensure HP bar updates even if not dead
        saveGameData(); // Ensure damage is persisted to profile run state

        if (health <= 0) {
            health = 0;
            updateUI();
            gameOver();
            return;
        }

        // Auto reveal to show word
        wordBricks.forEach(b => revealBrick(b));

        // Wait 1.5s then advance to next boss word/room
        setTimeout(() => onSuccess(true, true), 1500);
    }
    updateBossTimerUI();
}

function updateBossTimerUI() {
    const textEl = document.getElementById('boss-timer-text');
    const fillEl = document.getElementById('boss-timer-fill');
    const progressEl = document.getElementById('boss-progress-text');
    if (textEl) textEl.textContent = Math.ceil(bossTimeLeft) + "s";
    if (fillEl) fillEl.style.width = Math.max(0, (bossTimeLeft / bossBaseTime) * 100) + "%";
    if (progressEl) progressEl.textContent = `Word: ${Math.min(bossWordsCompleted + 1, bossTargetWords)}/${bossTargetWords}`;
}

function setGameState(state, skipReset = false) {
    const prevState = currentState;
    currentState = state;

    // Log state change with a simple stack trace to track down unintended transitions
    const stack = new Error().stack.split('\n')[2].trim();
    console.log(`[STATE CHANGE] ${prevState} -> ${state} | via: ${stack}`);

    // Update body classes for state-based CSS targeting
    // Remove all classes starting with 'state-' to ensure a clean slate
    const stateClasses = Array.from(document.body.classList).filter(c => c.startsWith('state-'));
    stateClasses.forEach(c => document.body.classList.remove(c));

    document.body.classList.add(`state-${state.toLowerCase().replace(/_/g, '-')}`);
    console.log(`[BODY CLASS] Current classes: ${document.body.className}`);

    // Show in all menus, hide ONLY during active gameplay
    const isGameplay = state === GameState.PLAYING || state === GameState.MCQ;
    const kofiElements = document.querySelectorAll('[class*="kofi"], [id*="kofi"], [class*="floating-chat"], [class*="floatingchat"], [class*="kofi-link"], [class*="close"]');
    kofiElements.forEach(el => {
        if (!isGameplay) {
            // Clear inline style to let CSS state-based rules take over
            el.style.removeProperty('display');
        } else {
            el.style.setProperty('display', 'none', 'important');
        }
    });

    Object.values(SCREENS).forEach(el => {
        if (el) el.style.display = 'none';
    });
    if (SCREENS[state]) {
        SCREENS[state].style.display = 'flex';

        // If we are in MCQ, we need to make sure the specific MCQ elements are visible within game-ui
        // (Previously it was mapped to #mcq-screen, but that ID doesn't exist in HTML anymore)
    }

    // Special logic for MCQ HUD visibility
    if (state === GameState.MCQ) {
        // Show MCQ choices/elements layer if it exists
        const mcqLayer = document.querySelector('#mcq-screen-layer'); // Note: if you have a layer for html mcq elms
        if (mcqLayer) mcqLayer.style.display = 'flex';

        // Hide standard spelling inputs
        const spellingArea = document.querySelector('#spelling-area');
        if (spellingArea) spellingArea.style.display = 'none';
    } else if (state === GameState.PLAYING) {
        const spellingArea = document.querySelector('#spelling-area');
        if (spellingArea) spellingArea.style.display = 'flex';
    }
    // Populate debug data preview
    if (state === GameState.REPORT_BUG) {
        const preview = document.querySelector('#debug-data-preview');
        if (preview) {
            preview.style.display = 'block';
            preview.textContent = collectDebugData();
        }
    }

    // Refresh unlocks when entering menu
    if (state === GameState.MENU) {
        refreshMenuButtonVisibility();
    }

    if (state === GameState.PLAYING || state === GameState.MCQ) {
        if (!skipReset && prevState !== GameState.PAUSE && prevState !== GameState.MCQ && prevState !== GameState.PLAYING) {
            resetGame();
        } else {
            // Restore UI hidden during transitions
            const TOOL_BAR = document.getElementById('tool-bar');
            const RESOURCE_BAR = document.getElementById('action-area');
            const isMCQ = (state === GameState.MCQ);
            // Allow Look Around while room is cleared but the transition hasn't actually moved the camera yet
            const isPlaying = (state === GameState.PLAYING);

            // MCQ: Show tool-bar (for inventory/look) but hide spells inside it
            if (TOOL_BAR) {
                TOOL_BAR.style.display = (isPlaying || isMCQ) ? 'flex' : 'none';
                if (lookBtn) lookBtn.style.display = (isPlaying || isMCQ) ? 'block' : 'none';
            }
            if (RESOURCE_BAR) RESOURCE_BAR.style.display = isPlaying ? 'flex' : 'none';
            if (SKIP_CHEST_BTN) {
                const isPuzzleMode = (challenger.currentMode === ChallengeMode.PUZZLE);
                SKIP_CHEST_BTN.style.display = ((isChestRoom || isPuzzleChest) && !isTransitioning && !isPuzzleMode) ? 'block' : 'none';
            }
            if (LEAVE_SHOP_BTN) LEAVE_SHOP_BTN.style.display = 'none';
            if (HUD_LEAVE_SHOP_BTN) HUD_LEAVE_SHOP_BTN.style.display = (isShopRoom && !isTransitioning) ? 'block' : 'none';
            WORD_INPUT.style.display = (isPlaying && !isShopRoom && !isPuzzleChest) ? 'block' : 'none';
            WORD_INPUT.disabled = (isMCQ || isTransitioning);
            if (isPlaying && !isPuzzleChest) WORD_INPUT.focus();

            // Handle virtual keyboard visibility
            const keyboard = document.getElementById('puzzle-keyboard');
            if (keyboard) {
                keyboard.style.display = (isPlaying && isPuzzleChest && puzzleMistakesLeft > 0) ? 'grid' : 'none';
            }

            // Hide spell elements during MCQ, show during normal play
            const spellLabel = document.getElementById('spell-label');
            const revealBtn = document.getElementById('reveal-btn');
            const abilityBar = document.getElementById('ability-bar');
            if (spellLabel) spellLabel.style.display = isMCQ ? 'none' : '';
            if (revealBtn) revealBtn.style.display = isMCQ ? 'none' : '';
            if (abilityBar) abilityBar.style.display = isMCQ ? 'none' : '';
        }
    }
    else if (state === GameState.PAUSE) {
        updateInventoryUI();
        WORD_INPUT.blur();
        const keyboard = document.getElementById('puzzle-keyboard');
        if (keyboard) keyboard.style.display = 'none';
    }
    else if (state === GameState.SCORES) {
        renderScores();
    } else if (state === GameState.SETTINGS || state === GameState.GRAPHICS) {
        if (state === GameState.SETTINGS && prevState !== GameState.GRAPHICS && prevState !== GameState.DRASTIC) {
            lastSettingsEntryState = prevState;
        }
        initSettingsUI();
    } else if (state === GameState.DRASTIC) {
        // No special init needed
    } else if (state === GameState.MENU) {
        spawnLobby();
        updateMenuRunButtons();
    }
}

function animateCamera(targetPos, targetRotY, duration, callback) {
    const startPos = camera.position.clone();
    const startRotY = camera.rotation.y;
    const startTime = Date.now();

    // Safety: If no meaningful change is requested, or duration is 0, skip to callback
    const dist = targetPos ? startPos.distanceTo(targetPos) : 0;
    const rotDiff = targetRotY !== null ? Math.abs(targetRotY - startRotY) : 0;
    if (dist < 0.01 && rotDiff < 0.01) {
        if (callback) callback();
        return;
    }

    // Guard: Prevent overlapping camera animations
    if (camera.userData.isAnimating) {
        console.warn("animateCamera: Animation already in progress, skipping.");
        if (callback) callback();
        return;
    }
    camera.userData.isAnimating = true;

    function update() {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        const ease = p * p * (3 - 2 * p); // smoothstep
        if (targetPos) {
            camera.position.lerpVectors(startPos, targetPos, ease);
            mainLight.position.z = camera.position.z;
            fillLight.position.z = camera.position.z - 10;
        }
        if (targetRotY !== null) {
            camera.rotation.y = startRotY + (targetRotY - startRotY) * ease;
        }
        if (p < 1) requestAnimationFrame(update);
        else {
            camera.userData.isAnimating = false;
            // Sync targetRotation after external animation
            if (targetRotY !== null) targetRotation.y = targetRotY;
            if (callback) callback();
        }
    }
    update();
}

function enterRoomSequence(skipWalk = false, forcedWord = null) {
    // If not a continuation, roll a new room type for the level
    if (!currentRoomRoll) {
        currentRoomRoll = Math.random();
    }

    // Hide HUD at start of room entry
    const TOOL_BAR = document.getElementById('tool-bar');
    const RESOURCE_BAR = document.getElementById('action-area');
    if (TOOL_BAR) TOOL_BAR.style.display = 'none';
    if (RESOURCE_BAR) RESOURCE_BAR.style.display = 'none';
    if (HEAR_BTN) HEAR_BTN.style.display = 'none';
    if (SKIP_CHEST_BTN) SKIP_CHEST_BTN.style.display = 'none';
    WORD_INPUT.style.display = 'none';

    const finishSequence = () => {
        isChestRoom = false; // Reset chest state
        isShopRoom = false; // Reset shop state
        isBranchRoom = false;
        isPuzzleChest = false;
        bossActive = false;

        if (bossWarningSignMesh) {
            dungeonGroup.remove(bossWarningSignMesh);
            bossWarningSignMesh = null;
        }

        if (bossTimerId) { clearInterval(bossTimerId); bossTimerId = null; }
        document.getElementById('boss-timer-container').style.display = 'none';

        // [DEV] Force Shop in Room 0 - uncomment to re-enable
        // if (currentRoom === 0) {
        //     showShopRoom();
        //     saveGameData();
        //     return;
        // }

        // 1. PUZZLE MODE OVERRIDE (Exclusively Puzzle Chests)
        if (challenger.currentMode === ChallengeMode.PUZZLE) {
            if (currentRoom % 10 === 0) {
                showShopRoom();
            } else {
                showPuzzleChestRoom();
            }
            saveGameData();
            return;
        }

        // 2. ADVENTURE MODE (Bosses every 10 rooms)
        if (challenger.currentMode === ChallengeMode.ADVENTURE) {
            const isBossRoom = (currentRoom % 10 === 0);
            if (isBossRoom) {
                const currentLvl = Math.max(1, Math.ceil(currentRoom / 10));

                if (currentLvl % 5 === 0) {
                    currentBossType = 'silent';
                } else if (activeProfile) {
                    if (!activeProfile.bossCycle || activeProfile.bossCycle.length === 0) {
                        activeProfile.bossCycle = BOSS_VARIANTS.filter(v => v !== 'silent');
                        for (let i = activeProfile.bossCycle.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [activeProfile.bossCycle[i], activeProfile.bossCycle[j]] = [activeProfile.bossCycle[j], activeProfile.bossCycle[i]];
                        }
                    }
                    currentBossType = activeProfile.bossCycle.pop();
                    ProfileManager.saveActiveProfile(activeProfile);
                    saveGameData();
                } else {
                    const pool = BOSS_VARIANTS.filter(v => v !== 'silent');
                    currentBossType = pool[Math.floor(Math.random() * pool.length)];
                }
                bossActive = true;
                bossWordsCompleted = 0; // Reset progress for the new boss encounter

                if (currentBossType === 'pop-quiz') {
                    bossTargetWords = Math.ceil((currentLvl + 1) / 2);
                    bossBaseTime = 20.0;
                    showToast("BOSS ENCOUNTER: POP QUIZ!", 4000);
                } else if (currentBossType === 'silent') {
                    bossTargetWords = Math.max(1, Math.ceil((currentLvl + 1) / 4));
                    bossBaseTime = 60.0;
                    showToast("BOSS ENCOUNTER: THE SILENT ONE!", 4000);
                } else if (currentBossType === 'blind') {
                    bossTargetWords = currentLvl + 1;
                    bossBaseTime = 45.0;
                    showToast("BOSS ENCOUNTER: THE INKLORD!", 4000);
                } else if (currentBossType === 'obscured') {
                    bossTargetWords = Math.ceil((currentLvl + 1) / 2);
                    bossBaseTime = 40.0;
                    showToast("BOSS ENCOUNTER: THE OBSCURER!", 4000);
                } else {
                    currentBossType = 'standard';
                    bossTargetWords = currentLvl + 1;
                    bossBaseTime = 30.0;
                    showToast("BOSS ENCOUNTER: THE GUARDIAN!", 4000);
                }

                animateCamera(null, Math.PI / 2, 800, () => {
                    startNewChallenge(forcedWord);
                });
                return;
            }

            const roll = currentRoomRoll;
            const canHaveRandomEvent = currentRoom > 4;

            if (currentRoom === 7) {
                showPuzzleChestRoom();
            } else if (currentRoom === 9) {
                animateCamera(null, -Math.PI / 2, 800, () => showMCQ());
            } else if (currentRoom % 10 === 2 && currentRoom >= 12) {
                showShopRoom();
            } else if (canHaveRandomEvent && roll < 0.10) {
                showPuzzleChestRoom();
            } else if (canHaveRandomEvent && roll < 0.15) {
                animateCamera(null, -Math.PI / 2, 800, () => showMCQ());
            } else {
                animateCamera(null, Math.PI / 2, 800, () => startNewChallenge(forcedWord));
            }
        }
        // 4. BOSS RUSH MODE (90% Bosses, 10% MCQ, Shop every 10th)
        // 4. BOSS RUSH MODE (Bosses, with The Silent One as Level Boss, plus Periodic Shop)
        else if (challenger.currentMode === ChallengeMode.BOSSRUSH) {
            if (currentRoom % 10 === 0 && currentRoom > 0) {
                // THE SILENT ONE at the end of every level set (10, 20, 30...)
                currentBossType = 'silent';
                bossActive = true;
                bossWordsCompleted = 0;
                const currentLvl = Math.max(1, Math.ceil(currentRoom / 10));
                bossTargetWords = Math.max(1, Math.ceil((currentLvl + 1) / 4));
                bossBaseTime = 60.0;
                showToast("LEVEL BOSS: THE SILENT ONE!", 4000);
                animateCamera(null, Math.PI / 2, 800, () => startNewChallenge());
            } else if (currentRoom % 10 === 9) {
                // PRE-BOSS SHOP at room 9, 19, 29...
                showShopRoom();
            } else {
                const roll = currentRoomRoll;
                if (roll < 0.10) {
                    animateCamera(null, -Math.PI / 2, 800, () => showMCQ());
                } else {
                    const currentLvl = Math.max(1, Math.ceil(currentRoom / 10));

                    if (activeProfile) {
                        if (!activeProfile.bossCycle || activeProfile.bossCycle.length === 0) {
                            activeProfile.bossCycle = BOSS_VARIANTS.filter(v => v !== 'silent');
                            // Fisher-Yates shuffle
                            for (let i = activeProfile.bossCycle.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [activeProfile.bossCycle[i], activeProfile.bossCycle[j]] = [activeProfile.bossCycle[j], activeProfile.bossCycle[i]];
                            }
                        }
                        currentBossType = activeProfile.bossCycle.pop();
                        ProfileManager.saveActiveProfile(activeProfile);
                    } else {
                        const pool = BOSS_VARIANTS.filter(v => v !== 'silent');
                        currentBossType = pool[Math.floor(Math.random() * pool.length)];
                    }
                    bossActive = true;
                    bossWordsCompleted = 0;

                    if (currentBossType === 'pop-quiz') {
                        bossTargetWords = Math.ceil((currentLvl + 1) / 2);
                        bossBaseTime = 20.0;
                    } else if (currentBossType === 'silent') {
                        bossTargetWords = Math.max(1, Math.ceil((currentLvl + 1) / 4));
                        bossBaseTime = 60.0;
                    } else if (currentBossType === 'blind') {
                        bossTargetWords = currentLvl + 1;
                        bossBaseTime = 45.0;
                    } else if (currentBossType === 'obscured') {
                        bossTargetWords = Math.ceil((currentLvl + 1) / 2);
                        bossBaseTime = 40.0;
                    } else {
                        currentBossType = 'standard';
                        bossTargetWords = currentLvl + 1;
                        bossBaseTime = 30.0;
                    }
                    animateCamera(null, Math.PI / 2, 800, () => startNewChallenge(forcedWord));
                }
            }
        }
        // 5. RANDOM / CLASSIC MODE
        else {
            const roll = currentRoomRoll;
            const canHaveRandomEvent = currentRoom > 4;

            if (currentRoom === 7) {
                showPuzzleChestRoom();
            } else if (currentRoom === 9) {
                animateCamera(null, -Math.PI / 2, 800, () => showMCQ());
            } else if (currentRoom % 10 === 2 && currentRoom >= 12) {
                showShopRoom();
            } else if (canHaveRandomEvent && roll < 0.10) {
                showPuzzleChestRoom();
            } else if (canHaveRandomEvent && roll < 0.15) {
                animateCamera(null, -Math.PI / 2, 800, () => showMCQ());
            } else {
                animateCamera(null, Math.PI / 2, 800, () => startNewChallenge(forcedWord));
            }
        }
        saveGameData(); // <--- CRITICAL: Save room type and position immediately
    };

    // Spawn Boss Warning Sign before walk begins so player has time to see it at the end of the hall
    if (challenger.currentMode === ChallengeMode.ADVENTURE && currentRoom % 10 === 9 && !bossWarningSignMesh) {
        const signGeo = new THREE.PlaneGeometry(5, 2.5);
        const signMat = new THREE.MeshBasicMaterial({
            map: getWrappedTextTexture("BOSS NEXT ROOM", "#ff4444", true, 80),
            transparent: true,
            side: THREE.DoubleSide
        });
        const absZCenter = 2.5 - (currentRoom - 1) * 15;
        bossWarningSignMesh = new THREE.Mesh(signGeo, signMat);
        // Place lower so it fits inside the player's 60 FOV while looking straight
        bossWarningSignMesh.position.set(0, 3.8, absZCenter - 6.5);
        dungeonGroup.add(bossWarningSignMesh);
    }

    if (skipWalk) {
        finishSequence();
    } else {
        // Pre-detect branch room so we know to stop early [SHELVED]
        const willBeBranch = false;
        // Walk into the room — stop early for branch rooms (2 units in), otherwise walk to center
        const entranceZ = 10 - (currentRoom - 1) * 15;
        const centerZ = 2.5 - (currentRoom - 1) * 15;
        const targetZ = willBeBranch ? entranceZ - 2 : centerZ;
        animateCamera(new THREE.Vector3(0, 2, targetZ), null, willBeBranch ? 800 : 1500, finishSequence);
    }
}

function resetGame() {
    items.reset();
    isShopRoom = false;
    isChestRoom = false;
    const stats = items.getTotalStats();
    score = 0;
    health = baseMaxHealth + stats.hp;
    ink = baseMaxInk + stats.ink;
    playerGold = 0; // [DEV] was 5000 for playtesting - restore: playerGold = 5000;
    consonantPool = 0;
    vowelPool = 0;
    roomProgress = 0;
    currentRoom = 0; // Lobby is room 0; gameplay starts at room 1 after transition

    library.currentTier = 1;
    isTransitioning = true;

    // BROAD CLEANUP: Remove everything from the dungeon group to prevent ghosting
    activeRooms.clear();
    const toKill = [];
    dungeonGroup.traverse(child => {
        if (child !== dungeonGroup) toKill.push(child);
    });
    toKill.forEach(obj => {
        dungeonGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
        }
    });

    // Reset global state variables
    chestMesh = null;
    shopGroup = null;
    wordBricks = [];
    typedMeshes = [];
    bossActive = false;
    currentBossType = 'standard';
    bossWordsCompleted = 0;
    bossTargetWords = 0;
    bossTimeLeft = 30.0;
    if (bossTimerId) clearInterval(bossTimerId);
    bossTimerId = null;
    currentRoomRoll = null;
    lockpickConsumableBonus = 0;
    isBranchRoom = false;
    isChestRoom = false;
    isShopRoom = false;
    if (spellTimeoutId) clearTimeout(spellTimeoutId);
    spellTimeoutId = null;
    activeSpells = [];
    wordMistakes = 0;
    finalBossRewardPending = false;

    // Direct transition setup
    spawnLobby(10 + 15); // Place lobby at Z=25 (standard start)
    applyRoomSkin(0);
    // REMOVED: spawnRoom(10, 0, true) - Overlapped with Lobby/Room 1 flow
    enterRoomSequence(true); // Don't walk yet (forces Room 0 Shop)

    updateUI();
}

function spawnRoom(absZ, roomNum = currentRoom, addBackWall = false) {
    applyRoomSkin(roomNum);
    createRoom(absZ, roomNum, addBackWall); // createRoom(zOffset) uses zOffset as entrance
    createDoor(absZ - 15, roomNum); // Door is always at the far wall (entrance - 15)
}

let lobbyDoor = null;
function spawnLobby(targetEntrance = 25) {
    // Clear any existing geometry (only Room 0 - the lobby)
    clearRoom(0);

    // Create one room: the lobby
    // Lobby is Room 0
    // Entrance: targetEntrance, Exit: targetEntrance - 15
    createRoom(targetEntrance, 0, true); // Add back wall to lobby
    createDoor(targetEntrance - 15, 0); // Exit door
    createDecorativeDoor(targetEntrance, 0); // Entrance door
    lobbyDoor = dungeonDoor; // Store reference

    // Position camera facing the door (exit)
    const startZ = targetEntrance - 2;
    camera.position.set(0, 2, startZ);
    camera.rotation.set(0, 0, 0);
    targetRotation.set(0, 0, 0);
    mainLight.position.set(0, 5, targetEntrance - 17); // Light near exit
    fillLight.position.set(0, 5.5, targetEntrance - 22);
}

function clearRoom(roomNum) {
    const targets = [];
    dungeonGroup.children.forEach(c => {
        if (c.userData && c.userData.roomNumber === roomNum) {
            targets.push(c);
        }
    });

    targets.forEach(t => {
        disposeHierarchy(t);
        dungeonGroup.remove(t);
    });

    // Clean up systems
    candleLights = candleLights.filter(c => c.group && c.group.userData && c.group.userData.roomNumber !== roomNum);
    activeRats = activeRats.filter(r => r.userData && r.userData.roomNumber !== roomNum);
}

function startNewChallenge(forcedWord = null) {
    isTransitioning = false; // Reset transition guard when new word starts
    if (forcedWord) {
        // Attempt to find full library entry for restoration
        const fullData = library.getWords().find(w => w.word === forcedWord);
        if (fullData) {
            challenger.currentWordData = fullData;
        } else {
            challenger.currentWordData = { word: forcedWord, definition: "Mystery Word" };
        }
    } else {
        const currentLevel = Math.max(1, Math.min(10, Math.ceil(currentRoom / 10)));
        activeProfile = ProfileManager.getActiveProfile();
        const excludeList = (activeProfile && activeProfile.spelledWords) ? activeProfile.spelledWords : [];
        challenger.generateNewChallenge(currentLevel, excludeList);
    }
    const word = challenger.currentWordData.word;
    wordMistakes = 0;

    // Boss check
    if (bossActive) {
        document.getElementById('boss-timer-container').style.display = 'block';
        const statsForTime = items.getTotalStats();
        const baseTime = bossBaseTime; // Uses 30s or 20s based on boss type
        const timeBonusPercent = (statsForTime.time_warp || 0);
        const timeBonusSeconds = baseTime * (timeBonusPercent / 100);
        bossTimeLeft = baseTime + timeBonusSeconds;

        // Visual indicator for the Boss timer
        const bar = document.getElementById('boss-timer-fill');
        if (bar) {
            if (currentBossType === 'pop-quiz') bar.style.backgroundColor = "#ff8800";
            else if (currentBossType === 'silent') bar.style.backgroundColor = "#888888"; // Ghostly Grey
            else if (currentBossType === 'blind') bar.style.backgroundColor = "#220033"; // Deep Ink Purple
            else bar.style.backgroundColor = "#ff0000";
        }

        updateBossTimerUI();
        if (bossTimerId) clearInterval(bossTimerId);
        bossTimerId = setInterval(bossTimerTick, 100);
    } else {
        document.getElementById('boss-timer-container').style.display = 'none';
        if (bossTimerId) {
            clearInterval(bossTimerId);
            bossTimerId = null;
        }
    }

    // 1. HUD & Visual Prep
    const HUD_TOOL_BAR = document.getElementById('tool-bar');
    const HUD_RESOURCE_BAR = document.getElementById('action-area');
    if (HUD_TOOL_BAR) HUD_TOOL_BAR.style.display = 'flex';
    if (HUD_RESOURCE_BAR) HUD_RESOURCE_BAR.style.display = 'flex';
    if (WORD_INPUT) {
        WORD_INPUT.style.display = 'block';
        WORD_INPUT.style.opacity = (bossActive && currentBossType === 'blind') ? '0' : '1';
        WORD_INPUT.disabled = false;
        WORD_INPUT.focus();
    }
    if (definitionMesh) definitionMesh.visible = bossActive ? false : showDefinition;

    // 2. Setup Word Bricks
    const isSilentBoss = bossActive && currentBossType === 'silent';
    setupWordBricks(word, null, isSilentBoss);

    // 3. Apply Passive Item Effects (Dictionary, Thesaurus, Spells)
    applyChallengeEffects();

    updateUI();
}

function applyChallengeEffects() {
    const stats = items.getTotalStats();
    const word = challenger.currentWordData.word;

    // 1. Roll for item spells
    activeSpells = items.getTriggeredSpells();
    if (activeSpells.length > 0) {
        if (spellTimeoutId) clearTimeout(spellTimeoutId);
        spellTimeoutId = setTimeout(() => {
            activeSpells.forEach(spellType => {
                let targetBrick = null;
                if (spellType === 'first') {
                    targetBrick = wordBricks[0];
                    showToast("SPELL: Foresight!");
                } else if (spellType === 'last') {
                    targetBrick = wordBricks[wordBricks.length - 1];
                    showToast("SPELL: Conclusion!");
                } else if (spellType === 'random') {
                    const hidden = wordBricks.filter(b => !b.userData.revealed);
                    if (hidden.length > 0) {
                        targetBrick = hidden[Math.floor(Math.random() * hidden.length)];
                        showToast("SPELL: Chaos!");
                    }
                } else if (spellType === 'double') {
                    let foundDouble = false;
                    for (let i = 0; i < word.length - 1; i++) {
                        if (word.slice(i, i + 2).toLowerCase() === word[i].toLowerCase().repeat(2)) {
                            const b1 = wordBricks[i];
                            const b2 = wordBricks[i + 1];
                            if (!b1.userData.revealed) revealBrick(b1, true);
                            if (!b2.userData.revealed) revealBrick(b2, true);
                            foundDouble = true;
                        }
                    }
                    if (foundDouble) showToast("SPELL: Echoes!");
                    else {
                        const hidden = wordBricks.filter(b => !b.userData.revealed);
                        if (hidden.length > 0) {
                            targetBrick = hidden[Math.floor(Math.random() * hidden.length)];
                            showToast("SPELL: Echoes (Chaos Fallback)!");
                        }
                    }
                } else if (spellType === 'telepathy') {
                    const allSynonyms = (challenger.currentWordData.synonyms || []).map(s => s.toUpperCase());
                    if (allSynonyms.length > 0) {
                        const nextSyn = allSynonyms[Math.floor(Math.random() * allSynonyms.length)];
                        if (!revealedSynonyms.includes(nextSyn)) {
                            revealedSynonyms.push(nextSyn);
                            displaySynonyms(revealedSynonyms);
                            // showToast("ITEM: Thesaurus revealed a synonym!");
                        }
                    }
                }
                if (targetBrick && !targetBrick.userData.revealed) revealBrick(targetBrick, true);
            });
            activeSpells = [];
            spellTimeoutId = null;
            checkWordSolved();
        }, 600);
    }

    // 2. Dictionary / Origin reveal
    if (Math.random() * 100 < (stats.origin_chance || 0)) {
        const origin = challenger.currentWordData.origin;
        if (origin) displayOrigin(origin);
    }
}

function updateUI() {
    challenger.getClue();

    const effectiveMode = challenger.currentMode;
    const isSilentBoss = (bossActive && currentBossType === 'silent');

    const showHearBtn = (effectiveMode === ChallengeMode.RANDOM ||
        effectiveMode === ChallengeMode.ADVENTURE ||
        effectiveMode === ChallengeMode.BOSSRUSH ||
        effectiveMode === ChallengeMode.PUZZLE) && !isSilentBoss;
    if (HEAR_BTN) HEAR_BTN.style.display = (showHearBtn && !isChestRoom && !isShopRoom && !isTransitioning) ? 'block' : 'none';
    if (SKIP_CHEST_BTN) {
        const isPuzzleMode = (effectiveMode === ChallengeMode.PUZZLE);
        SKIP_CHEST_BTN.style.display = (isChestRoom && !isTransitioning && !isPuzzleMode) ? 'block' : 'none';
    }
    if (LEAVE_SHOP_BTN) LEAVE_SHOP_BTN.style.display = 'none';
    if (HUD_LEAVE_SHOP_BTN) HUD_LEAVE_SHOP_BTN.style.display = (isShopRoom && !isTransitioning) ? 'block' : 'none';

    const isPlaying = (currentState === GameState.PLAYING && !isTransitioning);
    if (WORD_INPUT) WORD_INPUT.style.display = (isPlaying && !isShopRoom) ? 'block' : 'none';

    const dungeonMetrics = document.getElementById('dungeon-metrics');
    if (dungeonMetrics) {
        if (currentState === GameState.PLAYING) {
            dungeonMetrics.style.display = 'flex';
            const rMetric = document.getElementById('room-metric');
            const lMetric = document.getElementById('level-metric');
            if (rMetric) rMetric.textContent = `Room ${currentRoom}`;
            if (lMetric) {
                const currentLevel = Math.floor((currentRoom - 1) / 10) + 1;
                lMetric.textContent = `Dungeon Level ${currentLevel}`;
                lMetric.style.display = 'block';

                // Update damage metric
                const dMetric = document.getElementById('damage-metric');
                if (dMetric) {
                    const damageMultiplier = Math.floor((currentLevel - 1) / 2) + 1;
                    dMetric.textContent = `Mistake: ${damageMultiplier} DMG`;
                }
            }
        } else {
            dungeonMetrics.style.display = 'none';
        }
    }

    const stats = items.getTotalStats();
    const maxHP = baseMaxHealth + stats.hp;
    const maxInk = baseMaxInk + stats.ink;

    const hpVal = document.querySelector('#hp-val');
    const inkVal = document.querySelector('#ink-val');
    const hpFill = document.querySelector('#hp-fill');
    const inkFill = document.querySelector('#ink-fill');

    if (hpVal) hpVal.textContent = `${health}/${maxHP}`;
    if (inkVal) inkVal.textContent = `${ink}/${maxInk}`;

    const goldVal = document.querySelector('#gold-val');
    if (goldVal) goldVal.textContent = playerGold;

    if (hpFill) {
        const hpPercent = Math.max(0, Math.min(100, (health / maxHP) * 100));
        hpFill.style.height = `${hpPercent}%`;
        hpFill.style.setProperty('--hp-percent', hpPercent / 100);

        const hpAmpule = document.querySelector('#hp-ampule');
        if (hpAmpule) {
            // Scale is relative to the base 20 HP
            const hpScale = maxHP / 20;
            hpAmpule.style.setProperty('--hp-scale', hpScale);
        }
    }
    if (inkFill) inkFill.style.height = `${Math.max(0, Math.min(100, (ink / maxInk) * 100))}%`;

    const revealBtn = document.querySelector('#reveal-btn');
    if (revealBtn) revealBtn.disabled = (ink < 10);

    updateAbilityBar();
    updateBrickHighlighters();
}

function updateBrickHighlighters() {
    if (!items) return;
    const equippedUtensils = items.utensils.filter(it => it !== null);
    const hasVowelHighlight = equippedUtensils.some(it => it.name === "Vowel Highlighter");
    const hasConsonantHighlight = equippedUtensils.some(it => it.name === "Consonant Highlighter");

    wordBricks.forEach(brick => {
        if (!brick.userData || !brick.userData.letter) return;
        const char = brick.userData.letter.toUpperCase();
        const isVowel = "AEIOU".includes(char);
        const isConsonant = /^[B-DF-HJ-NP-TV-Z]$/.test(char);

        let targetMat = wordBrickMat;
        if (isVowel && hasVowelHighlight) {
            targetMat = vowelHighlightMat;
        } else if (isConsonant && hasConsonantHighlight) {
            targetMat = consonantHighlightMat;
        }

        if (brick.material !== targetMat) {
            brick.material = targetMat;
        }
    });
}

function getEquippedAbilities() {
    const stats = items.getTotalStats();
    if (!stats.spells || stats.spells.length === 0) return [];

    const spellCounts = {};
    const uniqueSpells = [];

    stats.spells.forEach(s => {
        const cleaned = s.toLowerCase().trim();
        if (cleaned === "healing magic") s = "Heal";
        if (!spellCounts[s]) {
            spellCounts[s] = 1;
            uniqueSpells.push(s);
        } else {
            spellCounts[s]++;
        }
    });

    return uniqueSpells.map(abilityName => {
        const level = spellCounts[abilityName];
        let baseCost = 5;
        const lowerName = abilityName.toLowerCase();
        if (lowerName === "reveal random" || lowerName === "chaos") baseCost = 6;
        else if (lowerName === "heal" || lowerName === "healing magic") baseCost = 10;
        else if (lowerName === "chisel") baseCost = 8;
        else if (lowerName === "scrape") baseCost = 7;
        else if (lowerName === "telepathy") baseCost = 5;
        else if (lowerName === "roulette") baseCost = 4;

        const costMultiplier = 1 + (level - 1) * 0.5;
        const finalCost = Math.ceil(baseCost * costMultiplier);

        return { name: abilityName, cost: finalCost, level };
    });
}

function updateAbilityBar() {
    const abilityBar = document.querySelector('#ability-bar');
    if (!abilityBar) return;
    abilityBar.innerHTML = '';

    const equippedAbilities = getEquippedAbilities();
    let hotkeyIndex = 2; // [1] is Reveal, so abilities start at [2]

    equippedAbilities.forEach(ability => {
        const btn = document.createElement('button');
        btn.className = 'tool-btn ability-btn';

        const isReady = ink >= ability.cost;
        const badge = hotkeyIndex <= 9 ? `<span class="hotkey-badge">${hotkeyIndex}</span>` : '';
        let displayName = ability.name.toUpperCase();
        if (displayName === "HEALING MAGIC") displayName = "HEAL";

        const levelLabel = ability.level > 1 ? ` L${ability.level}` : '';
        btn.innerHTML = `${badge}${displayName}${levelLabel} (${ability.cost})`;
        btn.disabled = !isReady;
        btn.onclick = () => {
            if (useAbility(ability.name, ability.cost, ability.level)) {
                updateUI();
                updateInventoryUI();
            }
        };
        abilityBar.appendChild(btn);
        hotkeyIndex++;
    });
}
function useAbility(name, cost, level = 1) {
    if (ink < cost) return false;

    const lowerName = name.toLowerCase();

    if (lowerName === "reveal random" || lowerName === "chaos") {
        let actualReveals = 0;
        for (let i = 0; i < level; i++) {
            const hiddenBricks = wordBricks.filter(b => !b.userData.revealed);
            if (hiddenBricks.length === 0) break;
            const target = hiddenBricks[Math.floor(Math.random() * hiddenBricks.length)];
            revealBrick(target, true);
            actualReveals++;
        }

        if (actualReveals === 0) {
            showToast("All letters revealed!");
            return false;
        }

        ink -= cost;
        createSpellBurst("#ffffff");
        const msg = level > 1 ? `REVEALED ${actualReveals} LETTERS (CHAOS L${level}!)` : "REVEALED RANDOM LETTER!";
        showToast(msg);
        checkWordSolved();
    } else if (lowerName === "heal" || lowerName === "healing magic") {
        const stats = items.getTotalStats();
        const maxHP = baseMaxHealth + stats.hp;
        if (health >= maxHP) {
            showToast("Eraser is already full!");
            return false;
        }
        ink -= cost;
        const healAmt = 5 * level;
        health = Math.min(maxHP, health + healAmt);
        showToast(level > 1 ? `HEALED ${healAmt} HP (LEVEL ${level}!)` : "HEALED!");
        createSpellBurst("#00ff00");
    } else if (lowerName === "chisel") {
        let actualReveals = 0;
        for (let i = 0; i < level; i++) {
            const hiddenBricks = wordBricks.filter(b => !b.userData.revealed);
            if (hiddenBricks.length === 0) break;
            const target = hiddenBricks[0];
            revealBrick(target, true);
            actualReveals++;
        }

        if (actualReveals === 0) {
            showToast("All letters revealed!");
            return false;
        }

        ink -= cost;
        createSpellBurst("#ffffff");
        const msg = level > 1 ? `CHISELED ${actualReveals} LETTERS (LEVEL ${level}!)` : "CHISELED LETTER!";
        showToast(msg);
        checkWordSolved();
    } else if (lowerName === "scrape") {
        let actualReveals = 0;
        for (let i = 0; i < level; i++) {
            const hiddenBricks = wordBricks.filter(b => !b.userData.revealed);
            if (hiddenBricks.length === 0) break;
            const target = hiddenBricks[hiddenBricks.length - 1];
            revealBrick(target, true);
            actualReveals++;
        }

        if (actualReveals === 0) {
            showToast("All letters revealed!");
            return false;
        }

        ink -= cost;
        createSpellBurst("#ffffff");
        const msg = level > 1 ? `SCRAPED ${actualReveals} LETTERS (LEVEL ${level}!)` : "SCRAPED LETTER!";
        showToast(msg);
        checkWordSolved();
    } else if (lowerName === "telepathy") {
        const allSynonyms = (challenger.currentWordData.synonyms || []).map(s => s.toUpperCase());
        const available = allSynonyms.filter(s => !revealedSynonyms.includes(s));

        if (available.length === 0) {
            showToast("Telepathy reveals nothing more...");
            return false;
        }

        ink -= cost;
        // Pick one new synonym
        const nextSynonym = available[Math.floor(Math.random() * available.length)];
        revealedSynonyms.push(nextSynonym);

        displaySynonyms(revealedSynonyms);
        createSpellBurst("#ffff00");
    } else if (lowerName === "roulette") {
        ink -= cost;
        performRoulette();
        // performRoulette handles its own toasts and checkWordSolved
    }

    if (WORD_INPUT) WORD_INPUT.focus();
    return true;
}

function displayOrigin(origin) {
    if (originMesh) {
        dungeonGroup.remove(originMesh);
        if (originMesh.geometry) originMesh.geometry.dispose();
        if (originMesh.material) originMesh.material.dispose();
        originMesh = null;
    }
    const absRoomCenterZ = 2.5 - (currentRoom - 1) * 15;
    const zOffsetForTip = (typeof TUTORIAL_TIPS !== 'undefined' && TUTORIAL_TIPS[currentRoom]) ? -2.0 : 0;

    // In Puzzle Chest rooms, the player faces the Right Wall (+X)
    const xPos = isPuzzleChest ? 4.5 : -4.5;
    const xOffset = isPuzzleChest ? -0.55 : 0.55;

    const geo = new THREE.PlaneGeometry(3.5, 0.68);
    const mat = new THREE.MeshBasicMaterial({
        map: getWrappedTextTexture(origin, "#ff9900", true, 64, 1024, 128),
        transparent: true,
        side: THREE.DoubleSide
    });
    originMesh = new THREE.Mesh(geo, mat);
    // Centered above the definition but shifted slightly to make room for synonyms
    // Shifted 2.0 units to the right (-Z) in puzzle chest rooms
    const zPos = absRoomCenterZ + zOffsetForTip + 1.5 + (isPuzzleChest ? -2.0 : 0);
    originMesh.position.set(xPos + xOffset, 2.0, zPos);
    originMesh.rotation.y = isPuzzleChest ? -Math.PI / 2 : Math.PI / 2;
    dungeonGroup.add(originMesh);
}

function displaySynonyms(words) {
    // Cleanup old ones first
    synonymMeshes.forEach(m => {
        dungeonGroup.remove(m);
        if (m.geometry) m.geometry.dispose();
        if (m.material) m.material.dispose();
    });
    synonymMeshes = [];

    const absRoomCenterZ = 2.5 - (currentRoom - 1) * 15;
    const zOffsetForTip = (typeof TUTORIAL_TIPS !== 'undefined' && TUTORIAL_TIPS[currentRoom]) ? -2.0 : 0;

    // In Puzzle Chest rooms, the player faces the Right Wall (+X)
    const xPos = isPuzzleChest ? 4.5 : -4.5;
    const xOffset = isPuzzleChest ? -0.55 : 0.55;

    words.forEach((w, i) => {
        const geo = new THREE.PlaneGeometry(3.5, 0.51);
        const mat = new THREE.MeshBasicMaterial({
            map: getWrappedTextTexture(`"${w}"`, "#00ffcc", true, 60, 1024, 128),
            transparent: true,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Positioned next to the origin display (Right side)
        // Shifted 2.0 units to the right (-Z) in puzzle chest rooms
        const zPos = absRoomCenterZ + zOffsetForTip - 1.5 + (isPuzzleChest ? -2.0 : 0);
        mesh.position.set(xPos + xOffset, 2.0 - i * 0.7, zPos);
        mesh.rotation.y = isPuzzleChest ? -Math.PI / 2 : Math.PI / 2;
        dungeonGroup.add(mesh);
        synonymMeshes.push(mesh);
    });
}

function useConsumable(item) {
    if (!item) return false;
    const lowerName = item.name.toLowerCase();

    if (lowerName.includes('eraser refill')) {
        const stats = items.getTotalStats();
        const maxHP = baseMaxHealth + stats.hp;
        if (health >= maxHP) {
            showToast("Eraser is already full!");
            return false;
        }
        health = Math.min(maxHP, health + 10);
        showToast("USED ERASER REFILL: +10 HP!");
        createSpellBurst("#00ff00");
    } else if (lowerName.includes('ink refill')) {
        const stats = items.getTotalStats();
        const maxInk = baseMaxInk + stats.ink;
        if (ink >= maxInk) {
            showToast("Ink is already full!");
            return false;
        }
        ink = Math.min(maxInk, ink + 10);
        showToast("USED INK REFILL: +10 INK!");
        createSpellBurst("#00d4ff");
    } else if (lowerName.includes('lockpick') || lowerName.includes('lock picks')) {
        lockpickConsumableBonus += 2;
        if (isChestRoom && isPuzzleChest) {
            const wasEmpty = (puzzleMistakesLeft <= 0);
            puzzleMistakesLeft += 2;
            updatePuzzleGraveyard();

            if (wasEmpty) {
                // Restore Keyboard & Letter-guessing mode
                const keyboard = document.getElementById('puzzle-keyboard');
                if (keyboard) {
                    keyboard.style.display = 'grid';
                    WORD_INPUT.value = '';
                    showToast("RECOVERED: Keyboard restored! (+2 Picks)");
                }
            } else {
                showToast("USED LOCK PICKS: +2 Attempts!");
            }
        } else {
            showToast("USED LOCK PICKS: +2 bonus attempts for your next chest!");
        }
        createSpellBurst("#ffaa00");
    } else {
        return false;
    }

    items.removeItem(item);
    return true;
}




function checkWordSolved() {
    if (isTransitioning) return; // Already solved or moving
    // For Obscured boss, we ignore the trailing placeholder bricks (spaces)
    if (wordBricks.every(b => b.userData.revealed || b.userData.letter === " ")) {
        isTransitioning = true; // LOCK INPUT IMMEDIATELY for this room

        if (isChestRoom) {
            // Hide puzzle keyboard immediately if it's a puzzle chest
            const keyboard = document.getElementById('puzzle-keyboard');
            if (keyboard) keyboard.style.display = 'none';

            showToast("LOCK OPENS!");
            createSpellBurst("#00ff00");

            // Disable input immediately to prevent double-submit lag
            WORD_INPUT.value = '';
            WORD_INPUT.disabled = true;

            // Turn to look at chest before opening
            animateCamera(null, -Math.PI * 0.75, 450, () => {
                if (chestMesh && chestMesh.userData.open) {
                    chestMesh.userData.open();
                    const nextRoomNum = currentRoom + 1;
                    const nextAbsZ = 10 - (nextRoomNum - 1) * 15;
                    dropLoot(true, nextRoomNum, nextAbsZ - 4); // Reward in Room Ahead

                    // Final success transition after lid has time to actually animate
                    setTimeout(() => {
                        onSuccess();
                    }, 1200);
                } else {
                    onSuccess();
                }
            });
        } else {
            // Normal room completion
            setTimeout(onSuccess, 500);
        }
    }
}

function onSuccess(fastTrack = false, isFail = false) {
    // Permissive guard: allow the transition to enter if we haven't actually hidden the UI yet (meaning it's the first call)
    if (isTransitioning && !fastTrack && document.getElementById('tool-bar').style.display === 'none') return;

    isTransitioning = true;
    isPuzzleChest = false;
    let evolutionHappened = false;

    if (bossTimerId) { clearInterval(bossTimerId); bossTimerId = null; }

    score++;
    applyRegen();

    if (!isFail) {
        // Diary/Manuscript tracking & transformation
        const hasDiary = items.hasItem("Diary");
        const hasManuscript = items.hasItem("Manuscript");
        if (hasDiary || hasManuscript) {
            if (typeof activeProfile !== 'undefined') {
                // Persistent Progress increment
                activeProfile.diaryWordCount = (activeProfile.diaryWordCount || 0) + 1;
                const dwc = activeProfile.diaryWordCount;

                console.log(`Word Recorded: ${dwc} for Diary/Manuscript progression.`);

                // UNLOCK: Puzzle Mode at 20 words (matching new Manuscript threshold)
                if (dwc === 20 && !activeProfile.puzzleModeUnlocked) {
                    activeProfile.puzzleModeUnlocked = true;
                    showToast("PUZZLE MODE UNLOCKED!");
                }

                // Evolution logic: only one per room
                if (hasDiary && dwc >= 20 && !hasManuscript) {
                    transformDiaryToManuscript();
                    evolutionHappened = true;
                    triggerEvolutionEffect("DIARY", "MANUSCRIPT", "20 Words Spelled • Puzzle Mode Unlocked!", () => {
                        if (bossActive && bossWordsCompleted < bossTargetWords) {
                            // Resume boss fight
                            clearWordMeshes();
                            WORD_INPUT.value = '';
                            startNewChallenge();
                        } else {
                            startTransition();
                        }
                    });
                }
                else if (hasManuscript && dwc >= 50 && !items.hasItem("Memoir")) {
                    transformManuscriptToMemoir();
                    activeProfile.bossRushUnlocked = true;
                    evolutionHappened = true;
                    triggerEvolutionEffect("MANUSCRIPT", "MEMOIR", "50 Words Spelled • Boss Rush Unlocked!", () => {
                        if (bossActive && bossWordsCompleted < bossTargetWords) {
                            // Resume boss fight
                            clearWordMeshes();
                            WORD_INPUT.value = '';
                            startNewChallenge();
                        } else {
                            startTransition();
                        }
                    });
                }
                ProfileManager.saveActiveProfile(activeProfile);
            }
        }

        // Notebook tracking
        if (!isChestRoom) {
            if (items.hasItemNamed("Pocket Notebook") || items.hasItemNamed("Notebook")) {
                items.notebook_word_count++;
                if (items.notebook_word_count > 0 && items.notebook_word_count % 5 === 0) {
                    applyNotebookBonuses();
                }
            }
        }

        // UNIVERSAL WORD TRACKING: Record successful completion for exclusion history
        const targetWord = (challenger.currentWordData ? challenger.currentWordData.word : "???").toUpperCase();
        activeProfile = ProfileManager.getActiveProfile();
        if (activeProfile && targetWord !== "???") {
            if (!activeProfile.spelledWords) activeProfile.spelledWords = [];
            if (!activeProfile.spelledWords.includes(targetWord)) {
                activeProfile.spelledWords.push(targetWord);
                activeProfile.totalWords = activeProfile.spelledWords.length;
                ProfileManager.saveActiveProfile(activeProfile);
            }
        }
    }

    // Apply Item-based Gold Bonuses (General stat handling)
    const currentStats = items.getTotalStats();
    if (currentStats.gold_per_word > 0) {
        playerGold += currentStats.gold_per_word;
        createRisingText(`+${currentStats.gold_per_word} GOLD`, "#ffcc00", "gold-ui");
    }

    updateUI();



    if (bossActive) {
        bossWordsCompleted++;
        if (bossWordsCompleted < bossTargetWords) {
            createSpellBurst(MageConfig.spellColor);

            if (!evolutionHappened) {
                setTimeout(() => {
                    clearWordMeshes(); // Clear old word and definition AFTER reflection delay
                    WORD_INPUT.value = '';
                    // Start next boss word
                    startNewChallenge();
                }, 2500); // 2.5s delay for reflection
            }
            return;
        } else {
            showToast("BOSS CLEARED!");
            bossActive = false;
            document.getElementById('boss-timer-container').style.display = 'none';

            // Graduate's Cap Roll
            if (items.hasItemNamed("Graduate's Cap")) {
                graduateCapRoll();
            }

            // Stage final rewards for the transition
            finalBossRewardPending = true;
            updateUI();
        }
    }

    // Re-lock input if we were just in a state that unlocked it
    WORD_INPUT.disabled = true;
    isTransitioning = true;

    roomProgress++;

    const stats = items.getTotalStats();
    const maxInk = baseMaxInk + stats.ink;
    ink = Math.min(maxInk, ink); // No more reward, just cap check if needed

    saveGameData(); // Ensure rewards and progress are persisted to profile run state

    createSpellBurst(MageConfig.spellColor);

    mainLight.intensity = 25;
    setTimeout(() => mainLight.intensity = 15, 150);

    WORD_INPUT.disabled = true;
    WORD_INPUT.value = '';

    const startTransition = () => {
        collectAllRoomCoins(); // Collect gold before head turn for performance and visual clarity
        console.log("onSuccess: Starting transition sequence (turn forward)");

        // HIDE HUD during transition
        const TOOL_BAR = document.getElementById('tool-bar');
        const RESOURCE_BAR = document.getElementById('action-area');
        if (TOOL_BAR) TOOL_BAR.style.display = 'none';
        if (RESOURCE_BAR) RESOURCE_BAR.style.display = 'none';
        if (HEAR_BTN) HEAR_BTN.style.display = 'none';
        if (SKIP_CHEST_BTN) SKIP_CHEST_BTN.style.display = 'none';
        WORD_INPUT.style.display = 'none';
        const PUZZLE_KEYBOARD = document.getElementById('puzzle-keyboard');
        if (PUZZLE_KEYBOARD) PUZZLE_KEYBOARD.style.display = 'none';

        // Save current door reference before spawnRoom overwrites it
        const currentDoor = dungeonDoor;
        const startZ = camera.position.z;

        // PRE-LOAD NEXT ROOM: absolute coordinate alignment
        const nextRoomNum = currentRoom + 1;
        const nextAbsZ = 10 - (nextRoomNum - 1) * 15;
        spawnRoom(nextAbsZ, nextRoomNum);

        // TRIGGER REWARDS in the next room's path
        const rewardZ = nextAbsZ - 4; // Spawn rewards 4m into the next room
        if (!isFail && !isChestRoom && !bossActive) {
            // Rummage is handled via physical item spawning logic inside createRoom
        }
        if (finalBossRewardPending) {
            playerGold += 25;
            updateUI();
            saveGameData();
            showToast(`BOSS DEFEATED: Found 25 gold!`, 4000);
            finalBossRewardPending = false;
        }

        // Force compile/render to GPU synchronously
        renderer.render(scene, camera);

        // Turn forward
        animateCamera(null, 0, 800, () => {
            console.log("onSuccess: Camera animation done, opening door...");

            // Clean up shop if we just left it
            if (isShopRoom && shopGroup) {
                dungeonGroup.remove(shopGroup);
                shopGroup = null;
                isShopRoom = false;
            }

            slideDoorOpen(currentDoor);
            transitionSkinAtmosphere(2000); // Blend atmosphere over the glide

            // Delay the glide so the door opens first, avoiding the illusion of passing through it
            setTimeout(() => {
                const finalGoalZ = 2.5 - (nextRoomNum - 1) * 15;
                animateCamera(new THREE.Vector3(0, 2, finalGoalZ), null, 2000, () => {
                    console.log("onSuccess: Continuous glide done, completing room...");
                    clearMCQWall();
                    completeRoom();
                    enterRoomSequence(true); // skipWalk = true
                });
            }, 600); // Wait 600ms before moving forward
        });
    };

    if (fastTrack) {
        startTransition();
    } else {
        // If an evolution is showing, it will call startTransition when done.
        // Otherwise, move forward after a reflection delay.
        if (typeof evolutionHappened !== 'undefined' && evolutionHappened) {
            console.log("onSuccess: Evolution detected, waiting for user...");
        } else {
            // Increased from 800ms to 1800ms for reflection time (+1.0s)
            setTimeout(startTransition, 1800);
        }
    }
}

/**
 * Reusable damage function to apply penalties consistently
 * @param {number} mistakesCount Number of incorrect/missing characters
 */
function applyDamageFromMistakes(mistakesCount) {
    if (mistakesCount <= 0) return;

    createSpellBurst("#ff0000"); // Red burst for errors
    const currentLvl = Math.max(1, Math.ceil(currentRoom / 10));
    const damageMultiplier = Math.floor((currentLvl - 1) / 2) + 1;
    let damage = mistakesCount * damageMultiplier;

    const stats = items.getTotalStats();
    const totalArmor = stats.armor || 0;
    if (totalArmor > 0) {
        damage = Math.max(1, damage - totalArmor);
        if (damage < mistakesCount * damageMultiplier) {
            showToast(`Armor blocked ${(mistakesCount * damageMultiplier) - damage} DMG!`);
        }
    }

    health = Math.max(0, health - damage);

    // Spellonomicon logic
    if (damage > 0 && items.hasItem("Spellonomicon")) {
        updateSpellonomicon(damage);
    }

    console.log(`[COMBAT] Damage applied: ${damage}. newHealth: ${health}`);
    updateUI();
    saveGameData();
    if (health <= 0) gameOver();
}

function updateSpellonomicon(damage) {
    items.spellonomicon_dmg_count = (items.spellonomicon_dmg_count || 0) + damage;
    const spelloItem = items.getItemNamed("Spellonomicon");
    if (!spelloItem) return;

    let upgraded = false;
    while (items.spellonomicon_dmg_count >= 10) {
        items.spellonomicon_dmg_count -= 10;
        // Apply bonuses DIRECTLY to the item instance stats
        spelloItem.stats.armor = (spelloItem.stats.armor || 0) + 1;
        spelloItem.stats.hp = (spelloItem.stats.hp || 0) - 1;
        upgraded = true;
    }
    if (upgraded) {
        showToast("SPELLONOMICON: +1 ARMOR, -1 MAX HP!");
        createSpellBurst("#ff00ff");
        const newStats = items.getTotalStats();
        const newMaxHP = baseMaxHealth + newStats.hp;
        if (health > newMaxHP) health = newMaxHP;
    }
}

function transformDiaryToManuscript() {
    const diary = items.getItemNamed("Diary");
    if (diary) {
        diary.name = "Manuscript";
        const manuscriptData = items.allItems.find(it => it.name === "Manuscript");
        if (manuscriptData) {
            diary.stats = { ...manuscriptData.stats };
            diary.stats_raw = manuscriptData.stats_raw;
            diary.description = manuscriptData.description;
        }
        createSpellBurst("#ffff00");
        updateInventoryUI();
    }
}

function transformManuscriptToMemoir() {
    const manuscript = items.getItemNamed("Manuscript");
    if (manuscript) {
        manuscript.name = "Memoir";
        const memoirData = items.allItems.find(it => it.name === "Memoir");
        if (memoirData) {
            manuscript.stats = { ...memoirData.stats };
            manuscript.stats_raw = memoirData.stats_raw;
            manuscript.description = memoirData.description;
        }
        createSpellBurst("#ffff00");
        updateInventoryUI();
    }
}

function applyNotebookBonuses() {
    const allItems = [items.hat, ...items.utensils, ...items.storage].filter(i => i !== null);

    const possibleStats = [
        "random_letter_chance",
        "first_letter_chance",
        "last_letter_chance",
        "telepathy",
        "origin_chance",
        "rummage",
        "cascade",
        "time_warp",
        "double_letter_chance",
        "glow",
        "shop_discount",
        "lockpick"
    ];

    let pocketCount = 0;
    let bigCount = 0;

    allItems.forEach(item => {
        if (!item.stats) item.stats = {};

        if (item.name === "Pocket Notebook") {
            const stat = possibleStats[Math.floor(Math.random() * possibleStats.length)];
            item.stats[stat] = (item.stats[stat] || 0) + 1;
            pocketCount++;
        }
        if (item.name === "Notebook") {
            const stat = possibleStats[Math.floor(Math.random() * possibleStats.length)];
            item.stats[stat] = (item.stats[stat] || 0) + 2;
            bigCount++;
        }
    });

    if (pocketCount > 0) {
        showToast("POCKET NOTEBOOKS: Stats Improved!", 3000);
        createSpellBurst("#00ffcc");
    }
    if (bigCount > 0) {
        showToast("NOTEBOOKS: +2 to random stats!", 4000);
        createSpellBurst("#ffff00");
    }

    updateUI();
    saveGameData();
}

function applyRegen() {
    const stats = items.getTotalStats();
    const maxHP = baseMaxHealth + stats.hp;
    const maxInk = baseMaxInk + stats.ink;

    // Regeneration values already include inherent +1 from stats
    const totalHPRegen = (stats.hp_regen || 0);
    const totalInkRegen = (stats.ink_regen || 0);

    health = Math.min(maxHP, health + totalHPRegen);
    createRisingText(`+${totalHPRegen}`, "#ff4444", "hp-ampule");

    ink = Math.min(maxInk, ink + totalInkRegen);
    createRisingText(`+${totalInkRegen}`, "#00d4ff", "ink-ampule");

    // Update UI immediately when regeneration occurs
    updateUI();
}

function slideDoorOpen(door = dungeonDoor) {
    if (!door) return;
    const startY = door.position.y;
    const targetY = startY + 5; // Move more to clear the taller hole
    const duration = 1000; // Slightly slower for better feel
    const startTime = Date.now();
    function update() {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const ease = progress * progress * (3 - 2 * progress); // smoothstep
        door.position.y = startY + (targetY - startY) * ease;
        if (progress < 1) requestAnimationFrame(update);
    }
    update();
}

function graduateCapRoll() {
    activeProfile = ProfileManager.getActiveProfile();
    if (!activeProfile) return;
    if (!activeProfile.graduateCapStats) activeProfile.graduateCapStats = {};

    const options = [
        { key: 'hp', name: 'Max HP', val: 1 },
        { key: 'ink', name: 'Max Ink', val: 1 },
        { key: 'random_letter_chance', name: 'Chaos', val: 1 },
        { key: 'first_letter_chance', name: 'Foresight', val: 1 },
        { key: 'last_letter_chance', name: 'Conclusion', val: 1 },
        { key: 'glow', name: 'Glow', val: 1 },
        { key: 'double_letter_chance', name: 'Echo', val: 1 }
    ];

    const pick = options[Math.floor(Math.random() * options.length)];
    activeProfile.graduateCapStats[pick.key] = (activeProfile.graduateCapStats[pick.key] || 0) + pick.val;

    ProfileManager.saveActiveProfile(activeProfile);

    // Visual feedback
    showToast(`GRADUATE'S CAP LEVELED: +${pick.val}${pick.val === 1 && pick.name.length > 5 ? '' : '%'} ${pick.name}!`, 5000);
    createSpellBurst("#ffffff"); // White sparkle for the cap
}

// Removed unused notebookRoll function to prevent confusion with applyNotebookBonuses

function completeRoom() {
    console.log(`completeRoom: Advancing from room ${currentRoom}`);

    // PRECISION CLEANUP: Remove rooms older than N-1
    // We keep 'currentRoom' and 'currentRoom - 1' for visual continuity
    const itemsToRemove = [];
    dungeonGroup.children.forEach(child => {
        if (child.userData.roomNumber !== undefined && child.userData.roomNumber < currentRoom - 1) {
            itemsToRemove.push(child);
        }
    });

    if (itemsToRemove.length > 0) {
        console.log(`completeRoom: Purging ${itemsToRemove.length} stale scene objects (Room < ${currentRoom - 1})`);
        itemsToRemove.forEach(item => {
            dungeonGroup.remove(item);
            disposeHierarchy(item);
        });

        // Prune flickering lights array
        candleLights = candleLights.filter(c => {
            if (c.group && c.group.userData.roomNumber !== undefined) {
                return c.group.userData.roomNumber >= currentRoom - 1;
            }
            return true;
        });
    }

    if (chestMesh) {
        dungeonGroup.remove(chestMesh);
        chestMesh = null;
    }
    if (puzzleGraveyardMesh) {
        dungeonGroup.remove(puzzleGraveyardMesh);
        disposeHierarchy(puzzleGraveyardMesh);
        puzzleGraveyardMesh = null;
    }
    const keyboard = document.getElementById('puzzle-keyboard');
    if (keyboard) {
        keyboard.style.display = 'none';
        keyboard.innerHTML = '';
    }
    // Apply interest passive
    const stats = items.getTotalStats();
    if (stats.interest && playerGold > 0) {
        const rawInterest = playerGold * (stats.interest / 100);

        // Probabilistic Rounding (e.g., 1.5 gold = 1 gold with 50% chance, 2 gold with 50% chance)
        let interestAmount = Math.floor(rawInterest);
        if (Math.random() < (rawInterest - interestAmount)) {
            interestAmount += 1;
        }

        if (interestAmount > 0) {
            playerGold += interestAmount;
            createRisingText(`🪙 +${interestAmount}`, "#ffcc00", "gold-ui");
            updateUI();
        }
    }

    currentRoom++;
    roomProgress = 0;
    currentRoomRoll = null; // Clear it for the new room
    shopRoomItems = null; // Clear persistent shop stock for the next visit
    library.currentTier = Math.ceil(currentRoom / 10);
    saveGameData(); // <--- CRITICAL: Save the room increment BEFORE the next room logic runs

    // Skin atmosphere is applied by applyRoomSkin() in spawnRoom()
}

function showChestRoom() {
    isTransitioning = true;
    isChestRoom = true;
    const localStats = items.getTotalStats();
    chestAttempts = 3 + (localStats.lockpick || 0);
    const TOOL_BAR = document.getElementById('tool-bar');
    const RESOURCE_BAR = document.getElementById('action-area');

    // Turn RIGHT for Chest
    animateCamera(null, -Math.PI / 2, 800, () => {
        isTransitioning = false; // Allow input after arrival
        if (TOOL_BAR) TOOL_BAR.style.display = 'flex';
        if (RESOURCE_BAR) RESOURCE_BAR.style.display = 'flex';
        if (SKIP_CHEST_BTN) SKIP_CHEST_BTN.style.display = 'block';
        WORD_INPUT.style.display = 'block';
        WORD_INPUT.disabled = false;
        WORD_INPUT.focus();

        const currentLevel = Math.max(1, Math.min(10, Math.ceil(currentRoom / 5)));
        const excludeList = (activeProfile && activeProfile.spelledWords) ? activeProfile.spelledWords : [];
        challenger.generateNewChallenge(currentLevel, excludeList);
        const word = challenger.currentWordData.word;

        // Setup challenge - SILENT (clues only)
        setupWordBricks(word, 4.5, true, null);
        applyChallengeEffects();

        // Position chest on the wall at the absolute center
        if (chestMesh) dungeonGroup.remove(chestMesh);
        const absZCenter = 2.5 - (currentRoom - 1) * 15;
        // Shifted right (+2.5 Z) relative to center
        if (Math.random() < 0.5) {
            chestMesh = createNewChest(3.5, 0, absZCenter + 2.5);
        } else {
            chestMesh = createOldChest(3.5, 0, absZCenter + 2.5);
        }

        // Blackboard logic moved to Puzzle Chest Rooms
        showToast("TREASURE CHEST! 3 ATTEMPTS");
    });
}

// Puzzle Chest State
let isPuzzleChest = false;
let puzzleMistakesLeft = 0;
let puzzleIncorrectLetters = [];
let puzzleGraveyardMesh = null;

function updatePuzzleGraveyard() {
    if (puzzleGraveyardMesh) {
        dungeonGroup.remove(puzzleGraveyardMesh);
        disposeHierarchy(puzzleGraveyardMesh);
    }

    // Always show mistakes count if it's a puzzle chest
    const wrongChars = puzzleIncorrectLetters.length > 0 ? "WRONG: " + puzzleIncorrectLetters.join(" ") : "";
    const statusText = `MISTAKES LEFT: ${puzzleMistakesLeft}`;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    // Clear background (completely transparent)
    ctx.clearRect(0, 0, 512, 160);

    ctx.font = "bold 50px 'Courier New', Courier, monospace";
    ctx.fillStyle = "#ffcc00"; // Gold for counter
    ctx.textAlign = "center";
    ctx.fillText(statusText, 256, 60);

    if (wrongChars) {
        ctx.font = "bold 40px 'Courier New', Courier, monospace";
        ctx.fillStyle = "#ff5555"; // Red for wrong letters
        ctx.fillText(wrongChars, 256, 120);
    }

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(3, 1.0);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    puzzleGraveyardMesh = new THREE.Mesh(geo, mat);

    const absZCenter = 2.5 - (currentRoom - 1) * 15;
    puzzleGraveyardMesh.position.set(4.4, 2.2, absZCenter + 2.5); // Moved down 1 unit (from 3.2 to 2.2)
    puzzleGraveyardMesh.rotation.y = -Math.PI / 2;
    dungeonGroup.add(puzzleGraveyardMesh);
}

function showPuzzleChestRoom() {
    isTransitioning = true;
    isChestRoom = true;
    isPuzzleChest = true;
    console.log("%c [ROOM TYPE] Room " + currentRoom + ": MYSTIC PUZZLE CHEST", "color: #00ff00; font-weight: bold; font-size: 1.2rem;");
    saveGameData(); // Persist puzzle chest state

    // Turn RIGHT for Chest
    animateCamera(null, -Math.PI / 2, 800, () => {
        isTransitioning = false;
        puzzleIncorrectLetters = [];
        const localStats = items.getTotalStats();
        puzzleMistakesLeft = (localStats.lockpick || 0) + lockpickConsumableBonus;
        lockpickConsumableBonus = 0; // Consumption used

        const currentLevel = Math.max(1, Math.min(10, Math.ceil(currentRoom / 5)));
        const excludeList = (activeProfile && activeProfile.spelledWords) ? activeProfile.spelledWords : [];
        challenger.generateNewChallenge(currentLevel, excludeList);
        const word = challenger.currentWordData.word;
        setupWordBricks(word, 4.5, true, null);
        applyChallengeEffects();

        // Keyboard Generate
        const keyboard = document.getElementById('puzzle-keyboard');
        if (keyboard) {
            keyboard.innerHTML = '';
            keyboard.style.display = 'grid';
            const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
            alphabet.forEach(char => {
                const btn = document.createElement('button');
                btn.className = 'puzzle-key';
                btn.textContent = char;
                btn.dataset.key = char;
                btn.onclick = () => {
                    handleChestGuess(char, challenger.currentWordData.word.toUpperCase());
                };
                keyboard.appendChild(btn);
            });
        }

        const TOOL_BAR = document.getElementById('tool-bar');
        const RESOURCE_BAR = document.getElementById('action-area');
        if (TOOL_BAR) TOOL_BAR.style.display = 'flex';
        if (RESOURCE_BAR) RESOURCE_BAR.style.display = 'flex';
        if (SKIP_CHEST_BTN) SKIP_CHEST_BTN.style.display = 'block';

        // Position chest on the wall at the absolute center
        if (chestMesh) dungeonGroup.remove(chestMesh);
        const absZCenter = 2.5 - (currentRoom - 1) * 15;
        const chestRoll = Math.random();

        if (chestRoll < 0.33) {
            chestMesh = createFancyChest(3.5, 0, absZCenter + 2.5);
        } else if (chestRoll < 0.66) {
            chestMesh = createNewChest(3.5, 0, absZCenter + 2.5);
        } else {
            chestMesh = createOldChest(3.5, 0, absZCenter + 2.5);
        }

        // Forced Room 7 Blackboard Tutorial
        if (currentRoom === 7) {
            const boardZ = absZCenter - 5.8;
            const blackboardGroup = new THREE.Group();
            blackboardGroup.position.set(4.45, 2.5, boardZ);
            blackboardGroup.rotation.y = -Math.PI / 2;

            const frameMat = new THREE.MeshLambertMaterial({ color: 0x4d3319 });
            const thickness = 0.12, width = 1.8, height = 3.15;

            const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width + thickness, thickness, thickness), frameMat);
            topFrame.position.y = height / 2 + thickness / 2;
            blackboardGroup.add(topFrame);
            const bottomLedge = new THREE.Mesh(new THREE.BoxGeometry(width + thickness, thickness, thickness * 2.5), frameMat);
            bottomLedge.position.y = -(height / 2 + thickness / 2);
            bottomLedge.position.z = thickness * 0.75;
            blackboardGroup.add(bottomLedge);
            const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, thickness), frameMat);
            leftFrame.position.x = -(width / 2 + thickness / 2);
            blackboardGroup.add(leftFrame);
            const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, thickness), frameMat);
            rightFrame.position.x = width / 2 + thickness / 2;
            blackboardGroup.add(rightFrame);

            const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshLambertMaterial({ color: 0x222222 }));
            blackboardGroup.add(boardMesh);

            const msg = "Guess letters to reveal the word. Each wrong letter breaks a lockpick. Out of picks? You get one attempt to guess the word.";
            const textMat = new THREE.MeshBasicMaterial({
                map: getWrappedTextTexture(msg, "#ffffff", false, 55, 512, 896),
                transparent: true,
                side: THREE.FrontSide
            });
            const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), textMat);
            textMesh.position.z = 0.02;
            blackboardGroup.add(textMesh);
            blackboardGroup.userData.roomNum = currentRoom;
            dungeonGroup.add(blackboardGroup);
        }

        updatePuzzleGraveyard();
    });
}

function handleChestGuess(typed, target) {
    if (chestMesh && chestMesh.userData.rattle) chestMesh.userData.rattle();

    if (isPuzzleChest) {
        // --- PUZZLE CHEST (LOCKPICK) LOGIC ---
        if (typed.length === 1) {
            // --- PUZZLE CHEST (LOCKPICK) LOGIC ---
            // Single Letter Guess
            const char = typed[0].toUpperCase();

            // Mirror visual state on Virtual Keyboard
            const kbBtn = document.querySelector(`.puzzle-key[data-key="${char}"]`);
            if (kbBtn) kbBtn.classList.add('used');

            const letterBricks = wordBricks.filter(b => b.userData.letter === char);
            const allRevealed = letterBricks.length > 0 && letterBricks.every(b => b.userData.revealed);

            if (puzzleIncorrectLetters.includes(char) || allRevealed) {
                showToast("ALREADY GUESSED!");
                WORD_INPUT.value = '';
                return;
            }

            let found = false;
            wordBricks.forEach(brick => {
                if (brick.userData.letter === char) {
                    revealBrick(brick);
                    found = true;
                }
            });

            if (found) {
                createSpellBurst(MageConfig.spellColor);
            } else {
                puzzleIncorrectLetters.push(char);
                puzzleMistakesLeft--; // ONLY CONSUME ON ERROR
                showToast(`'${char}' NOT FOUND! (-1 Lockpick)`);
                createSpellBurst("#555555");

                // Shake the keyboard on error
                const keyboard = document.getElementById('puzzle-keyboard');
                if (keyboard) {
                    keyboard.classList.remove('shake');
                    void keyboard.offsetWidth;
                    keyboard.classList.add('shake');
                }
            }

            updatePuzzleGraveyard();
            WORD_INPUT.value = '';
            checkWordSolved();

            if (puzzleMistakesLeft <= 0 && !isTransitioning) {
                showToast("LOCKPICKS BROKEN... LAST CHANCE!");
                setTimeout(() => {
                    createSpellBurst("#ffcc00");
                    const keyboard = document.getElementById('puzzle-keyboard');
                    if (keyboard) keyboard.style.display = 'none';

                    // Show WORD_INPUT for the final chance
                    WORD_INPUT.style.display = 'block';
                    WORD_INPUT.disabled = false;
                    WORD_INPUT.focus();
                }, 500);
            }
        } else {
            // Whole Word Attempt (Final Shot)
            if (typed === target) {
                showToast("CRACKED THE LOCK!");
                wordBricks.forEach(b => { if (!b.userData.revealed) revealBrick(b); });
                checkWordSolved();
            } else {
                showToast("PUZZLE FAILED! Word was: " + target);

                // Puzzle Chest Failure applies damage in all modes to maintain scaling consistency
                const mistakesCount = wordBricks.filter(b => !b.userData.revealed).length;
                applyDamageFromMistakes(mistakesCount);

                // Hide keyboard immediately on fail
                const keyboard = document.getElementById('puzzle-keyboard');
                if (keyboard) keyboard.style.display = 'none';

                // Reveal bricks for closure but advance with FAIL status (NO GOLD)
                wordBricks.forEach(b => { if (!b.userData.revealed) revealBrick(b, false, true); });
                WORD_INPUT.disabled = true;
                isTransitioning = true;
                setTimeout(() => onSuccess(true, true), 2000); // Fail = true, No Reward
            }
        }
    } else {
        // --- NORMAL CHEST LOGIC ---
        chestAttempts--;
        let anyNewReveal = false;

        for (let i = 0; i < typed.length && i < wordBricks.length; i++) {
            const brick = wordBricks[i];
            if (brick.userData.revealed) continue;
            if (typed[i] === target[i]) {
                revealBrick(brick);
                anyNewReveal = true;
            } else {
                showMistake(brick, typed[i]);
            }
        }

        checkWordSolved();
        if (!wordBricks.every(b => b.userData.revealed)) {
            if (anyNewReveal) {
                showToast(`LOCK TURNS DEEPER... (${chestAttempts} left)`);
                createSpellBurst(MageConfig.spellColor);
            } else {
                showToast(`LOCK JIGGLES... (${chestAttempts} left)`);
                createSpellBurst("#555555");
            }

            WORD_INPUT.value = '';

            if (chestAttempts <= 0) {
                showToast("LOCK JAMS! Word was: " + target);
                wordBricks.forEach(b => {
                    if (!b.userData.revealed) revealBrick(b, false, true);
                });
                WORD_INPUT.disabled = true;
                setTimeout(() => onSuccess(true), 2000);
            }
        }
    }
    updateUI();
}

function gameOver() {
    // SPECIAL: Doctor's Note Revive
    if (items.hasItemNamed("Doctor's Note")) {
        const note = [items.hat, ...items.utensils, ...items.storage].find(i => i && i.name === "Doctor's Note");
        if (note) {
            items.removeItem(note);
            doctorsNoteUsedCount++;
            const stats = items.getTotalStats();
            health = Math.ceil((baseMaxHealth + stats.hp) * 0.5);
            ink = Math.max(ink, 10); // Give some starting ink to fight back

            triggerExcuseEffect(note);

            updateUI();
            saveGameData();
            return; // ABORT GAME OVER
        }
    }

    Persistence.clearRun(); // Run is over — delete the save
    items.reset();
    const activeProfile = ProfileManager.getActiveProfile();
    if (activeProfile) {
        activeProfile.savedRun = null;
        activeProfile.itemData = items.serialize();
        ProfileManager.saveActiveProfile(activeProfile);
    }

    Persistence.saveScore(
        MageConfig.name,
        currentRoom,
        score,
        library.currentSetKey,
        challenger.currentMode
    );
    const fr = document.querySelector('#final-rooms');
    const fw = document.querySelector('#final-words');
    const mw = document.querySelector('#missed-word-val');
    if (fr) fr.textContent = currentRoom;
    if (fw) fw.textContent = score;
    if (mw) {
        const target = (challenger.currentWordData && challenger.currentWordData.word) ? challenger.currentWordData.word.toUpperCase() : "UNKNOWN";
        mw.textContent = target;
    }
    setGameState(GameState.GAME_OVER);
}

let currentMCQData = null;
let mcqChoices = [];
let mcqHitboxes = []; // Specific list of shrunken, non-recursive interaction targets
let mcqIdCounter = 0;
let mcqHasAnswered = false; // Room-scoped flag to prevent duplicate transition calls
let mcqAttempts = 3;
function showMCQ() {
    console.log("showMCQ: Initializing new MCQ room");
    mcqHasAnswered = false; // Reset for the new room
    mcqAttempts = 3; // Reset MCQ attempts for the new room
    isTransitioning = false; // Ensure logic can proceed

    activeProfile = ProfileManager.getActiveProfile();
    const excludeList = (activeProfile && activeProfile.spelledWords) ? activeProfile.spelledWords : [];
    const data = challenger.generateMCQ(excludeList);
    if (!data) {
        // Fallback to regular challenge if generation fails
        animateCamera(null, Math.PI / 2, 800, () => {
            WORD_INPUT.disabled = false;
            WORD_INPUT.focus();
            startNewChallenge();
        });
        return;
    }

    currentMCQData = data;
    // VERY IMPORTANT: Ensure onSuccess logic has a word to reference
    challenger.currentWordData = data.target;
    setGameState(GameState.MCQ);

    // Setup 3D objects on the RIGHT wall
    mcqChoices.forEach(m => dungeonGroup.remove(m));
    mcqChoices = [];
    mcqHitboxes = [];

    // Move faceX for interaction layering
    const faceX = 4.4; // Choices brought closer to player
    const questionFaceX = 4.6; // Question pushed back against wall (adjusted from 4.8 to prevent clipping)
    const absZCenter = 2.5 - (currentRoom - 1) * 15;
    // Shift MCQ grid to the right (player's right, -Z) when blackboard is present in room 9
    const mcqZShift = (currentRoom === 9) ? -2.5 : 0;

    // Guaranteed Straw Mat under MCQ questions
    createStrawMat(3.5, absZCenter + 0.3 + mcqZShift, currentRoom);

    // Question Plane
    // Question Plane - Aspect ratio adjusted for more vertical clearance (8x2.2)
    const qGeo = new THREE.PlaneGeometry(8, 2.2);
    const qMat = new THREE.MeshBasicMaterial({
        map: getWrappedTextTexture(data.question, "#ffffff", true, 60),
        transparent: true,
        side: THREE.DoubleSide
    });
    const qMesh = new THREE.Mesh(qGeo, qMat);
    // Lowered Y from 5.5 to 4.8 to clear ceiling (6.0)
    qMesh.position.set(questionFaceX, 4.8, absZCenter + 0.3 + mcqZShift);
    qMesh.rotation.y = -Math.PI / 2;
    qMesh.userData = { id: mcqIdCounter++, isQuestion: true };
    // DO NOT BLOCK INTERACTION
    qMesh.raycast = () => { };
    dungeonGroup.add(qMesh);
    mcqChoices.push(qMesh);
    console.log(`showMCQ: Created question mesh ID ${qMesh.userData.id}`);

    // Choices
    data.options.forEach((opt, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const z = absZCenter + mcqZShift + (col === 0 ? 2.15 : -2.15); // Buffer: Total gap 0.5 units horizontally
        const y = 2.8 - row * 1.6; // Shifted DOWN to clear the question text plane

        // Choice text plane – use #ff8800 to match spelling letter style
        const choiceGeo = new THREE.PlaneGeometry(3.8, 1.2);
        const choiceMat = new THREE.MeshBasicMaterial({
            map: getWrappedTextTexture(opt.text, "#ffffff", true, 80),
            transparent: true,
            side: THREE.DoubleSide
        });
        const choiceMesh = new THREE.Mesh(choiceGeo, choiceMat);
        choiceMesh.material = choiceMat.clone(); // Separate material for each text plane
        choiceMesh.position.set(faceX - 0.1, y, z); // Further out
        choiceMesh.rotation.y = -Math.PI / 2;
        choiceMesh.userData = { option: opt, id: mcqIdCounter++ };
        // DO NOT BLOCK INTERACTION / OVERLAP RAYCASTS
        choiceMesh.raycast = () => { };
        dungeonGroup.add(choiceMesh);
        mcqChoices.push(choiceMesh);
        console.log(`showMCQ: Created choice text mesh ID ${choiceMesh.userData.id} for "${opt.text}"`);

        // Background backing brick – use wall brickMat to match dungeon textures
        // Dimensions: X=depth into wall (thin), Y=height, Z=width along wall (wide)
        const backBrick = createBrick(faceX + 0.3, y, z, 0.6, 1.4, 3.8, brickMat);
        dungeonGroup.add(backBrick);
        // CLONE wall material so each brick can be colored independently
        backBrick.material = brickMat.clone();

        // Precise Hitbox Tuning:
        // 1. Remove jitter/rotation for perfectly rectangular alignment
        backBrick.position.set(faceX + 0.3, y, z);
        backBrick.rotation.set(0, 0, 0);
        // 2. SHRINK the hitbox slightly to create a "dead zone" gap between choices
        // This prevents the raycaster from accidentally hitting an adjacent block's edge.
        backBrick.scale.set(0.95, 0.95, 0.95);

        // Add unique IDs and option reference for robust matching
        backBrick.userData = { option: opt, isChoiceBacking: true, id: mcqIdCounter++ };

        mcqChoices.push(backBrick);
        mcqHitboxes.push(backBrick); // Add to specific hitbox list
    });

    // Forced Room 9 Blackboard on the RIGHT wall (same wall as MCQ, player's left side)
    if (currentRoom === 9) {
        const boardZ = absZCenter + 5.0; // Far +Z end of the wall (player's left)

        const blackboardGroup = new THREE.Group();
        blackboardGroup.position.set(4.45, 2.5, boardZ);
        blackboardGroup.rotation.y = -Math.PI / 2; // Face the player

        // Frame
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x4d3319 });
        const thickness = 0.12;
        const width = 3.2;
        const height = 1.8;

        const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width + thickness, thickness, thickness), frameMat);
        topFrame.position.y = height / 2 + thickness / 2;
        blackboardGroup.add(topFrame);

        const bottomLedge = new THREE.Mesh(new THREE.BoxGeometry(width + thickness, thickness, thickness * 2.5), frameMat);
        bottomLedge.position.y = -(height / 2 + thickness / 2);
        bottomLedge.position.z = thickness * 0.75;
        blackboardGroup.add(bottomLedge);

        const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, thickness), frameMat);
        leftFrame.position.x = -(width / 2 + thickness / 2);
        blackboardGroup.add(leftFrame);

        const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, thickness), frameMat);
        rightFrame.position.x = width / 2 + thickness / 2;
        blackboardGroup.add(rightFrame);

        // Chalk
        const chalkGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8);
        const chalkMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const chalk = new THREE.Mesh(chalkGeo, chalkMat);
        chalk.rotation.z = Math.PI / 2;
        chalk.rotation.x = Math.PI / 4;
        chalk.position.set(0.4, -(height / 2), thickness * 1.5);
        blackboardGroup.add(chalk);

        // Eraser
        const eraserGeo = new THREE.BoxGeometry(0.2, 0.08, 0.1);
        const eraserMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const eraser = new THREE.Mesh(eraserGeo, eraserMat);
        eraser.position.set(-0.4, -(height / 2), thickness * 1.5);
        blackboardGroup.add(eraser);

        // Board surface
        const boardGeo = new THREE.PlaneGeometry(width, height);
        const boardMat = new THREE.MeshBasicMaterial({
            map: getChalkTextTexture("Answer correctly to earn a good rest."),
            transparent: true,
            side: THREE.DoubleSide
        });
        const boardMesh = new THREE.Mesh(boardGeo, boardMat);
        blackboardGroup.add(boardMesh);

        dungeonGroup.add(blackboardGroup);
        mcqChoices.push(blackboardGroup); // Track for cleanup in clearMCQWall()
    }
}

function handleMCQChoice(option, clickedMesh) {
    if (mcqHasAnswered) return;
    if (currentState !== GameState.MCQ) return;

    // LOCK INTERACTION IMMEDIATELY
    mcqHasAnswered = true;
    isTransitioning = true;
    setGameState(GameState.PLAYING);

    // Find all meshes related to this choice using direct object-reference matching
    const relatedMeshes = mcqChoices.filter(m => m.userData && m.userData.option === option);

    // Determine meshes for the CORRECT answer using direct object-reference matching
    const correctMeshes = mcqChoices.filter(m => m.userData && m.userData.option && m.userData.option.isCorrect);

    if (option.isCorrect) {
        createSpellBurst("#00ff64");
        // Visual highlight: GREEN only for the selected choice
        relatedMeshes.forEach(m => {
            if (m.material) m.material.color.set(0x00ff64);
        });

        // SUCCESS REWARD: Restore 25% HP and Ink
        const stats = items.getTotalStats();
        const maxHP = baseMaxHealth + stats.hp;
        const maxInk = baseMaxInk + stats.ink;

        const hpRestore = Math.floor(maxHP * 0.25);
        const inkRestore = Math.floor(maxInk * 0.25);

        health = Math.min(maxHP, health + hpRestore);
        ink = Math.min(maxInk, ink + inkRestore);

        updateUI();
        createRisingText(`+${hpRestore} HP`, "#ff4444", "hp-ampule");
        createRisingText(`+${inkRestore} INK`, "#00d4ff", "ink-ampule");

        setTimeout(() => {
            clearMCQWall();
            onSuccess(true);
        }, 1200);
    } else {
        createSpellBurst("#ff0000");
        // Visual feedback: RED for wrong choice, GREEN for target
        relatedMeshes.forEach(m => {
            if (m.material) m.material.color.set(0xff0000);
        });
        correctMeshes.forEach(m => {
            if (m.material) m.material.color.set(0x00ff64);
        });

        mcqAttempts--;
        updateUI();

        if (mcqAttempts <= 0) {
            setTimeout(gameOver, 1500);
        } else {
            setTimeout(() => {
                clearMCQWall();
                onSuccess(true); // Progress even on fail
            }, 2500);
        }
    }
}

/**
 * Deep disposal of Three.js objects to prevent memory leaks and lag
 */
function disposeHierarchy(obj) {
    if (!obj) return;
    obj.traverse(node => {
        if (node.isMesh || node.isLine || node.isSprite) {
            if (node.geometry) node.geometry.dispose();
            if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach(m => {
                    // Dispose of potential textures
                    if (m.map) m.map.dispose();
                    if (m.lightMap) m.lightMap.dispose();
                    if (m.bumpMap) m.bumpMap.dispose();
                    if (m.normalMap) m.normalMap.dispose();
                    if (m.specularMap) m.specularMap.dispose();
                    if (m.envMap) m.envMap.dispose();
                    if (m.alphaMap) m.alphaMap.dispose();
                    if (m.aoMap) m.aoMap.dispose();
                    if (m.displacementMap) m.displacementMap.dispose();
                    if (m.emissiveMap) m.emissiveMap.dispose();
                    if (m.gradientMap) m.gradientMap.dispose();
                    if (m.metalnessMap) m.metalnessMap.dispose();
                    if (m.roughnessMap) m.roughnessMap.dispose();

                    m.dispose();
                });
            }
        }
    });
}

function clearMCQWall() {
    console.log(`clearMCQWall: Purging ${mcqChoices.length} items`);
    mcqChoices.forEach(m => {
        dungeonGroup.remove(m);
        // FORCE DISPOSAL to prevent phantom highlights and memory leaks
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
            if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose());
            else m.material.dispose();
        }
    });
    mcqChoices = [];
}



let candleLights = [];
let brazierLights = [];
function createCandle(x, y, z, roomNum = currentRoom) {
    const candleGroup = new THREE.Group();
    candleGroup.position.set(x, y, z);
    candleGroup.userData.roomNumber = roomNum;
    candleGroup.visible = GlobalSettings.candlesEnabled;

    const bodyGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffee, roughness: 1.0 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.2;
    candleGroup.add(body);

    const wickGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 4);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const wick = new THREE.Mesh(wickGeo, wickMat);
    wick.position.y = 0.44;
    candleGroup.add(wick);

    const flameGeo = new THREE.SphereGeometry(0.06, 4, 4);
    const flameMat = new THREE.MeshBasicMaterial({ color: currentSkin.atmos.flame });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 0.55;
    candleGroup.add(flame);

    const light = new THREE.PointLight(currentSkin.atmos.candleLight, 0.8, 6.05); // Increased radius by 10% (5.5 -> 6.05)
    light.position.set(0, 0.55, 0);
    candleGroup.add(light);

    candleLights.push({
        group: candleGroup,
        light: light,
        flame: flame,
        baseIntensity: 0.8,
        baseDistance: 6.05,
        seed: Math.random() * 10
    });

    dungeonGroup.add(candleGroup);
}

function createTorch(x, y, z, roomNum, type = 'wall') {
    const torchGroup = new THREE.Group();
    torchGroup.position.set(x, y, z);
    torchGroup.userData.roomNumber = roomNum;

    if (type === 'wall') {
        const side = x > 0 ? 1 : -1;
        // Rotate to face the room center (90 degrees from the wall)
        torchGroup.rotation.y = (side === 1) ? -Math.PI / 2 : Math.PI / 2;

        // Bracket
        const bracketGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
        const bracketMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
        const bracket = new THREE.Mesh(bracketGeo, bracketMat);
        torchGroup.add(bracket);

        // Torch handle
        const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x442211 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.rotation.x = Math.PI / 6;
        handle.position.set(0, 0.1, 0.2);
        torchGroup.add(handle);
    } else if (type === 'floor') {
        // Floor stand
        const standGeo = new THREE.CylinderGeometry(0.05, 0.1, 1.2, 8);
        const standMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.y = 0.6;
        torchGroup.add(stand);

        const baseGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12);
        const base = new THREE.Mesh(baseGeo, standMat);
        base.position.y = 0.05;
        torchGroup.add(base);

        const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x442211 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.y = 1.3;
        torchGroup.add(handle);

        torchGroup.userData.flameY = 1.5;
    } else if (type === 'ceiling') {
        // Hanging chain torch
        const chainMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });
        for (let i = 0; i < 4; i++) {
            const link = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 8), chainMat);
            link.position.y = -i * 0.18;
            if (i % 2 === 1) link.rotation.y = Math.PI / 2;
            torchGroup.add(link);
        }

        const bowlGeo = new THREE.SphereGeometry(0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const bowlMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        bowl.rotation.x = Math.PI;
        bowl.position.y = -0.8;
        torchGroup.add(bowl);

        torchGroup.userData.flameY = -0.7;
    }

    const flameY = torchGroup.userData.flameY || 0.4;
    const flameZ = (type === 'wall') ? 0.35 : 0;

    // Flame
    const flameGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: currentSkin.atmos.flame });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, flameY, flameZ);
    torchGroup.add(flame);

    // Light
    const light = new THREE.PointLight(currentSkin.atmos.flame, 1.2, 15.84); // Increased radius by 10% (14.4 -> 15.84)
    light.position.set(0, flameY, flameZ);
    torchGroup.add(light);

    candleLights.push({
        group: torchGroup,
        light: light,
        flame: flame,
        baseIntensity: 1.2,
        baseDistance: 15.84,
        seed: Math.random() * 20
    });

    dungeonGroup.add(torchGroup);
}


function createSpiderWeb(x, y, z, roomNum) {
    const webGroup = new THREE.Group();
    webGroup.position.set(x, y, z);
    webGroup.userData.roomNumber = roomNum;

    const typeRoll = Math.random();
    const type = typeRoll < 0.6 ? 'standard' : 'dangler'; // Removed 'thick' to prevent heavy stacking

    const baseOpacity = 0.08 + Math.random() * 0.12; // Wispier: 0.08 to 0.2
    const webMat = new THREE.MeshBasicMaterial({
        color: 0xeeeeee, // Slightly brighter for better wispy visibility
        transparent: true,
        opacity: baseOpacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        map: getWebTexture()
    });

    if (type === 'standard') {
        const size = 2.5 + Math.random() * 1.5;
        const webGeo = new THREE.PlaneGeometry(size, size);
        const web = new THREE.Mesh(webGeo, webMat);

        // Snap to corners based on spawn position
        web.rotation.x = Math.PI / 4 * (y > 5.5 ? 1 : -1);
        web.rotation.y = Math.PI / 4 * (x > 0 ? -1 : 1);

        // Subtle jitter only
        web.rotation.z = (Math.random() - 0.5) * 0.3;

        webGroup.add(web);
    } else { // DANGLER - Fixed aspect ratios
        const width = 1.5 + Math.random() * 1.0;
        const height = 2.0 + Math.random() * 1.5; // Less "stretched" than before
        const webGeo = new THREE.PlaneGeometry(width, height);
        const web = new THREE.Mesh(webGeo, webMat);

        web.position.y = -height / 2;
        web.rotation.y = Math.random() * Math.PI;
        web.rotation.x = (Math.random() - 0.5) * 0.1;

        webGroup.add(web);
    }

    dungeonGroup.add(webGroup);
}

function createBonePile(x, y, z, roomNum) {
    const pileGroup = new THREE.Group();
    pileGroup.position.set(x, y, z);
    pileGroup.userData.roomNumber = roomNum;

    const boneMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 1 });
    const count = 8 + Math.floor(Math.random() * 8);

    for (let i = 0; i < count; i++) {
        let bone;
        const roll = Math.random();

        if (roll < 0.7) {
            // Long bone
            const boneGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3 + Math.random() * 0.4);
            bone = new THREE.Mesh(boneGeo, boneMat);
        } else if (roll < 0.9) {
            // Pelvis/Flat fragment
            const fragmentGeo = new THREE.BoxGeometry(0.25, 0.05, 0.25);
            bone = new THREE.Mesh(fragmentGeo, boneMat);
        } else {
            // Vertebrae/Small chunk
            const chunkGeo = new THREE.SphereGeometry(0.1, 6, 6);
            bone = new THREE.Mesh(chunkGeo, boneMat);
        }

        bone.position.set(
            (Math.random() - 0.5) * 0.7,
            0.05 + Math.random() * 0.15,
            (Math.random() - 0.5) * 0.7
        );
        bone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        pileGroup.add(bone);
    }

    // 25% chance of a skull in the pile
    if (Math.random() < 0.25) {
        const skullGroup = new THREE.Group();
        const skullGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const skull = new THREE.Mesh(skullGeo, boneMat);
        skullGroup.add(skull);

        const jawGeo = new THREE.BoxGeometry(0.18, 0.12, 0.12);
        const jaw = new THREE.Mesh(jawGeo, boneMat);
        jaw.position.set(0, -0.08, 0.08);
        skullGroup.add(jaw);

        skullGroup.position.set((Math.random() - 0.5) * 0.4, 0.15, (Math.random() - 0.5) * 0.4);
        skullGroup.rotation.set(Math.random(), Math.random(), Math.random());
        pileGroup.add(skullGroup);
    }

    pileGroup.userData.isSkeleton = true; // Tag for visibility toggle
    pileGroup.visible = GlobalSettings.skeletonsEnabled;
    dungeonGroup.add(pileGroup);
}

function createShackles(x, y, z, roomNum, side) {
    const shackleGroup = new THREE.Group();
    shackleGroup.position.set(x, y, z);
    shackleGroup.userData.roomNumber = roomNum;
    shackleGroup.rotation.y = (side === 1) ? -Math.PI / 2 : Math.PI / 2;

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 });

    // Wall Attachment Plate - Thin and narrow to stay against brick
    const plateGeo = new THREE.BoxGeometry(0.1, 0.3, 0.04);
    const plate = new THREE.Mesh(plateGeo, metalMat);
    plate.position.z = 0.02; // Move it slightly and use thin geometry
    shackleGroup.add(plate);

    // Anchor Ring
    const anchorRingGeo = new THREE.TorusGeometry(0.07, 0.02, 6, 12);
    const anchorRing = new THREE.Mesh(anchorRingGeo, metalMat);
    anchorRing.rotation.y = Math.PI / 2;
    shackleGroup.add(anchorRing);

    // Chain links (Alternating rotation)
    const linkCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < linkCount; i++) {
        const linkGeo = new THREE.TorusGeometry(0.08, 0.018, 6, 8);
        const link = new THREE.Mesh(linkGeo, metalMat);
        link.position.y = -0.12 - (i * 0.16);
        if (i % 2 === 0) link.rotation.y = Math.PI / 2;
        shackleGroup.add(link);
    }

    // Hand cuff
    const cuffGeo = new THREE.TorusGeometry(0.18, 0.035, 6, 12);
    const cuff = new THREE.Mesh(cuffGeo, metalMat);
    cuff.position.y = -0.12 - (linkCount * 0.16);
    cuff.rotation.x = Math.PI / 2;
    shackleGroup.add(cuff);

    dungeonGroup.add(shackleGroup);
}

function createOoze(x, y, z, rotY, color, roomNum) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;
    group.userData.roomNumber = roomNum;

    const h = 0.2 + Math.random() * 0.6;
    const w = 0.04 + Math.random() * 0.06;

    const mat = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        roughness: 0,
        metalness: 0.1,
    });

    // Create a "rounded" drip using a cylinder with a sphere on the bottom
    const dripBody = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.4, w, h, 8), mat);
    dripBody.position.y = -h / 2;
    group.add(dripBody);

    const dripBottom = new THREE.Mesh(new THREE.SphereGeometry(w, 8, 8), mat);
    dripBottom.position.y = -h;
    dripBottom.scale.y = 1.3; // Make it teardrop shaped
    group.add(dripBottom);

    // Subtle glint
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
    const glint = new THREE.Mesh(new THREE.SphereGeometry(w * 0.3, 8, 8), glintMat);
    glint.position.set(w * 0.4, -h * 0.8, w * 0.4);
    group.add(glint);

    dungeonGroup.add(group);
}

function createBookPile(x, y, z, roomNum) {
    const pileGroup = new THREE.Group();
    pileGroup.position.set(x, y, z);
    pileGroup.userData.roomNumber = roomNum;

    const colors = [0x552222, 0x225522, 0x222255, 0x664422, 0x444444, 0x887755];
    const count = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
        const w = 0.4 + Math.random() * 0.2;
        const h = 0.08 + Math.random() * 0.05;
        const d = 0.5 + Math.random() * 0.2;

        const bookGeo = new THREE.BoxGeometry(w, h, d);
        const bookMat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
        const book = new THREE.Mesh(bookGeo, bookMat);

        // Stack them
        book.position.y = (i * 0.12) + h / 2;
        book.rotation.y = (Math.random() - 0.5) * 0.5;

        // Add pages (white side)
        const pagesGeo = new THREE.BoxGeometry(w * 0.95, h * 0.8, d * 0.98);
        const pagesMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        const pages = new THREE.Mesh(pagesGeo, pagesMat);
        pages.position.x = 0.02; // Slightly offset to look like spine is on one side
        book.add(pages);

        pileGroup.add(book);
    }
    dungeonGroup.add(pileGroup);
}

function createScrollPile(x, y, z, roomNum) {
    const pileGroup = new THREE.Group();
    pileGroup.position.set(x, y, z);
    pileGroup.userData.roomNumber = roomNum;

    const paperMat = new THREE.MeshStandardMaterial({ color: 0xead9b5, roughness: 0.8 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x880000, roughness: 0.5 });

    const count = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
        const scrollGroup = new THREE.Group();
        const length = 0.5 + Math.random() * 0.2;

        // Main paper body
        const paperGeo = new THREE.CylinderGeometry(0.06, 0.06, length, 12);
        const paper = new THREE.Mesh(paperGeo, paperMat);
        paper.rotation.z = Math.PI / 2;
        scrollGroup.add(paper);

        // End caps
        const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12);
        const cap1 = new THREE.Mesh(capGeo, woodMat);
        cap1.position.x = -length / 2 - 0.02;
        cap1.rotation.z = Math.PI / 2;
        scrollGroup.add(cap1);

        const cap2 = new THREE.Mesh(capGeo, woodMat);
        cap2.position.x = length / 2 + 0.02;
        cap2.rotation.z = Math.PI / 2;
        scrollGroup.add(cap2);

        // Ribbon
        const ribbonGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 12);
        const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
        ribbon.rotation.z = Math.PI / 2;
        scrollGroup.add(ribbon);

        scrollGroup.position.set(
            (Math.random() - 0.5) * 1.5,
            0.06 + (Math.random() * 0.02), // Spread them on the ground
            (Math.random() - 0.5) * 1.5
        );
        scrollGroup.rotation.set(0, Math.random() * Math.PI * 2, 0);
        pileGroup.add(scrollGroup);
    }
    dungeonGroup.add(pileGroup);
}

function createBroom(x, y, z, roomNum) {
    const broomGroup = new THREE.Group();
    broomGroup.position.set(x, y, z);
    broomGroup.userData.roomNumber = roomNum;

    const isFallen = Math.random() > 0.4; // 40% chance to be fallen

    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 1.25;
    broomGroup.add(handle);

    // Bristles
    const bristleGeo = new THREE.ConeGeometry(0.2, 0.6, 8);
    const bristleMat = new THREE.MeshStandardMaterial({ color: 0xccaa55 });
    const bristles = new THREE.Mesh(bristleGeo, bristleMat);
    bristles.position.y = 0.3;
    broomGroup.add(bristles);

    if (isFallen) {
        // Lay flat on ground, mostly parallel to the hallway to prevent wall clipping
        broomGroup.position.set(x, 0.07, z);
        broomGroup.rotation.z = Math.PI / 2;
        broomGroup.rotation.y = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    } else {
        // Lean against wall - rotation ensures top touches the wall at 5.0
        broomGroup.rotation.z = (x > 0) ? -0.2 : 0.2;
        broomGroup.rotation.x = (Math.random() - 0.5) * 0.2;
    }

    dungeonGroup.add(broomGroup);
}

function createMop(x, y, z, roomNum) {
    const mopGroup = new THREE.Group();
    mopGroup.position.set(x, y, z);
    mopGroup.userData.roomNumber = roomNum;

    const isFallen = Math.random() > 0.4;
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4d3321, roughness: 0.8 }); // Dark wood
    const clampMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.4 }); // Iron clamp

    // Handle (Long and slightly tapered for realism)
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8);
    const handle = new THREE.Mesh(handleGeo, woodMat);
    handle.position.y = 1.3 + 0.5; // Top of the head is at 0.5
    mopGroup.add(handle);

    // Mop Head Clamp (The heavy horizontal part)
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.15), clampMat);
    clamp.position.y = 0.5;
    mopGroup.add(clamp);

    // Mop Strands
    const headMat = new THREE.MeshStandardMaterial({ color: 0xeeeecc, roughness: 1.0 }); // Aged cotton
    const strands = new THREE.Group();
    const strandCount = 70;

    for (let i = 0; i < strandCount; i++) {
        const sLen = 0.6 + Math.random() * 0.3;
        const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, sLen, 4), headMat);

        // Fan them out along the horizontal clamp
        const spreadX = (Math.random() - 0.5) * 0.35;
        const spreadZ = (Math.random() - 0.5) * 0.12;

        strand.position.set(spreadX, 0.5 - (sLen / 2), spreadZ);

        // Give them weight (droop away from center)
        strand.rotation.z = spreadX * 1.5;
        strand.rotation.x = spreadZ * 1.2;

        strands.add(strand);
    }
    mopGroup.add(strands);

    if (isFallen) {
        mopGroup.position.y = 0.07;
        mopGroup.rotation.z = Math.PI / 2;
        mopGroup.rotation.y = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    } else {
        // Lean against wall
        mopGroup.rotation.z = (x > 0) ? -0.22 : 0.22;
        mopGroup.rotation.x = (Math.random() - 0.5) * 0.25;
    }

    dungeonGroup.add(mopGroup);
}

function createPuddleMesh(radiusMultiplier = 1.0, dirtyLevel = 0) {
    const puddleGroup = new THREE.Group();
    // 0 = Bright Cyan/Blue, 1 = Dark Brown/Grey
    const cleanColor = new THREE.Color(0x00d4ff);
    const dirtyColor = new THREE.Color(0x3e2c1c);
    const finalColor = cleanColor.clone().lerp(dirtyColor, dirtyLevel);

    const mat = new THREE.MeshStandardMaterial({
        color: finalColor,
        transparent: true,
        opacity: 0.55 + (dirtyLevel * 0.2), // Murky water is less see-through
        roughness: 0.1,
        metalness: 0.9 // Water is reflective
    });

    const segments = 4;
    for (let i = 0; i < segments; i++) {
        const radius = (0.22 + Math.random() * 0.45) * radiusMultiplier;
        const circle = new THREE.Mesh(new THREE.CircleGeometry(radius, 12), mat);
        circle.rotation.x = -Math.PI / 2;
        // Random clustering
        const ox = (Math.random() - 0.5) * 0.6;
        const oz = (Math.random() - 0.5) * 0.6;
        circle.position.set(ox, 0, oz);
        circle.scale.x = 1.0 + Math.random() * 1.5; // Irregular shapes
        puddleGroup.add(circle);
    }
    return puddleGroup;
}

function createWoodenBucket(x, y, z, roomNum) {
    const bucketGroup = new THREE.Group();
    bucketGroup.position.set(x, 0.3, z);
    bucketGroup.userData.roomNumber = roomNum;

    // Darker, more realistic wood color (0x5d2e0a)
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d2e0a, roughness: 0.9 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.4 });

    // Main body (Tapered Cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.5, 12);
    const body = new THREE.Mesh(bodyGeo, woodMat);
    bucketGroup.add(body);

    // Metal rings
    const ringGeo = new THREE.TorusGeometry(0.25, 0.015, 8, 16);
    const ring1 = new THREE.Mesh(ringGeo, ironMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.15;
    bucketGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ironMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = -0.15;
    ring2.scale.set(0.85, 0.85, 1);
    bucketGroup.add(ring2);

    // Handle
    const handleGeo = new THREE.TorusGeometry(0.25, 0.01, 8, 12, Math.PI);
    const handle = new THREE.Mesh(handleGeo, ironMat);
    // Variation: Knocked over
    const isKnocked = Math.random() > 0.5;
    if (isKnocked) {
        bucketGroup.rotation.x = Math.PI / 2;
        bucketGroup.rotation.y = Math.random() * Math.PI * 2;
        bucketGroup.position.y = 0.22; // Lowered to floor on its side
    } else {
        bucketGroup.rotation.y = Math.random() * Math.PI * 2;
    }

    dungeonGroup.add(bucketGroup);

    // Puddle Spawn Logic (Added independently to avoid bucket rotation impact)
    const puddleChance = isKnocked ? 0.9 : 0.35;
    if (Math.random() < puddleChance) {
        const dirtyLevel = Math.random(); // 0 (Clean Blue) to 1 (Muddy Brown/Grey)
        const puddle = createPuddleMesh(1.0, dirtyLevel);
        puddle.position.set(x + (Math.random() - 0.5) * 0.4, 0.001, z + (Math.random() - 0.5) * 0.4);
        dungeonGroup.add(puddle);
    }
}

function createHay(x, z, roomNum, densityScale = 1.0, radiusOverride = null) {
    const count = Math.floor((100 + Math.floor(Math.random() * 50)) * densityScale);
    const strandGeo = new THREE.BoxGeometry(0.015, 0.005, 0.4);
    const hayMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, // White because we use setColorAt
        roughness: 1.0
    });

    const instancedMesh = new THREE.InstancedMesh(strandGeo, hayMat, count);
    instancedMesh.position.set(x, 0.01, z);
    instancedMesh.userData.roomNumber = roomNum;
    // Randomly rotate the entire clump group
    instancedMesh.rotation.y = Math.random() * Math.PI * 2;

    const dummy = new THREE.Object3D();
    const baseColor = new THREE.Color(0x443d26); // Reverted to original hay color
    const tempColor = new THREE.Color();
    const radius = radiusOverride || (1.2 * densityScale);

    const aspectRatio = 0.6 + Math.random() * 0.8; // Create oval shapes
    for (let i = 0; i < count; i++) {
        // Use a circular distribution (Polar Coordinates) with HEAVY jitter for irregular perimeters
        const angle = Math.random() * Math.PI * 2;
        const dist = (Math.sqrt(Math.random()) * radius) * (0.6 + Math.random() * 0.8);
        const hx = Math.cos(angle) * dist * aspectRatio;
        const hz = Math.sin(angle) * dist;

        dummy.position.set(hx, 0, hz);

        // Random rotation
        dummy.rotation.set(
            (Math.random() - 0.5) * 0.15, // Slight tilt
            Math.random() * Math.PI,     // Full Y rotation
            0
        );

        // Random scale (length and thickness)
        const s = 0.8 + Math.random() * 0.4;
        dummy.scale.set(0.8 + Math.random() * 0.4, 1.0, s);

        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        // Subtle shade variation
        const shade = 0.85 + Math.random() * 0.25;
        tempColor.setRGB(baseColor.r * shade, baseColor.g * shade, baseColor.b * shade);
        instancedMesh.setColorAt(i, tempColor);
    }

    dungeonGroup.add(instancedMesh);
}

function createStool(x, z, roomNum, heightType, surfaceList = null) {
    let stool;
    let height = 1.0;
    if (heightType === 'short') { stool = createShortStoolModel(); height = 0.5; }
    else { stool = createMediumStoolModel(); height = 1.0; } // 'medium' or fallback; tall removed

    stool.position.set(x, 0, z);
    stool.rotation.y = Math.random() * Math.PI * 2;
    stool.userData.roomNumber = roomNum;
    dungeonGroup.add(stool);

    // Register surface for possible rummage items
    if (surfaceList) {
        surfaceList.push({ x, y: height, z });
    }
}

function spawnRummageItem(x, y, z, roomNum) {
    let proto = null;
    let isGoldBag = false;
    const roll = Math.random();

    if (roll < 0.25) {
        // 25% Chance: Random Shop Item (Excluding special/junk items)
        const allShop = items.allItems.filter(it =>
            it.name !== "Ring" && it.name !== "Necklace" && it.cost > 0 &&
            it.name !== "Memoir" && it.name !== "Manuscript" && it.name !== "Diary" && !it.noShop
        );
        if (allShop.length > 0) {
            proto = allShop[Math.floor(Math.random() * allShop.length)];
        }
    } else if (roll < 0.45) { // Increased: was 0.40 (+5%)
        proto = items.allItems.find(it => it.name === "Ink Refill");
    } else if (roll < 0.55) { // Shifted start: now 0.45 to 0.55 (-5%)
        proto = items.allItems.find(it => it.name === "Eraser Refill");
    } else if (roll < 0.65) {
        proto = items.allItems.find(it => it.name === "Lock Picks");
    } else {
        isGoldBag = true;
        proto = { name: "Bag of Gold", description: "A pouch filled with shiny coins.", cost: 0, isGoldBag: true };
    }

    if (proto) {
        const itemModel = createItemModel(proto.name);
        itemModel.scale.set(0.6, 0.6, 0.6);
        itemModel.position.set(x, y + 0.05, z);
        itemModel.rotation.y = Math.random() * Math.PI * 2;
        itemModel.userData = { foundItem: proto, roomNumber: roomNum, isFoundItem: true, isGoldBag: isGoldBag };
        dungeonGroup.add(itemModel);
        console.log(`[RUMMAGE] Spawned ${proto.name} in Room ${roomNum} at Y=${y}`);
        return itemModel;
    }
    return null;
}

function createWoolBlanketPile(x, z, roomNum) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = Math.random() * Math.PI * 2;
    group.userData.roomNumber = roomNum;

    const colors = [
        0xc8b89a, // dusty linen
        0x8d6e63, // worn tan
        0x6d4c41, // old leather
        0x4e342e, // dark bark
        0x5d5145, // aged slate-brown
        0x7a6652, // muddy umber
        0x3e2723, // near-black brown
        0x9e8e7e, // faded ash
    ];
    const count = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshStandardMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            roughness: 1.0,
            metalness: 0
        });
        const isRoll = (i === count - 1) && Math.random() < 0.6; // Top layer sometimes a roll
        if (isRoll) {
            // Rolled-up blanket on top
            const r1 = 0.08 + Math.random() * 0.05;
            const r2 = 0.08 + Math.random() * 0.05;
            const len = 0.7 + Math.random() * 0.3;
            const rollGeo = new THREE.CylinderGeometry(r1, r2, len, 10);
            const roll = new THREE.Mesh(rollGeo, mat);
            roll.rotation.z = Math.PI / 2;
            roll.rotation.y = (Math.random() - 0.5) * 0.8;
            roll.position.y = (i * 0.08) + r1;
            group.add(roll);
        } else {
            const w = 0.9 + Math.random() * 0.5;
            const d = 0.9 + Math.random() * 0.5;
            const h = 0.06 + Math.random() * 0.1;
            const blanket = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
            blanket.position.y = (i * 0.08) + h / 2;
            blanket.rotation.y = (Math.random() - 0.5) * 0.6;
            blanket.rotation.z = (Math.random() - 0.5) * 0.08; // slight sag/droop
            group.add(blanket);
        }
    }
    dungeonGroup.add(group);
}

function createBrokenBricks(x, z, roomNum) {
    const group = new THREE.Group();
    group.position.set(x, 0.02, z);
    group.rotation.y = Math.random() * Math.PI * 2;
    group.userData.roomNumber = roomNum;

    const brickMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9, metalness: 0 });
    const count = 2 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
        const s = 0.1 + Math.random() * 0.15;
        const chunk = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.6, s * 0.8), brickMat);
        chunk.position.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5);
        chunk.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(chunk);
    }
    dungeonGroup.add(group);
}

function createTallyMarks(x, y, z, rotY, roomNum) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;
    group.userData.roomNumber = roomNum;

    const scratchMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1, metalness: 0 });
    const count = 1 + Math.floor(Math.random() * 49); // Up to 50
    const countClamped = Math.min(count, 100); // Safety

    for (let i = 0; i < countClamped; i++) {
        const row = Math.floor(i / 25);
        const col = i % 25;
        const block = Math.floor(col / 5);
        const withinBlock = col % 5;

        const mark = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.15, 0.005), scratchMat);
        const bx = (block * 0.15) + (withinBlock * 0.025);
        const by = -row * 0.25;

        if (withinBlock === 4) {
            mark.scale.y = 1.3;
            mark.rotation.z = Math.PI / 4;
            mark.position.set(bx - 0.05, by, 0.001);
        } else {
            mark.position.set(bx, by, 0.001);
        }
        group.add(mark);
    }
    dungeonGroup.add(group);
}

function createBench(x, z, rotY, roomNum, surfaceList = null) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    group.userData.roomNumber = roomNum;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.5), woodMat);
    seat.position.y = 0.4;
    group.add(seat);

    for (let i = -1; i <= 1; i += 2) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.4), woodMat);
        leg.position.set(i * 0.8, 0.2, 0);
        group.add(leg);
    }
    dungeonGroup.add(group);

    // Register surface spots for possible rummage items
    if (surfaceList) {
        // Add two potential spots on the long bench
        for (let i = -1; i <= 1; i += 2) {
            const localX = i * 0.6;
            const worldX = x + Math.cos(rotY) * localX;
            const worldZ = z - Math.sin(rotY) * localX;
            surfaceList.push({ x: worldX, y: 0.4, z: worldZ });
        }
    }
}

function createBrazier(x, z, roomNum, isLit) {
    const group = new THREE.Group();
    // Lift slightly to avoid floor clipping
    group.position.set(x, 0.01, z);
    group.userData.roomNumber = roomNum;

    const ironMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.85, roughness: 0.4 });
    const darkIron = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.6 });

    // --- Four splayed legs ---
    const legAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    legAngles.forEach(ang => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.9, 6), ironMat);
        // Position tip outward and tilt inward
        leg.position.set(Math.sin(ang) * 0.22, 0.45, Math.cos(ang) * 0.22);
        leg.rotation.z = Math.sin(ang) * 0.28;
        leg.rotation.x = Math.cos(ang) * 0.28;
        group.add(leg);

        // Foot pad at bottom of each leg
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.04, 6), darkIron);
        foot.position.set(Math.sin(ang) * 0.36, 0.02, Math.cos(ang) * 0.36);
        group.add(foot);
    });

    // --- Lower crossbar ring (holds legs together) ---
    const lowerRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 16), ironMat);
    lowerRing.rotation.x = Math.PI / 2;
    lowerRing.position.y = 0.22;
    group.add(lowerRing);

    // --- Upper ring where basket sits ---
    const upperRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 6, 16), ironMat);
    upperRing.rotation.x = Math.PI / 2;
    upperRing.position.y = 0.85;
    group.add(upperRing);

    // --- Fire basket: wide flared cone (open top) ---
    const basketGeo = new THREE.CylinderGeometry(0.30, 0.16, 0.35, 10, 1, true); // open-ended
    const basket = new THREE.Mesh(basketGeo, ironMat);
    basket.position.y = 1.025;
    group.add(basket);

    // Basket rim cap (solid ring)
    const rimGeo = new THREE.TorusGeometry(0.30, 0.025, 6, 16);
    const rim = new THREE.Mesh(rimGeo, ironMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.2;
    group.add(rim);

    // Basket base plate
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.03, 10), darkIron);
    plate.position.y = 0.845;
    group.add(plate);

    // --- Coals / Embers ---
    if (isLit) {
        const emberMat = new THREE.MeshStandardMaterial({
            color: 0xff4400,
            emissive: 0xff2200,
            emissiveIntensity: 2.5,
            roughness: 0.8
        });
        const glowMat = new THREE.MeshStandardMaterial({
            color: 0xff8800,
            emissive: 0xff5500,
            emissiveIntensity: 1.5,
            roughness: 1.0
        });
        // Coal lumps
        for (let i = 0; i < 6; i++) {
            const coalGeo = new THREE.DodecahedronGeometry(0.05 + Math.random() * 0.04, 0);
            const coal = new THREE.Mesh(coalGeo, i % 2 === 0 ? emberMat : glowMat);
            const a = (i / 6) * Math.PI * 2;
            coal.position.set(Math.sin(a) * (0.06 + Math.random() * 0.1), 1.21, Math.cos(a) * (0.06 + Math.random() * 0.1));
            coal.rotation.set(Math.random(), Math.random(), Math.random());
            group.add(coal);
        }
        // Center glow pile
        const centerCoal = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 5), emberMat);
        centerCoal.position.y = 1.22;
        group.add(centerCoal);

        const light = new THREE.PointLight(0xff5500, 1.5, 5.5);
        light.position.y = 1.5;
        light.userData.isBrazierFlame = true; // for animation loop flicker
        group.add(light);

        brazierLights.push({
            light: light,
            baseIntensity: 1.5,
            baseDistance: 5.5,
            seed: Math.random() * 100
        });
    } else {
        // Dead coals - dark and cold
        const deadMat = new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 1.0 });
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            const coal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05, 0), deadMat);
            coal.position.set(Math.sin(a) * 0.1, 1.21, Math.cos(a) * 0.1);
            group.add(coal);
        }
    }

    dungeonGroup.add(group);
}

function createHayBundle(x, y, z, roomNum) {
    const bundleGroup = new THREE.Group();
    bundleGroup.position.set(x, y + 0.4, z); // Raised to 0.4 half-height
    bundleGroup.userData.roomNumber = roomNum;

    const hayColor = 0x443d26; // Matched to original ground hay color
    const hayMat = new THREE.MeshStandardMaterial({ color: hayColor, roughness: 1.0 });
    const twineMat = new THREE.MeshStandardMaterial({ color: 0x1a0d00, roughness: 0.9, metalness: 0.1 });

    // Main bundle body - chunkier (0.35 radius, 0.8 height)
    const bundleGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 8);
    const bundle = new THREE.Mesh(bundleGeo, hayMat);
    bundleGroup.add(bundle);

    // Twine ring - darker and more visible
    const twineGeo = new THREE.TorusGeometry(0.36, 0.03, 6, 12);
    const twine = new THREE.Mesh(twineGeo, twineMat);
    twine.rotation.x = Math.PI / 2;
    bundleGroup.add(twine);

    // Random strands for detail - more count for bulkier look
    for (let i = 0; i < 12; i++) {
        const strandGeo = new THREE.BoxGeometry(0.02, 0.008, 0.5);
        const strand = new THREE.Mesh(strandGeo, hayMat);
        strand.position.set(
            (Math.random() - 0.5) * 0.6,
            (Math.random() - 0.5) * 0.7,
            (Math.random() - 0.5) * 0.6
        );
        strand.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        bundleGroup.add(strand);
    }

    // Spawning variation
    const isFallen = Math.random() > 0.5;
    if (isFallen) {
        bundleGroup.rotation.z = Math.PI / 2;
        bundleGroup.position.y = y + 0.25;
    }
    bundleGroup.rotation.y = Math.random() * Math.PI * 2;

    dungeonGroup.add(bundleGroup);
}

function createHangingChain(x, y, z, roomNum, side) {
    const chainGroup = new THREE.Group();
    chainGroup.position.set(x, y, z);
    chainGroup.userData.roomNumber = roomNum;
    chainGroup.rotation.y = (side === 1) ? -Math.PI / 2 : Math.PI / 2;

    const chainMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.1 });
    const links = 5 + Math.floor(Math.random() * 8);

    for (let i = 0; i < links; i++) {
        const linkGeo = new THREE.TorusGeometry(0.1, 0.03, 8, 8);
        const link = new THREE.Mesh(linkGeo, chainMat);
        link.position.y = -i * 0.22;
        // Alternate rotation for links
        if (i % 2 === 1) link.rotation.y = Math.PI / 2;
        chainGroup.add(link);
    }

    dungeonGroup.add(chainGroup);
}

function getStrawTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base straw color
    ctx.fillStyle = "#827249";
    ctx.fillRect(0, 0, 256, 256);

    // Draw straw strands
    const colors = ["#9a875a", "#6b5c3b", "#a7936a", "#52462d"];
    for (let i = 0; i < 800; i++) {
        ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.lineWidth = 1 + Math.random();

        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const len = 10 + Math.random() * 30;
        const ang = Math.random() * Math.PI * 0.2; // Slightly aligned horizontally

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4);
    return tex;
}

function createCeilingChains(x, z, roomNum) {
    const group = new THREE.Group();
    group.position.set(x, 5.95, z); // Hang from ceiling
    group.userData.roomNumber = roomNum;

    // Rusted Metallic Material
    const rustMat = new THREE.MeshStandardMaterial({
        color: 0x5a3e1a,
        metalness: 0.6,
        roughness: 0.85
    });

    // Solid Mounting Point (Rusty ring or block)
    const mountGeo = new THREE.BoxGeometry(0.3, 0.15, 0.3);
    const mount = new THREE.Mesh(mountGeo, rustMat);
    group.add(mount);

    const linkCount = 8 + Math.floor(Math.random() * 12);
    for (let i = 0; i < linkCount; i++) {
        const linkGeo = new THREE.TorusGeometry(0.12, 0.035, 8, 12);
        const link = new THREE.Mesh(linkGeo, rustMat);
        link.position.y = -0.15 - i * 0.24;
        // Alternate link rotation for linked look
        if (i % 2 === 1) link.rotation.y = Math.PI / 2;
        group.add(link);
    }

    dungeonGroup.add(group);
}


function getWebTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1;

    // Radial spokes
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        ctx.moveTo(64, 64);
        ctx.lineTo(64 + Math.cos(ang) * 64, 64 + Math.sin(ang) * 64);
    }
    ctx.stroke();

    // Sagging "catenary" spans
    ctx.beginPath();
    for (let ring = 1; ring < 6; ring++) {
        const radius = ring * 12;
        for (let i = 0; i < 12; i++) {
            const ang1 = (i / 12) * Math.PI * 2;
            const ang2 = ((i + 1) / 12) * Math.PI * 2;
            const midAng = (ang1 + ang2) / 2;

            const x1 = 64 + Math.cos(ang1) * radius;
            const y1 = 64 + Math.sin(ang1) * radius;
            const x2 = 64 + Math.cos(ang2) * radius;
            const y2 = 64 + Math.sin(ang2) * radius;

            const cx = 64 + Math.cos(midAng) * (radius * 0.8);
            const cy = 64 + Math.sin(midAng) * (radius * 0.8);

            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(cx, cy, x2, y2);
        }
    }
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
}

function createBrick(x, y, z, w = 1, h = 1, d = 1, mat = null) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const useMat = mat || (brickMaterialPool.length > 0 ? brickMaterialPool[Math.floor(Math.random() * brickMaterialPool.length)] : brickMat);
    const brick = new THREE.Mesh(geo, useMat);

    // Add tiny random jitter for "rough" variation
    const jitter = 0.04;
    brick.position.set(
        x + (Math.random() - 0.5) * jitter,
        y + (Math.random() - 0.5) * jitter,
        z + (Math.random() - 0.5) * jitter
    );
    brick.rotation.set(
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015
    );

    const edges = new THREE.EdgesGeometry(geo);
    const lines = new THREE.LineSegments(edges, lineMat);
    brick.add(lines);
    // Note: roomGroup.add() will be called by the caller
    return brick;
}

function createOldChest(x, y, z) {
    const chestGroup = new THREE.Group();

    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const outlineScale = 1.05;

    // Base
    const baseGeo = new THREE.BoxGeometry(2.5, 1.2, 1.5);
    const base = new THREE.Mesh(baseGeo, chestMat);
    base.position.y = 0.6;

    // Base Outline
    const baseOutline = new THREE.Mesh(baseGeo, outlineMat);
    baseOutline.scale.multiplyScalar(outlineScale);
    base.add(baseOutline);

    chestGroup.add(base);

    // Lid Pivot (at the back edge of the base top)
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 1.2, -0.75);
    chestGroup.add(lidPivot);

    // Lid Mesh
    const lidGeo = new THREE.BoxGeometry(2.6, 0.6, 1.6);
    const lid = new THREE.Mesh(lidGeo, chestMat);
    lid.position.set(0, 0.3, 0.825); // Offset forward relative to pivot

    // Lid Outline
    const lidOutline = new THREE.Mesh(lidGeo, outlineMat);
    lidOutline.scale.multiplyScalar(outlineScale);
    lid.add(lidOutline);

    lidPivot.add(lid);

    // Gold Trim/Lock (attached to lid)
    const lockGeo = new THREE.BoxGeometry(0.4, 0.4, 0.1);
    const lock = new THREE.Mesh(lockGeo, goldMat);
    lock.position.set(0, -0.1, 0.85); // Positioned relative to lid pivot

    // Lock Outline
    const lockOutline = new THREE.Mesh(lockGeo, outlineMat);
    lockOutline.scale.multiplyScalar(1.2);
    lock.add(lockOutline);

    lidPivot.add(lock);

    // Padlock (attached to lid)
    const padlockGroup = new THREE.Group();
    const padBodyGeo = new THREE.BoxGeometry(0.3, 0.4, 0.1);
    const padBody = new THREE.Mesh(padBodyGeo, goldMat);
    padlockGroup.add(padBody);

    const shackleGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16, Math.PI);
    const shackleMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.2 });
    const shackle = new THREE.Mesh(shackleGeo, shackleMat);
    shackle.position.y = 0.2;
    padlockGroup.add(shackle);

    padlockGroup.position.set(-0.9, -0.3, 0.9); // Moved to left edge
    lidPivot.add(padlockGroup);

    // Shrink old chest by an additional 25% (Total ~0.61)
    chestGroup.scale.set(0.61, 0.61, 0.61);

    // Straps (attached to lid)
    const strapGeo = new THREE.BoxGeometry(0.2, 0.8, 1.65);
    const strapMatWithOutline = (parent) => {
        const outline = new THREE.Mesh(strapGeo, outlineMat);
        outline.scale.set(1.1, 1.02, 1.01);
        parent.add(outline);
    };

    const strapL = new THREE.Mesh(strapGeo, goldMat);
    strapL.position.set(-0.8, 0.3, 0.8);
    strapMatWithOutline(strapL);
    lidPivot.add(strapL);

    const strapR = new THREE.Mesh(strapGeo, goldMat);
    strapR.position.set(0.8, 0.3, 0.8);
    strapMatWithOutline(strapR);
    lidPivot.add(strapR);

    // Base straps for aesthetics
    const baseStrapGeo = new THREE.BoxGeometry(0.22, 1.2, 1.52);
    const strapLB = new THREE.Mesh(baseStrapGeo, goldMat);
    strapLB.position.set(-0.8, 0.6, 0);
    chestGroup.add(strapLB);
    const strapRB = new THREE.Mesh(baseStrapGeo, goldMat);
    strapRB.position.set(0.8, 0.6, 0);
    chestGroup.add(strapRB);

    chestGroup.position.set(x, y, z);
    chestGroup.rotation.y = -Math.PI / 1.7;

    // Animation state
    let targetRotation = 0;
    let currentRotation = 0;
    let yVel = 0;
    let rattleTimer = 0;
    const baseRotationY = chestGroup.rotation.y;

    chestGroup.userData.open = () => {
        targetRotation = -Math.PI / 2.2; // Open backwards
        yVel = 0.15; // Slight jump on open
    };

    chestGroup.userData.rattle = () => {
        rattleTimer = 15; // ~15 frames of rattle
    };

    const startY = y;
    chestGroup.userData.update = () => {
        // Rattle logic
        if (rattleTimer > 0) {
            rattleTimer--;
            chestGroup.position.x = x + (Math.random() - 0.5) * 0.05;
            chestGroup.rotation.y = baseRotationY + (Math.random() - 0.5) * 0.05;
        } else {
            chestGroup.position.x = x;
            chestGroup.rotation.y = baseRotationY;
        }

        // Jump/Gravity logic
        if (chestGroup.position.y > startY || yVel !== 0) {
            yVel -= 0.01; // Gravity
            chestGroup.position.y += yVel;
            if (chestGroup.position.y < startY) {
                chestGroup.position.y = startY;
                yVel = 0;
            }
        }

        // Smooth rotation for lid
        currentRotation += (targetRotation - currentRotation) * 0.05;
        lidPivot.rotation.x = currentRotation;
    };

    dungeonGroup.add(chestGroup);
    return chestGroup;
}

function createSkeleton(x, y, z, rotY, pose = 'LEANING') {
    const group = new THREE.Group();
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xe6e0d4, roughness: 0.8 });

    // Helper for joints
    const createJoint = (px, py, pz) => {
        const joint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), boneMat);
        joint.position.set(px, py, pz);
        return joint;
    };

    // Main Torso Group (Core of the skeleton)
    const torso = new THREE.Group();
    group.add(torso);

    // Spine
    const spineGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
        const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08), boneMat);
        vert.position.y = i * 0.12;
        spineGroup.add(vert);
    }
    torso.add(spineGroup);

    // Ribcage (Rings)
    for (let i = 0; i < 4; i++) {
        const ribGeo = new THREE.TorusGeometry(0.25 - i * 0.02, 0.03, 8, 16);
        const rib = new THREE.Mesh(ribGeo, boneMat);
        rib.position.y = 0.1 + i * 0.15;
        rib.rotation.x = Math.PI / 2 + 0.2;
        torso.add(rib);
    }

    // Skull
    const skullGroup = new THREE.Group();
    const skullBase = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), boneMat);
    skullGroup.add(skullBase);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.18), boneMat);
    jaw.position.set(0, -0.12, 0.1);
    skullGroup.add(jaw);
    const socketMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), socketMat);
    leftEye.position.set(-0.08, 0, 0.18);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), socketMat);
    rightEye.position.set(0.08, 0, 0.18);
    skullGroup.add(leftEye, rightEye);
    skullGroup.position.set(0, 0.85, 0);
    torso.add(skullGroup);

    // Arms
    const createArm = (side) => {
        const arm = new THREE.Group();
        arm.add(createJoint(0, 0, 0)); // Shoulder
        const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45), boneMat);
        upper.position.y = -0.22;
        arm.add(upper);
        const elbowNode = new THREE.Group();
        elbowNode.position.y = -0.45;
        arm.add(elbowNode);
        elbowNode.add(createJoint(0, 0, 0));
        const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45), boneMat);
        lower.position.y = -0.22;
        elbowNode.add(lower);
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.15), boneMat);
        hand.position.set(0, -0.45, 0.1);
        elbowNode.add(hand);
        arm.position.set(side * 0.35, 0.65, 0);
        return { arm, elbowNode };
    };
    const leftArm = createArm(-1);
    const rightArm = createArm(1);
    torso.add(leftArm.arm, rightArm.arm);

    // Legs
    const createLeg = (side) => {
        const legGroup = new THREE.Group();
        legGroup.add(createJoint(0, 0, 0)); // Hip
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4), boneMat);
        thigh.position.y = -0.2;
        legGroup.add(thigh);
        const kneeNode = new THREE.Group();
        kneeNode.position.y = -0.4;
        legGroup.add(kneeNode);
        kneeNode.add(createJoint(0, 0, 0));
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4), boneMat);
        shin.position.y = -0.2;
        kneeNode.add(shin);
        const footNode = new THREE.Group();
        footNode.position.y = -0.4;
        kneeNode.add(footNode);
        footNode.add(createJoint(0, 0, 0));
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.25), boneMat);
        foot.position.z = 0.1;
        footNode.add(foot);
        return { leg: legGroup, kneeNode, footNode };
    };
    const lLeg = createLeg(-1);
    const rLeg = createLeg(1);
    lLeg.leg.position.set(-0.2, 0, 0.1);
    rLeg.leg.position.set(0.2, 0, 0.1);
    group.add(lLeg.leg, rLeg.leg);

    // Pose Logic
    if (pose === 'LEANING') {
        torso.position.set(0, 0.55, -0.1);
        torso.rotation.x = -0.3; // Lean back
        lLeg.leg.position.y = 0.55;
        rLeg.leg.position.y = 0.55;
        lLeg.leg.rotation.set(-0.4, -0.5, 0.2);
        lLeg.kneeNode.rotation.x = 1.0;
        lLeg.footNode.rotation.x = -0.6;
        rLeg.leg.rotation.set(-0.5, 0.4, -0.2);
        rLeg.kneeNode.rotation.x = 1.2;
        rLeg.footNode.rotation.x = -0.7;
        leftArm.arm.rotation.set(0.2, 0, 0.6);
        leftArm.elbowNode.rotation.x = -0.5;
        rightArm.arm.rotation.set(0.5, 0, -0.5);
    } else if (pose === 'SITTING') {
        torso.position.set(0, 0.35, 0.05);
        lLeg.leg.position.y = 0.35;
        rLeg.leg.position.y = 0.35;
        // Cross-legged
        lLeg.leg.rotation.set(-1.1, -0.9, 0.2);
        lLeg.kneeNode.rotation.set(2.2, 0, 0);
        lLeg.footNode.rotation.x = -0.8;
        rLeg.leg.rotation.set(-1.1, 0.9, -0.2);
        rLeg.kneeNode.rotation.set(2.2, 0, 0);
        rLeg.footNode.rotation.x = -0.8;
        leftArm.arm.rotation.set(0.6, 0, 0.5);
        rightArm.arm.rotation.set(0.3, 0, -0.4);
    } else if (pose === 'STRAIGHT') {
        torso.position.set(0, 0.2, -0.05);
        torso.rotation.x = -0.15;
        lLeg.leg.position.y = 0.2;
        rLeg.leg.position.y = 0.2;
        lLeg.leg.rotation.set(-Math.PI / 2, -0.15, 0);
        rLeg.leg.rotation.set(-Math.PI / 2, 0.15, 0);
        lLeg.kneeNode.rotation.x = 0.1;
        rLeg.kneeNode.rotation.x = 0.1;
        leftArm.arm.rotation.set(0.1, 0, 0.3);
        rightArm.arm.rotation.set(0.2, 0, -0.3);
    } else if (pose === 'LAYING') {
        group.rotation.x = -Math.PI / 2 + 0.1;
        group.position.y = 0.3;
        lLeg.leg.rotation.y = 0.4;
        rLeg.leg.rotation.y = -0.3;
        lLeg.kneeNode.rotation.y = 0.3;
        leftArm.arm.rotation.z = 1.3;
        rightArm.arm.rotation.z = -1.2;
        skullGroup.rotation.z = 0.5;
        skullGroup.rotation.y = 0.3;
    }

    // Parchment Note (if not laying)
    if (pose !== 'LAYING') {
        const note = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), new THREE.MeshBasicMaterial({
            map: getWrappedTextTexture("silent letters", "#332200", true, 80),
            color: 0xfff4d1, // Yellowed parchment tint
            side: THREE.DoubleSide,
            transparent: true
        }));
        note.position.set(0.15, 0.25, 0.55);
        note.rotation.x = -0.3;
        note.rotation.z = 0.15;
        group.add(note);
    }

    group.position.set(x, y, z);
    group.rotation.y = rotY;
    group.userData.isSkeleton = true; // Tag for visibility toggle
    group.visible = GlobalSettings.skeletonsEnabled;
    return group;
}

function createRatHole(x, y, z, rotY) {
    const holeGroup = new THREE.Group();

    // The "Hole" brick
    const brickGeo = new THREE.BoxGeometry(1.0, 0.5, 1.0);
    const brick = new THREE.Mesh(brickGeo, brickMat);
    holeGroup.add(brick);

    // Dark Tunnel inside the brick
    const holeGeo = new THREE.CircleGeometry(0.12, 16);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(0, -0.05, 0.501); // Slightly out from brick face
    brick.add(hole);

    // The Rat
    const ratHeadGroup = new THREE.Group();
    const ratColor = 0x666666;
    const ratMat = new THREE.MeshStandardMaterial({ color: ratColor, roughness: 0.9 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), ratMat);
    ratHeadGroup.add(head);

    const earGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const leftEar = new THREE.Mesh(earGeo, ratMat);
    leftEar.position.set(-0.06, 0.06, 0);
    ratHeadGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, ratMat);
    rightEar.position.set(0.06, 0.06, 0);
    ratHeadGroup.add(rightEar);

    const eyeGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.03, 0.02, 0.06);
    ratHeadGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.03, 0.02, 0.06);
    ratHeadGroup.add(rightEye);

    // Position rat inside the hole
    ratHeadGroup.position.set(0, -0.05, 0.3); // Hidden depth
    brick.add(ratHeadGroup);

    holeGroup.userData = {
        rat: ratHeadGroup,
        state: 'IDLE', // IDLE, PEEKING, RETRACTING
        timer: Date.now() + Math.random() * 5000,
        targetDepth: 0.3,
        currentDepth: 0.3,
        update: function () {
            const now = Date.now();
            if (now > this.timer) {
                if (this.state === 'IDLE') {
                    this.state = 'PEEKING';
                    this.targetDepth = 0.45 + Math.random() * 0.15; // Random peek depth
                    this.timer = now + 1000 + Math.random() * 2000; // Stay out for 1-3s
                } else if (this.state === 'PEEKING') {
                    this.state = 'RETRACTING';
                    this.targetDepth = 0.3;
                    this.timer = now + 4000 + Math.random() * 8000; // Wait 4-12s before next peek
                } else {
                    this.state = 'IDLE';
                }
            }

            // Smooth lerp for movement
            this.currentDepth += (this.targetDepth - this.currentDepth) * 0.05;
            this.rat.position.z = this.currentDepth;

            // Random twitching if not idle
            if (this.state !== 'IDLE') {
                this.rat.rotation.y = Math.sin(now * 0.01) * 0.2;
                this.rat.rotation.x = Math.cos(now * 0.015) * 0.1;
            }
        }
    };

    holeGroup.position.set(x, y, z);
    holeGroup.rotation.y = rotY;
    return holeGroup;
}

function createStrawMat(x, z, roomNum) {
    const matGroup = new THREE.Group();
    matGroup.userData.roomNumber = roomNum;

    const strawTex = getStrawTexture();
    const matMat = new THREE.MeshStandardMaterial({
        map: strawTex,
        color: 0x8b7355, // Darker brown tint (was 0xffffff)
        roughness: 1.0
    });

    // The Mat part
    const matGeo = new THREE.BoxGeometry(2.27, 0.065, 3.65); // Shrunk by another 10%
    const matMesh = new THREE.Mesh(matGeo, matMat);
    matMesh.position.y = 0.032;
    matGroup.add(matMesh);

    // The Bedroll (pillow)
    const rollGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.1, 8); // Shrunk by another 10%
    const rollMesh = new THREE.Mesh(rollGeo, matMat);
    rollMesh.rotation.z = Math.PI / 2;
    rollMesh.position.set(0, 0.12, -1.54); // Shrunk offsets
    matGroup.add(rollMesh);

    // Stray Straw Strands sticking out of edges
    const strandGeo = new THREE.BoxGeometry(0.015, 0.005, 0.35);
    const strandMat = new THREE.MeshStandardMaterial({ color: 0x7a6b4a, roughness: 1 }); // Darker strand (was 0x9a875a)

    // Left/Right edges
    for (let i = 0; i < 20; i++) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const strand = new THREE.Mesh(strandGeo, strandMat);
        strand.position.set(
            side * 1.135 + (Math.random() - 0.5) * 0.1,
            0.03,
            (Math.random() - 0.5) * 3.4
        );
        strand.rotation.y = Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        strand.rotation.z = (Math.random() - 0.5) * 0.3;
        matGroup.add(strand);
    }
    // Front/Back edges
    for (let i = 0; i < 15; i++) {
        const sideZ = Math.random() > 0.5 ? 1 : -1;
        const strand = new THREE.Mesh(strandGeo, strandMat);
        strand.position.set(
            (Math.random() - 0.5) * 2.2,
            0.03,
            sideZ * 1.825 + (Math.random() - 0.5) * 0.1
        );
        strand.rotation.y = (Math.random() - 0.5) * 0.8;
        strand.rotation.z = (Math.random() - 0.5) * 0.3;
        matGroup.add(strand);
    }

    matGroup.position.set(x, 0, z);
    matGroup.rotation.y = (Math.random() - 0.5) * 0.2; // Slight random rotation
    dungeonGroup.add(matGroup);
    return matGroup;
}

function createRoom(zOffset, roomNum = currentRoom, addBackWall = false) {
    const roomGroup = new THREE.Group();
    roomGroup.userData.roomNumber = roomNum;
    const floorGeo = new THREE.PlaneGeometry(10, 15);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.userData.isFloor = true; // Tag for immediate updates
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, zOffset - 7.5);
    roomGroup.add(floorMesh);

    // Ceiling (Use Box instead of Plane to seal gaps caused by brick jitter)
    const ceilGeo = new THREE.BoxGeometry(14, 0.5, 15);
    const ceilMesh = new THREE.Mesh(ceilGeo, brickMat);
    // Center at y=6.2 so the bottom face is at 6.2 - 0.25 = 5.95
    // This ensures it overlaps the top row of wall bricks (max height ~6.025)
    ceilMesh.position.set(0, 6.2, zOffset - 7.5);
    roomGroup.add(ceilMesh);


    // --- Side Walls (Left & Right) ---
    // Using a greedy tiling algorithm for 1x1, 1x2, 2x2 variety
    const isBranch = false; // [SHELVED] Branch room has side doors
    for (let side = 0; side < 2; side++) {
        const xPos = side === 0 ? -5.5 : 5.5;
        const grid = Array.from({ length: 6 }, () => Array(15).fill(false));

        // Side wall door hole: 3 cols wide (6,7,8), 4 rows tall (0-3)
        // Room depth 15, hole at index 6,7,8 = units 6,7,8 from entrance = centered at 7.5
        const sideHitsHole = (col, row, w, h) => {
            if (!isBranch) return false;
            for (let dr = 0; dr < h; dr++) {
                for (let dc = 0; dc < w; dc++) {
                    const r = row + dr, c = col + dc;
                    if (c >= 6 && c <= 8 && r <= 3) return true;
                }
            }
            return false;
        };

        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 15; c++) {
                if (grid[r][c]) continue;

                if (sideHitsHole(c, r, 1, 1)) {
                    grid[r][c] = true;
                    continue;
                }

                let bw = 1, bh = 1;
                const roll = Math.random();

                if (roll < 0.15 && r < 5 && c < 14 && !grid[r + 1][c] && !grid[r][c + 1] && !grid[r + 1][c + 1] && !sideHitsHole(c, r, 2, 2)) {
                    bw = 2; bh = 2;
                } else if (roll < 0.55 && c < 14 && !grid[r][c + 1] && !sideHitsHole(c, r, 2, 1)) {
                    bw = 2; bh = 1; // Reduced: was 0.70
                } else if (roll < 0.65 && r < 5 && !grid[r + 1][c] && !sideHitsHole(c, r, 1, 2)) {
                    bw = 1; bh = 2; // Reduced: was 0.80
                }

                for (let i = 0; i < bh; i++) for (let j = 0; j < bw; j++) grid[r + i][c + j] = true;

                // Center each brick on the 1-unit grid (0.5, 1.5, etc.)
                const z = zOffset - (c + bw / 2);
                const y = (r + bh / 2 - 0.5) * 1.0 + 0.5;
                const stickOut = Math.random() * 0.25;

                roomGroup.add(createBrick(side === 0 ? xPos + stickOut : xPos - stickOut, y, z, 1, bh, bw));
            }
        }
    }

    // --- Front Wall (with Door Hole) ---
    const drawWall = (targetZ, skipDoor = true) => {
        const COLS = 10, ROWS = 6;
        // Door opening: 3 columns wide (cols 4,5,6), 4 rows tall (rows 0-3)
        // With 10 columns starting at -5, indices 4,5,6 span x = -1 to +2? 
        // Wait, for 3-wide centered on x=0 with 10 columns: indices 3, 4, 5 would be -2 to 1 (asymmetric)
        // To be centered we need to go back to 11 cols OR accept cuts.
        // Let's use 11 columns but FIX THE MATH so col 5 IS at x=0 and the hole is symmetric.
        const C_COUNT = 11;
        const grid = Array.from({ length: ROWS }, () => Array(C_COUNT).fill(false));

        const hitsHole = (col, row, w, h) => {
            if (!skipDoor) return false;
            for (let dr = 0; dr < h; dr++) {
                for (let dc = 0; dc < w; dc++) {
                    const r = row + dr, c = col + dc;
                    // Skip 3 cols centered on index 5 (middle of 11)
                    if (c >= 4 && c <= 6 && r <= 3) return true;
                }
            }
            return false;
        };

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < C_COUNT; c++) {
                if (grid[r][c]) continue;

                if (hitsHole(c, r, 1, 1)) {
                    grid[r][c] = true;
                    continue;
                }

                let bw = 1, bh = 1;
                const roll = Math.random();

                if (roll < 0.15 && r < ROWS - 1 && c < C_COUNT - 1 &&
                    !grid[r + 1][c] && !grid[r][c + 1] && !grid[r + 1][c + 1] &&
                    !hitsHole(c, r, 2, 2)) {
                    bw = 2; bh = 2;
                }
                else if (roll < 0.55 && c < C_COUNT - 1 && !grid[r][c + 1] &&
                    !hitsHole(c, r, 2, 1)) {
                    bw = 2; bh = 1; // Reduced: was 0.70
                }
                else if (roll < 0.65 && r < ROWS - 1 && !grid[r + 1][c] &&
                    !hitsHole(c, r, 1, 2)) {
                    bw = 1; bh = 2; // Reduced: was 0.80
                }

                for (let i = 0; i < bh; i++) for (let j = 0; j < bw; j++) grid[r + i][c + j] = true;

                // Center brick index 5 (middle of 11) exactly at x=0
                const finalX = (c + bw / 2 - 5.5) * 1.0;
                const finalY = (r + bh / 2 - 0.5) * 1.0 + 0.5;
                const stickOut = Math.random() * 0.25;

                roomGroup.add(createBrick(finalX, finalY, targetZ + stickOut, bw, bh, 1));
            }
        }
    };

    drawWall(zOffset - 15, true); // Front Wall
    if (addBackWall) drawWall(zOffset, true); // Back Wall

    // Procedural Candles: Lowered spawn rate to make them feel special (0-2 per room)
    if (GlobalSettings.candlesEnabled) {
        const candleCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < candleCount; i++) {
            const side = Math.random() > 0.5 ? -4.5 : 4.5;
            const z = zOffset - Math.random() * 14;
            createCandle(side, 0, z, roomNum);
        }
    }

    // Wall Carvings: 25% chance per room
    if (Math.random() < 0.25) {
        activeProfile = ProfileManager.getActiveProfile();
        let selectedCarvingMsg = "";

        if (activeProfile) {
            if (!activeProfile.carvingCycle || activeProfile.carvingCycle.length === 0) {
                // Initialize/Refill the cycle with all carvings then shuffle
                activeProfile.carvingCycle = [...WALL_CARVINGS];
                for (let i = activeProfile.carvingCycle.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [activeProfile.carvingCycle[i], activeProfile.carvingCycle[j]] = [activeProfile.carvingCycle[j], activeProfile.carvingCycle[i]];
                }
            }
            selectedCarvingMsg = activeProfile.carvingCycle.pop();
            ProfileManager.saveActiveProfile(activeProfile);
        } else {
            selectedCarvingMsg = WALL_CARVINGS[Math.floor(Math.random() * WALL_CARVINGS.length)];
        }

        const msg = selectedCarvingMsg;

        // Randomize plane size slightly (increased significantly for better fit and longer messages)
        const planeW = 6.0 + Math.random() * 4.0;
        const planeH = 1.2 + Math.random() * 2.5;

        // High segment count to allow smooth bending around the corner
        const segments = Math.ceil(planeW * 26); // High segment count for smooth corner wrap
        const carvingGeo = new THREE.PlaneGeometry(planeW, planeH, segments, 2);

        const side = Math.random() > 0.5 ? 1 : -1;

        const hw = planeW / 2;
        const t_min = -2.48; // Max wrap onto front wall before hitting door
        const t_max = 15.0 + 2.48; // Max wrap onto back wall before hitting door (Match 15m room depth)

        // Randomly place center such that we never wrap into the door hole
        const t_center_min = hw + t_min;
        const t_center_max = t_max - hw;
        const t_center = t_center_min + Math.random() * (t_center_max - t_center_min);

        // Modify vertex positions to shape it along the walls
        const positions = carvingGeo.attributes.position;
        const zFront = zOffset - 14.68; // Moved closer to wall (was 14.48)
        const zBack = zOffset - 0.32;   // Moved closer to wall (was 0.52)
        const tilt = (Math.random() - 0.5) * 0.2; // Slight random tilt applied during vertex calculation

        for (let i = 0; i < positions.count; i++) {
            const px = positions.getX(i);
            const py = positions.getY(i);

            // Apply slight Z-tilt on local plane before mapped
            const ppx = px * Math.cos(tilt) - py * Math.sin(tilt);
            const ppy = px * Math.sin(tilt) + py * Math.cos(tilt);

            // Map ppx to wall parameter t
            const t = side === -1 ? (t_center - ppx) : (t_center + ppx);

            let worldX, worldZ;

            if (t < 0) {
                // Wraps onto front wall
                worldZ = zFront;
                worldX = (side === -1) ? (-4.68 - t) : (4.68 + t);
            } else if (t > 15.0) {
                // Wraps onto back wall
                worldZ = zBack;
                const overflow = t - 15.0;
                worldX = (side === -1) ? (-4.68 + overflow) : (4.68 - overflow);
            } else {
                // On side wall
                worldZ = zFront + t + 0.18; // Offset from front to align room flow
                worldX = (side === -1) ? -4.68 : 4.68; // Closer to bricks
            }

            positions.setXYZ(i, worldX, ppy, worldZ);
        }

        carvingGeo.computeVertexNormals();
        carvingGeo.computeBoundingBox();
        carvingGeo.computeBoundingSphere();

        const carvingMat = new THREE.MeshBasicMaterial({
            map: getGraffitiTexture(msg),
            transparent: true,
            opacity: 0.1 + Math.random() * 0.4, // Lowered and more varied for realism
            side: THREE.DoubleSide,
            depthWrite: false, // Ensure it doesn't occlude other transparents
            depthTest: true,   // Ensure chests/letters can correctly hide it
            // We remove severe polygonOffset so it doesn't poke through things correctly in front of it down the pipeline
        });

        const carving = new THREE.Mesh(carvingGeo, carvingMat);
        carving.frustumCulled = false; // The vertex deformation breaks default culling sphere

        const halfH = planeH / 2;
        const yPos_max = 5.8 - halfH; // ceiling clearance
        const yPos_min = 0.5 + halfH; // floor clearance
        const yRange = Math.max(0, yPos_max - yPos_min);
        const yPos = yPos_min + Math.random() * yRange;

        // Vertices are placed relative to origin, we only need to lift it in Y
        carving.position.set(0, yPos, 0);

        roomGroup.add(carving);
    }

    // Tutorial Tips: Guaranteed for specific early rooms (if enabled)
    if (GlobalSettings.tutorialEnabled && TUTORIAL_TIPS[roomNum] && challenger.currentMode !== ChallengeMode.PUZZLE) {
        const msg = TUTORIAL_TIPS[roomNum];
        // Now on the left wall to be in player's direct focus
        const side = -1;
        const zPos = zOffset - 3.2; // Moved deeper into room (was -2.2)
        const xPos = side * 4.40;
        const yPos = 1.02; // Moved to floor (was 5.2)

        const blackboardGroup = new THREE.Group();
        blackboardGroup.position.set(xPos, yPos, zPos);
        blackboardGroup.rotation.y = Math.PI / 2;
        blackboardGroup.userData.roomNumber = roomNum;

        // Wooden Frame (Classic wood)
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x4d3319 });
        const thickness = 0.12;
        const width = 3.2; // Shrunk further
        const height = 1.8; // Shrunk further

        // Top Frame
        const topFrame = new THREE.Mesh(new THREE.BoxGeometry(width + thickness, thickness, thickness), frameMat);
        topFrame.position.y = height / 2 + thickness / 2;
        blackboardGroup.add(topFrame);

        // Bottom Ledge (Thicker)
        const bottomLedge = new THREE.Mesh(new THREE.BoxGeometry(width + thickness, thickness, thickness * 2.5), frameMat);
        bottomLedge.position.y = -(height / 2 + thickness / 2);
        bottomLedge.position.z = thickness * 0.75;
        blackboardGroup.add(bottomLedge);

        // Left Frame
        const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, thickness), frameMat);
        leftFrame.position.x = -(width / 2 + thickness / 2);
        blackboardGroup.add(leftFrame);

        // Right Frame
        const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, thickness), frameMat);
        rightFrame.position.x = (width / 2 + thickness / 2);
        blackboardGroup.add(rightFrame);

        // Accessories on Ledge
        // Piece of Chalk
        const chalkGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8);
        const chalkMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const chalk = new THREE.Mesh(chalkGeo, chalkMat);
        chalk.rotation.z = Math.PI / 2;
        chalk.rotation.x = Math.PI / 4;
        chalk.position.set(0.4, -(height / 2), thickness * 1.5);
        blackboardGroup.add(chalk);

        // Eraser
        const eraserGeo = new THREE.BoxGeometry(0.2, 0.08, 0.1);
        const eraserMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const eraser = new THREE.Mesh(eraserGeo, eraserMat);
        eraser.position.set(-0.4, -(height / 2), thickness * 1.5);
        blackboardGroup.add(eraser);

        // Blackboard Surface
        const boardGeo = new THREE.PlaneGeometry(width, height);
        const boardMat = new THREE.MeshBasicMaterial({
            map: getChalkTextTexture(msg),
            transparent: true,
            side: THREE.DoubleSide
        });
        const boardMesh = new THREE.Mesh(boardGeo, boardMat);
        blackboardGroup.add(boardMesh);

        // Dedicated subtle glow light


        roomGroup.add(blackboardGroup);
    }

    // Torches: Randomized placement (Wall, Floor, Ceiling)
    // 1 max per room (Reduced spawn rate significantly)
    const spawnTorch = Math.random() < 0.62; // 62% chance (Bumped +2%)
    if (spawnTorch) {
        const typeRoll = Math.random();
        const z = zOffset - 2 - Math.random() * 11;
        if (typeRoll < 0.7) {
            // Wall Torch (prefer right wall to avoid spelling)
            const sideX = (Math.random() < 0.8) ? 4.8 : -4.8;
            createTorch(sideX, 3.5, z, roomNum, 'wall');
        } else if (typeRoll < 0.75) {
            // Floor Torch (5% chance of all torches being this)
            const sideX = (Math.random() < 0.5) ? 4.2 : -4.2;
            createTorch(sideX, 0, z, roomNum, 'floor');
        } else {
            // Ceiling Torch - Adjusted down to 5.95 to match new ceiling bottom
            const x = (Math.random() - 0.5) * 6;
            createTorch(x, 5.95, z, roomNum, 'ceiling');
        }
    }

    // New Decorations Spawning
    const rummageSurfaces = [];

    // Wooden Stools: 15% chance
    if (Math.random() < 0.15) {
        // Count: 75% = 1 stool, 15% = 2 stools (remaining 10% also 1 for simplicity)
        const countRoll = Math.random();
        const stoolCount = countRoll < 0.75 ? 1 : 2;
        for (let i = 0; i < stoolCount; i++) {
            // Each stool picks a fully independent position anywhere in the room
            const sx = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 2.5);
            const sz = zOffset - 1.5 - Math.random() * 12;
            const hRoll = Math.random();
            const hType = hRoll < 0.5 ? 'short' : 'medium'; // No tall stools
            createStool(sx, sz, roomNum, hType, rummageSurfaces);
        }
    }

    // Hay: 82% chance (Bumped +2%)
    if (Math.random() < 0.82) {
        // Density Classes: Sparse (40%), Moderate (40%), Heavy (20%)
        const roll = Math.random();
        let clumpCount, baseDensity, spreadRadius;

        if (roll < 0.4) { // SPARSE
            clumpCount = 2 + Math.floor(Math.random() * 3);
            baseDensity = 0.6 + Math.random() * 0.6;
            spreadRadius = 2.5 + Math.random() * 1.5;
        } else if (roll < 0.8) { // MODERATE
            clumpCount = 4 + Math.floor(Math.random() * 3);
            baseDensity = 1.2 + Math.random() * 0.8;
            spreadRadius = 3.0 + Math.random() * 2.0;
        } else { // HEAVY
            clumpCount = 6 + Math.floor(Math.random() * 6);
            baseDensity = 1.8 + Math.random() * 1.2;
            spreadRadius = 4.0 + Math.random() * 3.0;
        }

        for (let i = 0; i < clumpCount; i++) {
            const x = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 2.5); // Clear central path
            const z = zOffset - 2 - Math.random() * 11;
            const density = baseDensity * (0.8 + Math.random() * 0.4);
            const radius = spreadRadius * (0.7 + Math.random() * 0.6);
            // Removed forbidden zone check - Hay is fine to overlap everything!
            createHay(x, z, roomNum, density, radius);
        }

        // 12% chance of spawning 1-2 hay bundles in rooms with ground hay (Bumped +2%)
        if (Math.random() < 0.12) {
            const count = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
                const bx = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 2.5); // Clear central path
                const bz = zOffset - 2 - Math.random() * 11;
                createHayBundle(bx, 0, bz, roomNum);
            }
        }
    }

    // Books & Scrolls: 17% chance (Bumped +2%)
    if (Math.random() < 0.17) {
        const x = (Math.random() > 0.5 ? 4.2 : -4.2);
        const z = zOffset - 2 - Math.random() * 11;
        if (Math.random() > 0.5) createBookPile(x, 0, z, roomNum);
        else createScrollPile(x, 0, z, roomNum);
    }

    // Broom/Mop: 17% chance (Bumped +2%)
    if (Math.random() < 0.17) {
        const sideX = (Math.random() > 0.5 ? 4.0 : -4.0);
        const z = zOffset - 2 - Math.random() * 11;
        // Broom moved back towards wall by 0.25 (from 0.5 offset to 0.25 offset)
        const broomX = sideX > 0 ? sideX - 0.25 : sideX + 0.25;
        if (Math.random() > 0.5) createBroom(broomX, 0, z, roomNum);
        else createMop(sideX, 0, z, roomNum);
    }

    // Wooden Bucket: 17% chance (Bumped +2%)
    if (Math.random() < 0.17) {
        const x = (Math.random() > 0.5 ? 4.2 : -4.2);
        const z = zOffset - 2 - Math.random() * 11;
        createWoodenBucket(x, 0, z, roomNum);
    }

    // Hanging Chains: 17% chance (Bumped +2%)
    if (Math.random() < 0.17) {
        const sideX = (Math.random() > 0.5 ? 4.8 : -4.8);
        const side = sideX > 0 ? 1 : -1;
        const z = zOffset - 2 - Math.random() * 11;
        const y = 5.8; // From ceiling
        createHangingChain(sideX, y, z, roomNum, side);
    }

    // New Rusted Ceiling Chains: 17% chance
    if (Math.random() < 0.17) {
        const x = (Math.random() - 0.5) * 8.5; // Throughout the ceiling
        const z = zOffset - 2 - Math.random() * 11;
        createCeilingChains(x, z, roomNum);
    }

    // Spider Webs: 17% chance (Bumped +2%)
    if (Math.random() < 0.17) {
        const count = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            const side = Math.random() > 0.5 ? -5.2 : 5.2; // Snap to walls
            const z = zOffset - 2 - Math.random() * 11;
            const y = 5.6 + Math.random() * 0.3; // Force to upper corners/ceiling
            createSpiderWeb(side, y, z, roomNum);
        }
    }

    [-4.72, 4.72].forEach(sideX => {
        if (Math.random() < 0.20) { // Check for a set of shackles
            const side = sideX > 0 ? 1 : -1;
            const zStart = zOffset - 2 - Math.random() * 8; // Start point
            const gap = 2 + Math.random(); // Distance between pair (2-3 units)
            const y = 3 + Math.random() * 2; // Height selection (3-5 units)

            createShackles(sideX, y, zStart, roomNum, side);
            createShackles(sideX, y, zStart - gap, roomNum, side);
        }
    });

    // Oozing Water / Slime: 22% chance per room
    if (Math.random() < 0.22) {
        const sideRoll = Math.random() > 0.5 ? 1 : -1;
        const x = sideRoll * 4.7; // Flush-ish with bricks (bricks face at ~4.75)

        // Snap to integer seams: Vertical seams are at zOffset - [1-14], 
        // Horizontal seams are at height [2, 3, 4, 5]
        const snapZ = 1 + Math.floor(Math.random() * 13);
        const z = zOffset - snapZ;
        const y = 2 + Math.floor(Math.random() * 4); // Integer heights 2, 3, 4, 5

        const rotY = (sideRoll === 1) ? -Math.PI / 2 : Math.PI / 2;

        const liquidRoll = Math.random();
        let color = 0x88ccff; // Clean water
        if (liquidRoll < 0.3) color = 0x556622; // Putrid Slime
        else if (liquidRoll < 0.5) color = 0x664422; // Rusty / Murky
        else if (liquidRoll < 0.55) color = 0x881111; // Dark Wine / Blood

        createOoze(x, y, z, rotY, color, roomNum);
    }


    // Randomized Skeleton Pose: 20% chance
    if (GlobalSettings.skeletonsEnabled && Math.random() < 0.20) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const z = zOffset - 3 - Math.random() * 10;
        const x = side * 4.4;
        const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2;

        const poses = ['LEANING', 'SITTING', 'LAYING', 'STRAIGHT'];
        const pose = poses[Math.floor(Math.random() * poses.length)];
        // Use exact ground level (0) because poses handle their own grounding
        const skel = createSkeleton(x, 0, z, rotY, pose);

        skel.userData.roomNumber = roomNum;
        dungeonGroup.add(skel);
    }

    // Tally Marks: 30% chance
    if (Math.random() < 0.30) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const tx = side * 4.98;
        const tz = zOffset - 2 - Math.random() * 10;
        const ty = 1.5 + Math.random() * 2.5;
        const trotY = side === 1 ? -Math.PI / 2 : Math.PI / 2;
        createTallyMarks(tx, ty, tz, trotY, roomNum);
    }

    // Benches: 15% chance
    if (Math.random() < 0.15) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const bx = side * 4.4;
        const bz = zOffset - 3 - Math.random() * 8;
        const brotY = side === 1 ? -Math.PI / 2 : Math.PI / 2;
        createBench(bx, bz, brotY, roomNum, rummageSurfaces);
    }

    // Brazier: 20% chance
    if (Math.random() < 0.20) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const brx = side * 4.2;
        const brz = zOffset - 3 - Math.random() * 9;
        const isLit = Math.random() < 0.5;
        createBrazier(brx, brz, roomNum, isLit);
    }

    // Broken Bricks: 25% chance
    if (Math.random() < 0.25) {
        const bbCount = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < bbCount; i++) {
            const bbx = (Math.random() > 0.5 ? 1 : -1) * (3.8 + Math.random() * 0.8);
            const bbz = zOffset - 2 - Math.random() * 11;
            createBrokenBricks(bbx, bbz, roomNum);
        }
    }

    // Wool Blankets: 12% chance
    if (Math.random() < 0.12) {
        const wbx = (Math.random() > 0.5 ? 1 : -1) * (4.0 + Math.random() * 0.5);
        const wbz = zOffset - 3 - Math.random() * 9;
        createWoolBlanketPile(wbx, wbz, roomNum);
    }

    // Rat Hole: 12% chance (Bumped +2%)
    if (Math.random() < 0.12) {
        const sideRoll = Math.random() > 0.5 ? 1 : -1;
        const x = sideRoll * 4.95;
        const z = zOffset - 5 - Math.random() * 8;
        const rotY = (sideRoll === 1) ? -Math.PI / 2 : Math.PI / 2;
        const ratHole = createRatHole(x, 0.25, z, rotY);
        roomGroup.add(ratHole);
        activeRats.push(ratHole);
    }

    // Straw Mat Bedroll: 5% chance (Dropped from 17% to make it rarer)
    if (Math.random() < 0.05) {
        const sideRoll = Math.random() > 0.5 ? 1 : -1;
        const x = sideRoll * 3.5;
        const z = zOffset - 4 - Math.random() * 8;
        createStrawMat(x, z, roomNum);
    }

    dungeonGroup.add(roomGroup);

    // RUMMAGE SPAWN: Frequency based on rummage percentage - Decoupled from furniture
    const roomRummage = items.getTotalStats().rummage || 0;
    // Guaranteed items for every 100% + chance for one more based on remainer
    const numRummageItems = Math.floor(roomRummage / 100) + (Math.random() * 100 < (roomRummage % 100) ? 1 : 0);

    for (let i = 0; i < numRummageItems; i++) {
        // Decide whether to use a furniture surface or just the floor
        if (rummageSurfaces.length > 0 && Math.random() < 0.6) {
            // Pick a furniture surface and remove it so we don't stack items too heavily
            const surf = rummageSurfaces.splice(Math.floor(Math.random() * rummageSurfaces.length), 1)[0];
            spawnRummageItem(surf.x, surf.y, surf.z, roomNum);
        } else {
            // Drop on floor
            const x = (Math.random() - 0.5) * 9.2; // Scattered across 10-unit floor
            const z = zOffset - 1 - (Math.random() * 13); // Scattered across 15-unit depth
            spawnRummageItem(x, 0.05, z, roomNum);
        }
    }
}

let dungeonDoor;
function createDoor(z, roomNum = currentRoom) {
    // Door is 3.2 wide, 4.2 high to match the 3x4 opening with slight overlap
    const doorGeo = new THREE.BoxGeometry(3.2, 4.2, 0.4);
    dungeonDoor = new THREE.Mesh(doorGeo, doorMat);
    dungeonDoor.userData.roomNumber = roomNum;
    // Offset Z slightly from -15 to -14.8 to avoid Z-fighting with the back wall
    dungeonDoor.position.set(0, 2.1, z + 0.2);
    const edges = new THREE.EdgesGeometry(doorGeo);
    const lines = new THREE.LineSegments(edges, lineMat);
    dungeonDoor.add(lines);
    dungeonGroup.add(dungeonDoor);
}

function createDecorativeDoor(z, roomNum = currentRoom) {
    const doorGeo = new THREE.BoxGeometry(3.2, 4.2, 0.4);
    const mesh = new THREE.Mesh(doorGeo, doorMat);
    mesh.userData.roomNumber = roomNum;
    mesh.position.set(0, 2.1, z - 0.2); // Offset slightly inward to avoid Z-fighting
    const edges = new THREE.EdgesGeometry(doorGeo);
    const lines = new THREE.LineSegments(edges, lineMat);
    mesh.add(lines);
    dungeonGroup.add(mesh);
    return mesh;
}

function clearPendingSpells() {
    if (spellTimeoutId) {
        clearTimeout(spellTimeoutId);
        spellTimeoutId = null;
    }
    activeSpells = [];
}

// ── Letter Rendering & Mechanics ─────────────────────────────────────────────
const textureCache = {};
function getLetterTexture(char, color = "#FFD700") {
    const key = `${char}_${color}`;
    if (textureCache[key]) return textureCache[key];

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 128, 160);

    if (color === 'effect-rainbow') {
        const grad = ctx.createLinearGradient(0, 40, 0, 120); // Vertical gradient
        grad.addColorStop(0, "#ff0000");
        grad.addColorStop(0.2, "#ffff00");
        grad.addColorStop(0.4, "#00ff00");
        grad.addColorStop(0.6, "#00ffff");
        grad.addColorStop(0.8, "#0000ff");
        grad.addColorStop(1, "#ff00ff");
        ctx.fillStyle = grad;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.font = "bold 90px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char, 64, 80);
        ctx.strokeText(char, 64, 80);
    } else if (color === 'effect-sparkle') {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 90px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char, 64, 80);
    } else {
        ctx.fillStyle = color;
        ctx.font = "bold 90px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char, 64, 80);
    }

    const tex = new THREE.CanvasTexture(canvas);
    textureCache[key] = tex;
    return tex;
}

function getErrorListTexture(letters) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128; // Standard block size for error display
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = "#ff4444";
    // Smaller font to fit multiple letters
    const fontSize = letters.length > 5 ? 20 : (letters.length > 2 ? 30 : 40);
    ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Join letters with space or comma if many, or stack? 
    // Let's just string them and wrap if needed.
    const text = letters.join(' ');
    ctx.fillText(text, 64, 64);

    return new THREE.CanvasTexture(canvas);
}

function getChalkTextTexture(text) {
    if (!text) text = "";
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Drawer chalkboard background: Pure Black
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    let fontSize = 70;
    const maxWidth = canvas.width - 100;
    const maxHeight = canvas.height - 100;
    let lines = [];
    let totalHeight = 0;

    // Use a more "handwritten" looking font if available, fallback to Courier
    while (fontSize > 20) {
        ctx.font = `italic ${fontSize}px 'Courier New', monospace`;
        const words = text.split(' ');
        lines = [];
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
            let testLine = currentLine + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(currentLine);
                currentLine = words[n] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        const lineHeight = fontSize * 1.3;
        totalHeight = lines.length * lineHeight;
        if (totalHeight <= maxHeight) break;
        fontSize -= 5;
    }

    ctx.font = `italic ${fontSize}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lineHeight = fontSize * 1.3;
    lines.forEach((l, i) => {
        const x = canvas.width / 2;
        const y = (canvas.height / 2) - (totalHeight / 2) + (i + 0.5) * lineHeight;

        // Render with "chalk" jitter for hand-drawn feel
        ctx.fillStyle = "rgba(255, 255, 250, 0.9)";
        ctx.fillText(l.trim(), x, y);

        // Secondary pass for "depth/dust"
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillText(l.trim(), x + 1.5, y + 1);
    });

    return new THREE.CanvasTexture(canvas);
}

function getGraffitiTexture(text) {
    if (!text) text = "";
    const canvas = document.createElement('canvas');
    canvas.width = 2048; // Large width to prevent clipping
    canvas.height = 1024; // Increased height to accommodate potential multi-line frantic scribbling
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let fontSize = 60;
    const maxWidth = canvas.width - 400; // Increased padding to prevent stylized font clipping

    // Random Color: White, Pure Black, or Deep Blood Red
    const colors = ["#ffffff", "#000000", "#600000"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Choose font
    const fonts = ["'Rock Salt'", "'Permanent Marker'"];
    const activeFont = fonts[Math.floor(Math.random() * fonts.length)];

    let lines = [];
    let totalHeight = 0;
    const maxHeight = canvas.height - 100;

    // Chance for bold text (25% chance)
    const isBold = Math.random() < 0.25;
    const fontWeight = isBold ? "bold " : "";

    // Dynamic shrink loop for frantic scribbling
    while (fontSize > 15) {
        ctx.font = `${fontWeight}${fontSize}px ${activeFont}, cursive`;
        let words = text.split(' ');
        lines = [];
        let currentLine = [];

        for (let i = 0; i < words.length; i++) {
            currentLine.push(words[i]);
            const testLine = currentLine.join(' ');
            const metrics = ctx.measureText(testLine);

            // Natural line break chance: 20% after 2 words
            const randomBreakChance = (currentLine.length >= 2 && Math.random() < 0.20);
            const shouldBreak = metrics.width > maxWidth || randomBreakChance;

            if (shouldBreak) {
                if (currentLine.length > 1 && !randomBreakChance) {
                    currentLine.pop();
                    lines.push(currentLine.join(' '));
                    currentLine = [words[i]];
                } else if (currentLine.length > 0) {
                    lines.push(currentLine.join(' '));
                    currentLine = randomBreakChance ? [] : [words[i]];
                }
            }
        }
        if (currentLine.length > 0) lines.push(currentLine.join(' '));

        const lineHeight = fontSize * 1.6;
        totalHeight = lines.length * lineHeight;
        if (totalHeight <= maxHeight) break;
        fontSize -= 5;
    }

    ctx.font = `${fontWeight}${fontSize}px ${activeFont}, cursive`;
    const lineHeight = fontSize * 1.6;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw characters one by one with jitter
    lines.forEach((line, lineIdx) => {
        const baseIndent = canvas.width / 2;
        const baseY = (canvas.height / 2) - (totalHeight / 2) + (lineIdx + 0.5) * lineHeight;

        const lineWords = line.split(' ');
        let currentX = baseIndent - ctx.measureText(line).width / 2;

        lineWords.forEach((word, wordIdx) => {
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const charWidth = ctx.measureText(char).width;

                ctx.save();
                const rot = (Math.random() - 0.5) * 0.15;
                const offY = (Math.random() - 0.5) * (fontSize * 0.1);
                const offX = (Math.random() - 0.5) * (charWidth * 0.1);

                ctx.translate(currentX + charWidth / 2 + offX, baseY + offY);
                ctx.rotate(rot);

                // Multi-pass scratch look
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                ctx.fillText(char, 1, 1);

                ctx.fillStyle = color;
                ctx.globalAlpha = 0.6 + Math.random() * 0.4;
                ctx.fillText(char, 0, 0);

                ctx.fillStyle = "rgba(255, 255, 255, 0.35)"; // Boosted highlight for dark colors
                ctx.fillText(char, -0.5, -0.5);

                ctx.restore();
                currentX += charWidth * (0.9 + Math.random() * 0.2);
            }

            // Word Spacing: erratic extra spaces or "tabs"
            if (wordIdx < lineWords.length - 1) {
                const spaceWidth = ctx.measureText(' ').width;
                // Randomly add extra space or a "tab" jump
                let multiplier = 2.2 + Math.random() * 2.5; // Base increased spacing
                if (Math.random() < 0.15) multiplier += 4.0; // "Tab" jump

                currentX += spaceWidth * multiplier;
            }
        });
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
}

function getWrappedTextTexture(text, color = "#ffffff", center = false, fontSizeOverride = null, customWidth = 1024, customHeight = 512) {
    if (!text) text = "";
    const canvas = document.createElement('canvas');
    canvas.width = customWidth;
    canvas.height = customHeight;
    const ctx = canvas.getContext('2d');

    let fontSize = fontSizeOverride || 60;
    const maxWidth = canvas.width - 40;
    const maxHeight = canvas.height - 40;
    let lines = [];
    let totalHeight = 0;

    // Dynamic shrink loop
    while (fontSize > 20) {
        ctx.font = `${fontSize}px 'Courier New', monospace`;
        const words = text.split(' ');
        lines = [];
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
            let testLine = currentLine + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(currentLine);
                currentLine = words[n] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        const lineHeight = fontSize * 1.2;
        totalHeight = lines.length * lineHeight;

        if (totalHeight <= maxHeight) break;
        fontSize -= 5;
    }

    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = color;
    ctx.font = `${fontSize}px 'Courier New', monospace`;
    ctx.textAlign = center ? "center" : "left";
    ctx.textBaseline = center ? "middle" : "top";

    const lineHeight = fontSize * 1.2;
    lines.forEach((l, i) => {
        const x = center ? canvas.width / 2 : 10;
        const y = center ? (canvas.height / 2) - (totalHeight / 2) + (i + 0.5) * lineHeight : 10 + i * lineHeight;
        ctx.fillText(l.trim(), x, y);
    });

    return new THREE.CanvasTexture(canvas);
}
let activeCoins = []; // Global list of coins for centralized update
let wordBricks = [];
let typedMeshes = []; // Parallel array for the typing feedback planes

let bossTitleMesh = null;
function clearWordMeshes() {
    if (bossTitleMesh) {
        dungeonGroup.remove(bossTitleMesh);
        if (bossTitleMesh.geometry) bossTitleMesh.geometry.dispose();
        if (bossTitleMesh.material) bossTitleMesh.material.dispose();
        bossTitleMesh = null;
    }
    wordBricks.forEach(b => {
        if (b.userData.letters) {
            b.userData.letters.forEach(l => { dungeonGroup.remove(l); if (l.geometry) l.geometry.dispose(); if (l.material) l.material.dispose(); });
        }
        if (b.userData.letterMesh) {
            dungeonGroup.remove(b.userData.letterMesh);
            if (b.userData.letterMesh.geometry) b.userData.letterMesh.geometry.dispose();
            if (b.userData.letterMesh.material) b.userData.letterMesh.material.dispose();
        }
        if (b.userData.errorMesh) {
            dungeonGroup.remove(b.userData.errorMesh);
            if (b.userData.errorMesh.geometry) b.userData.errorMesh.geometry.dispose();
            if (b.userData.errorMesh.material) b.userData.errorMesh.material.dispose();
        }
        dungeonGroup.remove(b);
        if (b.geometry) b.geometry.dispose();
    });
    wordBricks = [];

    typedMeshes.forEach(m => {
        dungeonGroup.remove(m);
        if (m.geometry) m.geometry.dispose();
        if (m.material) m.material.dispose();
    });
    typedMeshes = [];

    // STACK ORDER: 4. The Definition (y=-0.25) - cleaned up immediately
    if (definitionMesh) {
        dungeonGroup.remove(definitionMesh);
        if (definitionMesh.geometry) definitionMesh.geometry.dispose();
        if (definitionMesh.material) definitionMesh.material.dispose();
        definitionMesh = null;
    }

    synonymMeshes.forEach(m => {
        dungeonGroup.remove(m);
        if (m.geometry) m.geometry.dispose();
        if (m.material) m.material.dispose();
    });
    synonymMeshes = [];
    revealedSynonyms = [];
    if (originMesh) {
        dungeonGroup.remove(originMesh);
        if (originMesh.geometry) originMesh.geometry.dispose();
        if (originMesh.material) originMesh.material.dispose();
        originMesh = null;
    }
}

function setupWordBricks(word, customX = null, silent = false, customZ = null) {
    clearWordMeshes();

    // Speak the word once at start (unless silent)
    if (!silent) challenger.speakWord();

    // Dynamically calculate spacing so long words (>8 letters) don't clip off screen
    // Base spacing is 1.1, dropping down as length increases past 8
    let spacing = 1.1;
    if (word.length > 8) {
        spacing = Math.max(0.6, 1.1 - ((word.length - 8) * 0.08));
    }

    const isObscured = (bossActive && currentBossType === 'obscured');
    const displayWord = isObscured ? (word + " ".repeat(Math.max(0, 12 - word.length))) : word;

    const zDir = customX !== null ? 1 : -1;
    // Room N absolute center is 2.5 - (N-1) * 15
    const absRoomCenterZ = 2.5 - (currentRoom - 1) * 15;
    const centerZ = customZ !== null ? customZ : absRoomCenterZ;

    // Obscured boss starts bricks at the far left wall (Z offset +6.5 approx)
    let startZ = centerZ - zDir * (displayWord.length - 1) * spacing / 2;
    if (isObscured) {
        startZ = centerZ + 6.0; // Fixed start at left wall
    }

    const xPos = customX !== null ? customX : -4.5;
    const rotY = customX !== null ? -Math.PI / 2 : Math.PI / 2;

    for (let i = 0; i < displayWord.length; i++) {
        const brickZ = startZ + i * spacing * zDir;
        const charAt = displayWord[i];

        // STACK ORDER: 1. Error Display (y=4.0) - lowered by 0.25
        const errorMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * spacing, 0.8), new THREE.MeshBasicMaterial({
            map: getLetterTexture("?", "#cc2200"),
            transparent: true,
            opacity: 0
        }));
        errorMesh.position.set(xPos + (customX !== null ? -0.52 : 0.52), 4.0, brickZ);
        errorMesh.rotation.y = rotY;
        errorMesh.userData.roomNum = currentRoom;
        dungeonGroup.add(errorMesh);

        // STACK ORDER: 2. Letter Bricks (y=3.35) - raised by 0.1
        const brick = createBrick(xPos, 3.35, brickZ, 1, 1, 1, wordBrickMat);
        brick.userData.roomNum = currentRoom;
        dungeonGroup.add(brick);

        const letterGeo = new THREE.PlaneGeometry(0.8 * spacing, 0.8);
        const letterMat = new THREE.MeshBasicMaterial({
            map: getLetterTexture(charAt || " ", "#ff8800"),
            transparent: true,
            side: THREE.DoubleSide
        });
        const letterMesh = new THREE.Mesh(letterGeo, letterMat);
        letterMesh.position.set(xPos + (customX !== null ? -0.5 : 0.5), 3.35, brickZ);
        letterMesh.rotation.y = rotY;
        letterMesh.visible = false;
        letterMesh.userData.roomNum = currentRoom;
        dungeonGroup.add(letterMesh);

        // Merge existing userData with new metadata
        brick.userData = Object.assign(brick.userData || {}, {
            letter: charAt,
            revealed: false,
            letterMesh: letterMesh,
            errorMesh: errorMesh,
            mistakes: []
        });
        wordBricks.push(brick);

        // Update the letter display for dummy bricks
        if (i >= word.length) {
            letterMat.map = getLetterTexture("∅", "#ff4444");
        }

        // STACK ORDER: 3. Input Display (y=2.35) - raised by 0.1
        const typedMat = new THREE.MeshBasicMaterial({
            map: getLetterTexture(" ", "#00d4ff"), // Start blank
            transparent: true,
            side: THREE.DoubleSide
        });
        const typedMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * spacing, 0.8), typedMat);
        typedMesh.position.set(xPos + (customX !== null ? -0.5 : 0.5), 2.35, brickZ);
        typedMesh.rotation.y = rotY;
        typedMesh.userData.roomNum = currentRoom;
        dungeonGroup.add(typedMesh);
        typedMeshes.push(typedMesh);
    }

    // Boss Title Rendering (y=5.2)
    if (bossActive && !bossTitleMesh) {
        const bossNames = {
            'pop-quiz': 'POP QUIZ!',
            'silent': 'THE SILENT ONE',
            'blind': 'THE INKLORD',
            'obscured': 'THE OBSCURER',
            'standard': 'THE GUARDIAN'
        };
        const displayName = bossNames[currentBossType] || 'BOSS ENCOUNTER';

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = "bold 55px 'Special Elite', cursive";
        ctx.fillStyle = "#ffcc00"; // Boss gold
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.lineWidth = 4;
        ctx.strokeText(displayName, 256, 60);
        ctx.fillText(displayName, 256, 60);

        const tex = new THREE.CanvasTexture(canvas);
        const geo = new THREE.PlaneGeometry(4, 0.95);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        bossTitleMesh = new THREE.Mesh(geo, mat);
        // Lowered Y from 5.3 to 3.8 so it fits nicely on screen while camera is at Y=2
        bossTitleMesh.position.set(xPos + (customX !== null ? -0.55 : 0.55), 4.8, centerZ);
        bossTitleMesh.rotation.y = rotY;
        bossTitleMesh.userData.roomNum = currentRoom;
        dungeonGroup.add(bossTitleMesh);
    }
    // STACK ORDER: 4. The Definition (y=-0.25) - cleaned up by clearWordMeshes()

    const defGeo = new THREE.PlaneGeometry(5.6, 1.6);
    const defMat = new THREE.MeshBasicMaterial({
        map: getWrappedTextTexture(challenger.currentWordData.definition, "#ffffff", false, 54, 1024, 292),
        transparent: true,
        side: THREE.DoubleSide
    });
    definitionMesh = new THREE.Mesh(defGeo, defMat);
    const zOffsetForTip = (TUTORIAL_TIPS[currentRoom] ? -2.0 : 0);
    // Shrink by 25%: centered at 1.0 (spans 0.2 to 1.8). Bricks bottom at 2.85. Very safe and clean.
    definitionMesh.position.set(xPos + (customX !== null ? -0.55 : 0.55), 1.0, absRoomCenterZ + zOffsetForTip);
    definitionMesh.rotation.y = rotY;
    definitionMesh.visible = showDefinition;
    dungeonGroup.add(definitionMesh);
    updateBrickHighlighters();
}

function evaluateGuess() {
    if (currentState !== GameState.PLAYING) return;
    if (isTransitioning) return; // Block input while moving rooms
    if (isShopRoom) return;

    const typed = WORD_INPUT.value.toUpperCase();
    const isObscured = (bossActive && currentBossType === 'obscured');
    const baseTarget = (challenger.currentWordData && challenger.currentWordData.word) ? challenger.currentWordData.word.toUpperCase() : "";
    const target = isObscured ? (baseTarget + " ".repeat(wordBricks.length - baseTarget.length)) : baseTarget;

    if (isChestRoom) {
        handleChestGuess(typed, target);
        return;
    }

    let mistakes = 0;
    let anyNewReveal = false;

    // Evaluate characters up to the length of the typed guess
    for (let i = 0; i < typed.length && i < wordBricks.length; i++) {
        const brick = wordBricks[i];
        if (brick.userData.revealed) continue;

        if (typed[i] === target[i]) {
            revealBrick(brick);
            anyNewReveal = true;
        } else {
            showMistake(brick, typed[i]);
            mistakes++;
            wordMistakes++; // Global word mistake tracker
        }
    }

    // Penalty for incomplete words (Disabled for Obscurer boss to allow length guessing)
    if (typed.length < target.length && !isObscured) {
        const missingCount = target.length - typed.length;
        mistakes += missingCount;
        wordMistakes += missingCount;
        showToast("INCOMPLETE!");

        // Show mistake indicator on unaddressed bricks
        for (let i = typed.length; i < wordBricks.length; i++) {
            const brick = wordBricks[i];
            if (!brick.userData.revealed) {
                showMistake(brick, "_");
            }
        }
    }

    if (mistakes > 0) {
        applyDamageFromMistakes(mistakes);
    }

    if (anyNewReveal) {
        createSpellBurst(MageConfig.spellColor); // Match player color
    }

    WORD_INPUT.value = '';

    // Check if the whole word is now revealed
    checkWordSolved();
    updateUI();
}

function revealBrick(brick, isSpell = false, noGold = false) {
    if (!brick || brick.userData.revealed) return;

    brick.userData.revealed = true;
    brick.userData.errorMesh.material.opacity = 0;
    if (brick.userData.letterMesh) brick.userData.letterMesh.visible = true;

    // Cascade logic: If revealed by a spell, check for accidental reveal of neighbors
    if (isSpell) {
        const stats = items.getTotalStats();
        if (stats.cascade > 0 && Math.random() * 100 < stats.cascade) {
            const index = wordBricks.indexOf(brick);
            const neighbors = [];
            if (index > 0 && !wordBricks[index - 1].userData.revealed) neighbors.push(wordBricks[index - 1]);
            if (index < wordBricks.length - 1 && !wordBricks[index + 1].userData.revealed) neighbors.push(wordBricks[index + 1]);

            if (neighbors.length > 0) {
                const triggerNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                setTimeout(() => {
                    showToast("CASCADE!");
                    createSpellBurst("#00d4ff", triggerNeighbor.position);
                    revealBrick(triggerNeighbor, true); // Cascade can chain
                    checkWordSolved();
                }, 150);
            }
        }
    }

    // CREATE SHATTER EFFECT
    createStoneShatter(brick.position.clone());

    if (!noGold) {
        // NEW Progressive Gold Drop System
        const stats = items.getTotalStats();
        const goldBonus = 1 + ((stats.gold_bonus || 0) / 100);
        const tierMultiplier = Math.pow(1.05, (library ? library.currentTier : 1) - 1); // 5% growth per tier

        // Tier 1 Base Distribution: 15% nothing, 85% gold. 
        let baseAmount = 0;
        const dropRoll = Math.random();
        if (dropRoll >= 0.15) {
            const stackRoll = Math.random();
            if (stackRoll < 0.06) baseAmount = 5;      // 6% chance: 5g
            else if (stackRoll < 0.14) baseAmount = 4; // 8% chance: 4g
            else if (stackRoll < 0.26) baseAmount = 3; // 12% chance: 3g
            else if (stackRoll < 0.40) baseAmount = 2; // 14% chance: 2g
            else baseAmount = 1;                       // 60% chance: 1g
        }

        // Apply Tier and Item multipliers
        const rawTotal = baseAmount * tierMultiplier * goldBonus;

        // Probabilistic Rounding: 2.2 gold = 2 gold with 80% chance, 3 gold with 20% chance
        let finalAmount = Math.floor(rawTotal);
        if (Math.random() < (rawTotal - finalAmount)) {
            finalAmount += 1;
        }

        for (let i = 0; i < finalAmount; i++) {
            createFallingCoin(brick.position.clone());
        }
    }

    // Remove the old brick immediately
    dungeonGroup.remove(brick);
}

function createStoneShatter(pos) {
    const fragmentCount = 12;
    const pieces = [];

    // Create random small shards
    for (let i = 0; i < fragmentCount; i++) {
        // Variation in shard sizes
        const s = 0.1 + Math.random() * 0.25;
        const geom = new THREE.BoxGeometry(s, s, s);
        const mat = wordBrickMat.clone();
        mat.transparent = true;

        const piece = new THREE.Mesh(geom, mat);
        piece.position.copy(pos);

        // Random explode velocity (Very tight spread so pieces fall mostly downward)
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.0575, // Tight X (+15% spread)
            (Math.random() * 0.1) + 0.06,  // Slower upward pop
            (Math.random() - 0.5) * 0.0575  // Tight Z (+15% spread)
        );

        const rotationSpeed = new THREE.Vector3(
            Math.random() * 0.1,
            Math.random() * 0.1,
            Math.random() * 0.1
        );

        piece.userData = { velocity, rotationSpeed };
        dungeonGroup.add(piece);
        pieces.push(piece);
    }

    const startTime = Date.now();
    const duration = 1200;

    function animShatter() {
        const elapsed = Date.now() - startTime;
        const p = elapsed / duration;

        if (p >= 1) {
            pieces.forEach(piece => {
                dungeonGroup.remove(piece);
                if (piece.geometry) piece.geometry.dispose();
                if (piece.material) piece.material.dispose();
            });
            return;
        }

        pieces.forEach(piece => {
            const v = piece.userData.velocity;
            const r = piece.userData.rotationSpeed;

            // Physics: Update position and apply gravity
            piece.position.add(v);
            v.y -= 0.02; // Heavier gravity effect

            // Spin
            piece.rotation.x += r.x;
            piece.rotation.y += r.y;
            piece.rotation.z += r.z;

            // Fade out
            if (p > 0.6) {
                piece.material.opacity = 1 - ((p - 0.6) / 0.4);
            }
        });

        requestAnimationFrame(animShatter);
    }

    requestAnimationFrame(animShatter);
}

/**
 * Creates a visual gold coin that pops out of a block,
 * falls to the floor, and eventually fades away.
 */
function createFallingCoin(pos) {
    const coinGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 10); // Lower segments (12->10)
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.position.copy(pos);
    coin.rotation.x = Math.PI / 2;

    const popDirection = pos.x < 0 ? 1 : -1;
    const velocity = new THREE.Vector3(
        (popDirection * 0.02) + (Math.random() - 0.5) * 0.01,
        (Math.random() * 0.06) + 0.02,
        (Math.random() - 0.5) * 0.03
    );

    const rotationSpeed = new THREE.Vector3(
        Math.random() * 0.1,
        Math.random() * 0.1,
        Math.random() * 0.1
    );

    coin.userData = { velocity, rotationSpeed, landed: false, collected: false, roomNumber: currentRoom };
    dungeonGroup.add(coin);
    activeCoins.push(coin);
}

function updateCoins(deltaTime) {
    for (let i = activeCoins.length - 1; i >= 0; i--) {
        const coin = activeCoins[i];
        if (!coin.parent) {
            activeCoins.splice(i, 1);
            continue;
        }

        const v = coin.userData.velocity;
        const r = coin.userData.rotationSpeed;

        if (!coin.userData.landed) {
            coin.position.add(v);
            v.y -= 0.012; // Gravity
            coin.rotation.x += r.x;
            coin.rotation.y += r.y;
            coin.rotation.z += r.z;

            // Stop at floor
            if (coin.position.y <= 0.01) {
                coin.position.y = 0.01;
                coin.rotation.set(0, Math.random() * Math.PI * 2, 0);
                coin.userData.landed = true;
                v.set(0, 0, 0);
            }
        } else {
            // Gentle periodic spin while on floor
            coin.rotation.y += 0.015;
        }

        // Auto-collection proximity (if player walks close)
        if (!coin.userData.collected) {
            const dist = coin.position.distanceTo(camera.position);
            if (dist < 1.0) {
                collectIndividualCoin(coin, i);
            }
        }
    }
}

function collectIndividualCoin(coin, index) {
    coin.userData.collected = true;
    playerGold += 1;
    updateUI();
    // No more "flying to player" (too laggy), just fade/pop
    createSpellBurst("#ffcc00", 2, coin.position);
    dungeonGroup.remove(coin);
    activeCoins.splice(index, 1);
}

function collectAllRoomCoins() {
    let total = 0;
    for (let i = activeCoins.length - 1; i >= 0; i--) {
        const coin = activeCoins[i];
        // Only collect coins from the current/previous room we are finishing
        if (coin.userData.roomNumber <= currentRoom) {
            total++;
            dungeonGroup.remove(coin);
            if (coin.geometry) coin.geometry.dispose();
            activeCoins.splice(i, 1);
        }
    }
    if (total > 0) {
        playerGold += total;
        createRisingText(`🪙 +${total} GOLD`, "#ffcc00", "gold-ui");
        updateUI();
        saveGameData();
    }
}

function showMistake(brick, char) {
    if (!brick.userData.mistakes.includes(char)) {
        brick.userData.mistakes.push(char);
    }
    const errorMesh = brick.userData.errorMesh;
    errorMesh.material.map = getErrorListTexture(brick.userData.mistakes);
    const isBlind = bossActive && currentBossType === 'blind';
    errorMesh.material.opacity = (GlobalSettings.errorsEnabled && !isBlind) ? 1 : 0;

    // Simple shake animation in Z axis
    const startZ = errorMesh.position.z;
    const startTime = Date.now();
    function shake() {
        const p = (Date.now() - startTime) / 300;
        if (p < 1) {
            errorMesh.position.z = startZ + Math.sin(p * 20) * 0.1;
            requestAnimationFrame(shake);
        } else {
            errorMesh.position.z = startZ;
        }
    }
    shake();
}

function showToast(text) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 1850);
}

function showItemDrop(item, equipped = false) {
    const display = document.getElementById('item-drop-display');
    if (!display) return;

    const rarityColor = (item.rarity && item.rarity.color) ? item.rarity.color : '#ffffff';
    const rarityName = (item.rarity && item.rarity.name) ? item.rarity.name : 'NORMAL';
    const statusText = equipped ? "EQUIPPED" : "FOUND";

    let statsHtml = '';
    const itemStats = item.stats || {};

    // Categorize stats for layout
    const basicStats = {
        hp: 'HP', ink: 'INK', hp_regen: 'HP REGEN', ink_regen: 'INK REGEN',
        armor: 'ARMOR', lockpick: 'LOCKPICKING'
    };

    const magicStats = {
        'first_letter_chance': 'Foresight',
        'last_letter_chance': 'Conclusion',
        'double_letter_chance': 'Echoes',
        'random_letter_chance': 'Chaos',
        'time_warp': 'Time Warp',
        'glow': 'Illumination',
        'rummage': 'Rummage',
        'gold_bonus': 'Gold Bonus',
        'shop_discount': 'Shop Discount',
        'cascade': 'Cascade',
        'interest': 'Interest'
    };

    Object.entries(basicStats).forEach(([key, label]) => {
        const val = itemStats[key];
        if (val) {
            statsHtml += `<div class="basic-stat">${val > 0 ? '+' : ''}${val} ${label}</div>`;
        }
    });

    display.innerHTML = `
        <div class="drop-card-content" style="border-color: ${rarityColor}">
            <div id="drop-sprite">${getItemIconHtml(item, 80)}</div>
            <div id="drop-name" style="color: ${rarityColor}">${item.name}</div>
            <div id="drop-rarity" style="color: ${rarityColor}">${rarityName} • ${statusText}</div>
            <div id="drop-stats">
                ${statsHtml}
                ${item.ability ? `<div class="magic-stat">SPELL: ${item.ability.name}</div>` : ''}
                ${Object.entries(magicStats).map(([key, label]) => {
        const val = itemStats[key];
        if (val) {
            const suffix = percentStats.includes(key) ? '%' : '';
            return `<div class="magic-stat">PASSIVE: ${label} (${val > 0 ? '+' : ''}${val}${suffix})</div>`;
        }
        return '';
    }).join('')}
            </div>
        </div>
    `;
    display.style.display = 'block';

    // Clear after 5 seconds
    if (display.dropTimer) clearTimeout(display.dropTimer);
    display.dropTimer = setTimeout(() => {
        display.style.display = 'none';
        display.innerHTML = '';
    }, 5000);
}

function createRisingText(text, color, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = 'rising-text';
    popup.textContent = text;
    popup.style.color = color;
    // Center the text horizontally over the element
    // Ensure we account for the text width itself by using transform in CSS or calc here
    popup.style.left = (rect.left + rect.width / 2) + 'px';
    popup.style.top = (rect.top) + 'px';
    // Add centering to the style
    popup.style.transform = 'translateX(-50%)';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2000);
}

// ── Particle System with Pooling ───────────────────────────────────────────
let particles = [];
const PARTICLE_GEOMETRY = new THREE.SphereGeometry(0.1, 4, 4);
const MAX_PARTICLES = 150;
const particleMeshPool = [];

// Pre-allocate meshes to avoid allocation during gameplay
function initParticlePool() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
        const mesh = new THREE.Mesh(PARTICLE_GEOMETRY, new THREE.MeshBasicMaterial({ transparent: true }));
        mesh.visible = false;
        scene.add(mesh);
        particleMeshPool.push(mesh);
    }
}
initParticlePool();

function createSpellBurst(style) {
    const burstSize = GlobalSettings.performanceMode ? 12 : 25;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    let count = 0;

    const rainbowColors = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#8b00ff"];

    for (let i = 0; i < particleMeshPool.length && count < burstSize; i++) {
        const pMesh = particleMeshPool[i];
        if (pMesh.visible) continue;

        pMesh.visible = true;
        pMesh.material.visible = true;

        // Handle Special Styles
        if (style === 'effect-rainbow') {
            pMesh.material.color.set(rainbowColors[Math.floor(Math.random() * rainbowColors.length)]);
        } else if (style === 'effect-sparkle') {
            pMesh.material.color.set(Math.random() > 0.5 ? "#ffffff" : "#cccccc");
        } else {
            pMesh.material.color.set(style || "#ffffff");
        }

        pMesh.material.opacity = 1;
        pMesh.position.copy(camera.position).addScaledVector(forward, 1);

        const scaleBase = (style === 'effect-sparkle') ? (Math.random() * 0.8 + 0.2) : 1;
        pMesh.scale.setScalar(scaleBase);

        particles.push({
            mesh: pMesh,
            vel: new THREE.Vector3(
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4
            ).addScaledVector(forward, 0.2),
            life: 1,
            isSparkle: (style === 'effect-sparkle')
        });
        count++;
    }
}

function clearAllRooms() {
    // 1. Dispose of all 3D objects in the dungeonGroup
    if (dungeonGroup) {
        const toKill = [];
        dungeonGroup.children.forEach(c => toKill.push(c));
        toKill.forEach(c => {
            disposeHierarchy(c); // Ensure materials and geometries are freed from GPU memory
            dungeonGroup.remove(c);
        });
    }

    // 2. Clear global simulation lists to prevent legacy logic from running
    candleLights.concat(brazierLights).forEach(c => {
        if (c.light) {
            if (c.light.dispose) c.light.dispose();
            if (c.light.parent) c.light.parent.remove(c.light);
        }
    });
    candleLights = [];
    brazierLights = [];
    activeRats = [];
    activeCoins = [];
    branchDoorMeshes = [];
    particles = [];
}


function renderScores() {
    const list = document.querySelector('#scores-list');
    if (!list) return;
    const scores = Persistence.getHighScores();

    const listNames = { 'inkling': 'Inkling', 'sat': 'SAT Words', 'doozies': 'Doozies' };
    const modeNames = { 'random': 'Random', 'adventure': 'Adventure' };

    list.innerHTML = scores.map((s, i) => {
        const level = Math.ceil(s.rooms / 10);
        return `
        < div class="score-item" >
            <div class="score-rank">#${i + 1}</div>
            <div class="score-main">
                <div class="score-row-top">
                    <span class="score-name">${escapeHtml(s.name)}</span>
                    <span class="score-value">Level ${level} • Room ${s.rooms}</span>
                </div>
                <div class="score-row-bot">
                    <span class="score-meta">${modeNames[s.mode] || 'Standard'} • ${listNames[s.wordList] || 'General'}</span>
                    <span class="score-words">${s.words} Words</span>
                </div>
            </div>
        </div >
        `}).join('') || '<p style="text-align:center; padding: 2rem;">No heroes yet...</p>';
}

// ── Event Handlers ─────────────────────────────────────────────────────────
function triggerSmoothStart() {
    runFadeTransition(800, () => {
        // New run: clear any active saves
        // SETUP SEAMLESS START
        items.reset();
        const activeProfile = ProfileManager.getActiveProfile();
        if (activeProfile) {
            activeProfile.savedRun = null;
            activeProfile.itemData = items.serialize();
            activeProfile.wordList = GlobalSettings.wordList;
            ProfileManager.saveActiveProfile(activeProfile);
        }

        // SETUP SEAMLESS START
        const stats = items.getTotalStats();
        score = 0;
        health = baseMaxHealth + stats.hp;
        ink = baseMaxInk + stats.ink;
        playerGold = 0;
        roomProgress = 0;
        currentRoom = 1;
        library.currentTier = 1;
        lockpickConsumableBonus = 0;

        clearAllRooms(); // MUST CLEAR ENTIRE SCENE BEFORE RE-BUILDING
        applyRoomSkin(1);
        spawnRoom(10, 1, true); // Physically build Room 1

        startTransitionToDungeon(false, null, true); // skipAnimation = true
    });
}

function startNewRunFromMenu() {
    // New run: clear any active saves
    Persistence.clearRun();
    items.reset();
    const activeProfile = ProfileManager.getActiveProfile();
    if (activeProfile) {
        activeProfile.savedRun = null;
        activeProfile.itemData = items.serialize();
        activeProfile.wordList = GlobalSettings.wordList; // Sync current list choice to profile
        ProfileManager.saveActiveProfile(activeProfile);
    }

    // SETUP SEAMLESS START
    const stats = items.getTotalStats();
    score = 0;
    health = baseMaxHealth + stats.hp;
    ink = baseMaxInk + stats.ink;
    playerGold = 0; // [DEV] was 5000 for playtesting - restore: playerGold = 5000;
    roomProgress = 0;
    currentRoom = 0; // Lobby is room 0; gameplay starts at room 1 after transition
    library.currentTier = 1;
    lockpickConsumableBonus = 0;
    doctorsNoteUsedCount = 0;

    // NOTE: Do NOT call clearAllRooms() here — the lobby (room 0) is already set up
    // by spawnLobby() when the menu state was entered. Clearing everything would
    // destroy it before the walk-in animation plays.
    // Any old dungeon rooms are cleared inside finishStartup after the camera arrives.
    applyRoomSkin(0);
    finalBossRewardPending = false;

    startTransitionToDungeon(false, null, false);
}

const startBtn = document.querySelector('#start-btn');
if (startBtn) startBtn.onclick = startNewRunFromMenu;

const continueBtn = document.querySelector('#continue-run-btn');
if (continueBtn) {
    continueBtn.onclick = () => {
        const activeProfile = ProfileManager.getActiveProfile();
        const r = activeProfile ? activeProfile.savedRun : Persistence.loadRun();
        if (r) {
            // Restore run state
            currentRoom = r.room;
            score = r.score;
            health = r.health;
            ink = r.ink;
            playerGold = r.playerGold || 0;
            consonantPool = r.consonantPool || 0;
            vowelPool = r.vowelPool || 0;
            roomProgress = r.roomProgress || 0;
            library.currentTier = r.currentTier || 1;
            challenger.currentMode = r.mode || ChallengeMode.ADVENTURE;

            // Restore Boss State
            bossActive = r.bossActive || false;
            currentBossType = r.currentBossType || 'standard';
            bossWordsCompleted = r.bossWordsCompleted || 0;
            bossTargetWords = r.bossTargetWords || 0;
            if (activeProfile && r.bossCycle) {
                activeProfile.bossCycle = r.bossCycle;
                ProfileManager.saveActiveProfile(activeProfile);
            }

            // Restore exact word to prevent save-scumming
            if (r.currentWord) {
                const fullData = library.getWords().find(w => w.word === r.currentWord);
                if (fullData) {
                    challenger.currentWordData = fullData;
                } else {
                    challenger.currentWordData = { word: r.currentWord, definition: "Mystery Word" };
                }
            }

            // Restore stable room roll to prevent savescumming room type
            currentRoomRoll = r.roomRoll || null;

            // Restore items
            if (r.itemData) items.deserialize(r.itemData);

            lockpickConsumableBonus = r.lockpickConsumableBonus || 0;
            doctorsNoteUsedCount = r.doctorsNoteUsedCount || 0;
            shopRoomItems = r.shopRoomItems || null;
        }

        if (!r) return;

        // SETUP SEAMLESS CONTINUE
        const roomEntrance = 10 - (currentRoom - 1) * 15;
        spawnLobby(roomEntrance + 15);
        applyRoomSkin(currentRoom);
        spawnRoom(roomEntrance, currentRoom, true);

        startTransitionToDungeon(true, r); // Pass the snapshot explicitly
    };
}

const abandonBtn = document.querySelector('#abandon-run-btn');
if (abandonBtn) {
    abandonBtn.onclick = () => {
        if (confirm("Abandon this run? Your current progress, gold, and all items will be lost.")) {
            Persistence.clearRun();
            items.reset();
            const activeProfile = ProfileManager.getActiveProfile();
            if (activeProfile) {
                activeProfile.savedRun = null;
                activeProfile.itemData = items.serialize();
                ProfileManager.saveActiveProfile(activeProfile);
            }
            clearAllRooms(); // Clear any leftover room logic visually too
            setGameState(GameState.MENU); // Returns to menu and rebuilds lobby via setGameState
            updateInventoryUI();
            updateUI();
        }
    };
}

function startTransitionToDungeon(isContinuing = false, snapshotOverride = null, skipAnimation = false) {
    isTransitioning = true; // Protect the transition

    // Find whichever menu is currently visible to fade it out
    const activeMenu = SCREENS[currentState];
    if (activeMenu) activeMenu.classList.add('menu-fade-out');

    // Immediate Ko-fi Hide
    const kofiElements = document.querySelectorAll('[class*="kofi"], [id*="kofi"], [class*="floatingchat"], [class*="floating-chat"], [class*="kofi-link"], [class*="close"]');
    kofiElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
    document.body.classList.remove('state-menu');
    document.body.classList.add('state-playing');

    // For a fresh run, advance to room 1 NOW so it's pre-built before the camera walk
    if (!isContinuing && currentRoom === 0) {
        currentRoom = 1;
        spawnRoom(10, 1, true); // Room 1: entrance at Z=10, center at Z=2.5
    }

    const roomEntrance = 10 - (currentRoom - 1) * 15;
    const roomCenter = 2.5 - (currentRoom - 1) * 15;

    const finishStartup = () => {
        if (activeMenu) {
            activeMenu.style.display = 'none';
            activeMenu.classList.remove('menu-fade-out');
        }

        // CLEAN UP LOBBY
        clearRoom(0);
        lobbyDoor = null;

        setGameState(GameState.PLAYING, true); // skipReset=true

        const snapshot = snapshotOverride || Persistence.loadRun();
        const savedWord = snapshot ? snapshot.currentWord : null;

        // Now that we are physically in the room center, trigger gameplay logic
        enterRoomSequence(true, savedWord);

        applySkinAtmosphereImmediate();
        const TOOL_BAR = document.getElementById('tool-bar');
        if (TOOL_BAR) TOOL_BAR.style.display = 'flex';
        WORD_INPUT.style.display = 'block';
        updateUI();
        isTransitioning = false;
    };

    if (skipAnimation) {
        // Direct teleport
        camera.position.set(0, 2, roomCenter);
        camera.rotation.set(0, 0, 0);
        targetRotation.y = 0;
        finishStartup();
    } else {
        setTimeout(() => {
            slideDoorOpen(lobbyDoor);
            setTimeout(() => {
                // Walk camera from lobby start through lobby door all the way to room 1 center
                animateCamera(new THREE.Vector3(0, 2, roomCenter), 0, 2500, finishStartup);
            }, 600);
        }, 1200);
    }
}
document.querySelector('#profiles-btn').onclick = () => {
    buildProfileUI();
    setGameState(GameState.PROFILES);
};
document.querySelector('#scores-btn').onclick = () => setGameState(GameState.SCORES);
document.querySelector('#settings-btn').onclick = () => setGameState(GameState.SETTINGS);
const graphicsBtn = document.querySelector('#graphics-btn');
if (graphicsBtn) graphicsBtn.onclick = () => setGameState(GameState.GRAPHICS);

function populateVoiceList() {
    const selector = document.getElementById('voice-selector');
    if (!selector) return;

    const voices = challenger.getAvailableVoices();
    selector.innerHTML = '';

    if (voices.length === 0 && !navigator.onLine) {
        const opt = document.createElement('option');
        opt.textContent = "No voices found";
        selector.appendChild(opt);
        return;
    }

    voices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name}${v.localService ? ' (Offline)' : ''} `;

        // Priority for selection: 1. Saved preference, 2. Currently active voice in challenger
        if (GlobalSettings.preferredVoice) {
            if (v.name === GlobalSettings.preferredVoice) opt.selected = true;
        } else if (challenger.voice && v.name === challenger.voice.name) {
            opt.selected = true;
        }

        selector.appendChild(opt);
    });

    // Add Virtual Google Online option at the top if online
    if (navigator.onLine) {
        const googleOpt = document.createElement('option');
        googleOpt.value = 'GOOGLE_ONLINE';
        googleOpt.textContent = 'Google Online (Premium)';

        // If Google Online is the active voice or saved preference, select it
        if (GlobalSettings.preferredVoice === 'GOOGLE_ONLINE' ||
            (!GlobalSettings.preferredVoice && challenger.voice && challenger.voice.name === 'GOOGLE_ONLINE')) {
            googleOpt.selected = true;
        }

        selector.prepend(googleOpt);
    }
}
window.speechSynthesis.onvoiceschanged = () => {
    populateVoiceList();
};

function initSettingsUI() {
    const candleToggle = document.querySelector('#candles-toggle');
    if (candleToggle) candleToggle.checked = GlobalSettings.candlesEnabled;
    const errorToggle = document.querySelector('#errors-toggle');
    if (errorToggle) errorToggle.checked = GlobalSettings.errorsEnabled;
    const volSlider = document.querySelector('#volume-slider');
    if (volSlider) volSlider.value = GlobalSettings.volume;
    const perfToggle = document.querySelector('#performance-toggle');
    if (perfToggle) perfToggle.checked = GlobalSettings.performanceMode;
    const hbToggle = document.querySelector('#headbob-toggle');
    if (hbToggle) hbToggle.checked = GlobalSettings.headBobEnabled;
    populateVoiceList();
}

window.speechSynthesis.onvoiceschanged = () => {
    if (currentState === GameState.SETTINGS) populateVoiceList();
};

const voiceSelector = document.getElementById('voice-selector');
if (voiceSelector) {
    voiceSelector.onchange = (e) => {
        challenger.setVoiceByName(e.target.value);
        saveGameData();
    };
}

const volSlider = document.getElementById('volume-slider');
if (volSlider) {
    volSlider.oninput = (e) => {
        const val = parseInt(e.target.value);
        GlobalSettings.volume = val;
        challenger.volume = val / 100;
        saveGameData();
    };
}

const perfToggle = document.getElementById('performance-toggle');
if (perfToggle) {
    perfToggle.onchange = (e) => {
        GlobalSettings.performanceMode = e.target.checked;
        saveGameData();

        // Apply immediate changes
        if (GlobalSettings.performanceMode) {
            renderer.setPixelRatio(1);
            if (renderer.capabilities.isWebGL2) {
                // Cant easily disable antialias after creation in Three.js without recreating renderer
                // But we can reduce pixel ratio which is a HUGE gain
            }
        } else {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    };
}

const testVoiceBtn = document.getElementById('test-voice-btn');
if (testVoiceBtn) {
    testVoiceBtn.onclick = () => {
        // Speak a test word
        const voices = window.speechSynthesis.getVoices();
        const selector = document.getElementById('voice-selector');
        const selectedName = selector.value;
        const voice = voices.find(v => v.name === selectedName);

        if (voice) {
            const utterance = new SpeechSynthesisUtterance("Testing your selected voice quality.");
            utterance.voice = voice;
            utterance.rate = 1.0;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    };
}

document.querySelectorAll('.back-btn').forEach(btn => btn.onclick = () => {
    const target = btn.dataset.target;
    if (target) {
        // Handle specific targets like 'profiles', 'settings', etc.
        const stateKey = Object.keys(GameState).find(k => GameState[k] === target);
        if (stateKey) {
            setGameState(GameState[stateKey]);
            return;
        }
    }
    // Default fallback to where we came from (Menu or Pause)
    setGameState(lastSettingsEntryState);
});

const restartBtn = document.querySelector('#restart-btn');
if (restartBtn) restartBtn.onclick = triggerSmoothStart;

// Pause Menu Listeners (Safe checks)
const resumeBtn = document.querySelector('#resume-btn');
if (resumeBtn) resumeBtn.onclick = () => setGameState(GameState.PLAYING);

const pSettingsBtn = document.querySelector('#pause-settings-btn');
if (pSettingsBtn) pSettingsBtn.onclick = () => setGameState(GameState.SETTINGS);

const quitBtn = document.querySelector('#quit-btn');
if (quitBtn) quitBtn.onclick = () => {
    saveGameData(); // This now handles profile-specific run saving
    setGameState(GameState.MENU);
};

const invToggleBtn = document.querySelector('#inv-toggle-btn');
let preInventoryState = GameState.PLAYING; // Restore to this when closing inventory
if (invToggleBtn) {
    invToggleBtn.onclick = () => {
        if (currentState === GameState.PLAYING || currentState === GameState.MCQ) {
            preInventoryState = currentState; // Remember what we came from
            setGameState(GameState.PAUSE);
        } else if (currentState === GameState.PAUSE) {
            setGameState(preInventoryState); // Return to PLAYING or MCQ
        }
    };
}

const forgeBtn = document.querySelector('#forge-btn');
if (forgeBtn) {

}

const autoUpgradeBtn = document.querySelector('#autoupgrade-toggle-btn');
if (autoUpgradeBtn) {
    autoUpgradeBtn.onclick = () => {
        GlobalSettings.autoUpgradeEnabled = !GlobalSettings.autoUpgradeEnabled;
        updateInventoryUI();
        saveGameData();
    };
}



const autoForgeBtn = document.querySelector('#autoforge-toggle-btn');
if (autoForgeBtn) {
    autoForgeBtn.onclick = () => {
        GlobalSettings.autoForgeEnabled = !GlobalSettings.autoForgeEnabled;
        updateInventoryUI();
        saveGameData();
    };
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (lookModeActive) {
            toggleLookMode(true);
            return;
        }
        if (currentState === GameState.PLAYING) {
            setGameState(GameState.PAUSE);
        } else if (currentState === GameState.PAUSE) {
            setGameState(GameState.PLAYING);
        } else if (currentState === GameState.SETTINGS || currentState === GameState.GRAPHICS || currentState === GameState.DRASTIC) {
            setGameState(lastSettingsEntryState);
        } else if (currentState === GameState.SCORES || currentState === GameState.PROFILES || currentState === GameState.CREATE_CHAR) {
            setGameState(GameState.MENU);
        }
    }

    if (e.key === 'Enter') {
        if (lookModeActive) {
            toggleLookMode(true);
            return;
        }
    }

    // Ability Hotkeys (1-9)
    if (currentState === GameState.PLAYING && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key);
        e.preventDefault(); // Prevent number from being typed into WORD_INPUT
        if (index === 1) {
            // Key 1 is REVEAL
            const revealBtn = document.getElementById('reveal-btn');
            if (revealBtn && !revealBtn.disabled) {
                if (ink >= 10 && !revealModeActive) {
                    revealModeActive = true;
                    revealBtn.style.color = '#ffcc00';
                    revealBtn.textContent = 'SELECT BRICK!';
                } else if (revealModeActive) {
                    revealModeActive = false;
                    revealBtn.style.color = '';
                    revealBtn.innerHTML = '<span class="hotkey-badge">1</span>REVEAL (10)';
                }
                updateUI();
                if (WORD_INPUT && !isPuzzleChest) WORD_INPUT.focus();
            }
        } else {
            // Keys 2-9 are equipped abilities
            const abilityIndex = index - 2; // Abilities start at hotkey [2]
            const equippedAbilities = getEquippedAbilities();

            if (equippedAbilities[abilityIndex]) {
                const ability = equippedAbilities[abilityIndex];
                if (useAbility(ability.name, ability.cost, ability.level)) {
                    updateUI();
                    updateInventoryUI();
                }
            }
        }
    }

    // Physical Keyboard support for Puzzle Chests
    if (currentState === GameState.PLAYING && isPuzzleChest && puzzleMistakesLeft > 0 && !isTransitioning) {
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            handleChestGuess(e.key.toUpperCase(), challenger.currentWordData.word.toUpperCase());
        }
    }
}, true); // Use capture to ensure it's caught


if (nameInput) {
    nameInput.onchange = (e) => {
        MageConfig.name = e.target.value || "Unknown Mage";
        // Guard against overwriting current profile while creating a new one
        if (currentState !== GameState.CREATE_CHAR) {
            saveGameData();
        }
    };
}

document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.onclick = () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        MageConfig.spellColor = swatch.dataset.color;

        // Guard against overwriting current profile while picking colors for a new one
        if (currentState !== GameState.CREATE_CHAR) {
            saveGameData();
        }
    };
});

let isCustomizing = false;

const newCharBtn = document.querySelector('#new-char-btn');
if (newCharBtn) {
    newCharBtn.onclick = () => {
        isCustomizing = false;
        document.querySelector('#create-char-title').textContent = "NEW MAGE";
        document.querySelector('#confirm-create-btn').textContent = "CREATE";
        document.querySelector('#player-name-input').value = "";
        setGameState(GameState.CREATE_CHAR);
    };
}

const customizeBtn = document.querySelector('#customize-btn');
if (customizeBtn) {
    customizeBtn.onclick = () => {
        isCustomizing = true;
        document.querySelector('#create-char-title').textContent = "CUSTOMIZE MAGE";
        document.querySelector('#confirm-create-btn').textContent = "SAVE CHANGES";

        const activeProfile = ProfileManager.getActiveProfile();
        if (activeProfile) {
            document.querySelector('#player-name-input').value = activeProfile.name;
            MageConfig.spellColor = activeProfile.spellColor;
            // Highlight active swatch
            document.querySelectorAll('.color-swatch').forEach(s => {
                s.classList.toggle('active', s.dataset.color === activeProfile.spellColor);
            });
        }

        setGameState(GameState.CREATE_CHAR);
    };
}

const confirmCreateBtn = document.querySelector('#confirm-create-btn');
if (confirmCreateBtn) {
    confirmCreateBtn.onclick = () => {
        const name = document.querySelector('#player-name-input').value || "New Mage";
        const activeSwatch = document.querySelector('.color-swatch.active');
        const color = activeSwatch ? activeSwatch.dataset.color : "#00d4ff";

        if (isCustomizing) {
            const activeProfile = ProfileManager.getActiveProfile();
            if (activeProfile) {
                activeProfile.name = name;
                activeProfile.spellColor = color;
                MageConfig.name = name;
                MageConfig.spellColor = color;
                ProfileManager.saveActiveProfile(activeProfile);
                showToast("Mage customized!");
            }
        } else {
            const newProfile = ProfileManager.createProfile(name, color);
            loadProfile(newProfile);
        }

        setGameState(GameState.MENU);
    };
}

document.querySelector('#clear-data-btn').onclick = () => {
    if (confirm("Reset everything?")) {
        localStorage.clear();
        location.reload();
    }
};

const reportBugPauseBtn = document.querySelector('#report-bug-pause-btn');
if (reportBugPauseBtn) reportBugPauseBtn.onclick = () => setGameState(GameState.REPORT_BUG);

const reportBugSettingsBtn = document.querySelector('#report-bug-settings-btn');
if (reportBugSettingsBtn) reportBugSettingsBtn.onclick = () => setGameState(GameState.REPORT_BUG);

const drasticBtn = document.querySelector('#drastic-measures-btn');
if (drasticBtn) drasticBtn.onclick = () => setGameState(GameState.DRASTIC);

const closeBugBtn = document.querySelector('#close-bug-btn');
if (closeBugBtn) closeBugBtn.onclick = () => {
    // Return to previous screen
    if (dungeonGroup.children.length > 0 && health > 0) {
        setGameState(GameState.PAUSE);
    } else {
        setGameState(GameState.MENU);
    }
};

const submitBugBtn = document.querySelector('#submit-bug-btn');
if (submitBugBtn) submitBugBtn.onclick = submitBugReport;

function collectDebugData() {
    const stats = items.getTotalStats();
    const currentMaxHP = baseMaxHealth + stats.hp;
    const currentMaxInk = baseMaxInk + stats.ink;

    const data = {
        timestamp: new Date().toISOString(),
        room: currentRoom,
        score: score,
        hp: `${health}/${currentMaxHP}`,
        ink: `${ink}/${currentMaxInk}`,
        level: library.currentTier,
        difficulty: GlobalSettings.difficulty,
        mode: GlobalSettings.mode,
        wordList: GlobalSettings.wordList,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        activeProfile: MageConfig.name,
        inventory: items.inventory.filter(i => i).map(i => `${i.name} (T${i.tier})`),
        equipped: Object.entries(items.equipped).filter(([k, v]) => v).map(([k, v]) => `${k}: ${v.name}`),
        lastWord: challenger.currentWordData ? challenger.currentWordData.word : 'None'
    };
    return JSON.stringify(data, null, 2);
}

function submitBugReport() {
    const desc = document.querySelector('#bug-description').value;

    if (!desc.trim()) {
        showToast("PLEASE DESCRIBE THE ISSUE");
        return;
    }

    const debugData = collectDebugData();
    const bodyText = `PROBLEM:\n${desc}\n\nDEBUG DATA:\n${debugData}`;

    // FORMSPREE INTEGRATION
    const formspreeId = "xpqyrbbd";
    const endpoint = `https://formspree.io/f/${formspreeId}`;

    submitBugBtn.disabled = true;
    submitBugBtn.innerText = "SENDING...";

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            problem: desc,
            debug: debugData,
            _subject: `Spelling Dungeon Bug - Room ${currentRoom}`
        })
    }).then(response => {
        if (response.ok) {
            showToast("REPORT SENT!");
            setTimeout(() => setGameState(GameState.MENU), 1000);
        } else {
            throw new Error("Formspree response not OK");
        }
    }).catch(err => {
        console.error("Formspree failed, falling back to mailto:", err);
        // Fallback to mailto
        const subject = `Spelling Dungeon Bug - Room ${currentRoom}`;
        const mailtoUrl = `mailto:tidbittutoring@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        window.location.href = mailtoUrl;
        showToast("SENT VIA EMAIL CLIENT");
        setTimeout(() => setGameState(GameState.MENU), 1000);
    }).finally(() => {
        submitBugBtn.disabled = false;
        submitBugBtn.innerText = "SEND REPORT";
    });
}

WORD_INPUT.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        evaluateGuess();
    }
    // Block numeric input (0-9) to ensure hotkeys don't pollute spelling
    if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
    }
});

WORD_INPUT.addEventListener('input', () => {
    if (currentState !== GameState.PLAYING) return;
    WORD_INPUT.value = WORD_INPUT.value.toUpperCase();
    const typed = WORD_INPUT.value;
    const isObscured = (bossActive && currentBossType === 'obscured');
    const baseTarget = challenger.currentWordData.word;
    const target = isObscured ? (baseTarget + " ".repeat(wordBricks.length - baseTarget.length)) : baseTarget;

    // Detect overflow
    if (typed.length > target.length) {
        WORD_INPUT.value = typed.slice(0, target.length);
        createSpellBurst("#ff0000"); // Red spark
        if (!isObscured) showToast("TOO MANY LETTERS!");
        return;
    }

    // Sync input to 3D planes
    for (let i = 0; i < typedMeshes.length; i++) {
        let char = (i < typed.length) ? typed[i] : " ";
        // If 'blind' boss is active, hide the feedback by showing placeholders or keeping blank
        if (bossActive && currentBossType === 'blind') {
            char = (i < typed.length) ? "?" : " ";
        }
        // Update texture based on typed character
        typedMeshes[i].material.map = getLetterTexture(char, MageConfig.spellColor);
        typedMeshes[i].material.needsUpdate = true;
    }
});

let revealModeActive = false;
let lookModeActive = false;
let lookModeZoomActive = false;
const targetRotation = new THREE.Euler(0, 0, 0, 'YXZ');
const originalRotation = new THREE.Euler(0, 0, 0);

HEAR_BTN.onclick = () => {
    if (bossActive && currentBossType === 'silent') return;
    challenger.speakWord();
    WORD_INPUT.focus();
};

if (SKIP_CHEST_BTN) {
    SKIP_CHEST_BTN.onclick = () => {
        if (isChestRoom && !isTransitioning) {
            isTransitioning = true; // Prevent further input
            showToast("CHEST SKIPPED!");

            // REVEAL THE WORD first
            wordBricks.forEach(brick => {
                if (!brick.userData.revealed) {
                    revealBrick(brick, false, true); // (brick, isSpell=false, noGold=true)
                }
            });

            // Delay transitioning so player can see what the word was
            setTimeout(() => {
                onSuccess(true, true); // (fastTrack=true, isFail=true)
            }, 1500);
        }
    };
}

// ── Inventory & Forge State ────────────────────────────────────────────────
let setBonusesExpanded = true;
let isDragging = false;
let dragSource = null;


// Maps item slot type to its icon PNG filename
// Maps item slot type or base name to its icon PNG filename
function getItemIconSrc(typeOrBase) {
    if (!typeOrBase) return null;
    const map = {
        // Slots (default)
        'head': 'icons/icon_tophat.png',
        'torso': 'icons/icon_sweater.png',
        'main_hand': 'icons/icon_pencil.png',
        'off_hand': 'icons/icon_notebook.png',
        'accessory': 'icons/icon_bracelet.png',

        // Base types (specialized)
        'fanny pack': 'icons/icon_fannypack.png',
        'breastplate': 'icons/icon_breastplate.png',
        'waistcoat': 'icons/icon_waistcoat.png',
        'gambeson': 'icons/icon_gambeson.png',
        'notebook': 'icons/icon_notebook.png',
        'bracelet': 'icons/icon_bracelet.png',
        'monocle': 'icons/icon_monocle.png',
        'sweater': 'icons/icon_sweater.png',
        'crayons': 'icons/icon_crayons.png',
        'crayon': 'icons/icon_crayons.png',
        'helmet': 'icons/icon_helmet.png',
        'pencil': 'icons/icon_pencil.png',
        'shield': 'icons/icon_shield.png',
        'scroll': 'icons/icon_scroll.png',
        'earring': 'icons/icon_earring.png',
        'tophat': 'icons/icon_tophat.png',
        'cloak': 'icons/icon_cloak.png',
        'quill': 'icons/icon_quill_fixed.png',
        'robe': 'icons/icon_robe.png',
        'hood': 'icons/icon_hood_v3.png',
        'veil': 'icons/icon_veil.png',
        'bag': 'icons/icon_bag.png',
        'pen': 'icons/icon_pen.png',
        'calligraphy pen': 'icons/icon_quill_fixed.png',
        'brush': 'icons/icon_brush.png',
        'crown': 'icons/icon_crown.png',
        'compass': 'icons/icon_compass.png',
        'ruler': 'icons/icon_ruler.png',
        'ring': 'icons/icon_ring.png',
        'necklace': 'icons/icon_necklace.png',
        'lantern': 'icons/icon_lantern.png',
        'glasses': 'icons/icon_glasses.png',
        'wizard hat': 'icons/icon_wizardhat.png',
        'belt': 'icons/icon_belt.png',
        'tunic': 'icons/icon_tunic.png',
        'crown': 'icons/icon_circlet.png',
        'turban': 'icons/icon_turban.png',
        'satchel': 'icons/icon_bag.png',
        'briefcase': 'icons/icon_bag.png',
        'cufflinks': 'icons/icon_cufflinks.png',
        'cufflink': 'icons/icon_cufflinks.png',
        'chalkstick': 'icons/icon_chalkstick.png',
        'charcoal stick': 'icons/icon_chalkstick.png',
        'chalk': 'icons/icon_chalkstick.png',
        'charcoal': 'icons/icon_chalkstick.png',
        'handkerchief': 'icons/icon_handkerchief.png',
        'apron': 'icons/icon_apron.png',
        'bowtie': 'icons/icon_bowtie.png',
        'pocket protector': 'icons/icon_pocket_protector.png',
        'cap': 'icons/icon_cap.png',
        'folding chair': 'icons/icon_folding_chair.png'
    };
    const key = typeOrBase.toLowerCase();
    return map[key] || map[typeOrBase] || null;
}

function getItemIconHtml(item, size = 36) {
    if (!item) return '';
    const name = item.name || "";
    const thumb = ThumbnailManager.getThumbnail(name);

    const rarityColor = (item.rarity && item.rarity.color) ? item.rarity.color : '#ffffff';
    const filter = rarityColor !== '#ffffff'
        ? `filter: drop-shadow(0 0 4px ${rarityColor}) drop-shadow(0 0 2px ${rarityColor});`
        : '';

    return `<img src="${thumb}" class="item-3d-thumb" style="width:${size}px; height:${size}px; ${filter}">`;
}

function triggerEvolutionEffect(oldName, newName, subText = null, onContinue = null) {
    const overlay = document.getElementById('evolution-overlay');
    const fromEl = document.getElementById('evo-from');
    const toEl = document.getElementById('evo-to');
    const fromIcon = document.getElementById('evo-from-icon');
    const toIcon = document.getElementById('evo-to-icon');
    const subtextEl = document.getElementById('evo-subtext');
    const continueBtn = document.getElementById('evo-continue-btn');

    if (!overlay || !fromEl || !toEl || !subtextEl) {
        if (onContinue) onContinue();
        return;
    }

    fromEl.textContent = oldName || "???";
    toEl.textContent = newName || "AWAKENING";
    subtextEl.textContent = subText || "";

    // Set thumbnails
    if (fromIcon) fromIcon.innerHTML = `<img src="${ThumbnailManager.getThumbnail(oldName)}" style="width: 100%; height: 100%; object-fit: contain;">`;
    if (toIcon) toIcon.innerHTML = `<img src="${ThumbnailManager.getThumbnail(newName)}" style="width: 100%; height: 100%; object-fit: contain;">`;

    overlay.style.display = 'flex';
    overlay.classList.remove('pulse-bg');

    let clickHandled = false;
    continueBtn.onclick = () => {
        if (clickHandled) return;
        clickHandled = true;
        overlay.style.display = 'none';

        // Restore focus to input if it's currently relevant
        if (WORD_INPUT && WORD_INPUT.style.display !== 'none') {
            WORD_INPUT.focus();
        }

        if (onContinue) onContinue();
    };
}

function triggerExcuseEffect(note) {
    const overlay = document.getElementById('excuse-overlay');
    const noteIcon = document.getElementById('excuse-note-icon');
    const excuseText = overlay ? overlay.querySelector('.excuse-text') : null;
    if (!overlay || !noteIcon || !excuseText) return;

    // Restore text (evolution effects might have overwritten it before we decoupled overlays)
    excuseText.innerHTML = "EXCUSE ACCEPTED";
    noteIcon.innerHTML = getItemIconHtml(note, 120);
    overlay.style.display = 'flex';
    // Use requestAnimationFrame to ensure display: flex is applied before adding active class
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    }, 3000);
}

function dropItemOnFloor(item) {
    if (!item) return;

    // Remove from inventory
    if (items.removeItem(item)) {
        spawnPhysicalItem(item);
        showToast(`DROPPED: ${item.name.toUpperCase()}`);
        hideTooltip();
        updateInventoryUI();
        updateUI();
        saveGameData();
    }
}

function spawnPhysicalItem(item, roomNum = currentRoom, zOverride = null) {
    if (!item) return;

    // Spawn a physical item in the room
    const dropDist = 2.5;
    const spawnX = camera.position.x - Math.sin(camera.rotation.y) * dropDist;
    const spawnZ = zOverride !== null ? zOverride : (camera.position.z - Math.cos(camera.rotation.y) * dropDist);
    const spawnY = 0.05; // Standard floor height for items

    const itemModel = createItemModel(item.name);
    if (itemModel) {
        itemModel.scale.set(0.6, 0.6, 0.6);
        itemModel.position.set(spawnX, spawnY, spawnZ);
        itemModel.rotation.y = Math.random() * Math.PI * 2;

        // Mark for rummage collection
        itemModel.userData = {
            foundItem: item,
            roomNumber: roomNum,
            isFoundItem: true,
            isGoldBag: item.isGoldBag || false,
            goldAmount: item.goldAmount || null
        };
        dungeonGroup.add(itemModel);
        console.log(`[SPAWN] Object spawned in Room ${roomNum}: ${item.name} at Z=${spawnZ}`);
    }
}

function updateInventoryUI() {
    const sellZone = document.getElementById('sell-zone-container');
    if (sellZone) sellZone.style.display = isShopRoom ? 'block' : 'none';

    // 1. Update Hat Slot
    const hatSlot = document.querySelector('#hat-slot');
    if (hatSlot) {
        const item = items.hat;
        if (item) {
            hatSlot.classList.add('filled');
            hatSlot.dataset.itemName = item.name;
            hatSlot.innerHTML = `${getItemIconHtml(item, 44)}`;
            hatSlot.onclick = () => {
                if (items.unequip(item)) {
                    updateInventoryUI();
                    updateUI();
                    saveGameData();
                }
            };
            hatSlot.onmouseenter = (e) => {
                clearTimeout(tooltipHideTimer);
                showTooltip(item, e);
            };
            hatSlot.oncontextmenu = (e) => {
                e.preventDefault();
                if (isShopRoom) {
                    const sellValue = Math.floor(item.cost * 0.5);
                    if (items.sellItem(item)) {
                        playerGold += sellValue;
                        hideTooltip();
                        updateInventoryUI();
                        updateUI();
                        saveGameData();
                        showToast(`💰 SOLD: ${item.name} for ${sellValue} gold!`);
                    }
                } else {
                    dropItemOnFloor(item);
                }
            };
            hatSlot.onmouseleave = () => {
                tooltipHideTimer = setTimeout(hideTooltip, 300);
            };
        } else {
            hatSlot.classList.remove('filled');
            delete hatSlot.dataset.itemName;
            hatSlot.innerHTML = '<span>NONE</span>';
            hatSlot.onclick = null;
            hatSlot.onmouseenter = null;
        }
    }

    // 2. Update Utensil Slots
    const utensilGrid = document.querySelector('#utensil-slots');
    if (utensilGrid) {
        utensilGrid.innerHTML = '';
        const limit = items.maxUtensilsSize;
        for (let i = 0; i < limit; i++) {
            const slot = document.createElement('div');
            slot.className = 'equip-slot';
            const item = items.utensils[i];
            if (item) {
                slot.classList.add('filled');
                slot.dataset.itemName = item.name;
                slot.innerHTML = getItemIconHtml(item, 44);
                slot.onclick = () => {
                    if (items.unequip(item)) {
                        updateInventoryUI();
                        updateUI();
                        saveGameData();
                    }
                };
                slot.onmouseenter = (e) => {
                    clearTimeout(tooltipHideTimer);
                    showTooltip(item, e);
                };
                slot.oncontextmenu = (e) => {
                    e.preventDefault();
                    if (isShopRoom) {
                        const sellValue = Math.floor(item.cost * 0.5);
                        if (items.sellItem(item)) {
                            playerGold += sellValue;
                            hideTooltip();
                            updateInventoryUI();
                            updateUI();
                            saveGameData();
                            showToast(`💰 SOLD: ${item.name} for ${sellValue} gold!`);
                        }
                    } else {
                        dropItemOnFloor(item);
                    }
                };
                slot.onmouseleave = () => {
                    tooltipHideTimer = setTimeout(hideTooltip, 300);
                };
            } else {
                slot.innerHTML = '<span>TOOL</span>';
            }
            utensilGrid.appendChild(slot);
        }
    }

    // 3. Update Storage Grid
    const storageGrid = document.querySelector('#storage-grid');
    if (storageGrid) {
        storageGrid.innerHTML = '';
        const limit = items.maxStorageSize;
        for (let i = 0; i < limit; i++) {
            const cell = document.createElement('div');
            cell.className = 'inv-cell';
            const item = items.storage[i];
            if (item) {
                cell.classList.add('filled');
                cell.dataset.itemName = item.name;
                cell.innerHTML = getItemIconHtml(item, 56);
                cell.onclick = () => {
                    const isConsumable = item.name.toLowerCase().includes('refill') || item.name.toLowerCase().includes('lock picks') || item.name.toLowerCase() === 'lockpick';
                    if (isConsumable) {
                        if (useConsumable(item)) {
                            updateInventoryUI();
                            updateUI();
                            saveGameData();
                        }
                    } else if (items.equip(item)) {
                        updateInventoryUI();
                        updateUI();
                        saveGameData();
                    }
                };

                // RIGHT CLICK TO SELL (Instant) OR DROP
                cell.oncontextmenu = (e) => {
                    e.preventDefault();
                    if (isShopRoom) {
                        const sellValue = Math.floor(item.cost * 0.5);
                        if (items.sellItem(item)) {
                            playerGold += sellValue;
                            hideTooltip();
                            updateInventoryUI();
                            updateUI();
                            saveGameData();
                            showToast(`💰 SOLD: ${item.name} for ${sellValue} gold!`);
                        }
                    } else {
                        dropItemOnFloor(item);
                    }
                };

                cell.onmouseenter = (e) => {
                    clearTimeout(tooltipHideTimer);
                    showTooltip(item, e);
                };
                cell.onmouseleave = () => {
                    tooltipHideTimer = setTimeout(hideTooltip, 300); // Increased buffer to reach tooltip
                };
            }
            storageGrid.appendChild(cell);
        }
    }

    // 4. Update Character Stats View
    const statsView = document.querySelector('#char-stats-view');
    if (statsView) {
        const totalStats = items.getTotalStats();
        statsView.innerHTML = '<h3 style="margin: 0 0 0.8rem 0; color: #ff8800; font-size: 0.8rem; letter-spacing: 0.2rem; border-bottom: 1px solid #333; padding-bottom: 0.3rem;">CHARACTER STATS</h3>';

        const STAT_METADATA = {
            hp: { label: 'Bonus HP', desc: 'Added Maximum Health from equipment.' },
            ink: { label: 'Bonus Ink', desc: 'Added Maximum Ink from equipment.' },
            hp_regen: { label: 'HP Regen', desc: 'Health recovered after each correct word.' },
            ink_regen: { label: 'Ink Regen', desc: 'Ink recovered after each correct word.' },
            armor: { label: 'Armor', desc: 'Reduces damage taken from mistakes.' },
            gold_bonus: { label: 'Gold Bonus', desc: 'Increases gold found in dungeon by this percentage.', suffix: '%' },
            storage: { label: 'Storage', desc: 'Extra storage slots.' },
            utensils: { label: 'Utensils', desc: 'Extra active utensil slots.' },
            first_letter_chance: { label: 'Foresight', desc: 'Chance to reveal first letter automatically.', suffix: '%' },
            last_letter_chance: { label: 'Conclusion', desc: 'Chance to reveal last letter automatically.', suffix: '%' },
            double_letter_chance: { label: 'Echoes', desc: 'Chance to reveal double letters automatically.', suffix: '%' },
            random_letter_chance: { label: 'Chaos', desc: 'Chance to reveal random letters automatically.', suffix: '%' },
            glow: { label: 'Glow', desc: 'Increases brightness of light sources.', suffix: '%' },
            time_warp: { label: 'Time Warp', desc: 'Slows down boss timers.', suffix: '%' },
            interest: { label: 'Interest', desc: 'Percentage of gold gained between rooms.', suffix: '%' },
            shop_discount: { label: 'Discount', desc: 'Lower prices in the gnome\'s shop.', suffix: '%' },
            rummage: { label: 'Rummage', desc: 'Increases chance to find items scattered on the floor.', suffix: '%' },
            lockpick: { label: 'Lockpick', desc: 'Extra attempts when opening chests.' }
        };

        Object.entries(STAT_METADATA).forEach(([key, meta]) => {
            const val = totalStats[key] || 0;
            if (val !== 0 || key === 'hp' || key === 'ink') {
                const row = document.createElement('div');
                row.className = 'stat-row';
                row.innerHTML = `
                    <span class="stat-value">${val > 0 ? '+' : ''}${parseFloat(val.toFixed(1))}${meta.suffix || ''}</span>
                    <span class="stat-label">${meta.label}</span>
                `;

                row.onmouseenter = (e) => {
                    clearTimeout(tooltipHideTimer);
                    showSimpleTooltip(meta.label, meta.desc, e);
                };
                row.onmouseleave = () => {
                    tooltipHideTimer = setTimeout(hideTooltip, 300);
                };

                statsView.appendChild(row);
            }
        });
    }
}
let tooltipHideTimer = null;
function showTooltip(item, e) {
    const mainTooltip = document.querySelector('#item-tooltip');
    if (!mainTooltip) return;

    clearTimeout(tooltipHideTimer);
    mainTooltip.onmouseenter = () => clearTimeout(tooltipHideTimer);
    mainTooltip.onmouseleave = hideTooltip;

    mainTooltip.innerHTML = renderItemTooltipContent(item);
    mainTooltip.style.display = 'block';

    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipHeight = mainTooltip.offsetHeight;
    const tooltipWidth = mainTooltip.offsetWidth;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let top = rect.top - tooltipHeight - 10;

    // Flip to bottom if clipping top
    if (top < 10) {
        top = rect.bottom + 10;
    }

    // Horizontal bounds check (Clamping)
    if (left < 10) left = 10;
    const scrollBarWidth = 15; // Assume some scroll gutter
    if (left + tooltipWidth > window.innerWidth - scrollBarWidth) {
        left = window.innerWidth - tooltipWidth - scrollBarWidth;
    }

    mainTooltip.style.left = left + 'px';
    mainTooltip.style.top = top + 'px';

    // If shop is open, add sell button functionality
    if (isShopRoom) {
        const sellBtn = mainTooltip.querySelector('.sell-btn');
        if (sellBtn) {
            sellBtn.onclick = (e) => {
                e.stopPropagation(); // Avoid bubbling
                const sellValue = Math.floor(item.cost * 0.5);
                if (items.sellItem(item)) {
                    playerGold += sellValue;
                    hideTooltip();
                    updateInventoryUI();
                    updateUI();
                    saveGameData();
                    showToast(`SOLD ${item.name} for ${sellValue}G`);
                }
            };
        }
    }
}

function getStatLabel(key) {
    const labels = {
        'random_letter_chance': 'Chaos',
        'double_letter_chance': 'Echo',
        'last_letter_chance': 'Conclusion',
        'first_letter_chance': 'Foresight',
        'time_warp': 'Time Warp',
        'glow': 'Glow',
        'rummage': 'Rummage',
        'gold_bonus': 'Gold Bonus',
        'shop_discount': 'Shop Discount',
        'cascade': 'Cascade',
        'interest': 'Interest',
        'hp': 'Max HP',
        'ink': 'Max Ink',
        'hp_regen': 'HP Regen',
        'ink_regen': 'Ink Regen',
        'armor': 'Armor',
        'lockpick': 'Lockpick',
        'storage': 'Storage',
        'utensils': 'Utensil Slots',
        'origin_chance': 'Origin Sight',
        'telepathy': 'Telepathy'
    };
    return labels[key] || key.toUpperCase().replace('_', ' ');
}

function renderItemTooltipContent(item) {
    if (!item) return '';

    const stats = item.stats || {};
    let html = `
        <div class="tooltip-title" style="color: #ffcc00; font-weight: bold; border-bottom: 2px solid #555; padding-bottom: 4px; margin-bottom: 8px; font-size: 1.1rem;">
            ${item.name}
        </div>
        <div class="tooltip-type" style="font-size: 0.8rem; color: #888; text-transform: uppercase; margin-bottom: 4px;">
            ${item.name.toLowerCase().includes('refill') ? 'CONSUMABLE' : (item.slot ? item.slot : 'PASSIVE')}
        </div>
        <div class="tooltip-description" style="font-size: 0.9rem; color: #bbb; font-style: italic; margin-bottom: 10px; line-height: 1.3;">
            ${item.description || 'A mysterious item found in the dungeon.'}
            ${item.name === "Spellonomicon" ? `<div style="color:#ff00ff; margin-top:5px; font-weight:bold;">Progress: ${items.spellonomicon_dmg_count || 0}/10 DMG</div>` : ''}
            ${item.name === "Diary" ? `<div style="color:#ffcc00; margin-top:5px; font-weight:bold;">Words Spelled: ${activeProfile?.diaryWordCount || 0}/20</div>` : ''}
            ${item.name === "Manuscript" ? `<div style="color:#ffcc00; margin-top:5px; font-weight:bold;">Words Spelled: ${activeProfile?.diaryWordCount || 0}/50</div>` : ''}
        </div>
        <div class="tooltip-stats" style="display: flex; flex-direction: column; gap: 5px;">
    `;

    if (item.stats) {
        if (typeof item.stats === 'string') {
            html += `<div class="stat-line" style="border-left: 2px solid #444; padding-left: 8px; font-size: 0.95rem;">${item.stats}</div>`;
        } else {
            // Merge base stats with persistent stats
            const statsToDisplay = { ...item.stats };
            if (item.name === "Graduate's Cap" && typeof activeProfile !== 'undefined' && activeProfile.graduateCapStats) {
                Object.keys(activeProfile.graduateCapStats).forEach(pk => {
                    const pVal = activeProfile.graduateCapStats[pk];
                    if (typeof pVal === 'number') {
                        statsToDisplay[pk] = (statsToDisplay[pk] || 0) + pVal;
                    }
                });
            }
            if (item.name.toLowerCase().includes("notebook")) {
                Object.keys(items.notebook_bonus_stats).forEach(nk => {
                    const nVal = items.notebook_bonus_stats[nk];
                    if (typeof nVal === 'number' && nVal > 0) {
                        statsToDisplay[nk] = (statsToDisplay[nk] || 0) + nVal;
                    }
                });
            }

            Object.keys(statsToDisplay).forEach(k => {
                if (k === 'spells' && Array.isArray(statsToDisplay[k])) {
                    statsToDisplay[k].forEach(s => {
                        html += `<div class="stat-line" style="border-left: 2px solid #444; padding-left: 8px; font-size: 0.95rem; color:#ffcc00">SPELL: ${s}</div>`;
                    });
                } else {
                    const val = statsToDisplay[k];
                    if (val !== 0 && typeof val === 'number') {
                        const prefix = val > 0 ? '+' : '';
                        const suffix = percentStats.includes(k) ? '%' : '';
                        const label = getStatLabel(k);
                        const displayVal = parseFloat(val.toFixed(1));
                        html += `<div class="stat-line" style="border-left: 2px solid #444; padding-left: 8px; font-size: 0.95rem;">${label}: ${prefix}${displayVal}${suffix}</div>`;
                    }
                }
            });
        }
    }

    html += `</div>`;

    if (isShopRoom) {
        const sellValue = Math.floor(item.cost * 0.5);
        html += `
            <div class="shop-actions" style="margin-top: 15px; border-top: 1px dashed #444; padding-top: 10px;">
                <button class="sell-btn" style="width:100%; padding: 8px; background: #5a2a2a; color: #ffcccc; border: 1px solid #8a4a4a; border-radius: 4px; cursor: pointer; font-family: inherit; font-weight: bold; transition: all 0.2s;">
                    SELL FOR 🪙${sellValue}
                </button>
            </div>
        `;
    }

    return html;
}

function hideTooltip() {
    const main = document.querySelector('#item-tooltip');
    const c1 = document.querySelector('#comp-tooltip-1');
    const c2 = document.querySelector('#comp-tooltip-2');
    if (main) main.style.display = 'none';
    if (c1) c1.style.display = 'none';
    if (c2) c2.style.display = 'none';
}

function showSimpleTooltip(title, body, e) {
    const mainTooltip = document.querySelector('#item-tooltip');
    if (!mainTooltip) return;

    clearTimeout(tooltipHideTimer);
    mainTooltip.innerHTML = `
        <div class="tooltip-title" style="color: #ffcc00; font-weight: bold; border-bottom: 2px solid #555; padding-bottom: 4px; margin-bottom: 8px; font-size: 1.1rem;">
            ${title}
        </div>
        <div class="tooltip-description" style="font-size: 0.95rem; color: #ddd; line-height: 1.4;">
            ${body}
        </div>
    `;
    mainTooltip.style.display = 'block';

    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipHeight = mainTooltip.offsetHeight;
    const tooltipWidth = mainTooltip.offsetWidth;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let top = rect.top - tooltipHeight - 10;

    // Flip to bottom if clipping top
    if (top < 10) {
        top = rect.bottom + 10;
    }

    // Horizontal bounds check
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 15) {
        left = window.innerWidth - tooltipWidth - 15;
    }

    mainTooltip.style.left = left + 'px';
    mainTooltip.style.top = top + 'px';
}

function dropLoot(isGuaranteedChestLoot = false, targetRoomNum = currentRoom, zOverride = null) {
    const stats = items.getTotalStats();
    let drops = [];
    const currentLevel = Math.max(1, Math.min(10, Math.ceil(currentRoom / 10)));

    if (isGuaranteedChestLoot) {
        const baseGold = 20 + Math.floor(Math.random() * 21);
        const multiplier = 1 + (currentLevel - 1) * 0.2;
        const goldBonus = 1 + ((stats.gold_bonus || 0) / 100);

        const rawTotal = baseGold * multiplier * goldBonus;
        let chestGold = Math.floor(rawTotal);
        if (Math.random() < (rawTotal - chestGold)) {
            chestGold += 1;
        }

        // Give gold directly to the player
        playerGold += chestGold;
        updateUI();
        saveGameData();
        showToast(`CHEST OPENED: Found ${chestGold} gold!`, 4000);
    } else {
        if (Math.random() * 100 < (stats.rummage || 0)) {
            const possibleItems = ["Eraser Refill", "Ink Refill", "Lock Picks", "Ring", "Necklace"];
            const itemName = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            const item = items.createItemByName(itemName);
            if (item) drops.push(item);
        }
    }

    if (drops.length === 0) return;

    let anyPickedUp = false;
    drops.forEach(newItem => {
        const lowerName = newItem.name.toLowerCase();
        const isRefill = lowerName.includes("refill") || lowerName.includes("lock pick") || lowerName.includes("lockpick");

        // Refills and similar consumables always spawn on the floor for rummage feel
        if (isRefill) {
            spawnPhysicalItem(newItem, targetRoomNum, zOverride);
            showToast(`SPAWNED: ${newItem.name.toUpperCase()}`);
            return;
        }

        if (GlobalSettings.autoUpgradeEnabled && items.autoUpgrade(newItem)) {
            anyPickedUp = true;
            showItemDrop(newItem, true);
            return;
        }

        if (items.addItem(newItem)) {
            anyPickedUp = true;
            showItemDrop(newItem, false);
        } else {
            // Drop on floor if inventory is full
            spawnPhysicalItem(newItem, targetRoomNum, zOverride);
            showToast(`BACKPACK FULL - DROPPED: ${newItem.name}`);
        }
    });

    if (anyPickedUp) {
        updateInventoryUI();
        saveGameData();
    }
}



const revealBtn = document.querySelector('#reveal-btn');
if (revealBtn) {
    revealBtn.onclick = () => {
        if (ink >= 10 && !revealModeActive) {
            revealModeActive = true;
            revealBtn.style.color = '#ffcc00';
            revealBtn.textContent = 'SELECT BRICK!';
        } else if (revealModeActive) {
            revealModeActive = false;
            revealBtn.style.color = '';
            revealBtn.innerHTML = '<span class="hotkey-badge">1</span>REVEAL (10)';
        }
        WORD_INPUT.focus();
    };
}

function performRoulette() {
    // Ink deduction now happens in useAbility caller
    // updateUI(); // Already called in main loop or useAbility

    const container = document.getElementById('roulette-wheel-container');
    const wheel = document.getElementById('roulette-wheel');
    const text = document.getElementById('roulette-text');

    if (!container || !wheel) return;

    container.style.display = 'block';
    wheel.classList.remove('wheel-spinning');
    void wheel.offsetWidth; // Trigger reflow
    wheel.classList.add('wheel-spinning');
    text.textContent = "SPINNING...";

    setTimeout(() => {
        const spellChoices = ['chisel', 'scrape', 'chaos', 'heal', 'telepathy'];
        const result = spellChoices[Math.floor(Math.random() * spellChoices.length)];

        text.textContent = `RESULT: ${result.toUpperCase()}!`;

        // Execute Spell
        executeRouletteSpell(result);

        setTimeout(() => {
            container.style.display = 'none';
        }, 1200);
    }, 1200);
}

function executeRouletteSpell(type) {
    if (type === 'chisel') {
        const hiddenBricks = wordBricks.filter(b => !b.userData.revealed);
        if (hiddenBricks.length > 0) {
            revealBrick(hiddenBricks[0], true);
            showToast("ROULETTE: CHISEL!", 3000);
            createSpellBurst("#ffffff");
            checkWordSolved();
        }
    } else if (type === 'scrape') {
        const hiddenBricks = wordBricks.filter(b => !b.userData.revealed);
        if (hiddenBricks.length > 0) {
            revealBrick(hiddenBricks[hiddenBricks.length - 1], true);
            showToast("ROULETTE: SCRAPE!", 3000);
            createSpellBurst("#ffffff");
            checkWordSolved();
        }
    } else if (type === 'chaos') {
        const hiddenBricks = wordBricks.filter(b => !b.userData.revealed);
        if (hiddenBricks.length > 0) {
            const target = hiddenBricks[Math.floor(Math.random() * hiddenBricks.length)];
            revealBrick(target, true);
            showToast("ROULETTE: CHAOS!", 3000);
            createSpellBurst("#ffffff");
            checkWordSolved();
        }
    } else if (type === 'heal') {
        const stats = items.getTotalStats();
        const maxHP = baseMaxHealth + stats.hp;
        const healAmt = 5;
        health = Math.min(maxHP, health + healAmt);
        showToast("ROULETTE: HEAL (+5 HP)!", 3000);
        createSpellBurst("#00ff00");
        updateUI();
    } else if (type === 'telepathy') {
        const synonyms = (challenger.currentWordData && challenger.currentWordData.synonyms) ? challenger.currentWordData.synonyms : [];
        if (synonyms.length > 0) {
            const selected = synonyms[Math.floor(Math.random() * synonyms.length)].toUpperCase();
            showToast(`ROULETTE TELEPATHY: ${selected}`, 4000);
            createSpellBurst("#ffff00");
        } else {
            // Fallback to random reveal
            const hidden = wordBricks.filter(b => !b.userData.revealed);
            if (hidden.length > 0) {
                revealBrick(hidden[Math.floor(Math.random() * hidden.length)], true);
                showToast("ROULETTE: NO SYNONYMS? CHAOS FALLBACK!", 3000);
                createSpellBurst("#ffffff");
                checkWordSolved();
            }
        }
    }

    if (WORD_INPUT) WORD_INPUT.focus();
}

const lookBtn = document.querySelector('#look-btn');
function toggleLookMode(forceOff = false) {
    if (forceOff) lookModeActive = false;
    else lookModeActive = !lookModeActive;

    // Reset zoom when toggling look mode
    lookModeZoomActive = false;

    if (lookModeActive) {
        lookBtn?.classList.add('look-active');
        if (lookBtn) lookBtn.textContent = '👁️ STOP LOOKING (ESC)';
        WORD_INPUT.disabled = true;
        WORD_INPUT.blur();
        renderer.domElement.requestPointerLock();
        // Show reticle
        const reticle = document.getElementById('look-reticle');
        if (reticle) reticle.style.display = 'block';
    } else {
        lookBtn?.classList.remove('look-active');
        if (lookBtn) lookBtn.textContent = '👁️ Look Around';
        document.exitPointerLock();
        // Hide reticle
        const reticle = document.getElementById('look-reticle');
        if (reticle) reticle.style.display = 'none';

        // Update auto-upgrade button text
        const auBtn = document.querySelector('#autoupgrade-toggle-btn');
        if (auBtn) {
            auBtn.textContent = `AUTO - UPGRADE: ${GlobalSettings.autoUpgradeEnabled ? 'ON' : 'OFF'} `;
            auBtn.style.color = GlobalSettings.autoUpgradeEnabled ? '#00ff00' : '';
        }

        // Reset to standard view
        let standardY = Math.PI / 2; // Default for Spelling wall
        if (currentRoom === 0) standardY = 0; // Lobby exit
        else if (isChestRoom || isShopRoom || currentState === GameState.MCQ) standardY = -Math.PI / 2; // Interaction wall

        targetRotation.set(0, standardY, 0); // Reset X (tilt) to 0 and set Y to standard

        WORD_INPUT.disabled = false;
        setTimeout(() => {
            if (currentState === GameState.PLAYING) WORD_INPUT.focus();
        }, 10);
    }
}

if (lookBtn) {
    lookBtn.onclick = () => toggleLookMode();
}

const shopHoverTooltip = document.createElement('div');
shopHoverTooltip.id = 'shop-hover-tooltip';
shopHoverTooltip.style.position = 'absolute';
shopHoverTooltip.style.background = 'rgba(0,0,0,0.85)';
shopHoverTooltip.style.color = '#ffcc00';
shopHoverTooltip.style.padding = '8px 12px';
shopHoverTooltip.style.borderRadius = '6px';
shopHoverTooltip.style.border = '2px solid #ffcc00';
shopHoverTooltip.style.fontFamily = "'Special Elite', cursive";
shopHoverTooltip.style.fontSize = '1.2rem';
shopHoverTooltip.style.pointerEvents = 'none';
shopHoverTooltip.style.zIndex = '10000';
shopHoverTooltip.style.display = 'none';
shopHoverTooltip.style.textShadow = '0 0 5px rgba(255,170,0,0.5)';
shopHoverTooltip.style.boxShadow = '0 0 10px rgba(0,0,0,0.8)';
document.body.appendChild(shopHoverTooltip);

window.addEventListener('pointermove', (e) => {
    if (!lookModeActive) {
        if (currentState === GameState.PLAYING && isShopRoom) {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(shopGroup.children, true);
            let foundItem = null;
            let foundLeave = false;
            for (let i = 0; i < intersects.length; i++) {
                let obj = intersects[i].object;
                while (obj && obj !== shopGroup) {
                    if (obj.userData && obj.userData.shopItem) {
                        foundItem = obj.userData.shopItem;
                        break;
                    }
                    if (obj.userData && obj.userData.isLeaveSign) {
                        foundLeave = true;
                        break;
                    }
                    obj = obj.parent;
                }
                if (foundItem || foundLeave) break;
            }

            if (foundItem) {
                let statsHtml = '';
                if (foundItem.stats) {
                    if (typeof foundItem.stats === 'string') {
                        statsHtml = foundItem.stats;
                    } else {
                        // Merge base stats with persistent stats
                        const statsToDisplay = { ...foundItem.stats };
                        if (foundItem.name === "Graduate's Cap" && typeof activeProfile !== 'undefined' && activeProfile.graduateCapStats) {
                            Object.keys(activeProfile.graduateCapStats).forEach(pk => {
                                statsToDisplay[pk] = (statsToDisplay[pk] || 0) + (activeProfile.graduateCapStats[pk] || 0);
                            });
                        }
                        if (foundItem.name.toLowerCase().includes("notebook")) {
                            Object.keys(items.notebook_bonus_stats).forEach(nk => {
                                statsToDisplay[nk] = (statsToDisplay[nk] || 0) + (items.notebook_bonus_stats[nk] || 0);
                            });
                        }

                        const keys = Object.keys(statsToDisplay);
                        keys.forEach(k => {
                            if (k === 'spells' && Array.isArray(statsToDisplay[k])) {
                                statsToDisplay[k].forEach(s => {
                                    statsHtml += `<div style="color:#ffcc00">SPELL: ${s}</div>`;
                                });
                            } else {
                                const val = statsToDisplay[k];
                                if (val !== 0 && typeof val === 'number') {
                                    const prefix = val > 0 ? '+' : '';
                                    const suffix = percentStats.includes(k) ? '%' : '';
                                    const label = getStatLabel(k);
                                    statsHtml += `<div style="border-left: 2px solid #444; padding-left: 8px; font-size: 0.95rem; color:#ccc;">${label}: ${prefix}${val}${suffix}</div>`;
                                }
                            }
                        });
                    }
                }

                shopHoverTooltip.style.display = 'block';

                // Dynamic stats are already merged into statsToDisplay above, so we don't need a redundant shouty section
                let dynamicBonusHtml = '';

                shopHoverTooltip.innerHTML = `
                    <div style="font-weight:bold; color:#ffcc00; font-size: 1.2rem;">${foundItem.name}</div>
                    <div style="font-style:italic; color:#888; font-size:0.95rem; margin-bottom:8px;">
                        ${foundItem.description || 'A piece of gear with unique properties.'}
                        ${foundItem.name === "Spellonomicon" ? `<div style="color:#ff00ff; margin-top:4px; font-weight:bold;">Progress: ${items.spellonomicon_dmg_count || 0}/10 DMG</div>` : ''}
                        ${foundItem.name === "Diary" ? `<div style="color:#ffcc00; margin-top:4px; font-weight:bold;">Words Spelled: ${activeProfile?.diaryWordCount || 0}/20</div>` : ''}
                        ${foundItem.name === "Manuscript" ? `<div style="color:#ffcc00; margin-top:4px; font-weight:bold;">Words Spelled: ${activeProfile?.diaryWordCount || 0}/50</div>` : ''}
                        ${foundItem.name.includes("Notebook") ? `<div style="color:#ffff00; margin-top:4px; font-weight:bold;">Total Words Spelled: ${items.notebook_word_count || 0} (${(items.notebook_word_count % 5)}/5 next bonus)</div>` : ''}
                    </div>
                    ${dynamicBonusHtml ? `<div style="margin-bottom:8px; padding:4px; background:rgba(255,255,0,0.1); border-radius:4px;">${dynamicBonusHtml}</div>` : ''}
                    <div style="font-size:1.0rem; color:#ccc; font-style:italic; max-width:250px; line-height: 1.2;">
                        ${statsHtml}
                    </div>
                    <div style="font-size:1.1rem; color:#88ff88; margin-top: 8px; border-top: 1px solid rgba(255,204,0,0.3); padding-top: 4px;">🪙 ${foundItem.cost}</div>
                    <div style="font-size:0.9rem; color:#ffaa00; margin-top:4px;">CLICK TO BUY</div>
                `;
                const xPos = Math.min(e.clientX + 15, window.innerWidth - 220);
                shopHoverTooltip.style.left = xPos + 'px';
                shopHoverTooltip.style.top = (e.clientY + 15) + 'px';
            } else if (foundLeave) {
                shopHoverTooltip.style.display = 'block';
                shopHoverTooltip.innerHTML = `
                    <div style="font-weight:bold; color:#ff5555; font-size: 1.3rem;">LEAVE SHOP</div>
                    <div style="font-size:0.8rem; color:#ffaa00; margin-top:4px;">CLICK TO EXIT</div>
                `;
                shopHoverTooltip.style.left = (e.clientX + 15) + 'px';
                shopHoverTooltip.style.top = (e.clientY + 15) + 'px';
            } else {
                shopHoverTooltip.style.display = 'none';
            }
        } else {
            shopHoverTooltip.style.display = 'none';
        }
        return;
    }

    // Pointer Lock gives movementX / movementY directly
    const sensitivity = 0.002;
    targetRotation.y -= e.movementX * sensitivity;
    targetRotation.x -= e.movementY * sensitivity;

    // Clamp vertical rotation to within 10 degrees of vertical axis (approx +/- 80 degrees)
    // 80 degrees is ~1.4 radians
    targetRotation.x = Math.max(-1.4, Math.min(1.4, targetRotation.x));
});

// Also add a listener for when pointer lock is lost (e.g. user Alt-Tabs)
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== renderer.domElement && lookModeActive) {
        toggleLookMode(true);
    }
});


const mainCandleToggle = document.querySelector('#candles-toggle');
if (mainCandleToggle) {
    mainCandleToggle.onchange = () => {
        GlobalSettings.candlesEnabled = mainCandleToggle.checked;
        saveGameData();
        // Immediate feedback: toggle all existing candles
        candleLights.forEach(c => {
            if (c.group) c.group.visible = GlobalSettings.candlesEnabled;
        });
    };
}

const mainErrorToggle = document.querySelector('#errors-toggle');
if (mainErrorToggle) {
    mainErrorToggle.onchange = () => {
        GlobalSettings.errorsEnabled = mainErrorToggle.checked;
        saveGameData();
        // Immediate feedback: toggle all existing error meshes
        wordBricks.forEach(b => {
            if (b.userData.errorMesh) {
                b.userData.errorMesh.material.opacity = (GlobalSettings.errorsEnabled && b.userData.mistakes.length > 0) ? 1 : 0;
            }
        });
    };
}

const headBobToggle = document.querySelector('#headbob-toggle');
if (headBobToggle) {
    headBobToggle.onchange = () => {
        GlobalSettings.headBobEnabled = headBobToggle.checked;
        saveGameData();
    };
}

const tutorialToggle = document.querySelector('#tutorial-toggle');
if (tutorialToggle) {
    tutorialToggle.onchange = () => {
        GlobalSettings.tutorialEnabled = tutorialToggle.checked;
        saveGameData();
    };
}

const skeletonsToggle = document.querySelector('#skeletons-toggle');
if (skeletonsToggle) {
    skeletonsToggle.onchange = () => {
        GlobalSettings.skeletonsEnabled = skeletonsToggle.checked;
        saveGameData();
        // Immediate feedback: toggle all existing skeletons/bones
        dungeonGroup.traverse(node => {
            if (node.userData && node.userData.isSkeleton) {
                node.visible = GlobalSettings.skeletonsEnabled;
            }
        });
    };
}

const mainFloorToggle = document.querySelector('#classic-floor-toggle');
if (mainFloorToggle) {
    mainFloorToggle.onchange = () => {
        GlobalSettings.classicFloor = mainFloorToggle.checked;
        saveGameData();

        // Immediate feedback: rebuild and re-apply
        const skinSets = ROOM_SKINS.map(buildSkinMaterials);
        // Clear and refill skinMaterialSets array
        skinMaterialSets.splice(0, skinMaterialSets.length, ...skinSets);

        applyRoomSkin(currentRoom);

        // Find existing floor meshes in the scene and update them
        dungeonGroup.traverse(node => {
            if (node.isMesh && node.userData.isFloor) {
                node.material = floorMat;
            }
        });
    };
}

// Mode selection in the Main Menu
document.querySelectorAll('.mode-btn').forEach(btn => btn.onclick = () => {
    challenger.setMode(btn.dataset.mode);
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    saveGameData();
});

// List selection in the Main Menu
document.querySelectorAll('.list-btn').forEach(btn => btn.onclick = () => {
    library.setDataset(btn.dataset.list);
    document.querySelectorAll('.list-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    saveGameData();
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Interactive Raycaster ───────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => {
    if (currentState !== GameState.PLAYING && currentState !== GameState.MCQ) return;
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // CENTER RAYCAST DURING POINTER LOCK (FREE LOOK)
    if (lookModeActive) {
        mouse.x = 0;
        mouse.y = 0;
    }

    setTimeout(() => {
        if (!lookModeActive) WORD_INPUT.focus();
    }, 50);

    raycaster.setFromCamera(mouse, camera);

    // FREE LOOK PICKUP (Found Items)
    if (lookModeActive) {
        const intersects = raycaster.intersectObjects(dungeonGroup.children, true);
        for (let i = 0; i < intersects.length; i++) {
            let obj = intersects[i].object;
            while (obj && obj !== dungeonGroup) {
                if (obj.userData && obj.userData.isFoundItem) {
                    const proto = obj.userData.foundItem;

                    if (obj.userData.isGoldBag) {
                        // Logic for Bag of Gold (Respect stored amount if present, otherwise roll default)
                        const amount = obj.userData.goldAmount || (Math.floor(Math.random() * 21) + 5);
                        playerGold += amount;
                        showToast(`FOUND ${amount} GOLD!`);
                        dungeonGroup.remove(obj);
                        updateUI();
                        saveGameData();
                        return;
                    }

                    const newItem = items.createItem(proto);
                    if (items.addItem(newItem)) {
                        showToast(`FOUND ${proto.name.toUpperCase()}!`);
                        dungeonGroup.remove(obj);
                        updateUI();
                        saveGameData();
                    } else {
                        showToast("INVENTORY FULL!");
                    }
                    return;
                }
                obj = obj.parent;
            }
        }
    }

    if (isShopRoom) {
        const intersects = raycaster.intersectObjects(shopGroup.children, true);
        let foundObject = null;
        let foundItem = null;
        let foundLeave = false;
        for (let i = 0; i < intersects.length; i++) {
            let obj = intersects[i].object;
            while (obj && obj !== shopGroup) {
                if (obj.userData && obj.userData.shopItem && !obj.userData.isPriceTag) {
                    foundObject = obj;
                    foundItem = obj.userData.shopItem;
                    break;
                }
                if (obj.userData && obj.userData.isLeaveSign) {
                    foundLeave = true;
                    break;
                }
                obj = obj.parent;
            }
            if (foundItem || foundLeave) break;
        }

        if (foundLeave) {
            exitShop();
            return;
        }

        if (foundItem) {
            const cost = getDiscountedCost(foundItem.cost);
            if (playerGold >= cost) {
                const newItem = items.createItem(foundItem);
                if (items.addItem(newItem)) {
                    playerGold -= cost;
                    showToast(`BOUGHT ${foundItem.name}!`);

                    // Punch Card increment
                    const activePunches = [items.hat, ...items.utensils, ...items.storage].filter(i => i && i.name === "Punch Card");
                    activePunches.forEach(p => {
                        p.boughtCount = (p.boughtCount || 0) + 1;
                        console.log(`[ITEM] Punch Card updated: ${p.boughtCount}% discount`);
                    });

                    // Remove from persistent shop stock
                    if (shopRoomItems) {
                        const sIdx = shopRoomItems.indexOf(foundItem);
                        if (sIdx !== -1) shopRoomItems.splice(sIdx, 1);
                    }

                    // Remove from shop scene
                    if (foundObject.userData.priceTag) {
                        shopGroup.remove(foundObject.userData.priceTag);
                    }
                    shopGroup.remove(foundObject);
                    updateUI();
                    saveGameData();
                } else {
                    showToast("INVENTORY FULL!");
                }
            } else {
                showToast("NOT ENOUGH GOLD!");
            }
            return;
        }
    }

    if (currentState === GameState.MCQ) {
        const intersects = raycaster.intersectObjects(mcqHitboxes, false);
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            if (hit.userData && hit.userData.option && hit.userData.isChoiceBacking) {
                handleMCQChoice(hit.userData.option, hit);
            }
        }
        return;
    }

    if (revealModeActive) {
        const intersects = raycaster.intersectObjects(wordBricks, false);
        if (intersects.length > 0) {
            const hitBrick = intersects[0].object;
            if (hitBrick.userData && hitBrick.userData.letter && !hitBrick.userData.revealed) {
                if (ink < 10) {
                    showToast("Not enough ink!");
                    return;
                }
                ink -= 10;
                revealBrick(hitBrick, true);
                revealModeActive = false;
                const btn = document.querySelector('#reveal-btn');
                if (btn) {
                    btn.style.color = '';
                    btn.innerHTML = '<span class="hotkey-badge">1</span>REVEAL (10)';
                }
                updateUI();
                checkWordSolved();
                if (WORD_INPUT) WORD_INPUT.focus();
                return; // Interaction handled
            }
        }
    }

    // Toggle free-look zoom if NO item, NO button, and NO brick was interacted with
    if (lookModeActive) {
        lookModeZoomActive = !lookModeZoomActive;
    }
});

// ── Main Loop ──────────────────────────────────────────────────────────────
let lastFrameTime = performance.now();
const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS;

function animate(currentTime) {
    requestAnimationFrame(animate);

    // Initial call might have undefined currentTime
    if (!currentTime) currentTime = performance.now();

    const deltaTime = currentTime - lastFrameTime;

    // THROW DOWN FPS IN MENUS TO SAVE HEAT
    let targetFPS = TARGET_FPS;
    if (GlobalSettings.performanceMode) {
        targetFPS = 30; // 30 FPS cap in performance mode
    }
    if (currentState !== GameState.PLAYING && currentState !== GameState.MCQ) {
        targetFPS = 25; // 25 FPS is enough for menu UI
    }

    // Camera Look Around Interpolation
    const deltaY = Math.abs(camera.rotation.y - targetRotation.y);
    const deltaX = Math.abs(camera.rotation.x - targetRotation.x);
    if (!camera.userData.isAnimating && (lookModeActive || deltaY > 0.001 || deltaX > 0.001)) {
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotation.y, 0.1);
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotation.x, 0.1);
    }

    // Free-Look Zoom: Lerp FOV for smooth transition (75 -> 50 is 50% zoom)
    const targetFOV = lookModeZoomActive ? 50 : 75;
    if (Math.abs(camera.fov - targetFOV) > 0.01) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.15);
        camera.updateProjectionMatrix();
    }
    const frameDuration = 1000 / targetFPS;

    if (deltaTime < frameDuration) return;

    // Centralized update for coins
    updateCoins(deltaTime);

    // Adjust lastFrameTime
    lastFrameTime = currentTime - (deltaTime % frameDuration);

    // Torch Flicker Effect - using constant speed
    const time = performance.now();
    // Throttle flicker logic in performance mode (calculate every ~30ms)
    const flickerThrottle = GlobalSettings.performanceMode ? 30 : 0;
    const sinceLastFlicker = time - (camera.userData.lastFlickerTime || 0);

    if (sinceLastFlicker >= flickerThrottle) {
        camera.userData.lastFlickerTime = time;
        const stats = items.getTotalStats();
        const glowMult = 1 + (stats.glow / 100);

        mainLight.intensity = (21 + Math.sin(time * 0.01) * 3 + Math.random() * 2) * glowMult;

        // Candle Flicker: More subtle
        candleLights.forEach(c => {
            const flicker = Math.sin(time * 0.008 + c.seed) * 0.2 + Math.random() * 0.1;
            c.light.intensity = (c.baseIntensity + flicker) * glowMult;
            c.light.distance = (c.baseDistance || 6.05) * glowMult;
            c.flame.scale.setScalar(1 + flicker * 0.1);
        });

        // Brazier Flicker: More crackling/intense
        brazierLights.forEach(b => {
            const flicker = Math.sin(time * 0.012 + b.seed) * 0.4 + (Math.random() - 0.5) * 0.3;
            b.light.intensity = (b.baseIntensity + flicker) * glowMult;
            b.light.distance = (b.baseDistance || 5.5) * glowMult;
        });
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.add(p.vel);
        p.life -= 0.02;

        let currentScale = p.life;
        if (p.isSparkle) {
            // Add a shimmering flicker effect for sparkles
            const flicker = Math.sin(time * 0.02 + i) * 0.5 + 0.5;
            p.mesh.material.opacity = p.life * flicker;
            currentScale = p.life * (0.8 + flicker * 0.4);
        } else {
            p.mesh.material.opacity = p.life;
        }

        p.mesh.scale.setScalar(currentScale);

        if (p.life <= 0) {
            p.mesh.visible = false;
            particles.splice(i, 1);
        }
    }
    // Chest Animation Update
    if (chestMesh && chestMesh.userData.update) {
        chestMesh.userData.update(deltaTime);
    }

    // Shop Item Idle Rotation
    if (isShopRoom && shopGroup) {
        shopGroup.children.forEach(child => {
            if (child.userData && child.userData.shopItemName) {
                // Determine a unique speed per item based on its position for a natural look
                const speed = 0.005 + (child.position.x * 0.001);
                child.rotation.y += speed;
            }
        });
    }

    // Gnome Animation Update
    if (window.updateGnome) {
        updateGnome(deltaTime);
    }

    // Rat Hole Updates
    activeRats.forEach(rat => {
        if (rat.userData && rat.userData.update) {
            rat.userData.update();
        }
    });

    if (GlobalSettings.headBobEnabled && !isChestRoom && !isPuzzleChest && !isShopRoom) {
        camera.position.y = 2 + Math.sin(time * 0.00135) * 0.072; // Reduced bob
    } else {
        camera.position.y = 2; // Flat height/Locked
    }
    renderer.render(scene, camera);
}

function createFancyChest(x, y, z) {
    const chestGroup = new THREE.Group();
    const scaleFactor = 0.65;
    chestGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Rich dark mahogany and polished gold
    const fancyWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d1a11, roughness: 0.8 });
    const fancyGoldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });

    // --- BASE ---
    const baseGeo = new THREE.BoxGeometry(2.3, 1.1, 1.5);
    const base = new THREE.Mesh(baseGeo, fancyWoodMat);
    base.position.y = 0.55;
    chestGroup.add(base);

    // Decorative corner pillars (Gold)
    for (const px of [-1.15, 1.15]) {
        for (const pz of [-0.75, 0.75]) {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.15, 8), fancyGoldMat);
            pillar.position.set(px, 0.55, pz);
            chestGroup.add(pillar);
        }
    }

    // --- LID ---
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 1.1, -0.75); // Pivot at back top edge
    chestGroup.add(lidGroup);

    // Faceted curved lid (hexagonal half)
    const lidBackingGeo = new THREE.CylinderGeometry(0.75, 0.75, 2.3, 4, 1, false, -Math.PI / 2, Math.PI);
    const lidMesh = new THREE.Mesh(lidBackingGeo, fancyWoodMat);
    lidMesh.rotation.z = Math.PI / 2;
    lidMesh.position.set(0, 0, 0.75);
    lidGroup.add(lidMesh);

    // Gold trim rings over the faceted lid
    for (const px of [-0.9, 0, 0.9]) {
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.77, 0.77, 0.2, 4, 1, false, -Math.PI / 2, Math.PI), fancyGoldMat);
        ring.rotation.z = Math.PI / 2;
        ring.position.set(px, 0, 0.75);
        lidGroup.add(ring);
    }

    // --- PADLOCK (Centered on front) ---
    const padlockGroup = new THREE.Group();
    padlockGroup.position.set(0, -0.15, 1.55); // Front face of lid
    lidGroup.add(padlockGroup);

    // Ornate shield-shaped padlock base
    const padBodyGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 6);
    const padBody = new THREE.Mesh(padBodyGeo, fancyGoldMat);
    padBody.rotation.x = Math.PI / 2; // Flat against chest
    padBody.rotation.y = Math.PI / 6; // Pointy hex
    padlockGroup.add(padBody);

    const shackleGeo = new THREE.TorusGeometry(0.18, 0.05, 8, 16, Math.PI);
    const shackleMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.9, roughness: 0.1 });
    const shackle = new THREE.Mesh(shackleGeo, shackleMat);
    shackle.position.y = 0.25;
    padlockGroup.add(shackle);

    // --- LOCKPICKS ---
    const picksGroup = new THREE.Group();
    picksGroup.position.set(0, -0.05, 0.1);
    padlockGroup.add(picksGroup);

    // Varied intricate lockpicks
    const pickColors = [0x555555, 0xaaaaaa, 0x886644];
    for (let i = 0; i < 3; i++) {
        const pickGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.6, 6);
        const pickMat = new THREE.MeshStandardMaterial({ color: pickColors[i], metalness: 0.8, roughness: 0.2 });
        const pick = new THREE.Mesh(pickGeo, pickMat);
        pick.rotation.x = -Math.PI / 2.5;
        pick.rotation.z = (i - 1) * 0.3 + (Math.random() * 0.1); // Angled more chaotically
        pick.position.set((i - 1) * 0.08, Math.random() * 0.1, 0.25);

        // Add tension wrench handles
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.02), pickMat);
        handle.position.y = 0.3;
        pick.add(handle);

        picksGroup.add(pick);
    }

    // Position in world
    chestGroup.position.set(x, y, z);
    chestGroup.rotation.y = -Math.PI / 1.7;

    // --- ANIMATION STATE ---
    let targetLidRot = 0;
    let currentLidRot = 0;
    let rattleTimer = 0;
    const baseRotY = chestGroup.rotation.y;

    chestGroup.userData.open = () => {
        targetLidRot = -Math.PI / 1.9; // Opens wide
        createSpellBurst("#ffcc00", padlockGroup.getWorldPosition(new THREE.Vector3()));
        createSpellBurst("#00ffcc", padlockGroup.getWorldPosition(new THREE.Vector3())); // Double burst
    };

    chestGroup.userData.rattle = () => {
        rattleTimer = 0.5; // Seconds of rattle
    };

    chestGroup.userData.update = () => {
        const delta = 0.016; // Approx 60fps

        // Lid Opening
        currentLidRot += (targetLidRot - currentLidRot) * 0.1;
        lidGroup.rotation.x = currentLidRot;

        // Rattle & Jiggle
        if (rattleTimer > 0) {
            rattleTimer -= delta;
            chestGroup.rotation.y = baseRotY + Math.sin(Date.now() * 40) * 0.03;
            picksGroup.rotation.z = Math.sin(Date.now() * 50) * 0.2;
            picksGroup.position.x = Math.sin(Date.now() * 60) * 0.03;
            padBody.rotation.z = Math.sin(Date.now() * 45) * 0.1; // Padlock jiggles too
        } else {
            chestGroup.rotation.y = baseRotY;
            padBody.rotation.z = 0;
            // Constant subtle jiggle for lockpicks
            picksGroup.rotation.z = Math.sin(Date.now() * 0.003) * 0.08;
            picksGroup.rotation.x = Math.sin(Date.now() * 0.002) * 0.02;
        }
    };

    dungeonGroup.add(chestGroup);
    return chestGroup;
}

function createNewChest(x, y, z) {
    const chestGroup = new THREE.Group();

    // Scale: Overall smaller (about 65% of room-filling size)
    const scaleFactor = 0.65;
    chestGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const outlineScale = 1.05;

    // --- BASE ---
    const baseGeo = new THREE.BoxGeometry(2.2, 1.0, 1.4);
    const base = new THREE.Mesh(baseGeo, chestMat);
    base.position.y = 0.5;
    chestGroup.add(base);

    const baseOutline = new THREE.Mesh(baseGeo, outlineMat);
    baseOutline.scale.set(1.05, 1.05, 1.08);
    base.add(baseOutline);

    // --- LID ---
    // Curved lid using a half-cylinder
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 1.0, -0.7); // Pivot at back top edge
    chestGroup.add(lidGroup);

    // Cylinder geom for curved top: radius 0.7, length 2.2
    const lidBackingGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 16, 1, false, -Math.PI / 2, Math.PI);
    const lidMesh = new THREE.Mesh(lidBackingGeo, chestMat);
    lidMesh.rotation.z = Math.PI / 2; // Lie horizontal
    lidMesh.position.set(0, 0, 0.7); // Offset forward from pivot
    lidGroup.add(lidMesh);

    const lidOutline = new THREE.Mesh(lidBackingGeo, outlineMat);
    lidOutline.scale.set(1.04, 1.04, 1.05);
    lidMesh.add(lidOutline);

    // --- PADLOCK (Centered on front) ---
    const padlockGroup = new THREE.Group();
    padlockGroup.position.set(0, -0.1, 1.4); // Front face of lid
    lidGroup.add(padlockGroup);

    const padBodyGeo = new THREE.BoxGeometry(0.4, 0.45, 0.15);
    const padBody = new THREE.Mesh(padBodyGeo, goldMat);
    padlockGroup.add(padBody);

    const shackleGeo = new THREE.TorusGeometry(0.15, 0.04, 8, 16, Math.PI);
    const shackleMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.1 });
    const shackle = new THREE.Mesh(shackleGeo, shackleMat);
    shackle.position.y = 0.22;
    padlockGroup.add(shackle);

    // --- LOCKPICKS (Jiggling in the keyhole) ---
    const picksGroup = new THREE.Group();
    picksGroup.position.set(0, -0.05, 0.08);
    padlockGroup.add(picksGroup);

    for (let i = 0; i < 3; i++) {
        const pickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4);
        const pick = new THREE.Mesh(pickGeo, silverMat);
        pick.rotation.x = -Math.PI / 2.2;
        pick.rotation.z = (i - 1) * 0.2;
        pick.position.set((i - 1) * 0.06, 0, 0.2);
        picksGroup.add(pick);
    }

    // --- STRAPS ---
    const strapGeo = new THREE.BoxGeometry(0.2, 0.75, 1.5);
    const strapL = new THREE.Mesh(strapGeo, goldMat);
    strapL.position.set(-0.7, 0.05, 0.7);
    lidGroup.add(strapL);

    const strapR = new THREE.Mesh(strapGeo, goldMat);
    strapR.position.set(0.7, 0.05, 0.7);
    lidGroup.add(strapR);

    // Position in world
    chestGroup.position.set(x, y, z);
    chestGroup.rotation.y = -Math.PI / 1.7;

    // --- ANIMATION STATE ---
    let targetLidRot = 0;
    let currentLidRot = 0;
    let rattleTimer = 0;
    const baseRotY = chestGroup.rotation.y;

    chestGroup.userData.open = () => {
        targetLidRot = -Math.PI / 2.0;
        createSpellBurst("#ffcc00", padlockGroup.getWorldPosition(new THREE.Vector3()));
    };

    chestGroup.userData.rattle = () => {
        rattleTimer = 0.5; // Seconds of rattle
    };

    chestGroup.userData.update = () => {
        const delta = 0.016; // Approx 60fps

        // Lid Opening
        currentLidRot += (targetLidRot - currentLidRot) * 0.1;
        lidGroup.rotation.x = currentLidRot;

        // Rattle & Jiggle
        if (rattleTimer > 0) {
            rattleTimer -= delta;
            chestGroup.rotation.y = baseRotY + Math.sin(Date.now() * 40) * 0.03;
            picksGroup.rotation.z = Math.sin(Date.now() * 50) * 0.15;
            picksGroup.position.x = Math.sin(Date.now() * 60) * 0.02;
        } else {
            chestGroup.rotation.y = baseRotY;
            // Constant subtle jiggle for lockpicks
            picksGroup.rotation.z = Math.sin(Date.now() * 0.003) * 0.05;
        }
    };

    dungeonGroup.add(chestGroup);
    return chestGroup;
}

// ── Boot ──────────────────────────────────────────────────────────────────
Persistence.attemptMigration();
// Apply saved voice on load
if (GlobalSettings.preferredVoice) {
    // Wait for voices to load
    const applyVoice = () => {
        if (challenger.setVoiceByName(GlobalSettings.preferredVoice)) {
            console.log("Applied saved voice preference:", GlobalSettings.preferredVoice);
        }
    };
    if (window.speechSynthesis.getVoices().length > 0) applyVoice();
    else window.speechSynthesis.addEventListener('voiceschanged', applyVoice, { once: true });
}

// Apply Global Settings
library.setDataset(GlobalSettings.wordList);
challenger.setMode(GlobalSettings.mode);
challenger.volume = GlobalSettings.volume / 100;

const candleToggle = document.querySelector('#candles-toggle');
if (candleToggle) candleToggle.checked = GlobalSettings.candlesEnabled;
const errorToggle = document.querySelector('#errors-toggle');
if (errorToggle) errorToggle.checked = GlobalSettings.errorsEnabled;
const bootTutorialToggle = document.querySelector('#tutorial-toggle');
if (bootTutorialToggle) bootTutorialToggle.checked = GlobalSettings.tutorialEnabled;

// Load Active Profile
function buildProfileUI() {
    const list = document.querySelector('#profiles-list');
    if (!list) return;

    const profiles = ProfileManager.getProfiles();
    const activeId = ProfileManager.getActiveProfileId();

    if (profiles.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 2rem;">No characters found.</p>';
        return;
    }

    list.innerHTML = profiles.map(p => {
        // Calculate summary stats for the card
        let hpBonus = 0;
        let inkBonus = 0;
        let armorBonus = 0;
        let rummageBonus = 0;

        if (p.itemData) {
            const equipped = [];
            if (p.itemData.hat) equipped.push(p.itemData.hat);
            if (p.itemData.utensils) equipped.push(...p.itemData.utensils);

            equipped.forEach(item => {
                if (item && item.stats) {
                    hpBonus += (item.stats.hp || 0);
                    inkBonus += (item.stats.ink || 0);
                    armorBonus += (item.stats.armor || 0);
                    rummageBonus += (item.stats.rummage || 0);
                }
            });
        }

        const isActive = p.id === activeId;
        const totalWords = library.getGlobalTotalWords();
        const spelledCount = p.spelledWords ? p.spelledWords.length : 0;
        const progressPercent = Math.round((spelledCount / totalWords) * 100);

        return `
            <div class="profile-card ${isActive ? 'active-profile' : ''}" data-id="${p.id}" style="--profile-color: ${p.spellColor};">
                <div class="profile-card-inner">
                    <div class="profile-header">
                        <div class="profile-name-group">
                            <h3 class="profile-name">${escapeHtml(p.name)}</h3>
                            <div class="profile-meta">Character Level ${Math.ceil((p.maxRoom || 1) / 5) + 1}</div>
                        </div>
                        <div class="profile-room-badge">
                            <span class="badge-label">ROOM</span>
                            <span class="badge-value">${p.maxRoom || 1}</span>
                        </div>
                    </div>
                    
                    <div class="profile-stats-container">
                        <div class="p-stat-box" title="Max Health Bonus">
                            <span class="p-stat-icon">❤️</span>
                            <span class="p-stat-val">+${hpBonus}</span>
                        </div>
                        <div class="p-stat-box" title="Max Ink Bonus">
                            <span class="p-stat-icon">💧</span>
                            <span class="p-stat-val">+${inkBonus}</span>
                        </div>
                        <div class="p-stat-box" title="Armor">
                            <span class="p-stat-icon">🛡️</span>
                            <span class="p-stat-val">+${armorBonus}</span>
                        </div>
                        <div class="p-stat-box" title="Item Find Luck">
                            <span class="p-stat-icon">🍀</span>
                            <span class="p-stat-val">+${rummageBonus}%</span>
                        </div>
                    </div>

                    <div class="profile-progress-section">
                        <div class="progress-info">
                            <span>Vocabulary Mastery</span>
                            <span>${progressPercent}%</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${progressPercent}%; background: ${p.spellColor}"></div>
                        </div>
                        <div class="progress-subtext">${spelledCount} / ${totalWords} Words Discovered</div>
                    </div>

                    <div class="profile-card-footer">
                        <button class="delete-profile-btn" data-id="${p.id}" title="Delete Character">
                            <span class="trash-icon">🗑️</span>
                        </button>
                    </div>
                    
                    ${isActive ? '<div class="active-ribbon">SELECTED</div>' : ''}
                </div>
            </div>
        `;
    }).join('');

    // Add listeners to cards
    document.querySelectorAll('.profile-card').forEach(card => {
        card.onclick = (e) => {
            if (e.target.classList.contains('delete-profile-btn')) return;
            const id = card.dataset.id;
            const profile = profiles.find(p => p.id === id);
            if (profile) {
                loadProfile(profile);
                setGameState(GameState.MENU);
            }
        };
    });

    // Add listeners to delete buttons
    document.querySelectorAll('.delete-profile-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const pId = btn.dataset.id;
            const profile = profiles.find(p => p.id === pId);
            const pName = profile ? profile.name : 'this character';

            if (confirm(`Are you sure you want to delete ${pName}?`)) {
                ProfileManager.deleteProfile(pId);
                const newActiveId = ProfileManager.getActiveProfileId();
                if (newActiveId) {
                    const newProfile = ProfileManager.getProfiles().find(p => p.id === newActiveId);
                    if (newProfile) loadProfile(newProfile);
                }
                buildProfileUI();
            }
        };
    });
}

function loadProfile(profile) {
    if (!profile) return;
    activeProfile = profile;
    ProfileManager.setActiveProfileId(profile.id);
    MageConfig.name = profile.name;
    MageConfig.spellColor = profile.spellColor;

    // Load Items
    items.deserialize(profile.itemData);

    // Update UI elements dependent on config
    const nameInput = document.querySelector('#player-name-input');
    if (nameInput) nameInput.value = MageConfig.name;

    document.querySelectorAll('.color-swatch').forEach(s => {
        if (s.dataset.color === MageConfig.spellColor) s.classList.add('active');
        else s.classList.remove('active');
    });

    updateInventoryUI();
    const stats = items.getTotalStats();
    health = baseMaxHealth + stats.hp;
    ink = baseMaxInk + stats.ink;

    // Update Game Unlocks based on progress
    const diaryWords = profile.diaryWordCount || 0;
    GameUnlocks.puzzleMode = (diaryWords >= 5 || profile.puzzleModeUnlocked);
    GameUnlocks.bossRush = (diaryWords >= 10 || profile.bossRushUnlocked);

    refreshMenuButtonVisibility();

    updateUI();
    updateMenuRunButtons();
}

function updateMenuRunButtons() {
    const startBtn = document.getElementById('start-btn');
    const continueRow = document.getElementById('continue-row');

    if (startBtn && continueRow) {
        const activeProfile = ProfileManager.getActiveProfile();
        // Only show CONTINUE if the specific active profile has a saved run.
        const activeRun = activeProfile ? activeProfile.savedRun : null;

        if (activeRun) {
            startBtn.style.display = 'none';
            continueRow.style.display = 'flex';
        } else {
            startBtn.style.display = 'inline-block';
            continueRow.style.display = 'none';
        }
    }
}

let activeProfile = ProfileManager.getActiveProfile();
if (activeProfile) {
    loadProfile(activeProfile);
} else {
    // We have no profiles, we need to create one.
    // In a real flow, we might force the custom menu first.
    // For now, auto-create a default one if none exist
    const profiles = ProfileManager.getProfiles();
    if (profiles.length === 0) {
        activeProfile = ProfileManager.createProfile("New Mage", "#00d4ff");
        loadProfile(activeProfile);
    }
}

// Update settings UI to match loaded config
function refreshMenuButtonVisibility() {
    // Ensure GameUnlocks matches active profile before refreshing
    if (activeProfile) {
        const dwc = activeProfile.diaryWordCount || 0;
        GameUnlocks.puzzleMode = (dwc >= 5 || activeProfile.puzzleModeUnlocked);
        GameUnlocks.bossRush = (dwc >= 10 || activeProfile.bossRushUnlocked);
    }

    document.querySelectorAll('.mode-btn').forEach(btn => {
        const mode = btn.dataset.mode;
        btn.classList.toggle('active', mode === GlobalSettings.mode);

        if (mode === 'puzzle') {
            btn.classList.toggle('locked', !GameUnlocks.puzzleMode);
        } else if (mode === 'bossrush') {
            btn.classList.toggle('locked', !GameUnlocks.bossRush);
        } else {
            btn.classList.remove('locked');
        }
        btn.style.display = 'inline-block';
    });
}
refreshMenuButtonVisibility();
challenger.setMode(GlobalSettings.mode); // Sync manager to starting choice
library.currentSetKey = GlobalSettings.wordList; // Sync library to starting choice

document.querySelectorAll('.list-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.list === GlobalSettings.wordList);
});

window.onerror = function (msg, url, line, col, error) {
    if (typeof showToast === 'function') {
        showToast("CRITICAL ERROR: " + msg);
    }
    console.error("Game Error:", msg, "at", url, ":", line, ":", col, error);
};

animate();
setGameState(GameState.MENU);


