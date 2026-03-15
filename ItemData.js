/**
 * Spelling Dungeon
 * 
 * This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/
 * 
 * Copyright (c) 2026 The Spelling Dungeon Authors
 */

/**
 * Base data for procedural item generation.
 * Organizes items into categories and provides lists of names/types.
 */
const ItemData = {
    Categories: {
        MAIN_HAND: {
            name: "Tools",
            types: ["pen", "pencil", "quill", "brush", "calligraphy pen", "chalk stick", "crayon", "stylus", "charcoal stick"]
        },
        HEADGEAR: {
            name: "Headwear",
            types: ["helmet", "hood", "wizard hat", "glasses", "monocle", "turban", "cap", "crown", "veil"]
        },
        OFF_HAND: {
            name: "Off-hand",
            types: ["shield", "book", "ruler", "compass", "bag", "satchel", "briefcase", "folio", "folding chair", "lantern", "scroll"]
        },
        ACCESSORIES: {
            name: "Accessories",
            types: ["bracelet", "ring", "necklace", "ankle bracelet", "fanny pack", "pocket protector", "handkerchief", "tie", "bowtie", "belt", "cufflinks", "earring", "brooch"]
        },
        TORSO: {
            name: "Clothing & Armor",
            types: ["robe", "tunic", "breastplate", "shirt", "vest", "cloak", "waistcoat", "apron", "doublet", "gambeson"]
        }
    },

    SlotStats: {
        HEAD: ["hp", "ink", "hp_regen", "ink_regen", "armor", "first_letter_chance", "last_letter_chance", "double_letter_chance", "random_letter_chance", "time_warp", "item_find"],
        TORSO: ["hp", "ink", "hp_regen", "ink_regen", "armor", "item_find"],
        MAIN_HAND: ["ink", "ink_regen", "lockpick", "item_find"],
        OFF_HAND: ["armor", "ink", "ink_regen", "first_letter_chance", "last_letter_chance", "double_letter_chance", "random_letter_chance", "time_warp", "item_find"],
        ACCESSORY: ["hp_regen", "ink_regen", "first_letter_chance", "last_letter_chance", "double_letter_chance", "random_letter_chance", "time_warp", "item_find"]
    },

    Styles: {
        MEDIEVAL: "medieval",
        ANCIENT: "ancient",
        MODERN: "modern"
    }
};

if (typeof window !== 'undefined') {
    window.ItemData = ItemData;
}
