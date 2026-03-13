/**
 * Item types and slots inspired by Diablo 2
 */
const ItemType = {
    HEAD: 'head',
    TORSO: 'torso',
    MAIN_HAND: 'main_hand',
    OFF_HAND: 'off_hand',
    ACCESSORY: 'accessory',
    CONSUMABLE: 'consumable'
};

const Rarity = {
    NORMAL: { name: 'Normal', color: '#ffffff', tier: 1 },
    MAGIC: { name: 'Magic', color: '#4444ff', tier: 2 },
    RARE: { name: 'Rare', color: '#ffff44', tier: 3 },
    UNIQUE: { name: 'Unique', color: '#ffcc00', tier: 4 },
    MYTHIC: { name: 'Mythic', color: '#a335ee', tier: 5 }
};

class Item {
    constructor(id, name, type, rarity, stats = {}, description = "", ability = null) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.tier = (rarity && rarity.tier) ? rarity.tier : 1;
        this.stats = stats; // e.g., { hp: 20, ink: 10 }
        this.description = description;
        this.ability = ability; // e.g., { name: "Letter Collector-A", charge: 0 }
    }
}

class ItemManager {
    constructor() {
        this.inventory = new Array(40).fill(null);
        this.maxInventorySize = 40; // 4x10 grid
        this.equipped = {
            [ItemType.HEAD]: null,
            [ItemType.TORSO]: null,
            [ItemType.MAIN_HAND]: null,
            [ItemType.OFF_HAND]: null,
            accessory1: null,
            accessory2: null
        };

        // Initial test items
        this.addTestItems();
    }

    addTestItems() {
        // Test items removed as requested
    }

    generateItem(tier = 1, type = null) {
        if (!type) {
            const types = [ItemType.HEAD, ItemType.TORSO, ItemType.MAIN_HAND, ItemType.OFF_HAND, ItemType.ACCESSORY];
            type = types[Math.floor(Math.random() * types.length)];
        }

        const categoryKey = type === ItemType.ACCESSORY ? "ACCESSORIES" :
            type === ItemType.HEAD ? "HEADGEAR" :
                type.toUpperCase();
        const category = ItemData.Categories[categoryKey];
        const baseName = category.types[Math.floor(Math.random() * category.types.length)];
        const capitalizedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);

        const possibleStats = ItemData.SlotStats[type === ItemType.ACCESSORY ? "ACCESSORY" : type.toUpperCase()];

        let stats = {};
        let ability = null;
        let suffix = "";

        // Roll stats 'tier' times
        for (let i = 0; i < tier; i++) {
            const chosenStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];

