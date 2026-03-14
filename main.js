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
    adventure: "ADVENTURE"
};

const MageConfig = {
    name: "Unknown Mage",
    spellColor: "#00d4ff",
    wordList: "sat",
    mode: "random"
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
            itemData: { inventory: [], equipped: {} },
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
            headBobEnabled: saved.headBobEnabled ?? true
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
    "it's just in the next room",
    "eighth.... eighth.... ghth... it makes no sense",
    "I DON'T KNOW THESE WORDS!",
    "how do you get out of here",
    "what is this place",
    "that's not a real word... It's not real... It's a hallucination!",
    "I've been down here... so long.",
    "If anyone sees this message, turn back now.",
    "my pen is almost out of ink",
    "this piece of chalk is down to a nub",
    "these aren't words people use!",
    "Big_Speller_75 wuz hear",
    "Greatingz frum SpellMystro",
    "VoCab4QT, 1st to this room 2026",
    "DorkKnob55 here 1864, on expeddishion",
    "my teacher sent me down here",
    "please... help",
    "one more silent letter and I'm done for",
    "We lost three people down here during the expedition of 1792",
    "leave no trace",
    "I can't remember which of these doors leads out",
    "$P3LL3R_XTREME iz duh besst!"
];

const TUTORIAL_TIPS = {
    1: "Press ESC to open your inventory.",
    2: "Use your ink to cast spells.",
    3: "Spells are located at the bottom of the screen.",
    4: "Compare and equip items on the inventory screen.",
    5: "Every 5th room is a timed challenge!",
    6: "9 items of the same tier can be combined together in the forge.",
    7: "Missed letters do 1 damage each, and damage increases every 2 levels."
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
    [GameState.MCQ]: document.querySelector('#mcq-screen'),
    [GameState.REPORT_BUG]: document.querySelector('#bug-report-modal'),
};

const WORD_INPUT = document.querySelector('#word-input');
const HEAR_BTN = document.querySelector('#hear-btn');
const MODE_BTNS = document.querySelectorAll('.mode-btn');
const nameInput = document.querySelector('#player-name-input');
let activeRats = [];

const items = new ItemManager();
const baseMaxHealth = 20;
const baseMaxInk = 20;

