const ItemType = {
    HAT: 'hat',
    UTENSIL: 'utensil',
    STORAGE: 'storage'
};

class Item {
    constructor(id, name = '', cost = 0, stats = null, slot = '', description = '') {
        this.id = id;
        this.name = name;
        this.cost = cost;
        this.slot = (slot || '').toLowerCase();
        this.description = description;

        if (stats && typeof stats === 'object') {
            this.stats = JSON.parse(JSON.stringify(stats)); // Deep clone to avoid modifying static template
            this.statsStr = '';
        } else {
            this.statsStr = stats || '';
            this.stats = this.parseStats(this.statsStr);
        }

        // Persistent dynamic state for specific items (like Punch Card)
        this.boughtCount = id?.boughtCount || 0;
        if (typeof id === 'object' && id !== null) {
            // If we passed the full object (re-instantiating during deserialize)
            this.boughtCount = id.boughtCount || 0;
            this.id = id.id; // Correct the ID
        }
    }

    parseStats(str) {
        const stats = {
            hp: 0,
            ink: 0,
            hp_regen: 0,
            ink_regen: 0,
            armor: 0,
            lockpick: 0,
            item_find: 0, // Rummage
            first_letter_chance: 0, // Foresight
            last_letter_chance: 0, // Conclusion
            double_letter_chance: 0, // Echoes/Echo
            random_letter_chance: 0, // Chaos
            time_warp: 0,
            glow: 0,
            cascade: 0,
            gold_bonus: 0,
            shop_discount: 0,
            interest: 0,
            storage: 0,
            utensils: 0,
            gold_per_word: 0,
            spells: []
        };

        if (!str) return stats;
        if (typeof str === 'object') return str;

        // Skip parsing for special items that use description text in stats field
        if (str.includes("earns one of these options") || str.includes("Random Run to Run")) return stats;

        const lowerStr = str.toLowerCase();

        // HP
        let hpMatch = lowerStr.match(/([-+]?\d+)\s*max\s*hp/);
        if (hpMatch) stats.hp = parseInt(hpMatch[1]);

        // HP Regen
        let hpRegenMatch = lowerStr.match(/([-+]?\d+)\s*hp\s*regen/);
        if (hpRegenMatch) stats.hp_regen = parseInt(hpRegenMatch[1]);

        // Ink
        let inkMatch = lowerStr.match(/([-+]?\d+)\s*max\s*ink/);
        if (inkMatch) stats.ink = parseInt(inkMatch[1]);

        // Ink Regen
        let inkRegenMatch = lowerStr.match(/([-+]?\d+)\s*ink\s*regen/);
        if (inkRegenMatch) stats.ink_regen = parseInt(inkRegenMatch[1]);

        // Armor
        let armorMatch = lowerStr.match(/(\d+)\s*armor/);
        if (armorMatch) stats.armor = parseInt(armorMatch[1]);

        // Lockpicks
        let lockpickMatch = lowerStr.match(/([-+]?\d+)\s*lockpick/);
        if (lockpickMatch) stats.lockpick = parseInt(lockpickMatch[1]);

        // Gold Bonus
        let goldMatch = lowerStr.match(/(\d+)%\s*more\s*gold/);
        if (goldMatch) stats.gold_bonus = parseInt(goldMatch[1]);
        let goldMatch2 = lowerStr.match(/gain\s*(\d+)%\s*more\s*gold/);
        if (goldMatch2) stats.gold_bonus = parseInt(goldMatch2[1]);

        // Shop Discount
        let shopMatch = lowerStr.match(/([-+]?\d+)%\s*shop\s*prices?/);
        if (shopMatch) stats.shop_discount = -parseInt(shopMatch[1]);
        let shopMatch2 = lowerStr.match(/(\d+)%\s*shop\s*discount/);
        if (shopMatch2) stats.shop_discount = parseInt(shopMatch2[1]);

        // Room Gold Bonus (Fixed amount per word)
        let roomGoldMatch = lowerStr.match(/([-+]?\d+)\s*gold\s*per\s*word/);
        if (roomGoldMatch) stats.gold_per_word = parseInt(roomGoldMatch[1]);

        // Rummage
        let rummageMatch = lowerStr.match(/(\d+)%\s*(?:item\s*find|rummage)/);
        if (rummageMatch) stats.rummage = parseInt(rummageMatch[1]);
        let rummageMatch2 = lowerStr.match(/rummage\s*(\d+)%/); // Catch "Rummage 5%"
        if (rummageMatch2) stats.rummage = parseInt(rummageMatch2[1]);

        // Time Warp
        let timeMatch = lowerStr.match(/(\d+)%\s*time\s*warp/);
        if (timeMatch) stats.time_warp = parseInt(timeMatch[1]);

        // Glow
        let glowMatch = lowerStr.match(/(\d+)%\s*glow/);
        if (glowMatch) stats.glow = parseInt(glowMatch[1]);

        // Cascade
        let cascadeMatch = lowerStr.match(/(\d+)%\s*cascade/);
        if (cascadeMatch) stats.cascade = parseInt(cascadeMatch[1]);

        // Foresight (First Letter)
        let foresightMatch = lowerStr.match(/(\d+)%\s*(?:first\s*letter|foresight)/);
        if (foresightMatch) stats.first_letter_chance = parseInt(foresightMatch[1]);

        // Conclusion (Last Letter)
        let conclusionMatch = lowerStr.match(/(\d+)%\s*(?:last\s*letter|conclusion)/);
        if (conclusionMatch) stats.last_letter_chance = parseInt(conclusionMatch[1]);

        // Echo (Double Letter)
        let echoMatch = lowerStr.match(/(\d+)%\s*(?:double\s*letter|echo)/);
        if (echoMatch) stats.double_letter_chance = parseInt(echoMatch[1]);

        // Chaos (Random Letter)
        let chaosMatch = lowerStr.match(/(\d+)%\s*(?:random\s*letter|chaos)/);
        if (chaosMatch) stats.random_letter_chance = parseInt(chaosMatch[1]);

        // Interest
        let interestMatch = lowerStr.match(/(\d+)%\s*(?:gold\s*)?interest/);
        if (interestMatch) stats.interest = parseInt(interestMatch[1]);

        // Carry Capacity (storage)
        let carryMatch = lowerStr.match(/(\d+)\s*carry\s*capacity/);
        if (carryMatch) stats.storage = parseInt(carryMatch[1]);
        let ccMatch = lowerStr.match(/(\d+)\s*cc/);
        if (ccMatch) stats.storage = parseInt(ccMatch[1]);

        // Active Utensils (utensils)
        let utensilMatch = lowerStr.match(/([-+]?\d+)\s*active\s*utensil/);
        if (utensilMatch) stats.utensils = parseInt(utensilMatch[1]);

        // Spells
        const spellKeywords = ["reveal", "heal", "chisel", "scrape", "telepathy", "chaos", "roulette"];
        spellKeywords.forEach(spell => {
            if (lowerStr.includes(spell)) {
                stats.spells.push(spell.charAt(0).toUpperCase() + spell.slice(1));
            }
        });

        return stats;
    }
}