            if (chosenStat === "ability") {
                if (!ability) {
                    const abilities = [
                        { name: "Reveal Random", suffix: " of Revelation" },
                        { name: "Healing Magic", suffix: " of Healing" }
                    ];
                    const selected = abilities[Math.floor(Math.random() * abilities.length)];
                    ability = { name: selected.name, charge: 0 };
                    suffix = selected.suffix;
                } else {
                    // Do not allow duplicate skills. Reroll this slot.
                    i--;
                }
            } else {
                if (!stats[chosenStat]) stats[chosenStat] = 0;

                if (chosenStat === "hp") {
                    stats[chosenStat] += Math.floor(Math.random() * 6) + 5; // 5 to 10
                    suffix = " of Vitality";
                } else if (chosenStat === "ink") {
                    stats[chosenStat] += Math.floor(Math.random() * 16) + 5; // 5 to 20
                    suffix = " of Mind";
                } else if (chosenStat === "armor") {
                    stats[chosenStat] += 1;
                    suffix = " of Guarding";
                } else if (chosenStat.endsWith("_regen")) {
                    stats[chosenStat] += Math.floor(Math.random() * 2) + 1; // 1 to 2
                    suffix = ` of ${chosenStat.startsWith("hp") ? "Recovery" : "Focus"}`;
                } else if (chosenStat === "lockpick") {
                    stats[chosenStat] += Math.floor(Math.random() * 2) + 1; // 1 to 2
                    suffix = " of Opening";
                } else if (chosenStat === "item_find") {
                    stats[chosenStat] += Math.floor(Math.random() * 5) + 1; // 1 to 5
                    suffix = " of Discovery";
                } else if (chosenStat.endsWith("_chance")) {
                    stats[chosenStat] += Math.floor(Math.random() * 10) + 1; // 1-10% range
                    const spellNames = {
                        first_letter_chance: "Foresight",
                        last_letter_chance: "Conclusion",
                        double_letter_chance: "Echoes",
                        random_letter_chance: "Chaos"
                    };
                    suffix = ` of ${spellNames[chosenStat] || "Magic"}`;
                }
            }
        }

        const name = capitalizedName + suffix;
        let rarity = Rarity.NORMAL;
        if (tier === 2) rarity = Rarity.MAGIC;
        if (tier === 3) rarity = Rarity.RARE;
        if (tier === 4) rarity = Rarity.UNIQUE;
        if (tier >= 5) rarity = Rarity.MYTHIC;

        return new Item(Date.now(), name, type, rarity, stats, `A Tier ${tier} item found in the dungeon.`, ability);
    }

    addItem(item) {
        const emptyIndex = this.inventory.indexOf(null);
        if (emptyIndex !== -1) {
            this.inventory[emptyIndex] = item;
            return true;
        }
        return false;
    }

    removeItem(index) {
        const item = this.inventory[index];
        this.inventory[index] = null;
        return item;
    }

    moveItem(fromIndex, toIndex) {
        const item = this.inventory[fromIndex];
        this.inventory[fromIndex] = this.inventory[toIndex];
        this.inventory[toIndex] = item;
        return true;
    }

    equip(itemIndex, slot = null) {
        const item = this.inventory[itemIndex];
        if (!item || item.type === ItemType.CONSUMABLE) return false;

        if (!slot) {
            slot = item.type;
            if (item.type === ItemType.ACCESSORY) {
                // Pick an empty accessory slot, or default to accessory1
                if (!this.equipped.accessory1) slot = 'accessory1';
                else if (!this.equipped.accessory2) slot = 'accessory2';
                else slot = 'accessory1';
            }
        }

        const currentEquipped = this.equipped[slot];

        // Swap: item goes to slot, old item goes to where the new item was
        this.equipped[slot] = item;
        this.inventory[itemIndex] = currentEquipped;

        return true;
    }

    unequip(slot, targetIndex = -1) {
        const item = this.equipped[slot];
        if (!item) return false;

        // If a target index is provided and it's empty, use it. Otherwise find first empty.
        let destIndex = targetIndex;
        if (destIndex === -1 || destIndex >= this.maxInventorySize || this.inventory[destIndex] !== null) {
            destIndex = this.inventory.indexOf(null);
        }

        if (destIndex !== -1) {
            this.inventory[destIndex] = item;
            this.equipped[slot] = null;
            return true;
        }
        return false;
    }

    getTotalStats() {
        const total = { hp: 0, ink: 0, hp_regen: 0, ink_regen: 0, armor: 0, lockpick: 0, item_find: 0, first_letter_chance: 0, last_letter_chance: 0, double_letter_chance: 0, random_letter_chance: 0 };
        Object.values(this.equipped).forEach(item => {
            if (item && item.stats) {
                if (item.stats.hp) total.hp += item.stats.hp;
                if (item.stats.ink) total.ink += item.stats.ink;
                if (item.stats.hp_regen) total.hp_regen += item.stats.hp_regen;
                if (item.stats.ink_regen) total.ink_regen += item.stats.ink_regen;
                if (item.stats.armor) total.armor += item.stats.armor;
                if (item.stats.lockpick) total.lockpick += item.stats.lockpick;
                if (item.stats.item_find) total.item_find += item.stats.item_find;
                if (item.stats.first_letter_chance) total.first_letter_chance += item.stats.first_letter_chance;
                if (item.stats.last_letter_chance) total.last_letter_chance += item.stats.last_letter_chance;
                if (item.stats.double_letter_chance) total.double_letter_chance += item.stats.double_letter_chance;
                if (item.stats.random_letter_chance) total.random_letter_chance += item.stats.random_letter_chance;
            }
        });
        console.log("Total Item Stats Summed:", total);
        return total;
    }

    getTriggeredSpells() {
        const stats = this.getTotalStats();
        const triggered = [];
        if (Math.random() * 100 < stats.first_letter_chance) triggered.push('first');
        if (Math.random() * 100 < stats.last_letter_chance) triggered.push('last');
        if (Math.random() * 100 < stats.double_letter_chance) triggered.push('double');
        if (Math.random() * 100 < stats.random_letter_chance) triggered.push('random');
        console.log("Spells Triggered in ItemManager:", triggered);
        return triggered;
    }

    /**
     * Forge 9 same-tier items into 1 item of the next tier.
     * @param {number[]} indices - Array of 9 backpack indices
     * @returns {Item|null} The newly forged item, or null on failure
     */
    forgeItems(indices) {
        if (indices.length !== 9) return null;

        // Collect items and validate all slots are filled
        const sourceItems = indices.map(i => this.inventory[i]);
        if (sourceItems.some(item => !item)) return null;

        // All items must share the same rarity tier
        const tier = sourceItems[0].tier;
        if (sourceItems.some(item => item.tier !== tier)) return null;

        // Find the next rarity by tier
        const rarityByTier = {
            1: Rarity.MAGIC,   // Normal → Magic
            2: Rarity.RARE,    // Magic → Rare
            3: Rarity.UNIQUE,  // Rare → Unique
            4: Rarity.MYTHIC   // Unique → Mythic
        };
        const nextRarity = rarityByTier[tier];
        if (!nextRarity) return null; // Already max tier (Unique)

        // Pick 3 random distinct source items for stat combination
        const donorIndices = [];
        while (donorIndices.length < 3) {
            let r = Math.floor(Math.random() * 9);
            if (donorIndices.indexOf(r) === -1) donorIndices.push(r);
        }
        const donor1 = sourceItems[donorIndices[0]];
        const donor2 = sourceItems[donorIndices[1]];
        const donor3 = sourceItems[donorIndices[2]];

        // Combine stats from the three donors
        const combinedStats = {};
        const allStatKeys = new Set([
            ...Object.keys(donor1.stats || {}),
            ...Object.keys(donor2.stats || {}),
            ...Object.keys(donor3.stats || {})
        ]);
        allStatKeys.forEach(key => {
            combinedStats[key] = (donor1.stats[key] || 0) + (donor2.stats[key] || 0) + (donor3.stats[key] || 0);
        });

        // Pick a random name from the 9 source items
        const nameSource = sourceItems[Math.floor(Math.random() * 9)];

        // Build the forged item
        const forgedItem = new Item(
            Date.now(),
            nameSource.name,
            nameSource.type,
            nextRarity,
            combinedStats,
            `Forged from ${nextRarity.name} essence.`,
            donor1.ability || donor2.ability || donor3.ability || null
        );

        // Remove all 9 source items from inventory
        indices.forEach(i => { this.inventory[i] = null; });

        // Add the forged item
        this.addItem(forgedItem);

        return forgedItem;
    }

    serialize() {
        return {
            inventory: this.inventory.map(item => item ? { ...item } : null),
            equipped: {
                [ItemType.HEAD]: this.equipped[ItemType.HEAD] ? { ...this.equipped[ItemType.HEAD] } : null,
                [ItemType.TORSO]: this.equipped[ItemType.TORSO] ? { ...this.equipped[ItemType.TORSO] } : null,
                [ItemType.MAIN_HAND]: this.equipped[ItemType.MAIN_HAND] ? { ...this.equipped[ItemType.MAIN_HAND] } : null,
                [ItemType.OFF_HAND]: this.equipped[ItemType.OFF_HAND] ? { ...this.equipped[ItemType.OFF_HAND] } : null,
                accessory1: this.equipped.accessory1 ? { ...this.equipped.accessory1 } : null,
                accessory2: this.equipped.accessory2 ? { ...this.equipped.accessory2 } : null
            }
        };
    }

    deserialize(data) {
        if (!data) {
            this.inventory = new Array(40).fill(null);
            this.equipped = {
                [ItemType.HEAD]: null,
                [ItemType.TORSO]: null,
                [ItemType.MAIN_HAND]: null,
                [ItemType.OFF_HAND]: null,
                accessory1: null,
                accessory2: null
            };
            return;
        }

        // Maintain the fixed array size of 40
        const rawInv = data.inventory || [];
        this.inventory = new Array(40).fill(null);
        rawInv.forEach((itemData, idx) => {
            if (idx < 40 && itemData) {
                this.inventory[idx] = Object.assign(new Item(), itemData);
            }
        });

        for (const slot in this.equipped) {
            if (data.equipped && data.equipped[slot]) {
                this.equipped[slot] = Object.assign(new Item(), data.equipped[slot]);
            } else {
                this.equipped[slot] = null;
            }
        }
    }
}

window.ItemManager = ItemManager;
window.Item = Item;
window.ItemType = ItemType;
window.Rarity = Rarity;