// ── Three.js Initialization ────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040608); // Cooler darkness
scene.fog = new THREE.FogExp2(0x040608, 0.08); // Use FogExp2 for better atmosphere

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#game-canvas'),
    antialias: !GlobalSettings.performanceMode
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(GlobalSettings.performanceMode ? 1 : Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased ambient
scene.add(ambientLight);

const mainLight = new THREE.PointLight(0xff7733, 18, 44); // Slightly cooler/softer torchlight, 10% radius increase
mainLight.position.set(0, 5, 5);
mainLight.castShadow = true; // Enable shadow potential
scene.add(mainLight);

const fillLight = new THREE.PointLight(0x556688, 6, 33); // Cool grey-blue fill light, 10% radius increase
fillLight.position.set(0, 5.5, -5); // Moved down to be below the new roof
scene.add(fillLight);

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
        atmos: { fog: 0x040507, mainLight: 0xcc8844, mainInt: 21, fillLight: 0x3a4455, fillInt: 7.5, flame: 0xdd9944, candleLight: 0xcc8833 },
    },
    { // Catacombs — deep ochre bone, many small pits, dusty
        name: 'Catacombs',
        brick: { base: '#2e2820', grit: [40, 36, 28], gritAlpha: 0.35, gritCount: 35000, gritSize: 3, crackColor: '#1a1510', crackWidth: 1, crackCount: 70, crackSegs: 4, crackSpread: 35, bumpCrack: '#161008', bumpCrackW: 2 },
        wordBrick: { base: '#3a3428', grit: [70, 62, 50], gritAlpha: 0.45, gritCount: 45000, gritSize: 3, crackColor: '#28221a', crackWidth: 1.5, crackCount: 90, crackSegs: 5, crackSpread: 40, bumpCrack: '#140c04', bumpCrackW: 3 },
        door: { base: '#302818', grit: [25, 20, 14], gritRange: 22, crackColor: '#161008', crackWidth: 4, crackCount: 6, crackSegs: 2, crackSpread: 180, bumpCrack: '#1c1408', bumpCrackW: 5 },
        mat: { brickColor: 0x8a7558, wordColor: 0x9a8868, doorColor: 0x786548, brickRough: 0.98, brickMetal: 0.02, bumpScale: 0.15 },
        atmos: { fog: 0x060503, mainLight: 0xcc8833, mainInt: 14.3, fillLight: 0x4a3d2e, fillInt: 2, flame: 0xddaa55, candleLight: 0xbb8822 },
    },
    { // Frozen Cavern — muted steel-blue, smooth with ice fractures
        name: 'Frozen Cavern',
        brick: { base: '#222830', grit: [28, 33, 42], gritAlpha: 0.2, gritCount: 20000, crackColor: '#121620', crackWidth: 2.5, crackCount: 25, crackSegs: 3, crackSpread: 80, bumpCrack: '#141a24', bumpCrackW: 4, veins: { color: '#5588aa', width: 1.5, alpha: 0.15, count: 18, segs: 10, spread: 60 } },
        wordBrick: { base: '#2e3440', grit: [50, 58, 72], gritAlpha: 0.25, gritCount: 25000, crackColor: '#1a2028', crackWidth: 3, crackCount: 30, crackSegs: 3, crackSpread: 70, bumpCrack: '#0a1018', bumpCrackW: 5, veins: { color: '#6699bb', width: 1, alpha: 0.18, count: 15, segs: 8, spread: 50 } },
        door: { base: '#242c38', grit: [24, 28, 36], gritRange: 18, crackColor: '#0a0e18', crackWidth: 5, crackCount: 4, crackSegs: 2, crackSpread: 250, bumpCrack: '#0a1220', bumpCrackW: 7, veins: { color: '#447788', width: 2, alpha: 0.12, count: 8, segs: 6, spread: 100 } },
        mat: { brickColor: 0x5a6e80, wordColor: 0x6e8090, doorColor: 0x556070, brickRough: 0.7, brickMetal: 0.15, bumpScale: 0.08 },
        atmos: { fog: 0x030508, mainLight: 0x7799aa, mainInt: 11, fillLight: 0x334466, fillInt: 6, flame: 0x6699aa, candleLight: 0x446688 },
    },
    { // Infernal Depths — dark burnt umber, dense cracks, ember veins
        name: 'Infernal Depths',
        brick: { base: '#281810', grit: [40, 22, 16], gritAlpha: 0.4, gritCount: 35000, gritSize: 3, crackColor: '#180c06', crackWidth: 2, crackCount: 80, crackSegs: 6, crackSpread: 45, bumpCrack: '#1a0808', bumpCrackW: 4, veins: { color: '#aa4410', width: 2, alpha: 0.25, count: 10, segs: 12, spread: 50 } },
        wordBrick: { base: '#382018', grit: [72, 40, 28], gritAlpha: 0.45, gritCount: 40000, gritSize: 3, crackColor: '#24120c', crackWidth: 2.5, crackCount: 100, crackSegs: 7, crackSpread: 50, bumpCrack: '#140606', bumpCrackW: 5, veins: { color: '#cc6622', width: 1.5, alpha: 0.2, count: 8, segs: 10, spread: 40 } },
        door: { base: '#2c140c', grit: [32, 16, 12], gritRange: 25, crackColor: '#120606', crackWidth: 4, crackCount: 10, crackSegs: 3, crackSpread: 150, bumpCrack: '#180606', bumpCrackW: 6, veins: { color: '#993300', width: 3, alpha: 0.18, count: 5, segs: 6, spread: 120 } },
        mat: { brickColor: 0x7a4a38, wordColor: 0x8a5a48, doorColor: 0x6a4030, brickRough: 0.92, brickMetal: 0.08, bumpScale: 0.12 },
        atmos: { fog: 0x020202, mainLight: 0xc4a484, mainInt: 16.5, fillLight: 0x222222, fillInt: 1, flame: 0xdd9944, candleLight: 0xcc8833 },
    },
    { // Overgrown Ruins — dark olive, moss patches, earthy green
        name: 'Overgrown Ruins',
        brick: { base: '#1e2618', grit: [24, 38, 26], gritAlpha: 0.35, gritCount: 30000, crackColor: '#0c1608', crackWidth: 1.5, crackCount: 45, crackSegs: 5, crackSpread: 55, bumpCrack: '#0a140a', bumpCrackW: 3, patches: [{ color: '#1e3a18', alpha: 0.18, count: 30, minR: 8, maxR: 25 }, { color: '#2a4a22', alpha: 0.1, count: 15, minR: 12, maxR: 35 }] },
        wordBrick: { base: '#283224', grit: [42, 62, 44], gritAlpha: 0.4, gritCount: 35000, crackColor: '#142014', crackWidth: 2, crackCount: 55, crackSegs: 6, crackSpread: 50, bumpCrack: '#081408', bumpCrackW: 4, patches: [{ color: '#264826', alpha: 0.15, count: 20, minR: 6, maxR: 20 }] },
        door: { base: '#222c1e', grit: [20, 32, 22], gritRange: 22, crackColor: '#0a140a', crackWidth: 3, crackCount: 6, crackSegs: 2, crackSpread: 200, bumpCrack: '#0a140a', bumpCrackW: 5, patches: [{ color: '#1e3a18', alpha: 0.2, count: 12, minR: 10, maxR: 30 }] },
        mat: { brickColor: 0x586850, wordColor: 0x687860, doorColor: 0x4e5c48, brickRough: 0.97, brickMetal: 0.03, bumpScale: 0.12 },
        atmos: { fog: 0x030503, mainLight: 0x88883a, mainInt: 11, fillLight: 0x334430, fillInt: 5, flame: 0x99aa44, candleLight: 0x667722 },
    },
    { // Shadow Vault — dusky charcoal-violet, wide cracks, faint crystal veins
        name: 'Shadow Vault',
        brick: { base: '#221e26', grit: [34, 28, 40], gritAlpha: 0.3, gritCount: 28000, crackColor: '#120e18', crackWidth: 2.5, crackCount: 35, crackSegs: 4, crackSpread: 65, bumpCrack: '#100c16', bumpCrackW: 4, veins: { color: '#664488', width: 1.5, alpha: 0.14, count: 14, segs: 6, spread: 70 } },
        wordBrick: { base: '#2e2836', grit: [58, 50, 70], gritAlpha: 0.35, gritCount: 32000, crackColor: '#1e1826', crackWidth: 3, crackCount: 40, crackSegs: 5, crackSpread: 55, bumpCrack: '#0e0818', bumpCrackW: 5, veins: { color: '#886699', width: 1, alpha: 0.14, count: 10, segs: 5, spread: 50 } },
        door: { base: '#282232', grit: [28, 22, 36], gritRange: 25, crackColor: '#0e0818', crackWidth: 4, crackCount: 5, crackSegs: 2, crackSpread: 220, bumpCrack: '#0e0818', bumpCrackW: 6, veins: { color: '#664488', width: 2.5, alpha: 0.12, count: 6, segs: 4, spread: 130 } },
        mat: { brickColor: 0x5e5468, wordColor: 0x6e6478, doorColor: 0x504858, brickRough: 0.88, brickMetal: 0.12, bumpScale: 0.1 },
        atmos: { fog: 0x040306, mainLight: 0x886688, mainInt: 12, fillLight: 0x3a2e44, fillInt: 5, flame: 0x9977aa, candleLight: 0x665577 },
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
let doorMat = currentSkin.doorMat;
let floorMat = currentSkin.floorMat;

function applyRoomSkin(roomNum = currentRoom) {
    if (challenger && challenger.currentMode === ChallengeMode.ADVENTURE) {
        const currentLevel = Math.max(1, Math.ceil(roomNum / 5));
        let skinIndex = 0;
        if (currentLevel >= 5) {
            skinIndex = 3; // Infernal (Neutral darkness)
        } else if (currentLevel >= 3) {
            skinIndex = 1; // Catacombs
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
}

function transitionSkinAtmosphere(duration = 1500) {
    const targetFog = new THREE.Color(currentSkin.atmos.fog);
    const startFog = scene.fog.color.clone();
    const startMainColor = mainLight.color.clone();
    const targetMainColor = new THREE.Color(currentSkin.atmos.mainLight);
    const startMainInt = mainLight.intensity;
    const startFillColor = fillLight.color.clone();
    const targetFillColor = new THREE.Color(currentSkin.atmos.fillLight);
    const startFillInt = fillLight.intensity;
    const startTime = Date.now();

    function updateAtmos() {
        const p = Math.min((Date.now() - startTime) / duration, 1);
        const ease = p * p * (3 - 2 * p); // smoothstep
        scene.fog.color.lerpColors(startFog, targetFog, ease);
        scene.background.copy(scene.fog.color);
        mainLight.color.lerpColors(startMainColor, targetMainColor, ease);
        mainLight.intensity = startMainInt + (currentSkin.atmos.mainInt - startMainInt) * ease;
        fillLight.color.lerpColors(startFillColor, targetFillColor, ease);
        fillLight.intensity = startFillInt + (currentSkin.atmos.fillInt - startFillInt) * ease;
        if (p < 1) requestAnimationFrame(updateAtmos);
    }
    updateAtmos();
}

function applySkinAtmosphereImmediate() {
    const fc = new THREE.Color(currentSkin.atmos.fog);
    scene.background = fc;
    scene.fog.color = fc;
    mainLight.color.set(currentSkin.atmos.mainLight);
    mainLight.intensity = currentSkin.atmos.mainInt;
    fillLight.color.set(currentSkin.atmos.fillLight);
    fillLight.intensity = currentSkin.atmos.fillInt;
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

// ── Run Snapshot ────────────────────────────────────────────────────────────

function buildRunSnapshot() {
    const activeProfile = ProfileManager.getActiveProfile();
    return {
        profileId: activeProfile ? activeProfile.id : null,
        room: currentRoom,
        score,
        health,
        ink,
        consonantPool,
        vowelPool,
        roomProgress,
        currentTier: library.currentTier,
        wordList: library.currentSetKey,
        mode: challenger.currentMode,
        bossActive: bossActive,
        // Save the exact current word to prevent save-scumming
        currentWord: challenger.currentWordData ? challenger.currentWordData.word : null,
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
let lastMistakeTime = 0;
let currentRoom = 1;
let roomProgress = 0;
const WORDS_PER_ROOM = 1;
let currentState = GameState.MENU;
let wordMistakes = 0;
let definitionMesh = null;
let showDefinition = true; // Enabled by default as requested
let isTransitioning = false; // Guard to prevent multiple onSuccess triggers
let activeSpells = []; // Spells triggered for the current room
let spellTimeoutId = null; // Track pending spell timer
let isChestRoom = false;
let isShopRoom = false;
let chestAttempts = 3;
let chestMesh = null;
let bossWarningSignMesh = null;

// Boss Mechanics State
let bossActive = false;
let bossWordsCompleted = 0;
let bossTargetWords = 0;
let bossTimeLeft = 30.0;
let bossTimerId = null;

function showShopRoom() {
    isChestRoom = false; // Just to be safe
    isShopRoom = true;
    // Clear dynamic non-room objects
    wordBricks.forEach(b => dungeonGroup.remove(b));
    wordBricks = [];
    if (definitionMesh) dungeonGroup.remove(definitionMesh);
    if (chestMesh) dungeonGroup.remove(chestMesh);

    // Create a simple placeholder visual
    const geo = new THREE.BoxGeometry(1.5, 1.5, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0xaa55aa });
    const shopMesh = new THREE.Mesh(geo, mat);
    shopMesh.position.set(0, 1.5, camera.position.z - 5);
    dungeonGroup.add(shopMesh);

    showToast("SHOP: Coming Soon! Press Enter to leave.");

    const TOOL_BAR = document.getElementById('tool-bar');
    const RESOURCE_BAR = document.getElementById('action-area');
    if (TOOL_BAR) TOOL_BAR.style.display = 'none';
    if (RESOURCE_BAR) RESOURCE_BAR.style.display = 'none';

    WORD_INPUT.style.display = 'block';
    WORD_INPUT.disabled = false;
    WORD_INPUT.value = '';
    WORD_INPUT.placeholder = "Press Enter to exit shop";
    WORD_INPUT.focus();

    // Hook onto Enter to leave
    const shopHandler = (e) => {
        if (e.key === 'Enter' && currentState === GameState.PLAYING) {
            WORD_INPUT.removeEventListener('keydown', shopHandler);
            WORD_INPUT.placeholder = "ENTER";
            dungeonGroup.remove(shopMesh);
            isShopRoom = false;
            onSuccess(true); // Treat as success to move to next room
        }
    };
    WORD_INPUT.addEventListener('keydown', shopHandler);
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
        const damage = hiddenBricks * 2;
        health -= damage;

        console.log(`[BOSS] Time out! damage:${damage} newHealth:${health}`);
        showToast(`TIME OUT! Took ${damage} DMG!`);
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
        setTimeout(() => onSuccess(true), 1500);
    }
    updateBossTimerUI();
}

function updateBossTimerUI() {
    const textEl = document.getElementById('boss-timer-text');
    const fillEl = document.getElementById('boss-timer-fill');
    const progressEl = document.getElementById('boss-progress-text');
    if (textEl) textEl.textContent = Math.ceil(bossTimeLeft) + "s";
    if (fillEl) fillEl.style.width = Math.max(0, (bossTimeLeft / 30.0) * 100) + "%";
    if (progressEl) progressEl.textContent = `Words: ${bossWordsCompleted}/${bossTargetWords}`;
}

function setGameState(state) {
    const prevState = currentState;
    currentState = state;
    Object.values(SCREENS).forEach(el => {
        if (el) el.style.display = 'none';
    });
    if (SCREENS[state]) {
        SCREENS[state].style.display = 'flex';

        // Populate debug data preview
        if (state === GameState.REPORT_BUG) {
            const preview = document.querySelector('#debug-data-preview');
            if (preview) {
                preview.style.display = 'block';
                preview.textContent = collectDebugData();
            }
        }
    }

    if (state === GameState.PLAYING || state === GameState.MCQ) {
        if (prevState !== GameState.PAUSE && prevState !== GameState.MCQ && prevState !== GameState.PLAYING) {
            resetGame();
        } else {
            // Restore UI hidden during transitions
            const TOOL_BAR = document.getElementById('tool-bar');
            const RESOURCE_BAR = document.getElementById('action-area');
            if (TOOL_BAR) TOOL_BAR.style.display = (state === GameState.PLAYING) ? 'flex' : 'none';
            if (RESOURCE_BAR) RESOURCE_BAR.style.display = (state === GameState.PLAYING) ? 'flex' : 'none';
            WORD_INPUT.style.display = (state === GameState.PLAYING) ? 'block' : 'none';
            WORD_INPUT.disabled = (state === GameState.MCQ);
            if (state === GameState.PLAYING) WORD_INPUT.focus();
        }
    }
    else if (state === GameState.PAUSE) {
        updateInventoryUI();
        WORD_INPUT.blur();
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
            if (callback) callback();
        }
    }
    update();
}

function enterRoomSequence(skipWalk = false) {
    // Hide HUD at start of room entry
    const TOOL_BAR = document.getElementById('tool-bar');
    const RESOURCE_BAR = document.getElementById('action-area');
    if (TOOL_BAR) TOOL_BAR.style.display = 'none';
    if (RESOURCE_BAR) RESOURCE_BAR.style.display = 'none';
    if (HEAR_BTN) HEAR_BTN.style.display = 'none';
    WORD_INPUT.style.display = 'none';

    const finishSequence = () => {
        isChestRoom = false; // Reset chest state
        isShopRoom = false; // Reset shop state
        bossActive = false;

        if (bossWarningSignMesh) {
            dungeonGroup.remove(bossWarningSignMesh);
            bossWarningSignMesh = null;
        }

        if (bossTimerId) { clearInterval(bossTimerId); bossTimerId = null; }
        document.getElementById('boss-timer-container').style.display = 'none';

        if (challenger.currentMode === ChallengeMode.ADVENTURE) {
            const isBossRoom = (currentRoom % 5 === 0);
            // Boss Sequence Evaluation (every 5 rooms)
            if (isBossRoom) {
                bossActive = true;
                bossWordsCompleted = 0;
                const currentLvl = Math.max(1, Math.ceil(currentRoom / 5));
                bossTargetWords = currentLvl + 1;

                animateCamera(null, Math.PI / 2, 800, () => {
                    startNewChallenge();
                });
                return;
            }

            // Add Boss Warning Sign in room 4 of each level
            if (currentRoom % 5 === 4 && !bossWarningSignMesh) {
                const signGeo = new THREE.PlaneGeometry(5, 2.5);
                const signMat = new THREE.MeshBasicMaterial({
                    map: getWrappedTextTexture("BOSS NEXT ROOM", "#ff4444", true, 80),
                    transparent: true,
                    side: THREE.DoubleSide
                });
                bossWarningSignMesh = new THREE.Mesh(signGeo, signMat);
                // Directly in front of the player at the end of the hallway
                bossWarningSignMesh.position.set(0, 5, camera.position.z - 6.5);
                bossWarningSignMesh.rotation.y = 0; // Face the camera
                dungeonGroup.add(bossWarningSignMesh);
            }

            // Probability Rolls for non-boss rooms
            const roll = Math.random();
            const canHaveRandomEvent = currentRoom > 4; // Force regular spelling for rooms 1-4

            if (canHaveRandomEvent && roll < 0.05) {
                // 5% Chest
                showChestRoom();
            } else if (canHaveRandomEvent && roll < 0.10) {
                // 5% MCQ
                animateCamera(null, -Math.PI / 2, 800, () => {
                    showMCQ();
                });
            } else {
                // 90% Spelling (or forced for early rooms)
                animateCamera(null, Math.PI / 2, 800, () => {
                    startNewChallenge();
                });
            }
        } else {
            // Classic mode code
            const roll = Math.random();
            const canHaveRandomEvent = currentRoom > 4;

            if (canHaveRandomEvent && roll < 0.05) {
                // 5% MCQ
                animateCamera(null, -Math.PI / 2, 800, () => {
                    showMCQ();
                });
            } else if (canHaveRandomEvent && roll < 0.10) {
                // 5% Chance for Treasure Chest
                showChestRoom();
            } else {
                // 90% Spelling
                animateCamera(null, Math.PI / 2, 800, () => {
                    startNewChallenge();
                });
            }
        }
    };

    if (skipWalk) {
        finishSequence();
    } else {
        // Walk to center
        const centerZ = camera.position.z - 7;
        animateCamera(new THREE.Vector3(0, 2, centerZ), null, 1500, finishSequence);
    }
}

function resetGame() {
    const stats = items.getTotalStats();
    score = 0;
    health = baseMaxHealth + stats.hp;
    ink = baseMaxInk + stats.ink;
    consonantPool = 0;
    vowelPool = 0;
    roomProgress = 0;
    currentRoom = 1;
    library.currentTier = 1;
    isTransitioning = false; // Reset transition guard
    clearForgeSlots(); // Reset forge on death/restart

    // Clear dynamic objects
    while (dungeonGroup.children.length > 0) {
        dungeonGroup.remove(dungeonGroup.children[0]);
    }
    candleLights = [];
    activeRats = [];

    camera.position.set(0, 2, 10);
    camera.rotation.set(0, 0, 0);
    mainLight.position.set(0, 5, 10);

    spawnRoom(0, currentRoom);

    // Hide UI during initial transition
    const TOOL_BAR = document.getElementById('tool-bar');
    if (TOOL_BAR) TOOL_BAR.style.display = 'none';
    WORD_INPUT.style.display = 'none';
    WORD_INPUT.disabled = true;
    WORD_INPUT.value = '';
    updateUI();

    enterRoomSequence();
}

function spawnRoom(zOffset, roomNum = currentRoom) {
    applyRoomSkin(roomNum);
    createRoom(zOffset + 10, roomNum);
    createDoor(zOffset - 5, roomNum);
}

let lobbyDoor = null;
function spawnLobby() {
    // Clear any existing geometry
    while (dungeonGroup.children.length > 0) {
        dungeonGroup.remove(dungeonGroup.children[0]);
    }
    candleLights = [];
    activeRats = [];
    // Create one room: the lobby
    applyRoomSkin();
    applySkinAtmosphereImmediate();
    createRoom(10, 0);
    // Create the door at the far wall
    createDoor(-5, 0);
    lobbyDoor = dungeonDoor; // Store reference
    // Position camera facing the door
    camera.position.set(0, 2, 8);
    camera.rotation.set(0, 0, 0);
    mainLight.position.set(0, 5, 8);
    fillLight.position.set(0, 5.5, 3);
}

function startNewChallenge(forcedWord = null) {
    if (forcedWord) {
        // Attempt to find full library entry for restoration
        const fullData = library.getWords().find(w => w.word === forcedWord);
        if (fullData) {
            challenger.currentWordData = fullData;
        } else {
            challenger.currentWordData = { word: forcedWord, definition: "Mystery Word" };
        }
    } else {
        const currentLevel = Math.max(1, Math.min(10, Math.ceil(currentRoom / 5)));
        const excludeList = (activeProfile && activeProfile.spelledWords) ? activeProfile.spelledWords : [];
        challenger.generateNewChallenge(currentLevel, excludeList);
    }
    const word = challenger.currentWordData.word;
    wordMistakes = 0;

    // Boss check
    if (bossActive) {
        document.getElementById('boss-timer-container').style.display = 'block';
        bossTimeLeft = 30.0;
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

    // Roll for item spells at the start of every challenge
    activeSpells = items.getTriggeredSpells();
    const stats = items.getTotalStats();
    console.log(`--- CHALLENGE START | Chances: Foresight:${stats.first_letter_chance}% Conclusion:${stats.last_letter_chance}% Chaos:${stats.random_letter_chance}% Echoes:${stats.double_letter_chance}% ---`);
    if (activeSpells.length > 0) {
        console.log("!!! Spells triggered for this word:", activeSpells);
    }

    // RESTORE HUD
    const TOOL_BAR = document.getElementById('tool-bar');
    const RESOURCE_BAR = document.getElementById('action-area');
    if (TOOL_BAR) TOOL_BAR.style.display = 'flex';
    if (RESOURCE_BAR) RESOURCE_BAR.style.display = 'flex';
    WORD_INPUT.style.display = 'block';
    WORD_INPUT.disabled = false;
    WORD_INPUT.focus();
    if (definitionMesh) definitionMesh.visible = showDefinition;

    setupWordBricks(word);

    // Apply triggered spells
    if (activeSpells.length > 0) {
        if (spellTimeoutId) clearTimeout(spellTimeoutId);
        spellTimeoutId = setTimeout(() => {
            console.log("startNewChallenge: Spell timeout reached. activeSpells =", activeSpells);
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
                    // Find double letters
                    let foundDouble = false;
                    for (let i = 0; i < word.length - 1; i++) {
                        if (word[i] === word[i + 1]) {
                            const b1 = wordBricks[i];
                            const b2 = wordBricks[i + 1];
                            if (!b1.userData.revealed) revealBrick(b1);
                            if (!b2.userData.revealed) revealBrick(b2);
                            foundDouble = true;
                        }
                    }
                    if (foundDouble) {
                        showToast("SPELL: Echoes!");
                    } else {
                        // Fallback to random if no doubles
                        const hidden = wordBricks.filter(b => !b.userData.revealed);
                        if (hidden.length > 0) {
                            targetBrick = hidden[Math.floor(Math.random() * hidden.length)];
                            showToast("SPELL: Echoes (Chaos Fallback)!");
                        }
                    }
                }

                if (targetBrick && !targetBrick.userData.revealed) {
                    revealBrick(targetBrick);
                }
            });
            activeSpells = []; // Clear for next room
            spellTimeoutId = null;

            // Check if word solved by spells
            if (wordBricks.every(b => b.userData.revealed)) {
                setTimeout(onSuccess, 500);
            }
        }, 600);
    }

    updateUI();
}

function updateUI() {
    challenger.getClue();

    const effectiveMode = challenger.currentMode;

    const showHearBtn = (effectiveMode === ChallengeMode.RANDOM ||
        effectiveMode === ChallengeMode.ADVENTURE);
    if (HEAR_BTN) HEAR_BTN.style.display = (showHearBtn && !isChestRoom) ? 'block' : 'none';

    const dungeonMetrics = document.getElementById('dungeon-metrics');
    if (dungeonMetrics) {
        if (currentState === GameState.PLAYING) {
            dungeonMetrics.style.display = 'flex';
            const rMetric = document.getElementById('room-metric');
            const lMetric = document.getElementById('level-metric');
            if (rMetric) rMetric.textContent = `Room ${currentRoom}`;
            if (lMetric) {
                const currentLevel = Math.floor((currentRoom - 1) / 5) + 1;
                lMetric.textContent = `Level ${currentLevel}`;
                lMetric.style.display = 'block';

                // Dynamic depth darkness (Starts lighter, gets darker)
                const depthRatio = Math.min(Math.max(currentLevel - 1, 0) / 9, 1);
                ambientLight.intensity = 1.0 - (depthRatio * 0.4); // Start 25% brighter (0.8 -> 1.0)
                mainLight.intensity = 31.25 - (depthRatio * 15);   // Start 25% brighter (25 -> 31.25)
                fillLight.intensity = 10 - (depthRatio * 4);       // Start 25% brighter (8 -> 10)
            }
        } else {
            dungeonMetrics.style.display = 'none';
            // Reset lighting
            ambientLight.intensity = 1.0;
            mainLight.intensity = 31.25;
            fillLight.intensity = 10;
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

    if (hpFill) hpFill.style.height = `${Math.max(0, Math.min(100, (health / maxHP) * 100))}%`;
    if (inkFill) inkFill.style.height = `${Math.max(0, Math.min(100, (ink / maxInk) * 100))}%`;

    const revealBtn = document.querySelector('#reveal-btn');
    if (revealBtn) revealBtn.disabled = (ink < 10);

    updateAbilityBar();
}

function updateAbilityBar() {
    const abilityBar = document.querySelector('#ability-bar');
    if (!abilityBar) return;
    abilityBar.innerHTML = '';

    const seenAbilities = new Set();
    Object.values(items.equipped).forEach(item => {
        if (item && item.ability && !seenAbilities.has(item.ability.name)) {
            seenAbilities.add(item.ability.name);
            const btn = document.createElement('button');
            btn.className = 'tool-btn ability-btn';

            let cost = 5;
            if (item.ability.name === "Reveal Random") cost = 6;
            else if (item.ability.name === "Healing Magic") cost = 10;

            const isReady = ink >= cost;
            btn.innerHTML = `${item.ability.name} (${cost} Ink)`;
            btn.disabled = !isReady;
            btn.onclick = () => {
                if (castAbility(item)) {
                    updateUI();
                    updateInventoryUI();
                }
            };
            abilityBar.appendChild(btn);
        }
    });
}

function castAbility(item) {
    if (!item || !item.ability) return false;

    if (item.ability.name === "Reveal Random") {
        if (ink < 6) return false;

        const hiddenBricks = wordBricks.filter(b => !b.userData.revealed);
        if (hiddenBricks.length === 0) {
            showToast("All letters revealed!");
            return false;
        }

        ink -= 6;
        const brick = hiddenBricks[Math.floor(Math.random() * hiddenBricks.length)];
        revealBrick(brick);
        createSpellBurst("#ffffff");
        showToast("REVEALED RANDOM LETTER!");

        if (wordBricks.every(b => b.userData.revealed)) {
            setTimeout(onSuccess, 500);
        }

        WORD_INPUT.focus();
        return true;

    } else if (item.ability.name === "Healing Magic") {
        if (ink < 10) return false;

        const stats = items.getTotalStats();
        const maxHP = baseMaxHealth + stats.hp;
        if (health >= maxHP) {
            showToast("Health is already full!");
            return false;
        }

        ink -= 10;
        health = Math.min(maxHP, health + 5);
        showToast("HEALED 5 HP!");
        createSpellBurst("#00ff00");

        WORD_INPUT.focus();
        return true;
    }

    return false;
}

function onSuccess(fastTrack = false) {
    if (isTransitioning && !fastTrack) return;
    isTransitioning = true;

    if (bossTimerId) { clearInterval(bossTimerId); bossTimerId = null; }

    score++;
    applyRegen();

    if (bossActive) {
        bossWordsCompleted++;
        if (bossWordsCompleted < bossTargetWords) {
            createSpellBurst(MageConfig.spellColor);
            setTimeout(() => {
                isTransitioning = false; // Reset guard
                WORD_INPUT.value = '';
                clearWordMeshes(); // Aggressively destroy old meshes before setting up next word
                // Start next boss word
                startNewChallenge();
            }, 1500); // 1.5s delay
            return;
        } else {
            showToast("BOSS CLEARED!");
            bossActive = false;
            document.getElementById('boss-timer-container').style.display = 'none';
            // Extra reward
            const stats = items.getTotalStats();
            ink = Math.min(baseMaxInk + stats.ink, ink + 10);
            health = Math.min(baseMaxHealth + stats.hp, health + 10);
        }
    }

    roomProgress++;

    // Track unique words
    const targetWord = (challenger.currentWordData ? challenger.currentWordData.word : "???").toUpperCase();
    const activeProfile = ProfileManager.getActiveProfile();
    if (activeProfile && targetWord !== "???") {
        if (!activeProfile.spelledWords) activeProfile.spelledWords = [];
        if (!activeProfile.spelledWords.includes(targetWord)) {
            activeProfile.spelledWords.push(targetWord);
            activeProfile.totalWords = activeProfile.spelledWords.length;
            ProfileManager.saveActiveProfile(activeProfile);
        }
    }

    const stats = items.getTotalStats();
    const maxInk = baseMaxInk + stats.ink;
    ink = Math.min(maxInk, ink); // No more reward, just cap check if needed

    // Reward sequence: roll for multiple drops based on 11%, 5%, 1% rates.
    // Boss words count as normal words for loot rolling!
    if (!isChestRoom) {
        dropLoot();
    }

    saveGameData(); // Ensure rewards and progress are persisted to profile run state

    createSpellBurst(MageConfig.spellColor);

    mainLight.intensity = 25;
    setTimeout(() => mainLight.intensity = 15, 150);

    WORD_INPUT.disabled = true;
    WORD_INPUT.value = '';

    // HIDE HUD during transition
    const TOOL_BAR = document.getElementById('tool-bar');
    const RESOURCE_BAR = document.getElementById('action-area');
    if (TOOL_BAR) TOOL_BAR.style.display = 'none';
    if (RESOURCE_BAR) RESOURCE_BAR.style.display = 'none';
    if (HEAR_BTN) HEAR_BTN.style.display = 'none';
    WORD_INPUT.style.display = 'none';
    if (definitionMesh) definitionMesh.visible = false;

    const startTransition = () => {
        console.log("onSuccess: Starting transition sequence (turn forward)");

        // Save current door reference before spawnRoom overwrites it
        const currentDoor = dungeonDoor;
        const startZ = camera.position.z;

        // PRE-LOAD NEXT ROOM: immersion boost
        const nextEntranceZ = startZ - 8;
        spawnRoom(nextEntranceZ - 10, currentRoom + 1);

        // Force compile/render to GPU synchronously
        renderer.render(scene, camera);

        // Turn forward
        animateCamera(null, 0, 800, () => {
            console.log("onSuccess: Camera animation done, opening door and GLIDING...");
            slideDoorOpen(currentDoor);
            transitionSkinAtmosphere(2000); // Blend atmosphere over the glide

            // PERFECT GLIDE: Merge "walk through door" and "walk to center" into one continuous 15-unit move
            // This prevents the camera from decelerating at the door threshold
            const finalGoalZ = startZ - 15;
            animateCamera(new THREE.Vector3(0, 2, finalGoalZ), null, 2500, () => {
                console.log("onSuccess: Continuous glide done, completing room...");
                clearMCQWall();
                completeRoom();
                isTransitioning = false; // Reset transition guard
                enterRoomSequence(true); // skipWalk = true
            });
        });
    };

    if (fastTrack) {
        startTransition();
    } else {
        // Reduced from 2000ms to 800ms for better flow
        setTimeout(startTransition, 800);
    }
}

function applyRegen() {
    const stats = items.getTotalStats();
    const maxHP = baseMaxHealth + stats.hp;
    const maxInk = baseMaxInk + stats.ink;

    // Inherent +1 regen
    const totalHPRegen = (stats.hp_regen || 0) + 1;
    const totalInkRegen = (stats.ink_regen || 0) + 1;

    health = Math.min(maxHP, health + totalHPRegen);
    createRisingText(`+${totalHPRegen}`, "#ff4444", "hp-ampule");

    ink = Math.min(maxInk, ink + totalInkRegen);
    createRisingText(`+${totalInkRegen}`, "#00d4ff", "ink-ampule");
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
    currentRoom++;
    roomProgress = 0;
    library.currentTier = Math.min(3, library.currentTier + 1);

    // Skin atmosphere is applied by applyRoomSkin() in spawnRoom()
}

function showChestRoom() {
    isChestRoom = true;
    const localStats = items.getTotalStats();
    chestAttempts = 3 + (localStats.lockpick || 0);
    const TOOL_BAR = document.getElementById('tool-bar');
    const RESOURCE_BAR = document.getElementById('action-area');

    // Turn RIGHT for Chest
    animateCamera(null, -Math.PI / 2, 800, () => {
        if (TOOL_BAR) TOOL_BAR.style.display = 'flex';
        if (RESOURCE_BAR) RESOURCE_BAR.style.display = 'flex';
        WORD_INPUT.style.display = 'block';
        WORD_INPUT.disabled = false;
        WORD_INPUT.focus();

        const currentLevel = Math.max(1, Math.min(10, Math.ceil(currentRoom / 5)));
        const excludeList = (activeProfile && activeProfile.spelledWords) ? activeProfile.spelledWords : [];
        challenger.generateNewChallenge(currentLevel, excludeList);
        const word = challenger.currentWordData.word;

        // Setup challenge - SILENT (clues only)
        // Re-centered letters (no customZ)
        setupWordBricks(word, 4.5, true, null);

        // Position chest on the wall, shifted right (+3.25 units) to unblock definition and prevent clipping
        if (chestMesh) dungeonGroup.remove(chestMesh);
        // Shift forward (+1.0 Z total from original) AND away from wall (X=3.25)
        chestMesh = createChest(3.25, 0, camera.position.z + 5.5);

        showToast("TREASURE CHEST! 3 ATTEMPTS");
    });
}

function handleChestGuess(typed, target) {
    if (chestMesh && chestMesh.userData.rattle) chestMesh.userData.rattle();

    chestAttempts--;
    let anyNewReveal = false;

    // Evaluate matches (visual feedback only, no HP damage)
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

    // Feedback logic
    if (wordBricks.every(b => b.userData.revealed)) {
        showToast("LOCK OPENS!");
        createSpellBurst("#00ff00");

        // Disable input immediately to prevent double-submit lag
        WORD_INPUT.value = '';
        WORD_INPUT.disabled = true;

        // Turn to look at chest before opening
        animateCamera(null, -Math.PI * 0.75, 450, () => {
            if (chestMesh && chestMesh.userData.open) {
                chestMesh.userData.open();
                dropLoot(true); // Reward with guaranteed chest loot

                // Final success transition after lid has time to actually animate
                setTimeout(() => {
                    onSuccess();
                }, 1200);
            } else {
                onSuccess();
            }
        });
    } else {
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
            // Reveal all bricks for feedback
            wordBricks.forEach(b => {
                if (!b.userData.revealed) revealBrick(b);
            });
            WORD_INPUT.disabled = true;
            // Transition WITHOUT reward
            setTimeout(() => onSuccess(true), 2000);
        }
    }
    updateUI();
}

function gameOver() {
    Persistence.clearRun(); // Run is over — delete the save
    const activeProfile = ProfileManager.getActiveProfile();
    if (activeProfile) {
        activeProfile.savedRun = null;
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
    if (fr) fr.textContent = currentRoom;
    if (fw) fw.textContent = score;
    setGameState(GameState.GAME_OVER);
}

let currentMCQData = null;
let mcqChoices = [];
let mcqIdCounter = 0;
let mcqHasAnswered = false; // Room-scoped flag to prevent duplicate transition calls
let mcqAttempts = 3;
function showMCQ() {
    console.log("showMCQ: Initializing new MCQ room");
    mcqHasAnswered = false; // Reset for the new room
    mcqAttempts = 3; // Reset MCQ attempts for the new room

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

    // Move faceX for interaction layering
    const faceX = 4.4; // Choices brought closer to player
    const questionFaceX = 4.8; // Question pushed back against wall
    const centerZ = camera.position.z;

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
    qMesh.position.set(questionFaceX, 4.8, centerZ + 0.3);
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
        const z = centerZ + (col === 0 ? 2.15 : -2.15); // Buffer: Total gap 0.5 units horizontally
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
        const backBrick = createBrick(faceX + 0.5, y, z, 3.8); // Adjusted x to sit behind text
        // CLONE wall material so each brick can be colored independently
        backBrick.material = brickMat.clone();
        backBrick.scale.y = 1.0;
        backBrick.userData = { option: opt, isChoiceBacking: true, id: mcqIdCounter++ };

        mcqChoices.push(backBrick);
    });
}

function handleMCQChoice(option, clickedMesh) {
    if (mcqHasAnswered) return;
    if (currentState !== GameState.MCQ) return;

    // LOCK INTERACTION IMMEDIATELY
    mcqHasAnswered = true;
    setGameState(GameState.PLAYING);

    // Find all meshes related to this choice (text + backing)
    const relatedMeshes = mcqChoices.filter(m => m.userData && m.userData.option && m.userData.option.text === option.text);

    // Determine meshes for the CORRECT answer (to show if failed)
    const correctMeshes = mcqChoices.filter(m => m.userData && m.userData.option && m.userData.option.isCorrect);

    if (option.isCorrect) {
        createSpellBurst("#00ff64");
        // Visual highlight: GREEN only for the selected choice
        relatedMeshes.forEach(m => {
            if (m.material) m.material.color.set(0x00ff64);
        });


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

const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });

let candleLights = [];
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
        seed: Math.random() * 20
    });

    dungeonGroup.add(torchGroup);
}