class ItemManager {
    constructor() {
        this.storage = new Array(9).fill(null);
        this.hat = null;
        this.utensils = new Array(1).fill(null);
        this.maxStorageSize = 9;
        this.maxUtensilsSize = 1;
        this.bonus_armor = 0;
        this.bonus_hp = 0;
        this.spellonomicon_dmg_count = 0;
        this.notebook_word_count = 0;
        this.notebook_bonus_stats = {}; // Keep as empty object for legacy safety if needed, but unused
        this.allItems = [];
        this.loadAllItems();
    }

    async loadAllItems() {
        try {
            // Check for embedded global first to avoid CORS on file://
            if (window.SD_ITEMS) {
                this.allItems = window.SD_ITEMS;
                console.log("Loaded items from embedded SD_ITEMS.");
                return;
            }

            const response = await fetch('items_utf8.json');
            if (!response.ok) throw new Error("Fetch failed");
            const data = await response.json();
            this.allItems = data;
        } catch (e) {
            console.error("Failed to load items:", e);
            // Fallback to empty to prevent total crash
            this.allItems = [];
        }
    }

    reset() {
        this.storage = new Array(9).fill(null);
        this.hat = null;
        this.utensils = new Array(this.maxUtensilsSize || 1).fill(null);
        this.spellonomicon_dmg_count = 0;
        this.bonus_armor = 0;
        this.bonus_hp = 0;
        this.notebook_word_count = 0;
        this.diary_word_count = 0;
        this.notebook_bonus_stats = {};
        this.updateInventoryLimits();
    }

