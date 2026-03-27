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
      types: ["pen", "pencil", "quill", "brush", "calligraphy pen", "chalk stick", "crayon", "stylus", "charcoal stick", "mechanical eraser", "rainbow pencil", "#2 pencil", "#3 pencil", "#4 pencil", "color pencil", "ink brush"]
    },
    HEADGEAR: {
      name: "Headwear",
      types: ["helmet", "hood", "wizard hat", "glasses", "monocle", "turban", "cap", "crown", "veil", "earhorn", "flat cap"]
    },
    OFF_HAND: {
      name: "Off-hand",
      types: ["shield", "book", "ruler", "compass", "bag", "satchel", "briefcase", "folio", "folding chair", "lantern", "scroll", "brown shopping bag", "mortar and pestle", "eraser refill", "calculator", "passed note", "sticky note", "crumpled note", "ink refill", "3 ring binder", "tape dispenser", "masking tape"]
    },
    ACCESSORIES: {
      name: "Accessories",
      types: ["bracelet", "ring", "ankle bracelet", "fanny pack", "pocket protector", "handkerchief", "tie", "bowtie", "belt", "cufflinks", "earring", "brooch", "purse", "cape", "magnetic boots"]
    },
    TORSO: {
      name: "Clothing & Armor",
      types: ["robe", "tunic", "breastplate", "shirt", "vest", "cloak", "waistcoat", "apron", "doublet", "gambeson"]
    }
  },

  SlotStats: {
    HEAD: ["hp", "ink", "hp_regen", "ink_regen", "armor", "first_letter_chance", "last_letter_chance", "double_letter_chance", "random_letter_chance", "time_warp", "rummage", "glow", "cascade"],
    TORSO: ["hp", "ink", "hp_regen", "ink_regen", "armor", "rummage", "cascade"],
    MAIN_HAND: ["ink", "ink_regen", "lockpick", "rummage", "glow", "cascade"],
    OFF_HAND: ["hp", "hp_regen", "armor", "ink", "ink_regen", "first_letter_chance", "last_letter_chance", "double_letter_chance", "random_letter_chance", "time_warp", "rummage", "glow", "cascade"],
    ACCESSORY: ["hp_regen", "ink_regen", "first_letter_chance", "last_letter_chance", "double_letter_chance", "random_letter_chance", "time_warp", "rummage", "glow", "cascade"]
  },

  Styles: {
    MEDIEVAL: "medieval",
    ANCIENT: "ancient",
    MODERN: "modern"
  }
};