function createSpiderWeb(x, y, z, roomNum) {
    const webGroup = new THREE.Group();
    webGroup.position.set(x, y, z);
    webGroup.userData.roomNumber = roomNum;

    const webGeo = new THREE.PlaneGeometry(3, 3);
    const webMat = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        // Using a basic radial gradient look since we don't have a texture asset
        map: getWebTexture()
    });

    const web = new THREE.Mesh(webGeo, webMat);
    // Angle it into the corner
    web.rotation.x = (y > 3) ? Math.PI / 4 : -Math.PI / 4;
    web.rotation.y = (x > 0) ? -Math.PI / 4 : Math.PI / 4;

    webGroup.add(web);
    dungeonGroup.add(webGroup);
}

function createBonePile(x, y, z, roomNum) {
    const pileGroup = new THREE.Group();
    pileGroup.position.set(x, y, z);
    pileGroup.userData.roomNumber = roomNum;

    const boneMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 1 });
    const count = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
        const boneGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4 + Math.random() * 0.4);
        const bone = new THREE.Mesh(boneGeo, boneMat);
        bone.position.set(
            (Math.random() - 0.5) * 0.5,
            0.1,
            (Math.random() - 0.5) * 0.5
        );
        bone.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        pileGroup.add(bone);
    }
    dungeonGroup.add(pileGroup);
}