    createItem(data) {
        return new Item(Date.now() + Math.random(), data.name, data.cost, data.stats, data.slot || '', data.description || '');
    }

    createItemByName(name) {
        const data = this.allItems.find(it => it.name.toLowerCase() === name.toLowerCase());
        if (!data) return null;
        return this.createItem(data);
    }

    addItem(item) {
        // Try to add to slot if appropriate
        if (item.slot === 'hat' && !this.hat) {
            this.hat = item;
            this.updateInventoryLimits();
            return true;
        }
        if (item.slot === 'utensil') {
            const emptyIdx = this.utensils.indexOf(null);
            if (emptyIdx !== -1) {
                this.utensils[emptyIdx] = item;
                this.updateInventoryLimits();
                return true;
            }
        }

        // Try storage
        const emptyStorageIdx = this.storage.indexOf(null);
        if (emptyStorageIdx !== -1) {
            this.storage[emptyStorageIdx] = item;
            this.updateInventoryLimits();
            return true;
        }

        return false;
    }

    removeItem(item) {
        if (!item) return false;
        if (this.hat === item) {
            this.hat = null;
        } else {
            const uIdx = this.utensils.indexOf(item);
            if (uIdx !== -1) {
                this.utensils[uIdx] = null;
            } else {
                const sIdx = this.storage.indexOf(item);
                if (sIdx !== -1) {
                    this.storage[sIdx] = null;
                } else {
                    return false;
                }
            }
        }
        this.updateInventoryLimits();
        return true;
    }

    sellItem(itemOrIndex) {
        let item = itemOrIndex;
        if (typeof itemOrIndex === 'number') {
            item = this.storage[itemOrIndex];
        }

        if (!item) return false;

        // Find and remove
        if (this.hat === item) { this.hat = null; }
        else if (this.utensils.includes(item)) { this.utensils[this.utensils.indexOf(item)] = null; }
        else if (this.storage.includes(item)) { this.storage[this.storage.indexOf(item)] = null; }
        else return false;

        this.updateInventoryLimits();
        return true;
    }

    equip(item) {
        if (!item) return false;

        // If in storage, remove it
        const sIdx = this.storage.indexOf(item);
        if (sIdx !== -1) {
            if (item.slot === 'hat') {
                const old = this.hat;
                this.hat = item;
                this.storage[sIdx] = old;
            } else if (item.slot === 'utensil') {
                const emptyIdx = this.utensils.indexOf(null);
                if (emptyIdx !== -1) {
                    this.utensils[emptyIdx] = item;
                    this.storage[sIdx] = null;
                } else {
                    const old = this.utensils[0];
                    this.utensils[0] = item;
                    this.storage[sIdx] = old;
                }
            } else {
                return false; // Not a hat or utensil
            }
            this.updateInventoryLimits();
            return true;
        }
        return false;
    }

