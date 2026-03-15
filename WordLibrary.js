/**
 * Spelling Dungeon
 * 
 * This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/
 * 
 * Copyright (c) 2026 The Spelling Dungeon Authors
 */

/*
 * ============================================================
 * DIFFICULTY RATING METHODOLOGY
 * ============================================================
 * 
 * Each word in SAT_WORDS, DOOZIE_WORDS, and INKLING_WORDS has
 * been assigned a "difficulty" rating from 1 (easiest) to 5 (hardest).
 *
 * SCORING METHOD (combined score):
 *   - 60% weight: FAMILIARITY — how likely an average person is to know
 *     or recognize the word. Common everyday words score low; rare,
 *     academic, or specialized words score high.
 *   - 40% weight: SPELLING DIFFICULTY — how hard the word is to spell
 *     correctly. Short, fully phonetic words score low; words with silent
 *     letters, unusual letter combinations, or tricky patterns score high.
 *
 * SCORING SCALE (raw, before normalization):
 *   1 = Very easy/common and simple to spell
 *   2 = Common and mostly phonetic
 *   3 = Moderate familiarity or moderate spelling challenge
 *   4 = Less familiar or noticeably tricky spelling
 *   5 = Rare/obscure and/or very difficult to spell
 *
 * NORMALIZATION:
 *   Raw scores are assigned relative to each word list independently
 *   (scores in INKLING_WORDS reflect difficulty within that list, not
 *   globally). After raw scoring, scores are normalized within each list
 *   so that each level (1–5) contains approximately 20% of that list's
 *   words, with a maximum spread of 10 percentage points between the
 *   most and least populated levels. This ensures balanced gameplay
 *   across all difficulty tiers within each list.
 *
 * DISTRIBUTION TARGET: ~20% per level (±5%), max 10% spread
 *
 * NOTE: Scores were assigned by an AI agent (Claude Sonnet 4.6) in March
 * 2026 using the method above. To re-score or adjust, re-apply the same
 * rubric to the word + definition pairs, then re-normalize using a
 * percentile-based binning approach (sort by raw score, split into 5
 * equal buckets). Borderline words near bucket boundaries may be
 * reassigned without meaningfully changing the overall distribution.
 * ============================================================
 */

const SAT_WORDS = [
    { word: "ABATE", definition: "(v.) To become less intense or widespread.", sentence: "The storm began to abate.", hint: "To lessen in intensity.", tier: 1, difficulty: 1, synonyms: ["diminish", "subside", "wane"] },
    { word: "ABDICATE", definition: "(v.) To give up a position, right, or power.", sentence: "The king chose to abdicate the throne.", hint: "To renounce a throne.", tier: 2, difficulty: 1, synonyms: ["relinquish", "renounce", "resign"] },
    { word: "ABERRATION", definition: "(n.) A departure from what is normal or expected.", sentence: "The snowstorm in July was an aberration.", hint: "An anomaly.", tier: 2, difficulty: 1, synonyms: ["anomaly", "deviation", "irregularity"] },
    { word: "ABHOR", definition: "(v.) To regard with disgust and hatred.", sentence: "I abhor any kind of cruelty.", hint: "To detest.", tier: 2, difficulty: 1, synonyms: ["detest", "loathe", "despise"] },
    { word: "ABJECT", definition: "(adj.) Experienced or present to the maximum degree.", sentence: "The family lived in abject poverty.", hint: "Extremely bad.", tier: 3, difficulty: 3, synonyms: ["wretched", "miserable", "degraded"] },
    { word: "ABNEGATION", definition: "(n.) The act of renouncing or rejecting something.", sentence: "Monks often practice abnegation.", hint: "Self-denial.", tier: 3, difficulty: 5, synonyms: ["self-denial", "renunciation", "abstinence"] },
    { word: "ABORTIVE", definition: "(adj.) Failing to produce the intended result.", sentence: "The mission was abortive.", hint: "Unsuccessful.", tier: 3, difficulty: 4, synonyms: ["unsuccessful", "futile", "failed"] },
    { word: "ABRIDGE", definition: "(v.) To shorten a piece of writing without losing the sense.", sentence: "The editor will abridge the long novel for younger readers.", hint: "To condense.", tier: 2, difficulty: 1, synonyms: ["condense", "shorten", "abbreviate"] },
    { word: "ABROGATE", definition: "(v.) To repeal or do away with (a law or right).", sentence: "The government may abrogate the old treaty.", hint: "To abolish.", tier: 3, difficulty: 4, synonyms: ["abolish", "repeal", "nullify"] },
    { word: "ABSCOND", definition: "(v.) To leave hurriedly and secretly.", sentence: "The thief plans to abscond with the stolen funds.", hint: "To run away.", tier: 2, difficulty: 3, synonyms: ["flee", "escape", "bolt"] },
    { word: "ABSOLVE", definition: "(v.) To set or declare free from blame or guilt.", sentence: "The judge will absolve him of all wrongdoing.", hint: "To forgive.", tier: 2, difficulty: 1, synonyms: ["exonerate", "acquit", "pardon"] },
    { word: "ABSTAIN", definition: "(v.) To restrain oneself from doing or enjoying something.", sentence: "He chose to abstain from dessert.", hint: "To refrain.", tier: 1, difficulty: 1, synonyms: ["refrain", "forgo", "desist"] },
    { word: "ABSTRUSE", definition: "(adj.) Difficult to understand; obscure.", sentence: "The philosopher's theories were abstruse.", hint: "Profound.", tier: 3, difficulty: 4, synonyms: ["obscure", "arcane", "esoteric"] },
    { word: "ABYSMAL", definition: "(adj.) Extremely bad; appalling.", sentence: "The service was abysmal.", hint: "Very poor.", tier: 2, difficulty: 1, synonyms: ["appalling", "dreadful", "terrible"] },
    { word: "ACCEDE", definition: "(v.) To agree to a demand or request.", sentence: "She will accede to their reasonable request.", hint: "To consent.", tier: 2, difficulty: 3, synonyms: ["consent", "agree", "comply"] },
    { word: "ACCLAIM", definition: "(v./n.) To praise enthusiastically and publicly.", sentence: "The film won critical acclaim.", hint: "Public praise.", tier: 1, difficulty: 1, synonyms: ["praise", "applaud", "commend"] },
    { word: "ACCOLADE", definition: "(n.) An award or privilege granted as a special honor.", sentence: "She received many accolades.", hint: "An honor.", tier: 2, difficulty: 2, synonyms: ["honor", "award", "tribute"] },
    { word: "ACCORD", definition: "(n./v.) An official agreement or treaty; to give.", sentence: "The powers signed an accord.", hint: "Agreement.", tier: 2, difficulty: 1, synonyms: ["agreement", "harmony", "treaty"] },
    { word: "ACCOST", definition: "(v.) To approach and address someone boldly.", sentence: "The guard will accost anyone who enters without permission.", hint: "To confront.", tier: 2, difficulty: 3, synonyms: ["confront", "approach", "waylay"] },
    { word: "ACCRETION", definition: "(n.) Growth or increase by gradual accumulation.", sentence: "The accretion of sediment.", hint: "Accumulation.", tier: 3, difficulty: 5, synonyms: ["accumulation", "buildup", "aggregation"] },
    { word: "ACERBIC", definition: "(adj.) Sharp and forthright; sour or bitter.", sentence: "He was known for his acerbic wit.", hint: "Sarcastic.", tier: 3, difficulty: 4, synonyms: ["caustic", "biting", "sardonic"] },
    { word: "ACQUIESCE", definition: "(v.) To accept something reluctantly but without protest.", sentence: "She will acquiesce to her parents' wishes.", hint: "To comply.", tier: 2, difficulty: 3, synonyms: ["comply", "yield", "concede"] },
    { word: "ACRIMONIOUS", definition: "(adj.) Angry and bitter (typically of a speech).", sentence: "An acrimonious divorce.", hint: "Bitter.", tier: 3, difficulty: 4, synonyms: ["bitter", "hostile", "rancorous"] },
    { word: "ACUMEN", definition: "(n.) The ability to make good judgments.", sentence: "Her business acumen was impressive.", hint: "Insight.", tier: 3, difficulty: 3, synonyms: ["shrewdness", "insight", "astuteness"] },
    { word: "ADAMANT", definition: "(adj.) Refusing to be persuaded or to change one's mind.", sentence: "He was adamant about his decision.", hint: "Unyielding.", tier: 2, difficulty: 2, synonyms: ["unyielding", "inflexible", "resolute"] },
    { word: "ADDUCE", definition: "(v.) To cite as evidence.", sentence: "The lawyer will adduce key facts to support the case.", hint: "To cite.", tier: 3, difficulty: 5, synonyms: ["cite", "present", "reference"] },
    { word: "ADHERENT", definition: "(n./adj.) A follower or supporter of a leader or belief.", sentence: "He was a strict adherent of the faith.", hint: "A follower.", tier: 2, difficulty: 2, synonyms: ["follower", "supporter", "disciple"] },
    { word: "ADMONISH", definition: "(v.) To warn or reprimand someone firmly.", sentence: "The teacher admonished the students.", hint: "To scold.", tier: 2, difficulty: 2, synonyms: ["reprimand", "rebuke", "scold"] },
    { word: "ADROIT", definition: "(adj.) Clever or skillful in using the hands or mind.", sentence: "He was adroit at tax avoidance.", hint: "Skillful.", tier: 3, difficulty: 3, synonyms: ["skillful", "dexterous", "nimble"] },
    { word: "ADULATION", definition: "(n.) Excessive admiration or praise.", sentence: "The band received adulation from fans.", hint: "Worship.", tier: 3, difficulty: 4, synonyms: ["flattery", "worship", "veneration"] },
    { word: "ADULTERATE", definition: "(v.) To render poorer in quality by adding another substance.", sentence: "The wine was adulterated with water.", hint: "To contaminate.", tier: 3, difficulty: 3, synonyms: ["contaminate", "corrupt", "dilute"] },
    { word: "ADVERSARY", definition: "(n.) One's opponent in a contest, conflict, or dispute.", sentence: "The boxer beat his adversary.", hint: "An opponent.", tier: 1, difficulty: 1, synonyms: ["opponent", "foe", "rival"] },
    { word: "ADVERSE", definition: "(adj.) Preventing success or development; harmful.", sentence: "Adverse weather conditions.", hint: "Unfavorable.", tier: 2, difficulty: 1, synonyms: ["unfavorable", "harmful", "detrimental"] },
    { word: "ADVOCATE", definition: "(v./n.) To publicly support or recommend a cause.", sentence: "She will advocate for better school lunches.", hint: "To support.", tier: 1, difficulty: 1, synonyms: ["champion", "support", "endorse"] },
    { word: "AFFABLE", definition: "(adj.) Friendly, good-natured, or easy to talk to.", sentence: "The host was very affable.", hint: "Friendly.", tier: 2, difficulty: 3, synonyms: ["friendly", "amiable", "genial"] },
    { word: "AFFECTATION", definition: "(n.) Behavior that is artificial and designed to impress.", sentence: "His British accent was an affectation.", hint: "Artificiality.", tier: 3, difficulty: 3, synonyms: ["pretension", "artificiality", "pose"] },
    { word: "AFFINITY", definition: "(n.) A spontaneous or natural liking for someone.", sentence: "She has an affinity for animals.", hint: "An attraction.", tier: 2, difficulty: 2, synonyms: ["attraction", "kinship", "rapport"] },
    { word: "AFFLUENT", definition: "(adj.) Having a great deal of money; wealthy.", sentence: "The neighborhood was very affluent.", hint: "Wealthy.", tier: 2, difficulty: 2, synonyms: ["wealthy", "prosperous", "opulent"] },
    { word: "AGGRANDIZE", definition: "(v.) To increase the power, status, or wealth of.", sentence: "He sought to aggrandize himself.", hint: "To enlarge.", tier: 3, difficulty: 5, synonyms: ["magnify", "exalt", "inflate"] },
    { word: "AGRARIAN", definition: "(adj.) Relating to cultivated land or farming.", sentence: "An agrarian society.", hint: "Agricultural.", tier: 3, difficulty: 4, synonyms: ["agricultural", "farming", "rural"] },
    { word: "ALACRITY", definition: "(n.) Brisk and cheerful readiness.", sentence: "She accepted the job with alacrity.", hint: "Eagerness.", tier: 3, difficulty: 4, synonyms: ["eagerness", "readiness", "enthusiasm"] },
    { word: "ALCHEMY", definition: "(n.) A seemingly magical process of transformation.", sentence: "The alchemy of love.", hint: "Magic.", tier: 2, difficulty: 2, synonyms: ["transformation", "magic", "transmutation"] },
    { word: "ALLAY", definition: "(v.) To diminish or put at rest (fear or suspicion).", sentence: "The doctor's kind words will allay their fears.", hint: "To soothe.", tier: 3, difficulty: 3, synonyms: ["ease", "calm", "soothe"] },
    { word: "ALLEGE", definition: "(v.) To claim that someone has done something wrong.", sentence: "The news reports allege that he broke the rules.", hint: "To claim.", tier: 1, difficulty: 1, synonyms: ["claim", "assert", "charge"] },
    { word: "ALLEVIATE", definition: "(v.) To make (suffering or a problem) less severe.", sentence: "Ice packs can alleviate pain after an injury.", hint: "To ease.", tier: 2, difficulty: 2, synonyms: ["ease", "relieve", "mitigate"] },
    { word: "ALLOCATE", definition: "(v.) To distribute (resources or duties) for a purpose.", sentence: "The school will allocate funds to the art program.", hint: "To assign.", tier: 2, difficulty: 2, synonyms: ["assign", "distribute", "apportion"] },
    { word: "ALLOY", definition: "(n./v.) A metal made by combining two or more metals.", sentence: "Brass is an alloy of copper and zinc.", hint: "A mixture.", tier: 2, difficulty: 2, synonyms: ["blend", "mixture", "composite"] },
    { word: "ALLUSION", definition: "(n.) An expression designed to call something to mind.", sentence: "The poem contains an allusion to a famous speech.", hint: "A reference.", tier: 2, difficulty: 2, synonyms: ["reference", "hint", "mention"] },
    { word: "ALOOF", definition: "(adj.) Not friendly or forthcoming; cool and distant.", sentence: "He was aloof at the party.", hint: "Distant.", tier: 2, difficulty: 2, synonyms: ["distant", "detached", "reserved"] },
    { word: "ALTRUISM", definition: "(n.) The practice of disinterested and selfless concern.", sentence: "Altruism is a noble quality.", hint: "Selflessness.", tier: 3, difficulty: 3, synonyms: ["selflessness", "generosity", "benevolence"] },
    { word: "AMALGAM", definition: "(n.) A mixture or blend of diverse elements.", sentence: "A strange amalgam of styles.", hint: "A blend.", tier: 3, difficulty: 4, synonyms: ["blend", "mixture", "combination"] },
    { word: "AMBIDEXTROUS", definition: "(adj.) Able to use the right and left hands equally well.", sentence: "She is ambidextrous.", hint: "Skillful with both hands.", tier: 3, difficulty: 3, synonyms: ["versatile", "dexterous", "two-handed"] },
    { word: "AMENABLE", definition: "(adj.) Open and responsive to suggestion.", sentence: "She was amenable to the idea.", hint: "Compliant.", tier: 2, difficulty: 3, synonyms: ["compliant", "receptive", "agreeable"] },
    { word: "AMENITY", definition: "(n.) A desirable or useful feature of a place.", sentence: "The hotel had many amenities.", hint: "A convenience.", tier: 2, difficulty: 2, synonyms: ["convenience", "comfort", "facility"] },
    { word: "AMIABLE", definition: "(adj.) Having or displaying a friendly and pleasant manner.", sentence: "The neighbors were very amiable.", hint: "Friendly.", tier: 2, difficulty: 3, synonyms: ["friendly", "pleasant", "congenial"] },
    { word: "AMICABLE", definition: "(adj.) Characterized by friendliness and absence of discord.", sentence: "The meeting was amicable.", hint: "Peaceful.", tier: 2, difficulty: 3, synonyms: ["peaceful", "cordial", "harmonious"] },
    { word: "AMNESTY", definition: "(n.) An official pardon for people who have been convicted.", sentence: "The rebels were granted amnesty.", hint: "A pardon.", tier: 2, difficulty: 2, synonyms: ["pardon", "reprieve", "clemency"] },
    { word: "AMORAL", definition: "(adj.) Lacking a moral sense; unconcerned with rightness.", sentence: "An amoral attitude.", hint: "Without morals.", tier: 3, difficulty: 3, synonyms: ["unethical", "unprincipled", "non-moral"] },
    { word: "AMORPHOUS", definition: "(adj.) Without a clearly defined shape or form.", sentence: "An amorphous cloud of smoke.", hint: "Shapeless.", tier: 3, difficulty: 4, synonyms: ["shapeless", "formless", "vague"] },
    { word: "ANACHRONISM", definition: "(n.) A thing belonging to a period other than that in which it exists.", sentence: "The sword in the modern setting was an anachronism.", hint: "Out of time.", tier: 3, difficulty: 4, synonyms: ["relic", "archaism", "time-error"] },
    { word: "ANALOGY", definition: "(n.) A comparison between two things.", sentence: "He used an analogy to explain the concept.", hint: "A comparison.", tier: 1, difficulty: 1, synonyms: ["comparison", "parallel", "likeness"] },
    { word: "ANARCHY", definition: "(n.) A state of disorder due to absence of authority.", sentence: "The country was in a state of anarchy.", hint: "Lawlessness.", tier: 2, difficulty: 2, synonyms: ["chaos", "disorder", "lawlessness"] },
    { word: "ANATHEMA", definition: "(n.) Something or someone that one vehemently dislikes.", sentence: "Taxes were anathema to him.", hint: "Something detested.", tier: 3, difficulty: 4, synonyms: ["abomination", "pariah", "taboo"] },
    { word: "ANCILLARY", definition: "(adj.) Providing necessary support to the primary operation.", sentence: "Ancillary staff members.", hint: "Supportive.", tier: 3, difficulty: 4, synonyms: ["supplementary", "auxiliary", "secondary"] },
    { word: "ANECDOTE", definition: "(n.) A short and amusing story about a real person.", sentence: "He told a funny anecdote.", hint: "A short story.", tier: 1, difficulty: 1, synonyms: ["story", "tale", "account"] },
    { word: "ANGUISH", definition: "(n./v.) Severe mental or physical pain or suffering.", sentence: "He groaned in anguish.", hint: "Great pain.", tier: 2, difficulty: 1, synonyms: ["torment", "agony", "suffering"] },
    { word: "ANIMOSITY", definition: "(n.) Strong hostility.", sentence: "There was animosity between the rivals.", hint: "Hatred.", tier: 2, difficulty: 2, synonyms: ["hostility", "hatred", "enmity"] },
    { word: "ANNEX", definition: "(v./n.) To add as an extra or subordinate part.", sentence: "The country plans to annex the small border territory.", hint: "To add.", tier: 2, difficulty: 1, synonyms: ["attach", "append", "incorporate"] },
    { word: "ANOMALY", definition: "(n.) Something that deviates from what is standard or normal.", sentence: "The low result was an anomaly.", hint: "An irregularity.", tier: 2, difficulty: 2, synonyms: ["irregularity", "aberration", "oddity"] },
    { word: "ANTECEDENT", definition: "(n./adj.) A thing or event that existed before or logically precedes.", sentence: "The antecedent to the war.", hint: "Forerunner.", tier: 3, difficulty: 3, synonyms: ["predecessor", "forerunner", "precursor"] },
    { word: "ANTEDILUVIAN", definition: "(adj.) Of or belonging to the time before the biblical Flood; old-fashioned.", sentence: "His views were antediluvian.", hint: "Extremely old.", tier: 3, difficulty: 5, synonyms: ["archaic", "prehistoric", "antiquated"] },
    { word: "ANTHOLOGY", definition: "(n.) A published collection of poems or other pieces of writing.", sentence: "The anthology of poetry.", hint: "A collection.", tier: 2, difficulty: 2, synonyms: ["collection", "compilation", "treasury"] },
    { word: "ANTHROPOMORPHIC", definition: "(adj.) Having human characteristics.", sentence: "The bears were anthropomorphic.", hint: "Human-like.", tier: 3, difficulty: 5, synonyms: ["humanlike", "personified", "human-shaped"] },
    { word: "ANTIPATHY", definition: "(n.) A deep-seated feeling of dislike; aversion.", sentence: "His antipathy to cats.", hint: "A dislike.", tier: 3, difficulty: 4, synonyms: ["aversion", "hostility", "dislike"] },
    { word: "ANTIQUATED", definition: "(adj.) Old-fashioned or outdated.", sentence: "The law was antiquated.", hint: "Outdated.", tier: 2, difficulty: 3, synonyms: ["outdated", "obsolete", "archaic"] },
    { word: "ANTITHESIS", definition: "(n.) A person or thing that is the direct opposite of someone else.", sentence: "He is the antithesis of his brother.", hint: "The direct opposite.", tier: 3, difficulty: 3, synonyms: ["opposite", "contrast", "reverse"] },
    { word: "APATHY", definition: "(n.) Lack of interest, enthusiasm, or concern.", sentence: "Voter apathy is high.", hint: "Indifference.", tier: 2, difficulty: 2, synonyms: ["indifference", "lethargy", "disinterest"] },
    { word: "APHORISM", definition: "(n.) A pithy observation that contains a general truth.", sentence: "The old aphorism 'haste makes waste'.", hint: "A saying.", tier: 3, difficulty: 4, synonyms: ["maxim", "proverb", "adage"] },
    { word: "APOCRYPHAL", definition: "(adj.) Of doubtful authenticity.", sentence: "The story is likely apocryphal.", hint: "Fictitious.", tier: 3, difficulty: 5, synonyms: ["dubious", "fictitious", "spurious"] },
    { word: "APOTHEOSIS", definition: "(n.) The highest point in the development of something; culmination.", sentence: "The apotheosis of his career.", hint: "Peak.", tier: 3, difficulty: 5, synonyms: ["pinnacle", "culmination", "zenith"] },
    { word: "APPEASE", definition: "(v.) To pacify or placate someone by acceding to their demands.", sentence: "Giving in will only appease the bully temporarily.", hint: "To soothe.", tier: 2, difficulty: 2, synonyms: ["pacify", "placate", "mollify"] },
    { word: "APPREHENSION", definition: "(n.) Anxiety or fear that something bad will happen.", sentence: "He felt a sense of apprehension.", hint: "Fear.", tier: 2, difficulty: 1, synonyms: ["anxiety", "dread", "unease"] },
    { word: "APPROBATION", definition: "(n.) Official sanction or commendation; an expression of warm endorsement.", sentence: "The plan met with approbation.", hint: "Approval.", tier: 3, difficulty: 5, synonyms: ["approval", "endorsement", "commendation"] },
    { word: "APPROPRIATE", definition: "(adj./v.) Suitable or proper; take for one's own use.", sentence: "His behavior was appropriate.", hint: "Suitable.", tier: 1, difficulty: 1, synonyms: ["suitable", "fitting", "proper"] },
    { word: "ARBITRARY", definition: "(adj.) Based on random choice or personal whim.", sentence: "An arbitrary decision.", hint: "Random.", tier: 2, difficulty: 2, synonyms: ["random", "capricious", "whimsical"] },
    { word: "ARBITRATOR", definition: "(n.) An independent person officially appointed to settle a dispute.", sentence: "They consulted an arbitrator.", hint: "A judge.", tier: 3, difficulty: 3, synonyms: ["mediator", "judge", "referee"] },
    { word: "ARCANE", definition: "(adj.) Understood by few; mysterious or secret.", sentence: "The arcane rituals.", hint: "Secret.", tier: 3, difficulty: 3, synonyms: ["mysterious", "obscure", "esoteric"] },
    { word: "ARCHAIC", definition: "(adj.) Very old or old-fashioned.", sentence: "The language was archaic.", hint: "Ancient.", tier: 2, difficulty: 2, synonyms: ["ancient", "obsolete", "antiquated"] },
    { word: "ARCHETYPE", definition: "(n.) A very typical example of a certain person or thing.", sentence: "The archetype of the hero.", hint: "A model.", tier: 3, difficulty: 3, synonyms: ["prototype", "model", "paradigm"] },
    { word: "ARDENT", definition: "(adj.) Enthusiastic or passionate.", sentence: "An ardent supporter.", hint: "Passionate.", tier: 2, difficulty: 3, synonyms: ["passionate", "fervent", "zealous"] },
    { word: "ARDUOUS", definition: "(adj.) Involving or requiring strenuous effort; difficult and tiring.", sentence: "An arduous journey.", hint: "Difficult.", tier: 3, difficulty: 3, synonyms: ["grueling", "laborious", "strenuous"] },
    { word: "ARISTOCRATIC", definition: "(adj.) Having the qualities or characteristics associated with the noble or upper class.", sentence: "An aristocratic family.", hint: "Noble.", tier: 2, difficulty: 2, synonyms: ["noble", "patrician", "elite"] },
    { word: "ARTICULATE", definition: "(adj./v.) Having or showing the ability to speak fluently; to express clearly.", sentence: "She was very articulate.", hint: "Clear-spoken.", tier: 2, difficulty: 1, synonyms: ["eloquent", "expressive", "fluent"] },
    { word: "ARTIFACT", definition: "(n.) An object made by a human being, typically one of historical interest.", sentence: "Ancient artifacts.", hint: "A relic.", tier: 1, difficulty: 1, synonyms: ["relic", "object", "remnant"] },
    { word: "ARTIFICE", definition: "(n.) Clever or cunning devices or expedients.", sentence: "The artifice of the politician.", hint: "Deception.", tier: 3, difficulty: 4, synonyms: ["trickery", "deception", "cunning"] },
    { word: "ARTISAN", definition: "(n.) A worker in a skilled trade, especially one that involves making things.", sentence: "The artisan made the table.", hint: "A craftsman.", tier: 2, difficulty: 2, synonyms: ["craftsman", "maker", "tradesperson"] },
    { word: "ASCENDANCY", definition: "(n.) Occupation of a position of dominant power or influence.", sentence: "The ascendancy of the party.", hint: "Dominance.", tier: 3, difficulty: 4, synonyms: ["dominance", "supremacy", "power"] },
    { word: "ASCETIC", definition: "(adj./n.) Characterized by the practice of severe self-discipline.", sentence: "An ascetic lifestyle.", hint: "Self-denying.", tier: 3, difficulty: 4, synonyms: ["austere", "self-denying", "abstemious"] },
    { word: "ASPERSION", definition: "(n.) An attack on the reputation or integrity of someone.", sentence: "It is wrong to cast an aspersion on someone without proof.", hint: "A slur.", tier: 3, difficulty: 4, synonyms: ["slur", "slander", "smear"] },
    { word: "ASSIDUOUS", definition: "(adj.) Showing great care and perseverance.", sentence: "An assiduous student.", hint: "Diligent.", tier: 3, difficulty: 4, synonyms: ["diligent", "industrious", "meticulous"] },
    { word: "SPECIOUS", definition: "(adj.) Superficially plausible, but actually wrong.", sentence: "A specious argument.", hint: "Misleading.", tier: 3, difficulty: 4, synonyms: ["misleading", "deceptive", "plausible"] },
    { word: "SPURIOUS", definition: "(adj.) Not being what it purports to be; false or fake.", sentence: "Spurious claims.", hint: "False.", tier: 3, difficulty: 3, synonyms: ["false", "fake", "counterfeit"] },
    { word: "SQUANDER", definition: "(v.) To waste in a reckless and foolish manner.", sentence: "It is foolish to squander your savings on things you do not need.", hint: "To waste.", tier: 2, difficulty: 2, synonyms: ["waste", "fritter", "misuse"] },
    { word: "STAGNANT", definition: "(adj.) Having no current or flow and often smelling unpleasant.", sentence: "A stagnant ditch.", hint: "Not moving.", tier: 2, difficulty: 2, synonyms: ["still", "motionless", "stale"] },
    { word: "SUBSTANTIATE", definition: "(v.) To provide evidence to support or prove the truth of.", sentence: "Substantiate the claim.", hint: "To prove.", tier: 3, difficulty: 3, synonyms: ["verify", "confirm", "prove"] },
    { word: "SUBTLE", definition: "(adj.) So delicate or precise as to be difficult to analyze.", sentence: "Subtle meanings.", hint: "Hard to detect.", tier: 1, difficulty: 1, synonyms: ["delicate", "nuanced", "understated"] },
    { word: "SUPERCILIOUS", definition: "(adj.) Having an air of condescending disdain; acting as though others are beneath one's notice.", sentence: "A supercilious lady.", hint: "Arrogant.", tier: 3, difficulty: 4, synonyms: ["arrogant", "condescending", "haughty"] },
    { word: "SUPERFLUOUS", definition: "(adj.) Unnecessary, especially through being more than enough.", sentence: "Superfluous information.", hint: "Extra.", tier: 2, difficulty: 3, synonyms: ["excess", "redundant", "unnecessary"] },
    { word: "SURREPTITIOUS", definition: "(adj.) Kept secret, especially because it would not be approved of.", sentence: "She took a surreptitious glance at the answers.", hint: "Secret.", tier: 3, difficulty: 4, synonyms: ["covert", "stealthy", "secretive"] },
    { word: "SYCOPHANT", definition: "(n.) A person who acts obsequiously toward someone important.", sentence: "A sycophant is a flatterer.", hint: "Flatterer.", tier: 3, difficulty: 4, synonyms: ["flatterer", "toady", "yes-man"] },
    { word: "TACITURN", definition: "(adj.) (Of a person) reserved or uncommunicative in speech.", sentence: "Taciturn and morose.", hint: "Quiet.", tier: 3, difficulty: 4, synonyms: ["reserved", "reticent", "uncommunicative"] },
    { word: "TANGIBLE", definition: "(adj.) Perceptible by touch.", sentence: "The mood was tangible.", hint: "Touchable.", tier: 1, difficulty: 2, synonyms: ["concrete", "palpable", "real"] },
    { word: "TANTAMOUNT", definition: "(adj.) Equivalent in seriousness to; virtually the same as.", sentence: "Tantamount to an admission.", hint: "Equivalent.", tier: 3, difficulty: 4, synonyms: ["equivalent", "equal", "comparable"] },
    { word: "TEMERITY", definition: "(n.) Excessive confidence or audacity.", sentence: "The temerity to question.", hint: "Boldness.", tier: 3, difficulty: 4, synonyms: ["audacity", "boldness", "recklessness"] },
    { word: "TENACIOUS", definition: "(adj.) Tending to keep a firm hold of something; clinging or adhering closely.", sentence: "A tenacious grip.", hint: "Stubborn.", tier: 2, difficulty: 2, synonyms: ["persistent", "stubborn", "determined"] },
    { word: "TENUOUS", definition: "(adj.) Very weak or slight.", sentence: "A tenuous connection.", hint: "Weak.", tier: 2, difficulty: 3, synonyms: ["weak", "fragile", "thin"] },
    { word: "TRACTABLE", definition: "(adj.) (Of a person or animal) easy to control or influence.", sentence: "Tractable dogs.", hint: "Obedient.", tier: 3, difficulty: 4, synonyms: ["obedient", "manageable", "docile"] },
    { word: "TREMULOUS", definition: "(adj.) Shaking or quivering slightly.", sentence: "His voice was tremulous.", hint: "Trembling.", tier: 3, difficulty: 4, synonyms: ["trembling", "quivering", "shaky"] },
    { word: "TREPIDATION", definition: "(n.) A feeling of fear or agitation about something that may happen.", sentence: "Fear and trepidation.", hint: "Fear.", tier: 2, difficulty: 3, synonyms: ["anxiety", "dread", "nervousness"] },
    { word: "TRUCULENT", definition: "(adj.) Eager or quick to argue or fight; aggressively defiant.", sentence: "A truculent attitude.", hint: "Aggressive.", tier: 3, difficulty: 5, synonyms: ["aggressive", "belligerent", "combative"] },
    { word: "UBIQUITOUS", definition: "(adj.) Present, appearing, or found everywhere.", sentence: "Ubiquitous influence.", hint: "Omnipresent.", tier: 2, difficulty: 3, synonyms: ["omnipresent", "pervasive", "widespread"] },
    { word: "UNPRECEDENTED", definition: "(adj.) Never done or known before.", sentence: "An unprecedented step.", hint: "Never seen before.", tier: 2, difficulty: 2, synonyms: ["unparalleled", "novel", "unheard-of"] },
    { word: "URBANE", definition: "(adj.) (Of a person) suave, courteous, and refined in manner.", sentence: "An urbane man.", hint: "Polite.", tier: 2, difficulty: 5, synonyms: ["sophisticated", "suave", "refined"] },
    { word: "UTILITARIAN", definition: "(adj.) Designed to be useful or practical rather than attractive.", sentence: "A utilitarian building.", hint: "Practical.", tier: 2, difficulty: 3, synonyms: ["practical", "functional", "pragmatic"] },
    { word: "VACILLATE", definition: "(v.) To alternate or waver between different opinions or actions.", sentence: "She tends to vacillate between two choices when she is nervous.", hint: "To waver.", tier: 3, difficulty: 5, synonyms: ["waver", "hesitate", "fluctuate"] },
    { word: "VENERABLE", definition: "(adj.) Accorded a great deal of respect, especially because of age.", sentence: "A venerable institution.", hint: "Respected.", tier: 2, difficulty: 3, synonyms: ["respected", "esteemed", "revered"] },
    { word: "VENERATE", definition: "(v.) To regard with great respect; revere.", sentence: "Many people venerate those who sacrifice for others.", hint: "To honor.", tier: 2, difficulty: 3, synonyms: ["revere", "honor", "esteem"] },
    { word: "VERACITY", definition: "(n.) Conformity to facts; accuracy.", sentence: "Doubts about his veracity.", hint: "Truthfulness.", tier: 2, difficulty: 3, synonyms: ["truthfulness", "accuracy", "honesty"] },
    { word: "VERBOSITY", definition: "(n.) The quality of using more words than needed.", sentence: "A reputation for verbosity.", hint: "Wordiness.", tier: 2, difficulty: 5, synonyms: ["wordiness", "prolixity", "loquacity"] },
    { word: "VESTIGE", definition: "(n.) A trace of something that is disappearing or no longer exists.", sentence: "The old fort is a vestige of the town's early history.", hint: "A trace.", tier: 2, difficulty: 5, synonyms: ["trace", "remnant", "relic"] },
    { word: "VINDICATE", definition: "(v.) To clear (someone) of blame or suspicion.", sentence: "New evidence may vindicate the accused student.", hint: "To clear.", tier: 2, difficulty: 2, synonyms: ["exonerate", "clear", "justify"] },
    { word: "VIRTUOSO", definition: "(n.) A person highly skilled in music or another artistic pursuit.", sentence: "A clarinet virtuoso.", hint: "Skilled artist.", tier: 2, difficulty: 2, synonyms: ["maestro", "expert", "prodigy"] },
    { word: "VOCIFEROUS", definition: "(adj.) (Especially of a person or speech) vehement or clamorous.", sentence: "A vociferous opponent.", hint: "Loud.", tier: 3, difficulty: 5, synonyms: ["loud", "clamorous", "vehement"] },
    { word: "VOLATILE", definition: "(adj.) (Of a substance) easily evaporated at normal temperatures; liable to change rapidly.", sentence: "A volatile situation.", hint: "Unstable.", tier: 2, difficulty: 2, synonyms: ["unstable", "erratic", "explosive"] },
    { word: "VOLUNTEER", definition: "(n./v.) A person who freely offers to take part in an enterprise; to offer freely.", sentence: "A local volunteer.", hint: "Offers freely.", tier: 1, difficulty: 1, synonyms: ["offer", "donate", "contribute"] },
    { word: "WARY", definition: "(adj.) Feeling or showing caution about possible dangers or problems.", sentence: "She was wary.", hint: "Cautious.", tier: 1, difficulty: 1, synonyms: ["cautious", "guarded", "vigilant"] },
    { word: "WAVER", definition: "(v.) To be undecided between two opinions or courses of action.", sentence: "A good leader does not waver under pressure.", hint: "To hesitate.", tier: 2, difficulty: 2, synonyms: ["hesitate", "falter", "vacillate"] },
    { word: "WHIMSICAL", definition: "(adj.) Playfully quaint or fanciful, especially in an appealing and amusing way.", sentence: "A whimsical sense of humor.", hint: "Fanciful.", tier: 2, difficulty: 2, synonyms: ["fanciful", "playful", "quirky"] },
    { word: "ZEALOUS", definition: "(adj.) Showing great energy or enthusiasm.", sentence: "An extremely zealous council.", hint: "Enthusiastic.", tier: 2, difficulty: 2, synonyms: ["fervent", "passionate", "enthusiastic"] },
    { word: "ZENITH", definition: "(n.) The time at which something is most powerful or successful.", sentence: "The empire reached its zenith.", hint: "Highest point.", tier: 2, difficulty: 2, synonyms: ["peak", "apex", "pinnacle"] },
    { word: "APLOMB", definition: "(n.) Self-confidence or assurance, especially when in a demanding situation.", sentence: "He passed the test with aplomb.", hint: "Self-assurance.", tier: 3, difficulty: 5, synonyms: ["poise", "confidence", "composure"] },
    { word: "BELLWETHER", definition: "(n.) The leading sheep of a flock; an indicator or predictor of trends.", sentence: "The stock is a bellwether for the economy.", hint: "Trend-setter.", tier: 3, difficulty: 5, synonyms: ["indicator", "trendsetter", "predictor"] },
    { word: "CAVIL", definition: "(v.) Make petty or unnecessary objections.", sentence: "Critics will cavil about even the smallest details.", hint: "Grumble over trifles.", tier: 3, difficulty: 5, synonyms: ["nitpick", "quibble", "gripe"] },
    { word: "DESICCATE", definition: "(v.) Remove the moisture from (something, typically food).", sentence: "Extreme heat can desiccate the soil in a matter of days.", hint: "To dry out.", tier: 3, difficulty: 5, synonyms: ["dry", "parch", "dehydrate"] },
    { word: "EFFERVESCENT", definition: "(adj.) (Of a liquid) giving off bubbles; vivacious and enthusiastic.", sentence: "She had an effervescent personality.", hint: "Bubbly.", tier: 2, difficulty: 3, synonyms: ["bubbly", "vivacious", "sparkling"] },
    { word: "FULMINATE", definition: "(v.) Express vehement protest.", sentence: "Citizens often fulminate against unfair rules.", hint: "To protest loudly.", tier: 3, difficulty: 5, synonyms: ["protest", "rage", "denounce"] },
    { word: "GOSSAMER", definition: "(adj./n.) Used to refer to something very light, thin, and insubstantial; a fine substance.", sentence: "A gossamer veil of mist.", hint: "Delicate or flimsy.", tier: 3, difficulty: 5, synonyms: ["delicate", "filmy", "ethereal"] },
    { word: "HUBRIS", definition: "(n.) Excessive pride or self-confidence.", sentence: "They fell due to their own hubris.", hint: "Arrogance.", tier: 2, difficulty: 3, synonyms: ["arrogance", "conceit", "pride"] },
    { word: "INCULCATE", definition: "(v.) Instill (an attitude, idea, or habit) by persistent instruction.", sentence: "To inculcate values in children.", hint: "To instill.", tier: 3, difficulty: 5, synonyms: ["instill", "implant", "teach"] },
    { word: "JEJUNE", definition: "(adj.) Naive, simplistic, and superficial.", sentence: "Their jejune remarks were ignored.", hint: "Childish.", tier: 3, difficulty: 5, synonyms: ["naive", "simplistic", "immature"] },
    { word: "KNELL", definition: "(n.) The sound of a bell, especially when rung solemnly for a death or funeral.", sentence: "The knell of the church bell.", hint: "A death sound.", tier: 3, difficulty: 5, synonyms: ["toll", "peal", "chime"] },
    { word: "LASSITUDE", definition: "(n.) A state of physical or mental weariness; lack of energy.", sentence: "Overcome by lassitude.", hint: "Weariness.", tier: 3, difficulty: 5, synonyms: ["weariness", "fatigue", "lethargy"] },
    { word: "MELLIFLUOUS", definition: "(adj.) (Of a voice or words) sweet or musical; pleasant to hear.", sentence: "Her mellifluous voice.", hint: "Smooth-sounding.", tier: 3, difficulty: 5, synonyms: ["melodious", "smooth", "dulcet"] },
    { word: "NOXIOUS", definition: "(adj.) Harmful, poisonous, or very unpleasant.", sentence: "Noxious fumes from the factory.", hint: "Harmful.", tier: 2, difficulty: 3, synonyms: ["harmful", "toxic", "poisonous"] },
    { word: "OPPROBRIUM", definition: "(n.) Harsh criticism or censure.", sentence: "The move brought public opprobrium.", hint: "Shame or disgrace.", tier: 3, difficulty: 5, synonyms: ["disgrace", "shame", "infamy"] },
    { word: "PANACEA", definition: "(n.) A solution or remedy for all difficulties or diseases.", sentence: "There is no panacea for the problem.", hint: "A cure-all.", tier: 2, difficulty: 3, synonyms: ["cure-all", "remedy", "solution"] },
    { word: "QUAGMIRE", definition: "(n.) A soft boggy area of land; an awkward, complex, or hazardous situation.", sentence: "Stuck in a legal quagmire.", hint: "A predicament.", tier: 2, difficulty: 3, synonyms: ["predicament", "bog", "morass"] },
    { word: "REDOUBTABLE", definition: "(adj.) (Of a person) formidable, especially as an opponent.", sentence: "A redoubtable foe.", hint: "Formidable.", tier: 3, difficulty: 5, synonyms: ["formidable", "fearsome", "imposing"] },
    { word: "SALUBRIOUS", definition: "(adj.) Health-giving; healthy.", sentence: "A salubrious climate.", hint: "Healthy.", tier: 3, difficulty: 5, synonyms: ["healthy", "wholesome", "beneficial"] },
    { word: "UMBER", definition: "(n./adj.) A natural pigment resembling ochre; a dark brown color.", sentence: "The walls were painted umber.", hint: "Dark brown color.", tier: 3, difficulty: 5, synonyms: ["brown", "ochre", "tan"] },
    { word: "VICISSITUDE", definition: "(n.) A change of circumstances or fortune, typically one that is unwelcome.", sentence: "The vicissitudes of life.", hint: "A change of fortune.", tier: 3, difficulty: 5, synonyms: ["change", "fluctuation", "upheaval"] },
    { word: "WHEEDLE", definition: "(v.) Use flattery or coaxing in order to persuade someone to do something.", sentence: "He wheedled her into agreeing.", hint: "To coax.", tier: 2, difficulty: 5, synonyms: ["coax", "cajole", "persuade"] },
    { word: "XENOPHOBIA", definition: "(n.) Dislike of or prejudice against people from other countries.", sentence: "The rise of xenophobia.", hint: "Fear of strangers.", tier: 3, difficulty: 2, synonyms: ["bigotry", "intolerance", "prejudice"] },
    { word: "YOKE", definition: "(n./v.) A wooden crosspiece that is fastened over the necks of two animals; to join.", sentence: "The oxen were joined by a yoke.", hint: "A harness.", tier: 3, difficulty: 3, synonyms: ["harness", "bond", "link"] },
    { word: "ZEPHYR", definition: "(n.) A soft gentle breeze.", sentence: "A cool zephyr blew through.", hint: "A light breeze.", tier: 2, difficulty: 5, synonyms: ["breeze", "wind", "draft"] },
    { word: "UNDERMINE", definition: "(v.) To weaken gradually or secretly; damage.", tier: 1, difficulty: 1, synonyms: ["weaken", "sabotage", "erode"] },
    { word: "PREVALENT", definition: "(adj.) Widespread; commonly occurring.", tier: 1, difficulty: 2, synonyms: ["widespread", "common", "rampant"] },
    { word: "VIABLE", definition: "(adj.) Capable of working successfully; feasible.", tier: 1, difficulty: 1, synonyms: ["feasible", "workable", "practical"] },
    { word: "NOTEWORTHY", definition: "(adj.) Interesting or significant; unusual.", tier: 1, difficulty: 2, synonyms: ["significant", "remarkable", "notable"] },
    { word: "VALIDATE", definition: "(v.) Confirm accuracy or truth.", tier: 1, difficulty: 1, synonyms: ["confirm", "verify", "authenticate"] },
    { word: "DISCREPANCY", definition: "(n.) A difference between things that should be the same.", tier: 1, difficulty: 2, synonyms: ["inconsistency", "difference", "gap"] },
    { word: "PROLIFERATION", definition: "(n.) A rapid increase in number; spreading.", tier: 1, difficulty: 3, synonyms: ["increase", "spread", "expansion"] },
    { word: "COMPENSATE", definition: "(v.) Make up for something; payment.", tier: 1, difficulty: 2, synonyms: ["reimburse", "offset", "recompense"] },
    { word: "EVIDENT", definition: "(adj.) Clear and obvious; plain to see.", tier: 1, difficulty: 1, synonyms: ["obvious", "clear", "apparent"] },
    { word: "INTRICATE", definition: "(adj.) Very complicated or detailed.", tier: 1, difficulty: 2, synonyms: ["complex", "elaborate", "involved"] },
    { word: "APPLICABLE", definition: "(adj.) Relevant or appropriate to a situation.", tier: 1, difficulty: 1, synonyms: ["relevant", "suitable", "pertinent"] },
    { word: "IRRELEVANT", definition: "(adj.) Not connected with or relevant to something.", tier: 1, difficulty: 1, synonyms: ["unrelated", "immaterial", "beside-the-point"] },
    { word: "ATTRITION", definition: "(n.) A gradual reduction in strength or number.", tier: 1, difficulty: 3, synonyms: ["erosion", "reduction", "depletion"] },
    { word: "ROBUST", definition: "(adj.) Strong and healthy; vigorous.", tier: 1, difficulty: 1, synonyms: ["sturdy", "strong", "vigorous"] },
    { word: "OVERSHADOW", definition: "(v.) Tower above and cast a shadow over; dominate by importance.", tier: 1, difficulty: 2, synonyms: ["eclipse", "dominate", "outshine"] },
    { word: "EXCEPTIONAL", definition: "(adj.) Unusually good; outstanding.", tier: 1, difficulty: 1, synonyms: ["outstanding", "remarkable", "extraordinary"] },
    { word: "SUCCESSION", definition: "(n.) A number of people or things sharing a specified characteristic and following one after another.", tier: 1, difficulty: 2, synonyms: ["sequence", "series", "progression"] },
    { word: "EMERGE", definition: "(v.) Become apparent, important, or prominent.", tier: 1, difficulty: 1, synonyms: ["appear", "surface", "arise"] },
    { word: "COINCIDE", definition: "(v.) Occur at or during the same time.", tier: 1, difficulty: 2, synonyms: ["align", "overlap", "correspond"] },
    { word: "COMBINE", definition: "(v./n.) Join or merge to form a single unit.", tier: 1, difficulty: 1, synonyms: ["merge", "unite", "blend"] },
    { word: "CELEBRATE", definition: "(v.) Acknowledge (a significant day or event) with a social gathering.", tier: 1, difficulty: 1, synonyms: ["honor", "commemorate", "observe"] },
    { word: "EMBRACE", definition: "(v./n.) Hold (someone) closely in one's arms; accept or support (a belief or theory).", tier: 1, difficulty: 1, synonyms: ["accept", "adopt", "welcome"] },
    { word: "RELIABLE", definition: "(adj.) Consistently good in quality or performance; able to be trusted.", tier: 1, difficulty: 1, synonyms: ["dependable", "trustworthy", "consistent"] },
    { word: "CONSIDERABLE", definition: "(adj.) Notably large in size, amount, or extent.", tier: 1, difficulty: 1, synonyms: ["substantial", "significant", "large"] },
    { word: "CAPABLE", definition: "(adj.) Having the ability, fitness, or quality necessary to do or achieve a specified thing.", tier: 1, difficulty: 1, synonyms: ["able", "competent", "skilled"] },
    { word: "DEBATABLE", definition: "(adj.) Open to discussion or argument.", tier: 1, difficulty: 2, synonyms: ["controversial", "disputable", "arguable"] },
    { word: "ASSOCIATE", definition: "(v./n./adj.) Connect (someone or something) with something else in one's mind.", tier: 1, difficulty: 1, synonyms: ["connect", "link", "affiliate"] },
    { word: "DENOTE", definition: "(v.) Be a sign of; indicate.", tier: 1, difficulty: 2, synonyms: ["signify", "indicate", "mean"] },
    { word: "VIBRANT", definition: "(adj.) Full of energy and life.", tier: 1, difficulty: 1, synonyms: ["lively", "energetic", "vivid"] },
    { word: "UTILIZE", definition: "(v.) Make practical and effective use of.", tier: 1, difficulty: 2, synonyms: ["use", "employ", "apply"] },
    { word: "IMPLICATION", definition: "(n.) The conclusion that can be drawn from something although it is not explicitly stated.", tier: 1, difficulty: 2, synonyms: ["inference", "suggestion", "meaning"] },
    { word: "PERCEIVE", definition: "(v.) Become aware or conscious of (something); come to realize or understand.", tier: 1, difficulty: 2, synonyms: ["notice", "observe", "recognize"] },
    { word: "RIGOROUS", definition: "(adj.) Extremely thorough, exhaustive, or accurate.", tier: 1, difficulty: 2, synonyms: ["thorough", "strict", "demanding"] },
    { word: "SEQUEL", definition: "(n.) A published, broadcast, or recorded work that continues the story or develops the theme of an earlier one.", tier: 1, difficulty: 1, synonyms: ["continuation", "follow-up", "installment"] },
    { word: "COHERENT", definition: "(adj.) (Of an argument, theory, or policy) logical and consistent.", tier: 1, difficulty: 2, synonyms: ["logical", "consistent", "rational"] },
    { word: "PASTEL", definition: "(n./adj.) Pale and soft in color", tier: 2, difficulty: 2, synonyms: ["pale", "soft", "muted"] },
    { word: "AFFILIATED", definition: "(adj./v.) Officially attached or connected to a group", tier: 2, difficulty: 2, synonyms: ["connected", "associated", "linked"] },
    { word: "ICONOGRAPHY", definition: "(n.) Visual images and symbols used in a work", tier: 2, difficulty: 5, synonyms: ["imagery", "symbolism", "iconology"] },
    { word: "CYPRESS", definition: "(n.) An evergreen coniferous tree", tier: 2, difficulty: 3, synonyms: ["conifer", "evergreen", "tree"] },
    { word: "DESIGNATION", definition: "(n.) The choosing of someone for a position", tier: 2, difficulty: 2, synonyms: ["title", "label", "appointment"] },
    { word: "OUTCOMPETE", definition: "(v.) Surpass in a competitive situation", tier: 2, difficulty: 3, synonyms: ["surpass", "outdo", "outperform"] },
    { word: "FINCH", definition: "(n.) A seed-eating songbird", tier: 2, difficulty: 3, synonyms: ["bird", "songbird", "sparrow"] },
    { word: "PROPAGATION", definition: "(n.) The action of widely spreading an idea", tier: 2, difficulty: 5, synonyms: ["spread", "dissemination", "distribution"] },
    { word: "PROJECTED", definition: "(v./adj.) Estimated or forecast on basis of trends", tier: 2, difficulty: 2, synonyms: ["estimated", "forecast", "anticipated"] },
    { word: "WHARVES", definition: "(n.) Level quayside areas to which ships move", tier: 2, difficulty: 5, synonyms: ["docks", "piers", "quays"] },
    { word: "HARDENING", definition: "(v./n./adj.) Become or make more rigid or fixed", tier: 2, difficulty: 2, synonyms: ["solidifying", "stiffening", "fortifying"] },
    { word: "UNSUSTAINABLE", definition: "(adj.) Not able to be maintained at the current rate", tier: 2, difficulty: 2, synonyms: ["untenable", "unviable", "unworkable"] },
    { word: "ASSEMBLING", definition: "(v./n.) Bringing together or gathering people or things into one place", tier: 2, difficulty: 2, synonyms: ["gathering", "collecting", "convening"] },
    { word: "GRUDGINGLY", definition: "(adv.) In a reluctant or resentful manner", tier: 2, difficulty: 3, synonyms: ["reluctantly", "unwillingly", "resentfully"] },
    { word: "SPORADICALLY", definition: "(adv.) Occasionally or at irregular intervals", tier: 2, difficulty: 4, synonyms: ["occasionally", "intermittently", "erratically"] },
    { word: "UNFAILINGLY", definition: "(adv.) In a way that is constant and reliable", tier: 2, difficulty: 4, synonyms: ["consistently", "reliably", "invariably"] },
    { word: "SELF-SERVINGLY", definition: "(adv.) Having concern for one's own welfare", tier: 2, difficulty: 5, synonyms: ["selfishly", "exploitatively", "greedily"] },
    { word: "DEMOGRAPHIC", definition: "(adj.) Relating to the structure of populations", tier: 2, difficulty: 4, synonyms: ["statistical", "population-based", "social"] },
    { word: "INITIATION", definition: "(n.) Action of beginning something", tier: 2, difficulty: 2, synonyms: ["beginning", "commencement", "launch"] },
    { word: "INTENTION", definition: "(n.) A plan or goal one has in mind; a purpose or aim.", tier: 2, difficulty: 1, synonyms: ["aim", "purpose", "goal"] },
    { word: "ACCEPTANCE", definition: "(n.) Action of consenting to receive or undertake", tier: 2, difficulty: 1, synonyms: ["approval", "agreement", "consent"] },
    { word: "BARRICADE", definition: "(n./v.) A hastily built obstruction used to block or defend a passage.", tier: 2, difficulty: 2, synonyms: ["barrier", "blockade", "obstruction"] },
    { word: "BOORISH", definition: "(adj.) Rough and bad-mannered; coarse", tier: 2, difficulty: 5, synonyms: ["rude", "crude", "uncouth"] },
    { word: "SATIRIZE", definition: "(v.) Deride or criticize using humor, irony, or exaggeration.", tier: 2, difficulty: 4, synonyms: ["mock", "parody", "lampoon"] },
    { word: "SOPHIST", definition: "(n.) Person who reasons with clever but fallacious arguments", tier: 2, difficulty: 5, synonyms: ["deceiver", "quibbler", "rhetorician"] },
    { word: "STRANGELY", definition: "(adv.) In an unusual or surprising way", tier: 2, difficulty: 1, synonyms: ["oddly", "curiously", "unusually"] },
    { word: "SKEPTICALLY", definition: "(adv.) With doubt or suspicion; unwilling to accept claims without evidence.", tier: 2, difficulty: 4, synonyms: ["doubtfully", "dubiously", "suspiciously"] },
    { word: "COLLAPSE", definition: "(v./n.) Fall down or give way", tier: 2, difficulty: 1, synonyms: ["fall", "cave", "crumble"] },
    { word: "CARVE", definition: "(v.) Cut into a hard material to produce an object", tier: 2, difficulty: 1, synonyms: ["sculpt", "engrave", "cut"] },
    { word: "BULK", definition: "(n./adj./verb) The mass or magnitude of something large", speakAs: "bulk", tier: 2, difficulty: 1, synonyms: ["mass", "volume", "magnitude"] },
    { word: "AWE", definition: "(n./v.) Feeling of reverential respect mixed with fear", tier: 2, difficulty: 1, synonyms: ["wonder", "reverence", "amazement"] },
    { word: "SACRED", definition: "(adj.) Connected with God or dedicated to a religious purpose", tier: 2, difficulty: 1, synonyms: ["holy", "divine", "revered"] },
    { word: "INVENT", definition: "(v.) Create or design something that did not exist before", tier: 2, difficulty: 1, synonyms: ["create", "devise", "innovate"] },
    { word: "PRESCIENT", definition: "(adj.) Having or showing knowledge of events before they take place.", tier: 3, difficulty: 5, synonyms: ["prophetic", "clairvoyant", "farsighted"] },
    { word: "SURREPTITIOUSLY", definition: "(adv.) In a way that attempts to avoid notice or attention; secretively.", tier: 3, difficulty: 5, synonyms: ["secretly", "covertly", "stealthily"] },
    { word: "ENGENDER", definition: "(v.) Cause or give rise to (a feeling, situation, or condition).", tier: 3, difficulty: 5, synonyms: ["cause", "generate", "produce"] },
    { word: "ATTENUATE", definition: "(v.) Reduce the force, effect, or value of.", tier: 3, difficulty: 5, synonyms: ["weaken", "reduce", "diminish"] },
    { word: "PREEMPT", definition: "(v.) Take action in order to prevent (an anticipated event) from happening; forestall.", tier: 3, difficulty: 4, synonyms: ["forestall", "prevent", "anticipate"] },
    { word: "SUBSUME", definition: "(v.) Include or absorb (something) in something else.", tier: 3, difficulty: 5, synonyms: ["incorporate", "absorb", "include"] },
    { word: "DISINGENUOUSLY", definition: "(adv.) In a way that is not candid or sincere, typically by pretending that one knows less about something than one really does.", tier: 3, difficulty: 5, synonyms: ["dishonestly", "insincerely", "deceptively"] },
    { word: "DISPASSIONATELY", definition: "(adv.) In a way that is not influenced by strong emotion, and so is able to be rational and impartial.", tier: 3, difficulty: 5, synonyms: ["objectively", "impartially", "coolly"] },
    { word: "ICONOCLASTIC", definition: "(adj.) Characterized by attack on cherished beliefs or institutions.", tier: 3, difficulty: 5, synonyms: ["rebellious", "radical", "heretical"] },

    { word: "LUDICROUS", definition: "(adj.) So foolish, unreasonable, or out of place as to be amusing; ridiculous.", tier: 3, difficulty: 2, synonyms: ["absurd", "ridiculous", "preposterous"] },
    { word: "ANOMALOUS", definition: "(adj.) Deviating from what is standard, normal, or expected.", tier: 3, difficulty: 4, synonyms: ["irregular", "abnormal", "atypical"] },
    { word: "PARADOXICAL", definition: "(adj.) Seemingly absurd or self-contradictory.", tier: 3, difficulty: 4, synonyms: ["contradictory", "self-opposing", "ironic"] },
    { word: "INCONGRUOUS", definition: "(adj.) Not in harmony or keeping with the surroundings or other aspects of something.", tier: 3, difficulty: 5, synonyms: ["inappropriate", "inconsistent", "out-of-place"] },
    { word: "ABERRANT", definition: "(adj.) Departing from an accepted standard.", tier: 3, difficulty: 5, synonyms: ["deviant", "abnormal", "atypical"] },
    { word: "ANTITHETICAL", definition: "(adj.) Directly opposed or contrasted; mutually incompatible.", tier: 3, difficulty: 5, synonyms: ["opposed", "contrary", "contradictory"] },
    { word: "DISCORDANT", definition: "(adj.) Disagreeing or incongruous.", tier: 3, difficulty: 5, synonyms: ["clashing", "jarring", "conflicting"] },
    { word: "DUBIOUS", definition: "(adj.) Hesitating or doubting.", tier: 3, difficulty: 2, synonyms: ["doubtful", "questionable", "uncertain"] },
    { word: "PROPHETIC", definition: "(adj.) Accurately describing or predicting what will happen in the future.", tier: 3, difficulty: 4, synonyms: ["predictive", "visionary", "oracular"] },
    { word: "VISIONARY", definition: "(adj./n.) (Especially of a person) thinking about or planning the future with imagination or wisdom.", tier: 3, difficulty: 2, synonyms: ["farsighted", "imaginative", "idealistic"] },
    { word: "RETROSPECTIVE", definition: "(adj./n.) Looking back on or dealing with past events or situations.", tier: 3, difficulty: 4, synonyms: ["backward-looking", "reflective", "historical"] },
    { word: "IMMINENT", definition: "(adj.) About to happen.", tier: 3, difficulty: 2, synonyms: ["impending", "approaching", "looming"] },
    { word: "COGENT", definition: "(adj.) (Of an argument or case) clear, logical, and convincing.", tier: 3, difficulty: 5, synonyms: ["convincing", "compelling", "persuasive"] },
    { word: "NEBULOUS", definition: "(adj.) Unclear, vague, or lacking definite form.", tier: 3, difficulty: 5, synonyms: ["vague", "hazy", "unclear"] },
    { word: "CATALYZE", definition: "(v.) Cause or accelerate a process or reaction.", tier: 3, difficulty: 4, synonyms: ["accelerate", "trigger", "stimulate"] },
    { word: "ELICIT", definition: "(v.) Evoke or draw out (a response, answer, or fact) from someone in reaction to one's own actions or questions.", tier: 3, difficulty: 4, synonyms: ["evoke", "draw out", "extract"] },
    { word: "PROPAGATE", definition: "(v.) Spread and promote (an idea, theory, etc.) widely.", tier: 3, difficulty: 4, synonyms: ["spread", "disseminate", "broadcast"] },
    { word: "PERPETUATE", definition: "(v.) Make (something, typically an undesirable situation or an unfounded belief) continue indefinitely.", tier: 3, difficulty: 4, synonyms: ["maintain", "sustain", "prolong"] },
    { word: "INSTIGATE", definition: "(v.) Bring about or initiate (an action or event).", tier: 3, difficulty: 4, synonyms: ["provoke", "incite", "initiate"] },
    { word: "AMPLIFY", definition: "(v.) Cause to become more marked or intense.", tier: 3, difficulty: 2, synonyms: ["increase", "boost", "enlarge"] },
    { word: "FORESTALL", definition: "(v.) Prevent or obstruct (an anticipated event or action) by taking action ahead of time.", tier: 3, difficulty: 5, synonyms: ["prevent", "thwart", "preempt"] },
    { word: "OBVIATE", definition: "(v.) Remove (a need or difficulty).", tier: 3, difficulty: 5, synonyms: ["eliminate", "prevent", "remove"] },
    { word: "COUNTERACT", definition: "(v.) Act against (something) in order to reduce its force or neutralize it.", tier: 3, difficulty: 2, synonyms: ["neutralize", "offset", "oppose"] },
    { word: "STYMIE", definition: "(v.) Prevent or hinder the progress of.", tier: 3, difficulty: 5, synonyms: ["hinder", "obstruct", "impede"] },
    { word: "COMPOUND", definition: "(n./adj./v.) Make (something bad) worse; intensify the negative aspects of.", tier: 3, difficulty: 2, synonyms: ["worsen", "intensify", "aggravate"] },
    { word: "INTENSIFY", definition: "(v.) To increase in strength, force, or degree.", tier: 3, difficulty: 1, synonyms: ["heighten", "escalate", "amplify"] },
    { word: "IMPEDE", definition: "(v.) Delay or prevent (someone or something) by obstructing them; hinder.", tier: 3, difficulty: 4, synonyms: ["obstruct", "hinder", "block"] },
    { word: "THWART", definition: "(v.) Prevent (someone) from accomplishing something.", tier: 3, difficulty: 4, synonyms: ["foil", "frustrate", "obstruct"] },
    { word: "ENCOMPASS", definition: "(v.) Surround and have or hold within.", tier: 3, difficulty: 2, synonyms: ["include", "contain", "embrace"] },
    { word: "ENTAIL", definition: "(v.) Involve (something) as a necessary or inevitable part or consequence.", tier: 3, difficulty: 2, synonyms: ["involve", "require", "necessitate"] },
    { word: "PARALLEL", definition: "(adj./n./v.) (Of lines, planes, surfaces, or objects) side by side and having the same distance continuously between them.", tier: 3, difficulty: 1, synonyms: ["comparable", "corresponding", "analogous"] },
    { word: "TRANSCEND", definition: "(v.) Be or go beyond the range or limits of (typically something abstract, typically a conceptual field or division).", tier: 3, difficulty: 4, synonyms: ["surpass", "exceed", "rise above"] },
    { word: "CONTRADICT", definition: "(v.) Deny the truth of (a statement), especially by asserting the opposite.", tier: 3, difficulty: 2, synonyms: ["deny", "oppose", "negate"] },
    { word: "FURTIVELY", definition: "(adv.) In a way that attempts to avoid notice or attention; secretively.", tier: 3, difficulty: 5, synonyms: ["secretly", "covertly", "stealthily"] },
    { word: "CLANDESTINELY", definition: "(adv.) Kept secret or done secretively, especially because illicit.", tier: 3, difficulty: 5, synonyms: ["secretly", "covertly", "surreptitiously"] },
    { word: "COVERTLY", definition: "(adv.) Without being openly acknowledged or displayed; secretly.", tier: 3, difficulty: 4, synonyms: ["secretly", "discreetly", "stealthily"] },
    { word: "STEALTHILY", definition: "(adv.) In a cautious and surreptitious manner, so as not to be seen or heard.", tier: 3, difficulty: 4, synonyms: ["quietly", "furtively", "covertly"] },
    { word: "SLYLY", definition: "(adv.) In a cunning and deceitful or manipulative manner.", tier: 3, difficulty: 4, synonyms: ["cunningly", "craftily", "deviously"] },
    { word: "UNOBTRUSIVELY", definition: "(adv.) In a way that is not conspicuous or does not attract attention.", tier: 3, difficulty: 5, synonyms: ["quietly", "discreetly", "inconspicuously"] },
    { word: "CIRCUMSPECTLY", definition: "(adv.) In a way that is wary and unwilling to take risks.", tier: 3, difficulty: 5, synonyms: ["cautiously", "carefully", "prudently"] },
    { word: "DUPLICITOUSLY", definition: "(adv.) In a deceitful way; double-dealing.", tier: 3, difficulty: 5, synonyms: ["deceitfully", "treacherously", "dishonestly"] },
    { word: "MENDACIOUSLY", definition: "(adv.) In a way that tells lies; untruthfully.", tier: 3, difficulty: 5, synonyms: ["dishonestly", "falsely", "lyingly"] },
    { word: "SOPHISTICALLY", definition: "(adv.) In a way that is plausible but fallacious.", tier: 3, difficulty: 5, synonyms: ["cleverly", "fallaciously", "speciously"] },
    { word: "PERFIDIOUSLY", definition: "(adv.) In a deceitful and untrustworthy manner.", tier: 3, difficulty: 5, synonyms: ["treacherously", "dishonestly", "disloyally"] },
    { word: "SPECIOUSLY", definition: "(adv.) In a way that is superficially plausible, but actually wrong.", tier: 3, difficulty: 5, synonyms: ["misleadingly", "deceptively", "falsely"] },
    { word: "IMPARTIALLY", definition: "(adv.) In a way that treats all rivals or disputants equally; fairly.", tier: 3, difficulty: 4, synonyms: ["fairly", "objectively", "evenhandedly"] },
    { word: "OBJECTIVELY", definition: "(adv.) In a way that is not influenced by personal feelings or opinions in considering and representing facts.", tier: 3, difficulty: 2, synonyms: ["impartially", "fairly", "neutrally"] },
    { word: "FERVENTLY", definition: "(adv.) Very enthusiastically or passionately.", tier: 3, difficulty: 4, synonyms: ["passionately", "ardently", "zealously"] },
    { word: "ZEALOUSLY", definition: "(adv.) With great energy or enthusiasm in pursuit of a cause or an objective.", tier: 3, difficulty: 4, synonyms: ["fervently", "enthusiastically", "passionately"] },
    { word: "STOICALLY", definition: "(adv.) Without complaining or showing what they are feeling", tier: 3, difficulty: 5, synonyms: ["calmly", "resolutely", "impassively"] },
    { word: "EXPEDITIOUSLY", definition: "(adv.) With speed and efficiency", tier: 3, difficulty: 5, synonyms: ["quickly", "swiftly", "promptly"] },
    { word: "TERSELY", definition: "(adv.) Sparing in the use of words; abrupt", tier: 3, difficulty: 5, synonyms: ["briefly", "concisely", "succinctly"] },
    { word: "METHODICALLY", definition: "(adv.) In an orderly or systematic manner", tier: 3, difficulty: 4, synonyms: ["systematically", "orderly", "carefully"] },
    { word: "METICULOUSLY", definition: "(adv.) In a way that shows great attention to detail", tier: 3, difficulty: 4, synonyms: ["carefully", "thoroughly", "precisely"] },
    { word: "HAPHAZARDLY", definition: "(adv.) In a manner lacking any obvious principle", tier: 3, difficulty: 4, synonyms: ["randomly", "carelessly", "erratically"] },
    { word: "BRAZENLY", definition: "(adv.) In a bold and shameless way", tier: 3, difficulty: 4, synonyms: ["boldly", "shamelessly", "audaciously"] },
    { word: "SUCCINCTLY", definition: "(adv.) In a brief and clearly expressed manner", tier: 3, difficulty: 4, synonyms: ["briefly", "concisely", "tersely"] },
    { word: "PARSIMONY", definition: "(n.) Extreme unwillingness to spend money", tier: 3, difficulty: 5, synonyms: ["miserliness", "stinginess", "frugality"] },
    { word: "MELANCHOLY", definition: "(n./adj.) Feeling of pensive sadness", tier: 3, difficulty: 3, synonyms: ["sadness", "gloom", "despondency"] },
    { word: "VILIFY", definition: "(v.) Speak or write about in an abusively disparaging manner", tier: 3, difficulty: 4, synonyms: ["slander", "defame", "malign"] },
    { word: "DISPARAGE", definition: "(v.) Regard or represent as being of little worth", tier: 3, difficulty: 4, synonyms: ["belittle", "denigrate", "deprecate"] },
    { word: "EXTOL", definition: "(v.) Praise enthusiastically", tier: 3, difficulty: 4, synonyms: ["praise", "glorify", "laud"] },
    { word: "MALIGN", definition: "(v./adj.) Speak about in a spitefully critical manner", tier: 3, difficulty: 4, synonyms: ["slander", "defame", "vilify"] },
    { word: "EULOGY", definition: "(n.) Speech that praises someone highly, typically deceased", tier: 3, difficulty: 4, synonyms: ["tribute", "praise", "homage"] },
    { word: "INVECTIVE", definition: "(n./adj.) Insulting, abusive, or highly critical language", tier: 3, difficulty: 5, synonyms: ["tirade", "tirade", "denunciation"] },
    { word: "PANEGYRIC", definition: "(n.) Public speech or published text in praise of someone", tier: 3, difficulty: 5, synonyms: ["tribute", "praise", "encomium"] },
    { word: "DIATRIBE", definition: "(n.) Forceful and bitter verbal attack against someone", tier: 3, difficulty: 4, synonyms: ["tirade", "harangue", "polemic"] },
    { word: "HARANGUE", definition: "(n./v.) Lengthy and aggressive speech", tier: 3, difficulty: 4, synonyms: ["tirade", "rant", "lecture"] },
    { word: "MANDATED", definition: "(v./adj.) Give someone authority to act in certain way", tier: 2, difficulty: 3, synonyms: ["required", "ordered", "decreed"] },
    { word: "EXPLOITING", definition: "(v.) Make full use of and derive benefit from", tier: 2, difficulty: 3, synonyms: ["using", "leveraging", "taking-advantage"] },
    { word: "EXPOSING", definition: "(v.) Make something visible by uncovering it", tier: 2, difficulty: 1, synonyms: ["revealing", "uncovering", "disclosing"] },
    { word: "TRACEABILITY", definition: "(n.) The ability to follow the history or origin of something through a documented chain.", tier: 2, difficulty: 5, synonyms: ["accountability", "trackability", "transparency"] },
    { word: "ROBUSTNESS", definition: "(n.) Condition of being strong and healthy", tier: 2, difficulty: 3, synonyms: ["strength", "resilience", "durability"] },
    { word: "FAVORABLY", definition: "(adv.) To the advantage of someone or something", tier: 2, difficulty: 1, synonyms: ["positively", "approvingly", "beneficially"] },
    { word: "EXPOSITION", definition: "(n.) Comprehensive explanation of theory", tier: 2, difficulty: 4, synonyms: ["explanation", "analysis", "presentation"] },
    { word: "UNDERUTILIZED", definition: "(adj.) Not used to full potential", tier: 2, difficulty: 4, synonyms: ["underused", "idle", "untapped"] },
    { word: "EXCUSE", definition: "(v./n.) Seek to lessen the blame attaching to", tier: 2, difficulty: 1, synonyms: ["justification", "pardon", "pretext"] },
    { word: "KINDLIER", definition: "(adj.) Of a sympathetic or generous nature", tier: 2, difficulty: 4, synonyms: ["gentler", "kinder", "more-sympathetic"] },
    { word: "FORGE", definition: "(v./n.) Create through effort", tier: 3, difficulty: 3, synonyms: ["create", "craft", "fabricate"] },
    { word: "CHAMPION", definition: "(n./v.) Support or defend a cause", tier: 3, difficulty: 1, synonyms: ["defend", "support", "advocate"] },
    { word: "BEAR", definition: "(v./n.) Carry, support, or endure", tier: 3, difficulty: 1, synonyms: ["carry", "endure", "tolerate"] },
    { word: "CRAFT", definition: "(n./v.) Create with skill", tier: 3, difficulty: 1, synonyms: ["skill", "make", "artistry"] },
    { word: "WARRANT", definition: "(n./v.) Justify or necessitate", tier: 3, difficulty: 3, synonyms: ["justify", "merit", "authorize"] },
    { word: "TEMPER", definition: "(v./n.) Moderate or soften", tier: 3, difficulty: 3, synonyms: ["moderate", "soften", "restrain"] },
    { word: "QUALIFY", definition: "(v.) Add reservations to statement", tier: 3, difficulty: 3, synonyms: ["modify", "limit", "restrict"] },
    { word: "SANCTION", definition: "(n./v.) Official approval or authorization", tier: 3, difficulty: 3, synonyms: ["authorize", "approve", "ratify"] },
    { word: "TABLE", definition: "(n./v.) Postpone or present discussion", tier: 3, difficulty: 1, synonyms: ["postpone", "submit", "present"] },
    { word: "PLASTIC", definition: "(adj./n.) Easily shaped or molded", tier: 3, difficulty: 3, synonyms: ["malleable", "flexible", "moldable"] },
    { word: "PEDESTRIAN", definition: "(adj./n.) Dull, ordinary, unimaginative", tier: 3, difficulty: 4, synonyms: ["ordinary", "mundane", "unremarkable"] },
    { word: "APPRECIATE", definition: "(v.) Increase in value", tier: 3, difficulty: 1, synonyms: ["value", "recognize", "increase"] },
    { word: "ECLIPSE", definition: "(v./n.) Surpass or obscure in importance", tier: 3, difficulty: 3, synonyms: ["overshadow", "surpass", "outshine"] },
    { word: "ENGAGE", definition: "(v./n.) Attract and hold interest", tier: 3, difficulty: 1, synonyms: ["involve", "occupy", "attract"] },
    { word: "MINE", definition: "(pron.) Used to refer to a thing or things belonging to or associated with the speaker.", tier: 3, difficulty: 1, synonyms: ["own", "excavate", "dig"] },
    { word: "WEATHER", definition: "(v./n.) Withstand or endure", tier: 3, difficulty: 1, synonyms: ["endure", "survive", "withstand"] },
    { word: "MATCH", definition: "(n./v.) Be equal to in quality", tier: 3, difficulty: 1, synonyms: ["equal", "correspond", "pair"] },
    { word: "TELLING", definition: "(adj./v.) Revealing or significant", tier: 3, difficulty: 3, synonyms: ["revealing", "significant", "expressive"] },
    { word: "NOVEL", definition: "(adj./n.) New and original", tier: 3, difficulty: 3, synonyms: ["original", "new", "innovative"] },
    { word: "CONCRETE", definition: "(adj./n.) Specific and tangible", tier: 3, difficulty: 3, synonyms: ["specific", "tangible", "solid"] },
    { word: "ABSTRACT", definition: "(n./adj./v.) Existing as an idea rather than concrete reality; a brief summary of a text.", tier: 3, difficulty: 3, synonyms: ["theoretical", "conceptual", "vague"] },
    { word: "INTIMATE", definition: "(v./adj.) Suggest or hint at", tier: 3, difficulty: 4, synonyms: ["suggest", "hint", "imply"] },
    { word: "SOUND", definition: "(adj./n./v.) Logical, reliable, or healthy", tier: 3, difficulty: 1, synonyms: ["noise", "healthy", "wave"] },
    { word: "GRAVE", definition: "(adj./n.) Serious and solemn", tier: 3, difficulty: 3, synonyms: ["serious", "solemn", "severe"] },
    { word: "STEEP", definition: "(v./adj./n.) Soak or saturate in", tier: 3, difficulty: 3, synonyms: ["saturate", "immerse", "soak"] },
    { word: "SINGULAR", definition: "(adj./n.) Remarkable or unique", tier: 3, difficulty: 4, synonyms: ["unique", "exceptional", "remarkable"] },
    { word: "RELATIVE", definition: "(adj./n.) Assessed by comparison rather than by fixed standards; a family member.", tier: 3, difficulty: 3, synonyms: ["comparative", "proportional", "family-member"] },
    { word: "SPARE", definition: "(v./adj./n.) Refrain from harming or using", tier: 3, difficulty: 3, synonyms: ["extra", "economical", "restrained"] },
    { word: "DISCRIMINATE", definition: "(v.) Distinguish or tell difference", tier: 3, difficulty: 4, synonyms: ["distinguish", "differentiate", "discern"] },
    { word: "RECOUNT", definition: "(v./n.) Narrate or tell a story", tier: 3, difficulty: 3, synonyms: ["narrate", "retell", "describe"] },
    { word: "SUBSCRIBE", definition: "(v.) Agree with or support opinion", tier: 3, difficulty: 3, synonyms: ["agree", "support", "endorse"] },
    { word: "ENTERTAIN", definition: "(v.) Give attention or consideration to", tier: 3, difficulty: 1, synonyms: ["amuse", "consider", "host"] },
    { word: "TRY", definition: "(v./n.) Test or subject to strain", tier: 3, difficulty: 1, synonyms: ["attempt", "endeavor", "test"] },
    { word: "RESIGN", definition: "(v.) Accept something undesirable", tier: 3, difficulty: 3, synonyms: ["accept", "yield", "quit"] },
    { word: "ADDRESS", definition: "(n./v.) Deal with or speak to", tier: 3, difficulty: 1, synonyms: ["speak to", "handle", "location"] },
    { word: "EXERCISE", definition: "(n./v.) Utilize or use (power/rights)", tier: 3, difficulty: 1, synonyms: ["use", "practice", "exert"] },
    { word: "REALIZE", definition: "(v.) To become aware of or understand something, or to make something happen or come into being.", tier: 3, difficulty: 1, synonyms: ["understand", "achieve", "recognize"] },
    { word: "REFLECT", definition: "(v.) Embody or represent", tier: 3, difficulty: 3, synonyms: ["embody", "consider", "represent"] },
    { word: "PROMPTED", definition: "(v./adj.) Triggered; caused", tier: 3, difficulty: 3, synonyms: ["triggered", "motivated", "spurred"] },
    { word: "ACKNOWLEDGED", definition: "(v./adj.) Accepted as true", tier: 3, difficulty: 3, synonyms: ["recognized", "admitted", "confirmed"] },
];




const DOOZIE_WORDS = [
    {
        "word": "A LOT",
        "difficulty": 1,
        "definition": "(adv./n.) A large number or amount."
        ,
        "synonyms": ["plenty", "much", "heaps"]
    },
    {
        "word": "ABSENCE",
        "difficulty": 2,
        "definition": "(n.) The state of being away from a place or person."
        ,
        "synonyms": ["lack", "want", "nonattendance"]
    },
    {
        "word": "ABSORB",
        "difficulty": 1,
        "definition": "(v.) Take in or soak up (energy, or a liquid or other substance) by chemical or physical action, typically gradually."
        ,
        "synonyms": ["soak up", "assimilate", "take in"]
    },
    {
        "word": "ABUNDANCE",
        "difficulty": 2,
        "definition": "(n.) A very large amount of something."
        ,
        "synonyms": ["plenty", "wealth", "profusion"]
    },
    {
        "word": "ACCEPTABLE",
        "difficulty": 2,
        "definition": "(adj.) Able to be agreed on; suitable."
        ,
        "synonyms": ["adequate", "satisfactory", "tolerable"]
    },
    {
        "word": "ACCESSIBLE",
        "difficulty": 2,
        "definition": "(adj.) (Of a place) able to be reached or entered."
        ,
        "synonyms": ["reachable", "available", "open"]
    },
    {
        "word": "ACCIDENTALLY",
        "difficulty": 4,
        "definition": "(adv.) By chance; unintentionally."
        ,
        "synonyms": ["unintentionally", "inadvertently", "by-chance"]
    },
    {
        "word": "ACCLAIM",
        "difficulty": 2,
        "definition": "(n./v.) Public praise or enthusiastic approval."
        ,
        "synonyms": ["praise", "applaud", "commend"]
    },
    {
        "word": "ACCOMMODATE",
        "difficulty": 4,
        "definition": "(v.) To provide lodging or sufficient space for."
        ,
        "synonyms": ["house", "adapt", "comply"]
    },
    {
        "word": "ACCOMPLISH",
        "difficulty": 2,
        "definition": "(v.) Achieve or complete successfully."
        ,
        "synonyms": ["achieve", "complete", "fulfill"]
    },
    {
        "word": "ACCORDION",
        "difficulty": 4,
        "definition": "(n.) A portable musical instrument with metal reeds, a keyboard, and bellows."
        ,
        "synonyms": ["concertina", "squeezebox", "bellows-instrument"]
    },
    {
        "word": "ACCUMULATE",
        "difficulty": 2,
        "definition": "(v.) Gather together or acquire an increasing number or quantity of."
        ,
        "synonyms": ["gather", "amass", "collect"]
    },
    {
        "word": "ACHIEVE",
        "difficulty": 1,
        "definition": "(v.) To successfully bring about or reach a desired objective."
        ,
        "synonyms": ["accomplish", "attain", "reach"]
    },
    {
        "word": "ACHIEVEMENT",
        "difficulty": 2,
        "definition": "(n.) A thing done successfully, typically by effort, courage, or skill."
        ,
        "synonyms": ["accomplishment", "feat", "success"]
    },
    {
        "word": "ACQUAINTANCE",
        "difficulty": 4,
        "definition": "(n.) A person one knows slightly, but who is not a close friend."
        ,
        "synonyms": ["contact", "associate", "familiar"]
    },
    {
        "word": "ACQUIESCE",
        "difficulty": 4,
        "definition": "(v.) Accept something reluctantly but without protest."
        ,
        "synonyms": ["comply", "yield", "concede"]
    },
    {
        "word": "ACQUIRE",
        "difficulty": 2,
        "definition": "(v.) To get or obtain something."
        ,
        "synonyms": ["obtain", "gain", "get"]
    },
    {
        "word": "ACQUITTED",
        "difficulty": 4,
        "definition": "(v.) Free (someone) from a criminal charge by a verdict of not guilty."
        ,
        "synonyms": ["cleared", "exonerated", "absolved"]
    },
    {
        "word": "ACROSS",
        "difficulty": 1,
        "definition": "(adv./prep.) From one side to the other of something."
        ,
        "synonyms": ["over", "spanning", "through"]
    },
    {
        "word": "ADDRESS",
        "difficulty": 1,
        "definition": "(n./v.) The particulars of a place where someone lives; to deal with or speak to."
        ,
        "synonyms": ["speak to", "handle", "location"]
    },
    {
        "word": "ADOLESCENT",
        "difficulty": 2,
        "definition": "(adj./n.) (Of a young person) in the process of developing from a child into an adult."
        ,
        "synonyms": ["teenager", "youth", "juvenile"]
    },
    {
        "word": "ADVERTISEMENT",
        "difficulty": 2,
        "definition": "(n.) A notice or announcement in a public medium promoting a product, service, or event."
        ,
        "synonyms": ["ad", "promotion", "announcement"]
    },
    {
        "word": "ADVICE",
        "difficulty": 1,
        "definition": "(n.) Guidance or recommendations offered with regard to prudent future action."
        ,
        "synonyms": ["guidance", "counsel", "recommendation"]
    },
    {
        "word": "ADVISABLE",
        "difficulty": 2,
        "definition": "(adj.) To be recommended; sensible."
        ,
        "synonyms": ["sensible", "prudent", "recommended"]
    },
    {
        "word": "ADVISE",
        "difficulty": 1,
        "definition": "(v.) Offer suggestions about the best course of action to someone."
        ,
        "synonyms": ["counsel", "recommend", "guide"]
    },
    {
        "word": "AFFECT",
        "difficulty": 1,
        "definition": "(v.) To have an effect on; make a difference to.",
        "sentences": [
            "Loud noises can affect your ability to concentrate.",
            "Rain can affect the outcome of a game.",
            "How does music affect your mood?"
        ]
        ,
        "synonyms": ["influence", "impact", "alter"]
    },
    {
        "word": "AGGRESSIVE",
        "difficulty": 2,
        "definition": "(adj.) Ready or likely to attack or confront."
        ,
        "synonyms": ["hostile", "forceful", "combative"]
    },
    {
        "word": "AGON",
        "difficulty": 4,
        "definition": "(n.) A conflict or contest, especially the conflict between main characters in a literary work."
        ,
        "synonyms": ["conflict", "contest", "struggle"]
    },
    {
        "word": "AGONIC",
        "difficulty": 4,
        "definition": "(adj.) Having no magnetic declination; relating to a line where the compass points true north."
        ,
        "synonyms": ["neutral", "zero-declination", "non-magnetic"]
    },
    {
        "word": "AGONIZE",
        "difficulty": 2,
        "definition": "(v.) To suffer great mental or physical pain; to make a great effort to decide something."
        ,
        "synonyms": ["suffer", "wrestle", "deliberate"]
    },
    {
        "word": "AGONY",
        "difficulty": 1,
        "definition": "(n.) Extreme physical or mental suffering."
        ,
        "synonyms": ["pain", "suffering", "torment"]
    },
    {
        "word": "AGORA",
        "difficulty": 4,
        "definition": "(n.) A public open space used for assemblies and markets in ancient Greek city-states."
        ,
        "synonyms": ["marketplace", "forum", "plaza"]
    },
    {
        "word": "AGORAPHOBIA",
        "difficulty": 4,
        "definition": "(n.) Extreme fear of open or crowded public spaces."
        ,
        "synonyms": ["claustrophobia-opposite", "crowd-fear", "open-space-fear"]
    },
    {
        "word": "AGRANULOCYTOSIS",
        "difficulty": 4,
        "definition": "(n.) A dangerous decrease in white blood cells, impairing immunity."
        ,
        "synonyms": ["leukopenia", "immune-deficiency", "white-cell-loss"]
    },
    {
        "word": "ALIMENTARY",
        "difficulty": 4,
        "definition": "(adj.) Relating to food or nutrition; relating to the digestive tract."
        ,
        "synonyms": ["digestive", "nutritional", "gastrointestinal"]
    },
    {
        "word": "AGRARIAN",
        "difficulty": 4,
        "definition": "(adj.) Relating to cultivated land or the interests of farmers."
        ,
        "synonyms": ["agricultural", "farming", "rural"]
    },
    {
        "word": "AGRAVIC",
        "difficulty": 4,
        "definition": "(adj.) Of or relating to a condition of zero gravity."
        ,
        "synonyms": ["weightless", "zero-gravity", "microgravity"]
    },
    {
        "word": "AGREE",
        "difficulty": 1,
        "definition": "(v.) To have the same opinion; to consent or concur.",
        "sentences": [
            "I agree with your idea.",
            "Do you agree that exercise is important?",
            "They agree on most things."
        ]
        ,
        "synonyms": ["consent", "concur", "accept"]
    },
    {
        "word": "AGREEABLE",
        "difficulty": 1,
        "definition": "(adj.) Pleasant and easy to get along with; willing to go along with others."
        ,
        "synonyms": ["pleasant", "congenial", "compliant"]
    },
    {
        "word": "AGRIBUSINESS",
        "difficulty": 2,
        "definition": "(n.) Agriculture conducted on commercial principles, treating farming as a large-scale business."
        ,
        "synonyms": ["farming-industry", "agriculture", "farm-enterprise"]
    },
    {
        "word": "AGRICULTURE",
        "difficulty": 2,
        "definition": "(n.) The science or practice of farming and cultivating the soil."
        ,
        "synonyms": ["farming", "cultivation", "husbandry"]
    },
    {
        "word": "AGRIOLOGY",
        "difficulty": 4,
        "definition": "(n.) The study of the customs of primitive peoples."
        ,
        "synonyms": ["primitive-culture-study", "ethnography", "anthropology"]
    },
    {
        "word": "AGRIOTYPE",
        "difficulty": 5,
        "definition": "(n.) The wild ancestral type of a domesticated species."
        ,
        "synonyms": ["wild-type", "ancestral-form", "original-species"]
    },
    {
        "word": "AGROGOROD",
        "difficulty": 5,
        "definition": "(n.) A large planned agricultural settlement in the Soviet Union."
        ,
        "synonyms": ["farm-town", "agricultural-settlement", "rural-community"]
    },
    {
        "word": "AGRONOME",
        "difficulty": 5,
        "definition": "(n.) A specialist in soil science and crop production who advises on farming practices."
        ,
        "synonyms": ["agronomist", "farm-manager", "soil-scientist"]
    },
    {
        "word": "AGRONOMIST",
        "difficulty": 4,
        "definition": "(n.) A scientist who studies crop production and soil management."
        ,
        "synonyms": ["farm-scientist", "soil-expert", "crop-specialist"]
    },
    {
        "word": "AGRONOMY",
        "difficulty": 4,
        "definition": "(n.) The science of soil management and crop production."
        ,
        "synonyms": ["crop-science", "soil-science", "farm-management"]
    },
    {
        "word": "AGUAJI",
        "difficulty": 5,
        "definition": "(n.) A large Caribbean reef fish valued as food."
        ,
        "synonyms": ["tropical-fish", "snapper", "reef-fish"]
    },
    {
        "word": "ANGORA",
        "difficulty": 4,
        "definition": "(n.) A type of soft fiber from certain goats, rabbits, or cats; a garment made from it."
        ,
        "synonyms": ["wool", "mohair", "fiber"]
    },
    {
        "word": "CARIBBEAN",
        "difficulty": 2,
        "definition": "(adj./n.) Relating to the regions or people around the sea located between North and South America."
        ,
        "synonyms": ["tropical", "island", "West-Indian"]
    },
    {
        "word": "AGUISH",
        "difficulty": 4,
        "definition": "(adj.) Resembling or causing ague; marked by chills and fever."
        ,
        "synonyms": ["feverish", "shivering", "malarial"]
    },
    {
        "word": "AHEAD",
        "difficulty": 1,
        "definition": "(adv.) Further forward in space, time, or order."
        ,
        "synonyms": ["forward", "in-front", "preceding"]
    },
    {
        "word": "AHEM",
        "difficulty": 1,
        "definition": "(interjection) Used to attract attention or express doubt or disapproval."
        ,
        "synonyms": ["throat-clear", "attention-signal", "hem"]
    },
    {
        "word": "AHIMSA",
        "difficulty": 5,
        "definition": "(n.) The Hindu and Buddhist doctrine of nonviolence toward all living beings."
        ,
        "synonyms": ["nonviolence", "compassion", "pacifism"]
    },
    {
        "word": "AHORSE",
        "difficulty": 4,
        "definition": "(adv.) On horseback."
        ,
        "synonyms": ["mounted", "on-horseback", "riding"]
    },
    {
        "word": "AIGUILLE",
        "difficulty": 5,
        "definition": "(n.) A sharp, pointed mountain peak; a slender needle-like pinnacle of rock."
        ,
        "synonyms": ["needle", "peak", "spire"]
    },
    {
        "word": "AIGUILLETTE",
        "difficulty": 5,
        "definition": "(n.) An ornamental tagged braid worn on a military uniform."
        ,
        "synonyms": ["cord", "braid", "lanyard"]
    },
    {
        "word": "AIKIDO",
        "difficulty": 4,
        "definition": "(n.) A Japanese martial art using throws and joint locks to redirect an attacker's force."
        ,
        "synonyms": ["martial-art", "judo-variant", "self-defense"]
    },
    {
        "word": "AILANTHUS",
        "difficulty": 5,
        "definition": "(n.) A fast-growing deciduous tree (tree of heaven) native to China, known as invasive."
        ,
        "synonyms": ["tree-of-heaven", "invasive-tree", "sumac"]
    },
    {
        "word": "AILERON",
        "difficulty": 5,
        "definition": "(n.) A hinged surface on an aircraft wing used to control rolling and banking."
        ,
        "synonyms": ["wing-flap", "control-surface", "flight-fin"]
    },
    {
        "word": "AILMENT",
        "difficulty": 1,
        "definition": "(n.) A minor illness or physical complaint."
        ,
        "synonyms": ["illness", "sickness", "malady"]
    },
    {
        "word": "AIOLI",
        "difficulty": 4,
        "definition": "(n.) A Mediterranean sauce made of garlic and olive oil, similar to mayonnaise."
        ,
        "synonyms": ["garlic-sauce", "mayonnaise", "condiment"]
    },
    {
        "word": "AIRBORNE",
        "difficulty": 1,
        "definition": "(adj.) Transported by air; (of troops) carried and deployed by aircraft."
        ,
        "synonyms": ["flying", "aerial", "aloft"]
    },
    {
        "word": "AIRBRUSH",
        "difficulty": 1,
        "definition": "(n.) A device that sprays paint using compressed air, used for fine artwork."
        ,
        "synonyms": ["spray-paint", "retouch", "retouching-tool"]
    },
    {
        "word": "AIRBUS",
        "difficulty": 1,
        "definition": "(n.) A large commercial passenger aircraft or the company that manufactures them."
        ,
        "synonyms": ["aircraft", "jetliner", "passenger-plane"]
    },
    {
        "word": "AIRCRAFT",
        "difficulty": 1,
        "definition": "(n.) A vehicle that can fly, such as an airplane or helicopter."
        ,
        "synonyms": ["plane", "aeroplane", "flying-machine"]
    },
    {
        "word": "AIREDALE",
        "difficulty": 4,
        "definition": "(n.) A large terrier breed with a tan and black coat, originating in Yorkshire."
        ,
        "synonyms": ["terrier", "dog", "hound"]
    },
    {
        "word": "AIRFOIL",
        "difficulty": 4,
        "definition": "(n.) A structure shaped to give lift or control when moving through air, such as a wing."
        ,
        "synonyms": ["wing", "blade", "lift-surface"]
    },
    {
        "word": "AIRFRAME",
        "difficulty": 2,
        "definition": "(n.) The body of an aircraft, excluding the engines."
        ,
        "synonyms": ["fuselage", "body", "aircraft-structure"]
    },
    {
        "word": "AIRPORT",
        "difficulty": 1,
        "definition": "(n.) A complex of runways and buildings where aircraft take off, land, and are serviced."
        ,
        "synonyms": ["airfield", "aerodrome", "terminal"]
    },
    {
        "word": "AIRSICKNESS",
        "difficulty": 2,
        "definition": "(n.) Nausea caused by the motion of an aircraft during flight."
        ,
        "synonyms": ["motion-sickness", "nausea", "queasiness"]
    },
    {
        "word": "AIRSTREAM",
        "difficulty": 1,
        "definition": "(n.) A current of air moving in a particular direction; a streamlined trailer brand."
        ,
        "synonyms": ["current", "flow", "draft"]
    },
    {
        "word": "AIRTIGHT",
        "difficulty": 1,
        "definition": "(adj.) Not allowing air to pass in or out; having no weaknesses or flaws."
        ,
        "synonyms": ["sealed", "hermetic", "watertight"]
    },
    {
        "word": "AISLE",
        "difficulty": 2,
        "definition": "(n.) A passage between rows of seats or shelves, or between sections of a building."
        ,
        "synonyms": ["passageway", "lane", "corridor"]
    },
    {
        "word": "AISLING",
        "difficulty": 5,
        "definition": "(n.) A type of Irish vision poem in which a woman represents Ireland."
        ,
        "synonyms": ["dream", "vision", "Irish-poem"]
    },
    {
        "word": "AITCH",
        "difficulty": 5,
        "definition": "(n.) The letter H; the name of the eighth letter of the English alphabet."
        ,
        "synonyms": ["h-sound", "letter-H", "aspirate"]
    },
    {
        "word": "AITION",
        "difficulty": 5,
        "definition": "(n.) A narrative explaining the origin of a ritual or custom; an etiological myth."
        ,
        "synonyms": ["cause", "origin", "etiology"]
    },
    {
        "word": "AKARYOTE",
        "difficulty": 5,
        "definition": "(n.) A cell or organism that lacks a distinct nucleus."
        ,
        "synonyms": ["non-nucleated", "anuclear-cell", "nucleus-free"]
    },
    {
        "word": "AKIMBO",
        "difficulty": 4,
        "definition": "(adj.) With hands on hips and elbows turned outward."
        ,
        "synonyms": ["hands-on-hips", "arms-out", "elbows-bent"]
    },
    {
        "word": "AKIN",
        "difficulty": 1,
        "definition": "(adj.) Of similar character; related by blood."
        ,
        "synonyms": ["similar", "related", "analogous"]
    },
    {
        "word": "AKINESIA",
        "difficulty": 5,
        "definition": "(n.) Loss or impairment of the ability to move voluntarily."
        ,
        "synonyms": ["paralysis", "immobility", "motor-loss"]
    },
    {
        "word": "AKROPODION",
        "difficulty": 5,
        "definition": "(n.) The tip of a digit; the terminal part of a hand or foot."
        ,
        "synonyms": ["heel", "foot-tip", "extremity"]
    },
    {
        "word": "AKTOGRAPH",
        "difficulty": 5,
        "definition": "(n.) An instrument for recording movements of sleeping subjects."
        ,
        "synonyms": ["movement-recorder", "activity-logger", "motion-tracker"]
    },
    {
        "word": "ALABASTER",
        "difficulty": 2,
        "definition": "(n.) A smooth, fine-grained white stone, often translucent, used in carvings and decorative objects."
        ,
        "synonyms": ["marble", "stone", "gypsum"]
    },
    {
        "word": "ALACRITY",
        "difficulty": 4,
        "definition": "(n.) Brisk and cheerful readiness."
        ,
        "synonyms": ["eagerness", "readiness", "enthusiasm"]
    },
    {
        "word": "ALAR",
        "difficulty": 4,
        "definition": "(adj.) Relating to wings; wing-shaped."
        ,
        "synonyms": ["wing-shaped", "winged", "flight"]
    },
    {
        "word": "ALARMABLE",
        "difficulty": 2,
        "definition": "(adj.) Easily startled or prone to fear."
        ,
        "synonyms": ["frightened-easily", "anxious", "jumpy"]
    },
    {
        "word": "ALARMIST",
        "difficulty": 2,
        "definition": "(n.) A person who tends to exaggerate potential dangers, causing unnecessary fear."
        ,
        "synonyms": ["scaremonger", "doomsayer", "pessimist"]
    },
    {
        "word": "ALARY",
        "difficulty": 5,
        "definition": "(adj.) Wing-shaped; relating to wings."
        ,
        "synonyms": ["wing-shaped", "alar", "lateral"]
    },
    {
        "word": "ALAS",
        "difficulty": 1,
        "definition": "(interjection) An exclamation expressing grief, pity, or concern."
        ,
        "synonyms": ["unfortunately", "regrettably", "sadly"]
    },
    {
        "word": "ALBA",
        "difficulty": 4,
        "definition": "(n.) A type of Provençal poem lamenting the parting of lovers at dawn."
        ,
        "synonyms": ["dawn-song", "white", "daybreak"]
    },
    {
        "word": "ALBACORE",
        "difficulty": 4,
        "definition": "(n.) A large tuna with long pectoral fins, valued as a food fish."
        ,
        "synonyms": ["tuna", "fish", "skipjack"]
    },
    {
        "word": "ALBARIUM",
        "difficulty": 5,
        "definition": "(n.) White plaster used in ancient Roman construction."
        ,
        "synonyms": ["plaster", "whitewash", "stucco"]
    },
    {
        "word": "ALBATROSS",
        "difficulty": 2,
        "definition": "(n.) A large seabird with a very long wingspan; a source of constant burden or anxiety."
        ,
        "synonyms": ["seabird", "burden", "petrel"]
    },
    {
        "word": "ALBEDO",
        "difficulty": 4,
        "definition": "(n.) The proportion of incident light reflected by a surface, especially a planet."
        ,
        "synonyms": ["reflectivity", "whiteness", "brightness"]
    },
    {
        "word": "ALBEDOMETER",
        "difficulty": 5,
        "definition": "(n.) An instrument for measuring the reflectivity of surfaces."
        ,
        "synonyms": ["reflectometer", "light-gauge", "brightness-meter"]
    },
    {
        "word": "ALBEIT",
        "difficulty": 2,
        "definition": "(conjunction) Though; even though."
        ,
        "synonyms": ["though", "although", "even-if"]
    },
    {
        "word": "ALBINO",
        "difficulty": 2,
        "definition": "(n.) A person or animal lacking normal pigmentation, resulting in white skin and hair."
        ,
        "synonyms": ["depigmented", "pale", "leucistic"]
    },
    {
        "word": "ALBUM",
        "difficulty": 1,
        "definition": "(n.) A blank book for photographs or stamps; a collection of recordings released together."
        ,
        "synonyms": ["collection", "record", "portfolio"]
    },
    {
        "word": "ALBURNUM",
        "difficulty": 5,
        "definition": "(n.) The soft, young outer wood of a tree; sapwood."
        ,
        "synonyms": ["sapwood", "outer-wood", "tree-core"]
    },
    {
        "word": "ALCARRAZA",
        "difficulty": 5,
        "definition": "(n.) A porous earthenware vessel used to cool water by evaporation."
        ,
        "synonyms": ["water-cooler", "porous-vessel", "clay-pot"]
    },
    {
        "word": "ALCAZAR",
        "difficulty": 4,
        "definition": "(n.) A Spanish palace or fortress of Moorish origin."
        ,
        "synonyms": ["fortress", "palace", "castle"]
    },
    {
        "word": "ALCHEMY",
        "difficulty": 2,
        "definition": "(n.) A medieval forerunner of chemistry; a seemingly magical process of transformation."
        ,
        "synonyms": ["transformation", "magic", "transmutation"]
    },
    {
        "word": "ALCOGEL",
        "difficulty": 5,
        "definition": "(n.) A gel in which the liquid component is an alcohol."
        ,
        "synonyms": ["sanitizer-gel", "sanitizer", "ethanol-gel"]
    },
    {
        "word": "ALCOHOL",
        "difficulty": 1,
        "definition": "(n.) A colorless, flammable liquid produced by fermentation of sugars; a class of organic compounds containing a hydroxyl group."
        ,
        "synonyms": ["ethanol", "spirits", "spirits"]
    },
    {
        "word": "ALCOHOLATURE",
        "difficulty": 5,
        "definition": "(n.) A medicinal preparation made by soaking plant material in a liquid solvent."
        ,
        "synonyms": ["tincture", "herbal-extract", "infusion"]
    },
    {
        "word": "ALCOVE",
        "difficulty": 2,
        "definition": "(n.) A recess in a wall or room, often used for a bed or seating."
        ,
        "synonyms": ["nook", "recess", "bay"]
    },
    {
        "word": "ALDEHYDE",
        "difficulty": 5,
        "definition": "(n.) An organic compound containing a terminal carbonyl group; used in perfumes and resins."
        ,
        "synonyms": ["organic-compound", "carbonyl", "formaldehyde"]
    },
    {
        "word": "ALDER",
        "difficulty": 2,
        "definition": "(n.) A tree of the birch family that grows in wet habitats."
        ,
        "synonyms": ["tree", "shrub", "birch-relative"]
    },
    {
        "word": "ALDERMAN",
        "difficulty": 2,
        "definition": "(n.) An elected member of a municipal council, typically ranking below the mayor."
        ,
        "synonyms": ["councilman", "official", "magistrate"]
    },
    {
        "word": "ALDOSTERONE",
        "difficulty": 5,
        "definition": "(n.) A hormone secreted by the adrenal gland that regulates sodium and potassium balance."
        ,
        "synonyms": ["hormone", "steroid", "mineralocorticoid"]
    },
    {
        "word": "ALEATORIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to or involving chance; used of music with elements left to chance."
        ,
        "synonyms": ["chance-based", "random", "improvised"]
    },
    {
        "word": "ALEATORY",
        "difficulty": 5,
        "definition": "(adj.) Depending on the throw of a dice or chance; unpredictable."
        ,
        "synonyms": ["random", "chance-based", "unpredictable"]
    },
    {
        "word": "ALEE",
        "difficulty": 4,
        "definition": "(adv.) On the sheltered side of a ship, away from the wind."
        ,
        "synonyms": ["downwind", "sheltered", "leeward"]
    },
    {
        "word": "ALEGAR",
        "difficulty": 5,
        "definition": "(n.) Sour ale; vinegar made from ale."
        ,
        "synonyms": ["sour-ale", "malt-vinegar", "acidic-liquid"]
    },
    {
        "word": "ALEMBIC",
        "difficulty": 5,
        "definition": "(n.) A flask used in distillation; something that refines or transforms."
        ,
        "synonyms": ["still", "distiller", "purifier"]
    },
    {
        "word": "ALEPIDOTE",
        "difficulty": 5,
        "definition": "(adj.) Lacking scales, as certain fish."
        ,
        "synonyms": ["scaleless", "smooth-skinned", "bare"]
    },
    {
        "word": "ALEURONAT",
        "difficulty": 5,
        "definition": "(n.) A flour substitute made from the protein fraction of wheat, used in diabetic diets."
        ,
        "synonyms": ["protein-grain", "aleurone", "seed-layer"]
    },
    {
        "word": "ALEWIFE",
        "difficulty": 4,
        "definition": "(n.) A small North American fish related to the herring; a woman who runs an alehouse."
        ,
        "synonyms": ["fish", "shad", "herring"]
    },
    {
        "word": "ALEXANDRITE",
        "difficulty": 4,
        "definition": "(n.) A rare gemstone that appears green in daylight and red in incandescent light."
        ,
        "synonyms": ["gemstone", "chrysoberyl", "color-changing-gem"]
    },
    {
        "word": "ALEXIA",
        "difficulty": 5,
        "definition": "(n.) An inability to read due to brain damage, despite intact vision."
        ,
        "synonyms": ["reading-disorder", "dyslexia", "word-blindness"]
    },
    {
        "word": "ALFALFA",
        "difficulty": 2,
        "definition": "(n.) A leguminous plant widely grown for fodder."
        ,
        "synonyms": ["clover", "fodder", "lucerne"]
    },
    {
        "word": "ALFRESCO",
        "difficulty": 2,
        "definition": "(adv.) In the open air; outdoors."
        ,
        "synonyms": ["outdoors", "outside", "open-air"]
    },
    {
        "word": "ALGAE",
        "difficulty": 2,
        "definition": "(n.) Simple plants or plant-like organisms that grow in water and lack true roots or stems."
        ,
        "synonyms": ["seaweed", "pond-scum", "microorganism"]
    },
    {
        "word": "ALGEBRA",
        "difficulty": 1,
        "definition": "(n.) A branch of mathematics using symbols to represent numbers and express relationships."
        ,
        "synonyms": ["mathematics", "equations", "arithmetic"]
    },
    {
        "word": "ALGEBRAICALLY",
        "difficulty": 4,
        "definition": "(adv.) By means of symbolic equations and mathematical rules."
        ,
        "synonyms": ["mathematically", "symbolically", "numerically"]
    },
    {
        "word": "ALGERIAN",
        "difficulty": 2,
        "definition": "(adj.) Belonging to or characteristic of the North African nation on the Mediterranean coast."
        ,
        "synonyms": ["North-African", "Maghrebi", "Mediterranean"]
    },
    {
        "word": "ALGESIA",
        "difficulty": 5,
        "definition": "(n.) Sensitivity to pain; the ability to feel pain."
        ,
        "synonyms": ["pain-sensitivity", "hyperalgesia", "pain-perception"]
    },
    {
        "word": "ALGETIC",
        "difficulty": 5,
        "definition": "(adj.) Producing or relating to pain."
        ,
        "synonyms": ["painful", "tender", "sore"]
    },
    {
        "word": "ALGID",
        "difficulty": 5,
        "definition": "(adj.) Chilly; cold. Often used in medicine to describe a cold, clammy condition."
        ,
        "synonyms": ["cold", "chilly", "frigid"]
    },
    {
        "word": "ALGOMETER",
        "difficulty": 5,
        "definition": "(n.) An instrument for measuring sensitivity to pain."
        ,
        "synonyms": ["pain-gauge", "pressure-tester", "sensitivity-meter"]
    },
    {
        "word": "ALGORITHM",
        "difficulty": 2,
        "definition": "(n.) A process or set of rules followed in calculations or problem-solving."
        ,
        "synonyms": ["procedure", "method", "formula"]
    },
    {
        "word": "ALIAS",
        "difficulty": 1,
        "definition": "(n.) A false or assumed name; also known as."
        ,
        "synonyms": ["pseudonym", "nickname", "alter-ego"]
    },
    {
        "word": "ALIBI",
        "difficulty": 1,
        "definition": "(n.) A claim that one was elsewhere when a crime was committed."
        ,
        "synonyms": ["excuse", "defense", "proof-of-absence"]
    },
    {
        "word": "ALIEN",
        "difficulty": 1,
        "definition": "(n.) A foreigner; belonging to a different country or strange in nature."
        ,
        "synonyms": ["foreigner", "extraterrestrial", "outsider"]
    },
    {
        "word": "ALIENAGE",
        "difficulty": 4,
        "definition": "(n.) The legal standing of a person who is a citizen of another country."
        ,
        "synonyms": ["foreign-status", "non-citizenship", "otherness"]
    },
    {
        "word": "ALIENATION",
        "difficulty": 2,
        "definition": "(n.) The feeling of being isolated or estranged; the legal transfer of property."
        ,
        "synonyms": ["estrangement", "isolation", "detachment"]
    },
    {
        "word": "ALIFEROUS",
        "difficulty": 5,
        "definition": "(adj.) Having wings; winged."
        ,
        "synonyms": ["winged", "feathered", "bearing-wings"]
    },
    {
        "word": "ALIGN",
        "difficulty": 1,
        "definition": "(v.) To place things in a straight line or bring into proper position."
        ,
        "synonyms": ["arrange", "coordinate", "line-up"]
    },
    {
        "word": "ALIKE",
        "difficulty": 1,
        "definition": "(adj.) Similar; having a resemblance."
        ,
        "synonyms": ["similar", "same", "comparable"]
    },
    {
        "word": "ALIMONY",
        "difficulty": 2,
        "definition": "(n.) A court-ordered allowance paid to a spouse after separation or divorce."
        ,
        "synonyms": ["maintenance", "support", "payment"]
    },
    {
        "word": "ALIPHATIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to organic compounds without aromatic rings in their structure."
        ,
        "synonyms": ["non-aromatic", "open-chain", "saturated"]
    },
    {
        "word": "ALIQUANT",
        "difficulty": 5,
        "definition": "(adj.) Describing a number that does not divide another evenly."
        ,
        "synonyms": ["non-divisible", "remainder-leaving", "fractional"]
    },
    {
        "word": "ALIQUOT",
        "difficulty": 5,
        "definition": "(n.) A portion of a whole sample taken for analysis."
        ,
        "synonyms": ["portion", "fraction", "sample"]
    },
    {
        "word": "ALISON",
        "difficulty": 2,
        "definition": "(n.) A small flowering plant in the mustard family."
        ,
        "synonyms": ["name", "personal-name", "given-name"]
    },
    {
        "word": "ALITERACY",
        "difficulty": 5,
        "definition": "(n.) The state of being able to read but choosing not to."
        ,
        "synonyms": ["reading-avoidance", "voluntary-illiteracy", "book-disinterest"]
    },
    {
        "word": "ALIUNDE",
        "difficulty": 5,
        "definition": "(adv.) From another source; from elsewhere (legal term)."
        ,
        "synonyms": ["from-outside", "external", "other-source"]
    },
    {
        "word": "ALIVENESS",
        "difficulty": 1,
        "definition": "(n.) The quality of being full of energy and vitality."
        ,
        "synonyms": ["vitality", "energy", "vibrancy"]
    },
    {
        "word": "ALKALESCENCE",
        "difficulty": 5,
        "definition": "(n.) A mild tendency toward a basic pH; the property of having low acidity."
        ,
        "synonyms": ["alkalinity", "basicity", "rising-pH"]
    },
    {
        "word": "ALKALI",
        "difficulty": 4,
        "definition": "(n.) A substance that neutralizes acid; a soluble mineral salt with a pH above 7."
        ,
        "synonyms": ["base", "caustic", "lye"]
    },
    {
        "word": "ALKALIFY",
        "difficulty": 5,
        "definition": "(v.) To raise the pH of a substance above neutral."
        ,
        "synonyms": ["neutralize", "basify", "raise-pH"]
    },
    {
        "word": "ALKALINE",
        "difficulty": 2,
        "definition": "(adj.) Having a pH above 7; basic rather than acidic."
        ,
        "synonyms": ["basic", "non-acidic", "caustic"]
    },
    {
        "word": "ALKANE",
        "difficulty": 4,
        "definition": "(n.) A saturated hydrocarbon containing only single bonds, such as methane or ethane."
        ,
        "synonyms": ["hydrocarbon", "paraffin", "saturated-compound"]
    },
    {
        "word": "ALKYD",
        "difficulty": 5,
        "definition": "(n.) A synthetic resin used in paints and coatings, derived from polyester."
        ,
        "synonyms": ["resin", "polyester", "paint-binder"]
    },
    {
        "word": "ALL RIGHT",
        "difficulty": 1,
        "definition": "(adj./adv.) Satisfactory or acceptable; safe."
        ,
        "synonyms": ["okay", "fine", "acceptable"]
    },
    {
        "word": "ALLARGANDO",
        "difficulty": 5,
        "definition": "(adv.) A musical direction meaning to slow down and broaden the tempo."
        ,
        "synonyms": ["slowing", "broadening", "expanding"]
    },
    {
        "word": "ALLAY",
        "difficulty": 2,
        "definition": "(v.) To diminish or put to rest fear, suspicion, or worry."
        ,
        "synonyms": ["ease", "calm", "soothe"]
    },
    {
        "word": "ALLAYMENT",
        "difficulty": 5,
        "definition": "(n.) The act of alleviating or calming; relief."
        ,
        "synonyms": ["relief", "comfort", "mitigation"]
    },
    {
        "word": "ALLEGATION",
        "difficulty": 2,
        "definition": "(n.) A claim or assertion, especially one made without proof."
        ,
        "synonyms": ["accusation", "claim", "charge"]
    },
    {
        "word": "ALLEGE",
        "difficulty": 1,
        "definition": "(v.) To claim or assert that someone has done something, typically without proof."
        ,
        "synonyms": ["claim", "assert", "charge"]
    },
    {
        "word": "ALLEGEABLE",
        "difficulty": 5,
        "definition": "(adj.) Able to be put forward as a claim or supporting reason."
        ,
        "synonyms": ["claimable", "assertable", "chargeable"]
    },
    {
        "word": "ALLEGED",
        "difficulty": 1,
        "definition": "(adj.) (Of a incident or a person) said to have taken place or to have a specified illegal or undesirable quality, but without proof."
        ,
        "synonyms": ["supposed", "claimed", "purported"]
    },
    {
        "word": "ALLEGEDLY",
        "difficulty": 1,
        "definition": "(adv.) Used to convey that something is claimed to be the case, but not proven."
        ,
        "synonyms": ["supposedly", "reportedly", "purportedly"]
    },
    {
        "word": "ALLEGIANCE",
        "difficulty": 2,
        "definition": "(n.) Loyalty or commitment to a person, group, or cause."
        ,
        "synonyms": ["loyalty", "devotion", "fidelity"]
    },
    {
        "word": "ALLEGIANT",
        "difficulty": 4,
        "definition": "(adj.) Faithful and devoted to a person, cause, or nation."
        ,
        "synonyms": ["loyal", "devoted", "faithful"]
    },
    {
        "word": "ALLEGORIST",
        "difficulty": 5,
        "definition": "(n.) A writer or speaker who uses extended metaphors to convey hidden meanings."
        ,
        "synonyms": ["symbolist", "fabulist", "moralist"]
    },
    {
        "word": "ALLEGORIZE",
        "difficulty": 5,
        "definition": "(v.) To use symbolic characters or events to represent deeper moral or political meanings."
        ,
        "synonyms": ["symbolize", "moralize", "represent"]
    },
    {
        "word": "ALLEGORY",
        "difficulty": 2,
        "definition": "(n.) A story or representation where abstract ideas are personified, conveying hidden meaning."
        ,
        "synonyms": ["parable", "symbol", "metaphor"]
    },
    {
        "word": "ALLEGRETTO",
        "difficulty": 5,
        "definition": "(adv.) At a moderately brisk musical pace, slightly slower than allegro."
        ,
        "synonyms": ["moderate-tempo", "fairly-fast", "light"]
    },
    {
        "word": "ALLEGRO",
        "difficulty": 4,
        "definition": "(adv.) A musical direction meaning to play in a fast, lively tempo."
        ,
        "synonyms": ["fast-tempo", "lively", "quick"]
    },
    {
        "word": "ALLEMANDE",
        "difficulty": 5,
        "definition": "(n.) A German court dance popular in the 16th–18th centuries; a wine from Alsace."
        ,
        "synonyms": ["dance", "German-dance", "suite-movement"]
    },
    {
        "word": "ALLERGENIC",
        "difficulty": 4,
        "definition": "(adj.) Capable of triggering an immune overreaction in sensitive individuals."
        ,
        "synonyms": ["irritant", "sensitizing", "reactive"]
    },
    {
        "word": "ALLERGY",
        "difficulty": 1,
        "definition": "(n.) An immune system reaction to a substance that is harmless to most people."
        ,
        "synonyms": ["sensitivity", "reaction", "hypersensitivity"]
    },
    {
        "word": "ALLEVIANT",
        "difficulty": 5,
        "definition": "(n.) Something that relieves or reduces pain or difficulty."
        ,
        "synonyms": ["reliever", "soother", "mitigator"]
    },
    {
        "word": "ALLEVIATE",
        "difficulty": 2,
        "definition": "(v.) To make suffering or a problem less severe."
        ,
        "synonyms": ["ease", "relieve", "mitigate"]
    },
    {
        "word": "ALLEYWAY",
        "difficulty": 1,
        "definition": "(n.) A narrow passageway between or behind buildings."
        ,
        "synonyms": ["lane", "passage", "path"]
    },
    {
        "word": "ALLIACEOUS",
        "difficulty": 5,
        "definition": "(adj.) Relating to or resembling garlic or onions; having their smell or taste."
        ,
        "synonyms": ["garlicky", "onion-like", "pungent"]
    },
    {
        "word": "ALLIANCE",
        "difficulty": 1,
        "definition": "(n.) A union or association formed for mutual benefit, especially between countries."
        ,
        "synonyms": ["union", "partnership", "coalition"]
    },
    {
        "word": "ALLIED",
        "difficulty": 1,
        "definition": "(adj.) Joined by or relating to a formal agreement or treaty."
        ,
        "synonyms": ["united", "associated", "joined"]
    },
    {
        "word": "ALLIGATOR",
        "difficulty": 1,
        "definition": "(n.) A large semiaquatic reptile of the crocodilian family, found in the Americas and China."
        ,
        "synonyms": ["crocodilian", "reptile", "gator"]
    },
    {
        "word": "ALLISION",
        "difficulty": 5,
        "definition": "(n.) The striking of a moving vessel against a stationary object."
        ,
        "synonyms": ["collision", "crash", "impact"]
    },
    {
        "word": "ALLITERATION",
        "difficulty": 4,
        "definition": "(n.) The occurrence of the same letter or sound at the beginning of adjacent words."
        ,
        "synonyms": ["repetition", "consonance", "sound-pattern"]
    },
    {
        "word": "ALLOCATE",
        "difficulty": 2,
        "definition": "(v.) To distribute resources or duties for a particular purpose."
        ,
        "synonyms": ["assign", "distribute", "apportion"]
    },
    {
        "word": "ALLOCUTION",
        "difficulty": 5,
        "definition": "(n.) A formal address or speech, especially from a judge to a convicted defendant."
        ,
        "synonyms": ["speech", "address", "proclamation"]
    },
    {
        "word": "ALLONYM",
        "difficulty": 5,
        "definition": "(n.) A name used by an author that is actually someone else's name."
        ,
        "synonyms": ["pseudonym", "pen-name", "alias"]
    },
    {
        "word": "ALLOPELAGIC",
        "difficulty": 5,
        "definition": "(adj.) Living at varying depths in the ocean rather than a fixed layer."
        ,
        "synonyms": ["deep-sea", "ocean-dwelling", "pelagic"]
    },
    {
        "word": "ALLOT",
        "difficulty": 1,
        "definition": "(v.) To give or distribute a share of something."
        ,
        "synonyms": ["assign", "distribute", "apportion"]
    },
    {
        "word": "ALLOTMENT",
        "difficulty": 2,
        "definition": "(n.) A share or portion of something allocated; a plot of land for gardening."
        ,
        "synonyms": ["plot", "allocation", "share"]
    },
    {
        "word": "ALLOTROPIC",
        "difficulty": 5,
        "definition": "(adj.) Describing an element that can exist in more than one structural form, such as carbon as diamond or graphite."
        ,
        "synonyms": ["varied-form", "polymorphic", "structural-variant"]
    },
    {
        "word": "ALLOTROPY",
        "difficulty": 5,
        "definition": "(n.) The property of some elements to exist in two or more distinct forms, e.g., carbon."
        ,
        "synonyms": ["polymorphism", "structural-variation", "form-change"]
    },
    {
        "word": "ALLOTTED",
        "difficulty": 2,
        "definition": "(v.) Distributed or assigned as a share."
        ,
        "synonyms": ["assigned", "distributed", "given"]
    },
    {
        "word": "ALLOWABLE",
        "difficulty": 1,
        "definition": "(adj.) Permitted within a set of rules or circumstances."
        ,
        "synonyms": ["permissible", "acceptable", "permitted"]
    },
    {
        "word": "ALLOY",
        "difficulty": 1,
        "definition": "(n.) A metal made by combining two or more metallic elements to improve properties."
        ,
        "synonyms": ["blend", "mixture", "composite"]
    },
    {
        "word": "ALLSPICE",
        "difficulty": 1,
        "definition": "(n.) A spice made from the dried berry of the pimento tree, tasting like mixed spices."
        ,
        "synonyms": ["spice", "pimento", "seasoning"]
    },
    {
        "word": "ALLUDED",
        "difficulty": 2,
        "definition": "(v.) Made an indirect reference to something without naming it explicitly."
        ,
        "synonyms": ["hinted", "referred", "suggested"]
    },
    {
        "word": "ALLURE",
        "difficulty": 1,
        "definition": "(v.) To attract or tempt; the quality of being powerfully attractive."
        ,
        "synonyms": ["attract", "charm", "entice"]
    },
    {
        "word": "ALLUSION",
        "difficulty": 2,
        "definition": "(n.) An indirect or passing reference to something."
        ,
        "synonyms": ["reference", "hint", "mention"]
    },
    {
        "word": "ALLUSIVELY",
        "difficulty": 4,
        "definition": "(adv.) In a way that hints at something without naming it directly."
        ,
        "synonyms": ["indirectly", "suggestively", "by-implication"]
    },
    {
        "word": "ALLUVIAL",
        "difficulty": 5,
        "definition": "(adj.) Consisting of sediment deposited by rivers or floods."
        ,
        "synonyms": ["sedimentary", "deposited", "flood-plain"]
    },
    {
        "word": "ALLUVIATION",
        "difficulty": 5,
        "definition": "(n.) The gradual buildup of sediment deposited by flowing water."
        ,
        "synonyms": ["sediment-deposit", "silt-buildup", "river-deposit"]
    },
    {
        "word": "ALLUVIUM",
        "difficulty": 5,
        "definition": "(n.) Sediment deposited by flowing water, typically found in riverbeds and floodplains."
        ,
        "synonyms": ["sediment", "silt", "deposit"]
    },
    {
        "word": "ALLY",
        "difficulty": 1,
        "definition": "(n.) A person, country, or organization that cooperates with another."
        ,
        "synonyms": ["partner", "associate", "collaborator"]
    },
    {
        "word": "ALMANAC",
        "difficulty": 2,
        "definition": "(n.) An annual publication containing a calendar and various data tables."
        ,
        "synonyms": ["calendar", "yearbook", "reference-book"]
    },
    {
        "word": "ALMANDITE",
        "difficulty": 5,
        "definition": "(n.) A deep red variety of garnet used as a gemstone."
        ,
        "synonyms": ["garnet", "gemstone", "red-mineral"]
    },
    {
        "word": "ALMIGHTY",
        "difficulty": 1,
        "definition": "(adj.) Having complete power; omnipotent."
        ,
        "synonyms": ["omnipotent", "all-powerful", "supreme"]
    },
    {
        "word": "ALMOND",
        "difficulty": 1,
        "definition": "(n.) An edible nut or the tree that produces it, native to the Middle East."
        ,
        "synonyms": ["nut", "drupe", "kernel"]
    },
    {
        "word": "ALMONER",
        "difficulty": 5,
        "definition": "(n.) An official who distributes charity; a hospital social worker (British usage)."
        ,
        "synonyms": ["charity-officer", "distributor", "social-worker"]
    },
    {
        "word": "ALMS",
        "difficulty": 2,
        "definition": "(n.) Money or food given charitably to the poor."
        ,
        "synonyms": ["charity", "donation", "aid"]
    },
    {
        "word": "ALMUERZO",
        "difficulty": 5,
        "definition": "(n.) Lunch or brunch in Spanish-speaking cultures."
        ,
        "synonyms": ["lunch", "meal", "midday-food"]
    },
    {
        "word": "ALNICO",
        "difficulty": 5,
        "definition": "(n.) A strong permanent magnetic alloy composed of aluminum, nickel, and cobalt."
        ,
        "synonyms": ["magnet", "alloy", "iron-alloy"]
    },
    {
        "word": "ALOE",
        "difficulty": 1,
        "definition": "(n.) A succulent plant with fleshy leaves used in herbal medicine and cosmetics."
        ,
        "synonyms": ["succulent", "plant", "gel-plant"]
    },
    {
        "word": "ALOFT",
        "difficulty": 1,
        "definition": "(adv.) Up in the air; high above the ground."
        ,
        "synonyms": ["up", "overhead", "above"]
    },
    {
        "word": "ALOGIA",
        "difficulty": 5,
        "definition": "(n.) A poverty of speech associated with schizophrenia or brain damage."
        ,
        "synonyms": ["speechlessness", "word-poverty", "mutism"]
    },
    {
        "word": "ALOGISM",
        "difficulty": 5,
        "definition": "(n.) A statement that defies logic; an illogical remark."
        ,
        "synonyms": ["illogic", "fallacy", "error"]
    },
    {
        "word": "ALOHA",
        "difficulty": 1,
        "definition": "(interjection) A Hawaiian greeting or farewell expressing love and affection."
        ,
        "synonyms": ["greeting", "farewell", "Hawaiian-welcome"]
    },
    {
        "word": "ALOISIITE",
        "difficulty": 5,
        "definition": "(n.) A rare silicate mineral named after a Jesuit missionary."
        ,
        "synonyms": ["mineral", "silicate", "clay-mineral"]
    },
    {
        "word": "ALONGSIDE",
        "difficulty": 1,
        "definition": "(preposition) Close to the side of; in comparison with."
        ,
        "synonyms": ["beside", "next-to", "adjacent"]
    },
    {
        "word": "ALOOF",
        "difficulty": 1,
        "definition": "(adj.) Cool and distant in manner; not friendly or forthcoming."
        ,
        "synonyms": ["distant", "detached", "reserved"]
    },
    {
        "word": "ALOPECIA",
        "difficulty": 5,
        "definition": "(n.) Hair loss from the scalp or body, due to illness or genetics."
        ,
        "synonyms": ["hair-loss", "baldness", "hair-disorder"]
    },
    {
        "word": "ALOPECOID",
        "difficulty": 5,
        "definition": "(adj.) Having fox-like characteristics in appearance or behavior."
        ,
        "synonyms": ["fox-like", "cunning", "vulpine"]
    },
    {
        "word": "ALPACA",
        "difficulty": 2,
        "definition": "(n.) A South American mammal related to the llama, raised for its fiber."
        ,
        "synonyms": ["llama-relative", "camelid", "wool-animal"]
    },
    {
        "word": "ALPENGLOW",
        "difficulty": 4,
        "definition": "(n.) A reddish glow seen on mountaintops just before sunrise or after sunset."
        ,
        "synonyms": ["sunset-glow", "mountain-light", "rosy-glow"]
    },
    {
        "word": "ALPESTRINE",
        "difficulty": 5,
        "definition": "(adj.) Growing at high mountain altitudes; subalpine."
        ,
        "synonyms": ["alpine", "high-altitude", "mountain-dwelling"]
    },
    {
        "word": "ALPHABETICAL",
        "difficulty": 2,
        "definition": "(adj.) Arranged in the conventional sequence of letters in a language's writing system."
        ,
        "synonyms": ["ordered", "sorted", "A-to-Z"]
    },
    {
        "word": "ALPHABETIZE",
        "difficulty": 2,
        "definition": "(v.) To sort or arrange items in the conventional sequence of letters from A to Z."
        ,
        "synonyms": ["sort", "arrange", "order"]
    },
    {
        "word": "ALPHAGRAM",
        "difficulty": 5,
        "definition": "(n.) A word formed by sorting the letters of another word into alphabetical order."
        ,
        "synonyms": ["anagram", "letter-puzzle", "word-rearrangement"]
    },
    {
        "word": "ALPHANUMERICAL",
        "difficulty": 4,
        "definition": "(adj.) Consisting of both letters and numbers."
        ,
        "synonyms": ["letters-and-numbers", "mixed", "coded"]
    },
    {
        "word": "ALPINE",
        "difficulty": 2,
        "definition": "(adj.) Relating to high mountains; found at or above the timberline."
        ,
        "synonyms": ["mountain", "high-altitude", "subalpine"]
    },
    {
        "word": "ALTARPIECE",
        "difficulty": 2,
        "definition": "(n.) A decorative panel or painting positioned at the back of a church's central table."
        ,
        "synonyms": ["religious-art", "reredos", "church-painting"]
    },
    {
        "word": "ALTAZIMUTH",
        "difficulty": 5,
        "definition": "(n.) An instrument for measuring altitude and azimuth of celestial objects."
        ,
        "synonyms": ["telescope-mount", "altitude-azimuth", "rotating-support"]
    },
    {
        "word": "ALTERCATION",
        "difficulty": 4,
        "definition": "(n.) A noisy argument or disagreement."
        ,
        "synonyms": ["argument", "quarrel", "dispute"]
    },
    {
        "word": "ALTERNATE",
        "difficulty": 1,
        "definition": "(v.) To change repeatedly between two states; every other one in a series."
        ,
        "synonyms": ["switch", "take-turns", "vary"]
    },
    {
        "word": "ALTERNATIVE",
        "difficulty": 1,
        "definition": "(n.) A choice between two or more options; available as a substitute."
        ,
        "synonyms": ["option", "choice", "substitute"]
    },
    {
        "word": "ALTERNATIVITY",
        "difficulty": 5,
        "definition": "(n.) The quality of offering or being a substitute option."
        ,
        "synonyms": ["optionality", "choice", "variability"]
    },
    {
        "word": "ALTHORN",
        "difficulty": 5,
        "definition": "(n.) A valved brass instrument of the saxhorn family, used in military bands."
        ,
        "synonyms": ["brass-instrument", "alto-horn", "saxhorn"]
    },
    {
        "word": "ALTHOUGH",
        "difficulty": 1,
        "definition": "(conjunction) In spite of the fact that; even though."
        ,
        "synonyms": ["though", "even-though", "while"]
    },
    {
        "word": "ALTIGRAPH",
        "difficulty": 5,
        "definition": "(n.) A recording altimeter that traces changes in altitude over time."
        ,
        "synonyms": ["altitude-recorder", "height-chart", "elevation-graph"]
    },
    {
        "word": "ALTIMETER",
        "difficulty": 4,
        "definition": "(n.) An instrument for measuring altitude above sea level."
        ,
        "synonyms": ["height-gauge", "elevation-meter", "altitude-reader"]
    },
    {
        "word": "ALTIMETRY",
        "difficulty": 5,
        "definition": "(n.) The science of measuring altitude, especially using radar or barometry."
        ,
        "synonyms": ["height-measurement", "elevation-survey", "altitude-science"]
    },
    {
        "word": "ALTIPLANATION",
        "difficulty": 5,
        "definition": "(n.) The formation of a flat or gently sloping surface on a high plateau by erosion."
        ,
        "synonyms": ["plateau-formation", "leveling", "erosion-surface"]
    },
    {
        "word": "ALTIPLANO",
        "difficulty": 4,
        "definition": "(n.) A high-altitude plateau, especially in the Andes of South America."
        ,
        "synonyms": ["plateau", "high-plain", "upland"]
    },
    {
        "word": "ALTITUDE",
        "difficulty": 1,
        "definition": "(n.) The height of an object or point above sea level or above the Earth's surface."
        ,
        "synonyms": ["height", "elevation", "level"]
    },
    {
        "word": "ALTO",
        "difficulty": 1,
        "definition": "(n.) The lowest female singing voice; an instrument of the middle range."
        ,
        "synonyms": ["singer", "lower-voice", "contralto"]
    },
    {
        "word": "ALTOCUMULUS",
        "difficulty": 5,
        "definition": "(n.) A type of cloud forming a white or grey layer at mid-level altitude."
        ,
        "synonyms": ["cloud", "mid-level-cloud", "fleecy-cloud"]
    },
    {
        "word": "ALTOGETHER",
        "difficulty": 1,
        "definition": "(adv.) Completely; on the whole; with everything considered."
        ,
        "synonyms": ["entirely", "completely", "wholly"]
    },
    {
        "word": "ALTOSTRATUS",
        "difficulty": 5,
        "definition": "(n.) A grey or blue-grey cloud layer at mid-altitude covering the sky."
        ,
        "synonyms": ["cloud", "grey-cloud", "overcast"]
    },
    {
        "word": "ALTRICIAL",
        "difficulty": 5,
        "definition": "(adj.) Describing young birds or animals that hatch or are born helpless, needing parental care."
        ,
        "synonyms": ["helpless-at-birth", "nest-dependent", "immature"]
    },
    {
        "word": "ALTRUISM",
        "difficulty": 2,
        "definition": "(n.) Selfless concern for the well-being of others."
        ,
        "synonyms": ["selflessness", "generosity", "benevolence"]
    },
    {
        "word": "ALTRUISTIC",
        "difficulty": 2,
        "definition": "(adj.) Showing a selfless concern for the welfare of others."
        ,
        "synonyms": ["selfless", "generous", "philanthropic"]
    },
    {
        "word": "ALUM",
        "difficulty": 2,
        "definition": "(n.) A double sulfate salt used in medicine and dyeing; a graduate of a school."
        ,
        "synonyms": ["mineral", "astringent", "salt"]
    },
    {
        "word": "ALUMINIFEROUS",
        "difficulty": 5,
        "definition": "(adj.) Bearing or producing the lightweight metallic element used in foil and aircraft."
        ,
        "synonyms": ["aluminum-bearing", "metallic", "mineral-rich"]
    },
    {
        "word": "ALUMINOTYPE",
        "difficulty": 5,
        "definition": "(n.) An early photographic method that used a metallic plate as the image base."
        ,
        "synonyms": ["photo-process", "image-print", "aluminum-print"]
    },
    {
        "word": "ALUMINOUS",
        "difficulty": 5,
        "definition": "(adj.) Having properties associated with a soft, lightweight, silvery-white metal."
        ,
        "synonyms": ["aluminum-containing", "metallic", "mineral"]
    },
    {
        "word": "ALUMINUM",
        "difficulty": 1,
        "definition": "(n.) A lightweight, silvery-white metallic element widely used in construction and packaging."
        ,
        "synonyms": ["metal", "alloy", "lightweight-metal"]
    },
    {
        "word": "ALUMNUS",
        "difficulty": 2,
        "definition": "(n.) A former student of a school or university."
        ,
        "synonyms": ["graduate", "former-student", "alum"]
    },
    {
        "word": "ALVEOLAR",
        "difficulty": 5,
        "definition": "(adj.) Relating to the tiny air sacs in the lungs, or the bony ridge just behind the upper front teeth."
        ,
        "synonyms": ["socket-related", "dental", "lung-related"]
    },
    {
        "word": "ALVEOLATE",
        "difficulty": 5,
        "definition": "(adj.) Having small cavities or pits; honeycomb-like in structure."
        ,
        "synonyms": ["pitted", "honeycomb", "cellular"]
    },
    {
        "word": "ALWAYS",
        "difficulty": 1,
        "definition": "(adv.) At all times; on every occasion; forever."
        ,
        "synonyms": ["forever", "constantly", "perpetually"]
    },
    {
        "word": "ALYSSUM",
        "difficulty": 5,
        "definition": "(n.) A flowering plant of the mustard family, often used in borders and rock gardens."
        ,
        "synonyms": ["flower", "herb", "sweet-alyssum"]
    },
    {
        "word": "AMADELPHOUS",
        "difficulty": 5,
        "definition": "(adj.) Having stamens united in bundles or clusters."
        ,
        "synonyms": ["bundle-forming", "grouped", "clustered"]
    },
    {
        "word": "AMAH",
        "difficulty": 4,
        "definition": "(n.) A nursemaid or maid in South and East Asia."
        ,
        "synonyms": ["nursemaid", "nanny", "housekeeper"]
    },
    {
        "word": "AMALGAM",
        "difficulty": 4,
        "definition": "(n.) A mixture or blend; an alloy of mercury with another metal."
        ,
        "synonyms": ["blend", "mixture", "combination"]
    },
    {
        "word": "AMALGAMATION",
        "difficulty": 4,
        "definition": "(n.) The process of combining or merging to form a unified whole."
        ,
        "synonyms": ["merger", "union", "combination"]
    },
    {
        "word": "AMANDINE",
        "difficulty": 5,
        "definition": "(adj.) Garnished or prepared with almonds."
        ,
        "synonyms": ["almond-style", "almond-garnished", "nutted"]
    },
    {
        "word": "AMANTADINE",
        "difficulty": 5,
        "definition": "(n.) An antiviral drug used to prevent and treat influenza and Parkinson's disease."
        ,
        "synonyms": ["antiviral", "medication", "dopamine-drug"]
    },
    {
        "word": "AMANUENSIS",
        "difficulty": 5,
        "definition": "(n.) A person who writes from dictation or copies manuscripts; a secretary."
        ,
        "synonyms": ["scribe", "secretary", "copyist"]
    },
    {
        "word": "AMARANTH",
        "difficulty": 4,
        "definition": "(n.) A plant with showy red flowers; a dark purplish-red color."
        ,
        "synonyms": ["plant", "purple-dye", "grain"]
    },
    {
        "word": "AMARANTHINE",
        "difficulty": 5,
        "definition": "(adj.) Of a deep purplish-red color; everlasting or unfading."
        ,
        "synonyms": ["eternal", "unfading", "purple"]
    },
    {
        "word": "AMARETTO",
        "difficulty": 4,
        "definition": "(n.) An Italian almond-flavored liqueur."
        ,
        "synonyms": ["liqueur", "almond-drink", "Italian-spirit"]
    },
    {
        "word": "AMARYLLIS",
        "difficulty": 4,
        "definition": "(n.) A bulbous plant with large trumpet-shaped flowers, often grown indoors."
        ,
        "synonyms": ["flower", "bulb", "lily-like"]
    },
    {
        "word": "AMASS",
        "difficulty": 1,
        "definition": "(v.) To gather or accumulate a large amount of something over time."
        ,
        "synonyms": ["collect", "accumulate", "gather"]
    },
    {
        "word": "AMATEUR",
        "difficulty": 2,
        "definition": "(n.) A person who pursues an activity for pleasure, not as a profession."
        ,
        "synonyms": ["novice", "hobbyist", "non-professional"]
    },
    {
        "word": "AMATEURISH",
        "difficulty": 4,
        "definition": "(adj.) Performed in an unskilled or unprofessional manner."
        ,
        "synonyms": ["unskilled", "clumsy", "unprofessional"]
    },
    {
        "word": "AMATHOPHOBIA",
        "difficulty": 5,
        "definition": "(n.) An abnormal fear of dust."
        ,
        "synonyms": ["dust-fear", "dirt-phobia", "contamination-fear"]
    },
    {
        "word": "AMAZON",
        "difficulty": 1,
        "definition": "(n.) A tall, strong, or athletic woman; a member of a mythical female warrior race."
        ,
        "synonyms": ["warrior", "river", "strong-woman"]
    },
    {
        "word": "AMAZONITE",
        "difficulty": 5,
        "definition": "(n.) A blue-green variety of feldspar used as a gemstone."
        ,
        "synonyms": ["mineral", "feldspar", "blue-green-gem"]
    },
    {
        "word": "AMBASSADOR",
        "difficulty": 2,
        "definition": "(n.) A diplomat sent by a state to represent it in another country."
        ,
        "synonyms": ["diplomat", "envoy", "representative"]
    },
    {
        "word": "AMBER",
        "difficulty": 1,
        "definition": "(n.) Fossilized tree resin, typically yellow-orange, used for jewelry and in research."
        ,
        "synonyms": ["resin", "fossil-gem", "orange-yellow"]
    },
    {
        "word": "AMBERJACK",
        "difficulty": 2,
        "definition": "(n.) A large, fast-swimming ocean fish popular for sport fishing and food."
        ,
        "synonyms": ["fish", "jack-fish", "game-fish"]
    },
    {
        "word": "AMBIDEXTERITY",
        "difficulty": 5,
        "definition": "(n.) The ability to use both hands with equal skill."
        ,
        "synonyms": ["two-handed-skill", "versatility", "dexterity"]
    },
    {
        "word": "AMBIDEXTROUS",
        "difficulty": 4,
        "definition": "(adj.) Able to use both hands equally well."
        ,
        "synonyms": ["versatile", "dexterous", "two-handed"]
    },
    {
        "word": "AMBIENCE",
        "difficulty": 2,
        "definition": "(n.) The character and atmosphere of a place."
        ,
        "synonyms": ["atmosphere", "mood", "environment"]
    },
    {
        "word": "AMBIENT",
        "difficulty": 2,
        "definition": "(adj.) Relating to the immediate surroundings; present on all sides."
        ,
        "synonyms": ["surrounding", "environmental", "background"]
    },
    {
        "word": "AMBIGUITY",
        "difficulty": 2,
        "definition": "(n.) Uncertainty or inexactness of meaning in language."
        ,
        "synonyms": ["vagueness", "uncertainty", "obscurity"]
    },
    {
        "word": "AMBIGUOUS",
        "difficulty": 2,
        "definition": "(adj.) Open to more than one interpretation; not having a clear meaning."
        ,
        "synonyms": ["unclear", "vague", "equivocal"]
    },
    {
        "word": "AMBITIOUS",
        "difficulty": 1,
        "definition": "(adj.) Having or showing a strong desire to succeed."
        ,
        "synonyms": ["aspiring", "driven", "determined"]
    },
    {
        "word": "AMBIVALENTLY",
        "difficulty": 4,
        "definition": "(adv.) In a way that shows mixed feelings or contradictory ideas."
        ,
        "synonyms": ["uncertainly", "doubtfully", "conflictedly"]
    },
    {
        "word": "AMBLE",
        "difficulty": 2,
        "definition": "(v.) To walk at a slow, relaxed pace."
        ,
        "synonyms": ["stroll", "wander", "walk-leisurely"]
    },
    {
        "word": "AMBLYOPIA",
        "difficulty": 5,
        "definition": "(n.) Reduced vision in one eye not corrected by glasses; lazy eye."
        ,
        "synonyms": ["lazy-eye", "vision-disorder", "weak-eye"]
    },
    {
        "word": "AMBRETTE",
        "difficulty": 5,
        "definition": "(n.) A tropical plant whose seeds yield a musky-scented oil used in perfumery."
        ,
        "synonyms": ["musk-plant", "hibiscus-seed", "aromatic-seed"]
    },
    {
        "word": "AMBROSIA",
        "difficulty": 4,
        "definition": "(n.) Food of the gods in Greek mythology; something extremely pleasing to the senses."
        ,
        "synonyms": ["nectar", "delicacy", "divine-food"]
    },
    {
        "word": "AMBRY",
        "difficulty": 5,
        "definition": "(n.) A cupboard or recess in a church wall for storing sacred vessels."
        ,
        "synonyms": ["niche", "cupboard", "church-recess"]
    },
    {
        "word": "AMBULANCE",
        "difficulty": 1,
        "definition": "(n.) A vehicle equipped for transporting sick or injured people to a hospital."
        ,
        "synonyms": ["emergency-vehicle", "rescue-truck", "medic-van"]
    },
    {
        "word": "AMBULATION",
        "difficulty": 4,
        "definition": "(n.) The ability or act of walking about."
        ,
        "synonyms": ["walking", "movement", "locomotion"]
    },
    {
        "word": "AMBULATORY",
        "difficulty": 4,
        "definition": "(adj.) Relating to walking; able to walk; relating to an outpatient setting."
        ,
        "synonyms": ["walking", "mobile", "perambulatory"]
    },
    {
        "word": "AMBUSCADE",
        "difficulty": 5,
        "definition": "(n.) A surprise attack launched from a hidden position."
        ,
        "synonyms": ["ambush", "trap", "surprise-attack"]
    },
    {
        "word": "AMBUSH",
        "difficulty": 1,
        "definition": "(n.) A surprise attack from a concealed position."
        ,
        "synonyms": ["trap", "surprise", "waylay"]
    },
    {
        "word": "AMELIORANT",
        "difficulty": 5,
        "definition": "(n.) Something that improves or makes better."
        ,
        "synonyms": ["improver", "enhancer", "modifier"]
    },
    {
        "word": "AMELIORATE",
        "difficulty": 5,
        "definition": "(v.) To make something bad or unsatisfactory better."
        ,
        "synonyms": ["improve", "better", "enhance"]
    },
    {
        "word": "AMEN",
        "difficulty": 1,
        "definition": "(interjection) Said at the end of a prayer meaning 'so be it'; expressing agreement."
        ,
        "synonyms": ["so-be-it", "agreed", "verily"]
    },
    {
        "word": "AMENABLE",
        "difficulty": 2,
        "definition": "(adj.) Open and responsive to suggestion; willing to agree."
        ,
        "synonyms": ["compliant", "receptive", "agreeable"]
    },
    {
        "word": "AMEND",
        "difficulty": 1,
        "definition": "(v.) To make changes to improve or correct; to modify a law or document."
        ,
        "synonyms": ["revise", "correct", "modify"]
    },
    {
        "word": "AMENDMENT",
        "difficulty": 1,
        "definition": "(n.) A change or addition designed to improve a document, law, or plan."
        ,
        "synonyms": ["revision", "correction", "change"]
    },
    {
        "word": "AMENITIES",
        "difficulty": 2,
        "definition": "(n.) Desirable features or facilities of a place; pleasing aspects."
        ,
        "synonyms": ["comforts", "conveniences", "facilities"]
    },
    {
        "word": "AMENITY",
        "difficulty": 2,
        "definition": "(n.) A desirable and useful feature or facility of a place."
        ,
        "synonyms": ["convenience", "comfort", "facility"]
    },
    {
        "word": "AMERCE",
        "difficulty": 5,
        "definition": "(v.) To punish by a fine; to impose a fine or penalty."
        ,
        "synonyms": ["fine", "penalize", "punish"]
    },
    {
        "word": "AMERCEMENT",
        "difficulty": 5,
        "definition": "(n.) A financial penalty imposed at the discretion of a court."
        ,
        "synonyms": ["penalty", "fine", "forfeiture"]
    },
    {
        "word": "AMERICAN",
        "difficulty": 1,
        "definition": "(adj.) Of or relating to the United States or its people."
        ,
        "synonyms": ["US-citizen", "New-Worlder", "Yankee"]
    },
    {
        "word": "AMERICIUM",
        "difficulty": 5,
        "definition": "(n.) A radioactive metallic element produced artificially; atomic number 95."
        ,
        "synonyms": ["element", "actinide", "radioactive-metal"]
    },
    {
        "word": "AMERTOY",
        "difficulty": 5,
        "definition": "(n.) A toy or plaything of American origin or character."
        ,
        "synonyms": ["toy-type", "novelty-item", "plaything"]
    },
    {
        "word": "AMETHYST",
        "difficulty": 2,
        "definition": "(n.) A violet or purple variety of quartz used as a gemstone."
        ,
        "synonyms": ["gemstone", "purple-crystal", "quartz"]
    },
    {
        "word": "AMIABLE",
        "difficulty": 2,
        "definition": "(adj.) Having a friendly and pleasant manner."
        ,
        "synonyms": ["friendly", "pleasant", "congenial"]
    },
    {
        "word": "AMICABLE",
        "difficulty": 2,
        "definition": "(adj.) Characterized by friendliness and absence of discord."
        ,
        "synonyms": ["peaceful", "cordial", "harmonious"]
    },
    {
        "word": "AMICE",
        "difficulty": 5,
        "definition": "(n.) A white linen cloth worn around the neck and shoulders by a priest during Mass."
        ,
        "synonyms": ["vestment", "collar-cloth", "liturgical-garment"]
    },
    {
        "word": "AMIDOL",
        "difficulty": 5,
        "definition": "(n.) A chemical compound used as a photographic developer."
        ,
        "synonyms": ["developer", "photographic-chemical", "reducing-agent"]
    },
    {
        "word": "AMIGO",
        "difficulty": 1,
        "definition": "(n.) A friend (Spanish); used informally in English."
        ,
        "synonyms": ["friend", "buddy", "companion"]
    },
    {
        "word": "AMINE",
        "difficulty": 4,
        "definition": "(n.) An organic compound derived from ammonia, containing nitrogen."
        ,
        "synonyms": ["organic-compound", "nitrogen-compound", "base"]
    },
    {
        "word": "AMISS",
        "difficulty": 1,
        "definition": "(adj.) Not quite right; inappropriate or out of place."
        ,
        "synonyms": ["wrong", "faulty", "awry"]
    },
    {
        "word": "AMITY",
        "difficulty": 2,
        "definition": "(n.) A friendly relationship between people or countries."
        ,
        "synonyms": ["friendship", "goodwill", "harmony"]
    },
    {
        "word": "AMMETER",
        "difficulty": 4,
        "definition": "(n.) An instrument for measuring the strength of electric current in amperes."
        ,
        "synonyms": ["current-gauge", "electricity-meter", "ampere-reader"]
    },
    {
        "word": "AMMONIA",
        "difficulty": 2,
        "definition": "(n.) A colorless gas with a sharp smell, used in cleaning products and fertilizers."
        ,
        "synonyms": ["gas", "chemical", "nitrogen-compound"]
    },
    {
        "word": "AMMONIAC",
        "difficulty": 5,
        "definition": "(adj.) Having a sharp, acrid odor; describing a gum resin from Central Asia historically used in medicine."
        ,
        "synonyms": ["gum-resin", "volatile", "pungent"]
    },
    {
        "word": "AMMONIACAL",
        "difficulty": 5,
        "definition": "(adj.) Having a sharp, pungent smell characteristic of nitrogen-based compounds."
        ,
        "synonyms": ["ammonia-smelling", "pungent", "nitrogen-rich"]
    },
    {
        "word": "AMMUNITION",
        "difficulty": 2,
        "definition": "(n.) A supply of bullets and shells for firearms."
        ,
        "synonyms": ["bullets", "rounds", "ordnance"]
    },
    {
        "word": "AMNESIA",
        "difficulty": 2,
        "definition": "(n.) A partial or total loss of memory, often caused by brain injury or trauma."
        ,
        "synonyms": ["memory-loss", "forgetfulness", "blackout"]
    },
    {
        "word": "AMNESTY",
        "difficulty": 2,
        "definition": "(n.) An official pardon for people who have been convicted of offenses."
        ,
        "synonyms": ["pardon", "reprieve", "clemency"]
    },
    {
        "word": "AMOK",
        "difficulty": 2,
        "definition": "(adv.) In a wild, frenzied, uncontrolled manner."
        ,
        "synonyms": ["frenzy", "wildly", "berserk"]
    },
    {
        "word": "AMOLE",
        "difficulty": 5,
        "definition": "(n.) A plant whose roots are used as soap, found in the American Southwest and Mexico."
        ,
        "synonyms": ["plant", "soap-plant", "root"]
    },
    {
        "word": "AMONTILLADO",
        "difficulty": 5,
        "definition": "(n.) A medium-dry sherry with a nutty flavor."
        ,
        "synonyms": ["sherry", "wine", "Spanish-wine"]
    },
    {
        "word": "AMOROUS",
        "difficulty": 2,
        "definition": "(adj.) Showing or feeling deep affection and romantic fondness toward someone."
        ,
        "synonyms": ["loving", "romantic", "affectionate"]
    },
    {
        "word": "AMORPHOUS",
        "difficulty": 4,
        "definition": "(adj.) Without a clearly defined shape or form; vague or unstructured."
        ,
        "synonyms": ["shapeless", "formless", "vague"]
    },
    {
        "word": "AMORTIZATION",
        "difficulty": 4,
        "definition": "(n.) The gradual reduction of a debt by regular payments; the spreading of costs."
        ,
        "synonyms": ["repayment", "write-off", "debt-reduction"]
    },
    {
        "word": "AMOUNT",
        "difficulty": 1,
        "definition": "(n.) The total sum or quantity of something."
        ,
        "synonyms": ["quantity", "sum", "total"]
    },
    {
        "word": "AMPERAGE",
        "difficulty": 4,
        "definition": "(n.) The magnitude of electric current flowing through a circuit."
        ,
        "synonyms": ["current", "electrical-flow", "amps"]
    },
    {
        "word": "AMPERE",
        "difficulty": 4,
        "definition": "(n.) The SI unit of electric current."
        ,
        "synonyms": ["current-unit", "electrical-unit", "amp"]
    },
    {
        "word": "AMPERSAND",
        "difficulty": 4,
        "definition": "(n.) The symbol & standing for 'and.'"
        ,
        "synonyms": ["and-symbol", "conjunction-mark", "typographic-symbol"]
    },
    {
        "word": "AMPHETAMINE",
        "difficulty": 4,
        "definition": "(n.) A synthetic stimulant drug used medically and illicitly."
        ,
        "synonyms": ["stimulant", "speed", "psychostimulant"]
    },
    {
        "word": "AMPHIBIAN",
        "difficulty": 2,
        "definition": "(n.) A cold-blooded vertebrate that can live on land and in water."
        ,
        "synonyms": ["frog", "toad", "dual-habitat-creature"]
    },
    {
        "word": "AMPHIBIOUS",
        "difficulty": 4,
        "definition": "(adj.) Relating to or suited for both land and water."
        ,
        "synonyms": ["dual-habitat", "land-and-water", "marine"]
    },
    {
        "word": "AMPHICHROME",
        "difficulty": 5,
        "definition": "(adj.) Capable of producing two different colors under different conditions."
        ,
        "synonyms": ["dual-color", "bicolor", "two-toned"]
    },
    {
        "word": "AMPHICRANIA",
        "difficulty": 5,
        "definition": "(n.) A headache affecting both sides of the head."
        ,
        "synonyms": ["bilateral-headache", "migraine", "head-pain"]
    },
    {
        "word": "AMPHIDROMIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to a point around which tidal oscillations rotate."
        ,
        "synonyms": ["tidal-point", "no-tide-zone", "ocean-node"]
    },
    {
        "word": "AMPHIOXUS",
        "difficulty": 5,
        "definition": "(n.) A small, primitive marine animal; a lancelet, important in evolutionary biology."
        ,
        "synonyms": ["lancelet", "sea-creature", "chordate"]
    },
    {
        "word": "AMPHITHEATER",
        "difficulty": 4,
        "definition": "(n.) An open circular or oval theater with tiered seating around a central area."
        ,
        "synonyms": ["arena", "colosseum", "stadium"]
    },
    {
        "word": "AMPHORA",
        "difficulty": 5,
        "definition": "(n.) A tall ancient Greek or Roman jar with two handles used for storing wine or oil."
        ,
        "synonyms": ["jar", "vessel", "clay-container"]
    },
    {
        "word": "AMPHORAE",
        "difficulty": 5,
        "definition": "(n.) Ancient two-handled vessels with narrow necks, used by Greeks and Romans for storing wine or oil."
        ,
        "synonyms": ["jars", "vessels", "urns"]
    },
    {
        "word": "AMPHORIC",
        "difficulty": 5,
        "definition": "(adj.) Resembling the hollow sound made when blowing over the top of a bottle."
        ,
        "synonyms": ["resonant", "hollow-sound", "cave-like"]
    },
    {
        "word": "AMPHOTERIC",
        "difficulty": 5,
        "definition": "(adj.) Able to react as both an acid and a base."
        ,
        "synonyms": ["dual-reactive", "acid-and-base", "neutral"]
    },
    {
        "word": "AMPICILLIN",
        "difficulty": 5,
        "definition": "(n.) A penicillin-type antibiotic used to treat bacterial infections."
        ,
        "synonyms": ["antibiotic", "penicillin-type", "medication"]
    },
    {
        "word": "AMPLE",
        "difficulty": 1,
        "definition": "(adj.) More than enough; plentiful and spacious."
        ,
        "synonyms": ["plentiful", "generous", "abundant"]
    },
    {
        "word": "AMPLIATE",
        "difficulty": 5,
        "definition": "(v.) To enlarge or extend."
        ,
        "synonyms": ["enlarge", "extend", "expand"]
    },
    {
        "word": "AMPLIATIVE",
        "difficulty": 5,
        "definition": "(adj.) Adding to or extending knowledge beyond what is contained in the premises."
        ,
        "synonyms": ["expanding", "augmenting", "extending"]
    },
    {
        "word": "AMPLIFIER",
        "difficulty": 1,
        "definition": "(n.) A device that boosts the power of electrical signals, commonly used in sound equipment."
        ,
        "synonyms": ["booster", "loudspeaker", "signal-enhancer"]
    },
    {
        "word": "AMPLIFY",
        "difficulty": 1,
        "definition": "(v.) To increase the volume, size, or strength of something."
        ,
        "synonyms": ["increase", "boost", "enlarge"]
    },
    {
        "word": "AMPLITUDE",
        "difficulty": 2,
        "definition": "(n.) The maximum extent of vibration; the breadth or fullness of something."
        ,
        "synonyms": ["magnitude", "extent", "size"]
    },
    {
        "word": "AMPLY",
        "difficulty": 1,
        "definition": "(adv.) More than adequately; plentifully."
        ,
        "synonyms": ["generously", "abundantly", "sufficiently"]
    },
    {
        "word": "AMPULLAE",
        "difficulty": 5,
        "definition": "(n.) Small flask-shaped body cavities that detect motion, balance, or electrical fields."
        ,
        "synonyms": ["flasks", "vessels", "anatomy-sacs"]
    },
    {
        "word": "AMPUTEE",
        "difficulty": 2,
        "definition": "(n.) A person who has had one or more limbs surgically removed."
        ,
        "synonyms": ["limb-loss-patient", "prosthetic-user", "injured-person"]
    },
    {
        "word": "AMULET",
        "difficulty": 2,
        "definition": "(n.) An ornament or object worn as a charm against evil."
        ,
        "synonyms": ["charm", "talisman", "token"]
    },
    {
        "word": "AMUSE",
        "difficulty": 1,
        "definition": "(v.) To entertain or occupy in a pleasant manner."
        ,
        "synonyms": ["entertain", "delight", "divert"]
    },
    {
        "word": "AMYELONIC",
        "difficulty": 5,
        "definition": "(adj.) Lacking a spinal cord or bone marrow."
        ,
        "synonyms": ["without-spinal-cord", "spineless", "cord-less"]
    },
    {
        "word": "AMYGDALA",
        "difficulty": 5,
        "definition": "(n.) An almond-shaped set of neurons in the brain involved in processing emotions."
        ,
        "synonyms": ["brain-region", "fear-center", "emotion-hub"]
    },
    {
        "word": "AMYGDALINE",
        "difficulty": 5,
        "definition": "(adj.) Almond-shaped; relating to either the brain structure involved in emotion or the tonsils."
        ,
        "synonyms": ["almond-shaped", "tonsil-like", "amygdala-related"]
    },
    {
        "word": "AMYLACEOUS",
        "difficulty": 5,
        "definition": "(adj.) Relating to or resembling starch."
        ,
        "synonyms": ["starchy", "starch-like", "carbohydrate"]
    },
    {
        "word": "AMYOTONIA",
        "difficulty": 5,
        "definition": "(n.) A condition characterized by a lack of muscle tone."
        ,
        "synonyms": ["muscle-weakness", "low-tone", "flaccidity"]
    },
    {
        "word": "AMYOTROPHIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to a progressive wasting of muscle tissue."
        ,
        "synonyms": ["muscle-wasting", "degenerative", "ALS-related"]
    },
    {
        "word": "ANABASIS",
        "difficulty": 5,
        "definition": "(n.) A military march inland; an arduous journey, especially from coast to interior."
        ,
        "synonyms": ["march-inland", "military-advance", "expedition"]
    },
    {
        "word": "ANABIBAZON",
        "difficulty": 5,
        "definition": "(n.) The ascending node of a planet's orbit; historically used in astronomy."
        ,
        "synonyms": ["ascending-node", "orbital-point", "intersection"]
    },
    {
        "word": "ANABLEPID",
        "difficulty": 5,
        "definition": "(n.) A freshwater fish whose eyes are divided to see above and below the water surface simultaneously."
        ,
        "synonyms": ["four-eyed-fish", "surface-fish", "river-fish"]
    },
    {
        "word": "ANABOLIC",
        "difficulty": 4,
        "definition": "(adj.) Relating to the constructive phase of metabolism; building up body tissue."
        ,
        "synonyms": ["muscle-building", "constructive", "growth-promoting"]
    },
    {
        "word": "ANACHRONISM",
        "difficulty": 4,
        "definition": "(n.) A thing that belongs to a different time period than the one depicted."
        ,
        "synonyms": ["relic", "archaism", "time-error"]
    },
    {
        "word": "ANACHRONOUS",
        "difficulty": 5,
        "definition": "(adj.) Out of the correct historical or chronological order."
        ,
        "synonyms": ["out-of-time", "misplaced", "temporally-wrong"]
    },
    {
        "word": "ANACLASTIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to refraction of light; describing rocks fractured by pressure."
        ,
        "synonyms": ["refractive", "bent-by-refraction", "light-bending"]
    },
    {
        "word": "ANACOLUTHON",
        "difficulty": 5,
        "definition": "(n.) A rhetorical figure in which a sentence shifts construction midway through."
        ,
        "synonyms": ["syntax-shift", "grammatical-break", "sentence-change"]
    },
    {
        "word": "ANACONDA",
        "difficulty": 2,
        "definition": "(n.) A very large constricting snake native to South America."
        ,
        "synonyms": ["snake", "boa", "constrictor"]
    },
    {
        "word": "ANACREONTIC",
        "difficulty": 5,
        "definition": "(adj.) Describing poetry or verse celebrating pleasure, drinking, and romance."
        ,
        "synonyms": ["lyric-poem", "celebratory-verse", "drinking-song"]
    },
    {
        "word": "ANADIPLOSIS",
        "difficulty": 5,
        "definition": "(n.) A rhetorical device repeating the last word of a clause at the start of the next."
        ,
        "synonyms": ["word-repetition", "rhetorical-device", "linking-repeat"]
    },
    {
        "word": "ANADROMOUS",
        "difficulty": 5,
        "definition": "(adj.) Describing fish that migrate from the sea to fresh water to spawn, like salmon."
        ,
        "synonyms": ["ocean-to-river", "migratory", "salmon-like"]
    },
    {
        "word": "ANAGLYPH",
        "difficulty": 5,
        "definition": "(n.) A stereoscopic photograph viewed through colored glasses to create 3D effect."
        ,
        "synonyms": ["3D-image", "embossed-print", "relief-image"]
    },
    {
        "word": "ANAGNORISIS",
        "difficulty": 5,
        "definition": "(n.) The moment in a play or story when a character makes a critical discovery."
        ,
        "synonyms": ["recognition", "discovery", "plot-revelation"]
    },
    {
        "word": "ANAGOGIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to the spiritual or mystical interpretation of words or events."
        ,
        "synonyms": ["mystical", "spiritual", "allegorical"]
    },
    {
        "word": "ANAGRAM",
        "difficulty": 2,
        "definition": "(n.) A word or phrase formed by rearranging the letters of another."
        ,
        "synonyms": ["word-rearrangement", "letter-shuffle", "word-puzzle"]
    },
    {
        "word": "ANALECTS",
        "difficulty": 5,
        "definition": "(n.) A collection of short literary passages or philosophical sayings."
        ,
        "synonyms": ["selections", "collected-writings", "anthology"]
    },
    {
        "word": "ANALEMMA",
        "difficulty": 5,
        "definition": "(n.) A scale on a globe showing the sun's declination and equation of time for each day."
        ,
        "synonyms": ["figure-8-curve", "sun-chart", "time-diagram"]
    },
    {
        "word": "ANALGESIC",
        "difficulty": 4,
        "definition": "(n.) A painkilling drug; acting to relieve pain."
        ,
        "synonyms": ["painkiller", "pain-reliever", "numbing-agent"]
    },
    {
        "word": "ANALLOBAR",
        "difficulty": 5,
        "definition": "(n.) A region in the atmosphere where atmospheric pressure is decreasing."
        ,
        "synonyms": ["pressure-zone", "constant-pressure", "isobar"]
    },
    {
        "word": "ANALOGOUS",
        "difficulty": 2,
        "definition": "(adj.) Comparable in certain respects; performing a similar function."
        ,
        "synonyms": ["similar", "comparable", "parallel"]
    },
    {
        "word": "ANALOGY",
        "difficulty": 2,
        "definition": "(n.) A comparison between two things to explain or clarify."
        ,
        "synonyms": ["comparison", "parallel", "likeness"]
    },
    {
        "word": "ANALYSAND",
        "difficulty": 5,
        "definition": "(n.) A person undergoing psychoanalysis."
        ,
        "synonyms": ["patient", "therapy-subject", "analyzed-person"]
    },
    {
        "word": "ANALYSE",
        "difficulty": 2,
        "definition": "(v.) Examine methodically and in detail the constitution or structure of (something, especially information), typically for purposes of explanation and interpretation."
        ,
        "synonyms": ["examine", "study", "evaluate"]
    },
    {
        "word": "ANALYSIS",
        "difficulty": 2,
        "definition": "(n.) Detailed examination of something to understand its nature or determine its components."
        ,
        "synonyms": ["examination", "study", "breakdown"]
    },
    {
        "word": "ANALYTICALLY",
        "difficulty": 4,
        "definition": "(adv.) By breaking a subject into its component parts to examine them methodically."
        ,
        "synonyms": ["logically", "systematically", "carefully"]
    },
    {
        "word": "ANALYZE",
        "difficulty": 1,
        "definition": "(v.) To examine in detail to understand or explain something.",
        "sentences": [
            "Scientists analyze samples in the lab.",
            "She will analyze the results carefully.",
            "Let us analyze what went wrong."
        ]
        ,
        "synonyms": ["examine", "study", "evaluate"]
    },
    {
        "word": "ANAMNESIS",
        "difficulty": 5,
        "definition": "(n.) Recollection of past events; a patient's medical history; a liturgical recollection."
        ,
        "synonyms": ["recollection", "medical-history", "recall"]
    },
    {
        "word": "ANANIAS",
        "difficulty": 5,
        "definition": "(n.) A liar; from the biblical figure who lied to the apostles."
        ,
        "synonyms": ["liar", "deceiver", "false-witness"]
    },
    {
        "word": "ANANYM",
        "difficulty": 5,
        "definition": "(n.) A name spelled backwards, used as a pseudonym."
        ,
        "synonyms": ["backward-name", "reversed-word", "transposed-name"]
    },
    {
        "word": "ANAPHORA",
        "difficulty": 5,
        "definition": "(n.) Repetition of a word or phrase at the beginning of successive clauses."
        ,
        "synonyms": ["repetition", "rhetorical-device", "refrain"]
    },
    {
        "word": "ANAPHORIC",
        "difficulty": 5,
        "definition": "(adj.) Referring back to an earlier word in a sentence."
        ,
        "synonyms": ["referring-back", "pronoun-like", "referential"]
    },
    {
        "word": "ANAPHYLACTIC",
        "difficulty": 5,
        "definition": "(adj.) Describing a sudden, life-threatening immune response to a foreign substance."
        ,
        "synonyms": ["allergic-shock", "hypersensitive", "reactive"]
    },
    {
        "word": "ANAPHYLAXIS",
        "difficulty": 5,
        "definition": "(n.) A severe, potentially life-threatening allergic reaction."
        ,
        "synonyms": ["allergic-reaction", "shock", "hypersensitivity"]
    },
    {
        "word": "ANAPTYXIS",
        "difficulty": 5,
        "definition": "(n.) The insertion of a vowel sound between two consonants to aid pronunciation."
        ,
        "synonyms": ["vowel-insertion", "epenthesis", "sound-addition"]
    },
    {
        "word": "ANAQUA",
        "difficulty": 5,
        "definition": "(n.) A tree native to Texas and Mexico with rough leaves and small white flowers."
        ,
        "synonyms": ["tree", "plant", "shrub"]
    },
    {
        "word": "ANARCHIC",
        "difficulty": 2,
        "definition": "(adj.) Characterized by lawlessness and the absence of governing authority."
        ,
        "synonyms": ["chaotic", "lawless", "unruly"]
    },
    {
        "word": "ANARCHISM",
        "difficulty": 3,
        "definition": "(n.) A political philosophy advocating for abolition of government and state."
        ,
        "synonyms": ["anti-government", "libertarianism", "anti-authority"]
    },
    {
        "word": "ANARCHY",
        "difficulty": 3,
        "definition": "(n.) A state of disorder due to absence or non-recognition of authority."
        ,
        "synonyms": ["chaos", "disorder", "lawlessness"]
    },
    {
        "word": "ANASTOMOSIS",
        "difficulty": 5,
        "definition": "(n.) A connection between two tubes, blood vessels, or nerve fibers."
        ,
        "synonyms": ["junction", "joining", "network-connection"]
    },
    {
        "word": "ANASTROPHE",
        "difficulty": 5,
        "definition": "(n.) A rhetorical inversion of normal word order for effect."
        ,
        "synonyms": ["inversion", "word-reversal", "syntax-reversal"]
    },
    {
        "word": "ANATHEMA",
        "difficulty": 4,
        "definition": "(n.) Something or someone greatly detested; a formal curse by a church."
        ,
        "synonyms": ["abomination", "pariah", "taboo"]
    },
    {
        "word": "ANATHEMATIZE",
        "difficulty": 5,
        "definition": "(v.) To formally condemn or excommunicate; to declare something utterly loathsome."
        ,
        "synonyms": ["curse", "condemn", "denounce"]
    },
    {
        "word": "ANATOCISM",
        "difficulty": 5,
        "definition": "(n.) The charging of compound interest, or interest on unpaid interest."
        ,
        "synonyms": ["compound-interest", "interest-on-interest", "usury"]
    },
    {
        "word": "ANATOMY",
        "difficulty": 1,
        "definition": "(n.) The branch of science studying the structure of living organisms."
        ,
        "synonyms": ["structure", "body-science", "dissection"]
    },
    {
        "word": "ANAUDIA",
        "difficulty": 5,
        "definition": "(n.) Complete loss of the ability to speak; aphonia."
        ,
        "synonyms": ["voicelessness", "aphonia", "loss-of-voice"]
    },
    {
        "word": "ANAUTOGENOUS",
        "difficulty": 5,
        "definition": "(adj.) Describing insects that require a blood meal before producing eggs."
        ,
        "synonyms": ["not-self-generated", "externally-fed", "dependent"]
    },
    {
        "word": "ANCESTOR",
        "difficulty": 1,
        "definition": "(n.) A person from whom one is descended; a forerunner or precursor."
        ,
        "synonyms": ["forebear", "predecessor", "progenitor"]
    },
    {
        "word": "ANCESTRAL",
        "difficulty": 3,
        "definition": "(adj.) Passed down through generations of a family; relating to those who came before."
        ,
        "synonyms": ["hereditary", "inherited", "lineage"]
    },
    {
        "word": "ANCESTRY",
        "difficulty": 3,
        "definition": "(n.) The sequence of family members from whom a person is descended; lineage."
        ,
        "synonyms": ["lineage", "descent", "heritage"]
    },
    {
        "word": "ANCHOR",
        "difficulty": 1,
        "definition": "(n.) A heavy metal device dropped from a ship to hold it in place."
        ,
        "synonyms": ["hold", "secure", "mooring"]
    },
    {
        "word": "ANCHORAGE",
        "difficulty": 3,
        "definition": "(n.) A sheltered area of water where vessels can moor; a charge for using such a spot."
        ,
        "synonyms": ["harbor", "mooring", "port"]
    },
    {
        "word": "ANCHORITIC",
        "difficulty": 5,
        "definition": "(adj.) Of or relating to a hermit who has withdrawn from society for religious devotion."
        ,
        "synonyms": ["hermit-like", "reclusive", "monastic"]
    },
    {
        "word": "ANCHOVY",
        "difficulty": 3,
        "definition": "(n.) A small, strong-tasting saltwater fish used in cooking and as a condiment."
        ,
        "synonyms": ["fish", "saltwater-fish", "sardine"]
    },
    {
        "word": "ANCHUSA",
        "difficulty": 5,
        "definition": "(n.) A genus of plants in the borage family with blue, purple, or white flowers."
        ,
        "synonyms": ["plant", "herb", "borage-relative"]
    },
    {
        "word": "ANCIENT",
        "difficulty": 1,
        "definition": "(adj.) Belonging to the very distant past; very old."
        ,
        "synonyms": ["old", "antique", "prehistoric"]
    },
    {
        "word": "ANCILLARY",
        "difficulty": 4,
        "definition": "(adj.) Providing necessary support; subordinate or supplementary."
        ,
        "synonyms": ["supplementary", "auxiliary", "secondary"]
    },
    {
        "word": "ANCIPITAL",
        "difficulty": 5,
        "definition": "(adj.) Two-edged; two-headed; ambiguous in meaning."
        ,
        "synonyms": ["two-edged", "double-sided", "ambiguous"]
    },
    {
        "word": "ANDIRON",
        "difficulty": 4,
        "definition": "(n.) A metal support used in a fireplace to hold burning wood."
        ,
        "synonyms": ["firedog", "grate-support", "hearth-iron"]
    },
    {
        "word": "ANDRADITE",
        "difficulty": 5,
        "definition": "(n.) A calcium iron garnet, occurring in various colors including green, yellow, and black."
        ,
        "synonyms": ["garnet", "gemstone", "calcium-garnet"]
    },
    {
        "word": "ANDRAGOGY",
        "difficulty": 5,
        "definition": "(n.) The theory and practice of educating adult learners."
        ,
        "synonyms": ["adult-learning", "adult-education", "pedagogy"]
    },
    {
        "word": "ANDROCRACY",
        "difficulty": 5,
        "definition": "(n.) Social and political rule or dominance by men."
        ,
        "synonyms": ["male-rule", "patriarchy", "male-dominance"]
    },
    {
        "word": "ANDROGYNISM",
        "difficulty": 5,
        "definition": "(n.) The state of having both male and female characteristics."
        ,
        "synonyms": ["gender-fluidity", "non-binary", "dual-gender"]
    },
    {
        "word": "ANDROGYNOUS",
        "difficulty": 4,
        "definition": "(adj.) Partly male and partly female; having both masculine and feminine characteristics."
        ,
        "synonyms": ["gender-neutral", "non-binary", "unisex"]
    },
    {
        "word": "ANDROID",
        "difficulty": 3,
        "definition": "(n.) A robot with a human appearance; a mobile operating system developed by Google."
        ,
        "synonyms": ["robot", "humanoid", "automaton"]
    },
    {
        "word": "ANECDOTAL",
        "difficulty": 3,
        "definition": "(adj.) Based on personal accounts rather than systematic data."
        ,
        "synonyms": ["informal", "story-based", "narrative"]
    },
    {
        "word": "ANECDOTE",
        "difficulty": 3,
        "definition": "(n.) A short, amusing or interesting story about a real person or event."
        ,
        "synonyms": ["story", "tale", "account"]
    },
    {
        "word": "ANECHOIC",
        "difficulty": 5,
        "definition": "(adj.) Free from echoes; describing a room designed to absorb all sound reflections."
        ,
        "synonyms": ["sound-absorbing", "echo-free", "muffled"]
    },
    {
        "word": "ANEMOCHORE",
        "difficulty": 5,
        "definition": "(n.) A plant or seed dispersed by wind."
        ,
        "synonyms": ["wind-dispersed", "wind-seeded", "anemochorous"]
    },
    {
        "word": "ANEMOLOGY",
        "difficulty": 5,
        "definition": "(n.) The scientific study of winds."
        ,
        "synonyms": ["wind-science", "meteorology", "wind-study"]
    },
    {
        "word": "ANEMOMETER",
        "difficulty": 5,
        "definition": "(n.) An instrument for measuring wind speed."
        ,
        "synonyms": ["wind-gauge", "speed-measurer", "weather-tool"]
    },
    {
        "word": "ANEMOMETRY",
        "difficulty": 5,
        "definition": "(n.) The measurement of wind speed and direction."
        ,
        "synonyms": ["wind-measurement", "wind-speed-study", "meteorology"]
    },
    {
        "word": "ANEMONE",
        "difficulty": 3,
        "definition": "(n.) A flowering plant with delicate, brightly colored petals; also a sea creature with tentacles that resembles a flower."
        ,
        "synonyms": ["flower", "sea-creature", "windflower"]
    },
    {
        "word": "ANEMOSIS",
        "difficulty": 5,
        "definition": "(n.) Wind-shaking of trees causing wood damage."
        ,
        "synonyms": ["wind-damage", "tree-damage", "wind-injury"]
    },
    {
        "word": "ANEMOTROPISM",
        "difficulty": 5,
        "definition": "(n.) The growth response of a plant or organism to wind."
        ,
        "synonyms": ["wind-response", "plant-orientation", "tropism"]
    },
    {
        "word": "ANENT",
        "difficulty": 5,
        "definition": "(preposition) About; concerning (archaic or Scottish)."
        ,
        "synonyms": ["concerning", "about", "regarding"]
    },
    {
        "word": "ANENTEROUS",
        "difficulty": 5,
        "definition": "(adj.) Without an intestine or gut."
        ,
        "synonyms": ["without-gut", "gutless", "intestine-free"]
    },
    {
        "word": "ANEROID",
        "difficulty": 5,
        "definition": "(adj.) Not using liquid; describing a type of barometer using no mercury or water."
        ,
        "synonyms": ["non-liquid", "dry-measuring", "pressure-gauge"]
    },
    {
        "word": "ANESTHESIA",
        "difficulty": 3,
        "definition": "(n.) Loss of sensation, especially induced by drugs before a surgical procedure."
        ,
        "synonyms": ["numbness", "sedation", "unconsciousness"]
    },
    {
        "word": "ANESTHETIC",
        "difficulty": 3,
        "definition": "(n.) A substance that induces insensitivity to pain."
        ,
        "synonyms": ["sedative", "numbing", "painkiller"]
    },
    {
        "word": "ANESTHETIZE",
        "difficulty": 4,
        "definition": "(v.) To administer medication that causes a loss of sensation or consciousness before a medical procedure."
        ,
        "synonyms": ["numb", "sedate", "render-unconscious"]
    },
    {
        "word": "ANEURYSM",
        "difficulty": 4,
        "definition": "(n.) A bulge or ballooning in the wall of a blood vessel, which can rupture."
        ,
        "synonyms": ["blood-vessel-bulge", "arterial-swelling", "vascular-dilation"]
    },
    {
        "word": "ANFRACTUOUS",
        "difficulty": 5,
        "definition": "(adj.) Winding; sinuous; full of turnings and intricacies."
        ,
        "synonyms": ["winding", "intricate", "tortuous"]
    },
    {
        "word": "ANGARY",
        "difficulty": 5,
        "definition": "(n.) The legal right of a belligerent to seize or destroy neutral property if necessary."
        ,
        "synonyms": ["war-right", "belligerent-right", "seizure-right"]
    },
    {
        "word": "ANGEL",
        "difficulty": 1,
        "definition": "(n.) A spiritual being acting as a divine messenger; a kind, beautiful person."
        ,
        "synonyms": ["spirit", "messenger", "seraph"]
    },
    {
        "word": "ANGELFISH",
        "difficulty": 1,
        "definition": "(n.) A brightly colored tropical fish with long fins, popular in aquariums."
        ,
        "synonyms": ["tropical-fish", "cichlid", "aquarium-fish"]
    },
    {
        "word": "ANGER",
        "difficulty": 1,
        "definition": "(n.) A strong feeling of annoyance or hostility."
        ,
        "synonyms": ["rage", "fury", "wrath"]
    },
    {
        "word": "ANGIITIS",
        "difficulty": 5,
        "definition": "(n.) Inflammation of a blood or lymph vessel."
        ,
        "synonyms": ["vessel-inflammation", "vasculitis", "inflammation"]
    },
    {
        "word": "ANGINA",
        "difficulty": 4,
        "definition": "(n.) Chest pain caused by reduced blood flow to the heart; also refers to throat inflammation."
        ,
        "synonyms": ["chest-pain", "heart-pain", "cardiac-symptom"]
    },
    {
        "word": "ANGLAISE",
        "difficulty": 5,
        "definition": "(n.) An English-style dance; a style of embroidery with decorative holes."
        ,
        "synonyms": ["English-dance", "country-dance", "dance-style"]
    },
    {
        "word": "ANGLICIZE",
        "difficulty": 4,
        "definition": "(v.) To make English in form or character; to convert to English language or customs."
        ,
        "synonyms": ["Anglify", "Britishize", "English-adapt"]
    },
    {
        "word": "ANGLING",
        "difficulty": 1,
        "definition": "(n.) The sport or pastime of fishing with a line and hook."
        ,
        "synonyms": ["fishing", "rod-fishing", "sport-fishing"]
    },
    {
        "word": "ANGLOPHILIA",
        "difficulty": 5,
        "definition": "(n.) Admiration for England and English culture, customs, and people."
        ,
        "synonyms": ["love-of-England", "Anglophilia", "British-admiration"]
    },
    {
        "word": "ANGSTROMS",
        "difficulty": 5,
        "definition": "(n.) Extremely small units of length used to measure atomic distances, each equal to one ten-billionth of a meter."
        ,
        "synonyms": ["units", "length-units", "tiny-measurements"]
    },
    {
        "word": "ANGUISH",
        "difficulty": 3,
        "definition": "(n.) Severe mental or physical pain or suffering."
        ,
        "synonyms": ["torment", "agony", "suffering"]
    },
    {
        "word": "ANGULAR",
        "difficulty": 1,
        "definition": "(adj.) Having angles or sharp corners; lean and bony in appearance."
        ,
        "synonyms": ["sharp-cornered", "bony", "geometric"]
    },
    {
        "word": "ANGULARITY",
        "difficulty": 4,
        "definition": "(n.) The quality of having sharp corners or edges; a pointed or bony physical appearance."
        ,
        "synonyms": ["sharpness", "jaggedness", "rigid-angles"]
    },
    {
        "word": "ANGWANTIBO",
        "difficulty": 5,
        "definition": "(n.) A small, arboreal primate found in West and Central Africa."
        ,
        "synonyms": ["primate", "pottos-relative", "African-primate"]
    },
    {
        "word": "ANHEDONIA",
        "difficulty": 5,
        "definition": "(n.) Inability to feel pleasure in normally pleasurable activities."
        ,
        "synonyms": ["joylessness", "pleasure-loss", "emotional-numbness"]
    },
    {
        "word": "ANHINGA",
        "difficulty": 5,
        "definition": "(n.) A large water bird with a long neck that swims underwater to catch fish."
        ,
        "synonyms": ["water-bird", "snakebird", "darter"]
    },
    {
        "word": "ANHYDRIDE",
        "difficulty": 5,
        "definition": "(n.) A chemical compound derived from another by removing water."
        ,
        "synonyms": ["chemical-compound", "water-free-compound", "oxide"]
    },
    {
        "word": "ANHYDROUS",
        "difficulty": 5,
        "definition": "(adj.) Without water; describing a substance containing no water."
        ,
        "synonyms": ["water-free", "dry", "dessicated"]
    },
    {
        "word": "ANICONIC",
        "difficulty": 5,
        "definition": "(adj.) Pertaining to worship without icons; avoiding the use of images of deities."
        ,
        "synonyms": ["non-representational", "imageless", "abstract"]
    },
    {
        "word": "ANILITY",
        "difficulty": 5,
        "definition": "(n.) The state of being an old woman; dotage; senility."
        ,
        "synonyms": ["senility", "dotage", "old-womanishness"]
    },
    {
        "word": "ANIMADVERSION",
        "difficulty": 5,
        "definition": "(n.) Criticism or censure; an adverse comment."
        ,
        "synonyms": ["criticism", "censure", "reproach"]
    },
    {
        "word": "ANIMAL",
        "difficulty": 1,
        "definition": "(n.) A living organism that feeds on organic matter and can move voluntarily."
        ,
        "synonyms": ["creature", "beast", "organism"]
    },
    {
        "word": "ANIMALCULE",
        "difficulty": 5,
        "definition": "(n.) A tiny creature invisible to the naked eye, visible only through magnification."
        ,
        "synonyms": ["microorganism", "tiny-creature", "microbe"]
    },
    {
        "word": "ANIMATE",
        "difficulty": 1,
        "definition": "(v.) To give life or energy to; to produce a moving image through sequential drawings."
        ,
        "synonyms": ["bring-to-life", "lively", "motivate"]
    },
    {
        "word": "ANIMATION",
        "difficulty": 1,
        "definition": "(n.) The state of being full of life; the technique of making moving images."
        ,
        "synonyms": ["movement", "cartoon", "liveliness"]
    },
    {
        "word": "ANIMISM",
        "difficulty": 4,
        "definition": "(n.) The belief that objects, places, and creatures all possess spirits."
        ,
        "synonyms": ["spirit-belief", "natural-religion", "pantheism"]
    },
    {
        "word": "ANIMOSITY",
        "difficulty": 3,
        "definition": "(n.) Strong hostility or antipathy."
        ,
        "synonyms": ["hostility", "hatred", "enmity"]
    },
    {
        "word": "ANIMUS",
        "difficulty": 4,
        "definition": "(n.) Hostility or ill feeling; motivation or intention; in Jungian psychology, the masculine element in female psychology."
        ,
        "synonyms": ["hostility", "intent", "spirit"]
    },
    {
        "word": "ANIONIC",
        "difficulty": 5,
        "definition": "(adj.) Carrying a negative electric charge; repelled by a negatively charged electrode."
        ,
        "synonyms": ["negatively-charged", "anion-forming", "electronegative"]
    },
    {
        "word": "ANISE",
        "difficulty": 3,
        "definition": "(n.) A plant whose seeds are used as a spice with a licorice-like flavor."
        ,
        "synonyms": ["spice", "licorice-herb", "seed-spice"]
    },
    {
        "word": "ANISETTE",
        "difficulty": 4,
        "definition": "(n.) A sweet, licorice-flavored spirit made from the seeds of a flowering herb."
        ,
        "synonyms": ["liqueur", "anise-drink", "spirit"]
    },
    {
        "word": "ANKH",
        "difficulty": 4,
        "definition": "(n.) An ancient Egyptian hieroglyphic symbol shaped like a cross with a loop, representing life."
        ,
        "synonyms": ["symbol", "cross", "Egyptian-symbol"]
    },
    {
        "word": "ANKLE",
        "difficulty": 1,
        "definition": "(n.) The joint connecting the foot with the leg."
        ,
        "synonyms": ["joint", "lower-leg", "foot-joint"]
    },
    {
        "word": "ANKLET",
        "difficulty": 1,
        "definition": "(n.) An ornamental chain or band worn around the ankle."
        ,
        "synonyms": ["bracelet", "ornament", "jewelry"]
    },
    {
        "word": "ANKYLOSAUR",
        "difficulty": 5,
        "definition": "(n.) A heavily armored herbivorous dinosaur with a bony tail club."
        ,
        "synonyms": ["dinosaur", "armored-dino", "prehistoric-reptile"]
    },
    {
        "word": "ANLACE",
        "difficulty": 5,
        "definition": "(n.) A short dagger used in the Middle Ages."
        ,
        "synonyms": ["dagger", "blade", "medieval-knife"]
    },
    {
        "word": "ANNALS",
        "difficulty": 3,
        "definition": "(n.) Historical records arranged in yearly order; chronicles."
        ,
        "synonyms": ["records", "chronicles", "history"]
    },
    {
        "word": "ANNATES",
        "difficulty": 5,
        "definition": "(n.) The first year's revenue of a church office paid to the pope."
        ,
        "synonyms": ["church-tax", "first-year-revenue", "ecclesiastical-fee"]
    },
    {
        "word": "ANNEAL",
        "difficulty": 4,
        "definition": "(v.) To heat and slowly cool glass or metal to relieve internal stresses."
        ,
        "synonyms": ["temper", "heat-treat", "strengthen"]
    },
    {
        "word": "ANNEALED",
        "difficulty": 4,
        "definition": "(v.) Strengthened or toughened through controlled heating followed by slow cooling."
        ,
        "synonyms": ["tempered", "heat-treated", "hardened"]
    },
    {
        "word": "ANNELID",
        "difficulty": 5,
        "definition": "(n.) A segmented worm, such as an earthworm or leech, with a body divided into rings."
        ,
        "synonyms": ["worm", "earthworm", "segmented-worm"]
    },
    {
        "word": "ANNEX",
        "difficulty": 1,
        "definition": "(v.) To add a territory or building; an extension added to a building."
        ,
        "synonyms": ["attach", "append", "incorporate"]
    },
    {
        "word": "ANNEXATION",
        "difficulty": 3,
        "definition": "(n.) The act of one state taking control of another's territory, often by force."
        ,
        "synonyms": ["takeover", "acquisition", "incorporation"]
    },
    {
        "word": "ANNIHILATE",
        "difficulty": 4,
        "definition": "(v.) To destroy completely; to reduce to nothing."
        ,
        "synonyms": ["destroy", "obliterate", "eliminate"]
    },
    {
        "word": "ANNIHILATION",
        "difficulty": 4,
        "definition": "(n.) Complete destruction; obliteration."
        ,
        "synonyms": ["destruction", "obliteration", "elimination"]
    },
    {
        "word": "ANNIVERSARY",
        "difficulty": 1,
        "definition": "(n.) The yearly recurrence of a date marking a notable event."
        ,
        "synonyms": ["commemoration", "annual-event", "celebration"]
    },
    {
        "word": "ANNOTATE",
        "difficulty": 3,
        "definition": "(v.) To add notes or comments to a text or diagram."
        ,
        "synonyms": ["comment", "note", "mark"]
    },
    {
        "word": "ANNOUNCE",
        "difficulty": 1,
        "definition": "(v.) To make a public statement about something; to declare formally."
        ,
        "synonyms": ["declare", "proclaim", "broadcast"]
    },
    {
        "word": "ANNOUNCER",
        "difficulty": 1,
        "definition": "(n.) A person who reads news or introduces programs on radio or television."
        ,
        "synonyms": ["broadcaster", "presenter", "host"]
    },
    {
        "word": "ANNOYANCE",
        "difficulty": 1,
        "definition": "(n.) The feeling of being slightly angered; something causing this feeling."
        ,
        "synonyms": ["irritation", "frustration", "nuisance"]
    },
    {
        "word": "ANNUAL",
        "difficulty": 1,
        "definition": "(adj.) Occurring once a year; lasting or valid for one year."
        ,
        "synonyms": ["yearly", "once-a-year", "perennial"]
    },
    {
        "word": "ANNUITY",
        "difficulty": 3,
        "definition": "(n.) A fixed sum of money paid yearly; an investment yielding fixed annual payments."
        ,
        "synonyms": ["pension", "income", "stipend"]
    },
    {
        "word": "ANNUL",
        "difficulty": 3,
        "definition": "(v.) To declare invalid or void; to cancel officially."
        ,
        "synonyms": ["void", "cancel", "invalidate"]
    },
    {
        "word": "ANNULARITY",
        "difficulty": 5,
        "definition": "(n.) The state of being ring-shaped; a ring-like form or structure."
        ,
        "synonyms": ["ring-form", "circularity", "annular-shape"]
    },
    {
        "word": "ANNULLING",
        "difficulty": 4,
        "definition": "(v.) Canceling or declaring legally void."
        ,
        "synonyms": ["canceling", "voiding", "invalidating"]
    },
    {
        "word": "ANNULMENT",
        "difficulty": 3,
        "definition": "(n.) The formal declaration that a marriage or contract is invalid."
        ,
        "synonyms": ["cancellation", "invalidation", "nullification"]
    },
    {
        "word": "ANODYNE",
        "difficulty": 4,
        "definition": "(adj.) Not likely to cause offense; a painkilling drug."
        ,
        "synonyms": ["soothing", "painless", "bland"]
    },
    {
        "word": "ANOIA",
        "difficulty": 5,
        "definition": "(n.) Dementia; mental deficiency or idiocy."
        ,
        "synonyms": ["mental-deficiency", "stupidity", "dullness"]
    },
    {
        "word": "ANOINT",
        "difficulty": 3,
        "definition": "(v.) To rub oil on someone as part of a religious ceremony; to officially designate."
        ,
        "synonyms": ["bless", "consecrate", "anele"]
    },
    {
        "word": "ANOMALOUS",
        "difficulty": 3,
        "definition": "(adj.) Deviating from what is standard, normal, or expected."
        ,
        "synonyms": ["irregular", "abnormal", "atypical"]
    },
    {
        "word": "ANOMALY",
        "difficulty": 3,
        "definition": "(n.) Something that deviates from what is standard or expected."
        ,
        "synonyms": ["irregularity", "aberration", "oddity"]
    },
    {
        "word": "ANON",
        "difficulty": 3,
        "definition": "(adv.) Shortly; soon; at another time (archaic)."
        ,
        "synonyms": ["soon", "shortly", "anonymous"]
    },
    {
        "word": "ANONYMOUS",
        "difficulty": 3,
        "definition": "(adj.) Not identified by name; having no outstanding features."
        ,
        "synonyms": ["unnamed", "unknown", "unidentified"]
    },
    {
        "word": "ANORAK",
        "difficulty": 3,
        "definition": "(n.) A waterproof jacket; informally, an obsessive enthusiast with narrow interests."
        ,
        "synonyms": ["jacket", "parka", "windbreaker"]
    },
    {
        "word": "ANOREXIA",
        "difficulty": 4,
        "definition": "(n.) A serious eating disorder marked by extreme restriction of food intake."
        ,
        "synonyms": ["eating-disorder", "food-avoidance", "starvation"]
    },
    {
        "word": "ANOREXIC",
        "difficulty": 4,
        "definition": "(adj.) Affected by an eating disorder involving self-imposed starvation; abnormally underweight."
        ,
        "synonyms": ["emaciated", "starved", "underfed"]
    },
    {
        "word": "ANORTHOPIA",
        "difficulty": 5,
        "definition": "(n.) A visual disorder in which straight lines appear curved or distorted."
        ,
        "synonyms": ["distorted-vision", "visual-defect", "slanted-sight"]
    },
    {
        "word": "ANOSMATIC",
        "difficulty": 5,
        "definition": "(adj.) Lacking the sense of smell."
        ,
        "synonyms": ["smell-impaired", "anosmic", "odor-blind"]
    },
    {
        "word": "ANOSMIC",
        "difficulty": 5,
        "definition": "(adj.) Unable to detect odors due to loss of the sense of smell."
        ,
        "synonyms": ["without-smell", "anosmia", "odor-insensitive"]
    },
    {
        "word": "ANSA",
        "difficulty": 5,
        "definition": "(n.) A handle-like structure; used in anatomy and astronomy."
        ,
        "synonyms": ["handle", "loop", "grip"]
    },
    {
        "word": "ANSCHLUSS",
        "difficulty": 5,
        "definition": "(n.) The 1938 annexation of Austria into Nazi Germany; any annexation."
        ,
        "synonyms": ["annexation", "union", "absorption"]
    },
    {
        "word": "ANSEROUS",
        "difficulty": 5,
        "definition": "(adj.) Resembling or relating to a goose; goose-like."
        ,
        "synonyms": ["goose-like", "anserine", "waterfowl"]
    },
    {
        "word": "ANSWERER",
        "difficulty": 3,
        "definition": "(n.) A person who gives a response or reply."
        ,
        "synonyms": ["respondent", "replier", "solver"]
    },
    {
        "word": "ANTACID",
        "difficulty": 3,
        "definition": "(n.) A substance that neutralizes stomach acid, used to relieve indigestion."
        ,
        "synonyms": ["stomach-remedy", "acid-neutralizer", "alkaline-medicine"]
    },
    {
        "word": "ANTAEAN",
        "difficulty": 5,
        "definition": "(adj.) Of immense physical strength, like the mythological giant who drew power from the earth."
        ,
        "synonyms": ["giant-like", "earthly-powered", "strong"]
    },
    {
        "word": "ANTAGONIST",
        "difficulty": 3,
        "definition": "(n.) A person who actively opposes; the adversary or villain in a story."
        ,
        "synonyms": ["opponent", "adversary", "enemy"]
    },
    {
        "word": "ANTARCTIC",
        "difficulty": 3,
        "definition": "(adj.) Of or pertaining to the frozen continent surrounding the South Pole."
        ,
        "synonyms": ["polar", "south-pole", "frozen-south"]
    },
    {
        "word": "ANTE",
        "difficulty": 3,
        "definition": "(n.) A stake put up before a card game; an upfront cost or bet."
        ,
        "synonyms": ["stake", "bet", "upfront-payment"]
    },
    {
        "word": "ANXIOUS",
        "difficulty": 1,
        "definition": "(adj.) Experiencing worry, unease, or nervousness, typically about an imminent event or something with an uncertain outcome."
        ,
        "synonyms": ["worried", "nervous", "apprehensive"]
    },
    {
        "word": "APARTMENT",
        "difficulty": 1,
        "definition": "(n.) A suite of rooms forming one residence, typically in a building containing a number of these."
        ,
        "synonyms": ["flat", "dwelling", "residence"]
    },
    {
        "word": "APPARATUS",
        "difficulty": 3,
        "definition": "(n.) The technical equipment or machinery needed for a particular activity or purpose."
        ,
        "synonyms": ["device", "equipment", "mechanism"]
    },
    {
        "word": "APPARENT",
        "difficulty": 1,
        "definition": "(adj.) Clearly visible or understood; obvious."
        ,
        "synonyms": ["obvious", "visible", "evident"]
    },
    {
        "word": "APPEARANCE",
        "difficulty": 1,
        "definition": "(n.) The way that someone or something looks."
        ,
        "synonyms": ["look", "aspect", "semblance"]
    },
    {
        "word": "APPROACH",
        "difficulty": 1,
        "definition": "(v./n.) Come near or nearer to (someone or something) in distance or time."
        ,
        "synonyms": ["method", "near", "tactic"]
    },
    {
        "word": "APPROXIMATELY",
        "difficulty": 3,
        "definition": "(adv.) Used to show that something is almost, but not completely, accurate or exact; roughly."
        ,
        "synonyms": ["roughly", "about", "around"]
    },
    {
        "word": "ARCTIC",
        "difficulty": 1,
        "definition": "(adj./n.) Relating to the regions around the North Pole."
        ,
        "synonyms": ["polar", "north-pole", "frozen-north"]
    },
    {
        "word": "ARGUMENT",
        "difficulty": 1,
        "definition": "(n.) An exchange of diverging or opposite views."
        ,
        "synonyms": ["dispute", "debate", "contention"]
    },
    {
        "word": "ASCEND",
        "difficulty": 1,
        "definition": "(v.) Go up or climb."
        ,
        "synonyms": ["climb", "rise", "go-up"]
    },
    {
        "word": "ASSASSINATE",
        "difficulty": 4,
        "definition": "(v.) To deliberately and suddenly kill a prominent or important person, especially for political reasons."
        ,
        "synonyms": ["eliminate", "remove", "take-down"]
    },
    {
        "word": "ASTHMA",
        "difficulty": 3,
        "definition": "(n.) A respiratory condition marked by spasms in the bronchi of the lungs, causing difficulty in breathing."
        ,
        "synonyms": ["breathing-disorder", "respiratory-condition", "lung-disease"]
    },
    {
        "word": "ATHEIST",
        "difficulty": 3,
        "definition": "(n.) A person who disbelieves in the existence of God."
        ,
        "synonyms": ["non-believer", "agnostic", "freethinker"]
    },
    {
        "word": "ATHLETIC",
        "difficulty": 1,
        "definition": "(adj.) Physically strong, fit, and active."
        ,
        "synonyms": ["sporty", "fit", "active"]
    },
    {
        "word": "ATTENDANCE",
        "difficulty": 1,
        "definition": "(n.) The action or state of going regularly to or being present at a place or event."
        ,
        "synonyms": ["presence", "participation", "turnout"]
    },
    {
        "word": "AUXILIARY",
        "difficulty": 4,
        "definition": "(adj./n.) Providing supplementary or additional help and support."
        ,
        "synonyms": ["supplementary", "additional", "supporting"]
    },
    {
        "word": "AWFUL",
        "difficulty": 1,
        "definition": "(adj.) Very bad or unpleasant."
        ,
        "synonyms": ["terrible", "dreadful", "horrible"]
    },
    {
        "word": "BALLOON",
        "difficulty": 1,
        "definition": "(n./v.) A small colored rubber bag which is inflated with air and then sealed at the neck, used as a child's toy or a decoration."
        ,
        "synonyms": ["inflate", "float", "expand"]
    },
    {
        "word": "BARBECUE",
        "difficulty": 3,
        "definition": "(n./v.) A meal or gathering at which meat, fish, or other food is cooked out of doors on a rack over an open fire or on a special appliance."
        ,
        "synonyms": ["grill", "cookout", "roast"]
    },
    {
        "word": "BARGAIN",
        "difficulty": 1,
        "definition": "(n./v.) A thing bought or offered for sale more cheaply than is usual or expected."
        ,
        "synonyms": ["deal", "negotiate", "agreement"]
    },
    {
        "word": "BASICALLY",
        "difficulty": 1,
        "definition": "(adv.) In the most essential respects; fundamentally."
        ,
        "synonyms": ["fundamentally", "essentially", "chiefly"]
    },
    {
        "word": "BEGGAR",
        "difficulty": 3,
        "definition": "(n./v.) A person, typically a homeless one, who lives by asking for money or food."
        ,
        "synonyms": ["pauper", "mendicant", "panhandler"]
    },
    {
        "word": "BEGINNING",
        "difficulty": 1,
        "definition": "(n.) The point in time or space at which something starts."
        ,
        "synonyms": ["start", "origin", "commencement"]
    },
    {
        "word": "BELIEF",
        "difficulty": 1,
        "definition": "(n.) An acceptance that a statement is true or that something exists."
        ,
        "synonyms": ["conviction", "faith", "opinion"]
    },
    {
        "word": "BELIEVE",
        "difficulty": 1,
        "definition": "(v.) Accept as true; feel sure of the truth of."
        ,
        "synonyms": ["trust", "accept", "think"]
    },
    {
        "word": "BENEFICIAL",
        "difficulty": 3,
        "definition": "(adj.) Favorable or advantageous; resulting in good."
        ,
        "synonyms": ["helpful", "advantageous", "useful"]
    },
    {
        "word": "BENEFIT",
        "difficulty": 1,
        "definition": "(n./v.) An advantage or profit gained from something."
        ,
        "synonyms": ["advantage", "gain", "profit"]
    },
    {
        "word": "BISCUIT",
        "difficulty": 3,
        "definition": "(n.) A small baked unleavened cake, typically crisp, flat, and sweet."
        ,
        "synonyms": ["cracker", "cookie", "scone"]
    },
    {
        "word": "BOUNDARIES",
        "difficulty": 3,
        "definition": "(n.) A line that marks the limits of an area; a dividing line."
        ,
        "synonyms": ["limits", "borders", "confines"]
    },
    {
        "word": "BRILLIANT",
        "difficulty": 3,
        "definition": "(adj.) Very bright and radiant; exceptionally clever."
        ,
        "synonyms": ["bright", "outstanding", "genius"]
    },
    {
        "word": "BUREAUCRACY",
        "difficulty": 4,
        "definition": "(n.) A system of government in which most of the important decisions are made by state officials rather than by elected representatives."
        ,
        "synonyms": ["administration", "red-tape", "officialdom"]
    },
    {
        "word": "BUSINESS",
        "difficulty": 1,
        "definition": "(n.) A person's regular occupation, profession, or trade."
        ,
        "synonyms": ["commerce", "trade", "enterprise"]
    },
    {
        "word": "CALENDAR",
        "difficulty": 1,
        "definition": "(n.) A chart showing the days, weeks, and months of a year."
        ,
        "synonyms": ["schedule", "planner", "datebook"]
    },
    {
        "word": "CAMOUFLAGE",
        "difficulty": 3,
        "definition": "(n./v.) The disguising of military personnel, equipment, and installations by painting or covering them to make them blend in with their surroundings."
        ,
        "synonyms": ["disguise", "concealment", "cover"]
    },
    {
        "word": "CANDIDATE",
        "difficulty": 1,
        "definition": "(n.) A person who applies for a job or is nominated for election."
        ,
        "synonyms": ["applicant", "contender", "nominee"]
    },
    {
        "word": "CARAMEL",
        "difficulty": 3,
        "definition": "(n./adj.) Sugar or syrup heated until it turns brown, used as a flavoring or coloring for food or drink."
        ,
        "synonyms": ["toffee", "butterscotch", "burnt-sugar"]
    },
    {
        "word": "CATEGORY",
        "difficulty": 1,
        "definition": "(n.) A class or division of people or things."
        ,
        "synonyms": ["class", "group", "type"]
    },
    {
        "word": "CEMETERY",
        "difficulty": 3,
        "definition": "(n.) A burial ground or a graveyard."
        ,
        "synonyms": ["graveyard", "burial-ground", "churchyard"]
    },
    {
        "word": "CHALLENGE",
        "difficulty": 1,
        "definition": "(n./v.) A call to take part in a contest or task that tests someone's abilities."
        ,
        "synonyms": ["test", "difficulty", "confront"]
    },
    {
        "word": "CHANGEABLE",
        "difficulty": 3,
        "definition": "(adj.) Prone to variation or alteration; not fixed or stable."
        ,
        "synonyms": ["variable", "unstable", "fickle"]
    },
    {
        "word": "CHANGING",
        "difficulty": 1,
        "definition": "(v./adj.) Becoming different."
        ,
        "synonyms": ["altering", "shifting", "transforming"]
    },
    {
        "word": "CHARACTERISTIC",
        "difficulty": 3,
        "definition": "(adj./n.) A feature or quality belonging typically to a person, place, or thing and serving to identify it."
        ,
        "synonyms": ["trait", "quality", "feature"]
    },
    {
        "word": "CHIEF",
        "difficulty": 1,
        "definition": "(n./adj.) A leader or ruler of a people or clan."
        ,
        "synonyms": ["leader", "head", "main"]
    },
    {
        "word": "CHOOSE",
        "difficulty": 1,
        "definition": "(v.) Pick out or select (someone or something) as being the best or most appropriate of two or more alternatives."
        ,
        "synonyms": ["select", "pick", "opt"]
    },
    {
        "word": "CHOSE",
        "difficulty": 1,
        "definition": "(v.) Made a selection from available options."
        ,
        "synonyms": ["selected", "picked", "opted"]
    },
    {
        "word": "CHRYSANTHEMUM",
        "difficulty": 5,
        "definition": "(n.) A plant of the daisy family with brightly colored ornamental flowers, typically blooming in autumn."
        ,
        "synonyms": ["mum", "flower", "autumn-bloom"]
    },
    {
        "word": "CIGARETTE",
        "difficulty": 3,
        "definition": "(n.) A thin cylinder of finely cut tobacco rolled in paper for smoking."
        ,
        "synonyms": ["smoke", "tobacco", "fag"]
    },
    {
        "word": "CLIMBED",
        "difficulty": 1,
        "definition": "(v.) Moved upward using the hands and feet, or ascended gradually."
        ,
        "synonyms": ["ascended", "scaled", "went-up"]
    },
    {
        "word": "CLOTH",
        "difficulty": 1,
        "definition": "(n.) Woven or felted fabric made from wool, cotton, or a similar fiber."
        ,
        "synonyms": ["fabric", "textile", "material"]
    },
    {
        "word": "CLOTHES",
        "difficulty": 1,
        "definition": "(n.) Items worn to cover the body."
        ,
        "synonyms": ["garments", "clothing", "attire"]
    },
    {
        "word": "CLOTHING",
        "difficulty": 1,
        "definition": "(n.) Garments and wearable items that cover and protect the body."
        ,
        "synonyms": ["garments", "attire", "dress"]
    },
    {
        "word": "COINCIDENCE",
        "difficulty": 3,
        "definition": "(n.) A remarkable concurrence of events or circumstances without apparent causal connection."
        ,
        "synonyms": ["chance", "accident", "fluke"]
    },
    {
        "word": "COLLECTIBLE",
        "difficulty": 3,
        "definition": "(adj./n.) An object considered desirable for its rarity, age, or cultural significance."
        ,
        "synonyms": ["antique", "keepsake", "memorabilia"]
    },
    {
        "word": "COLONEL",
        "difficulty": 3,
        "definition": "(n.) A senior military officer ranking above a major and below a general."
        ,
        "synonyms": ["officer", "commander", "military-rank"]
    },
    {
        "word": "COLUMN",
        "difficulty": 1,
        "definition": "(n.) A vertical arrangement of items, or a pillar."
        ,
        "synonyms": ["pillar", "post", "article"]
    },
    {
        "word": "COLUMNIST",
        "difficulty": 3,
        "definition": "(n.) A journalist who regularly writes a dedicated section of a newspaper or magazine."
        ,
        "synonyms": ["writer", "journalist", "commentator"]
    },
    {
        "word": "COMING",
        "difficulty": 1,
        "definition": "(v./adj./n.) Approaching or arriving."
        ,
        "synonyms": ["arriving", "forthcoming", "approaching"]
    },
    {
        "word": "COMMISSION",
        "difficulty": 3,
        "definition": "(n./v.) An instruction, command, or duty given to a person or group of people."
        ,
        "synonyms": ["task", "mandate", "fee"]
    },
    {
        "word": "COMMITMENT",
        "difficulty": 1,
        "definition": "(n.) The state or quality of being dedicated to a cause, activity, etc."
        ,
        "synonyms": ["dedication", "pledge", "obligation"]
    },
    {
        "word": "COMMITTEE",
        "difficulty": 3,
        "definition": "(n.) A group of people appointed for a specific function."
        ,
        "synonyms": ["board", "panel", "group"]
    },
    {
        "word": "COMPARATIVE",
        "difficulty": 3,
        "definition": "(adj./n.) Measured against a standard or another thing; the middle degree between positive and superlative."
        ,
        "synonyms": ["relative", "analogous", "proportional"]
    },
    {
        "word": "COMPETENT",
        "difficulty": 1,
        "definition": "(adj.) Having the necessary ability, knowledge, or skill to do something successfully."
        ,
        "synonyms": ["capable", "skilled", "qualified"]
    },
    {
        "word": "COMPLETELY",
        "difficulty": 1,
        "definition": "(adv.) Totally; utterly."
        ,
        "synonyms": ["entirely", "wholly", "totally"]
    },
    {
        "word": "CONCEDE",
        "difficulty": 3,
        "definition": "(v.) Admit that something is true or valid after first denying or resisting it."
        ,
        "synonyms": ["admit", "yield", "grant"]
    },
    {
        "word": "CONCEIVABLE",
        "difficulty": 4,
        "definition": "(adj.) Capable of being imagined or grasped mentally."
        ,
        "synonyms": ["possible", "imaginable", "thinkable"]
    },
    {
        "word": "CONCEIVE",
        "difficulty": 3,
        "definition": "(v.) Become pregnant with (a child)."
        ,
        "synonyms": ["imagine", "devise", "think-up"]
    },
    {
        "word": "CONDEMN",
        "difficulty": 3,
        "definition": "(v.) Express complete disapproval of, typically in public; censure."
        ,
        "synonyms": ["denounce", "censure", "criticize"]
    },
    {
        "word": "CONDESCEND",
        "difficulty": 3,
        "definition": "(v.) Show feelings of superiority; be patronizing."
        ,
        "synonyms": ["patronize", "deign", "stoop"]
    },
    {
        "word": "CONNOISSEUR",
        "difficulty": 5,
        "definition": "(n.) An expert judge in matters of taste."
        ,
        "synonyms": ["expert", "authority", "aficionado"]
    },
    {
        "word": "CONSCIENCE",
        "difficulty": 3,
        "definition": "(n.) An inner feeling acting as a guide to rightness."
        ,
        "synonyms": ["morals", "ethics", "inner-voice"]
    },
    {
        "word": "CONSCIENTIOUS",
        "difficulty": 5,
        "definition": "(adj.) (Of a person) wishing to do what is right, especially to do one's work or duty well and thoroughly."
        ,
        "synonyms": ["diligent", "thorough", "careful"]
    },
    {
        "word": "CONSCIOUS",
        "difficulty": 1,
        "definition": "(adj.) Aware of and responding to one's surroundings."
        ,
        "synonyms": ["aware", "awake", "alert"]
    },
    {
        "word": "CONSENSUS",
        "difficulty": 3,
        "definition": "(n.) General agreement."
        ,
        "synonyms": ["agreement", "accord", "unanimity"]
    },
    {
        "word": "CONSISTENT",
        "difficulty": 1,
        "definition": "(adj.) Acting or done in the same way over time, especially so as to be fair or accurate."
        ,
        "synonyms": ["uniform", "steady", "constant"]
    },
    {
        "word": "CONTINUOUS",
        "difficulty": 3,
        "definition": "(adj.) Forming an unbroken whole; without interruption."
        ,
        "synonyms": ["unbroken", "ongoing", "perpetual"]
    },
    {
        "word": "CONTROLLED",
        "difficulty": 1,
        "definition": "(v./adj.) Managed or kept in check."
        ,
        "synonyms": ["regulated", "managed", "restrained"]
    },
    {
        "word": "CONTROVERSIAL",
        "difficulty": 4,
        "definition": "(adj.) Giving rise or likely to give rise to public disagreement."
        ,
        "synonyms": ["disputed", "contentious", "divisive"]
    },
    {
        "word": "CONTROVERSY",
        "difficulty": 3,
        "definition": "(n.) Disagreement, typically when prolonged, public, and heated."
        ,
        "synonyms": ["dispute", "debate", "conflict"]
    },
    {
        "word": "CONVALESCE",
        "difficulty": 4,
        "definition": "(v.) Recover one's health and strength over time after an illness or operation."
        ,
        "synonyms": ["recover", "heal", "recuperate"]
    },
    {
        "word": "CONVENIENT",
        "difficulty": 3,
        "definition": "(adj.) Fitting in well with a person's needs, activities, and plans."
        ,
        "synonyms": ["handy", "suitable", "accessible"]
    },
    {
        "word": "COOLLY",
        "difficulty": 3,
        "definition": "(adv.) In a calm and unemotional manner."
        ,
        "synonyms": ["calmly", "dispassionately", "calmly"]
    },
    {
        "word": "CORRELATE",
        "difficulty": 3,
        "definition": "(v./n.) Have a mutual relationship or connection, in which one thing affects or depends on another."
        ,
        "synonyms": ["link", "connect", "associate"]
    },
    {
        "word": "CORRESPONDENCE",
        "difficulty": 4,
        "definition": "(n.) Communication by exchanging letters with someone."
        ,
        "synonyms": ["letters", "communication", "connection"]
    },
    {
        "word": "COUNSELOR",
        "difficulty": 3,
        "definition": "(n.) A person trained to give guidance on personal, social, or psychological problems."
        ,
        "synonyms": ["advisor", "guide", "mentor"]
    },
    {
        "word": "COURTEOUS",
        "difficulty": 4,
        "definition": "(adj.) Polite, respectful, or considerate in manner."
        ,
        "synonyms": ["polite", "respectful", "civil"]
    },
    {
        "word": "COURTESY",
        "difficulty": 3,
        "definition": "(n.) The showing of politeness in one's attitude and behavior toward others."
        ,
        "synonyms": ["politeness", "respect", "manners"]
    },
    {
        "word": "CRITICISM",
        "difficulty": 1,
        "definition": "(n.) The expression of disapproval of someone or something based on perceived faults or mistakes."
        ,
        "synonyms": ["critique", "feedback", "judgment"]
    },
    {
        "word": "CRITICIZE",
        "difficulty": 3,
        "definition": "(v.) Indicate the faults of (someone or something) in a disapproving way."
        ,
        "synonyms": ["judge", "censure", "find-fault"]
    },
    {
        "word": "CURIOSITY",
        "difficulty": 1,
        "definition": "(n.) A strong desire to know or learn something."
        ,
        "synonyms": ["inquisitiveness", "interest", "wonder"]
    },
    {
        "word": "CURRICULUM",
        "difficulty": 3,
        "definition": "(n.) The subjects comprising a course of study in a school or college."
        ,
        "synonyms": ["syllabus", "course", "program"]
    },
    {
        "word": "DACHSHUND",
        "difficulty": 5,
        "definition": "(n.) A dog of a short-legged, long-bodied breed."
        ,
        "synonyms": ["dog", "wiener-dog", "hound"]
    },
    {
        "word": "DAIQUIRI",
        "difficulty": 5,
        "definition": "(n.) A cocktail containing rum, lime juice, and sugar."
        ,
        "synonyms": ["cocktail", "rum-drink", "beverage"]
    },
    {
        "word": "DEBRIS",
        "difficulty": 3,
        "definition": "(n.) Scattered fragments, typically of something wrecked or destroyed."
        ,
        "synonyms": ["rubble", "ruins", "wreckage"]
    },
    {
        "word": "DECEIVE",
        "difficulty": 3,
        "definition": "(v.) To cause someone to believe what is not true."
        ,
        "synonyms": ["mislead", "trick", "delude"]
    },
    {
        "word": "DEDUCTIBLE",
        "difficulty": 3,
        "definition": "(adj./n.) An amount that can be subtracted from income before tax is calculated."
        ,
        "synonyms": ["exempt", "allowable", "tax-deductible"]
    },
    {
        "word": "DEFENDANT",
        "difficulty": 3,
        "definition": "(n.) An individual, company, or institution sued or accused in a court of law."
        ,
        "synonyms": ["accused", "respondent", "charged-party"]
    },
    {
        "word": "DEFERRED",
        "difficulty": 3,
        "definition": "(v./adj.) Put off (an action or event) to a later time; postpone."
        ,
        "synonyms": ["postponed", "delayed", "put-off"]
    },
    {
        "word": "DEFINITELY",
        "difficulty": 3,
        "definition": "(adv.) Without any doubt; unambiguously."
        ,
        "synonyms": ["certainly", "absolutely", "without-doubt"]
    },
    {
        "word": "DEFINITION",
        "difficulty": 1,
        "definition": "(n.) A statement of the exact meaning of a word, especially in a dictionary."
        ,
        "synonyms": ["meaning", "explanation", "description"]
    },
    {
        "word": "DEPENDENT",
        "difficulty": 1,
        "definition": "(adj./n.) Contingent on or determined by."
        ,
        "synonyms": ["reliant", "subordinate", "conditional"]
    },
    {
        "word": "DESCEND",
        "difficulty": 1,
        "definition": "(v.) Move or fall downward."
        ,
        "synonyms": ["go-down", "fall", "drop"]
    },
    {
        "word": "DESCENDANT",
        "difficulty": 3,
        "definition": "(n./adj.) An offspring or later generation of a person or organism; coming from an earlier source."
        ,
        "synonyms": ["offspring", "heir", "successor"]
    },
    {
        "word": "DESCRIBE",
        "difficulty": 1,
        "definition": "(v.) Give an account in words of (someone or something), including all the relevant characteristics, qualities, or events."
        ,
        "synonyms": ["depict", "explain", "portray"]
    },
    {
        "word": "DESCRIPTION",
        "difficulty": 3,
        "definition": "(n.) A spoken or written representation or account of a person, object, or event."
        ,
        "synonyms": ["account", "portrayal", "explanation"]
    },
    {
        "word": "DESIRABLE",
        "difficulty": 3,
        "definition": "(adj./n.) Wanted or wished for as being attractive, useful, or necessary to course of action."
        ,
        "synonyms": ["attractive", "wanted", "appealing"]
    },
    {
        "word": "DESPAIR",
        "difficulty": 1,
        "definition": "(n./v.) The complete loss or absence of hope."
        ,
        "synonyms": ["hopelessness", "despondency", "anguish"]
    },
    {
        "word": "DESPERATE",
        "difficulty": 3,
        "definition": "(adj.) Feeling or showing a hopeless sense."
        ,
        "synonyms": ["frantic", "hopeless", "urgent"]
    },
    {
        "word": "DETERRENT",
        "difficulty": 3,
        "definition": "(n./adj.) A thing that discourages or is intended to discourage someone from doing something."
        ,
        "synonyms": ["obstacle", "discouragement", "preventive"]
    },
    {
        "word": "DEVELOP",
        "difficulty": 1,
        "definition": "(v.) Grow or cause to grow and become more mature, advanced, or elaborate."
        ,
        "synonyms": ["grow", "evolve", "advance"]
    },
    {
        "word": "DICTIONARY",
        "difficulty": 1,
        "definition": "(n.) A book or electronic resource that lists the words of a language (typically in alphabetical order) and gives their meaning, or gives the equivalent words in a different language."
        ,
        "synonyms": ["lexicon", "glossary", "wordbook"]
    },
    {
        "word": "DIFFERENCE",
        "difficulty": 1,
        "definition": "(n.) A point in which things are not the same."
        ,
        "synonyms": ["distinction", "variation", "contrast"]
    },
    {
        "word": "DILEMMA",
        "difficulty": 3,
        "definition": "(n.) A situation where a difficult choice has to be made."
        ,
        "synonyms": ["predicament", "quandary", "problem"]
    },
    {
        "word": "DINING",
        "difficulty": 1,
        "definition": "(v./n.) The activity of eating dinner."
        ,
        "synonyms": ["eating", "feasting", "mealtime"]
    },
    {
        "word": "DISAPPEARANCE",
        "difficulty": 3,
        "definition": "(n.) An instance or fact of someone or something ceasing to be visible or passing out of sight."
        ,
        "synonyms": ["vanishing", "absence", "evanescence"]
    },
    {
        "word": "DISAPPOINT",
        "difficulty": 1,
        "definition": "(v.) Fail to fulfill the hopes or expectations of."
        ,
        "synonyms": ["let-down", "fail", "frustrate"]
    },
    {
        "word": "DISASTROUS",
        "difficulty": 3,
        "definition": "(adj.) Causing great damage."
        ,
        "synonyms": ["catastrophic", "devastating", "ruinous"]
    },
    {
        "word": "DISCIPLINE",
        "difficulty": 3,
        "definition": "(n./v.) The practice of training people to obey rules."
        ,
        "synonyms": ["control", "training", "order"]
    },
    {
        "word": "DISEASE",
        "difficulty": 1,
        "definition": "(n.) A disorder of structure or function in a human, animal, or plant, especially one that produces specific signs or symptoms or that affects a specific location and is not simply a direct result of physical injury."
        ,
        "synonyms": ["illness", "sickness", "ailment"]
    },
    {
        "word": "DISPENSABLE",
        "difficulty": 3,
        "definition": "(adj.) Able to be replaced or done away with; not necessary."
        ,
        "synonyms": ["unnecessary", "expendable", "disposable"]
    },
    {
        "word": "DISSATISFIED",
        "difficulty": 3,
        "definition": "(adj.) Not content or happy with something."
        ,
        "synonyms": ["displeased", "unhappy", "discontented"]
    },
    {
        "word": "DISSIPATE",
        "difficulty": 4,
        "definition": "(v.) Disperse or scatter."
        ,
        "synonyms": ["scatter", "disperse", "waste"]
    },
    {
        "word": "DOMINANT",
        "difficulty": 1,
        "definition": "(adj./n.) Most important, powerful, or influential."
        ,
        "synonyms": ["leading", "ruling", "prevailing"]
    },
    {
        "word": "DUMBBELL",
        "difficulty": 3,
        "definition": "(n.) A short bar with a weight at each end, used typically in pairs for exercise or muscle-building."
        ,
        "synonyms": ["weight", "barbell", "dumb-iron"]
    },
    {
        "word": "EASILY",
        "difficulty": 1,
        "definition": "(adv.) Without difficulty or effort."
        ,
        "synonyms": ["effortlessly", "readily", "simply"]
    },
    {
        "word": "ECSTASY",
        "difficulty": 4,
        "definition": "(n.) An overwhelming feeling of great happiness."
        ,
        "synonyms": ["bliss", "joy", "euphoria"]
    },
    {
        "word": "EFFECT",
        "difficulty": 1,
        "definition": "(n./v.) A change which is a result of an action."
        ,
        "synonyms": ["result", "outcome", "impact"]
    },
    {
        "word": "EFFICIENCY",
        "difficulty": 3,
        "definition": "(n.) The ability to achieve success with minimal waste or effort."
        ,
        "synonyms": ["productivity", "effectiveness", "economy"]
    },
    {
        "word": "EIGHTH",
        "difficulty": 3,
        "definition": "(num./n./adj.) Constituting number eight in a sequence; 8th."
        ,
        "synonyms": ["one-eighth", "ordinal", "fraction"]
    },
    {
        "word": "EITHER",
        "difficulty": 1,
        "definition": "(pron./adv./conj.) One or the other of two options; used to indicate a choice between two possibilities."
        ,
        "synonyms": ["one-or-other", "each", "both"]
    },
    {
        "word": "ELIGIBILITY",
        "difficulty": 3,
        "definition": "(n.) The quality of being qualified or entitled to something."
        ,
        "synonyms": ["qualification", "suitability", "entitlement"]
    },
    {
        "word": "ELIGIBLE",
        "difficulty": 3,
        "definition": "(adj.) Having the right to do or obtain something; satisfying the appropriate conditions."
        ,
        "synonyms": ["qualified", "suitable", "entitled"]
    },
    {
        "word": "ELIMINATE",
        "difficulty": 1,
        "definition": "(v.) Completely remove or get rid of something."
        ,
        "synonyms": ["remove", "eradicate", "exclude"]
    },
    {
        "word": "EMBARRASS",
        "difficulty": 3,
        "definition": "(v.) Cause to feel awkward or self-conscious."
        ,
        "synonyms": ["humiliate", "shame", "fluster"]
    },
    {
        "word": "EMPEROR",
        "difficulty": 1,
        "definition": "(n.) A sovereign ruler of great power and rank, especially one ruling an empire."
        ,
        "synonyms": ["ruler", "sovereign", "monarch"]
    },
    {
        "word": "ENCOURAGEMENT",
        "difficulty": 3,
        "definition": "(n.) Words or actions that give someone confidence, support, or motivation."
        ,
        "synonyms": ["support", "motivation", "boost"]
    },
    {
        "word": "ENCOURAGING",
        "difficulty": 3,
        "definition": "(v./adj.) Giving someone support or confidence; supportive."
        ,
        "synonyms": ["supportive", "uplifting", "reassuring"]
    },
    {
        "word": "ENEMY",
        "difficulty": 1,
        "definition": "(n./adj.) A person who is actively opposed or hostile to someone or something."
        ,
        "synonyms": ["foe", "adversary", "opponent"]
    },
    {
        "word": "ENTIRELY",
        "difficulty": 1,
        "definition": "(adv.) Completely (often used for emphasis)."
        ,
        "synonyms": ["completely", "wholly", "totally"]
    },
    {
        "word": "ENTREPRENEUR",
        "difficulty": 5,
        "definition": "(n.) A person who organizes and operates a business or businesses, taking on greater than normal financial risks in order to do so."
        ,
        "synonyms": ["businessperson", "innovator", "founder"]
    },
    {
        "word": "ENVIRONMENT",
        "difficulty": 1,
        "definition": "(n.) The surroundings or conditions in which one lives."
        ,
        "synonyms": ["surroundings", "habitat", "ecosystem"]
    },
    {
        "word": "EQUIPMENT",
        "difficulty": 1,
        "definition": "(n.) The necessary items for a particular purpose."
        ,
        "synonyms": ["gear", "tools", "apparatus"]
    },
    {
        "word": "EQUIPPED",
        "difficulty": 3,
        "definition": "(v./adj.) Supplied with the necessary items for a particular purpose."
        ,
        "synonyms": ["prepared", "furnished", "outfitted"]
    },
    {
        "word": "EQUIVALENT",
        "difficulty": 3,
        "definition": "(adj./n.) Equal in value, amount, function, meaning, etc."
        ,
        "synonyms": ["equal", "matching", "interchangeable"]
    },
    {
        "word": "ESPECIALLY",
        "difficulty": 1,
        "definition": "(adv.) Used to single out one person, thing, or situation over all others."
        ,
        "synonyms": ["particularly", "specifically", "above-all"]
    },
    {
        "word": "ETIQUETTE",
        "difficulty": 4,
        "definition": "(n.) The customary code of polite behavior in society or among members of a particular profession or group."
        ,
        "synonyms": ["manners", "protocol", "decorum"]
    },
    {
        "word": "EXAGGERATE",
        "difficulty": 3,
        "definition": "(v.) To represent something as being larger than it is."
        ,
        "synonyms": ["overstate", "embellish", "amplify"]
    },
    {
        "word": "EXCEED",
        "difficulty": 1,
        "definition": "(v.) To be greater in number or size than something."
        ,
        "synonyms": ["surpass", "outdo", "go-beyond"]
    },
    {
        "word": "EXCELLENCE",
        "difficulty": 3,
        "definition": "(n.) The quality of being outstanding or extremely good."
        ,
        "synonyms": ["superiority", "quality", "distinction"]
    },
    {
        "word": "EXHAUST",
        "difficulty": 3,
        "definition": "(v./n.) Drain (someone) of their physical or mental resources; tire out."
        ,
        "synonyms": ["deplete", "tire", "drain"]
    },
    {
        "word": "EXHILARATE",
        "difficulty": 5,
        "definition": "(v.) To make someone feel very happy; thrill."
        ,
        "synonyms": ["thrill", "excite", "invigorate"]
    },
    {
        "word": "EXISTENCE",
        "difficulty": 3,
        "definition": "(n.) The fact or state of living or having reality."
        ,
        "synonyms": ["being", "life", "reality"]
    },
    {
        "word": "EXISTENT",
        "difficulty": 3,
        "definition": "(adj.) Currently real or in operation; actually present."
        ,
        "synonyms": ["real", "present", "actual"]
    },
    {
        "word": "EXPENSE",
        "difficulty": 2,
        "definition": "(n./v.) The cost required for something; the money spent on something."
        ,
        "synonyms": ["cost", "price", "expenditure"]
    },
    {
        "word": "EXPERIENCE",
        "difficulty": 2,
        "definition": "(n./v.) Knowledge or skill acquired by practical contact."
        ,
        "synonyms": ["encounter", "knowledge", "involvement"]
    },
    {
        "word": "EXPERIMENT",
        "difficulty": 2,
        "definition": "(n./v.) A scientific procedure undertaken to make a discovery, test a hypothesis, or demonstrate a known fact."
        ,
        "synonyms": ["test", "trial", "investigation"]
    },
    {
        "word": "EXPLANATION",
        "difficulty": 3,
        "definition": "(n.) A statement or account that makes something clear."
        ,
        "synonyms": ["clarification", "account", "description"]
    },
    {
        "word": "EXTREMELY",
        "difficulty": 2,
        "definition": "(adv.) To a very great degree; very."
        ,
        "synonyms": ["very", "exceedingly", "intensely"]
    },
    {
        "word": "EXUBERANCE",
        "difficulty": 4,
        "definition": "(n.) The quality of being full of energy, excitement, and cheerfulness; ebullience."
        ,
        "synonyms": ["enthusiasm", "vitality", "liveliness"]
    },
    {
        "word": "FACSIMILE",
        "difficulty": 4,
        "definition": "(n./v.) An exact copy, especially of written or printed material."
        ,
        "synonyms": ["copy", "duplicate", "replica"]
    },
    {
        "word": "FAHRENHEIT",
        "difficulty": 4,
        "definition": "(n.) Of or denoting a scale of temperature on which water freezes at 32° and boils at 212° under standard conditions."
        ,
        "synonyms": ["temperature-scale", "heat-measure", "degree-F"]
    },
    {
        "word": "FALLACIOUS",
        "difficulty": 4,
        "definition": "(adj.) Based on a mistaken belief."
        ,
        "synonyms": ["false", "misleading", "erroneous"]
    },
    {
        "word": "FALLACY",
        "difficulty": 3,
        "definition": "(n.) A mistaken belief, especially one based on unsound argument."
        ,
        "synonyms": ["error", "misconception", "false-belief"]
    },
    {
        "word": "FAMILIAR",
        "difficulty": 2,
        "definition": "(adj./n.) Well known from long or close association."
        ,
        "synonyms": ["known", "comfortable", "friendly"]
    },
    {
        "word": "FASCINATING",
        "difficulty": 3,
        "definition": "(adj.) Extremely interesting."
        ,
        "synonyms": ["captivating", "intriguing", "enthralling"]
    },
    {
        "word": "FEASIBLE",
        "difficulty": 3,
        "definition": "(adj.) Possible to do easily or conveniently."
        ,
        "synonyms": ["possible", "practicable", "doable"]
    },
    {
        "word": "FEBRUARY",
        "difficulty": 3,
        "definition": "(n.) The second month of the year, in the northern hemisphere usually considered the last month of winter."
        ,
        "synonyms": ["second-month", "winter-month", "mid-winter"]
    },
    {
        "word": "FICTITIOUS",
        "difficulty": 4,
        "definition": "(adj.) Not real or true, being imaginary or fabricated."
        ,
        "synonyms": ["fictional", "imaginary", "false"]
    },
    {
        "word": "FIERY",
        "difficulty": 3,
        "definition": "(adj.) Consisting of fire or burning strongly."
        ,
        "synonyms": ["blazing", "passionate", "hot"]
    },
    {
        "word": "FINALLY",
        "difficulty": 1,
        "definition": "(adv.) After a long time, typically when there has been difficulty or delay."
        ,
        "synonyms": ["ultimately", "lastly", "eventually"]
    },
    {
        "word": "FINANCIALLY",
        "difficulty": 3,
        "definition": "(adv.) In a way that relates to money."
        ,
        "synonyms": ["monetarily", "economically", "fiscally"]
    },
    {
        "word": "FLUORESCENT",
        "difficulty": 4,
        "definition": "(adj./n.) Emitting light after absorbing radiation."
        ,
        "synonyms": ["glowing", "luminous", "bright"]
    },
    {
        "word": "FORCIBLY",
        "difficulty": 3,
        "definition": "(adv.) In a way that involves physical force or violence."
        ,
        "synonyms": ["by-force", "coercively", "violently"]
    },
    {
        "word": "FOREHEAD",
        "difficulty": 2,
        "definition": "(n.) The part of the face above the eyebrows."
        ,
        "synonyms": ["brow", "front", "temple"]
    },
    {
        "word": "FOREIGN",
        "difficulty": 2,
        "definition": "(adj.) Of, from, or in a country other than one's own."
        ,
        "synonyms": ["international", "alien", "overseas"]
    },
    {
        "word": "FOREIGNER",
        "difficulty": 2,
        "definition": "(n.) A person from a country other than one's own."
        ,
        "synonyms": ["alien", "outsider", "non-native"]
    },
    {
        "word": "FORESEE",
        "difficulty": 2,
        "definition": "(v.) Be aware of beforehand; predict."
        ,
        "synonyms": ["anticipate", "predict", "envision"]
    },
    {
        "word": "FORFEIT",
        "difficulty": 3,
        "definition": "(v./n./adj.) To lose or give up something as a penalty for wrongdoing or failure."
        ,
        "synonyms": ["surrender", "sacrifice", "give-up"]
    },
    {
        "word": "FORMERLY",
        "difficulty": 2,
        "definition": "(adv.) In the past; in earlier times."
        ,
        "synonyms": ["previously", "once", "in-the-past"]
    },
    {
        "word": "FORTY",
        "difficulty": 2,
        "definition": "(num./n./adj.) The number equivalent to four times ten."
        ,
        "synonyms": ["four-tens", "score-and-twenty", "numeral"]
    },
    {
        "word": "FORWARD",
        "difficulty": 1,
        "definition": "(adv./adj./v.) In the direction that one is facing."
        ,
        "synonyms": ["ahead", "onward", "advance"]
    },
    {
        "word": "FOURTH",
        "difficulty": 2,
        "definition": "(num./n./adj.) Constituting number four in a sequence; 4th."
        ,
        "synonyms": ["one-quarter", "ordinal", "next-after-third"]
    },
    {
        "word": "FRIEND",
        "difficulty": 1,
        "definition": "(n.) A person whom one knows and has a bond with."
        ,
        "synonyms": ["companion", "ally", "confidant"]
    },
    {
        "word": "FUELLING",
        "difficulty": 3,
        "definition": "(v.) Supplying energy or material needed to sustain activity."
        ,
        "synonyms": ["powering", "charging", "feeding"]
    },
    {
        "word": "FULFILL",
        "difficulty": 2,
        "definition": "(v.) Carry out as required, promised, or expected."
        ,
        "synonyms": ["complete", "satisfy", "achieve"]
    },
    {
        "word": "FUNDAMENTALLY",
        "difficulty": 3,
        "definition": "(adv.) In central or primary respects."
        ,
        "synonyms": ["essentially", "basically", "primarily"]
    },
    {
        "word": "GAUGE",
        "difficulty": 3,
        "definition": "(n./v.) An instrument or device for measuring."
        ,
        "synonyms": ["measure", "assess", "indicator"]
    },
    {
        "word": "GENERALLY",
        "difficulty": 1,
        "definition": "(adv.) In most cases; usually."
        ,
        "synonyms": ["usually", "typically", "broadly"]
    },
    {
        "word": "GENEROSITY",
        "difficulty": 3,
        "definition": "(n.) The quality of freely giving one's time, money, or resources to others without expecting anything in return."
        ,
        "synonyms": ["giving", "charity", "benevolence"]
    },
    {
        "word": "GENIUS",
        "difficulty": 2,
        "definition": "(n./adj.) Exceptional intellectual or creative power or other natural ability."
        ,
        "synonyms": ["prodigy", "mastermind", "intellect"]
    },
    {
        "word": "GHOST",
        "difficulty": 2,
        "definition": "(n./v.) An apparition of a dead person which is believed to appear or become manifest to the living, typically as a nebulous image."
        ,
        "synonyms": ["spirit", "specter", "phantom"]
    },
    {
        "word": "GLAMOROUS",
        "difficulty": 3,
        "definition": "(adj.) Strikingly attractive or exciting in a way that suggests luxury, elegance, or a charmed life."
        ,
        "synonyms": ["stylish", "dazzling", "alluring"]
    },
    {
        "word": "GNARLED",
        "difficulty": 3,
        "definition": "(adj.) Knobbly, rough, and twisted, especially with age."
        ,
        "synonyms": ["twisted", "knotted", "craggy"]
    },
    {
        "word": "GNAT",
        "difficulty": 3,
        "definition": "(n.) A small two-winged fly that resembles a mosquito. Gnats include both biting and non-biting forms, and they typically form large swarms."
        ,
        "synonyms": ["fly", "insect", "midge"]
    },
    {
        "word": "GNOME",
        "difficulty": 3,
        "definition": "(n.) A legendary dwarfish creature supposed to guard the earth's treasures underground."
        ,
        "synonyms": ["elf", "sprite", "dwarf"]
    },
    {
        "word": "GORGEOUS",
        "difficulty": 3,
        "definition": "(adj.) Beautiful; very attractive."
        ,
        "synonyms": ["beautiful", "stunning", "magnificent"]
    },
    {
        "word": "GOVERNMENT",
        "difficulty": 2,
        "definition": "(n.) The group of people with authority to direct and control the affairs of a country, state, or community."
        ,
        "synonyms": ["administration", "state", "authority"]
    },
    {
        "word": "GOVERNOR",
        "difficulty": 2,
        "definition": "(n.) The elected head of a U.S. state, holding executive authority over its administration."
        ,
        "synonyms": ["ruler", "leader", "executive"]
    },
    {
        "word": "GRAMMAR",
        "difficulty": 2,
        "definition": "(n.) The whole system and structure of a language or of languages in general."
        ,
        "synonyms": ["language-rules", "syntax", "linguistics"]
    },
    {
        "word": "GRATEFUL",
        "difficulty": 2,
        "definition": "(adj.) Feeling or showing an appreciation of kindness; thankful."
        ,
        "synonyms": ["thankful", "appreciative", "obliged"]
    },
    {
        "word": "GRIEVOUS",
        "difficulty": 4,
        "definition": "(adj.) Very severe or serious."
        ,
        "synonyms": ["serious", "severe", "painful"]
    },
    {
        "word": "GUACAMOLE",
        "difficulty": 4,
        "definition": "(n.) A dish of mashed avocado mixed with chopped onion, tomatoes, chili peppers, and seasoning."
        ,
        "synonyms": ["avocado-dip", "dip", "Mexican-condiment"]
    },
    {
        "word": "GUARANTEE",
        "difficulty": 3,
        "definition": "(n./v.) A formal promise or assurance that certain conditions will be fulfilled."
        ,
        "synonyms": ["assurance", "promise", "warranty"]
    },
    {
        "word": "GUARANTEED",
        "difficulty": 3,
        "definition": "(v./adj.) Formal assurance of certain conditions."
        ,
        "synonyms": ["assured", "promised", "certain"]
    },
    {
        "word": "GUARDIAN",
        "difficulty": 2,
        "definition": "(n./adj.) A person who looks after or is legally responsible for someone who is unable to manage their own affairs, especially an incompetent or a child whose parents have died."
        ,
        "synonyms": ["protector", "keeper", "custodian"]
    },
    {
        "word": "GUERRILLA",
        "difficulty": 4,
        "definition": "(n./adj.) A member of a small independent group taking part in irregular fighting, typically against larger regular forces."
        ,
        "synonyms": ["fighter", "insurgent", "partisan"]
    },
    {
        "word": "GUIDANCE",
        "difficulty": 2,
        "definition": "(n.) Advice or information aimed at resolving a problem or difficulty, especially as given by someone in authority."
        ,
        "synonyms": ["direction", "advice", "counsel"]
    },
    {
        "word": "HANDKERCHIEF",
        "difficulty": 4,
        "definition": "(n.) A square of cotton or other finely woven material intended for wiping one's nose, typically carried in a pocket or handbag."
        ,
        "synonyms": ["hanky", "cloth", "kerchief"]
    },
    {
        "word": "HAPPILY",
        "difficulty": 1,
        "definition": "(adv.)  In a way that expresses or reflects joy, contentment, or pleasure."
        ,
        "synonyms": ["joyfully", "cheerfully", "contentedly"]
    },
    {
        "word": "HARASS",
        "difficulty": 3,
        "definition": "(v.) Subject to aggressive pressure or intimidation."
        ,
        "synonyms": ["bother", "pester", "intimidate"]
    },
    {
        "word": "HEIGHT",
        "difficulty": 2,
        "definition": "(n.) The measurement from base to top or from head to foot."
        ,
        "synonyms": ["altitude", "elevation", "tallness"]
    },
    {
        "word": "HEINOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of a person or wrongful act, especially a crime) utterly odious or wicked."
        ,
        "synonyms": ["atrocious", "wicked", "monstrous"]
    },
    {
        "word": "HEMORRHAGE",
        "difficulty": 5,
        "definition": "(n./v.) An escape of blood from a ruptured blood vessel, especially when profuse."
        ,
        "synonyms": ["bleeding", "blood-loss", "hemorrhaging"]
    },
    {
        "word": "HEROES",
        "difficulty": 2,
        "definition": "(n.) People who are admired or idealized for courage, outstanding achievements, or noble qualities."
        ,
        "synonyms": ["champions", "idols", "legends"]
    },
    {
        "word": "HESITANCY",
        "difficulty": 3,
        "definition": "(n.) A tentative or slow manner of acting or speaking."
        ,
        "synonyms": ["uncertainty", "reluctance", "indecision"]
    },
    {
        "word": "HIERARCHY",
        "difficulty": 4,
        "definition": "(n.) A system or organization in which people or groups are ranked one above the other according to status or authority."
        ,
        "synonyms": ["ranking", "order", "chain-of-command"]
    },
    {
        "word": "HINDRANCE",
        "difficulty": 3,
        "definition": "(n.) A thing that provides resistance, delay, or obstruction to something or someone."
        ,
        "synonyms": ["obstacle", "barrier", "obstruction"]
    },
    {
        "word": "HOARSE",
        "difficulty": 3,
        "definition": "(adj.) (Of a person's voice) sounding rough and harsh, typically as the result of a sore throat or of shouting."
        ,
        "synonyms": ["husky", "raspy", "croaky"]
    },
    {
        "word": "HOMOGENEOUS",
        "difficulty": 4,
        "definition": "(adj.) Of the same kind; alike."
        ,
        "synonyms": ["uniform", "consistent", "identical"]
    },
    {
        "word": "HOPING",
        "difficulty": 1,
        "definition": "(v.) Wanting something to happen or be the case."
        ,
        "synonyms": ["wishing", "expecting", "anticipating"]
    },
    {
        "word": "HUMOROUS",
        "difficulty": 3,
        "definition": "(adj.) Causing lighthearted laughter and amusement; funny."
        ,
        "synonyms": ["funny", "comical", "amusing"]
    },
    {
        "word": "HYGIENE",
        "difficulty": 3,
        "definition": "(n.) Conditions or practices conducive to maintaining health and preventing disease, especially through cleanliness."
        ,
        "synonyms": ["cleanliness", "sanitation", "health"]
    },
    {
        "word": "HYPOCRISY",
        "difficulty": 3,
        "definition": "(n.) The practice of claiming to have moral standards or beliefs to which one's own behavior does not conform; pretense."
        ,
        "synonyms": ["insincerity", "deception", "duplicity"]
    },
    {
        "word": "HYPOCRITE",
        "difficulty": 3,
        "definition": "(n.) Someone who pretends to hold beliefs or virtues they do not actually possess."
        ,
        "synonyms": ["fraud", "deceiver", "phony"]
    },
    {
        "word": "IDEAL",
        "difficulty": 1,
        "definition": "(adj./n.) Satisfying one's conception of what is perfect; most suitable."
        ,
        "synonyms": ["perfect", "model", "utopian"]
    },
    {
        "word": "IDEALLY",
        "difficulty": 2,
        "definition": "(adv.) In the best possible way; perfectly."
        ,
        "synonyms": ["perfectly", "optimally", "in-theory"]
    },
    {
        "word": "IDIOCY",
        "difficulty": 3,
        "definition": "(n.) Extremely stupid behavior."
        ,
        "synonyms": ["stupidity", "folly", "foolishness"]
    },
    {
        "word": "IDIOSYNCRASY",
        "difficulty": 5,
        "definition": "(n.) A mode of behavior or way of thought peculiar to an individual."
        ,
        "synonyms": ["quirk", "peculiarity", "eccentricity"]
    },
    {
        "word": "IGNORANCE",
        "difficulty": 2,
        "definition": "(n.) Lack of knowledge or information."
        ,
        "synonyms": ["unawareness", "lack-of-knowledge", "inexperience"]
    },
    {
        "word": "IMAGINARY",
        "difficulty": 2,
        "definition": "(adj./n.) Existing only in the mind; not real or physically present."
        ,
        "synonyms": ["fictional", "unreal", "fanciful"]
    },
    {
        "word": "IMMEDIATELY",
        "difficulty": 3,
        "definition": "(adv.) At once; instantly."
        ,
        "synonyms": ["instantly", "at-once", "promptly"]
    },
    {
        "word": "IMPLEMENT",
        "difficulty": 2,
        "definition": "(n./v.) A tool, utensil, or other piece of equipment, especially as used for a particular purpose."
        ,
        "synonyms": ["carry-out", "apply", "carry-out"]
    },
    {
        "word": "INCIDENTALLY",
        "difficulty": 4,
        "definition": "(adv.) Used to add a further but less important point or to introduce a new topic in a conversation; by the way."
        ,
        "synonyms": ["by-the-way", "coincidentally", "as-an-aside"]
    },
    {
        "word": "INCREDIBLE",
        "difficulty": 2,
        "definition": "(adj.) Impossible to believe; extraordinary."
        ,
        "synonyms": ["astonishing", "unbelievable", "extraordinary"]
    },
    {
        "word": "INDEPENDENCE",
        "difficulty": 3,
        "definition": "(n.) Freedom from outside control or support."
        ,
        "synonyms": ["freedom", "autonomy", "self-rule"]
    },
    {
        "word": "INDEPENDENT",
        "difficulty": 2,
        "definition": "(adj.) Free from outside control; not depending on another's authority."
        ,
        "synonyms": ["autonomous", "free", "self-reliant"]
    },
    {
        "word": "INDICT",
        "difficulty": 4,
        "definition": "(v.) Formally accuse of or charge with a serious crime."
        ,
        "synonyms": ["charge", "accuse", "prosecute"]
    },
    {
        "word": "INDISPENSABLE",
        "difficulty": 4,
        "definition": "(adj.) Absolutely necessary."
        ,
        "synonyms": ["essential", "vital", "necessary"]
    },
    {
        "word": "INEVITABLE",
        "difficulty": 3,
        "definition": "(adj./n.) Certain to happen; unavoidable."
        ,
        "synonyms": ["unavoidable", "certain", "inescapable"]
    },
    {
        "word": "INFLUENTIAL",
        "difficulty": 3,
        "definition": "(adj./n.) Having the power to shape or change the opinions, behaviors, or decisions of others."
        ,
        "synonyms": ["powerful", "impactful", "important"]
    },
    {
        "word": "INFORMATION",
        "difficulty": 1,
        "definition": "(n.) Facts provided or learned about something or someone."
        ,
        "synonyms": ["data", "knowledge", "facts"]
    },
    {
        "word": "INGENIOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of a person) clever, original, and inventive."
        ,
        "synonyms": ["clever", "inventive", "resourceful"]
    },
    {
        "word": "INOCULATE",
        "difficulty": 4,
        "definition": "(v.) Treat (a person or animal) with a vaccine to produce immunity against a disease."
        ,
        "synonyms": ["vaccinate", "immunize", "inject"]
    },
    {
        "word": "INSISTENT",
        "difficulty": 3,
        "definition": "(adj.) Demanding attention or compliance in a persistent, forceful way."
        ,
        "synonyms": ["persistent", "determined", "stubborn"]
    },
    {
        "word": "INSUBORDINATE",
        "difficulty": 4,
        "definition": "(adj.) Defiant of authority; disobedient to orders."
        ,
        "synonyms": ["defiant", "disobedient", "rebellious"]
    },
    {
        "word": "INSURANCE",
        "difficulty": 2,
        "definition": "(n.) A practice or arrangement by which a company or government agency provides a guarantee of compensation for specified loss, damage, illness, or death in return for payment of a premium."
        ,
        "synonyms": ["coverage", "protection", "assurance"]
    },
    {
        "word": "INTELLIGENCE",
        "difficulty": 3,
        "definition": "(n.) The ability to acquire and apply knowledge and skills."
        ,
        "synonyms": ["intellect", "wisdom", "cleverness"]
    },
    {
        "word": "INTERFERENCE",
        "difficulty": 3,
        "definition": "(n.) The act of getting involved in a situation in a way that disrupts or prevents normal progress."
        ,
        "synonyms": ["meddling", "disruption", "obstruction"]
    },
    {
        "word": "INTERRUPT",
        "difficulty": 2,
        "definition": "(v.) Stop the continuous progress of (an activity or process)."
        ,
        "synonyms": ["pause", "stop", "break-in"]
    },
    {
        "word": "INTRODUCE",
        "difficulty": 2,
        "definition": "(v.) Bring (something, especially a product, measure, or concept) into use or operation for the first time."
        ,
        "synonyms": ["present", "bring-in", "initiate"]
    },
    {
        "word": "INVEIGLE",
        "difficulty": 5,
        "definition": "(v.) Persuade (someone) to do something by means of deception or flattery."
        ,
        "synonyms": ["coax", "cajole", "lure"]
    },
    {
        "word": "IRRELEVANT",
        "difficulty": 3,
        "definition": "(adj.) Not connected with or relevant to something."
        ,
        "synonyms": ["unrelated", "immaterial", "beside-the-point"]
    },
    {
        "word": "IRRESISTIBLE",
        "difficulty": 4,
        "definition": "(adj.) Too attractive and tempting to be resisted."
        ,
        "synonyms": ["compelling", "overwhelming", "tempting"]
    },
    {
        "word": "ISLAND",
        "difficulty": 2,
        "definition": "(n./v.) A piece of land surrounded by water."
        ,
        "synonyms": ["isle", "land-mass", "atoll"]
    },
    {
        "word": "ISLE",
        "difficulty": 2,
        "definition": "(n.) An island or peninsula, especially a small one."
        ,
        "synonyms": ["island", "atoll", "islet"]
    },
    {
        "word": "ITINERARY",
        "difficulty": 4,
        "definition": "(n.) A planned route or journey."
        ,
        "synonyms": ["schedule", "route", "plan"]
    },
    {
        "word": "JEALOUS",
        "difficulty": 2,
        "definition": "(adj.) Feeling or showing envy of someone or their achievements and advantages."
        ,
        "synonyms": ["envious", "possessive", "covetous"]
    },
    {
        "word": "JEALOUSY",
        "difficulty": 3,
        "definition": "(n.) Resentful suspicion that a rival threatens something one values, or envious hostility toward another's advantages."
        ,
        "synonyms": ["envy", "possessiveness", "covetousness"]
    },
    {
        "word": "JEWELLERY",
        "difficulty": 4,
        "definition": "(n.) Decorative personal accessories such as rings and necklaces, typically crafted from precious metals and gemstones."
        ,
        "synonyms": ["jewelry", "ornaments", "gems"]
    },
    {
        "word": "JUDGMENT",
        "difficulty": 2,
        "definition": "(n.) The ability to make considered decisions or come to sensible conclusions."
        ,
        "synonyms": ["decision", "ruling", "opinion"]
    },
    {
        "word": "JUDICIAL",
        "difficulty": 3,
        "definition": "(adj.) Of, by, or appropriate to a court or judge."
        ,
        "synonyms": ["legal", "court-related", "juridical"]
    },
    {
        "word": "KALEIDOSCOPE",
        "difficulty": 4,
        "definition": "(n.) A toy consisting of a tube containing mirrors and pieces of colored glass or paper, whose reflections produce changing patterns when the tube is rotated."
        ,
        "synonyms": ["pattern-viewer", "shifting-display", "prism-toy"]
    },
    {
        "word": "KERNEL",
        "difficulty": 3,
        "definition": "(n.) A softer, usually edible part of a nut, seed, or fruit stone contained within its shell."
        ,
        "synonyms": ["core", "seed", "nucleus"]
    },
    {
        "word": "KNACK",
        "difficulty": 3,
        "definition": "(n.) An acquired or natural skill at performing a task."
        ,
        "synonyms": ["skill", "talent", "gift"]
    },
    {
        "word": "KNOWLEDGE",
        "difficulty": 2,
        "definition": "(n.) Facts, information, and skills acquired by a person through experience or education."
        ,
        "synonyms": ["understanding", "learning", "wisdom"]
    },
    {
        "word": "LABORATORY",
        "difficulty": 3,
        "definition": "(n.) A room or building equipped for scientific experiments, research, or teaching, or for the manufacture of drugs or chemicals."
        ,
        "synonyms": ["lab", "research-space", "facility"]
    },
    {
        "word": "LAID",
        "difficulty": 1,
        "definition": "(v.) Placed something down flat in a horizontal position."
        ,
        "synonyms": ["placed", "put-down", "deposited"]
    },
    {
        "word": "LATER",
        "difficulty": 1,
        "definition": "(adv./adj.) At a time in the near future; soon or afterwards."
        ,
        "synonyms": ["afterward", "subsequently", "eventually"]
    },
    {
        "word": "LATTER",
        "difficulty": 2,
        "definition": "(adj./n.) Situated or occurring nearer to the end of something than to the beginning."
        ,
        "synonyms": ["last-mentioned", "second", "recent"]
    },
    {
        "word": "LEAD",
        "difficulty": 1,
        "definition": "(n.) A heavy, bluish-gray metal.",
        "speakAs": "led"
        ,
        "synonyms": ["guide", "precede", "direct"]
    },
    {
        "word": "LED",
        "difficulty": 1,
        "definition": "(v.) Guided or directed someone toward a destination."
        ,
        "synonyms": ["guided", "directed", "piloted"]
    },
    {
        "word": "LEGITIMATE",
        "difficulty": 3,
        "definition": "(adj./v.) Conforming to the law or to rules."
        ,
        "synonyms": ["valid", "lawful", "genuine"]
    },
    {
        "word": "LEISURE",
        "difficulty": 3,
        "definition": "(n.) Use of free time for enjoyment."
        ,
        "synonyms": ["free-time", "relaxation", "recreation"]
    },
    {
        "word": "LENGTH",
        "difficulty": 2,
        "definition": "(n.) The measurement or extent of something from end to end; the longest dimension of an object."
        ,
        "synonyms": ["distance", "extent", "measurement"]
    },
    {
        "word": "LIAISON",
        "difficulty": 4,
        "definition": "(n.) Communication or cooperation which facilitates a close working relationship between people or organizations."
        ,
        "synonyms": ["link", "connection", "intermediary"]
    },
    {
        "word": "LIBRARY",
        "difficulty": 2,
        "definition": "(n.) A building or room containing collections of books, periodicals, and sometimes films and recorded music for people to read, borrow, or refer to."
        ,
        "synonyms": ["archive", "bookroom", "collection"]
    },
    {
        "word": "LICENSE",
        "difficulty": 2,
        "definition": "(n./v.) A permit from an authority to own or use something, do a particular thing, or carry on a trade."
        ,
        "synonyms": ["permit", "authorization", "certification"]
    },
    {
        "word": "LIEUTENANT",
        "difficulty": 4,
        "definition": "(n.) A deputy or substitute acting for a superior."
        ,
        "synonyms": ["deputy", "officer", "second-in-command"]
    },
    {
        "word": "LIGHTNING",
        "difficulty": 2,
        "definition": "(n.) The occurrence of a natural electrical discharge of very short duration and high voltage between a cloud and the ground or within a cloud, accompanied by a bright flash and typically also thunder."
        ,
        "synonyms": ["bolt", "thunder-flash", "electrical-discharge"]
    },
    {
        "word": "LIKELIHOOD",
        "difficulty": 2,
        "definition": "(n.) The probability of something happening."
        ,
        "synonyms": ["probability", "chance", "prospect"]
    },
    {
        "word": "LIKELY",
        "difficulty": 1,
        "definition": "(adj./adv.) Such as well might happen or be true; probable."
        ,
        "synonyms": ["probable", "expected", "apt"]
    },
    {
        "word": "LONELINESS",
        "difficulty": 2,
        "definition": "(n.) Sadness because one has no friends or company."
        ,
        "synonyms": ["solitude", "isolation", "seclusion"]
    },
    {
        "word": "LOOSE",
        "difficulty": 1,
        "definition": "(adj./v.) Not firmly or tightly fixed in place; detached or able to be detached."
        ,
        "synonyms": ["slack", "free", "untied"]
    },
    {
        "word": "LOSE",
        "difficulty": 1,
        "definition": "(v.) Be deprived of or cease to have or retain (something)."
        ,
        "synonyms": ["misplace", "fail", "forfeit"]
    },
    {
        "word": "LOSING",
        "difficulty": 1,
        "definition": "(v.) Be deprived of or cease to have or retain (something)."
        ,
        "synonyms": ["failing", "forfeiting", "misplacing"]
    },
    {
        "word": "LOVELY",
        "difficulty": 1,
        "definition": "(adj.) Very beautiful or attractive."
        ,
        "synonyms": ["beautiful", "delightful", "charming"]
    },
    {
        "word": "LUXURY",
        "difficulty": 3,
        "definition": "(n./adj.) The state of great comfort and extravagant living."
        ,
        "synonyms": ["indulgence", "extravagance", "opulence"]
    },
    {
        "word": "MAGAZINE",
        "difficulty": 2,
        "definition": "(n.) A periodical publication containing articles and illustrations, typically covering a particular subject or area of interest."
        ,
        "synonyms": ["periodical", "journal", "publication"]
    },
    {
        "word": "MAINTAIN",
        "difficulty": 2,
        "definition": "(v.) Cause or enable (a condition or state of affairs) to continue."
        ,
        "synonyms": ["keep", "sustain", "uphold"]
    },
    {
        "word": "MAINTENANCE",
        "difficulty": 3,
        "definition": "(n.) The process of preserving a condition or situation or of keeping something in good working order."
        ,
        "synonyms": ["upkeep", "preservation", "care"]
    },
    {
        "word": "MANAGEABLE",
        "difficulty": 3,
        "definition": "(adj.) Easy to handle, control, or deal with."
        ,
        "synonyms": ["controllable", "feasible", "workable"]
    },
    {
        "word": "MANEUVER",
        "difficulty": 4,
        "definition": "(n./v.) A movement or series of moves requiring skill and care."
        ,
        "synonyms": ["tactic", "move", "navigate"]
    },
    {
        "word": "MANUFACTURE",
        "difficulty": 3,
        "definition": "(v./n.) The making of articles on a large scale using machinery."
        ,
        "synonyms": ["produce", "make", "fabricate"]
    },
    {
        "word": "MARRIAGE",
        "difficulty": 2,
        "definition": "(n.) The legally or formally recognized union of two people as partners in a personal relationship."
        ,
        "synonyms": ["union", "matrimony", "wedding"]
    },
    {
        "word": "MATHEMATICS",
        "difficulty": 3,
        "definition": "(n.) The abstract science of number, quantity, and space."
        ,
        "synonyms": ["math", "arithmetic", "calculation"]
    },
    {
        "word": "MEDICINE",
        "difficulty": 2,
        "definition": "(n.) A compound or preparation used for the treatment or prevention of disease, especially a drug or drugs taken by mouth."
        ,
        "synonyms": ["drug", "treatment", "remedy"]
    },
    {
        "word": "MEDIEVAL",
        "difficulty": 3,
        "definition": "(adj.) Relating to the Middle Ages."
        ,
        "synonyms": ["mideval", "middle-ages", "dark-ages"]
    },
    {
        "word": "MEMENTO",
        "difficulty": 3,
        "definition": "(n.) An object kept as a reminder or souvenir of a person or event."
        ,
        "synonyms": ["souvenir", "keepsake", "reminder"]
    },
    {
        "word": "MILLENNIUM",
        "difficulty": 4,
        "definition": "(n.) A period of a thousand years, especially when calculated from the traditional date of the birth of Christ."
        ,
        "synonyms": ["thousand-years", "era", "epoch"]
    },
    {
        "word": "MILLIONAIRE",
        "difficulty": 3,
        "definition": "(n.) A person of very great wealth, with assets valued in the millions."
        ,
        "synonyms": ["wealthy-person", "mogul", "tycoon"]
    },
    {
        "word": "MINIATURE",
        "difficulty": 3,
        "definition": "(adj./n.) (Of a thing) of a much smaller size than normal; very small."
        ,
        "synonyms": ["tiny", "small-scale", "mini"]
    },
    {
        "word": "MINUSCULE",
        "difficulty": 4,
        "definition": "(adj.) Extremely small; tiny."
        ,
        "synonyms": ["tiny", "minute", "microscopic"]
    },
    {
        "word": "MINUTES",
        "difficulty": 1,
        "definition": "(n.) Sixty-second periods of time."
        ,
        "synonyms": ["record", "moments", "notes"]
    },
    {
        "word": "MISCELLANEOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of items or people) gathered or considered together, although of various types."
        ,
        "synonyms": ["varied", "assorted", "mixed"]
    },
    {
        "word": "MISCHIEF",
        "difficulty": 3,
        "definition": "(n.) Playful misbehavior or troublemaking, especially in children."
        ,
        "synonyms": ["trouble", "harm", "naughtiness"]
    },
    {
        "word": "MISCHIEVOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of a person, animal, or their behavior) causing or showing a fondness for causing trouble in a playful way."
        ,
        "synonyms": ["naughty", "impish", "troublesome"]
    },
    {
        "word": "MISSILE",
        "difficulty": 2,
        "definition": "(n.) An object or vehicle that is propelled through the air to strike a target at a distance."
        ,
        "synonyms": ["projectile", "rocket", "weapon"]
    },
    {
        "word": "MISSPELL",
        "difficulty": 3,
        "definition": "(v.) Spell (a word) incorrectly."
        ,
        "synonyms": ["spell-wrong", "miswrite", "err"]
    },
    {
        "word": "MISSPELLED",
        "difficulty": 3,
        "definition": "(v./adj.) Spelt (a word) incorrectly."
        ,
        "synonyms": ["incorrectly-spelled", "miswritten", "erroneous"]
    },
    {
        "word": "MNEMONIC",
        "difficulty": 4,
        "definition": "(n./adj.) A device such as a pattern of letters, ideas, or associations that assists in remembering something."
        ,
        "synonyms": ["memory-aid", "reminder", "device"]
    },
    {
        "word": "MORTGAGE",
        "difficulty": 4,
        "definition": "(n./v.) A legal agreement by which a bank or other creditor lends money at interest in exchange for taking title of the debtor's property, with the condition that the conveyance of title becomes void upon the payment of the debt."
        ,
        "synonyms": ["loan", "lien", "home-loan"]
    },
    {
        "word": "MOSQUITO",
        "difficulty": 3,
        "definition": "(n.) A slender long-legged fly with aquatic larvae. The bite of the bloodsucking female can transmit a number of serious diseases including malaria and elephantiasis."
        ,
        "synonyms": ["insect", "bug", "fly"]
    },
    {
        "word": "MOSQUITOES",
        "difficulty": 3,
        "definition": "(n.) Small flying insects that feed on blood and can transmit diseases."
        ,
        "synonyms": ["insects", "bugs", "flies"]
    },
    {
        "word": "MURMUR",
        "difficulty": 2,
        "definition": "(n./v.) A soft, low, or indistinct sound or utterance."
        ,
        "synonyms": ["whisper", "hum", "mumble"]
    },
    {
        "word": "MUSCLE",
        "difficulty": 2,
        "definition": "(n./v.) A band or bundle of fibrous tissue in a human or animal body that has the ability to contract, producing movement in or maintaining the position of parts of the body."
        ,
        "synonyms": ["tissue", "sinew", "strength"]
    },
    {
        "word": "MYSTERIOUS",
        "difficulty": 3,
        "definition": "(adj.) Difficult or impossible to understand, explain, or identify."
        ,
        "synonyms": ["enigmatic", "puzzling", "secretive"]
    },
    {
        "word": "NAIVE",
        "difficulty": 3,
        "definition": "(adj.) (Of a person or action) showing a lack of experience, wisdom, or judgment."
        ,
        "synonyms": ["innocent", "gullible", "unsophisticated"]
    },
    {
        "word": "NARRATIVE",
        "difficulty": 3,
        "definition": "(n./adj.) A spoken or written account of connected events; a story."
        ,
        "synonyms": ["story", "account", "tale"]
    },
    {
        "word": "NATURALLY",
        "difficulty": 1,
        "definition": "(adv.) In a way that is to be expected."
        ,
        "synonyms": ["inherently", "of-course", "as-expected"]
    },
    {
        "word": "NAUSEOUS",
        "difficulty": 3,
        "definition": "(adj.) Feeling an unsettled stomach with an urge to be sick."
        ,
        "synonyms": ["sick", "queasy", "ill"]
    },
    {
        "word": "NECESSARY",
        "difficulty": 2,
        "definition": "(adj.) Required to be done, achieved, or present; needed; essential."
        ,
        "synonyms": ["essential", "required", "vital"]
    },
    {
        "word": "NECESSITY",
        "difficulty": 3,
        "definition": "(n.) The fact of being required or indispensable."
        ,
        "synonyms": ["need", "requirement", "must"]
    },
    {
        "word": "NEIGHBOR",
        "difficulty": 2,
        "definition": "(n./v.) A person living next door to or very near another."
        ,
        "synonyms": ["resident", "next-door", "adjacent-person"]
    },
    {
        "word": "NEITHER",
        "difficulty": 2,
        "definition": "(det./pron./adv./conj.) Not either."
        ,
        "synonyms": ["not-either", "none", "nor"]
    },
    {
        "word": "NEUTRON",
        "difficulty": 3,
        "definition": "(n.) A subatomic particle of about the same mass as a proton but without an electric charge, present in all atomic nuclei except those of ordinary hydrogen."
        ,
        "synonyms": ["subatomic-particle", "nucleus-particle", "neutral-particle"]
    },
    {
        "word": "NICHE",
        "difficulty": 3,
        "definition": "(n./adj./v.) A comfortable or suitable position in life or employment."
        ,
        "synonyms": ["specialty", "slot", "role"]
    },
    {
        "word": "NIECE",
        "difficulty": 3,
        "definition": "(n.) A daughter of one's brother or sister, or of one's brother-in-law or sister-in-law."
        ,
        "synonyms": ["sister's-daughter", "brother's-daughter", "family-member"]
    },
    {
        "word": "NINETY",
        "difficulty": 2,
        "definition": "(num./n./adj.) The cardinal number equivalent to nine times ten; 90."
        ,
        "synonyms": ["nine-tens", "90", "numeral"]
    },
    {
        "word": "NINTH",
        "difficulty": 2,
        "definition": "(num./n./adj.) Constituting number nine in a sequence; 9th."
        ,
        "synonyms": ["ordinal", "one-ninth", "number-nine"]
    },
    {
        "word": "NOTICEABLE",
        "difficulty": 3,
        "definition": "(adj.) Plainly visible or obvious; attracting attention."
        ,
        "synonyms": ["visible", "conspicuous", "obvious"]
    },
    {
        "word": "NOWADAYS",
        "difficulty": 2,
        "definition": "(adv.) At the present time, in contrast with the past."
        ,
        "synonyms": ["currently", "these-days", "presently"]
    },
    {
        "word": "NUCLEAR",
        "difficulty": 2,
        "definition": "(adj.) Of or relating to the central core of an atom or the energy released by splitting or fusing such cores."
        ,
        "synonyms": ["atomic", "radioactive", "fissile"]
    },
    {
        "word": "NUISANCE",
        "difficulty": 3,
        "definition": "(n.) A person, thing, or circumstance causing inconvenience or annoyance."
        ,
        "synonyms": ["annoyance", "irritant", "bother"]
    },
    {
        "word": "OBEDIENCE",
        "difficulty": 3,
        "definition": "(n.) Compliance with an order, request, or law or submission to another's authority."
        ,
        "synonyms": ["compliance", "submissiveness", "conformity"]
    },
    {
        "word": "OBEDIENT",
        "difficulty": 2,
        "definition": "(adj.) Complying or willing to comply with orders or requests; submissive to another's authority."
        ,
        "synonyms": ["compliant", "submissive", "dutiful"]
    },
    {
        "word": "OBSTACLE",
        "difficulty": 2,
        "definition": "(n.) A thing that blocks one's way or prevents or hinders progress."
        ,
        "synonyms": ["barrier", "hindrance", "hurdle"]
    },
    {
        "word": "OCCASION",
        "difficulty": 2,
        "definition": "(n./v.) A particular time or instance of an event."
        ,
        "synonyms": ["event", "opportunity", "instance"]
    },
    {
        "word": "OCCASIONALLY",
        "difficulty": 3,
        "definition": "(adv.) At infrequent or irregular intervals; now and then."
        ,
        "synonyms": ["sometimes", "now-and-then", "infrequently"]
    },
    {
        "word": "OCCURRED",
        "difficulty": 3,
        "definition": "(v.) Happened; took place."
        ,
        "synonyms": ["happened", "took-place", "came-about"]
    },
    {
        "word": "OCCURRENCE",
        "difficulty": 4,
        "definition": "(n.) An incident or event."
        ,
        "synonyms": ["event", "incident", "happening"]
    },
    {
        "word": "OFF",
        "difficulty": 1,
        "definition": "(adv./prep./adj.) Away from a place or at a distance."
        ,
        "synonyms": ["away", "not-on", "shut"]
    },
    {
        "word": "OFFICIAL",
        "difficulty": 2,
        "definition": "(adj./n.) Relating to an authority or public body and its duties, actions, and responsibilities."
        ,
        "synonyms": ["formal", "authorized", "sanctioned"]
    },
    {
        "word": "OFTEN",
        "difficulty": 1,
        "definition": "(adv.) Many times; frequently."
        ,
        "synonyms": ["frequently", "regularly", "commonly"]
    },
    {
        "word": "OMISSION",
        "difficulty": 3,
        "definition": "(n.) Someone or something that has been left out or excluded."
        ,
        "synonyms": ["exclusion", "gap", "oversight"]
    },
    {
        "word": "OMIT",
        "difficulty": 2,
        "definition": "(v.) Leave out or exclude (someone or something), either intentionally or forgetfully."
        ,
        "synonyms": ["leave-out", "exclude", "skip"]
    },
    {
        "word": "OMITTED",
        "difficulty": 3,
        "definition": "(v.) Left something out or failed to include it."
        ,
        "synonyms": ["excluded", "left-out", "missed"]
    },
    {
        "word": "OPINION",
        "difficulty": 2,
        "definition": "(n.) A view or judgment formed about something, not necessarily based on fact or knowledge."
        ,
        "synonyms": ["view", "belief", "judgment"]
    },
    {
        "word": "OPPONENT",
        "difficulty": 2,
        "definition": "(n./adj.) Someone who competes against or fights another in a contest, game, or argument; a rival or adversary."
        ,
        "synonyms": ["adversary", "rival", "foe"]
    },
    {
        "word": "OPPORTUNITY",
        "difficulty": 2,
        "definition": "(n.) A set of circumstances that makes it possible to do something."
        ,
        "synonyms": ["chance", "opening", "possibility"]
    },
    {
        "word": "OPPRESSION",
        "difficulty": 3,
        "definition": "(n.) Prolonged cruel or unjust treatment or control."
        ,
        "synonyms": ["tyranny", "suppression", "persecution"]
    },
    {
        "word": "OPTIMISM",
        "difficulty": 3,
        "definition": "(n.) Hopefulness and confidence about the future or the successful outcome of something."
        ,
        "synonyms": ["hope", "positivity", "confidence"]
    },
    {
        "word": "OPTIMISTIC",
        "difficulty": 3,
        "definition": "(adj.) Hopeful and confident about the future."
        ,
        "synonyms": ["hopeful", "positive", "confident"]
    },
    {
        "word": "ORCHESTRA",
        "difficulty": 3,
        "definition": "(n.) A large group of musicians playing instrumental music together."
        ,
        "synonyms": ["ensemble", "philharmonic", "band"]
    },
    {
        "word": "ORDINARILY",
        "difficulty": 3,
        "definition": "(adv.) Under normal circumstances or conditions."
        ,
        "synonyms": ["usually", "normally", "typically"]
    },
    {
        "word": "ORIGIN",
        "difficulty": 2,
        "definition": "(n.) The point or place where something begins, arises, or is derived."
        ,
        "synonyms": ["source", "beginning", "root"]
    },
    {
        "word": "ORIGINAL",
        "difficulty": 2,
        "definition": "(adj./n.) Present or existing from the beginning; first or earliest."
        ,
        "synonyms": ["first", "novel", "authentic"]
    },
    {
        "word": "OUTRAGEOUS",
        "difficulty": 3,
        "definition": "(adj.) Shockingly bad or excessive."
        ,
        "synonyms": ["shocking", "scandalous", "extreme"]
    },
    {
        "word": "OVERRUN",
        "difficulty": 2,
        "definition": "(v./n.) Spread over or occupy (a place) in large numbers."
        ,
        "synonyms": ["overwhelm", "exceed", "invade"]
    },
    {
        "word": "PAMPHLET",
        "difficulty": 3,
        "definition": "(n./v.) A small booklet or leaflet containing information or arguments about a single subject."
        ,
        "synonyms": ["brochure", "leaflet", "flyer"]
    },
    {
        "word": "PAMPHLETS",
        "difficulty": 3,
        "definition": "(n.) Small booklets or leaflets containing information or arguments about a single subject."
        ,
        "synonyms": ["brochures", "leaflets", "flyers"]
    },
    {
        "word": "PARALLEL",
        "difficulty": 3,
        "definition": "(adj./n./v.) (Of lines, planes, surfaces, or objects) side by side and having the same distance continuously between them."
        ,
        "synonyms": ["comparable", "corresponding", "analogous"]
    },
    {
        "word": "PARAPHERNALIA",
        "difficulty": 5,
        "definition": "(n.) Miscellaneous articles, especially the equipment needed for a particular activity."
        ,
        "synonyms": ["equipment", "accessories", "gear"]
    },
    {
        "word": "PARTICULAR",
        "difficulty": 3,
        "definition": "(adj./n.) Used to single out an individual member of a specified group or class."
        ,
        "synonyms": ["specific", "special", "individual"]
    },
    {
        "word": "PARTICULARLY",
        "difficulty": 3,
        "definition": "(adv.) To a higher degree than is usual or average."
        ,
        "synonyms": ["specifically", "especially", "notably"]
    },
    {
        "word": "PASTIME",
        "difficulty": 3,
        "definition": "(n.) An activity that someone does regularly for enjoyment rather than work; a hobby."
        ,
        "synonyms": ["hobby", "leisure", "recreation"]
    },
    {
        "word": "PAVILION",
        "difficulty": 3,
        "definition": "(n./v.) A decorative building used as a shelter in a park or garden."
        ,
        "synonyms": ["tent", "canopy", "shelter"]
    },
    {
        "word": "PEACEABLE",
        "difficulty": 3,
        "definition": "(adj.) Inclined to avoid argument or violent conflict."
        ,
        "synonyms": ["peaceful", "calm", "non-violent"]
    },
    {
        "word": "PECULIAR",
        "difficulty": 3,
        "definition": "(adj./n.) Strange or odd; unusual."
        ,
        "synonyms": ["strange", "odd", "unusual"]
    },
    {
        "word": "PENETRATE",
        "difficulty": 3,
        "definition": "(v.) Succeed in forcing a way into or through (something)."
        ,
        "synonyms": ["enter", "pierce", "break-through"]
    },
    {
        "word": "PERCEIVE",
        "difficulty": 3,
        "definition": "(v.) Become aware or conscious of (something); come to realize or understand."
        ,
        "synonyms": ["notice", "observe", "recognize"]
    },
    {
        "word": "PERFORMANCE",
        "difficulty": 2,
        "definition": "(n.) A live presentation of a play, music, or other art before an audience."
        ,
        "synonyms": ["show", "execution", "act"]
    },
    {
        "word": "PERMANENT",
        "difficulty": 2,
        "definition": "(adj./n.) Lasting or intended to last or remain unchanged indefinitely."
        ,
        "synonyms": ["lasting", "enduring", "stable"]
    },
    {
        "word": "PERMISSIBLE",
        "difficulty": 3,
        "definition": "(adj.) Within the bounds of what is officially sanctioned or allowed."
        ,
        "synonyms": ["allowed", "acceptable", "legal"]
    },
    {
        "word": "PERMITTED",
        "difficulty": 3,
        "definition": "(v./adj.) Allowed; given authorization."
        ,
        "synonyms": ["allowed", "authorized", "sanctioned"]
    },
    {
        "word": "PERSEVERANCE",
        "difficulty": 4,
        "definition": "(n.) Persistence in doing something despite difficulty or delay in achieving success."
        ,
        "synonyms": ["persistence", "determination", "tenacity"]
    },
    {
        "word": "PERSISTENCE",
        "difficulty": 3,
        "definition": "(n.) Firm or obstinate continuance in a course of action in spite of difficulty or opposition."
        ,
        "synonyms": ["determination", "resilience", "steadfastness"]
    },
    {
        "word": "PERSONAL",
        "difficulty": 1,
        "definition": "(adj.) Belonging to or affecting a specific individual; private and not shared with others."
        ,
        "synonyms": ["individual", "private", "subjective"]
    },
    {
        "word": "PERSONNEL",
        "difficulty": 3,
        "definition": "(n.) People employed in an organization or engaged in an organized undertaking such as military service."
        ,
        "synonyms": ["staff", "employees", "workforce"]
    },
    {
        "word": "PERSPIRATION",
        "difficulty": 4,
        "definition": "(n.) The process of sweating."
        ,
        "synonyms": ["sweat", "moisture", "exudation"]
    },
    {
        "word": "PHARAOH",
        "difficulty": 4,
        "definition": "(n.) A ruler in ancient Egypt."
        ,
        "synonyms": ["king", "ruler", "Egyptian-king"]
    },
    {
        "word": "PHYSICAL",
        "difficulty": 2,
        "definition": "(adj./n.) Relating to the body as opposed to the mind."
        ,
        "synonyms": ["bodily", "material", "tangible"]
    },
    {
        "word": "PHYSICIAN",
        "difficulty": 3,
        "definition": "(n.) A person qualified to practice medicine."
        ,
        "synonyms": ["doctor", "medic", "healer"]
    },
    {
        "word": "PIECE",
        "difficulty": 1,
        "definition": "(n./v.) A portion of an object or of material, produced by cutting, tearing, or breaking the whole."
        ,
        "synonyms": ["part", "portion", "fragment"]
    },
    {
        "word": "PILGRIMAGE",
        "difficulty": 3,
        "definition": "(n./v.) A journey to a place associated with someone or something respected or believed to be holy."
        ,
        "synonyms": ["journey", "quest", "trek"]
    },
    {
        "word": "PITIFUL",
        "difficulty": 2,
        "definition": "(adj.) Deserving or arousing pity."
        ,
        "synonyms": ["pathetic", "miserable", "sad"]
    },
    {
        "word": "PLANNING",
        "difficulty": 1,
        "definition": "(v./n.) The process of making plans for something."
        ,
        "synonyms": ["organizing", "preparing", "scheduling"]
    },
    {
        "word": "PLAYWRIGHT",
        "difficulty": 3,
        "definition": "(n.) A person who writes plays."
        ,
        "synonyms": ["dramatist", "scriptwriter", "author"]
    },
    {
        "word": "PLEASANT",
        "difficulty": 2,
        "definition": "(adj.) Giving a sense of happy satisfaction or enjoyment."
        ,
        "synonyms": ["enjoyable", "agreeable", "nice"]
    },
    {
        "word": "PORTRAY",
        "difficulty": 3,
        "definition": "(v.) Depict (someone or something) in a work of art or literature."
        ,
        "synonyms": ["depict", "represent", "paint"]
    },
    {
        "word": "POSSESS",
        "difficulty": 2,
        "definition": "(v.) Have as belonging to one; own."
        ,
        "synonyms": ["own", "have", "hold"]
    },
    {
        "word": "POSSESSION",
        "difficulty": 3,
        "definition": "(n.) The state of having, owning, or controlling something."
        ,
        "synonyms": ["ownership", "holding", "belonging"]
    },
    {
        "word": "POSSESSIVE",
        "difficulty": 3,
        "definition": "(adj./n.) Showing a desire to own or dominate."
        ,
        "synonyms": ["owning", "controlling", "jealous"]
    },
    {
        "word": "POSSIBILITY",
        "difficulty": 3,
        "definition": "(n.) A thing that may happen or be the case."
        ,
        "synonyms": ["chance", "prospect", "potential"]
    },
    {
        "word": "POSSIBLE",
        "difficulty": 1,
        "definition": "(adj./n.) Able to be done or achieved to happen."
        ,
        "synonyms": ["feasible", "potential", "achievable"]
    },
    {
        "word": "POTATO",
        "difficulty": 1,
        "definition": "(n.) A starchy plant tuber which is one of the most important food crops, eaten as a vegetable."
        ,
        "synonyms": ["tuber", "spud", "vegetable"]
    },
    {
        "word": "POTATOES",
        "difficulty": 2,
        "definition": "(n.) A starchy root vegetable widely eaten baked, boiled, or fried."
        ,
        "synonyms": ["spuds", "tubers", "vegetables"]
    },
    {
        "word": "PRACTICALLY",
        "difficulty": 2,
        "definition": "(adv.) Virtually; almost."
        ,
        "synonyms": ["virtually", "almost", "nearly"]
    },
    {
        "word": "PRAIRIE",
        "difficulty": 3,
        "definition": "(n.) A large open area of grassland, especially in North America."
        ,
        "synonyms": ["grassland", "plain", "meadow"]
    },
    {
        "word": "PRECEDE",
        "difficulty": 3,
        "definition": "(v.) Come before (something) in time."
        ,
        "synonyms": ["come-before", "lead", "predate"]
    },
    {
        "word": "PRECEDENCE",
        "difficulty": 3,
        "definition": "(n.) The condition of being considered more important than someone or something else; priority in importance, order, or rank."
        ,
        "synonyms": ["priority", "seniority", "rank"]
    },
    {
        "word": "PRECEDING",
        "difficulty": 3,
        "definition": "(adj./v.) Coming before in time or order."
        ,
        "synonyms": ["previous", "prior", "before"]
    },
    {
        "word": "PREFERENCE",
        "difficulty": 3,
        "definition": "(n.) A greater liking for one alternative over another or others."
        ,
        "synonyms": ["choice", "liking", "option"]
    },
    {
        "word": "PREFERRED",
        "difficulty": 3,
        "definition": "(adj./v.) Liking one thing better than another."
        ,
        "synonyms": ["chosen", "favored", "selected"]
    },
    {
        "word": "PREJUDICE",
        "difficulty": 3,
        "definition": "(n./v.) Preconceived opinion that is not based on reason or actual experience."
        ,
        "synonyms": ["bias", "discrimination", "bigotry"]
    },
    {
        "word": "PREPARATION",
        "difficulty": 3,
        "definition": "(n.) The action or process of making ready or being made ready for use or consideration."
        ,
        "synonyms": ["readiness", "planning", "groundwork"]
    },
    {
        "word": "PRESCRIPTION",
        "difficulty": 4,
        "definition": "(n./adj.) An instruction written by a medical practitioner that authorizes a patient to be provided with a medicine or treatment."
        ,
        "synonyms": ["order", "directive", "medical-order"]
    },
    {
        "word": "PRESENCE",
        "difficulty": 2,
        "definition": "(n.) The quality of being in a particular place; a commanding or impressive bearing."
        ,
        "synonyms": ["attendance", "being-there", "appearance"]
    },
    {
        "word": "PREVALENT",
        "difficulty": 3,
        "definition": "(adj.) Widespread in a particular area or at a particular time."
        ,
        "synonyms": ["widespread", "common", "rampant"]
    },
    {
        "word": "PRIMITIVE",
        "difficulty": 3,
        "definition": "(adj./n.) Relating to, denoting, or preserving the character of an early stage in the evolutionary or historical development of something."
        ,
        "synonyms": ["basic", "simple", "prehistoric"]
    },
    {
        "word": "PRINCIPAL",
        "difficulty": 3,
        "definition": "(adj./n.) First in order of importance; main."
        ,
        "synonyms": ["main", "chief", "headmaster"]
    },
    {
        "word": "PRINCIPLE",
        "difficulty": 3,
        "definition": "(n.) A fundamental truth or proposition that serves as the foundation for a system of belief or behavior or for a chain of reasoning."
        ,
        "synonyms": ["rule", "value", "belief"]
    },
    {
        "word": "PRIVILEGE",
        "difficulty": 3,
        "definition": "(n./v.) A special right, advantage, or immunity granted or available only to a particular person or group."
        ,
        "synonyms": ["advantage", "right", "benefit"]
    },
    {
        "word": "PROBABLY",
        "difficulty": 1,
        "definition": "(adv.) Almost certainly; as far as one knows or can tell."
        ,
        "synonyms": ["likely", "presumably", "in-all-likelihood"]
    },
    {
        "word": "PROCEDURE",
        "difficulty": 3,
        "definition": "(n.) An established or official way of doing something."
        ,
        "synonyms": ["process", "method", "protocol"]
    },
    {
        "word": "PROCEED",
        "difficulty": 2,
        "definition": "(v./n.) Begin or continue a course of action."
        ,
        "synonyms": ["continue", "advance", "go-ahead"]
    },
    {
        "word": "PROFESSION",
        "difficulty": 2,
        "definition": "(n.) A paid occupation, especially one that involves prolonged training and a formal qualification."
        ,
        "synonyms": ["career", "occupation", "vocation"]
    },
    {
        "word": "PROFESSOR",
        "difficulty": 2,
        "definition": "(n.) A university academic of the highest rank."
        ,
        "synonyms": ["teacher", "educator", "academic"]
    },
    {
        "word": "PROMINENT",
        "difficulty": 3,
        "definition": "(adj.) Important; famous."
        ,
        "synonyms": ["notable", "leading", "distinguished"]
    },
    {
        "word": "PROMISE",
        "difficulty": 1,
        "definition": "(n./v.) A declaration or assurance that one will do a particular thing or that a particular thing will happen."
        ,
        "synonyms": ["pledge", "vow", "commitment"]
    },
    {
        "word": "PRONOUNCE",
        "difficulty": 2,
        "definition": "(v.) Make the sound of (a word or part of a word) in the correct or a particular way."
        ,
        "synonyms": ["say", "speak", "articulate"]
    },
    {
        "word": "PRONUNCIATION",
        "difficulty": 4,
        "definition": "(n.) The way in which a word is pronounced."
        ,
        "synonyms": ["speech", "enunciation", "diction"]
    },
    {
        "word": "PROPAGANDA",
        "difficulty": 4,
        "definition": "(n.) Information, especially of a biased or misleading nature, used to promote or publicize a particular political cause or point of view."
        ,
        "synonyms": ["messaging", "spin", "disinformation"]
    },
    {
        "word": "PSYCHOLOGY",
        "difficulty": 4,
        "definition": "(n.) The scientific study of the human mind and its functions, especially those affecting behavior in a given context."
        ,
        "synonyms": ["mind-science", "behavior-study", "mental-science"]
    },
    {
        "word": "PUBLICLY",
        "difficulty": 2,
        "definition": "(adv.) In a way that is visible or known to all people; openly."
        ,
        "synonyms": ["openly", "outwardly", "in-public"]
    },
    {
        "word": "PURSUE",
        "difficulty": 2,
        "definition": "(v.) Follow (someone or something) in order to catch or attack them."
        ,
        "synonyms": ["chase", "follow", "seek"]
    },
    {
        "word": "QUANTITY",
        "difficulty": 2,
        "definition": "(n.) The amount or number of a material or immaterial thing not usually estimated by spatial measurement."
        ,
        "synonyms": ["amount", "number", "volume"]
    },
    {
        "word": "QUARANTINE",
        "difficulty": 4,
        "definition": "(n./v.) A state, period, or place of isolation in which people or animals that have arrived from elsewhere or been exposed to infectious or contagious disease are placed."
        ,
        "synonyms": ["isolation", "containment", "sequestration"]
    },
    {
        "word": "QUESTIONNAIRE",
        "difficulty": 4,
        "definition": "(n.) A printed or digital form with a set of structured questions used to gather information from respondents."
        ,
        "synonyms": ["survey", "form", "poll"]
    },
    {
        "word": "QUEUE",
        "difficulty": 4,
        "definition": "(n./v.) A line or sequence of people or vehicles awaiting their turn to be attended to or to proceed."
        ,
        "synonyms": ["line", "row", "wait"]
    },
    {
        "word": "QUIZZES",
        "difficulty": 4,
        "definition": "(n./v.) A test of knowledge, especially a brief, informal test given to students."
        ,
        "synonyms": ["tests", "exams", "challenges"]
    },
    {
        "word": "REALISTICALLY",
        "difficulty": 4,
        "definition": "(adv.) In a way that is true to life."
        ,
        "synonyms": ["practically", "sensibly", "honestly"]
    },
    {
        "word": "REALIZE",
        "difficulty": 2,
        "definition": "(v.) Become fully aware of (something) as a fact; understand clearly."
        ,
        "synonyms": ["understand", "achieve", "recognize"]
    },
    {
        "word": "REALLY",
        "difficulty": 1,
        "definition": "(adv.) In actual fact, as opposed to what is said or imagined to be the case."
        ,
        "synonyms": ["truly", "genuinely", "actually"]
    },
    {
        "word": "RECEDE",
        "difficulty": 4,
        "definition": "(v.) Go or move back or further away from a previous position."
        ,
        "synonyms": ["retreat", "withdraw", "diminish"]
    },
    {
        "word": "RECEIPT",
        "difficulty": 4,
        "definition": "(n./v.) A document confirming that goods or payment have been handed over."
        ,
        "synonyms": ["proof-of-purchase", "record", "acknowledgment"]
    },
    {
        "word": "RECEIVE",
        "difficulty": 2,
        "definition": "(v.) Be given, presented with, or paid (something)."
        ,
        "synonyms": ["get", "obtain", "accept"]
    },
    {
        "word": "RECOGNIZE",
        "difficulty": 2,
        "definition": "(v.) Identify (someone or something) from having encountered them before; know again."
        ,
        "synonyms": ["identify", "acknowledge", "realize"]
    },
    {
        "word": "RECOMMEND",
        "difficulty": 2,
        "definition": "(v.) Put forward (someone or something) with approval as being suitable for a particular purpose or role."
        ,
        "synonyms": ["suggest", "advise", "endorse"]
    },
    {
        "word": "REFERENCE",
        "difficulty": 2,
        "definition": "(n./v.) The action of mentioning or alluding to something."
        ,
        "synonyms": ["citation", "source", "mention"]
    },
    {
        "word": "REFERRED",
        "difficulty": 4,
        "definition": "(v.) Mentioned or alluded to."
        ,
        "synonyms": ["mentioned", "cited", "directed"]
    },
    {
        "word": "REFERRING",
        "difficulty": 4,
        "definition": "(v.) Mentioning or directing attention to something; sending someone to another source."
        ,
        "synonyms": ["mentioning", "citing", "alluding"]
    },
    {
        "word": "RELEVANT",
        "difficulty": 2,
        "definition": "(adj.) Closely connected or appropriate to the matter at hand."
        ,
        "synonyms": ["pertinent", "applicable", "related"]
    },
    {
        "word": "RELIEVING",
        "difficulty": 4,
        "definition": "(v.) Cause (pain, distress, or difficulty) to become less severe or serious."
        ,
        "synonyms": ["easing", "soothing", "alleviating"]
    },
    {
        "word": "RELIGIOUS",
        "difficulty": 2,
        "definition": "(adj.) Relating to or practicing a belief in a higher power, moral code, and system of worship."
        ,
        "synonyms": ["devout", "spiritual", "sacred"]
    },
    {
        "word": "REMEMBRANCE",
        "difficulty": 4,
        "definition": "(n.) The act of keeping something in one's memory."
        ,
        "synonyms": ["memory", "recollection", "commemoration"]
    },
    {
        "word": "REMINISCENCE",
        "difficulty": 4,
        "definition": "(n.) A story told about a past event remembered by the narrator."
        ,
        "synonyms": ["recollection", "memory", "nostalgia"]
    },
    {
        "word": "REPETITION",
        "difficulty": 4,
        "definition": "(n.) The action of repeating something that has already been said or written."
        ,
        "synonyms": ["recurrence", "repeat", "reiteration"]
    },
    {
        "word": "REPRESENTATIVE",
        "difficulty": 4,
        "definition": "(adj./n.) Typical of a class, group, or body of opinion."
        ,
        "synonyms": ["delegate", "spokesperson", "typical"]
    },
    {
        "word": "RESEMBLANCE",
        "difficulty": 4,
        "definition": "(n.) The quality of being similar or looking like something else."
        ,
        "synonyms": ["similarity", "likeness", "semblance"]
    },
    {
        "word": "RESERVOIR",
        "difficulty": 4,
        "definition": "(n./v.) A large natural or artificial lake used as a source of water supply."
        ,
        "synonyms": ["lake", "tank", "store"]
    },
    {
        "word": "RESISTANCE",
        "difficulty": 4,
        "definition": "(n.) The refusal to accept or comply with something; the attempt to prevent something by action or argument."
        ,
        "synonyms": ["opposition", "defiance", "refusal"]
    },
    {
        "word": "RESTAURANT",
        "difficulty": 2,
        "definition": "(n.) A place where people pay to sit and eat meals that are cooked and served on the premises."
        ,
        "synonyms": ["eatery", "diner", "cafe"]
    },
    {
        "word": "RHEUMATISM",
        "difficulty": 4,
        "definition": "(n.) A medical condition causing painful inflammation and stiffness in the joints or muscles."
        ,
        "synonyms": ["joint-pain", "arthritis", "stiffness"]
    },
    {
        "word": "RHYTHM",
        "difficulty": 4,
        "definition": "(n.) A strong, regular, repeated pattern of movement or sound."
        ,
        "synonyms": ["beat", "cadence", "tempo"]
    },
    {
        "word": "RHYTHMICAL",
        "difficulty": 5,
        "definition": "(adj.) Occurring regularly."
        ,
        "synonyms": ["rhythmic", "musical", "cadenced"]
    },
    {
        "word": "RIDICULOUS",
        "difficulty": 4,
        "definition": "(adj.) Deserving or inviting derision or mockery; absurd."
        ,
        "synonyms": ["absurd", "laughable", "preposterous"]
    },
    {
        "word": "ROOMMATE",
        "difficulty": 2,
        "definition": "(n.) A person occupying the same room as another."
        ,
        "synonyms": ["flatmate", "co-habitant", "housemate"]
    },
    {
        "word": "SACRIFICE",
        "difficulty": 4,
        "definition": "(n./v.) An act of slaughtering an animal or person or surrendering a possession as an offering to God or to a divine or supernatural figure."
        ,
        "synonyms": ["give-up", "offering", "surrender"]
    },
    {
        "word": "SACRILEGIOUS",
        "difficulty": 5,
        "definition": "(adj.) Showing disrespect toward something considered holy or sacred."
        ,
        "synonyms": ["blasphemous", "profane", "irreverent"]
    },
    {
        "word": "SAFETY",
        "difficulty": 1,
        "definition": "(n./adj.) The condition of being safe from undergoing or causing hurt, injury, or loss."
        ,
        "synonyms": ["security", "protection", "welfare"]
    },
    {
        "word": "SALARY",
        "difficulty": 2,
        "definition": "(n./v.) A fixed regular payment, typically paid on a monthly or biweekly basis but often expressed as an annual sum, made by an employer to an employee, especially a professional or white-collar worker."
        ,
        "synonyms": ["wage", "pay", "income"]
    },
    {
        "word": "SATELLITE",
        "difficulty": 4,
        "definition": "(n./adj.) An artificial body placed in orbit around the earth or moon or another planet in order to collect information or for communication."
        ,
        "synonyms": ["moon", "orbiter", "space-device"]
    },
    {
        "word": "SCARY",
        "difficulty": 1,
        "definition": "(adj.) Causing fear or alarm."
        ,
        "synonyms": ["frightening", "terrifying", "alarming"]
    },
    {
        "word": "SCENERY",
        "difficulty": 2,
        "definition": "(n.) The natural features of a landscape considered in terms of their appearance, especially when picturesque."
        ,
        "synonyms": ["landscape", "view", "backdrop"]
    },
    {
        "word": "SCHEDULE",
        "difficulty": 2,
        "definition": "(n./v.) A plan for carrying out a process or procedure, giving lists of intended events and times."
        ,
        "synonyms": ["timetable", "agenda", "plan"]
    },
    {
        "word": "SCIENCE",
        "difficulty": 1,
        "definition": "(n.) The intellectual and practical activity encompassing the systematic study of the structure and behavior of the physical and natural world through observation and experiment."
        ,
        "synonyms": ["knowledge", "study", "empirical-inquiry"]
    },
    {
        "word": "SCISSORS",
        "difficulty": 4,
        "definition": "(n.) An instrument used for cutting cloth, paper, and other thin material, consisting of two blades laid one on top of the other and fastened in the middle so as to allow them to be opened and closed by a thumb and finger inserted through rings at one end."
        ,
        "synonyms": ["shears", "clippers", "cutters"]
    },
    {
        "word": "SECEDE",
        "difficulty": 4,
        "definition": "(v.) Withdraw formally from membership of a federal union, an alliance, or a political or religious organization."
        ,
        "synonyms": ["withdraw", "break-away", "separate"]
    },
    {
        "word": "SECRETARY",
        "difficulty": 4,
        "definition": "(n.) A person employed by an individual or in an office to assist with correspondence, keep records, and make appointments and similar administrative tasks."
        ,
        "synonyms": ["administrator", "clerk", "office-manager"]
    },
    {
        "word": "SEIZE",
        "difficulty": 4,
        "definition": "(v.) Take hold of suddenly and forcibly."
        ,
        "synonyms": ["grab", "capture", "take"]
    },
    {
        "word": "SENSE",
        "difficulty": 1,
        "definition": "(n./v.) A faculty by which the body perceives an external stimulus; one of the faculties of sight, smell, hearing, taste, and touch."
        ,
        "synonyms": ["perceive", "meaning", "judgment"]
    },
    {
        "word": "SENTENCE",
        "difficulty": 1,
        "definition": "(n./v.) A set of words that is complete in itself, typically containing a subject and predicate, conveying a statement, question, exclamation, or command, and consisting of a main clause and sometimes one or more subordinate clauses."
        ,
        "synonyms": ["phrase", "statement", "judgment"]
    },
    {
        "word": "SEPARATE",
        "difficulty": 2,
        "definition": "(adj./v.) Forming or viewed as a unit apart or by itself."
        ,
        "synonyms": ["divide", "split", "distinct"]
    },
    {
        "word": "SEPARATION",
        "definition": "(n.) The act of keeping things distinct or away from each other."
        ,
        "synonyms": ["division", "split", "disconnection"]
    },
    {
        "word": "SERGEANT",
        "difficulty": 4,
        "definition": "(n.) A non-commissioned officer in the armed forces, ranking above a corporal."
        ,
        "synonyms": ["officer", "non-com", "military-rank"]
    },
    {
        "word": "SEVERAL",
        "difficulty": 1,
        "definition": "(det./pron./adj.) More than two but not many."
        ,
        "synonyms": ["many", "numerous", "various"]
    },
    {
        "word": "SEVERELY",
        "difficulty": 2,
        "definition": "(adv.) To an undesirably great or intense degree."
        ,
        "synonyms": ["harshly", "seriously", "intensely"]
    },
    {
        "word": "SHEPHERD",
        "difficulty": 4,
        "definition": "(n./v.) A person who tends and rears sheep."
        ,
        "synonyms": ["herder", "pastor", "guide"]
    },
    {
        "word": "SHINING",
        "difficulty": 1,
        "definition": "(adj./v./n.) (Of its surface) reflecting light, typically because very clean or polished."
        ,
        "synonyms": ["gleaming", "glowing", "radiant"]
    },
    {
        "word": "SIEGE",
        "difficulty": 4,
        "definition": "(n./v.) A military operation in which enemy forces surround a town or building, cutting off essential supplies, with the aim of compelling the surrender of those inside."
        ,
        "synonyms": ["blockade", "encirclement", "besiegement"]
    },
    {
        "word": "SIMILAR",
        "difficulty": 2,
        "definition": "(adj.) Resembling without being identical."
        ,
        "synonyms": ["alike", "comparable", "related"]
    },
    {
        "word": "SIMILE",
        "difficulty": 4,
        "definition": "(n.) A figure of speech involving the comparison of one thing with another thing of a different kind, used to make a description more emphatic or vivid (e.g., as brave as a lion, crazy like a fox)."
        ,
        "synonyms": ["comparison", "metaphor", "analogy"]
    },
    {
        "word": "SIMPLY",
        "difficulty": 1,
        "definition": "(adv.) In a straightforward or easy way."
        ,
        "synonyms": ["just", "merely", "only"]
    },
    {
        "word": "SIMULTANEOUS",
        "difficulty": 4,
        "definition": "(adj.) Occurring, operating, or done at the same time."
        ,
        "synonyms": ["concurrent", "coincident", "parallel"]
    },
    {
        "word": "SINCERELY",
        "difficulty": 2,
        "definition": "(adv.) In a genuine, honest, and heartfelt way."
        ,
        "synonyms": ["genuinely", "honestly", "truly"]
    },
    {
        "word": "SKIING",
        "difficulty": 2,
        "definition": "(n./v.) The action of traveling over snow on skis, especially as a sport or recreation."
        ,
        "synonyms": ["downhill", "winter-sport", "slalom"]
    },
    {
        "word": "SOPHOMORE",
        "difficulty": 4,
        "definition": "(n./adj.) A second-year college or high school student."
        ,
        "synonyms": ["second-year", "student", "undergrad"]
    },
    {
        "word": "SOUVENIR",
        "difficulty": 4,
        "definition": "(n./v.) A thing that is kept as a reminder of a person, place, or event."
        ,
        "synonyms": ["keepsake", "memento", "remembrance"]
    },
    {
        "word": "SPECIFICALLY",
        "difficulty": 4,
        "definition": "(adv.) In a way that is exact and clear; precisely."
        ,
        "synonyms": ["particularly", "in-detail", "precisely"]
    },
    {
        "word": "SPECIMEN",
        "difficulty": 4,
        "definition": "(n.) A single example of a plant, animal, or object used to represent or study its kind."
        ,
        "synonyms": ["sample", "example", "representative"]
    },
    {
        "word": "SPEECH",
        "difficulty": 1,
        "definition": "(n.) The expression of or the ability to express thoughts and feelings by articulate sounds."
        ,
        "synonyms": ["talk", "address", "oration"]
    },
    {
        "word": "SPONSOR",
        "difficulty": 2,
        "definition": "(n./v.) A person or organization that provides funds for a project or activity carried out by another, in particular a person or organization that pays for or contributes to the costs involved in staging a sporting or artistic event in return for advertising."
        ,
        "synonyms": ["backer", "patron", "supporter"]
    },
    {
        "word": "SPONTANEOUS",
        "difficulty": 4,
        "definition": "(adj.) Performed or occurring as a result of a sudden inner impulse or inclination and without premeditation or external stimulus."
        ,
        "synonyms": ["impulsive", "unplanned", "instinctive"]
    },
    {
        "word": "STATISTICS",
        "difficulty": 4,
        "definition": "(n.) The practice or science of collecting and analyzing numerical data in large quantities, especially for the purpose of inferring proportions in a whole from those in a representative sample."
        ,
        "synonyms": ["data", "figures", "numbers"]
    },
    {
        "word": "STOPPED",
        "difficulty": 1,
        "definition": "(v./adj.) (Of an event, action, or process) come to an end; cease to happen."
        ,
        "synonyms": ["halted", "ceased", "ended"]
    },
    {
        "word": "STRATEGY",
        "difficulty": 4,
        "definition": "(n.) A plan of action or policy designed to achieve a major or overall aim."
        ,
        "synonyms": ["plan", "tactic", "approach"]
    },
    {
        "word": "STRENGTH",
        "difficulty": 2,
        "definition": "(n.) The power or capacity to resist force or endure."
        ,
        "synonyms": ["power", "force", "might"]
    },
    {
        "word": "STRENUOUS",
        "difficulty": 4,
        "definition": "(adj.) Requiring or using great exertion."
        ,
        "synonyms": ["taxing", "demanding", "exhausting"]
    },
    {
        "word": "STUBBORNNESS",
        "difficulty": 4,
        "definition": "(n.) Unreasonable refusal to change one's mind or course of action."
        ,
        "synonyms": ["obstinacy", "determination", "pigheadedness"]
    },
    {
        "word": "STUDYING",
        "difficulty": 1,
        "definition": "(v./n.) Devoting time and attention to acquiring knowledge on (an academic subject), especially by means of books."
        ,
        "synonyms": ["learning", "reviewing", "examining"]
    },
    {
        "word": "SUBORDINATE",
        "difficulty": 4,
        "definition": "(adj./n./v.) Lower in rank or position."
        ,
        "synonyms": ["inferior", "secondary", "dependent"]
    },
    {
        "word": "SUCCEED",
        "difficulty": 2,
        "definition": "(v.) Achieve the desired aim or result."
        ,
        "synonyms": ["achieve", "accomplish", "prevail"]
    },
    {
        "word": "SUCCESS",
        "difficulty": 2,
        "definition": "(n.) The accomplishment of an aim or purpose."
        ,
        "synonyms": ["achievement", "triumph", "victory"]
    },
    {
        "word": "SUCCESSFUL",
        "difficulty": 2,
        "definition": "(adj.) Accomplishing an aim or purpose."
        ,
        "synonyms": ["triumphant", "thriving", "accomplished"]
    },
    {
        "word": "SUCCESSION",
        "difficulty": 4,
        "definition": "(n.) A number of people or things of a similar kind following one after the other."
        ,
        "synonyms": ["sequence", "series", "progression"]
    },
    {
        "word": "SUFFICIENT",
        "difficulty": 4,
        "definition": "(adj.) Enough; adequate."
        ,
        "synonyms": ["enough", "adequate", "ample"]
    },
    {
        "word": "SUPERSEDE",
        "difficulty": 4,
        "definition": "(v.) Take the place of (a person or thing previously in authority or use); supplant."
        ,
        "synonyms": ["replace", "override", "supplant"]
    },
    {
        "word": "SUPPRESS",
        "difficulty": 2,
        "definition": "(v.) Forcibly put an end to."
        ,
        "synonyms": ["quash", "stifle", "restrain"]
    },
    {
        "word": "SURPRISE",
        "difficulty": 2,
        "definition": "(n./v./adj.) An unexpected or astonishing event, fact, or thing."
        ,
        "synonyms": ["astonish", "shock", "startle"]
    },
    {
        "word": "SURROUND",
        "difficulty": 2,
        "definition": "(v./n.) Be all around (someone or something)."
        ,
        "synonyms": ["encircle", "enclose", "encompass"]
    },
    {
        "word": "SUSCEPTIBLE",
        "difficulty": 4,
        "definition": "(adj.) Likely or liable to be influenced or harmed by a particular thing."
        ,
        "synonyms": ["vulnerable", "prone", "sensitive"]
    },
    {
        "word": "SUSPICIOUS",
        "difficulty": 4,
        "definition": "(adj.) Having or showing a cautious distrust of someone or something."
        ,
        "synonyms": ["doubtful", "wary", "distrustful"]
    },
    {
        "word": "SYLLABLE",
        "difficulty": 4,
        "definition": "(n./v.) A unit of spoken language built around a single vowel sound, forming part or all of a word."
        ,
        "synonyms": ["sound-unit", "phoneme", "vowel-unit"]
    },
    {
        "word": "SYMMETRICAL",
        "difficulty": 4,
        "definition": "(adj.) Having balanced, identical proportions on both sides of a central dividing line."
        ,
        "synonyms": ["balanced", "even", "uniform"]
    },
    {
        "word": "SYNONYMOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of a word or phrase) having the same or nearly the same meaning as another word or phrase in the same language."
        ,
        "synonyms": ["equivalent", "interchangeable", "alike"]
    },
    {
        "word": "TANGIBLE",
        "difficulty": 4,
        "definition": "(adj./n.) Perceptible by touch."
        ,
        "synonyms": ["concrete", "palpable", "real"]
    },
    {
        "word": "TECHNICAL",
        "difficulty": 2,
        "definition": "(adj.) Involving specialized knowledge or skills related to a particular field or trade."
        ,
        "synonyms": ["specialized", "expert", "scientific"]
    },
    {
        "word": "TECHNIQUE",
        "difficulty": 4,
        "definition": "(n.) A way of carrying out a particular task, especially the execution or performance of an artistic work or a scientific procedure."
        ,
        "synonyms": ["method", "skill", "approach"]
    },
    {
        "word": "TEMPERAMENTAL",
        "difficulty": 4,
        "definition": "(adj.) (Of a person) liable to unreasonable changes of mood."
        ,
        "synonyms": ["moody", "volatile", "sensitive"]
    },
    {
        "word": "TEMPERATURE",
        "difficulty": 2,
        "definition": "(n.) The degree or intensity of heat present in a substance or object, especially as expressed according to a comparative scale and shown by a thermometer or perceived by touch."
        ,
        "synonyms": ["heat", "degree", "warmth"]
    },
    {
        "word": "TENDENCY",
        "difficulty": 4,
        "definition": "(n.) An inclination toward a particular characteristic or type of behavior."
        ,
        "synonyms": ["inclination", "trend", "predisposition"]
    },
    {
        "word": "THEMSELVES",
        "difficulty": 1,
        "definition": "(pron.) Used as the object of a verb or preposition to refer to a group of people or things previously mentioned as the subject of the clause."
        ,
        "synonyms": ["their-own", "oneself", "reflexive"]
    },
    {
        "word": "THEORIES",
        "difficulty": 2,
        "definition": "(n.) Sets of ideas or principles used to explain facts or events."
        ,
        "synonyms": ["hypotheses", "concepts", "explanations"]
    },
    {
        "word": "THEREFORE",
        "difficulty": 2,
        "definition": "(adv.) For that reason; consequently."
        ,
        "synonyms": ["thus", "consequently", "so"]
    },
    {
        "word": "THOROUGH",
        "difficulty": 4,
        "definition": "(adj.) Complete with regard to every detail; not superficial or partial."
        ,
        "synonyms": ["complete", "exhaustive", "careful"]
    },
    {
        "word": "THOUGH",
        "difficulty": 2,
        "definition": "(adv./conj./n.) In spite of the fact that; although."
        ,
        "synonyms": ["although", "even-if", "however"]
    },
    {
        "word": "THRESHOLD",
        "difficulty": 4,
        "definition": "(n.) A strip of wood or stone forming the bottom of a doorway and crossed in entering a house or room."
        ,
        "synonyms": ["limit", "boundary", "point"]
    },
    {
        "word": "THROUGH",
        "difficulty": 1,
        "definition": "(prep./adv./adj.) Moving in one side and out of the other side of (an opening, channel, or location)."
        ,
        "synonyms": ["across", "via", "by-way-of"]
    },
    {
        "word": "TOMORROW",
        "difficulty": 1,
        "definition": "(adv./n.) On the day after today."
        ,
        "synonyms": ["next-day", "the-future", "ma\u00f1ana"]
    },
    {
        "word": "TOURNAMENT",
        "difficulty": 4,
        "definition": "(n.) (In a sport or game) a series of contests between a number of competitors, who compete for an overall prize."
        ,
        "synonyms": ["competition", "contest", "championship"]
    },
    {
        "word": "TOWARDS",
        "difficulty": 1,
        "definition": "(prep.) In the direction of."
        ,
        "synonyms": ["in-the-direction", "approaching", "near"]
    },
    {
        "word": "TRAGEDY",
        "difficulty": 4,
        "definition": "(n.) An event causing great suffering, destruction, and distress, such as a serious accident, crime, or natural catastrophe."
        ,
        "synonyms": ["disaster", "catastrophe", "calamity"]
    },
    {
        "word": "TRANSFERRING",
        "difficulty": 4,
        "definition": "(v.) Move from one place to another."
        ,
        "synonyms": ["moving", "shifting", "relocating"]
    },
    {
        "word": "TRIES",
        "difficulty": 1,
        "definition": "(v.) Makes an attempt or effort to do something."
        ,
        "synonyms": ["attempts", "endeavors", "efforts"]
    },
    {
        "word": "TRULY",
        "difficulty": 1,
        "definition": "(adv.) In a truthful way."
        ,
        "synonyms": ["genuinely", "honestly", "sincerely"]
    },
    {
        "word": "TWELFTH",
        "difficulty": 4,
        "definition": "(num./n./adj.) Constituting number twelve in a sequence; 12th."
        ,
        "synonyms": ["dozenth", "ordinal-twelve", "number-twelve"]
    },
    {
        "word": "TYRANNY",
        "difficulty": 4,
        "definition": "(n.) Cruel and oppressive government or rule."
        ,
        "synonyms": ["oppression", "despotism", "authoritarianism"]
    },
    {
        "word": "UNDOUBTEDLY",
        "difficulty": 4,
        "definition": "(adv.) Without doubt; certainly."
        ,
        "synonyms": ["certainly", "unquestionably", "surely"]
    },
    {
        "word": "UNFORGETTABLE",
        "difficulty": 4,
        "definition": "(adj.) Impossible to forget; very memorable."
        ,
        "synonyms": ["memorable", "indelible", "lasting"]
    },
    {
        "word": "UNIQUE",
        "difficulty": 2,
        "definition": "(adj./n.) Being the only one of its kind; unlike anything else."
        ,
        "synonyms": ["one-of-a-kind", "singular", "unmatched"]
    },
    {
        "word": "UNNECESSARY",
        "difficulty": 4,
        "definition": "(adj./n.) Not needed."
        ,
        "synonyms": ["needless", "redundant", "superfluous"]
    },
    {
        "word": "UNTIL",
        "difficulty": 1,
        "definition": "(prep./conj.) Up to (the point in time or the event mentioned)."
        ,
        "synonyms": ["up-to", "till", "before"]
    },
    {
        "word": "USABLE",
        "difficulty": 2,
        "definition": "(adj.) Able or fit to be used."
        ,
        "synonyms": ["functional", "serviceable", "operable"]
    },
    {
        "word": "USAGE",
        "difficulty": 2,
        "definition": "(n.) The action of using something or the fact of being used."
        ,
        "synonyms": ["use", "application", "practice"]
    },
    {
        "word": "USUALLY",
        "difficulty": 1,
        "definition": "(adv.) Under normal conditions; generally."
        ,
        "synonyms": ["typically", "generally", "normally"]
    },
    {
        "word": "UTILIZATION",
        "difficulty": 4,
        "definition": "(n.) The action of making practical and effective use of something."
        ,
        "synonyms": ["use", "application", "employment"]
    },
    {
        "word": "VACUUM",
        "difficulty": 4,
        "definition": "(n./v./adj.) A space entirely devoid of matter."
        ,
        "synonyms": ["void", "emptiness", "suction"]
    },
    {
        "word": "VALUABLE",
        "difficulty": 2,
        "definition": "(adj./n.) Worth a great deal of money."
        ,
        "synonyms": ["precious", "useful", "worthwhile"]
    },
    {
        "word": "VENGEANCE",
        "difficulty": 4,
        "definition": "(n.) Punishment inflicted or retribution exacted for an injury or wrong."
        ,
        "synonyms": ["revenge", "retribution", "retaliation"]
    },
    {
        "word": "VIGILANT",
        "difficulty": 4,
        "definition": "(adj.) Keeping careful watch for possible danger or difficulties."
        ,
        "synonyms": ["watchful", "alert", "observant"]
    },
    {
        "word": "VILLAGE",
        "difficulty": 1,
        "definition": "(n./adj.) A group of houses and associated buildings, larger than a hamlet and smaller than a town, situated in a rural area."
        ,
        "synonyms": ["hamlet", "settlement", "community"]
    },
    {
        "word": "VILLAIN",
        "difficulty": 4,
        "definition": "(n.) (In a novel, movie, or play) a character whose evil actions or motives are important to the plot."
        ,
        "synonyms": ["antagonist", "criminal", "wrongdoer"]
    },
    {
        "word": "VIOLENCE",
        "difficulty": 2,
        "definition": "(n.) Behavior involving physical force intended to hurt, damage, or kill someone or something."
        ,
        "synonyms": ["force", "aggression", "brutality"]
    },
    {
        "word": "VIRTUE",
        "difficulty": 2,
        "definition": "(n.) Behavior showing high moral standards."
        ,
        "synonyms": ["goodness", "morality", "integrity"]
    },
    {
        "word": "VISIBLE",
        "difficulty": 2,
        "definition": "(adj./n.) Able to be seen."
        ,
        "synonyms": ["seen", "apparent", "observable"]
    },
    {
        "word": "VISION",
        "difficulty": 2,
        "definition": "(n./v.) The faculty or state of being able to see."
        ,
        "synonyms": ["sight", "dream", "eyesight"]
    },
    {
        "word": "VOLUME",
        "difficulty": 1,
        "definition": "(n.) A book forming part of a work or series."
        ,
        "synonyms": ["quantity", "loudness", "bulk"]
    },
    {
        "word": "WARRANT",
        "difficulty": 2,
        "definition": "(n./v.) A document issued by a legal or government official authorizing the police or some other body to make an arrest, search premises, or carry out some other action relating to the administration of justice."
        ,
        "synonyms": ["justify", "merit", "authorize"]
    },
    {
        "word": "WARRIORS",
        "difficulty": 2,
        "definition": "(n.) (Especially in the past) a brave or experienced soldier or fighter."
        ,
        "synonyms": ["fighters", "soldiers", "combatants"]
    },
    {
        "word": "WEATHER",
        "difficulty": 1,
        "definition": "(n./v.) The state of the atmosphere at a place and time as regards heat, dryness, sunshine, wind, rain, etc."
        ,
        "synonyms": ["endure", "survive", "withstand"]
    },
    {
        "word": "WEDNESDAY",
        "difficulty": 4,
        "definition": "(n.) The day of the week before Thursday and after Tuesday."
        ,
        "synonyms": ["midweek", "mid-week-day", "Wed"]
    },
    {
        "word": "WEIRD",
        "difficulty": 2,
        "definition": "(adj.) Suggesting something supernatural; uncanny."
        ,
        "synonyms": ["strange", "odd", "bizarre"]
    },
    {
        "word": "WHEREVER",
        "difficulty": 1,
        "definition": "(adv./conj.) In or to whatever place (of which the name is unknown)."
        ,
        "synonyms": ["everywhere", "anywhere", "wherever-you-go"]
    },
    {
        "word": "WHETHER",
        "difficulty": 2,
        "definition": "(conj.) Expressing a doubt or choice between alternatives."
        ,
        "synonyms": ["if", "in-case", "regardless"]
    },
    {
        "word": "WHICH",
        "difficulty": 1,
        "definition": "(pron./det.) Asking for information specifying one or more people or things from a definite set."
        ,
        "synonyms": ["that", "what-one", "the-one-that"]
    },
    {
        "word": "WHOLLY",
        "difficulty": 4,
        "definition": "(adv.) Entirely; fully."
        ,
        "synonyms": ["completely", "entirely", "fully"]
    },
    {
        "word": "WITHDRAWAL",
        "difficulty": 4,
        "definition": "(n.) The act of removing or pulling back something; also the physical effects of stopping use of an addictive substance."
        ,
        "synonyms": ["retreat", "removal", "departure"]
    },
    {
        "word": "WITHHOLD",
        "difficulty": 4,
        "definition": "(v.) Refuse to give (something that is due to or is desired by another)."
        ,
        "synonyms": ["keep-back", "reserve", "retain"]
    },
    {
        "word": "WOMAN",
        "difficulty": 1,
        "definition": "(n.) An adult human female."
        ,
        "synonyms": ["female", "lady", "adult-woman"]
    },
    {
        "word": "WOMEN",
        "difficulty": 1,
        "definition": "(n.) Adult female human beings."
        ,
        "synonyms": ["females", "ladies", "adult-women"]
    },
    {
        "word": "WORTHWHILE",
        "difficulty": 2,
        "definition": "(adj.) Sufficiently rewarding or beneficial to justify the time and effort required."
        ,
        "synonyms": ["valuable", "rewarding", "useful"]
    },
    {
        "word": "WRITING",
        "difficulty": 1,
        "definition": "(n.) The activity or skill of marking coherent words on paper and composing text."
        ,
        "synonyms": ["authoring", "composing", "penning"]
    },
    {
        "word": "YACHT",
        "difficulty": 4,
        "definition": "(n./v.) A medium-sized sailboat equipped for cruising or racing."
        ,
        "synonyms": ["sailboat", "vessel", "luxury-boat"]
    },
    {
        "word": "YIELD",
        "difficulty": 2,
        "definition": "(v./n.) Produce or provide (a natural, agricultural, or industrial product)."
        ,
        "synonyms": ["produce", "surrender", "output"]
    },
    {
        "word": "YOUNG",
        "difficulty": 1,
        "definition": "(adj./n.) Having lived or existed for only a short time."
        ,
        "synonyms": ["youthful", "immature", "juvenile"]
    },
    {
        "word": "ZUCCHINI",
        "difficulty": 4,
        "definition": "(n.) A green variety of smooth-skinned summer squash."
        ,
        "synonyms": ["courgette", "squash", "vegetable"]
    }
];


const INKLING_WORDS = [
    {
        "word": "ABANDON",
        "definition": "(v.) Cease to support or look after.",
        "sentence": "He had to abandon the ship.",
        "hint": "Leave.",
        "difficulty": 5
        ,
        "synonyms": ["desert", "forsake", "leave"]
    },
    {
        "word": "ABLE",
        "difficulty": 1,
        "tier": 5,
        "definition": "(adjective) Having the skill or means to do something",
        "sentences": [
            "She is able to play piano.",
            "He was not able to attend.",
            "Are you able to help?"
        ]
        ,
        "synonyms": ["capable", "competent", "skilled"]
    },
    {
        "word": "ABOUT",
        "difficulty": 1,
        "tier": 1,
        "definition": "(preposition / adverb) Concerning; approximately",
        "sentences": [
            "She told me about her trip.",
            "It took about an hour.",
            "What is the book about?"
        ]
        ,
        "synonyms": ["concerning", "around", "regarding"]
    },
    {
        "word": "ABOVE",
        "difficulty": 1,
        "tier": 3,
        "definition": "(preposition / adverb) At a higher level; more than",
        "sentences": [
            "The bird flew above the clouds.",
            "The answer is above.",
            "The temperature was above thirty degrees."
        ]
        ,
        "synonyms": ["over", "higher", "overhead"]
    },
    {
        "word": "ABSENT",
        "difficulty": 4,
        "definition": "(adj.) Not present in a place.",
        "sentence": "He was absent from school.",
        "hint": "Missing."
        ,
        "synonyms": ["missing", "away", "gone"]
    },
    {
        "word": "ACCOMMODATE",
        "definition": "(v.) Provide lodging or sufficient space for.",
        "sentence": "The hotel can accommodate 100 guests.",
        "hint": "Fit in.",
        "difficulty": 5
        ,
        "synonyms": ["house", "adapt", "comply"]
    },
    {
        "word": "ACCUMULATE",
        "difficulty": 5,
        "definition": "(v.) Gather together or acquire an increasing number.",
        "sentences": [
            "Small drops accumulate into a large puddle.",
            "He hopes to accumulate enough savings to travel.",
            "Leaves accumulate in the yard each autumn."
        ],
        "hint": "Gather."
        ,
        "synonyms": ["gather", "amass", "collect"]
    },
    {
        "word": "ACCURATE",
        "difficulty": 5,
        "definition": "(adj.) Correct in all details; exact.",
        "sentence": "The report was accurate.",
        "hint": "Correct."
        ,
        "synonyms": ["correct", "precise", "exact"]
    },
    {
        "word": "ACROSS",
        "difficulty": 1,
        "tier": 4,
        "definition": "(preposition / adverb) From one side to the other; on the other side",
        "sentences": [
            "She swam across the lake.",
            "The shop is across the road.",
            "He helped her across the bridge."
        ]
        ,
        "synonyms": ["over", "spanning", "through"]
    },
    {
        "word": "ACT",
        "difficulty": 1,
        "tier": 7,
        "definition": "(verb / noun) To do something; a thing done; a section of a play",
        "sentences": [
            "She acted in the school play.",
            "It was a brave act.",
            "The second act was the best."
        ]
        ,
        "synonyms": ["do", "perform", "deed"]
    },
    {
        "word": "ACTION",
        "difficulty": 1,
        "tier": 10,
        "definition": "(noun) The process of doing something",
        "sentences": [
            "She took action quickly.",
            "The film had lots of action.",
            "He is a man of action."
        ]
        ,
        "synonyms": ["deed", "move", "activity"]
    },
    {
        "word": "ACTIVE",
        "difficulty": 4,
        "definition": "(adj.) Engaging in physical activity.",
        "sentence": "She led an active life.",
        "hint": "Busy."
        ,
        "synonyms": ["lively", "busy", "energetic"]
    },
    {
        "word": "ACTUALLY",
        "difficulty": 4,
        "tier": 10,
        "definition": "(adverb) In truth; in reality",
        "sentences": [
            "She actually enjoyed it!",
            "He is actually very shy.",
            "I actually didn't know that."
        ]
        ,
        "synonyms": ["really", "in-fact", "truly"]
    },
    {
        "word": "ADAPT",
        "difficulty": 5,
        "definition": "(v.) Become adjusted to new conditions.",
        "sentence": "Animals adapt to their environment.",
        "hint": "Change."
        ,
        "synonyms": ["adjust", "modify", "change"]
    },
    {
        "word": "ADD",
        "difficulty": 1,
        "tier": 3,
        "definition": "(verb) To put together; to calculate the sum of",
        "sentences": [
            "Add two plus two.",
            "She added sugar to her tea.",
            "Let's add more color to the painting."
        ]
        ,
        "synonyms": ["include", "attach", "increase"]
    },
    {
        "word": "ADDITION",
        "difficulty": 4,
        "tier": 9,
        "definition": "(noun) A number or thing joined to make a larger total; the act of combining two amounts.",
        "sentences": [
            "She is good at addition.",
            "In addition, there is free parking.",
            "He learned addition and subtraction."
        ]
        ,
        "synonyms": ["supplement", "plus", "extra"]
    },
    {
        "word": "ADEQUATE",
        "difficulty": 5,
        "definition": "(adj.) Satisfactory or acceptable in quality.",
        "sentence": "The food was adequate.",
        "hint": "Enough."
        ,
        "synonyms": ["enough", "sufficient", "satisfactory"]
    },
    {
        "word": "ADHERE",
        "difficulty": 5,
        "definition": "(v.) Stick fast to a surface.",
        "sentence": "The paint will adhere to the wall.",
        "hint": "Stick."
        ,
        "synonyms": ["stick", "follow", "comply"]
    },
    {
        "word": "ADJECTIVE",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun) A word that describes a noun",
        "sentences": [
            "Big is an adjective.",
            "She circled all the adjectives.",
            "Adjectives describe nouns."
        ]
        ,
        "synonyms": ["descriptor", "modifier", "qualifier"]
    },
    {
        "word": "ADORE",
        "difficulty": 5,
        "definition": "(v.) Love and respect deeply.",
        "sentences": [
            "I adore spending time outdoors.",
            "They adore their little brother.",
            "She will always adore her grandmother's cooking."
        ],
        "hint": "Love."
        ,
        "synonyms": ["love", "cherish", "worship"]
    },
    {
        "word": "ADULT",
        "difficulty": 1,
        "definition": "(n./adj.) A person who is fully grown; mature.",
        "sentence": "She is an adult now.",
        "hint": "Grown-up."
        ,
        "synonyms": ["grown-up", "mature", "senior"]
    },
    {
        "word": "ADVENTURE",
        "difficulty": 4,
        "definition": "(n.) An unusual and exciting experience.",
        "sentence": "They went on an adventure.",
        "hint": "Quest."
        ,
        "synonyms": ["quest", "journey", "expedition"]
    },
    {
        "word": "ADVERSITY",
        "difficulty": 5,
        "definition": "(n.) Hardship; misfortune.",
        "sentence": "They overcame great adversity.",
        "hint": "Hardship."
        ,
        "synonyms": ["hardship", "difficulty", "misfortune"]
    },
    {
        "word": "ADVICE",
        "difficulty": 4,
        "definition": "(n.) Guidance offered with regard to future action.",
        "sentence": "She gave him some advice.",
        "hint": "Counsel."
        ,
        "synonyms": ["guidance", "counsel", "recommendation"]
    },
    {
        "word": "ADVOCATE",
        "difficulty": 5,
        "definition": "(v./n.) Publicly support or recommend; a supporter.",
        "sentence": "He is an advocate for human rights.",
        "hint": "Supporter."
        ,
        "synonyms": ["champion", "support", "endorse"]
    },
    {
        "word": "AFFECT",
        "difficulty": 4,
        "definition": "(v.) Have an effect on; make a difference.",
        "sentences": [
            "Loud noises can affect your ability to concentrate.",
            "Rain can affect the outcome of a game.",
            "How does music affect your mood?"
        ],
        "hint": "Influence.",
        "sentences": [
            "Loud noises can affect your ability to concentrate.",
            "Rain can affect the outcome of a game.",
            "How does music affect your mood?"
        ]
        ,
        "synonyms": ["influence", "impact", "alter"]
    },
    {
        "word": "AFFORD",
        "difficulty": 4,
        "definition": "(v.) Have enough money to pay for.",
        "sentence": "He couldn't afford the car.",
        "hint": "Pay for."
        ,
        "synonyms": ["manage", "pay-for", "provide"]
    },
    {
        "word": "AFRAID",
        "difficulty": 1,
        "tier": 10,
        "definition": "(adjective) Feeling fear",
        "sentences": [
            "She was afraid of spiders.",
            "Don't be afraid.",
            "He was afraid of the dark."
        ]
        ,
        "synonyms": ["scared", "frightened", "fearful"]
    },
    {
        "word": "AFRICA",
        "difficulty": 4,
        "tier": 7,
        "definition": "(noun) A large continent south of Europe",
        "sentences": [
            "She traveled to Africa.",
            "Africa has many amazing animals.",
            "He studied history in Africa."
        ]
        ,
        "synonyms": ["continent", "sub-Saharan", "the-motherland"]
    },
    {
        "word": "AFTER",
        "difficulty": 1,
        "tier": 2,
        "definition": "(preposition / conjunction) Following in time or place",
        "sentences": [
            "She arrived after noon.",
            "After dinner, we went for a walk.",
            "He felt better after sleeping."
        ]
        ,
        "synonyms": ["following", "later", "subsequent"]
    },
    {
        "word": "AGAIN",
        "difficulty": 1,
        "tier": 2,
        "definition": "(adverb) One more time; returning to a previous state",
        "sentences": [
            "Say that again, please.",
            "She tried again and succeeded.",
            "I will never do that again."
        ]
        ,
        "synonyms": ["once-more", "anew", "repeatedly"]
    },
    {
        "word": "AGAINST",
        "difficulty": 1,
        "tier": 4,
        "definition": "(preposition) In opposition to; touching",
        "sentences": [
            "She leaned against the wall.",
            "He voted against the plan.",
            "They played against the best team."
        ]
        ,
        "synonyms": ["opposed", "contrary", "versus"]
    },
    {
        "word": "AGE",
        "difficulty": 1,
        "tier": 7,
        "definition": "(noun / verb) The length of time something has existed; to grow old",
        "sentences": [
            "What is your age?",
            "Cheese ages well.",
            "She retired at the age of sixty."
        ]
        ,
        "synonyms": ["era", "period", "maturity"]
    },
    {
        "word": "AGO",
        "difficulty": 1,
        "tier": 5,
        "definition": "(adverb) In the past; before the present time",
        "sentences": [
            "She left an hour ago.",
            "He was born twenty years ago.",
            "That was a long time ago."
        ]
        ,
        "synonyms": ["past", "before", "previously"]
    },
    {
        "word": "AGREE",
        "difficulty": 1,
        "definition": "(v.) Have the same opinion about something.",
        "sentences": [
            "I agree with your idea.",
            "Do you agree that exercise is important?",
            "They agree on most things."
        ],
        "hint": "Concur.",
        "sentences": [
            "I agree with your idea.",
            "Do you agree that exercise is important?",
            "They agree on most things."
        ]
        ,
        "synonyms": ["consent", "concur", "accept"]
    },
    {
        "word": "AGREED",
        "difficulty": 4,
        "tier": 10,
        "definition": "(verb) Came to share the same view or reached a mutual understanding.",
        "sentences": [
            "They agreed to meet at noon.",
            "She agreed with his idea.",
            "He agreed without hesitation."
        ]
        ,
        "synonyms": ["consented", "accepted", "concurred"]
    },
    {
        "word": "AHEAD",
        "difficulty": 1,
        "tier": 10,
        "definition": "(adverb) In front; forward",
        "sentences": [
            "She walked ahead.",
            "Look ahead and plan.",
            "He ran far ahead."
        ]
        ,
        "synonyms": ["forward", "in-front", "preceding"]
    },
    {
        "word": "AIR",
        "difficulty": 1,
        "tier": 2,
        "definition": "(noun) The mixture of gases surrounding the Earth",
        "sentences": [
            "Fresh air is good for you.",
            "She threw the ball in the air.",
            "The air smelled like flowers."
        ]
        ,
        "synonyms": ["atmosphere", "breeze", "oxygen"]
    },
    {
        "word": "ALARM",
        "difficulty": 4,
        "definition": "(n./v.) An anxious awareness of danger; to warn.",
        "sentence": "The alarm went off.",
        "hint": "Warning."
        ,
        "synonyms": ["alert", "warning", "fright"]
    },
    {
        "word": "ALL",
        "difficulty": 1,
        "tier": 1,
        "definition": "(adjective / pronoun) The whole amount or every one of something",
        "sentences": [
            "All the children laughed.",
            "She ate all the cake.",
            "All of us went."
        ]
        ,
        "synonyms": ["entire", "whole", "every"]
    },
    {
        "word": "ALLOW",
        "difficulty": 1,
        "tier": 10,
        "definition": "(verb) To let something happen; to permit",
        "sentences": [
            "Please allow extra time.",
            "She allowed him to stay.",
            "Are pets allowed?"
        ]
        ,
        "synonyms": ["permit", "let", "grant"]
    },
    {
        "word": "ALMOST",
        "difficulty": 1,
        "definition": "(adv.) Not quite; very nearly.",
        "sentence": "He almost fell.",
        "hint": "Nearly."
        ,
        "synonyms": ["nearly", "practically", "close-to"]
    },
    {
        "word": "ALONE",
        "difficulty": 1,
        "definition": "(adj./adv.) Having no one else present.",
        "sentence": "She was all alone.",
        "hint": "Solely."
        ,
        "synonyms": ["solitary", "by-oneself", "isolated"]
    },
    {
        "word": "ALONG",
        "difficulty": 1,
        "tier": 3,
        "definition": "(preposition / adverb) Moving forward; beside",
        "sentences": [
            "She walked along the river.",
            "Come along with us!",
            "He skipped along the path."
        ]
        ,
        "synonyms": ["beside", "by", "with"]
    },
    {
        "word": "ALREADY",
        "difficulty": 1,
        "tier": 7,
        "definition": "(adverb) Before the time in question; by now",
        "sentences": [
            "She is already home.",
            "Have you already eaten?",
            "He had already left."
        ]
        ,
        "synonyms": ["by-now", "previously", "thus-far"]
    },
    {
        "word": "ALSO",
        "difficulty": 1,
        "tier": 2,
        "definition": "(adverb) In addition; as well",
        "sentences": [
            "She can sing and also dance.",
            "I also like chocolate.",
            "He also finished early."
        ]
        ,
        "synonyms": ["too", "additionally", "moreover"]
    },
    {
        "word": "ALTHOUGH",
        "difficulty": 4,
        "tier": 7,
        "definition": "(conjunction) Despite the fact that; even though",
        "sentences": [
            "Although it was cold, she went out.",
            "She smiled, although she was tired.",
            "He came, although he was late."
        ]
        ,
        "synonyms": ["though", "even-though", "while"]
    },
    {
        "word": "ALWAYS",
        "difficulty": 1,
        "definition": "(adv.) At all times; on all occasions.",
        "sentence": "He is always late.",
        "hint": "Ever."
        ,
        "synonyms": ["forever", "constantly", "perpetually"]
    },
    {
        "word": "AMAZING",
        "difficulty": 4,
        "definition": "(adj.) Causing great surprise or wonder.",
        "sentence": "The view was amazing.",
        "hint": "Stunning."
        ,
        "synonyms": ["astonishing", "wonderful", "incredible"]
    },
    {
        "word": "AMBIGUOUS",
        "difficulty": 5,
        "definition": "(adj.) Open to more than one interpretation.",
        "sentence": "The message was ambiguous.",
        "hint": "Unclear."
        ,
        "synonyms": ["unclear", "vague", "equivocal"]
    },
    {
        "word": "AMERICA",
        "difficulty": 1,
        "tier": 2,
        "definition": "(noun) A large landmass in the western hemisphere; informally used to refer to the United States.",
        "sentences": [
            "She moved to America last year.",
            "America has fifty states.",
            "He always dreamed of visiting America."
        ]
        ,
        "synonyms": ["USA", "New World", "the States"]
    },
    {
        "word": "AMONG",
        "difficulty": 4,
        "tier": 5,
        "definition": "(preposition) In the middle of; being a member of",
        "sentences": [
            "She was among the top students.",
            "He found a coin among the leaves.",
            "They sat among the flowers."
        ]
        ,
        "synonyms": ["between", "amid", "within"]
    },
    {
        "word": "AMOUNT",
        "difficulty": 4,
        "definition": "(n./v.) A quantity of something; to total up.",
        "sentence": "A large amount of money.",
        "hint": "Quantity."
        ,
        "synonyms": ["quantity", "sum", "total"]
    },
    {
        "word": "ANALYZE",
        "difficulty": 5,
        "definition": "(v.) Examine methodically and in detail.",
        "sentences": [
            "Scientists analyze samples in the lab.",
            "She will analyze the results carefully.",
            "Let us analyze what went wrong."
        ],
        "hint": "Examine.",
        "sentences": [
            "Scientists analyze samples in the lab.",
            "She will analyze the results carefully.",
            "Let us analyze what went wrong."
        ]
        ,
        "synonyms": ["examine", "study", "evaluate"]
    },
    {
        "word": "AND",
        "difficulty": 1,
        "tier": 1,
        "definition": "(conjunction) Used to connect words, phrases, or clauses",
        "sentences": [
            "I like cats and dogs.",
            "She sang and danced.",
            "We had bread and butter."
        ]
        ,
        "synonyms": ["plus", "also", "along-with"]
    },
    {
        "word": "ANGLE",
        "difficulty": 4,
        "tier": 7,
        "definition": "(noun) The space between two lines that meet",
        "sentences": [
            "Measure the angle.",
            "She looked at it from every angle.",
            "The angle was ninety degrees."
        ]
        ,
        "synonyms": ["slant", "perspective", "corner"]
    },
    {
        "word": "ANGRY",
        "difficulty": 1,
        "definition": "(adj.) Feeling strong annoyance.",
        "sentence": "He was very angry.",
        "hint": "Mad."
        ,
        "synonyms": ["furious", "upset", "irate"]
    },
    {
        "word": "ANIMAL",
        "difficulty": 1,
        "definition": "(n.) A living organism that feeds on organic matter.",
        "sentence": "The dog is an animal.",
        "hint": "Creature."
        ,
        "synonyms": ["creature", "beast", "organism"]
    },
    {
        "word": "ANOTHER",
        "difficulty": 1,
        "tier": 2,
        "definition": "(adjective / pronoun) One more; a different one",
        "sentences": [
            "Can I have another cookie?",
            "Let's try another way.",
            "She moved to another city."
        ]
        ,
        "synonyms": ["additional", "different", "further"]
    },
    {
        "word": "ANSWER",
        "difficulty": 1,
        "definition": "(n./v.) A thing said or written in reaction to a question; to reply.",
        "sentence": "She gave an answer.",
        "hint": "Reply."
        ,
        "synonyms": ["reply", "response", "solution"]
    },
    {
        "word": "ANTICIPATE",
        "difficulty": 5,
        "definition": "(v.) Regard as probable; expect.",
        "sentences": [
            "We anticipate a large crowd at the event.",
            "I anticipate some challenges ahead.",
            "She likes to anticipate problems before they happen."
        ],
        "hint": "Expect."
        ,
        "synonyms": ["expect", "foresee", "predict"]
    },
    {
        "word": "ANY",
        "difficulty": 1,
        "tier": 2,
        "definition": "(adjective / pronoun) One or some; no matter which",
        "sentences": [
            "Is there any milk left?",
            "Any of these will work.",
            "She didn't eat any vegetables."
        ]
        ,
        "synonyms": ["some", "whatever", "whichever"]
    },
    {
        "word": "ANYTHING",
        "difficulty": 1,
        "definition": "(pron.) Used to refer to a thing of any kind.",
        "sentence": "He didn't say anything.",
        "hint": "Whatever."
        ,
        "synonyms": ["whatever", "all", "everything"]
    },
    {
        "word": "APPEAR",
        "difficulty": 4,
        "definition": "(v.) Come into sight; become visible.",
        "sentences": [
            "Stars appear in the sky after dark.",
            "The rabbit will appear from behind the bush.",
            "He seems to appear at just the right moment."
        ],
        "hint": "Show."
        ,
        "synonyms": ["seem", "emerge", "look"]
    },
    {
        "word": "APPLE",
        "difficulty": 1,
        "definition": "(n.) A round fruit with red or green skin.",
        "sentence": "He ate an apple.",
        "hint": "Fruit."
        ,
        "synonyms": ["fruit", "pome", "pippin"]
    },
    {
        "word": "APPROPRIATE",
        "difficulty": 5,
        "definition": "(adj./v.) Suitable or proper; take for one's own use.",
        "sentence": "His behavior was appropriate.",
        "hint": "Suitable."
        ,
        "synonyms": ["suitable", "fitting", "proper"]
    },
    {
        "word": "ARE",
        "difficulty": 1,
        "tier": 1,
        "definition": "(verb) Exist or occur; used with plural subjects to indicate a state or condition.",
        "sentences": [
            "They are my friends.",
            "You are very tall.",
            "We are going home."
        ]
        ,
        "synonyms": ["exist", "be", "remain"]
    },
    {
        "word": "AREA",
        "difficulty": 1,
        "definition": "(n.) A region or part of a town/country.",
        "sentence": "The area was beautiful.",
        "hint": "Region."
        ,
        "synonyms": ["region", "zone", "space"]
    },
    {
        "word": "ARGUE",
        "difficulty": 4,
        "definition": "(v.) Give reasons in support of an idea or to disagree.",
        "sentences": [
            "They argue about the best route to take.",
            "It is not helpful to argue without listening.",
            "Why do they argue over small things?"
        ],
        "hint": "Fight."
        ,
        "synonyms": ["debate", "dispute", "contend"]
    },
    {
        "word": "ARMS",
        "difficulty": 1,
        "tier": 6,
        "definition": "(noun) Limbs attached to the shoulders; weapons",
        "sentences": [
            "She stretched her arms wide.",
            "The soldiers laid down their arms.",
            "He held the baby in his arms."
        ]
        ,
        "synonyms": ["weapons", "limbs", "armor"]
    },
    {
        "word": "ARMY",
        "difficulty": 1,
        "tier": 9,
        "definition": "(noun) A large organized military force",
        "sentences": [
            "She joined the army at eighteen.",
            "The army marched through the town.",
            "He admired the strength of the army."
        ]
        ,
        "synonyms": ["military", "forces", "troops"]
    },
    {
        "word": "AROUND",
        "difficulty": 1,
        "definition": "(prep./adv.) On every side of; surrounding.",
        "sentence": "He looked around.",
        "hint": "Nearby."
        ,
        "synonyms": ["surrounding", "about", "near"]
    },
    {
        "word": "ARRIVE",
        "difficulty": 4,
        "definition": "(v.) Reach a destination.",
        "sentences": [
            "Guests arrive at eight o'clock.",
            "When will the package arrive?",
            "The train should arrive on time."
        ],
        "hint": "Reach."
        ,
        "synonyms": ["reach", "come", "get-there"]
    },
    {
        "word": "ARRIVED",
        "difficulty": 4,
        "tier": 10,
        "definition": "(verb) Reached a destination after traveling.",
        "sentences": [
            "She arrived early.",
            "He arrived with flowers.",
            "The letter arrived today."
        ]
        ,
        "synonyms": ["reached", "came", "got-there"]
    },
    {
        "word": "ART",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun) Creative works like painting and music",
        "sentences": [
            "She studies art.",
            "He loves modern art.",
            "The museum has great art."
        ]
        ,
        "synonyms": ["artwork", "craft", "creation"]
    },
    {
        "word": "ARTIST",
        "difficulty": 4,
        "definition": "(n.) A person who creates paintings or drawings.",
        "sentence": "She is a talented artist.",
        "hint": "Painter."
        ,
        "synonyms": ["creator", "painter", "sculptor"]
    },
    {
        "word": "ASK",
        "difficulty": 1,
        "tier": 2,
        "definition": "(verb) To request information or a favor",
        "sentences": [
            "May I ask a question?",
            "She asked for directions.",
            "Don't be afraid to ask for help."
        ]
        ,
        "synonyms": ["inquire", "request", "question"]
    },
    {
        "word": "ASLEEP",
        "difficulty": 1,
        "definition": "(adj.) In a state of rest where the mind is unconscious.",
        "sentence": "The baby is asleep.",
        "hint": "Sleeping."
        ,
        "synonyms": ["sleeping", "dormant", "unconscious"]
    },
    {
        "word": "ASSIST",
        "difficulty": 5,
        "definition": "(v.) Help someone by sharing work.",
        "sentences": [
            "Volunteers assist with the event each year.",
            "Can you assist me with this project?",
            "Teachers assist students who need extra help."
        ],
        "hint": "Help."
        ,
        "synonyms": ["help", "aid", "support"]
    },
    {
        "word": "ATTACK",
        "difficulty": 4,
        "definition": "(v./n.) Take aggressive action against; an assault.",
        "sentences": [
            "The team will attack from the left side.",
            "A dog may attack if it feels threatened.",
            "The players plan to attack early in the match."
        ],
        "hint": "Assault."
        ,
        "synonyms": ["strike", "strike", "offensive"]
    },
    {
        "word": "ATTEND",
        "difficulty": 4,
        "definition": "(v.) Be present at an event.",
        "sentences": [
            "All students must attend the morning assembly.",
            "She will attend the science fair.",
            "Parents are welcome to attend the show."
        ],
        "hint": "Visit."
        ,
        "synonyms": ["go-to", "be-present", "participate"]
    },
    {
        "word": "AUGUST",
        "difficulty": 1,
        "definition": "(n.) The eighth month of the year.",
        "sentence": "He was born in August.",
        "hint": "Month."
        ,
        "synonyms": ["dignified", "stately", "regal"]
    },
    {
        "word": "AUTHOR",
        "difficulty": 4,
        "definition": "(n.) A writer of a book or report.",
        "sentence": "He is a famous author.",
        "hint": "Writer."
        ,
        "synonyms": ["writer", "creator", "novelist"]
    },
    {
        "word": "AUTUMN",
        "difficulty": 4,
        "definition": "(n.) The season between summer and winter.",
        "sentence": "The leaves fall in autumn.",
        "hint": "Fall."
        ,
        "synonyms": ["fall", "harvest-season", "October"]
    },
    {
        "word": "AVENUE",
        "difficulty": 4,
        "definition": "(n.) A broad road in a town or city.",
        "sentence": "The avenue was lined with trees.",
        "hint": "Street."
        ,
        "synonyms": ["street", "road", "boulevard"]
    },
    {
        "word": "AWAKE",
        "difficulty": 1,
        "definition": "(adj./v.) Not asleep; to stop sleeping.",
        "sentence": "He was wide awake.",
        "hint": "Conscious."
        ,
        "synonyms": ["alert", "conscious", "up"]
    },
    {
        "word": "AWAY",
        "difficulty": 1,
        "tier": 2,
        "definition": "(adverb) To or at a distance; absent",
        "sentences": [
            "She walked away slowly.",
            "He is away on a trip.",
            "Go away, I'm busy!"
        ]
        ,
        "synonyms": ["absent", "distant", "gone"]
    },
    {
        "word": "BABY",
        "difficulty": 1,
        "tier": 7,
        "definition": "(noun) A very young child",
        "sentences": [
            "The baby slept all afternoon.",
            "She held the baby gently.",
            "He smiled at the baby."
        ]
        ,
        "synonyms": ["infant", "newborn", "tot"]
    },
    {
        "word": "BACK",
        "difficulty": 1,
        "definition": "(n./adj./adv./v.) The rear surface of the body; rear; return; to support.",
        "sentence": "He turned his back.",
        "hint": "Rear."
        ,
        "synonyms": ["rear", "behind", "return"]
    },
    {
        "word": "BAD",
        "difficulty": 1,
        "tier": 8,
        "definition": "(adjective) Not good; of poor quality",
        "sentences": [
            "That was a bad idea.",
            "She felt bad for forgetting.",
            "The weather was really bad."
        ]
        ,
        "synonyms": ["poor", "evil", "negative"]
    },
    {
        "word": "BADGE",
        "difficulty": 4,
        "definition": "(n.) A small piece of metal or plastic worn to show membership.",
        "sentence": "He wore a badge.",
        "hint": "Token."
        ,
        "synonyms": ["emblem", "insignia", "pin"]
    },
    {
        "word": "BAKERY",
        "difficulty": 4,
        "definition": "(n.) A place where bread and cakes are made.",
        "sentence": "She went to the bakery.",
        "hint": "Bread shop."
        ,
        "synonyms": ["bread-shop", "patisserie", "bake-house"]
    },
    {
        "word": "BALL",
        "difficulty": 1,
        "tier": 5,
        "definition": "(noun) A round object used in sports",
        "sentences": [
            "She kicked the ball.",
            "He bounced the ball.",
            "Throw me the ball!"
        ]
        ,
        "synonyms": ["sphere", "dance", "game-ball"]
    },
    {
        "word": "BALLOON",
        "difficulty": 4,
        "definition": "(n.) A small colored rubber bag inflated with air.",
        "sentence": "The boy held a balloon.",
        "hint": "Inflatable."
        ,
        "synonyms": ["inflate", "float", "expand"]
    },
    {
        "word": "BANANA",
        "difficulty": 1,
        "definition": "(n.) A long curved fruit with a yellow skin.",
        "sentence": "He ate a banana.",
        "hint": "Fruit."
        ,
        "synonyms": ["fruit", "tropical-fruit", "plantain"]
    },
    {
        "word": "BANK",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun) A financial institution; the land beside a river",
        "sentences": [
            "She went to the bank.",
            "They sat on the river bank.",
            "He opened an account at the bank."
        ]
        ,
        "synonyms": ["financial-institution", "shore", "riverbank"]
    },
    {
        "word": "BASE",
        "difficulty": 4,
        "tier": 5,
        "definition": "(noun / verb) The bottom or foundation; to use as a starting point",
        "sentences": [
            "The base of the statue is marble.",
            "She is based in London.",
            "He built the base of the model first."
        ]
        ,
        "synonyms": ["foundation", "bottom", "root"]
    },
    {
        "word": "BASKET",
        "difficulty": 1,
        "definition": "(n.) A container used for carrying things.",
        "sentence": "She put the fruit in a basket.",
        "hint": "Carrier."
        ,
        "synonyms": ["container", "receptacle", "hamper"]
    },
    {
        "word": "BEACH",
        "difficulty": 1,
        "definition": "(n.) A pebbly or sandy shore by the ocean.",
        "sentence": "They went to the beach.",
        "hint": "Shore."
        ,
        "synonyms": ["shore", "coast", "seaside"]
    },
    {
        "word": "BEAR",
        "difficulty": 1,
        "tier": 7,
        "definition": "(noun / verb) A large furry animal; to carry or endure",
        "sentences": [
            "A bear lives in the forest.",
            "She can bear the cold well.",
            "He could not bear to leave."
        ]
        ,
        "synonyms": ["carry", "endure", "tolerate"]
    },
    {
        "word": "BEAT",
        "difficulty": 1,
        "tier": 7,
        "definition": "(verb / noun) To hit repeatedly; the rhythm of music",
        "sentences": [
            "She beat the drum.",
            "The beat of the music made her dance.",
            "He beat his rival in the race."
        ]
        ,
        "synonyms": ["rhythm", "defeat", "pulse"]
    },
    {
        "word": "BEAUTIFUL",
        "difficulty": 4,
        "tier": 6,
        "definition": "(adjective) Pleasing to the senses; attractive",
        "sentences": [
            "She has a beautiful voice.",
            "What a beautiful sunset!",
            "The garden is beautiful in spring."
        ]
        ,
        "synonyms": ["stunning", "gorgeous", "lovely"]
    },
    {
        "word": "BEAUTY",
        "difficulty": 4,
        "definition": "(n.) A combination of qualities that pleases the senses.",
        "sentence": "Nature has great beauty.",
        "hint": "Grace."
        ,
        "synonyms": ["attractiveness", "loveliness", "elegance"]
    },
    {
        "word": "BECAME",
        "difficulty": 4,
        "tier": 5,
        "definition": "(verb) Started to be something; underwent a change of state.",
        "sentences": [
            "She became a nurse.",
            "He became very quiet.",
            "It became clear what had happened."
        ]
        ,
        "synonyms": ["turned-into", "grew-into", "evolved"]
    },
    {
        "word": "BECAUSE",
        "difficulty": 1,
        "tier": 2,
        "definition": "(conjunction) For the reason that",
        "sentences": [
            "She stayed home because she was sick.",
            "I smiled because I was happy.",
            "He ran because he was late."
        ]
        ,
        "synonyms": ["since", "as", "for"]
    },
    {
        "word": "BECOME",
        "difficulty": 4,
        "definition": "(v.) Begin to be.",
        "sentences": [
            "With practice, you can become very skilled.",
            "She hopes to become a scientist.",
            "Hard work can become a habit."
        ],
        "hint": "Turn."
        ,
        "synonyms": ["turn", "grow", "transform"]
    },
    {
        "word": "BED",
        "difficulty": 1,
        "tier": 7,
        "definition": "(noun) A piece of furniture for sleeping",
        "sentences": [
            "She made her bed.",
            "He went to bed early.",
            "The cat slept at the foot of the bed."
        ]
        ,
        "synonyms": ["cot", "bunk", "resting-place"]
    },
    {
        "word": "BEEN",
        "difficulty": 1,
        "tier": 1,
        "definition": "(verb) Existed; occurred; used with 'have' to indicate completed states.",
        "sentences": [
            "Have you been here before?",
            "She has been sick all week.",
            "It has been a long day."
        ]
        ,
        "synonyms": ["existed", "lived", "was"]
    },
    {
        "word": "BEFORE",
        "difficulty": 1,
        "tier": 2,
        "definition": "(preposition / conjunction) Earlier in time; in front of",
        "sentences": [
            "Brush your teeth before bed.",
            "She left before noon.",
            "He called me before the meeting."
        ]
        ,
        "synonyms": ["prior", "previously", "earlier"]
    },
    {
        "word": "BEGAN",
        "difficulty": 1,
        "tier": 3,
        "definition": "(verb) Started something; took the first step in a process.",
        "sentences": [
            "The movie began late.",
            "She began to cry.",
            "It began to snow at night."
        ]
        ,
        "synonyms": ["started", "commenced", "initiated"]
    },
    {
        "word": "BEGIN",
        "difficulty": 1,
        "definition": "(v.) Start; perform the first part of an action.",
        "sentence": "The show will begin.",
        "hint": "Start."
        ,
        "synonyms": ["start", "commence", "initiate"]
    },
    {
        "word": "BEHIND",
        "difficulty": 1,
        "tier": 5,
        "definition": "(preposition / adverb) At the back of; following",
        "sentences": [
            "She was behind him in the queue.",
            "He hid behind the tree.",
            "Don't get left behind."
        ]
        ,
        "synonyms": ["after", "back", "following"]
    },
    {
        "word": "BEING",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun / verb) A living creature; existing or happening at this moment.",
        "sentences": [
            "She is being very kind.",
            "Every living being needs water.",
            "He enjoyed being outside."
        ]
        ,
        "synonyms": ["existence", "creature", "living"]
    },
    {
        "word": "BELIEVE",
        "difficulty": 4,
        "definition": "(v.) Accept that something is true.",
        "sentence": "I believe you.",
        "hint": "Trust."
        ,
        "synonyms": ["trust", "accept", "think"]
    },
    {
        "word": "BELL",
        "difficulty": 1,
        "tier": 9,
        "definition": "(noun) A metal object that makes a ringing sound",
        "sentences": [
            "The bell rang at noon.",
            "She rang the doorbell.",
            "The school bell signals the end of class."
        ]
        ,
        "synonyms": ["chime", "ring", "signal"]
    },
    {
        "word": "BELONG",
        "difficulty": 4,
        "definition": "(v.) Be the property of.",
        "sentences": [
            "These shoes belong to me.",
            "I belong to a book club.",
            "Every child should belong to a community."
        ],
        "hint": "Own."
        ,
        "synonyms": ["own", "be-part-of", "relate"]
    },
    {
        "word": "BELOW",
        "difficulty": 1,
        "tier": 3,
        "definition": "(preposition / adverb) At a lower level; under",
        "sentences": [
            "The fish swam below the surface.",
            "Her name is below mine on the list.",
            "The temperature dropped below zero."
        ]
        ,
        "synonyms": ["under", "beneath", "lower"]
    },
    {
        "word": "BENEFICIAL",
        "difficulty": 5,
        "definition": "(adj.) Favorable or advantageous.",
        "sentence": "Exercise is beneficial.",
        "hint": "Good."
        ,
        "synonyms": ["helpful", "advantageous", "useful"]
    },
    {
        "word": "BENEVOLENT",
        "difficulty": 5,
        "definition": "(adj.) Well meaning and kindly.",
        "sentence": "A benevolent ruler.",
        "hint": "Kind."
        ,
        "synonyms": ["kind", "charitable", "generous"]
    },
    {
        "word": "BESIDE",
        "difficulty": 1,
        "tier": 6,
        "definition": "(preposition) At the side of; next to",
        "sentences": [
            "She sat beside her friend.",
            "He stood beside the door.",
            "Leave it beside the phone."
        ]
        ,
        "synonyms": ["next-to", "alongside", "adjacent"]
    },
    {
        "word": "BEST",
        "difficulty": 1,
        "tier": 4,
        "definition": "(adjective / adverb) Of the highest quality; most effectively",
        "sentences": [
            "She did her best.",
            "That was the best meal I've ever had.",
            "He is my best friend."
        ]
        ,
        "synonyms": ["finest", "greatest", "optimal"]
    },
    {
        "word": "BETTER",
        "difficulty": 1,
        "tier": 4,
        "definition": "(adjective / adverb) Of higher quality; more effectively",
        "sentences": [
            "She is feeling better now.",
            "He did better on his second try.",
            "This is better than the last one."
        ]
        ,
        "synonyms": ["superior", "improved", "enhanced"]
    },
    {
        "word": "BETWEEN",
        "difficulty": 1,
        "definition": "(prep.) In the middle of two things.",
        "sentence": "He sat between them.",
        "hint": "Middle."
        ,
        "synonyms": ["amid", "in-the-middle", "separating"]
    },
    {
        "word": "BEYOND",
        "difficulty": 4,
        "definition": "(prep./adv.) At or to the further side of.",
        "sentence": "The forest is beyond the hill.",
        "hint": "Further."
        ,
        "synonyms": ["past", "over", "further"]
    },
    {
        "word": "BICYCLE",
        "difficulty": 4,
        "definition": "(n.) A vehicle with two wheels.",
        "sentence": "He rode his bicycle.",
        "hint": "Bike."
        ,
        "synonyms": ["bike", "two-wheeler", "cycle"]
    },
    {
        "word": "BIG",
        "difficulty": 1,
        "tier": 2,
        "definition": "(adjective) Of great size; important",
        "sentences": [
            "They have a big dog.",
            "That is a big decision.",
            "She has a big smile."
        ]
        ,
        "synonyms": ["large", "huge", "enormous"]
    },
    {
        "word": "BILL",
        "difficulty": 1,
        "tier": 6,
        "definition": "(noun) A written statement of money owed; a proposed law",
        "sentences": [
            "She paid the electricity bill.",
            "The bill was passed into law.",
            "The waiter brought the bill."
        ]
        ,
        "synonyms": ["invoice", "banknote", "legislation"]
    },
    {
        "word": "BILLION",
        "difficulty": 4,
        "definition": "(num.) The number equivalent to a thousand million.",
        "sentence": "A billion stars.",
        "hint": "Number."
        ,
        "synonyms": ["1000-million", "large-number", "enormous-sum"]
    },
    {
        "word": "BINOCULARS",
        "difficulty": 5,
        "definition": "(n.) An optical instrument with a lens for each eye.",
        "sentence": "He used binoculars.",
        "hint": "Glasses."
        ,
        "synonyms": ["field-glasses", "opera-glasses", "telescope"]
    },
    {
        "word": "BIRDS",
        "difficulty": 1,
        "tier": 4,
        "definition": "(noun) Warm-blooded animals covered in feathers that typically have wings and can fly.",
        "sentences": [
            "The birds sang in the morning.",
            "She fed the birds in the garden.",
            "Many birds fly south in winter."
        ]
        ,
        "synonyms": ["avians", "winged-animals", "fowl"]
    },
    {
        "word": "BIRTHDAY",
        "difficulty": 1,
        "definition": "(n.) The anniversary of the day on which a person was born.",
        "sentence": "It's my birthday.",
        "hint": "Anniversary."
        ,
        "synonyms": ["anniversary", "natal-day", "birth-anniversary"]
    },
    {
        "word": "BIT",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun / verb) A small portion; used the teeth to cut into something.",
        "sentences": [
            "She ate just a bit.",
            "The dog bit the stick.",
            "He worked a little bit more."
        ]
        ,
        "synonyms": ["piece", "fragment", "small-amount"]
    },
    {
        "word": "BLACK",
        "difficulty": 1,
        "tier": 4,
        "definition": "(adjective / noun) The darkest color; the absence of light",
        "sentences": [
            "She wore a black hat.",
            "The sky went black.",
            "The cat is jet black."
        ]
        ,
        "synonyms": ["dark", "ebony", "jet"]
    },
    {
        "word": "BLANKET",
        "difficulty": 1,
        "definition": "(n./v.) A piece of cloth used as a covering; to cover.",
        "sentence": "She needed a blanket.",
        "hint": "Cover."
        ,
        "synonyms": ["cover", "quilt", "wrap"]
    },
    {
        "word": "BLOCK",
        "difficulty": 1,
        "tier": 9,
        "definition": "(noun / verb) A solid piece of material; to obstruct",
        "sentences": [
            "She stacked the blocks.",
            "The fallen tree blocked the road.",
            "He used a wooden block."
        ]
        ,
        "synonyms": ["chunk", "obstruct", "barrier"]
    },
    {
        "word": "BLOOD",
        "difficulty": 1,
        "tier": 9,
        "definition": "(noun) The red fluid circulating in the body",
        "sentences": [
            "He cut his hand and saw blood.",
            "Blood carries oxygen around the body.",
            "She gave blood at the clinic."
        ]
        ,
        "synonyms": ["fluid", "lineage", "vitality"]
    },
    {
        "word": "BLOSSOM",
        "difficulty": 4,
        "definition": "(n./v.) A flower or mass of flowers; to produce flowers.",
        "sentence": "The trees are in blossom.",
        "hint": "Flower."
        ,
        "synonyms": ["flower", "bloom", "flourish"]
    },
    {
        "word": "BLOW",
        "difficulty": 1,
        "tier": 9,
        "definition": "(verb / noun) To send air out; a hit or strike",
        "sentences": [
            "Blow out the candles!",
            "The storm dealt a big blow.",
            "She blew on her hot soup."
        ]
        ,
        "synonyms": ["gust", "strike", "exhale"]
    },
    {
        "word": "BLUE",
        "difficulty": 1,
        "tier": 6,
        "definition": "(adjective / noun) The color of the sky",
        "sentences": [
            "She wore a blue scarf.",
            "The sea is deep blue.",
            "He painted the door blue."
        ]
        ,
        "synonyms": ["azure", "navy", "cobalt"]
    },
    {
        "word": "BOARD",
        "difficulty": 1,
        "tier": 9,
        "definition": "(noun / verb) A flat piece of wood; to get on a vehicle",
        "sentences": [
            "She boarded the train.",
            "He wrote on the board.",
            "The board game was fun."
        ]
        ,
        "synonyms": ["plank", "committee", "get-on"]
    },
    {
        "word": "BOAT",
        "difficulty": 1,
        "tier": 5,
        "definition": "(noun) A small vessel for traveling on water",
        "sentences": [
            "She rowed the boat to shore.",
            "He loves sailing his boat.",
            "The boat rocked on the waves."
        ]
        ,
        "synonyms": ["vessel", "craft", "ship"]
    },
    {
        "word": "BODY",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) The physical structure of a person or animal",
        "sentences": [
            "Exercise is good for the body.",
            "Her whole body was tired.",
            "The body of the bird was very small."
        ]
        ,
        "synonyms": ["frame", "torso", "form"]
    },
    {
        "word": "BONES",
        "difficulty": 1,
        "tier": 9,
        "definition": "(noun) The rigid structures forming the internal skeleton of vertebrates.",
        "sentences": [
            "Dogs love to chew bones.",
            "She studied the bones in science.",
            "His bones ached after the long walk."
        ]
        ,
        "synonyms": ["skeleton", "frame", "remains"]
    },
    {
        "word": "BOOK",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) A written or printed work bound together",
        "sentences": [
            "She read a great book.",
            "He left his book at school.",
            "Can I borrow your book?"
        ]
        ,
        "synonyms": ["novel", "volume", "text"]
    },
    {
        "word": "BORN",
        "difficulty": 1,
        "tier": 10,
        "definition": "(adjective / verb) Having come into existence through birth",
        "sentences": [
            "She was born in July.",
            "He was born to lead.",
            "A new idea was born."
        ]
        ,
        "synonyms": ["given-life", "brought-forth", "delivered"]
    },
    {
        "word": "BOTH",
        "difficulty": 1,
        "tier": 3,
        "definition": "(adjective / pronoun) The two; used to refer to two things together",
        "sentences": [
            "Both answers are correct.",
            "She held both bags.",
            "They both laughed."
        ]
        ,
        "synonyms": ["each", "either", "two-together"]
    },
    {
        "word": "BOTTLE",
        "difficulty": 1,
        "definition": "(n./v.) A narrow-necked container for liquids; to seal liquid inside a container.",
        "sentence": "He drank from a bottle.",
        "hint": "Container."
        ,
        "synonyms": ["container", "flask", "vessel"]
    },
    {
        "word": "BOTTOM",
        "difficulty": 1,
        "definition": "(n./adj.) The lowest point or part; lowest.",
        "sentence": "He reached the bottom.",
        "hint": "Base."
        ,
        "synonyms": ["base", "lowest-part", "foot"]
    },
    {
        "word": "BOUGHT",
        "difficulty": 4,
        "tier": 10,
        "definition": "(verb) Obtained something in exchange for money.",
        "sentences": [
            "She bought a new dress.",
            "He bought flowers.",
            "They bought a house."
        ]
        ,
        "synonyms": ["purchased", "acquired", "paid-for"]
    },
    {
        "word": "BOUNCE",
        "difficulty": 4,
        "definition": "(v./n.) Move quickly up/back from a surface; a springy move.",
        "sentence": "The children love to bounce on the trampoline.",
        "hint": "Spring."
        ,
        "synonyms": ["spring", "rebound", "leap"]
    },
    {
        "word": "BOUNDARY",
        "difficulty": 5,
        "definition": "(n.) A line that marks the limits of an area.",
        "sentence": "The river is a boundary.",
        "hint": "Limit."
        ,
        "synonyms": ["border", "edge", "limit"]
    },
    {
        "word": "BOX",
        "difficulty": 1,
        "tier": 5,
        "definition": "(noun / verb) A container with sides; to fight with fists",
        "sentences": [
            "She packed the box.",
            "He learned to box at the gym.",
            "Put it in the box."
        ]
        ,
        "synonyms": ["container", "carton", "crate"]
    },
    {
        "word": "BOY",
        "difficulty": 1,
        "tier": 2,
        "definition": "(noun) A male child or young man",
        "sentences": [
            "The boy kicked the ball.",
            "A young boy waved from the window.",
            "She gave the boy a cookie."
        ]
        ,
        "synonyms": ["lad", "youth", "youngster"]
    },
    {
        "word": "BRANCHES",
        "difficulty": 4,
        "tier": 9,
        "definition": "(noun) The limbs extending from a tree trunk; also, divisions of a larger body or organization.",
        "sentences": [
            "The branches swayed in the wind.",
            "She climbed the branches.",
            "The company has branches worldwide."
        ]
        ,
        "synonyms": ["limbs", "boughs", "offshoots"]
    },
    {
        "word": "BRAVE",
        "difficulty": 1,
        "definition": "(adj./v./n.) Ready to face danger; to endure; a warrior.",
        "sentence": "He was very brave.",
        "hint": "Courageous."
        ,
        "synonyms": ["courageous", "bold", "fearless"]
    },
    {
        "word": "BREAD",
        "difficulty": 1,
        "definition": "(n.) Food made of flour, water, and yeast mixture.",
        "sentence": "He ate a piece of bread.",
        "hint": "Food."
        ,
        "synonyms": ["loaf", "baked-good", "dough"]
    },
    {
        "word": "BREAK",
        "difficulty": 1,
        "tier": 8,
        "definition": "(verb / noun) To crack or split; a rest period",
        "sentences": [
            "She broke a plate.",
            "Let's take a break.",
            "He broke his arm."
        ]
        ,
        "synonyms": ["shatter", "pause", "fracture"]
    },
    {
        "word": "BREAKFAST",
        "difficulty": 1,
        "definition": "(n./v.) The first meal eaten after waking up; to eat a morning meal.",
        "sentence": "He had breakfast.",
        "hint": "Morning meal."
        ,
        "synonyms": ["morning-meal", "first-meal", "brunch"]
    },
    {
        "word": "BRIDGE",
        "difficulty": 1,
        "definition": "(n./v.) A structure crossing an obstacle; to connect.",
        "sentence": "They crossed the bridge.",
        "hint": "Span."
        ,
        "synonyms": ["span", "overpass", "link"]
    },
    {
        "word": "BRIGHT",
        "difficulty": 1,
        "definition": "(adj.) Giving out or reflecting a lot of light.",
        "sentence": "The sun is bright.",
        "hint": "Shining."
        ,
        "synonyms": ["luminous", "vivid", "brilliant"]
    },
    {
        "word": "BRING",
        "difficulty": 1,
        "tier": 5,
        "definition": "(verb) To carry something to a place",
        "sentences": [
            "Please bring a coat.",
            "She brought her own lunch.",
            "Can you bring that to me?"
        ]
        ,
        "synonyms": ["carry", "deliver", "convey"]
    },
    {
        "word": "BRITISH",
        "difficulty": 4,
        "tier": 10,
        "definition": "(adjective / noun) Relating to Britain; people from Britain",
        "sentences": [
            "She is proud to be British.",
            "He has a British accent.",
            "British food is often simple."
        ]
        ,
        "synonyms": ["English", "UK", "from-Britain"]
    },
    {
        "word": "BROKEN",
        "difficulty": 1,
        "tier": 7,
        "definition": "(adjective / verb) Damaged and no longer functioning; shattered into pieces.",
        "sentences": [
            "The window is broken.",
            "She had broken the rule.",
            "He fixed the broken chair."
        ]
        ,
        "synonyms": ["shattered", "damaged", "fractured"]
    },
    {
        "word": "BROTHER",
        "difficulty": 1,
        "definition": "(n.) A man or boy in relation to other children of his parents.",
        "sentence": "He is my brother.",
        "hint": "Sibling."
        ,
        "synonyms": ["sibling", "kin", "fraternal"]
    },
    {
        "word": "BROUGHT",
        "difficulty": 4,
        "tier": 5,
        "definition": "(verb) Carried or transported something to a place.",
        "sentences": [
            "She brought flowers.",
            "He brought his lunch.",
            "They brought good news."
        ]
        ,
        "synonyms": ["carried", "delivered", "fetched"]
    },
    {
        "word": "BROWN",
        "difficulty": 1,
        "tier": 8,
        "definition": "(adjective / noun) The color of chocolate or earth",
        "sentences": [
            "The dog has brown fur.",
            "She wore brown boots.",
            "The leaves turned brown in autumn."
        ]
        ,
        "synonyms": ["tan", "chocolate", "mahogany"]
    },
    {
        "word": "BUDGET",
        "difficulty": 5,
        "definition": "(n./v./adj.) An estimate of income; to plan spending; inexpensive.",
        "sentence": "He planned his budget.",
        "hint": "Finance."
        ,
        "synonyms": ["plan", "funds", "allocation"]
    },
    {
        "word": "BUILD",
        "difficulty": 1,
        "definition": "(v./n.) Construct by putting parts together; physique.",
        "sentences": [
            "We will build a birdhouse this weekend.",
            "Bees build hives out of wax.",
            "You can build strength through regular exercise."
        ],
        "hint": "Construct."
        ,
        "synonyms": ["construct", "erect", "create"]
    },
    {
        "word": "BUILDING",
        "difficulty": 1,
        "tier": 5,
        "definition": "(noun) A structure with walls and a roof",
        "sentences": [
            "The building is very tall.",
            "She works in that building.",
            "They put up a new building last year."
        ]
        ,
        "synonyms": ["structure", "edifice", "construction"]
    },
    {
        "word": "BUILT",
        "difficulty": 1,
        "tier": 5,
        "definition": "(verb) Constructed something by assembling parts together.",
        "sentences": [
            "They built a new school.",
            "She built a sandcastle.",
            "He built the bookcase himself."
        ]
        ,
        "synonyms": ["constructed", "erected", "assembled"]
    },
    {
        "word": "BURDEN",
        "difficulty": 5,
        "definition": "(n./v.) A heavy load; to weigh down.",
        "sentence": "The burden was heavy.",
        "hint": "Load."
        ,
        "synonyms": ["load", "weight", "hardship"]
    },
    {
        "word": "BURNING",
        "difficulty": 4,
        "tier": 8,
        "definition": "(adjective / verb) Being on fire; producing heat and flames.",
        "sentences": [
            "The burning candle lit the room.",
            "She felt a burning pain.",
            "The wood was burning slowly."
        ]
        ,
        "synonyms": ["blazing", "on-fire", "searing"]
    },
    {
        "word": "BUSINESS",
        "difficulty": 4,
        "definition": "(n.) The practice of engaging in commerce.",
        "sentence": "He owns a business.",
        "hint": "Company."
        ,
        "synonyms": ["commerce", "trade", "enterprise"]
    },
    {
        "word": "BUT",
        "difficulty": 1,
        "tier": 1,
        "definition": "(conjunction) Used to introduce something contrasting",
        "sentences": [
            "I tried, but I failed.",
            "She is small but strong.",
            "I want to go, but I'm busy."
        ]
        ,
        "synonyms": ["however", "yet", "except"]
    },
    {
        "word": "BUTTERFLY",
        "difficulty": 4,
        "definition": "(n.) An insect with broad colorful wings.",
        "sentence": "A butterfly flew by.",
        "hint": "Insect."
        ,
        "synonyms": ["lepidopteran", "moth-relative", "insect"]
    },
    {
        "word": "BUY",
        "difficulty": 1,
        "tier": 7,
        "definition": "(verb) To purchase; to pay money for",
        "sentences": [
            "She wants to buy a new bike.",
            "He bought flowers for his mum.",
            "Can I buy that?"
        ]
        ,
        "synonyms": ["purchase", "acquire", "obtain"]
    },
    {
        "word": "CABINET",
        "difficulty": 4,
        "definition": "(n.) A cupboard with shelves; a committee of advisors.",
        "sentence": "The file is in the cabinet.",
        "hint": "Cupboard."
        ,
        "synonyms": ["cupboard", "ministers", "case"]
    },
    {
        "word": "CABLE",
        "difficulty": 4,
        "definition": "(n./v.) A thick rope or wire; to send a message.",
        "sentence": "The cable snapped.",
        "hint": "Wire."
        ,
        "synonyms": ["wire", "rope", "cord"]
    },
    {
        "word": "CALCULATE",
        "difficulty": 5,
        "definition": "(v.) Determine mathematically.",
        "sentence": "Calculate the total cost.",
        "hint": "Compute."
        ,
        "synonyms": ["compute", "work-out", "figure"]
    },
    {
        "word": "CALENDAR",
        "difficulty": 5,
        "definition": "(n.) A chart showing the days/months.",
        "sentence": "Check the calendar.",
        "hint": "Schedule."
        ,
        "synonyms": ["schedule", "planner", "datebook"]
    },
    {
        "word": "CALLED",
        "difficulty": 1,
        "tier": 1,
        "definition": "(verb) Named something; or contacted or summoned someone.",
        "sentences": [
            "She called my name.",
            "He called the dog over.",
            "The bird is called a robin."
        ]
        ,
        "synonyms": ["named", "summoned", "phoned"]
    },
    {
        "word": "CAME",
        "difficulty": 1,
        "tier": 2,
        "definition": "(verb) Moved or traveled toward a specific place or person.",
        "sentences": [
            "She came home late.",
            "He came to see us.",
            "The letter came in the morning."
        ]
        ,
        "synonyms": ["arrived", "appeared", "reached"]
    },
    {
        "word": "CAMERA",
        "difficulty": 1,
        "definition": "(n.) A device for recording images.",
        "sentence": "Smile for the camera.",
        "hint": "Recorder."
        ,
        "synonyms": ["lens", "device", "recorder"]
    },
    {
        "word": "CAMPUS",
        "difficulty": 5,
        "definition": "(n.) The grounds of a university.",
        "sentence": "The campus is large.",
        "hint": "Grounds."
        ,
        "synonyms": ["grounds", "school-area", "university"]
    },
    {
        "word": "CAN",
        "difficulty": 1,
        "tier": 1,
        "definition": "(verb) To be able to; to have the ability",
        "sentences": [
            "Can you swim?",
            "She can run very fast.",
            "I can help you with that."
        ]
        ,
        "synonyms": ["be-able", "tin", "container"]
    },
    {
        "word": "CAN'T",
        "difficulty": 1,
        "tier": 5,
        "definition": "(contraction) Contraction of 'cannot'",
        "sentences": [
            "I can't find my keys.",
            "She can't come today.",
            "He can't stop laughing."
        ]
        ,
        "synonyms": ["cannot", "unable", "won't"]
    },
    {
        "word": "CANCEL",
        "difficulty": 4,
        "definition": "(v.) Decide that an event will not occur.",
        "sentences": [
            "We may cancel the trip if it rains.",
            "Please cancel my appointment.",
            "They had to cancel the concert."
        ],
        "hint": "Stop."
        ,
        "synonyms": ["call-off", "annul", "void"]
    },
    {
        "word": "CANDIDATE",
        "difficulty": 5,
        "definition": "(n.) A person who applies for a job or election.",
        "sentence": "She is a strong candidate.",
        "hint": "Applicant."
        ,
        "synonyms": ["applicant", "contender", "nominee"]
    },
    {
        "word": "CANNOT",
        "difficulty": 1,
        "tier": 5,
        "definition": "(verb) Is not able to",
        "sentences": [
            "I cannot come today.",
            "She cannot lift it alone.",
            "You cannot park here."
        ]
        ,
        "synonyms": ["unable", "can't", "incapable"]
    },
    {
        "word": "CANYON",
        "difficulty": 4,
        "definition": "(n.) A deep gorge.",
        "sentence": "The Grand Canyon is deep.",
        "hint": "Gorge."
        ,
        "synonyms": ["gorge", "ravine", "chasm"]
    },
    {
        "word": "CAPACITY",
        "difficulty": 5,
        "definition": "(n.) Maximum amount a thing can contain.",
        "sentence": "The hall was at capacity.",
        "hint": "Limit."
        ,
        "synonyms": ["ability", "space", "volume"]
    },
    {
        "word": "CAPITAL",
        "difficulty": 4,
        "definition": "(n./adj.) Main city; wealth; uppercase letter; excellent.",
        "sentence": "Paris is the capital of France.",
        "hint": "Main city."
        ,
        "synonyms": ["city", "funds", "main"]
    },
    {
        "word": "CAPTAIN",
        "difficulty": 4,
        "definition": "(n./v.) Person in command of a ship; to lead.",
        "sentence": "The captain spoke.",
        "hint": "Leader."
        ,
        "synonyms": ["leader", "skipper", "commander"]
    },
    {
        "word": "CAPTIVE",
        "difficulty": 5,
        "definition": "(n./adj.) A prisoner; held prisoner.",
        "sentence": "They held him captive.",
        "hint": "Prisoner."
        ,
        "synonyms": ["prisoner", "prisoner", "trapped"]
    },
    {
        "word": "CAPTURE",
        "difficulty": 4,
        "definition": "(v./n.) Take into possession; the act of seizing.",
        "sentence": "Capture the flag.",
        "hint": "Seize."
        ,
        "synonyms": ["catch", "seize", "trap"]
    },
    {
        "word": "CAR",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) A road vehicle with an engine",
        "sentences": [
            "She got into the car.",
            "He bought a new car.",
            "The car wouldn't start."
        ]
        ,
        "synonyms": ["vehicle", "automobile", "motorcar"]
    },
    {
        "word": "CARBON",
        "difficulty": 5,
        "definition": "(n.) The chemical element of atomic number 6.",
        "sentence": "Diamond is pure carbon.",
        "hint": "Element."
        ,
        "synonyms": ["element", "coal", "graphite"]
    },
    {
        "word": "CARE",
        "difficulty": 1,
        "tier": 7,
        "definition": "(verb / noun) To be concerned about; attention and protection",
        "sentences": [
            "She cares for her elderly father.",
            "Take care!",
            "He showed great care and skill."
        ]
        ,
        "synonyms": ["concern", "attention", "tend"]
    },
    {
        "word": "CAREER",
        "difficulty": 4,
        "definition": "(n./v.) An occupation; to move swiftly.",
        "sentence": "A teaching career.",
        "hint": "Job path."
        ,
        "synonyms": ["profession", "occupation", "vocation"]
    },
    {
        "word": "CAREFUL",
        "difficulty": 1,
        "definition": "(adj.) Making sure of avoiding danger.",
        "sentence": "Be careful!",
        "hint": "Wary."
        ,
        "synonyms": ["cautious", "attentive", "meticulous"]
    },
    {
        "word": "CAREFULLY",
        "difficulty": 4,
        "tier": 5,
        "definition": "(adverb) With great attention and caution",
        "sentences": [
            "She carefully carried the glass.",
            "Read the instructions carefully.",
            "He placed the ornament carefully on the shelf."
        ]
        ,
        "synonyms": ["cautiously", "attentively", "thoroughly"]
    },
    {
        "word": "CARNIVAL",
        "difficulty": 5,
        "definition": "(n.) A period of public revelry.",
        "sentence": "They went to the carnival.",
        "hint": "Festival."
        ,
        "synonyms": ["fair", "festival", "celebration"]
    },
    {
        "word": "CARRY",
        "difficulty": 1,
        "tier": 3,
        "definition": "(verb) To hold and transport something",
        "sentences": [
            "Can you carry this box?",
            "She carried the baby.",
            "He carried his bag on his back."
        ]
        ,
        "synonyms": ["transport", "bear", "haul"]
    },
    {
        "word": "CARTOON",
        "difficulty": 1,
        "definition": "(n./v.) An animated film; a drawing; to draw a caricature.",
        "sentence": "Watch a cartoon.",
        "hint": "Animation."
        ,
        "synonyms": ["animation", "comic", "caricature"]
    },
    {
        "word": "CASE",
        "difficulty": 1,
        "tier": 7,
        "definition": "(noun) An instance or example; a container",
        "sentences": [
            "In that case, let's start.",
            "She carried a small case.",
            "It was a difficult case."
        ]
        ,
        "synonyms": ["instance", "container", "lawsuit"]
    },
    {
        "word": "CAT",
        "difficulty": 1,
        "tier": 7,
        "definition": "(noun) A small furry domesticated animal",
        "sentences": [
            "She has a black cat.",
            "The cat purred softly.",
            "He fed the cat."
        ]
        ,
        "synonyms": ["feline", "kitten", "tabby"]
    },
    {
        "word": "CATALOG",
        "difficulty": 5,
        "definition": "(n./v.) A list of items; to record in a list.",
        "sentence": "Check the catalog.",
        "hint": "List."
        ,
        "synonyms": ["list", "index", "directory"]
    },
    {
        "word": "CATCH",
        "difficulty": 1,
        "tier": 7,
        "definition": "(verb / noun) To grab something moving; the act of catching",
        "sentences": [
            "She caught the ball.",
            "He made a great catch.",
            "Catch me if you can!"
        ]
        ,
        "synonyms": ["grab", "snare", "capture"]
    },
    {
        "word": "CATEGORY",
        "difficulty": 5,
        "definition": "(n.) A class or division of people/things.",
        "sentence": "What category is this?",
        "hint": "Class."
        ,
        "synonyms": ["class", "group", "type"]
    },
    {
        "word": "CATTLE",
        "difficulty": 4,
        "tier": 9,
        "definition": "(noun) Cows and bulls kept on a farm",
        "sentences": [
            "The cattle grazed in the field.",
            "She helped herd the cattle.",
            "The farm had fifty head of cattle."
        ]
        ,
        "synonyms": ["cows", "livestock", "herd"]
    },
    {
        "word": "CAUGHT",
        "difficulty": 4,
        "tier": 8,
        "definition": "(verb) Seized a moving object with the hands; intercepted.",
        "sentences": [
            "She caught the ball.",
            "He caught a cold.",
            "They caught the thief."
        ]
        ,
        "synonyms": ["captured", "grabbed", "seized"]
    },
    {
        "word": "CAUSE",
        "difficulty": 1,
        "tier": 6,
        "definition": "(noun / verb) The reason something happens; to make something happen",
        "sentences": [
            "What was the cause of the fire?",
            "Loud noise can cause headaches.",
            "She fought for a good cause."
        ]
        ,
        "synonyms": ["reason", "origin", "produce"]
    },
    {
        "word": "CAUTION",
        "difficulty": 5,
        "definition": "(n./v.) Care taken to avoid danger; to warn.",
        "sentence": "Proceed with caution.",
        "hint": "Care."
        ,
        "synonyms": ["care", "warning", "watchfulness"]
    },
    {
        "word": "CEILING",
        "difficulty": 4,
        "definition": "(n.) The upper interior surface of a room.",
        "sentence": "Look at the ceiling.",
        "hint": "Top."
        ,
        "synonyms": ["roof", "top", "overhead-surface"]
    },
    {
        "word": "CELEBRATE",
        "difficulty": 4,
        "definition": "(v.) Acknowledge a significant day.",
        "sentence": "Celebrate the victory.",
        "hint": "Honor."
        ,
        "synonyms": ["honor", "commemorate", "observe"]
    },
    {
        "word": "CELLS",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun) The microscopic structural and functional units that make up all living things.",
        "sentences": [
            "The body is made of cells.",
            "She studied plant cells.",
            "He looked at the cells under a microscope."
        ]
        ,
        "synonyms": ["units", "organisms", "compartments"]
    },
    {
        "word": "CENTER",
        "difficulty": 1,
        "tier": 6,
        "definition": "(noun / verb) The middle point; to place in the middle",
        "sentences": [
            "She stood in the center of the room.",
            "The school is near the city center.",
            "Center the text on the page."
        ]
        ,
        "synonyms": ["middle", "hub", "core"]
    },
    {
        "word": "CENTS",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun) Small units of currency, each worth one hundredth of a dollar.",
        "sentences": [
            "It costs fifty cents.",
            "She found a few cents in her pocket.",
            "That is worth every cent."
        ]
        ,
        "synonyms": ["pennies", "coins", "change"]
    },
    {
        "word": "CENTURY",
        "difficulty": 4,
        "definition": "(n.) A period of one hundred years.",
        "sentence": "The 21st century.",
        "hint": "100 years."
        ,
        "synonyms": ["hundred-years", "era", "period"]
    },
    {
        "word": "CERTAIN",
        "difficulty": 4,
        "tier": 4,
        "definition": "(adjective) Known without doubt; particular",
        "sentences": [
            "Are you certain?",
            "There are certain rules to follow.",
            "She was certain she was right."
        ]
        ,
        "synonyms": ["sure", "definite", "positive"]
    },
    {
        "word": "CHAMBER",
        "difficulty": 5,
        "definition": "(n.) A large room used for formal events.",
        "sentence": "The council chamber.",
        "hint": "Room."
        ,
        "synonyms": ["room", "hall", "cavity"]
    },
    {
        "word": "CHAMPION",
        "difficulty": 4,
        "definition": "(n./v.) A person who has defeated all rivals; to support a cause.",
        "sentence": "He is a champion.",
        "hint": "Winner."
        ,
        "synonyms": ["defend", "support", "advocate"]
    },
    {
        "word": "CHANCE",
        "difficulty": 1,
        "tier": 10,
        "definition": "(noun / verb) A possibility; luck; to risk",
        "sentences": [
            "She took a chance.",
            "He got a chance to speak.",
            "Don't miss this chance!"
        ]
        ,
        "synonyms": ["opportunity", "luck", "probability"]
    },
    {
        "word": "CHANGE",
        "difficulty": 1,
        "tier": 2,
        "definition": "(verb / noun) To make different; a difference or alteration",
        "sentences": [
            "Can you change this ten-dollar bill?",
            "The weather can change quickly.",
            "She noticed a change in his mood."
        ]
        ,
        "synonyms": ["alter", "shift", "transform"]
    },
    {
        "word": "CHANNEL",
        "difficulty": 4,
        "definition": "(n./v.) A length of water joining two seas; to direct.",
        "sentence": "The English Channel.",
        "hint": "Waterway."
        ,
        "synonyms": ["route", "station", "waterway"]
    },
    {
        "word": "CHAPTER",
        "difficulty": 4,
        "definition": "(n.) A main division of a book.",
        "sentence": "Read the first chapter.",
        "hint": "Section."
        ,
        "synonyms": ["section", "installment", "division"]
    },
    {
        "word": "CHARACTER",
        "difficulty": 4,
        "definition": "(n.) The mental qualities moral qualities.",
        "sentence": "He has strong character.",
        "hint": "Nature."
        ,
        "synonyms": ["person", "trait", "nature"]
    },
    {
        "word": "CHARITY",
        "difficulty": 5,
        "definition": "(n.) An organization set up to help those in need.",
        "sentence": "She gave to charity.",
        "hint": "Help group."
        ,
        "synonyms": ["donation", "kindness", "aid"]
    },
    {
        "word": "CHARLIE",
        "difficulty": 1,
        "definition": "(n.) A code word for the letter C.",
        "sentence": "Alpha, Bravo, Charlie.",
        "hint": "Name/Code."
        ,
        "synonyms": ["fool", "name", "phonetic-C"]
    },
    {
        "word": "CHARMING",
        "difficulty": 4,
        "definition": "(adj.) Pleasant or attractive.",
        "sentence": "What a charming house.",
        "hint": "Pleasant."
        ,
        "synonyms": ["delightful", "enchanting", "lovely"]
    },
    {
        "word": "CHART",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun / verb) A visual display of information using graphs or tables; to record data in a visual format.",
        "sentences": [
            "She drew a bar chart.",
            "He charted the ship's course.",
            "The chart showed the results clearly."
        ]
        ,
        "synonyms": ["graph", "map", "diagram"]
    },
    {
        "word": "CHARTER",
        "difficulty": 5,
        "definition": "(n./v.) A written grant by a country's power; to hire.",
        "sentence": "The royal charter.",
        "hint": "Grant."
        ,
        "synonyms": ["document", "contract", "license"]
    },
    {
        "word": "CHECK",
        "difficulty": 1,
        "tier": 5,
        "definition": "(verb / noun) To examine; a mark to confirm something",
        "sentences": [
            "Check your work before handing it in.",
            "Put a check next to each item.",
            "She checked the time on her phone."
        ]
        ,
        "synonyms": ["inspect", "verify", "restraint"]
    },
    {
        "word": "CHIEF",
        "difficulty": 4,
        "tier": 9,
        "definition": "(noun / adjective) A leader; most important",
        "sentences": [
            "The chief gave a speech.",
            "She is the chief editor.",
            "He is the chief reason for the problem."
        ]
        ,
        "synonyms": ["leader", "head", "main"]
    },
    {
        "word": "CHILD",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun) A young person; a son or daughter",
        "sentences": [
            "She is an only child.",
            "Every child needs love.",
            "He was a curious child."
        ]
        ,
        "synonyms": ["youngster", "kid", "offspring"]
    },
    {
        "word": "CHILDREN",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) Young human beings who have not yet reached adulthood.",
        "sentences": [
            "The children played in the yard.",
            "She reads to the children every night.",
            "All children deserve a good education."
        ]
        ,
        "synonyms": ["kids", "youngsters", "offspring"]
    },
    {
        "word": "CHIMNEY",
        "difficulty": 4,
        "definition": "(n.) A vertical pipe which conducts smoke from a fire.",
        "sentence": "Smoke rose from the chimney.",
        "hint": "Smoke stack."
        ,
        "synonyms": ["flue", "smokestack", "vent"]
    },
    {
        "word": "CHOOSE",
        "difficulty": 1,
        "tier": 8,
        "definition": "(verb) To pick or select from options",
        "sentences": [
            "Choose your favorite color.",
            "She chose the red one.",
            "He couldn't choose between them."
        ]
        ,
        "synonyms": ["select", "pick", "opt"]
    },
    {
        "word": "CHRONICLE",
        "difficulty": 5,
        "definition": "(n./v.) A factual written account of historical events; to record.",
        "sentence": "The book is a chronicle of the war.",
        "hint": "History."
        ,
        "synonyms": ["record", "history", "account"]
    },
    {
        "word": "CHUCKLE",
        "difficulty": 5,
        "definition": "(v./n.) Laugh quietly; a quiet laugh.",
        "sentences": [
            "A funny joke can make you chuckle.",
            "She will chuckle when she hears the story.",
            "I could not help but chuckle at the silly mistake."
        ],
        "hint": "Laugh."
        ,
        "synonyms": ["laugh", "giggle", "snicker"]
    },
    {
        "word": "CHURCH",
        "difficulty": 1,
        "definition": "(n.) A building used for Christian worship.",
        "sentence": "They went to church.",
        "hint": "Chapel."
        ,
        "synonyms": ["chapel", "temple", "cathedral"]
    },
    {
        "word": "CINEMA",
        "difficulty": 4,
        "definition": "(n.) A movie theater.",
        "sentence": "Let's go to the cinema.",
        "hint": "Theater."
        ,
        "synonyms": ["movie-theater", "film-house", "pictures"]
    },
    {
        "word": "CIRCLE",
        "difficulty": 1,
        "definition": "(n./v.) A perfectly round flat shape; to move in a curved path around something.",
        "sentence": "Draw a circle.",
        "hint": "Ring."
        ,
        "synonyms": ["round", "ring", "loop"]
    },
    {
        "word": "CIRCUIT",
        "difficulty": 5,
        "definition": "(n.) A path for an electrical current.",
        "sentence": "Complete the circuit.",
        "hint": "Path."
        ,
        "synonyms": ["loop", "route", "track"]
    },
    {
        "word": "CIRCULATE",
        "difficulty": 5,
        "definition": "(v.) Move or cause to move continuously.",
        "sentences": [
            "Fans help air circulate around a room.",
            "Blood must circulate to every part of the body.",
            "Ideas circulate quickly through a school."
        ],
        "hint": "Flow."
        ,
        "synonyms": ["spread", "flow", "distribute"]
    },
    {
        "word": "CITIZEN",
        "difficulty": 4,
        "definition": "(n.) A legally recognized subject of a state.",
        "sentence": "He is a British citizen.",
        "hint": "Subject."
        ,
        "synonyms": ["resident", "national", "inhabitant"]
    },
    {
        "word": "CITY",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) A large and important town",
        "sentences": [
            "She grew up in the city.",
            "The city lights looked beautiful.",
            "It is a busy city."
        ]
        ,
        "synonyms": ["town", "metropolis", "urban-area"]
    },
    {
        "word": "CLARIFY",
        "difficulty": 5,
        "definition": "(v.) Make a statement less confused.",
        "sentences": [
            "Can you clarify what you mean?",
            "The teacher will clarify the instructions.",
            "Please clarify whether the meeting is today or tomorrow."
        ],
        "hint": "Explain."
        ,
        "synonyms": ["explain", "clear-up", "illuminate"]
    },
    {
        "word": "CLASS",
        "difficulty": 1,
        "tier": 5,
        "definition": "(noun) A group of students; a category",
        "sentences": [
            "She loves her English class.",
            "He was the best in his class.",
            "All students in the class listened."
        ]
        ,
        "synonyms": ["group", "category", "lesson"]
    },
    {
        "word": "CLASSIC",
        "difficulty": 4,
        "definition": "(adj./n.) Judged over a period of time to be of quality; a work of art.",
        "sentence": "A classic novel.",
        "hint": "Standard."
        ,
        "synonyms": ["timeless", "traditional", "definitive"]
    },
    {
        "word": "CLEAN",
        "difficulty": 1,
        "tier": 8,
        "definition": "(adjective / verb) Free from dirt; to remove dirt",
        "sentences": [
            "She cleaned the kitchen.",
            "The windows are very clean.",
            "Please keep this area clean."
        ]
        ,
        "synonyms": ["neat", "tidy", "pure"]
    },
    {
        "word": "CLEAR",
        "difficulty": 1,
        "tier": 5,
        "definition": "(adjective / verb) Easy to see through or understand; to remove",
        "sentences": [
            "The instructions are clear.",
            "She cleared the table.",
            "The sky is clear and blue."
        ]
        ,
        "synonyms": ["obvious", "transparent", "bright"]
    },
    {
        "word": "CLIMATE",
        "difficulty": 4,
        "definition": "(n.) The weather conditions prevailing in an area.",
        "sentence": "The climate is changing.",
        "hint": "Weather pattern."
        ,
        "synonyms": ["weather-pattern", "atmosphere", "conditions"]
    },
    {
        "word": "CLIMBED",
        "difficulty": 4,
        "tier": 8,
        "definition": "(verb) Moved upward using the hands and feet, or ascended gradually.",
        "sentences": [
            "She climbed the mountain.",
            "He climbed the ladder.",
            "They climbed up to the roof."
        ]
        ,
        "synonyms": ["ascended", "scaled", "went-up"]
    },
    {
        "word": "CLOSE",
        "difficulty": 1,
        "tier": 3,
        "definition": "(verb / adjective) To shut; near in distance",
        "sentences": [
            "Close the door, please.",
            "The shops are very close.",
            "She lives close to the park."
        ]
        ,
        "synonyms": ["near", "shut", "intimate"]
    },
    {
        "word": "CLOSET",
        "difficulty": 1,
        "definition": "(n.) A tall cupboard or wardrobe.",
        "sentence": "Hang it in the closet.",
        "hint": "Cupboard."
        ,
        "synonyms": ["wardrobe", "cupboard", "storage"]
    },
    {
        "word": "CLOTHES",
        "difficulty": 1,
        "tier": 6,
        "definition": "(noun) Items worn to cover the body",
        "sentences": [
            "She folded her clothes.",
            "He put on clean clothes.",
            "Pack warm clothes for the trip."
        ]
        ,
        "synonyms": ["garments", "clothing", "attire"]
    },
    {
        "word": "CLOUD",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun) A mass of water droplets floating in the sky",
        "sentences": [
            "A dark cloud appeared.",
            "She watched the clouds drift by.",
            "The sky was full of clouds."
        ]
        ,
        "synonyms": ["mist", "haze", "vapor"]
    },
    {
        "word": "COAST",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun) The land along the edge of the sea",
        "sentences": [
            "They drove along the coast.",
            "She lives on the coast.",
            "The coast was beautiful in summer."
        ]
        ,
        "synonyms": ["shoreline", "seaside", "beach"]
    },
    {
        "word": "COHERENT",
        "difficulty": 5,
        "definition": "(adj.) Logical and consistent.",
        "sentence": "He gave a coherent argument.",
        "hint": "Logical."
        ,
        "synonyms": ["logical", "consistent", "rational"]
    },
    {
        "word": "COINCIDE",
        "difficulty": 5,
        "definition": "(v.) Occur at or during the same time.",
        "sentences": [
            "The two festivals coincide this year.",
            "The dates coincide with our school holidays.",
            "Their birthdays coincide, so they share a party."
        ],
        "hint": "Match up."
        ,
        "synonyms": ["align", "overlap", "correspond"]
    },
    {
        "word": "COLD",
        "difficulty": 1,
        "tier": 4,
        "definition": "(adjective / noun) Low in temperature; an illness affecting the nose and throat",
        "sentences": [
            "It is very cold today.",
            "She caught a cold.",
            "The wind is cold."
        ]
        ,
        "synonyms": ["chilly", "freezing", "cool"]
    },
    {
        "word": "COLLECT",
        "difficulty": 4,
        "definition": "(v.) Bring or gather together.",
        "sentence": "Collect your things.",
        "hint": "Gather."
        ,
        "synonyms": ["gather", "assemble", "accumulate"]
    },
    {
        "word": "COLLEGE",
        "difficulty": 4,
        "definition": "(n.) An educational institution.",
        "sentence": "He is going to college.",
        "hint": "School."
        ,
        "synonyms": ["university", "institution", "academy"]
    },
    {
        "word": "COLONY",
        "difficulty": 5,
        "definition": "(n.) A country or area under the control of another.",
        "sentence": "The British colony.",
        "hint": "Settlement."
        ,
        "synonyms": ["settlement", "dependency", "territory"]
    },
    {
        "word": "COLOR",
        "difficulty": 1,
        "tier": 4,
        "definition": "(noun / verb) The visual quality of objects produced by reflected light; to apply pigment or hue to something.",
        "sentences": [
            "What is your favorite color?",
            "She colored the picture with crayons.",
            "The sunset had beautiful colors."
        ]
        ,
        "synonyms": ["hue", "shade", "tint"]
    },
    {
        "word": "COLORFUL",
        "difficulty": 4,
        "definition": "(adj.) Having many bright or varied hues; vivid and striking in appearance.",
        "sentence": "A colorful painting.",
        "hint": "Vibrant."
        ,
        "synonyms": ["vivid", "vibrant", "bright"]
    },
    {
        "word": "COLUMN",
        "difficulty": 4,
        "definition": "(n.) An upright pillar supporting a structure.",
        "sentence": "A marble column.",
        "hint": "Pillar."
        ,
        "synonyms": ["pillar", "post", "article"]
    },
    {
        "word": "COME",
        "difficulty": 1,
        "tier": 1,
        "definition": "(verb) To move toward a place or person",
        "sentences": [
            "Come here, please.",
            "She will come at noon.",
            "Did he come to the party?"
        ]
        ,
        "synonyms": ["arrive", "approach", "visit"]
    },
    {
        "word": "COMEDY",
        "difficulty": 4,
        "definition": "(n.) A movie or play intended to make people laugh.",
        "sentence": "A great comedy.",
        "hint": "Humor."
        ,
        "synonyms": ["humor", "farce", "satire"]
    },
    {
        "word": "COMFORT",
        "difficulty": 4,
        "definition": "(n./v.) A state of physical ease; to console.",
        "sentence": "He lived in comfort.",
        "hint": "Ease."
        ,
        "synonyms": ["ease", "solace", "soothe"]
    },
    {
        "word": "COMMAND",
        "difficulty": 4,
        "definition": "(v./n.) Give an authoritative order; an order.",
        "sentence": "The officer gave a command.",
        "hint": "Order."
        ,
        "synonyms": ["order", "direct", "instruct"]
    },
    {
        "word": "COMMEND",
        "difficulty": 5,
        "definition": "(v.) Praise formally or officially.",
        "sentences": [
            "I commend you for your bravery.",
            "Teachers commend students who show effort.",
            "We commend her for her outstanding work."
        ],
        "hint": "Praise."
        ,
        "synonyms": ["praise", "endorse", "recommend"]
    },
    {
        "word": "COMMENT",
        "difficulty": 4,
        "definition": "(n./v.) A verbal or written remark; to remark.",
        "sentence": "He made a comment.",
        "hint": "Remark."
        ,
        "synonyms": ["remark", "observation", "note"]
    },
    {
        "word": "COMMERCE",
        "difficulty": 5,
        "definition": "(n.) The activity of buying and selling.",
        "sentence": "Chamber of commerce.",
        "hint": "Trade."
        ,
        "synonyms": ["trade", "business", "industry"]
    },
    {
        "word": "COMMON",
        "difficulty": 1,
        "definition": "(adj.) Occurring, found, or done often.",
        "sentence": "A common mistake.",
        "hint": "Usual."
        ,
        "synonyms": ["ordinary", "shared", "frequent"]
    },
    {
        "word": "COMMUNITY",
        "difficulty": 4,
        "definition": "(n.) A group of people living together.",
        "sentence": "A local community.",
        "hint": "Society."
        ,
        "synonyms": ["society", "group", "neighborhood"]
    },
    {
        "word": "COMPACT",
        "difficulty": 5,
        "definition": "(adj./n./v.) Closely packed together; a small case; to compress.",
        "sentence": "A compact car.",
        "hint": "Dense."
        ,
        "synonyms": ["dense", "concise", "small"]
    },
    {
        "word": "COMPANION",
        "difficulty": 5,
        "definition": "(n.) A person whom one spends a lot of time with.",
        "sentence": "A faithful companion.",
        "hint": "Friend."
        ,
        "synonyms": ["friend", "partner", "associate"]
    },
    {
        "word": "COMPANY",
        "difficulty": 4,
        "definition": "(n.) A commercial business.",
        "sentence": "He started a company.",
        "hint": "Firm."
        ,
        "synonyms": ["firm", "group", "companion"]
    },
    {
        "word": "COMPARE",
        "difficulty": 4,
        "definition": "(v.) Estimate or measure the similarity between.",
        "sentence": "Compare the two books.",
        "hint": "Contrast."
        ,
        "synonyms": ["contrast", "assess", "match"]
    },
    {
        "word": "COMPASSION",
        "difficulty": 5,
        "definition": "(n.) Sympathetic pity and concern.",
        "sentence": "She showed great compassion for others.",
        "hint": "Pity."
        ,
        "synonyms": ["empathy", "sympathy", "kindness"]
    },
    {
        "word": "COMPETE",
        "difficulty": 5,
        "definition": "(v.) Strive to gain or win something.",
        "sentence": "They compete for the prize.",
        "hint": "Vie."
        ,
        "synonyms": ["rival", "contest", "strive"]
    },
    {
        "word": "COMPLAIN",
        "difficulty": 4,
        "definition": "(v.) Express dissatisfaction or annoyance.",
        "sentence": "Don't complain.",
        "hint": "Grumble."
        ,
        "synonyms": ["gripe", "grumble", "protest"]
    },
    {
        "word": "COMPLEMENT",
        "difficulty": 5,
        "definition": "(n./v.) Something that pairs perfectly with another to make a whole; to go well together with something else.",
        "sentence": "The wine was a perfect complement.",
        "hint": "Addition."
        ,
        "synonyms": ["complete", "enhance", "pair"]
    },
    {
        "word": "COMPLETE",
        "difficulty": 4,
        "definition": "(adj./v.) Having all the necessary or appropriate parts; to finish.",
        "sentence": "The set is complete.",
        "hint": "Full."
        ,
        "synonyms": ["finish", "entire", "total"]
    },
    {
        "word": "COMPLEX",
        "difficulty": 5,
        "definition": "(adj./n.) Consisting of many different parts; a group of buildings.",
        "sentence": "It's a complex problem.",
        "hint": "Complicated."
        ,
        "synonyms": ["intricate", "complicated", "compound"]
    },
    {
        "word": "COMPOSE",
        "difficulty": 5,
        "definition": "(v.) Write or create a work of art.",
        "sentences": [
            "She will compose a short poem for the show.",
            "It takes skill to compose a symphony.",
            "They asked him to compose a new school song."
        ],
        "hint": "Create."
        ,
        "synonyms": ["create", "write", "form"]
    },
    {
        "word": "COMPOUND",
        "difficulty": 5,
        "definition": "(n./v./adj.) A substance formed from two or more elements chemically joined; to worsen or intensify a problem.",
        "sentence": "A chemical compound.",
        "hint": "Mixture."
        ,
        "synonyms": ["worsen", "intensify", "aggravate"]
    },
    {
        "word": "COMPRISE",
        "difficulty": 5,
        "definition": "(v.) Consist of; be made up of.",
        "sentences": [
            "The team will comprise ten players.",
            "The syllabus should comprise five topics.",
            "The meal will comprise three courses."
        ],
        "hint": "Include."
        ,
        "synonyms": ["include", "contain", "consist-of"]
    },
    {
        "word": "COMPUTER",
        "difficulty": 1,
        "definition": "(n.) An electronic device for storing data.",
        "sentence": "Use the computer.",
        "hint": "PC."
        ,
        "synonyms": ["device", "machine", "PC"]
    },
    {
        "word": "CONCENTRATE",
        "difficulty": 5,
        "definition": "(v.) Focus all one's attention on.",
        "sentence": "Concentrate on the task.",
        "hint": "Focus."
        ,
        "synonyms": ["focus", "condense", "center"]
    },
    {
        "word": "CONCEPT",
        "difficulty": 5,
        "definition": "(n.) An abstract idea; a general notion.",
        "sentence": "A new concept.",
        "hint": "Idea."
        ,
        "synonyms": ["idea", "notion", "theory"]
    },
    {
        "word": "CONCERN",
        "difficulty": 4,
        "definition": "(v./n.) Relate to; be about; anxiety.",
        "sentences": [
            "Safety issues concern all of us.",
            "These changes concern every student in the school.",
            "Does this topic concern you?"
        ],
        "hint": "Worry."
        ,
        "synonyms": ["worry", "issue", "matter"]
    },
    {
        "word": "CONCERT",
        "difficulty": 4,
        "definition": "(n./v.) A musical performance; to arrange.",
        "sentence": "They went to a concert.",
        "hint": "Show."
        ,
        "synonyms": ["performance", "show", "recital"]
    },
    {
        "word": "CONCESSION",
        "difficulty": 5,
        "definition": "(n.) A thing that is granted.",
        "sentences": [
            "Making one concession can help resolve a disagreement.",
            "The team was willing to offer a concession.",
            "She made a concession to keep the peace."
        ],
        "hint": "Grant."
        ,
        "synonyms": ["allowance", "compromise", "privilege"]
    },
    {
        "word": "CONCISE",
        "difficulty": 5,
        "definition": "(adj.) Giving information clearly in few words.",
        "sentence": "A concise summary.",
        "hint": "Brief."
        ,
        "synonyms": ["brief", "terse", "succinct"]
    },
    {
        "word": "CONCLUDE",
        "difficulty": 5,
        "definition": "(v.) Bring to an end.",
        "sentence": "Conclude the meeting.",
        "hint": "End."
        ,
        "synonyms": ["finish", "decide", "infer"]
    },
    {
        "word": "CONCRETE",
        "difficulty": 5,
        "definition": "(adj./n.) Existing in a physical form; a building material.",
        "sentence": "Concrete evidence.",
        "hint": "Physical."
        ,
        "synonyms": ["specific", "tangible", "solid"]
    },
    {
        "word": "CONCUR",
        "difficulty": 5,
        "definition": "(v.) Be of the same opinion; agree.",
        "sentence": "I concur with your opinion.",
        "hint": "Agree."
        ,
        "synonyms": ["agree", "coincide", "consent"]
    },
    {
        "word": "CONDENSE",
        "difficulty": 5,
        "definition": "(v.) Make denser or more concentrated.",
        "sentences": [
            "We need to condense the report to one page.",
            "When steam cools, it will condense into water.",
            "Can you condense your essay into a paragraph?"
        ],
        "hint": "Compact."
        ,
        "synonyms": ["shorten", "compress", "concentrate"]
    },
    {
        "word": "CONDITION",
        "difficulty": 4,
        "definition": "(n./v.) The state or quality of something at a given time; to train or prepare for a specific purpose.",
        "sentence": "Good condition.",
        "hint": "State."
        ,
        "synonyms": ["state", "requirement", "circumstance"]
    },
    {
        "word": "CONDITIONS",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun) The circumstances affecting how something exists or operates; terms that must be met.",
        "sentences": [
            "She read the conditions of the contract.",
            "The weather conditions were terrible.",
            "He worked in poor conditions."
        ]
        ,
        "synonyms": ["circumstances", "terms", "requirements"]
    },
    {
        "word": "CONDUCT",
        "difficulty": 5,
        "definition": "(v./n.) Organize and carry out; behavior.",
        "sentences": [
            "Scientists conduct experiments to test ideas.",
            "She will conduct the school orchestra tonight.",
            "How you conduct yourself matters."
        ],
        "hint": "Direct."
        ,
        "synonyms": ["behavior", "lead", "manage"]
    },
    {
        "word": "CONFESS",
        "difficulty": 5,
        "definition": "(v.) Admit that one has committed a crime.",
        "sentences": [
            "It is brave to confess when you make a mistake.",
            "She decided to confess the truth.",
            "I must confess I forgot about the meeting."
        ],
        "hint": "Admit."
        ,
        "synonyms": ["admit", "acknowledge", "reveal"]
    },
    {
        "word": "CONFIDENCE",
        "difficulty": 4,
        "definition": "(n.) A feeling of self-assurance.",
        "sentence": "He has confidence.",
        "hint": "Assurance."
        ,
        "synonyms": ["assurance", "trust", "belief"]
    },
    {
        "word": "CONFIRM",
        "difficulty": 4,
        "definition": "(v.) Establish the truth or correctness of.",
        "sentence": "Confirm your order.",
        "hint": "Verify."
        ,
        "synonyms": ["verify", "affirm", "prove"]
    },
    {
        "word": "CONFLICT",
        "difficulty": 4,
        "definition": "(n./v.) A serious disagreement or argument; to clash.",
        "sentence": "A long conflict.",
        "hint": "Fight."
        ,
        "synonyms": ["clash", "dispute", "struggle"]
    },
    {
        "word": "CONFUSE",
        "difficulty": 4,
        "definition": "(v.) Make bewildered or perplexed.",
        "sentence": "Don't confuse me.",
        "hint": "Baffle."
        ,
        "synonyms": ["bewilder", "perplex", "mix-up"]
    },
    {
        "word": "CONGRESS",
        "difficulty": 4,
        "definition": "(n.) A national legislative body.",
        "sentence": "The US Congress.",
        "hint": "Legislature."
        ,
        "synonyms": ["assembly", "legislature", "parliament"]
    },
    {
        "word": "CONNECT",
        "difficulty": 4,
        "definition": "(v.) Bring together or into contact.",
        "sentence": "Connect the dots.",
        "hint": "Join."
        ,
        "synonyms": ["link", "join", "attach"]
    },
    {
        "word": "CONQUER",
        "difficulty": 5,
        "definition": "(v.) Overcome and take control of.",
        "sentence": "Conquer the mountain.",
        "hint": "Defeat."
        ,
        "synonyms": ["defeat", "overcome", "subdue"]
    },
    {
        "word": "CONSCIOUS",
        "difficulty": 5,
        "definition": "(adj.) Aware of and responding to surroundings.",
        "sentence": "He was conscious.",
        "hint": "Aware."
        ,
        "synonyms": ["aware", "awake", "alert"]
    },
    {
        "word": "CONSENT",
        "difficulty": 5,
        "definition": "(v./n.) Permission for something to happen; to agree.",
        "sentence": "He gave his consent.",
        "hint": "Agreement."
        ,
        "synonyms": ["agree", "permit", "approve"]
    },
    {
        "word": "CONSEQUENT",
        "difficulty": 5,
        "definition": "(adj.) Following as a result or effect.",
        "sentence": "Consequent loss.",
        "hint": "Resulting."
        ,
        "synonyms": ["resulting", "following", "subsequent"]
    },
    {
        "word": "CONSERVE",
        "difficulty": 5,
        "definition": "(v.) Protect from harm or destruction.",
        "sentence": "Conserve water.",
        "hint": "Save."
        ,
        "synonyms": ["protect", "save", "preserve"]
    },
    {
        "word": "CONSIDER",
        "difficulty": 4,
        "definition": "(v.) Think carefully about something.",
        "sentence": "Consider the facts.",
        "hint": "Think."
        ,
        "synonyms": ["think", "contemplate", "regard"]
    },
    {
        "word": "CONSIST",
        "difficulty": 5,
        "definition": "(v.) Be composed or made up of.",
        "sentences": [
            "A healthy diet should consist of varied foods.",
            "The test will consist of twenty questions.",
            "A good team must consist of people who trust each other."
        ],
        "hint": "Comprise."
        ,
        "synonyms": ["contain", "comprise", "include"]
    },
    {
        "word": "CONSOLE",
        "difficulty": 5,
        "definition": "(v./n.) Comfort someone at a time of grief; a control panel.",
        "sentence": "To console a friend.",
        "hint": "Comfort."
        ,
        "synonyms": ["comfort", "soothe", "control-panel"]
    },
    {
        "word": "CONSONANT",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun) A speech sound other than a vowel",
        "sentences": [
            "B is a consonant.",
            "She identified each consonant.",
            "The word has three consonants."
        ]
        ,
        "synonyms": ["letter", "sound", "non-vowel"]
    },
    {
        "word": "CONSPICUOUS",
        "difficulty": 5,
        "definition": "(adj.) Standing out so as to be clearly visible.",
        "sentence": "A conspicuous sign.",
        "hint": "Obvious."
        ,
        "synonyms": ["obvious", "visible", "prominent"]
    },
    {
        "word": "CONSPIRE",
        "difficulty": 5,
        "definition": "(v.) Make secret plans jointly to commit a crime.",
        "sentences": [
            "The two characters conspire to win the prize.",
            "Would you ever conspire to keep a surprise?",
            "It seemed as if the weather and traffic conspire against us."
        ],
        "hint": "Plot."
        ,
        "synonyms": ["plot", "scheme", "collude"]
    },
    {
        "word": "CONSTANT",
        "difficulty": 4,
        "definition": "(adj.) Occurring continuously over time.",
        "sentence": "The noise was constant.",
        "hint": "Steady."
        ,
        "synonyms": ["steady", "continuous", "unchanging"]
    },
    {
        "word": "CONSTITUTE",
        "difficulty": 5,
        "definition": "(v.) Be a part of a whole.",
        "sentences": [
            "Five members constitute a quorum.",
            "Hard work and creativity constitute success.",
            "What does it mean to constitute a good friend?"
        ],
        "hint": "Make up."
        ,
        "synonyms": ["form", "make-up", "establish"]
    },
    {
        "word": "CONSTRAIN",
        "difficulty": 5,
        "definition": "(v.) Severely restrict the scope.",
        "sentences": [
            "Rules constrain what we are allowed to do.",
            "Tight shoes constrain your feet.",
            "Lack of funds can constrain a project."
        ],
        "hint": "Limit."
        ,
        "synonyms": ["restrict", "limit", "confine"]
    },
    {
        "word": "CONSTRUCT",
        "difficulty": 5,
        "definition": "(v./n.) Build or erect something; an idea or theory.",
        "sentence": "Construct a tower.",
        "hint": "Build."
        ,
        "synonyms": ["build", "create", "assemble"]
    },
    {
        "word": "CONSULT",
        "difficulty": 5,
        "definition": "(v.) Seek information or advice from.",
        "sentence": "Consult a lawyer.",
        "hint": "Ask."
        ,
        "synonyms": ["seek-advice", "refer", "check-with"]
    },
    {
        "word": "CONSUME",
        "difficulty": 5,
        "definition": "(v.) Eat, drink, or ingest.",
        "sentence": "They consume a lot of energy.",
        "hint": "Use up."
        ,
        "synonyms": ["use-up", "eat", "devour"]
    },
    {
        "word": "CONTACT",
        "difficulty": 4,
        "definition": "(n./v.) Physical touching; to communicate with.",
        "sentence": "Keep in contact.",
        "hint": "Touch."
        ,
        "synonyms": ["reach", "touch", "connection"]
    },
    {
        "word": "CONTAIN",
        "difficulty": 4,
        "definition": "(v.) Have or hold someone or something within.",
        "sentences": [
            "Fruit and vegetables contain many vitamins.",
            "This jar can contain up to one litre.",
            "Books contain a wealth of knowledge."
        ],
        "hint": "Hold."
        ,
        "synonyms": ["hold", "include", "restrain"]
    },
    {
        "word": "CONTEMPLATE",
        "difficulty": 5,
        "definition": "(v.) Look thoughtfully for a long time at.",
        "sentences": [
            "Take a moment to contemplate your next move.",
            "I often contemplate ideas while walking.",
            "She will contemplate the offer before deciding."
        ],
        "hint": "Think."
        ,
        "synonyms": ["think", "consider", "ponder"]
    },
    {
        "word": "CONTENT",
        "difficulty": 4,
        "definition": "(n./adj./v.) The subjects or topics; satisfied; to satisfy.",
        "sentences": [
            "The content of the book was very interesting.",
            "We need to review the content of this chapter.",
            "Make sure the content of your speech is clear."
        ],
        "hint": "Subject."
        ,
        "synonyms": ["material", "satisfied", "substance"]
    },
    {
        "word": "CONTEST",
        "difficulty": 4,
        "definition": "(n./v.) An event in which people compete; to dispute.",
        "sentence": "He won the contest.",
        "hint": "Competition."
        ,
        "synonyms": ["competition", "dispute", "challenge"]
    },
    {
        "word": "CONTEXT",
        "difficulty": 5,
        "definition": "(n.) Circumstances forming a setting.",
        "sentence": "He took my words out of context.",
        "hint": "Setting."
        ,
        "synonyms": ["setting", "circumstances", "background"]
    },
    {
        "word": "CONTINUE",
        "difficulty": 4,
        "definition": "(v.) Persist in an activity or process.",
        "sentence": "Please continue.",
        "hint": "Keep going."
        ,
        "synonyms": ["go-on", "persist", "proceed"]
    },
    {
        "word": "CONTINUED",
        "difficulty": 4,
        "tier": 8,
        "definition": "(verb) Kept going without stopping; persisted in an activity.",
        "sentences": [
            "She continued walking.",
            "He continued his story.",
            "They continued working despite the rain."
        ]
        ,
        "synonyms": ["ongoing", "persisted", "sustained"]
    },
    {
        "word": "CONTRACT",
        "difficulty": 5,
        "definition": "(n./v.) A written or spoken agreement; to decrease in size.",
        "sentence": "Sign the contract.",
        "hint": "Agreement."
        ,
        "synonyms": ["agreement", "shrink", "deal"]
    },
    {
        "word": "CONTRADICT",
        "difficulty": 5,
        "definition": "(v.) Deny the truth of a statement.",
        "sentence": "The reports contradict each other.",
        "hint": "Deny."
        ,
        "synonyms": ["deny", "oppose", "negate"]
    },
    {
        "word": "CONTRAST",
        "difficulty": 5,
        "definition": "(n./v.) State of being strikingly different; to compare.",
        "sentence": "The contrast is sharp.",
        "hint": "Difference."
        ,
        "synonyms": ["difference", "oppose", "compare"]
    },
    {
        "word": "CONTRIBUTE",
        "difficulty": 5,
        "definition": "(v.) Give something in order to achieve.",
        "sentence": "Contribute some money.",
        "hint": "Giving."
        ,
        "synonyms": ["give", "add", "donate"]
    },
    {
        "word": "CONTROL",
        "difficulty": 4,
        "definition": "(v./n.) Power to influence or direct; a means of directing.",
        "sentence": "He lost control.",
        "hint": "Direct."
        ,
        "synonyms": ["manage", "restrain", "power"]
    },
    {
        "word": "CONTROVERSY",
        "difficulty": 5,
        "definition": "(n.) Disagreement, typically prolonged.",
        "sentence": "The plan caused a lot of controversy.",
        "hint": "Dispute."
        ,
        "synonyms": ["dispute", "debate", "conflict"]
    },
    {
        "word": "CONVERSE",
        "difficulty": 5,
        "definition": "(v./n.) Talk with someone in an exchange of words; the reverse or opposite of something.",
        "sentence": "Converse with him.",
        "hint": "Talk."
        ,
        "synonyms": ["talk", "speak", "discuss"]
    },
    {
        "word": "CONVERT",
        "difficulty": 5,
        "definition": "(v./n.) Cause to change in form/function; a person who has changed beliefs.",
        "sentence": "Convert the file.",
        "hint": "Change."
        ,
        "synonyms": ["change", "transform", "switch"]
    },
    {
        "word": "CONVEY",
        "difficulty": 5,
        "definition": "(v.) Transport or carry to a place.",
        "sentence": "The trucks convey the goods.",
        "hint": "Carry."
        ,
        "synonyms": ["carry", "express", "communicate"]
    },
    {
        "word": "CONVINCE",
        "difficulty": 4,
        "definition": "(v.) Cause someone to believe firmly.",
        "sentence": "Convince the judge.",
        "hint": "Persuade."
        ,
        "synonyms": ["persuade", "sway", "assure"]
    },
    {
        "word": "COOK",
        "difficulty": 1,
        "tier": 9,
        "definition": "(verb / noun) To prepare food using heat",
        "sentences": [
            "She cooks dinner every night.",
            "He is a great cook.",
            "Cook the pasta for ten minutes."
        ]
        ,
        "synonyms": ["prepare", "chef", "heat"]
    },
    {
        "word": "COOKERY",
        "difficulty": 5,
        "definition": "(n.) The practice or skill of preparing food.",
        "sentence": "A cookery book.",
        "hint": "Cooking."
        ,
        "synonyms": ["cooking", "culinary-art", "cuisine"]
    },
    {
        "word": "COOL",
        "difficulty": 1,
        "tier": 8,
        "definition": "(adjective / verb) Slightly cold; to make slightly cold",
        "sentences": [
            "The water was cool and refreshing.",
            "She cooled down in the shade.",
            "He wore cool sunglasses."
        ]
        ,
        "synonyms": ["cold", "calm", "trendy"]
    },
    {
        "word": "COOPERATE",
        "difficulty": 5,
        "definition": "(v.) Work jointly toward the same end.",
        "sentences": [
            "Everyone must cooperate to finish on time.",
            "It is important to cooperate with your teammates.",
            "Animals sometimes cooperate to find food."
        ],
        "hint": "Work together."
        ,
        "synonyms": ["work-together", "collaborate", "assist"]
    },
    {
        "word": "COORDINATE",
        "difficulty": 5,
        "definition": "(v./n.) Bring the different elements of a complex activity; a set of values.",
        "sentence": "Coordinate the event.",
        "hint": "Organize."
        ,
        "synonyms": ["organize", "align", "manage"]
    },
    {
        "word": "COPPER",
        "difficulty": 4,
        "definition": "(n./adj.) A reddish-brown metallic element; having a reddish-brown hue.",
        "sentence": "Copper wire.",
        "hint": "Metal."
        ,
        "synonyms": ["metal", "element", "reddish-metal"]
    },
    {
        "word": "COPPICE",
        "difficulty": 5,
        "definition": "(n./v.) An area of woodland in which trees are cut; to cut back.",
        "sentence": "The old coppice.",
        "hint": "Grove."
        ,
        "synonyms": ["thicket", "copse", "wood"]
    },
    {
        "word": "COPY",
        "difficulty": 1,
        "tier": 7,
        "definition": "(noun / verb) A duplicate; to make a duplicate of",
        "sentences": [
            "She made a copy of the letter.",
            "Please copy the notes.",
            "He copied the drawing carefully."
        ]
        ,
        "synonyms": ["duplicate", "imitate", "replicate"]
    },
    {
        "word": "COPYRIGHT",
        "difficulty": 5,
        "definition": "(n./v.) The legal right that protects creators from having their work copied without permission; to register that right.",
        "sentence": "The copyright is held.",
        "hint": "Legal right."
        ,
        "synonyms": ["intellectual-property", "legal-protection", "ownership"]
    },
    {
        "word": "CORN",
        "difficulty": 1,
        "tier": 10,
        "definition": "(noun) A cereal plant with yellow kernels",
        "sentences": [
            "She loves corn on the cob.",
            "He grew corn in his field.",
            "Corn is used to make popcorn."
        ]
        ,
        "synonyms": ["maize", "grain", "starch"]
    },
    {
        "word": "CORNER",
        "difficulty": 1,
        "definition": "(n./v.) A place where two sides meet; to trap.",
        "sentence": "Turn the corner.",
        "hint": "Angle."
        ,
        "synonyms": ["angle", "bend", "nook"]
    },
    {
        "word": "CORPORATE",
        "difficulty": 5,
        "definition": "(adj.) Relating to a large company or group.",
        "sentence": "Corporate office.",
        "hint": "Company."
        ,
        "synonyms": ["company", "organizational", "business"]
    },
    {
        "word": "CORRECT",
        "difficulty": 1,
        "definition": "(adj./v.) Free from error; to fix an error.",
        "sentence": "The answer is correct.",
        "hint": "Right."
        ,
        "synonyms": ["right", "accurate", "fix"]
    },
    {
        "word": "CORRESPOND",
        "difficulty": 5,
        "definition": "(v.) Have a close similarity; match or agree.",
        "sentence": "Marks correspond.",
        "hint": "Match."
        ,
        "synonyms": ["match", "write", "relate"]
    },
    {
        "word": "CORROBORATE",
        "difficulty": 5,
        "definition": "(v.) Confirm or give support to.",
        "sentences": [
            "Can any witnesses corroborate his account?",
            "New evidence may corroborate her story.",
            "Scientists need data to corroborate a theory."
        ],
        "hint": "Confirm."
        ,
        "synonyms": ["confirm", "support", "back-up"]
    },
    {
        "word": "CORRUPT",
        "difficulty": 5,
        "definition": "(adj./v.) Willing to act dishonestly for personal gain; to cause someone or something to become dishonest or damaged.",
        "sentence": "A corrupt official.",
        "hint": "Dishonest."
        ,
        "synonyms": ["dishonest", "taint", "depraved"]
    },
    {
        "word": "COST",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun / verb) The amount paid for something; to require payment",
        "sentences": [
            "How much does it cost?",
            "The repair cost a lot.",
            "She paid the full cost."
        ]
        ,
        "synonyms": ["price", "expense", "charge"]
    },
    {
        "word": "COSTUME",
        "difficulty": 4,
        "definition": "(n.) A set of clothes worn by an actor.",
        "sentence": "Halloween costume.",
        "hint": "Outfit."
        ,
        "synonyms": ["outfit", "dress", "attire"]
    },
    {
        "word": "COTTAGE",
        "difficulty": 4,
        "definition": "(n.) A small house, typically one in the country.",
        "sentence": "A cozy cottage.",
        "hint": "Small house."
        ,
        "synonyms": ["cabin", "hut", "bungalow"]
    },
    {
        "word": "COTTON",
        "difficulty": 1,
        "tier": 10,
        "definition": "(noun) A plant fiber used to make cloth",
        "sentences": [
            "She wore a cotton dress.",
            "Cotton is soft and light.",
            "He wiped it with a cotton cloth."
        ]
        ,
        "synonyms": ["fabric", "fiber", "plant"]
    },
    {
        "word": "COULD",
        "difficulty": 1,
        "tier": 1,
        "definition": "(verb) Was able to; expressing what was possible or allowed at a past time.",
        "sentences": [
            "Could you help me?",
            "She could swim at age three.",
            "I could see the lights from far away."
        ]
        ,
        "synonyms": ["was-able-to", "might", "had-the-ability"]
    },
    {
        "word": "COULDN'T",
        "difficulty": 1,
        "tier": 7,
        "definition": "(contraction) A shortened form expressing inability or refusal.",
        "sentences": [
            "She couldn't stop laughing.",
            "He couldn't remember the answer.",
            "I couldn't believe it!"
        ]
        ,
        "synonyms": ["was-unable", "could-not", "was-incapable"]
    },
    {
        "word": "COUNCIL",
        "difficulty": 5,
        "definition": "(n.) An advisory, deliberative, or legislative body.",
        "sentence": "The city council.",
        "hint": "Assembly."
        ,
        "synonyms": ["board", "committee", "body"]
    },
    {
        "word": "COUNSEL",
        "difficulty": 5,
        "definition": "(n./v.) Advice, especially that given formally; to advise.",
        "sentence": "Wise counsel.",
        "hint": "Advice."
        ,
        "synonyms": ["advice", "guide", "lawyer"]
    },
    {
        "word": "COUNT",
        "difficulty": 1,
        "tier": 7,
        "definition": "(verb / noun) To calculate a number; a total",
        "sentences": [
            "She counted to ten.",
            "Every vote counts.",
            "He lost count."
        ]
        ,
        "synonyms": ["tally", "enumerate", "number"]
    },
    {
        "word": "COUNTER",
        "difficulty": 4,
        "definition": "(n./v./adj.) A long flat-topped fixture in a shop; to oppose; opposite.",
        "sentence": "The kitchen counter.",
        "hint": "Table."
        ,
        "synonyms": ["oppose", "surface", "opposite"]
    },
    {
        "word": "COUNTRY",
        "difficulty": 1,
        "definition": "(n./adj.) A nation with its own government; rural.",
        "sentence": "He loves his country.",
        "hint": "Nation."
        ,
        "synonyms": ["nation", "land", "state"]
    },
    {
        "word": "COUPLE",
        "difficulty": 1,
        "definition": "(n./v.) Two people or things; to join.",
        "sentence": "A happy couple.",
        "hint": "Pair."
        ,
        "synonyms": ["pair", "two", "partners"]
    },
    {
        "word": "COURAGE",
        "difficulty": 4,
        "definition": "(n.) The ability to do something that frightens one.",
        "sentence": "He showed great courage.",
        "hint": "Bravery."
        ,
        "synonyms": ["bravery", "valor", "nerve"]
    },
    {
        "word": "COURSE",
        "difficulty": 1,
        "definition": "(n./v.) The route or direction; to flow.",
        "sentence": "Take a course.",
        "hint": "Path."
        ,
        "synonyms": ["path", "class", "route"]
    },
    {
        "word": "COURTESY",
        "difficulty": 5,
        "definition": "(n.) The showing of politeness in one's attitude.",
        "sentence": "With courtesy.",
        "hint": "Politeness."
        ,
        "synonyms": ["politeness", "respect", "manners"]
    },
    {
        "word": "COUSIN",
        "difficulty": 1,
        "definition": "(n.) A child of one's aunt or uncle.",
        "sentence": "He is my cousin.",
        "hint": "Relative."
        ,
        "synonyms": ["relative", "kin", "extended-family"]
    },
    {
        "word": "COVERED",
        "difficulty": 1,
        "tier": 4,
        "definition": "(verb / adjective) Had something placed over it; dealt with or included.",
        "sentences": [
            "She covered her face with her hands.",
            "The ground was covered in snow.",
            "He covered the food with a cloth."
        ]
        ,
        "synonyms": ["hidden", "coated", "protected"]
    },
    {
        "word": "COWS",
        "difficulty": 1,
        "tier": 10,
        "definition": "(noun) Large domesticated female bovine animals raised for milk or meat.",
        "sentences": [
            "The cows grazed in the field.",
            "She milked the cows.",
            "He counted twelve cows."
        ]
        ,
        "synonyms": ["cattle", "bovines", "herd"]
    },
    {
        "word": "CRACKLE",
        "difficulty": 5,
        "definition": "(v./n.) Produce a rapid series of sharp snapping sounds.",
        "sentences": [
            "Dry leaves crackle underfoot in autumn.",
            "A fire will crackle in the fireplace all night.",
            "The radio began to crackle in the bad weather."
        ],
        "hint": "Pop."
        ,
        "synonyms": ["snap", "pop", "fizz"]
    },
    {
        "word": "CREATE",
        "difficulty": 4,
        "tier": 10,
        "definition": "(verb) To make something new",
        "sentences": [
            "Artists create works that inspire others.",
            "You can create a new document by clicking here.",
            "Children love to create their own stories."
        ]
        ,
        "synonyms": ["make", "produce", "generate"]
    },
    {
        "word": "CREATURE",
        "difficulty": 4,
        "definition": "(n.) An animal, as distinct from a human.",
        "sentence": "A strange creature.",
        "hint": "Being."
        ,
        "synonyms": ["animal", "being", "organism"]
    },
    {
        "word": "CREDIT",
        "difficulty": 4,
        "definition": "(n./v.) The ability of a customer to obtain goods; to attribute.",
        "sentence": "Store credit.",
        "hint": "Reputation."
        ,
        "synonyms": ["recognition", "trust", "loan"]
    },
    {
        "word": "CRICKET",
        "difficulty": 4,
        "definition": "(n.) An insect related to the grasshopper.",
        "sentence": "He heard a cricket.",
        "hint": "Insect."
        ,
        "synonyms": ["sport", "insect", "game"]
    },
    {
        "word": "CRIED",
        "difficulty": 1,
        "tier": 4,
        "definition": "(verb) Shed tears from emotion; or called out loudly.",
        "sentences": [
            "The baby cried all night.",
            "She cried at the end of the film.",
            "He cried out for help."
        ]
        ,
        "synonyms": ["wept", "sobbed", "called-out"]
    },
    {
        "word": "CRIMINAL",
        "difficulty": 5,
        "definition": "(n./adj.) A person who has committed a crime; relating to crime.",
        "sentence": "A criminal act.",
        "hint": "Outlaw."
        ,
        "synonyms": ["offender", "lawbreaker", "felon"]
    },
    {
        "word": "CRITERION",
        "difficulty": 5,
        "definition": "(n.) Standard by which something is judged.",
        "sentence": "The main criterion for a job.",
        "hint": "Standard."
        ,
        "synonyms": ["standard", "measure", "benchmark"]
    },
    {
        "word": "CROPS",
        "difficulty": 1,
        "tier": 9,
        "definition": "(noun) Plants cultivated on a large scale for food, fiber, or other uses.",
        "sentences": [
            "The crops grew well this year.",
            "She harvested the crops.",
            "Good rain helps crops grow."
        ]
        ,
        "synonyms": ["produce", "harvest", "plants"]
    },
    {
        "word": "CROSS",
        "difficulty": 1,
        "tier": 6,
        "definition": "(verb / noun / adjective) To go over; a shape like a plus sign; angry",
        "sentences": [
            "She crossed the road.",
            "He drew a red cross.",
            "She was very cross with him."
        ]
        ,
        "synonyms": ["angry", "traverse", "intersect"]
    },
    {
        "word": "CROWD",
        "difficulty": 1,
        "tier": 9,
        "definition": "(noun / verb) A large group of people; to gather in large numbers",
        "sentences": [
            "A large crowd gathered.",
            "People crowded into the hall.",
            "She pushed through the crowd."
        ]
        ,
        "synonyms": ["mass", "group", "throng"]
    },
    {
        "word": "CRUCIAL",
        "difficulty": 5,
        "definition": "(adj.) Decisive or critical.",
        "sentence": "The role of the teacher is crucial.",
        "hint": "Essential."
        ,
        "synonyms": ["vital", "critical", "essential"]
    },
    {
        "word": "CRYSTAL",
        "difficulty": 4,
        "definition": "(n./adj.) A transparent mineral; clear.",
        "sentence": "The water was crystal clear.",
        "hint": "Mineral."
        ,
        "synonyms": ["gem", "clear", "prism"]
    },
    {
        "word": "CULTURE",
        "difficulty": 4,
        "definition": "(n./v.) The arts and industrial achievements; to grow cells.",
        "sentence": "A diverse culture.",
        "hint": "Tradition."
        ,
        "synonyms": ["civilization", "society", "tradition"]
    },
    {
        "word": "CUMULATIVE",
        "difficulty": 5,
        "definition": "(adj.) Increasing by successive additions.",
        "sentence": "The cumulative effect of smoking.",
        "hint": "Total."
        ,
        "synonyms": ["growing", "accumulated", "increasing"]
    },
    {
        "word": "CUPBOARD",
        "difficulty": 4,
        "definition": "(n.) A cabinet or small recess with a door.",
        "sentence": "The plates are in the cupboard.",
        "hint": "Cabinet."
        ,
        "synonyms": ["cabinet", "closet", "storage"]
    },
    {
        "word": "CURRENT",
        "difficulty": 4,
        "definition": "(adj./n.) Belonging to the present time; a flow of water/air/electricity.",
        "sentence": "The current situation.",
        "hint": "Present."
        ,
        "synonyms": ["present", "flow", "contemporary"]
    },
    {
        "word": "CURTAIN",
        "difficulty": 4,
        "definition": "(n./v.) A hanging cloth used to block light or provide privacy over a window.",
        "sentence": "Close the curtain.",
        "hint": "Drape."
        ,
        "synonyms": ["drape", "blind", "screen"]
    },
    {
        "word": "CUSHION",
        "difficulty": 4,
        "definition": "(n./v.) A soft bag of cloth stuffed with firm material; to soften an impact.",
        "sentence": "Sit on the cushion.",
        "hint": "Pillow."
        ,
        "synonyms": ["pillow", "pad", "buffer"]
    },
    {
        "word": "CUSTOM",
        "difficulty": 4,
        "definition": "(n./adj.) A traditional practice; made to order.",
        "sentence": "An old custom.",
        "hint": "Tradition."
        ,
        "synonyms": ["tradition", "habit", "practice"]
    },
    {
        "word": "CUT",
        "difficulty": 1,
        "tier": 3,
        "definition": "(verb / noun) To divide with a sharp instrument; a wound",
        "sentences": [
            "She cut the apple in half.",
            "He has a small cut on his hand.",
            "Please cut along the dotted line."
        ]
        ,
        "synonyms": ["slice", "reduce", "sever"]
    },
    {
        "word": "CYLINDER",
        "difficulty": 5,
        "definition": "(n.) A solid geometric figure with straight parallel sides.",
        "sentence": "The tank is a cylinder.",
        "hint": "Tube."
        ,
        "synonyms": ["tube", "drum", "barrel"]
    },
    {
        "word": "DAMAGE",
        "difficulty": 4,
        "definition": "(n./v.) Physical harm caused to something; to harm.",
        "sentence": "There was some damage.",
        "hint": "Harm."
        ,
        "synonyms": ["harm", "injury", "impair"]
    },
    {
        "word": "DANCE",
        "difficulty": 1,
        "tier": 6,
        "definition": "(verb / noun) To move rhythmically to music; a set of movements",
        "sentences": [
            "She loves to dance.",
            "They had a dance at the school.",
            "He danced all night."
        ]
        ,
        "synonyms": ["move", "rhythm", "choreography"]
    },
    {
        "word": "DANGER",
        "difficulty": 1,
        "definition": "(n.) The possibility of suffering harm.",
        "sentence": "The sign warned of danger.",
        "hint": "Risk."
        ,
        "synonyms": ["risk", "peril", "hazard"]
    },
    {
        "word": "DARK",
        "difficulty": 1,
        "tier": 5,
        "definition": "(adjective / noun) Without light; the absence of light",
        "sentences": [
            "She is afraid of the dark.",
            "It was a dark and stormy night.",
            "The room went dark."
        ]
        ,
        "synonyms": ["dim", "gloomy", "night"]
    },
    {
        "word": "DAUGHTER",
        "difficulty": 1,
        "definition": "(n.) A girl or woman in relation to her parents.",
        "sentence": "She is my daughter.",
        "hint": "Child."
        ,
        "synonyms": ["child", "girl", "offspring"]
    },
    {
        "word": "DAY",
        "difficulty": 1,
        "tier": 1,
        "definition": "(noun) A 24-hour period; the time when it is light",
        "sentences": [
            "It was a sunny day.",
            "She works five days a week.",
            "Have a great day!"
        ]
        ,
        "synonyms": ["date", "daytime", "period"]
    },
    {
        "word": "DEAD",
        "difficulty": 1,
        "tier": 10,
        "definition": "(adjective) No longer alive",
        "sentences": [
            "The plant was dead.",
            "Dead leaves covered the ground.",
            "He was dead tired after the run."
        ]
        ,
        "synonyms": ["deceased", "lifeless", "gone"]
    },
    {
        "word": "DEAL",
        "difficulty": 1,
        "tier": 10,
        "definition": "(noun / verb) An agreement; to handle or give out",
        "sentences": [
            "They made a deal.",
            "She dealt the cards.",
            "It was a great deal."
        ]
        ,
        "synonyms": ["agreement", "bargain", "handle"]
    },
    {
        "word": "DEATH",
        "difficulty": 1,
        "tier": 10,
        "definition": "(noun) The end of life",
        "sentences": [
            "The death of the tree saddened her.",
            "He faced death bravely.",
            "The news of her death spread quickly."
        ]
        ,
        "synonyms": ["demise", "end", "passing"]
    },
    {
        "word": "DEBATE",
        "difficulty": 5,
        "definition": "(n./v.) A formal discussion on a topic; to argue formally.",
        "sentence": "The debate was lively.",
        "hint": "Discussion."
        ,
        "synonyms": ["discussion", "argument", "dispute"]
    },
    {
        "word": "DECADE",
        "difficulty": 5,
        "definition": "(n.) A period of ten years.",
        "sentence": "A decade ago.",
        "hint": "10 years."
        ,
        "synonyms": ["ten-years", "period", "era"]
    },
    {
        "word": "DECIDE",
        "difficulty": 4,
        "tier": 5,
        "definition": "(verb) To make a choice or come to a conclusion",
        "sentences": [
            "She couldn't decide what to wear.",
            "He decided to stay home.",
            "Can you decide by Friday?"
        ]
        ,
        "synonyms": ["determine", "choose", "resolve"]
    },
    {
        "word": "DECIMAL",
        "difficulty": 5,
        "definition": "(n./adj.) Relating to or denoting a system of numbers based on ten.",
        "sentence": "A decimal point.",
        "hint": "Fractional."
        ,
        "synonyms": ["fraction", "tenth", "numeric"]
    },
    {
        "word": "DECLARE",
        "difficulty": 5,
        "definition": "(v.) Say something in a solemn and emphatic manner.",
        "sentence": "I declare war.",
        "hint": "State."
        ,
        "synonyms": ["announce", "proclaim", "state"]
    },
    {
        "word": "DECLINE",
        "difficulty": 5,
        "definition": "(v./n.) Become smaller, fewer, or less; a gradual decrease.",
        "sentences": [
            "Temperatures decline in the autumn.",
            "Attendance can decline if lessons are not engaging.",
            "She may decline the invitation politely."
        ],
        "hint": "Decrease."
        ,
        "synonyms": ["decrease", "refuse", "fall"]
    },
    {
        "word": "DEEP",
        "difficulty": 1,
        "tier": 5,
        "definition": "(adjective / adverb) Extending far down; to a great depth",
        "sentences": [
            "The lake is very deep.",
            "She thought deeply about the question.",
            "He has a deep voice."
        ]
        ,
        "synonyms": ["profound", "vast", "low"]
    },
    {
        "word": "DEFEND",
        "difficulty": 4,
        "definition": "(v.) Resist an attack made on something.",
        "sentence": "Defend your position.",
        "hint": "Protect."
        ,
        "synonyms": ["protect", "guard", "justify"]
    },
    {
        "word": "DEGREE",
        "difficulty": 4,
        "definition": "(n.) An amount, level, or extent; a unit of measurement.",
        "sentence": "A high degree of skill.",
        "hint": "Level."
        ,
        "synonyms": ["level", "amount", "qualification"]
    },
    {
        "word": "DELIBERATE",
        "difficulty": 5,
        "definition": "(adj./v.) Done consciously and intentionally; to think carefully.",
        "sentence": "A deliberate act.",
        "hint": "Intentional."
        ,
        "synonyms": ["intentional", "careful", "consider"]
    },
    {
        "word": "DELIGHT",
        "difficulty": 4,
        "definition": "(n./v.) Great pleasure; to please greatly.",
        "sentence": "To her delight.",
        "hint": "Joy."
        ,
        "synonyms": ["joy", "please", "pleasure"]
    },
    {
        "word": "DELIVER",
        "difficulty": 4,
        "definition": "(v.) Bring and hand over to a proper recipient.",
        "sentence": "Deliver the package.",
        "hint": "Bring."
        ,
        "synonyms": ["bring", "hand-over", "supply"]
    },
    {
        "word": "DEMAND",
        "difficulty": 4,
        "definition": "(n./v.) An insistent and peremptory request; to request insistently.",
        "sentence": "There is a high demand.",
        "hint": "Request."
        ,
        "synonyms": ["require", "request", "insist"]
    },
    {
        "word": "DEPART",
        "difficulty": 5,
        "definition": "(v.) Leave, typically in order to start a journey.",
        "sentences": [
            "Trains depart from platform three.",
            "We will depart at sunrise.",
            "Passengers must depart the aircraft quickly."
        ],
        "hint": "Leave."
        ,
        "synonyms": ["leave", "go", "exit"]
    },
    {
        "word": "DEPOSIT",
        "difficulty": 5,
        "definition": "(n./v.) A sum of money kept in a bank account; to put down.",
        "sentence": "Make a deposit.",
        "hint": "Payment."
        ,
        "synonyms": ["place", "saving", "sediment"]
    },
    {
        "word": "DEPTH",
        "difficulty": 4,
        "definition": "(n.) The distance from the top or surface to the bottom.",
        "sentence": "Check the depth.",
        "hint": "Deepness."
        ,
        "synonyms": ["profundity", "deepness", "intensity"]
    },
    {
        "word": "DESCRIBE",
        "difficulty": 4,
        "tier": 6,
        "definition": "(verb) To give details about something",
        "sentences": [
            "Describe what you saw.",
            "She described the house in detail.",
            "Can you describe the person?"
        ]
        ,
        "synonyms": ["depict", "explain", "portray"]
    },
    {
        "word": "DESERT",
        "difficulty": 4,
        "definition": "(n./v.) An arid area of land; to abandon.",
        "sentence": "The Sahara Desert.",
        "hint": "Arid land."
        ,
        "synonyms": ["abandon", "wasteland", "arid-land"]
    },
    {
        "word": "DESERVE",
        "difficulty": 5,
        "definition": "(v.) Be worthy of or entitled to.",
        "sentence": "You deserve a prize.",
        "hint": "Earn."
        ,
        "synonyms": ["merit", "warrant", "earn"]
    },
    {
        "word": "DESIGN",
        "difficulty": 4,
        "definition": "(n./v.) A plan or drawing produced to show the look; to plan.",
        "sentence": "A new design.",
        "hint": "Plan."
        ,
        "synonyms": ["plan", "create", "layout"]
    },
    {
        "word": "DESIRE",
        "difficulty": 5,
        "definition": "(n./v.) A strong feeling of wanting to have something; to want.",
        "sentence": "A desire for power.",
        "hint": "Want."
        ,
        "synonyms": ["want", "wish", "longing"]
    },
    {
        "word": "DETAILS",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun) Individual items of information; specific particulars of a subject.",
        "sentences": [
            "Pay attention to the details.",
            "She included all the details.",
            "He gave few details."
        ]
        ,
        "synonyms": ["specifics", "particulars", "facts"]
    },
    {
        "word": "DETECT",
        "difficulty": 5,
        "definition": "(v.) Discover or identify the presence or existence of.",
        "sentence": "Detect the error.",
        "hint": "Discover."
        ,
        "synonyms": ["find", "discover", "sense"]
    },
    {
        "word": "DETERMINE",
        "difficulty": 5,
        "definition": "(v.) Cause something to occur in a particular way.",
        "sentence": "Determine the cause.",
        "hint": "Decide."
        ,
        "synonyms": ["decide", "establish", "resolve"]
    },
    {
        "word": "DEVELOP",
        "difficulty": 4,
        "definition": "(v.) Grow or cause to grow and become more mature.",
        "sentence": "Develop a plan.",
        "hint": "Grow."
        ,
        "synonyms": ["grow", "evolve", "advance"]
    },
    {
        "word": "DEVELOPED",
        "difficulty": 4,
        "tier": 6,
        "definition": "(verb / adjective) Grew or progressed over time; brought to a more advanced state.",
        "sentences": [
            "She developed a love for painting.",
            "The plan has developed well.",
            "He developed a useful skill."
        ]
        ,
        "synonyms": ["grown", "advanced", "evolved"]
    },
    {
        "word": "DEVICE",
        "difficulty": 4,
        "definition": "(n.) A thing made or adapted for a particular purpose.",
        "sentence": "A mobile device.",
        "hint": "Gadget."
        ,
        "synonyms": ["tool", "gadget", "instrument"]
    },
    {
        "word": "DEVOTE",
        "difficulty": 5,
        "definition": "(v.) Give all or a large part of one's time.",
        "sentence": "Devote your time.",
        "hint": "Dedicate."
        ,
        "synonyms": ["dedicate", "commit", "give"]
    },
    {
        "word": "DIAMOND",
        "difficulty": 4,
        "definition": "(n./adj.) A precious stone consisting of clear colorless crystalline carbon.",
        "sentence": "A diamond ring.",
        "hint": "Gemstone."
        ,
        "synonyms": ["gem", "shape", "precious-stone"]
    },
    {
        "word": "DIARY",
        "difficulty": 4,
        "definition": "(n.) A book in which one keeps a daily record of events.",
        "sentence": "She wrote in her diary.",
        "hint": "Journal."
        ,
        "synonyms": ["journal", "log", "record"]
    },
    {
        "word": "DICTIONARY",
        "difficulty": 4,
        "tier": 7,
        "definition": "(noun) A book listing words with their meanings",
        "sentences": [
            "She looked it up in the dictionary.",
            "Use a dictionary when you are unsure.",
            "He bought a large dictionary."
        ]
        ,
        "synonyms": ["lexicon", "glossary", "wordbook"]
    },
    {
        "word": "DID",
        "difficulty": 1,
        "tier": 1,
        "definition": "(verb) Performed or completed an action.",
        "sentences": [
            "Did you eat lunch?",
            "She did a great job.",
            "He did not come."
        ]
        ,
        "synonyms": ["performed", "accomplished", "achieved"]
    },
    {
        "word": "DIDN'T",
        "difficulty": 1,
        "tier": 4,
        "definition": "(contraction) Contraction of 'did not'",
        "sentences": [
            "She didn't come yesterday.",
            "I didn't hear you.",
            "He didn't finish his dinner."
        ]
        ,
        "synonyms": ["did-not", "failed-to", "refused-to"]
    },
    {
        "word": "DIED",
        "difficulty": 1,
        "tier": 7,
        "definition": "(verb) Stopped living; ceased to exist as a living being.",
        "sentences": [
            "The plant died without water.",
            "He died peacefully.",
            "She was sad when her fish died."
        ]
        ,
        "synonyms": ["perished", "expired", "perished"]
    },
    {
        "word": "DIFFERENCE",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun) A way in which things are unlike",
        "sentences": [
            "What is the difference?",
            "She made a real difference.",
            "There is a big difference between the two."
        ]
        ,
        "synonyms": ["distinction", "variation", "contrast"]
    },
    {
        "word": "DIFFERENT",
        "difficulty": 1,
        "tier": 2,
        "definition": "(adjective) Not the same as another; unlike",
        "sentences": [
            "We have very different opinions.",
            "She wore a different hat each day.",
            "That is a different story."
        ]
        ,
        "synonyms": ["distinct", "unlike", "varied"]
    },
    {
        "word": "DIFFICULT",
        "difficulty": 4,
        "tier": 10,
        "definition": "(adjective) Not easy; hard to do",
        "sentences": [
            "The climb was difficult.",
            "She found it difficult to decide.",
            "He faced a difficult problem."
        ]
        ,
        "synonyms": ["hard", "challenging", "taxing"]
    },
    {
        "word": "DIGEST",
        "difficulty": 5,
        "definition": "(v./n.) Breakdown food in the stomach; a compilation of information.",
        "sentence": "Digest your food.",
        "hint": "Process."
        ,
        "synonyms": ["absorb", "process", "summarize"]
    },
    {
        "word": "DIGITAL",
        "difficulty": 5,
        "definition": "(adj.) Using or expressed as numerical values, especially binary code; relating to electronic technology.",
        "sentence": "A digital clock.",
        "hint": "Electronic."
        ,
        "synonyms": ["electronic", "online", "numeric"]
    },
    {
        "word": "DILIGENT",
        "difficulty": 5,
        "definition": "(adj.) Showing care and conscientiousness.",
        "sentence": "He was a diligent student.",
        "hint": "Hardworking."
        ,
        "synonyms": ["hardworking", "industrious", "thorough"]
    },
    {
        "word": "DINOSAUR",
        "difficulty": 4,
        "definition": "(n.) A fossil reptile of the Mesozoic era.",
        "sentence": "The dinosaur was huge.",
        "hint": "Ancient reptile."
        ,
        "synonyms": ["prehistoric-creature", "fossil-animal", "reptile"]
    },
    {
        "word": "DIRECT",
        "difficulty": 4,
        "definition": "(adj./v./adv.) Extending or moving from one place to another; to manage.",
        "sentence": "A direct route.",
        "hint": "Straight."
        ,
        "synonyms": ["straight", "guide", "manage"]
    },
    {
        "word": "DIRECTION",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun) The path along which something moves",
        "sentences": [
            "She walked in the right direction.",
            "He gave clear directions.",
            "Which direction is north?"
        ]
        ,
        "synonyms": ["way", "course", "guidance"]
    },
    {
        "word": "DISASTER",
        "difficulty": 5,
        "definition": "(n.) A sudden event that causes great damage.",
        "sentence": "A natural disaster.",
        "hint": "Catastrophe."
        ,
        "synonyms": ["catastrophe", "calamity", "crisis"]
    },
    {
        "word": "DISCARD",
        "difficulty": 5,
        "definition": "(v./n.) Get rid of someone or something as no longer useful.",
        "sentence": "Discard the trash.",
        "hint": "Reject."
        ,
        "synonyms": ["throw-away", "abandon", "dispose"]
    },
    {
        "word": "DISCOVER",
        "difficulty": 4,
        "definition": "(v.) Find unexpectedly or during a search.",
        "sentence": "Discover the truth.",
        "hint": "Find."
        ,
        "synonyms": ["find", "uncover", "learn"]
    },
    {
        "word": "DISCOVERED",
        "difficulty": 4,
        "tier": 6,
        "definition": "(verb) Found or became aware of something previously unknown.",
        "sentences": [
            "She discovered a new route.",
            "He discovered a passion for art.",
            "They discovered an old map."
        ]
        ,
        "synonyms": ["found", "uncovered", "revealed"]
    },
    {
        "word": "DISEASE",
        "difficulty": 4,
        "definition": "(n.) A disorder of structure or function in a human.",
        "sentence": "A rare disease.",
        "hint": "Illness."
        ,
        "synonyms": ["illness", "sickness", "ailment"]
    },
    {
        "word": "DISKETTE",
        "difficulty": 5,
        "definition": "(n.) A flexible removable magnetic disk.",
        "sentence": "Save it on a diskette.",
        "hint": "Floppy disk."
        ,
        "synonyms": ["floppy-disk", "disk", "storage-medium"]
    },
    {
        "word": "DISMISS",
        "difficulty": 5,
        "definition": "(v.) Order or allow to leave; send away.",
        "sentence": "Dismiss the class.",
        "hint": "Reject."
        ,
        "synonyms": ["disregard", "fire", "reject"]
    },
    {
        "word": "DISPLAY",
        "difficulty": 4,
        "definition": "(v./n.) Put something in a prominent place; an exhibition.",
        "sentence": "Display the flags.",
        "hint": "Show."
        ,
        "synonyms": ["show", "exhibit", "present"]
    },
    {
        "word": "DISTANCE",
        "difficulty": 4,
        "definition": "(n./v.) An amount of space between two things; to separate.",
        "sentence": "The distance is great.",
        "hint": "Space."
        ,
        "synonyms": ["gap", "space", "length"]
    },
    {
        "word": "DISTINCT",
        "difficulty": 5,
        "definition": "(adj.) Recognizably different in nature from something else.",
        "sentence": "A distinct smell.",
        "hint": "Clear."
        ,
        "synonyms": ["different", "clear", "separate"]
    },
    {
        "word": "DISTRICT",
        "difficulty": 5,
        "definition": "(n.) An area of a country or city.",
        "sentence": "A shopping district.",
        "hint": "Area."
        ,
        "synonyms": ["area", "region", "zone"]
    },
    {
        "word": "DIVIDE",
        "difficulty": 4,
        "definition": "(v./n.) Separate or be separated into parts; a disagreement.",
        "sentence": "Divide the cake.",
        "hint": "Split."
        ,
        "synonyms": ["split", "separate", "partition"]
    },
    {
        "word": "DIVIDED",
        "difficulty": 4,
        "tier": 6,
        "definition": "(verb / adjective) Split into separate portions; shared out among multiple parties.",
        "sentences": [
            "She divided the cake equally.",
            "The class was divided into two teams.",
            "The country was divided."
        ]
        ,
        "synonyms": ["split", "separated", "partitioned"]
    },
    {
        "word": "DIVISION",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun) The process of splitting into separate parts; a distinct group within a larger organization.",
        "sentences": [
            "She is good at division.",
            "He led a division of soldiers.",
            "The company has a sales division."
        ]
        ,
        "synonyms": ["split", "section", "department"]
    },
    {
        "word": "DOCTOR",
        "difficulty": 1,
        "definition": "(n./v.) A person who is qualified to treat people who are ill; to falsify.",
        "sentence": "See a doctor.",
        "hint": "Physician."
        ,
        "synonyms": ["physician", "healer", "MD"]
    },
    {
        "word": "DOES",
        "difficulty": 1,
        "tier": 2,
        "definition": "(verb) Performs or carries out an action; used with he, she, or it.",
        "sentences": [
            "She does her homework every night.",
            "Does he know you?",
            "It does not matter."
        ]
        ,
        "synonyms": ["performs", "acts", "accomplishes"]
    },
    {
        "word": "DOESN'T",
        "difficulty": 1,
        "tier": 10,
        "definition": "(contraction) Contraction of 'does not'",
        "sentences": [
            "She doesn't like onions.",
            "He doesn't know.",
            "It doesn't matter."
        ]
        ,
        "synonyms": ["does-not", "fails-to", "won't"]
    },
    {
        "word": "DOG",
        "difficulty": 1,
        "tier": 4,
        "definition": "(noun) A common domesticated animal kept as a pet",
        "sentences": [
            "She has a friendly dog.",
            "The dog barked loudly.",
            "He walked his dog every morning."
        ]
        ,
        "synonyms": ["canine", "hound", "pup"]
    },
    {
        "word": "DOLLAR",
        "difficulty": 1,
        "definition": "(n.) The basic monetary unit of the US.",
        "sentence": "It costs one dollar.",
        "hint": "Currency."
        ,
        "synonyms": ["currency", "buck", "bill"]
    },
    {
        "word": "DOLLARS",
        "difficulty": 1,
        "tier": 9,
        "definition": "(noun) The standard monetary units of the United States and several other countries.",
        "sentences": [
            "She earned fifty dollars.",
            "He had a few dollars left.",
            "The toy cost ten dollars."
        ]
        ,
        "synonyms": ["money", "currency", "funds"]
    },
    {
        "word": "DOLPHIN",
        "difficulty": 4,
        "definition": "(n.) A small gregarious toothed whale.",
        "sentence": "The dolphin jumped.",
        "hint": "Sea mammal."
        ,
        "synonyms": ["porpoise", "marine-mammal", "sea-creature"]
    },
    {
        "word": "DOMESTIC",
        "difficulty": 5,
        "definition": "(adj./n.) Relating to the running of a home; a servant.",
        "sentence": "A domestic animal.",
        "hint": "Houshold."
        ,
        "synonyms": ["household", "tame", "national"]
    },
    {
        "word": "DON'T",
        "difficulty": 1,
        "tier": 3,
        "definition": "(contraction) Contraction of 'do not'",
        "sentences": [
            "Don't forget your lunch.",
            "I don't like spicy food.",
            "Don't run inside."
        ]
        ,
        "synonyms": ["do-not", "won't", "refuse-to"]
    },
    {
        "word": "DONE",
        "difficulty": 1,
        "tier": 4,
        "definition": "(adjective / verb) Finished or completed; no longer in progress.",
        "sentences": [
            "Are you done yet?",
            "She has done all the work.",
            "Well done!"
        ]
        ,
        "synonyms": ["finished", "completed", "accomplished"]
    },
    {
        "word": "DOOR",
        "difficulty": 1,
        "tier": 4,
        "definition": "(noun) A movable barrier used to close an opening",
        "sentences": [
            "She knocked on the door.",
            "Close the door behind you.",
            "He held the door open for her."
        ]
        ,
        "synonyms": ["entrance", "exit", "portal"]
    },
    {
        "word": "DOWN",
        "difficulty": 1,
        "tier": 1,
        "definition": "(adverb / preposition) Toward a lower position",
        "sentences": [
            "The ball rolled down the hill.",
            "Sit down, please.",
            "She looked down at her feet."
        ]
        ,
        "synonyms": ["below", "decline", "lower"]
    },
    {
        "word": "DRAGON",
        "difficulty": 4,
        "definition": "(n.) A mythical monster like a giant reptile.",
        "sentence": "The dragon breathed fire.",
        "hint": "Mythical beast."
        ,
        "synonyms": ["beast", "mythical-creature", "serpent"]
    },
    {
        "word": "DRAW",
        "difficulty": 1,
        "tier": 4,
        "definition": "(verb / noun) To make a picture with a pencil; a tie in a game",
        "sentences": [
            "She loves to draw animals.",
            "The match ended in a draw.",
            "He drew a map of the village."
        ]
        ,
        "synonyms": ["sketch", "attract", "tie"]
    },
    {
        "word": "DRAWING",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun / verb) A picture made with a pencil; making a picture",
        "sentences": [
            "She showed me her drawing.",
            "He was drawing a map.",
            "The drawing was very detailed."
        ]
        ,
        "synonyms": ["sketch", "illustration", "picture"]
    },
    {
        "word": "DREAM",
        "difficulty": 1,
        "definition": "(n./v.) A series of thoughts occurring in a person's sleep; to imagine.",
        "sentence": "I had a dream.",
        "hint": "Vision."
        ,
        "synonyms": ["vision", "aspire", "reverie"]
    },
    {
        "word": "DRESS",
        "difficulty": 1,
        "definition": "(n./v.) A one-piece garment for a woman; to clothe.",
        "sentence": "She wore a blue dress.",
        "hint": "Gown."
        ,
        "synonyms": ["gown", "attire", "clothe"]
    },
    {
        "word": "DRIFT",
        "difficulty": 5,
        "definition": "(v./n.) Be carried slowly by a current of air or water; a slow move.",
        "sentences": [
            "Clouds drift slowly across the sky.",
            "Boats drift when there is no wind.",
            "You may drift off to sleep if you are very tired."
        ],
        "hint": "Float."
        ,
        "synonyms": ["float", "wander", "current"]
    },
    {
        "word": "DRIVE",
        "difficulty": 1,
        "tier": 6,
        "definition": "(verb / noun) To operate a vehicle; a journey by car",
        "sentences": [
            "She drives to work.",
            "It is a short drive.",
            "He drove carefully in the snow."
        ]
        ,
        "synonyms": ["motivate", "operate", "propel"]
    },
    {
        "word": "DROP",
        "difficulty": 1,
        "tier": 6,
        "definition": "(verb / noun) To fall; a small amount of liquid",
        "sentences": [
            "She dropped her pen.",
            "A drop of rain fell.",
            "Don't drop the plates!"
        ]
        ,
        "synonyms": ["fall", "decrease", "let-fall"]
    },
    {
        "word": "DRY",
        "difficulty": 1,
        "tier": 5,
        "definition": "(adjective / verb) Without water; to remove moisture",
        "sentences": [
            "Dry your hands.",
            "The ground is very dry.",
            "She left the dishes to dry."
        ]
        ,
        "synonyms": ["arid", "desiccated", "not-wet"]
    },
    {
        "word": "DURING",
        "difficulty": 1,
        "definition": "(prep.) Throughout the course or duration of.",
        "sentence": "During the day.",
        "hint": "Throughout."
        ,
        "synonyms": ["throughout", "in-the-course-of", "while"]
    },
    {
        "word": "DYNASTY",
        "difficulty": 5,
        "definition": "(n.) A line of hereditary rulers of a country.",
        "sentence": "The Ming dynasty.",
        "hint": "Lineage."
        ,
        "synonyms": ["lineage", "ruling-family", "era"]
    },
    {
        "word": "EACH",
        "difficulty": 1,
        "tier": 1,
        "definition": "(adjective / pronoun) Every one of two or more people or things",
        "sentences": [
            "Each child got a prize.",
            "She gave each one a hug.",
            "Each day is different."
        ]
        ,
        "synonyms": ["every", "apiece", "individual"]
    },
    {
        "word": "EAGER",
        "difficulty": 4,
        "definition": "(adj.) Wanting to do or have something very much.",
        "sentence": "He was eager to learn.",
        "hint": "Keen."
        ,
        "synonyms": ["enthusiastic", "keen", "ready"]
    },
    {
        "word": "EARLY",
        "difficulty": 1,
        "definition": "(adj./adv.) Happening before the usual or expected time.",
        "sentence": "An early start.",
        "hint": "Soon."
        ,
        "synonyms": ["soon", "before-time", "initial"]
    },
    {
        "word": "EARS",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun) The organs on the sides of the head used for hearing.",
        "sentences": [
            "She covered her ears.",
            "The dog's ears perked up.",
            "He has sharp ears."
        ]
        ,
        "synonyms": ["hearing-organs", "auricles", "lobes"]
    },
    {
        "word": "EARTH",
        "difficulty": 1,
        "definition": "(n./v.) The planet on which we live; to connect to ground.",
        "sentence": "The Earth is round.",
        "hint": "Planet."
        ,
        "synonyms": ["ground", "soil", "planet"]
    },
    {
        "word": "EAST",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun / adjective) The direction of sunrise; opposite of west",
        "sentences": [
            "She traveled east.",
            "The east wind was cold.",
            "They drove east all day."
        ]
        ,
        "synonyms": ["orient", "sunrise-direction", "eastern"]
    },
    {
        "word": "EASY",
        "difficulty": 1,
        "definition": "(adj./adv.) Achieved without great effort.",
        "sentence": "An easy task.",
        "hint": "Simple."
        ,
        "synonyms": ["simple", "effortless", "uncomplicated"]
    },
    {
        "word": "EAT",
        "difficulty": 1,
        "tier": 3,
        "definition": "(verb) To put food in the mouth and swallow",
        "sentences": [
            "She eats fruit for breakfast.",
            "Let's eat dinner.",
            "The dog eats twice a day."
        ]
        ,
        "synonyms": ["consume", "devour", "dine"]
    },
    {
        "word": "ECHO",
        "difficulty": 4,
        "definition": "(n.) A repetition of a sound caused by reflection.",
        "sentence": "Hear the echo.",
        "hint": "Resonance."
        ,
        "synonyms": ["reverberate", "reflect", "repeat"]
    },
    {
        "word": "EDGE",
        "difficulty": 1,
        "definition": "(n./v.) The outside limit of an object; to move slowly.",
        "sentence": "Stand on the edge.",
        "hint": "Border."
        ,
        "synonyms": ["border", "rim", "side"]
    },
    {
        "word": "EDITOR",
        "difficulty": 5,
        "definition": "(n.) A person who is in charge of and determines the final content.",
        "sentence": "The newspaper editor.",
        "hint": "Reviewer."
        ,
        "synonyms": ["publisher", "reviser", "director"]
    },
    {
        "word": "EFFECT",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun / verb) A result or change caused by something; to bring about",
        "sentences": [
            "The medicine had a good effect.",
            "She effected a great change.",
            "What is the effect of the change?"
        ]
        ,
        "synonyms": ["result", "outcome", "impact"]
    },
    {
        "word": "EFFORT",
        "difficulty": 4,
        "definition": "(n.) A vigorous or determined attempt.",
        "sentence": "It took a lot of effort.",
        "hint": "Try."
        ,
        "synonyms": ["attempt", "exertion", "work"]
    },
    {
        "word": "EGGS",
        "difficulty": 1,
        "tier": 6,
        "definition": "(noun) Oval objects laid by birds",
        "sentences": [
            "She found three eggs in the nest.",
            "He scrambled some eggs.",
            "The eggs were painted for Easter."
        ]
        ,
        "synonyms": ["ova", "embryos", "breakfast-food"]
    },
    {
        "word": "EIGHT",
        "difficulty": 1,
        "definition": "(num.) The number equivalent to the product of two and four.",
        "sentence": "There are eight books.",
        "hint": "Number."
        ,
        "synonyms": ["8", "octet", "numeral"]
    },
    {
        "word": "EIGHTEEN",
        "difficulty": 4,
        "definition": "(num.) The number equivalent to the product of two and nine.",
        "sentence": "He is eighteen.",
        "hint": "Number."
        ,
        "synonyms": ["18", "teen-number", "numeral"]
    },
    {
        "word": "EITHER",
        "difficulty": 4,
        "definition": "(adv./pron./adj.) Used before the first of two alternatives.",
        "sentence": "Either one is fine.",
        "hint": "One or other."
        ,
        "synonyms": ["one-or-other", "each", "both"]
    },
    {
        "word": "ELBOW",
        "difficulty": 1,
        "definition": "(n./v.) The joint between the forearm and the upper arm; to push.",
        "sentence": "He bumped his elbow.",
        "hint": "Joint."
        ,
        "synonyms": ["joint", "arm-bend", "nudge"]
    },
    {
        "word": "ELDERLY",
        "difficulty": 4,
        "definition": "(adj./n.) Old or aging; old people.",
        "sentence": "Respect the elderly.",
        "hint": "Old."
        ,
        "synonyms": ["aged", "senior", "old"]
    },
    {
        "word": "ELECTRIC",
        "difficulty": 4,
        "tier": 8,
        "definition": "(adjective) Powered by or producing a flow of charged particles; thrillingly exciting.",
        "sentences": [
            "She drives an electric car.",
            "The electric fan whirred.",
            "He fixed the electric heater."
        ]
        ,
        "synonyms": ["electrical", "powered", "energized"]
    },
    {
        "word": "ELEGANT",
        "difficulty": 5,
        "definition": "(adj.) Pleasingly graceful and stylish in appearance.",
        "sentence": "An elegant dress.",
        "hint": "Graceful."
        ,
        "synonyms": ["graceful", "refined", "stylish"]
    },
    {
        "word": "ELEMENT",
        "difficulty": 5,
        "definition": "(n.) A part or aspect of something abstract.",
        "sentence": "The element of surprise.",
        "hint": "Part."
        ,
        "synonyms": ["component", "atom", "part"]
    },
    {
        "word": "ELEMENTS",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) Pure chemical substances that cannot be broken down further; fundamental components of something.",
        "sentences": [
            "She studied the elements.",
            "Air and water are key elements.",
            "He included all the key elements."
        ]
        ,
        "synonyms": ["components", "basics", "essentials"]
    },
    {
        "word": "ELSE",
        "difficulty": 1,
        "tier": 8,
        "definition": "(adjective / adverb) Other; in addition; instead",
        "sentences": [
            "Is anyone else coming?",
            "What else do you need?",
            "Let's try something else."
        ]
        ,
        "synonyms": ["otherwise", "different", "additionally"]
    },
    {
        "word": "EMPATHY",
        "difficulty": 5,
        "definition": "(n.) Understand and share feelings.",
        "sentence": "He felt empathy for his friend.",
        "hint": "Understanding."
        ,
        "synonyms": ["compassion", "understanding", "sympathy"]
    },
    {
        "word": "END",
        "difficulty": 1,
        "tier": 2,
        "definition": "(noun / verb) The final point; to finish",
        "sentences": [
            "The end of the book surprised me.",
            "The road ends here.",
            "She waited until the very end."
        ]
        ,
        "synonyms": ["finish", "conclusion", "stop"]
    },
    {
        "word": "ENERGY",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun) The ability to do work; vitality",
        "sentences": [
            "She has so much energy!",
            "Food gives us energy.",
            "Solar panels turn sunlight into energy."
        ]
        ,
        "synonyms": ["power", "vitality", "force"]
    },
    {
        "word": "ENGINE",
        "difficulty": 4,
        "tier": 8,
        "definition": "(noun) A machine that produces power",
        "sentences": [
            "The engine made a loud noise.",
            "She checked the car engine.",
            "A steam engine powered the old train."
        ]
        ,
        "synonyms": ["motor", "machine", "power-unit"]
    },
    {
        "word": "ENGLAND",
        "difficulty": 4,
        "tier": 8,
        "definition": "(noun) A country forming the southern part of Great Britain",
        "sentences": [
            "She was born in England.",
            "England is known for its rain.",
            "He supports the England football team."
        ]
        ,
        "synonyms": ["Britain", "UK", "English-nation"]
    },
    {
        "word": "ENGLISH",
        "difficulty": 1,
        "tier": 4,
        "definition": "(adjective / noun) Relating to England; the language spoken in England",
        "sentences": [
            "She speaks English very well.",
            "He is studying English literature.",
            "English is spoken in many countries."
        ]
        ,
        "synonyms": ["British", "language", "Anglo"]
    },
    {
        "word": "ENJOY",
        "difficulty": 1,
        "tier": 9,
        "definition": "(verb) To take pleasure in",
        "sentences": [
            "She enjoys reading.",
            "I hope you enjoy the show.",
            "He enjoyed every moment."
        ]
        ,
        "synonyms": ["relish", "delight-in", "appreciate"]
    },
    {
        "word": "ENOUGH",
        "difficulty": 1,
        "tier": 3,
        "definition": "(adjective / adverb) As much as is needed; sufficiently",
        "sentences": [
            "Have you had enough to eat?",
            "She was tired enough to sleep.",
            "That is enough noise!"
        ]
        ,
        "synonyms": ["sufficient", "adequate", "ample"]
    },
    {
        "word": "ENTERED",
        "difficulty": 1,
        "tier": 9,
        "definition": "(verb) Went or came into a place; began to take part in something.",
        "sentences": [
            "She entered the room.",
            "He entered the competition.",
            "They entered quietly."
        ]
        ,
        "synonyms": ["came-in", "walked-in", "joined"]
    },
    {
        "word": "ENTIRE",
        "difficulty": 4,
        "tier": 10,
        "definition": "(adjective) Whole; complete",
        "sentences": [
            "She ate the entire cake.",
            "The entire class passed.",
            "He slept the entire afternoon."
        ]
        ,
        "synonyms": ["whole", "complete", "total"]
    },
    {
        "word": "EQUAL",
        "difficulty": 4,
        "tier": 8,
        "definition": "(adjective / verb) The same in value; to be the same as",
        "sentences": [
            "All children are equal.",
            "Two plus two equals four.",
            "She shared the cake in equal parts."
        ]
        ,
        "synonyms": ["same", "even", "fair"]
    },
    {
        "word": "EQUATION",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun) A mathematical statement showing that two expressions have the same value.",
        "sentences": [
            "She solved the equation.",
            "An equation has two equal sides.",
            "Write an equation for the problem."
        ]
        ,
        "synonyms": ["formula", "expression", "balance"]
    },
    {
        "word": "ESPECIALLY",
        "difficulty": 4,
        "tier": 10,
        "definition": "(adverb) Particularly; more than usual",
        "sentences": [
            "She loves animals, especially dogs.",
            "I love autumn, especially the colors.",
            "He is especially good at maths."
        ]
        ,
        "synonyms": ["particularly", "specifically", "above-all"]
    },
    {
        "word": "EUROPE",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun) A continent located west of Asia",
        "sentences": [
            "She traveled across Europe.",
            "France is in Europe.",
            "Europe has many historic cities."
        ]
        ,
        "synonyms": ["continent", "Western-world", "EU"]
    },
    {
        "word": "EVEN",
        "difficulty": 1,
        "tier": 2,
        "definition": "(adverb / adjective) Used for emphasis; level and flat",
        "sentences": [
            "She didn't even flinch.",
            "The floor is not even.",
            "Even a child could do it."
        ]
        ,
        "synonyms": ["flat", "equal", "still"]
    },
    {
        "word": "EVENING",
        "difficulty": 1,
        "tier": 10,
        "definition": "(noun) The time of day between afternoon and night",
        "sentences": [
            "She called in the evening.",
            "They went for a walk in the evening.",
            "Good evening!"
        ]
        ,
        "synonyms": ["dusk", "nightfall", "eventide"]
    },
    {
        "word": "EVER",
        "difficulty": 1,
        "tier": 4,
        "definition": "(adverb) At any time; always",
        "sentences": [
            "Have you ever been to France?",
            "She is the best I have ever seen.",
            "Don't ever give up."
        ]
        ,
        "synonyms": ["always", "at-any-time", "constantly"]
    },
    {
        "word": "EVERY",
        "difficulty": 1,
        "tier": 2,
        "definition": "(adjective) Each one of a group without exception",
        "sentences": [
            "She reads every day.",
            "Every student got a prize.",
            "He knows every word of the song."
        ]
        ,
        "synonyms": ["each", "all", "any"]
    },
    {
        "word": "EVERYONE",
        "difficulty": 1,
        "tier": 7,
        "definition": "(pronoun) Each and every person in a group without exception.",
        "sentences": [
            "She said hello to everyone.",
            "Everyone is welcome.",
            "He made everyone laugh."
        ]
        ,
        "synonyms": ["everybody", "all-people", "each-person"]
    },
    {
        "word": "EVERYTHING",
        "difficulty": 1,
        "tier": 7,
        "definition": "(pronoun) All things; all that exists",
        "sentences": [
            "She remembered everything.",
            "Everything was in order.",
            "He gave everything he had."
        ]
        ,
        "synonyms": ["all", "the-lot", "entirety"]
    },
    {
        "word": "EXACTLY",
        "difficulty": 4,
        "tier": 7,
        "definition": "(adverb) Precisely; in every detail",
        "sentences": [
            "That is exactly what I meant.",
            "She arrived at exactly noon.",
            "He followed the rules exactly."
        ]
        ,
        "synonyms": ["precisely", "correctly", "accurately"]
    },
    {
        "word": "EXAMPLE",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) A typical instance used to illustrate something",
        "sentences": [
            "Can you give me an example?",
            "She sets a great example.",
            "Here is an example of the rule."
        ]
        ,
        "synonyms": ["instance", "case", "model"]
    },
    {
        "word": "EXCEPT",
        "difficulty": 1,
        "tier": 9,
        "definition": "(preposition / conjunction) Not including; other than",
        "sentences": [
            "Everyone came except Tom.",
            "She ate everything except the carrots.",
            "It was perfect, except for the weather."
        ]
        ,
        "synonyms": ["apart-from", "excluding", "save"]
    },
    {
        "word": "EXCITING",
        "difficulty": 4,
        "tier": 9,
        "definition": "(adjective) Causing enthusiasm or eagerness",
        "sentences": [
            "The match was so exciting!",
            "She found the trip very exciting.",
            "He told an exciting story."
        ]
        ,
        "synonyms": ["thrilling", "exhilarating", "stimulating"]
    },
    {
        "word": "EXERCISE",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun / verb) Physical activity; to do physical activity",
        "sentences": [
            "Daily exercise keeps you fit.",
            "She exercised every morning.",
            "Running is great exercise."
        ]
        ,
        "synonyms": ["use", "practice", "exert"]
    },
    {
        "word": "EXPECT",
        "difficulty": 4,
        "tier": 9,
        "definition": "(verb) To think something will happen",
        "sentences": [
            "I expect she'll be late.",
            "She expects too much.",
            "He expected a reply."
        ]
        ,
        "synonyms": ["anticipate", "await", "assume"]
    },
    {
        "word": "EXPERIENCE",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun / verb) Knowledge gained from doing things; to go through",
        "sentences": [
            "She has a lot of experience.",
            "He experienced great joy.",
            "That was an amazing experience."
        ]
        ,
        "synonyms": ["encounter", "knowledge", "involvement"]
    },
    {
        "word": "EXPERIMENT",
        "difficulty": 5,
        "tier": 8,
        "definition": "(noun / verb) A test to discover something; to test",
        "sentences": [
            "They did an experiment.",
            "She experimented with new recipes.",
            "The experiment was a great success."
        ]
        ,
        "synonyms": ["test", "trial", "investigation"]
    },
    {
        "word": "EXPLAIN",
        "difficulty": 4,
        "tier": 5,
        "definition": "(verb) To make something clear; to give reasons for",
        "sentences": [
            "Can you explain that again?",
            "She explained the rules.",
            "He explained why he was late."
        ]
        ,
        "synonyms": ["clarify", "describe", "elaborate"]
    },
    {
        "word": "EXPRESS",
        "difficulty": 4,
        "tier": 8,
        "definition": "(verb / adjective) To put thoughts into words; fast and direct",
        "sentences": [
            "She expressed her thanks.",
            "He took the express train.",
            "It is hard to express feelings."
        ]
        ,
        "synonyms": ["state", "convey", "utter"]
    },
    {
        "word": "EYES",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) Organs of sight",
        "sentences": [
            "She has bright blue eyes.",
            "He rubbed his eyes.",
            "The cat's eyes glowed in the dark."
        ]
        ,
        "synonyms": ["sight-organs", "pupils", "vision"]
    },
    {
        "word": "FACE",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun / verb) The front of the head; to turn toward",
        "sentences": [
            "She washed her face.",
            "He faced the crowd bravely.",
            "A smile spread across her face."
        ]
        ,
        "synonyms": ["visage", "front", "confront"]
    },
    {
        "word": "FACT",
        "difficulty": 1,
        "tier": 5,
        "definition": "(noun) A thing that is known to be true",
        "sentences": [
            "That is an interesting fact.",
            "She checked the facts before writing.",
            "The fact is, we need more time."
        ]
        ,
        "synonyms": ["truth", "reality", "certainty"]
    },
    {
        "word": "FACTORIES",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun) Large buildings where products are manufactured, typically using machinery.",
        "sentences": [
            "The town has several factories.",
            "She worked in one of the factories.",
            "Factories make many products."
        ]
        ,
        "synonyms": ["plants", "works", "manufacturing-facilities"]
    },
    {
        "word": "FACTORS",
        "difficulty": 4,
        "tier": 7,
        "definition": "(noun) Elements or circumstances that contribute to bringing about a result.",
        "sentences": [
            "Several factors were involved.",
            "She considered all the factors.",
            "Weather is one of the factors."
        ]
        ,
        "synonyms": ["elements", "influences", "components"]
    },
    {
        "word": "FAIR",
        "difficulty": 1,
        "tier": 10,
        "definition": "(adjective / noun) Just and reasonable; an outdoor event",
        "sentences": [
            "She plays fair.",
            "They went to the summer fair.",
            "That is not fair!"
        ]
        ,
        "synonyms": ["just", "equal", "light"]
    },
    {
        "word": "FALL",
        "difficulty": 1,
        "tier": 4,
        "definition": "(verb / noun) To drop downward; autumn season",
        "sentences": [
            "Be careful not to fall.",
            "The leaves fall in autumn.",
            "She caught him before he could fall."
        ]
        ,
        "synonyms": ["descend", "autumn", "drop"]
    },
    {
        "word": "FAMILY",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) A group of related people, usually parents and children",
        "sentences": [
            "She loves her family.",
            "They spent time with family over the holidays.",
            "He comes from a big family."
        ]
        ,
        "synonyms": ["relatives", "kin", "household"]
    },
    {
        "word": "FAMOUS",
        "difficulty": 1,
        "tier": 9,
        "definition": "(adjective) Well known by many people",
        "sentences": [
            "She is a famous singer.",
            "He visited a famous landmark.",
            "The town is famous for its cheese."
        ]
        ,
        "synonyms": ["well-known", "celebrated", "renowned"]
    },
    {
        "word": "FAR",
        "difficulty": 1,
        "tier": 3,
        "definition": "(adverb / adjective) At a great distance; remote",
        "sentences": [
            "The store is not far.",
            "She traveled far from home.",
            "How far is it to the beach?"
        ]
        ,
        "synonyms": ["distant", "remote", "away"]
    },
    {
        "word": "FARM",
        "difficulty": 1,
        "tier": 4,
        "definition": "(noun / verb) Land used for growing crops or raising animals; to cultivate land",
        "sentences": [
            "She grew up on a farm.",
            "He farms wheat and barley.",
            "The farm has chickens and cows."
        ]
        ,
        "synonyms": ["ranch", "estate", "homestead"]
    },
    {
        "word": "FARMERS",
        "difficulty": 1,
        "tier": 6,
        "definition": "(noun) People who cultivate land or raise livestock for a living.",
        "sentences": [
            "Farmers wake up very early.",
            "The farmers harvested the crops.",
            "She spoke to local farmers."
        ]
        ,
        "synonyms": ["growers", "cultivators", "agriculturalists"]
    },
    {
        "word": "FAST",
        "difficulty": 1,
        "tier": 4,
        "definition": "(adjective / adverb) Moving quickly; with speed",
        "sentences": [
            "She is a fast runner.",
            "He drove too fast.",
            "The river flows fast here."
        ]
        ,
        "synonyms": ["quick", "rapid", "swift"]
    },
    {
        "word": "FATHER",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) A male parent",
        "sentences": [
            "Her father taught her to drive.",
            "My father makes great soup.",
            "The father carried his child on his back."
        ]
        ,
        "synonyms": ["dad", "patriarch", "sire"]
    },
    {
        "word": "FEAR",
        "difficulty": 1,
        "tier": 10,
        "definition": "(noun / verb) A feeling of worry about danger; to be afraid of",
        "sentences": [
            "She hid her fear well.",
            "He fears no one.",
            "Fear can hold you back."
        ]
        ,
        "synonyms": ["terror", "dread", "fright"]
    },
    {
        "word": "FEEL",
        "difficulty": 1,
        "tier": 5,
        "definition": "(verb) To experience through touch or emotion",
        "sentences": [
            "How do you feel?",
            "She felt the soft fabric.",
            "I feel very tired today."
        ]
        ,
        "synonyms": ["sense", "touch", "perceive"]
    },
    {
        "word": "FEELING",
        "difficulty": 1,
        "tier": 8,
        "definition": "(noun / verb) An emotional state or reaction; the act of sensing something by touch.",
        "sentences": [
            "She had a strange feeling.",
            "He was feeling tired.",
            "I have a good feeling about this."
        ]
        ,
        "synonyms": ["emotion", "sensation", "sense"]
    },
    {
        "word": "FEET",
        "difficulty": 1,
        "tier": 3,
        "definition": "(noun) The body parts at the end of the legs used for standing and walking.",
        "sentences": [
            "She has wet feet.",
            "The path was ten feet wide.",
            "His feet were sore from walking."
        ]
        ,
        "synonyms": ["tootsies", "paws", "foot"]
    },
    {
        "word": "FELL",
        "difficulty": 1,
        "tier": 8,
        "definition": "(verb) Dropped downward under the force of gravity.",
        "sentences": [
            "She fell off her bike.",
            "He fell asleep quickly.",
            "Leaves fell from the tree."
        ]
        ,
        "synonyms": ["dropped", "fell-down", "tumbled"]
    },
    {
        "word": "FELT",
        "difficulty": 1,
        "tier": 6,
        "definition": "(verb) Experienced a physical sensation or emotion.",
        "sentences": [
            "She felt the cold wind.",
            "He felt very proud.",
            "The fabric felt very soft."
        ]
        ,
        "synonyms": ["sensed", "experienced", "touched"]
    },
    {
        "word": "FEW",
        "difficulty": 1,
        "tier": 3,
        "definition": "(adjective / pronoun) A small number of",
        "sentences": [
            "She has a few close friends.",
            "Only a few people came.",
            "He said a few words."
        ]
        ,
        "synonyms": ["several", "not-many", "limited"]
    },
    {
        "word": "FIELD",
        "difficulty": 1,
        "tier": 4,
        "definition": "(noun) An open area of land; a subject of study",
        "sentences": [
            "The cows grazed in the field.",
            "She is an expert in her field.",
            "He ran across the open field."
        ]
        ,
        "synonyms": ["meadow", "domain", "area"]
    },
    {
        "word": "FIG",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun) A soft sweet fruit; a figure or illustration",
        "sentences": [
            "She ate a ripe fig.",
            "See fig. three for details.",
            "He had never tried a fig before."
        ]
        ,
        "synonyms": ["fruit", "tree-fruit", "dried-fruit"]
    },
    {
        "word": "FIGHT",
        "difficulty": 1,
        "tier": 7,
        "definition": "(verb / noun) To struggle against; a battle or conflict",
        "sentences": [
            "They fought over the last biscuit.",
            "Don't start a fight.",
            "She fought hard for her rights."
        ]
        ,
        "synonyms": ["battle", "conflict", "struggle"]
    },
    {
        "word": "FIGURE",
        "difficulty": 4,
        "tier": 4,
        "definition": "(noun / verb) A shape or form; to calculate or understand",
        "sentences": [
            "She drew a stick figure.",
            "I can't figure it out.",
            "The figure in the distance was tall."
        ]
        ,
        "synonyms": ["number", "shape", "person"]
    },
    {
        "word": "FILLED",
        "difficulty": 1,
        "tier": 5,
        "definition": "(verb / adjective) Made something full; holding as much as can be contained.",
        "sentences": [
            "She filled the glass with water.",
            "The room was filled with laughter.",
            "He filled in the form."
        ]
        ,
        "synonyms": ["full", "packed", "loaded"]
    },
    {
        "word": "FINALLY",
        "difficulty": 1,
        "tier": 5,
        "definition": "(adverb) After a long time; at the end",
        "sentences": [
            "She finally finished the book.",
            "He finally arrived.",
            "They finally agreed."
        ]
        ,
        "synonyms": ["ultimately", "lastly", "eventually"]
    },
    {
        "word": "FIND",
        "difficulty": 1,
        "tier": 1,
        "definition": "(verb) To discover or locate something",
        "sentences": [
            "Can you find my keys?",
            "She tried to find a solution.",
            "He found a coin on the ground."
        ]
        ,
        "synonyms": ["discover", "locate", "obtain"]
    },
    {
        "word": "FINE",
        "difficulty": 1,
        "tier": 5,
        "definition": "(adjective / noun) Of high quality; a sum of money paid as a penalty",
        "sentences": [
            "The weather is fine today.",
            "She paid a fine for parking.",
            "Everything will be fine."
        ]
        ,
        "synonyms": ["good", "penalty", "thin"]
    },
    {
        "word": "FINGERS",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) The five slender jointed parts extending from each hand, used for gripping and touch.",
        "sentences": [
            "She counted on her fingers.",
            "His fingers were cold.",
            "She had paint on her fingers."
        ]
        ,
        "synonyms": ["digits", "phalanges", "appendages"]
    },
    {
        "word": "FINISHED",
        "difficulty": 2,
        "tier": 6,
        "definition": "(verb / adjective) Brought to an end; fully completed.",
        "sentences": [
            "She finished first.",
            "He finished his homework.",
            "Are you finished?"
        ]
        ,
        "synonyms": ["done", "ended", "completed"]
    },
    {
        "word": "FIRE",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun / verb) Burning flames; to shoot a weapon",
        "sentences": [
            "Sit by the fire.",
            "He was fired from his job.",
            "The fire kept us warm."
        ]
        ,
        "synonyms": ["blaze", "dismiss", "flame"]
    },
    {
        "word": "FIRST",
        "difficulty": 2,
        "tier": 1,
        "definition": "(adjective / adverb) Coming before all others in order",
        "sentences": [
            "She was first in line.",
            "First, wash your hands.",
            "He finished first in the race."
        ]
        ,
        "synonyms": ["initial", "primary", "top"]
    },
    {
        "word": "FISH",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun / verb) A cold-blooded vertebrate that lives in water and breathes through gills; to search for and catch aquatic creatures.",
        "sentences": [
            "She caught a big fish.",
            "We went fishing on the weekend.",
            "There are colorful fish in the pond."
        ]
        ,
        "synonyms": ["aquatic-creature", "seafood", "catch"]
    },
    {
        "word": "FIT",
        "difficulty": 2,
        "tier": 9,
        "definition": "(adjective / verb) In good health; to be the right size",
        "sentences": [
            "She is very fit.",
            "Do these shoes fit?",
            "He kept fit by running."
        ]
        ,
        "synonyms": ["suitable", "healthy", "proper"]
    },
    {
        "word": "FIVE",
        "difficulty": 2,
        "tier": 4,
        "definition": "(number) The number after four",
        "sentences": [
            "She has five goldfish.",
            "He was only five years old.",
            "We need five more players."
        ]
        ,
        "synonyms": ["5", "quint", "handful"]
    },
    {
        "word": "FLAT",
        "difficulty": 2,
        "tier": 9,
        "definition": "(adjective / noun) Having a level surface; an apartment",
        "sentences": [
            "She lives in a flat.",
            "The land is very flat.",
            "He played a flat note."
        ]
        ,
        "synonyms": ["level", "apartment", "dull"]
    },
    {
        "word": "FLOOR",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) The lower surface of a room",
        "sentences": [
            "She mopped the floor.",
            "The book fell on the floor.",
            "He sat on the floor."
        ]
        ,
        "synonyms": ["ground", "story", "bottom"]
    },
    {
        "word": "FLOW",
        "difficulty": 2,
        "tier": 8,
        "definition": "(verb / noun) To move steadily; a steady movement",
        "sentences": [
            "The river flows to the sea.",
            "She got into the flow of writing.",
            "He watched the water flow."
        ]
        ,
        "synonyms": ["stream", "run", "move-freely"]
    },
    {
        "word": "FLOWERS",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun) The reproductive structures of plants, often brightly colored and fragrant.",
        "sentences": [
            "She picked flowers from the garden.",
            "The flowers smelled wonderful.",
            "He gave her a bunch of flowers."
        ]
        ,
        "synonyms": ["blooms", "blossoms", "flora"]
    },
    {
        "word": "FLY",
        "difficulty": 2,
        "tier": 5,
        "definition": "(verb / noun) To move through the air; an insect with wings",
        "sentences": [
            "Birds fly south in winter.",
            "There is a fly on the window.",
            "She wants to fly a plane one day."
        ]
        ,
        "synonyms": ["soar", "insect", "pilot"]
    },
    {
        "word": "FOLLOW",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb) To go after; to obey or come next in order",
        "sentences": [
            "Please follow me.",
            "Follow the instructions carefully.",
            "She followed the path through the forest."
        ]
        ,
        "synonyms": ["pursue", "imitate", "come-after"]
    },
    {
        "word": "FOOD",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) Anything eaten to provide nourishment",
        "sentences": [
            "She cooked delicious food.",
            "What is your favorite food?",
            "The food at that restaurant is great."
        ]
        ,
        "synonyms": ["nourishment", "sustenance", "fare"]
    },
    {
        "word": "FOOT",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) The bottom part of the leg; a unit of measurement",
        "sentences": [
            "She hurt her foot.",
            "The tree is six feet tall.",
            "He tapped his foot to the music."
        ]
        ,
        "synonyms": ["base", "lower-limb", "measure"]
    },
    {
        "word": "FOR",
        "difficulty": 2,
        "tier": 1,
        "definition": "(preposition) Indicating purpose, benefit, or duration",
        "sentences": [
            "This gift is for you.",
            "We waited for an hour.",
            "She trained for the race."
        ]
        ,
        "synonyms": ["in-favor-of", "on-behalf-of", "because-of"]
    },
    {
        "word": "FORCE",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun / verb) Power or strength; to make someone do something",
        "sentences": [
            "The wind was a great force.",
            "She forced the door open.",
            "He used all his force to lift it."
        ]
        ,
        "synonyms": ["power", "compel", "strength"]
    },
    {
        "word": "FOREST",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun) A large area covered with trees",
        "sentences": [
            "She got lost in the forest.",
            "The forest was quiet and cool.",
            "Many animals live in the forest."
        ]
        ,
        "synonyms": ["woods", "timber", "woodland"]
    },
    {
        "word": "FORM",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun / verb) A shape or structure; to create or shape",
        "sentences": [
            "Fill out the form, please.",
            "Ice can form in cold weather.",
            "The children formed a circle."
        ]
        ,
        "synonyms": ["shape", "create", "type"]
    },
    {
        "word": "FORWARD",
        "difficulty": 2,
        "tier": 10,
        "definition": "(adverb / adjective) In the direction one is facing; toward the front",
        "sentences": [
            "She stepped forward.",
            "He is a forward thinker.",
            "Look forward, not back."
        ]
        ,
        "synonyms": ["ahead", "onward", "advance"]
    },
    {
        "word": "FOUND",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb) Located or encountered something by searching or by chance.",
        "sentences": [
            "She found a coin on the floor.",
            "He found a stray dog.",
            "They found a solution."
        ]
        ,
        "synonyms": ["discovered", "established", "came-across"]
    },
    {
        "word": "FOUR",
        "difficulty": 2,
        "tier": 3,
        "definition": "(number) The number after three",
        "sentences": [
            "She has four siblings.",
            "The table has four legs.",
            "They waited for four hours."
        ]
        ,
        "synonyms": ["4", "quartet", "quadruple"]
    },
    {
        "word": "FRACTION",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun) A part of a whole number",
        "sentences": [
            "She answered in a fraction of a second.",
            "One half is a fraction.",
            "He understood fractions well."
        ]
        ,
        "synonyms": ["portion", "part", "ratio"]
    },
    {
        "word": "FRANCE",
        "difficulty": 2,
        "tier": 10,
        "definition": "(noun) A country in western Europe",
        "sentences": [
            "She spent a summer in France.",
            "France is known for its cuisine.",
            "He learned French before visiting France."
        ]
        ,
        "synonyms": ["French-nation", "Gallic", "European-country"]
    },
    {
        "word": "FREE",
        "difficulty": 2,
        "tier": 7,
        "definition": "(adjective / verb) Not restricted; to release",
        "sentences": [
            "Admission is free today.",
            "She freed the bird from the cage.",
            "He had a free afternoon."
        ]
        ,
        "synonyms": ["liberate", "no-cost", "unrestricted"]
    },
    {
        "word": "FRENCH",
        "difficulty": 2,
        "tier": 7,
        "definition": "(adjective / noun) Relating to France; the language of France",
        "sentences": [
            "She studied French at school.",
            "He ordered French toast.",
            "French food is known worldwide."
        ]
        ,
        "synonyms": ["Gallic", "from-France", "language"]
    },
    {
        "word": "FRESH",
        "difficulty": 2,
        "tier": 10,
        "definition": "(adjective) Recently made or obtained; cool and clean",
        "sentences": [
            "She bought fresh bread.",
            "The air was fresh and cool.",
            "He started with a fresh page."
        ]
        ,
        "synonyms": ["new", "clean", "unspoiled"]
    },
    {
        "word": "FRIENDS",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun) People with whom one has a bond of mutual affection and trust.",
        "sentences": [
            "She has many friends.",
            "They have been friends for years.",
            "Good friends are hard to find."
        ]
        ,
        "synonyms": ["companions", "allies", "pals"]
    },
    {
        "word": "FROM",
        "difficulty": 2,
        "tier": 1,
        "definition": "(preposition) Indicating a starting point or source",
        "sentences": [
            "She is from Spain.",
            "I got a letter from him.",
            "We drove from the city."
        ]
        ,
        "synonyms": ["originating", "away-from", "out-of"]
    },
    {
        "word": "FRONT",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun / adjective) The forward-facing side; relating to the forward part",
        "sentences": [
            "She sat in the front row.",
            "He answered the front door.",
            "There is a garden at the front of the house."
        ]
        ,
        "synonyms": ["face", "forward-part", "lead"]
    },
    {
        "word": "FRUGAL",
        "difficulty": 5,
        "definition": "(adj.) Economical with money or food.",
        "sentence": "He led a frugal lifestyle.",
        "hint": "Thrifty."
        ,
        "synonyms": ["thrifty", "economical", "sparing"]
    },
    {
        "word": "FRUIT",
        "difficulty": 2,
        "tier": 9,
        "definition": "(noun) The sweet part of a plant containing seeds",
        "sentences": [
            "She loves fresh fruit.",
            "He picked fruit from the tree.",
            "Fruit is full of vitamins."
        ]
        ,
        "synonyms": ["produce", "product", "yield"]
    },
    {
        "word": "FULL",
        "difficulty": 2,
        "tier": 5,
        "definition": "(adjective) Containing as much as possible; complete",
        "sentences": [
            "The bus was full.",
            "She ate until she was full.",
            "He gave her his full attention."
        ]
        ,
        "synonyms": ["filled", "complete", "satisfied"]
    },
    {
        "word": "FUN",
        "difficulty": 2,
        "tier": 9,
        "definition": "(noun / adjective) Enjoyment; enjoyable",
        "sentences": [
            "We had so much fun.",
            "That was a really fun game.",
            "She makes everything fun."
        ]
        ,
        "synonyms": ["enjoyment", "amusement", "recreation"]
    },
    {
        "word": "GAME",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun) An activity done for entertainment with rules",
        "sentences": [
            "She won the game.",
            "What game do you want to play?",
            "He loves board games."
        ]
        ,
        "synonyms": ["sport", "match", "play"]
    },
    {
        "word": "GARDEN",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) A piece of ground for growing plants",
        "sentences": [
            "She grew herbs in the garden.",
            "The garden is in full bloom.",
            "He built a pond in the garden."
        ]
        ,
        "synonyms": ["yard", "plot", "park"]
    },
    {
        "word": "GAS",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) A substance in a state like air; a fuel",
        "sentences": [
            "The car runs on gas.",
            "Oxygen is a gas.",
            "She smelled gas in the kitchen."
        ]
        ,
        "synonyms": ["fuel", "vapor", "petrol"]
    },
    {
        "word": "GAVE",
        "difficulty": 2,
        "tier": 5,
        "definition": "(verb) Transferred something to another person freely or as a gift.",
        "sentences": [
            "She gave him a gift.",
            "He gave all he had.",
            "They gave us a warm welcome."
        ]
        ,
        "synonyms": ["donated", "offered", "handed"]
    },
    {
        "word": "GENERAL",
        "difficulty": 4,
        "tier": 6,
        "definition": "(adjective / noun) Affecting most people; a high-ranking military officer",
        "sentences": [
            "In general, I agree.",
            "The general gave the order.",
            "She has a general understanding."
        ]
        ,
        "synonyms": ["common", "broad", "commander"]
    },
    {
        "word": "GET",
        "difficulty": 2,
        "tier": 1,
        "definition": "(verb) To obtain or receive; to become",
        "sentences": [
            "Can you get me some water?",
            "She will get better soon.",
            "He got a new bike."
        ]
        ,
        "synonyms": ["obtain", "acquire", "receive"]
    },
    {
        "word": "GIRL",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) A female child or young woman",
        "sentences": [
            "A girl ran across the field.",
            "She is a very brave girl.",
            "The girl smiled at her friend."
        ]
        ,
        "synonyms": ["female-child", "lass", "young-woman"]
    },
    {
        "word": "GIVE",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb) To present or hand over something to someone",
        "sentences": [
            "Give me your hand.",
            "She gave him a cookie.",
            "Please give it back."
        ]
        ,
        "synonyms": ["donate", "hand-over", "grant"]
    },
    {
        "word": "GLASS",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) A transparent material; a container for drinking",
        "sentences": [
            "She drank a glass of water.",
            "Be careful, the glass is sharp.",
            "The window is made of glass."
        ]
        ,
        "synonyms": ["transparent-material", "cup", "mirror"]
    },
    {
        "word": "GOD",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) A being believed to be the creator and ruler of the universe",
        "sentences": [
            "She prayed to God.",
            "He gave thanks to God.",
            "Many people believe in God."
        ]
        ,
        "synonyms": ["deity", "divine-being", "creator"]
    },
    {
        "word": "GOLD",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun / adjective) A precious, shiny yellow metal used in jewelry and currency; having a bright yellow hue.",
        "sentences": [
            "She won a gold medal.",
            "The ring is made of gold.",
            "The leaves turned gold in autumn."
        ]
        ,
        "synonyms": ["precious-metal", "yellow-metal", "treasure"]
    },
    {
        "word": "GONE",
        "difficulty": 2,
        "tier": 6,
        "definition": "(verb) Departed or traveled away from a place.",
        "sentences": [
            "She has gone home.",
            "All the cake is gone.",
            "He is long gone."
        ]
        ,
        "synonyms": ["absent", "left", "departed"]
    },
    {
        "word": "GOOD",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective) Of high quality; morally right",
        "sentences": [
            "She is a good cook.",
            "Have a good day!",
            "That was a really good book."
        ]
        ,
        "synonyms": ["excellent", "kind", "beneficial"]
    },
    {
        "word": "GOT",
        "difficulty": 2,
        "tier": 3,
        "definition": "(verb) Obtained something; or came to be in a certain state.",
        "sentences": [
            "She got a new puppy.",
            "He got lost in the forest.",
            "We got ice cream after dinner."
        ]
        ,
        "synonyms": ["received", "obtained", "became"]
    },
    {
        "word": "GOVERNMENT",
        "difficulty": 4,
        "tier": 5,
        "definition": "(noun) The group that rules a country or region",
        "sentences": [
            "The government made a new law.",
            "She works for the government.",
            "People voted for a new government."
        ]
        ,
        "synonyms": ["administration", "state", "authority"]
    },
    {
        "word": "GRASS",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun) Low green plants covering lawns and fields",
        "sentences": [
            "The grass is very green.",
            "She lay on the cool grass.",
            "He mowed the grass."
        ]
        ,
        "synonyms": ["lawn", "meadow", "turf"]
    },
    {
        "word": "GREAT",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective) Very large; of high quality or importance",
        "sentences": [
            "She did a great job.",
            "It was a great adventure.",
            "We had a great time."
        ]
        ,
        "synonyms": ["wonderful", "large", "excellent"]
    },
    {
        "word": "GREEK",
        "difficulty": 4,
        "tier": 10,
        "definition": "(adjective / noun) Relating to Greece; the language of Greece",
        "sentences": [
            "She studied Greek mythology.",
            "He ordered Greek salad.",
            "Greek is an ancient language."
        ]
        ,
        "synonyms": ["Hellenic", "from-Greece", "Grecian"]
    },
    {
        "word": "GREEN",
        "difficulty": 2,
        "tier": 5,
        "definition": "(adjective / noun) The color of grass and leaves",
        "sentences": [
            "She wore a green coat.",
            "The grass is green.",
            "He has a green thumb."
        ]
        ,
        "synonyms": ["color", "eco-friendly", "nature"]
    },
    {
        "word": "GREW",
        "difficulty": 2,
        "tier": 8,
        "definition": "(verb) Increased in size, number, or degree over time.",
        "sentences": [
            "She grew up in the country.",
            "He grew a beard.",
            "The plant grew very fast."
        ]
        ,
        "synonyms": ["expanded", "developed", "matured"]
    },
    {
        "word": "GROUND",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun) The surface of the Earth; soil",
        "sentences": [
            "She sat on the ground.",
            "The ground was wet after the rain.",
            "He planted seeds in the ground."
        ]
        ,
        "synonyms": ["soil", "floor", "basis"]
    },
    {
        "word": "GROUP",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun / verb) A number of people or things gathered together; to arrange into clusters or sets.",
        "sentences": [
            "She joined a reading group.",
            "Group the animals by size.",
            "A group of birds flew past."
        ]
        ,
        "synonyms": ["set", "cluster", "team"]
    },
    {
        "word": "GROW",
        "difficulty": 2,
        "tier": 3,
        "definition": "(verb) To increase in size; to cultivate plants",
        "sentences": [
            "Plants grow in sunlight.",
            "She grew tomatoes in her garden.",
            "Children grow so fast."
        ]
        ,
        "synonyms": ["expand", "develop", "increase"]
    },
    {
        "word": "GUESS",
        "difficulty": 2,
        "tier": 9,
        "definition": "(verb / noun) To estimate without full information; an estimate",
        "sentences": [
            "Take a guess!",
            "She guessed the right answer.",
            "I guess it will be cold."
        ]
        ,
        "synonyms": ["estimate", "suppose", "conjecture"]
    },
    {
        "word": "HAD",
        "difficulty": 2,
        "tier": 1,
        "definition": "(verb) Possessed or experienced something in the past.",
        "sentences": [
            "She had a cold last week.",
            "They had a great time.",
            "He had two dogs."
        ]
        ,
        "synonyms": ["possessed", "experienced", "owned"]
    },
    {
        "word": "HAIR",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) Thin strands growing from the skin",
        "sentences": [
            "She has long red hair.",
            "He brushed his hair.",
            "The cat left hair on the sofa."
        ]
        ,
        "synonyms": ["tresses", "locks", "follicles"]
    },
    {
        "word": "HALF",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun / adjective) One of two equal parts",
        "sentences": [
            "She ate half the sandwich.",
            "Half the class was absent.",
            "He filled the glass half full."
        ]
        ,
        "synonyms": ["semi", "50-percent", "partial"]
    },
    {
        "word": "HAND",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun) The part of the body at the end of the arm",
        "sentences": [
            "She raised her hand.",
            "Give me your hand.",
            "He waved his hand goodbye."
        ]
        ,
        "synonyms": ["palm", "worker", "assist"]
    },
    {
        "word": "HAPPENED",
        "difficulty": 2,
        "tier": 4,
        "definition": "(verb) Took place; came to pass without being planned.",
        "sentences": [
            "What happened here?",
            "It all happened so fast.",
            "She told me what happened."
        ]
        ,
        "synonyms": ["occurred", "took-place", "came-about"]
    },
    {
        "word": "HAPPY",
        "difficulty": 2,
        "tier": 6,
        "definition": "(adjective) Feeling pleasure or joy",
        "sentences": [
            "She is a happy child.",
            "I am so happy for you!",
            "He smiled a happy smile."
        ]
        ,
        "synonyms": ["joyful", "content", "pleased"]
    },
    {
        "word": "HARD",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adjective / adverb) Firm and solid; with great effort",
        "sentences": [
            "The math test was hard.",
            "She worked very hard.",
            "The ground was hard after the frost."
        ]
        ,
        "synonyms": ["difficult", "solid", "firm"]
    },
    {
        "word": "HAS",
        "difficulty": 2,
        "tier": 1,
        "definition": "(verb) Possesses or holds something; used with he, she, or it.",
        "sentences": [
            "She has a new bike.",
            "He has blue eyes.",
            "The dog has a red collar."
        ]
        ,
        "synonyms": ["owns", "possesses", "holds"]
    },
    {
        "word": "HAT",
        "difficulty": 2,
        "tier": 9,
        "definition": "(noun) A covering worn on the head",
        "sentences": [
            "She wore a wide-brimmed hat.",
            "He put on his hat.",
            "The hat kept the sun off her face."
        ]
        ,
        "synonyms": ["cap", "headwear", "bonnet"]
    },
    {
        "word": "HAVE",
        "difficulty": 2,
        "tier": 1,
        "definition": "(verb) To possess or own something",
        "sentences": [
            "I have a dog.",
            "They have two cars.",
            "Do you have a pen?"
        ]
        ,
        "synonyms": ["own", "possess", "hold"]
    },
    {
        "word": "HEAD",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) The top part of the body; a leader",
        "sentences": [
            "She nodded her head.",
            "He is the head of the team.",
            "She bumped her head."
        ]
        ,
        "synonyms": ["leader", "top", "mind"]
    },
    {
        "word": "HEAR",
        "difficulty": 2,
        "tier": 3,
        "definition": "(verb) To perceive sound through the ears",
        "sentences": [
            "Can you hear that?",
            "She heard a strange noise.",
            "I could hear them talking upstairs."
        ]
        ,
        "synonyms": ["listen", "detect-sound", "learn"]
    },
    {
        "word": "HEARD",
        "difficulty": 2,
        "tier": 4,
        "definition": "(verb) Perceived sound through the ears; was informed of something.",
        "sentences": [
            "She heard a knock at the door.",
            "I heard you were moving.",
            "He heard the thunder."
        ]
        ,
        "synonyms": ["listened", "detected", "found-out"]
    },
    {
        "word": "HEART",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun) The organ that pumps blood; love or emotion",
        "sentences": [
            "Her heart beat fast.",
            "She has a kind heart.",
            "He gave it his whole heart."
        ]
        ,
        "synonyms": ["core", "cardiac-organ", "center"]
    },
    {
        "word": "HEAT",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun / verb) Warmth; to make warm",
        "sentences": [
            "She felt the heat of the sun.",
            "Heat the soup gently.",
            "The heat was unbearable."
        ]
        ,
        "synonyms": ["warmth", "temperature", "intensity"]
    },
    {
        "word": "HEAVY",
        "difficulty": 2,
        "tier": 5,
        "definition": "(adjective) Of great weight; difficult to lift",
        "sentences": [
            "The box is very heavy.",
            "She carried a heavy load.",
            "That bag looks too heavy."
        ]
        ,
        "synonyms": ["weighty", "dense", "serious"]
    },
    {
        "word": "HELD",
        "difficulty": 2,
        "tier": 6,
        "definition": "(verb) Kept something gripped or supported; contained or restrained.",
        "sentences": [
            "She held his hand.",
            "He held the door open.",
            "They held a meeting."
        ]
        ,
        "synonyms": ["gripped", "maintained", "kept"]
    },
    {
        "word": "HELP",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb / noun) To assist; assistance given to another",
        "sentences": [
            "Can you help me?",
            "She always helps others.",
            "I need a little help."
        ]
        ,
        "synonyms": ["assist", "aid", "support"]
    },
    {
        "word": "HER",
        "difficulty": 2,
        "tier": 1,
        "definition": "(pronoun) Belonging to or referring to a female",
        "sentences": [
            "That is her bike.",
            "He gave her a flower.",
            "I know her well."
        ]
        ,
        "synonyms": ["belonging-to-her", "she", "female"]
    },
    {
        "word": "HERE",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adverb) In or to this place",
        "sentences": [
            "Please sit here.",
            "She has lived here all her life.",
            "Come here, quickly!"
        ]
        ,
        "synonyms": ["at-this-place", "present", "now"]
    },
    {
        "word": "HID",
        "difficulty": 2,
        "tier": 9,
        "definition": "(verb) Put or kept something out of sight; took cover.",
        "sentences": [
            "She hid behind the door.",
            "He hid the letter.",
            "The cat hid under the bed."
        ]
        ,
        "synonyms": ["concealed", "kept-secret", "covered"]
    },
    {
        "word": "HIGH",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective / adverb) Far above the ground; at a great level",
        "sentences": [
            "The bird flew very high.",
            "She scored high on the test.",
            "It was a high mountain."
        ]
        ,
        "synonyms": ["tall", "elevated", "great"]
    },
    {
        "word": "HILL",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) A raised area of land smaller than a mountain",
        "sentences": [
            "She ran up the hill.",
            "They rolled down the grassy hill.",
            "The house sat on a hill."
        ]
        ,
        "synonyms": ["rise", "mound", "incline"]
    },
    {
        "word": "HIM",
        "difficulty": 2,
        "tier": 1,
        "definition": "(pronoun) Refers to a male person or animal as an object",
        "sentences": [
            "She gave him a gift.",
            "I saw him yesterday.",
            "Tell him to call me."
        ]
        ,
        "synonyms": ["he", "that-person", "male"]
    },
    {
        "word": "HIMSELF",
        "difficulty": 2,
        "tier": 4,
        "definition": "(pronoun) Refers to a male person as the object when he is also the subject",
        "sentences": [
            "He made dinner himself.",
            "He hurt himself playing football.",
            "He kept it all to himself."
        ]
        ,
        "synonyms": ["he-alone", "self", "personally"]
    },
    {
        "word": "HIS",
        "difficulty": 2,
        "tier": 1,
        "definition": "(pronoun) Belonging to a male person or animal",
        "sentences": [
            "That is his hat.",
            "He lost his keys.",
            "His dog is friendly."
        ]
        ,
        "synonyms": ["belonging-to-him", "male-possessive", "that-man's"]
    },
    {
        "word": "HISTORY",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) The study of past events",
        "sentences": [
            "She loves history.",
            "This building has a great history.",
            "He studied history at school."
        ]
        ,
        "synonyms": ["past", "record", "chronicle"]
    },
    {
        "word": "HOE",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun) A garden tool used to loosen soil",
        "sentences": [
            "She used a hoe in the garden.",
            "He bought a new hoe.",
            "The farmer worked with a hoe."
        ]
        ,
        "synonyms": ["garden-tool", "cultivator", "weeder"]
    },
    {
        "word": "HOLD",
        "difficulty": 2,
        "tier": 4,
        "definition": "(verb / noun) To grasp; the act of gripping",
        "sentences": [
            "Hold my hand.",
            "She grabbed hold of the rope.",
            "He held the door open."
        ]
        ,
        "synonyms": ["grip", "keep", "contain"]
    },
    {
        "word": "HOLE",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) A hollow space or opening",
        "sentences": [
            "There is a hole in the roof.",
            "She dug a hole in the garden.",
            "The rabbit went into its hole."
        ]
        ,
        "synonyms": ["opening", "gap", "cavity"]
    },
    {
        "word": "HOME",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun / adjective) The place where one lives",
        "sentences": [
            "She walked home from school.",
            "There is no place like home.",
            "He made himself at home."
        ]
        ,
        "synonyms": ["house", "dwelling", "residence"]
    },
    {
        "word": "HOPE",
        "difficulty": 2,
        "tier": 7,
        "definition": "(verb / noun) To wish for something; a feeling of expectation",
        "sentences": [
            "I hope you feel better.",
            "She never lost hope.",
            "There is still hope."
        ]
        ,
        "synonyms": ["wish", "expect", "aspiration"]
    },
    {
        "word": "HORSE",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun) A large four-legged animal used for riding",
        "sentences": [
            "She rides her horse on weekends.",
            "The horse galloped across the field.",
            "He fed the horse a carrot."
        ]
        ,
        "synonyms": ["steed", "stallion", "equine"]
    },
    {
        "word": "HOT",
        "difficulty": 2,
        "tier": 5,
        "definition": "(adjective) High in temperature",
        "sentences": [
            "The soup is too hot.",
            "It was a very hot day.",
            "She drank a hot cup of tea."
        ]
        ,
        "synonyms": ["warm", "fiery", "spicy"]
    },
    {
        "word": "HOURS",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun) Periods of time each lasting sixty minutes.",
        "sentences": [
            "She waited for three hours.",
            "The drive takes two hours.",
            "He works long hours."
        ]
        ,
        "synonyms": ["time-units", "periods", "sixty-minutes"]
    },
    {
        "word": "HOUSE",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun) A building where people live",
        "sentences": [
            "She lives in a red house.",
            "They built a new house.",
            "The dog sat outside the house."
        ]
        ,
        "synonyms": ["home", "dwelling", "residence"]
    },
    {
        "word": "HOW",
        "difficulty": 2,
        "tier": 1,
        "definition": "(adverb) In what way or manner",
        "sentences": [
            "How are you?",
            "I know how to cook.",
            "Show me how it works."
        ]
        ,
        "synonyms": ["in-what-way", "by-what-means", "to-what-extent"]
    },
    {
        "word": "HOWEVER",
        "difficulty": 2,
        "tier": 4,
        "definition": "(adverb / conjunction) Nevertheless; in whatever way",
        "sentences": [
            "She is tired; however, she kept going.",
            "However, I disagree.",
            "You can do it however you like."
        ]
        ,
        "synonyms": ["but", "though", "yet"]
    },
    {
        "word": "HUGE",
        "difficulty": 2,
        "tier": 10,
        "definition": "(adjective) Very large",
        "sentences": [
            "The elephant was huge.",
            "She made a huge effort.",
            "They lived in a huge house."
        ]
        ,
        "synonyms": ["enormous", "vast", "gigantic"]
    },
    {
        "word": "HUMAN",
        "difficulty": 2,
        "tier": 8,
        "definition": "(adjective / noun) Relating to people; a person",
        "sentences": [
            "Every human deserves respect.",
            "It is a human reaction.",
            "She studies human behavior."
        ]
        ,
        "synonyms": ["person", "mortal", "mankind"]
    },
    {
        "word": "HUNDRED",
        "difficulty": 2,
        "tier": 4,
        "definition": "(number) The number equal to ten times ten (100)",
        "sentences": [
            "She has read over a hundred books.",
            "A hundred people came.",
            "It costs two hundred pounds."
        ]
        ,
        "synonyms": ["century", "100", "a-great-many"]
    },
    {
        "word": "HUNTING",
        "difficulty": 4,
        "tier": 8,
        "definition": "(noun / verb) The pursuit and capture of wild animals; the act of searching for something.",
        "sentences": [
            "They went hunting in the forest.",
            "She went job hunting.",
            "He spent weekends hunting."
        ]
        ,
        "synonyms": ["pursuing", "tracking", "chasing"]
    },
    {
        "word": "I'LL",
        "difficulty": 2,
        "tier": 4,
        "definition": "(contraction) Contraction of 'I will'",
        "sentences": [
            "I'll be there soon.",
            "I'll help you with that.",
            "I'll call you later."
        ]
        ,
        "synonyms": ["I-will", "I-shall", "I-intend-to"]
    },
    {
        "word": "ICE",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) Frozen water",
        "sentences": [
            "She put ice in her drink.",
            "The pond was covered with ice.",
            "Be careful on the ice."
        ]
        ,
        "synonyms": ["frozen-water", "frost", "sleet"]
    },
    {
        "word": "IDEA",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) A thought or suggestion",
        "sentences": [
            "That is a great idea!",
            "She had a clever idea.",
            "I have no idea what happened."
        ]
        ,
        "synonyms": ["thought", "concept", "notion"]
    },
    {
        "word": "IMPORTANT",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adjective) Of great significance or value",
        "sentences": [
            "Sleep is very important.",
            "She made an important decision.",
            "It is important to be kind."
        ]
        ,
        "synonyms": ["significant", "vital", "major"]
    },
    {
        "word": "INCHES",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun) Small units of length, each equal to one twelfth of a foot.",
        "sentences": [
            "She grew two inches this year.",
            "The screen is twelve inches wide.",
            "He measured it in inches."
        ]
        ,
        "synonyms": ["units", "measures", "small-lengths"]
    },
    {
        "word": "INCLUDE",
        "difficulty": 4,
        "tier": 5,
        "definition": "(verb) To have as part of a whole",
        "sentences": [
            "Include your name on the form.",
            "The price includes breakfast.",
            "She included everyone in the game."
        ]
        ,
        "synonyms": ["contain", "consist-of", "incorporate"]
    },
    {
        "word": "INCREASE",
        "difficulty": 4,
        "tier": 8,
        "definition": "(verb / noun) To become larger; a growth",
        "sentences": [
            "She increased her speed.",
            "There has been an increase in sales.",
            "He increased the volume."
        ]
        ,
        "synonyms": ["grow", "rise", "expand"]
    },
    {
        "word": "INDIAN",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adjective / noun) Relating to India or Indigenous peoples of the Americas",
        "sentences": [
            "She wore an Indian silk sari.",
            "They learned about Native Indian history.",
            "The Indian elephant is very large."
        ]
        ,
        "synonyms": ["from-India", "Native-American", "South-Asian"]
    },
    {
        "word": "INDICATE",
        "difficulty": 5,
        "tier": 9,
        "definition": "(verb) To show or point out",
        "sentences": [
            "Road signs indicate which direction to go.",
            "A red light can indicate danger.",
            "She will indicate her choice with a tick."
        ]
        ,
        "synonyms": ["show", "signal", "point-to"]
    },
    {
        "word": "INDUSTRY",
        "difficulty": 4,
        "tier": 9,
        "definition": "(noun) The production of goods; a sector of the economy",
        "sentences": [
            "She works in the fashion industry.",
            "The industry grew quickly.",
            "He studied local industry."
        ]
        ,
        "synonyms": ["business", "manufacturing", "sector"]
    },
    {
        "word": "INEVITABLE",
        "difficulty": 5,
        "definition": "(adj.) Certain to happen; unavoidable.",
        "sentence": "Death is inevitable.",
        "hint": "Unavoidable."
        ,
        "synonyms": ["unavoidable", "certain", "inescapable"]
    },
    {
        "word": "INFORMATION",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) Facts or knowledge about something",
        "sentences": [
            "She found the information online.",
            "Can I get some information?",
            "He had all the information he needed."
        ]
        ,
        "synonyms": ["data", "knowledge", "facts"]
    },
    {
        "word": "INSECTS",
        "difficulty": 2,
        "tier": 9,
        "definition": "(noun) Small arthropods with six legs, three body segments, and typically one or two pairs of wings.",
        "sentences": [
            "Many insects live in the soil.",
            "She wasn't afraid of insects.",
            "Insects pollinate flowers."
        ]
        ,
        "synonyms": ["bugs", "arthropods", "creepy-crawlies"]
    },
    {
        "word": "INSIDE",
        "difficulty": 2,
        "tier": 5,
        "definition": "(preposition / adverb) On the inner side; within",
        "sentences": [
            "Come inside out of the rain.",
            "She found it inside the box.",
            "It is warmer inside."
        ]
        ,
        "synonyms": ["within", "interior", "inner"]
    },
    {
        "word": "INSTEAD",
        "difficulty": 2,
        "tier": 7,
        "definition": "(adverb) As an alternative; in place of",
        "sentences": [
            "She stayed home instead.",
            "He took the bus instead of driving.",
            "Can I have this instead?"
        ]
        ,
        "synonyms": ["in-place-of", "as-an-alternative", "alternatively"]
    },
    {
        "word": "INSTRUMENTS",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun) Tools or devices used to perform a task; objects played to produce music.",
        "sentences": [
            "She plays several instruments.",
            "The surgeon's instruments were laid out.",
            "Musical instruments fill the room."
        ]
        ,
        "synonyms": ["tools", "devices", "apparatus"]
    },
    {
        "word": "INTEREST",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun / verb) A desire to know more; to attract attention",
        "sentences": [
            "She has a great interest in art.",
            "Does this interest you?",
            "He showed great interest in the subject."
        ]
        ,
        "synonyms": ["curiosity", "stake", "fascination"]
    },
    {
        "word": "INTERESTING",
        "difficulty": 2,
        "tier": 9,
        "definition": "(adjective) Attracting attention or curiosity",
        "sentences": [
            "That is an interesting idea.",
            "She is a very interesting person.",
            "He found the book very interesting."
        ]
        ,
        "synonyms": ["engaging", "absorbing", "intriguing"]
    },
    {
        "word": "INTO",
        "difficulty": 2,
        "tier": 1,
        "definition": "(preposition) Moving to the inside of something",
        "sentences": [
            "She walked into the room.",
            "He jumped into the pool.",
            "Pour the milk into the cup."
        ]
        ,
        "synonyms": ["inside", "toward", "within"]
    },
    {
        "word": "IRON",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun / adjective) A strong grey metal; very firm",
        "sentences": [
            "She ironed her shirt.",
            "The gate is made of iron.",
            "He has an iron will."
        ]
        ,
        "synonyms": ["metal", "press", "firm"]
    },
    {
        "word": "ISLAND",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun) A piece of land surrounded by water",
        "sentences": [
            "She lived on a small island.",
            "They sailed to the island.",
            "The island had beautiful beaches."
        ]
        ,
        "synonyms": ["isle", "land-mass", "atoll"]
    },
    {
        "word": "ISN'T",
        "difficulty": 2,
        "tier": 10,
        "definition": "(contraction) Contraction of 'is not'",
        "sentences": [
            "It isn't ready yet.",
            "She isn't coming today.",
            "That isn't the right answer."
        ]
        ,
        "synonyms": ["is-not", "isn't-so", "not-true"]
    },
    {
        "word": "IT'S",
        "difficulty": 2,
        "tier": 3,
        "definition": "(contraction) Contraction of 'it is'",
        "sentences": [
            "It's a beautiful day.",
            "It's going to be fun!",
            "It's time to go home."
        ]
        ,
        "synonyms": ["it-is", "it-has", "belonging-to-it"]
    },
    {
        "word": "ITS",
        "difficulty": 2,
        "tier": 1,
        "definition": "(pronoun) Belonging to something previously mentioned",
        "sentences": [
            "The dog wagged its tail.",
            "The tree lost its leaves.",
            "The book has its own charm."
        ]
        ,
        "synonyms": ["belonging-to-it", "of-it", "possessive-it"]
    },
    {
        "word": "ITSELF",
        "difficulty": 2,
        "tier": 8,
        "definition": "(pronoun) Refers back to a thing previously mentioned",
        "sentences": [
            "The cat licked itself.",
            "The door opened by itself.",
            "The problem solved itself."
        ]
        ,
        "synonyms": ["itself", "alone", "by-itself"]
    },
    {
        "word": "JAPANESE",
        "difficulty": 5,
        "tier": 9,
        "definition": "(adjective / noun) Of or belonging to the island nation in East Asia; its people, culture, or language.",
        "sentences": [
            "She studied Japanese.",
            "He loves Japanese food.",
            "Japanese art is very beautiful."
        ]
        ,
        "synonyms": ["from-Japan", "East-Asian", "Nihon"]
    },
    {
        "word": "JOB",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun) A paid position of work",
        "sentences": [
            "She has a great job.",
            "He did a fantastic job.",
            "Getting a job was hard."
        ]
        ,
        "synonyms": ["work", "occupation", "task"]
    },
    {
        "word": "JOINED",
        "difficulty": 2,
        "tier": 8,
        "definition": "(verb) Connected things together; or became a member of a group.",
        "sentences": [
            "She joined the team.",
            "He joined the library.",
            "They joined hands."
        ]
        ,
        "synonyms": ["connected", "merged", "linked"]
    },
    {
        "word": "JUMPED",
        "difficulty": 2,
        "tier": 7,
        "definition": "(verb) Pushed off the ground with one's legs to propel the body upward",
        "sentences": [
            "She jumped for joy.",
            "He jumped over the fence.",
            "The frog jumped into the pond."
        ]
        ,
        "synonyms": ["leaped", "sprang", "vaulted"]
    },
    {
        "word": "JUST",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adverb / adjective) Only; exactly; fair and right",
        "sentences": [
            "She just arrived.",
            "It is just one block away.",
            "That is not just."
        ]
        ,
        "synonyms": ["fair", "merely", "recently"]
    },
    {
        "word": "KEEP",
        "difficulty": 2,
        "tier": 3,
        "definition": "(verb) To retain possession of; to continue",
        "sentences": [
            "Keep the change.",
            "She kept her promise.",
            "He tries to keep fit."
        ]
        ,
        "synonyms": ["hold", "maintain", "retain"]
    },
    {
        "word": "KEPT",
        "difficulty": 2,
        "tier": 6,
        "definition": "(verb) Retained possession of something; continued in a state.",
        "sentences": [
            "She kept her promise.",
            "He kept all her letters.",
            "They kept going through the storm."
        ]
        ,
        "synonyms": ["maintained", "held", "preserved"]
    },
    {
        "word": "KEY",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun / adjective) A device for opening a lock; most important",
        "sentences": [
            "She lost her key.",
            "That is the key point.",
            "He found the key under the mat."
        ]
        ,
        "synonyms": ["essential", "answer", "clue"]
    },
    {
        "word": "KILLED",
        "difficulty": 2,
        "tier": 7,
        "definition": "(verb) Caused the death of a living thing.",
        "sentences": [
            "The frost killed the plants.",
            "He killed the spider.",
            "The storm killed many trees."
        ]
        ,
        "synonyms": ["slain", "slain", "eliminated"]
    },
    {
        "word": "KIND",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun / adjective) A type or variety; gentle and caring",
        "sentences": [
            "She is a very kind person.",
            "What kind of music do you like?",
            "He did a kind thing for his neighbor."
        ]
        ,
        "synonyms": ["type", "sort", "generous"]
    },
    {
        "word": "KING",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun) A male ruler of a country",
        "sentences": [
            "The king lived in a great castle.",
            "She curtsied before the king.",
            "The king declared a holiday."
        ]
        ,
        "synonyms": ["monarch", "ruler", "sovereign"]
    },
    {
        "word": "KNEW",
        "difficulty": 2,
        "tier": 4,
        "definition": "(verb) Had information about or understanding of something.",
        "sentences": [
            "She knew the answer.",
            "He knew she was upset.",
            "I knew something was wrong."
        ]
        ,
        "synonyms": ["understood", "was-aware", "recognized"]
    },
    {
        "word": "KNOW",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb) To be aware of or have information about",
        "sentences": [
            "Do you know the answer?",
            "I know her from school.",
            "She does not know his name."
        ]
        ,
        "synonyms": ["understand", "be-aware", "recognize"]
    },
    {
        "word": "KNOWN",
        "difficulty": 2,
        "tier": 5,
        "definition": "(adjective / verb) Recognized or established as fact; widely acknowledged.",
        "sentences": [
            "She is a well-known author.",
            "He has known her for years.",
            "It is widely known."
        ]
        ,
        "synonyms": ["recognized", "familiar", "established"]
    },
    {
        "word": "LADY",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) A polite word for a woman",
        "sentences": [
            "A kind lady helped her.",
            "She was a true lady.",
            "Ladies and gentlemen, please be seated."
        ]
        ,
        "synonyms": ["woman", "gentlewoman", "dame"]
    },
    {
        "word": "LAKE",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) A body of water surrounded by land",
        "sentences": [
            "She swam in the lake.",
            "The lake is frozen in winter.",
            "He fished at the lake."
        ]
        ,
        "synonyms": ["pond", "reservoir", "body-of-water"]
    },
    {
        "word": "LAND",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun / verb) The solid ground; to come down and rest on a surface",
        "sentences": [
            "The plane landed safely.",
            "She owns a piece of land.",
            "They traveled over land and sea."
        ]
        ,
        "synonyms": ["ground", "territory", "arrive"]
    },
    {
        "word": "LANGUAGE",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun) A system of communication used by a group of people",
        "sentences": [
            "She speaks three languages.",
            "Language is a powerful tool.",
            "He is learning a new language."
        ]
        ,
        "synonyms": ["tongue", "speech", "dialect"]
    },
    {
        "word": "LARGE",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective) Of great size or extent",
        "sentences": [
            "They live in a large house.",
            "A large crowd gathered.",
            "She carried a large bag."
        ]
        ,
        "synonyms": ["big", "massive", "extensive"]
    },
    {
        "word": "LAST",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adjective / adverb) Coming after all others; most recently",
        "sentences": [
            "She finished last.",
            "This is the last piece of cake.",
            "I saw her last week."
        ]
        ,
        "synonyms": ["final", "endure", "most-recent"]
    },
    {
        "word": "LATE",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adjective / adverb) After the expected time; near the end",
        "sentences": [
            "She was late to class.",
            "He always works late.",
            "Don't be late for dinner."
        ]
        ,
        "synonyms": ["delayed", "recent", "overdue"]
    },
    {
        "word": "LAUGHED",
        "difficulty": 2,
        "tier": 7,
        "definition": "(verb) Made sounds expressing amusement or joy.",
        "sentences": [
            "She laughed at his joke.",
            "They all laughed together.",
            "He laughed until he cried."
        ]
        ,
        "synonyms": ["chuckled", "giggled", "tittered"]
    },
    {
        "word": "LAW",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) A rule made by a government",
        "sentences": [
            "Breaking the law has consequences.",
            "She studied law at university.",
            "There is a law against it."
        ]
        ,
        "synonyms": ["rule", "regulation", "statute"]
    },
    {
        "word": "LAY",
        "difficulty": 2,
        "tier": 6,
        "definition": "(verb) Reclined in a flat horizontal position; placed something down.",
        "sentences": [
            "She lay on the sofa.",
            "The dog lay in the shade.",
            "He lay the book down carefully."
        ]
        ,
        "synonyms": ["place", "set-down", "rest"]
    },
    {
        "word": "LEAD",
        "difficulty": 2,
        "tier": 7,
        "definition": "(verb / noun) To guide or be in front; a heavy grey metal",
        "sentences": [
            "She led the team.",
            "Lead is a heavy metal.",
            "He took the lead in the race."
        ]
        ,
        "synonyms": ["guide", "precede", "direct"]
    },
    {
        "word": "LEARN",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb) To gain knowledge or skill",
        "sentences": [
            "She loves to learn new things.",
            "You can learn from mistakes.",
            "He learned to ride a bike."
        ]
        ,
        "synonyms": ["study", "discover", "acquire"]
    },
    {
        "word": "LEAST",
        "difficulty": 2,
        "tier": 7,
        "definition": "(adjective / adverb) The smallest amount; at the minimum",
        "sentences": [
            "She did the least work.",
            "At least try.",
            "That is the least helpful thing to say."
        ]
        ,
        "synonyms": ["minimum", "fewest", "slightest"]
    },
    {
        "word": "LEAVE",
        "difficulty": 2,
        "tier": 3,
        "definition": "(verb) To go away from; to depart",
        "sentences": [
            "She had to leave early.",
            "Don't forget to leave a note.",
            "He leaves for work at seven."
        ]
        ,
        "synonyms": ["depart", "exit", "abandon"]
    },
    {
        "word": "LED",
        "difficulty": 2,
        "tier": 10,
        "definition": "(verb) Guided or directed someone toward a destination.",
        "sentences": [
            "She led the team to victory.",
            "He led the way home.",
            "She was led to her seat."
        ]
        ,
        "synonyms": ["guided", "directed", "piloted"]
    },
    {
        "word": "LEFT",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adjective / adverb / verb) The direction opposite to right; departed from a place.",
        "sentences": [
            "Turn left at the corner.",
            "She left her hat at school.",
            "He sat to my left."
        ]
        ,
        "synonyms": ["departed", "remaining", "direction"]
    },
    {
        "word": "LEGS",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun) The limbs of a human or animal used for standing and moving.",
        "sentences": [
            "Her legs were tired after the run.",
            "The table has four legs.",
            "He crossed his legs."
        ]
        ,
        "synonyms": ["limbs", "lower-limbs", "walking-limbs"]
    },
    {
        "word": "LENGTH",
        "difficulty": 5,
        "tier": 6,
        "definition": "(noun) The measurement of something from end to end",
        "sentences": [
            "Measure the length of the room.",
            "The length of the film was two hours.",
            "She walked the full length of the beach."
        ]
        ,
        "synonyms": ["distance", "extent", "measurement"]
    },
    {
        "word": "LESS",
        "difficulty": 2,
        "tier": 5,
        "definition": "(adjective / adverb) A smaller amount; not as much",
        "sentences": [
            "She eats less sugar now.",
            "Try to make less noise.",
            "The walk took less time than expected."
        ]
        ,
        "synonyms": ["fewer", "smaller", "not-as-much"]
    },
    {
        "word": "LET",
        "difficulty": 2,
        "tier": 3,
        "definition": "(verb) To allow; to permit",
        "sentences": [
            "Let me help you.",
            "She let the cat in.",
            "He wouldn't let go."
        ]
        ,
        "synonyms": ["allow", "permit", "rent"]
    },
    {
        "word": "LET'S",
        "difficulty": 2,
        "tier": 7,
        "definition": "(contraction) Contraction of 'let us'",
        "sentences": [
            "Let's go for a walk!",
            "Let's try that again.",
            "Let's eat."
        ]
        ,
        "synonyms": ["let-us", "shall-we", "come-on"]
    },
    {
        "word": "LETTER",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun) A written symbol representing a sound; a written message",
        "sentences": [
            "She got a letter from her friend.",
            "Write a capital letter at the start.",
            "The letter A starts many words."
        ]
        ,
        "synonyms": ["missive", "character", "note"]
    },
    {
        "word": "LEVEL",
        "difficulty": 2,
        "tier": 10,
        "definition": "(noun / adjective) A flat surface; horizontal and even",
        "sentences": [
            "She reached a new level.",
            "The table is not level.",
            "He was at an advanced level."
        ]
        ,
        "synonyms": ["even", "floor", "stage"]
    },
    {
        "word": "LIE",
        "difficulty": 2,
        "tier": 9,
        "definition": "(verb / noun) To say something untrue; a false statement",
        "sentences": [
            "Don't lie to me.",
            "He told a lie.",
            "She lay down on the grass."
        ]
        ,
        "synonyms": ["recline", "falsehood", "be-situated"]
    },
    {
        "word": "LIFE",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) The condition of being alive; existence",
        "sentences": [
            "She loves her life.",
            "Life is full of surprises.",
            "He saved the animal's life."
        ]
        ,
        "synonyms": ["existence", "vitality", "living"]
    },
    {
        "word": "LIFTED",
        "difficulty": 2,
        "tier": 9,
        "definition": "(verb) Raised something to a higher position.",
        "sentences": [
            "She lifted the heavy box.",
            "He lifted her spirits.",
            "The fog lifted by noon."
        ]
        ,
        "synonyms": ["raised", "elevated", "hoisted"]
    },
    {
        "word": "LIGHT",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun / adjective / verb) Energy that makes things visible; not heavy; to ignite",
        "sentences": [
            "Turn on the light.",
            "The bag is very light.",
            "She lit the candle."
        ]
        ,
        "synonyms": ["luminosity", "bright", "gentle"]
    },
    {
        "word": "LIKE",
        "difficulty": 2,
        "tier": 1,
        "definition": "(preposition / verb) Similar to; to find enjoyable",
        "sentences": [
            "She runs like the wind.",
            "I like chocolate.",
            "Do you like music?"
        ]
        ,
        "synonyms": ["similar", "enjoy", "such-as"]
    },
    {
        "word": "LINE",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun / verb) A long thin mark; to form a row",
        "sentences": [
            "Draw a straight line.",
            "There was a long line at the store.",
            "She lined up the jars neatly."
        ]
        ,
        "synonyms": ["row", "mark", "boundary"]
    },
    {
        "word": "LIST",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun / verb) A series of items; to write a series of items",
        "sentences": [
            "She made a shopping list.",
            "List all the things you need.",
            "Cross items off the list."
        ]
        ,
        "synonyms": ["catalog", "series", "enumerate"]
    },
    {
        "word": "LISTEN",
        "difficulty": 2,
        "tier": 4,
        "definition": "(verb) To pay attention to sound",
        "sentences": [
            "Please listen carefully.",
            "She loves to listen to music.",
            "He listened without saying a word."
        ]
        ,
        "synonyms": ["hear", "pay-attention", "heed"]
    },
    {
        "word": "LITTLE",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective / adverb) Small in size or amount",
        "sentences": [
            "She has a little cat.",
            "I am a little tired.",
            "He ate only a little."
        ]
        ,
        "synonyms": ["small", "minor", "few"]
    },
    {
        "word": "LIVE",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb / adjective) To be alive; happening now",
        "sentences": [
            "Do you live near here?",
            "We watched the live concert.",
            "Plants need water to live."
        ]
        ,
        "synonyms": ["exist", "reside", "breathe"]
    },
    {
        "word": "LOCATED",
        "difficulty": 5,
        "tier": 10,
        "definition": "(verb / adjective) Situated or positioned in a particular place.",
        "sentences": [
            "She located the source.",
            "The school is located near the park.",
            "He located the missing file."
        ]
        ,
        "synonyms": ["situated", "placed", "positioned"]
    },
    {
        "word": "LONG",
        "difficulty": 2,
        "tier": 1,
        "definition": "(adjective / adverb) Of great length or duration",
        "sentences": [
            "It was a long road.",
            "She has long hair.",
            "We waited a long time."
        ]
        ,
        "synonyms": ["extended", "lengthy", "yearn"]
    },
    {
        "word": "LOOK",
        "difficulty": 2,
        "tier": 1,
        "definition": "(verb / noun) To direct one's eyes; the act of seeing",
        "sentences": [
            "Look at the stars!",
            "Take a look at this.",
            "She gave him a long look."
        ]
        ,
        "synonyms": ["see", "appear", "gaze"]
    },
    {
        "word": "LOST",
        "difficulty": 2,
        "tier": 8,
        "definition": "(verb / adjective) Failed to keep or find something; no longer able to find the way.",
        "sentences": [
            "She lost her way.",
            "He lost his keys.",
            "The dog was lost for two days."
        ]
        ,
        "synonyms": ["misplaced", "defeated", "confused"]
    },
    {
        "word": "LOT",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) A large number or amount; an area of land",
        "sentences": [
            "She has a lot of books.",
            "There was a lot to do.",
            "He bought an empty lot."
        ]
        ,
        "synonyms": ["many", "plot", "bunch"]
    },
    {
        "word": "LOUD",
        "difficulty": 2,
        "tier": 9,
        "definition": "(adjective) Making a lot of noise",
        "sentences": [
            "The music was too loud.",
            "He has a loud laugh.",
            "She spoke in a loud voice."
        ]
        ,
        "synonyms": ["noisy", "boisterous", "strong"]
    },
    {
        "word": "LOVE",
        "difficulty": 2,
        "tier": 6,
        "definition": "(verb / noun) To feel deep affection; a deep feeling of affection",
        "sentences": [
            "She loves her family.",
            "I love sunny days.",
            "He smiled with love."
        ]
        ,
        "synonyms": ["affection", "adore", "cherish"]
    },
    {
        "word": "LOW",
        "difficulty": 2,
        "tier": 4,
        "definition": "(adjective / adverb) Not high; below average",
        "sentences": [
            "The sun was low in the sky.",
            "She spoke in a low voice.",
            "The river is very low this year."
        ]
        ,
        "synonyms": ["short", "quiet", "inferior"]
    },
    {
        "word": "MACHINE",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun) A device with moving parts that does work",
        "sentences": [
            "The machine broke down.",
            "She used the coffee machine.",
            "He fixed the machine himself."
        ]
        ,
        "synonyms": ["device", "mechanism", "apparatus"]
    },
    {
        "word": "MADE",
        "difficulty": 2,
        "tier": 1,
        "definition": "(verb) Created or constructed something; caused something to exist.",
        "sentences": [
            "She made a cake.",
            "He made a big mistake.",
            "They made a new rule."
        ]
        ,
        "synonyms": ["created", "built", "caused"]
    },
    {
        "word": "MAIN",
        "difficulty": 2,
        "tier": 6,
        "definition": "(adjective) The most important; principal",
        "sentences": [
            "What is the main idea?",
            "She found the main entrance.",
            "He waited on the main road."
        ]
        ,
        "synonyms": ["primary", "chief", "principal"]
    },
    {
        "word": "MAJOR",
        "difficulty": 5,
        "tier": 9,
        "definition": "(adjective / noun) Important; a high military rank; a field of study",
        "sentences": [
            "She made a major discovery.",
            "He studied music as his major.",
            "It was a major event."
        ]
        ,
        "synonyms": ["large", "important", "key"]
    },
    {
        "word": "MAKE",
        "difficulty": 2,
        "tier": 1,
        "definition": "(verb) To create or produce something",
        "sentences": [
            "Let's make a cake.",
            "She can make her own clothes.",
            "He made a paper plane."
        ]
        ,
        "synonyms": ["create", "produce", "cause"]
    },
    {
        "word": "MALL",
        "difficulty": 2,
        "tier": 9,
        "definition": "(noun) A large shopping center",
        "sentences": [
            "She went to the mall.",
            "He met her at the mall.",
            "The mall was very busy on Saturday."
        ]
        ,
        "synonyms": ["shopping-center", "plaza", "arcade"]
    },
    {
        "word": "MANY",
        "difficulty": 2,
        "tier": 1,
        "definition": "(adjective / pronoun) A large number of",
        "sentences": [
            "Many birds flew south.",
            "How many apples are left?",
            "She has many friends."
        ]
        ,
        "synonyms": ["numerous", "multiple", "plenty"]
    },
    {
        "word": "MAP",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun / verb) A diagram of an area; to record or chart",
        "sentences": [
            "She looked at the map.",
            "He mapped the new hiking trail.",
            "The map showed the whole city."
        ]
        ,
        "synonyms": ["chart", "diagram", "plan"]
    },
    {
        "word": "MARCH",
        "difficulty": 2,
        "tier": 10,
        "definition": "(verb / noun) To walk in a steady regular way; a walk; a month",
        "sentences": [
            "She marched in the parade.",
            "March is the third month.",
            "He marched off proudly."
        ]
        ,
        "synonyms": ["walk", "advance", "parade"]
    },
    {
        "word": "MARK",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun / verb) A visible impression or spot on a surface; to put a symbol or stain on something.",
        "sentences": [
            "She got full marks on her test.",
            "Mark the spot with an X.",
            "There was a mark on the wall."
        ]
        ,
        "synonyms": ["sign", "score", "indicate"]
    },
    {
        "word": "MATCH",
        "difficulty": 2,
        "tier": 10,
        "definition": "(noun / verb) A game; a stick for lighting fire; to be the same as",
        "sentences": [
            "She won the tennis match.",
            "These socks don't match.",
            "He struck a match."
        ]
        ,
        "synonyms": ["equal", "correspond", "pair"]
    },
    {
        "word": "MATERIAL",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun / adjective) The substance from which things are made; physical",
        "sentences": [
            "What material is this bag made from?",
            "She chose a soft material.",
            "The material was not relevant."
        ]
        ,
        "synonyms": ["substance", "fabric", "matter"]
    },
    {
        "word": "MATTER",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun / verb) Physical substance; to be important",
        "sentences": [
            "It doesn't matter.",
            "What is the matter?",
            "All matter takes up space."
        ]
        ,
        "synonyms": ["issue", "substance", "importance"]
    },
    {
        "word": "MAY",
        "difficulty": 2,
        "tier": 1,
        "definition": "(verb) Expressing permission or possibility",
        "sentences": [
            "May I sit here?",
            "It may rain today.",
            "You may leave when you're done."
        ]
        ,
        "synonyms": ["might", "can", "permission"]
    },
    {
        "word": "MAYBE",
        "difficulty": 2,
        "tier": 8,
        "definition": "(adverb) Perhaps; possibly",
        "sentences": [
            "Maybe it will snow.",
            "She said maybe.",
            "Maybe we should try again."
        ]
        ,
        "synonyms": ["perhaps", "possibly", "conceivably"]
    },
    {
        "word": "MEANS",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb / noun) Signifies; method or way of doing something",
        "sentences": [
            "What does this word mean?",
            "She found the means to solve it.",
            "Hard work means success."
        ]
        ,
        "synonyms": ["method", "implies", "resources"]
    },
    {
        "word": "MEASURE",
        "difficulty": 5,
        "tier": 4,
        "definition": "(verb / noun) To find size or amount; a way of determining size",
        "sentences": [
            "She measured the window.",
            "Please take the measurements.",
            "He used a ruler to measure the line."
        ]
        ,
        "synonyms": ["gauge", "quantity", "assess"]
    },
    {
        "word": "MEAT",
        "difficulty": 2,
        "tier": 9,
        "definition": "(noun) The flesh of animals used as food",
        "sentences": [
            "She doesn't eat meat.",
            "He cooked the meat slowly.",
            "The meat was very tender."
        ]
        ,
        "synonyms": ["flesh", "protein", "cut"]
    },
    {
        "word": "MEET",
        "difficulty": 2,
        "tier": 6,
        "definition": "(verb) To come together with someone",
        "sentences": [
            "Let's meet at noon.",
            "She met her best friend at school.",
            "It is nice to meet you."
        ]
        ,
        "synonyms": ["encounter", "join", "gather"]
    },
    {
        "word": "MELODY",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun) A sequence of musical notes",
        "sentences": [
            "She hummed a soft melody.",
            "He whistled a cheerful melody.",
            "The melody stayed in her head."
        ]
        ,
        "synonyms": ["tune", "song", "refrain"]
    },
    {
        "word": "MEMBERS",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun) People or things that belong to or form part of a group",
        "sentences": [
            "All members must pay a fee.",
            "She is one of the club's members.",
            "The members voted for a change."
        ]
        ,
        "synonyms": ["participants", "parts", "associates"]
    },
    {
        "word": "MEN",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun) Adult male human beings.",
        "sentences": [
            "Several men helped move the furniture.",
            "The men played football.",
            "Two men stood at the door."
        ]
        ,
        "synonyms": ["males", "mankind", "gentlemen"]
    },
    {
        "word": "METAL",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) A hard shiny material like iron or gold",
        "sentences": [
            "The gate is made of metal.",
            "She found a piece of metal.",
            "Metal conducts electricity."
        ]
        ,
        "synonyms": ["ore", "alloy", "element"]
    },
    {
        "word": "METHOD",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun) A way of doing something",
        "sentences": [
            "She used a new method.",
            "Try a different method.",
            "What method do you use?"
        ]
        ,
        "synonyms": ["approach", "way", "technique"]
    },
    {
        "word": "METICULOUS",
        "difficulty": 5,
        "definition": "(adj.) Showing great attention to detail.",
        "sentence": "He was meticulous in his work.",
        "hint": "Careful."
        ,
        "synonyms": ["careful", "thorough", "precise"]
    },
    {
        "word": "MIDDLE",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun / adjective) The center point; between two extremes",
        "sentences": [
            "She stood in the middle.",
            "He sat in the middle seat.",
            "The middle section was the longest."
        ]
        ,
        "synonyms": ["center", "amid", "intermediate"]
    },
    {
        "word": "MIGHT",
        "difficulty": 2,
        "tier": 3,
        "definition": "(verb / noun) Expressing possibility; great strength or power",
        "sentences": [
            "It might rain today.",
            "She tried with all her might.",
            "He might be home by now."
        ]
        ,
        "synonyms": ["power", "may", "strength"]
    },
    {
        "word": "MILE",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) A unit of distance equal to 1,760 yards",
        "sentences": [
            "She ran a mile.",
            "We drove for twenty miles.",
            "The beach is half a mile away."
        ]
        ,
        "synonyms": ["distance", "measure", "unit"]
    },
    {
        "word": "MILK",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) A white liquid produced by female mammals to nourish their young.",
        "sentences": [
            "She poured milk on her cereal.",
            "Cows produce milk.",
            "He added milk to the tea."
        ]
        ,
        "synonyms": ["dairy", "liquid", "feed"]
    },
    {
        "word": "MILLION",
        "difficulty": 2,
        "tier": 6,
        "definition": "(number / noun) The number 1,000,000",
        "sentences": [
            "A million stars filled the sky.",
            "She sold a million copies.",
            "He won a million pounds."
        ]
        ,
        "synonyms": ["1000-thousand", "large-number", "mega"]
    },
    {
        "word": "MIND",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun / verb) The thinking part of a person; to object to",
        "sentences": [
            "She has a sharp mind.",
            "Do you mind if I sit here?",
            "Keep an open mind."
        ]
        ,
        "synonyms": ["intellect", "brain", "think"]
    },
    {
        "word": "MINE",
        "difficulty": 2,
        "tier": 9,
        "definition": "(pronoun / noun) Belonging to the speaker; a tunnel dug for minerals",
        "sentences": [
            "That book is mine.",
            "He works in a coal mine.",
            "Is this chair mine?"
        ]
        ,
        "synonyms": ["own", "excavate", "dig"]
    },
    {
        "word": "MINUTES",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun) Units of time each lasting sixty seconds; also, extremely small details.",
        "sentences": [
            "Dinner will be ready in ten minutes.",
            "She waited for a few minutes.",
            "He ran the mile in six minutes."
        ]
        ,
        "synonyms": ["record", "moments", "notes"]
    },
    {
        "word": "MISS",
        "difficulty": 2,
        "tier": 3,
        "definition": "(verb / noun) To fail to hit or catch; a title for an unmarried woman",
        "sentences": [
            "I miss you so much.",
            "She missed the bus.",
            "Good morning, Miss Smith."
        ]
        ,
        "synonyms": ["fail-to-hit", "long-for", "mistake"]
    },
    {
        "word": "MODERN",
        "difficulty": 5,
        "tier": 9,
        "definition": "(adjective) Relating to the present time; up to date",
        "sentences": [
            "She likes modern art.",
            "He drives a modern car.",
            "The building has a modern design."
        ]
        ,
        "synonyms": ["contemporary", "current", "up-to-date"]
    },
    {
        "word": "MOLECULES",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun) The smallest units of a chemical compound that retain its properties, made of two or more atoms.",
        "sentences": [
            "Water is made of molecules.",
            "She studied molecules in chemistry.",
            "Molecules are too tiny to see."
        ]
        ,
        "synonyms": ["particles", "atoms", "compounds"]
    },
    {
        "word": "MOMENT",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) A very short period of time",
        "sentences": [
            "She paused for a moment.",
            "That was a special moment.",
            "Just a moment, please."
        ]
        ,
        "synonyms": ["instant", "occasion", "second"]
    },
    {
        "word": "MONEY",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun) Currency used to pay for goods and services",
        "sentences": [
            "She saved her money for a trip.",
            "Do you have any money?",
            "Money doesn't grow on trees."
        ]
        ,
        "synonyms": ["currency", "funds", "cash"]
    },
    {
        "word": "MONTHS",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun) The twelve named periods into which a year is divided.",
        "sentences": [
            "She lived there for six months.",
            "The project took many months.",
            "There are twelve months in a year."
        ]
        ,
        "synonyms": ["periods", "time-units", "twelve"]
    },
    {
        "word": "MOON",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun) The natural satellite orbiting Earth",
        "sentences": [
            "The moon shone brightly.",
            "She gazed at the full moon.",
            "A full moon lights up the night."
        ]
        ,
        "synonyms": ["lunar", "satellite", "crescent"]
    },
    {
        "word": "MORE",
        "difficulty": 2,
        "tier": 1,
        "definition": "(adjective / adverb) A greater amount or degree",
        "sentences": [
            "Can I have more juice?",
            "She works more than anyone.",
            "We need more time."
        ]
        ,
        "synonyms": ["additional", "extra", "further"]
    },
    {
        "word": "MORNING",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun) The first part of the day",
        "sentences": [
            "She sings every morning.",
            "Good morning!",
            "He jogs in the morning."
        ]
        ,
        "synonyms": ["dawn", "early-day", "daybreak"]
    },
    {
        "word": "MOST",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective / adverb) The greatest amount; to the highest degree",
        "sentences": [
            "Most kids like ice cream.",
            "She was the most helpful.",
            "I ate the most cake."
        ]
        ,
        "synonyms": ["greatest", "majority", "maximum"]
    },
    {
        "word": "MOTHER",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun) A female parent",
        "sentences": [
            "Her mother made dinner.",
            "She is a great mother.",
            "The mother bird fed her chicks."
        ]
        ,
        "synonyms": ["mum", "mama", "matriarch"]
    },
    {
        "word": "MOUNTAINS",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) Large, steep landmasses that rise significantly above the surrounding terrain.",
        "sentences": [
            "The mountains were covered in snow.",
            "She hiked through the mountains.",
            "The view of the mountains was stunning."
        ]
        ,
        "synonyms": ["peaks", "highlands", "ranges"]
    },
    {
        "word": "MOUTH",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) The opening in the face used for eating and speaking",
        "sentences": [
            "She opened her mouth to speak.",
            "Don't talk with your mouth full.",
            "He had a big smile on his mouth."
        ]
        ,
        "synonyms": ["opening", "lips", "oral-cavity"]
    },
    {
        "word": "MOVE",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb) To change position; to travel",
        "sentences": [
            "She moved the chair.",
            "They are moving to a new house.",
            "Don't move a muscle."
        ]
        ,
        "synonyms": ["shift", "advance", "motivate"]
    },
    {
        "word": "MOVEMENT",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) The act of moving; a group working for a cause",
        "sentences": [
            "She felt a sudden movement.",
            "He joined the environmental movement.",
            "Every movement was graceful."
        ]
        ,
        "synonyms": ["motion", "shift", "campaign"]
    },
    {
        "word": "MUCH",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective / adverb) A large amount; to a great degree",
        "sentences": [
            "She doesn't eat much.",
            "Thank you so much.",
            "How much does it cost?"
        ]
        ,
        "synonyms": ["many", "greatly", "considerably"]
    },
    {
        "word": "MUSIC",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) Sounds arranged in a pleasing or expressive way",
        "sentences": [
            "She plays music every day.",
            "What kind of music do you like?",
            "The music at the party was great."
        ]
        ,
        "synonyms": ["sound", "melody", "harmony"]
    },
    {
        "word": "MUST",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb) Expressing necessity or obligation",
        "sentences": [
            "You must wear a seatbelt.",
            "She must be very tired.",
            "We must leave by noon."
        ]
        ,
        "synonyms": ["have-to", "need", "required"]
    },
    {
        "word": "NAME",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun / verb) A word or phrase used to identify a person, place, or thing; to give an identifying label to someone.",
        "sentences": [
            "What is your name?",
            "She named her cat Snowflake.",
            "His name is on the list."
        ]
        ,
        "synonyms": ["title", "identity", "call"]
    },
    {
        "word": "NATION",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun) A country considered as a group of people",
        "sentences": [
            "She is proud of her nation.",
            "The whole nation watched the event.",
            "A nation needs strong leaders."
        ]
        ,
        "synonyms": ["country", "state", "people"]
    },
    {
        "word": "NATURAL",
        "difficulty": 5,
        "tier": 7,
        "definition": "(adjective) Found in the world around us; not created or altered by people.",
        "sentences": [
            "She has natural talent.",
            "Honey is a natural sweetener.",
            "It is natural to feel nervous."
        ]
        ,
        "synonyms": ["innate", "organic", "normal"]
    },
    {
        "word": "NEAR",
        "difficulty": 2,
        "tier": 3,
        "definition": "(preposition / adjective) At a short distance; close to",
        "sentences": [
            "She lives near the school.",
            "The store is very near.",
            "Is the beach near here?"
        ]
        ,
        "synonyms": ["close", "beside", "adjacent"]
    },
    {
        "word": "NECESSARY",
        "difficulty": 5,
        "tier": 9,
        "definition": "(adjective) Required; needed",
        "sentences": [
            "Sleep is necessary.",
            "Is it necessary to go?",
            "She brought only what was necessary."
        ]
        ,
        "synonyms": ["essential", "required", "vital"]
    },
    {
        "word": "NEED",
        "difficulty": 2,
        "tier": 2,
        "definition": "(verb / noun) To require something; a requirement",
        "sentences": [
            "I need some help.",
            "We need more water.",
            "She has all she needs."
        ]
        ,
        "synonyms": ["require", "want", "must-have"]
    },
    {
        "word": "NEVER",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adverb) At no time; not ever",
        "sentences": [
            "She has never been to Spain.",
            "Never give up.",
            "I will never forget that day."
        ]
        ,
        "synonyms": ["not-ever", "at-no-time", "not-once"]
    },
    {
        "word": "NEW",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective) Recently made or not previously known",
        "sentences": [
            "She got a new bike.",
            "I started a new book.",
            "The new student joined our class."
        ]
        ,
        "synonyms": ["fresh", "novel", "recent"]
    },
    {
        "word": "NEXT",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adjective / adverb) Immediately following; nearest",
        "sentences": [
            "She is next in line.",
            "Next, add the eggs.",
            "I will see you next week."
        ]
        ,
        "synonyms": ["following", "adjacent", "upcoming"]
    },
    {
        "word": "NIGHT",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) The period of darkness between sunset and sunrise",
        "sentences": [
            "She likes to read at night.",
            "It was a quiet night.",
            "The stars shone all night long."
        ]
        ,
        "synonyms": ["dark", "evening", "nocturnal"]
    },
    {
        "word": "NORTH",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun / adjective) The direction toward the top of a map or compass; relating to the upper region.",
        "sentences": [
            "She drove north for two hours.",
            "The north wind is cold.",
            "They live in north Wales."
        ]
        ,
        "synonyms": ["direction", "polar", "upward"]
    },
    {
        "word": "NORTHERN",
        "difficulty": 2,
        "tier": 10,
        "definition": "(adjective) Situated toward the direction of the North Pole; coming from the north.",
        "sentences": [
            "She lives in northern Scotland.",
            "The northern lights are beautiful.",
            "He came from northern England."
        ]
        ,
        "synonyms": ["northern-region", "upper", "boreal"]
    },
    {
        "word": "NOSE",
        "difficulty": 2,
        "tier": 10,
        "definition": "(noun) The part of the face used for breathing and smelling",
        "sentences": [
            "She wrinkled her nose.",
            "He blew his nose.",
            "The dog sniffed with its nose."
        ]
        ,
        "synonyms": ["snout", "nasal", "smell-organ"]
    },
    {
        "word": "NOT",
        "difficulty": 2,
        "tier": 1,
        "definition": "(adverb) Used to make a word or phrase negative",
        "sentences": [
            "I am not tired.",
            "That is not correct.",
            "She did not come."
        ]
        ,
        "synonyms": ["no", "negative", "opposite"]
    },
    {
        "word": "NOTE",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun / verb) A short written message; to notice or observe",
        "sentences": [
            "She left a note on the table.",
            "He played the wrong note.",
            "Please note the time carefully."
        ]
        ,
        "synonyms": ["notice", "record", "sound"]
    },
    {
        "word": "NOTHING",
        "difficulty": 2,
        "tier": 5,
        "definition": "(pronoun) The absence of anything; not a single thing.",
        "sentences": [
            "There is nothing left.",
            "She said nothing.",
            "He did nothing all day."
        ]
        ,
        "synonyms": ["nil", "zero", "void"]
    },
    {
        "word": "NOTICE",
        "difficulty": 2,
        "tier": 4,
        "definition": "(verb / noun) To become aware of; a written announcement",
        "sentences": [
            "Did you notice her new haircut?",
            "She put up a notice on the board.",
            "He noticed a strange smell."
        ]
        ,
        "synonyms": ["observe", "sign", "announcement"]
    },
    {
        "word": "NOUN",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun) A word that identifies a person, place, object, or idea.",
        "sentences": [
            "Cat is a noun.",
            "She circled every noun.",
            "A noun can be a person, place, or thing."
        ]
        ,
        "synonyms": ["thing-word", "naming-word", "substantive"]
    },
    {
        "word": "NOW",
        "difficulty": 2,
        "tier": 1,
        "definition": "(adverb) At the present time",
        "sentences": [
            "She is sleeping now.",
            "Now is a good time to start.",
            "Do it now, please."
        ]
        ,
        "synonyms": ["present", "at-this-moment", "immediately"]
    },
    {
        "word": "NUMBER",
        "difficulty": 2,
        "tier": 1,
        "definition": "(noun) A mathematical value or count",
        "sentences": [
            "Pick a number from one to ten.",
            "What is your phone number?",
            "A large number of people came."
        ]
        ,
        "synonyms": ["digit", "quantity", "numeral"]
    },
    {
        "word": "NUMERAL",
        "difficulty": 5,
        "tier": 4,
        "definition": "(noun) A symbol used to represent a number",
        "sentences": [
            "She learned Roman numerals.",
            "The clock uses Roman numerals.",
            "Write the numeral five."
        ]
        ,
        "synonyms": ["digit", "figure", "number"]
    },
    {
        "word": "OBJECT",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun / verb) A physical thing; to express disagreement",
        "sentences": [
            "She found a strange object.",
            "He objected to the new rule.",
            "What is that shiny object?"
        ]
        ,
        "synonyms": ["thing", "item", "oppose"]
    },
    {
        "word": "OBSERVE",
        "difficulty": 5,
        "tier": 9,
        "definition": "(verb) To watch carefully; to notice",
        "sentences": [
            "She observed the birds.",
            "He observed the rules.",
            "Scientists observe nature closely."
        ]
        ,
        "synonyms": ["watch", "notice", "study"]
    },
    {
        "word": "OCEAN",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun) A very large body of salt water",
        "sentences": [
            "The ocean is deep and wide.",
            "She sailed across the ocean.",
            "Many creatures live in the ocean."
        ]
        ,
        "synonyms": ["sea", "deep", "marine"]
    },
    {
        "word": "OFF",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adverb / preposition) Away from; not operating",
        "sentences": [
            "Turn the light off.",
            "She jumped off the swing.",
            "The TV is off."
        ]
        ,
        "synonyms": ["away", "not-on", "shut"]
    },
    {
        "word": "OFFICE",
        "difficulty": 2,
        "tier": 10,
        "definition": "(noun) A room used for work; a position of authority",
        "sentences": [
            "She works in an office.",
            "He held public office.",
            "The post office is on the high street."
        ]
        ,
        "synonyms": ["workplace", "bureau", "position"]
    },
    {
        "word": "OFTEN",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adverb) Frequently; many times",
        "sentences": [
            "She often walks to school.",
            "How often do you exercise?",
            "He often reads before bed."
        ]
        ,
        "synonyms": ["frequently", "regularly", "commonly"]
    },
    {
        "word": "OLD",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective) Having lived or existed for a long time",
        "sentences": [
            "This house is very old.",
            "My dog is five years old.",
            "She found an old photo."
        ]
        ,
        "synonyms": ["aged", "ancient", "former"]
    },
    {
        "word": "ONCE",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adverb / conjunction) One time; at the same time as",
        "sentences": [
            "She visited once a year.",
            "Once, she got lost in the woods.",
            "Once you start, don't stop."
        ]
        ,
        "synonyms": ["one-time", "formerly", "as-soon-as"]
    },
    {
        "word": "ONE",
        "difficulty": 2,
        "tier": 1,
        "definition": "(number / pronoun) The lowest whole number; a single person or thing",
        "sentences": [
            "I have one sister.",
            "One of us will go.",
            "Take one cookie."
        ]
        ,
        "synonyms": ["single", "unity", "alone"]
    },
    {
        "word": "ONLY",
        "difficulty": 2,
        "tier": 2,
        "definition": "(adjective / adverb) Single; no more than",
        "sentences": [
            "She is the only one left.",
            "I only have one coin.",
            "He only sleeps four hours a night."
        ]
        ,
        "synonyms": ["solely", "merely", "just"]
    },
    {
        "word": "OPEN",
        "difficulty": 2,
        "tier": 3,
        "definition": "(verb / adjective) To make accessible; not closed",
        "sentences": [
            "Open the window please.",
            "The shop is open all day.",
            "She opened the gift slowly."
        ]
        ,
        "synonyms": ["accessible", "unlock", "public"]
    },
    {
        "word": "OPPOSITE",
        "difficulty": 5,
        "tier": 10,
        "definition": "(adjective / noun) Completely different; something contrary",
        "sentences": [
            "They have opposite opinions.",
            "She sat opposite him.",
            "Black is the opposite of white."
        ]
        ,
        "synonyms": ["contrary", "reverse", "facing"]
    },
    {
        "word": "ORDER",
        "difficulty": 2,
        "tier": 4,
        "definition": "(noun / verb) An arrangement; a command; to request something",
        "sentences": [
            "She placed an order online.",
            "He gave the order to start.",
            "Keep your things in order."
        ]
        ,
        "synonyms": ["command", "sequence", "request"]
    },
    {
        "word": "OTHER",
        "difficulty": 2,
        "tier": 1,
        "definition": "(adjective / pronoun) Different from the one mentioned; additional",
        "sentences": [
            "The other kids were quiet.",
            "Do you have any other ideas?",
            "I'll take the other one."
        ]
        ,
        "synonyms": ["different", "another", "remaining"]
    },
    {
        "word": "OUR",
        "difficulty": 2,
        "tier": 2,
        "definition": "(pronoun) Belonging to the speaker and others",
        "sentences": [
            "This is our house.",
            "We did our best.",
            "Our team won the game."
        ]
        ,
        "synonyms": ["belonging-to-us", "shared", "collective"]
    },
    {
        "word": "OUT",
        "difficulty": 2,
        "tier": 1,
        "definition": "(adverb / preposition) Away from the inside; not in",
        "sentences": [
            "She went out for a walk.",
            "Get out of the rain.",
            "The lights went out."
        ]
        ,
        "synonyms": ["outside", "beyond", "away"]
    },
    {
        "word": "OUTSIDE",
        "difficulty": 2,
        "tier": 7,
        "definition": "(noun / adverb / preposition) The outer area; not inside",
        "sentences": [
            "She played outside all day.",
            "It is cold outside.",
            "There is a cat outside the window."
        ]
        ,
        "synonyms": ["exterior", "outdoors", "external"]
    },
    {
        "word": "OVER",
        "difficulty": 2,
        "tier": 2,
        "definition": "(preposition / adverb) Above; finished; across",
        "sentences": [
            "The plane flew over our house.",
            "The game is over.",
            "She jumped over the puddle."
        ]
        ,
        "synonyms": ["above", "across", "finished"]
    },
    {
        "word": "OWN",
        "difficulty": 2,
        "tier": 3,
        "definition": "(adjective / verb) Belonging to oneself; to possess",
        "sentences": [
            "She has her own room.",
            "He owns a small shop.",
            "Do you own a pet?"
        ]
        ,
        "synonyms": ["possess", "personal", "individual"]
    },
    {
        "word": "OXYGEN",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun) A gas essential for breathing",
        "sentences": [
            "Plants produce oxygen.",
            "She needed more oxygen.",
            "Oxygen is needed for fire."
        ]
        ,
        "synonyms": ["gas", "element", "O2"]
    },
    {
        "word": "PAGE",
        "difficulty": 2,
        "tier": 2,
        "definition": "(noun) One side of a sheet of paper in a book",
        "sentences": [
            "Turn to page ten.",
            "She wrote on every page.",
            "The last page had a surprise ending."
        ]
        ,
        "synonyms": ["leaf", "screen", "summon"]
    },
    {
        "word": "PAINT",
        "difficulty": 2,
        "tier": 6,
        "definition": "(verb / noun) To cover with color; a colored liquid used for painting",
        "sentences": [
            "She painted the fence white.",
            "He mixed the paint.",
            "The walls need a fresh coat of paint."
        ]
        ,
        "synonyms": ["color", "apply-paint", "depict"]
    },
    {
        "word": "PAIR",
        "difficulty": 2,
        "tier": 5,
        "definition": "(noun) A set of two matching things",
        "sentences": [
            "She bought a new pair of shoes.",
            "They make a great pair.",
            "He found a pair of socks."
        ]
        ,
        "synonyms": ["couple", "two", "match"]
    },
    {
        "word": "PAPER",
        "difficulty": 2,
        "tier": 3,
        "definition": "(noun) A thin material used for writing; a document",
        "sentences": [
            "She wrote on a sheet of paper.",
            "Please sign the paper.",
            "He folded the paper into a boat."
        ]
        ,
        "synonyms": ["document", "newspaper", "sheet"]
    },
    {
        "word": "PARAGRAPHS",
        "difficulty": 5,
        "tier": 6,
        "definition": "(noun) Distinct sections of written text, each developing a single idea.",
        "sentences": [
            "Write three paragraphs.",
            "Each of the paragraphs had a clear topic.",
            "She read the first two paragraphs."
        ]
        ,
        "synonyms": ["sections", "blocks", "passages"]
    },
    {
        "word": "PARK",
        "difficulty": 2,
        "tier": 9,
        "definition": "(noun / verb) A public outdoor space; to leave a vehicle in a space",
        "sentences": [
            "She walked through the park.",
            "He parked the car.",
            "The park is lovely in spring."
        ]
        ,
        "synonyms": ["garden", "reserve", "stop"]
    },
    {
        "word": "PART",
        "difficulty": 2,
        "tier": 1,
        "definition": "(noun / verb) A portion of a whole; to separate",
        "sentences": [
            "This is part of the plan.",
            "She played a big part in the show.",
            "They parted ways at the corner."
        ]
        ,
        "synonyms": ["piece", "role", "section"]
    },
    {
        "word": "PARTICULAR",
        "difficulty": 5,
        "tier": 9,
        "definition": "(adjective) Specific; exact",
        "sentences": [
            "She was looking for that particular book.",
            "Is there anything particular you need?",
            "He is very particular about his food."
        ]
        ,
        "synonyms": ["specific", "special", "individual"]
    },
    {
        "word": "PARTY",
        "difficulty": 2,
        "tier": 8,
        "definition": "(noun) A celebration; a group with shared goals",
        "sentences": [
            "She had a birthday party.",
            "He joined a political party.",
            "The party was full of laughter."
        ]
        ,
        "synonyms": ["group", "celebration", "faction"]
    },
    {
        "word": "PASSED",
        "difficulty": 2,
        "tier": 4,
        "definition": "(verb) Moved past something; went through an opening or a period of time.",
        "sentences": [
            "She passed the test.",
            "He passed me the salt.",
            "The car passed quickly."
        ]
        ,
        "synonyms": ["went-by", "approved", "exceeded"]
    },
    {
        "word": "PAST",
        "difficulty": 2,
        "tier": 6,
        "definition": "(noun / adjective) A time that has gone by; having already happened",
        "sentences": [
            "She thought about the past.",
            "He drove past the school.",
            "The past can teach us a lot."
        ]
        ,
        "synonyms": ["former", "history", "beyond"]
    },
    {
        "word": "PATTERN",
        "difficulty": 5,
        "tier": 4,
        "definition": "(noun) A repeated design or arrangement",
        "sentences": [
            "She sewed a floral pattern.",
            "Can you spot the pattern?",
            "The carpet has a nice pattern."
        ]
        ,
        "synonyms": ["design", "sequence", "template"]
    },
    {
        "word": "PAY",
        "difficulty": 2,
        "tier": 8,
        "definition": "(verb / noun) To give money; wages",
        "sentences": [
            "She paid for the meal.",
            "He got a pay rise.",
            "How much do I pay?"
        ]
        ,
        "synonyms": ["compensate", "salary", "settle"]
    },
    {
        "word": "PEOPLE",
        "difficulty": 3,
        "tier": 1,
        "definition": "(noun) Human beings in general; a group of persons",
        "sentences": [
            "Many people came to the show.",
            "People need food and water.",
            "She likes meeting new people."
        ]
        ,
        "synonyms": ["persons", "humans", "society"]
    },
    {
        "word": "PER",
        "difficulty": 3,
        "tier": 7,
        "definition": "(preposition) For each; by means of",
        "sentences": [
            "It costs ten pounds per person.",
            "She runs five miles per day.",
            "He earns more per hour now."
        ]
        ,
        "synonyms": ["for-each", "each", "per-unit"]
    },
    {
        "word": "PERHAPS",
        "difficulty": 5,
        "tier": 6,
        "definition": "(adverb) Possibly; maybe",
        "sentences": [
            "Perhaps she will come.",
            "That is perhaps the best idea.",
            "He was, perhaps, right."
        ]
        ,
        "synonyms": ["maybe", "possibly", "conceivably"]
    },
    {
        "word": "PERIOD",
        "difficulty": 5,
        "tier": 8,
        "definition": "(noun) A length of time; a punctuation mark (.)",
        "sentences": [
            "She studied this period in history.",
            "End the sentence with a period.",
            "It was a difficult period."
        ]
        ,
        "synonyms": ["era", "time-span", "full-stop"]
    },
    {
        "word": "PERSON",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun) A human being",
        "sentences": [
            "She is a very kind person.",
            "Each person got a turn.",
            "Who is that person?"
        ]
        ,
        "synonyms": ["individual", "human", "being"]
    },
    {
        "word": "PHRASE",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun) A small group of words forming part of a sentence",
        "sentences": [
            "A phrase is part of a sentence.",
            "She used a great phrase.",
            "He didn't understand the phrase."
        ]
        ,
        "synonyms": ["expression", "saying", "clause"]
    },
    {
        "word": "PICKED",
        "difficulty": 3,
        "tier": 6,
        "definition": "(verb) Selected from a group; harvested fruit or flowers by hand.",
        "sentences": [
            "She picked flowers in the garden.",
            "He picked the winning number.",
            "They picked apples from the tree."
        ]
        ,
        "synonyms": ["chosen", "selected", "harvested"]
    },
    {
        "word": "PICTURE",
        "difficulty": 3,
        "tier": 2,
        "definition": "(noun) A drawing, painting, or photograph",
        "sentences": [
            "She drew a picture of her cat.",
            "Hang the picture on the wall.",
            "I took a picture of the sunset."
        ]
        ,
        "synonyms": ["image", "photo", "illustration"]
    },
    {
        "word": "PIECE",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) A portion or part of something",
        "sentences": [
            "Can I have a piece of cake?",
            "She found a missing piece.",
            "He played a beautiful piece of music."
        ]
        ,
        "synonyms": ["part", "portion", "fragment"]
    },
    {
        "word": "PLACE",
        "difficulty": 3,
        "tier": 2,
        "definition": "(noun / verb) A particular location; to put somewhere",
        "sentences": [
            "This is a great place.",
            "Place the cup on the table.",
            "She found a quiet place to read."
        ]
        ,
        "synonyms": ["location", "position", "put"]
    },
    {
        "word": "PLAINS",
        "difficulty": 5,
        "tier": 8,
        "definition": "(noun) Vast, flat expanses of land with few trees.",
        "sentences": [
            "Buffalo roam the plains.",
            "The plains stretched for miles.",
            "She stared out across the open plains."
        ]
        ,
        "synonyms": ["flatlands", "prairies", "steppes"]
    },
    {
        "word": "PLAN",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun / verb) A proposal or intention; to decide in advance",
        "sentences": [
            "What is your plan?",
            "She planned the whole trip.",
            "He had a clever plan."
        ]
        ,
        "synonyms": ["scheme", "design", "intend"]
    },
    {
        "word": "PLANE",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun) An aircraft; a flat surface",
        "sentences": [
            "She watched the plane take off.",
            "He drew a flat plane in maths.",
            "The plane landed smoothly."
        ]
        ,
        "synonyms": ["aircraft", "flat-surface", "level"]
    },
    {
        "word": "PLANETS",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun) Large spherical bodies that orbit a star and do not produce their own light.",
        "sentences": [
            "She learned about the eight planets.",
            "Planets orbit the sun.",
            "He drew all the planets in order."
        ]
        ,
        "synonyms": ["worlds", "celestial-bodies", "spheres"]
    },
    {
        "word": "PLANT",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun / verb) A living organism that grows in soil; to put a seed in the ground",
        "sentences": [
            "Water the plant every day.",
            "She planted flowers in the garden.",
            "A cactus is a tough plant."
        ]
        ,
        "synonyms": ["grow", "greenery", "factory"]
    },
    {
        "word": "PLAY",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb / noun) To engage in fun activity; a theatrical performance",
        "sentences": [
            "The children love to play outside.",
            "She was in the school play.",
            "Let's play a game."
        ]
        ,
        "synonyms": ["game", "perform", "fun"]
    },
    {
        "word": "PLEASE",
        "difficulty": 3,
        "tier": 8,
        "definition": "(verb / adverb) To make happy; used to make a polite request",
        "sentences": [
            "Please sit down.",
            "She aimed to please.",
            "Can I have some water, please?"
        ]
        ,
        "synonyms": ["satisfy", "kindly", "delight"]
    },
    {
        "word": "PLURAL",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun / adjective) The grammatical form of a word indicating more than one person or thing.",
        "sentences": [
            "Cats is the plural of cat.",
            "She wrote the plural form.",
            "What is the plural of mouse?"
        ]
        ,
        "synonyms": ["multiple", "more-than-one", "collective"]
    },
    {
        "word": "POEM",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun) A piece of writing with rhythm and expression",
        "sentences": [
            "She wrote a lovely poem.",
            "He read a poem aloud.",
            "The poem made her smile."
        ]
        ,
        "synonyms": ["verse", "lyric", "rhyme"]
    },
    {
        "word": "POINT",
        "difficulty": 3,
        "tier": 2,
        "definition": "(noun / verb) A specific location; to indicate with a finger",
        "sentences": [
            "She made a good point.",
            "Don't point at people.",
            "What is the point of this?"
        ]
        ,
        "synonyms": ["location", "tip", "idea"]
    },
    {
        "word": "POLE",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) A long thin stick; either end of the Earth's axis",
        "sentences": [
            "She leaned on the pole.",
            "Penguins live near the South Pole.",
            "He put up the flag on the pole."
        ]
        ,
        "synonyms": ["post", "region", "stick"]
    },
    {
        "word": "POOR",
        "difficulty": 3,
        "tier": 7,
        "definition": "(adjective) Having little money; of low quality",
        "sentences": [
            "The family was very poor.",
            "That was a poor excuse.",
            "She felt sorry for the poor animal."
        ]
        ,
        "synonyms": ["impoverished", "bad", "unfortunate"]
    },
    {
        "word": "POSITION",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) A place or location; a job",
        "sentences": [
            "She is in a great position.",
            "He applied for the position.",
            "What position do you play?"
        ]
        ,
        "synonyms": ["location", "stance", "job"]
    },
    {
        "word": "POSSIBLE",
        "difficulty": 3,
        "tier": 7,
        "definition": "(adjective) Able to happen or exist",
        "sentences": [
            "Anything is possible.",
            "Is it possible to change?",
            "She did everything possible to help."
        ]
        ,
        "synonyms": ["feasible", "potential", "achievable"]
    },
    {
        "word": "POUNDS",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun) Units of weight equal to 16 ounces; also the primary unit of British currency.",
        "sentences": [
            "She lost ten pounds.",
            "That bag weighs twenty pounds.",
            "It costs five pounds."
        ]
        ,
        "synonyms": ["currency", "weight", "pounds-sterling"]
    },
    {
        "word": "POWER",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun / verb) The ability to do things; to supply energy to",
        "sentences": [
            "Knowledge is power.",
            "The wind powers the turbine.",
            "She used her power wisely."
        ]
        ,
        "synonyms": ["strength", "energy", "authority"]
    },
    {
        "word": "PRACTICE",
        "difficulty": 5,
        "tier": 8,
        "definition": "(noun / verb) Repeated activity to improve skill; to do repeatedly",
        "sentences": [
            "Practice makes perfect.",
            "She practiced piano every day.",
            "He went to football practice."
        ]
        ,
        "synonyms": ["exercise", "habit", "training"]
    },
    {
        "word": "PRAGMATIC",
        "difficulty": 5,
        "definition": "(adj.) Dealing with things realistically.",
        "sentence": "She took a pragmatic approach.",
        "hint": "Practical."
        ,
        "synonyms": ["practical", "realistic", "sensible"]
    },
    {
        "word": "PREPARED",
        "difficulty": 5,
        "tier": 10,
        "definition": "(verb / adjective) Made ready for use or an event in advance.",
        "sentences": [
            "She prepared a meal.",
            "He was well prepared.",
            "They prepared for the worst."
        ]
        ,
        "synonyms": ["ready", "equipped", "planned"]
    },
    {
        "word": "PRESENT",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun / adjective / verb) A gift; existing now; to show or offer",
        "sentences": [
            "She gave him a lovely present.",
            "All students must be present.",
            "He presented his work to the class."
        ]
        ,
        "synonyms": ["gift", "now", "introduce"]
    },
    {
        "word": "PRESIDENT",
        "difficulty": 5,
        "tier": 8,
        "definition": "(noun) The leader of a country or organization",
        "sentences": [
            "The president gave a speech.",
            "She was elected president of the club.",
            "He wrote a letter to the president."
        ]
        ,
        "synonyms": ["head-of-state", "leader", "chief"]
    },
    {
        "word": "PRETTY",
        "difficulty": 3,
        "tier": 10,
        "definition": "(adjective / adverb) Attractive; fairly or quite",
        "sentences": [
            "She has a pretty smile.",
            "It was pretty easy.",
            "He wore a pretty bow tie."
        ]
        ,
        "synonyms": ["attractive", "fairly", "lovely"]
    },
    {
        "word": "PRINTED",
        "difficulty": 3,
        "tier": 10,
        "definition": "(verb / adjective) Reproduced text or images on paper using ink or a press.",
        "sentences": [
            "She printed the tickets.",
            "He read the printed page.",
            "The forms were printed clearly."
        ]
        ,
        "synonyms": ["published", "typed", "produced"]
    },
    {
        "word": "PROBABLY",
        "difficulty": 3,
        "tier": 6,
        "definition": "(adverb) Almost certainly; most likely",
        "sentences": [
            "She will probably be late.",
            "It is probably the best choice.",
            "He's probably already there."
        ]
        ,
        "synonyms": ["likely", "presumably", "in-all-likelihood"]
    },
    {
        "word": "PROBLEM",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) A situation that needs to be solved",
        "sentences": [
            "She solved the problem quickly.",
            "That is a big problem.",
            "We worked together to fix the problem."
        ]
        ,
        "synonyms": ["issue", "challenge", "difficulty"]
    },
    {
        "word": "PROCESS",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun / verb) A series of steps; to treat or handle",
        "sentences": [
            "She learned the whole process.",
            "He processed the data.",
            "It is a long process."
        ]
        ,
        "synonyms": ["method", "procedure", "develop"]
    },
    {
        "word": "PRODUCE",
        "difficulty": 5,
        "tier": 5,
        "definition": "(verb / noun) To make or create; fresh fruits and vegetables",
        "sentences": [
            "She produces her own honey.",
            "The farm sells fresh produce.",
            "This factory produces toys."
        ]
        ,
        "synonyms": ["create", "yield", "make"]
    },
    {
        "word": "PRODUCTS",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) Items manufactured or grown to be sold or traded.",
        "sentences": [
            "They sell dairy products.",
            "She buys natural products.",
            "The shop has new products."
        ]
        ,
        "synonyms": ["goods", "items", "results"]
    },
    {
        "word": "PROPERTY",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) Land or possessions; a characteristic",
        "sentences": [
            "She bought a property.",
            "He protected his property.",
            "Rubber has elastic properties."
        ]
        ,
        "synonyms": ["asset", "land", "characteristic"]
    },
    {
        "word": "PROVIDE",
        "difficulty": 5,
        "tier": 9,
        "definition": "(verb) To supply or give something needed",
        "sentences": [
            "She provided food for everyone.",
            "Can you provide an example?",
            "He provided shelter for the family."
        ]
        ,
        "synonyms": ["supply", "offer", "give"]
    },
    {
        "word": "PULLED",
        "difficulty": 3,
        "tier": 4,
        "definition": "(verb) Drew something toward oneself by applying force.",
        "sentences": [
            "She pulled the door shut.",
            "He pulled out a coin.",
            "The horse pulled the cart."
        ]
        ,
        "synonyms": ["dragged", "tugged", "drawn"]
    },
    {
        "word": "PUSHED",
        "difficulty": 3,
        "tier": 7,
        "definition": "(verb) Applied force to move something away from oneself.",
        "sentences": [
            "She pushed the door open.",
            "He pushed the cart.",
            "They pushed through the crowd."
        ]
        ,
        "synonyms": ["shoved", "propelled", "forced"]
    },
    {
        "word": "PUT",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb) To place in a particular position",
        "sentences": [
            "Put the book on the shelf.",
            "She put on her coat.",
            "He put his hand up."
        ]
        ,
        "synonyms": ["place", "set", "position"]
    },
    {
        "word": "QUESTIONS",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) Sentences or phrases seeking an answer or information.",
        "sentences": [
            "She asked many questions.",
            "Any questions?",
            "He answered all the questions correctly."
        ]
        ,
        "synonyms": ["queries", "inquiries", "interrogations"]
    },
    {
        "word": "QUICKLY",
        "difficulty": 3,
        "tier": 5,
        "definition": "(adverb) At a fast speed; with little delay",
        "sentences": [
            "She ate quickly.",
            "He ran quickly to the door.",
            "Please come quickly!"
        ]
        ,
        "synonyms": ["rapidly", "fast", "swiftly"]
    },
    {
        "word": "QUIET",
        "difficulty": 3,
        "tier": 7,
        "definition": "(adjective) Making little noise; calm",
        "sentences": [
            "Please be quiet.",
            "The room was very quiet.",
            "She likes quiet mornings."
        ]
        ,
        "synonyms": ["silent", "calm", "still"]
    },
    {
        "word": "QUITE",
        "difficulty": 3,
        "tier": 7,
        "definition": "(adverb) To a certain degree; fairly",
        "sentences": [
            "It is quite cold today.",
            "She is quite good at painting.",
            "I am not quite sure."
        ]
        ,
        "synonyms": ["rather", "fairly", "completely"]
    },
    {
        "word": "RACE",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun / verb) A competition of speed; a group sharing common ancestry; to run fast",
        "sentences": [
            "She won the race!",
            "He raced his friend to the gate.",
            "The whole race watched with pride."
        ]
        ,
        "synonyms": ["competition", "ethnicity", "sprint"]
    },
    {
        "word": "RADIO",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun) A device that receives broadcast sound",
        "sentences": [
            "She turned on the radio.",
            "They heard the news on the radio.",
            "He fixed the old radio."
        ]
        ,
        "synonyms": ["broadcast", "wireless", "receiver"]
    },
    {
        "word": "RAIN",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun / verb) Water falling from clouds; to fall as water from clouds",
        "sentences": [
            "It rained all day.",
            "The rain made puddles.",
            "She loves dancing in the rain."
        ]
        ,
        "synonyms": ["precipitation", "drizzle", "shower"]
    },
    {
        "word": "RAISED",
        "difficulty": 3,
        "tier": 6,
        "definition": "(verb / adjective) Elevated something upward; brought up a child; increased an amount.",
        "sentences": [
            "She raised her hand.",
            "He was raised in the country.",
            "They raised money for charity."
        ]
        ,
        "synonyms": ["elevated", "grew-up", "collected"]
    },
    {
        "word": "RAN",
        "difficulty": 3,
        "tier": 5,
        "definition": "(verb) Moved swiftly on foot; operated or managed something.",
        "sentences": [
            "She ran to catch the bus.",
            "He ran all the way home.",
            "The dog ran through the field."
        ]
        ,
        "synonyms": ["sprinted", "operated", "fled"]
    },
    {
        "word": "RATHER",
        "difficulty": 3,
        "tier": 9,
        "definition": "(adverb) To a certain extent; preferably",
        "sentences": [
            "She would rather stay home.",
            "It was rather cold.",
            "I'd rather have tea."
        ]
        ,
        "synonyms": ["somewhat", "instead", "quite"]
    },
    {
        "word": "REACHED",
        "difficulty": 3,
        "tier": 4,
        "definition": "(verb) Extended as far as; arrived at a destination or conclusion.",
        "sentences": [
            "She reached the top of the hill.",
            "He reached for the last book.",
            "We finally reached the city."
        ]
        ,
        "synonyms": ["arrived-at", "achieved", "contacted"]
    },
    {
        "word": "READ",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb) To look at and understand written words",
        "sentences": [
            "She loves to read.",
            "He read the letter aloud.",
            "Can you read this sign?"
        ]
        ,
        "synonyms": ["study", "interpret", "peruse"]
    },
    {
        "word": "READY",
        "difficulty": 3,
        "tier": 6,
        "definition": "(adjective) Prepared and able to act",
        "sentences": [
            "Are you ready to go?",
            "She was ready before everyone else.",
            "Dinner is almost ready."
        ]
        ,
        "synonyms": ["prepared", "willing", "set"]
    },
    {
        "word": "REAL",
        "difficulty": 3,
        "tier": 3,
        "definition": "(adjective) Actually existing; not imaginary",
        "sentences": [
            "Is this a real diamond?",
            "She has real talent.",
            "He could not believe it was real."
        ]
        ,
        "synonyms": ["actual", "genuine", "true"]
    },
    {
        "word": "REASON",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun) The cause or explanation for something",
        "sentences": [
            "She gave no reason for being late.",
            "Is there a reason for this?",
            "He had good reasons to be proud."
        ]
        ,
        "synonyms": ["cause", "rationale", "motive"]
    },
    {
        "word": "RECEIVED",
        "difficulty": 3,
        "tier": 8,
        "definition": "(verb) Was given or accepted something offered or sent.",
        "sentences": [
            "She received a lovely letter.",
            "He received good news.",
            "They received a warm welcome."
        ]
        ,
        "synonyms": ["got", "accepted", "welcomed"]
    },
    {
        "word": "RECORD",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun / verb) A written account; to set down information",
        "sentences": [
            "She set a new world record.",
            "He recorded the meeting.",
            "Keep a record of your spending."
        ]
        ,
        "synonyms": ["log", "account", "register"]
    },
    {
        "word": "RED",
        "difficulty": 3,
        "tier": 4,
        "definition": "(adjective / noun) The color of blood or fire",
        "sentences": [
            "She wore a red coat.",
            "His face went bright red.",
            "Roses are red."
        ]
        ,
        "synonyms": ["crimson", "scarlet", "ruby"]
    },
    {
        "word": "REGION",
        "difficulty": 5,
        "tier": 6,
        "definition": "(noun) An area with shared characteristics",
        "sentences": [
            "She lives in a mountainous region.",
            "The region is known for its wine.",
            "He explored every region of the country."
        ]
        ,
        "synonyms": ["area", "zone", "territory"]
    },
    {
        "word": "REMAIN",
        "difficulty": 5,
        "tier": 7,
        "definition": "(verb) To stay in the same place or condition",
        "sentences": [
            "She remained calm.",
            "He remained behind after school.",
            "Some questions remain unanswered."
        ]
        ,
        "synonyms": ["stay", "persist", "last"]
    },
    {
        "word": "REMEMBER",
        "difficulty": 3,
        "tier": 4,
        "definition": "(verb) To recall or keep in mind",
        "sentences": [
            "Do you remember me?",
            "She always remembers birthdays.",
            "Remember to lock the door."
        ]
        ,
        "synonyms": ["recall", "recollect", "retain"]
    },
    {
        "word": "REPEATED",
        "difficulty": 5,
        "tier": 10,
        "definition": "(verb / adjective) Said or done again; happening more than once",
        "sentences": [
            "She repeated the question.",
            "He made the same mistake repeatedly.",
            "The lesson was repeated for clarity."
        ]
        ,
        "synonyms": ["recurred", "reiterated", "duplicated"]
    },
    {
        "word": "REPORT",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun / verb) An account of something; to give an account",
        "sentences": [
            "She wrote a report.",
            "He reported the news.",
            "Please report any problems."
        ]
        ,
        "synonyms": ["account", "announce", "document"]
    },
    {
        "word": "REPRESENT",
        "difficulty": 5,
        "tier": 6,
        "definition": "(verb) To stand for or speak on behalf of",
        "sentences": [
            "She was chosen to represent her class.",
            "The symbol represents peace.",
            "He represents the company well."
        ]
        ,
        "synonyms": ["depict", "symbolize", "stand-for"]
    },
    {
        "word": "RESILIENT",
        "difficulty": 5,
        "definition": "(adj.) Recover quickly from difficulties.",
        "sentence": "Children are often very resilient.",
        "hint": "Tough."
        ,
        "synonyms": ["tough", "flexible", "adaptable"]
    },
    {
        "word": "REST",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun / verb) A period of relaxation; to relax",
        "sentences": [
            "She needs a rest.",
            "He rested after the long run.",
            "Take a five-minute rest."
        ]
        ,
        "synonyms": ["relax", "remainder", "sleep"]
    },
    {
        "word": "RESULT",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun / verb) An outcome or consequence; to happen because of",
        "sentences": [
            "She was happy with the result.",
            "Hard work results in success.",
            "What was the result of the match?"
        ]
        ,
        "synonyms": ["outcome", "effect", "consequence"]
    },
    {
        "word": "RETURN",
        "difficulty": 3,
        "tier": 6,
        "definition": "(verb / noun) To come back; a trip back",
        "sentences": [
            "She will return on Friday.",
            "He pressed return on the keyboard.",
            "They looked forward to their return."
        ]
        ,
        "synonyms": ["come-back", "give-back", "restore"]
    },
    {
        "word": "RHYTHM",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) A regular pattern of beats",
        "sentences": [
            "She danced to the rhythm.",
            "The music had a strong rhythm.",
            "He clapped along with the rhythm."
        ]
        ,
        "synonyms": ["beat", "cadence", "tempo"]
    },
    {
        "word": "RICH",
        "difficulty": 3,
        "tier": 9,
        "definition": "(adjective) Having a lot of money; full of flavor",
        "sentences": [
            "She has a rich imagination.",
            "The soil is rich and dark.",
            "He is very rich."
        ]
        ,
        "synonyms": ["wealthy", "abundant", "flavorful"]
    },
    {
        "word": "RIDE",
        "difficulty": 3,
        "tier": 7,
        "definition": "(verb / noun) To sit on and travel; a trip on a vehicle",
        "sentences": [
            "She loves to ride horses.",
            "It was a smooth ride.",
            "Can I have a ride?"
        ]
        ,
        "synonyms": ["travel", "drive", "journey"]
    },
    {
        "word": "RIGHT",
        "difficulty": 3,
        "tier": 1,
        "definition": "(adjective / noun) Correct; the direction opposite of left",
        "sentences": [
            "You are right!",
            "Turn right at the corner.",
            "She gave the right answer."
        ]
        ,
        "synonyms": ["correct", "just", "direction"]
    },
    {
        "word": "RING",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun / verb) A circular band; to make a bell sound",
        "sentences": [
            "She wore a gold ring.",
            "The phone rang loudly.",
            "He rang the doorbell."
        ]
        ,
        "synonyms": ["circle", "phone", "chime"]
    },
    {
        "word": "RISE",
        "difficulty": 3,
        "tier": 8,
        "definition": "(verb / noun) To go upward; an upward movement",
        "sentences": [
            "She rose early.",
            "The sun rises in the east.",
            "Prices are on the rise."
        ]
        ,
        "synonyms": ["ascend", "increase", "climb"]
    },
    {
        "word": "RIVER",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun) A large natural flow of water",
        "sentences": [
            "They swam in the river.",
            "The river flooded in spring.",
            "She sat beside the river."
        ]
        ,
        "synonyms": ["stream", "waterway", "tributary"]
    },
    {
        "word": "ROAD",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun) A path for vehicles to travel on",
        "sentences": [
            "The road was very busy.",
            "She crossed the road carefully.",
            "They lived at the end of the road."
        ]
        ,
        "synonyms": ["street", "path", "highway"]
    },
    {
        "word": "ROCK",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun / verb) A hard mineral mass; to move back and forth",
        "sentences": [
            "She sat on a flat rock.",
            "The music really rocks!",
            "She rocked the baby to sleep."
        ]
        ,
        "synonyms": ["stone", "music", "steady"]
    },
    {
        "word": "ROLLED",
        "difficulty": 3,
        "tier": 7,
        "definition": "(verb) Moved by rotating along a surface; formed into a cylindrical shape.",
        "sentences": [
            "The ball rolled down the hill.",
            "She rolled out the pastry.",
            "He rolled up his sleeves."
        ]
        ,
        "synonyms": ["turned-over", "moved", "wound"]
    },
    {
        "word": "ROOM",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) A division of a building enclosed by walls",
        "sentences": [
            "Her room is very tidy.",
            "There is no more room in the bag.",
            "The waiting room was full."
        ]
        ,
        "synonyms": ["space", "chamber", "bedroom"]
    },
    {
        "word": "ROOT",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun) The underground part of a plant; the origin of something",
        "sentences": [
            "The tree's roots go deep.",
            "She traced her roots to Ireland.",
            "Pull it out by the root."
        ]
        ,
        "synonyms": ["origin", "foundation", "base"]
    },
    {
        "word": "ROPE",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun) A thick strong cord",
        "sentences": [
            "She tied the boat with a rope.",
            "He climbed the rope.",
            "The rope was long and strong."
        ]
        ,
        "synonyms": ["cord", "cable", "string"]
    },
    {
        "word": "ROSE",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun / verb) A thorny flowering shrub with fragrant blooms; moved upward or increased.",
        "sentences": [
            "She gave him a red rose.",
            "He rose early.",
            "The sun rose over the hills."
        ]
        ,
        "synonyms": ["climbed", "flower", "got-up"]
    },
    {
        "word": "ROW",
        "difficulty": 3,
        "tier": 7,
        "definition": "(noun / verb) A line of things side by side; to use oars to move a boat",
        "sentences": [
            "She sat in the front row.",
            "He rowed the boat to shore.",
            "Plant the seeds in a row."
        ]
        ,
        "synonyms": ["line", "argument", "paddle"]
    },
    {
        "word": "RULE",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun / verb) A regulation or law; to govern",
        "sentences": [
            "Follow the rules.",
            "She ruled the kingdom wisely.",
            "There is a rule against running indoors."
        ]
        ,
        "synonyms": ["law", "govern", "principle"]
    },
    {
        "word": "RUN",
        "difficulty": 3,
        "tier": 3,
        "definition": "(verb / noun) To move quickly on foot; an act of running",
        "sentences": [
            "She loves to run in the park.",
            "They went for a run.",
            "He runs every morning."
        ]
        ,
        "synonyms": ["sprint", "manage", "flow"]
    },
    {
        "word": "SAFE",
        "difficulty": 3,
        "tier": 9,
        "definition": "(adjective / noun) Free from danger; a secure box for valuables",
        "sentences": [
            "She arrived home safe.",
            "He kept money in a safe.",
            "Is it safe to swim here?"
        ]
        ,
        "synonyms": ["secure", "protected", "harmless"]
    },
    {
        "word": "SAID",
        "difficulty": 3,
        "tier": 1,
        "definition": "(verb) Uttered words; expressed something in speech or writing.",
        "sentences": [
            "He said hello.",
            "She said she was tired.",
            "They said goodbye at the door."
        ]
        ,
        "synonyms": ["spoke", "uttered", "declared"]
    },
    {
        "word": "SAIL",
        "difficulty": 5,
        "tier": 7,
        "definition": "(verb / noun) To travel by boat; a large piece of cloth on a ship",
        "sentences": [
            "They sailed to the island.",
            "The sail flapped in the wind.",
            "She wants to learn to sail."
        ]
        ,
        "synonyms": ["navigate", "canvas", "travel-by-water"]
    },
    {
        "word": "SAME",
        "difficulty": 3,
        "tier": 2,
        "definition": "(adjective / pronoun) Identical; not different",
        "sentences": [
            "We have the same coat.",
            "She said the same thing.",
            "They both made the same mistake."
        ]
        ,
        "synonyms": ["identical", "equal", "alike"]
    },
    {
        "word": "SAND",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun) Tiny grains of rock found on beaches",
        "sentences": [
            "She built a sandcastle.",
            "The sand was warm and soft.",
            "He wrote her name in the sand."
        ]
        ,
        "synonyms": ["grains", "beach-material", "grit"]
    },
    {
        "word": "SAT",
        "difficulty": 3,
        "tier": 6,
        "definition": "(verb) Was in a resting position with weight on the lower body.",
        "sentences": [
            "She sat by the window.",
            "He sat very still.",
            "They sat together at lunch."
        ]
        ,
        "synonyms": ["seated", "settled", "remained"]
    },
    {
        "word": "SAVE",
        "difficulty": 3,
        "tier": 8,
        "definition": "(verb) To rescue; to keep for later use",
        "sentences": [
            "I always save my work before closing.",
            "Please save your progress before leaving.",
            "We need to save energy by turning off the lights."
        ]
        ,
        "synonyms": ["rescue", "preserve", "store"]
    },
    {
        "word": "SAW",
        "difficulty": 3,
        "tier": 3,
        "definition": "(verb / noun) Perceived something with the eyes; a toothed blade used to cut wood or metal.",
        "sentences": [
            "She saw a shooting star.",
            "He used a saw to cut the wood.",
            "I saw you at the market."
        ]
        ,
        "synonyms": ["viewed", "observed", "tool"]
    },
    {
        "word": "SAY",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb) To speak words; to express in words",
        "sentences": [
            "What did you say?",
            "He always has something nice to say.",
            "She said it clearly."
        ]
        ,
        "synonyms": ["speak", "declare", "utter"]
    },
    {
        "word": "SCALE",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun / verb) A measuring device; to climb; the size of something",
        "sentences": [
            "She weighed it on the scale.",
            "He scaled the wall easily.",
            "The map is drawn to scale."
        ]
        ,
        "synonyms": ["measure", "climb", "weigh"]
    },
    {
        "word": "SCHOOL",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun) A place where children go to learn",
        "sentences": [
            "She walks to school.",
            "School starts at eight.",
            "He loves school."
        ]
        ,
        "synonyms": ["institution", "educate", "academy"]
    },
    {
        "word": "SCIENCE",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun) The study of the natural world through observation",
        "sentences": [
            "She loves science.",
            "Science explains many things.",
            "He studied science at school."
        ]
        ,
        "synonyms": ["knowledge", "study", "empirical-inquiry"]
    },
    {
        "word": "SCIENTISTS",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun) People trained to investigate the natural world through observation and experiment.",
        "sentences": [
            "Scientists discovered a new planet.",
            "She wants to work with scientists.",
            "The scientists worked in a lab."
        ]
        ,
        "synonyms": ["researchers", "experts", "scholars"]
    },
    {
        "word": "SCORE",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun / verb) Points earned in a game; to earn points",
        "sentences": [
            "She scored ten goals.",
            "What was the final score?",
            "He checked the score on his phone."
        ]
        ,
        "synonyms": ["points", "achieve", "tally"]
    },
    {
        "word": "SEA",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun) A large body of salt water",
        "sentences": [
            "She swam in the sea.",
            "The sea was rough today.",
            "They sailed across the sea."
        ]
        ,
        "synonyms": ["ocean", "deep-water", "brine"]
    },
    {
        "word": "SEAT",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun / verb) Something to sit on; to cause to sit",
        "sentences": [
            "She found a good seat.",
            "He seated himself quietly.",
            "Is this seat taken?"
        ]
        ,
        "synonyms": ["chair", "place", "position"]
    },
    {
        "word": "SECOND",
        "difficulty": 3,
        "tier": 3,
        "definition": "(adjective / noun) Coming after the first; a unit of time equal to 1/60 of a minute",
        "sentences": [
            "She finished in second place.",
            "Wait just one second.",
            "He is the second tallest in the class."
        ]
        ,
        "synonyms": ["another", "moment", "runner-up"]
    },
    {
        "word": "SECTION",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun) A distinct part of something",
        "sentences": [
            "Read the first section.",
            "She works in the science section.",
            "The book is divided into sections."
        ]
        ,
        "synonyms": ["part", "area", "division"]
    },
    {
        "word": "SEE",
        "difficulty": 3,
        "tier": 1,
        "definition": "(verb) To perceive with the eyes",
        "sentences": [
            "I can see the mountains.",
            "Did you see that?",
            "She will see us tomorrow."
        ]
        ,
        "synonyms": ["observe", "view", "understand"]
    },
    {
        "word": "SEEDS",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun) Small reproductive units produced by plants that can germinate into new organisms.",
        "sentences": [
            "She planted sunflower seeds.",
            "The seeds sprouted in a week.",
            "He scattered seeds across the soil."
        ]
        ,
        "synonyms": ["kernels", "origins", "grains"]
    },
    {
        "word": "SEEM",
        "difficulty": 3,
        "tier": 3,
        "definition": "(verb) To appear to be; to give an impression",
        "sentences": [
            "You seem tired today.",
            "It seems like a good idea.",
            "She doesn't seem happy."
        ]
        ,
        "synonyms": ["appear", "look", "give-impression"]
    },
    {
        "word": "SEEN",
        "difficulty": 3,
        "tier": 4,
        "definition": "(verb) Perceived with the eyes; witnessed or observed.",
        "sentences": [
            "Have you seen my cat?",
            "She has seen that film before.",
            "I've never seen anything like it."
        ]
        ,
        "synonyms": ["observed", "witnessed", "noticed"]
    },
    {
        "word": "SELL",
        "difficulty": 3,
        "tier": 9,
        "definition": "(verb) To give something in exchange for money",
        "sentences": [
            "She sells handmade cards.",
            "He sold his bike.",
            "They sell bread at the market."
        ]
        ,
        "synonyms": ["trade", "market", "vend"]
    },
    {
        "word": "SEND",
        "difficulty": 3,
        "tier": 9,
        "definition": "(verb) To cause something to go to a place",
        "sentences": [
            "She sent a text message.",
            "Can you send me the file?",
            "He sent flowers to his mum."
        ]
        ,
        "synonyms": ["dispatch", "transmit", "forward"]
    },
    {
        "word": "SENSE",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun / verb) A meaning; a feeling; to be aware of",
        "sentences": [
            "That makes no sense.",
            "She sensed danger.",
            "He has a great sense of humor."
        ]
        ,
        "synonyms": ["perceive", "meaning", "judgment"]
    },
    {
        "word": "SENT",
        "difficulty": 3,
        "tier": 8,
        "definition": "(verb) Caused something or someone to go somewhere; transmitted a message.",
        "sentences": [
            "She sent him a message.",
            "He sent flowers to her.",
            "The letter was sent yesterday."
        ]
        ,
        "synonyms": ["dispatched", "transmitted", "forwarded"]
    },
    {
        "word": "SENTENCE",
        "difficulty": 3,
        "tier": 2,
        "definition": "(noun) A set of words forming a complete statement",
        "sentences": [
            "Write a sentence using this word.",
            "She spoke in short sentences.",
            "The first sentence grabbed my attention."
        ]
        ,
        "synonyms": ["phrase", "statement", "judgment"]
    },
    {
        "word": "SEPARATE",
        "difficulty": 5,
        "tier": 8,
        "definition": "(adjective / verb) Not joined; to divide",
        "sentences": [
            "They have separate rooms.",
            "She separated the eggs.",
            "Keep these two groups separate."
        ]
        ,
        "synonyms": ["divide", "split", "distinct"]
    },
    {
        "word": "SERVE",
        "difficulty": 3,
        "tier": 8,
        "definition": "(verb) To work for; to provide food or drinks",
        "sentences": [
            "It is an honour to serve your community.",
            "The restaurant will serve food until ten.",
            "Athletes who serve their sport inspire others."
        ]
        ,
        "synonyms": ["help", "provide", "function"]
    },
    {
        "word": "SET",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb / noun) To put in a place; a group of related items",
        "sentences": [
            "Set the table, please.",
            "She bought a set of pens.",
            "The sun set at seven."
        ]
        ,
        "synonyms": ["place", "group", "establish"]
    },
    {
        "word": "SETTLED",
        "difficulty": 5,
        "tier": 10,
        "definition": "(verb / adjective) Established residence in a place; resolved a dispute.",
        "sentences": [
            "They settled in the new town.",
            "She settled into her seat.",
            "The argument was finally settled."
        ]
        ,
        "synonyms": ["resolved", "established", "moved-in"]
    },
    {
        "word": "SEVEN",
        "difficulty": 3,
        "tier": 9,
        "definition": "(number) The number after six",
        "sentences": [
            "She has seven books.",
            "He woke up at seven.",
            "The week has seven days."
        ]
        ,
        "synonyms": ["7", "septet", "numeral"]
    },
    {
        "word": "SEVERAL",
        "difficulty": 3,
        "tier": 4,
        "definition": "(adjective / pronoun) More than two but not very many",
        "sentences": [
            "She has several pets.",
            "He called several times.",
            "I have seen her several times."
        ]
        ,
        "synonyms": ["many", "numerous", "various"]
    },
    {
        "word": "SHALL",
        "difficulty": 3,
        "tier": 6,
        "definition": "(verb) Expressing future intention; should",
        "sentences": [
            "Shall we go now?",
            "She shall return by evening.",
            "I shall do my best."
        ]
        ,
        "synonyms": ["will", "should", "ought"]
    },
    {
        "word": "SHAPE",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun / verb) The form or outline of something; to give form to",
        "sentences": [
            "What shape is that?",
            "She shaped the clay into a bowl.",
            "A circle is a round shape."
        ]
        ,
        "synonyms": ["form", "mold", "figure"]
    },
    {
        "word": "SHARP",
        "difficulty": 3,
        "tier": 9,
        "definition": "(adjective) Having a fine cutting edge; clear and distinct",
        "sentences": [
            "The knife is very sharp.",
            "She has a sharp mind.",
            "He heard a sharp sound."
        ]
        ,
        "synonyms": ["keen", "acute", "pointed"]
    },
    {
        "word": "SHE",
        "difficulty": 3,
        "tier": 1,
        "definition": "(pronoun) Refers to a female person previously mentioned",
        "sentences": [
            "She is my sister.",
            "She loves to paint.",
            "She arrived on time."
        ]
        ,
        "synonyms": ["female", "her", "woman"]
    },
    {
        "word": "SHIP",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun / verb) A large sea vessel; to transport",
        "sentences": [
            "The ship sailed into the harbor.",
            "The order was shipped today.",
            "She waved as the ship left."
        ]
        ,
        "synonyms": ["vessel", "boat", "dispatch"]
    },
    {
        "word": "SHOES",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun) Outer coverings for the feet, typically with a hard sole.",
        "sentences": [
            "She bought new shoes.",
            "He polished his shoes.",
            "These shoes are too tight."
        ]
        ,
        "synonyms": ["footwear", "boots", "sneakers"]
    },
    {
        "word": "SHOP",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun / verb) A store; to go to stores to buy things",
        "sentences": [
            "She went to the shop.",
            "He loves to shop.",
            "The shop sells fruit and vegetables."
        ]
        ,
        "synonyms": ["store", "buy", "retail"]
    },
    {
        "word": "SHORT",
        "difficulty": 3,
        "tier": 4,
        "definition": "(adjective) Of small length or height; brief in time",
        "sentences": [
            "She wrote a short story.",
            "The summer was too short.",
            "He gave a short but clear answer."
        ]
        ,
        "synonyms": ["brief", "small", "lacking"]
    },
    {
        "word": "SHOULD",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb) Expressing obligation or expectation",
        "sentences": [
            "You should get more sleep.",
            "She should arrive by noon.",
            "We should be on time."
        ]
        ,
        "synonyms": ["ought-to", "must", "supposed-to"]
    },
    {
        "word": "SHOULDER",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun) The joint connecting the arm to the body",
        "sentences": [
            "She patted him on the shoulder.",
            "He carried the bag on his shoulder.",
            "She looked back over her shoulder."
        ]
        ,
        "synonyms": ["joint", "carry", "support"]
    },
    {
        "word": "SHOUTED",
        "difficulty": 3,
        "tier": 8,
        "definition": "(verb) Called out in a loud, forceful voice.",
        "sentences": [
            "She shouted for help.",
            "He shouted across the field.",
            "They shouted with joy."
        ]
        ,
        "synonyms": ["yelled", "cried-out", "exclaimed"]
    },
    {
        "word": "SHOW",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb / noun) To display; a performance or exhibition",
        "sentences": [
            "Show me your drawing.",
            "The show was fantastic.",
            "She showed us around the museum."
        ]
        ,
        "synonyms": ["display", "exhibit", "demonstrate"]
    },
    {
        "word": "SHOWN",
        "difficulty": 3,
        "tier": 5,
        "definition": "(verb) Displayed or made visible; demonstrated or proved something.",
        "sentences": [
            "She has shown great courage.",
            "He was shown the door.",
            "The results were shown on screen."
        ]
        ,
        "synonyms": ["displayed", "proved", "revealed"]
    },
    {
        "word": "SIDE",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun) A surface or edge; either half of something",
        "sentences": [
            "She sat by his side.",
            "Which side are you on?",
            "The ball hit the side of the wall."
        ]
        ,
        "synonyms": ["edge", "position", "faction"]
    },
    {
        "word": "SIGHT",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) The ability to see; something seen",
        "sentences": [
            "She lost her sight.",
            "The waterfall was a wonderful sight.",
            "He had sharp sight."
        ]
        ,
        "synonyms": ["vision", "view", "spectacle"]
    },
    {
        "word": "SIGN",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun / verb) A symbol or notice; to write one's name",
        "sentences": [
            "She signed the letter.",
            "A stop sign is red and white.",
            "He showed a sign of improvement."
        ]
        ,
        "synonyms": ["signal", "omen", "mark"]
    },
    {
        "word": "SILENT",
        "difficulty": 5,
        "tier": 9,
        "definition": "(adjective) Making no sound; quiet",
        "sentences": [
            "The room was silent.",
            "She stood in silent awe.",
            "He gave a silent nod."
        ]
        ,
        "synonyms": ["quiet", "mute", "still"]
    },
    {
        "word": "SIMILAR",
        "difficulty": 5,
        "tier": 10,
        "definition": "(adjective) Alike but not identical",
        "sentences": [
            "The twins look similar.",
            "Their ideas are very similar.",
            "She found a similar dress."
        ]
        ,
        "synonyms": ["alike", "comparable", "related"]
    },
    {
        "word": "SIMPLE",
        "difficulty": 3,
        "tier": 6,
        "definition": "(adjective) Easy to understand; not complex",
        "sentences": [
            "The answer is simple.",
            "She explained it in a simple way.",
            "He made a simple mistake."
        ]
        ,
        "synonyms": ["easy", "basic", "plain"]
    },
    {
        "word": "SINCE",
        "difficulty": 3,
        "tier": 4,
        "definition": "(preposition / conjunction) From a past time until now; because",
        "sentences": [
            "She has lived here since she was five.",
            "Since it is late, let's go home.",
            "I haven't seen him since Monday."
        ]
        ,
        "synonyms": ["because", "from-the-time", "as"]
    },
    {
        "word": "SING",
        "difficulty": 3,
        "tier": 4,
        "definition": "(verb) To make musical sounds with the voice",
        "sentences": [
            "She sings in the choir.",
            "Can you sing that song?",
            "He sings in the shower."
        ]
        ,
        "synonyms": ["chant", "warble", "vocalize"]
    },
    {
        "word": "SINGLE",
        "difficulty": 3,
        "tier": 8,
        "definition": "(adjective) Only one; not married",
        "sentences": [
            "Not a single cloud in the sky.",
            "She is single.",
            "He ate every single one."
        ]
        ,
        "synonyms": ["one", "alone", "unmarried"]
    },
    {
        "word": "SIR",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun) A polite title for a man",
        "sentences": [
            "Yes, sir, right away!",
            "She addressed him as sir.",
            "Excuse me, sir, do you need help?"
        ]
        ,
        "synonyms": ["gentleman", "title", "honorific"]
    },
    {
        "word": "SISTER",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun) A female who has the same parents as another",
        "sentences": [
            "She has two sisters.",
            "Her sister is very funny.",
            "They are sisters."
        ]
        ,
        "synonyms": ["sibling", "kin", "female-sibling"]
    },
    {
        "word": "SITE",
        "difficulty": 5,
        "tier": 6,
        "definition": "(noun) A place where something is or was located",
        "sentences": [
            "The site is being developed.",
            "She visited the historic site.",
            "The website is the best site for help."
        ]
        ,
        "synonyms": ["location", "place", "website"]
    },
    {
        "word": "SIX",
        "difficulty": 3,
        "tier": 5,
        "definition": "(number) The number after five",
        "sentences": [
            "She has six apples.",
            "He is six years old.",
            "There are six eggs left."
        ]
        ,
        "synonyms": ["6", "sextet", "half-dozen"]
    },
    {
        "word": "SIZE",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun) The measurement of something",
        "sentences": [
            "What size shoes do you wear?",
            "The boxes come in all sizes.",
            "She chose the right size."
        ]
        ,
        "synonyms": ["dimensions", "magnitude", "measure"]
    },
    {
        "word": "SKIN",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun) The outer covering of a body",
        "sentences": [
            "Her skin is very soft.",
            "The sun burned his skin.",
            "She put lotion on her skin."
        ]
        ,
        "synonyms": ["hide", "surface", "dermis"]
    },
    {
        "word": "SKY",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun) The space above the Earth where clouds form",
        "sentences": [
            "The sky is bright blue.",
            "Stars appear in the sky at night.",
            "She gazed up at the sky."
        ]
        ,
        "synonyms": ["heavens", "firmament", "atmosphere"]
    },
    {
        "word": "SLEEP",
        "difficulty": 3,
        "tier": 7,
        "definition": "(verb / noun) To rest with eyes closed; a period of rest",
        "sentences": [
            "She fell asleep quickly.",
            "He needs more sleep.",
            "Good sleep is important."
        ]
        ,
        "synonyms": ["rest", "slumber", "doze"]
    },
    {
        "word": "SLOWLY",
        "difficulty": 3,
        "tier": 4,
        "definition": "(adverb) At a low speed; taking more time than usual.",
        "sentences": [
            "She walked slowly up the stairs.",
            "He slowly opened the door.",
            "The snail moved very slowly."
        ]
        ,
        "synonyms": ["gradually", "gently", "unhurriedly"]
    },
    {
        "word": "SMALL",
        "difficulty": 3,
        "tier": 2,
        "definition": "(adjective) Little in size or amount",
        "sentences": [
            "She lives in a small town.",
            "He found a small bug.",
            "The kitten was very small."
        ]
        ,
        "synonyms": ["tiny", "little", "minor"]
    },
    {
        "word": "SMELL",
        "difficulty": 3,
        "tier": 10,
        "definition": "(verb / noun) To sense with the nose; an odor",
        "sentences": [
            "She smelled the flowers.",
            "What is that strange smell?",
            "He could smell dinner cooking."
        ]
        ,
        "synonyms": ["scent", "aroma", "odor"]
    },
    {
        "word": "SMILE",
        "difficulty": 3,
        "tier": 7,
        "definition": "(verb / noun) To make a happy expression; a happy expression",
        "sentences": [
            "She smiled warmly.",
            "He has a big smile.",
            "The baby's smile is lovely."
        ]
        ,
        "synonyms": ["grin", "beam", "smirk"]
    },
    {
        "word": "SNOW",
        "difficulty": 3,
        "tier": 7,
        "definition": "(noun / verb) Frozen water vapor that falls from clouds as white flakes; to fall as frozen white flakes.",
        "sentences": [
            "The snow fell softly.",
            "It snowed all night.",
            "She made a snowball."
        ]
        ,
        "synonyms": ["ice-crystals", "sleet", "flurries"]
    },
    {
        "word": "SOFT",
        "difficulty": 3,
        "tier": 6,
        "definition": "(adjective) Not hard; gentle",
        "sentences": [
            "The pillow was very soft.",
            "She spoke in a soft voice.",
            "The cat's fur is so soft."
        ]
        ,
        "synonyms": ["gentle", "smooth", "quiet"]
    },
    {
        "word": "SOIL",
        "difficulty": 3,
        "tier": 7,
        "definition": "(noun) The top layer of earth where plants grow",
        "sentences": [
            "The soil is rich and dark.",
            "She dug her hands into the soil.",
            "Plants need good soil to grow."
        ]
        ,
        "synonyms": ["earth", "dirt", "ground"]
    },
    {
        "word": "SOLDIERS",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun) People who serve in a military force, trained to fight on land.",
        "sentences": [
            "The soldiers marched in a line.",
            "She read about the soldiers.",
            "Many soldiers came home safely."
        ]
        ,
        "synonyms": ["troops", "fighters", "warriors"]
    },
    {
        "word": "SOLUTION",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun) The answer to a problem; a liquid mixture",
        "sentences": [
            "She found a solution.",
            "Salt water is a solution.",
            "He had no solution."
        ]
        ,
        "synonyms": ["answer", "resolution", "mixture"]
    },
    {
        "word": "SOLVE",
        "difficulty": 5,
        "tier": 6,
        "definition": "(verb) To find the answer to a problem",
        "sentences": [
            "She solved the puzzle.",
            "Can you solve this riddle?",
            "He solved the problem quickly."
        ]
        ,
        "synonyms": ["answer", "fix", "resolve"]
    },
    {
        "word": "SOME",
        "difficulty": 3,
        "tier": 1,
        "definition": "(adjective / pronoun) An unspecified amount or number of",
        "sentences": [
            "Can I have some water?",
            "Some people like snow.",
            "She bought some fruit."
        ]
        ,
        "synonyms": ["a-few", "certain", "several"]
    },
    {
        "word": "SOMEONE",
        "difficulty": 3,
        "tier": 7,
        "definition": "(pronoun) An unspecified person",
        "sentences": [
            "Someone left the light on.",
            "Can someone help me?",
            "She met someone interesting today."
        ]
        ,
        "synonyms": ["somebody", "a-person", "individual"]
    },
    {
        "word": "SOMETHING",
        "difficulty": 3,
        "tier": 3,
        "definition": "(pronoun) An unspecified thing",
        "sentences": [
            "She heard something outside.",
            "Can I get you something?",
            "There is something in my shoe."
        ]
        ,
        "synonyms": ["a-thing", "an-item", "matter"]
    },
    {
        "word": "SOMETIMES",
        "difficulty": 3,
        "tier": 3,
        "definition": "(adverb) Occasionally; now and then",
        "sentences": [
            "She sometimes bakes on weekends.",
            "He is sometimes grumpy in the morning.",
            "It sometimes rains in summer."
        ]
        ,
        "synonyms": ["occasionally", "now-and-then", "at-times"]
    },
    {
        "word": "SON",
        "difficulty": 3,
        "tier": 7,
        "definition": "(noun) A male child in relation to parents",
        "sentences": [
            "She is proud of her son.",
            "He is her only son.",
            "Their son is starting school this year."
        ]
        ,
        "synonyms": ["male-offspring", "boy", "heir"]
    },
    {
        "word": "SONG",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun) A piece of music with words",
        "sentences": [
            "She sang a beautiful song.",
            "What is your favorite song?",
            "He hummed a quiet song."
        ]
        ,
        "synonyms": ["melody", "tune", "lyric"]
    },
    {
        "word": "SOON",
        "difficulty": 3,
        "tier": 3,
        "definition": "(adverb) In a short time; before long",
        "sentences": [
            "She will be home soon.",
            "See you soon!",
            "The rain will stop soon."
        ]
        ,
        "synonyms": ["shortly", "presently", "quickly"]
    },
    {
        "word": "SOUND",
        "difficulty": 3,
        "tier": 2,
        "definition": "(noun / verb) Vibrations perceived by the ear; to make a noise",
        "sentences": [
            "I heard a strange sound.",
            "That sounds like a great idea.",
            "The alarm sounded loudly."
        ]
        ,
        "synonyms": ["noise", "healthy", "wave"]
    },
    {
        "word": "SOUTH",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun / adjective) The direction toward the bottom of a map or compass; relating to the lower region.",
        "sentences": [
            "They drove south for the winter.",
            "The south coast is warm.",
            "The birds flew south."
        ]
        ,
        "synonyms": ["lower-direction", "polar-south", "southern"]
    },
    {
        "word": "SOUTHERN",
        "difficulty": 3,
        "tier": 10,
        "definition": "(adjective) Situated toward the direction of the South Pole; coming from the south.",
        "sentences": [
            "She lives in the southern part of the country.",
            "They enjoyed the southern sunshine.",
            "He has a southern accent."
        ]
        ,
        "synonyms": ["austral", "lower", "south-of"]
    },
    {
        "word": "SPACE",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) An empty area; the universe beyond Earth's atmosphere",
        "sentences": [
            "Astronauts travel to space.",
            "Leave a space between the words.",
            "There is no space in the bag."
        ]
        ,
        "synonyms": ["area", "outer-space", "gap"]
    },
    {
        "word": "SPEAK",
        "difficulty": 3,
        "tier": 6,
        "definition": "(verb) To say words; to talk",
        "sentences": [
            "She speaks very quietly.",
            "Can I speak to you?",
            "He speaks three languages."
        ]
        ,
        "synonyms": ["talk", "say", "communicate"]
    },
    {
        "word": "SPECIAL",
        "difficulty": 3,
        "tier": 5,
        "definition": "(adjective) Unusual or different in a good way; particular",
        "sentences": [
            "Today is a special day.",
            "She is a very special person.",
            "He made a special effort."
        ]
        ,
        "synonyms": ["unique", "distinct", "extraordinary"]
    },
    {
        "word": "SPEED",
        "difficulty": 3,
        "tier": 7,
        "definition": "(noun / verb) The rate of movement; to move fast",
        "sentences": [
            "What speed were you driving?",
            "She sped through the work.",
            "Light travels at great speed."
        ]
        ,
        "synonyms": ["velocity", "pace", "rate"]
    },
    {
        "word": "SPELL",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb / noun) To write or say letters of a word; a period of time",
        "sentences": [
            "Can you spell your name?",
            "She cast a magic spell.",
            "We had a cold spell in March."
        ]
        ,
        "synonyms": ["enchantment", "name-letters", "period"]
    },
    {
        "word": "SPOT",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun / verb) A small mark; a location; to notice",
        "sentences": [
            "She spotted a deer.",
            "He had a spot on his shirt.",
            "This is a nice spot for a picnic."
        ]
        ,
        "synonyms": ["location", "stain", "notice"]
    },
    {
        "word": "SPREAD",
        "difficulty": 5,
        "tier": 9,
        "definition": "(verb / noun) To extend over an area; a range",
        "sentences": [
            "She spread butter on her toast.",
            "News spreads fast.",
            "The fire spread quickly."
        ]
        ,
        "synonyms": ["expand", "scatter", "extend"]
    },
    {
        "word": "SPRING",
        "difficulty": 3,
        "tier": 7,
        "definition": "(noun / verb) The season after winter; to jump suddenly",
        "sentences": [
            "She loves the spring flowers.",
            "He sprang to his feet.",
            "Spring is finally here."
        ]
        ,
        "synonyms": ["season", "bounce", "source"]
    },
    {
        "word": "SPURIOUS",
        "difficulty": 5,
        "definition": "(adj.) False or fake.",
        "sentence": "A spurious claim.",
        "hint": "False."
        ,
        "synonyms": ["false", "fake", "counterfeit"]
    },
    {
        "word": "SQUARE",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun / adjective) A shape with four equal sides; fair",
        "sentences": [
            "Draw a square.",
            "A square has four equal sides.",
            "Let's call it square."
        ]
        ,
        "synonyms": ["geometric-shape", "plaza", "even"]
    },
    {
        "word": "STAND",
        "difficulty": 3,
        "tier": 4,
        "definition": "(verb / noun) To be upright on one's feet; a structure for support",
        "sentences": [
            "She stood up straight.",
            "He can't stand the cold.",
            "There is a music stand in the corner."
        ]
        ,
        "synonyms": ["rise", "bear", "position"]
    },
    {
        "word": "STARS",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun) Massive balls of hot gas that emit light and heat, seen as points of light in the night sky.",
        "sentences": [
            "The stars shone brightly.",
            "She counted the stars.",
            "We saw millions of stars in the desert."
        ]
        ,
        "synonyms": ["celestial-bodies", "celebrities", "luminaries"]
    },
    {
        "word": "START",
        "difficulty": 3,
        "tier": 3,
        "definition": "(verb / noun) To begin; the beginning of something",
        "sentences": [
            "Let's start the game.",
            "She got off to a great start.",
            "The race starts at noon."
        ]
        ,
        "synonyms": ["begin", "launch", "commence"]
    },
    {
        "word": "STATE",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun / verb) A nation or region with its own government; to say formally",
        "sentences": [
            "Texas is a large state.",
            "Please state your full name.",
            "She stated her case clearly."
        ]
        ,
        "synonyms": ["country", "condition", "declare"]
    },
    {
        "word": "STATEMENT",
        "difficulty": 5,
        "tier": 8,
        "definition": "(noun) A declaration of something; a formal account",
        "sentences": [
            "She made a clear statement.",
            "He gave a statement to the police.",
            "The statement was signed."
        ]
        ,
        "synonyms": ["declaration", "claim", "assertion"]
    },
    {
        "word": "STAY",
        "difficulty": 3,
        "tier": 5,
        "definition": "(verb) To remain in a place; to continue",
        "sentences": [
            "Please stay here.",
            "She stayed late at school.",
            "Can you stay a little longer?"
        ]
        ,
        "synonyms": ["remain", "abide", "lodge"]
    },
    {
        "word": "STEEL",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun) A strong metal made from iron",
        "sentences": [
            "The bridge is made of steel.",
            "She has nerves of steel.",
            "He bent the steel bar."
        ]
        ,
        "synonyms": ["iron-alloy", "strengthen", "metal"]
    },
    {
        "word": "STEP",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun / verb) A footstep; to move by lifting a foot",
        "sentences": [
            "Watch your step!",
            "She took one step forward.",
            "He stepped over the puddle."
        ]
        ,
        "synonyms": ["pace", "action", "stair"]
    },
    {
        "word": "STICK",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun / verb) A thin piece of wood; to attach or remain",
        "sentences": [
            "She found a long stick.",
            "Stick the picture on the page.",
            "The glue didn't stick."
        ]
        ,
        "synonyms": ["rod", "adhere", "branch"]
    },
    {
        "word": "STILL",
        "difficulty": 3,
        "tier": 2,
        "definition": "(adverb / adjective) Up to this time; not moving",
        "sentences": [
            "She is still asleep.",
            "Sit still for a moment.",
            "The pond was still and calm."
        ]
        ,
        "synonyms": ["quiet", "motionless", "yet"]
    },
    {
        "word": "STONE",
        "difficulty": 3,
        "tier": 7,
        "definition": "(noun) A small piece of rock; a unit of weight",
        "sentences": [
            "She threw a stone into the lake.",
            "He weighs twelve stone.",
            "The wall is built of stone."
        ]
        ,
        "synonyms": ["rock", "gem", "pebble"]
    },
    {
        "word": "STOOD",
        "difficulty": 3,
        "tier": 5,
        "definition": "(verb) Was in an upright position on one's feet; tolerated or endured.",
        "sentences": [
            "She stood at the window.",
            "He stood very still.",
            "They stood in line for an hour."
        ]
        ,
        "synonyms": ["was-standing", "tolerated", "was-upright"]
    },
    {
        "word": "STOP",
        "difficulty": 3,
        "tier": 3,
        "definition": "(verb / noun) To cease moving or doing; a halt",
        "sentences": [
            "Stop the car!",
            "The bus stop is on the corner.",
            "She stopped running when she reached the top."
        ]
        ,
        "synonyms": ["halt", "cease", "prevent"]
    },
    {
        "word": "STORE",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun / verb) A shop; to keep for future use",
        "sentences": [
            "She went to the store.",
            "Store the biscuits in a tin.",
            "He ran a grocery store."
        ]
        ,
        "synonyms": ["shop", "save", "storage"]
    },
    {
        "word": "STORY",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun) An account of real or imagined events",
        "sentences": [
            "She told a funny story.",
            "The story had a happy ending.",
            "He wrote a story about a dragon."
        ]
        ,
        "synonyms": ["tale", "narrative", "account"]
    },
    {
        "word": "STRAIGHT",
        "difficulty": 5,
        "tier": 8,
        "definition": "(adjective / adverb) Not curved; directly",
        "sentences": [
            "Draw a straight line.",
            "Go straight ahead.",
            "She stood up straight."
        ]
        ,
        "synonyms": ["direct", "unbent", "honest"]
    },
    {
        "word": "STRANGE",
        "difficulty": 5,
        "tier": 8,
        "definition": "(adjective) Unusual or surprising; not familiar",
        "sentences": [
            "She heard a strange sound.",
            "That is very strange.",
            "He had a strange feeling."
        ]
        ,
        "synonyms": ["odd", "unusual", "peculiar"]
    },
    {
        "word": "STREAM",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun / verb) A small river; to flow continuously",
        "sentences": [
            "She paddled in the stream.",
            "He streamed the film online.",
            "The stream flowed gently."
        ]
        ,
        "synonyms": ["creek", "flow", "current"]
    },
    {
        "word": "STREET",
        "difficulty": 3,
        "tier": 5,
        "definition": "(noun) A road in a town or city with buildings along it",
        "sentences": [
            "She lives on a quiet street.",
            "He crossed the street.",
            "The street was covered in autumn leaves."
        ]
        ,
        "synonyms": ["road", "avenue", "lane"]
    },
    {
        "word": "STRETCHED",
        "difficulty": 5,
        "tier": 10,
        "definition": "(verb) Extended or spread out to full length; exerted a continuous pull.",
        "sentences": [
            "She stretched her arms.",
            "He stretched out on the sofa.",
            "The road stretched for miles."
        ]
        ,
        "synonyms": ["extended", "expanded", "pulled"]
    },
    {
        "word": "STRING",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun / verb) A thin cord; to thread onto a cord",
        "sentences": [
            "She tied it with string.",
            "He strung the beads together.",
            "The kite was on a long string."
        ]
        ,
        "synonyms": ["cord", "thread", "series"]
    },
    {
        "word": "STRONG",
        "difficulty": 3,
        "tier": 5,
        "definition": "(adjective) Having great physical power; not easy to break",
        "sentences": [
            "She is very strong.",
            "The wind was strong today.",
            "He has a strong sense of justice."
        ]
        ,
        "synonyms": ["powerful", "robust", "intense"]
    },
    {
        "word": "STUDENTS",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun) People who are engaged in study, especially at a school or university.",
        "sentences": [
            "The students studied hard.",
            "She teaches forty students.",
            "All students passed the exam."
        ]
        ,
        "synonyms": ["learners", "pupils", "scholars"]
    },
    {
        "word": "STUDY",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb / noun) To learn about a subject; careful investigation",
        "sentences": [
            "She studies every night.",
            "He did a study on birds.",
            "You need to study for the test."
        ]
        ,
        "synonyms": ["learn", "examine", "research"]
    },
    {
        "word": "SUBJECT",
        "difficulty": 5,
        "tier": 6,
        "definition": "(noun / adjective) A topic being discussed; under the authority of",
        "sentences": [
            "Math is her favorite subject.",
            "Please don't change the subject.",
            "He is subject to rules."
        ]
        ,
        "synonyms": ["topic", "theme", "subordinate"]
    },
    {
        "word": "SUBSTANCES",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun) Types of physical matter with distinct properties.",
        "sentences": [
            "Some substances are dangerous.",
            "She tested several substances.",
            "He listed all the substances used."
        ]
        ,
        "synonyms": ["materials", "compounds", "matter"]
    },
    {
        "word": "SUCH",
        "difficulty": 3,
        "tier": 2,
        "definition": "(adjective / adverb) Of the type being indicated; to a high degree",
        "sentences": [
            "She is such a kind person.",
            "I've never seen such beauty.",
            "Such things rarely happen."
        ]
        ,
        "synonyms": ["so", "this-kind-of", "to-this-degree"]
    },
    {
        "word": "SUDDENLY",
        "difficulty": 5,
        "tier": 6,
        "definition": "(adverb) Quickly and unexpectedly",
        "sentences": [
            "She suddenly stopped walking.",
            "He suddenly remembered.",
            "It suddenly started to rain."
        ]
        ,
        "synonyms": ["abruptly", "unexpectedly", "all-at-once"]
    },
    {
        "word": "SUFFIX",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun) A letter or group of letters added to the end of a word",
        "sentences": [
            "She added the suffix -ing.",
            "The suffix -er means a person who does.",
            "He learned about suffixes in class."
        ]
        ,
        "synonyms": ["ending", "affix", "word-ending"]
    },
    {
        "word": "SUGAR",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun) A sweet substance used in food",
        "sentences": [
            "She added sugar to the tea.",
            "Too much sugar is bad for you.",
            "He bought a bag of sugar."
        ]
        ,
        "synonyms": ["sweetener", "sucrose", "glucose"]
    },
    {
        "word": "SUGGESTED",
        "difficulty": 5,
        "tier": 9,
        "definition": "(verb) Put forward an idea or possibility for consideration.",
        "sentences": [
            "She suggested going for a walk.",
            "He suggested a different plan.",
            "They suggested meeting at noon."
        ]
        ,
        "synonyms": ["proposed", "recommended", "implied"]
    },
    {
        "word": "SUM",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun) The total of two or more numbers",
        "sentences": [
            "She worked out the sum.",
            "What is the sum of three and four?",
            "The sum of parts is greater than the whole."
        ]
        ,
        "synonyms": ["total", "amount", "add-up"]
    },
    {
        "word": "SUMMER",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun) The warmest season of the year",
        "sentences": [
            "She loves summer.",
            "They played outside all summer.",
            "Summer holidays are the best."
        ]
        ,
        "synonyms": ["warm-season", "June-August", "sunshine"]
    },
    {
        "word": "SUN",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) The star at the center of our solar system",
        "sentences": [
            "The sun rose at six.",
            "Don't look directly at the sun.",
            "She sat in the sun and read."
        ]
        ,
        "synonyms": ["star", "solar", "sunshine"]
    },
    {
        "word": "SUPPLY",
        "difficulty": 5,
        "tier": 8,
        "definition": "(noun / verb) A stock of something; to provide",
        "sentences": [
            "She supplied food for the event.",
            "The supply ran out.",
            "He stocks a good supply of wood."
        ]
        ,
        "synonyms": ["provide", "stock", "give"]
    },
    {
        "word": "SUPPOSE",
        "difficulty": 5,
        "tier": 8,
        "definition": "(verb) To think or assume; to expect",
        "sentences": [
            "I suppose you're right.",
            "She supposed he had forgotten.",
            "What do you suppose happened?"
        ]
        ,
        "synonyms": ["assume", "presume", "imagine"]
    },
    {
        "word": "SURE",
        "difficulty": 3,
        "tier": 4,
        "definition": "(adjective / adverb) Certain; without doubt",
        "sentences": [
            "Are you sure?",
            "She is sure she left it here.",
            "Sure, I will help."
        ]
        ,
        "synonyms": ["certain", "confident", "reliable"]
    },
    {
        "word": "SURFACE",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun) The top or outer layer of something",
        "sentences": [
            "She cleaned the surface.",
            "The ball bounced off the surface.",
            "Ice forms on the surface of ponds."
        ]
        ,
        "synonyms": ["face", "top", "exterior"]
    },
    {
        "word": "SURPRISE",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun / verb) An unexpected event; to cause astonishment",
        "sentences": [
            "It was a lovely surprise.",
            "She surprised him with a cake.",
            "He was surprised to see her."
        ]
        ,
        "synonyms": ["astonish", "shock", "startle"]
    },
    {
        "word": "SWIM",
        "difficulty": 3,
        "tier": 9,
        "definition": "(verb) To move through water using the body",
        "sentences": [
            "She loves to swim.",
            "He swam across the river.",
            "Can you swim?"
        ]
        ,
        "synonyms": ["stroke", "glide", "paddle"]
    },
    {
        "word": "SYLLABLES",
        "difficulty": 5,
        "tier": 6,
        "definition": "(noun) The individual units of spoken sound that make up words.",
        "sentences": [
            "Clap the syllables.",
            "The word happy has two syllables.",
            "She counted the syllables in each word."
        ]
        ,
        "synonyms": ["sound-units", "phonemes", "word-parts"]
    },
    {
        "word": "SYMBOLS",
        "difficulty": 5,
        "tier": 8,
        "definition": "(noun) Signs, marks, or objects that stand for or represent something else.",
        "sentences": [
            "She drew the symbols on the map.",
            "Peace symbols were painted on the wall.",
            "He learned the musical symbols."
        ]
        ,
        "synonyms": ["signs", "icons", "representations"]
    },
    {
        "word": "SYSTEM",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun) A set of connected parts working together",
        "sentences": [
            "The solar system is vast.",
            "She understands the system well.",
            "There is a new bus system."
        ]
        ,
        "synonyms": ["structure", "network", "method"]
    },
    {
        "word": "TABLE",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) A flat-topped piece of furniture with legs",
        "sentences": [
            "Set the table for dinner.",
            "The table is made of oak.",
            "She sat at the kitchen table."
        ]
        ,
        "synonyms": ["postpone", "submit", "present"]
    },
    {
        "word": "TAKE",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb) To grasp or carry; to accept",
        "sentences": [
            "Take an umbrella with you.",
            "She took the bus to school.",
            "He took her hand."
        ]
        ,
        "synonyms": ["grab", "accept", "require"]
    },
    {
        "word": "TALK",
        "difficulty": 3,
        "tier": 3,
        "definition": "(verb / noun) To speak; a conversation",
        "sentences": [
            "She talks too fast.",
            "They had a long talk.",
            "Let's talk about it later."
        ]
        ,
        "synonyms": ["speak", "chat", "discuss"]
    },
    {
        "word": "TALL",
        "difficulty": 3,
        "tier": 7,
        "definition": "(adjective) Of great height",
        "sentences": [
            "She is very tall.",
            "The tall trees swayed in the wind.",
            "He wore a tall hat."
        ]
        ,
        "synonyms": ["high", "lofty", "towering"]
    },
    {
        "word": "TEACHER",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun) A person who instructs others",
        "sentences": [
            "She is a kind teacher.",
            "Her teacher praised her work.",
            "He became a teacher after college."
        ]
        ,
        "synonyms": ["educator", "tutor", "instructor"]
    },
    {
        "word": "TEAM",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun) A group working together toward a goal",
        "sentences": [
            "She is on the school team.",
            "The team won the match.",
            "He is a great team player."
        ]
        ,
        "synonyms": ["group", "squad", "collective"]
    },
    {
        "word": "TELL",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb) To communicate information; to instruct",
        "sentences": [
            "Tell me what happened.",
            "She told him the news.",
            "He told a funny story."
        ]
        ,
        "synonyms": ["inform", "narrate", "instruct"]
    },
    {
        "word": "TEMPERATURE",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun) The degree of heat or cold",
        "sentences": [
            "The temperature dropped overnight.",
            "What is the temperature outside?",
            "She took the temperature of the soup."
        ]
        ,
        "synonyms": ["heat", "degree", "warmth"]
    },
    {
        "word": "TEN",
        "difficulty": 3,
        "tier": 5,
        "definition": "(number) The number after nine",
        "sentences": [
            "She has ten fingers.",
            "He counted to ten slowly.",
            "The shop closes at ten o'clock."
        ]
        ,
        "synonyms": ["10", "decade-number", "numeral"]
    },
    {
        "word": "TERMS",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) Words or expressions used within a particular field; conditions of an agreement.",
        "sentences": [
            "She didn't understand the terms.",
            "He agreed to the terms.",
            "The terms of the deal were fair."
        ]
        ,
        "synonyms": ["conditions", "words", "phrases"]
    },
    {
        "word": "TEST",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun / verb) An examination; to try out",
        "sentences": [
            "She passed her test.",
            "We will test the theory.",
            "He studied hard for the test."
        ]
        ,
        "synonyms": ["exam", "trial", "assess"]
    },
    {
        "word": "THAN",
        "difficulty": 3,
        "tier": 1,
        "definition": "(conjunction) Used in comparisons",
        "sentences": [
            "She is taller than me.",
            "This is better than that.",
            "He runs faster than his brother."
        ]
        ,
        "synonyms": ["compared-to", "more-than", "other-than"]
    },
    {
        "word": "THAT",
        "difficulty": 3,
        "tier": 1,
        "definition": "(pronoun / conjunction) Used to identify a specific thing; used to introduce a clause",
        "sentences": [
            "I know that she is right.",
            "That is my book.",
            "She said that she was tired."
        ]
        ,
        "synonyms": ["the-one", "those", "which"]
    },
    {
        "word": "THE",
        "difficulty": 3,
        "tier": 1,
        "definition": "(article) Used before a noun to refer to a specific person or thing",
        "sentences": [
            "The cat sat on the mat.",
            "Please pass the salt.",
            "The sun rises in the east."
        ]
        ,
        "synonyms": ["definite-article", "that-particular", "the-one"]
    },
    {
        "word": "THEIR",
        "difficulty": 3,
        "tier": 1,
        "definition": "(pronoun) Belonging to people or things previously mentioned",
        "sentences": [
            "That is their house.",
            "They forgot their bags.",
            "Their dog ran away."
        ]
        ,
        "synonyms": ["belonging-to-them", "possessive", "their-own"]
    },
    {
        "word": "THEM",
        "difficulty": 3,
        "tier": 1,
        "definition": "(pronoun) Refers to people or things as the object of a verb",
        "sentences": [
            "Give it to them.",
            "I saw them at the park.",
            "She helped them with their bags."
        ]
        ,
        "synonyms": ["those-people", "those-things", "they"]
    },
    {
        "word": "THEMSELVES",
        "difficulty": 3,
        "tier": 7,
        "definition": "(pronoun) Refers back to people previously mentioned",
        "sentences": [
            "They did it themselves.",
            "The children dressed themselves.",
            "They had only themselves to blame."
        ]
        ,
        "synonyms": ["their-own", "oneself", "reflexive"]
    },
    {
        "word": "THEN",
        "difficulty": 3,
        "tier": 1,
        "definition": "(adverb) At that time; after that",
        "sentences": [
            "We ate, then we walked.",
            "She was younger then.",
            "Finish this, then start the next."
        ]
        ,
        "synonyms": ["at-that-time", "next", "therefore"]
    },
    {
        "word": "THERE",
        "difficulty": 3,
        "tier": 1,
        "definition": "(adverb) In or at that place",
        "sentences": [
            "Put it over there.",
            "There is a cat on the roof.",
            "We have been there before."
        ]
        ,
        "synonyms": ["at-that-place", "in-that-location", "yonder"]
    },
    {
        "word": "THESE",
        "difficulty": 3,
        "tier": 1,
        "definition": "(pronoun / adjective) Referring to the specific people or things just mentioned or nearby.",
        "sentences": [
            "These are my shoes.",
            "Are these yours?",
            "I made these cookies."
        ]
        ,
        "synonyms": ["this-group", "the-ones-here", "those-near"]
    },
    {
        "word": "THEY",
        "difficulty": 3,
        "tier": 1,
        "definition": "(pronoun) Refers to people or things previously mentioned",
        "sentences": [
            "They are coming over.",
            "They won the game.",
            "Are they ready?"
        ]
        ,
        "synonyms": ["those-people", "the-group", "those"]
    },
    {
        "word": "THICK",
        "difficulty": 3,
        "tier": 9,
        "definition": "(adjective) Having a large distance between surfaces; dense",
        "sentences": [
            "The walls are very thick.",
            "She wore a thick coat.",
            "The forest was thick with trees."
        ]
        ,
        "synonyms": ["dense", "broad", "deep"]
    },
    {
        "word": "THIN",
        "difficulty": 3,
        "tier": 9,
        "definition": "(adjective) Having little distance between surfaces; not fat",
        "sentences": [
            "She cut thin slices.",
            "He wore a thin jumper.",
            "The walls are very thin here."
        ]
        ,
        "synonyms": ["slender", "narrow", "lean"]
    },
    {
        "word": "THINGS",
        "difficulty": 3,
        "tier": 2,
        "definition": "(noun) Objects, events, ideas, or matters of any kind.",
        "sentences": [
            "She packed her things.",
            "I have too many things to do.",
            "Strange things happen here."
        ]
        ,
        "synonyms": ["objects", "matters", "items"]
    },
    {
        "word": "THINK",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb) To use one's mind; to have a belief",
        "sentences": [
            "I think it will rain.",
            "She thinks deeply about everything.",
            "What do you think?"
        ]
        ,
        "synonyms": ["believe", "consider", "ponder"]
    },
    {
        "word": "THIRD",
        "difficulty": 3,
        "tier": 6,
        "definition": "(adjective / noun) Coming after second; one of three equal parts",
        "sentences": [
            "She came in third place.",
            "He ate a third of the pie.",
            "The third question was tricky."
        ]
        ,
        "synonyms": ["one-third", "ordinal-three", "bronze"]
    },
    {
        "word": "THIS",
        "difficulty": 3,
        "tier": 1,
        "definition": "(pronoun / adjective) Referring to a person or thing nearby",
        "sentences": [
            "This is my bag.",
            "I like this song.",
            "Take this with you."
        ]
        ,
        "synonyms": ["the-one", "the-present", "the-current"]
    },
    {
        "word": "THOSE",
        "difficulty": 3,
        "tier": 3,
        "definition": "(pronoun / adjective) Referring to specific people or things further away or previously mentioned.",
        "sentences": [
            "Those shoes are beautiful.",
            "Are those your books?",
            "I like those better."
        ]
        ,
        "synonyms": ["those-ones", "that-group", "they"]
    },
    {
        "word": "THOUGH",
        "difficulty": 5,
        "tier": 5,
        "definition": "(conjunction / adverb) Despite the fact that; however",
        "sentences": [
            "She kept going, even though she was tired.",
            "I like him, though he can be stubborn.",
            "It was odd, though not surprising."
        ]
        ,
        "synonyms": ["although", "even-if", "however"]
    },
    {
        "word": "THOUGHT",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun / verb) An idea or opinion produced by mental activity; reflected on or believed something.",
        "sentences": [
            "She gave it careful thought.",
            "I thought it was funny.",
            "He thought of a clever plan."
        ]
        ,
        "synonyms": ["idea", "opinion", "ponder"]
    },
    {
        "word": "THOUSANDS",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun) Numbers equal to ten hundred; very large quantities.",
        "sentences": [
            "Thousands of people attended.",
            "She earned thousands of steps on her walk.",
            "Thousands of birds filled the sky."
        ]
        ,
        "synonyms": ["many", "multiple-hundreds", "large-number"]
    },
    {
        "word": "THREE",
        "difficulty": 3,
        "tier": 2,
        "definition": "(number) The number after two",
        "sentences": [
            "She has three cats.",
            "We waited for three hours.",
            "They need three more players."
        ]
        ,
        "synonyms": ["3", "trio", "triple"]
    },
    {
        "word": "THROUGH",
        "difficulty": 3,
        "tier": 2,
        "definition": "(preposition / adverb) From one side to the other; finished",
        "sentences": [
            "She walked through the door.",
            "He drove through the tunnel.",
            "I got through the whole book."
        ]
        ,
        "synonyms": ["across", "via", "by-way-of"]
    },
    {
        "word": "THUS",
        "difficulty": 5,
        "tier": 9,
        "definition": "(adverb) As a result; therefore",
        "sentences": [
            "She worked hard; thus she succeeded.",
            "He said nothing, thus avoiding trouble.",
            "She was tired, thus she went home."
        ]
        ,
        "synonyms": ["therefore", "so", "consequently"]
    },
    {
        "word": "TIED",
        "difficulty": 3,
        "tier": 9,
        "definition": "(verb / adjective) Fastened with a knot or string; equal in score.",
        "sentences": [
            "She tied her shoelaces.",
            "He tied the bag shut.",
            "The match ended tied."
        ]
        ,
        "synonyms": ["bound", "fastened", "linked"]
    },
    {
        "word": "TIME",
        "difficulty": 3,
        "tier": 1,
        "definition": "(noun) The ongoing sequence of events; a specific moment",
        "sentences": [
            "What time is it?",
            "She had a great time at the party.",
            "Time flies when you're having fun."
        ]
        ,
        "synonyms": ["period", "moment", "clock"]
    },
    {
        "word": "TINY",
        "difficulty": 3,
        "tier": 7,
        "definition": "(adjective) Very small",
        "sentences": [
            "The kitten was tiny.",
            "She made a tiny mistake.",
            "He found a tiny crack in the wall."
        ]
        ,
        "synonyms": ["small", "minute", "minuscule"]
    },
    {
        "word": "TODAY",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun / adverb) This present day",
        "sentences": [
            "Today is my birthday!",
            "What are we doing today?",
            "I need to finish it today."
        ]
        ,
        "synonyms": ["this-day", "presently", "now"]
    },
    {
        "word": "TOGETHER",
        "difficulty": 3,
        "tier": 3,
        "definition": "(adverb) With each other; at the same time",
        "sentences": [
            "We eat dinner together.",
            "They worked together on the project.",
            "Let's sing together."
        ]
        ,
        "synonyms": ["jointly", "combined", "as-one"]
    },
    {
        "word": "TOLD",
        "difficulty": 3,
        "tier": 4,
        "definition": "(verb) Communicated something in speech or writing; instructed someone.",
        "sentences": [
            "She told me a secret.",
            "He told the truth.",
            "They told us to wait here."
        ]
        ,
        "synonyms": ["narrated", "informed", "instructed"]
    },
    {
        "word": "TONE",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) The quality of a sound; a shade of color",
        "sentences": [
            "She spoke in a gentle tone.",
            "The room was painted in warm tones.",
            "He set the tone for the day."
        ]
        ,
        "synonyms": ["sound", "manner", "shade"]
    },
    {
        "word": "TOO",
        "difficulty": 3,
        "tier": 2,
        "definition": "(adverb) Also; excessively",
        "sentences": [
            "She wants to come too.",
            "It was too cold outside.",
            "The soup is too hot."
        ]
        ,
        "synonyms": ["also", "as-well", "excessively"]
    },
    {
        "word": "TOOK",
        "difficulty": 3,
        "tier": 3,
        "definition": "(verb) Grasped or carried something; moved it from one place to another.",
        "sentences": [
            "She took the last biscuit.",
            "He took the bus home.",
            "They took a long walk."
        ]
        ,
        "synonyms": ["grabbed", "accepted", "required"]
    },
    {
        "word": "TOOLS",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun) Implements or devices used to carry out a task or job.",
        "sentences": [
            "She needed the right tools.",
            "He kept all his tools in a shed.",
            "The tools were laid out neatly."
        ]
        ,
        "synonyms": ["instruments", "equipment", "implements"]
    },
    {
        "word": "TOP",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun / adjective) The highest point; of the highest level",
        "sentences": [
            "She sat at the top of the hill.",
            "He is a top student.",
            "The top of the jar is stuck."
        ]
        ,
        "synonyms": ["summit", "peak", "best"]
    },
    {
        "word": "TOTAL",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun / adjective) The whole amount; complete",
        "sentences": [
            "What is the total cost?",
            "She added up the total.",
            "It was a total surprise."
        ]
        ,
        "synonyms": ["complete", "whole", "sum"]
    },
    {
        "word": "TOUCH",
        "difficulty": 3,
        "tier": 8,
        "definition": "(verb / noun) To put a hand on; contact",
        "sentences": [
            "Don't touch that!",
            "She touched the soft fur.",
            "A light touch was enough."
        ]
        ,
        "synonyms": ["feel", "contact", "affect"]
    },
    {
        "word": "TOWARD",
        "difficulty": 3,
        "tier": 4,
        "definition": "(preposition) In the direction of",
        "sentences": [
            "She walked toward the door.",
            "He moved toward the light.",
            "They headed toward the exit."
        ]
        ,
        "synonyms": ["in-the-direction-of", "near", "regarding"]
    },
    {
        "word": "TOWN",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) A settlement smaller than a city",
        "sentences": [
            "She grew up in a small town.",
            "He walked through the town center.",
            "The whole town came to the festival."
        ]
        ,
        "synonyms": ["village", "municipality", "settlement"]
    },
    {
        "word": "TRACK",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun / verb) A path or course; to follow the movements of",
        "sentences": [
            "She ran on the track.",
            "He tracked the package.",
            "The track led into the forest."
        ]
        ,
        "synonyms": ["trail", "monitor", "path"]
    },
    {
        "word": "TRADE",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun / verb) The buying and selling of goods; to exchange",
        "sentences": [
            "She traded her old bike.",
            "Countries trade with each other.",
            "He worked in the trade."
        ]
        ,
        "synonyms": ["commerce", "exchange", "business"]
    },
    {
        "word": "TRAIN",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun / verb) A vehicle on rails; to teach or practice",
        "sentences": [
            "She caught the train to work.",
            "He trains twice a week.",
            "The train was on time."
        ]
        ,
        "synonyms": ["instruct", "practice", "rail-vehicle"]
    },
    {
        "word": "TRAVEL",
        "difficulty": 3,
        "tier": 4,
        "definition": "(verb / noun) To go from one place to another; a journey",
        "sentences": [
            "She loves to travel.",
            "He bought a travel guide.",
            "They traveled by train."
        ]
        ,
        "synonyms": ["journey", "voyage", "go"]
    },
    {
        "word": "TREE",
        "difficulty": 3,
        "tier": 3,
        "definition": "(noun) A tall plant with a trunk and branches",
        "sentences": [
            "We climbed the old oak tree.",
            "The tree had red leaves in autumn.",
            "She sat under the tree."
        ]
        ,
        "synonyms": ["plant", "timber", "arboreal"]
    },
    {
        "word": "TRIANGLE",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun) A shape with three sides and three angles",
        "sentences": [
            "She drew a triangle.",
            "A triangle has three angles.",
            "He built a triangle from sticks."
        ]
        ,
        "synonyms": ["three-sided-shape", "delta", "trigon"]
    },
    {
        "word": "TRIP",
        "difficulty": 3,
        "tier": 7,
        "definition": "(noun / verb) A journey; to stumble or cause to fall",
        "sentences": [
            "They went on a school trip.",
            "She tripped on the step.",
            "He planned a trip to the coast."
        ]
        ,
        "synonyms": ["journey", "stumble", "excursion"]
    },
    {
        "word": "TROUBLE",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun / verb) Difficulty or problems; to cause difficulty",
        "sentences": [
            "She got into trouble.",
            "He is always troubled by noise.",
            "Don't get into trouble!"
        ]
        ,
        "synonyms": ["problem", "difficulty", "bother"]
    },
    {
        "word": "TRUCK",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun) A large vehicle for carrying goods",
        "sentences": [
            "A big truck drove past.",
            "She drove a delivery truck.",
            "He loaded the truck."
        ]
        ,
        "synonyms": ["lorry", "vehicle", "van"]
    },
    {
        "word": "TRUE",
        "difficulty": 3,
        "tier": 4,
        "definition": "(adjective) Consistent with fact; real",
        "sentences": [
            "Is that story true?",
            "She told him the true reason.",
            "That is a true friend."
        ]
        ,
        "synonyms": ["accurate", "genuine", "real"]
    },
    {
        "word": "TRY",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb) To make an effort; to attempt",
        "sentences": [
            "Try your best.",
            "She tried hard but failed.",
            "Can I try on these shoes?"
        ]
        ,
        "synonyms": ["attempt", "endeavor", "test"]
    },
    {
        "word": "TUBE",
        "difficulty": 3,
        "tier": 9,
        "definition": "(noun) A hollow cylinder used to hold or carry things",
        "sentences": [
            "She used a tube of glue.",
            "He traveled on the London tube.",
            "Squeeze the tube from the bottom."
        ]
        ,
        "synonyms": ["pipe", "cylinder", "passage"]
    },
    {
        "word": "TURN",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb / noun) To rotate; a chance or rotation",
        "sentences": [
            "Turn left at the light.",
            "It is my turn to speak.",
            "She turned the key slowly."
        ]
        ,
        "synonyms": ["rotate", "change-direction", "become"]
    },
    {
        "word": "TWO",
        "difficulty": 3,
        "tier": 1,
        "definition": "(number) The number after one",
        "sentences": [
            "I have two brothers.",
            "She ate two slices of pizza.",
            "Two birds sat on the fence."
        ]
        ,
        "synonyms": ["pair", "couple", "dual"]
    },
    {
        "word": "TYPE",
        "difficulty": 5,
        "tier": 7,
        "definition": "(noun / verb) A category or kind; to write using a keyboard",
        "sentences": [
            "What type of music do you like?",
            "She types very fast.",
            "He typed the report quickly."
        ]
        ,
        "synonyms": ["kind", "sort", "category"]
    },
    {
        "word": "UNCLE",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun) The brother of a parent",
        "sentences": [
            "Her uncle lives in Scotland.",
            "His uncle told great stories.",
            "She visited her uncle every summer."
        ]
        ,
        "synonyms": ["relative", "father's-brother", "mother's-brother"]
    },
    {
        "word": "UNDER",
        "difficulty": 3,
        "tier": 3,
        "definition": "(preposition / adverb) Below or beneath something",
        "sentences": [
            "The cat slept under the bed.",
            "Her name is under the title.",
            "He hid under the table."
        ]
        ,
        "synonyms": ["below", "beneath", "less-than"]
    },
    {
        "word": "UNDERLINE",
        "difficulty": 5,
        "tier": 10,
        "definition": "(verb / noun) To draw a line under; a line drawn under text",
        "sentences": [
            "Underline the key words.",
            "She drew an underline below her name.",
            "He underlined the most important parts."
        ]
        ,
        "synonyms": ["emphasize", "underline-text", "mark"]
    },
    {
        "word": "UNDERSTAND",
        "difficulty": 3,
        "tier": 5,
        "definition": "(verb) To know the meaning of; to comprehend",
        "sentences": [
            "Do you understand the question?",
            "She understands how it works.",
            "I don't understand this problem."
        ]
        ,
        "synonyms": ["comprehend", "know", "grasp"]
    },
    {
        "word": "UNIT",
        "difficulty": 5,
        "tier": 4,
        "definition": "(noun) A single item; a standard measure",
        "sentences": [
            "A centimeter is a unit of length.",
            "She finished unit three.",
            "The kitchen units are all white."
        ]
        ,
        "synonyms": ["element", "module", "measure"]
    },
    {
        "word": "UNTIL",
        "difficulty": 3,
        "tier": 3,
        "definition": "(preposition / conjunction) Up to a particular time",
        "sentences": [
            "She waited until noon.",
            "Don't leave until it's done.",
            "He worked until midnight."
        ]
        ,
        "synonyms": ["up-to", "till", "before"]
    },
    {
        "word": "UPON",
        "difficulty": 3,
        "tier": 4,
        "definition": "(preposition) On top of; used to indicate position",
        "sentences": [
            "Once upon a time...",
            "She placed the gift upon the table.",
            "He stumbled upon the answer."
        ]
        ,
        "synonyms": ["on-top-of", "onto", "as-soon-as"]
    },
    {
        "word": "USE",
        "difficulty": 3,
        "tier": 1,
        "definition": "(verb / noun) To put something to a purpose; the act of using",
        "sentences": [
            "Can I use your pen?",
            "What is the use of this tool?",
            "She knows how to use a compass."
        ]
        ,
        "synonyms": ["utilize", "employ", "apply"]
    },
    {
        "word": "USUALLY",
        "difficulty": 3,
        "tier": 4,
        "definition": "(adverb) Most of the time; normally",
        "sentences": [
            "She usually walks to school.",
            "He usually wakes up early.",
            "I usually have toast for breakfast."
        ]
        ,
        "synonyms": ["typically", "generally", "normally"]
    },
    {
        "word": "VALLEY",
        "difficulty": 3,
        "tier": 8,
        "definition": "(noun) A low area between hills or mountains",
        "sentences": [
            "The valley was covered in fog.",
            "She walked down into the valley.",
            "A river ran through the valley."
        ]
        ,
        "synonyms": ["gorge", "basin", "dale"]
    },
    {
        "word": "VALUE",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun / verb) The worth of something; to consider important",
        "sentences": [
            "What is the value of this?",
            "She values honesty.",
            "He sold it for good value."
        ]
        ,
        "synonyms": ["worth", "importance", "cost"]
    },
    {
        "word": "VARIOUS",
        "difficulty": 5,
        "tier": 10,
        "definition": "(adjective) Several different kinds",
        "sentences": [
            "She has various hobbies.",
            "He tried various methods.",
            "There are various reasons."
        ]
        ,
        "synonyms": ["diverse", "assorted", "different"]
    },
    {
        "word": "VENERABLE",
        "difficulty": 5,
        "definition": "(adj.) Respected due to age or wisdom.",
        "sentence": "A venerable elder.",
        "hint": "Respected."
        ,
        "synonyms": ["respected", "esteemed", "revered"]
    },
    {
        "word": "VERB",
        "difficulty": 5,
        "tier": 5,
        "definition": "(noun) A word that describes an action, state, or occurrence",
        "sentences": [
            "Run is a verb.",
            "She underlined each verb.",
            "Every sentence needs a verb."
        ]
        ,
        "synonyms": ["action-word", "doing-word", "predicator"]
    },
    {
        "word": "VERY",
        "difficulty": 3,
        "tier": 2,
        "definition": "(adverb) Used to emphasize an adjective or adverb",
        "sentences": [
            "She is very smart.",
            "I am very hungry.",
            "The water is very cold."
        ]
        ,
        "synonyms": ["extremely", "greatly", "highly"]
    },
    {
        "word": "VIEW",
        "difficulty": 3,
        "tier": 10,
        "definition": "(noun / verb) What can be seen; an opinion; to look at",
        "sentences": [
            "The view from the top was stunning.",
            "She viewed the paintings.",
            "In his view, it was wrong."
        ]
        ,
        "synonyms": ["opinion", "sight", "perspective"]
    },
    {
        "word": "VILLAGE",
        "difficulty": 3,
        "tier": 7,
        "definition": "(noun) A small community smaller than a town",
        "sentences": [
            "She grew up in a small village.",
            "The village had one shop.",
            "Everyone in the village knew each other."
        ]
        ,
        "synonyms": ["hamlet", "settlement", "community"]
    },
    {
        "word": "VISIT",
        "difficulty": 3,
        "tier": 8,
        "definition": "(verb / noun) To go to see someone; a trip to see someone",
        "sentences": [
            "She visited her grandma.",
            "It was a short visit.",
            "He came to visit on Sunday."
        ]
        ,
        "synonyms": ["call", "trip", "attend"]
    },
    {
        "word": "VOICE",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) The sound produced when speaking or singing",
        "sentences": [
            "She has a beautiful voice.",
            "He lowered his voice.",
            "I can hear her voice down the hall."
        ]
        ,
        "synonyms": ["sound", "speak", "tone"]
    },
    {
        "word": "VOWEL",
        "difficulty": 5,
        "tier": 4,
        "definition": "(noun) A speech sound made with an open mouth; the letters a, e, i, o, u",
        "sentences": [
            "A, E, I, O and U are vowels.",
            "Every English word has at least one vowel.",
            "She underlined each vowel."
        ]
        ,
        "synonyms": ["open-sound", "a-e-i-o-u", "vocal"]
    },
    {
        "word": "WAIT",
        "difficulty": 3,
        "tier": 5,
        "definition": "(verb / noun) To stay until something happens; a period of waiting",
        "sentences": [
            "Wait here for me.",
            "There was a long wait.",
            "She waited patiently."
        ]
        ,
        "synonyms": ["pause", "stay", "expect"]
    },
    {
        "word": "WALK",
        "difficulty": 3,
        "tier": 3,
        "definition": "(verb / noun) To move on foot; an act of walking",
        "sentences": [
            "She walks to school.",
            "Let's go for a walk.",
            "He walked slowly through the park."
        ]
        ,
        "synonyms": ["stroll", "stride", "go-on-foot"]
    },
    {
        "word": "WALL",
        "difficulty": 3,
        "tier": 6,
        "definition": "(noun) A vertical structure enclosing a space",
        "sentences": [
            "She painted the wall yellow.",
            "He leaned against the wall.",
            "The garden wall is made of stone."
        ]
        ,
        "synonyms": ["barrier", "partition", "fortification"]
    },
    {
        "word": "WANT",
        "difficulty": 3,
        "tier": 2,
        "definition": "(verb) To desire or wish for something",
        "sentences": [
            "I want some water please.",
            "What do you want for dinner?",
            "She wants to be a pilot."
        ]
        ,
        "synonyms": ["desire", "wish", "need"]
    },
    {
        "word": "WAR",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun) Armed conflict between nations or groups",
        "sentences": [
            "The war lasted many years.",
            "She learned about the war in history class.",
            "They hoped for an end to the war."
        ]
        ,
        "synonyms": ["conflict", "battle", "warfare"]
    },
    {
        "word": "WARM",
        "difficulty": 3,
        "tier": 5,
        "definition": "(adjective / verb) Somewhat hot; to heat gently",
        "sentences": [
            "The sun feels warm.",
            "She warmed the soup.",
            "It is warm by the fire."
        ]
        ,
        "synonyms": ["heated", "friendly", "temperature"]
    },
    {
        "word": "WARY",
        "difficulty": 5,
        "definition": "(adj.) Showing caution about dangers.",
        "sentence": "She was wary of strangers.",
        "hint": "Cautious."
        ,
        "synonyms": ["cautious", "guarded", "vigilant"]
    },
    {
        "word": "WAS",
        "difficulty": 3,
        "tier": 1,
        "definition": "(verb) Existed; occupied a state or position, used with singular subjects in the past.",
        "sentences": [
            "She was late today.",
            "It was a sunny day.",
            "He was very tired."
        ]
        ,
        "synonyms": ["existed", "was-present", "had-been"]
    },
    {
        "word": "WASH",
        "difficulty": 3,
        "tier": 9,
        "definition": "(verb / noun) To clean with water; an act of cleaning",
        "sentences": [
            "Wash your hands before eating.",
            "The car needs a wash.",
            "She washed the dishes."
        ]
        ,
        "synonyms": ["clean", "rinse", "launder"]
    },
    {
        "word": "WASHINGTON",
        "difficulty": 5,
        "tier": 10,
        "definition": "(noun) A US state; the capital city of the USA",
        "sentences": [
            "She visited Washington D.C.",
            "He moved to Washington state.",
            "Washington is the capital of the USA."
        ]
        ,
        "synonyms": ["state", "capital", "George-Washington"]
    },
    {
        "word": "WASN'T",
        "difficulty": 3,
        "tier": 9,
        "definition": "(contraction) Contraction of 'was not'",
        "sentences": [
            "It wasn't her fault.",
            "He wasn't at school today.",
            "That wasn't what I meant."
        ]
        ,
        "synonyms": ["was-not", "had-not-been", "never-was"]
    },
    {
        "word": "WATCH",
        "difficulty": 3,
        "tier": 3,
        "definition": "(verb / noun) To observe; a small clock worn on the wrist",
        "sentences": [
            "She watches birds in the park.",
            "He glanced at his watch.",
            "I like to watch the sunset."
        ]
        ,
        "synonyms": ["observe", "timepiece", "guard"]
    },
    {
        "word": "WATER",
        "difficulty": 3,
        "tier": 1,
        "definition": "(noun) A clear liquid essential for life",
        "sentences": [
            "Please drink more water.",
            "The water in the lake is cold.",
            "She watered the plants."
        ]
        ,
        "synonyms": ["liquid", "hydrate", "fluid"]
    },
    {
        "word": "WAVES",
        "difficulty": 3,
        "tier": 4,
        "definition": "(noun / verb) Ridges of water moving across a surface; a gesture made by raising and moving the hand.",
        "sentences": [
            "The waves crashed on the shore.",
            "She waved goodbye from the window.",
            "The flag waved in the wind."
        ]
        ,
        "synonyms": ["ripples", "swells", "undulations"]
    },
    {
        "word": "WAY",
        "difficulty": 3,
        "tier": 1,
        "definition": "(noun) A method, path, or manner of doing something",
        "sentences": [
            "Which way did she go?",
            "There is no easy way to do this.",
            "That is the wrong way."
        ]
        ,
        "synonyms": ["method", "direction", "path"]
    },
    {
        "word": "WE'LL",
        "difficulty": 4,
        "tier": 9,
        "definition": "(contraction) Contraction of 'we will'",
        "sentences": [
            "We'll be there soon.",
            "We'll need umbrellas.",
            "We'll do it together."
        ]
        ,
        "synonyms": ["we-will", "we-shall", "us"]
    },
    {
        "word": "WEAR",
        "difficulty": 4,
        "tier": 8,
        "definition": "(verb) To have clothing on the body",
        "sentences": [
            "What are you going to wear?",
            "She wears glasses.",
            "He wore a hat in the sun."
        ]
        ,
        "synonyms": ["dress", "carry", "sport"]
    },
    {
        "word": "WEATHER",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun) The state of the atmosphere at a time and place",
        "sentences": [
            "The weather is lovely today.",
            "She checked the weather forecast.",
            "Cold weather can be dangerous."
        ]
        ,
        "synonyms": ["endure", "survive", "withstand"]
    },
    {
        "word": "WEEK",
        "difficulty": 4,
        "tier": 5,
        "definition": "(noun) A period of seven days",
        "sentences": [
            "She visits every week.",
            "Next week is my birthday.",
            "He worked hard all week."
        ]
        ,
        "synonyms": ["seven-days", "period", "span"]
    },
    {
        "word": "WEIGHT",
        "difficulty": 5,
        "tier": 9,
        "definition": "(noun) How heavy something is",
        "sentences": [
            "She checked her weight.",
            "The weight was too heavy to lift.",
            "He lost weight over the summer."
        ]
        ,
        "synonyms": ["mass", "heaviness", "burden"]
    },
    {
        "word": "WELL",
        "difficulty": 4,
        "tier": 2,
        "definition": "(adverb / adjective) In a good or satisfactory way; healthy",
        "sentences": [
            "She did very well on the test.",
            "Are you feeling well?",
            "He swims well."
        ]
        ,
        "synonyms": ["healthy", "good", "shaft"]
    },
    {
        "word": "WENT",
        "difficulty": 4,
        "tier": 2,
        "definition": "(verb) Traveled or moved to another place.",
        "sentences": [
            "We went to the beach.",
            "She went to bed early.",
            "He went for a long walk."
        ]
        ,
        "synonyms": ["traveled", "departed", "moved"]
    },
    {
        "word": "WERE",
        "difficulty": 4,
        "tier": 1,
        "definition": "(verb) Existed or occurred; used with plural subjects in the past tense.",
        "sentences": [
            "They were very kind.",
            "We were late.",
            "The shoes were muddy."
        ]
        ,
        "synonyms": ["existed", "had-been", "were-present"]
    },
    {
        "word": "WEST",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun / adjective) The direction the sun sets; opposite of east",
        "sentences": [
            "She drove west.",
            "The sun sets in the west.",
            "Wild weather blew in from the west."
        ]
        ,
        "synonyms": ["direction", "sunset-side", "western"]
    },
    {
        "word": "WESTERN",
        "difficulty": 4,
        "tier": 10,
        "definition": "(adjective) Located in or relating to the west",
        "sentences": [
            "She lives in western Scotland.",
            "They watched a western film.",
            "He traveled through the western states."
        ]
        ,
        "synonyms": ["from-the-west", "occidental", "cowboy"]
    },
    {
        "word": "WHAT",
        "difficulty": 4,
        "tier": 1,
        "definition": "(pronoun / adjective) Asking for information; referring to a thing",
        "sentences": [
            "What is your name?",
            "I don't know what to say.",
            "What time is it?"
        ]
        ,
        "synonyms": ["which-thing", "that-which", "inquiry"]
    },
    {
        "word": "WHEELS",
        "difficulty": 4,
        "tier": 5,
        "definition": "(noun) Circular frames or discs that rotate on an axle, enabling vehicles to move.",
        "sentences": [
            "The wheels on the bus go round.",
            "She spun the wheels of her chair.",
            "The cart had four wheels."
        ]
        ,
        "synonyms": ["circles", "tires", "rotating-parts"]
    },
    {
        "word": "WHEN",
        "difficulty": 4,
        "tier": 1,
        "definition": "(adverb / conjunction) At or during what time",
        "sentences": [
            "When does the show start?",
            "Call me when you arrive.",
            "She smiled when she saw him."
        ]
        ,
        "synonyms": ["at-what-time", "at-the-moment", "if"]
    },
    {
        "word": "WHERE",
        "difficulty": 4,
        "tier": 2,
        "definition": "(adverb) In or to what place",
        "sentences": [
            "Where are my shoes?",
            "I know where she lives.",
            "Where did you go?"
        ]
        ,
        "synonyms": ["at-what-place", "in-which", "location"]
    },
    {
        "word": "WHETHER",
        "difficulty": 5,
        "tier": 6,
        "definition": "(conjunction) Expressing a choice between alternatives",
        "sentences": [
            "She didn't know whether to laugh or cry.",
            "Tell me whether you are coming.",
            "It doesn't matter whether it rains."
        ]
        ,
        "synonyms": ["if", "in-case", "regardless"]
    },
    {
        "word": "WHICH",
        "difficulty": 4,
        "tier": 1,
        "definition": "(pronoun / adjective) Asking for information about one from a group",
        "sentences": [
            "Which color do you like?",
            "I don't know which road to take.",
            "Which one is yours?"
        ]
        ,
        "synonyms": ["that", "what-one", "the-one-that"]
    },
    {
        "word": "WHILE",
        "difficulty": 4,
        "tier": 3,
        "definition": "(conjunction / noun) During the time that; a period of time",
        "sentences": [
            "She read while he cooked.",
            "Wait here for a while.",
            "He napped while the baby slept."
        ]
        ,
        "synonyms": ["during", "although", "meanwhile"]
    },
    {
        "word": "WHITE",
        "difficulty": 4,
        "tier": 3,
        "definition": "(adjective / noun) The color of snow or milk",
        "sentences": [
            "She wore a white dress.",
            "The rabbit had white fur.",
            "Snow is white."
        ]
        ,
        "synonyms": ["pale", "snow-colored", "light"]
    },
    {
        "word": "WHO",
        "difficulty": 4,
        "tier": 1,
        "definition": "(pronoun) Referring to a person or people",
        "sentences": [
            "Who is at the door?",
            "She is the one who called.",
            "I know who did it."
        ]
        ,
        "synonyms": ["which-person", "that-individual", "whoever"]
    },
    {
        "word": "WHOLE",
        "difficulty": 4,
        "tier": 4,
        "definition": "(adjective / noun) Complete; the entire amount",
        "sentences": [
            "She ate the whole orange.",
            "The whole class joined in.",
            "Tell me the whole story."
        ]
        ,
        "synonyms": ["complete", "entire", "all"]
    },
    {
        "word": "WHOSE",
        "difficulty": 4,
        "tier": 8,
        "definition": "(pronoun) Belonging to which person",
        "sentences": [
            "Whose coat is this?",
            "She knew whose book it was.",
            "I don't know whose it is."
        ]
        ,
        "synonyms": ["belonging-to-whom", "of-which-person", "possessive-who"]
    },
    {
        "word": "WHY",
        "difficulty": 4,
        "tier": 2,
        "definition": "(adverb) For what reason or purpose",
        "sentences": [
            "Why are you crying?",
            "I don't know why he left.",
            "She asked why the sky is blue."
        ]
        ,
        "synonyms": ["for-what-reason", "the-cause", "rationale"]
    },
    {
        "word": "WIDE",
        "difficulty": 4,
        "tier": 6,
        "definition": "(adjective) Having a great distance from side to side",
        "sentences": [
            "The river is very wide.",
            "She opened her eyes wide.",
            "There was a wide path through the park."
        ]
        ,
        "synonyms": ["broad", "extensive", "expansive"]
    },
    {
        "word": "WIFE",
        "difficulty": 4,
        "tier": 9,
        "definition": "(noun) A married woman in relation to her husband",
        "sentences": [
            "He gave his wife a gift.",
            "His wife is very kind.",
            "She became his wife last summer."
        ]
        ,
        "synonyms": ["spouse", "partner", "mate"]
    },
    {
        "word": "WILD",
        "difficulty": 4,
        "tier": 6,
        "definition": "(adjective) Living in nature; not tame",
        "sentences": [
            "The wild horses ran free.",
            "She has a wild imagination.",
            "Don't pick wild mushrooms randomly."
        ]
        ,
        "synonyms": ["untamed", "natural", "extreme"]
    },
    {
        "word": "WILL",
        "difficulty": 4,
        "tier": 1,
        "definition": "(verb) Expressing future intention or certainty",
        "sentences": [
            "She will be here soon.",
            "I will call you later.",
            "We will win the game."
        ]
        ,
        "synonyms": ["determination", "future-tense", "testament"]
    },
    {
        "word": "WIN",
        "difficulty": 4,
        "tier": 10,
        "definition": "(verb / noun) To achieve victory; a victory",
        "sentences": [
            "She won the race!",
            "He always plays to win.",
            "It was a great win for the team."
        ]
        ,
        "synonyms": ["triumph", "gain", "succeed"]
    },
    {
        "word": "WIND",
        "difficulty": 4,
        "tier": 4,
        "definition": "(noun / verb) Moving air; to turn or twist",
        "sentences": [
            "The wind blew her hat off.",
            "Wind the string around the post.",
            "The wind was very strong today."
        ]
        ,
        "synonyms": ["breeze", "gust", "air-current"]
    },
    {
        "word": "WINDOW",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun) An opening in a wall fitted with glass",
        "sentences": [
            "She looked out of the window.",
            "Open the window please.",
            "The window was covered in frost."
        ]
        ,
        "synonyms": ["opening", "pane", "view"]
    },
    {
        "word": "WINGS",
        "difficulty": 4,
        "tier": 9,
        "definition": "(noun) Limbs or structures that enable flight; also the side sections of a large building.",
        "sentences": [
            "The bird spread its wings.",
            "She loved the wings on the costume.",
            "He checked the plane's wings."
        ]
        ,
        "synonyms": ["limbs", "flanks", "extensions"]
    },
    {
        "word": "WINTER",
        "difficulty": 4,
        "tier": 6,
        "definition": "(noun) The coldest season of the year",
        "sentences": [
            "She loves winter.",
            "The winter was very long.",
            "They stayed inside all winter."
        ]
        ,
        "synonyms": ["cold-season", "frosty-months", "Dec-Feb"]
    },
    {
        "word": "WIRE",
        "difficulty": 5,
        "tier": 8,
        "definition": "(noun / verb) A thin, flexible strand of metal; to connect components using metal thread.",
        "sentences": [
            "She fixed the broken wire.",
            "He wired the plug himself.",
            "The fence is made of wire."
        ]
        ,
        "synonyms": ["cable", "conductor", "metal-thread"]
    },
    {
        "word": "WISH",
        "difficulty": 4,
        "tier": 6,
        "definition": "(verb / noun) To want something; a desire",
        "sentences": [
            "She wished on a star.",
            "Make a wish!",
            "He got his wish."
        ]
        ,
        "synonyms": ["hope", "desire", "want"]
    },
    {
        "word": "WITH",
        "difficulty": 4,
        "tier": 1,
        "definition": "(preposition) Accompanied by; in the company of",
        "sentences": [
            "She came with her sister.",
            "He cut it with a knife.",
            "I like tea with milk."
        ]
        ,
        "synonyms": ["alongside", "using", "together"]
    },
    {
        "word": "WITHIN",
        "difficulty": 4,
        "tier": 7,
        "definition": "(preposition) Inside; not beyond",
        "sentences": [
            "It is within reach.",
            "She finished within an hour.",
            "He stayed within the rules."
        ]
        ,
        "synonyms": ["inside", "in", "interior"]
    },
    {
        "word": "WITHOUT",
        "difficulty": 4,
        "tier": 3,
        "definition": "(preposition) Not having; in the absence of",
        "sentences": [
            "She left without a word.",
            "He can't see without his glasses.",
            "Don't go out without a coat."
        ]
        ,
        "synonyms": ["lacking", "absent-of", "outside"]
    },
    {
        "word": "WOMAN",
        "difficulty": 4,
        "tier": 8,
        "definition": "(noun) An adult female human",
        "sentences": [
            "A woman walked into the shop.",
            "She is a strong woman.",
            "The woman smiled kindly."
        ]
        ,
        "synonyms": ["female", "lady", "adult-woman"]
    },
    {
        "word": "WOMEN",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun) Adult female human beings.",
        "sentences": [
            "Many women attended the event.",
            "She admires strong women.",
            "Women and men are equal."
        ]
        ,
        "synonyms": ["females", "ladies", "adult-women"]
    },
    {
        "word": "WON'T",
        "difficulty": 4,
        "tier": 9,
        "definition": "(contraction) Contraction of 'will not'",
        "sentences": [
            "I won't be late.",
            "She won't eat broccoli.",
            "He won't give up."
        ]
        ,
        "synonyms": ["will-not", "refuse", "shall-not"]
    },
    {
        "word": "WONDER",
        "difficulty": 4,
        "tier": 7,
        "definition": "(verb / noun) To think curiously; a feeling of amazement",
        "sentences": [
            "She wondered what would happen.",
            "The waterfall filled her with wonder.",
            "I wonder if it will rain."
        ]
        ,
        "synonyms": ["marvel", "awe", "curiosity"]
    },
    {
        "word": "WOOD",
        "difficulty": 4,
        "tier": 4,
        "definition": "(noun) The hard material that forms trees",
        "sentences": [
            "The table is made of wood.",
            "She gathered wood for the fire.",
            "The floor is solid wood."
        ]
        ,
        "synonyms": ["timber", "forest", "lumber"]
    },
    {
        "word": "WORDS",
        "difficulty": 4,
        "tier": 1,
        "definition": "(noun) Units of language used in speaking or writing",
        "sentences": [
            "She chose her words carefully.",
            "The words on the page were small.",
            "He could not find the right words."
        ]
        ,
        "synonyms": ["terms", "vocabulary", "expressions"]
    },
    {
        "word": "WORK",
        "difficulty": 4,
        "tier": 2,
        "definition": "(noun / verb) Activity requiring effort; to do a task",
        "sentences": [
            "She goes to work early.",
            "I need to work harder.",
            "Does this machine still work?"
        ]
        ,
        "synonyms": ["labor", "function", "effort"]
    },
    {
        "word": "WORKERS",
        "difficulty": 4,
        "tier": 10,
        "definition": "(noun) People employed to carry out a task or job.",
        "sentences": [
            "The workers went on strike.",
            "She thanked all the workers.",
            "They are hard workers."
        ]
        ,
        "synonyms": ["employees", "laborers", "staff"]
    },
    {
        "word": "WORLD",
        "difficulty": 4,
        "tier": 2,
        "definition": "(noun) The Earth and all its people and things",
        "sentences": [
            "She wants to travel the world.",
            "It is the biggest city in the world.",
            "The world is full of surprises."
        ]
        ,
        "synonyms": ["Earth", "globe", "universe"]
    },
    {
        "word": "WOULD",
        "difficulty": 4,
        "tier": 1,
        "definition": "(verb) Expressing a past likelihood, willingness, or habitual action.",
        "sentences": [
            "She said she would come.",
            "I would love some tea.",
            "Would you help me?"
        ]
        ,
        "synonyms": ["conditional", "was-willing", "might"]
    },
    {
        "word": "WOULDN'T",
        "difficulty": 4,
        "tier": 10,
        "definition": "(contraction) A shortened form expressing unwillingness or refusal to do something.",
        "sentences": [
            "She wouldn't change her mind.",
            "He wouldn't eat the vegetables.",
            "I wouldn't do that if I were you."
        ]
        ,
        "synonyms": ["would-not", "refused-to", "was-unwilling"]
    },
    {
        "word": "WRITTEN",
        "difficulty": 5,
        "tier": 6,
        "definition": "(verb / adjective) Expressed or recorded using written words.",
        "sentences": [
            "She has written three books.",
            "The rules are written down.",
            "He had written her a letter."
        ]
        ,
        "synonyms": ["composed", "inscribed", "documented"]
    },
    {
        "word": "WRONG",
        "difficulty": 4,
        "tier": 10,
        "definition": "(adjective / noun) Not correct; an injustice",
        "sentences": [
            "That answer is wrong.",
            "He knew right from wrong.",
            "She took the wrong turn."
        ]
        ,
        "synonyms": ["incorrect", "immoral", "mistaken"]
    },
    {
        "word": "WROTE",
        "difficulty": 4,
        "tier": 8,
        "definition": "(verb) Formed words and sentences on a surface to communicate ideas.",
        "sentences": [
            "She wrote a poem.",
            "He wrote home every week.",
            "They wrote their names on the paper."
        ]
        ,
        "synonyms": ["composed", "authored", "penned"]
    },
    {
        "word": "YARD",
        "difficulty": 4,
        "tier": 8,
        "definition": "(noun) A unit of length equal to three feet; land around a house",
        "sentences": [
            "She measured three yards of fabric.",
            "The children played in the yard.",
            "A yard is three feet long."
        ]
        ,
        "synonyms": ["enclosure", "garden", "measure"]
    },
    {
        "word": "YEARS",
        "difficulty": 4,
        "tier": 2,
        "definition": "(noun) Periods of time lasting twelve months, or 365 days.",
        "sentences": [
            "She has worked here for ten years.",
            "The tree is one hundred years old.",
            "We have been friends for years."
        ]
        ,
        "synonyms": ["periods", "durations", "annums"]
    },
    {
        "word": "YELLOW",
        "difficulty": 4,
        "tier": 10,
        "definition": "(adjective / noun) The color of the sun or lemons",
        "sentences": [
            "She wore a yellow dress.",
            "The daffodils are bright yellow.",
            "He painted the walls yellow."
        ]
        ,
        "synonyms": ["gold", "amber", "canary"]
    },
    {
        "word": "YES",
        "difficulty": 4,
        "tier": 5,
        "definition": "(adverb / interjection) A word used to agree or express affirmation",
        "sentences": [
            "Yes, I would love to come.",
            "She nodded and said yes.",
            "Yes! We won!"
        ]
        ,
        "synonyms": ["affirmative", "certainly", "agreed"]
    },
    {
        "word": "YET",
        "difficulty": 4,
        "tier": 5,
        "definition": "(adverb / conjunction) Up to this time; but",
        "sentences": [
            "Is she here yet?",
            "She is tired, yet still smiling.",
            "I haven't eaten yet."
        ]
        ,
        "synonyms": ["still", "however", "but"]
    },
    {
        "word": "YOU",
        "difficulty": 4,
        "tier": 1,
        "definition": "(pronoun) Refers to the person or people being spoken to",
        "sentences": [
            "You are very kind.",
            "Can you help me?",
            "I saw you at the store."
        ]
        ,
        "synonyms": ["yourself", "thee", "the-person"]
    },
    {
        "word": "YOU'RE",
        "difficulty": 4,
        "tier": 8,
        "definition": "(contraction) Contraction of 'you are'",
        "sentences": [
            "You're very kind.",
            "You're going to love it.",
            "You're almost there!"
        ]
        ,
        "synonyms": ["you-are", "y'all", "yourself"]
    },
    {
        "word": "YOUNG",
        "difficulty": 4,
        "tier": 3,
        "definition": "(adjective) Not old; early in life",
        "sentences": [
            "She looks very young.",
            "Young animals need care.",
            "He was still young when he moved."
        ]
        ,
        "synonyms": ["youthful", "immature", "juvenile"]
    },
    {
        "word": "YOUR",
        "difficulty": 4,
        "tier": 1,
        "definition": "(pronoun) Belonging to the person being spoken to",
        "sentences": [
            "Is this your coat?",
            "Your dog is so cute!",
            "Please wash your hands."
        ]
        ,
        "synonyms": ["belonging-to-you", "your-own", "possessive-you"]
    },
    {
        "word": "YOURSELF",
        "difficulty": 4,
        "tier": 8,
        "definition": "(pronoun) Refers back to the person being spoken to",
        "sentences": [
            "Do it yourself.",
            "Be yourself.",
            "You should be proud of yourself."
        ]
        ,
        "synonyms": ["you-personally", "oneself", "your-own-self"]
    },
    {
        "word": "ZEALOUS",
        "difficulty": 5,
        "definition": "(adj.) Showing great energy or enthusiasm.",
        "sentence": "A zealous supporter.",
        "hint": "Enthusiastic."
        ,
        "synonyms": ["fervent", "passionate", "enthusiastic"]
    }
];

class WordLibrary {
    constructor() {
        this.datasets = {
            sat: typeof SAT_WORDS !== 'undefined' ? SAT_WORDS : [],
            grade: typeof INKLING_WORDS !== 'undefined' ? INKLING_WORDS : [],
            doozies: typeof DOOZIE_WORDS !== 'undefined' ? DOOZIE_WORDS : [],
            inkling: typeof INKLING_WORDS !== 'undefined' ? INKLING_WORDS : []
        };

        // Filter out words with spaces (e.g., "ALL RIGHT")
        // This is a safety measure to avoid rendering issues with the 3D brick system
        Object.keys(this.datasets).forEach(key => {
            if (Array.isArray(this.datasets[key])) {
                this.datasets[key] = this.datasets[key].filter(w => w && w.word && !w.word.includes(' '));
            } else {
                this.datasets[key] = [];
            }
        });

        this.currentSetKey = 'sat';
        this.currentTier = 1;
        this.history = []; // History of recent words to avoid repetition
    }

    setDataset(key) {
        if (this.datasets[key]) {
            this.currentSetKey = key;
            console.log("WordLibrary dataset set to:", key);
        }
    }

    getWords() {
        return this.datasets[this.currentSetKey] || SAT_WORDS;
    }

    getRandomWord(tier = null, difficulty = null, excludeList = []) {
        const pool = this.getWords();
        if (pool.length === 0) return { word: "ERROR", definition: "(n.) No words found in dataset." };

        let filtered;
        if (difficulty !== null) {
            filtered = pool.filter(w => {
                const wDiff = w.difficulty !== undefined ? w.difficulty : w.tier;
                return wDiff === difficulty;
            });
        } else if (tier !== null) {
            let minDiff = 1, maxDiff = 3;
            if (tier === 2) { minDiff = 4; maxDiff = 7; }
            if (tier === 3) { minDiff = 8; maxDiff = 10; }

            filtered = pool.filter(w => {
                if (w.difficulty !== undefined) {
                    return w.difficulty >= minDiff && w.difficulty <= maxDiff;
                }
                return w.tier === tier;
            });
        } else {
            filtered = pool;
        }

        const finalPool = filtered.length > 0 ? filtered : pool;

        // Priority 1: Words NOT in session history AND NOT in profile history (excludeList)
        const excludeListUpper = excludeList.map(v => v.toUpperCase());
        let nonRepeatPool = finalPool.filter(w => !this.history.includes(w.word) && !excludeListUpper.includes(w.word.toUpperCase()));

        if (nonRepeatPool.length === 0) {
            // Priority 2: Words NOT in current session history (allows repeating older runs if pool is small)
            nonRepeatPool = finalPool.filter(w => !this.history.includes(w.word));

            if (nonRepeatPool.length === 0) {
                // Priority 3: Truly exhausted, reset session history
                this.history = [];
                nonRepeatPool = finalPool;
            }
        }

        const selection = nonRepeatPool[Math.floor(Math.random() * nonRepeatPool.length)];
        this.history.push(selection.word);
        const maxHistory = Math.max(0, finalPool.length - 1);
        if (this.history.length > maxHistory) this.history.shift();

        return selection;
    }

    // Generate a 1-10 difficulty score based on length and rare letters
    calculateDifficulty(wordStr) {
        if (!wordStr) return 1;
        const word = wordStr.toUpperCase();

        let score = word.length - 2; // Base score heavily tied to length. "Cat" -> 1.

        // Rare/Difficult letter penalties
        const rareLetters = ['X', 'Z', 'Q', 'J', 'V', 'K', 'W'];
        let rareCount = 0;
        for (let char of word) {
            if (rareLetters.includes(char)) rareCount++;
        }
        score += (rareCount * 1.5); // Boost score for tricky letters

        // Clamp between 1 and 10
        return Math.max(1, Math.min(10, Math.floor(score)));
    }

    // Get words bucketed by 1-10 difficulty rating
    getDifficultyBuckets() {
        const pool = this.getWords();
        const buckets = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] };

        pool.forEach(item => {
            const diff = this.calculateDifficulty(item.word);
            buckets[diff].push(item);
        });

        return buckets;
    }

    getRandomWordByLength(length, excludeList = []) {
        const pool = this.getWords();
        const filtered = pool.filter(w => w.word.length === length);
        const finalPool = filtered.length > 0 ? filtered : pool;

        // Respect history and excludeList
        const excludeListUpper = excludeList.map(v => v.toUpperCase());
        let nonRepeatPool = finalPool.filter(w => !this.history.includes(w.word) && !excludeListUpper.includes(w.word.toUpperCase()));

        if (nonRepeatPool.length === 0) {
            // Fallback: exclude session history only
            nonRepeatPool = finalPool.filter(w => !this.history.includes(w.word));
            if (nonRepeatPool.length === 0) {
                this.history = [];
                nonRepeatPool = finalPool; // List truly exhausted
            }
        }

        const selection = nonRepeatPool[Math.floor(Math.random() * nonRepeatPool.length)];
        this.history.push(selection.word);
        const maxHistory = Math.max(0, finalPool.length - 1);
        if (this.history.length > maxHistory) this.history.shift();

        return selection;
    }

    getRandomWordByDifficulty(difficulty, excludeList = []) {
        return this.getRandomWord(null, difficulty, excludeList);
    }

    getTotalWords(listType) {
        if (listType === 'inkling') return typeof INKLING_WORDS !== 'undefined' ? INKLING_WORDS.length : 0;
        if (listType === 'doozies') return typeof DOOZIE_WORDS !== 'undefined' ? DOOZIE_WORDS.length : 0;
        return typeof SAT_WORDS !== 'undefined' ? SAT_WORDS.length : 0;
    }

    getGlobalTotalWords() {
        let total = 0;
        if (typeof SAT_WORDS !== 'undefined') total += SAT_WORDS.length;
        if (typeof DOOZIE_WORDS !== 'undefined') total += DOOZIE_WORDS.length;
        if (typeof INKLING_WORDS !== 'undefined') total += INKLING_WORDS.length;
        return total;
    }
}