function createShackles(x, y, z, roomNum, side) {
    const shackleGroup = new THREE.Group();
    shackleGroup.position.set(x, y, z);
    shackleGroup.userData.roomNumber = roomNum;
    shackleGroup.rotation.y = (side === 1) ? -Math.PI / 2 : Math.PI / 2;
    shackleGroup.scale.setScalar(1.5); // Larger for visibility

    const chainMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.1 });

    // Hanging chain
    for (let i = 0; i < 4; i++) {
        const linkGeo = new THREE.TorusGeometry(0.1, 0.03, 8, 8);
        const link = new THREE.Mesh(linkGeo, chainMat);
        link.position.y = -i * 0.22;
        shackleGroup.add(link);
    }

    // Hand cuff
    const cuffGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 8);
    const cuff = new THREE.Mesh(cuffGeo, chainMat);
    cuff.position.y = -0.9;
    cuff.rotation.x = Math.PI / 2;
    shackleGroup.add(cuff);

    dungeonGroup.add(shackleGroup);
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
    const count = 4 + Math.floor(Math.random() * 6);

    for (let i = 0; i < count; i++) {
        const length = 0.4 + Math.random() * 0.3;
        const scrollGeo = new THREE.CylinderGeometry(0.05, 0.05, length, 8);
        const scroll = new THREE.Mesh(scrollGeo, paperMat);

        scroll.position.set(
            (Math.random() - 0.5) * 0.4,
            0.35 + (Math.random() * 0.1), // Further raised from 0.1 to 0.35 to finally clear floor
            (Math.random() - 0.5) * 0.4
        );
        scroll.rotation.set(Math.PI / 2, Math.random() * Math.PI, Math.PI / 2);
        pileGroup.add(scroll);
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
        // Lay flat on ground
        broomGroup.position.set(x, 0.07, z);
        broomGroup.rotation.z = Math.PI / 2;
        broomGroup.rotation.y = Math.random() * Math.PI * 2;
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

    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.4, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x777777 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 1.2;
    mopGroup.add(handle);

    // Mop head
    const headGroup = new THREE.Group();
    const headMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    for (let i = 0; i < 8; i++) {
        const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.2, 2, 4), headMat);
        strand.position.set(Math.cos(i) * 0.1, 0.1, Math.sin(i) * 0.1);
        strand.rotation.z = 0.3;
        headGroup.add(strand);
    }
    headGroup.position.y = 0.1;
    mopGroup.add(headGroup);

    if (isFallen) {
        mopGroup.position.set(x, 0.07, z);
        mopGroup.rotation.z = Math.PI / 2;
        mopGroup.rotation.y = Math.random() * Math.PI * 2;
    } else {
        // Lean against wall - top touches wall at 5.0
        mopGroup.rotation.z = (x > 0) ? -0.2 : 0.2;
        mopGroup.rotation.x = (Math.random() - 0.5) * 0.2;
    }

    dungeonGroup.add(mopGroup);
}