    unequip(item) {
        if (!item) return false;

        const emptyIdx = this.storage.indexOf(null);
        if (emptyIdx === -1) return false; // No space

        if (this.hat === item) {
            this.storage[emptyIdx] = item;
            this.hat = null;
        } else if (this.utensils.includes(item)) {
            const uIdx = this.utensils.indexOf(item);
            this.storage[emptyIdx] = item;
            this.utensils[uIdx] = null;
        } else {
            return false;
        }

        this.updateInventoryLimits();
        return true;
    }

    // Auto-upgrade logic for picking up better versions of items (legacy hook for main.js)
    autoUpgrade(newItem) {
        if (!newItem) return false;

        // Find existing item with same name in any slot
        const allItems = [...this.storage, this.hat, ...this.utensils].filter(i => i !== null);
        const existing = allItems.find(i => i.name === newItem.name);
        if (existing) {
            // For now, if it's the same name, we don't 'upgrade' unless we had a rarity system.
            // But we must return false or handle it to avoid crashes in main.js
            return false;
        }

        // If we have an empty slot where it COULD go, main.js treats that as a success 
        // in some versions. We'll let addItem handle it.
        return false;
    }

    updateInventoryLimits() {
        const stats = this.getTotalStats();

        // Update storage size
        const targetStorageSize = 9 + (stats.storage || 0);
        if (this.storage.length < targetStorageSize) {
            while (this.storage.length < targetStorageSize) this.storage.push(null);
        }
        this.maxStorageSize = targetStorageSize;

        // Update utensil size
        const targetUtensilSize = 1 + (stats.utensils || 0);
        if (this.utensils.length < targetUtensilSize) {
            while (this.utensils.length < targetUtensilSize) this.utensils.push(null);
        }
        this.maxUtensilsSize = targetUtensilSize;
    }

    hasItemNamed(name) {
        const all = [this.hat, ...this.utensils, ...this.storage].filter(i => i !== null);
        return all.some(i => i.name === name);
    }

    getTotalStats() {
        const total = {
            hp: 0,
            ink: 0,
            hp_regen: 1,
            ink_regen: 1,
            armor: 0,
            lockpick: 3,
            rummage: 0,
            first_letter_chance: 0,
            last_letter_chance: 0,
            double_letter_chance: 0,
            random_letter_chance: 0,
            time_warp: 0,
            glow: 0,
            cascade: 0,
            gold_bonus: 0,
            shop_discount: 0,
            interest: 0,
            storage: 0,
            utensils: 0,
            telepathy: 0,
            origin_chance: 0,
            gold_per_word: 0,
            spells: []
        };

        // Character-specific bonuses (Deprecated for instance-based stats like Spellonomicon)
        // total.armor += this.bonus_armor || 0;
        // total.hp += this.bonus_hp || 0;

        // Notebook bonuses are now handled per-item in the items loop below

        const activeItems = [this.hat, ...this.utensils, ...this.storage].filter(i => i !== null);
        activeItems.forEach(item => {
            const slotType = item.slot ? item.slot.toLowerCase() : '';

            // Logic: Hats and Utensils MUST be in their respective slots to apply stats.
            // Items with slot 'storage' or no slot ('') apply stats from anywhere (passive).
            let shouldApply = false;

            if (slotType === ItemType.HAT) {
                shouldApply = (item === this.hat);
            } else if (slotType === ItemType.UTENSIL) {
                shouldApply = this.utensils.includes(item);
            } else {
                // Accessores, Storage items, or any item not categorized as a Hat/Utensil
                shouldApply = true;
            }

            if (shouldApply && item.stats) {
                // Apply base item stats
                Object.keys(item.stats).forEach(stat => {
                    const val = item.stats[stat];
                    if (stat === 'spells') {
                        if (Array.isArray(val)) {
                            val.forEach(s => {
                                if (s) total.spells.push(s);
                            });
                        }
                    } else if (total.hasOwnProperty(stat)) {
                        total[stat] += (val || 0);
                    }
                });

                // SPECIAL: Graduate's Cap Persistent Stats
                if (item.name === "Graduate's Cap" && typeof activeProfile !== 'undefined' && activeProfile.graduateCapStats) {
                    Object.keys(activeProfile.graduateCapStats).forEach(stat => {
                        if (total.hasOwnProperty(stat)) {
                            total[stat] += (activeProfile.graduateCapStats[stat] || 0);
                        }
                    });
                }

                // SPECIAL: Punch Card dynamic discount
                if (item.name === "Punch Card") {
                    total.shop_discount += (item.boughtCount || 0);
                }
            }
        });

        // Apply capacity bonuses back to the manager
        this.maxStorageSize = 9 + (total.storage || 0);
        this.maxUtensilsSize = 1 + (total.utensils || 0);

        return total;
    }

