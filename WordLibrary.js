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
    { word: "ABATE", definition: "(v.) To become less intense or widespread.", sentence: "The storm began to abate.", hint: "To lessen in intensity.", tier: 1, difficulty: 1 },
    { word: "ABDICATE", definition: "(v.) To give up a position, right, or power.", sentence: "The king chose to abdicate the throne.", hint: "To renounce a throne.", tier: 2, difficulty: 1 },
    { word: "ABERRATION", definition: "(n.) A departure from what is normal or expected.", sentence: "The snowstorm in July was an aberration.", hint: "An anomaly.", tier: 2, difficulty: 1 },
    { word: "ABHOR", definition: "(v.) To regard with disgust and hatred.", sentence: "I abhor any kind of cruelty.", hint: "To detest.", tier: 2, difficulty: 1 },
    { word: "ABJECT", definition: "(adj.) Experienced or present to the maximum degree.", sentence: "The family lived in abject poverty.", hint: "Extremely bad.", tier: 3, difficulty: 3 },
    { word: "ABNEGATION", definition: "(n.) The act of renouncing or rejecting something.", sentence: "Monks often practice abnegation.", hint: "Self-denial.", tier: 3, difficulty: 5 },
    { word: "ABORTIVE", definition: "(adj.) Failing to produce the intended result.", sentence: "The mission was abortive.", hint: "Unsuccessful.", tier: 3, difficulty: 4 },
    { word: "ABRIDGE", definition: "(v.) To shorten a piece of writing without losing the sense.", sentence: "The editor will abridge the long novel for younger readers.", hint: "To condense.", tier: 2, difficulty: 1 },
    { word: "ABROGATE", definition: "(v.) To repeal or do away with (a law or right).", sentence: "The government may abrogate the old treaty.", hint: "To abolish.", tier: 3, difficulty: 4 },
    { word: "ABSCOND", definition: "(v.) To leave hurriedly and secretly.", sentence: "The thief plans to abscond with the stolen funds.", hint: "To run away.", tier: 2, difficulty: 3 },
    { word: "ABSOLVE", definition: "(v.) To set or declare free from blame or guilt.", sentence: "The judge will absolve him of all wrongdoing.", hint: "To forgive.", tier: 2, difficulty: 1 },
    { word: "ABSTAIN", definition: "(v.) To restrain oneself from doing or enjoying something.", sentence: "He chose to abstain from dessert.", hint: "To refrain.", tier: 1, difficulty: 1 },
    { word: "ABSTRUSE", definition: "(adj.) Difficult to understand; obscure.", sentence: "The philosopher's theories were abstruse.", hint: "Profound.", tier: 3, difficulty: 4 },
    { word: "ABYSMAL", definition: "(adj.) Extremely bad; appalling.", sentence: "The service was abysmal.", hint: "Very poor.", tier: 2, difficulty: 1 },
    { word: "ACCEDE", definition: "(v.) To agree to a demand or request.", sentence: "She will accede to their reasonable request.", hint: "To consent.", tier: 2, difficulty: 3 },
    { word: "ACCLAIM", definition: "(v./n.) To praise enthusiastically and publicly.", sentence: "The film won critical acclaim.", hint: "Public praise.", tier: 1, difficulty: 1 },
    { word: "ACCOLADE", definition: "(n.) An award or privilege granted as a special honor.", sentence: "She received many accolades.", hint: "An honor.", tier: 2, difficulty: 2 },
    { word: "ACCORD", definition: "(n./v.) An official agreement or treaty; to give.", sentence: "The powers signed an accord.", hint: "Agreement.", tier: 2, difficulty: 1 },
    { word: "ACCOST", definition: "(v.) To approach and address someone boldly.", sentence: "The guard will accost anyone who enters without permission.", hint: "To confront.", tier: 2, difficulty: 3 },
    { word: "ACCRETION", definition: "(n.) Growth or increase by gradual accumulation.", sentence: "The accretion of sediment.", hint: "Accumulation.", tier: 3, difficulty: 5 },
    { word: "ACERBIC", definition: "(adj.) Sharp and forthright; sour or bitter.", sentence: "He was known for his acerbic wit.", hint: "Sarcastic.", tier: 3, difficulty: 4 },
    { word: "ACQUIESCE", definition: "(v.) To accept something reluctantly but without protest.", sentence: "She will acquiesce to her parents' wishes.", hint: "To comply.", tier: 2, difficulty: 3 },
    { word: "ACRIMONIOUS", definition: "(adj.) Angry and bitter (typically of a speech).", sentence: "An acrimonious divorce.", hint: "Bitter.", tier: 3, difficulty: 4 },
    { word: "ACUMEN", definition: "(n.) The ability to make good judgments.", sentence: "Her business acumen was impressive.", hint: "Insight.", tier: 3, difficulty: 3 },
    { word: "ADAMANT", definition: "(adj.) Refusing to be persuaded or to change one's mind.", sentence: "He was adamant about his decision.", hint: "Unyielding.", tier: 2, difficulty: 2 },
    { word: "ADDUCE", definition: "(v.) To cite as evidence.", sentence: "The lawyer will adduce key facts to support the case.", hint: "To cite.", tier: 3, difficulty: 5 },
    { word: "ADHERENT", definition: "(n./adj.) A follower or supporter of a leader or belief.", sentence: "He was a strict adherent of the faith.", hint: "A follower.", tier: 2, difficulty: 2 },
    { word: "ADMONISH", definition: "(v.) To warn or reprimand someone firmly.", sentence: "The teacher admonished the students.", hint: "To scold.", tier: 2, difficulty: 2 },
    { word: "ADROIT", definition: "(adj.) Clever or skillful in using the hands or mind.", sentence: "He was adroit at tax avoidance.", hint: "Skillful.", tier: 3, difficulty: 3 },
    { word: "ADULATION", definition: "(n.) Excessive admiration or praise.", sentence: "The band received adulation from fans.", hint: "Worship.", tier: 3, difficulty: 4 },
    { word: "ADULTERATE", definition: "(v.) To render poorer in quality by adding another substance.", sentence: "The wine was adulterated with water.", hint: "To contaminate.", tier: 3, difficulty: 3 },
    { word: "ADVERSARY", definition: "(n.) One's opponent in a contest, conflict, or dispute.", sentence: "The boxer beat his adversary.", hint: "An opponent.", tier: 1, difficulty: 1 },
    { word: "ADVERSE", definition: "(adj.) Preventing success or development; harmful.", sentence: "Adverse weather conditions.", hint: "Unfavorable.", tier: 2, difficulty: 1 },
    { word: "ADVOCATE", definition: "(v./n.) To publicly support or recommend a cause.", sentence: "She will advocate for better school lunches.", hint: "To support.", tier: 1, difficulty: 1 },
    { word: "AFFABLE", definition: "(adj.) Friendly, good-natured, or easy to talk to.", sentence: "The host was very affable.", hint: "Friendly.", tier: 2, difficulty: 3 },
    { word: "AFFECTATION", definition: "(n.) Behavior that is artificial and designed to impress.", sentence: "His British accent was an affectation.", hint: "Artificiality.", tier: 3, difficulty: 3 },
    { word: "AFFINITY", definition: "(n.) A spontaneous or natural liking for someone.", sentence: "She has an affinity for animals.", hint: "An attraction.", tier: 2, difficulty: 2 },
    { word: "AFFLUENT", definition: "(adj.) Having a great deal of money; wealthy.", sentence: "The neighborhood was very affluent.", hint: "Wealthy.", tier: 2, difficulty: 2 },
    { word: "AGGRANDIZE", definition: "(v.) To increase the power, status, or wealth of.", sentence: "He sought to aggrandize himself.", hint: "To enlarge.", tier: 3, difficulty: 5 },
    { word: "AGRARIAN", definition: "(adj.) Relating to cultivated land or farming.", sentence: "An agrarian society.", hint: "Agricultural.", tier: 3, difficulty: 4 },
    { word: "ALACRITY", definition: "(n.) Brisk and cheerful readiness.", sentence: "She accepted the job with alacrity.", hint: "Eagerness.", tier: 3, difficulty: 4 },
    { word: "ALCHEMY", definition: "(n.) A seemingly magical process of transformation.", sentence: "The alchemy of love.", hint: "Magic.", tier: 2, difficulty: 2 },
    { word: "ALLAY", definition: "(v.) To diminish or put at rest (fear or suspicion).", sentence: "The doctor's kind words will allay their fears.", hint: "To soothe.", tier: 3, difficulty: 3 },
    { word: "ALLEGE", definition: "(v.) To claim that someone has done something wrong.", sentence: "The news reports allege that he broke the rules.", hint: "To claim.", tier: 1, difficulty: 1 },
    { word: "ALLEVIATE", definition: "(v.) To make (suffering or a problem) less severe.", sentence: "Ice packs can alleviate pain after an injury.", hint: "To ease.", tier: 2, difficulty: 2 },
    { word: "ALLOCATE", definition: "(v.) To distribute (resources or duties) for a purpose.", sentence: "The school will allocate funds to the art program.", hint: "To assign.", tier: 2, difficulty: 2 },
    { word: "ALLOY", definition: "(n./v.) A metal made by combining two or more metals.", sentence: "Brass is an alloy of copper and zinc.", hint: "A mixture.", tier: 2, difficulty: 2 },
    { word: "ALLUSION", definition: "(n.) An expression designed to call something to mind.", sentence: "The poem contains an allusion to a famous speech.", hint: "A reference.", tier: 2, difficulty: 2 },
    { word: "ALOOF", definition: "(adj.) Not friendly or forthcoming; cool and distant.", sentence: "He was aloof at the party.", hint: "Distant.", tier: 2, difficulty: 2 },
    { word: "ALTRUISM", definition: "(n.) The practice of disinterested and selfless concern.", sentence: "Altruism is a noble quality.", hint: "Selflessness.", tier: 3, difficulty: 3 },
    { word: "AMALGAM", definition: "(n.) A mixture or blend of diverse elements.", sentence: "A strange amalgam of styles.", hint: "A blend.", tier: 3, difficulty: 4 },
    { word: "AMBIDEXTROUS", definition: "(adj.) Able to use the right and left hands equally well.", sentence: "She is ambidextrous.", hint: "Skillful with both hands.", tier: 3, difficulty: 3 },
    { word: "AMENABLE", definition: "(adj.) Open and responsive to suggestion.", sentence: "She was amenable to the idea.", hint: "Compliant.", tier: 2, difficulty: 3 },
    { word: "AMENITY", definition: "(n.) A desirable or useful feature of a place.", sentence: "The hotel had many amenities.", hint: "A convenience.", tier: 2, difficulty: 2 },
    { word: "AMIABLE", definition: "(adj.) Having or displaying a friendly and pleasant manner.", sentence: "The neighbors were very amiable.", hint: "Friendly.", tier: 2, difficulty: 3 },
    { word: "AMICABLE", definition: "(adj.) Characterized by friendliness and absence of discord.", sentence: "The meeting was amicable.", hint: "Peaceful.", tier: 2, difficulty: 3 },
    { word: "AMNESTY", definition: "(n.) An official pardon for people who have been convicted.", sentence: "The rebels were granted amnesty.", hint: "A pardon.", tier: 2, difficulty: 2 },
    { word: "AMORAL", definition: "(adj.) Lacking a moral sense; unconcerned with rightness.", sentence: "An amoral attitude.", hint: "Without morals.", tier: 3, difficulty: 3 },
    { word: "AMORPHOUS", definition: "(adj.) Without a clearly defined shape or form.", sentence: "An amorphous cloud of smoke.", hint: "Shapeless.", tier: 3, difficulty: 4 },
    { word: "ANACHRONISM", definition: "(n.) A thing belonging to a period other than that in which it exists.", sentence: "The sword in the modern setting was an anachronism.", hint: "Out of time.", tier: 3, difficulty: 4 },
    { word: "ANALOGY", definition: "(n.) A comparison between two things.", sentence: "He used an analogy to explain the concept.", hint: "A comparison.", tier: 1, difficulty: 1 },
    { word: "ANARCHY", definition: "(n.) A state of disorder due to absence of authority.", sentence: "The country was in a state of anarchy.", hint: "Lawlessness.", tier: 2, difficulty: 2 },
    { word: "ANATHEMA", definition: "(n.) Something or someone that one vehemently dislikes.", sentence: "Taxes were anathema to him.", hint: "Something detested.", tier: 3, difficulty: 4 },
    { word: "ANCILLARY", definition: "(adj.) Providing necessary support to the primary operation.", sentence: "Ancillary staff members.", hint: "Supportive.", tier: 3, difficulty: 4 },
    { word: "ANECDOTE", definition: "(n.) A short and amusing story about a real person.", sentence: "He told a funny anecdote.", hint: "A short story.", tier: 1, difficulty: 1 },
    { word: "ANGUISH", definition: "(n./v.) Severe mental or physical pain or suffering.", sentence: "He groaned in anguish.", hint: "Great pain.", tier: 2, difficulty: 1 },
    { word: "ANIMOSITY", definition: "(n.) Strong hostility.", sentence: "There was animosity between the rivals.", hint: "Hatred.", tier: 2, difficulty: 2 },
    { word: "ANNEX", definition: "(v./n.) To add as an extra or subordinate part.", sentence: "The country plans to annex the small border territory.", hint: "To add.", tier: 2, difficulty: 1 },
    { word: "ANOMALY", definition: "(n.) Something that deviates from what is standard or normal.", sentence: "The low result was an anomaly.", hint: "An irregularity.", tier: 2, difficulty: 2 },
    { word: "ANTECEDENT", definition: "(n./adj.) A thing or event that existed before or logically precedes.", sentence: "The antecedent to the war.", hint: "Forerunner.", tier: 3, difficulty: 3 },
    { word: "ANTEDILUVIAN", definition: "(adj.) Of or belonging to the time before the biblical Flood; old-fashioned.", sentence: "His views were antediluvian.", hint: "Extremely old.", tier: 3, difficulty: 5 },
    { word: "ANTHOLOGY", definition: "(n.) A published collection of poems or other pieces of writing.", sentence: "The anthology of poetry.", hint: "A collection.", tier: 2, difficulty: 2 },
    { word: "ANTHROPOMORPHIC", definition: "(adj.) Having human characteristics.", sentence: "The bears were anthropomorphic.", hint: "Human-like.", tier: 3, difficulty: 5 },
    { word: "ANTIPATHY", definition: "(n.) A deep-seated feeling of dislike; aversion.", sentence: "His antipathy to cats.", hint: "A dislike.", tier: 3, difficulty: 4 },
    { word: "ANTIQUATED", definition: "(adj.) Old-fashioned or outdated.", sentence: "The law was antiquated.", hint: "Outdated.", tier: 2, difficulty: 3 },
    { word: "ANTITHESIS", definition: "(n.) A person or thing that is the direct opposite of someone else.", sentence: "He is the antithesis of his brother.", hint: "The direct opposite.", tier: 3, difficulty: 3 },
    { word: "APATHY", definition: "(n.) Lack of interest, enthusiasm, or concern.", sentence: "Voter apathy is high.", hint: "Indifference.", tier: 2, difficulty: 2 },
    { word: "APHORISM", definition: "(n.) A pithy observation that contains a general truth.", sentence: "The old aphorism 'haste makes waste'.", hint: "A saying.", tier: 3, difficulty: 4 },
    { word: "APOCRYPHAL", definition: "(adj.) Of doubtful authenticity.", sentence: "The story is likely apocryphal.", hint: "Fictitious.", tier: 3, difficulty: 5 },
    { word: "APOTHEOSIS", definition: "(n.) The highest point in the development of something; culmination.", sentence: "The apotheosis of his career.", hint: "Peak.", tier: 3, difficulty: 5 },
    { word: "APPEASE", definition: "(v.) To pacify or placate someone by acceding to their demands.", sentence: "Giving in will only appease the bully temporarily.", hint: "To soothe.", tier: 2, difficulty: 2 },
    { word: "APPREHENSION", definition: "(n.) Anxiety or fear that something bad will happen.", sentence: "He felt a sense of apprehension.", hint: "Fear.", tier: 2, difficulty: 1 },
    { word: "APPROBATION", definition: "(n.) Official sanction or commendation; an expression of warm endorsement.", sentence: "The plan met with approbation.", hint: "Approval.", tier: 3, difficulty: 5 },
    { word: "APPROPRIATE", definition: "(adj./v.) Suitable or proper; take for one's own use.", sentence: "His behavior was appropriate.", hint: "Suitable.", tier: 1, difficulty: 1 },
    { word: "ARBITRARY", definition: "(adj.) Based on random choice or personal whim.", sentence: "An arbitrary decision.", hint: "Random.", tier: 2, difficulty: 2 },
    { word: "ARBITRATOR", definition: "(n.) An independent person officially appointed to settle a dispute.", sentence: "They consulted an arbitrator.", hint: "A judge.", tier: 3, difficulty: 3 },
    { word: "ARCANE", definition: "(adj.) Understood by few; mysterious or secret.", sentence: "The arcane rituals.", hint: "Secret.", tier: 3, difficulty: 3 },
    { word: "ARCHAIC", definition: "(adj.) Very old or old-fashioned.", sentence: "The language was archaic.", hint: "Ancient.", tier: 2, difficulty: 2 },
    { word: "ARCHETYPE", definition: "(n.) A very typical example of a certain person or thing.", sentence: "The archetype of the hero.", hint: "A model.", tier: 3, difficulty: 3 },
    { word: "ARDENT", definition: "(adj.) Enthusiastic or passionate.", sentence: "An ardent supporter.", hint: "Passionate.", tier: 2, difficulty: 3 },
    { word: "ARDUOUS", definition: "(adj.) Involving or requiring strenuous effort; difficult and tiring.", sentence: "An arduous journey.", hint: "Difficult.", tier: 3, difficulty: 3 },
    { word: "ARISTOCRATIC", definition: "(adj.) Having the qualities or characteristics associated with the noble or upper class.", sentence: "An aristocratic family.", hint: "Noble.", tier: 2, difficulty: 2 },
    { word: "ARTICULATE", definition: "(adj./v.) Having or showing the ability to speak fluently; to express clearly.", sentence: "She was very articulate.", hint: "Clear-spoken.", tier: 2, difficulty: 1 },
    { word: "ARTIFACT", definition: "(n.) An object made by a human being, typically one of historical interest.", sentence: "Ancient artifacts.", hint: "A relic.", tier: 1, difficulty: 1 },
    { word: "ARTIFICE", definition: "(n.) Clever or cunning devices or expedients.", sentence: "The artifice of the politician.", hint: "Deception.", tier: 3, difficulty: 4 },
    { word: "ARTISAN", definition: "(n.) A worker in a skilled trade, especially one that involves making things.", sentence: "The artisan made the table.", hint: "A craftsman.", tier: 2, difficulty: 2 },
    { word: "ASCENDANCY", definition: "(n.) Occupation of a position of dominant power or influence.", sentence: "The ascendancy of the party.", hint: "Dominance.", tier: 3, difficulty: 4 },
    { word: "ASCETIC", definition: "(adj./n.) Characterized by the practice of severe self-discipline.", sentence: "An ascetic lifestyle.", hint: "Self-denying.", tier: 3, difficulty: 4 },
    { word: "ASPERSION", definition: "(n.) An attack on the reputation or integrity of someone.", sentence: "It is wrong to cast an aspersion on someone without proof.", hint: "A slur.", tier: 3, difficulty: 4 },
    { word: "ASSIDUOUS", definition: "(adj.) Showing great care and perseverance.", sentence: "An assiduous student.", hint: "Diligent.", tier: 3, difficulty: 4 },
    { word: "SPECIOUS", definition: "(adj.) Superficially plausible, but actually wrong.", sentence: "A specious argument.", hint: "Misleading.", tier: 3, difficulty: 4 },
    { word: "SPURIOUS", definition: "(adj.) Not being what it purports to be; false or fake.", sentence: "Spurious claims.", hint: "False.", tier: 3, difficulty: 3 },
    { word: "SQUANDER", definition: "(v.) To waste in a reckless and foolish manner.", sentence: "It is foolish to squander your savings on things you do not need.", hint: "To waste.", tier: 2, difficulty: 2 },
    { word: "STAGNANT", definition: "(adj.) Having no current or flow and often smelling unpleasant.", sentence: "A stagnant ditch.", hint: "Not moving.", tier: 2, difficulty: 2 },
    { word: "SUBSTANTIATE", definition: "(v.) To provide evidence to support or prove the truth of.", sentence: "Substantiate the claim.", hint: "To prove.", tier: 3, difficulty: 3 },
    { word: "SUBTLE", definition: "(adj.) So delicate or precise as to be difficult to analyze.", sentence: "Subtle meanings.", hint: "Hard to detect.", tier: 1, difficulty: 1 },
    { word: "SUPERCILIOUS", definition: "(adj.) Having an air of condescending disdain; acting as though others are beneath one's notice.", sentence: "A supercilious lady.", hint: "Arrogant.", tier: 3, difficulty: 4 },
    { word: "SUPERFLUOUS", definition: "(adj.) Unnecessary, especially through being more than enough.", sentence: "Superfluous information.", hint: "Extra.", tier: 2, difficulty: 3 },
    { word: "SURREPTITIOUS", definition: "(adj.) Kept secret, especially because it would not be approved of.", sentence: "She took a surreptitious glance at the answers.", hint: "Secret.", tier: 3, difficulty: 4 },
    { word: "SYCOPHANT", definition: "(n.) A person who acts obsequiously toward someone important.", sentence: "A sycophant is a flatterer.", hint: "Flatterer.", tier: 3, difficulty: 4 },
    { word: "TACITURN", definition: "(adj.) (Of a person) reserved or uncommunicative in speech.", sentence: "Taciturn and morose.", hint: "Quiet.", tier: 3, difficulty: 4 },
    { word: "TANGIBLE", definition: "(adj.) Perceptible by touch.", sentence: "The mood was tangible.", hint: "Touchable.", tier: 1, difficulty: 2 },
    { word: "TANTAMOUNT", definition: "(adj.) Equivalent in seriousness to; virtually the same as.", sentence: "Tantamount to an admission.", hint: "Equivalent.", tier: 3, difficulty: 4 },
    { word: "TEMERITY", definition: "(n.) Excessive confidence or audacity.", sentence: "The temerity to question.", hint: "Boldness.", tier: 3, difficulty: 4 },
    { word: "TENACIOUS", definition: "(adj.) Tending to keep a firm hold of something; clinging or adhering closely.", sentence: "A tenacious grip.", hint: "Stubborn.", tier: 2, difficulty: 2 },
    { word: "TENUOUS", definition: "(adj.) Very weak or slight.", sentence: "A tenuous connection.", hint: "Weak.", tier: 2, difficulty: 3 },
    { word: "TRACTABLE", definition: "(adj.) (Of a person or animal) easy to control or influence.", sentence: "Tractable dogs.", hint: "Obedient.", tier: 3, difficulty: 4 },
    { word: "TREMULOUS", definition: "(adj.) Shaking or quivering slightly.", sentence: "His voice was tremulous.", hint: "Trembling.", tier: 3, difficulty: 4 },
    { word: "TREPIDATION", definition: "(n.) A feeling of fear or agitation about something that may happen.", sentence: "Fear and trepidation.", hint: "Fear.", tier: 2, difficulty: 3 },
    { word: "TRUCULENT", definition: "(adj.) Eager or quick to argue or fight; aggressively defiant.", sentence: "A truculent attitude.", hint: "Aggressive.", tier: 3, difficulty: 5 },
    { word: "UBIQUITOUS", definition: "(adj.) Present, appearing, or found everywhere.", sentence: "Ubiquitous influence.", hint: "Omnipresent.", tier: 2, difficulty: 3 },
    { word: "UNPRECEDENTED", definition: "(adj.) Never done or known before.", sentence: "An unprecedented step.", hint: "Never seen before.", tier: 2, difficulty: 2 },
    { word: "URBANE", definition: "(adj.) (Of a person) suave, courteous, and refined in manner.", sentence: "An urbane man.", hint: "Polite.", tier: 2, difficulty: 5 },
    { word: "UTILITARIAN", definition: "(adj.) Designed to be useful or practical rather than attractive.", sentence: "A utilitarian building.", hint: "Practical.", tier: 2, difficulty: 3 },
    { word: "VACILLATE", definition: "(v.) To alternate or waver between different opinions or actions.", sentence: "She tends to vacillate between two choices when she is nervous.", hint: "To waver.", tier: 3, difficulty: 5 },
    { word: "VENERABLE", definition: "(adj.) Accorded a great deal of respect, especially because of age.", sentence: "A venerable institution.", hint: "Respected.", tier: 2, difficulty: 3 },
    { word: "VENERATE", definition: "(v.) To regard with great respect; revere.", sentence: "Many people venerate those who sacrifice for others.", hint: "To honor.", tier: 2, difficulty: 3 },
    { word: "VERACITY", definition: "(n.) Conformity to facts; accuracy.", sentence: "Doubts about his veracity.", hint: "Truthfulness.", tier: 2, difficulty: 3 },
    { word: "VERBOSITY", definition: "(n.) The quality of using more words than needed.", sentence: "A reputation for verbosity.", hint: "Wordiness.", tier: 2, difficulty: 5 },
    { word: "VESTIGE", definition: "(n.) A trace of something that is disappearing or no longer exists.", sentence: "The old fort is a vestige of the town's early history.", hint: "A trace.", tier: 2, difficulty: 5 },
    { word: "VINDICATE", definition: "(v.) To clear (someone) of blame or suspicion.", sentence: "New evidence may vindicate the accused student.", hint: "To clear.", tier: 2, difficulty: 2 },
    { word: "VIRTUOSO", definition: "(n.) A person highly skilled in music or another artistic pursuit.", sentence: "A clarinet virtuoso.", hint: "Skilled artist.", tier: 2, difficulty: 2 },
    { word: "VOCIFEROUS", definition: "(adj.) (Especially of a person or speech) vehement or clamorous.", sentence: "A vociferous opponent.", hint: "Loud.", tier: 3, difficulty: 5 },
    { word: "VOLATILE", definition: "(adj.) (Of a substance) easily evaporated at normal temperatures; liable to change rapidly.", sentence: "A volatile situation.", hint: "Unstable.", tier: 2, difficulty: 2 },
    { word: "VOLUNTEER", definition: "(n./v.) A person who freely offers to take part in an enterprise; to offer freely.", sentence: "A local volunteer.", hint: "Offers freely.", tier: 1, difficulty: 1 },
    { word: "WARY", definition: "(adj.) Feeling or showing caution about possible dangers or problems.", sentence: "She was wary.", hint: "Cautious.", tier: 1, difficulty: 1 },
    { word: "WAVER", definition: "(v.) To be undecided between two opinions or courses of action.", sentence: "A good leader does not waver under pressure.", hint: "To hesitate.", tier: 2, difficulty: 2 },
    { word: "WHIMSICAL", definition: "(adj.) Playfully quaint or fanciful, especially in an appealing and amusing way.", sentence: "A whimsical sense of humor.", hint: "Fanciful.", tier: 2, difficulty: 2 },
    { word: "ZEALOUS", definition: "(adj.) Showing great energy or enthusiasm.", sentence: "An extremely zealous council.", hint: "Enthusiastic.", tier: 2, difficulty: 2 },
    { word: "ZENITH", definition: "(n.) The time at which something is most powerful or successful.", sentence: "The empire reached its zenith.", hint: "Highest point.", tier: 2, difficulty: 2 },
    { word: "APLOMB", definition: "(n.) Self-confidence or assurance, especially when in a demanding situation.", sentence: "He passed the test with aplomb.", hint: "Self-assurance.", tier: 3, difficulty: 5 },
    { word: "BELLWETHER", definition: "(n.) The leading sheep of a flock; an indicator or predictor of trends.", sentence: "The stock is a bellwether for the economy.", hint: "Trend-setter.", tier: 3, difficulty: 5 },
    { word: "CAVIL", definition: "(v.) Make petty or unnecessary objections.", sentence: "Critics will cavil about even the smallest details.", hint: "Grumble over trifles.", tier: 3, difficulty: 5 },
    { word: "DESICCATE", definition: "(v.) Remove the moisture from (something, typically food).", sentence: "Extreme heat can desiccate the soil in a matter of days.", hint: "To dry out.", tier: 3, difficulty: 5 },
    { word: "EFFERVESCENT", definition: "(adj.) (Of a liquid) giving off bubbles; vivacious and enthusiastic.", sentence: "She had an effervescent personality.", hint: "Bubbly.", tier: 2, difficulty: 3 },
    { word: "FULMINATE", definition: "(v.) Express vehement protest.", sentence: "Citizens often fulminate against unfair rules.", hint: "To protest loudly.", tier: 3, difficulty: 5 },
    { word: "GOSSAMER", definition: "(adj./n.) Used to refer to something very light, thin, and insubstantial; a fine substance.", sentence: "A gossamer veil of mist.", hint: "Delicate or flimsy.", tier: 3, difficulty: 5 },
    { word: "HUBRIS", definition: "(n.) Excessive pride or self-confidence.", sentence: "They fell due to their own hubris.", hint: "Arrogance.", tier: 2, difficulty: 3 },
    { word: "INCULCATE", definition: "(v.) Instill (an attitude, idea, or habit) by persistent instruction.", sentence: "To inculcate values in children.", hint: "To instill.", tier: 3, difficulty: 5 },
    { word: "JEJUNE", definition: "(adj.) Naive, simplistic, and superficial.", sentence: "Their jejune remarks were ignored.", hint: "Childish.", tier: 3, difficulty: 5 },
    { word: "KNELL", definition: "(n.) The sound of a bell, especially when rung solemnly for a death or funeral.", sentence: "The knell of the church bell.", hint: "A death sound.", tier: 3, difficulty: 5 },
    { word: "LASSITUDE", definition: "(n.) A state of physical or mental weariness; lack of energy.", sentence: "Overcome by lassitude.", hint: "Weariness.", tier: 3, difficulty: 5 },
    { word: "MELLIFLUOUS", definition: "(adj.) (Of a voice or words) sweet or musical; pleasant to hear.", sentence: "Her mellifluous voice.", hint: "Smooth-sounding.", tier: 3, difficulty: 5 },
    { word: "NOXIOUS", definition: "(adj.) Harmful, poisonous, or very unpleasant.", sentence: "Noxious fumes from the factory.", hint: "Harmful.", tier: 2, difficulty: 3 },
    { word: "OPPROBRIUM", definition: "(n.) Harsh criticism or censure.", sentence: "The move brought public opprobrium.", hint: "Shame or disgrace.", tier: 3, difficulty: 5 },
    { word: "PANACEA", definition: "(n.) A solution or remedy for all difficulties or diseases.", sentence: "There is no panacea for the problem.", hint: "A cure-all.", tier: 2, difficulty: 3 },
    { word: "QUAGMIRE", definition: "(n.) A soft boggy area of land; an awkward, complex, or hazardous situation.", sentence: "Stuck in a legal quagmire.", hint: "A predicament.", tier: 2, difficulty: 3 },
    { word: "REDOUBTABLE", definition: "(adj.) (Of a person) formidable, especially as an opponent.", sentence: "A redoubtable foe.", hint: "Formidable.", tier: 3, difficulty: 5 },
    { word: "SALUBRIOUS", definition: "(adj.) Health-giving; healthy.", sentence: "A salubrious climate.", hint: "Healthy.", tier: 3, difficulty: 5 },
    { word: "UMBER", definition: "(n./adj.) A natural pigment resembling ochre; a dark brown color.", sentence: "The walls were painted umber.", hint: "Dark brown color.", tier: 3, difficulty: 5 },
    { word: "VICISSITUDE", definition: "(n.) A change of circumstances or fortune, typically one that is unwelcome.", sentence: "The vicissitudes of life.", hint: "A change of fortune.", tier: 3, difficulty: 5 },
    { word: "WHEEDLE", definition: "(v.) Use flattery or coaxing in order to persuade someone to do something.", sentence: "He wheedled her into agreeing.", hint: "To coax.", tier: 2, difficulty: 5 },
    { word: "XENOPHOBIA", definition: "(n.) Dislike of or prejudice against people from other countries.", sentence: "The rise of xenophobia.", hint: "Fear of strangers.", tier: 3, difficulty: 2 },
    { word: "YOKE", definition: "(n./v.) A wooden crosspiece that is fastened over the necks of two animals; to join.", sentence: "The oxen were joined by a yoke.", hint: "A harness.", tier: 3, difficulty: 3 },
    { word: "ZEPHYR", definition: "(n.) A soft gentle breeze.", sentence: "A cool zephyr blew through.", hint: "A light breeze.", tier: 2, difficulty: 5 },
    { word: "UNDERMINE", definition: "(v.) To weaken gradually or secretly; damage.", tier: 1, difficulty: 1 },
    { word: "PREVALENT", definition: "(adj.) Widespread; commonly occurring.", tier: 1, difficulty: 2 },
    { word: "VIABLE", definition: "(adj.) Capable of working successfully; feasible.", tier: 1, difficulty: 1 },
    { word: "NOTEWORTHY", definition: "(adj.) Interesting or significant; unusual.", tier: 1, difficulty: 2 },
    { word: "VALIDATE", definition: "(v.) Confirm accuracy or truth.", tier: 1, difficulty: 1 },
    { word: "DISCREPANCY", definition: "(n.) A difference between things that should be the same.", tier: 1, difficulty: 2 },
    { word: "PROLIFERATION", definition: "(n.) A rapid increase in number; spreading.", tier: 1, difficulty: 3 },
    { word: "COMPENSATE", definition: "(v.) Make up for something; payment.", tier: 1, difficulty: 2 },
    { word: "EVIDENT", definition: "(adj.) Clear and obvious; plain to see.", tier: 1, difficulty: 1 },
    { word: "INTRICATE", definition: "(adj.) Very complicated or detailed.", tier: 1, difficulty: 2 },
    { word: "APPLICABLE", definition: "(adj.) Relevant or appropriate to a situation.", tier: 1, difficulty: 1 },
    { word: "IRRELEVANT", definition: "(adj.) Not connected with or relevant to something.", tier: 1, difficulty: 1 },
    { word: "ATTRITION", definition: "(n.) A gradual reduction in strength or number.", tier: 1, difficulty: 3 },
    { word: "ROBUST", definition: "(adj.) Strong and healthy; vigorous.", tier: 1, difficulty: 1 },
    { word: "OVERSHADOW", definition: "(v.) Tower above and cast a shadow over; dominate by importance.", tier: 1, difficulty: 2 },
    { word: "EXCEPTIONAL", definition: "(adj.) Unusually good; outstanding.", tier: 1, difficulty: 1 },
    { word: "SUCCESSION", definition: "(n.) A number of people or things sharing a specified characteristic and following one after another.", tier: 1, difficulty: 2 },
    { word: "EMERGE", definition: "(v.) Become apparent, important, or prominent.", tier: 1, difficulty: 1 },
    { word: "COINCIDE", definition: "(v.) Occur at or during the same time.", tier: 1, difficulty: 2 },
    { word: "COMBINE", definition: "(v./n.) Join or merge to form a single unit.", tier: 1, difficulty: 1 },
    { word: "CELEBRATE", definition: "(v.) Acknowledge (a significant day or event) with a social gathering.", tier: 1, difficulty: 1 },
    { word: "EMBRACE", definition: "(v./n.) Hold (someone) closely in one's arms; accept or support (a belief or theory).", tier: 1, difficulty: 1 },
    { word: "RELIABLE", definition: "(adj.) Consistently good in quality or performance; able to be trusted.", tier: 1, difficulty: 1 },
    { word: "CONSIDERABLE", definition: "(adj.) Notably large in size, amount, or extent.", tier: 1, difficulty: 1 },
    { word: "CAPABLE", definition: "(adj.) Having the ability, fitness, or quality necessary to do or achieve a specified thing.", tier: 1, difficulty: 1 },
    { word: "DEBATABLE", definition: "(adj.) Open to discussion or argument.", tier: 1, difficulty: 2 },
    { word: "ASSOCIATE", definition: "(v./n./adj.) Connect (someone or something) with something else in one's mind.", tier: 1, difficulty: 1 },
    { word: "DENOTE", definition: "(v.) Be a sign of; indicate.", tier: 1, difficulty: 2 },
    { word: "VIBRANT", definition: "(adj.) Full of energy and life.", tier: 1, difficulty: 1 },
    { word: "UTILIZE", definition: "(v.) Make practical and effective use of.", tier: 1, difficulty: 2 },
    { word: "IMPLICATION", definition: "(n.) The conclusion that can be drawn from something although it is not explicitly stated.", tier: 1, difficulty: 2 },
    { word: "PERCEIVE", definition: "(v.) Become aware or conscious of (something); come to realize or understand.", tier: 1, difficulty: 2 },
    { word: "RIGOROUS", definition: "(adj.) Extremely thorough, exhaustive, or accurate.", tier: 1, difficulty: 2 },
    { word: "SEQUEL", definition: "(n.) A published, broadcast, or recorded work that continues the story or develops the theme of an earlier one.", tier: 1, difficulty: 1 },
    { word: "COHERENT", definition: "(adj.) (Of an argument, theory, or policy) logical and consistent.", tier: 1, difficulty: 2 },
    { word: "PASTEL", definition: "(n./adj.) Pale and soft in color", tier: 2, difficulty: 2 },
    { word: "AFFILIATED", definition: "(adj./v.) Officially attached or connected to a group", tier: 2, difficulty: 2 },
    { word: "ICONOGRAPHY", definition: "(n.) Visual images and symbols used in a work", tier: 2, difficulty: 5 },
    { word: "CYPRESS", definition: "(n.) An evergreen coniferous tree", tier: 2, difficulty: 3 },
    { word: "DESIGNATION", definition: "(n.) The choosing of someone for a position", tier: 2, difficulty: 2 },
    { word: "OUTCOMPETE", definition: "(v.) Surpass in a competitive situation", tier: 2, difficulty: 3 },
    { word: "FINCH", definition: "(n.) A seed-eating songbird", tier: 2, difficulty: 3 },
    { word: "PROPAGATION", definition: "(n.) The action of widely spreading an idea", tier: 2, difficulty: 5 },
    { word: "PROJECTED", definition: "(v./adj.) Estimated or forecast on basis of trends", tier: 2, difficulty: 2 },
    { word: "WHARVES", definition: "(n.) Level quayside areas to which ships move", tier: 2, difficulty: 5 },
    { word: "HARDENING", definition: "(v./n./adj.) Become or make more rigid or fixed", tier: 2, difficulty: 2 },
    { word: "UNSUSTAINABLE", definition: "(adj.) Not able to be maintained at the current rate", tier: 2, difficulty: 2 },
    { word: "ASSEMBLING", definition: "(v./n.) Bringing together or gathering people or things into one place", tier: 2, difficulty: 2 },
    { word: "GRUDGINGLY", definition: "(adv.) In a reluctant or resentful manner", tier: 2, difficulty: 3 },
    { word: "SPORADICALLY", definition: "(adv.) Occasionally or at irregular intervals", tier: 2, difficulty: 4 },
    { word: "UNFAILINGLY", definition: "(adv.) In a way that is constant and reliable", tier: 2, difficulty: 4 },
    { word: "SELF-SERVINGLY", definition: "(adv.) Having concern for one's own welfare", tier: 2, difficulty: 5 },
    { word: "DEMOGRAPHIC", definition: "(adj.) Relating to the structure of populations", tier: 2, difficulty: 4 },
    { word: "INITIATION", definition: "(n.) Action of beginning something", tier: 2, difficulty: 2 },
    { word: "INTENTION", definition: "(n.) A plan or goal one has in mind; a purpose or aim.", tier: 2, difficulty: 1 },
    { word: "ACCEPTANCE", definition: "(n.) Action of consenting to receive or undertake", tier: 2, difficulty: 1 },
    { word: "BARRICADE", definition: "(n./v.) A hastily built obstruction used to block or defend a passage.", tier: 2, difficulty: 2 },
    { word: "BOORISH", definition: "(adj.) Rough and bad-mannered; coarse", tier: 2, difficulty: 5 },
    { word: "SATIRIZE", definition: "(v.) Deride or criticize using humor, irony, or exaggeration.", tier: 2, difficulty: 4 },
    { word: "SOPHIST", definition: "(n.) Person who reasons with clever but fallacious arguments", tier: 2, difficulty: 5 },
    { word: "STRANGELY", definition: "(adv.) In an unusual or surprising way", tier: 2, difficulty: 1 },
    { word: "SKEPTICALLY", definition: "(adv.) With doubt or suspicion; unwilling to accept claims without evidence.", tier: 2, difficulty: 4 },
    { word: "COLLAPSE", definition: "(v./n.) Fall down or give way", tier: 2, difficulty: 1 },
    { word: "CARVE", definition: "(v.) Cut into a hard material to produce an object", tier: 2, difficulty: 1 },
    { word: "BULK", definition: "(n./adj./verb) The mass or magnitude of something large", speakAs: "bulk", tier: 2, difficulty: 1 },
    { word: "AWE", definition: "(n./v.) Feeling of reverential respect mixed with fear", tier: 2, difficulty: 1 },
    { word: "SACRED", definition: "(adj.) Connected with God or dedicated to a religious purpose", tier: 2, difficulty: 1 },
    { word: "INVENT", definition: "(v.) Create or design something that did not exist before", tier: 2, difficulty: 1 },
    { word: "PRESCIENT", definition: "(adj.) Having or showing knowledge of events before they take place.", tier: 3, difficulty: 5 },
    { word: "SURREPTITIOUSLY", definition: "(adv.) In a way that attempts to avoid notice or attention; secretively.", tier: 3, difficulty: 5 },
    { word: "ENGENDER", definition: "(v.) Cause or give rise to (a feeling, situation, or condition).", tier: 3, difficulty: 5 },
    { word: "ATTENUATE", definition: "(v.) Reduce the force, effect, or value of.", tier: 3, difficulty: 5 },
    { word: "PREEMPT", definition: "(v.) Take action in order to prevent (an anticipated event) from happening; forestall.", tier: 3, difficulty: 4 },
    { word: "SUBSUME", definition: "(v.) Include or absorb (something) in something else.", tier: 3, difficulty: 5 },
    { word: "DISINGENUOUSLY", definition: "(adv.) In a way that is not candid or sincere, typically by pretending that one knows less about something than one really does.", tier: 3, difficulty: 5 },
    { word: "DISPASSIONATELY", definition: "(adv.) In a way that is not influenced by strong emotion, and so is able to be rational and impartial.", tier: 3, difficulty: 5 },
    { word: "ICONOCLASTIC", definition: "(adj.) Characterized by attack on cherished beliefs or institutions.", tier: 3, difficulty: 5 },

    { word: "LUDICROUS", definition: "(adj.) So foolish, unreasonable, or out of place as to be amusing; ridiculous.", tier: 3, difficulty: 2 },
    { word: "ANOMALOUS", definition: "(adj.) Deviating from what is standard, normal, or expected.", tier: 3, difficulty: 4 },
    { word: "PARADOXICAL", definition: "(adj.) Seemingly absurd or self-contradictory.", tier: 3, difficulty: 4 },
    { word: "INCONGRUOUS", definition: "(adj.) Not in harmony or keeping with the surroundings or other aspects of something.", tier: 3, difficulty: 5 },
    { word: "ABERRANT", definition: "(adj.) Departing from an accepted standard.", tier: 3, difficulty: 5 },
    { word: "ANTITHETICAL", definition: "(adj.) Directly opposed or contrasted; mutually incompatible.", tier: 3, difficulty: 5 },
    { word: "DISCORDANT", definition: "(adj.) Disagreeing or incongruous.", tier: 3, difficulty: 5 },
    { word: "DUBIOUS", definition: "(adj.) Hesitating or doubting.", tier: 3, difficulty: 2 },
    { word: "PROPHETIC", definition: "(adj.) Accurately describing or predicting what will happen in the future.", tier: 3, difficulty: 4 },
    { word: "VISIONARY", definition: "(adj./n.) (Especially of a person) thinking about or planning the future with imagination or wisdom.", tier: 3, difficulty: 2 },
    { word: "RETROSPECTIVE", definition: "(adj./n.) Looking back on or dealing with past events or situations.", tier: 3, difficulty: 4 },
    { word: "IMMINENT", definition: "(adj.) About to happen.", tier: 3, difficulty: 2 },
    { word: "COGENT", definition: "(adj.) (Of an argument or case) clear, logical, and convincing.", tier: 3, difficulty: 5 },
    { word: "NEBULOUS", definition: "(adj.) Unclear, vague, or lacking definite form.", tier: 3, difficulty: 5 },
    { word: "CATALYZE", definition: "(v.) Cause or accelerate a process or reaction.", tier: 3, difficulty: 4 },
    { word: "ELICIT", definition: "(v.) Evoke or draw out (a response, answer, or fact) from someone in reaction to one's own actions or questions.", tier: 3, difficulty: 4 },
    { word: "PROPAGATE", definition: "(v.) Spread and promote (an idea, theory, etc.) widely.", tier: 3, difficulty: 4 },
    { word: "PERPETUATE", definition: "(v.) Make (something, typically an undesirable situation or an unfounded belief) continue indefinitely.", tier: 3, difficulty: 4 },
    { word: "INSTIGATE", definition: "(v.) Bring about or initiate (an action or event).", tier: 3, difficulty: 4 },
    { word: "AMPLIFY", definition: "(v.) Cause to become more marked or intense.", tier: 3, difficulty: 2 },
    { word: "FORESTALL", definition: "(v.) Prevent or obstruct (an anticipated event or action) by taking action ahead of time.", tier: 3, difficulty: 5 },
    { word: "OBVIATE", definition: "(v.) Remove (a need or difficulty).", tier: 3, difficulty: 5 },
    { word: "COUNTERACT", definition: "(v.) Act against (something) in order to reduce its force or neutralize it.", tier: 3, difficulty: 2 },
    { word: "STYMIE", definition: "(v.) Prevent or hinder the progress of.", tier: 3, difficulty: 5 },
    { word: "COMPOUND", definition: "(n./adj./v.) Make (something bad) worse; intensify the negative aspects of.", tier: 3, difficulty: 2 },
    { word: "INTENSIFY", definition: "(v.) To increase in strength, force, or degree.", tier: 3, difficulty: 1 },
    { word: "IMPEDE", definition: "(v.) Delay or prevent (someone or something) by obstructing them; hinder.", tier: 3, difficulty: 4 },
    { word: "THWART", definition: "(v.) Prevent (someone) from accomplishing something.", tier: 3, difficulty: 4 },
    { word: "ENCOMPASS", definition: "(v.) Surround and have or hold within.", tier: 3, difficulty: 2 },
    { word: "ENTAIL", definition: "(v.) Involve (something) as a necessary or inevitable part or consequence.", tier: 3, difficulty: 2 },
    { word: "PARALLEL", definition: "(adj./n./v.) (Of lines, planes, surfaces, or objects) side by side and having the same distance continuously between them.", tier: 3, difficulty: 1 },
    { word: "TRANSCEND", definition: "(v.) Be or go beyond the range or limits of (typically something abstract, typically a conceptual field or division).", tier: 3, difficulty: 4 },
    { word: "CONTRADICT", definition: "(v.) Deny the truth of (a statement), especially by asserting the opposite.", tier: 3, difficulty: 2 },
    { word: "FURTIVELY", definition: "(adv.) In a way that attempts to avoid notice or attention; secretively.", tier: 3, difficulty: 5 },
    { word: "CLANDESTINELY", definition: "(adv.) Kept secret or done secretively, especially because illicit.", tier: 3, difficulty: 5 },
    { word: "COVERTLY", definition: "(adv.) Without being openly acknowledged or displayed; secretly.", tier: 3, difficulty: 4 },
    { word: "STEALTHILY", definition: "(adv.) In a cautious and surreptitious manner, so as not to be seen or heard.", tier: 3, difficulty: 4 },
    { word: "SLYLY", definition: "(adv.) In a cunning and deceitful or manipulative manner.", tier: 3, difficulty: 4 },
    { word: "UNOBTRUSIVELY", definition: "(adv.) In a way that is not conspicuous or does not attract attention.", tier: 3, difficulty: 5 },
    { word: "CIRCUMSPECTLY", definition: "(adv.) In a way that is wary and unwilling to take risks.", tier: 3, difficulty: 5 },
    { word: "DUPLICITOUSLY", definition: "(adv.) In a deceitful way; double-dealing.", tier: 3, difficulty: 5 },
    { word: "MENDACIOUSLY", definition: "(adv.) In a way that tells lies; untruthfully.", tier: 3, difficulty: 5 },
    { word: "SOPHISTICALLY", definition: "(adv.) In a way that is plausible but fallacious.", tier: 3, difficulty: 5 },
    { word: "PERFIDIOUSLY", definition: "(adv.) In a deceitful and untrustworthy manner.", tier: 3, difficulty: 5 },
    { word: "SPECIOUSLY", definition: "(adv.) In a way that is superficially plausible, but actually wrong.", tier: 3, difficulty: 5 },
    { word: "IMPARTIALLY", definition: "(adv.) In a way that treats all rivals or disputants equally; fairly.", tier: 3, difficulty: 4 },
    { word: "OBJECTIVELY", definition: "(adv.) In a way that is not influenced by personal feelings or opinions in considering and representing facts.", tier: 3, difficulty: 2 },
    { word: "FERVENTLY", definition: "(adv.) Very enthusiastically or passionately.", tier: 3, difficulty: 4 },
    { word: "ZEALOUSLY", definition: "(adv.) With great energy or enthusiasm in pursuit of a cause or an objective.", tier: 3, difficulty: 4 },
    { word: "STOICALLY", definition: "(adv.) Without complaining or showing what they are feeling", tier: 3, difficulty: 5 },
    { word: "EXPEDITIOUSLY", definition: "(adv.) With speed and efficiency", tier: 3, difficulty: 5 },
    { word: "TERSELY", definition: "(adv.) Sparing in the use of words; abrupt", tier: 3, difficulty: 5 },
    { word: "METHODICALLY", definition: "(adv.) In an orderly or systematic manner", tier: 3, difficulty: 4 },
    { word: "METICULOUSLY", definition: "(adv.) In a way that shows great attention to detail", tier: 3, difficulty: 4 },
    { word: "HAPHAZARDLY", definition: "(adv.) In a manner lacking any obvious principle", tier: 3, difficulty: 4 },
    { word: "BRAZENLY", definition: "(adv.) In a bold and shameless way", tier: 3, difficulty: 4 },
    { word: "SUCCINCTLY", definition: "(adv.) In a brief and clearly expressed manner", tier: 3, difficulty: 4 },
    { word: "PARSIMONY", definition: "(n.) Extreme unwillingness to spend money", tier: 3, difficulty: 5 },
    { word: "MELANCHOLY", definition: "(n./adj.) Feeling of pensive sadness", tier: 3, difficulty: 3 },
    { word: "VILIFY", definition: "(v.) Speak or write about in an abusively disparaging manner", tier: 3, difficulty: 4 },
    { word: "DISPARAGE", definition: "(v.) Regard or represent as being of little worth", tier: 3, difficulty: 4 },
    { word: "EXTOL", definition: "(v.) Praise enthusiastically", tier: 3, difficulty: 4 },
    { word: "MALIGN", definition: "(v./adj.) Speak about in a spitefully critical manner", tier: 3, difficulty: 4 },
    { word: "EULOGY", definition: "(n.) Speech that praises someone highly, typically deceased", tier: 3, difficulty: 4 },
    { word: "INVECTIVE", definition: "(n./adj.) Insulting, abusive, or highly critical language", tier: 3, difficulty: 5 },
    { word: "PANEGYRIC", definition: "(n.) Public speech or published text in praise of someone", tier: 3, difficulty: 5 },
    { word: "DIATRIBE", definition: "(n.) Forceful and bitter verbal attack against someone", tier: 3, difficulty: 4 },
    { word: "HARANGUE", definition: "(n./v.) Lengthy and aggressive speech", tier: 3, difficulty: 4 },
    { word: "MANDATED", definition: "(v./adj.) Give someone authority to act in certain way", tier: 2, difficulty: 3 },
    { word: "EXPLOITING", definition: "(v.) Make full use of and derive benefit from", tier: 2, difficulty: 3 },
    { word: "EXPOSING", definition: "(v.) Make something visible by uncovering it", tier: 2, difficulty: 1 },
    { word: "TRACEABILITY", definition: "(n.) The ability to follow the history or origin of something through a documented chain.", tier: 2, difficulty: 5 },
    { word: "ROBUSTNESS", definition: "(n.) Condition of being strong and healthy", tier: 2, difficulty: 3 },
    { word: "FAVORABLY", definition: "(adv.) To the advantage of someone or something", tier: 2, difficulty: 1 },
    { word: "EXPOSITION", definition: "(n.) Comprehensive explanation of theory", tier: 2, difficulty: 4 },
    { word: "UNDERUTILIZED", definition: "(adj.) Not used to full potential", tier: 2, difficulty: 4 },
    { word: "EXCUSE", definition: "(v./n.) Seek to lessen the blame attaching to", tier: 2, difficulty: 1 },
    { word: "KINDLIER", definition: "(adj.) Of a sympathetic or generous nature", tier: 2, difficulty: 4 },
    { word: "FORGE", definition: "(v./n.) Create through effort", tier: 3, difficulty: 3 },
    { word: "CHAMPION", definition: "(n./v.) Support or defend a cause", tier: 3, difficulty: 1 },
    { word: "BEAR", definition: "(v./n.) Carry, support, or endure", tier: 3, difficulty: 1 },
    { word: "CRAFT", definition: "(n./v.) Create with skill", tier: 3, difficulty: 1 },
    { word: "WARRANT", definition: "(n./v.) Justify or necessitate", tier: 3, difficulty: 3 },
    { word: "TEMPER", definition: "(v./n.) Moderate or soften", tier: 3, difficulty: 3 },
    { word: "QUALIFY", definition: "(v.) Add reservations to statement", tier: 3, difficulty: 3 },
    { word: "SANCTION", definition: "(n./v.) Official approval or authorization", tier: 3, difficulty: 3 },
    { word: "TABLE", definition: "(n./v.) Postpone or present discussion", tier: 3, difficulty: 1 },
    { word: "PLASTIC", definition: "(adj./n.) Easily shaped or molded", tier: 3, difficulty: 3 },
    { word: "PEDESTRIAN", definition: "(adj./n.) Dull, ordinary, unimaginative", tier: 3, difficulty: 4 },
    { word: "APPRECIATE", definition: "(v.) Increase in value", tier: 3, difficulty: 1 },
    { word: "ECLIPSE", definition: "(v./n.) Surpass or obscure in importance", tier: 3, difficulty: 3 },
    { word: "ENGAGE", definition: "(v./n.) Attract and hold interest", tier: 3, difficulty: 1 },
    { word: "MINE", definition: "(pron.) Used to refer to a thing or things belonging to or associated with the speaker.", tier: 3, difficulty: 1 },
    { word: "WEATHER", definition: "(v./n.) Withstand or endure", tier: 3, difficulty: 1 },
    { word: "MATCH", definition: "(n./v.) Be equal to in quality", tier: 3, difficulty: 1 },
    { word: "TELLING", definition: "(adj./v.) Revealing or significant", tier: 3, difficulty: 3 },
    { word: "NOVEL", definition: "(adj./n.) New and original", tier: 3, difficulty: 3 },
    { word: "CONCRETE", definition: "(adj./n.) Specific and tangible", tier: 3, difficulty: 3 },
    { word: "ABSTRACT", definition: "(n./adj./v.) Existing as an idea rather than concrete reality; a brief summary of a text.", tier: 3, difficulty: 3 },
    { word: "INTIMATE", definition: "(v./adj.) Suggest or hint at", tier: 3, difficulty: 4 },
    { word: "SOUND", definition: "(adj./n./v.) Logical, reliable, or healthy", tier: 3, difficulty: 1 },
    { word: "GRAVE", definition: "(adj./n.) Serious and solemn", tier: 3, difficulty: 3 },
    { word: "STEEP", definition: "(v./adj./n.) Soak or saturate in", tier: 3, difficulty: 3 },
    { word: "SINGULAR", definition: "(adj./n.) Remarkable or unique", tier: 3, difficulty: 4 },
    { word: "RELATIVE", definition: "(adj./n.) Assessed by comparison rather than by fixed standards; a family member.", tier: 3, difficulty: 3 },
    { word: "SPARE", definition: "(v./adj./n.) Refrain from harming or using", tier: 3, difficulty: 3 },
    { word: "DISCRIMINATE", definition: "(v.) Distinguish or tell difference", tier: 3, difficulty: 4 },
    { word: "RECOUNT", definition: "(v./n.) Narrate or tell a story", tier: 3, difficulty: 3 },
    { word: "SUBSCRIBE", definition: "(v.) Agree with or support opinion", tier: 3, difficulty: 3 },
    { word: "ENTERTAIN", definition: "(v.) Give attention or consideration to", tier: 3, difficulty: 1 },
    { word: "TRY", definition: "(v./n.) Test or subject to strain", tier: 3, difficulty: 1 },
    { word: "RESIGN", definition: "(v.) Accept something undesirable", tier: 3, difficulty: 3 },
    { word: "ADDRESS", definition: "(n./v.) Deal with or speak to", tier: 3, difficulty: 1 },
    { word: "EXERCISE", definition: "(n./v.) Utilize or use (power/rights)", tier: 3, difficulty: 1 },
    { word: "REALIZE", definition: "(v.) To become aware of or understand something, or to make something happen or come into being.", tier: 3, difficulty: 1 },
    { word: "REFLECT", definition: "(v.) Embody or represent", tier: 3, difficulty: 3 },
    { word: "PROMPTED", definition: "(v./adj.) Triggered; caused", tier: 3, difficulty: 3 },
    { word: "ACKNOWLEDGED", definition: "(v./adj.) Accepted as true", tier: 3, difficulty: 3 },
];




