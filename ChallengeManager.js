const ChallengeMode = {
    RANDOM: 'random',
    ADVENTURE: 'adventure'
};

class ChallengeManager {
    constructor(wordLibrary) {
        this.library = wordLibrary;
        this.currentMode = ChallengeMode.RANDOM;
        this.currentWordData = null;
        this.speechEnabled = 'speechSynthesis' in window;
        this.voice = null;
        this.volume = 0.8; // Default 80%

        // Adventure state
        this.adventureWordsCompleted = 0;
        this.adventureTargetLength = 0;
        this.currentLengthIndex = 0; // Tracks which index in adventureLengths we're on
        this.wordsAtCurrentLength = 0; // Tracks words completed at current length
        this.adventureLengths = [];
        this.adventureCounts = {}; // Stores word count per length


        this.initVoice();
    }

    initVoice(preferredVoiceName = null) {
        if (!this.speechEnabled) return;

        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return;

            // 1. If preferred voice name provided, try to find it
            if (preferredVoiceName) {
                const foundPreferred = voices.find(v => v.name === preferredVoiceName);
                if (foundPreferred) {
                    this.voice = foundPreferred;
                    console.log("Selected preferred TTS Voice:", foundPreferred.name);
                    return;
                }
            }

            // Updated high-quality keywords for modern OSes
            const highQualityKeywords = ["Neural", "Natural", "Google", "Online", "Premium", "Premium", "Enhanced", "Vocalizer"];
            const specificPriorities = ["Google US English", "Microsoft Zira", "Microsoft David", "Microsoft Mark", "Google UK English Female", "Alex"];

            // 2. Prioritize Neural/Natural English voices first
            for (let kw of highQualityKeywords) {
                const found = voices.find(v => v.name.includes(kw) && v.lang.startsWith('en'));
                if (found) {
                    this.voice = found;
                    console.log("Premium TTS Voice selected (keyword):", found.name);
                    return;
                }
            }

            // 3. Fallback to specific high-quality OS names
            for (let name of specificPriorities) {
                const found = voices.find(v => v.name.includes(name));
                if (found) {
                    this.voice = found;
                    console.log("High-quality TTS Voice selected (priority):", found.name);
                    return;
                }
            }

            // 4. Last resort fallback
            this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
            if (this.voice) console.log("Standard TTS Voice selected (fallback):", this.voice.name);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
            setVoice();
        }
        window.speechSynthesis.onvoiceschanged = setVoice;
    }

    setVoiceByName(name) {
        const voices = window.speechSynthesis.getVoices();
        const found = voices.find(v => v.name === name);
        if (found) {
            this.voice = found;
            console.log("Manual TTS Voice selection:", found.name);
            return true;
        }
        return false;
    }

    getAvailableVoices() {
        if (!this.speechEnabled) return [];
        return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    }

    setMode(mode) {
        this.currentMode = mode;
        console.log("Challenge Mode set to:", mode);

        // Initialize adventure state when entering adventure mode
        if (mode === ChallengeMode.ADVENTURE) {
            this.initAdventure();
        }
    }

    initAdventure() {
        this.adventureWordsCompleted = 0;

        // Group words by difficulty
        this.adventureBuckets = this.library.getDifficultyBuckets();

        console.log("Adventure initialized. Difficulty buckets populated.");
    }

    generateNewChallenge(currentLevel = 1, excludeList = []) {
        if (this.currentMode === ChallengeMode.ADVENTURE) {
            // Map 10 dungeon levels to 5 word difficulty levels (1-2 = 1, 3-4 = 2, ...)
            const targetDiff = Math.max(1, Math.min(5, Math.ceil(currentLevel / 2)));
            // Let the WordLibrary handle difficulty filtering and history fallback
            this.currentWordData = this.library.getRandomWord(null, targetDiff, excludeList);

            // If the difficulty level is exhausted or returning errors, fall back to pure random
            if (!this.currentWordData || this.currentWordData.word === "ERROR") {
                this.currentWordData = this.library.getRandomWord(null, null, excludeList);
            }

            this.adventureWordsCompleted++;
            console.log(`Adventure: word ${this.adventureWordsCompleted} | level ${targetDiff} selected.`);
        } else {
            // Random: pull from FULL pool (null tier = no filtering)
            this.currentWordData = this.library.getRandomWord(null, null, excludeList);
        }

        return this.currentWordData;
    }

    // Returns adventure progress info for UI display
    getAdventureProgress() {
        if (this.currentMode !== ChallengeMode.ADVENTURE) return null;
        return {
            totalCompleted: this.adventureWordsCompleted
        };
    }

    getClue() {
        if (!this.currentWordData) return "";
        return "Mystery Word!";
    }

    revealLetter(progress) {
        const word = this.currentWordData.word;
        if (progress < word.length) {
            return word[progress];
        }
        return null;
    }

    speakWord() {
        if (!this.speechEnabled) return;

        window.speechSynthesis.cancel();
        const textToSpeak = (this.currentWordData.speakAs || this.currentWordData.word).toLowerCase();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        if (this.voice) utterance.voice = this.voice;
        utterance.rate = 1.0; // Increased to 1.0 for more natural pacing
        utterance.volume = this.volume;
        window.speechSynthesis.speak(utterance);

        // Handle example sentences for Inklings
        if (this.library.currentSetKey === 'inkling' &&
            this.currentWordData.sentences &&
            this.currentWordData.sentences.length > 0) {

            utterance.onend = () => {
                // Short pause before sentence
                setTimeout(() => {
                    const sentences = this.currentWordData.sentences;
                    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
                    const sentenceUtterance = new SpeechSynthesisUtterance(randomSentence);
                    if (this.voice) sentenceUtterance.voice = this.voice;
                    sentenceUtterance.rate = 1.0; // Consistent rate for sentences
                    sentenceUtterance.volume = this.volume;
                    window.speechSynthesis.speak(sentenceUtterance);
                }, 600);
            };
        }
    }

    generateMCQ(excludeList = []) {
        const pool = this.library.getWords();
        if (pool.length < 4) return null;

        // Pick target word via getRandomWord() so it respects word history
        const target = this.library.getRandomWord(null, null, excludeList);

        // Pick 3 distractors
        const distractors = [];
        while (distractors.length < 3) {
            const d = pool[Math.floor(Math.random() * pool.length)];
            if (d.word !== target.word && !distractors.find(x => x.word === d.word)) {
                distractors.push(d);
            }
        }

        const type = Math.random() > 0.5 ? 'word-to-def' : 'def-to-word';
        let question, options;

        if (type === 'word-to-def') {
            question = `${target.word}`;
            options = [
                { text: target.definition, isCorrect: true },
                ...distractors.map(d => ({ text: d.definition, isCorrect: false }))
            ];
        } else {
            question = `${target.definition}`;
            options = [
                { text: target.word, isCorrect: true },
                ...distractors.map(d => ({ text: d.word, isCorrect: false }))
            ];
        }

        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return { question, options, target };
    }
}