    serialize() {
        return {
            storage: this.storage.map(item => item ? { ...item } : null),
            hat: this.hat ? { ...this.hat } : null,
            utensils: this.utensils.map(item => item ? { ...item } : null),
            maxStorageSize: this.maxStorageSize,
            maxUtensilsSize: this.maxUtensilsSize,
            bonus_armor: this.bonus_armor || 0,
            bonus_hp: this.bonus_hp || 0,
            spellonomicon_dmg_count: this.spellonomicon_dmg_count || 0,
            notebook_word_count: this.notebook_word_count || 0,
            notebook_bonus_stats: { ...this.notebook_bonus_stats }
        };
    }

    get equipped() {
        return [this.hat, ...this.utensils].filter(i => i !== null);
    }

    hasItem(name) {
        const lowerName = name.toLowerCase();
        return [this.hat, ...this.utensils, ...this.storage]
            .some(i => i && i.name.toLowerCase() === lowerName);
    }

    getItemNamed(name) {
        const lower = name.toLowerCase();
        if (this.hat && this.hat.name.toLowerCase() === lower) return this.hat;
        const u = this.utensils.find(it => it && it.name.toLowerCase() === lower);
        if (u) return u;
        const s = this.storage.find(it => it && it.name.toLowerCase() === lower);
        return s || null;
    }

    getTriggeredSpells() {
        const triggered = [];
        const stats = this.getTotalStats();

        // Roll for proc chances
        if (Math.random() * 100 < stats.first_letter_chance) triggered.push("first");
        if (Math.random() * 100 < stats.last_letter_chance) triggered.push("last");

        // Rollover for Chaos
        let chaosChance = stats.random_letter_chance || 0;
        const chaosRolls = Math.floor(chaosChance / 100) + (Math.random() * 100 < (chaosChance % 100) ? 1 : 0);
        for (let i = 0; i < chaosRolls; i++) {
            triggered.push("random");
        }

        if (Math.random() * 100 < stats.double_letter_chance) triggered.push("double");
        if (Math.random() * 100 < (stats.telepathy || 0)) triggered.push("telepathy");

        return triggered;
    }

    deserialize(data) {
        if (!data) return;
        this.storage = (data.storage || []).map(i => i ? Object.assign(new Item(), i) : null);
        this.hat = data.hat ? Object.assign(new Item(), data.hat) : null;
        this.utensils = (data.utensils || []).map(i => i ? Object.assign(new Item(), i) : null);
        this.maxStorageSize = data.maxStorageSize || 9;
        this.maxUtensilsSize = data.maxUtensilsSize || 1;
        this.bonus_armor = data.bonus_armor || 0;
        this.bonus_hp = data.bonus_hp || 0;
        this.spellonomicon_dmg_count = data.spellonomicon_dmg_count || 0;
        this.notebook_word_count = data.notebook_word_count || 0;
        this.notebook_bonus_stats = data.notebook_bonus_stats || {};
        this.updateInventoryLimits();
    }
}

if (typeof window !== 'undefined') {
    window.ItemManager = ItemManager;
    window.Item = Item;
    window.ItemType = ItemType;
}