const DOOZIE_WORDS = [
    {
        "word": "A LOT",
        "difficulty": 1,
        "definition": "(adv./n.) A large number or amount."
    },
    {
        "word": "ABSENCE",
        "difficulty": 2,
        "definition": "(n.) The state of being away from a place or person."
    },
    {
        "word": "ABSORB",
        "difficulty": 1,
        "definition": "(v.) Take in or soak up (energy, or a liquid or other substance) by chemical or physical action, typically gradually."
    },
    {
        "word": "ABUNDANCE",
        "difficulty": 2,
        "definition": "(n.) A very large amount of something."
    },
    {
        "word": "ACCEPTABLE",
        "difficulty": 2,
        "definition": "(adj.) Able to be agreed on; suitable."
    },
    {
        "word": "ACCESSIBLE",
        "difficulty": 2,
        "definition": "(adj.) (Of a place) able to be reached or entered."
    },
    {
        "word": "ACCIDENTALLY",
        "difficulty": 4,
        "definition": "(adv.) By chance; unintentionally."
    },
    {
        "word": "ACCLAIM",
        "difficulty": 2,
        "definition": "(n./v.) Public praise or enthusiastic approval."
    },
    {
        "word": "ACCOMMODATE",
        "difficulty": 4,
        "definition": "(v.) To provide lodging or sufficient space for."
    },
    {
        "word": "ACCOMPLISH",
        "difficulty": 2,
        "definition": "(v.) Achieve or complete successfully."
    },
    {
        "word": "ACCORDION",
        "difficulty": 4,
        "definition": "(n.) A portable musical instrument with metal reeds, a keyboard, and bellows."
    },
    {
        "word": "ACCUMULATE",
        "difficulty": 2,
        "definition": "(v.) Gather together or acquire an increasing number or quantity of."
    },
    {
        "word": "ACHIEVE",
        "difficulty": 1,
        "definition": "(v.) To successfully bring about or reach a desired objective."
    },
    {
        "word": "ACHIEVEMENT",
        "difficulty": 2,
        "definition": "(n.) A thing done successfully, typically by effort, courage, or skill."
    },
    {
        "word": "ACQUAINTANCE",
        "difficulty": 4,
        "definition": "(n.) A person one knows slightly, but who is not a close friend."
    },
    {
        "word": "ACQUIESCE",
        "difficulty": 4,
        "definition": "(v.) Accept something reluctantly but without protest."
    },
    {
        "word": "ACQUIRE",
        "difficulty": 2,
        "definition": "(v.) To get or obtain something."
    },
    {
        "word": "ACQUITTED",
        "difficulty": 4,
        "definition": "(v.) Free (someone) from a criminal charge by a verdict of not guilty."
    },
    {
        "word": "ACROSS",
        "difficulty": 1,
        "definition": "(adv./prep.) From one side to the other of something."
    },
    {
        "word": "ADDRESS",
        "difficulty": 1,
        "definition": "(n./v.) The particulars of a place where someone lives; to deal with or speak to."
    },
    {
        "word": "ADOLESCENT",
        "difficulty": 2,
        "definition": "(adj./n.) (Of a young person) in the process of developing from a child into an adult."
    },
    {
        "word": "ADVERTISEMENT",
        "difficulty": 2,
        "definition": "(n.) A notice or announcement in a public medium promoting a product, service, or event."
    },
    {
        "word": "ADVICE",
        "difficulty": 1,
        "definition": "(n.) Guidance or recommendations offered with regard to prudent future action."
    },
    {
        "word": "ADVISABLE",
        "difficulty": 2,
        "definition": "(adj.) To be recommended; sensible."
    },
    {
        "word": "ADVISE",
        "difficulty": 1,
        "definition": "(v.) Offer suggestions about the best course of action to someone."
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
    },
    {
        "word": "AGGRESSIVE",
        "difficulty": 2,
        "definition": "(adj.) Ready or likely to attack or confront."
    },
    {
        "word": "AGON",
        "difficulty": 4,
        "definition": "(n.) A conflict or contest, especially the conflict between main characters in a literary work."
    },
    {
        "word": "AGONIC",
        "difficulty": 4,
        "definition": "(adj.) Having no magnetic declination; relating to a line where the compass points true north."
    },
    {
        "word": "AGONIZE",
        "difficulty": 2,
        "definition": "(v.) To suffer great mental or physical pain; to make a great effort to decide something."
    },
    {
        "word": "AGONY",
        "difficulty": 1,
        "definition": "(n.) Extreme physical or mental suffering."
    },
    {
        "word": "AGORA",
        "difficulty": 4,
        "definition": "(n.) A public open space used for assemblies and markets in ancient Greek city-states."
    },
    {
        "word": "AGORAPHOBIA",
        "difficulty": 4,
        "definition": "(n.) Extreme fear of open or crowded public spaces."
    },
    {
        "word": "AGRANULOCYTOSIS",
        "difficulty": 4,
        "definition": "(n.) A dangerous decrease in white blood cells, impairing immunity."
    },
    {
        "word": "ALIMENTARY",
        "difficulty": 4,
        "definition": "(adj.) Relating to food or nutrition; relating to the digestive tract."
    },
    {
        "word": "AGRARIAN",
        "difficulty": 4,
        "definition": "(adj.) Relating to cultivated land or the interests of farmers."
    },
    {
        "word": "AGRAVIC",
        "difficulty": 4,
        "definition": "(adj.) Of or relating to a condition of zero gravity."
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
    },
    {
        "word": "AGREEABLE",
        "difficulty": 1,
        "definition": "(adj.) Pleasant and easy to get along with; willing to go along with others."
    },
    {
        "word": "AGRIBUSINESS",
        "difficulty": 2,
        "definition": "(n.) Agriculture conducted on commercial principles, treating farming as a large-scale business."
    },
    {
        "word": "AGRICULTURE",
        "difficulty": 2,
        "definition": "(n.) The science or practice of farming and cultivating the soil."
    },
    {
        "word": "AGRIOLOGY",
        "difficulty": 4,
        "definition": "(n.) The study of the customs of primitive peoples."
    },
    {
        "word": "AGRIOTYPE",
        "difficulty": 5,
        "definition": "(n.) The wild ancestral type of a domesticated species."
    },
    {
        "word": "AGROGOROD",
        "difficulty": 5,
        "definition": "(n.) A large planned agricultural settlement in the Soviet Union."
    },
    {
        "word": "AGRONOME",
        "difficulty": 5,
        "definition": "(n.) A specialist in soil science and crop production who advises on farming practices."
    },
    {
        "word": "AGRONOMIST",
        "difficulty": 4,
        "definition": "(n.) A scientist who studies crop production and soil management."
    },
    {
        "word": "AGRONOMY",
        "difficulty": 4,
        "definition": "(n.) The science of soil management and crop production."
    },
    {
        "word": "AGUAJI",
        "difficulty": 5,
        "definition": "(n.) A large Caribbean reef fish valued as food."
    },
    {
        "word": "ANGORA",
        "difficulty": 4,
        "definition": "(n.) A type of soft fiber from certain goats, rabbits, or cats; a garment made from it."
    },
    {
        "word": "CARIBBEAN",
        "difficulty": 2,
        "definition": "(adj./n.) Relating to the regions or people around the sea located between North and South America."
    },
    {
        "word": "AGUISH",
        "difficulty": 4,
        "definition": "(adj.) Resembling or causing ague; marked by chills and fever."
    },
    {
        "word": "AHEAD",
        "difficulty": 1,
        "definition": "(adv.) Further forward in space, time, or order."
    },
    {
        "word": "AHEM",
        "difficulty": 1,
        "definition": "(interjection) Used to attract attention or express doubt or disapproval."
    },
    {
        "word": "AHIMSA",
        "difficulty": 5,
        "definition": "(n.) The Hindu and Buddhist doctrine of nonviolence toward all living beings."
    },
    {
        "word": "AHORSE",
        "difficulty": 4,
        "definition": "(adv.) On horseback."
    },
    {
        "word": "AIGUILLE",
        "difficulty": 5,
        "definition": "(n.) A sharp, pointed mountain peak; a slender needle-like pinnacle of rock."
    },
    {
        "word": "AIGUILLETTE",
        "difficulty": 5,
        "definition": "(n.) An ornamental tagged braid worn on a military uniform."
    },
    {
        "word": "AIKIDO",
        "difficulty": 4,
        "definition": "(n.) A Japanese martial art using throws and joint locks to redirect an attacker's force."
    },
    {
        "word": "AILANTHUS",
        "difficulty": 5,
        "definition": "(n.) A fast-growing deciduous tree (tree of heaven) native to China, known as invasive."
    },
    {
        "word": "AILERON",
        "difficulty": 5,
        "definition": "(n.) A hinged surface on an aircraft wing used to control rolling and banking."
    },
    {
        "word": "AILMENT",
        "difficulty": 1,
        "definition": "(n.) A minor illness or physical complaint."
    },
    {
        "word": "AIOLI",
        "difficulty": 4,
        "definition": "(n.) A Mediterranean sauce made of garlic and olive oil, similar to mayonnaise."
    },
    {
        "word": "AIRBORNE",
        "difficulty": 1,
        "definition": "(adj.) Transported by air; (of troops) carried and deployed by aircraft."
    },
    {
        "word": "AIRBRUSH",
        "difficulty": 1,
        "definition": "(n.) A device that sprays paint using compressed air, used for fine artwork."
    },
    {
        "word": "AIRBUS",
        "difficulty": 1,
        "definition": "(n.) A large commercial passenger aircraft or the company that manufactures them."
    },
    {
        "word": "AIRCRAFT",
        "difficulty": 1,
        "definition": "(n.) A vehicle that can fly, such as an airplane or helicopter."
    },
    {
        "word": "AIREDALE",
        "difficulty": 4,
        "definition": "(n.) A large terrier breed with a tan and black coat, originating in Yorkshire."
    },
    {
        "word": "AIRFOIL",
        "difficulty": 4,
        "definition": "(n.) A structure shaped to give lift or control when moving through air, such as a wing."
    },
    {
        "word": "AIRFRAME",
        "difficulty": 2,
        "definition": "(n.) The body of an aircraft, excluding the engines."
    },
    {
        "word": "AIRPORT",
        "difficulty": 1,
        "definition": "(n.) A complex of runways and buildings where aircraft take off, land, and are serviced."
    },
    {
        "word": "AIRSICKNESS",
        "difficulty": 2,
        "definition": "(n.) Nausea caused by the motion of an aircraft during flight."
    },
    {
        "word": "AIRSTREAM",
        "difficulty": 1,
        "definition": "(n.) A current of air moving in a particular direction; a streamlined trailer brand."
    },
    {
        "word": "AIRTIGHT",
        "difficulty": 1,
        "definition": "(adj.) Not allowing air to pass in or out; having no weaknesses or flaws."
    },
    {
        "word": "AISLE",
        "difficulty": 2,
        "definition": "(n.) A passage between rows of seats or shelves, or between sections of a building."
    },
    {
        "word": "AISLING",
        "difficulty": 5,
        "definition": "(n.) A type of Irish vision poem in which a woman represents Ireland."
    },
    {
        "word": "AITCH",
        "difficulty": 5,
        "definition": "(n.) The letter H; the name of the eighth letter of the English alphabet."
    },
    {
        "word": "AITION",
        "difficulty": 5,
        "definition": "(n.) A narrative explaining the origin of a ritual or custom; an etiological myth."
    },
    {
        "word": "AKARYOTE",
        "difficulty": 5,
        "definition": "(n.) A cell or organism that lacks a distinct nucleus."
    },
    {
        "word": "AKIMBO",
        "difficulty": 4,
        "definition": "(adj.) With hands on hips and elbows turned outward."
    },
    {
        "word": "AKIN",
        "difficulty": 1,
        "definition": "(adj.) Of similar character; related by blood."
    },
    {
        "word": "AKINESIA",
        "difficulty": 5,
        "definition": "(n.) Loss or impairment of the ability to move voluntarily."
    },
    {
        "word": "AKROPODION",
        "difficulty": 5,
        "definition": "(n.) The tip of a digit; the terminal part of a hand or foot."
    },
    {
        "word": "AKTOGRAPH",
        "difficulty": 5,
        "definition": "(n.) An instrument for recording movements of sleeping subjects."
    },
    {
        "word": "ALABASTER",
        "difficulty": 2,
        "definition": "(n.) A smooth, fine-grained white stone, often translucent, used in carvings and decorative objects."
    },
    {
        "word": "ALACRITY",
        "difficulty": 4,
        "definition": "(n.) Brisk and cheerful readiness."
    },
    {
        "word": "ALAR",
        "difficulty": 4,
        "definition": "(adj.) Relating to wings; wing-shaped."
    },
    {
        "word": "ALARMABLE",
        "difficulty": 2,
        "definition": "(adj.) Easily startled or prone to fear."
    },
    {
        "word": "ALARMIST",
        "difficulty": 2,
        "definition": "(n.) A person who tends to exaggerate potential dangers, causing unnecessary fear."
    },
    {
        "word": "ALARY",
        "difficulty": 5,
        "definition": "(adj.) Wing-shaped; relating to wings."
    },
    {
        "word": "ALAS",
        "difficulty": 1,
        "definition": "(interjection) An exclamation expressing grief, pity, or concern."
    },
    {
        "word": "ALBA",
        "difficulty": 4,
        "definition": "(n.) A type of Provençal poem lamenting the parting of lovers at dawn."
    },
    {
        "word": "ALBACORE",
        "difficulty": 4,
        "definition": "(n.) A large tuna with long pectoral fins, valued as a food fish."
    },
    {
        "word": "ALBARIUM",
        "difficulty": 5,
        "definition": "(n.) White plaster used in ancient Roman construction."
    },
    {
        "word": "ALBATROSS",
        "difficulty": 2,
        "definition": "(n.) A large seabird with a very long wingspan; a source of constant burden or anxiety."
    },
    {
        "word": "ALBEDO",
        "difficulty": 4,
        "definition": "(n.) The proportion of incident light reflected by a surface, especially a planet."
    },
    {
        "word": "ALBEDOMETER",
        "difficulty": 5,
        "definition": "(n.) An instrument for measuring the reflectivity of surfaces."
    },
    {
        "word": "ALBEIT",
        "difficulty": 2,
        "definition": "(conjunction) Though; even though."
    },
    {
        "word": "ALBINO",
        "difficulty": 2,
        "definition": "(n.) A person or animal lacking normal pigmentation, resulting in white skin and hair."
    },
    {
        "word": "ALBUM",
        "difficulty": 1,
        "definition": "(n.) A blank book for photographs or stamps; a collection of recordings released together."
    },
    {
        "word": "ALBURNUM",
        "difficulty": 5,
        "definition": "(n.) The soft, young outer wood of a tree; sapwood."
    },
    {
        "word": "ALCARRAZA",
        "difficulty": 5,
        "definition": "(n.) A porous earthenware vessel used to cool water by evaporation."
    },
    {
        "word": "ALCAZAR",
        "difficulty": 4,
        "definition": "(n.) A Spanish palace or fortress of Moorish origin."
    },
    {
        "word": "ALCHEMY",
        "difficulty": 2,
        "definition": "(n.) A medieval forerunner of chemistry; a seemingly magical process of transformation."
    },
    {
        "word": "ALCOGEL",
        "difficulty": 5,
        "definition": "(n.) A gel in which the liquid component is an alcohol."
    },
    {
        "word": "ALCOHOL",
        "difficulty": 1,
        "definition": "(n.) A colorless, flammable liquid produced by fermentation of sugars; a class of organic compounds containing a hydroxyl group."
    },
    {
        "word": "ALCOHOLATURE",
        "difficulty": 5,
        "definition": "(n.) A medicinal preparation made by soaking plant material in a liquid solvent."
    },
    {
        "word": "ALCOVE",
        "difficulty": 2,
        "definition": "(n.) A recess in a wall or room, often used for a bed or seating."
    },
    {
        "word": "ALDEHYDE",
        "difficulty": 5,
        "definition": "(n.) An organic compound containing a terminal carbonyl group; used in perfumes and resins."
    },
    {
        "word": "ALDER",
        "difficulty": 2,
        "definition": "(n.) A tree of the birch family that grows in wet habitats."
    },
    {
        "word": "ALDERMAN",
        "difficulty": 2,
        "definition": "(n.) An elected member of a municipal council, typically ranking below the mayor."
    },
    {
        "word": "ALDOSTERONE",
        "difficulty": 5,
        "definition": "(n.) A hormone secreted by the adrenal gland that regulates sodium and potassium balance."
    },
    {
        "word": "ALEATORIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to or involving chance; used of music with elements left to chance."
    },
    {
        "word": "ALEATORY",
        "difficulty": 5,
        "definition": "(adj.) Depending on the throw of a dice or chance; unpredictable."
    },
    {
        "word": "ALEE",
        "difficulty": 4,
        "definition": "(adv.) On the sheltered side of a ship, away from the wind."
    },
    {
        "word": "ALEGAR",
        "difficulty": 5,
        "definition": "(n.) Sour ale; vinegar made from ale."
    },
    {
        "word": "ALEMBIC",
        "difficulty": 5,
        "definition": "(n.) A flask used in distillation; something that refines or transforms."
    },
    {
        "word": "ALEPIDOTE",
        "difficulty": 5,
        "definition": "(adj.) Lacking scales, as certain fish."
    },
    {
        "word": "ALEURONAT",
        "difficulty": 5,
        "definition": "(n.) A flour substitute made from the protein fraction of wheat, used in diabetic diets."
    },
    {
        "word": "ALEWIFE",
        "difficulty": 4,
        "definition": "(n.) A small North American fish related to the herring; a woman who runs an alehouse."
    },
    {
        "word": "ALEXANDRITE",
        "difficulty": 4,
        "definition": "(n.) A rare gemstone that appears green in daylight and red in incandescent light."
    },
    {
        "word": "ALEXIA",
        "difficulty": 5,
        "definition": "(n.) An inability to read due to brain damage, despite intact vision."
    },
    {
        "word": "ALFALFA",
        "difficulty": 2,
        "definition": "(n.) A leguminous plant widely grown for fodder."
    },
    {
        "word": "ALFRESCO",
        "difficulty": 2,
        "definition": "(adv.) In the open air; outdoors."
    },
    {
        "word": "ALGAE",
        "difficulty": 2,
        "definition": "(n.) Simple plants or plant-like organisms that grow in water and lack true roots or stems."
    },
    {
        "word": "ALGEBRA",
        "difficulty": 1,
        "definition": "(n.) A branch of mathematics using symbols to represent numbers and express relationships."
    },
    {
        "word": "ALGEBRAICALLY",
        "difficulty": 4,
        "definition": "(adv.) By means of symbolic equations and mathematical rules."
    },
    {
        "word": "ALGERIAN",
        "difficulty": 2,
        "definition": "(adj.) Belonging to or characteristic of the North African nation on the Mediterranean coast."
    },
    {
        "word": "ALGESIA",
        "difficulty": 5,
        "definition": "(n.) Sensitivity to pain; the ability to feel pain."
    },
    {
        "word": "ALGETIC",
        "difficulty": 5,
        "definition": "(adj.) Producing or relating to pain."
    },
    {
        "word": "ALGID",
        "difficulty": 5,
        "definition": "(adj.) Chilly; cold. Often used in medicine to describe a cold, clammy condition."
    },
    {
        "word": "ALGOMETER",
        "difficulty": 5,
        "definition": "(n.) An instrument for measuring sensitivity to pain."
    },
    {
        "word": "ALGORITHM",
        "difficulty": 2,
        "definition": "(n.) A process or set of rules followed in calculations or problem-solving."
    },
    {
        "word": "ALIAS",
        "difficulty": 1,
        "definition": "(n.) A false or assumed name; also known as."
    },
    {
        "word": "ALIBI",
        "difficulty": 1,
        "definition": "(n.) A claim that one was elsewhere when a crime was committed."
    },
    {
        "word": "ALIEN",
        "difficulty": 1,
        "definition": "(n.) A foreigner; belonging to a different country or strange in nature."
    },
    {
        "word": "ALIENAGE",
        "difficulty": 4,
        "definition": "(n.) The legal standing of a person who is a citizen of another country."
    },
    {
        "word": "ALIENATION",
        "difficulty": 2,
        "definition": "(n.) The feeling of being isolated or estranged; the legal transfer of property."
    },
    {
        "word": "ALIFEROUS",
        "difficulty": 5,
        "definition": "(adj.) Having wings; winged."
    },
    {
        "word": "ALIGN",
        "difficulty": 1,
        "definition": "(v.) To place things in a straight line or bring into proper position."
    },
    {
        "word": "ALIKE",
        "difficulty": 1,
        "definition": "(adj.) Similar; having a resemblance."
    },
    {
        "word": "ALIMENTARY",
        "difficulty": 4,
        "definition": "(adj.) Relating to food or nutrition; relating to the digestive tract."
    },
    {
        "word": "ALIMONY",
        "difficulty": 2,
        "definition": "(n.) A court-ordered allowance paid to a spouse after separation or divorce."
    },
    {
        "word": "ALIPHATIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to organic compounds without aromatic rings in their structure."
    },
    {
        "word": "ALIQUANT",
        "difficulty": 5,
        "definition": "(adj.) Describing a number that does not divide another evenly."
    },
    {
        "word": "ALIQUOT",
        "difficulty": 5,
        "definition": "(n.) A portion of a whole sample taken for analysis."
    },
    {
        "word": "ALISON",
        "difficulty": 2,
        "definition": "(n.) A small flowering plant in the mustard family."
    },
    {
        "word": "ALITERACY",
        "difficulty": 5,
        "definition": "(n.) The state of being able to read but choosing not to."
    },
    {
        "word": "ALIUNDE",
        "difficulty": 5,
        "definition": "(adv.) From another source; from elsewhere (legal term)."
    },
    {
        "word": "ALIVENESS",
        "difficulty": 1,
        "definition": "(n.) The quality of being full of energy and vitality."
    },
    {
        "word": "ALKALESCENCE",
        "difficulty": 5,
        "definition": "(n.) A mild tendency toward a basic pH; the property of having low acidity."
    },
    {
        "word": "ALKALI",
        "difficulty": 4,
        "definition": "(n.) A substance that neutralizes acid; a soluble mineral salt with a pH above 7."
    },
    {
        "word": "ALKALIFY",
        "difficulty": 5,
        "definition": "(v.) To raise the pH of a substance above neutral."
    },
    {
        "word": "ALKALINE",
        "difficulty": 2,
        "definition": "(adj.) Having a pH above 7; basic rather than acidic."
    },
    {
        "word": "ALKANE",
        "difficulty": 4,
        "definition": "(n.) A saturated hydrocarbon containing only single bonds, such as methane or ethane."
    },
    {
        "word": "ALKYD",
        "difficulty": 5,
        "definition": "(n.) A synthetic resin used in paints and coatings, derived from polyester."
    },
    {
        "word": "ALL RIGHT",
        "difficulty": 1,
        "definition": "(adj./adv.) Satisfactory or acceptable; safe."
    },
    {
        "word": "ALLARGANDO",
        "difficulty": 5,
        "definition": "(adv.) A musical direction meaning to slow down and broaden the tempo."
    },
    {
        "word": "ALLAY",
        "difficulty": 2,
        "definition": "(v.) To diminish or put to rest fear, suspicion, or worry."
    },
    {
        "word": "ALLAYMENT",
        "difficulty": 5,
        "definition": "(n.) The act of alleviating or calming; relief."
    },
    {
        "word": "ALLEGATION",
        "difficulty": 2,
        "definition": "(n.) A claim or assertion, especially one made without proof."
    },
    {
        "word": "ALLEGE",
        "difficulty": 1,
        "definition": "(v.) To claim or assert that someone has done something, typically without proof."
    },
    {
        "word": "ALLEGEABLE",
        "difficulty": 5,
        "definition": "(adj.) Able to be put forward as a claim or supporting reason."
    },
    {
        "word": "ALLEGED",
        "difficulty": 1,
        "definition": "(adj.) (Of a incident or a person) said to have taken place or to have a specified illegal or undesirable quality, but without proof."
    },
    {
        "word": "ALLEGEDLY",
        "difficulty": 1,
        "definition": "(adv.) Used to convey that something is claimed to be the case, but not proven."
    },
    {
        "word": "ALLEGIANCE",
        "difficulty": 2,
        "definition": "(n.) Loyalty or commitment to a person, group, or cause."
    },
    {
        "word": "ALLEGIANT",
        "difficulty": 4,
        "definition": "(adj.) Faithful and devoted to a person, cause, or nation."
    },
    {
        "word": "ALLEGORIST",
        "difficulty": 5,
        "definition": "(n.) A writer or speaker who uses extended metaphors to convey hidden meanings."
    },
    {
        "word": "ALLEGORIZE",
        "difficulty": 5,
        "definition": "(v.) To use symbolic characters or events to represent deeper moral or political meanings."
    },
    {
        "word": "ALLEGORY",
        "difficulty": 2,
        "definition": "(n.) A story or representation where abstract ideas are personified, conveying hidden meaning."
    },
    {
        "word": "ALLEGRETTO",
        "difficulty": 5,
        "definition": "(adv.) At a moderately brisk musical pace, slightly slower than allegro."
    },
    {
        "word": "ALLEGRO",
        "difficulty": 4,
        "definition": "(adv.) A musical direction meaning to play in a fast, lively tempo."
    },
    {
        "word": "ALLEMANDE",
        "difficulty": 5,
        "definition": "(n.) A German court dance popular in the 16th–18th centuries; a wine from Alsace."
    },
    {
        "word": "ALLERGENIC",
        "difficulty": 4,
        "definition": "(adj.) Capable of triggering an immune overreaction in sensitive individuals."
    },
    {
        "word": "ALLERGY",
        "difficulty": 1,
        "definition": "(n.) An immune system reaction to a substance that is harmless to most people."
    },
    {
        "word": "ALLEVIANT",
        "difficulty": 5,
        "definition": "(n.) Something that relieves or reduces pain or difficulty."
    },
    {
        "word": "ALLEVIATE",
        "difficulty": 2,
        "definition": "(v.) To make suffering or a problem less severe."
    },
    {
        "word": "ALLEYWAY",
        "difficulty": 1,
        "definition": "(n.) A narrow passageway between or behind buildings."
    },
    {
        "word": "ALLIACEOUS",
        "difficulty": 5,
        "definition": "(adj.) Relating to or resembling garlic or onions; having their smell or taste."
    },
    {
        "word": "ALLIANCE",
        "difficulty": 1,
        "definition": "(n.) A union or association formed for mutual benefit, especially between countries."
    },
    {
        "word": "ALLIED",
        "difficulty": 1,
        "definition": "(adj.) Joined by or relating to a formal agreement or treaty."
    },
    {
        "word": "ALLIGATOR",
        "difficulty": 1,
        "definition": "(n.) A large semiaquatic reptile of the crocodilian family, found in the Americas and China."
    },
    {
        "word": "ALLISION",
        "difficulty": 5,
        "definition": "(n.) The striking of a moving vessel against a stationary object."
    },
    {
        "word": "ALLITERATION",
        "difficulty": 4,
        "definition": "(n.) The occurrence of the same letter or sound at the beginning of adjacent words."
    },
    {
        "word": "ALLOCATE",
        "difficulty": 2,
        "definition": "(v.) To distribute resources or duties for a particular purpose."
    },
    {
        "word": "ALLOCUTION",
        "difficulty": 5,
        "definition": "(n.) A formal address or speech, especially from a judge to a convicted defendant."
    },
    {
        "word": "ALLONYM",
        "difficulty": 5,
        "definition": "(n.) A name used by an author that is actually someone else's name."
    },
    {
        "word": "ALLOPELAGIC",
        "difficulty": 5,
        "definition": "(adj.) Living at varying depths in the ocean rather than a fixed layer."
    },
    {
        "word": "ALLOT",
        "difficulty": 1,
        "definition": "(v.) To give or distribute a share of something."
    },
    {
        "word": "ALLOTMENT",
        "difficulty": 2,
        "definition": "(n.) A share or portion of something allocated; a plot of land for gardening."
    },
    {
        "word": "ALLOTROPIC",
        "difficulty": 5,
        "definition": "(adj.) Describing an element that can exist in more than one structural form, such as carbon as diamond or graphite."
    },
    {
        "word": "ALLOTROPY",
        "difficulty": 5,
        "definition": "(n.) The property of some elements to exist in two or more distinct forms, e.g., carbon."
    },
    {
        "word": "ALLOTTED",
        "difficulty": 2,
        "definition": "(v.) Distributed or assigned as a share."
    },
    {
        "word": "ALLOWABLE",
        "difficulty": 1,
        "definition": "(adj.) Permitted within a set of rules or circumstances."
    },
    {
        "word": "ALLOY",
        "difficulty": 1,
        "definition": "(n.) A metal made by combining two or more metallic elements to improve properties."
    },
    {
        "word": "ALLSPICE",
        "difficulty": 1,
        "definition": "(n.) A spice made from the dried berry of the pimento tree, tasting like mixed spices."
    },
    {
        "word": "ALLUDED",
        "difficulty": 2,
        "definition": "(v.) Made an indirect reference to something without naming it explicitly."
    },
    {
        "word": "ALLURE",
        "difficulty": 1,
        "definition": "(v.) To attract or tempt; the quality of being powerfully attractive."
    },
    {
        "word": "ALLUSION",
        "difficulty": 2,
        "definition": "(n.) An indirect or passing reference to something."
    },
    {
        "word": "ALLUSIVELY",
        "difficulty": 4,
        "definition": "(adv.) In a way that hints at something without naming it directly."
    },
    {
        "word": "ALLUVIAL",
        "difficulty": 5,
        "definition": "(adj.) Consisting of sediment deposited by rivers or floods."
    },
    {
        "word": "ALLUVIATION",
        "difficulty": 5,
        "definition": "(n.) The gradual buildup of sediment deposited by flowing water."
    },
    {
        "word": "ALLUVIUM",
        "difficulty": 5,
        "definition": "(n.) Sediment deposited by flowing water, typically found in riverbeds and floodplains."
    },
    {
        "word": "ALLY",
        "difficulty": 1,
        "definition": "(n.) A person, country, or organization that cooperates with another."
    },
    {
        "word": "ALMANAC",
        "difficulty": 2,
        "definition": "(n.) An annual publication containing a calendar and various data tables."
    },
    {
        "word": "ALMANDITE",
        "difficulty": 5,
        "definition": "(n.) A deep red variety of garnet used as a gemstone."
    },
    {
        "word": "ALMIGHTY",
        "difficulty": 1,
        "definition": "(adj.) Having complete power; omnipotent."
    },
    {
        "word": "ALMOND",
        "difficulty": 1,
        "definition": "(n.) An edible nut or the tree that produces it, native to the Middle East."
    },
    {
        "word": "ALMONER",
        "difficulty": 5,
        "definition": "(n.) An official who distributes charity; a hospital social worker (British usage)."
    },
    {
        "word": "ALMS",
        "difficulty": 2,
        "definition": "(n.) Money or food given charitably to the poor."
    },
    {
        "word": "ALMUERZO",
        "difficulty": 5,
        "definition": "(n.) Lunch or brunch in Spanish-speaking cultures."
    },
    {
        "word": "ALNICO",
        "difficulty": 5,
        "definition": "(n.) A strong permanent magnetic alloy composed of aluminum, nickel, and cobalt."
    },
    {
        "word": "ALOE",
        "difficulty": 1,
        "definition": "(n.) A succulent plant with fleshy leaves used in herbal medicine and cosmetics."
    },
    {
        "word": "ALOFT",
        "difficulty": 1,
        "definition": "(adv.) Up in the air; high above the ground."
    },
    {
        "word": "ALOGIA",
        "difficulty": 5,
        "definition": "(n.) A poverty of speech associated with schizophrenia or brain damage."
    },
    {
        "word": "ALOGISM",
        "difficulty": 5,
        "definition": "(n.) A statement that defies logic; an illogical remark."
    },
    {
        "word": "ALOHA",
        "difficulty": 1,
        "definition": "(interjection) A Hawaiian greeting or farewell expressing love and affection."
    },
    {
        "word": "ALOISIITE",
        "difficulty": 5,
        "definition": "(n.) A rare silicate mineral named after a Jesuit missionary."
    },
    {
        "word": "ALONGSIDE",
        "difficulty": 1,
        "definition": "(preposition) Close to the side of; in comparison with."
    },
    {
        "word": "ALOOF",
        "difficulty": 1,
        "definition": "(adj.) Cool and distant in manner; not friendly or forthcoming."
    },
    {
        "word": "ALOPECIA",
        "difficulty": 5,
        "definition": "(n.) Hair loss from the scalp or body, due to illness or genetics."
    },
    {
        "word": "ALOPECOID",
        "difficulty": 5,
        "definition": "(adj.) Having fox-like characteristics in appearance or behavior."
    },
    {
        "word": "ALPACA",
        "difficulty": 2,
        "definition": "(n.) A South American mammal related to the llama, raised for its fiber."
    },
    {
        "word": "ALPENGLOW",
        "difficulty": 4,
        "definition": "(n.) A reddish glow seen on mountaintops just before sunrise or after sunset."
    },
    {
        "word": "ALPESTRINE",
        "difficulty": 5,
        "definition": "(adj.) Growing at high mountain altitudes; subalpine."
    },
    {
        "word": "ALPHABETICAL",
        "difficulty": 2,
        "definition": "(adj.) Arranged in the conventional sequence of letters in a language's writing system."
    },
    {
        "word": "ALPHABETIZE",
        "difficulty": 2,
        "definition": "(v.) To sort or arrange items in the conventional sequence of letters from A to Z."
    },
    {
        "word": "ALPHAGRAM",
        "difficulty": 5,
        "definition": "(n.) A word formed by sorting the letters of another word into alphabetical order."
    },
    {
        "word": "ALPHANUMERICAL",
        "difficulty": 4,
        "definition": "(adj.) Consisting of both letters and numbers."
    },
    {
        "word": "ALPINE",
        "difficulty": 2,
        "definition": "(adj.) Relating to high mountains; found at or above the timberline."
    },
    {
        "word": "ALTARPIECE",
        "difficulty": 2,
        "definition": "(n.) A decorative panel or painting positioned at the back of a church's central table."
    },
    {
        "word": "ALTAZIMUTH",
        "difficulty": 5,
        "definition": "(n.) An instrument for measuring altitude and azimuth of celestial objects."
    },
    {
        "word": "ALTERCATION",
        "difficulty": 4,
        "definition": "(n.) A noisy argument or disagreement."
    },
    {
        "word": "ALTERNATE",
        "difficulty": 1,
        "definition": "(v.) To change repeatedly between two states; every other one in a series."
    },
    {
        "word": "ALTERNATIVE",
        "difficulty": 1,
        "definition": "(n.) A choice between two or more options; available as a substitute."
    },
    {
        "word": "ALTERNATIVITY",
        "difficulty": 5,
        "definition": "(n.) The quality of offering or being a substitute option."
    },
    {
        "word": "ALTHORN",
        "difficulty": 5,
        "definition": "(n.) A valved brass instrument of the saxhorn family, used in military bands."
    },
    {
        "word": "ALTHOUGH",
        "difficulty": 1,
        "definition": "(conjunction) In spite of the fact that; even though."
    },
    {
        "word": "ALTIGRAPH",
        "difficulty": 5,
        "definition": "(n.) A recording altimeter that traces changes in altitude over time."
    },
    {
        "word": "ALTIMETER",
        "difficulty": 4,
        "definition": "(n.) An instrument for measuring altitude above sea level."
    },
    {
        "word": "ALTIMETRY",
        "difficulty": 5,
        "definition": "(n.) The science of measuring altitude, especially using radar or barometry."
    },
    {
        "word": "ALTIPLANATION",
        "difficulty": 5,
        "definition": "(n.) The formation of a flat or gently sloping surface on a high plateau by erosion."
    },
    {
        "word": "ALTIPLANO",
        "difficulty": 4,
        "definition": "(n.) A high-altitude plateau, especially in the Andes of South America."
    },
    {
        "word": "ALTITUDE",
        "difficulty": 1,
        "definition": "(n.) The height of an object or point above sea level or above the Earth's surface."
    },
    {
        "word": "ALTO",
        "difficulty": 1,
        "definition": "(n.) The lowest female singing voice; an instrument of the middle range."
    },
    {
        "word": "ALTOCUMULUS",
        "difficulty": 5,
        "definition": "(n.) A type of cloud forming a white or grey layer at mid-level altitude."
    },
    {
        "word": "ALTOGETHER",
        "difficulty": 1,
        "definition": "(adv.) Completely; on the whole; with everything considered."
    },
    {
        "word": "ALTOSTRATUS",
        "difficulty": 5,
        "definition": "(n.) A grey or blue-grey cloud layer at mid-altitude covering the sky."
    },
    {
        "word": "ALTRICIAL",
        "difficulty": 5,
        "definition": "(adj.) Describing young birds or animals that hatch or are born helpless, needing parental care."
    },
    {
        "word": "ALTRUISM",
        "difficulty": 2,
        "definition": "(n.) Selfless concern for the well-being of others."
    },
    {
        "word": "ALTRUISTIC",
        "difficulty": 2,
        "definition": "(adj.) Showing a selfless concern for the welfare of others."
    },
    {
        "word": "ALUM",
        "difficulty": 2,
        "definition": "(n.) A double sulfate salt used in medicine and dyeing; a graduate of a school."
    },
    {
        "word": "ALUMINIFEROUS",
        "difficulty": 5,
        "definition": "(adj.) Bearing or producing the lightweight metallic element used in foil and aircraft."
    },
    {
        "word": "ALUMINOTYPE",
        "difficulty": 5,
        "definition": "(n.) An early photographic method that used a metallic plate as the image base."
    },
    {
        "word": "ALUMINOUS",
        "difficulty": 5,
        "definition": "(adj.) Having properties associated with a soft, lightweight, silvery-white metal."
    },
    {
        "word": "ALUMINUM",
        "difficulty": 1,
        "definition": "(n.) A lightweight, silvery-white metallic element widely used in construction and packaging."
    },
    {
        "word": "ALUMNUS",
        "difficulty": 2,
        "definition": "(n.) A former student of a school or university."
    },
    {
        "word": "ALVEOLAR",
        "difficulty": 5,
        "definition": "(adj.) Relating to the tiny air sacs in the lungs, or the bony ridge just behind the upper front teeth."
    },
    {
        "word": "ALVEOLATE",
        "difficulty": 5,
        "definition": "(adj.) Having small cavities or pits; honeycomb-like in structure."
    },
    {
        "word": "ALWAYS",
        "difficulty": 1,
        "definition": "(adv.) At all times; on every occasion; forever."
    },
    {
        "word": "ALYSSUM",
        "difficulty": 5,
        "definition": "(n.) A flowering plant of the mustard family, often used in borders and rock gardens."
    },
    {
        "word": "AMADELPHOUS",
        "difficulty": 5,
        "definition": "(adj.) Having stamens united in bundles or clusters."
    },
    {
        "word": "AMAH",
        "difficulty": 4,
        "definition": "(n.) A nursemaid or maid in South and East Asia."
    },
    {
        "word": "AMALGAM",
        "difficulty": 4,
        "definition": "(n.) A mixture or blend; an alloy of mercury with another metal."
    },
    {
        "word": "AMALGAMATION",
        "difficulty": 4,
        "definition": "(n.) The process of combining or merging to form a unified whole."
    },
    {
        "word": "AMANDINE",
        "difficulty": 5,
        "definition": "(adj.) Garnished or prepared with almonds."
    },
    {
        "word": "AMANTADINE",
        "difficulty": 5,
        "definition": "(n.) An antiviral drug used to prevent and treat influenza and Parkinson's disease."
    },
    {
        "word": "AMANUENSIS",
        "difficulty": 5,
        "definition": "(n.) A person who writes from dictation or copies manuscripts; a secretary."
    },
    {
        "word": "AMARANTH",
        "difficulty": 4,
        "definition": "(n.) A plant with showy red flowers; a dark purplish-red color."
    },
    {
        "word": "AMARANTHINE",
        "difficulty": 5,
        "definition": "(adj.) Of a deep purplish-red color; everlasting or unfading."
    },
    {
        "word": "AMARETTO",
        "difficulty": 4,
        "definition": "(n.) An Italian almond-flavored liqueur."
    },
    {
        "word": "AMARYLLIS",
        "difficulty": 4,
        "definition": "(n.) A bulbous plant with large trumpet-shaped flowers, often grown indoors."
    },
    {
        "word": "AMASS",
        "difficulty": 1,
        "definition": "(v.) To gather or accumulate a large amount of something over time."
    },
    {
        "word": "AMATEUR",
        "difficulty": 2,
        "definition": "(n.) A person who pursues an activity for pleasure, not as a profession."
    },
    {
        "word": "AMATEURISH",
        "difficulty": 4,
        "definition": "(adj.) Performed in an unskilled or unprofessional manner."
    },
    {
        "word": "AMATHOPHOBIA",
        "difficulty": 5,
        "definition": "(n.) An abnormal fear of dust."
    },
    {
        "word": "AMAZON",
        "difficulty": 1,
        "definition": "(n.) A tall, strong, or athletic woman; a member of a mythical female warrior race."
    },
    {
        "word": "AMAZONITE",
        "difficulty": 5,
        "definition": "(n.) A blue-green variety of feldspar used as a gemstone."
    },
    {
        "word": "AMBASSADOR",
        "difficulty": 2,
        "definition": "(n.) A diplomat sent by a state to represent it in another country."
    },
    {
        "word": "AMBER",
        "difficulty": 1,
        "definition": "(n.) Fossilized tree resin, typically yellow-orange, used for jewelry and in research."
    },
    {
        "word": "AMBERJACK",
        "difficulty": 2,
        "definition": "(n.) A large, fast-swimming ocean fish popular for sport fishing and food."
    },
    {
        "word": "AMBIDEXTERITY",
        "difficulty": 5,
        "definition": "(n.) The ability to use both hands with equal skill."
    },
    {
        "word": "AMBIDEXTROUS",
        "difficulty": 4,
        "definition": "(adj.) Able to use both hands equally well."
    },
    {
        "word": "AMBIENCE",
        "difficulty": 2,
        "definition": "(n.) The character and atmosphere of a place."
    },
    {
        "word": "AMBIENT",
        "difficulty": 2,
        "definition": "(adj.) Relating to the immediate surroundings; present on all sides."
    },
    {
        "word": "AMBIGUITY",
        "difficulty": 2,
        "definition": "(n.) Uncertainty or inexactness of meaning in language."
    },
    {
        "word": "AMBIGUOUS",
        "difficulty": 2,
        "definition": "(adj.) Open to more than one interpretation; not having a clear meaning."
    },
    {
        "word": "AMBITIOUS",
        "difficulty": 1,
        "definition": "(adj.) Having or showing a strong desire to succeed."
    },
    {
        "word": "AMBIVALENTLY",
        "difficulty": 4,
        "definition": "(adv.) In a way that shows mixed feelings or contradictory ideas."
    },
    {
        "word": "AMBLE",
        "difficulty": 2,
        "definition": "(v.) To walk at a slow, relaxed pace."
    },
    {
        "word": "AMBLYOPIA",
        "difficulty": 5,
        "definition": "(n.) Reduced vision in one eye not corrected by glasses; lazy eye."
    },
    {
        "word": "AMBRETTE",
        "difficulty": 5,
        "definition": "(n.) A tropical plant whose seeds yield a musky-scented oil used in perfumery."
    },
    {
        "word": "AMBROSIA",
        "difficulty": 4,
        "definition": "(n.) Food of the gods in Greek mythology; something extremely pleasing to the senses."
    },
    {
        "word": "AMBRY",
        "difficulty": 5,
        "definition": "(n.) A cupboard or recess in a church wall for storing sacred vessels."
    },
    {
        "word": "AMBULANCE",
        "difficulty": 1,
        "definition": "(n.) A vehicle equipped for transporting sick or injured people to a hospital."
    },
    {
        "word": "AMBULATION",
        "difficulty": 4,
        "definition": "(n.) The ability or act of walking about."
    },
    {
        "word": "AMBULATORY",
        "difficulty": 4,
        "definition": "(adj.) Relating to walking; able to walk; relating to an outpatient setting."
    },
    {
        "word": "AMBUSCADE",
        "difficulty": 5,
        "definition": "(n.) A surprise attack launched from a hidden position."
    },
    {
        "word": "AMBUSH",
        "difficulty": 1,
        "definition": "(n.) A surprise attack from a concealed position."
    },
    {
        "word": "AMELIORANT",
        "difficulty": 5,
        "definition": "(n.) Something that improves or makes better."
    },
    {
        "word": "AMELIORATE",
        "difficulty": 5,
        "definition": "(v.) To make something bad or unsatisfactory better."
    },
    {
        "word": "AMEN",
        "difficulty": 1,
        "definition": "(interjection) Said at the end of a prayer meaning 'so be it'; expressing agreement."
    },
    {
        "word": "AMENABLE",
        "difficulty": 2,
        "definition": "(adj.) Open and responsive to suggestion; willing to agree."
    },
    {
        "word": "AMEND",
        "difficulty": 1,
        "definition": "(v.) To make changes to improve or correct; to modify a law or document."
    },
    {
        "word": "AMENDMENT",
        "difficulty": 1,
        "definition": "(n.) A change or addition designed to improve a document, law, or plan."
    },
    {
        "word": "AMENITIES",
        "difficulty": 2,
        "definition": "(n.) Desirable features or facilities of a place; pleasing aspects."
    },
    {
        "word": "AMENITY",
        "difficulty": 2,
        "definition": "(n.) A desirable and useful feature or facility of a place."
    },
    {
        "word": "AMERCE",
        "difficulty": 5,
        "definition": "(v.) To punish by a fine; to impose a fine or penalty."
    },
    {
        "word": "AMERCEMENT",
        "difficulty": 5,
        "definition": "(n.) A financial penalty imposed at the discretion of a court."
    },
    {
        "word": "AMERICAN",
        "difficulty": 1,
        "definition": "(adj.) Of or relating to the United States or its people."
    },
    {
        "word": "AMERICIUM",
        "difficulty": 5,
        "definition": "(n.) A radioactive metallic element produced artificially; atomic number 95."
    },
    {
        "word": "AMERTOY",
        "difficulty": 5,
        "definition": "(n.) A toy or plaything of American origin or character."
    },
    {
        "word": "AMETHYST",
        "difficulty": 2,
        "definition": "(n.) A violet or purple variety of quartz used as a gemstone."
    },
    {
        "word": "AMIABLE",
        "difficulty": 2,
        "definition": "(adj.) Having a friendly and pleasant manner."
    },
    {
        "word": "AMICABLE",
        "difficulty": 2,
        "definition": "(adj.) Characterized by friendliness and absence of discord."
    },
    {
        "word": "AMICE",
        "difficulty": 5,
        "definition": "(n.) A white linen cloth worn around the neck and shoulders by a priest during Mass."
    },
    {
        "word": "AMIDOL",
        "difficulty": 5,
        "definition": "(n.) A chemical compound used as a photographic developer."
    },
    {
        "word": "AMIGO",
        "difficulty": 1,
        "definition": "(n.) A friend (Spanish); used informally in English."
    },
    {
        "word": "AMINE",
        "difficulty": 4,
        "definition": "(n.) An organic compound derived from ammonia, containing nitrogen."
    },
    {
        "word": "AMISS",
        "difficulty": 1,
        "definition": "(adj.) Not quite right; inappropriate or out of place."
    },
    {
        "word": "AMITY",
        "difficulty": 2,
        "definition": "(n.) A friendly relationship between people or countries."
    },
    {
        "word": "AMMETER",
        "difficulty": 4,
        "definition": "(n.) An instrument for measuring the strength of electric current in amperes."
    },
    {
        "word": "AMMONIA",
        "difficulty": 2,
        "definition": "(n.) A colorless gas with a sharp smell, used in cleaning products and fertilizers."
    },
    {
        "word": "AMMONIAC",
        "difficulty": 5,
        "definition": "(adj.) Having a sharp, acrid odor; describing a gum resin from Central Asia historically used in medicine."
    },
    {
        "word": "AMMONIACAL",
        "difficulty": 5,
        "definition": "(adj.) Having a sharp, pungent smell characteristic of nitrogen-based compounds."
    },
    {
        "word": "AMMUNITION",
        "difficulty": 2,
        "definition": "(n.) A supply of bullets and shells for firearms."
    },
    {
        "word": "AMNESIA",
        "difficulty": 2,
        "definition": "(n.) A partial or total loss of memory, often caused by brain injury or trauma."
    },
    {
        "word": "AMNESTY",
        "difficulty": 2,
        "definition": "(n.) An official pardon for people who have been convicted of offenses."
    },
    {
        "word": "AMOK",
        "difficulty": 2,
        "definition": "(adv.) In a wild, frenzied, uncontrolled manner."
    },
    {
        "word": "AMOLE",
        "difficulty": 5,
        "definition": "(n.) A plant whose roots are used as soap, found in the American Southwest and Mexico."
    },
    {
        "word": "AMONTILLADO",
        "difficulty": 5,
        "definition": "(n.) A medium-dry sherry with a nutty flavor."
    },
    {
        "word": "AMOROUS",
        "difficulty": 2,
        "definition": "(adj.) Showing or feeling deep affection and romantic fondness toward someone."
    },
    {
        "word": "AMORPHOUS",
        "difficulty": 4,
        "definition": "(adj.) Without a clearly defined shape or form; vague or unstructured."
    },
    {
        "word": "AMORTIZATION",
        "difficulty": 4,
        "definition": "(n.) The gradual reduction of a debt by regular payments; the spreading of costs."
    },
    {
        "word": "AMOUNT",
        "difficulty": 1,
        "definition": "(n.) The total sum or quantity of something."
    },
    {
        "word": "AMPERAGE",
        "difficulty": 4,
        "definition": "(n.) The magnitude of electric current flowing through a circuit."
    },
    {
        "word": "AMPERE",
        "difficulty": 4,
        "definition": "(n.) The SI unit of electric current."
    },
    {
        "word": "AMPERSAND",
        "difficulty": 4,
        "definition": "(n.) The symbol & standing for 'and.'"
    },
    {
        "word": "AMPHETAMINE",
        "difficulty": 4,
        "definition": "(n.) A synthetic stimulant drug used medically and illicitly."
    },
    {
        "word": "AMPHIBIAN",
        "difficulty": 2,
        "definition": "(n.) A cold-blooded vertebrate that can live on land and in water."
    },
    {
        "word": "AMPHIBIOUS",
        "difficulty": 4,
        "definition": "(adj.) Relating to or suited for both land and water."
    },
    {
        "word": "AMPHICHROME",
        "difficulty": 5,
        "definition": "(adj.) Capable of producing two different colors under different conditions."
    },
    {
        "word": "AMPHICRANIA",
        "difficulty": 5,
        "definition": "(n.) A headache affecting both sides of the head."
    },
    {
        "word": "AMPHIDROMIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to a point around which tidal oscillations rotate."
    },
    {
        "word": "AMPHIOXUS",
        "difficulty": 5,
        "definition": "(n.) A small, primitive marine animal; a lancelet, important in evolutionary biology."
    },
    {
        "word": "AMPHITHEATER",
        "difficulty": 4,
        "definition": "(n.) An open circular or oval theater with tiered seating around a central area."
    },
    {
        "word": "AMPHORA",
        "difficulty": 5,
        "definition": "(n.) A tall ancient Greek or Roman jar with two handles used for storing wine or oil."
    },
    {
        "word": "AMPHORAE",
        "difficulty": 5,
        "definition": "(n.) Ancient two-handled vessels with narrow necks, used by Greeks and Romans for storing wine or oil."
    },
    {
        "word": "AMPHORIC",
        "difficulty": 5,
        "definition": "(adj.) Resembling the hollow sound made when blowing over the top of a bottle."
    },
    {
        "word": "AMPHOTERIC",
        "difficulty": 5,
        "definition": "(adj.) Able to react as both an acid and a base."
    },
    {
        "word": "AMPICILLIN",
        "difficulty": 5,
        "definition": "(n.) A penicillin-type antibiotic used to treat bacterial infections."
    },
    {
        "word": "AMPLE",
        "difficulty": 1,
        "definition": "(adj.) More than enough; plentiful and spacious."
    },
    {
        "word": "AMPLIATE",
        "difficulty": 5,
        "definition": "(v.) To enlarge or extend."
    },
    {
        "word": "AMPLIATIVE",
        "difficulty": 5,
        "definition": "(adj.) Adding to or extending knowledge beyond what is contained in the premises."
    },
    {
        "word": "AMPLIFIER",
        "difficulty": 1,
        "definition": "(n.) A device that boosts the power of electrical signals, commonly used in sound equipment."
    },
    {
        "word": "AMPLIFY",
        "difficulty": 1,
        "definition": "(v.) To increase the volume, size, or strength of something."
    },
    {
        "word": "AMPLITUDE",
        "difficulty": 2,
        "definition": "(n.) The maximum extent of vibration; the breadth or fullness of something."
    },
    {
        "word": "AMPLY",
        "difficulty": 1,
        "definition": "(adv.) More than adequately; plentifully."
    },
    {
        "word": "AMPULLAE",
        "difficulty": 5,
        "definition": "(n.) Small flask-shaped body cavities that detect motion, balance, or electrical fields."
    },
    {
        "word": "AMPUTEE",
        "difficulty": 2,
        "definition": "(n.) A person who has had one or more limbs surgically removed."
    },
    {
        "word": "AMULET",
        "difficulty": 2,
        "definition": "(n.) An ornament or object worn as a charm against evil."
    },
    {
        "word": "AMUSE",
        "difficulty": 1,
        "definition": "(v.) To entertain or occupy in a pleasant manner."
    },
    {
        "word": "AMYELONIC",
        "difficulty": 5,
        "definition": "(adj.) Lacking a spinal cord or bone marrow."
    },
    {
        "word": "AMYGDALA",
        "difficulty": 5,
        "definition": "(n.) An almond-shaped set of neurons in the brain involved in processing emotions."
    },
    {
        "word": "AMYGDALINE",
        "difficulty": 5,
        "definition": "(adj.) Almond-shaped; relating to either the brain structure involved in emotion or the tonsils."
    },
    {
        "word": "AMYLACEOUS",
        "difficulty": 5,
        "definition": "(adj.) Relating to or resembling starch."
    },
    {
        "word": "AMYOTONIA",
        "difficulty": 5,
        "definition": "(n.) A condition characterized by a lack of muscle tone."
    },
    {
        "word": "AMYOTROPHIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to a progressive wasting of muscle tissue."
    },
    {
        "word": "ANABASIS",
        "difficulty": 5,
        "definition": "(n.) A military march inland; an arduous journey, especially from coast to interior."
    },
    {
        "word": "ANABIBAZON",
        "difficulty": 5,
        "definition": "(n.) The ascending node of a planet's orbit; historically used in astronomy."
    },
    {
        "word": "ANABLEPID",
        "difficulty": 5,
        "definition": "(n.) A freshwater fish whose eyes are divided to see above and below the water surface simultaneously."
    },
    {
        "word": "ANABOLIC",
        "difficulty": 4,
        "definition": "(adj.) Relating to the constructive phase of metabolism; building up body tissue."
    },
    {
        "word": "ANACHRONISM",
        "difficulty": 4,
        "definition": "(n.) A thing that belongs to a different time period than the one depicted."
    },
    {
        "word": "ANACHRONOUS",
        "difficulty": 5,
        "definition": "(adj.) Out of the correct historical or chronological order."
    },
    {
        "word": "ANACLASTIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to refraction of light; describing rocks fractured by pressure."
    },
    {
        "word": "ANACOLUTHON",
        "difficulty": 5,
        "definition": "(n.) A rhetorical figure in which a sentence shifts construction midway through."
    },
    {
        "word": "ANACONDA",
        "difficulty": 2,
        "definition": "(n.) A very large constricting snake native to South America."
    },
    {
        "word": "ANACREONTIC",
        "difficulty": 5,
        "definition": "(adj.) Describing poetry or verse celebrating pleasure, drinking, and romance."
    },
    {
        "word": "ANADIPLOSIS",
        "difficulty": 5,
        "definition": "(n.) A rhetorical device repeating the last word of a clause at the start of the next."
    },
    {
        "word": "ANADROMOUS",
        "difficulty": 5,
        "definition": "(adj.) Describing fish that migrate from the sea to fresh water to spawn, like salmon."
    },
    {
        "word": "ANAGLYPH",
        "difficulty": 5,
        "definition": "(n.) A stereoscopic photograph viewed through colored glasses to create 3D effect."
    },
    {
        "word": "ANAGNORISIS",
        "difficulty": 5,
        "definition": "(n.) The moment in a play or story when a character makes a critical discovery."
    },
    {
        "word": "ANAGOGIC",
        "difficulty": 5,
        "definition": "(adj.) Relating to the spiritual or mystical interpretation of words or events."
    },
    {
        "word": "ANAGRAM",
        "difficulty": 2,
        "definition": "(n.) A word or phrase formed by rearranging the letters of another."
    },
    {
        "word": "ANALECTS",
        "difficulty": 5,
        "definition": "(n.) A collection of short literary passages or philosophical sayings."
    },
    {
        "word": "ANALEMMA",
        "difficulty": 5,
        "definition": "(n.) A scale on a globe showing the sun's declination and equation of time for each day."
    },
    {
        "word": "ANALGESIC",
        "difficulty": 4,
        "definition": "(n.) A painkilling drug; acting to relieve pain."
    },
    {
        "word": "ANALLOBAR",
        "difficulty": 5,
        "definition": "(n.) A region in the atmosphere where atmospheric pressure is decreasing."
    },
    {
        "word": "ANALOGOUS",
        "difficulty": 2,
        "definition": "(adj.) Comparable in certain respects; performing a similar function."
    },
    {
        "word": "ANALOGY",
        "difficulty": 2,
        "definition": "(n.) A comparison between two things to explain or clarify."
    },
    {
        "word": "ANALYSAND",
        "difficulty": 5,
        "definition": "(n.) A person undergoing psychoanalysis."
    },
    {
        "word": "ANALYSE",
        "difficulty": 2,
        "definition": "(v.) Examine methodically and in detail the constitution or structure of (something, especially information), typically for purposes of explanation and interpretation."
    },
    {
        "word": "ANALYSIS",
        "difficulty": 2,
        "definition": "(n.) Detailed examination of something to understand its nature or determine its components."
    },
    {
        "word": "ANALYTICALLY",
        "difficulty": 4,
        "definition": "(adv.) By breaking a subject into its component parts to examine them methodically."
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
    },
    {
        "word": "ANAMNESIS",
        "difficulty": 5,
        "definition": "(n.) Recollection of past events; a patient's medical history; a liturgical recollection."
    },
    {
        "word": "ANANIAS",
        "difficulty": 5,
        "definition": "(n.) A liar; from the biblical figure who lied to the apostles."
    },
    {
        "word": "ANANYM",
        "difficulty": 5,
        "definition": "(n.) A name spelled backwards, used as a pseudonym."
    },
    {
        "word": "ANAPHORA",
        "difficulty": 5,
        "definition": "(n.) Repetition of a word or phrase at the beginning of successive clauses."
    },
    {
        "word": "ANAPHORIC",
        "difficulty": 5,
        "definition": "(adj.) Referring back to an earlier word in a sentence."
    },
    {
        "word": "ANAPHYLACTIC",
        "difficulty": 5,
        "definition": "(adj.) Describing a sudden, life-threatening immune response to a foreign substance."
    },
    {
        "word": "ANAPHYLAXIS",
        "difficulty": 5,
        "definition": "(n.) A severe, potentially life-threatening allergic reaction."
    },
    {
        "word": "ANAPTYXIS",
        "difficulty": 5,
        "definition": "(n.) The insertion of a vowel sound between two consonants to aid pronunciation."
    },
    {
        "word": "ANAQUA",
        "difficulty": 5,
        "definition": "(n.) A tree native to Texas and Mexico with rough leaves and small white flowers."
    },
    {
        "word": "ANARCHIC",
        "difficulty": 2,
        "definition": "(adj.) Characterized by lawlessness and the absence of governing authority."
    },
    {
        "word": "ANARCHISM",
        "difficulty": 3,
        "definition": "(n.) A political philosophy advocating for abolition of government and state."
    },
    {
        "word": "ANARCHY",
        "difficulty": 3,
        "definition": "(n.) A state of disorder due to absence or non-recognition of authority."
    },
    {
        "word": "ANASTOMOSIS",
        "difficulty": 5,
        "definition": "(n.) A connection between two tubes, blood vessels, or nerve fibers."
    },
    {
        "word": "ANASTROPHE",
        "difficulty": 5,
        "definition": "(n.) A rhetorical inversion of normal word order for effect."
    },
    {
        "word": "ANATHEMA",
        "difficulty": 4,
        "definition": "(n.) Something or someone greatly detested; a formal curse by a church."
    },
    {
        "word": "ANATHEMATIZE",
        "difficulty": 5,
        "definition": "(v.) To formally condemn or excommunicate; to declare something utterly loathsome."
    },
    {
        "word": "ANATOCISM",
        "difficulty": 5,
        "definition": "(n.) The charging of compound interest, or interest on unpaid interest."
    },
    {
        "word": "ANATOMY",
        "difficulty": 1,
        "definition": "(n.) The branch of science studying the structure of living organisms."
    },
    {
        "word": "ANAUDIA",
        "difficulty": 5,
        "definition": "(n.) Complete loss of the ability to speak; aphonia."
    },
    {
        "word": "ANAUTOGENOUS",
        "difficulty": 5,
        "definition": "(adj.) Describing insects that require a blood meal before producing eggs."
    },
    {
        "word": "ANCESTOR",
        "difficulty": 1,
        "definition": "(n.) A person from whom one is descended; a forerunner or precursor."
    },
    {
        "word": "ANCESTRAL",
        "difficulty": 3,
        "definition": "(adj.) Passed down through generations of a family; relating to those who came before."
    },
    {
        "word": "ANCESTRY",
        "difficulty": 3,
        "definition": "(n.) The sequence of family members from whom a person is descended; lineage."
    },
    {
        "word": "ANCHOR",
        "difficulty": 1,
        "definition": "(n.) A heavy metal device dropped from a ship to hold it in place."
    },
    {
        "word": "ANCHORAGE",
        "difficulty": 3,
        "definition": "(n.) A sheltered area of water where vessels can moor; a charge for using such a spot."
    },
    {
        "word": "ANCHORITIC",
        "difficulty": 5,
        "definition": "(adj.) Of or relating to a hermit who has withdrawn from society for religious devotion."
    },
    {
        "word": "ANCHOVY",
        "difficulty": 3,
        "definition": "(n.) A small, strong-tasting saltwater fish used in cooking and as a condiment."
    },
    {
        "word": "ANCHUSA",
        "difficulty": 5,
        "definition": "(n.) A genus of plants in the borage family with blue, purple, or white flowers."
    },
    {
        "word": "ANCIENT",
        "difficulty": 1,
        "definition": "(adj.) Belonging to the very distant past; very old."
    },
    {
        "word": "ANCILLARY",
        "difficulty": 4,
        "definition": "(adj.) Providing necessary support; subordinate or supplementary."
    },
    {
        "word": "ANCIPITAL",
        "difficulty": 5,
        "definition": "(adj.) Two-edged; two-headed; ambiguous in meaning."
    },
    {
        "word": "ANDIRON",
        "difficulty": 4,
        "definition": "(n.) A metal support used in a fireplace to hold burning wood."
    },
    {
        "word": "ANDRADITE",
        "difficulty": 5,
        "definition": "(n.) A calcium iron garnet, occurring in various colors including green, yellow, and black."
    },
    {
        "word": "ANDRAGOGY",
        "difficulty": 5,
        "definition": "(n.) The theory and practice of educating adult learners."
    },
    {
        "word": "ANDROCRACY",
        "difficulty": 5,
        "definition": "(n.) Social and political rule or dominance by men."
    },
    {
        "word": "ANDROGYNISM",
        "difficulty": 5,
        "definition": "(n.) The state of having both male and female characteristics."
    },
    {
        "word": "ANDROGYNOUS",
        "difficulty": 4,
        "definition": "(adj.) Partly male and partly female; having both masculine and feminine characteristics."
    },
    {
        "word": "ANDROID",
        "difficulty": 3,
        "definition": "(n.) A robot with a human appearance; a mobile operating system developed by Google."
    },
    {
        "word": "ANECDOTAL",
        "difficulty": 3,
        "definition": "(adj.) Based on personal accounts rather than systematic data."
    },
    {
        "word": "ANECDOTE",
        "difficulty": 3,
        "definition": "(n.) A short, amusing or interesting story about a real person or event."
    },
    {
        "word": "ANECHOIC",
        "difficulty": 5,
        "definition": "(adj.) Free from echoes; describing a room designed to absorb all sound reflections."
    },
    {
        "word": "ANEMOCHORE",
        "difficulty": 5,
        "definition": "(n.) A plant or seed dispersed by wind."
    },
    {
        "word": "ANEMOLOGY",
        "difficulty": 5,
        "definition": "(n.) The scientific study of winds."
    },
    {
        "word": "ANEMOMETER",
        "difficulty": 5,
        "definition": "(n.) An instrument for measuring wind speed."
    },
    {
        "word": "ANEMOMETRY",
        "difficulty": 5,
        "definition": "(n.) The measurement of wind speed and direction."
    },
    {
        "word": "ANEMONE",
        "difficulty": 3,
        "definition": "(n.) A flowering plant with delicate, brightly colored petals; also a sea creature with tentacles that resembles a flower."
    },
    {
        "word": "ANEMOSIS",
        "difficulty": 5,
        "definition": "(n.) Wind-shaking of trees causing wood damage."
    },
    {
        "word": "ANEMOTROPISM",
        "difficulty": 5,
        "definition": "(n.) The growth response of a plant or organism to wind."
    },
    {
        "word": "ANENT",
        "difficulty": 5,
        "definition": "(preposition) About; concerning (archaic or Scottish)."
    },
    {
        "word": "ANENTEROUS",
        "difficulty": 5,
        "definition": "(adj.) Without an intestine or gut."
    },
    {
        "word": "ANEROID",
        "difficulty": 5,
        "definition": "(adj.) Not using liquid; describing a type of barometer using no mercury or water."
    },
    {
        "word": "ANESTHESIA",
        "difficulty": 3,
        "definition": "(n.) Loss of sensation, especially induced by drugs before a surgical procedure."
    },
    {
        "word": "ANESTHETIC",
        "difficulty": 3,
        "definition": "(n.) A substance that induces insensitivity to pain."
    },
    {
        "word": "ANESTHETIZE",
        "difficulty": 4,
        "definition": "(v.) To administer medication that causes a loss of sensation or consciousness before a medical procedure."
    },
    {
        "word": "ANEURYSM",
        "difficulty": 4,
        "definition": "(n.) A bulge or ballooning in the wall of a blood vessel, which can rupture."
    },
    {
        "word": "ANFRACTUOUS",
        "difficulty": 5,
        "definition": "(adj.) Winding; sinuous; full of turnings and intricacies."
    },
    {
        "word": "ANGARY",
        "difficulty": 5,
        "definition": "(n.) The legal right of a belligerent to seize or destroy neutral property if necessary."
    },
    {
        "word": "ANGEL",
        "difficulty": 1,
        "definition": "(n.) A spiritual being acting as a divine messenger; a kind, beautiful person."
    },
    {
        "word": "ANGELFISH",
        "difficulty": 1,
        "definition": "(n.) A brightly colored tropical fish with long fins, popular in aquariums."
    },
    {
        "word": "ANGER",
        "difficulty": 1,
        "definition": "(n.) A strong feeling of annoyance or hostility."
    },
    {
        "word": "ANGIITIS",
        "difficulty": 5,
        "definition": "(n.) Inflammation of a blood or lymph vessel."
    },
    {
        "word": "ANGINA",
        "difficulty": 4,
        "definition": "(n.) Chest pain caused by reduced blood flow to the heart; also refers to throat inflammation."
    },
    {
        "word": "ANGLAISE",
        "difficulty": 5,
        "definition": "(n.) An English-style dance; a style of embroidery with decorative holes."
    },
    {
        "word": "ANGLICIZE",
        "difficulty": 4,
        "definition": "(v.) To make English in form or character; to convert to English language or customs."
    },
    {
        "word": "ANGLING",
        "difficulty": 1,
        "definition": "(n.) The sport or pastime of fishing with a line and hook."
    },
    {
        "word": "ANGLOPHILIA",
        "difficulty": 5,
        "definition": "(n.) Admiration for England and English culture, customs, and people."
    },
    {
        "word": "ANGORA",
        "difficulty": 3,
        "definition": "(n.) A type of soft fiber from certain goats, rabbits, or cats; a garment made from it."
    },
    {
        "word": "ANGSTROMS",
        "difficulty": 5,
        "definition": "(n.) Extremely small units of length used to measure atomic distances, each equal to one ten-billionth of a meter."
    },
    {
        "word": "ANGUISH",
        "difficulty": 3,
        "definition": "(n.) Severe mental or physical pain or suffering."
    },
    {
        "word": "ANGULAR",
        "difficulty": 1,
        "definition": "(adj.) Having angles or sharp corners; lean and bony in appearance."
    },
    {
        "word": "ANGULARITY",
        "difficulty": 4,
        "definition": "(n.) The quality of having sharp corners or edges; a pointed or bony physical appearance."
    },
    {
        "word": "ANGWANTIBO",
        "difficulty": 5,
        "definition": "(n.) A small, arboreal primate found in West and Central Africa."
    },
    {
        "word": "ANHEDONIA",
        "difficulty": 5,
        "definition": "(n.) Inability to feel pleasure in normally pleasurable activities."
    },
    {
        "word": "ANHINGA",
        "difficulty": 5,
        "definition": "(n.) A large water bird with a long neck that swims underwater to catch fish."
    },
    {
        "word": "ANHYDRIDE",
        "difficulty": 5,
        "definition": "(n.) A chemical compound derived from another by removing water."
    },
    {
        "word": "ANHYDROUS",
        "difficulty": 5,
        "definition": "(adj.) Without water; describing a substance containing no water."
    },
    {
        "word": "ANICONIC",
        "difficulty": 5,
        "definition": "(adj.) Pertaining to worship without icons; avoiding the use of images of deities."
    },
    {
        "word": "ANILITY",
        "difficulty": 5,
        "definition": "(n.) The state of being an old woman; dotage; senility."
    },
    {
        "word": "ANIMADVERSION",
        "difficulty": 5,
        "definition": "(n.) Criticism or censure; an adverse comment."
    },
    {
        "word": "ANIMAL",
        "difficulty": 1,
        "definition": "(n.) A living organism that feeds on organic matter and can move voluntarily."
    },
    {
        "word": "ANIMALCULE",
        "difficulty": 5,
        "definition": "(n.) A tiny creature invisible to the naked eye, visible only through magnification."
    },
    {
        "word": "ANIMATE",
        "difficulty": 1,
        "definition": "(v.) To give life or energy to; to produce a moving image through sequential drawings."
    },
    {
        "word": "ANIMATION",
        "difficulty": 1,
        "definition": "(n.) The state of being full of life; the technique of making moving images."
    },
    {
        "word": "ANIMISM",
        "difficulty": 4,
        "definition": "(n.) The belief that objects, places, and creatures all possess spirits."
    },
    {
        "word": "ANIMOSITY",
        "difficulty": 3,
        "definition": "(n.) Strong hostility or antipathy."
    },
    {
        "word": "ANIMUS",
        "difficulty": 4,
        "definition": "(n.) Hostility or ill feeling; motivation or intention; in Jungian psychology, the masculine element in female psychology."
    },
    {
        "word": "ANIONIC",
        "difficulty": 5,
        "definition": "(adj.) Carrying a negative electric charge; repelled by a negatively charged electrode."
    },
    {
        "word": "ANISE",
        "difficulty": 3,
        "definition": "(n.) A plant whose seeds are used as a spice with a licorice-like flavor."
    },
    {
        "word": "ANISETTE",
        "difficulty": 4,
        "definition": "(n.) A sweet, licorice-flavored spirit made from the seeds of a flowering herb."
    },
    {
        "word": "ANKH",
        "difficulty": 4,
        "definition": "(n.) An ancient Egyptian hieroglyphic symbol shaped like a cross with a loop, representing life."
    },
    {
        "word": "ANKLE",
        "difficulty": 1,
        "definition": "(n.) The joint connecting the foot with the leg."
    },
    {
        "word": "ANKLET",
        "difficulty": 1,
        "definition": "(n.) An ornamental chain or band worn around the ankle."
    },
    {
        "word": "ANKYLOSAUR",
        "difficulty": 5,
        "definition": "(n.) A heavily armored herbivorous dinosaur with a bony tail club."
    },
    {
        "word": "ANLACE",
        "difficulty": 5,
        "definition": "(n.) A short dagger used in the Middle Ages."
    },
    {
        "word": "ANNALS",
        "difficulty": 3,
        "definition": "(n.) Historical records arranged in yearly order; chronicles."
    },
    {
        "word": "ANNATES",
        "difficulty": 5,
        "definition": "(n.) The first year's revenue of a church office paid to the pope."
    },
    {
        "word": "ANNEAL",
        "difficulty": 4,
        "definition": "(v.) To heat and slowly cool glass or metal to relieve internal stresses."
    },
    {
        "word": "ANNEALED",
        "difficulty": 4,
        "definition": "(v.) Strengthened or toughened through controlled heating followed by slow cooling."
    },
    {
        "word": "ANNELID",
        "difficulty": 5,
        "definition": "(n.) A segmented worm, such as an earthworm or leech, with a body divided into rings."
    },
    {
        "word": "ANNEX",
        "difficulty": 1,
        "definition": "(v.) To add a territory or building; an extension added to a building."
    },
    {
        "word": "ANNEXATION",
        "difficulty": 3,
        "definition": "(n.) The act of one state taking control of another's territory, often by force."
    },
    {
        "word": "ANNIHILATE",
        "difficulty": 4,
        "definition": "(v.) To destroy completely; to reduce to nothing."
    },
    {
        "word": "ANNIHILATION",
        "difficulty": 4,
        "definition": "(n.) Complete destruction; obliteration."
    },
    {
        "word": "ANNIVERSARY",
        "difficulty": 1,
        "definition": "(n.) The yearly recurrence of a date marking a notable event."
    },
    {
        "word": "ANNOTATE",
        "difficulty": 3,
        "definition": "(v.) To add notes or comments to a text or diagram."
    },
    {
        "word": "ANNOUNCE",
        "difficulty": 1,
        "definition": "(v.) To make a public statement about something; to declare formally."
    },
    {
        "word": "ANNOUNCER",
        "difficulty": 1,
        "definition": "(n.) A person who reads news or introduces programs on radio or television."
    },
    {
        "word": "ANNOYANCE",
        "difficulty": 1,
        "definition": "(n.) The feeling of being slightly angered; something causing this feeling."
    },
    {
        "word": "ANNUAL",
        "difficulty": 1,
        "definition": "(adj.) Occurring once a year; lasting or valid for one year."
    },
    {
        "word": "ANNUITY",
        "difficulty": 3,
        "definition": "(n.) A fixed sum of money paid yearly; an investment yielding fixed annual payments."
    },
    {
        "word": "ANNUL",
        "difficulty": 3,
        "definition": "(v.) To declare invalid or void; to cancel officially."
    },
    {
        "word": "ANNULARITY",
        "difficulty": 5,
        "definition": "(n.) The state of being ring-shaped; a ring-like form or structure."
    },
    {
        "word": "ANNULLING",
        "difficulty": 4,
        "definition": "(v.) Canceling or declaring legally void."
    },
    {
        "word": "ANNULMENT",
        "difficulty": 3,
        "definition": "(n.) The formal declaration that a marriage or contract is invalid."
    },
    {
        "word": "ANODYNE",
        "difficulty": 4,
        "definition": "(adj.) Not likely to cause offense; a painkilling drug."
    },
    {
        "word": "ANOIA",
        "difficulty": 5,
        "definition": "(n.) Dementia; mental deficiency or idiocy."
    },
    {
        "word": "ANOINT",
        "difficulty": 3,
        "definition": "(v.) To rub oil on someone as part of a religious ceremony; to officially designate."
    },
    {
        "word": "ANOMALOUS",
        "difficulty": 3,
        "definition": "(adj.) Deviating from what is standard, normal, or expected."
    },
    {
        "word": "ANOMALY",
        "difficulty": 3,
        "definition": "(n.) Something that deviates from what is standard or expected."
    },
    {
        "word": "ANON",
        "difficulty": 3,
        "definition": "(adv.) Shortly; soon; at another time (archaic)."
    },
    {
        "word": "ANONYMOUS",
        "difficulty": 3,
        "definition": "(adj.) Not identified by name; having no outstanding features."
    },
    {
        "word": "ANORAK",
        "difficulty": 3,
        "definition": "(n.) A waterproof jacket; informally, an obsessive enthusiast with narrow interests."
    },
    {
        "word": "ANOREXIA",
        "difficulty": 4,
        "definition": "(n.) A serious eating disorder marked by extreme restriction of food intake."
    },
    {
        "word": "ANOREXIC",
        "difficulty": 4,
        "definition": "(adj.) Affected by an eating disorder involving self-imposed starvation; abnormally underweight."
    },
    {
        "word": "ANORTHOPIA",
        "difficulty": 5,
        "definition": "(n.) A visual disorder in which straight lines appear curved or distorted."
    },
    {
        "word": "ANOSMATIC",
        "difficulty": 5,
        "definition": "(adj.) Lacking the sense of smell."
    },
    {
        "word": "ANOSMIC",
        "difficulty": 5,
        "definition": "(adj.) Unable to detect odors due to loss of the sense of smell."
    },
    {
        "word": "ANSA",
        "difficulty": 5,
        "definition": "(n.) A handle-like structure; used in anatomy and astronomy."
    },
    {
        "word": "ANSCHLUSS",
        "difficulty": 5,
        "definition": "(n.) The 1938 annexation of Austria into Nazi Germany; any annexation."
    },
    {
        "word": "ANSEROUS",
        "difficulty": 5,
        "definition": "(adj.) Resembling or relating to a goose; goose-like."
    },
    {
        "word": "ANSWERER",
        "difficulty": 3,
        "definition": "(n.) A person who gives a response or reply."
    },
    {
        "word": "ANTACID",
        "difficulty": 3,
        "definition": "(n.) A substance that neutralizes stomach acid, used to relieve indigestion."
    },
    {
        "word": "ANTAEAN",
        "difficulty": 5,
        "definition": "(adj.) Of immense physical strength, like the mythological giant who drew power from the earth."
    },
    {
        "word": "ANTAGONIST",
        "difficulty": 3,
        "definition": "(n.) A person who actively opposes; the adversary or villain in a story."
    },
    {
        "word": "ANTARCTIC",
        "difficulty": 3,
        "definition": "(adj.) Of or pertaining to the frozen continent surrounding the South Pole."
    },
    {
        "word": "ANTE",
        "difficulty": 3,
        "definition": "(n.) A stake put up before a card game; an upfront cost or bet."
    },
    {
        "word": "ANXIOUS",
        "difficulty": 1,
        "definition": "(adj.) Experiencing worry, unease, or nervousness, typically about an imminent event or something with an uncertain outcome."
    },
    {
        "word": "APARTMENT",
        "difficulty": 1,
        "definition": "(n.) A suite of rooms forming one residence, typically in a building containing a number of these."
    },
    {
        "word": "APPARATUS",
        "difficulty": 3,
        "definition": "(n.) The technical equipment or machinery needed for a particular activity or purpose."
    },
    {
        "word": "APPARENT",
        "difficulty": 1,
        "definition": "(adj.) Clearly visible or understood; obvious."
    },
    {
        "word": "APPEARANCE",
        "difficulty": 1,
        "definition": "(n.) The way that someone or something looks."
    },
    {
        "word": "APPROACH",
        "difficulty": 1,
        "definition": "(v./n.) Come near or nearer to (someone or something) in distance or time."
    },
    {
        "word": "APPROXIMATELY",
        "difficulty": 3,
        "definition": "(adv.) Used to show that something is almost, but not completely, accurate or exact; roughly."
    },
    {
        "word": "ARCTIC",
        "difficulty": 1,
        "definition": "(adj./n.) Relating to the regions around the North Pole."
    },
    {
        "word": "ARGUMENT",
        "difficulty": 1,
        "definition": "(n.) An exchange of diverging or opposite views."
    },
    {
        "word": "ASCEND",
        "difficulty": 1,
        "definition": "(v.) Go up or climb."
    },
    {
        "word": "ASSASSINATE",
        "difficulty": 4,
        "definition": "(v.) To deliberately and suddenly kill a prominent or important person, especially for political reasons."
    },
    {
        "word": "ASTHMA",
        "difficulty": 3,
        "definition": "(n.) A respiratory condition marked by spasms in the bronchi of the lungs, causing difficulty in breathing."
    },
    {
        "word": "ATHEIST",
        "difficulty": 3,
        "definition": "(n.) A person who disbelieves in the existence of God."
    },
    {
        "word": "ATHLETIC",
        "difficulty": 1,
        "definition": "(adj.) Physically strong, fit, and active."
    },
    {
        "word": "ATTENDANCE",
        "difficulty": 1,
        "definition": "(n.) The action or state of going regularly to or being present at a place or event."
    },
    {
        "word": "AUXILIARY",
        "difficulty": 4,
        "definition": "(adj./n.) Providing supplementary or additional help and support."
    },
    {
        "word": "AWFUL",
        "difficulty": 1,
        "definition": "(adj.) Very bad or unpleasant."
    },
    {
        "word": "BALLOON",
        "difficulty": 1,
        "definition": "(n./v.) A small colored rubber bag which is inflated with air and then sealed at the neck, used as a child's toy or a decoration."
    },
    {
        "word": "BARBECUE",
        "difficulty": 3,
        "definition": "(n./v.) A meal or gathering at which meat, fish, or other food is cooked out of doors on a rack over an open fire or on a special appliance."
    },
    {
        "word": "BARGAIN",
        "difficulty": 1,
        "definition": "(n./v.) A thing bought or offered for sale more cheaply than is usual or expected."
    },
    {
        "word": "BASICALLY",
        "difficulty": 1,
        "definition": "(adv.) In the most essential respects; fundamentally."
    },
    {
        "word": "BEGGAR",
        "difficulty": 3,
        "definition": "(n./v.) A person, typically a homeless one, who lives by asking for money or food."
    },
    {
        "word": "BEGINNING",
        "difficulty": 1,
        "definition": "(n.) The point in time or space at which something starts."
    },
    {
        "word": "BELIEF",
        "difficulty": 1,
        "definition": "(n.) An acceptance that a statement is true or that something exists."
    },
    {
        "word": "BELIEVE",
        "difficulty": 1,
        "definition": "(v.) Accept as true; feel sure of the truth of."
    },
    {
        "word": "BENEFICIAL",
        "difficulty": 3,
        "definition": "(adj.) Favorable or advantageous; resulting in good."
    },
    {
        "word": "BENEFIT",
        "difficulty": 1,
        "definition": "(n./v.) An advantage or profit gained from something."
    },
    {
        "word": "BISCUIT",
        "difficulty": 3,
        "definition": "(n.) A small baked unleavened cake, typically crisp, flat, and sweet."
    },
    {
        "word": "BOUNDARIES",
        "difficulty": 3,
        "definition": "(n.) A line that marks the limits of an area; a dividing line."
    },
    {
        "word": "BRILLIANT",
        "difficulty": 3,
        "definition": "(adj.) Very bright and radiant; exceptionally clever."
    },
    {
        "word": "BUREAUCRACY",
        "difficulty": 4,
        "definition": "(n.) A system of government in which most of the important decisions are made by state officials rather than by elected representatives."
    },
    {
        "word": "BUSINESS",
        "difficulty": 1,
        "definition": "(n.) A person's regular occupation, profession, or trade."
    },
    {
        "word": "CALENDAR",
        "difficulty": 1,
        "definition": "(n.) A chart showing the days, weeks, and months of a year."
    },
    {
        "word": "CAMOUFLAGE",
        "difficulty": 3,
        "definition": "(n./v.) The disguising of military personnel, equipment, and installations by painting or covering them to make them blend in with their surroundings."
    },
    {
        "word": "CANDIDATE",
        "difficulty": 1,
        "definition": "(n.) A person who applies for a job or is nominated for election."
    },
    {
        "word": "CARAMEL",
        "difficulty": 3,
        "definition": "(n./adj.) Sugar or syrup heated until it turns brown, used as a flavoring or coloring for food or drink."
    },
    {
        "word": "CARIBBEAN",
        "difficulty": 3,
        "definition": "(adj./n.) Relating to the regions or people around the sea located between North and South America."
    },
    {
        "word": "CATEGORY",
        "difficulty": 1,
        "definition": "(n.) A class or division of people or things."
    },
    {
        "word": "CEMETERY",
        "difficulty": 3,
        "definition": "(n.) A burial ground or a graveyard."
    },
    {
        "word": "CHALLENGE",
        "difficulty": 1,
        "definition": "(n./v.) A call to take part in a contest or task that tests someone's abilities."
    },
    {
        "word": "CHANGEABLE",
        "difficulty": 3,
        "definition": "(adj.) Prone to variation or alteration; not fixed or stable."
    },
    {
        "word": "CHANGING",
        "difficulty": 1,
        "definition": "(v./adj.) Becoming different."
    },
    {
        "word": "CHARACTERISTIC",
        "difficulty": 3,
        "definition": "(adj./n.) A feature or quality belonging typically to a person, place, or thing and serving to identify it."
    },
    {
        "word": "CHIEF",
        "difficulty": 1,
        "definition": "(n./adj.) A leader or ruler of a people or clan."
    },
    {
        "word": "CHOOSE",
        "difficulty": 1,
        "definition": "(v.) Pick out or select (someone or something) as being the best or most appropriate of two or more alternatives."
    },
    {
        "word": "CHOSE",
        "difficulty": 1,
        "definition": "(v.) Made a selection from available options."
    },
    {
        "word": "CHRYSANTHEMUM",
        "difficulty": 5,
        "definition": "(n.) A plant of the daisy family with brightly colored ornamental flowers, typically blooming in autumn."
    },
    {
        "word": "CIGARETTE",
        "difficulty": 3,
        "definition": "(n.) A thin cylinder of finely cut tobacco rolled in paper for smoking."
    },
    {
        "word": "CLIMBED",
        "difficulty": 1,
        "definition": "(v.) Moved upward using the hands and feet, or ascended gradually."
    },
    {
        "word": "CLOTH",
        "difficulty": 1,
        "definition": "(n.) Woven or felted fabric made from wool, cotton, or a similar fiber."
    },
    {
        "word": "CLOTHES",
        "difficulty": 1,
        "definition": "(n.) Items worn to cover the body."
    },
    {
        "word": "CLOTHING",
        "difficulty": 1,
        "definition": "(n.) Garments and wearable items that cover and protect the body."
    },
    {
        "word": "COINCIDENCE",
        "difficulty": 3,
        "definition": "(n.) A remarkable concurrence of events or circumstances without apparent causal connection."
    },
    {
        "word": "COLLECTIBLE",
        "difficulty": 3,
        "definition": "(adj./n.) An object considered desirable for its rarity, age, or cultural significance."
    },
    {
        "word": "COLONEL",
        "difficulty": 3,
        "definition": "(n.) A senior military officer ranking above a major and below a general."
    },
    {
        "word": "COLUMN",
        "difficulty": 1,
        "definition": "(n.) A vertical arrangement of items, or a pillar."
    },
    {
        "word": "COLUMNIST",
        "difficulty": 3,
        "definition": "(n.) A journalist who regularly writes a dedicated section of a newspaper or magazine."
    },
    {
        "word": "COMING",
        "difficulty": 1,
        "definition": "(v./adj./n.) Approaching or arriving."
    },
    {
        "word": "COMMISSION",
        "difficulty": 3,
        "definition": "(n./v.) An instruction, command, or duty given to a person or group of people."
    },
    {
        "word": "COMMITMENT",
        "difficulty": 1,
        "definition": "(n.) The state or quality of being dedicated to a cause, activity, etc."
    },
    {
        "word": "COMMITTEE",
        "difficulty": 3,
        "definition": "(n.) A group of people appointed for a specific function."
    },
    {
        "word": "COMPARATIVE",
        "difficulty": 3,
        "definition": "(adj./n.) Measured against a standard or another thing; the middle degree between positive and superlative."
    },
    {
        "word": "COMPETENT",
        "difficulty": 1,
        "definition": "(adj.) Having the necessary ability, knowledge, or skill to do something successfully."
    },
    {
        "word": "COMPLETELY",
        "difficulty": 1,
        "definition": "(adv.) Totally; utterly."
    },
    {
        "word": "CONCEDE",
        "difficulty": 3,
        "definition": "(v.) Admit that something is true or valid after first denying or resisting it."
    },
    {
        "word": "CONCEIVABLE",
        "difficulty": 4,
        "definition": "(adj.) Capable of being imagined or grasped mentally."
    },
    {
        "word": "CONCEIVE",
        "difficulty": 3,
        "definition": "(v.) Become pregnant with (a child)."
    },
    {
        "word": "CONDEMN",
        "difficulty": 3,
        "definition": "(v.) Express complete disapproval of, typically in public; censure."
    },
    {
        "word": "CONDESCEND",
        "difficulty": 3,
        "definition": "(v.) Show feelings of superiority; be patronizing."
    },
    {
        "word": "CONNOISSEUR",
        "difficulty": 5,
        "definition": "(n.) An expert judge in matters of taste."
    },
    {
        "word": "CONSCIENCE",
        "difficulty": 3,
        "definition": "(n.) An inner feeling acting as a guide to rightness."
    },
    {
        "word": "CONSCIENTIOUS",
        "difficulty": 5,
        "definition": "(adj.) (Of a person) wishing to do what is right, especially to do one's work or duty well and thoroughly."
    },
    {
        "word": "CONSCIOUS",
        "difficulty": 1,
        "definition": "(adj.) Aware of and responding to one's surroundings."
    },
    {
        "word": "CONSENSUS",
        "difficulty": 3,
        "definition": "(n.) General agreement."
    },
    {
        "word": "CONSISTENT",
        "difficulty": 1,
        "definition": "(adj.) Acting or done in the same way over time, especially so as to be fair or accurate."
    },
    {
        "word": "CONTINUOUS",
        "difficulty": 3,
        "definition": "(adj.) Forming an unbroken whole; without interruption."
    },
    {
        "word": "CONTROLLED",
        "difficulty": 1,
        "definition": "(v./adj.) Managed or kept in check."
    },
    {
        "word": "CONTROVERSIAL",
        "difficulty": 4,
        "definition": "(adj.) Giving rise or likely to give rise to public disagreement."
    },
    {
        "word": "CONTROVERSY",
        "difficulty": 3,
        "definition": "(n.) Disagreement, typically when prolonged, public, and heated."
    },
    {
        "word": "CONVALESCE",
        "difficulty": 4,
        "definition": "(v.) Recover one's health and strength over time after an illness or operation."
    },
    {
        "word": "CONVENIENT",
        "difficulty": 3,
        "definition": "(adj.) Fitting in well with a person's needs, activities, and plans."
    },
    {
        "word": "COOLLY",
        "difficulty": 3,
        "definition": "(adv.) In a calm and unemotional manner."
    },
    {
        "word": "CORRELATE",
        "difficulty": 3,
        "definition": "(v./n.) Have a mutual relationship or connection, in which one thing affects or depends on another."
    },
    {
        "word": "CORRESPONDENCE",
        "difficulty": 4,
        "definition": "(n.) Communication by exchanging letters with someone."
    },
    {
        "word": "COUNSELOR",
        "difficulty": 3,
        "definition": "(n.) A person trained to give guidance on personal, social, or psychological problems."
    },
    {
        "word": "COURTEOUS",
        "difficulty": 4,
        "definition": "(adj.) Polite, respectful, or considerate in manner."
    },
    {
        "word": "COURTESY",
        "difficulty": 3,
        "definition": "(n.) The showing of politeness in one's attitude and behavior toward others."
    },
    {
        "word": "CRITICISM",
        "difficulty": 1,
        "definition": "(n.) The expression of disapproval of someone or something based on perceived faults or mistakes."
    },
    {
        "word": "CRITICIZE",
        "difficulty": 3,
        "definition": "(v.) Indicate the faults of (someone or something) in a disapproving way."
    },
    {
        "word": "CURIOSITY",
        "difficulty": 1,
        "definition": "(n.) A strong desire to know or learn something."
    },
    {
        "word": "CURRICULUM",
        "difficulty": 3,
        "definition": "(n.) The subjects comprising a course of study in a school or college."
    },
    {
        "word": "DACHSHUND",
        "difficulty": 5,
        "definition": "(n.) A dog of a short-legged, long-bodied breed."
    },
    {
        "word": "DAIQUIRI",
        "difficulty": 5,
        "definition": "(n.) A cocktail containing rum, lime juice, and sugar."
    },
    {
        "word": "DEBRIS",
        "difficulty": 3,
        "definition": "(n.) Scattered fragments, typically of something wrecked or destroyed."
    },
    {
        "word": "DECEIVE",
        "difficulty": 3,
        "definition": "(v.) To cause someone to believe what is not true."
    },
    {
        "word": "DEDUCTIBLE",
        "difficulty": 3,
        "definition": "(adj./n.) An amount that can be subtracted from income before tax is calculated."
    },
    {
        "word": "DEFENDANT",
        "difficulty": 3,
        "definition": "(n.) An individual, company, or institution sued or accused in a court of law."
    },
    {
        "word": "DEFERRED",
        "difficulty": 3,
        "definition": "(v./adj.) Put off (an action or event) to a later time; postpone."
    },
    {
        "word": "DEFINITELY",
        "difficulty": 3,
        "definition": "(adv.) Without any doubt; unambiguously."
    },
    {
        "word": "DEFINITION",
        "difficulty": 1,
        "definition": "(n.) A statement of the exact meaning of a word, especially in a dictionary."
    },
    {
        "word": "DEPENDENT",
        "difficulty": 1,
        "definition": "(adj./n.) Contingent on or determined by."
    },
    {
        "word": "DESCEND",
        "difficulty": 1,
        "definition": "(v.) Move or fall downward."
    },
    {
        "word": "DESCENDANT",
        "difficulty": 3,
        "definition": "(n./adj.) An offspring or later generation of a person or organism; coming from an earlier source."
    },
    {
        "word": "DESCRIBE",
        "difficulty": 1,
        "definition": "(v.) Give an account in words of (someone or something), including all the relevant characteristics, qualities, or events."
    },
    {
        "word": "DESCRIPTION",
        "difficulty": 3,
        "definition": "(n.) A spoken or written representation or account of a person, object, or event."
    },
    {
        "word": "DESIRABLE",
        "difficulty": 3,
        "definition": "(adj./n.) Wanted or wished for as being attractive, useful, or necessary to course of action."
    },
    {
        "word": "DESPAIR",
        "difficulty": 1,
        "definition": "(n./v.) The complete loss or absence of hope."
    },
    {
        "word": "DESPERATE",
        "difficulty": 3,
        "definition": "(adj.) Feeling or showing a hopeless sense."
    },
    {
        "word": "DETERRENT",
        "difficulty": 3,
        "definition": "(n./adj.) A thing that discourages or is intended to discourage someone from doing something."
    },
    {
        "word": "DEVELOP",
        "difficulty": 1,
        "definition": "(v.) Grow or cause to grow and become more mature, advanced, or elaborate."
    },
    {
        "word": "DICTIONARY",
        "difficulty": 1,
        "definition": "(n.) A book or electronic resource that lists the words of a language (typically in alphabetical order) and gives their meaning, or gives the equivalent words in a different language."
    },
    {
        "word": "DIFFERENCE",
        "difficulty": 1,
        "definition": "(n.) A point in which things are not the same."
    },
    {
        "word": "DILEMMA",
        "difficulty": 3,
        "definition": "(n.) A situation where a difficult choice has to be made."
    },
    {
        "word": "DINING",
        "difficulty": 1,
        "definition": "(v./n.) The activity of eating dinner."
    },
    {
        "word": "DISAPPEARANCE",
        "difficulty": 3,
        "definition": "(n.) An instance or fact of someone or something ceasing to be visible or passing out of sight."
    },
    {
        "word": "DISAPPOINT",
        "difficulty": 1,
        "definition": "(v.) Fail to fulfill the hopes or expectations of."
    },
    {
        "word": "DISASTROUS",
        "difficulty": 3,
        "definition": "(adj.) Causing great damage."
    },
    {
        "word": "DISCIPLINE",
        "difficulty": 3,
        "definition": "(n./v.) The practice of training people to obey rules."
    },
    {
        "word": "DISEASE",
        "difficulty": 1,
        "definition": "(n.) A disorder of structure or function in a human, animal, or plant, especially one that produces specific signs or symptoms or that affects a specific location and is not simply a direct result of physical injury."
    },
    {
        "word": "DISPENSABLE",
        "difficulty": 3,
        "definition": "(adj.) Able to be replaced or done away with; not necessary."
    },
    {
        "word": "DISSATISFIED",
        "difficulty": 3,
        "definition": "(adj.) Not content or happy with something."
    },
    {
        "word": "DISSIPATE",
        "difficulty": 4,
        "definition": "(v.) Disperse or scatter."
    },
    {
        "word": "DOMINANT",
        "difficulty": 1,
        "definition": "(adj./n.) Most important, powerful, or influential."
    },
    {
        "word": "DUMBBELL",
        "difficulty": 3,
        "definition": "(n.) A short bar with a weight at each end, used typically in pairs for exercise or muscle-building."
    },
    {
        "word": "EASILY",
        "difficulty": 1,
        "definition": "(adv.) Without difficulty or effort."
    },
    {
        "word": "ECSTASY",
        "difficulty": 4,
        "definition": "(n.) An overwhelming feeling of great happiness."
    },
    {
        "word": "EFFECT",
        "difficulty": 1,
        "definition": "(n./v.) A change which is a result of an action."
    },
    {
        "word": "EFFICIENCY",
        "difficulty": 3,
        "definition": "(n.) The ability to achieve success with minimal waste or effort."
    },
    {
        "word": "EIGHTH",
        "difficulty": 3,
        "definition": "(num./n./adj.) Constituting number eight in a sequence; 8th."
    },
    {
        "word": "EITHER",
        "difficulty": 1,
        "definition": "(pron./adv./conj.) One or the other of two options; used to indicate a choice between two possibilities."
    },
    {
        "word": "ELIGIBILITY",
        "difficulty": 3,
        "definition": "(n.) The quality of being qualified or entitled to something."
    },
    {
        "word": "ELIGIBLE",
        "difficulty": 3,
        "definition": "(adj.) Having the right to do or obtain something; satisfying the appropriate conditions."
    },
    {
        "word": "ELIMINATE",
        "difficulty": 1,
        "definition": "(v.) Completely remove or get rid of something."
    },
    {
        "word": "EMBARRASS",
        "difficulty": 3,
        "definition": "(v.) Cause to feel awkward or self-conscious."
    },
    {
        "word": "EMPEROR",
        "difficulty": 1,
        "definition": "(n.) A sovereign ruler of great power and rank, especially one ruling an empire."
    },
    {
        "word": "ENCOURAGEMENT",
        "difficulty": 3,
        "definition": "(n.) Words or actions that give someone confidence, support, or motivation."
    },
    {
        "word": "ENCOURAGING",
        "difficulty": 3,
        "definition": "(v./adj.) Giving someone support or confidence; supportive."
    },
    {
        "word": "ENEMY",
        "difficulty": 1,
        "definition": "(n./adj.) A person who is actively opposed or hostile to someone or something."
    },
    {
        "word": "ENTIRELY",
        "difficulty": 1,
        "definition": "(adv.) Completely (often used for emphasis)."
    },
    {
        "word": "ENTREPRENEUR",
        "difficulty": 5,
        "definition": "(n.) A person who organizes and operates a business or businesses, taking on greater than normal financial risks in order to do so."
    },
    {
        "word": "ENVIRONMENT",
        "difficulty": 1,
        "definition": "(n.) The surroundings or conditions in which one lives."
    },
    {
        "word": "EQUIPMENT",
        "difficulty": 1,
        "definition": "(n.) The necessary items for a particular purpose."
    },
    {
        "word": "EQUIPPED",
        "difficulty": 3,
        "definition": "(v./adj.) Supplied with the necessary items for a particular purpose."
    },
    {
        "word": "EQUIVALENT",
        "difficulty": 3,
        "definition": "(adj./n.) Equal in value, amount, function, meaning, etc."
    },
    {
        "word": "ESPECIALLY",
        "difficulty": 1,
        "definition": "(adv.) Used to single out one person, thing, or situation over all others."
    },
    {
        "word": "ETIQUETTE",
        "difficulty": 4,
        "definition": "(n.) The customary code of polite behavior in society or among members of a particular profession or group."
    },
    {
        "word": "EXAGGERATE",
        "difficulty": 3,
        "definition": "(v.) To represent something as being larger than it is."
    },
    {
        "word": "EXCEED",
        "difficulty": 1,
        "definition": "(v.) To be greater in number or size than something."
    },
    {
        "word": "EXCELLENCE",
        "difficulty": 3,
        "definition": "(n.) The quality of being outstanding or extremely good."
    },
    {
        "word": "EXHAUST",
        "difficulty": 3,
        "definition": "(v./n.) Drain (someone) of their physical or mental resources; tire out."
    },
    {
        "word": "EXHILARATE",
        "difficulty": 5,
        "definition": "(v.) To make someone feel very happy; thrill."
    },
    {
        "word": "EXISTENCE",
        "difficulty": 3,
        "definition": "(n.) The fact or state of living or having reality."
    },
    {
        "word": "EXISTENT",
        "difficulty": 3,
        "definition": "(adj.) Currently real or in operation; actually present."
    },
    {
        "word": "EXPENSE",
        "difficulty": 2,
        "definition": "(n./v.) The cost required for something; the money spent on something."
    },
    {
        "word": "EXPERIENCE",
        "difficulty": 2,
        "definition": "(n./v.) Knowledge or skill acquired by practical contact."
    },
    {
        "word": "EXPERIMENT",
        "difficulty": 2,
        "definition": "(n./v.) A scientific procedure undertaken to make a discovery, test a hypothesis, or demonstrate a known fact."
    },
    {
        "word": "EXPLANATION",
        "difficulty": 3,
        "definition": "(n.) A statement or account that makes something clear."
    },
    {
        "word": "EXTREMELY",
        "difficulty": 2,
        "definition": "(adv.) To a very great degree; very."
    },
    {
        "word": "EXUBERANCE",
        "difficulty": 4,
        "definition": "(n.) The quality of being full of energy, excitement, and cheerfulness; ebullience."
    },
    {
        "word": "FACSIMILE",
        "difficulty": 4,
        "definition": "(n./v.) An exact copy, especially of written or printed material."
    },
    {
        "word": "FAHRENHEIT",
        "difficulty": 4,
        "definition": "(n.) Of or denoting a scale of temperature on which water freezes at 32° and boils at 212° under standard conditions."
    },
    {
        "word": "FALLACIOUS",
        "difficulty": 4,
        "definition": "(adj.) Based on a mistaken belief."
    },
    {
        "word": "FALLACY",
        "difficulty": 3,
        "definition": "(n.) A mistaken belief, especially one based on unsound argument."
    },
    {
        "word": "FAMILIAR",
        "difficulty": 2,
        "definition": "(adj./n.) Well known from long or close association."
    },
    {
        "word": "FASCINATING",
        "difficulty": 3,
        "definition": "(adj.) Extremely interesting."
    },
    {
        "word": "FEASIBLE",
        "difficulty": 3,
        "definition": "(adj.) Possible to do easily or conveniently."
    },
    {
        "word": "FEBRUARY",
        "difficulty": 3,
        "definition": "(n.) The second month of the year, in the northern hemisphere usually considered the last month of winter."
    },
    {
        "word": "FICTITIOUS",
        "difficulty": 4,
        "definition": "(adj.) Not real or true, being imaginary or fabricated."
    },
    {
        "word": "FIERY",
        "difficulty": 3,
        "definition": "(adj.) Consisting of fire or burning strongly."
    },
    {
        "word": "FINALLY",
        "difficulty": 1,
        "definition": "(adv.) After a long time, typically when there has been difficulty or delay."
    },
    {
        "word": "FINANCIALLY",
        "difficulty": 3,
        "definition": "(adv.) In a way that relates to money."
    },
    {
        "word": "FLUORESCENT",
        "difficulty": 4,
        "definition": "(adj./n.) Emitting light after absorbing radiation."
    },
    {
        "word": "FORCIBLY",
        "difficulty": 3,
        "definition": "(adv.) In a way that involves physical force or violence."
    },
    {
        "word": "FOREHEAD",
        "difficulty": 2,
        "definition": "(n.) The part of the face above the eyebrows."
    },
    {
        "word": "FOREIGN",
        "difficulty": 2,
        "definition": "(adj.) Of, from, or in a country other than one's own."
    },
    {
        "word": "FOREIGNER",
        "difficulty": 2,
        "definition": "(n.) A person from a country other than one's own."
    },
    {
        "word": "FORESEE",
        "difficulty": 2,
        "definition": "(v.) Be aware of beforehand; predict."
    },
    {
        "word": "FORFEIT",
        "difficulty": 3,
        "definition": "(v./n./adj.) To lose or give up something as a penalty for wrongdoing or failure."
    },
    {
        "word": "FORMERLY",
        "difficulty": 2,
        "definition": "(adv.) In the past; in earlier times."
    },
    {
        "word": "FORTY",
        "difficulty": 2,
        "definition": "(num./n./adj.) The number equivalent to four times ten."
    },
    {
        "word": "FORWARD",
        "difficulty": 1,
        "definition": "(adv./adj./v.) In the direction that one is facing."
    },
    {
        "word": "FOURTH",
        "difficulty": 2,
        "definition": "(num./n./adj.) Constituting number four in a sequence; 4th."
    },
    {
        "word": "FRIEND",
        "difficulty": 1,
        "definition": "(n.) A person whom one knows and has a bond with."
    },
    {
        "word": "FUELLING",
        "difficulty": 3,
        "definition": "(v.) Supplying energy or material needed to sustain activity."
    },
    {
        "word": "FULFILL",
        "difficulty": 2,
        "definition": "(v.) Carry out as required, promised, or expected."
    },
    {
        "word": "FUNDAMENTALLY",
        "difficulty": 3,
        "definition": "(adv.) In central or primary respects."
    },
    {
        "word": "GAUGE",
        "difficulty": 3,
        "definition": "(n./v.) An instrument or device for measuring."
    },
    {
        "word": "GENERALLY",
        "difficulty": 1,
        "definition": "(adv.) In most cases; usually."
    },
    {
        "word": "GENEROSITY",
        "difficulty": 3,
        "definition": "(n.) The quality of freely giving one's time, money, or resources to others without expecting anything in return."
    },
    {
        "word": "GENIUS",
        "difficulty": 2,
        "definition": "(n./adj.) Exceptional intellectual or creative power or other natural ability."
    },
    {
        "word": "GHOST",
        "difficulty": 2,
        "definition": "(n./v.) An apparition of a dead person which is believed to appear or become manifest to the living, typically as a nebulous image."
    },
    {
        "word": "GLAMOROUS",
        "difficulty": 3,
        "definition": "(adj.) Strikingly attractive or exciting in a way that suggests luxury, elegance, or a charmed life."
    },
    {
        "word": "GNARLED",
        "difficulty": 3,
        "definition": "(adj.) Knobbly, rough, and twisted, especially with age."
    },
    {
        "word": "GNAT",
        "difficulty": 3,
        "definition": "(n.) A small two-winged fly that resembles a mosquito. Gnats include both biting and non-biting forms, and they typically form large swarms."
    },
    {
        "word": "GNOME",
        "difficulty": 3,
        "definition": "(n.) A legendary dwarfish creature supposed to guard the earth's treasures underground."
    },
    {
        "word": "GORGEOUS",
        "difficulty": 3,
        "definition": "(adj.) Beautiful; very attractive."
    },
    {
        "word": "GOVERNMENT",
        "difficulty": 2,
        "definition": "(n.) The group of people with authority to direct and control the affairs of a country, state, or community."
    },
    {
        "word": "GOVERNOR",
        "difficulty": 2,
        "definition": "(n.) The elected head of a U.S. state, holding executive authority over its administration."
    },
    {
        "word": "GRAMMAR",
        "difficulty": 2,
        "definition": "(n.) The whole system and structure of a language or of languages in general."
    },
    {
        "word": "GRATEFUL",
        "difficulty": 2,
        "definition": "(adj.) Feeling or showing an appreciation of kindness; thankful."
    },
    {
        "word": "GRIEVOUS",
        "difficulty": 4,
        "definition": "(adj.) Very severe or serious."
    },
    {
        "word": "GUACAMOLE",
        "difficulty": 4,
        "definition": "(n.) A dish of mashed avocado mixed with chopped onion, tomatoes, chili peppers, and seasoning."
    },
    {
        "word": "GUARANTEE",
        "difficulty": 3,
        "definition": "(n./v.) A formal promise or assurance that certain conditions will be fulfilled."
    },
    {
        "word": "GUARANTEED",
        "difficulty": 3,
        "definition": "(v./adj.) Formal assurance of certain conditions."
    },
    {
        "word": "GUARDIAN",
        "difficulty": 2,
        "definition": "(n./adj.) A person who looks after or is legally responsible for someone who is unable to manage their own affairs, especially an incompetent or a child whose parents have died."
    },
    {
        "word": "GUERRILLA",
        "difficulty": 4,
        "definition": "(n./adj.) A member of a small independent group taking part in irregular fighting, typically against larger regular forces."
    },
    {
        "word": "GUIDANCE",
        "difficulty": 2,
        "definition": "(n.) Advice or information aimed at resolving a problem or difficulty, especially as given by someone in authority."
    },
    {
        "word": "HANDKERCHIEF",
        "difficulty": 4,
        "definition": "(n.) A square of cotton or other finely woven material intended for wiping one's nose, typically carried in a pocket or handbag."
    },
    {
        "word": "HAPPILY",
        "difficulty": 1,
        "definition": "(adv.)  In a way that expresses or reflects joy, contentment, or pleasure."
    },
    {
        "word": "HARASS",
        "difficulty": 3,
        "definition": "(v.) Subject to aggressive pressure or intimidation."
    },
    {
        "word": "HEIGHT",
        "difficulty": 2,
        "definition": "(n.) The measurement from base to top or from head to foot."
    },
    {
        "word": "HEINOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of a person or wrongful act, especially a crime) utterly odious or wicked."
    },
    {
        "word": "HEMORRHAGE",
        "difficulty": 5,
        "definition": "(n./v.) An escape of blood from a ruptured blood vessel, especially when profuse."
    },
    {
        "word": "HEROES",
        "difficulty": 2,
        "definition": "(n.) People who are admired or idealized for courage, outstanding achievements, or noble qualities."
    },
    {
        "word": "HESITANCY",
        "difficulty": 3,
        "definition": "(n.) A tentative or slow manner of acting or speaking."
    },
    {
        "word": "HIERARCHY",
        "difficulty": 4,
        "definition": "(n.) A system or organization in which people or groups are ranked one above the other according to status or authority."
    },
    {
        "word": "HINDRANCE",
        "difficulty": 3,
        "definition": "(n.) A thing that provides resistance, delay, or obstruction to something or someone."
    },
    {
        "word": "HOARSE",
        "difficulty": 3,
        "definition": "(adj.) (Of a person's voice) sounding rough and harsh, typically as the result of a sore throat or of shouting."
    },
    {
        "word": "HOMOGENEOUS",
        "difficulty": 4,
        "definition": "(adj.) Of the same kind; alike."
    },
    {
        "word": "HOPING",
        "difficulty": 1,
        "definition": "(v.) Wanting something to happen or be the case."
    },
    {
        "word": "HUMOROUS",
        "difficulty": 3,
        "definition": "(adj.) Causing lighthearted laughter and amusement; funny."
    },
    {
        "word": "HYGIENE",
        "difficulty": 3,
        "definition": "(n.) Conditions or practices conducive to maintaining health and preventing disease, especially through cleanliness."
    },
    {
        "word": "HYPOCRISY",
        "difficulty": 3,
        "definition": "(n.) The practice of claiming to have moral standards or beliefs to which one's own behavior does not conform; pretense."
    },
    {
        "word": "HYPOCRITE",
        "difficulty": 3,
        "definition": "(n.) Someone who pretends to hold beliefs or virtues they do not actually possess."
    },
    {
        "word": "IDEAL",
        "difficulty": 1,
        "definition": "(adj./n.) Satisfying one's conception of what is perfect; most suitable."
    },
    {
        "word": "IDEALLY",
        "difficulty": 2,
        "definition": "(adv.) In the best possible way; perfectly."
    },
    {
        "word": "IDIOCY",
        "difficulty": 3,
        "definition": "(n.) Extremely stupid behavior."
    },
    {
        "word": "IDIOSYNCRASY",
        "difficulty": 5,
        "definition": "(n.) A mode of behavior or way of thought peculiar to an individual."
    },
    {
        "word": "IGNORANCE",
        "difficulty": 2,
        "definition": "(n.) Lack of knowledge or information."
    },
    {
        "word": "IMAGINARY",
        "difficulty": 2,
        "definition": "(adj./n.) Existing only in the mind; not real or physically present."
    },
    {
        "word": "IMMEDIATELY",
        "difficulty": 3,
        "definition": "(adv.) At once; instantly."
    },
    {
        "word": "IMPLEMENT",
        "difficulty": 2,
        "definition": "(n./v.) A tool, utensil, or other piece of equipment, especially as used for a particular purpose."
    },
    {
        "word": "INCIDENTALLY",
        "difficulty": 4,
        "definition": "(adv.) Used to add a further but less important point or to introduce a new topic in a conversation; by the way."
    },
    {
        "word": "INCREDIBLE",
        "difficulty": 2,
        "definition": "(adj.) Impossible to believe; extraordinary."
    },
    {
        "word": "INDEPENDENCE",
        "difficulty": 3,
        "definition": "(n.) Freedom from outside control or support."
    },
    {
        "word": "INDEPENDENT",
        "difficulty": 2,
        "definition": "(adj.) Free from outside control; not depending on another's authority."
    },
    {
        "word": "INDICT",
        "difficulty": 4,
        "definition": "(v.) Formally accuse of or charge with a serious crime."
    },
    {
        "word": "INDISPENSABLE",
        "difficulty": 4,
        "definition": "(adj.) Absolutely necessary."
    },
    {
        "word": "INEVITABLE",
        "difficulty": 3,
        "definition": "(adj./n.) Certain to happen; unavoidable."
    },
    {
        "word": "INFLUENTIAL",
        "difficulty": 3,
        "definition": "(adj./n.) Having the power to shape or change the opinions, behaviors, or decisions of others."
    },
    {
        "word": "INFORMATION",
        "difficulty": 1,
        "definition": "(n.) Facts provided or learned about something or someone."
    },
    {
        "word": "INGENIOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of a person) clever, original, and inventive."
    },
    {
        "word": "INOCULATE",
        "difficulty": 4,
        "definition": "(v.) Treat (a person or animal) with a vaccine to produce immunity against a disease."
    },
    {
        "word": "INSISTENT",
        "difficulty": 3,
        "definition": "(adj.) Demanding attention or compliance in a persistent, forceful way."
    },
    {
        "word": "INSUBORDINATE",
        "difficulty": 4,
        "definition": "(adj.) Defiant of authority; disobedient to orders."
    },
    {
        "word": "INSURANCE",
        "difficulty": 2,
        "definition": "(n.) A practice or arrangement by which a company or government agency provides a guarantee of compensation for specified loss, damage, illness, or death in return for payment of a premium."
    },
    {
        "word": "INTELLIGENCE",
        "difficulty": 3,
        "definition": "(n.) The ability to acquire and apply knowledge and skills."
    },
    {
        "word": "INTERFERENCE",
        "difficulty": 3,
        "definition": "(n.) The act of getting involved in a situation in a way that disrupts or prevents normal progress."
    },
    {
        "word": "INTERRUPT",
        "difficulty": 2,
        "definition": "(v.) Stop the continuous progress of (an activity or process)."
    },
    {
        "word": "INTRODUCE",
        "difficulty": 2,
        "definition": "(v.) Bring (something, especially a product, measure, or concept) into use or operation for the first time."
    },
    {
        "word": "INVEIGLE",
        "difficulty": 5,
        "definition": "(v.) Persuade (someone) to do something by means of deception or flattery."
    },
    {
        "word": "IRRELEVANT",
        "difficulty": 3,
        "definition": "(adj.) Not connected with or relevant to something."
    },
    {
        "word": "IRRESISTIBLE",
        "difficulty": 4,
        "definition": "(adj.) Too attractive and tempting to be resisted."
    },
    {
        "word": "ISLAND",
        "difficulty": 2,
        "definition": "(n./v.) A piece of land surrounded by water."
    },
    {
        "word": "ISLE",
        "difficulty": 2,
        "definition": "(n.) An island or peninsula, especially a small one."
    },
    {
        "word": "ITINERARY",
        "difficulty": 4,
        "definition": "(n.) A planned route or journey."
    },
    {
        "word": "JEALOUS",
        "difficulty": 2,
        "definition": "(adj.) Feeling or showing envy of someone or their achievements and advantages."
    },
    {
        "word": "JEALOUSY",
        "difficulty": 3,
        "definition": "(n.) Resentful suspicion that a rival threatens something one values, or envious hostility toward another's advantages."
    },
    {
        "word": "JEWELLERY",
        "difficulty": 4,
        "definition": "(n.) Decorative personal accessories such as rings and necklaces, typically crafted from precious metals and gemstones."
    },
    {
        "word": "JUDGMENT",
        "difficulty": 2,
        "definition": "(n.) The ability to make considered decisions or come to sensible conclusions."
    },
    {
        "word": "JUDICIAL",
        "difficulty": 3,
        "definition": "(adj.) Of, by, or appropriate to a court or judge."
    },
    {
        "word": "KALEIDOSCOPE",
        "difficulty": 4,
        "definition": "(n.) A toy consisting of a tube containing mirrors and pieces of colored glass or paper, whose reflections produce changing patterns when the tube is rotated."
    },
    {
        "word": "KERNEL",
        "difficulty": 3,
        "definition": "(n.) A softer, usually edible part of a nut, seed, or fruit stone contained within its shell."
    },
    {
        "word": "KNACK",
        "difficulty": 3,
        "definition": "(n.) An acquired or natural skill at performing a task."
    },
    {
        "word": "KNOWLEDGE",
        "difficulty": 2,
        "definition": "(n.) Facts, information, and skills acquired by a person through experience or education."
    },
    {
        "word": "LABORATORY",
        "difficulty": 3,
        "definition": "(n.) A room or building equipped for scientific experiments, research, or teaching, or for the manufacture of drugs or chemicals."
    },
    {
        "word": "LAID",
        "difficulty": 1,
        "definition": "(v.) Placed something down flat in a horizontal position."
    },
    {
        "word": "LATER",
        "difficulty": 1,
        "definition": "(adv./adj.) At a time in the near future; soon or afterwards."
    },
    {
        "word": "LATTER",
        "difficulty": 2,
        "definition": "(adj./n.) Situated or occurring nearer to the end of something than to the beginning."
    },
    {
        "word": "LEAD",
        "difficulty": 1,
        "definition": "(n.) A heavy, bluish-gray metal.",
        "speakAs": "led"
    },
    {
        "word": "LED",
        "difficulty": 1,
        "definition": "(v.) Guided or directed someone toward a destination."
    },
    {
        "word": "LEGITIMATE",
        "difficulty": 3,
        "definition": "(adj./v.) Conforming to the law or to rules."
    },
    {
        "word": "LEISURE",
        "difficulty": 3,
        "definition": "(n.) Use of free time for enjoyment."
    },
    {
        "word": "LENGTH",
        "difficulty": 2,
        "definition": "(n.) The measurement or extent of something from end to end; the longest dimension of an object."
    },
    {
        "word": "LIAISON",
        "difficulty": 4,
        "definition": "(n.) Communication or cooperation which facilitates a close working relationship between people or organizations."
    },
    {
        "word": "LIBRARY",
        "difficulty": 2,
        "definition": "(n.) A building or room containing collections of books, periodicals, and sometimes films and recorded music for people to read, borrow, or refer to."
    },
    {
        "word": "LICENSE",
        "difficulty": 2,
        "definition": "(n./v.) A permit from an authority to own or use something, do a particular thing, or carry on a trade."
    },
    {
        "word": "LIEUTENANT",
        "difficulty": 4,
        "definition": "(n.) A deputy or substitute acting for a superior."
    },
    {
        "word": "LIGHTNING",
        "difficulty": 2,
        "definition": "(n.) The occurrence of a natural electrical discharge of very short duration and high voltage between a cloud and the ground or within a cloud, accompanied by a bright flash and typically also thunder."
    },
    {
        "word": "LIKELIHOOD",
        "difficulty": 2,
        "definition": "(n.) The probability of something happening."
    },
    {
        "word": "LIKELY",
        "difficulty": 1,
        "definition": "(adj./adv.) Such as well might happen or be true; probable."
    },
    {
        "word": "LONELINESS",
        "difficulty": 2,
        "definition": "(n.) Sadness because one has no friends or company."
    },
    {
        "word": "LOOSE",
        "difficulty": 1,
        "definition": "(adj./v.) Not firmly or tightly fixed in place; detached or able to be detached."
    },
    {
        "word": "LOSE",
        "difficulty": 1,
        "definition": "(v.) Be deprived of or cease to have or retain (something)."
    },
    {
        "word": "LOSING",
        "difficulty": 1,
        "definition": "(v.) Be deprived of or cease to have or retain (something)."
    },
    {
        "word": "LOVELY",
        "difficulty": 1,
        "definition": "(adj.) Very beautiful or attractive."
    },
    {
        "word": "LUXURY",
        "difficulty": 3,
        "definition": "(n./adj.) The state of great comfort and extravagant living."
    },
    {
        "word": "MAGAZINE",
        "difficulty": 2,
        "definition": "(n.) A periodical publication containing articles and illustrations, typically covering a particular subject or area of interest."
    },
    {
        "word": "MAINTAIN",
        "difficulty": 2,
        "definition": "(v.) Cause or enable (a condition or state of affairs) to continue."
    },
    {
        "word": "MAINTENANCE",
        "difficulty": 3,
        "definition": "(n.) The process of preserving a condition or situation or of keeping something in good working order."
    },
    {
        "word": "MANAGEABLE",
        "difficulty": 3,
        "definition": "(adj.) Easy to handle, control, or deal with."
    },
    {
        "word": "MANEUVER",
        "difficulty": 4,
        "definition": "(n./v.) A movement or series of moves requiring skill and care."
    },
    {
        "word": "MANUFACTURE",
        "difficulty": 3,
        "definition": "(v./n.) The making of articles on a large scale using machinery."
    },
    {
        "word": "MARRIAGE",
        "difficulty": 2,
        "definition": "(n.) The legally or formally recognized union of two people as partners in a personal relationship."
    },
    {
        "word": "MATHEMATICS",
        "difficulty": 3,
        "definition": "(n.) The abstract science of number, quantity, and space."
    },
    {
        "word": "MEDICINE",
        "difficulty": 2,
        "definition": "(n.) A compound or preparation used for the treatment or prevention of disease, especially a drug or drugs taken by mouth."
    },
    {
        "word": "MEDIEVAL",
        "difficulty": 3,
        "definition": "(adj.) Relating to the Middle Ages."
    },
    {
        "word": "MEMENTO",
        "difficulty": 3,
        "definition": "(n.) An object kept as a reminder or souvenir of a person or event."
    },
    {
        "word": "MILLENNIUM",
        "difficulty": 4,
        "definition": "(n.) A period of a thousand years, especially when calculated from the traditional date of the birth of Christ."
    },
    {
        "word": "MILLIONAIRE",
        "difficulty": 3,
        "definition": "(n.) A person of very great wealth, with assets valued in the millions."
    },
    {
        "word": "MINIATURE",
        "difficulty": 3,
        "definition": "(adj./n.) (Of a thing) of a much smaller size than normal; very small."
    },
    {
        "word": "MINUSCULE",
        "difficulty": 4,
        "definition": "(adj.) Extremely small; tiny."
    },
    {
        "word": "MINUTES",
        "difficulty": 1,
        "definition": "(n.) Sixty-second periods of time."
    },
    {
        "word": "MISCELLANEOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of items or people) gathered or considered together, although of various types."
    },
    {
        "word": "MISCHIEF",
        "difficulty": 3,
        "definition": "(n.) Playful misbehavior or troublemaking, especially in children."
    },
    {
        "word": "MISCHIEVOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of a person, animal, or their behavior) causing or showing a fondness for causing trouble in a playful way."
    },
    {
        "word": "MISSILE",
        "difficulty": 2,
        "definition": "(n.) An object or vehicle that is propelled through the air to strike a target at a distance."
    },
    {
        "word": "MISSPELL",
        "difficulty": 3,
        "definition": "(v.) Spell (a word) incorrectly."
    },
    {
        "word": "MISSPELLED",
        "difficulty": 3,
        "definition": "(v./adj.) Spelt (a word) incorrectly."
    },
    {
        "word": "MNEMONIC",
        "difficulty": 4,
        "definition": "(n./adj.) A device such as a pattern of letters, ideas, or associations that assists in remembering something."
    },
    {
        "word": "MORTGAGE",
        "difficulty": 4,
        "definition": "(n./v.) A legal agreement by which a bank or other creditor lends money at interest in exchange for taking title of the debtor's property, with the condition that the conveyance of title becomes void upon the payment of the debt."
    },
    {
        "word": "MOSQUITO",
        "difficulty": 3,
        "definition": "(n.) A slender long-legged fly with aquatic larvae. The bite of the bloodsucking female can transmit a number of serious diseases including malaria and elephantiasis."
    },
    {
        "word": "MOSQUITOES",
        "difficulty": 3,
        "definition": "(n.) Small flying insects that feed on blood and can transmit diseases."
    },
    {
        "word": "MURMUR",
        "difficulty": 2,
        "definition": "(n./v.) A soft, low, or indistinct sound or utterance."
    },
    {
        "word": "MUSCLE",
        "difficulty": 2,
        "definition": "(n./v.) A band or bundle of fibrous tissue in a human or animal body that has the ability to contract, producing movement in or maintaining the position of parts of the body."
    },
    {
        "word": "MYSTERIOUS",
        "difficulty": 3,
        "definition": "(adj.) Difficult or impossible to understand, explain, or identify."
    },
    {
        "word": "NAIVE",
        "difficulty": 3,
        "definition": "(adj.) (Of a person or action) showing a lack of experience, wisdom, or judgment."
    },
    {
        "word": "NARRATIVE",
        "difficulty": 3,
        "definition": "(n./adj.) A spoken or written account of connected events; a story."
    },
    {
        "word": "NATURALLY",
        "difficulty": 1,
        "definition": "(adv.) In a way that is to be expected."
    },
    {
        "word": "NAUSEOUS",
        "difficulty": 3,
        "definition": "(adj.) Feeling an unsettled stomach with an urge to be sick."
    },
    {
        "word": "NECESSARY",
        "difficulty": 2,
        "definition": "(adj.) Required to be done, achieved, or present; needed; essential."
    },
    {
        "word": "NECESSITY",
        "difficulty": 3,
        "definition": "(n.) The fact of being required or indispensable."
    },
    {
        "word": "NEIGHBOR",
        "difficulty": 2,
        "definition": "(n./v.) A person living next door to or very near another."
    },
    {
        "word": "NEITHER",
        "difficulty": 2,
        "definition": "(det./pron./adv./conj.) Not either."
    },
    {
        "word": "NEUTRON",
        "difficulty": 3,
        "definition": "(n.) A subatomic particle of about the same mass as a proton but without an electric charge, present in all atomic nuclei except those of ordinary hydrogen."
    },
    {
        "word": "NICHE",
        "difficulty": 3,
        "definition": "(n./adj./v.) A comfortable or suitable position in life or employment."
    },
    {
        "word": "NIECE",
        "difficulty": 3,
        "definition": "(n.) A daughter of one's brother or sister, or of one's brother-in-law or sister-in-law."
    },
    {
        "word": "NINETY",
        "difficulty": 2,
        "definition": "(num./n./adj.) The cardinal number equivalent to nine times ten; 90."
    },
    {
        "word": "NINTH",
        "difficulty": 2,
        "definition": "(num./n./adj.) Constituting number nine in a sequence; 9th."
    },
    {
        "word": "NOTICEABLE",
        "difficulty": 3,
        "definition": "(adj.) Plainly visible or obvious; attracting attention."
    },
    {
        "word": "NOWADAYS",
        "difficulty": 2,
        "definition": "(adv.) At the present time, in contrast with the past."
    },
    {
        "word": "NUCLEAR",
        "difficulty": 2,
        "definition": "(adj.) Of or relating to the central core of an atom or the energy released by splitting or fusing such cores."
    },
    {
        "word": "NUISANCE",
        "difficulty": 3,
        "definition": "(n.) A person, thing, or circumstance causing inconvenience or annoyance."
    },
    {
        "word": "OBEDIENCE",
        "difficulty": 3,
        "definition": "(n.) Compliance with an order, request, or law or submission to another's authority."
    },
    {
        "word": "OBEDIENT",
        "difficulty": 2,
        "definition": "(adj.) Complying or willing to comply with orders or requests; submissive to another's authority."
    },
    {
        "word": "OBSTACLE",
        "difficulty": 2,
        "definition": "(n.) A thing that blocks one's way or prevents or hinders progress."
    },
    {
        "word": "OCCASION",
        "difficulty": 2,
        "definition": "(n./v.) A particular time or instance of an event."
    },
    {
        "word": "OCCASIONALLY",
        "difficulty": 3,
        "definition": "(adv.) At infrequent or irregular intervals; now and then."
    },
    {
        "word": "OCCURRED",
        "difficulty": 3,
        "definition": "(v.) Happened; took place."
    },
    {
        "word": "OCCURRENCE",
        "difficulty": 4,
        "definition": "(n.) An incident or event."
    },
    {
        "word": "OFF",
        "difficulty": 1,
        "definition": "(adv./prep./adj.) Away from a place or at a distance."
    },
    {
        "word": "OFFICIAL",
        "difficulty": 2,
        "definition": "(adj./n.) Relating to an authority or public body and its duties, actions, and responsibilities."
    },
    {
        "word": "OFTEN",
        "difficulty": 1,
        "definition": "(adv.) Many times; frequently."
    },
    {
        "word": "OMISSION",
        "difficulty": 3,
        "definition": "(n.) Someone or something that has been left out or excluded."
    },
    {
        "word": "OMIT",
        "difficulty": 2,
        "definition": "(v.) Leave out or exclude (someone or something), either intentionally or forgetfully."
    },
    {
        "word": "OMITTED",
        "difficulty": 3,
        "definition": "(v.) Left something out or failed to include it."
    },
    {
        "word": "OPINION",
        "difficulty": 2,
        "definition": "(n.) A view or judgment formed about something, not necessarily based on fact or knowledge."
    },
    {
        "word": "OPPONENT",
        "difficulty": 2,
        "definition": "(n./adj.) Someone who competes against or fights another in a contest, game, or argument; a rival or adversary."
    },
    {
        "word": "OPPORTUNITY",
        "difficulty": 2,
        "definition": "(n.) A set of circumstances that makes it possible to do something."
    },
    {
        "word": "OPPRESSION",
        "difficulty": 3,
        "definition": "(n.) Prolonged cruel or unjust treatment or control."
    },
    {
        "word": "OPTIMISM",
        "difficulty": 3,
        "definition": "(n.) Hopefulness and confidence about the future or the successful outcome of something."
    },
    {
        "word": "OPTIMISTIC",
        "difficulty": 3,
        "definition": "(adj.) Hopeful and confident about the future."
    },
    {
        "word": "ORCHESTRA",
        "difficulty": 3,
        "definition": "(n.) A large group of musicians playing instrumental music together."
    },
    {
        "word": "ORDINARILY",
        "difficulty": 3,
        "definition": "(adv.) Under normal circumstances or conditions."
    },
    {
        "word": "ORIGIN",
        "difficulty": 2,
        "definition": "(n.) The point or place where something begins, arises, or is derived."
    },
    {
        "word": "ORIGINAL",
        "difficulty": 2,
        "definition": "(adj./n.) Present or existing from the beginning; first or earliest."
    },
    {
        "word": "OUTRAGEOUS",
        "difficulty": 3,
        "definition": "(adj.) Shockingly bad or excessive."
    },
    {
        "word": "OVERRUN",
        "difficulty": 2,
        "definition": "(v./n.) Spread over or occupy (a place) in large numbers."
    },
    {
        "word": "PAMPHLET",
        "difficulty": 3,
        "definition": "(n./v.) A small booklet or leaflet containing information or arguments about a single subject."
    },
    {
        "word": "PAMPHLETS",
        "difficulty": 3,
        "definition": "(n.) Small booklets or leaflets containing information or arguments about a single subject."
    },
    {
        "word": "PARALLEL",
        "difficulty": 3,
        "definition": "(adj./n./v.) (Of lines, planes, surfaces, or objects) side by side and having the same distance continuously between them."
    },
    {
        "word": "PARAPHERNALIA",
        "difficulty": 5,
        "definition": "(n.) Miscellaneous articles, especially the equipment needed for a particular activity."
    },
    {
        "word": "PARTICULAR",
        "difficulty": 3,
        "definition": "(adj./n.) Used to single out an individual member of a specified group or class."
    },
    {
        "word": "PARTICULARLY",
        "difficulty": 3,
        "definition": "(adv.) To a higher degree than is usual or average."
    },
    {
        "word": "PASTIME",
        "difficulty": 3,
        "definition": "(n.) An activity that someone does regularly for enjoyment rather than work; a hobby."
    },
    {
        "word": "PAVILION",
        "difficulty": 3,
        "definition": "(n./v.) A decorative building used as a shelter in a park or garden."
    },
    {
        "word": "PEACEABLE",
        "difficulty": 3,
        "definition": "(adj.) Inclined to avoid argument or violent conflict."
    },
    {
        "word": "PECULIAR",
        "difficulty": 3,
        "definition": "(adj./n.) Strange or odd; unusual."
    },
    {
        "word": "PENETRATE",
        "difficulty": 3,
        "definition": "(v.) Succeed in forcing a way into or through (something)."
    },
    {
        "word": "PERCEIVE",
        "difficulty": 3,
        "definition": "(v.) Become aware or conscious of (something); come to realize or understand."
    },
    {
        "word": "PERFORMANCE",
        "difficulty": 2,
        "definition": "(n.) A live presentation of a play, music, or other art before an audience."
    },
    {
        "word": "PERMANENT",
        "difficulty": 2,
        "definition": "(adj./n.) Lasting or intended to last or remain unchanged indefinitely."
    },
    {
        "word": "PERMISSIBLE",
        "difficulty": 3,
        "definition": "(adj.) Within the bounds of what is officially sanctioned or allowed."
    },
    {
        "word": "PERMITTED",
        "difficulty": 3,
        "definition": "(v./adj.) Allowed; given authorization."
    },
    {
        "word": "PERSEVERANCE",
        "difficulty": 4,
        "definition": "(n.) Persistence in doing something despite difficulty or delay in achieving success."
    },
    {
        "word": "PERSISTENCE",
        "difficulty": 3,
        "definition": "(n.) Firm or obstinate continuance in a course of action in spite of difficulty or opposition."
    },
    {
        "word": "PERSONAL",
        "difficulty": 1,
        "definition": "(adj.) Belonging to or affecting a specific individual; private and not shared with others."
    },
    {
        "word": "PERSONNEL",
        "difficulty": 3,
        "definition": "(n.) People employed in an organization or engaged in an organized undertaking such as military service."
    },
    {
        "word": "PERSPIRATION",
        "difficulty": 4,
        "definition": "(n.) The process of sweating."
    },
    {
        "word": "PHARAOH",
        "difficulty": 4,
        "definition": "(n.) A ruler in ancient Egypt."
    },
    {
        "word": "PHYSICAL",
        "difficulty": 2,
        "definition": "(adj./n.) Relating to the body as opposed to the mind."
    },
    {
        "word": "PHYSICIAN",
        "difficulty": 3,
        "definition": "(n.) A person qualified to practice medicine."
    },
    {
        "word": "PIECE",
        "difficulty": 1,
        "definition": "(n./v.) A portion of an object or of material, produced by cutting, tearing, or breaking the whole."
    },
    {
        "word": "PILGRIMAGE",
        "difficulty": 3,
        "definition": "(n./v.) A journey to a place associated with someone or something respected or believed to be holy."
    },
    {
        "word": "PITIFUL",
        "difficulty": 2,
        "definition": "(adj.) Deserving or arousing pity."
    },
    {
        "word": "PLANNING",
        "difficulty": 1,
        "definition": "(v./n.) The process of making plans for something."
    },
    {
        "word": "PLAYWRIGHT",
        "difficulty": 3,
        "definition": "(n.) A person who writes plays."
    },
    {
        "word": "PLEASANT",
        "difficulty": 2,
        "definition": "(adj.) Giving a sense of happy satisfaction or enjoyment."
    },
    {
        "word": "PORTRAY",
        "difficulty": 3,
        "definition": "(v.) Depict (someone or something) in a work of art or literature."
    },
    {
        "word": "POSSESS",
        "difficulty": 2,
        "definition": "(v.) Have as belonging to one; own."
    },
    {
        "word": "POSSESSION",
        "difficulty": 3,
        "definition": "(n.) The state of having, owning, or controlling something."
    },
    {
        "word": "POSSESSIVE",
        "difficulty": 3,
        "definition": "(adj./n.) Showing a desire to own or dominate."
    },
    {
        "word": "POSSIBILITY",
        "difficulty": 3,
        "definition": "(n.) A thing that may happen or be the case."
    },
    {
        "word": "POSSIBLE",
        "difficulty": 1,
        "definition": "(adj./n.) Able to be done or achieved to happen."
    },
    {
        "word": "POTATO",
        "difficulty": 1,
        "definition": "(n.) A starchy plant tuber which is one of the most important food crops, eaten as a vegetable."
    },
    {
        "word": "POTATOES",
        "difficulty": 2,
        "definition": "(n.) A starchy root vegetable widely eaten baked, boiled, or fried."
    },
    {
        "word": "PRACTICALLY",
        "difficulty": 2,
        "definition": "(adv.) Virtually; almost."
    },
    {
        "word": "PRAIRIE",
        "difficulty": 3,
        "definition": "(n.) A large open area of grassland, especially in North America."
    },
    {
        "word": "PRECEDE",
        "difficulty": 3,
        "definition": "(v.) Come before (something) in time."
    },
    {
        "word": "PRECEDENCE",
        "difficulty": 3,
        "definition": "(n.) The condition of being considered more important than someone or something else; priority in importance, order, or rank."
    },
    {
        "word": "PRECEDING",
        "difficulty": 3,
        "definition": "(adj./v.) Coming before in time or order."
    },
    {
        "word": "PREFERENCE",
        "difficulty": 3,
        "definition": "(n.) A greater liking for one alternative over another or others."
    },
    {
        "word": "PREFERRED",
        "difficulty": 3,
        "definition": "(adj./v.) Liking one thing better than another."
    },
    {
        "word": "PREJUDICE",
        "difficulty": 3,
        "definition": "(n./v.) Preconceived opinion that is not based on reason or actual experience."
    },
    {
        "word": "PREPARATION",
        "difficulty": 3,
        "definition": "(n.) The action or process of making ready or being made ready for use or consideration."
    },
    {
        "word": "PRESCRIPTION",
        "difficulty": 4,
        "definition": "(n./adj.) An instruction written by a medical practitioner that authorizes a patient to be provided with a medicine or treatment."
    },
    {
        "word": "PRESENCE",
        "difficulty": 2,
        "definition": "(n.) The quality of being in a particular place; a commanding or impressive bearing."
    },
    {
        "word": "PREVALENT",
        "difficulty": 3,
        "definition": "(adj.) Widespread in a particular area or at a particular time."
    },
    {
        "word": "PRIMITIVE",
        "difficulty": 3,
        "definition": "(adj./n.) Relating to, denoting, or preserving the character of an early stage in the evolutionary or historical development of something."
    },
    {
        "word": "PRINCIPAL",
        "difficulty": 3,
        "definition": "(adj./n.) First in order of importance; main."
    },
    {
        "word": "PRINCIPLE",
        "difficulty": 3,
        "definition": "(n.) A fundamental truth or proposition that serves as the foundation for a system of belief or behavior or for a chain of reasoning."
    },
    {
        "word": "PRIVILEGE",
        "difficulty": 3,
        "definition": "(n./v.) A special right, advantage, or immunity granted or available only to a particular person or group."
    },
    {
        "word": "PROBABLY",
        "difficulty": 1,
        "definition": "(adv.) Almost certainly; as far as one knows or can tell."
    },
    {
        "word": "PROCEDURE",
        "difficulty": 3,
        "definition": "(n.) An established or official way of doing something."
    },
    {
        "word": "PROCEED",
        "difficulty": 2,
        "definition": "(v./n.) Begin or continue a course of action."
    },
    {
        "word": "PROFESSION",
        "difficulty": 2,
        "definition": "(n.) A paid occupation, especially one that involves prolonged training and a formal qualification."
    },
    {
        "word": "PROFESSOR",
        "difficulty": 2,
        "definition": "(n.) A university academic of the highest rank."
    },
    {
        "word": "PROMINENT",
        "difficulty": 3,
        "definition": "(adj.) Important; famous."
    },
    {
        "word": "PROMISE",
        "difficulty": 1,
        "definition": "(n./v.) A declaration or assurance that one will do a particular thing or that a particular thing will happen."
    },
    {
        "word": "PRONOUNCE",
        "difficulty": 2,
        "definition": "(v.) Make the sound of (a word or part of a word) in the correct or a particular way."
    },
    {
        "word": "PRONUNCIATION",
        "difficulty": 4,
        "definition": "(n.) The way in which a word is pronounced."
    },
    {
        "word": "PROPAGANDA",
        "difficulty": 4,
        "definition": "(n.) Information, especially of a biased or misleading nature, used to promote or publicize a particular political cause or point of view."
    },
    {
        "word": "PSYCHOLOGY",
        "difficulty": 4,
        "definition": "(n.) The scientific study of the human mind and its functions, especially those affecting behavior in a given context."
    },
    {
        "word": "PUBLICLY",
        "difficulty": 2,
        "definition": "(adv.) In a way that is visible or known to all people; openly."
    },
    {
        "word": "PURSUE",
        "difficulty": 2,
        "definition": "(v.) Follow (someone or something) in order to catch or attack them."
    },
    {
        "word": "QUANTITY",
        "difficulty": 2,
        "definition": "(n.) The amount or number of a material or immaterial thing not usually estimated by spatial measurement."
    },
    {
        "word": "QUARANTINE",
        "difficulty": 4,
        "definition": "(n./v.) A state, period, or place of isolation in which people or animals that have arrived from elsewhere or been exposed to infectious or contagious disease are placed."
    },
    {
        "word": "QUESTIONNAIRE",
        "difficulty": 4,
        "definition": "(n.) A printed or digital form with a set of structured questions used to gather information from respondents."
    },
    {
        "word": "QUEUE",
        "difficulty": 4,
        "definition": "(n./v.) A line or sequence of people or vehicles awaiting their turn to be attended to or to proceed."
    },
    {
        "word": "QUIZZES",
        "difficulty": 4,
        "definition": "(n./v.) A test of knowledge, especially a brief, informal test given to students."
    },
    {
        "word": "REALISTICALLY",
        "difficulty": 4,
        "definition": "(adv.) In a way that is true to life."
    },
    {
        "word": "REALIZE",
        "difficulty": 2,
        "definition": "(v.) Become fully aware of (something) as a fact; understand clearly."
    },
    {
        "word": "REALLY",
        "difficulty": 1,
        "definition": "(adv.) In actual fact, as opposed to what is said or imagined to be the case."
    },
    {
        "word": "RECEDE",
        "difficulty": 4,
        "definition": "(v.) Go or move back or further away from a previous position."
    },
    {
        "word": "RECEIPT",
        "difficulty": 4,
        "definition": "(n./v.) A document confirming that goods or payment have been handed over."
    },
    {
        "word": "RECEIVE",
        "difficulty": 2,
        "definition": "(v.) Be given, presented with, or paid (something)."
    },
    {
        "word": "RECOGNIZE",
        "difficulty": 2,
        "definition": "(v.) Identify (someone or something) from having encountered them before; know again."
    },
    {
        "word": "RECOMMEND",
        "difficulty": 2,
        "definition": "(v.) Put forward (someone or something) with approval as being suitable for a particular purpose or role."
    },
    {
        "word": "REFERENCE",
        "difficulty": 2,
        "definition": "(n./v.) The action of mentioning or alluding to something."
    },
    {
        "word": "REFERRED",
        "difficulty": 4,
        "definition": "(v.) Mentioned or alluded to."
    },
    {
        "word": "REFERRING",
        "difficulty": 4,
        "definition": "(v.) Mentioning or directing attention to something; sending someone to another source."
    },
    {
        "word": "RELEVANT",
        "difficulty": 2,
        "definition": "(adj.) Closely connected or appropriate to the matter at hand."
    },
    {
        "word": "RELIEVING",
        "difficulty": 4,
        "definition": "(v.) Cause (pain, distress, or difficulty) to become less severe or serious."
    },
    {
        "word": "RELIGIOUS",
        "difficulty": 2,
        "definition": "(adj.) Relating to or practicing a belief in a higher power, moral code, and system of worship."
    },
    {
        "word": "REMEMBRANCE",
        "difficulty": 4,
        "definition": "(n.) The act of keeping something in one's memory."
    },
    {
        "word": "REMINISCENCE",
        "difficulty": 4,
        "definition": "(n.) A story told about a past event remembered by the narrator."
    },
    {
        "word": "REPETITION",
        "difficulty": 4,
        "definition": "(n.) The action of repeating something that has already been said or written."
    },
    {
        "word": "REPRESENTATIVE",
        "difficulty": 4,
        "definition": "(adj./n.) Typical of a class, group, or body of opinion."
    },
    {
        "word": "RESEMBLANCE",
        "difficulty": 4,
        "definition": "(n.) The quality of being similar or looking like something else."
    },
    {
        "word": "RESERVOIR",
        "difficulty": 4,
        "definition": "(n./v.) A large natural or artificial lake used as a source of water supply."
    },
    {
        "word": "RESISTANCE",
        "difficulty": 4,
        "definition": "(n.) The refusal to accept or comply with something; the attempt to prevent something by action or argument."
    },
    {
        "word": "RESTAURANT",
        "difficulty": 2,
        "definition": "(n.) A place where people pay to sit and eat meals that are cooked and served on the premises."
    },
    {
        "word": "RHEUMATISM",
        "difficulty": 4,
        "definition": "(n.) A medical condition causing painful inflammation and stiffness in the joints or muscles."
    },
    {
        "word": "RHYTHM",
        "difficulty": 4,
        "definition": "(n.) A strong, regular, repeated pattern of movement or sound."
    },
    {
        "word": "RHYTHMICAL",
        "difficulty": 5,
        "definition": "(adj.) Occurring regularly."
    },
    {
        "word": "RIDICULOUS",
        "difficulty": 4,
        "definition": "(adj.) Deserving or inviting derision or mockery; absurd."
    },
    {
        "word": "ROOMMATE",
        "difficulty": 2,
        "definition": "(n.) A person occupying the same room as another."
    },
    {
        "word": "SACRIFICE",
        "difficulty": 4,
        "definition": "(n./v.) An act of slaughtering an animal or person or surrendering a possession as an offering to God or to a divine or supernatural figure."
    },
    {
        "word": "SACRILEGIOUS",
        "difficulty": 5,
        "definition": "(adj.) Showing disrespect toward something considered holy or sacred."
    },
    {
        "word": "SAFETY",
        "difficulty": 1,
        "definition": "(n./adj.) The condition of being safe from undergoing or causing hurt, injury, or loss."
    },
    {
        "word": "SALARY",
        "difficulty": 2,
        "definition": "(n./v.) A fixed regular payment, typically paid on a monthly or biweekly basis but often expressed as an annual sum, made by an employer to an employee, especially a professional or white-collar worker."
    },
    {
        "word": "SATELLITE",
        "difficulty": 4,
        "definition": "(n./adj.) An artificial body placed in orbit around the earth or moon or another planet in order to collect information or for communication."
    },
    {
        "word": "SCARY",
        "difficulty": 1,
        "definition": "(adj.) Causing fear or alarm."
    },
    {
        "word": "SCENERY",
        "difficulty": 2,
        "definition": "(n.) The natural features of a landscape considered in terms of their appearance, especially when picturesque."
    },
    {
        "word": "SCHEDULE",
        "difficulty": 2,
        "definition": "(n./v.) A plan for carrying out a process or procedure, giving lists of intended events and times."
    },
    {
        "word": "SCIENCE",
        "difficulty": 1,
        "definition": "(n.) The intellectual and practical activity encompassing the systematic study of the structure and behavior of the physical and natural world through observation and experiment."
    },
    {
        "word": "SCISSORS",
        "difficulty": 4,
        "definition": "(n.) An instrument used for cutting cloth, paper, and other thin material, consisting of two blades laid one on top of the other and fastened in the middle so as to allow them to be opened and closed by a thumb and finger inserted through rings at one end."
    },
    {
        "word": "SECEDE",
        "difficulty": 4,
        "definition": "(v.) Withdraw formally from membership of a federal union, an alliance, or a political or religious organization."
    },
    {
        "word": "SECRETARY",
        "difficulty": 4,
        "definition": "(n.) A person employed by an individual or in an office to assist with correspondence, keep records, and make appointments and similar administrative tasks."
    },
    {
        "word": "SEIZE",
        "difficulty": 4,
        "definition": "(v.) Take hold of suddenly and forcibly."
    },
    {
        "word": "SENSE",
        "difficulty": 1,
        "definition": "(n./v.) A faculty by which the body perceives an external stimulus; one of the faculties of sight, smell, hearing, taste, and touch."
    },
    {
        "word": "SENTENCE",
        "difficulty": 1,
        "definition": "(n./v.) A set of words that is complete in itself, typically containing a subject and predicate, conveying a statement, question, exclamation, or command, and consisting of a main clause and sometimes one or more subordinate clauses."
    },
    {
        "word": "SEPARATE",
        "difficulty": 2,
        "definition": "(adj./v.) Forming or viewed as a unit apart or by itself."
    },
    {
        "word": "SEPARATION",
        "definition": "(n.) The act of keeping things distinct or away from each other."
    },
    {
        "word": "COLONEL",
        "difficulty": 4,
        "definition": "(n.) A senior military officer ranking above a major and below a general."
    },
    {
        "word": "SERGEANT",
        "difficulty": 4,
        "definition": "(n.) A non-commissioned officer in the armed forces, ranking above a corporal."
    },
    {
        "word": "SEVERAL",
        "difficulty": 1,
        "definition": "(det./pron./adj.) More than two but not many."
    },
    {
        "word": "SEVERELY",
        "difficulty": 2,
        "definition": "(adv.) To an undesirably great or intense degree."
    },
    {
        "word": "SHEPHERD",
        "difficulty": 4,
        "definition": "(n./v.) A person who tends and rears sheep."
    },
    {
        "word": "SHINING",
        "difficulty": 1,
        "definition": "(adj./v./n.) (Of its surface) reflecting light, typically because very clean or polished."
    },
    {
        "word": "SIEGE",
        "difficulty": 4,
        "definition": "(n./v.) A military operation in which enemy forces surround a town or building, cutting off essential supplies, with the aim of compelling the surrender of those inside."
    },
    {
        "word": "SIMILAR",
        "difficulty": 2,
        "definition": "(adj.) Resembling without being identical."
    },
    {
        "word": "SIMILE",
        "difficulty": 4,
        "definition": "(n.) A figure of speech involving the comparison of one thing with another thing of a different kind, used to make a description more emphatic or vivid (e.g., as brave as a lion, crazy like a fox)."
    },
    {
        "word": "SIMPLY",
        "difficulty": 1,
        "definition": "(adv.) In a straightforward or easy way."
    },
    {
        "word": "SIMULTANEOUS",
        "difficulty": 4,
        "definition": "(adj.) Occurring, operating, or done at the same time."
    },
    {
        "word": "SINCERELY",
        "difficulty": 2,
        "definition": "(adv.) In a genuine, honest, and heartfelt way."
    },
    {
        "word": "SKIING",
        "difficulty": 2,
        "definition": "(n./v.) The action of traveling over snow on skis, especially as a sport or recreation."
    },
    {
        "word": "SOPHOMORE",
        "difficulty": 4,
        "definition": "(n./adj.) A second-year college or high school student."
    },
    {
        "word": "SOUVENIR",
        "difficulty": 4,
        "definition": "(n./v.) A thing that is kept as a reminder of a person, place, or event."
    },
    {
        "word": "SPECIFICALLY",
        "difficulty": 4,
        "definition": "(adv.) In a way that is exact and clear; precisely."
    },
    {
        "word": "SPECIMEN",
        "difficulty": 4,
        "definition": "(n.) A single example of a plant, animal, or object used to represent or study its kind."
    },
    {
        "word": "SPEECH",
        "difficulty": 1,
        "definition": "(n.) The expression of or the ability to express thoughts and feelings by articulate sounds."
    },
    {
        "word": "SPONSOR",
        "difficulty": 2,
        "definition": "(n./v.) A person or organization that provides funds for a project or activity carried out by another, in particular a person or organization that pays for or contributes to the costs involved in staging a sporting or artistic event in return for advertising."
    },
    {
        "word": "SPONTANEOUS",
        "difficulty": 4,
        "definition": "(adj.) Performed or occurring as a result of a sudden inner impulse or inclination and without premeditation or external stimulus."
    },
    {
        "word": "STATISTICS",
        "difficulty": 4,
        "definition": "(n.) The practice or science of collecting and analyzing numerical data in large quantities, especially for the purpose of inferring proportions in a whole from those in a representative sample."
    },
    {
        "word": "STOPPED",
        "difficulty": 1,
        "definition": "(v./adj.) (Of an event, action, or process) come to an end; cease to happen."
    },
    {
        "word": "STRATEGY",
        "difficulty": 4,
        "definition": "(n.) A plan of action or policy designed to achieve a major or overall aim."
    },
    {
        "word": "STRENGTH",
        "difficulty": 2,
        "definition": "(n.) The power or capacity to resist force or endure."
    },
    {
        "word": "STRENUOUS",
        "difficulty": 4,
        "definition": "(adj.) Requiring or using great exertion."
    },
    {
        "word": "STUBBORNNESS",
        "difficulty": 4,
        "definition": "(n.) Unreasonable refusal to change one's mind or course of action."
    },
    {
        "word": "STUDYING",
        "difficulty": 1,
        "definition": "(v./n.) Devoting time and attention to acquiring knowledge on (an academic subject), especially by means of books."
    },
    {
        "word": "SUBORDINATE",
        "difficulty": 4,
        "definition": "(adj./n./v.) Lower in rank or position."
    },
    {
        "word": "SUCCEED",
        "difficulty": 2,
        "definition": "(v.) Achieve the desired aim or result."
    },
    {
        "word": "SUCCESS",
        "difficulty": 2,
        "definition": "(n.) The accomplishment of an aim or purpose."
    },
    {
        "word": "SUCCESSFUL",
        "difficulty": 2,
        "definition": "(adj.) Accomplishing an aim or purpose."
    },
    {
        "word": "SUCCESSION",
        "difficulty": 4,
        "definition": "(n.) A number of people or things of a similar kind following one after the other."
    },
    {
        "word": "SUFFICIENT",
        "difficulty": 4,
        "definition": "(adj.) Enough; adequate."
    },
    {
        "word": "SUPERSEDE",
        "difficulty": 4,
        "definition": "(v.) Take the place of (a person or thing previously in authority or use); supplant."
    },
    {
        "word": "SUPPRESS",
        "difficulty": 2,
        "definition": "(v.) Forcibly put an end to."
    },
    {
        "word": "SURPRISE",
        "difficulty": 2,
        "definition": "(n./v./adj.) An unexpected or astonishing event, fact, or thing."
    },
    {
        "word": "SURROUND",
        "difficulty": 2,
        "definition": "(v./n.) Be all around (someone or something)."
    },
    {
        "word": "SUSCEPTIBLE",
        "difficulty": 4,
        "definition": "(adj.) Likely or liable to be influenced or harmed by a particular thing."
    },
    {
        "word": "SUSPICIOUS",
        "difficulty": 4,
        "definition": "(adj.) Having or showing a cautious distrust of someone or something."
    },
    {
        "word": "SYLLABLE",
        "difficulty": 4,
        "definition": "(n./v.) A unit of spoken language built around a single vowel sound, forming part or all of a word."
    },
    {
        "word": "SYMMETRICAL",
        "difficulty": 4,
        "definition": "(adj.) Having balanced, identical proportions on both sides of a central dividing line."
    },
    {
        "word": "SYNONYMOUS",
        "difficulty": 4,
        "definition": "(adj.) (Of a word or phrase) having the same or nearly the same meaning as another word or phrase in the same language."
    },
    {
        "word": "TANGIBLE",
        "difficulty": 4,
        "definition": "(adj./n.) Perceptible by touch."
    },
    {
        "word": "TECHNICAL",
        "difficulty": 2,
        "definition": "(adj.) Involving specialized knowledge or skills related to a particular field or trade."
    },
    {
        "word": "TECHNIQUE",
        "difficulty": 4,
        "definition": "(n.) A way of carrying out a particular task, especially the execution or performance of an artistic work or a scientific procedure."
    },
    {
        "word": "TEMPERAMENTAL",
        "difficulty": 4,
        "definition": "(adj.) (Of a person) liable to unreasonable changes of mood."
    },
    {
        "word": "TEMPERATURE",
        "difficulty": 2,
        "definition": "(n.) The degree or intensity of heat present in a substance or object, especially as expressed according to a comparative scale and shown by a thermometer or perceived by touch."
    },
    {
        "word": "TENDENCY",
        "difficulty": 4,
        "definition": "(n.) An inclination toward a particular characteristic or type of behavior."
    },
    {
        "word": "THEMSELVES",
        "difficulty": 1,
        "definition": "(pron.) Used as the object of a verb or preposition to refer to a group of people or things previously mentioned as the subject of the clause."
    },
    {
        "word": "THEORIES",
        "difficulty": 2,
        "definition": "(n.) Sets of ideas or principles used to explain facts or events."
    },
    {
        "word": "THEREFORE",
        "difficulty": 2,
        "definition": "(adv.) For that reason; consequently."
    },
    {
        "word": "THOROUGH",
        "difficulty": 4,
        "definition": "(adj.) Complete with regard to every detail; not superficial or partial."
    },
    {
        "word": "THOUGH",
        "difficulty": 2,
        "definition": "(adv./conj./n.) In spite of the fact that; although."
    },
    {
        "word": "THRESHOLD",
        "difficulty": 4,
        "definition": "(n.) A strip of wood or stone forming the bottom of a doorway and crossed in entering a house or room."
    },
    {
        "word": "THROUGH",
        "difficulty": 1,
        "definition": "(prep./adv./adj.) Moving in one side and out of the other side of (an opening, channel, or location)."
    },
    {
        "word": "TOMORROW",
        "difficulty": 1,
        "definition": "(adv./n.) On the day after today."
    },
    {
        "word": "TOURNAMENT",
        "difficulty": 4,
        "definition": "(n.) (In a sport or game) a series of contests between a number of competitors, who compete for an overall prize."
    },
    {
        "word": "TOWARDS",
        "difficulty": 1,
        "definition": "(prep.) In the direction of."
    },
    {
        "word": "TRAGEDY",
        "difficulty": 4,
        "definition": "(n.) An event causing great suffering, destruction, and distress, such as a serious accident, crime, or natural catastrophe."
    },
    {
        "word": "TRANSFERRING",
        "difficulty": 4,
        "definition": "(v.) Move from one place to another."
    },
    {
        "word": "TRIES",
        "difficulty": 1,
        "definition": "(v.) Makes an attempt or effort to do something."
    },
    {
        "word": "TRULY",
        "difficulty": 1,
        "definition": "(adv.) In a truthful way."
    },
    {
        "word": "TWELFTH",
        "difficulty": 4,
        "definition": "(num./n./adj.) Constituting number twelve in a sequence; 12th."
    },
    {
        "word": "TYRANNY",
        "difficulty": 4,
        "definition": "(n.) Cruel and oppressive government or rule."
    },
    {
        "word": "UNDOUBTEDLY",
        "difficulty": 4,
        "definition": "(adv.) Without doubt; certainly."
    },
    {
        "word": "UNFORGETTABLE",
        "difficulty": 4,
        "definition": "(adj.) Impossible to forget; very memorable."
    },
    {
        "word": "UNIQUE",
        "difficulty": 2,
        "definition": "(adj./n.) Being the only one of its kind; unlike anything else."
    },
    {
        "word": "UNNECESSARY",
        "difficulty": 4,
        "definition": "(adj./n.) Not needed."
    },
    {
        "word": "UNTIL",
        "difficulty": 1,
        "definition": "(prep./conj.) Up to (the point in time or the event mentioned)."
    },
    {
        "word": "USABLE",
        "difficulty": 2,
        "definition": "(adj.) Able or fit to be used."
    },
    {
        "word": "USAGE",
        "difficulty": 2,
        "definition": "(n.) The action of using something or the fact of being used."
    },
    {
        "word": "USUALLY",
        "difficulty": 1,
        "definition": "(adv.) Under normal conditions; generally."
    },
    {
        "word": "UTILIZATION",
        "difficulty": 4,
        "definition": "(n.) The action of making practical and effective use of something."
    },
    {
        "word": "VACUUM",
        "difficulty": 4,
        "definition": "(n./v./adj.) A space entirely devoid of matter."
    },
    {
        "word": "VALUABLE",
        "difficulty": 2,
        "definition": "(adj./n.) Worth a great deal of money."
    },
    {
        "word": "VENGEANCE",
        "difficulty": 4,
        "definition": "(n.) Punishment inflicted or retribution exacted for an injury or wrong."
    },
    {
        "word": "VIGILANT",
        "difficulty": 4,
        "definition": "(adj.) Keeping careful watch for possible danger or difficulties."
    },
    {
        "word": "VILLAGE",
        "difficulty": 1,
        "definition": "(n./adj.) A group of houses and associated buildings, larger than a hamlet and smaller than a town, situated in a rural area."
    },
    {
        "word": "VILLAIN",
        "difficulty": 4,
        "definition": "(n.) (In a novel, movie, or play) a character whose evil actions or motives are important to the plot."
    },
    {
        "word": "VIOLENCE",
        "difficulty": 2,
        "definition": "(n.) Behavior involving physical force intended to hurt, damage, or kill someone or something."
    },
    {
        "word": "VIRTUE",
        "difficulty": 2,
        "definition": "(n.) Behavior showing high moral standards."
    },
    {
        "word": "VISIBLE",
        "difficulty": 2,
        "definition": "(adj./n.) Able to be seen."
    },
    {
        "word": "VISION",
        "difficulty": 2,
        "definition": "(n./v.) The faculty or state of being able to see."
    },
    {
        "word": "VOLUME",
        "difficulty": 1,
        "definition": "(n.) A book forming part of a work or series."
    },
    {
        "word": "WARRANT",
        "difficulty": 2,
        "definition": "(n./v.) A document issued by a legal or government official authorizing the police or some other body to make an arrest, search premises, or carry out some other action relating to the administration of justice."
    },
    {
        "word": "WARRIORS",
        "difficulty": 2,
        "definition": "(n.) (Especially in the past) a brave or experienced soldier or fighter."
    },
    {
        "word": "WEATHER",
        "difficulty": 1,
        "definition": "(n./v.) The state of the atmosphere at a place and time as regards heat, dryness, sunshine, wind, rain, etc."
    },
    {
        "word": "WEDNESDAY",
        "difficulty": 4,
        "definition": "(n.) The day of the week before Thursday and after Tuesday."
    },
    {
        "word": "WEIRD",
        "difficulty": 2,
        "definition": "(adj.) Suggesting something supernatural; uncanny."
    },
    {
        "word": "WHEREVER",
        "difficulty": 1,
        "definition": "(adv./conj.) In or to whatever place (of which the name is unknown)."
    },
    {
        "word": "WHETHER",
        "difficulty": 2,
        "definition": "(conj.) Expressing a doubt or choice between alternatives."
    },
    {
        "word": "WHICH",
        "difficulty": 1,
        "definition": "(pron./det.) Asking for information specifying one or more people or things from a definite set."
    },
    {
        "word": "WHOLLY",
        "difficulty": 4,
        "definition": "(adv.) Entirely; fully."
    },
    {
        "word": "WITHDRAWAL",
        "difficulty": 4,
        "definition": "(n.) The act of removing or pulling back something; also the physical effects of stopping use of an addictive substance."
    },
    {
        "word": "WITHHOLD",
        "difficulty": 4,
        "definition": "(v.) Refuse to give (something that is due to or is desired by another)."
    },
    {
        "word": "WOMAN",
        "difficulty": 1,
        "definition": "(n.) An adult human female."
    },
    {
        "word": "WOMEN",
        "difficulty": 1,
        "definition": "(n.) Adult female human beings."
    },
    {
        "word": "WORTHWHILE",
        "difficulty": 2,
        "definition": "(adj.) Sufficiently rewarding or beneficial to justify the time and effort required."
    },
    {
        "word": "WRITING",
        "difficulty": 1,
        "definition": "(n.) The activity or skill of marking coherent words on paper and composing text."
    },
    {
        "word": "YACHT",
        "difficulty": 4,
        "definition": "(n./v.) A medium-sized sailboat equipped for cruising or racing."
    },
    {
        "word": "YIELD",
        "difficulty": 2,
        "definition": "(v./n.) Produce or provide (a natural, agricultural, or industrial product)."
    },
    {
        "word": "YOUNG",
        "difficulty": 1,
        "definition": "(adj./n.) Having lived or existed for only a short time."
    },
    {
        "word": "ZUCCHINI",
        "difficulty": 4,
        "definition": "(n.) A green variety of smooth-skinned summer squash."
    }
];