// Auto-generated parsed items - Attached to window for global access
const SD_ITEMS = [
  {
    "name": "Tophat",
    "cost": 150,
    "stats": {
      "gold_bonus": 20,
      "interest": 3
    },
    "description": "A symbol of elegance and higher interest rates.",
    "slot": "hat",
    "stats_raw": "Gain 20% more Gold. Shop items cost 5% more. 3% Interest."
  },
  {
    "name": "Ruler",
    "cost": 25,
    "stats": {
      "last_letter_chance": 15
    },
    "description": "A precision measurement tool for final letter precision.",
    "slot": "utensil",
    "stats_raw": "15% Conclusion Chance"
  },
  {
    "name": "Fanny Pack",
    "cost": 40,
    "stats": {
      "storage": 3
    },
    "description": "The ultimate neon accessory for the hip dungeoneer.",
    "slot": "",
    "stats_raw": "3 Carry Capacity"
  },
  {
    "name": "Backpack",
    "cost": 100,
    "stats": {
      "storage": 8
    },
    "description": "Sturdy canvas for the serious scholar on the go.",
    "slot": "",
    "stats_raw": "8 Carry Capacity"
  },
  {
    "name": "Pencil Case",
    "cost": 15,
    "stats": {
      "utensils": 1
    },
    "description": "Keeps your writing tools organized and ready.",
    "slot": "",
    "stats_raw": "+1 Active Utensil"
  },
  {
    "name": "Feather Pen",
    "cost": 50,
    "stats": {
      "random_letter_chance": 5,
      "origin_chance": 5,
      "telepathy": 5,
      "spells": [
        "Chaos"
      ]
    },
    "description": "A classic quill that hums with chaotic potential.",
    "slot": "Utensil",
    "stats_raw": "5% Chaos, 5% Origin, 5% Telepathy, Gives Active Spell: Chaos"
  },
  {
    "name": "Calligraphy Pen",
    "cost": 30,
    "stats": {
      "cascade": 10,
      "hp": -3
    },
    "description": "It's not easy, but it sure is fun!",
    "slot": "Utensil",
    "stats_raw": "10% Cascade, -3 Max HP"
  },
  {
    "name": "Coin Purse",
    "cost": 50,
    "stats": {
      "gold_bonus": 10
    },
    "description": "A jingling pouch that attracts more than just envy.",
    "slot": "",
    "stats_raw": "10% More gold dropped"
  },
  {
    "name": "Jeweler's Loupe",
    "cost": 85,
    "stats": {
      "last_letter_chance": 5,
      "rummage": 5,
      "shop_discount": 5
    },
    "description": "See it up close, flaws and all.",
    "slot": "",
    "stats_raw": "5% Last Letter, -5% shop prices, +5% Rummage"
  },
  {
    "name": "Monocle",
    "cost": 90,
    "stats": {
      "gold_bonus": 5,
      "first_letter_chance": 5,
      "last_letter_chance": 5
    },
    "description": "The mark of a discerning scholar. Doubles as a status symbol.",
    "slot": "",
    "stats_raw": "5% more gold, 5% foresight, 5% Conclusion"
  },
  {
    "name": "Graduate's Cap",
    "cost": 120,
    "stats": {},
    "description": "A heavy, tasseled cap that reeks of sleepless nights.",
    "slot": "hat",
    "stats_raw": "Boss defeats give bonuses that persist from from run to run."
  },
  {
    "name": "Dealer's Visor",
    "cost": 10,
    "stats": {
      "interest": 2
    },
    "description": "Keeps the sweat out of your eyes while you count your spoils.",
    "slot": "hat",
    "stats_raw": "2% Interest from room to room."
  },
  {
    "name": "Torch",
    "cost": 25,
    "stats": {
      "glow": 20,
      "rummage": 5,
      "random_letter_chance": 1,
      "first_letter_chance": 1,
      "last_letter_chance": 1
    },
    "description": "A flickering flame that keeps the dark at bay.",
    "slot": "",
    "stats_raw": "20% Glow, 5% Rummage, 1% Chaos, 1% Foresight, 1% Conclusion"
  },
  {
    "name": "Wristwatch",
    "cost": 15,
    "stats": {
      "time_warp": 10
    },
    "description": "Time is precious. This makes it a little more flexible.",
    "slot": "",
    "stats_raw": "10% Time Warp"
  },
  {
    "name": "Wizard Hat",
    "cost": 40,
    "stats": {
      "last_letter_chance": 10,
      "telepathy": 5,
      "spells": [
        "Scrape"
      ]
    },
    "description": "Starry and pointed. Essential for any serious caster.",
    "slot": "hat",
    "stats_raw": "Spell: Scrape, 10% Conclusion, 5% Telepathy"
  },
  {
    "name": "Witch Hat",
    "cost": 40,
    "stats": {
      "first_letter_chance": 10,
      "origin_chance": 5,
      "spells": [
        "Chisel"
      ]
    },
    "description": "Pointed and wide-brimmed. Excellent for brewing trouble.",
    "slot": "hat",
    "stats_raw": "Spell: Chisel, 10% Foresight, 5% Origin"
  },
  {
    "name": "Horn-Rimmed Glasses",
    "cost": 65,
    "stats": {
      "random_letter_chance": 5,
      "rummage": 3,
      "cascade": 5
    },
    "description": "See betta. Look Betta. Get in the flow betta!",
    "slot": "",
    "stats_raw": "5% Chaos, 3% Rummage, 5% Cascade"
  },
  {
    "name": "Ear Muffs",
    "cost": 30,
    "stats": {
      "time_warp": 30
    },
    "description": "Tune out distractions in style.",
    "slot": "",
    "stats_raw": "30% Time Warp"
  },
  {
    "name": "Lock Picks",
    "cost": 15,
    "stats": {},
    "description": "Useful with locks. Breakable with mistakes.",
    "slot": "storage",
    "stats_raw": "CONSUMABLE: Adds +2 attempts. (+3 Skill)"
  },
  {
    "name": "Stethoscope",
    "cost": 60,
    "stats": {
      "double_letter_chance": 15,
      "lockpick": 1
    },
    "description": "Listen close; the lock might just whisper its secrets.",
    "slot": "",
    "stats_raw": "15% Echo, 1 Lockpick"
  },
  {
    "name": "Pocket Watch",
    "cost": 35,
    "stats": {
      "time_warp": 25
    },
    "description": "Tick-tock. Some moments are slower than others.",
    "slot": "",
    "stats_raw": "25% Time Warp"
  },
  {
    "name": "Toolbelt",
    "cost": 50,
    "stats": {
      "storage": 3,
      "spells": [
        "Chisel"
      ]
    },
    "description": "Heavy leather slots for the industrious delver.",
    "slot": "",
    "stats_raw": "3 CC, Chisel"
  },
  {
    "name": "Lunchbox",
    "cost": 45,
    "stats": {
      "storage": 3,
      "hp_regen": 1
    },
    "description": "A sturdy tin for keepin' your lunch and your health.",
    "slot": "",
    "stats_raw": "3 CC, +1 HP Regen"
  },
  {
    "name": "Correction Fluid",
    "cost": 25,
    "stats": {
      "armor": 2,
      "hp": -5
    },
    "description": "Powerful, but dangerous.",
    "slot": "",
    "stats_raw": "2 Armor, -5 Max HP"
  },
  {
    "name": "Diary",
    "cost": 40,
    "stats": {},
    "description": "Ah, memories.",
    "slot": "",
    "stats_raw": "Persistence: +1 Word Spelled per word. Unlocks: Puzzle Mode (50). Evolves: Manuscript (50), Memoir (100)."
  },
  {
    "name": "Memoir",
    "cost": 600,
    "stats": {
      "gold_per_word": 10
    },
    "slot": "",
    "stats_raw": "Earn +10 Gold per word spelled correctly.",
    "description": "A complete account of your adventures. Your name will be remembered forever."
  },
  {
    "name": "Pocket Notebook",
    "cost": 30,
    "stats": {},
    "description": "Take a few notes, get a few buffs.",
    "slot": "",
    "stats_raw": "Every 5 words: Gains +1% to a random passive stack (Chaos, Foresight, Conclusion, Telepathy, Origin, Rummage, Cascade, Time Warp, Echoes, Illumination, or Haggling)."
  },
  {
    "name": "Headlamp",
    "cost": 60,
    "stats": {
      "first_letter_chance": 3,
      "last_letter_chance": 3,
      "random_letter_chance": 3,
      "rummage": 3,
      "glow": 30
    },
    "description": "A hands-free light.",
    "slot": "",
    "stats_raw": "3% Foresight, 3% Conclusion, 3% Chaos, 3% Rummage, 30% Glow"
  },
  {
    "name": "Archeologist's Brush",
    "cost": 50,
    "stats": {
      "rummage": 10
    },
    "description": "Soft bristles that uncover secrets buried in the dust of ages.",
    "slot": "",
    "stats_raw": "10% Rummage"
  },
  {
    "name": "Flashlight",
    "cost": 20,
    "stats": {
      "glow": 15,
      "rummage": 3,
      "first_letter_chance": 2,
      "last_letter_chance": 2
    },
    "description": "A focused beam of light in a world of ink and shadows.",
    "slot": "",
    "stats_raw": "15% Glow, 3% Rummage, 2% Foresight, 2% Conclusion"
  },
  {
    "name": "#1 Pencil",
    "cost": 20,
    "stats": {
      "armor": 1
    },
    "description": "Goes on dark smooth.",
    "slot": "Utensil",
    "stats_raw": "+5 Cascade, -1hp"
  },
  {
    "name": "Notebook",
    "cost": 100,
    "stats": {},
    "description": "Take notes, get stronger.",
    "slot": "",
    "stats_raw": "Every 5 words: Gains +2% to ALL passive stacks (Chaos, Foresight, Conclusion, Telepathy, Origin, Rummage, Cascade, Time Warp, Echoes, Illumination, and Haggling)."
  },
  {
    "name": "Eraser",
    "cost": 30,
    "stats": {
      "hp": 5
    },
    "description": "A block of rubber.",
    "slot": "",
    "stats_raw": "+5 Max HP"
  },
  {
    "name": "Glasses",
    "cost": 55,
    "stats": {
      "first_letter_chance": 5,
      "rummage": 5
    },
    "description": "Squint less, see more.",
    "slot": "",
    "stats_raw": "5% Foresight, 5% Rummage"
  },
  {
    "name": "Water Bottle",
    "cost": 35,
    "stats": {
      "ink_regen": 1
    },
    "description": "Mixes with torch soot to make more ink.",
    "slot": "",
    "stats_raw": "+1 Ink Regen"
  },
  {
    "name": "Small Inkwell",
    "cost": 20,
    "stats": {
      "ink": 5
    },
    "description": "A modest ink reserve.",
    "slot": "",
    "stats_raw": "+5 Max Ink"
  },
  {
    "name": "Inkwell",
    "cost": 45,
    "stats": {
      "ink": 10
    },
    "description": "A bottomless pit of black fluid. Don't stare too long.",
    "slot": "",
    "stats_raw": "+10 Max Ink"
  },
  {
    "name": "Big Inkwell",
    "cost": 75,
    "stats": {
      "ink": 20
    },
    "description": "A cavernous vat of ink. Enough to write a saga.",
    "slot": "",
    "stats_raw": "+20 Max Ink"
  },
  {
    "name": "Bowler Cap",
    "cost": 25,
    "stats": {
      "rummage": 10,
      "cascade": 5
    },
    "description": "Firm and round. Perfect for tips and tavern brawls.",
    "slot": "Hat",
    "stats_raw": "10% Rummage, 5% Cascade"
  },
  {
    "name": "Ring",
    "cost": 75,
    "stats": {},
    "description": "A simple band of gold. It's too small for a mage but perfect for a shopkeeper.",
    "slot": "",
    "stats_raw": "Just for selling to the shop. Does not appear in the shop."
  },
  {
    "name": "purse",
    "cost": 60,
    "stats": {
      "storage": 3,
      "interest": 1
    },
    "description": "A small leather bag for your various coins and trinkets.",
    "slot": "",
    "stats_raw": "+3 CC, 1% Interest"
  },
  {
    "name": "brown shopping bag",
    "cost": 10,
    "stats": {
      "storage": 2
    },
    "description": "A humble paper carrier.",
    "slot": "",
    "stats_raw": "+2 CC"
  },
  {
    "name": "Brief Case",
    "cost": 50,
    "stats": {
      "storage": 4
    },
    "description": "A professional leather case for those who treat dungeoneering like a 9-to-5.",
    "slot": "",
    "stats_raw": "+4 CC"
  },
  {
    "name": "Camping chair",
    "cost": 75,
    "stats": {
      "hp_regen": 2
    },
    "description": "Sit and spell!",
    "slot": "",
    "stats_raw": "+2 HP Regen"
  },
  {
    "name": "Mortar and pestle",
    "cost": 70,
    "stats": {
      "ink_regen": 2
    },
    "description": "For grinding your own ink.",
    "slot": "",
    "stats_raw": "+2 Ink Regen"
  },
  {
    "name": "Eraser Refill",
    "cost": 10,
    "stats": {},
    "description": "Click to restore your eraser (It's like a health potion).",
    "slot": "",
    "stats_raw": "Consumable. Refills 10 HP"
  },
  {
    "name": "Mechanical Eraser",
    "cost": 60,
    "stats": {
      "hp": 10
    },
    "description": "A clicky marvel of modern stationery. Precision removal of all errors.",
    "slot": "",
    "stats_raw": "+10 Max Hp"
  },
  {
    "name": "Calculator",
    "cost": 20,
    "stats": {
      "shop_discount": 10,
      "time_warp": 5
    },
    "description": "Beeps and boops that make sense of even the most complex shop inventories.",
    "slot": "",
    "stats_raw": "10% Shop Discount, 5% Time Warp"
  },
  {
    "name": "Big Eraser",
    "cost": 100,
    "stats": {
      "hp": 20
    },
    "description": "A massive block of rubber. For when you make REALLY big mistakes.",
    "slot": "",
    "stats_raw": "+20 Max HP"
  },
  {
    "name": "Ink Refill",
    "cost": 10,
    "stats": {},
    "description": "Click to refill your ink (It's like a mana potion).",
    "slot": "",
    "stats_raw": "Consumable. Refills 10 Ink"
  },
  {
    "name": "Earhorn",
    "cost": 50,
    "stats": {
      "double_letter_chance": 10,
      "lockpick": 1
    },
    "description": "An archaic hearing aid. Helps you hear the faint 'clack' of falling tumblers.",
    "slot": "",
    "stats_raw": "10% Echo, +1 Lockpick"
  },
  {
    "name": "Flat Cap",
    "cost": 25,
    "stats": {
      "rummage": 20
    },
    "description": "A humble hat for a hard day's work. Fred Dibnah approved.",
    "slot": "Hat",
    "stats_raw": "20% Rummage"
  },
  {
    "name": "Rainbow Pencil",
    "cost": 33,
    "stats": {
      "hp": -2,
      "cascade": 10,
      "spells": [
        "Roulette"
      ]
    },
    "description": "Swirling, flowing colors. Kinda hard to read, but fun to use!",
    "slot": "utensil",
    "stats_raw": "New Spell: Roullette, -2 Max HP, 10% Cascade."
  },
  {
    "name": "Hood",
    "cost": 20,
    "stats": {
      "lockpick": 1,
    },
    "description": "Shadowy and mysterious.",
    "slot": "",
    "stats_raw": ""
  },
  {
    "name": "Tape Dispenser",
    "cost": 50,
    "stats": {
      "armor": 1
    },
    "description": "I mean, it might work.",
    "slot": "",
    "stats_raw": "1 Armor"
  },
  {
    "name": "Masking Tape",
    "cost": 85,
    "stats": {
      "armor": 2
    },
    "description": "A slightly more professional way to hide your spelling slips.",
    "slot": "",
    "stats_raw": "2 Armor"
  },
  {
    "name": "Ink Brush",
    "cost": 65,
    "stats": {
      "cascade": 15,
      "hp": -5
    },
    "description": "Soft bristles that hold a surprising amount of magical potential.",
    "slot": "Utensil",
    "stats_raw": "15% Cascade, -5 Max HP"
  },
  {
    "name": "#2 Pencil",
    "cost": 35,
    "stats": {
      "armor": 1,
      "hp": 5
    },
    "description": "The standard-bearer of education. Reliable, yellow, and ready.",
    "slot": "Utensil",
    "stats_raw": "1 Armor, +5 max hp"
  },
  {
    "name": "#3 Pencil",
    "cost": 50,
    "stats": {
      "armor": 2,
      "hp": 5
    },
    "description": "Goes on lighter and erases easier.",
    "slot": "Utensil",
    "stats_raw": "2 Armor, +5 max hp"
  },
  {
    "name": "#4 Pencil",
    "cost": 75,
    "stats": {
      "armor": 2,
      "hp": 10
    },
    "description": "The hardest lead in the dungeon. Trivial to erase.",
    "slot": "Utensil",
    "stats_raw": "2 Armor, +10 max hp"
  },
  {
    "name": "Color Pencil",
    "cost": 25,
    "stats": {
      "cascade": 5,
      "hp": -2
    },
    "description": "Adds a bit of flair to your notes, even if it costs a bit of concentration.",
    "slot": "Utensil",
    "stats_raw": "5% Cascade, -2 max hp"
  },
  {
    "name": "Magnetic Boots",
    "cost": 110,
    "stats": {
      "rummage": 20
    },
    "description": "Helps you 'stick' to the idea of finding better loot.",
    "slot": "",
    "stats_raw": "20% Rummage"
  },
  {
    "name": "Cheat Sheet",
    "cost": 40,
    "stats": {
      "spells": [
        "Chaos"
      ]
    },
    "description": "Tiny scribbles that hum with a faint, illicit magical energy.",
    "slot": "",
    "stats_raw": "Gives Spell Chaos"
  },
  {
    "name": "Business Card",
    "cost": 50,
    "stats": {
      "shop_discount": 15
    },
    "description": "Discerning Mage for Hire. Includes a 15% discount code on the back.",
    "slot": "",
    "stats_raw": "-15% Shop Prices"
  },
  {
    "name": "Doctor's Note",
    "cost": 1000,
    "stats": {},
    "description": "Ok we'll believe you this time. But only because you have a note.",
    "slot": "",
    "stats_raw": "Extra Life"
  },
  {
    "name": "Vowel Highlighter",
    "cost": 500,
    "stats": {},
    "description": "Paints every A, E, I, O, and U in a vibrant, neon glow.",
    "slot": "Utensil",
    "stats_raw": "Highlights All Vowels"
  },
  {
    "name": "Consonant Highlighter",
    "cost": 500,
    "stats": {},
    "description": "Brings the stubborn consonants into the spotlight.",
    "slot": "Utensil",
    "stats_raw": "Highlights all Consonants"
  },
  {
    "name": "20 Sided die",
    "cost": 30,
    "stats": {
      "random_letter_chance": 5
    },
    "description": "An Icosahedron of luck. Some say it controls the very fabric of fate.",
    "slot": "",
    "stats_raw": "5% Chaos"
  },
  {
    "name": "12 Sided die",
    "cost": 45,
    "stats": {
      "random_letter_chance": 8.333333333333332
    },
    "description": "A rare Dodecahedron for an adventurer with a penchant for twelve-sided chance.",
    "slot": "",
    "stats_raw": "1/12 Chaos"
  },
  {
    "name": "10 Sided die",
    "cost": 60,
    "stats": {
      "random_letter_chance": 10
    },
    "description": "A Pentagonal Trapezohedron. The numbers are clear, even if the outcome isn't.",
    "slot": "",
    "stats_raw": "10% Chaos"
  },
  {
    "name": "8 Sided Die",
    "cost": 75,
    "stats": {
      "random_letter_chance": 12.5
    },
    "description": "A sharp-edged Octahedron of chance. Watch your step.",
    "slot": "",
    "stats_raw": "12.5% Chaos"
  },
  {
    "name": "6 Sided die",
    "cost": 100,
    "stats": {
      "random_letter_chance": 16.666666666666664
    },
    "description": "The classic Hexahedron. A staple in any gamble-filled dungeon life.",
    "slot": "",
    "stats_raw": "1/6 Chaos"
  },
  {
    "name": "4 sided die",
    "cost": 150,
    "stats": {
      "random_letter_chance": 25
    },
    "description": "The most dangerous Tetrahedron. Don't step on it.",
    "slot": "",
    "stats_raw": "25% Chaos"
  },
  {
    "name": "Chaos Coin",
    "cost": 300,
    "stats": {
      "random_letter_chance": 50
    },
    "description": "One side is heads, the other is a vortex of pure chaos.",
    "slot": "",
    "stats_raw": "50% Chaos"
  },
  {
    "name": "Ball Point Pen",
    "cost": 15,
    "stats": {
      "first_letter_chance": 5,
      "cascade": 3,
      "hp": -1
    },
    "description": "Cheap but effective. Rolls pretty smooth! Bleeds sometimes.",
    "slot": "Utensil",
    "stats_raw": "5% Foresight, 2% Cascade, -1 max hp"
  },
  {
    "name": "Kneaded Eraser",
    "cost": 60,
    "stats": {
      "hp": 5,
      "hp_regen": 1
    },
    "description": "Versatile and long-lasting.",
    "slot": "",
    "stats_raw": "+5 max hp, +1 hp regen"
  },
  {
    "name": "Pencil Pouch",
    "cost": 20,
    "stats": {
      "utensils": 2
    },
    "description": "A zip-up pocket for your ever-expanding collection of writing tools.",
    "slot": "",
    "stats_raw": "+2 Active Utensils"
  },
  {
    "name": "Bandolier",
    "cost": 25,
    "stats": {
      "utensils": 3
    },
    "description": "Hold pens and pencils at the ready.",
    "slot": "",
    "stats_raw": "+3 Active Utensils"
  },
  {
    "name": "Ear Plugs",
    "cost": 20,
    "stats": {
      "time_warp": 15
    },
    "description": "Focus pocus.",
    "slot": "",
    "stats_raw": "15% Time Warp"
  },
  {
    "name": "Magnifying Glass",
    "cost": 40,
    "stats": {
      "rummage": 3,
      "shop_discount": 3,
      "last_letter_chance": 3
    },
    "description": "For those who need to look a little closer at the shop's 'best' deals.",
    "slot": "",
    "stats_raw": "3% Rummage, -3% Shop Prices, 3% Last Letter"
  },
  {
    "name": "Lock Box",
    "cost": 100,
    "stats": {
      "gold_bonus": 5,
      "interest": 2
    },
    "description": "A small, sturdy chest for the gold you're REALLY saving.",
    "slot": "",
    "stats_raw": "5% more gold, 2% Interest from room to room."
  },
  {
    "name": "Hammer and Chisel",
    "cost": 35,
    "stats": {
      "first_letter_chance": 10,
      "spells": [
        "Chisel"
      ]
    },
    "description": "Sometimes you have to carve the answer into the very walls.",
    "slot": "",
    "stats_raw": "10% Foresight, Chisel"
  },
  {
    "name": "Soot Scraper",
    "cost": 70,
    "stats": {
      "ink_regen": 1,
      "spells": [
        "Scrape"
      ]
    },
    "description": "Scrapes away the grime of the dungeon to reveal the ink beneath.",
    "slot": "",
    "stats_raw": "+1 Ink Regen, Scrape"
  },
  {
    "name": "Water Jug",
    "cost": 85,
    "stats": {
      "ink_regen": 2
    },
    "description": "Hydrates soot to keep your inkwell full.",
    "slot": "",
    "stats_raw": "+2 Ink Regen"
  },
  {
    "name": "Hand Mattock",
    "cost": 35,
    "stats": {
      "last_letter_chance": 10,
      "spells": [
        "Scrape"
      ]
    },
    "description": "A small pick for uncovering the secrets of the letter blocks.",
    "slot": "",
    "stats_raw": "10% Conclusion, Scrape"
  },
  {
    "name": "Archeologist's Hammer",
    "cost": 65,
    "stats": {
      "spells": [
        "Chisel",
        "Scrape"
      ]
    },
    "description": "A precision tool for tapping into the history of the word.",
    "slot": "",
    "stats_raw": "Chisel, Scrape"
  },
  {
    "name": "Loaf of Bread",
    "cost": 40,
    "stats": {
      "hp_regen": 1
    },
    "description": "Stale, but it's more about the sustenance than the flavor.",
    "slot": "",
    "stats_raw": "+1 hp regen"
  },
  {
    "name": "Jar Of Honey",
    "cost": 75,
    "stats": {
      "hp_regen": 1,
      "ink_regen": 1
    },
    "description": "Sweet, sticky, and surprisingly restorative.",
    "slot": "",
    "stats_raw": "+1 Hp Regen, +1 Ink Regen"
  },
  {
    "name": "Thesaurus",
    "cost": 40,
    "stats": {
      "telepathy": 100
    },
    "description": "Connects similar ideas to guide your spelling.",
    "slot": "",
    "stats_raw": "100% Telepathy"
  },
  {
    "name": "Dictionary",
    "cost": 15,
    "stats": {
      "origin_chance": 100
    },
    "description": "Defines the ancient roots of every word.",
    "slot": "",
    "stats_raw": "100% Origin Display"
  },
  {
    "name": "Manuscript",
    "cost": 300,
    "stats": {
      "gold_per_word": 5
    },
    "description": "Loose pages of your early work, now bound by effort.",
    "slot": "",
    "stats_raw": "Earn +5 Gold per word spelled correctly."
  },
  {
    "name": "Spellonomicon",
    "cost": 66.6,
    "stats": {},
    "description": "Gains 1 armor every 10 mistakes.",
    "slot": "",
    "stats_raw": "Every 10 damage: +1 Armor, -1 Max HP"
  },
  {
    "name": "Edward Pencil Hands",
    "cost": 40,
    "stats": {
      "utensils": 5
    },
    "description": "A leather glove with pencil attachment points. For the multitasker who needs EVERY tool.",
    "slot": "",
    "stats_raw": "5 Active Utensil Slots (Looks like a leather glove with pencil attachment points)"
  }
];

if (typeof window !== 'undefined') {
  window.ItemData = ItemData;
  window.SD_ITEMS = SD_ITEMS;
}