function createWoodenBucket(x, y, z, roomNum) {
    const bucketGroup = new THREE.Group();
    bucketGroup.position.set(x, 0.3, z);
    bucketGroup.userData.roomNumber = roomNum;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
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
    handle.position.y = 0.25;
    bucketGroup.add(handle);

    dungeonGroup.add(bucketGroup);
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
    const baseColor = new THREE.Color(0x443d26); // Base color - middle ground between gold and dark brown
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
        const s = 0.8 + Math.random() * 0.5;
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

function createHayBundle(x, y, z, roomNum) {
    const bundleGroup = new THREE.Group();
    bundleGroup.position.set(x, y + 0.4, z); // Raised to 0.4 half-height
    bundleGroup.userData.roomNumber = roomNum;

    const hayColor = 0x9c8459; // Lightened from 0x443d26 for better visibility
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

function createBrick(x, y, z, scaleZ = 1, mat = brickMat) {
    const geo = new THREE.BoxGeometry(1.0, 1.0, 1.0 * scaleZ);
    const brick = new THREE.Mesh(geo, mat);

    // Add tiny random jitter for "rough" variation
    const jitter = 0.05;
    brick.position.set(
        x + (Math.random() - 0.5) * jitter,
        y + (Math.random() - 0.5) * jitter,
        z + (Math.random() - 0.5) * (jitter * (1 / scaleZ))
    );
    brick.rotation.set(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
    );

    const edges = new THREE.EdgesGeometry(geo);
    const lines = new THREE.LineSegments(edges, lineMat);
    brick.add(lines);
    dungeonGroup.add(brick);
    return brick;
}

function createChest(x, y, z) {
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

    padlockGroup.position.set(0, -0.3, 0.9);
    lidPivot.add(padlockGroup);

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

function createSkeleton(x, y, z, rotY) {
    const group = new THREE.Group();
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xe6e0d4, roughness: 0.8 });
    const boneScale = 0.5;

    // Skull
    const skullGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const skull = new THREE.Mesh(skullGeo, boneMat);
    skull.position.set(0, 0.9, 0);
    group.add(skull);

    // Torso (approx spine/ribcage area)
    const ribsGeo = new THREE.BoxGeometry(0.4, 0.5, 0.25);
    const ribs = new THREE.Mesh(ribsGeo, boneMat);
    ribs.position.set(0, 0.55, 0);
    ribs.rotation.x = 0.3; // Leaning back slightly
    group.add(ribs);

    // Arms
    const createArm = (side) => {
        const arm = new THREE.Group();
        const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), boneMat);
        upper.position.y = -0.2;
        arm.add(upper);

        const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), boneMat);
        lower.position.y = -0.6;
        lower.rotation.x = -0.5;
        arm.add(lower);

        arm.position.set(side * 0.25, 0.8, 0);
        return arm;
    };
    const leftArm = createArm(-1);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);

    const rightArm = createArm(1);
    rightArm.rotation.z = -0.2;
    rightArm.rotation.x = 0.4; // Reaching for lap
    group.add(rightArm);

    // Legs (Slumped)
    const createLeg = (side) => {
        const leg = new THREE.Group();
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), boneMat);
        thigh.rotation.x = -Math.PI / 2;
        thigh.position.z = 0.25;
        leg.add(thigh);

        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), boneMat);
        shin.rotation.x = -0.2;
        shin.position.set(0, -0.25, 0.5);
        leg.add(shin);

        leg.position.set(side * 0.15, 0.1, 0);
        return leg;
    };
    group.add(createLeg(-1));
    group.add(createLeg(1));

    // Parchment Note
    const parchmentGeo = new THREE.PlaneGeometry(0.4, 0.25);
    const parchmentMat = new THREE.MeshBasicMaterial({
        map: getWrappedTextTexture("silent letters", "#332200", true, 80),
        color: 0xfff4d1, // Yellowed parchment tint
        side: THREE.DoubleSide,
        transparent: true
    });
    const note = new THREE.Mesh(parchmentGeo, parchmentMat);
    note.position.set(0.15, 0.2, 0.5);
    note.rotation.x = -0.4;
    note.rotation.z = 0.1;
    group.add(note);

    group.position.set(x, y, z);
    group.rotation.y = rotY;
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

function createRoom(zOffset, roomNum = currentRoom) {
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

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 15; col++) {
            const z = zOffset - col * 1.0;
            const xOffset = (row % 2 === 0) ? 0 : 0.5;
            roomGroup.add(createBrick(-5.5 + xOffset, row * 1.0 + 0.5, z));
            roomGroup.add(createBrick(5.5 + xOffset, row * 1.0 + 0.5, z));
        }
    }

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 12; col++) {
            const xOffset = (row % 2 === 0) ? 0 : 0.5;
            const x = -5.5 + col * 1.0 + xOffset;
            const y = row * 1.0 + 0.5;
            // Door hole: 3 blocks wide, 4 blocks high
            if (x > -2.0 && x < 2.0 && row < 4) continue;
            roomGroup.add(createBrick(x, y, zOffset - 15));
        }
    }

    // Procedural Candles: Lowered spawn rate to make them feel special (0-2 per room)
    if (GlobalSettings.candlesEnabled) {
        const candleCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < candleCount; i++) {
            const side = Math.random() > 0.5 ? -4.8 : 4.8;
            const z = zOffset - Math.random() * 14;
            createCandle(side, 0, z, roomNum);
        }
    }

    // Wall Carvings: 25% chance per room
    if (Math.random() < 0.25) {
        const msg = WALL_CARVINGS[Math.floor(Math.random() * WALL_CARVINGS.length)];
        const side = Math.random() > 0.5 ? 1 : -1; // 1 = Right, -1 = Left
        // Avoid left wall spelling area if possible (Z between -2 and -13)
        let zPos = zOffset - 3 - Math.random() * 9;
        const xPos = side * 4.90;
        const yPos = 1.5 + Math.random() * 2.5;

        const carvingGeo = new THREE.PlaneGeometry(3.5, 1.8);
        const carvingMat = new THREE.MeshBasicMaterial({
            map: getWrappedTextTexture(msg, "#e6ccb3", true, 48),
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });
        const carving = new THREE.Mesh(carvingGeo, carvingMat);
        carving.position.set(xPos, yPos, zPos);
        carving.rotation.y = (side === 1) ? -Math.PI / 2 : Math.PI / 2;
        roomGroup.add(carving);
    }

    // Tutorial Tips: Guaranteed for specific early rooms
    if (TUTORIAL_TIPS[roomNum]) {
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
    const spawnTorch = Math.random() < 0.6; // 60% chance to have ANY torch
    if (spawnTorch) {
        const typeRoll = Math.random();
        const z = zOffset - 2 - Math.random() * 11;
        if (typeRoll < 0.7) {
            // Wall Torch (prefer right wall to avoid spelling)
            const sideX = (Math.random() < 0.8) ? 5.4 : -5.4;
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

    // Hay: 80% chance for a room to have scattered hay (Increased from 50%)
    if (Math.random() < 0.8) {
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

        // 10% chance of spawning 1-2 hay bundles in rooms with ground hay
        if (Math.random() < 0.1) {
            const count = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
                const bx = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 2.5); // Clear central path
                const bz = zOffset - 2 - Math.random() * 11;
                createHayBundle(bx, 0, bz, roomNum);
            }
        }
    }

    // Books & Scrolls: 15% chance
    if (Math.random() < 0.15) {
        const x = (Math.random() > 0.5 ? 4.2 : -4.2);
        const z = zOffset - 2 - Math.random() * 11;
        if (Math.random() > 0.5) createBookPile(x, 0, z, roomNum);
        else createScrollPile(x, 0, z, roomNum);
    }

    // Brooms & Mops: 15% chance
    if (Math.random() < 0.15) {
        const sideX = (Math.random() > 0.5 ? 4.50 : -4.50);
        const z = zOffset - 2 - Math.random() * 11;
        if (Math.random() > 0.5) createBroom(sideX, 0, z, roomNum);
        else createMop(sideX, 0, z, roomNum);
    }

    // Wooden Bucket: 15% chance
    if (Math.random() < 0.15) {
        const x = (Math.random() > 0.5 ? 4.2 : -4.2);
        const z = zOffset - 2 - Math.random() * 11;
        createWoodenBucket(x, 0, z, roomNum);
    }

    // Hanging Chains: 15% chance
    if (Math.random() < 0.15) {
        const sideX = (Math.random() > 0.5 ? 5.4 : -5.4);
        const side = sideX > 0 ? 1 : -1;
        const z = zOffset - 2 - Math.random() * 11;
        const y = 5.8; // From ceiling
        createHangingChain(sideX, y, z, roomNum, side);
    }

    // Spider Webs: 15% chance
    if (Math.random() < 0.15) {
        const side = Math.random() > 0.5 ? -4.5 : 4.5;
        const z = zOffset - 2 - Math.random() * 11;
        const y = Math.random() > 0.5 ? 5.5 : 0.5;
        createSpiderWeb(side, y, z, roomNum);
    }

    [-5.4, 5.4].forEach(sideX => {
        if (Math.random() < 0.15) {
            const side = sideX > 0 ? 1 : -1;
            const z = zOffset - 2 - Math.random() * 11;
            createShackles(sideX, 4.5, z, roomNum, side);
        }
    });

    // Rare Skeleton Discovery: 10%
    if (Math.random() < 0.1) {
        const sideRoll = Math.random() > 0.5 ? 1 : -1;
        const x = sideRoll * 4.3;
        const z = zOffset - 14.5;
        const rotY = (sideRoll === 1) ? -Math.PI / 4 : Math.PI / 4;
        const skeleton = createSkeleton(x, 0, z, rotY);
        roomGroup.add(skeleton);
        createBonePile(x + (Math.random() - 0.5), 0, z + (Math.random() - 0.5), roomNum);
    }

    // Rat Hole: 10% chance
    if (Math.random() < 0.1) {
        const sideRoll = Math.random() > 0.5 ? 1 : -1;
        const x = sideRoll * 4.95;
        const z = zOffset - 5 - Math.random() * 8;
        const rotY = (sideRoll === 1) ? -Math.PI / 2 : Math.PI / 2;
        const ratHole = createRatHole(x, 0.25, z, rotY);
        roomGroup.add(ratHole);
        activeRats.push(ratHole);
    }

    dungeonGroup.add(roomGroup);
}

let dungeonDoor;
function createDoor(z, roomNum = currentRoom) {
    // Door is 3.5 wide, 4.2 high to slightly overlap the hole edges for a tight fit
    const doorGeo = new THREE.BoxGeometry(3.8, 4.2, 0.4);
    dungeonDoor = new THREE.Mesh(doorGeo, doorMat);
    dungeonDoor.userData.roomNumber = roomNum;
    // Offset Z slightly from -15 to -14.8 to avoid Z-fighting with the back wall
    dungeonDoor.position.set(0, 2.1, z + 0.2);
    const edges = new THREE.EdgesGeometry(doorGeo);
    const lines = new THREE.LineSegments(edges, lineMat);
    dungeonDoor.add(lines);
    dungeonGroup.add(dungeonDoor);
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

function getWrappedTextTexture(text, color = "#ffffff", center = false, fontSizeOverride = null) {
    if (!text) text = "";
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
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

let wordBricks = [];
let typedMeshes = []; // Parallel array for the typing feedback planes

function clearWordMeshes() {
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

    const zDir = customX !== null ? 1 : -1;
    const centerZ = customZ !== null ? customZ : camera.position.z;
    const startZ = centerZ - zDir * (word.length - 1) * spacing / 2;
    const xPos = customX !== null ? customX : -4.5;
    const rotY = customX !== null ? -Math.PI / 2 : Math.PI / 2;

    for (let i = 0; i < word.length; i++) {
        const brickZ = startZ + i * spacing * zDir;

        // STACK ORDER: 1. Error Display (y=4.0) - lowered by 0.25
        const errorMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * spacing, 0.8), new THREE.MeshBasicMaterial({
            map: getLetterTexture("?", "#cc2200"),
            transparent: true,
            opacity: 0
        }));
        errorMesh.position.set(xPos + (customX !== null ? -0.52 : 0.52), 4.0, brickZ);
        errorMesh.rotation.y = rotY;
        dungeonGroup.add(errorMesh);

        // STACK ORDER: 2. Letter Bricks (y=3.35) - raised by 0.1
        const brick = createBrick(xPos, 3.35, brickZ, spacing, wordBrickMat);

        const letterGeo = new THREE.PlaneGeometry(0.8 * spacing, 0.8);
        const letterMat = new THREE.MeshBasicMaterial({
            map: getLetterTexture(word[i], "#ff8800"),
            transparent: true,
            side: THREE.DoubleSide
        });
        const letterMesh = new THREE.Mesh(letterGeo, letterMat);
        letterMesh.position.set(xPos + (customX !== null ? -0.5 : 0.5), 3.35, brickZ); // On the wall surface
        letterMesh.rotation.y = rotY; // Face center room
        letterMesh.visible = false; // Hidden initially
        dungeonGroup.add(letterMesh);

        brick.userData = {
            letter: word[i],
            revealed: false,
            letterMesh: letterMesh,
            errorMesh: errorMesh,
            mistakes: [] // Initialize mistakes list
        };
        wordBricks.push(brick);

        // STACK ORDER: 3. Input Display (y=2.35) - raised by 0.1
        const typedMat = new THREE.MeshBasicMaterial({
            map: getLetterTexture(" ", "#00d4ff"), // Start blank
            transparent: true,
            side: THREE.DoubleSide
        });
        const typedMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * spacing, 0.8), typedMat);
        typedMesh.position.set(xPos + (customX !== null ? -0.5 : 0.5), 2.35, brickZ);
        typedMesh.rotation.y = rotY;
        dungeonGroup.add(typedMesh);
        typedMeshes.push(typedMesh);
    }

    // STACK ORDER: 4. The Definition (y=-0.25) - lowered by 0.5
    if (definitionMesh) dungeonGroup.remove(definitionMesh);

    const defGeo = new THREE.PlaneGeometry(6, 4); // Shrunk length to 6 to clear chest space
    const defMat = new THREE.MeshBasicMaterial({
        map: getWrappedTextTexture(challenger.currentWordData.definition, "#ffffff", false, 45), // Shrunk to 45px
        transparent: true,
        side: THREE.DoubleSide
    });
    definitionMesh = new THREE.Mesh(defGeo, defMat);
    // Position slightly forward (xPos +/- 0.55) to avoid overlap issues
    // Offset further into the room (-2.0 units) if a tutorial tip is present to avoid overlap
    const zOffsetForTip = TUTORIAL_TIPS[currentRoom] ? -2.0 : 0;
    definitionMesh.position.set(xPos + (customX !== null ? -0.55 : 0.55), 0, camera.position.z + zOffsetForTip);
    definitionMesh.rotation.y = rotY;
    definitionMesh.visible = showDefinition;
    dungeonGroup.add(definitionMesh);
}