const INKLING_WORDS = [
    {
        "word": "ABANDON",
        "definition": "(v.) Cease to support or look after.",
        "sentence": "He had to abandon the ship.",
        "hint": "Leave.",
        "difficulty": 5
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
    },
    {
        "word": "ABSENT",
        "difficulty": 4,
        "definition": "(adj.) Not present in a place.",
        "sentence": "He was absent from school.",
        "hint": "Missing."
    },
    {
        "word": "ACCOMMODATE",
        "definition": "(v.) Provide lodging or sufficient space for.",
        "sentence": "The hotel can accommodate 100 guests.",
        "hint": "Fit in.",
        "difficulty": 5
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
    },
    {
        "word": "ACCURATE",
        "difficulty": 5,
        "definition": "(adj.) Correct in all details; exact.",
        "sentence": "The report was accurate.",
        "hint": "Correct."
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
    },
    {
        "word": "ACTIVE",
        "difficulty": 4,
        "definition": "(adj.) Engaging in physical activity.",
        "sentence": "She led an active life.",
        "hint": "Busy."
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
    },
    {
        "word": "ADAPT",
        "difficulty": 5,
        "definition": "(v.) Become adjusted to new conditions.",
        "sentence": "Animals adapt to their environment.",
        "hint": "Change."
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
    },
    {
        "word": "ADEQUATE",
        "difficulty": 5,
        "definition": "(adj.) Satisfactory or acceptable in quality.",
        "sentence": "The food was adequate.",
        "hint": "Enough."
    },
    {
        "word": "ADHERE",
        "difficulty": 5,
        "definition": "(v.) Stick fast to a surface.",
        "sentence": "The paint will adhere to the wall.",
        "hint": "Stick."
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
    },
    {
        "word": "ADULT",
        "difficulty": 1,
        "definition": "(n./adj.) A person who is fully grown; mature.",
        "sentence": "She is an adult now.",
        "hint": "Grown-up."
    },
    {
        "word": "ADVENTURE",
        "difficulty": 4,
        "definition": "(n.) An unusual and exciting experience.",
        "sentence": "They went on an adventure.",
        "hint": "Quest."
    },
    {
        "word": "ADVERSITY",
        "difficulty": 5,
        "definition": "(n.) Hardship; misfortune.",
        "sentence": "They overcame great adversity.",
        "hint": "Hardship."
    },
    {
        "word": "ADVICE",
        "difficulty": 4,
        "definition": "(n.) Guidance offered with regard to future action.",
        "sentence": "She gave him some advice.",
        "hint": "Counsel."
    },
    {
        "word": "ADVOCATE",
        "difficulty": 5,
        "definition": "(v./n.) Publicly support or recommend; a supporter.",
        "sentence": "He is an advocate for human rights.",
        "hint": "Supporter."
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
    },
    {
        "word": "AFFORD",
        "difficulty": 4,
        "definition": "(v.) Have enough money to pay for.",
        "sentence": "He couldn't afford the car.",
        "hint": "Pay for."
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
    },
    {
        "word": "ALARM",
        "difficulty": 4,
        "definition": "(n./v.) An anxious awareness of danger; to warn.",
        "sentence": "The alarm went off.",
        "hint": "Warning."
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
    },
    {
        "word": "ALMOST",
        "difficulty": 1,
        "definition": "(adv.) Not quite; very nearly.",
        "sentence": "He almost fell.",
        "hint": "Nearly."
    },
    {
        "word": "ALONE",
        "difficulty": 1,
        "definition": "(adj./adv.) Having no one else present.",
        "sentence": "She was all alone.",
        "hint": "Solely."
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
    },
    {
        "word": "ALWAYS",
        "difficulty": 1,
        "definition": "(adv.) At all times; on all occasions.",
        "sentence": "He is always late.",
        "hint": "Ever."
    },
    {
        "word": "AMAZING",
        "difficulty": 4,
        "definition": "(adj.) Causing great surprise or wonder.",
        "sentence": "The view was amazing.",
        "hint": "Stunning."
    },
    {
        "word": "AMBIGUOUS",
        "difficulty": 5,
        "definition": "(adj.) Open to more than one interpretation.",
        "sentence": "The message was ambiguous.",
        "hint": "Unclear."
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
    },
    {
        "word": "AMOUNT",
        "difficulty": 4,
        "definition": "(n./v.) A quantity of something; to total up.",
        "sentence": "A large amount of money.",
        "hint": "Quantity."
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
    },
    {
        "word": "ANGRY",
        "difficulty": 1,
        "definition": "(adj.) Feeling strong annoyance.",
        "sentence": "He was very angry.",
        "hint": "Mad."
    },
    {
        "word": "ANIMAL",
        "difficulty": 1,
        "definition": "(n.) A living organism that feeds on organic matter.",
        "sentence": "The dog is an animal.",
        "hint": "Creature."
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
    },
    {
        "word": "ANSWER",
        "difficulty": 1,
        "definition": "(n./v.) A thing said or written in reaction to a question; to reply.",
        "sentence": "She gave an answer.",
        "hint": "Reply."
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
    },
    {
        "word": "ANYTHING",
        "difficulty": 1,
        "definition": "(pron.) Used to refer to a thing of any kind.",
        "sentence": "He didn't say anything.",
        "hint": "Whatever."
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
    },
    {
        "word": "APPLE",
        "difficulty": 1,
        "definition": "(n.) A round fruit with red or green skin.",
        "sentence": "He ate an apple.",
        "hint": "Fruit."
    },
    {
        "word": "APPROPRIATE",
        "difficulty": 5,
        "definition": "(adj./v.) Suitable or proper; take for one's own use.",
        "sentence": "His behavior was appropriate.",
        "hint": "Suitable."
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
    },
    {
        "word": "AREA",
        "difficulty": 1,
        "definition": "(n.) A region or part of a town/country.",
        "sentence": "The area was beautiful.",
        "hint": "Region."
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
    },
    {
        "word": "AROUND",
        "difficulty": 1,
        "definition": "(prep./adv.) On every side of; surrounding.",
        "sentence": "He looked around.",
        "hint": "Nearby."
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
    },
    {
        "word": "ARTIST",
        "difficulty": 4,
        "definition": "(n.) A person who creates paintings or drawings.",
        "sentence": "She is a talented artist.",
        "hint": "Painter."
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
    },
    {
        "word": "ASLEEP",
        "difficulty": 1,
        "definition": "(adj.) In a state of rest where the mind is unconscious.",
        "sentence": "The baby is asleep.",
        "hint": "Sleeping."
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
    },
    {
        "word": "AUGUST",
        "difficulty": 1,
        "definition": "(n.) The eighth month of the year.",
        "sentence": "He was born in August.",
        "hint": "Month."
    },
    {
        "word": "AUTHOR",
        "difficulty": 4,
        "definition": "(n.) A writer of a book or report.",
        "sentence": "He is a famous author.",
        "hint": "Writer."
    },
    {
        "word": "AUTUMN",
        "difficulty": 4,
        "definition": "(n.) The season between summer and winter.",
        "sentence": "The leaves fall in autumn.",
        "hint": "Fall."
    },
    {
        "word": "AVENUE",
        "difficulty": 4,
        "definition": "(n.) A broad road in a town or city.",
        "sentence": "The avenue was lined with trees.",
        "hint": "Street."
    },
    {
        "word": "AWAKE",
        "difficulty": 1,
        "definition": "(adj./v.) Not asleep; to stop sleeping.",
        "sentence": "He was wide awake.",
        "hint": "Conscious."
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
    },
    {
        "word": "BACK",
        "difficulty": 1,
        "definition": "(n./adj./adv./v.) The rear surface of the body; rear; return; to support.",
        "sentence": "He turned his back.",
        "hint": "Rear."
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
    },
    {
        "word": "BADGE",
        "difficulty": 4,
        "definition": "(n.) A small piece of metal or plastic worn to show membership.",
        "sentence": "He wore a badge.",
        "hint": "Token."
    },
    {
        "word": "BAKERY",
        "difficulty": 4,
        "definition": "(n.) A place where bread and cakes are made.",
        "sentence": "She went to the bakery.",
        "hint": "Bread shop."
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
    },
    {
        "word": "BALLOON",
        "difficulty": 4,
        "definition": "(n.) A small colored rubber bag inflated with air.",
        "sentence": "The boy held a balloon.",
        "hint": "Inflatable."
    },
    {
        "word": "BANANA",
        "difficulty": 1,
        "definition": "(n.) A long curved fruit with a yellow skin.",
        "sentence": "He ate a banana.",
        "hint": "Fruit."
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
    },
    {
        "word": "BASKET",
        "difficulty": 1,
        "definition": "(n.) A container used for carrying things.",
        "sentence": "She put the fruit in a basket.",
        "hint": "Carrier."
    },
    {
        "word": "BEACH",
        "difficulty": 1,
        "definition": "(n.) A pebbly or sandy shore by the ocean.",
        "sentence": "They went to the beach.",
        "hint": "Shore."
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
    },
    {
        "word": "BEAUTY",
        "difficulty": 4,
        "definition": "(n.) A combination of qualities that pleases the senses.",
        "sentence": "Nature has great beauty.",
        "hint": "Grace."
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
    },
    {
        "word": "BEGIN",
        "difficulty": 1,
        "definition": "(v.) Start; perform the first part of an action.",
        "sentence": "The show will begin.",
        "hint": "Start."
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
    },
    {
        "word": "BELIEVE",
        "difficulty": 4,
        "definition": "(v.) Accept that something is true.",
        "sentence": "I believe you.",
        "hint": "Trust."
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
    },
    {
        "word": "BENEFICIAL",
        "difficulty": 5,
        "definition": "(adj.) Favorable or advantageous.",
        "sentence": "Exercise is beneficial.",
        "hint": "Good."
    },
    {
        "word": "BENEVOLENT",
        "difficulty": 5,
        "definition": "(adj.) Well meaning and kindly.",
        "sentence": "A benevolent ruler.",
        "hint": "Kind."
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
    },
    {
        "word": "BETWEEN",
        "difficulty": 1,
        "definition": "(prep.) In the middle of two things.",
        "sentence": "He sat between them.",
        "hint": "Middle."
    },
    {
        "word": "BEYOND",
        "difficulty": 4,
        "definition": "(prep./adv.) At or to the further side of.",
        "sentence": "The forest is beyond the hill.",
        "hint": "Further."
    },
    {
        "word": "BICYCLE",
        "difficulty": 4,
        "definition": "(n.) A vehicle with two wheels.",
        "sentence": "He rode his bicycle.",
        "hint": "Bike."
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
    },
    {
        "word": "BILLION",
        "difficulty": 4,
        "definition": "(num.) The number equivalent to a thousand million.",
        "sentence": "A billion stars.",
        "hint": "Number."
    },
    {
        "word": "BINOCULARS",
        "difficulty": 5,
        "definition": "(n.) An optical instrument with a lens for each eye.",
        "sentence": "He used binoculars.",
        "hint": "Glasses."
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
    },
    {
        "word": "BIRTHDAY",
        "difficulty": 1,
        "definition": "(n.) The anniversary of the day on which a person was born.",
        "sentence": "It's my birthday.",
        "hint": "Anniversary."
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
    },
    {
        "word": "BLANKET",
        "difficulty": 1,
        "definition": "(n./v.) A piece of cloth used as a covering; to cover.",
        "sentence": "She needed a blanket.",
        "hint": "Cover."
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
    },
    {
        "word": "BLOSSOM",
        "difficulty": 4,
        "definition": "(n./v.) A flower or mass of flowers; to produce flowers.",
        "sentence": "The trees are in blossom.",
        "hint": "Flower."
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
    },
    {
        "word": "BOTTLE",
        "difficulty": 1,
        "definition": "(n./v.) A narrow-necked container for liquids; to seal liquid inside a container.",
        "sentence": "He drank from a bottle.",
        "hint": "Container."
    },
    {
        "word": "BOTTOM",
        "difficulty": 1,
        "definition": "(n./adj.) The lowest point or part; lowest.",
        "sentence": "He reached the bottom.",
        "hint": "Base."
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
    },
    {
        "word": "BOUNCE",
        "difficulty": 4,
        "definition": "(v./n.) Move quickly up/back from a surface; a springy move.",
        "sentence": "The children love to bounce on the trampoline.",
        "hint": "Spring."
    },
    {
        "word": "BOUNDARY",
        "difficulty": 5,
        "definition": "(n.) A line that marks the limits of an area.",
        "sentence": "The river is a boundary.",
        "hint": "Limit."
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
    },
    {
        "word": "BRAVE",
        "difficulty": 1,
        "definition": "(adj./v./n.) Ready to face danger; to endure; a warrior.",
        "sentence": "He was very brave.",
        "hint": "Courageous."
    },
    {
        "word": "BREAD",
        "difficulty": 1,
        "definition": "(n.) Food made of flour, water, and yeast mixture.",
        "sentence": "He ate a piece of bread.",
        "hint": "Food."
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
    },
    {
        "word": "BREAKFAST",
        "difficulty": 1,
        "definition": "(n./v.) The first meal eaten after waking up; to eat a morning meal.",
        "sentence": "He had breakfast.",
        "hint": "Morning meal."
    },
    {
        "word": "BRIDGE",
        "difficulty": 1,
        "definition": "(n./v.) A structure crossing an obstacle; to connect.",
        "sentence": "They crossed the bridge.",
        "hint": "Span."
    },
    {
        "word": "BRIGHT",
        "difficulty": 1,
        "definition": "(adj.) Giving out or reflecting a lot of light.",
        "sentence": "The sun is bright.",
        "hint": "Shining."
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
    },
    {
        "word": "BROTHER",
        "difficulty": 1,
        "definition": "(n.) A man or boy in relation to other children of his parents.",
        "sentence": "He is my brother.",
        "hint": "Sibling."
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
    },
    {
        "word": "BUDGET",
        "difficulty": 5,
        "definition": "(n./v./adj.) An estimate of income; to plan spending; inexpensive.",
        "sentence": "He planned his budget.",
        "hint": "Finance."
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
    },
    {
        "word": "BURDEN",
        "difficulty": 5,
        "definition": "(n./v.) A heavy load; to weigh down.",
        "sentence": "The burden was heavy.",
        "hint": "Load."
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
    },
    {
        "word": "BUSINESS",
        "difficulty": 4,
        "definition": "(n.) The practice of engaging in commerce.",
        "sentence": "He owns a business.",
        "hint": "Company."
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
    },
    {
        "word": "BUTTERFLY",
        "difficulty": 4,
        "definition": "(n.) An insect with broad colorful wings.",
        "sentence": "A butterfly flew by.",
        "hint": "Insect."
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
    },
    {
        "word": "CABINET",
        "difficulty": 4,
        "definition": "(n.) A cupboard with shelves; a committee of advisors.",
        "sentence": "The file is in the cabinet.",
        "hint": "Cupboard."
    },
    {
        "word": "CABLE",
        "difficulty": 4,
        "definition": "(n./v.) A thick rope or wire; to send a message.",
        "sentence": "The cable snapped.",
        "hint": "Wire."
    },
    {
        "word": "CALCULATE",
        "difficulty": 5,
        "definition": "(v.) Determine mathematically.",
        "sentence": "Calculate the total cost.",
        "hint": "Compute."
    },
    {
        "word": "CALENDAR",
        "difficulty": 5,
        "definition": "(n.) A chart showing the days/months.",
        "sentence": "Check the calendar.",
        "hint": "Schedule."
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
    },
    {
        "word": "CAMERA",
        "difficulty": 1,
        "definition": "(n.) A device for recording images.",
        "sentence": "Smile for the camera.",
        "hint": "Recorder."
    },
    {
        "word": "CAMPUS",
        "difficulty": 5,
        "definition": "(n.) The grounds of a university.",
        "sentence": "The campus is large.",
        "hint": "Grounds."
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
    },
    {
        "word": "CANDIDATE",
        "difficulty": 5,
        "definition": "(n.) A person who applies for a job or election.",
        "sentence": "She is a strong candidate.",
        "hint": "Applicant."
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
    },
    {
        "word": "CANYON",
        "difficulty": 4,
        "definition": "(n.) A deep gorge.",
        "sentence": "The Grand Canyon is deep.",
        "hint": "Gorge."
    },
    {
        "word": "CAPACITY",
        "difficulty": 5,
        "definition": "(n.) Maximum amount a thing can contain.",
        "sentence": "The hall was at capacity.",
        "hint": "Limit."
    },
    {
        "word": "CAPITAL",
        "difficulty": 4,
        "definition": "(n./adj.) Main city; wealth; uppercase letter; excellent.",
        "sentence": "Paris is the capital of France.",
        "hint": "Main city."
    },
    {
        "word": "CAPTAIN",
        "difficulty": 4,
        "definition": "(n./v.) Person in command of a ship; to lead.",
        "sentence": "The captain spoke.",
        "hint": "Leader."
    },
    {
        "word": "CAPTIVE",
        "difficulty": 5,
        "definition": "(n./adj.) A prisoner; held prisoner.",
        "sentence": "They held him captive.",
        "hint": "Prisoner."
    },
    {
        "word": "CAPTURE",
        "difficulty": 4,
        "definition": "(v./n.) Take into possession; the act of seizing.",
        "sentence": "Capture the flag.",
        "hint": "Seize."
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
    },
    {
        "word": "CARBON",
        "difficulty": 5,
        "definition": "(n.) The chemical element of atomic number 6.",
        "sentence": "Diamond is pure carbon.",
        "hint": "Element."
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
    },
    {
        "word": "CAREER",
        "difficulty": 4,
        "definition": "(n./v.) An occupation; to move swiftly.",
        "sentence": "A teaching career.",
        "hint": "Job path."
    },
    {
        "word": "CAREFUL",
        "difficulty": 1,
        "definition": "(adj.) Making sure of avoiding danger.",
        "sentence": "Be careful!",
        "hint": "Wary."
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
    },
    {
        "word": "CARNIVAL",
        "difficulty": 5,
        "definition": "(n.) A period of public revelry.",
        "sentence": "They went to the carnival.",
        "hint": "Festival."
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
    },
    {
        "word": "CARTOON",
        "difficulty": 1,
        "definition": "(n./v.) An animated film; a drawing; to draw a caricature.",
        "sentence": "Watch a cartoon.",
        "hint": "Animation."
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
    },
    {
        "word": "CATALOG",
        "difficulty": 5,
        "definition": "(n./v.) A list of items; to record in a list.",
        "sentence": "Check the catalog.",
        "hint": "List."
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
    },
    {
        "word": "CATEGORY",
        "difficulty": 5,
        "definition": "(n.) A class or division of people/things.",
        "sentence": "What category is this?",
        "hint": "Class."
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
    },
    {
        "word": "CAUTION",
        "difficulty": 5,
        "definition": "(n./v.) Care taken to avoid danger; to warn.",
        "sentence": "Proceed with caution.",
        "hint": "Care."
    },
    {
        "word": "CEILING",
        "difficulty": 4,
        "definition": "(n.) The upper interior surface of a room.",
        "sentence": "Look at the ceiling.",
        "hint": "Top."
    },
    {
        "word": "CELEBRATE",
        "difficulty": 4,
        "definition": "(v.) Acknowledge a significant day.",
        "sentence": "Celebrate the victory.",
        "hint": "Honor."
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
    },
    {
        "word": "CENTURY",
        "difficulty": 4,
        "definition": "(n.) A period of one hundred years.",
        "sentence": "The 21st century.",
        "hint": "100 years."
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
    },
    {
        "word": "CHAMBER",
        "difficulty": 5,
        "definition": "(n.) A large room used for formal events.",
        "sentence": "The council chamber.",
        "hint": "Room."
    },
    {
        "word": "CHAMPION",
        "difficulty": 4,
        "definition": "(n./v.) A person who has defeated all rivals; to support a cause.",
        "sentence": "He is a champion.",
        "hint": "Winner."
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
    },
    {
        "word": "CHANNEL",
        "difficulty": 4,
        "definition": "(n./v.) A length of water joining two seas; to direct.",
        "sentence": "The English Channel.",
        "hint": "Waterway."
    },
    {
        "word": "CHAPTER",
        "difficulty": 4,
        "definition": "(n.) A main division of a book.",
        "sentence": "Read the first chapter.",
        "hint": "Section."
    },
    {
        "word": "CHARACTER",
        "difficulty": 4,
        "definition": "(n.) The mental qualities moral qualities.",
        "sentence": "He has strong character.",
        "hint": "Nature."
    },
    {
        "word": "CHARITY",
        "difficulty": 5,
        "definition": "(n.) An organization set up to help those in need.",
        "sentence": "She gave to charity.",
        "hint": "Help group."
    },
    {
        "word": "CHARLIE",
        "difficulty": 1,
        "definition": "(n.) A code word for the letter C.",
        "sentence": "Alpha, Bravo, Charlie.",
        "hint": "Name/Code."
    },
    {
        "word": "CHARMING",
        "difficulty": 4,
        "definition": "(adj.) Pleasant or attractive.",
        "sentence": "What a charming house.",
        "hint": "Pleasant."
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
    },
    {
        "word": "CHARTER",
        "difficulty": 5,
        "definition": "(n./v.) A written grant by a country's power; to hire.",
        "sentence": "The royal charter.",
        "hint": "Grant."
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
    },
    {
        "word": "CHIMNEY",
        "difficulty": 4,
        "definition": "(n.) A vertical pipe which conducts smoke from a fire.",
        "sentence": "Smoke rose from the chimney.",
        "hint": "Smoke stack."
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
    },
    {
        "word": "CHRONICLE",
        "difficulty": 5,
        "definition": "(n./v.) A factual written account of historical events; to record.",
        "sentence": "The book is a chronicle of the war.",
        "hint": "History."
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
    },
    {
        "word": "CHURCH",
        "difficulty": 1,
        "definition": "(n.) A building used for Christian worship.",
        "sentence": "They went to church.",
        "hint": "Chapel."
    },
    {
        "word": "CINEMA",
        "difficulty": 4,
        "definition": "(n.) A movie theater.",
        "sentence": "Let's go to the cinema.",
        "hint": "Theater."
    },
    {
        "word": "CIRCLE",
        "difficulty": 1,
        "definition": "(n./v.) A perfectly round flat shape; to move in a curved path around something.",
        "sentence": "Draw a circle.",
        "hint": "Ring."
    },
    {
        "word": "CIRCUIT",
        "difficulty": 5,
        "definition": "(n.) A path for an electrical current.",
        "sentence": "Complete the circuit.",
        "hint": "Path."
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
    },
    {
        "word": "CITIZEN",
        "difficulty": 4,
        "definition": "(n.) A legally recognized subject of a state.",
        "sentence": "He is a British citizen.",
        "hint": "Subject."
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
    },
    {
        "word": "CLASSIC",
        "difficulty": 4,
        "definition": "(adj./n.) Judged over a period of time to be of quality; a work of art.",
        "sentence": "A classic novel.",
        "hint": "Standard."
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
    },
    {
        "word": "CLIMATE",
        "difficulty": 4,
        "definition": "(n.) The weather conditions prevailing in an area.",
        "sentence": "The climate is changing.",
        "hint": "Weather pattern."
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
    },
    {
        "word": "CLOSET",
        "difficulty": 1,
        "definition": "(n.) A tall cupboard or wardrobe.",
        "sentence": "Hang it in the closet.",
        "hint": "Cupboard."
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
    },
    {
        "word": "COHERENT",
        "difficulty": 5,
        "definition": "(adj.) Logical and consistent.",
        "sentence": "He gave a coherent argument.",
        "hint": "Logical."
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
    },
    {
        "word": "COLLECT",
        "difficulty": 4,
        "definition": "(v.) Bring or gather together.",
        "sentence": "Collect your things.",
        "hint": "Gather."
    },
    {
        "word": "COLLEGE",
        "difficulty": 4,
        "definition": "(n.) An educational institution.",
        "sentence": "He is going to college.",
        "hint": "School."
    },
    {
        "word": "COLONY",
        "difficulty": 5,
        "definition": "(n.) A country or area under the control of another.",
        "sentence": "The British colony.",
        "hint": "Settlement."
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
    },
    {
        "word": "COLORFUL",
        "difficulty": 4,
        "definition": "(adj.) Having many bright or varied hues; vivid and striking in appearance.",
        "sentence": "A colorful painting.",
        "hint": "Vibrant."
    },
    {
        "word": "COLUMN",
        "difficulty": 4,
        "definition": "(n.) An upright pillar supporting a structure.",
        "sentence": "A marble column.",
        "hint": "Pillar."
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
    },
    {
        "word": "COMEDY",
        "difficulty": 4,
        "definition": "(n.) A movie or play intended to make people laugh.",
        "sentence": "A great comedy.",
        "hint": "Humor."
    },
    {
        "word": "COMFORT",
        "difficulty": 4,
        "definition": "(n./v.) A state of physical ease; to console.",
        "sentence": "He lived in comfort.",
        "hint": "Ease."
    },
    {
        "word": "COMMAND",
        "difficulty": 4,
        "definition": "(v./n.) Give an authoritative order; an order.",
        "sentence": "The officer gave a command.",
        "hint": "Order."
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
    },
    {
        "word": "COMMENT",
        "difficulty": 4,
        "definition": "(n./v.) A verbal or written remark; to remark.",
        "sentence": "He made a comment.",
        "hint": "Remark."
    },
    {
        "word": "COMMERCE",
        "difficulty": 5,
        "definition": "(n.) The activity of buying and selling.",
        "sentence": "Chamber of commerce.",
        "hint": "Trade."
    },
    {
        "word": "COMMON",
        "difficulty": 1,
        "definition": "(adj.) Occurring, found, or done often.",
        "sentence": "A common mistake.",
        "hint": "Usual."
    },
    {
        "word": "COMMUNITY",
        "difficulty": 4,
        "definition": "(n.) A group of people living together.",
        "sentence": "A local community.",
        "hint": "Society."
    },
    {
        "word": "COMPACT",
        "difficulty": 5,
        "definition": "(adj./n./v.) Closely packed together; a small case; to compress.",
        "sentence": "A compact car.",
        "hint": "Dense."
    },
    {
        "word": "COMPANION",
        "difficulty": 5,
        "definition": "(n.) A person whom one spends a lot of time with.",
        "sentence": "A faithful companion.",
        "hint": "Friend."
    },
    {
        "word": "COMPANY",
        "difficulty": 4,
        "definition": "(n.) A commercial business.",
        "sentence": "He started a company.",
        "hint": "Firm."
    },
    {
        "word": "COMPARE",
        "difficulty": 4,
        "definition": "(v.) Estimate or measure the similarity between.",
        "sentence": "Compare the two books.",
        "hint": "Contrast."
    },
    {
        "word": "COMPASSION",
        "difficulty": 5,
        "definition": "(n.) Sympathetic pity and concern.",
        "sentence": "She showed great compassion for others.",
        "hint": "Pity."
    },
    {
        "word": "COMPETE",
        "difficulty": 5,
        "definition": "(v.) Strive to gain or win something.",
        "sentence": "They compete for the prize.",
        "hint": "Vie."
    },
    {
        "word": "COMPLAIN",
        "difficulty": 4,
        "definition": "(v.) Express dissatisfaction or annoyance.",
        "sentence": "Don't complain.",
        "hint": "Grumble."
    },
    {
        "word": "COMPLEMENT",
        "difficulty": 5,
        "definition": "(n./v.) Something that pairs perfectly with another to make a whole; to go well together with something else.",
        "sentence": "The wine was a perfect complement.",
        "hint": "Addition."
    },
    {
        "word": "COMPLETE",
        "difficulty": 4,
        "definition": "(adj./v.) Having all the necessary or appropriate parts; to finish.",
        "sentence": "The set is complete.",
        "hint": "Full."
    },
    {
        "word": "COMPLEX",
        "difficulty": 5,
        "definition": "(adj./n.) Consisting of many different parts; a group of buildings.",
        "sentence": "It's a complex problem.",
        "hint": "Complicated."
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
    },
    {
        "word": "COMPOUND",
        "difficulty": 5,
        "definition": "(n./v./adj.) A substance formed from two or more elements chemically joined; to worsen or intensify a problem.",
        "sentence": "A chemical compound.",
        "hint": "Mixture."
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
    },
    {
        "word": "COMPUTER",
        "difficulty": 1,
        "definition": "(n.) An electronic device for storing data.",
        "sentence": "Use the computer.",
        "hint": "PC."
    },
    {
        "word": "CONCENTRATE",
        "difficulty": 5,
        "definition": "(v.) Focus all one's attention on.",
        "sentence": "Concentrate on the task.",
        "hint": "Focus."
    },
    {
        "word": "CONCEPT",
        "difficulty": 5,
        "definition": "(n.) An abstract idea; a general notion.",
        "sentence": "A new concept.",
        "hint": "Idea."
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
    },
    {
        "word": "CONCERT",
        "difficulty": 4,
        "definition": "(n./v.) A musical performance; to arrange.",
        "sentence": "They went to a concert.",
        "hint": "Show."
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
    },
    {
        "word": "CONCISE",
        "difficulty": 5,
        "definition": "(adj.) Giving information clearly in few words.",
        "sentence": "A concise summary.",
        "hint": "Brief."
    },
    {
        "word": "CONCLUDE",
        "difficulty": 5,
        "definition": "(v.) Bring to an end.",
        "sentence": "Conclude the meeting.",
        "hint": "End."
    },
    {
        "word": "CONCRETE",
        "difficulty": 5,
        "definition": "(adj./n.) Existing in a physical form; a building material.",
        "sentence": "Concrete evidence.",
        "hint": "Physical."
    },
    {
        "word": "CONCUR",
        "difficulty": 5,
        "definition": "(v.) Be of the same opinion; agree.",
        "sentence": "I concur with your opinion.",
        "hint": "Agree."
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
    },
    {
        "word": "CONDITION",
        "difficulty": 4,
        "definition": "(n./v.) The state or quality of something at a given time; to train or prepare for a specific purpose.",
        "sentence": "Good condition.",
        "hint": "State."
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
    },
    {
        "word": "CONFIDENCE",
        "difficulty": 4,
        "definition": "(n.) A feeling of self-assurance.",
        "sentence": "He has confidence.",
        "hint": "Assurance."
    },
    {
        "word": "CONFIRM",
        "difficulty": 4,
        "definition": "(v.) Establish the truth or correctness of.",
        "sentence": "Confirm your order.",
        "hint": "Verify."
    },
    {
        "word": "CONFLICT",
        "difficulty": 4,
        "definition": "(n./v.) A serious disagreement or argument; to clash.",
        "sentence": "A long conflict.",
        "hint": "Fight."
    },
    {
        "word": "CONFUSE",
        "difficulty": 4,
        "definition": "(v.) Make bewildered or perplexed.",
        "sentence": "Don't confuse me.",
        "hint": "Baffle."
    },
    {
        "word": "CONGRESS",
        "difficulty": 4,
        "definition": "(n.) A national legislative body.",
        "sentence": "The US Congress.",
        "hint": "Legislature."
    },
    {
        "word": "CONNECT",
        "difficulty": 4,
        "definition": "(v.) Bring together or into contact.",
        "sentence": "Connect the dots.",
        "hint": "Join."
    },
    {
        "word": "CONQUER",
        "difficulty": 5,
        "definition": "(v.) Overcome and take control of.",
        "sentence": "Conquer the mountain.",
        "hint": "Defeat."
    },
    {
        "word": "CONSCIOUS",
        "difficulty": 5,
        "definition": "(adj.) Aware of and responding to surroundings.",
        "sentence": "He was conscious.",
        "hint": "Aware."
    },
    {
        "word": "CONSENT",
        "difficulty": 5,
        "definition": "(v./n.) Permission for something to happen; to agree.",
        "sentence": "He gave his consent.",
        "hint": "Agreement."
    },
    {
        "word": "CONSEQUENT",
        "difficulty": 5,
        "definition": "(adj.) Following as a result or effect.",
        "sentence": "Consequent loss.",
        "hint": "Resulting."
    },
    {
        "word": "CONSERVE",
        "difficulty": 5,
        "definition": "(v.) Protect from harm or destruction.",
        "sentence": "Conserve water.",
        "hint": "Save."
    },
    {
        "word": "CONSIDER",
        "difficulty": 4,
        "definition": "(v.) Think carefully about something.",
        "sentence": "Consider the facts.",
        "hint": "Think."
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
    },
    {
        "word": "CONSOLE",
        "difficulty": 5,
        "definition": "(v./n.) Comfort someone at a time of grief; a control panel.",
        "sentence": "To console a friend.",
        "hint": "Comfort."
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
    },
    {
        "word": "CONSPICUOUS",
        "difficulty": 5,
        "definition": "(adj.) Standing out so as to be clearly visible.",
        "sentence": "A conspicuous sign.",
        "hint": "Obvious."
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
    },
    {
        "word": "CONSTANT",
        "difficulty": 4,
        "definition": "(adj.) Occurring continuously over time.",
        "sentence": "The noise was constant.",
        "hint": "Steady."
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
    },
    {
        "word": "CONSTRUCT",
        "difficulty": 5,
        "definition": "(v./n.) Build or erect something; an idea or theory.",
        "sentence": "Construct a tower.",
        "hint": "Build."
    },
    {
        "word": "CONSULT",
        "difficulty": 5,
        "definition": "(v.) Seek information or advice from.",
        "sentence": "Consult a lawyer.",
        "hint": "Ask."
    },
    {
        "word": "CONSUME",
        "difficulty": 5,
        "definition": "(v.) Eat, drink, or ingest.",
        "sentence": "They consume a lot of energy.",
        "hint": "Use up."
    },
    {
        "word": "CONTACT",
        "difficulty": 4,
        "definition": "(n./v.) Physical touching; to communicate with.",
        "sentence": "Keep in contact.",
        "hint": "Touch."
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
    },
    {
        "word": "CONTEST",
        "difficulty": 4,
        "definition": "(n./v.) An event in which people compete; to dispute.",
        "sentence": "He won the contest.",
        "hint": "Competition."
    },
    {
        "word": "CONTEXT",
        "difficulty": 5,
        "definition": "(n.) Circumstances forming a setting.",
        "sentence": "He took my words out of context.",
        "hint": "Setting."
    },
    {
        "word": "CONTINUE",
        "difficulty": 4,
        "definition": "(v.) Persist in an activity or process.",
        "sentence": "Please continue.",
        "hint": "Keep going."
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
    },
    {
        "word": "CONTRACT",
        "difficulty": 5,
        "definition": "(n./v.) A written or spoken agreement; to decrease in size.",
        "sentence": "Sign the contract.",
        "hint": "Agreement."
    },
    {
        "word": "CONTRADICT",
        "difficulty": 5,
        "definition": "(v.) Deny the truth of a statement.",
        "sentence": "The reports contradict each other.",
        "hint": "Deny."
    },
    {
        "word": "CONTRAST",
        "difficulty": 5,
        "definition": "(n./v.) State of being strikingly different; to compare.",
        "sentence": "The contrast is sharp.",
        "hint": "Difference."
    },
    {
        "word": "CONTRIBUTE",
        "difficulty": 5,
        "definition": "(v.) Give something in order to achieve.",
        "sentence": "Contribute some money.",
        "hint": "Giving."
    },
    {
        "word": "CONTROL",
        "difficulty": 4,
        "definition": "(v./n.) Power to influence or direct; a means of directing.",
        "sentence": "He lost control.",
        "hint": "Direct."
    },
    {
        "word": "CONTROVERSY",
        "difficulty": 5,
        "definition": "(n.) Disagreement, typically prolonged.",
        "sentence": "The plan caused a lot of controversy.",
        "hint": "Dispute."
    },
    {
        "word": "CONVERSE",
        "difficulty": 5,
        "definition": "(v./n.) Talk with someone in an exchange of words; the reverse or opposite of something.",
        "sentence": "Converse with him.",
        "hint": "Talk."
    },
    {
        "word": "CONVERT",
        "difficulty": 5,
        "definition": "(v./n.) Cause to change in form/function; a person who has changed beliefs.",
        "sentence": "Convert the file.",
        "hint": "Change."
    },
    {
        "word": "CONVEY",
        "difficulty": 5,
        "definition": "(v.) Transport or carry to a place.",
        "sentence": "The trucks convey the goods.",
        "hint": "Carry."
    },
    {
        "word": "CONVINCE",
        "difficulty": 4,
        "definition": "(v.) Cause someone to believe firmly.",
        "sentence": "Convince the judge.",
        "hint": "Persuade."
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
    },
    {
        "word": "COOKERY",
        "difficulty": 5,
        "definition": "(n.) The practice or skill of preparing food.",
        "sentence": "A cookery book.",
        "hint": "Cooking."
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
    },
    {
        "word": "COORDINATE",
        "difficulty": 5,
        "definition": "(v./n.) Bring the different elements of a complex activity; a set of values.",
        "sentence": "Coordinate the event.",
        "hint": "Organize."
    },
    {
        "word": "COPPER",
        "difficulty": 4,
        "definition": "(n./adj.) A reddish-brown metallic element; having a reddish-brown hue.",
        "sentence": "Copper wire.",
        "hint": "Metal."
    },
    {
        "word": "COPPICE",
        "difficulty": 5,
        "definition": "(n./v.) An area of woodland in which trees are cut; to cut back.",
        "sentence": "The old coppice.",
        "hint": "Grove."
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
    },
    {
        "word": "COPYRIGHT",
        "difficulty": 5,
        "definition": "(n./v.) The legal right that protects creators from having their work copied without permission; to register that right.",
        "sentence": "The copyright is held.",
        "hint": "Legal right."
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
    },
    {
        "word": "CORNER",
        "difficulty": 1,
        "definition": "(n./v.) A place where two sides meet; to trap.",
        "sentence": "Turn the corner.",
        "hint": "Angle."
    },
    {
        "word": "CORPORATE",
        "difficulty": 5,
        "definition": "(adj.) Relating to a large company or group.",
        "sentence": "Corporate office.",
        "hint": "Company."
    },
    {
        "word": "CORRECT",
        "difficulty": 1,
        "definition": "(adj./v.) Free from error; to fix an error.",
        "sentence": "The answer is correct.",
        "hint": "Right."
    },
    {
        "word": "CORRESPOND",
        "difficulty": 5,
        "definition": "(v.) Have a close similarity; match or agree.",
        "sentence": "Marks correspond.",
        "hint": "Match."
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
    },
    {
        "word": "CORRUPT",
        "difficulty": 5,
        "definition": "(adj./v.) Willing to act dishonestly for personal gain; to cause someone or something to become dishonest or damaged.",
        "sentence": "A corrupt official.",
        "hint": "Dishonest."
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
    },
    {
        "word": "COSTUME",
        "difficulty": 4,
        "definition": "(n.) A set of clothes worn by an actor.",
        "sentence": "Halloween costume.",
        "hint": "Outfit."
    },
    {
        "word": "COTTAGE",
        "difficulty": 4,
        "definition": "(n.) A small house, typically one in the country.",
        "sentence": "A cozy cottage.",
        "hint": "Small house."
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
    },
    {
        "word": "COUNCIL",
        "difficulty": 5,
        "definition": "(n.) An advisory, deliberative, or legislative body.",
        "sentence": "The city council.",
        "hint": "Assembly."
    },
    {
        "word": "COUNSEL",
        "difficulty": 5,
        "definition": "(n./v.) Advice, especially that given formally; to advise.",
        "sentence": "Wise counsel.",
        "hint": "Advice."
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
    },
    {
        "word": "COUNTER",
        "difficulty": 4,
        "definition": "(n./v./adj.) A long flat-topped fixture in a shop; to oppose; opposite.",
        "sentence": "The kitchen counter.",
        "hint": "Table."
    },
    {
        "word": "COUNTRY",
        "difficulty": 1,
        "definition": "(n./adj.) A nation with its own government; rural.",
        "sentence": "He loves his country.",
        "hint": "Nation."
    },
    {
        "word": "COUPLE",
        "difficulty": 1,
        "definition": "(n./v.) Two people or things; to join.",
        "sentence": "A happy couple.",
        "hint": "Pair."
    },
    {
        "word": "COURAGE",
        "difficulty": 4,
        "definition": "(n.) The ability to do something that frightens one.",
        "sentence": "He showed great courage.",
        "hint": "Bravery."
    },
    {
        "word": "COURSE",
        "difficulty": 1,
        "definition": "(n./v.) The route or direction; to flow.",
        "sentence": "Take a course.",
        "hint": "Path."
    },
    {
        "word": "COURTESY",
        "difficulty": 5,
        "definition": "(n.) The showing of politeness in one's attitude.",
        "sentence": "With courtesy.",
        "hint": "Politeness."
    },
    {
        "word": "COUSIN",
        "difficulty": 1,
        "definition": "(n.) A child of one's aunt or uncle.",
        "sentence": "He is my cousin.",
        "hint": "Relative."
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
    },
    {
        "word": "CREATURE",
        "difficulty": 4,
        "definition": "(n.) An animal, as distinct from a human.",
        "sentence": "A strange creature.",
        "hint": "Being."
    },
    {
        "word": "CREDIT",
        "difficulty": 4,
        "definition": "(n./v.) The ability of a customer to obtain goods; to attribute.",
        "sentence": "Store credit.",
        "hint": "Reputation."
    },
    {
        "word": "CRICKET",
        "difficulty": 4,
        "definition": "(n.) An insect related to the grasshopper.",
        "sentence": "He heard a cricket.",
        "hint": "Insect."
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
    },
    {
        "word": "CRIMINAL",
        "difficulty": 5,
        "definition": "(n./adj.) A person who has committed a crime; relating to crime.",
        "sentence": "A criminal act.",
        "hint": "Outlaw."
    },
    {
        "word": "CRITERION",
        "difficulty": 5,
        "definition": "(n.) Standard by which something is judged.",
        "sentence": "The main criterion for a job.",
        "hint": "Standard."
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
    },
    {
        "word": "CRUCIAL",
        "difficulty": 5,
        "definition": "(adj.) Decisive or critical.",
        "sentence": "The role of the teacher is crucial.",
        "hint": "Essential."
    },
    {
        "word": "CRYSTAL",
        "difficulty": 4,
        "definition": "(n./adj.) A transparent mineral; clear.",
        "sentence": "The water was crystal clear.",
        "hint": "Mineral."
    },
    {
        "word": "CULTURE",
        "difficulty": 4,
        "definition": "(n./v.) The arts and industrial achievements; to grow cells.",
        "sentence": "A diverse culture.",
        "hint": "Tradition."
    },
    {
        "word": "CUMULATIVE",
        "difficulty": 5,
        "definition": "(adj.) Increasing by successive additions.",
        "sentence": "The cumulative effect of smoking.",
        "hint": "Total."
    },
    {
        "word": "CUPBOARD",
        "difficulty": 4,
        "definition": "(n.) A cabinet or small recess with a door.",
        "sentence": "The plates are in the cupboard.",
        "hint": "Cabinet."
    },
    {
        "word": "CURRENT",
        "difficulty": 4,
        "definition": "(adj./n.) Belonging to the present time; a flow of water/air/electricity.",
        "sentence": "The current situation.",
        "hint": "Present."
    },
    {
        "word": "CURTAIN",
        "difficulty": 4,
        "definition": "(n./v.) A hanging cloth used to block light or provide privacy over a window.",
        "sentence": "Close the curtain.",
        "hint": "Drape."
    },
    {
        "word": "CUSHION",
        "difficulty": 4,
        "definition": "(n./v.) A soft bag of cloth stuffed with firm material; to soften an impact.",
        "sentence": "Sit on the cushion.",
        "hint": "Pillow."
    },
    {
        "word": "CUSTOM",
        "difficulty": 4,
        "definition": "(n./adj.) A traditional practice; made to order.",
        "sentence": "An old custom.",
        "hint": "Tradition."
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
    },
    {
        "word": "CYLINDER",
        "difficulty": 5,
        "definition": "(n.) A solid geometric figure with straight parallel sides.",
        "sentence": "The tank is a cylinder.",
        "hint": "Tube."
    },
    {
        "word": "DAMAGE",
        "difficulty": 4,
        "definition": "(n./v.) Physical harm caused to something; to harm.",
        "sentence": "There was some damage.",
        "hint": "Harm."
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
    },
    {
        "word": "DANGER",
        "difficulty": 1,
        "definition": "(n.) The possibility of suffering harm.",
        "sentence": "The sign warned of danger.",
        "hint": "Risk."
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
    },
    {
        "word": "DAUGHTER",
        "difficulty": 1,
        "definition": "(n.) A girl or woman in relation to her parents.",
        "sentence": "She is my daughter.",
        "hint": "Child."
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
    },
    {
        "word": "DEBATE",
        "difficulty": 5,
        "definition": "(n./v.) A formal discussion on a topic; to argue formally.",
        "sentence": "The debate was lively.",
        "hint": "Discussion."
    },
    {
        "word": "DECADE",
        "difficulty": 5,
        "definition": "(n.) A period of ten years.",
        "sentence": "A decade ago.",
        "hint": "10 years."
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
    },
    {
        "word": "DECIMAL",
        "difficulty": 5,
        "definition": "(n./adj.) Relating to or denoting a system of numbers based on ten.",
        "sentence": "A decimal point.",
        "hint": "Fractional."
    },
    {
        "word": "DECLARE",
        "difficulty": 5,
        "definition": "(v.) Say something in a solemn and emphatic manner.",
        "sentence": "I declare war.",
        "hint": "State."
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
    },
    {
        "word": "DEFEND",
        "difficulty": 4,
        "definition": "(v.) Resist an attack made on something.",
        "sentence": "Defend your position.",
        "hint": "Protect."
    },
    {
        "word": "DEGREE",
        "difficulty": 4,
        "definition": "(n.) An amount, level, or extent; a unit of measurement.",
        "sentence": "A high degree of skill.",
        "hint": "Level."
    },
    {
        "word": "DELIBERATE",
        "difficulty": 5,
        "definition": "(adj./v.) Done consciously and intentionally; to think carefully.",
        "sentence": "A deliberate act.",
        "hint": "Intentional."
    },
    {
        "word": "DELIGHT",
        "difficulty": 4,
        "definition": "(n./v.) Great pleasure; to please greatly.",
        "sentence": "To her delight.",
        "hint": "Joy."
    },
    {
        "word": "DELIVER",
        "difficulty": 4,
        "definition": "(v.) Bring and hand over to a proper recipient.",
        "sentence": "Deliver the package.",
        "hint": "Bring."
    },
    {
        "word": "DEMAND",
        "difficulty": 4,
        "definition": "(n./v.) An insistent and peremptory request; to request insistently.",
        "sentence": "There is a high demand.",
        "hint": "Request."
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
    },
    {
        "word": "DEPOSIT",
        "difficulty": 5,
        "definition": "(n./v.) A sum of money kept in a bank account; to put down.",
        "sentence": "Make a deposit.",
        "hint": "Payment."
    },
    {
        "word": "DEPTH",
        "difficulty": 4,
        "definition": "(n.) The distance from the top or surface to the bottom.",
        "sentence": "Check the depth.",
        "hint": "Deepness."
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
    },
    {
        "word": "DESERT",
        "difficulty": 4,
        "definition": "(n./v.) An arid area of land; to abandon.",
        "sentence": "The Sahara Desert.",
        "hint": "Arid land."
    },
    {
        "word": "DESERVE",
        "difficulty": 5,
        "definition": "(v.) Be worthy of or entitled to.",
        "sentence": "You deserve a prize.",
        "hint": "Earn."
    },
    {
        "word": "DESIGN",
        "difficulty": 4,
        "definition": "(n./v.) A plan or drawing produced to show the look; to plan.",
        "sentence": "A new design.",
        "hint": "Plan."
    },
    {
        "word": "DESIRE",
        "difficulty": 5,
        "definition": "(n./v.) A strong feeling of wanting to have something; to want.",
        "sentence": "A desire for power.",
        "hint": "Want."
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
    },
    {
        "word": "DETECT",
        "difficulty": 5,
        "definition": "(v.) Discover or identify the presence or existence of.",
        "sentence": "Detect the error.",
        "hint": "Discover."
    },
    {
        "word": "DETERMINE",
        "difficulty": 5,
        "definition": "(v.) Cause something to occur in a particular way.",
        "sentence": "Determine the cause.",
        "hint": "Decide."
    },
    {
        "word": "DEVELOP",
        "difficulty": 4,
        "definition": "(v.) Grow or cause to grow and become more mature.",
        "sentence": "Develop a plan.",
        "hint": "Grow."
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
    },
    {
        "word": "DEVICE",
        "difficulty": 4,
        "definition": "(n.) A thing made or adapted for a particular purpose.",
        "sentence": "A mobile device.",
        "hint": "Gadget."
    },
    {
        "word": "DEVOTE",
        "difficulty": 5,
        "definition": "(v.) Give all or a large part of one's time.",
        "sentence": "Devote your time.",
        "hint": "Dedicate."
    },
    {
        "word": "DIAMOND",
        "difficulty": 4,
        "definition": "(n./adj.) A precious stone consisting of clear colorless crystalline carbon.",
        "sentence": "A diamond ring.",
        "hint": "Gemstone."
    },
    {
        "word": "DIARY",
        "difficulty": 4,
        "definition": "(n.) A book in which one keeps a daily record of events.",
        "sentence": "She wrote in her diary.",
        "hint": "Journal."
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
    },
    {
        "word": "DIGEST",
        "difficulty": 5,
        "definition": "(v./n.) Breakdown food in the stomach; a compilation of information.",
        "sentence": "Digest your food.",
        "hint": "Process."
    },
    {
        "word": "DIGITAL",
        "difficulty": 5,
        "definition": "(adj.) Using or expressed as numerical values, especially binary code; relating to electronic technology.",
        "sentence": "A digital clock.",
        "hint": "Electronic."
    },
    {
        "word": "DILIGENT",
        "difficulty": 5,
        "definition": "(adj.) Showing care and conscientiousness.",
        "sentence": "He was a diligent student.",
        "hint": "Hardworking."
    },
    {
        "word": "DINOSAUR",
        "difficulty": 4,
        "definition": "(n.) A fossil reptile of the Mesozoic era.",
        "sentence": "The dinosaur was huge.",
        "hint": "Ancient reptile."
    },
    {
        "word": "DIRECT",
        "difficulty": 4,
        "definition": "(adj./v./adv.) Extending or moving from one place to another; to manage.",
        "sentence": "A direct route.",
        "hint": "Straight."
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
    },
    {
        "word": "DISASTER",
        "difficulty": 5,
        "definition": "(n.) A sudden event that causes great damage.",
        "sentence": "A natural disaster.",
        "hint": "Catastrophe."
    },
    {
        "word": "DISCARD",
        "difficulty": 5,
        "definition": "(v./n.) Get rid of someone or something as no longer useful.",
        "sentence": "Discard the trash.",
        "hint": "Reject."
    },
    {
        "word": "DISCOVER",
        "difficulty": 4,
        "definition": "(v.) Find unexpectedly or during a search.",
        "sentence": "Discover the truth.",
        "hint": "Find."
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
    },
    {
        "word": "DISEASE",
        "difficulty": 4,
        "definition": "(n.) A disorder of structure or function in a human.",
        "sentence": "A rare disease.",
        "hint": "Illness."
    },
    {
        "word": "DISKette",
        "difficulty": 5,
        "definition": "(n.) A flexible removable magnetic disk.",
        "sentence": "Save it on a diskette.",
        "hint": "Floppy disk."
    },
    {
        "word": "DISMISS",
        "difficulty": 5,
        "definition": "(v.) Order or allow to leave; send away.",
        "sentence": "Dismiss the class.",
        "hint": "Reject."
    },
    {
        "word": "DISPLAY",
        "difficulty": 4,
        "definition": "(v./n.) Put something in a prominent place; an exhibition.",
        "sentence": "Display the flags.",
        "hint": "Show."
    },
    {
        "word": "DISTANCE",
        "difficulty": 4,
        "definition": "(n./v.) An amount of space between two things; to separate.",
        "sentence": "The distance is great.",
        "hint": "Space."
    },
    {
        "word": "DISTINCT",
        "difficulty": 5,
        "definition": "(adj.) Recognizably different in nature from something else.",
        "sentence": "A distinct smell.",
        "hint": "Clear."
    },
    {
        "word": "DISTRICT",
        "difficulty": 5,
        "definition": "(n.) An area of a country or city.",
        "sentence": "A shopping district.",
        "hint": "Area."
    },
    {
        "word": "DIVIDE",
        "difficulty": 4,
        "definition": "(v./n.) Separate or be separated into parts; a disagreement.",
        "sentence": "Divide the cake.",
        "hint": "Split."
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
    },
    {
        "word": "DOCTOR",
        "difficulty": 1,
        "definition": "(n./v.) A person who is qualified to treat people who are ill; to falsify.",
        "sentence": "See a doctor.",
        "hint": "Physician."
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
    },
    {
        "word": "DOLLAR",
        "difficulty": 1,
        "definition": "(n.) The basic monetary unit of the US.",
        "sentence": "It costs one dollar.",
        "hint": "Currency."
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
    },
    {
        "word": "DOLPHIN",
        "difficulty": 4,
        "definition": "(n.) A small gregarious toothed whale.",
        "sentence": "The dolphin jumped.",
        "hint": "Sea mammal."
    },
    {
        "word": "DOMESTIC",
        "difficulty": 5,
        "definition": "(adj./n.) Relating to the running of a home; a servant.",
        "sentence": "A domestic animal.",
        "hint": "Houshold."
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
    },
    {
        "word": "DRAGON",
        "difficulty": 4,
        "definition": "(n.) A mythical monster like a giant reptile.",
        "sentence": "The dragon breathed fire.",
        "hint": "Mythical beast."
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
    },
    {
        "word": "DREAM",
        "difficulty": 1,
        "definition": "(n./v.) A series of thoughts occurring in a person's sleep; to imagine.",
        "sentence": "I had a dream.",
        "hint": "Vision."
    },
    {
        "word": "DRESS",
        "difficulty": 1,
        "definition": "(n./v.) A one-piece garment for a woman; to clothe.",
        "sentence": "She wore a blue dress.",
        "hint": "Gown."
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
    },
    {
        "word": "DURING",
        "difficulty": 1,
        "definition": "(prep.) Throughout the course or duration of.",
        "sentence": "During the day.",
        "hint": "Throughout."
    },
    {
        "word": "DYNASTY",
        "difficulty": 5,
        "definition": "(n.) A line of hereditary rulers of a country.",
        "sentence": "The Ming dynasty.",
        "hint": "Lineage."
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
    },
    {
        "word": "EAGER",
        "difficulty": 4,
        "definition": "(adj.) Wanting to do or have something very much.",
        "sentence": "He was eager to learn.",
        "hint": "Keen."
    },
    {
        "word": "EARLY",
        "difficulty": 1,
        "definition": "(adj./adv.) Happening before the usual or expected time.",
        "sentence": "An early start.",
        "hint": "Soon."
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
    },
    {
        "word": "EARTH",
        "difficulty": 1,
        "definition": "(n./v.) The planet on which we live; to connect to ground.",
        "sentence": "The Earth is round.",
        "hint": "Planet."
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
    },
    {
        "word": "EASY",
        "difficulty": 1,
        "definition": "(adj./adv.) Achieved without great effort.",
        "sentence": "An easy task.",
        "hint": "Simple."
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
    },
    {
        "word": "ECHO",
        "difficulty": 4,
        "definition": "(n.) A repetition of a sound caused by reflection.",
        "sentence": "Hear the echo.",
        "hint": "Resonance."
    },
    {
        "word": "EDGE",
        "difficulty": 1,
        "definition": "(n./v.) The outside limit of an object; to move slowly.",
        "sentence": "Stand on the edge.",
        "hint": "Border."
    },
    {
        "word": "EDITOR",
        "difficulty": 5,
        "definition": "(n.) A person who is in charge of and determines the final content.",
        "sentence": "The newspaper editor.",
        "hint": "Reviewer."
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
    },
    {
        "word": "EFFORT",
        "difficulty": 4,
        "definition": "(n.) A vigorous or determined attempt.",
        "sentence": "It took a lot of effort.",
        "hint": "Try."
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
    },
    {
        "word": "EIGHT",
        "difficulty": 1,
        "definition": "(num.) The number equivalent to the product of two and four.",
        "sentence": "There are eight books.",
        "hint": "Number."
    },
    {
        "word": "EIGHTEEN",
        "difficulty": 4,
        "definition": "(num.) The number equivalent to the product of two and nine.",
        "sentence": "He is eighteen.",
        "hint": "Number."
    },
    {
        "word": "EITHER",
        "difficulty": 4,
        "definition": "(adv./pron./adj.) Used before the first of two alternatives.",
        "sentence": "Either one is fine.",
        "hint": "One or other."
    },
    {
        "word": "ELBOW",
        "difficulty": 1,
        "definition": "(n./v.) The joint between the forearm and the upper arm; to push.",
        "sentence": "He bumped his elbow.",
        "hint": "Joint."
    },
    {
        "word": "ELDERLY",
        "difficulty": 4,
        "definition": "(adj./n.) Old or aging; old people.",
        "sentence": "Respect the elderly.",
        "hint": "Old."
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
    },
    {
        "word": "ELEGANT",
        "difficulty": 5,
        "definition": "(adj.) Pleasingly graceful and stylish in appearance.",
        "sentence": "An elegant dress.",
        "hint": "Graceful."
    },
    {
        "word": "ELEMENT",
        "difficulty": 5,
        "definition": "(n.) A part or aspect of something abstract.",
        "sentence": "The element of surprise.",
        "hint": "Part."
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
    },
    {
        "word": "EMPATHY",
        "difficulty": 5,
        "definition": "(n.) Understand and share feelings.",
        "sentence": "He felt empathy for his friend.",
        "hint": "Understanding."
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
    },
    {
        "word": "FRUGAL",
        "difficulty": 5,
        "definition": "(adj.) Economical with money or food.",
        "sentence": "He led a frugal lifestyle.",
        "hint": "Thrifty."
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
    },
    {
        "word": "INEVITABLE",
        "difficulty": 5,
        "definition": "(adj.) Certain to happen; unavoidable.",
        "sentence": "Death is inevitable.",
        "hint": "Unavoidable."
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
    },
    {
        "word": "INSTRUMENTS",
        "difficulty": 4,
        "tier": 1
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
    },
    {
        "word": "METICULOUS",
        "difficulty": 5,
        "definition": "(adj.) Showing great attention to detail.",
        "sentence": "He was meticulous in his work.",
        "hint": "Careful."
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
    },
    {
        "word": "PRAGMATIC",
        "difficulty": 5,
        "definition": "(adj.) Dealing with things realistically.",
        "sentence": "She took a pragmatic approach.",
        "hint": "Practical."
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
    },
    {
        "word": "RESILIENT",
        "difficulty": 5,
        "definition": "(adj.) Recover quickly from difficulties.",
        "sentence": "Children are often very resilient.",
        "hint": "Tough."
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
    },
    {
        "word": "SISTER",
        "difficulty": 3,
        "tier": 1
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
    },
    {
        "word": "SPURIOUS",
        "difficulty": 5,
        "definition": "(adj.) False or fake.",
        "sentence": "A spurious claim.",
        "hint": "False."
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
    },
    {
        "word": "VENERABLE",
        "difficulty": 5,
        "definition": "(adj.) Respected due to age or wisdom.",
        "sentence": "A venerable elder.",
        "hint": "Respected."
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
    },
    {
        "word": "WARY",
        "difficulty": 5,
        "definition": "(adj.) Showing caution about dangers.",
        "sentence": "She was wary of strangers.",
        "hint": "Cautious."
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
    },
    {
        "word": "ZEALOUS",
        "difficulty": 5,
        "definition": "(adj.) Showing great energy or enthusiasm.",
        "sentence": "A zealous supporter.",
        "hint": "Enthusiastic."
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

        // Filter out words in history (session) AND excludeList (persistent)
        // Ensure comparison is case-insensitive (excludeList contains uppercase words)
        let nonRepeatPool = finalPool.filter(w => !this.history.includes(w.word) && !excludeList.includes(w.word.toUpperCase()));

        if (nonRepeatPool.length === 0) {
            // Category exhausted for this profile? 
            // Fall back to just session history if we can't find anything new for the profile
            nonRepeatPool = finalPool.filter(w => !this.history.includes(w.word));

            if (nonRepeatPool.length === 0) {
                // Session history also exhausted? Just reset session history
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
        let nonRepeatPool = finalPool.filter(w => !this.history.includes(w.word) && !excludeList.includes(w.word.toUpperCase()));
        if (nonRepeatPool.length === 0) {
            this.history = [];
            nonRepeatPool = finalPool.filter(w => !excludeList.includes(w.word.toUpperCase()));
            if (nonRepeatPool.length === 0) {
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
