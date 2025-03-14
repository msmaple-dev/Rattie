const severities = [{ name: 'Lesser', value: 'lesser' },
	{ name: 'Moderate', value: 'moderate' },
	{ name: 'Severe', value: 'severe' },
	{ name: 'Grimoire', value: 'grimoire' }];

const tarot_data = [
	{
		cardName: 'Fool',
		originalTarot: '0 - Fool',
		majorTarot: 'Spirit of Aether',
		upright: 'CREATION, POTENTIAL, INNOCENCE, BEGINNINGS, GROWTH, SPONTANEITY',
		reverse: 'RECKLESSNESS, WASTED POTENTIAL, DISTRACTION, FEAR, LACK OF AWARENESS',
		description: 'A young figure takes their first steps forward accompanied by an animal. They move foward heedless of the dangers in front of them',
		explanation: '',
	},
	{
		cardName: 'Magician',
		originalTarot: '1 - Magician',
		majorTarot: 'Magus of Power',
		upright: 'CAPABILITY, COMPETENCE, CONCENTRATION, COMMUNICATION, MANIFESTATION, POWER',
		reverse: 'TRICKS OR ILLUSIONS, REMOVED FROM REALITY, DISTRACTIONS, HAMPERED COMMUNICATION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Priestess',
		originalTarot: '2 - Priestess',
		majorTarot: 'Priestess of the Silver Star',
		upright: 'INTUITION, THE SUBCONSCIOUS, A PERIOD OF SELF-REFLECTION, INTERNAL CHANGE',
		reverse: 'A SHALLOW VIEW, IGNORING YOUR INTUITION, SECRETS, WITHDRAWAL, LACKING SPIRITUALITY',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Empress',
		originalTarot: '3 - Empress',
		majorTarot: 'Daughter of the Mighty Ones',
		upright: 'GROWTH, BEAUTY, NURTURING, RELATIONSHIPS, EMPATHY, LOVE, NATURE',
		reverse: 'VANITY, EMOTIONAL DAMAGE, SELF-HATRED, CREATIVITY BLOCKED, DEPENDENCE',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Emperor',
		originalTarot: '4 - Emperor',
		majorTarot: 'Chief Among the Mighty',
		upright: 'FAIR LEADERSHIP, AUTHORITY, STRUCTURE, LIFE EXPERIENCE, SELF-DISCIPLINE, LOGIC, SYSTEMATIC PROBLEM SOLVING, SELF-SACRIFICE',
		reverse: 'FAILING TO MEET GOALS, AN OVERLY DOMINANT OR CONTROLLING FIGURE, REBELLION AGAINST RULES AND STRUCTURE, CRUELTY AND VIOLENCE',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Heirophant',
		originalTarot: '5 - Heirophant',
		majorTarot: 'Magus of the Eternal',
		upright: 'TRADITION, RULES, REGULATIONS, LEARNING, MENTORSHIP, WISDOM, CONFORMITY',
		reverse: 'BLIND OBEDIENCE, BUREAUCRACY, REBELLION, CHALLENGING AUTHORITY, CONTROLLING MENTORS, OVER-RELIANCE ON STRUCTURE AND TRADITION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Lovers',
		originalTarot: '6 - Lovers',
		majorTarot: 'Children of the Voice',
		upright: 'CHOICE, CONSEQUENCES, RELATIONSHIPS, LOVE, CONNECTION, ATTRACTION, DESIRING UNION',
		reverse: 'UNEQUAL AND STRAINED RELATIONSHIPS, LACKING SELF-LOVE, LACKING RELATIONSHIPS, IMBALANCE, INTERNAL CONFLICT, MISALIGNED VALUES',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Chariot',
		originalTarot: '7 - Chariot',
		majorTarot: 'Lord of the Triumph of Light',
		upright: 'OVERCOMING ADVERSITY, SELF-DISCIPLINE, CONTROL, SUCCESS, VICTORY, COURAGE, GOAL ACHIEVEMENT, CONTEMPLATION',
		reverse: 'CONFLICT, RECKLESSNESS, LACK OF FOCUS, OPPOSITION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Strength',
		originalTarot: '8 - Strength',
		majorTarot: 'Daughter of the Flaming Sword',
		upright: 'COMPASSION, PASSION, INFLUENCE, COURAGE, SELF-ACCEPTANCE, INNER RESILIENCE',
		reverse: 'SELF-DOUBT, LOW ENERGY, LACK OF PASSION, RECKLESS ACTIONS, MINDLESSNESS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Hermit',
		originalTarot: '9 - Hermit',
		majorTarot: 'Prophet of the Eternal',
		upright: 'INSIGHT, ILLUMINATION, SOUL-SEARCHING, WISDOM, KNOWLEDGE, DELVING INTO ONE\'S UNTAPPED WISDOM',
		reverse: 'ISOLATION, BEING SELF-ABSORBED, WITHDRAWAL, IGNORING OTHERS, BEING OUT OF TOUCH',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Fortune',
		originalTarot: '10 - Wheel of Fortune',
		majorTarot: 'Lord of the Forces of Life',
		upright: 'CHANGE, OPTIMISM, ADAPTABILITY, SELF AS THE STABLE CENTER IN CHAOTIC TIMES, UNEXPECTED OPPORTUNITY, LIFE CYCLES',
		reverse: 'BAD LUCK, POWERLESSNESS, STRESS, CAUTIOUSNESS, HELPLESSNESS, RESISTING CHANGE, BREAKING OUT OF CYCLES',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Justice',
		originalTarot: '11 - Justice',
		majorTarot: 'Daughter of the Lords of Truth',
		upright: 'FAIRNESS, TRUTH, CAUSE AND EFFECT, INTEGRITY, CONSEQUENCE, LAW',
		reverse: 'UNFAIRNESS, DISHONESTY, RETRIBUTION, CORRUPTION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Hanged One',
		originalTarot: '12 - Hanged Man',
		majorTarot: 'Spirit of the Mighty Waters',
		upright: 'REDEMPTION OF A TRANSGRESSION, LETTING GO OF GUILT, GIVING TO OTHERS, SACRIFICE IN PURSUIT OF SELF-FULFILLMENT, NEW PERSPECTIVE, SURRENDER',
		reverse: 'SELF-PUNISHMENT, GUILT, SELF-SACRIFICE IN DETRIMENT, STALLING, INDECISION, DELAYS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Death',
		originalTarot: '13 - Death',
		majorTarot: 'Lord of the Gate of Death',
		upright: 'TRANSFORMATION, CHANGE, LETTING GO OF THAT WHICH DOESN’T SERVE YOU, CRISIS, DIFFICULT PERSONAL GROWTH',
		reverse: 'RESISTING CHANGE, STAGNATION, UNRESOLVED ISSUES, FEELING TRAPPED OR STUCK',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Temperance',
		originalTarot: '14 - Temperance',
		majorTarot: 'Child of the Reconcilers',
		upright: 'BALANCE, MODERATION, TRANQUILITY, PURPOSE, CALM, COORDINATION, PATIENCE',
		reverse: 'IMBALANCE, CONFLICT, EXCESSES, STRESS, TENSION, IMPATIENCE, HASTE, COMPETITION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Devil',
		originalTarot: '15 - Devil',
		majorTarot: 'Lord of the Gates of Matter',
		upright: 'RESTRICTION, ATTACHMENT, OVERLY FOCUSED ON THE MATERIAL, SEXUALITY, SHADOW SELF',
		reverse: 'COMPULSION, ADDICTION, FEELINGS OF BEING TRAPPED, DETACHMENT, AGGRESSION AND DISHONESTY',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Tower',
		originalTarot: '16 - Tower',
		majorTarot: 'Lord of the Hosts of the Mighty',
		upright: 'DESTRUCTION OF STABILITY, RE-ALIGNMENT OF A FUNDAMENTAL UNDERSTANDING, A TIME OF CRISIS AND TURMOIL, DIFFICULT EMOTIONS, A SUDDEN REVERSAL OF FATE, DESTRUCTION OF INSTITUTIONS, FALSE PREMISES LEADING TO THEIR OWN DOWNFALL, UPENDED EXPECTATIONS',
		reverse: 'FIGHT AND CONFLICT, FEAR OF CHANGE, REMAINING IN A TOXIC SITUATION OR ENVIRONMENT, PROLONGING DIFFICULT TIMES AND SITUATIONS, REPEATING CYCLES WITHOUT LEARNING FROM THEM',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Star',
		originalTarot: '17 - Star',
		majorTarot: 'Daughter of the Firmament',
		upright: 'INSPIRATION, FULFILLMENT, JOY, LOVE, ENCOURAGEMENT, HOPE, PURPOSE',
		reverse: 'LOSS OF HOPE, SKEPTICISM, DISCONNECT, JOYLESSNESS, LACKING FULFILLMENT',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Moon',
		originalTarot: '18 - Moon',
		majorTarot: 'Ruler of Flux and Counterflux',
		upright: 'ILLUSION, DECEPTION, FEAR, ANXIETY, HIDDEN SELF, SUBCONSCIOUS, REPRESSED MEMORIES OR FEELINGS',
		reverse: 'DEPRESSION, UNHEALTHY MENTAL STATES, CONFUSION, DIRECTIONLESSNESS, REPRESSION, MEANINGLESSNESS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Sun',
		originalTarot: '19 - Sun',
		majorTarot: 'Lord of the Fire of the World',
		upright: 'ABUNDANCE, JOY, SUCCESS, CONFIDENCE, ILLUMINATION, POSITIVITY, SIMPLICITY, NEW PERSPECTIVE, CLEAR SIGHT',
		reverse: 'LACKING ENTHUSIASM, PESSIMISM, A DIFFICULT SITUATION, JOYLESSNESS, LACKING PERSPECTIVE',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Judgement',
		originalTarot: '20 - Judgement',
		majorTarot: 'Spirit of the Primal Fire',
		upright: 'LIFE CHANGING EXPERIENCE, A MAJOR DECISION, ABSOLUTION, SPIRITUAL EXPANSION',
		reverse: 'SELF-DOUBT, INNER CRITICISM, NEGATIVE CHOICES, BLOCKED GROWTH',
		description: '',
		explanation: '',
	},
	{
		cardName: 'World',
		originalTarot: '21 - World',
		majorTarot: 'The Great One of the Night Time',
		upright: 'COMPLETION, INTEGRATION, TAKING CONTROL OF YOUR OWN FATE, ENLIGHTENMENT, ACCOMPLISHMENT',
		reverse: 'PROCRASTINATION, SHORT-CUTS, BEING ENSLAVED BY THE MATERIAL, REFUSING TO ACCEPT AN END OF SOMETHING, LACKING CLOSURE, NOT BEING ABLE TO FINISH A PROJECT, SPIRITUAL STAGNATION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Inspiration',
		originalTarot: 'Ace of Wands',
		majorTarot: '',
		upright: 'POTENTIAL, CREATION, ENERGY, PASSION, DISCOVERY, OPPORTUNITY, BREAKTHROUGH',
		reverse: 'RECKLESSNESS, THOUGHTLESSNESS, LOW ENERGY, EXECUTIVE DYSFUNCTION, DIFFICULTY BEGINNING',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Influence',
		originalTarot: 'Two of Wands',
		majorTarot: '',
		upright: 'PLANNING, DECISION, DISCOVERY, TRAVEL, CHANGE, TAKING CHARGE, MOVING FORWARD, EXPLORATION',
		reverse: 'LACK OF PASSION, UNCLEAR GOALS, LACK OF PLANNING, IMPRACTICALITY, PLAYING IT SAFE, STAGNATION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Virtue',
		originalTarot: 'Three of Wands',
		majorTarot: '',
		upright: 'CONSTRUCTIVE WORK, HONESTY, INTEGRITY, PERSPECTIVE, SUCCESS',
		reverse: 'DISHONESTY, LACKING FULFILLMENT, NEGATIVE ACTION, LACKING PERSPECTIVE, UNREALISTIC PLANS RESULTING IN FAILURE',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Fulfillment',
		originalTarot: 'Four of Wands',
		majorTarot: '',
		upright: 'ACCOMPLISHMENT, ATTAINMENT, CONCLUSION OF WORK, STABILITY, SECURITY',
		reverse: 'STARTING TOO MANY PROJECTS, TAKING ON TOO MUCH, IMBALANCE, COMPLACENCY, DELAYS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Strife',
		originalTarot: 'Five of Wands',
		majorTarot: '',
		upright: 'CONFLICT ESPECIALLY IN THE WORKPLACE OR A RELATIONSHIP, COMPETITION, DIVERSITY OF OPINION, CLASHING POINTS OF VIEW',
		reverse: 'IMPOSTOR SYNDROME, AVOIDING CONFLICT TOO MUCH, INABILITY TO WORK WITH OTHERS, INFERIORITY COMPLEX, FEELING OVERWHELMED BY WORK',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Victory',
		originalTarot: 'Six of Wands',
		majorTarot: '',
		upright: 'SUCCESS, PROGRESS, PUBLIC RECOGNITION, CONFIDENCE, CELEBRATION, PROMOTION',
		reverse: 'SELF-IMPORTANCE, EGOTISTIC, FALL FROM GRACE, LACKING CONFIDENCE, LACKING DIRECTION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Valor',
		originalTarot: 'Seven of Wands',
		majorTarot: '',
		upright: 'TAKING A STAND, COURAGE, CHALLENGE, STRENGTH, FIGHTING FOR WHAT YOU BELIEVE IN',
		reverse: 'DEFENDING AN ILL-CONSIDERED POSITION, GIVING IN TO OTHERS, STUBBORNNESS, LACKING COURAGE, FIGHTING AGAINST THE ODDS AND LOSING',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Swiftness',
		originalTarot: 'Eight of Wands',
		majorTarot: '',
		upright: 'INSIGHT, MOVEMENT, COMMUNICATION, COMPLETION, ACTION, SPEED',
		reverse: 'IMPULSIVENESS, THOUGHTLESSNESS, RESISTING CHANGE, PROCRASTINATION, LACK OF COMMUNICATION, IMPRACTICALITY, SLOWNESS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Fortitude',
		originalTarot: 'Nine of Wands',
		majorTarot: '',
		upright: 'STANDING YOUR GROUND DESPITE OBSTACLES, FLEXIBILITY, CONFIDENCE IN THE FACE OF ADVERSITY, PUSHING ON PAST EXHAUSTION',
		reverse: 'BEING OVERWHELMED, LACKING THE ABILITY TO GO ON, FEELING DRAINED, LACKING FLEXIBILITY, INABILITY TO FUNCTION, OVERCOME WITH DOUBT, DRAINED BY OBLIGATIONS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Oppression',
		originalTarot: 'Ten of Wands',
		majorTarot: '',
		upright: 'AN UNWINNABLE SITUATION, FEELING TRAPPED, BEING DRAINED, BLOCKED FROM A GOAL, NEEDING TO WALK AWAY',
		reverse: 'DESTRUCTIVE SELF-SACRIFICE, SELF-HARM, DISCONNECT FROM EMOTIONS AND YOURSELF, ABUSIVE RELATIONSHIPS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Connection',
		originalTarot: 'Ace of Cups',
		majorTarot: '',
		upright: 'CREATION, NEW RELATIONSHIPS, NEW LIFE, UNCONDITIONAL LOVE',
		reverse: 'VULNERABILITY, REPRESSING EMOTIONS, EMOTIONAL NUMBNESS, DISCONNECT FROM THE EMOTIONAL SELF',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Love',
		originalTarot: 'Two of Cups',
		majorTarot: '',
		upright: 'BEGINNING OF NEW HEALTHY RELATIONSHIPS, MARRIAGE, CLOSE FRIENDSHIPS AND PARTNERSHIPS',
		reverse: 'BREAK-UPS, MISUNDERSTANDINGS, DISHARMONY, A SCHISM IN CLOSE RELATIONSHIPS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Abundance',
		originalTarot: 'Three of Cups',
		majorTarot: '',
		upright: 'SHARED ACCOMPLISHMENT, FRIENDSHIP, ABUNDANCE OF EMOTION, NURTURING OTHERS, ENJOYMENT',
		reverse: 'EXTRAVAGANCE, LACKING SHARED GOALS, STAGNATION IN RELATIONSHIPS, DISCONNECTED COMMUNICATION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Luxury',
		originalTarot: 'Four of Cups',
		majorTarot: '',
		upright: 'APPRECIATION FOR WHAT WE HAVE, STAGNATION OF GOALS, BOREDOM, MATERIALISTIC GOALS, TEMPORARY PLEASURE',
		reverse: 'AVOIDING OPPORTUNITIES AND CHANGE, DEPRESSION, STUCK IN COMFORT ZONE, STUCK IN DISCONTENT DUE TO INABILITY TO FACE DIFFICULT CHANGES',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Disappointment',
		originalTarot: 'Five of Cups',
		majorTarot: '',
		upright: 'WALLOWING, LACKING FULFILLMENT, DISILLUSIONMENT, UNREALISTIC EXPECTATIONS LEADING TO DISAPPOINTMENT, INABILITY TO ATTAIN A GOAL',
		reverse: 'A LONGER AND MORE DRAWN OUT VERSION OF THE ABOVE THEMES LEADING TO LONGER TERM STAGNATION AND DEPRESSION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Pleasure',
		originalTarot: 'Six of Cups',
		majorTarot: '',
		upright: 'PLEASURE EXPERIENCED AFTER DIFFICULT TIMES THAT IS TRANSFORMATIVE, SEXUAL FULFILLMENT AND/OR A HEALTHY RELATIONSHIP, HEALING, A RETURN TO HAPPY EMOTIONS AFTER A PERIOD OF FLATNESS OR DIFFICULTY',
		reverse: 'MISMATCHED RELATIONSHIPS, OUT OF TOUCH WITH YOURSELF, UNHEALTHY SEXUAL EXPRESSION, DWELLING IN THE PAST',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Debauchery',
		originalTarot: 'Seven of Cups',
		majorTarot: '',
		upright: 'ADDICTION, GIVING IN TO UNHEALTHY EMOTIONS, OVERINDULGENCE, NEGATIVITY, SELF-DESTRUCTIVE COPING HABITS',
		reverse: 'THE SAME THEMES AS ABOVE BUT DRAWN OUT OVER A LONGER PERIOD OF TIME, OR REPEATING ENDLESSLY BECAUSE OF INABILITY TO LEARN FROM MISTAKES',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Ennui',
		originalTarot: 'Eight of Cups',
		majorTarot: '',
		upright: 'LACK OF INTEREST IN OTHERS OR SELF, DENYING OURSELVES PLEASURE, LACKING EFFORT, APATHY, FEELING EMPTY, LACKING MOTIVATION TO DO ANYTHING',
		reverse: 'DEPRESSION, EMOTIONAL DISTRESS OVER A LONG PERIOD OF TIME, SUICIDAL THOUGHTS, A FLATNESS OF EMOTION, FEELINGS OF POINTLESSNESS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Happiness',
		originalTarot: 'Nine of Cups',
		majorTarot: '',
		upright: 'WISHES COMING TRUE, ATTAINMENT OF WHAT YOU’VE WANTED, FULFILLMENT',
		reverse: 'EMPTINESS, LACKING FULFILLMENT, INABILITY TO SUCCEED AT YOUR MOST VALUED GOALS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Attainment',
		originalTarot: 'Ten of Cups',
		majorTarot: '',
		upright: 'HARMONY ATTAINED, HAPPY RELATIONSHIPS, FULFILLMENT NOW EDGING INTO BOREDOM, STABILITY, COMFORT',
		reverse: 'CYCLICAL ATTAINMENT OF THAT WHICH DOES NOT TRULY FULFILL YOU, STAYING IN A COMFORTABLE SITUATION THAT DOES NOT NURTURE YOUR GROWTH OR SOUL, STAGNATION WITHIN ONE’S COMFORT ZONE',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Ambition',
		originalTarot: 'Ace of Swords',
		majorTarot: '',
		upright: 'CLARITY, THOUGHT, BREAKTHROUGH, INSIGHT, VISION',
		reverse: 'CLOUDED THINKING, BEING OVERLY AGGRESSIVE, LACK OF WILL',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Peace',
		originalTarot: 'Two of Swords',
		majorTarot: '',
		upright: 'BALANCE, PEACE, WEIGHING DECISIONS, HARMONY',
		reverse: 'HASTY DECISIONS, STALEMATE, CONFUSION, STRESS, INDECISIVENESS, LACK OF HARMONY',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Sorrow',
		originalTarot: 'Three of Swords',
		majorTarot: '',
		upright: 'PAIN OVER LOSS AND SEPARATION, FEARS, LONGING, UNHAPPINESS, ABANDONMENT, MELANCHOLY',
		reverse: 'END OF A CLOSE RELATIONSHIP, UNRESOLVED GRIEF, LONG-TERM DEPRESSION AND SORROW',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Truce',
		originalTarot: 'Four of Swords',
		majorTarot: '',
		upright: 'A BREAK FROM CONFLICT, UNRESOLVED CONFLICT, RECUPERATING FROM STRESS',
		reverse: 'LINGERING CONFLICT, UNABLE TO TAKE TIME OFF FROM A STRESSFUL SITUATION, BURN-OUT THAT YOU HAVEN’T RECOVERED FROM',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Defeat',
		originalTarot: 'Five of Swords',
		majorTarot: '',
		upright: 'FEAR, BETRAYAL, SABOTAGE, PAST HURT AFFECTING OUR PRESENT, TURMOIL',
		reverse: 'A MORE DRAWN OUT BETRAYAL THAT WE AREN’T ABLE TO FORGIVE OR MOVE ON FROM, MENTAL AND EMOTIONAL DRAIN FROM PREVIOUS PAIN IN OUR LIVES, DIFFICULTY DEALING WITH THE PRESENT BECAUSE OF A PAINFUL PAST',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Success',
		originalTarot: 'Six of Swords',
		majorTarot: '',
		upright: 'INTELLECTUAL CLARITY THROUGH LIFE EXPERIENCES, TRIAL AND ERROR, RETHINKING DIFFERENT WAYS TO APPROACH A SITUATION YOU’VE HAD DIFFICULTY WITH, A NEW APPROACH, THINKING THINGS THROUGH AND TRYING AGAIN',
		reverse: 'INABILITY TO LEARN FROM EXPERIENCE, REPEATING MISTAKES, THOUGHTS CLOUDED BY EMOTION, OVERTHINKING A SITUATION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Uncertainty',
		originalTarot: 'Seven of Swords',
		majorTarot: '',
		upright: 'SELF-DOUBT, DISTRACTION, NEGATIVE THINKING, SELF-SABOTAGE, SCATTERED MENTAL STATE',
		reverse: 'APPEASING OTHERS AT OUR OWN EXPENSE, MENTAL STRESS, COMPROMISING TOO MUCH OF OURSELVES, BEING OVERWHELMED BY OUR OWN THOUGHTS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Indecision',
		originalTarot: 'Eight of Swords',
		majorTarot: '',
		upright: 'INDECISION, TOO MANY CHOICES, OVERTHINKING ALL OPTIONS, WASTED ATTENTION ON DETAILS THAT DON’T MATTER',
		reverse: 'INACTION OVER A PERIOD OF TIME, MISSING OPPORTUNITIES, DELAYING TOO LONG, PRIORITIZING WHAT DOESN’T MATTER OVER WHAT DOES',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Cruelty',
		originalTarot: 'Nine of Swords',
		majorTarot: '',
		upright: 'SELF-DENIGRATION, SELF-HARM, HATEFUL THOUGHTS DIRECTED INWARD THAT NONETHELESS HARM OTHERS',
		reverse: 'SELF-HATRED OVER A PERIOD OF TIME THAT CAUSES PAIN TO EVERYONE INVOLVED, SELF-DESTRUCTIVE BEHAVIOR ESPECIALLY MENTALLY, SELF-SABOTAGE AS A COPING MECHANISM',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Ruin',
		originalTarot: 'Ten of Swords',
		majorTarot: '',
		upright: 'PAINFUL LEARNING EXPERIENCES, GROWTH THROUGH A DIFFICULT TIME, LOSS OF STABILITY ESPECIALLY MATERIAL OBJECTS, LETTING FEAR RUIN OPPORTUNITY',
		reverse: 'PAINFUL EXPERIENCES THAT YOU AREN’T GROWING FROM, PERMANENT LOSS, SELF-DESTRUCTIVE BEHAVIOR BROUGHT ON BY PERSONAL FEARS, DIFFICULTIES REPEATING IN A CYCLE',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Acumen',
		originalTarot: 'Ace of Coins',
		majorTarot: '',
		upright: 'NEW WORK, FINANCIAL OPPORTUNITY, SUSTENANCE, TANGIBLE WORK, START OF A NEW PRACTICAL SKILL SET, UNDERSTANDING OF NATURE, CONSTRUCTIVE GROWTH',
		reverse: 'GREED, EXPLOITATION, FINANCIAL OPPORTUNITY FALLING THROUGH, LACK OF SPIRITUAL HARMONY, OVERWORK, LACK OF PRACTICAL DRIVE',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Change',
		originalTarot: 'Two of Coins',
		majorTarot: '',
		upright: 'LEARNING TO WORK WITHIN CHANGING SITUATIONS, EVERYTHING IN A STATE OF FLUX, FOCUS ON THE PRACTICAL, FINDING CALM IN A CHAOTIC SETTING',
		reverse: 'INABILITY TO LET GO, RECKLESSNESS IN PRACTICAL MATTERS, FINANCES OUT OF CONTROL, CHANGE THAT IS TO YOUR DETRIMENT',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Works',
		originalTarot: 'Three of Coins',
		majorTarot: '',
		upright: 'GOOD OMEN FOR PRACTICAL MATTERS, REWARD FOR WORK, DILIGENCE, BALANCE, FOLLOWING THAT WHICH BETTERS YOU',
		reverse: 'CONFLICT AT WORK, LACKING FULFILLMENT IN WORK, CAREER STAGNATION OR INDECISION',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Power',
		originalTarot: 'Four of Coins',
		majorTarot: '',
		upright: 'MATERIAL STABILITY, CONFIDENCE IN WORK, A HEALTHY FOUNDATION, FINANCIAL SECURITY',
		reverse: 'GREEDINESS, FINANCIAL INSECURITY, MATERIALISM, INABILITY TO SHARE YOURSELF OR YOUR GOOD FORTUNE, COLDNESS, RIGIDNESS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Worry',
		originalTarot: 'Five of Coins',
		majorTarot: '',
		upright: 'A THREAT TO ONE’S MATERIAL AND SPIRITUAL SECURITY, WORRY THAT KEEPS YOU FROM YOUR PRESENT MOMENT, ANXIETY OVER ONE’S SITUATION THAT MAKES THE SITUATION WORSE, DIFFICULTIES MADE WORSE BY DWELLING',
		reverse: 'INACTION OVER A LONG PERIOD OF TIME DUE TO WORRY, ANXIETIES THAT INTERFERE WITH YOUR FOUNDATIONS, LENGTHY INSTABILITIES DRAWN OUT OVER A LONG TIME DUE TO ONE’S NEGATIVE THOUGHTS',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Prosperity',
		originalTarot: 'Six of Coins',
		majorTarot: '',
		upright: 'MATERIAL AND SPIRITUAL SUCCESS, OPPORTUNITY FOR PROFIT, REMINDER OF PAST SUCCESS, FINANCIAL GROWTH',
		reverse: 'RECKLESS SPENDING, GREED, DEBT, FINANCIAL AND MATERIAL STRUGGLE, POOR FINANCIAL CONTROL',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Stagnation',
		originalTarot: 'Seven of Coins',
		majorTarot: '',
		upright: 'STAGNATION AND DIFFICULTY WITH MATERIAL AFFAIRS, FEAR AFFECTING OUR SPIRITUAL AND FINANCIAL SUCCESS, INERTIA, LEARNING FROM SETBACKS, REPEATED FAILURES RESULTING IN DISCOURAGEMENT, AN OPPORTUNITY THAT DID NOT PAN OUT',
		reverse: 'STAYING ON WITH A LOST CAUSE, STAGNATING IN A LOSING SITUATION, AVOIDING DIFFICULTY DUE TO FEAR, NOT MOVING ON FROM A FAILURE',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Prudence',
		originalTarot: 'Eight of Coins',
		majorTarot: '',
		upright: 'CONTINUING WITH SOMETHING YOU ARE WORKING ON, GIVING A PROJECT TIME AND DEDICATION, DEVELOPMENT OF SOMETHING FRUITFUL OVER A PERIOD OF TIME, PATIENCE, PERSISTENCE, EVENTUAL MATERIAL SUCCESS',
		reverse: 'RUSHING A PROJECT, FOCUSING TOO MUCH ON DETAILS THAT DON’T MATTER, TOO MUCH FOCUS ON ONE THING THAT LEADS TO DIFFICULTIES WITH OTHER PARTS, HASTINESS, IMPATIENCE',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Gain',
		originalTarot: 'Nine of Coins',
		majorTarot: '',
		upright: 'REWARD, IMPROVEMENT, MATERIAL SUCCESS AFTER HARD WORK, FINANCIAL GIFTS',
		reverse: 'FINANCIAL SUCCESS THAT LEAVES OTHERS POORER, RECKLESS SPENDING, IMPENDING MATERIAL STRAIN',
		description: '',
		explanation: '',
	},
	{
		cardName: 'Wealth',
		originalTarot: 'Ten of Coins',
		majorTarot: '',
		upright: 'MATERIAL WEALTH, FINANCIAL ACHIEVEMENT, WEALTH THAT BRINGS STABILITY SHARED WITH OTHERS, ACHIEVEMENT OF SPIRITUAL AND FINANCIAL SUCCESS',
		reverse: 'MISERLINESS, GREED, FINANCIAL RICHES BUT SPIRITUAL EMPTINESS, MISAPPLICATION OF ONE’S FINANCES, WEALTH ACHIEVED AT THE EXPENSE OF OTHERS',
		description: '',
		explanation: '',
	},
];

