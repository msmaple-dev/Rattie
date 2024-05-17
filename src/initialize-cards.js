let init_data = [
	{ownerId: 0, cardName: "Slice & Dice", deckType: "slash", severity: "severe", cardText: "The attacker may instantly make an Attack of Opportunity at -1 to hit. This does not cost a reaction."},
	{ownerId: 0, cardName: "Flayed", deckType: "slash", severity: "moderate", cardText: "When you have a contested roll and do not gain a Secondary Success, take 1 Damage."},
	{ownerId: 0, cardName: "Butchered", deckType: "slash", severity: "moderate", cardText: "Take an extra 3 Damage."},
	{ownerId: 0, cardName: "Gutted", deckType: "slash", severity: "moderate", cardText: "Take 2 Damage at the end of each of your turns. You may spend an Action to replace this Status with ‘Open Wound’."},
	{ownerId: 0, cardName: "Open Wound", deckType: "slash", severity: "lesser", cardText: "Take 1 Damage at the end of each of your turns. You may spend an Action to remove this Status."},
	{ownerId: 0, cardName: "Cut Tendon", deckType: "slash", severity: "lesser", cardText: "Attacker’s Choice: Take -3 to hit your next *Strike*, or your next *Stride* has halved distance."},
	{ownerId: 0, cardName: "Headshot", deckType: "pierce", severity: "severe", cardText: "Take an extra 2 Damage Luck Check: You take an extra 8 Damage, instead."},
	{ownerId: 0, cardName: "Vital Hit", deckType: "pierce", severity: "moderate", cardText: "Take -2 to your next contested roll. Luck Check: Take -1 to all defense rolls in addition. This does not stack with the first effect if both would apply"},
	{ownerId: 0, cardName: "Gutshot", deckType: "pierce", severity: "moderate", cardText: "You do not benefit from your Techniques on your next turn. Luck Check: Also lose an Action next turn."},
	{ownerId: 0, cardName: "Limb Strike", deckType: "pierce", severity: "moderate", cardText: "Attacker’s Choice: You may only *Stride* once a turn, or you take -1 to Attacks."},
	{ownerId: 0, cardName: "Missed Vitals", deckType: "pierce", severity: "lesser", cardText: "The next time a Pierce Status has a Luck Check, you automatically roll a 1."},
	{ownerId: 0, cardName: "Weak Point", deckType: "pierce", severity: "lesser", cardText: "Take an extra 2 Damage."},
	{ownerId: 0, cardName: "Knock Out", deckType: "bash", severity: "severe", cardText: "Make a DC 13 Save. On a failure, you take no Actions next turn."},
	{ownerId: 0, cardName: "Concussed", deckType: "bash", severity: "moderate", cardText: "You do not benefit from your Temperament on your next turn."},
	{ownerId: 0, cardName: "Sent Flying", deckType: "bash", severity: "moderate", cardText: "Knocked Back 4. Make a DC 13 Save. On a failure, you lose an Action next turn."},
	{ownerId: 0, cardName: "Internal Injury", deckType: "bash", severity: "moderate", cardText: "Knocked Back 1. When you have a contested roll and gain a Secondary Success, take 1 Damage."},
	{ownerId: 0, cardName: "Off-Balance", deckType: "bash", severity: "lesser", cardText: "Knocked Back 2 in a direction of the Attacker’s choice. Take -2 to hit all attacks on your next turn."},
	{ownerId: 0, cardName: "Cracked Bone", deckType: "bash", severity: "lesser", cardText: "If you *Stride* on your next turn, take 1 Damage. If you attack with MP on your next turn, Take 1 Damage. These can trigger multiple times."},
	{ownerId: 0, cardName: "Tear Asunder", deckType: "rend", severity: "severe", cardText: "Adrenaline: Lose an Action on each turn. You may take 3 Damage to ignore this for this turn."},
	{ownerId: 0, cardName: "Ravage", deckType: "rend", severity: "moderate", cardText: "Whenever a *Strike* hits you, it deals 1 additional Damage."},
	{ownerId: 0, cardName: "Disfigure", deckType: "rend", severity: "moderate", cardText: "Adrenaline: Take -2 to your Defenses. You may take 2 Damage to ignore this for a turn."},
	{ownerId: 0, cardName: "Mangle", deckType: "rend", severity: "moderate", cardText: "Adrenaline: Take -2 to your Attacks. You may take 2 Damage to ignore this for a turn."},
	{ownerId: 0, cardName: "Split", deckType: "rend", severity: "lesser", cardText: "The next time you take an Adrenaline Status, it takes effect immediately."},
	{ownerId: 0, cardName: "Shred", deckType: "rend", severity: "lesser", cardText: "Adrenaline: You may not *Step*. You may take 1 Damage to ignore this for a turn."},
	{ownerId: 0, cardName: "Paralyze", deckType: "shock", severity: "severe", cardText: "Attacker’s Choice: Take -4 on your next two attacks, defenses, or on your next attack and defense."},
	{ownerId: 0, cardName: "Stun", deckType: "shock", severity: "moderate", cardText: "Lose an Action next turn."},
	{ownerId: 0, cardName: "Blitz", deckType: "shock", severity: "moderate", cardText: "The next time you would take a Status, draw an additional Status Card from the deck and apply it."},
	{ownerId: 0, cardName: "Stupefy", deckType: "shock", severity: "moderate", cardText: "The next two attacks that would hit you deal an additional 2 Damage. "},
	{ownerId: 0, cardName: "Jolt", deckType: "shock", severity: "lesser", cardText: "The next time an attack would miss you by 2 or less, it instead hits."},
	{ownerId: 0, cardName: "Stagger", deckType: "shock", severity: "lesser", cardText: "Take -3 on your next attack. "},
	{ownerId: 0, cardName: "Cremate", deckType: "burn", severity: "severe", cardText: "Take 3 Blaze. Ignite 2: Blaze deals double damage. Ignite deals double damage."},
	{ownerId: 0, cardName: "Blacken", deckType: "burn", severity: "moderate", cardText: "Take 1 Blaze. Take -2 on your next contest roll. Ignite 2: Take -3 to your next contested roll instead."},
	{ownerId: 0, cardName: "Engulf", deckType: "burn", severity: "moderate", cardText: "Take 2 Blaze. Ignite 3: Lose an Action next turn."},
	{ownerId: 0, cardName: "Torch", deckType: "burn", severity: "moderate", cardText: "Take 3 Blaze. Ignite 1: Take 1 Blaze."},
	{ownerId: 0, cardName: "Singe", deckType: "burn", severity: "lesser", cardText: "Take 1 Blaze. Ignite 2: Increase your MaP by 1."},
	{ownerId: 0, cardName: "Spark", deckType: "burn", severity: "lesser", cardText: "Take 3 Blaze"},
	{ownerId: 0, cardName: "Empty", deckType: "hollow", severity: "severe", cardText: "You lose your Curse Die on your next contested roll."},
	{ownerId: 0, cardName: "Drain", deckType: "hollow", severity: "moderate", cardText: "You take -3 Value on your next Attack. Your Attacker deals +3 Damage on their next Attack."},
	{ownerId: 0, cardName: "Exhaust", deckType: "hollow", severity: "moderate", cardText: "You have -1 Curse Die Size."},
	{ownerId: 0, cardName: "Gloom", deckType: "hollow", severity: "moderate", cardText: "-1 Value on your future Attacks."},
	{ownerId: 0, cardName: "Tax", deckType: "hollow", severity: "lesser", cardText: "Your next Secondary Success has no effect."},
	{ownerId: 0, cardName: "Weary", deckType: "hollow", severity: "lesser", cardText: "-3 Value on your next Attack."},
]

let init_colors = [
	{ownerId: 0, deckType: "slash", color: "#980000"},
	{ownerId: 0, deckType: "pierce", color: "#55cf20"},
	{ownerId: 0, deckType: "bash", color: "#4a86e8"},
	{ownerId: 0, deckType: "rend", color: "#9900ff"},
	{ownerId: 0, deckType: "shock", color: "#e3b912"},
	{ownerId: 0, deckType: "burn", color: "#ff9900"},
	{ownerId: 0, deckType: "hollow", color: "#000000"},
]

const colors = require('./tables/colors')
const cards = require('./tables/cards');

(async () => {
	try {
		await colors.destroy({where: {deckType: ['slash', 'pierce', 'bash', 'rend', 'shock', 'burn', 'hollow']}});
		await colors.bulkCreate(init_colors).then(res => console.log(`Reloaded ${res.length} Colors!`));
		await cards.destroy({where: {ownerId: 0}});
		await cards.bulkCreate(init_data).then(res => console.log(`Reloaded ${res.length} Status Cards!`));
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();