function evaluateGuess() {
    if (currentState !== GameState.PLAYING) return;
    if (isShopRoom) return;

    const typed = WORD_INPUT.value.toUpperCase();
    const target = (challenger.currentWordData && challenger.currentWordData.word) ? challenger.currentWordData.word.toUpperCase() : "";

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

    // Penalty for incomplete words
    if (typed.length < target.length) {
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
        createSpellBurst("#ff0000"); // Red burst for errors

        const currentLvl = Math.max(1, Math.ceil(currentRoom / 5));
        const damageMultiplier = Math.floor((currentLvl - 1) / 2) + 1;
        let damage = mistakes * damageMultiplier;

        const totalArmor = Object.values(items.equipped).reduce((sum, item) => sum + (item?.stats?.armor || 0), 0);
        if (totalArmor > 0) {
            damage = Math.max(1, damage - totalArmor);
            if (totalArmor > 0 && damage < mistakes * (currentLvl >= 4 ? 2 : 1)) {
                showToast(`Armor blocked ${(mistakes * (currentLvl >= 4 ? 2 : 1)) - damage} DMG!`);
            }
        }

        health = Math.max(0, health - damage);
        console.log(`[COMBAT] Wrong word. damage:${damage} newHealth:${health} (bossActive:${bossActive})`);
        updateUI();
        saveGameData(); // Ensure combat damage is persisted
        if (health <= 0) gameOver();
    }

    if (anyNewReveal) {
        createSpellBurst(MageConfig.spellColor); // Match player color
    }

    WORD_INPUT.value = '';

    // Check if the whole word is now revealed
    const allRevealed = wordBricks.every(b => b.userData.revealed);
    if (allRevealed) {
        setTimeout(onSuccess, 500);
    }
}

function revealBrick(brick) {
    brick.userData.revealed = true;
    brick.userData.errorMesh.material.opacity = 0;
    if (brick.userData.letterMesh) brick.userData.letterMesh.visible = true;

    // Animate breaking
    const shell = brick;
    const startTime = Date.now();
    const duration = 400;
    function anim() {
        const p = Math.min((Date.now() - startTime) / duration, 1);
        shell.scale.setScalar(1 - p);
        shell.rotation.z += 0.1;
        if (p < 1) requestAnimationFrame(anim);
        else dungeonGroup.remove(shell);
    }
    anim();
}