const base_deck_data = [
	{
		ownerId: 0,
		cardName: 'Slice & Dice',
		deckType: 'slash',
		severity: 'severe',
		cardText: 'The attacker may instantly make an Attack of Opportunity at 8 Value. This does not cost a reaction.',
	},
	{
		ownerId: 0,
		cardName: 'Flayed',
		deckType: 'slash',
		severity: 'moderate',
		cardText: 'When you defend and do not gain a Secondary Success, take 1 Damage. **Recovery**.',
	},
	{ ownerId: 0, cardName: 'Butchered', deckType: 'slash', severity: 'moderate', cardText: 'Take an extra 3 Damage.' },
	{
		ownerId: 0,
		cardName: 'Gutted',
		deckType: 'slash',
		severity: 'moderate',
		cardText: 'You have -2 to your next contested check. Take **Open Wound**.',
	},
	{
		ownerId: 0,
		cardName: 'Open Wound',
		deckType: 'slash',
		severity: 'lesser',
		cardText: 'Take 1 Damage at the end of each of your turns. You may spend an Action to remove this Status. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Cut Tendon',
		deckType: 'slash',
		severity: 'lesser',
		cardText: '**Attacker’s Choice**: Take -3 to hit your next *Strike*, or your *Strides* on your next turn have halved distance.',
	},
	{
		ownerId: 0,
		cardName: 'Headshot',
		deckType: 'pierce',
		severity: 'severe',
		cardText: 'Take an extra 2 Damage\n**Luck:** You take an extra 8 Damage, instead.',
	},
	{
		ownerId: 0,
		cardName: 'Vital Hit',
		deckType: 'pierce',
		severity: 'moderate',
		cardText: 'Take -2 to your next contested roll.\n**Luck:** Take -1 to all defense rolls in addition. This does not stack with the first effect if both would apply. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Gutshot',
		deckType: 'pierce',
		severity: 'moderate',
		cardText: 'You do not benefit from your Techniques. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Limb Strike',
		deckType: 'pierce',
		severity: 'moderate',
		cardText: 'You may only Stride once a turn. **Recovery**.\n' +
			'**Luck:** Also take -1 to *Strikes*.',
	},
	{
		ownerId: 0,
		cardName: 'Missed Vitals',
		deckType: 'pierce',
		severity: 'lesser',
		cardText: 'The next time a Status has **Luck**, you automatically roll a 1.',
	},
	{ ownerId: 0, cardName: 'Weak Point', deckType: 'pierce', severity: 'lesser', cardText: 'Take an extra 2 Damage.' },
	{
		ownerId: 0,
		cardName: 'Wall Splat',
		deckType: 'bash',
		severity: 'severe',
		cardText: '**Knocked Back 3**. If you would draw a Status due to this **Knocked Back**, the attacker may instantly make an Attack of Opportunity at 6 Value. This does not cost a reaction. If drawn due to **Knocked Back**, immediately take the Attack of Opportunity.',
	},
	{
		ownerId: 0,
		cardName: 'Concussed',
		deckType: 'bash',
		severity: 'moderate',
		cardText: 'Take -2 to *Strikes*, and reduce the DC of your Utility Actions by 2 if they are not your first action in a turn. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Sent Flying',
		deckType: 'bash',
		severity: 'moderate',
		cardText: '**Attacker’s Choice: Knocked Back 6,** or **Knocked Back 3** in a direction of the Attacker’s choice.',
	},
	{
		ownerId: 0,
		cardName: 'Internal Injury',
		deckType: 'bash',
		severity: 'moderate',
		cardText: '**Knocked Back 1**. When you *Strike* and do not gain a Secondary Success, take 1 Damage. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Off-Balance',
		deckType: 'bash',
		severity: 'lesser',
		cardText: '**Knocked Back 1** in a direction of the Attacker’s choice. Take -1 to hit all *Strikes* on your next turn.',
	},
	{
		ownerId: 0,
		cardName: 'Dizzy',
		deckType: 'bash',
		severity: 'lesser',
		cardText: 'When you would receive **Knocked Back**, increase the distance by 1. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Tear Asunder',
		deckType: 'rend',
		severity: 'severe',
		cardText: '**Adrenaline:** Take -1 to all Rolls. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Ravage',
		deckType: 'rend',
		severity: 'moderate',
		cardText: 'Whenever a Strike hits you, it deals 1 additional Damage. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Disfigure',
		deckType: 'rend',
		severity: 'moderate',
		cardText: '**Adrenaline:** Take -2 to your Defenses. You may take 2 Damage to ignore this for a turn. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Mangle',
		deckType: 'rend',
		severity: 'moderate',
		cardText: '**Adrenaline:** Take -2 to your *Strikes*. You may take 2 Damage to ignore this for a turn. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Split',
		deckType: 'rend',
		severity: 'lesser',
		cardText: 'The next time you take a Status with **Adrenaline**, it takes effect immediately.',
	},
	{
		ownerId: 0,
		cardName: 'Shred',
		deckType: 'rend',
		severity: 'lesser',
		cardText: '**Adrenaline:** You may not Step. You may take 1 Damage to ignore this for a turn. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Paralyze',
		deckType: 'shock',
		severity: 'severe',
		cardText: '**Attacker’s Choice:** Take -4 on your next two *Strikes*, defenses, or on your next *Strike* and defense.',
	},
	{ ownerId: 0, cardName: 'Daze', deckType: 'shock', severity: 'moderate', cardText: 'The next time a *Strike* you make would hit by 3 or less, it instead misses. Stacking this allows it to work on future *Strikes* per stack.' },
	{
		ownerId: 0,
		cardName: 'Blitz',
		deckType: 'shock',
		severity: 'moderate',
		cardText: 'The next two times you would take a Status, draw an additional Lesser Status Card.',
	},
	{
		ownerId: 0,
		cardName: 'Stupefy',
		deckType: 'shock',
		severity: 'moderate',
		cardText: 'The next two *Strikes* that would hit you deal an additional 2 Damage.',
	},
	{
		ownerId: 0,
		cardName: 'Jolt',
		deckType: 'shock',
		severity: 'lesser',
		cardText: 'The next time a *Strike* would miss you by 2 or less, it instead hits. Stacking this allows it to work on future *Strikes* per stack.',
	},
	{
		ownerId: 0,
		cardName: 'Stagger',
		deckType: 'shock',
		severity: 'lesser',
		cardText: 'Take -4 on your next *Strike*.',
	},
	{
		ownerId: 0,
		cardName: 'Cremate',
		deckType: 'burn',
		severity: 'severe',
		cardText: '**Ablaze, Ablaze**. The next time you take a Status with **Ignite**, remove all copies of **Ablaze** and apply the effect that many times.',
	},
	{
		ownerId: 0,
		cardName: 'Blacken',
		deckType: 'burn',
		severity: 'moderate',
		cardText: 'When hit by a *Strike* without MP, take 1 additional damage. **Recovery**.\n' +
			'**Ignite:** Increase the additional damage by 1.',
	},
	{
		ownerId: 0,
		cardName: 'Engulf',
		deckType: 'burn',
		severity: 'moderate',
		cardText: '**Ablaze.** You do not benefit from your Techniques for a round. Stacks increase this duration.\n' +
			'**Ignite:** You also do not benefit from your Dispositions for a round. Stacks increase this duration.',
	},
	{
		ownerId: 0,
		cardName: 'Torch',
		deckType: 'burn',
		severity: 'moderate',
		cardText: '**Ablaze.** Take 1 Damage.\n' +
			'**Ignite:** Take 1 Damage at the end of each of your turns. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Singe',
		deckType: 'burn',
		severity: 'lesser',
		cardText: 'Take -2 on your next two contested rolls. Stacks increase the amount of rolls.\n' +
			'**Ignite:** Instead apply -4 to your next two contested rolls. Stacks increase the amount of rolls.',
	},
	{ ownerId: 0, cardName: 'Spark', deckType: 'burn', severity: 'lesser', cardText: '**Ablaze.**\n' +
			'**Ignite:** Take 4 damage. Stacks increase the amount of damage by 2.' },
	{
		ownerId: 0,
		cardName: 'Soul-Scar',
		deckType: 'hollow',
		severity: 'severe',
		cardText: '**Attacker’s Choice:** Choose two of the following effects. The first applies to your next *Strike*, and the second to the *Strike* after. You may pick the same effect twice.\n' +
			'- You do not roll a Curse Die.\n' +
			'- The target gains 2 HP.\n' +
			'- The target adds +4 Value on their next *Strike*.\n' +
			'- Suffer Exhaust.',
	},
	{
		ownerId: 0,
		cardName: 'Drain',
		deckType: 'hollow',
		severity: 'moderate',
		cardText: 'You take -3 Value on your next *Strike*. Your Attacker gains +3 Value on their next *Strike*.',
	},
	{
		ownerId: 0,
		cardName: 'Empty',
		deckType: 'hollow',
		severity: 'moderate',
		cardText: 'Take -1 and -1 Curse Die Size on your defenses. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Gloom',
		deckType: 'hollow',
		severity: 'moderate',
		cardText: 'Take -1 Value and -1 Curse Die Size on your *Strikes*. **Recovery**.',
	},
	{
		ownerId: 0,
		cardName: 'Tax',
		deckType: 'hollow',
		severity: 'lesser',
		cardText: '**Attacker’s Choice:** Your next Secondary Success has no effect, or you take 1 damage and the attacker gains 1 HP.',
	},
	{
		ownerId: 0,
		cardName: 'Exhaust',
		deckType: 'hollow',
		severity: 'lesser',
		cardText: 'Take -4 Value on your next *Strike*.',
	},
];

const colors_data = [
	{ ownerId: 0, deckType: 'slash', color: '#980000' },
	{ ownerId: 0, deckType: 'pierce', color: '#55cf20' },
	{ ownerId: 0, deckType: 'bash', color: '#4a86e8' },
	{ ownerId: 0, deckType: 'rend', color: '#9900ff' },
	{ ownerId: 0, deckType: 'shock', color: '#e3b912' },
	{ ownerId: 0, deckType: 'burn', color: '#ff9900' },
	{ ownerId: 0, deckType: 'hollow', color: '#000000' },
];

const monster_color = '#1f4913';

module.exports = { severities, base_deck_data, colors_data, tarot_data, monster_color };