function showMistake(brick, char) {
    if (!brick.userData.mistakes.includes(char)) {
        brick.userData.mistakes.push(char);
    }
    const errorMesh = brick.userData.errorMesh;
    errorMesh.material.map = getErrorListTexture(brick.userData.mistakes);
    errorMesh.material.opacity = GlobalSettings.errorsEnabled ? 1 : 0;

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
    const standardStats = ['hp', 'ink', 'hp_regen', 'ink_regen', 'armor', 'lockpick', 'item_find'];
    const itemStats = item.stats || {};
    standardStats.forEach(stat => {
        const val = itemStats[stat] || 0;
        if (val !== 0) {
            statsHtml += `<div>+${val} ${stat.toUpperCase().replace('_', ' ')}</div>`;
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
                ${Object.keys({
        'first_letter_chance': 'Foresight',
        'last_letter_chance': 'Conclusion',
        'double_letter_chance': 'Echoes',
        'random_letter_chance': 'Chaos'
    }).map(stat => {
        const chance = itemStats[stat] || 0;
        return chance > 0 ? `<div class="magic-stat">PASSIVE: ${{
            'first_letter_chance': 'Foresight',
            'last_letter_chance': 'Conclusion',
            'double_letter_chance': 'Echoes',
            'random_letter_chance': 'Chaos'
        }[stat]} (${chance}%)</div>` : '';
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

function renderScores() {
    const list = document.querySelector('#scores-list');
    if (!list) return;
    const scores = Persistence.getHighScores();

    const listNames = { 'inkling': 'Inkling', 'sat': 'SAT Words', 'doozies': 'Doozies' };
    const modeNames = { 'random': 'Random', 'adventure': 'Adventure' };

    list.innerHTML = scores.map((s, i) => {
        const level = Math.ceil(s.rooms / 5);
        return `
        <div class="score-item">
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
        </div>
    `}).join('') || '<p style="text-align:center; padding: 2rem;">No heroes yet...</p>';
}

// ── Event Handlers ─────────────────────────────────────────────────────────
document.querySelector('#start-btn').onclick = () => {
    // New run: clear any active saves
    Persistence.clearRun();
    const activeProfile = ProfileManager.getActiveProfile();
    if (activeProfile) {
        activeProfile.savedRun = null;
        activeProfile.wordList = GlobalSettings.wordList; // Sync current list choice to profile
        ProfileManager.saveActiveProfile(activeProfile);
    }
    startTransitionToDungeon();
};

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
            consonantPool = r.consonantPool || 0;
            vowelPool = r.vowelPool || 0;
            roomProgress = r.roomProgress || 0;
            library.currentTier = r.currentTier || 1;

            // Restore exact word to prevent save-scumming
            if (r.currentWord) {
                const fullData = library.getWords().find(w => w.word === r.currentWord);
                if (fullData) {
                    challenger.currentWordData = fullData;
                } else {
                    challenger.currentWordData = { word: r.currentWord, definition: "Mystery Word" };
                }
            }
        }
        startTransitionToDungeon(true, r); // Pass the snapshot explicitly
    };
}

const abandonBtn = document.querySelector('#abandon-run-btn');
if (abandonBtn) {
    abandonBtn.onclick = () => {
        if (confirm("Abandon this run? Your character's current room progress will be lost, but all gear and items will be retained.")) {
            Persistence.clearRun();
            const activeProfile = ProfileManager.getActiveProfile();
            if (activeProfile) {
                activeProfile.savedRun = null;
                ProfileManager.saveActiveProfile(activeProfile);
            }
            updateMenuRunButtons();
        }
    };
}

function startTransitionToDungeon(isContinuing = false, snapshotOverride = null) {
    const mainMenu = document.getElementById('main-menu');
    mainMenu.classList.add('menu-fade-out');
    setTimeout(() => {
        slideDoorOpen(lobbyDoor || dungeonDoor);
        setTimeout(() => {
            animateCamera(new THREE.Vector3(0, 2, -2), null, 1200, () => {
                mainMenu.style.display = 'none';
                mainMenu.classList.remove('menu-fade-out');

                if (isContinuing) {
                    currentState = GameState.PLAYING;
                    Object.values(SCREENS).forEach(el => el ? el.style.display = 'none' : null);
                    if (SCREENS[GameState.PLAYING]) SCREENS[GameState.PLAYING].style.display = 'flex';

                    // Clear lobby
                    while (dungeonGroup.children.length > 0) dungeonGroup.remove(dungeonGroup.children[0]);
                    candleLights = [];
                    activeRats = [];

                    // Restore exact positioning for spelling challenge
                    camera.position.set(0, 2, 3); // Center of the room
                    camera.rotation.set(0, Math.PI / 2, 0); // Facing the wall
                    mainLight.position.set(0, 5, 3);

                    const snapshot = snapshotOverride || Persistence.loadRun();
                    bossActive = snapshot ? snapshot.bossActive : false;

                    spawnRoom(0, currentRoom);
                    const TOOL_BAR = document.getElementById('tool-bar');
                    if (TOOL_BAR) TOOL_BAR.style.display = 'flex';
                    WORD_INPUT.style.display = 'block';
                    updateUI();

                    // Restore the word we were on without generating a new one
                    startNewChallenge(snapshot ? snapshot.currentWord : null);
                } else {
                    setGameState(GameState.PLAYING);
                }
            });
        }, 600);
    }, 500);
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

    if (voices.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = "No voices found";
        selector.appendChild(opt);
        return;
    }

    voices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name}${v.localService ? ' (Offline)' : ''}`;
        if (v.name === GlobalSettings.preferredVoice) opt.selected = true;
        selector.appendChild(opt);
    });
}

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

document.querySelector('#restart-btn').onclick = () => setGameState(GameState.PLAYING);

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
if (invToggleBtn) {
    invToggleBtn.onclick = () => {
        if (currentState === GameState.PLAYING) {
            setGameState(GameState.PAUSE);
        } else if (currentState === GameState.PAUSE) {
            setGameState(GameState.PLAYING);
        }
    };
}

const forgeBtn = document.querySelector('#forge-btn');
if (forgeBtn) {
    forgeBtn.onclick = () => {
        // Collect real items to confirm they still exist
        const result = items.forgeItems(forgeSlots);
        if (result) {
            showItemDrop(result, false);
            createSpellBurst(MageConfig.spellColor); // Visual flair
            clearForgeSlots();

            // Instantly catch the new item and put it in the forge slot
            const newIndex = items.inventory.indexOf(result);
            if (newIndex !== -1) {
                forgeSlots[0] = newIndex;
            }

            updateInventoryUI();
            updateUI();
            saveGameData();
        } else {
            showToast("FORGE REJECTED");
        }
    };
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
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

    // Ability Hotkeys (1-9)
    if (currentState === GameState.PLAYING && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        const equippedAbilities = Object.values(items.equipped).filter(item => item && item.ability);
        if (equippedAbilities[index]) {
            if (castAbility(equippedAbilities[index])) {
                updateUI();
                updateInventoryUI();
            }
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
});

WORD_INPUT.addEventListener('input', () => {
    if (currentState !== GameState.PLAYING) return;
    WORD_INPUT.value = WORD_INPUT.value.toUpperCase();
    const typed = WORD_INPUT.value;
    const target = challenger.currentWordData.word;

    // Detect overflow
    if (typed.length > target.length) {
        WORD_INPUT.value = typed.slice(0, target.length);
        createSpellBurst("#ff0000"); // Red spark
        showToast("TOO MANY LETTERS!");
        return;
    }

    // Sync input to 3D planes
    for (let i = 0; i < typedMeshes.length; i++) {
        const char = (i < typed.length) ? typed[i] : " ";
        // Update texture based on typed character
        typedMeshes[i].material.map = getLetterTexture(char, MageConfig.spellColor);
        typedMeshes[i].material.needsUpdate = true;
    }
});

let revealModeActive = false;

HEAR_BTN.onclick = () => { challenger.speakWord(); WORD_INPUT.focus(); };

// ── Inventory & Forge State ────────────────────────────────────────────────
let isDragging = false;
let dragSource = null;
let forgeSlots = new Array(9).fill(null); // stores backpack indices

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
        'hood': 'icons/icon_hood.png',
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
        'circlet': 'icons/icon_circlet.png',
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
        'apron': 'icons/icon_apron.png'
    };
    const key = typeOrBase.toLowerCase();
    return map[key] || map[typeOrBase] || null;
}

function getItemIconHtml(item, size = 36) {
    if (!item) return '';

    // Find the best icon: check base type derived from name, then fallback to slot type
    const name = item.name || "";
    const lowerName = name.toLowerCase();
    let typeOrBase = item.type || "";

    // Simple mapping: if name contains "bag", use "bag" icon, etc.
    // Order by specificity (length descending) to avoid partial matches overriding (e.g. pencil vs pen)
    const specialTypes = [
        'calligraphy pen', 'charcoal stick', 'handkerchief', 'breastplate',
        'fanny pack', 'waistcoat', 'chalkstick', 'cufflinks', 'gambeson',
        'notebook', 'bracelet', 'necklace', 'briefcase', 'cufflink',
        'lantern', 'monocle', 'glasses', 'wizard hat', 'charcoal',
        'sweater', 'compass', 'helmet', 'pencil', 'shield', 'scroll',
        'earring', 'satchel', 'tophat', 'circlet', 'crayon', 'turban',
        'apron', 'chalk', 'cloak', 'brush', 'crown', 'ruler', 'quill',
        'tunic', 'robe', 'hood', 'veil', 'belt', 'ring', 'bag', 'pen'
    ];
    for (const t of specialTypes) {
        if (lowerName.includes(t)) {
            typeOrBase = t;
            break;
        }
    }

    const src = getItemIconSrc(typeOrBase);
    if (!src) return '';

    // Use a drop-shadow filter to tint the icon with the rarity color
    const rarityColor = (item.rarity && item.rarity.color) ? item.rarity.color : '#ffffff';
    const filter = rarityColor && rarityColor !== '#ffffff'
        ? `filter: drop-shadow(0 0 3px ${rarityColor}) drop-shadow(0 0 1.5px ${rarityColor});`
        : '';
    return `<img src="${src}" class="item-img-icon" style="width:${size}px;height:${size}px;${filter}" alt="${typeOrBase}">`;
}

function updateInventoryUI() {
    const grid = document.querySelector('#inventory-grid');
    grid.innerHTML = '';

    // Fill 40 cells
    for (let i = 0; i < items.maxInventorySize; i++) {
        const cell = document.createElement('div');
        cell.className = 'inv-cell';
        cell.dataset.index = i;
        const item = items.inventory[i];
        const isInForge = forgeSlots.includes(i);

        if (item && !isInForge) {
            cell.draggable = true;
            cell.innerHTML = getItemIconHtml(item, 36);
            cell.onclick = (e) => {
                if (e.shiftKey) {
                    if (addItemToForge(i)) {
                        updateInventoryUI();
                        updateUI();
                    }
                } else {
                    items.equip(i);
                    clearPendingSpells();
                    updateInventoryUI();
                    updateUI();
                }
                saveGameData();
            };

            cell.onmouseenter = (e) => {
                if (!isDragging) showTooltip(item, e, true);
            };
            cell.onmouseleave = hideTooltip;

            cell.ondragstart = (e) => onDragStart(e, { type: 'backpack', index: i, item });
        }

        cell.ondragover = onDragOver;
        cell.ondragleave = onDragLeave;
        cell.ondrop = (e) => onDrop(e, { type: 'backpack', index: i });

        grid.appendChild(cell);
    }

    // Update Equipment Slots
    document.querySelectorAll('.equip-slot').forEach(slotDiv => {
        let slotType = slotDiv.dataset.slot;
        const iconType = slotType.startsWith('accessory') ? 'accessory' : slotType;
        const item = items.equipped[slotType];

        if (item) {
            slotDiv.classList.add('filled');
            slotDiv.draggable = true;
            slotDiv.innerHTML = `
                ${getItemIconHtml(item, 30)}
                <div class="equip-item-name" style="color: ${item.rarity.color}">${item.name}</div>
            `;
            slotDiv.onclick = () => {
                items.unequip(slotType);
                clearPendingSpells();
                updateInventoryUI();
                updateUI();
                saveGameData();
            };
            slotDiv.onmouseenter = (e) => {
                if (!isDragging) showTooltip(item, e, false);
            };
            slotDiv.onmouseleave = hideTooltip;
            slotDiv.ondragstart = (e) => onDragStart(e, { type: 'equip', slot: slotType, item });
        } else {
            slotDiv.classList.remove('filled');
            slotDiv.draggable = false;
            slotDiv.innerHTML = `<span>${slotType.replace('_', ' ')}</span>`;
            slotDiv.onclick = null;
            slotDiv.onmouseenter = null;
        }

        slotDiv.ondragover = onDragOver;
        slotDiv.ondragleave = onDragLeave;
        slotDiv.ondrop = (e) => onDrop(e, { type: 'equip', slot: slotType });
    });

    // Build Forge Grid
    const forgeGrid = document.querySelector('#forge-grid');
    if (forgeGrid) {
        forgeGrid.innerHTML = '';
        for (let f = 0; f < 9; f++) {
            const fCell = document.createElement('div');
            fCell.className = 'forge-cell';
            fCell.dataset.forgeIndex = f;

            const bpIndex = forgeSlots[f];
            if (bpIndex !== null && items.inventory[bpIndex]) {
                const fItem = items.inventory[bpIndex];
                fCell.classList.add('has-item');
                fCell.innerHTML = getItemIconHtml(fItem, 36);
                // Click to return item to backpack
                fCell.onclick = () => {
                    forgeSlots[f] = null;
                    updateForgeButton();
                    updateInventoryUI();
                };
                fCell.onmouseenter = (e) => {
                    if (!isDragging) showTooltip(fItem, e, false);
                };
                fCell.onmouseleave = hideTooltip;
            }

            fCell.ondragover = onDragOver;
            fCell.ondragleave = onDragLeave;
            fCell.ondrop = (e) => onDrop(e, { type: 'forge', forgeIndex: f });

            forgeGrid.appendChild(fCell);
        }
    }

    updateForgeButton();

    // Update Character Stats View
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
            lockpick: { label: 'Lockpick', desc: 'Extra attempts allowed in treasure chest rooms.' },
            item_find: { label: 'Item Find', desc: 'Increases chance of finding higher tier loot.' }
        };

        Object.entries(STAT_METADATA).forEach(([key, meta]) => {
            const val = totalStats[key] || 0;
            if (val > 0 || key === 'hp' || key === 'ink') {
                const row = document.createElement('div');
                row.className = 'stat-row';
                row.dataset.tooltip = meta.desc;
                row.innerHTML = `
                    <span class="stat-value">+${val}</span>
                    <span class="stat-label">${meta.label}</span>
                `;
                statsView.appendChild(row);
            }
        });

        const CHANCE_METADATA = {
            first_letter_chance: { label: 'First Reveal %', desc: 'Chance to trigger First Letter reveal spell on word start.' },
            last_letter_chance: { label: 'Last Reveal %', desc: 'Chance to trigger Last Reveal %', desc: 'Chance to trigger Last Letter reveal spell on word start.' },
            double_letter_chance: { label: 'Double Reveal %', desc: 'Chance to trigger Double Letter reveal spell on word start.' },
            random_letter_chance: { label: 'Random Reveal %', desc: 'Chance to trigger Random Letter reveal spell on word start.' }
        };

        Object.entries(CHANCE_METADATA).forEach(([key, meta]) => {
            const val = totalStats[key] || 0;
            if (val > 0) {
                const row = document.createElement('div');
                row.className = 'stat-row';
                row.dataset.tooltip = meta.desc;
                row.innerHTML = `
                    <span class="stat-value">${val}%</span>
                    <span class="stat-label">${meta.label}</span>
                `;
                statsView.appendChild(row);
            }
        });
    }
}


function onDragStart(e, source) {
    isDragging = true;
    dragSource = source;
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    hideTooltip();
    e.target.classList.add('dragging');
}

function onDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function onDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function onDrop(e, target) {
    e.preventDefault();
    isDragging = false;
    e.currentTarget.classList.remove('drag-over');
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));

    if (!dragSource) return;

    if (dragSource.type === 'backpack' && target.type === 'backpack') {
        // Move within backpack
        items.moveItem(dragSource.index, target.index);
    } else if (dragSource.type === 'backpack' && target.type === 'equip') {
        // Equip from backpack
        const item = dragSource.item;
        // Check if item matches slot type (unless slot is generic)
        if (target.slot.startsWith('accessory')) {
            if (item.type === 'accessory') {
                items.equip(dragSource.index, target.slot);
            }
        } else if (item.type === target.slot) {
            items.equip(dragSource.index, target.slot);
        }
    } else if (dragSource.type === 'equip' && target.type === 'backpack') {
        // Unequip to specific backpack slot
        items.unequip(dragSource.slot, target.index);
    } else if (dragSource.type === 'equip' && target.type === 'equip') {
        // Potential swap between equipment slots (e.g. accessories)
        // For now, just handle accessory swaps
        if (dragSource.slot.startsWith('accessory') && target.slot.startsWith('accessory')) {
            const temp = items.equipped[target.slot];
            items.equipped[target.slot] = items.equipped[dragSource.slot];
            items.equipped[dragSource.slot] = temp;
        }
    } else if (dragSource.type === 'backpack' && target.type === 'forge') {
        // Drop item into forge slot
        addItemToForge(dragSource.index, target.forgeIndex);
    }

    updateInventoryUI();
    clearPendingSpells();
    updateUI();
    saveGameData();
    dragSource = null;
}

function getForgeCurrentTier() {
    for (let i = 0; i < forgeSlots.length; i++) {
        const bpIndex = forgeSlots[i];
        if (bpIndex !== null && items.inventory[bpIndex]) {
            return items.inventory[bpIndex].tier;
        }
    }
    return null;
}

function updateForgeButton() {
    const fBtn = document.querySelector('#forge-btn');
    if (!fBtn) return;

    const filledCount = forgeSlots.filter(idx => idx !== null).length;
    const tier = getForgeCurrentTier();

    if (filledCount === 9) {
        fBtn.disabled = false;
        fBtn.textContent = `FORGE TIER ${tier + 1}`;
    } else {
        fBtn.disabled = true;
        fBtn.textContent = `NEED ${9 - filledCount} MORE`;
    }
}

function clearForgeSlots() {
    forgeSlots = new Array(9).fill(null);
}

function addItemToForge(bpIndex, fIndex = -1) {
    const item = items.inventory[bpIndex];
    if (!item) return false;

    // Validate tier: all forge items must share the same tier
    const currentForgeTier = getForgeCurrentTier();
    if (currentForgeTier !== null && item.tier !== currentForgeTier) {
        showToast('TIER MISMATCH!');
        return false;
    }

    if (item.tier === 4) {
        showToast('MAX TIER - CANNOT FORGE!');
        return false;
    }

    if (forgeSlots.includes(bpIndex)) {
        return false;
    }

    let targetF = fIndex;
    if (targetF === -1) {
        targetF = forgeSlots.indexOf(null);
    }

    if (targetF !== -1 && targetF < 9) {
        forgeSlots[targetF] = bpIndex;
        updateForgeButton();
        return true;
    } else {
        showToast('FORGE FULL!');
        return false;
    }
}

function showTooltip(item, e, isBackpackItem = false) {
    const mainTooltip = document.querySelector('#item-tooltip');
    const comp1 = document.querySelector('#comp-tooltip-1');
    const comp2 = document.querySelector('#comp-tooltip-2');

    mainTooltip.style.display = 'block';
    comp1.style.display = 'none';
    comp2.style.display = 'none';

    const invView = document.querySelector('.inventory-view');
    const equipView = document.querySelector('.equipment-view');

    if (isBackpackItem) {
        // Position backpack item tooltip above BACKPACK area (RIGHT)
        const backpackRect = invView.getBoundingClientRect();
        const equipRect = equipView.getBoundingClientRect();

        // Hovered item (from backpack) -> Backpack area (Right)
        mainTooltip.style.left = (backpackRect.left + backpackRect.width / 2 - 125) + 'px';
        mainTooltip.style.top = (backpackRect.top - 220) + 'px';
        mainTooltip.innerHTML = renderItemTooltipContent(item);

        // Find equipped items of same type
        let comparisons = [];
        if (item.type === ItemType.ACCESSORY) {
            if (items.equipped.accessory1) comparisons.push(items.equipped.accessory1);
            if (items.equipped.accessory2) comparisons.push(items.equipped.accessory2);
        } else {
            const equipped = items.equipped[item.type];
            if (equipped) comparisons.push(equipped);
        }

        comparisons.forEach((eq, idx) => {
            const tooltip = idx === 0 ? comp1 : comp2;
            tooltip.style.display = 'block';
            // Position comparisons over EQUIPMENT area (Left)
            const xOffset = (comparisons.length > 1) ? (idx === 0 ? -70 : 70) : 0;
            tooltip.style.left = (equipRect.left + equipRect.width / 2 - 125 + xOffset) + 'px';
            tooltip.style.top = (equipRect.top - 220) + 'px';
            tooltip.innerHTML = renderItemTooltipContent(eq);
        });
    } else {
        // Hovering equipped item: show tooltip above EQUIPMENT area (Left)
        const rect = equipView.getBoundingClientRect();
        mainTooltip.style.left = (rect.left + rect.width / 2 - 125) + 'px';
        mainTooltip.style.top = (rect.top - 220) + 'px';
        mainTooltip.innerHTML = renderItemTooltipContent(item);
    }
}

function renderItemTooltipContent(item) {
    if (!item) return '';
    let statsHtml = '';

    // Standard Stats
    const standardStats = ['hp', 'ink', 'hp_regen', 'ink_regen', 'armor', 'lockpick', 'item_find'];
    const itemStats = item.stats || {};
    standardStats.forEach(stat => {
        const val = itemStats[stat] || 0;
        if (val !== 0) {
            statsHtml += `<div class="stat-row">
                <span>+${val} ${stat.toUpperCase().replace('_', ' ')}</span>
            </div>`;
        }
    });

    // Special Spells (Active Abilities)
    if (item.ability) {
        statsHtml += `<div class="stat-row magic-stat">
            <span>SPELL: ${item.ability.name}</span>
        </div>`;
    }

    // Passive Spells (Chance Stats)
    const spellStats = {
        'first_letter_chance': 'Foresight',
        'last_letter_chance': 'Conclusion',
        'double_letter_chance': 'Echoes',
        'random_letter_chance': 'Chaos'
    };

    Object.keys(spellStats).forEach(stat => {
        const chance = itemStats[stat] || 0;
        if (chance > 0) {
            statsHtml += `<div class="stat-row magic-stat">
                <span>PASSIVE: ${spellStats[stat]} (${chance}%)</span>
            </div>`;
        }
    });

    const rarityColor = (item.rarity && item.rarity.color) ? item.rarity.color : '#ffffff';
    const rarityName = (item.rarity && item.rarity.name) ? item.rarity.name : 'Unknown';

    return `
        <h4 style="color: ${rarityColor}">${item.name || 'Unknown Item'}</h4>
        <div class="rarity" style="color: ${rarityColor}">${rarityName}</div>
        <div class="stats">${statsHtml}</div>
        <div class="desc">${item.description || ''}</div>
    `;
}

function hideTooltip() {
    document.querySelector('#item-tooltip').style.display = 'none';
    document.querySelector('#comp-tooltip-1').style.display = 'none';
    document.querySelector('#comp-tooltip-2').style.display = 'none';
}

function dropLoot(isGuaranteedChestLoot = false) {
    const stats = items.getTotalStats();
    let drops = [];

    if (isGuaranteedChestLoot) {
        // High quality guaranteed drop from chest
        // 20% chance T3, 50% chance T2, otherwise T1
        const roll = Math.random();
        if (roll < 0.20) {
            drops.push(items.generateItem(3));
        } else if (roll < 0.70) {
            drops.push(items.generateItem(2));
        } else {
            drops.push(items.generateItem(1));
        }
    } else {
        // Configurable Drop Chances + Item Find Modifier
        const t1Chance = 15 + (stats.item_find || 0);
        const t2Chance = 4.5 + ((stats.item_find || 0) / 2);
        const t3Chance = 1.25 + ((stats.item_find || 0) / 4);
        const t4Chance = 0.125 + ((stats.item_find || 0) / 8);

        // Roll for higher tiers first, only 1 item can drop
        if (Math.random() * 100 < t4Chance) {
            drops.push(items.generateItem(4));
        } else if (Math.random() * 100 < t3Chance) {
            drops.push(items.generateItem(3));
        } else if (Math.random() * 100 < t2Chance) {
            drops.push(items.generateItem(2));
        } else if (Math.random() * 100 < t1Chance) {
            drops.push(items.generateItem(1));
        }
    }

    if (drops.length === 0) return;

    let anyPickedUp = false;
    let anyEquipped = false;

    drops.forEach(newItem => {
        if (items.addItem(newItem)) {
            anyPickedUp = true;
            let equipped = false;
            let pSlot = newItem.type;

            if (newItem.type === ItemType.ACCESSORY) {
                if (!items.equipped.accessory1) pSlot = 'accessory1';
                else if (!items.equipped.accessory2) pSlot = 'accessory2';
                else pSlot = null;
            }

            if (pSlot && !items.equipped[pSlot]) {
                const idx = items.inventory.indexOf(newItem);
                if (items.equip(idx, pSlot)) {
                    equipped = true;
                    anyEquipped = true;
                }
            }

            showItemDrop(newItem, equipped);
        } else {
            showToast(`BACKPACK FULL - DROPPED: ${newItem.name}`);
            showItemDrop(newItem, false); // Still show what was lost
        }
    });

    if (anyPickedUp) {
        updateInventoryUI();
        saveGameData();
    }
}


const revealBtn = document.querySelector('#reveal-btn');
revealBtn.onclick = () => {
    if (ink >= 10 && !revealModeActive) {
        revealModeActive = true;
        revealBtn.style.color = '#ffcc00'; // Visual indicator
        revealBtn.textContent = 'Select Brick!';
    } else if (revealModeActive) {
        // Cancel reveal mode if clicked again
        revealModeActive = false;
        revealBtn.style.color = '';
        revealBtn.textContent = 'Reveal (10 Ink)';
    }
    WORD_INPUT.focus();
};

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
MODE_BTNS.forEach(btn => btn.onclick = () => {
    challenger.setMode(btn.dataset.mode);
    MODE_BTNS.forEach(b => b.classList.remove('active'));
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

    // Prevent clashing with UI buttons
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Small delay ensures browser focus handling on the canvas doesn't override our manual focus
    setTimeout(() => {
        WORD_INPUT.focus();
    }, 50);

    raycaster.setFromCamera(mouse, camera);

    if (currentState === GameState.MCQ) {
        const intersects = raycaster.intersectObjects(mcqChoices, true);
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            console.log("MCQ Target hit:", hit.userData);

            // Check self or parent (for backing bricks)
            let current = hit;
            while (current) {
                // Ensure we only trigger on explicitly designated choice backings to prevent greedy raycasts
                if (current.userData && current.userData.option && current.userData.isChoiceBacking) {
                    handleMCQChoice(current.userData.option, current);
                    break;
                }
                current = current.parent;
            }
        }
        return;
    }

    if (!revealModeActive) return; // Must click reveal button first

    const intersects = raycaster.intersectObjects(wordBricks, false);

    if (intersects.length > 0) {
        const hitBrick = intersects[0].object;

        if (hitBrick.userData && hitBrick.userData.letter && !hitBrick.userData.revealed) {
            ink -= 10;
            // Point-and-click reveal functionality
            revealBrick(hitBrick);

            // Turn off reveal mode after one use
            revealModeActive = false;
            const btn = document.querySelector('#reveal-btn');
            if (btn) {
                btn.style.color = '';
                btn.textContent = 'Reveal (10 Ink)';
            }

            updateUI();

            const allRevealed = wordBricks.every(b => b.userData.revealed);
            if (allRevealed) {
                onSuccess();
            }
        }
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
    const frameDuration = 1000 / targetFPS;

    if (deltaTime < frameDuration) return;

    // Adjust lastFrameTime
    lastFrameTime = currentTime - (deltaTime % frameDuration);

    // Torch Flicker Effect - using constant speed
    const time = performance.now();
    // Throttle flicker logic in performance mode (calculate every ~30ms)
    const flickerThrottle = GlobalSettings.performanceMode ? 30 : 0;
    const sinceLastFlicker = time - (camera.userData.lastFlickerTime || 0);

    if (sinceLastFlicker >= flickerThrottle) {
        camera.userData.lastFlickerTime = time;
        mainLight.intensity = 21 + Math.sin(time * 0.01) * 3 + Math.random() * 2;

        // Candle Flicker: More subtle
        candleLights.forEach(c => {
            const flicker = Math.sin(time * 0.008 + c.seed) * 0.2 + Math.random() * 0.1;
            c.light.intensity = c.baseIntensity + flicker;
            c.flame.scale.setScalar(1 + flicker * 0.1);
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
        chestMesh.userData.update();
    }

    // Rat Hole Updates
    activeRats.forEach(rat => {
        if (rat.userData && rat.userData.update) {
            rat.userData.update();
        }
    });

    if (GlobalSettings.headBobEnabled) {
        camera.position.y = 2 + Math.sin(time * 0.00135) * 0.072; // Reduced bob: speed 0.0015->0.00135, travel 0.08->0.072
    } else {
        camera.position.y = 2; // Flat height
    }
    renderer.render(scene, camera);
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
        let itemFind = 0;

        if (p.itemData && p.itemData.equipped) {
            Object.values(p.itemData.equipped).forEach(item => {
                if (item && item.stats) {
                    hpBonus += (item.stats.hp || 0);
                    inkBonus += (item.stats.ink || 0);
                    armorBonus += (item.stats.armor || 0);
                    itemFind += (item.stats.item_find || 0);
                }
            });
        }

        const isActive = p.id === activeId;
        const glowColor = p.spellColor + "44"; // Adding transparency for glow

        return `
        <div class="profile-card ${isActive ? 'active-profile' : ''}" data-id="${p.id}" style="--profile-color: ${p.spellColor}; border-color: ${p.spellColor}88;">
            <div class="profile-header">
                <div class="profile-color-indicator" style="background: ${p.spellColor}; box-shadow: 0 0 10px ${p.spellColor};"></div>
                <h3>${escapeHtml(p.name)}</h3>
                <div class="profile-level">RM ${p.maxRoom || 1}</div>
            </div>
            
            <div class="profile-art-placeholder">
                <span class="art-icon">🚹</span>
            </div>

            <div class="profile-stats-grid">
                <div class="p-stat"><span>HP</span> <strong>+${hpBonus}</strong></div>
                <div class="p-stat"><span>INK</span> <strong>+${inkBonus}</strong></div>
                <div class="p-stat"><span>DEF</span> <strong>+${armorBonus}</strong></div>
                <div class="p-stat"><span>LUCK</span> <strong>+${itemFind}</strong></div>
            </div>
            <div class="profile-footer">
                <span>Words: ${p.spelledWords ? p.spelledWords.length : 0} / ${library.getGlobalTotalWords()}</span>
                <button class="delete-profile-btn" data-id="${p.id}" title="Delete Character">×</button>
            </div>
            ${isActive ? '<div class="active-tag">ACTIVE</div>' : ''}
        </div>
    `}).join('');

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
            if (confirm(`Are you sure you want to delete ${profiles.find(p => p.id === btn.dataset.id)?.name || 'this character'}?`)) {
                ProfileManager.deleteProfile(btn.dataset.id);
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
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === GlobalSettings.mode);
});
document.querySelectorAll('.list-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.list === GlobalSettings.wordList);
});

animate();
setGameState(GameState.MENU);
