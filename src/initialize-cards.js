let init_data = [
	{ownerId: 0, cardName: "Slice & Dice", deckType: "slash", severity: "severe", cardText: "Attacker May make an Attack of Opportunity @ -1 without a Reaction."},
	{ownerId: 0, cardName: "Flayed", deckType: "slash", severity: "moderate", cardText: "When you make a Contested Roll and do not gain a Secondary success, Take 1 Damage."},
	{ownerId: 0, cardName: "Butchered", deckType: "slash", severity: "moderate", cardText: "Take 3 Damage."},
	{ownerId: 0, cardName: "Gutted", deckType: "slash", severity: "moderate", cardText: "Take 2 Damage at your End of Turn. You may spend an Action to change this Status to Open Wound."},
	{ownerId: 0, cardName: "Open Wound", deckType: "slash", severity: "lesser", cardText: "Take 1 Damage at your End of Turn. You may spend an Action to remove this Status."},
	{ownerId: 0, cardName: "Cut Tendon", deckType: "slash", severity: "lesser", cardText: "???, or your next Stride has halved distance."},
	{ownerId: 0, cardName: "Headshot", deckType: "pierce", severity: "severe", cardText: "Take 2 Damage. Luck Check: 8 Damage, instead."},
	{ownerId: 0, cardName: "Vital Hit", deckType: "pierce", severity: "moderate", cardText: "-2 to Next Contested Roll. Luck Check: -1 to All Defense Rolls, not Stacking with the 1st Effect."},
	{ownerId: 0, cardName: "Gutshot", deckType: "pierce", severity: "moderate", cardText: "Gain no benefit from your Techniques next turn. Luck Check: Also lose an Action next turn"},
	{ownerId: 0, cardName: "Limb Strike", deckType: "pierce", severity: "moderate", cardText: "Attacker’s Choice: You may only Stride once a turn, or you take -1 to Attacks."},
	{ownerId: 0, cardName: "Missed Vitals", deckType: "pierce", severity: "lesser", cardText: "Your next pierce Status Luck Check is a 1."},
	{ownerId: 0, cardName: "Weak Point", deckType: "pierce", severity: "lesser", cardText: "Take 2 Damage"},
	{ownerId: 0, cardName: "Knock Out", deckType: "bash", severity: "severe", cardText: "DC13 Save vs Taking no Actions next turn"},
	{ownerId: 0, cardName: "Concussed", deckType: "bash", severity: "moderate", cardText: "Gain no benefit from your Temperament next turn."},
	{ownerId: 0, cardName: "Sent Flying", deckType: "bash", severity: "moderate", cardText: "Knocked Back 4. DC13 Save vs Losing an Action next turn."},
	{ownerId: 0, cardName: "Internal Injury", deckType: "bash", severity: "moderate", cardText: "Knocked Back 1. When you get a Secondary success on a Contest Roll, Take 1 Damage."},
	{ownerId: 0, cardName: "Off-Balance", deckType: "bash", severity: "lesser", cardText: "Knocked Back 2 in direction of Attacker's Choice. -2 to Hit for all Attacks Next Turn"},
	{ownerId: 0, cardName: "Cracked Bone", deckType: "bash", severity: "lesser", cardText: "Any time you Stride or attack with MaP next turn, Take 1 Damage."},
	{ownerId: 0, cardName: "Tear Asunder", deckType: "rend", severity: "severe", cardText: "Adrenaline: Lose an Action each turn. You may take 3 Damage to ignore for a turn."},
	{ownerId: 0, cardName: "Ravage", deckType: "rend", severity: "moderate", cardText: "When an Attack hits you, you take +1 Damage."},
	{ownerId: 0, cardName: "Disfigure", deckType: "rend", severity: "moderate", cardText: "Adrenaline:  -2 to Defenses. You may take 2 Damage to ignore for a turn."},
	{ownerId: 0, cardName: "Mangle", deckType: "rend", severity: "moderate", cardText: "Adrenaline: -2 to Attacks. You may take 2 Damage to ignore for a turn."},
	{ownerId: 0, cardName: "Split", deckType: "rend", severity: "lesser", cardText: "Your next Adrenaline Status applies Immediately"},
	{ownerId: 0, cardName: "Shred", deckType: "rend", severity: "lesser", cardText: "Adrenaline: You can't Step, take 1 Damage to ignore for a turn."},
	{ownerId: 0, cardName: "Paralyze", deckType: "shock", severity: "severe", cardText: "Attacker's Choice: -4 on Your Next 2 Attacks, Next 2 Defenses, or Next Attack & Defense."},
	{ownerId: 0, cardName: "Stun", deckType: "shock", severity: "moderate", cardText: "Lose an Action next turn."},
	{ownerId: 0, cardName: "Blitz", deckType: "shock", severity: "moderate", cardText: "Next Time you take a Status, draw an additional Status Card from the Deck & Apply it."},
	{ownerId: 0, cardName: "Stupefy", deckType: "shock", severity: "moderate", cardText: "Next 2 Attacks that Hit You Deal +2 Damage."},
	{ownerId: 0, cardName: "Jolt", deckType: "shock", severity: "lesser", cardText: "Next Time an Attack would miss you by 2 or Less, it Hits instead."},
	{ownerId: 0, cardName: "Stagger", deckType: "shock", severity: "lesser", cardText: "-3 on Next Attack"},
	{ownerId: 0, cardName: "Cremate", deckType: "burn", severity: "severe", cardText: "Take 3 Blaze. Ignite 2: Blaze & Ignite deal double damage."},
	{ownerId: 0, cardName: "Blacken", deckType: "burn", severity: "moderate", cardText: "Take 1 Blaze. -2 on your next contest roll. Ignite 2: -3 instead."},
	{ownerId: 0, cardName: "Engulf", deckType: "burn", severity: "moderate", cardText: "Take 2 Blaze. Ignite 3: Lose an Action next turn."},
	{ownerId: 0, cardName: "Torch", deckType: "burn", severity: "moderate", cardText: "Take 3 Blaze. Ignite 1: Take 1 Blaze."},
	{ownerId: 0, cardName: "Singe", deckType: "burn", severity: "lesser", cardText: "Take 1 Blaze. Ignite 2: Increase your MaP by 1."},
	{ownerId: 0, cardName: "Spark", deckType: "burn", severity: "lesser", cardText: "Take 3 Blaze"},
	{ownerId: 0, cardName: "Empty", deckType: "hollow", severity: "severe", cardText: "Lose your Curse Die on next contested roll."},
	{ownerId: 0, cardName: "Drain", deckType: "hollow", severity: "moderate", cardText: "-3 Value on next Attack. Attacker deals +3 Damage on their next Attack."},
	{ownerId: 0, cardName: "Exhaust", deckType: "hollow", severity: "moderate", cardText: "-1 Curse Die Size"},
	{ownerId: 0, cardName: "Gloom", deckType: "hollow", severity: "moderate", cardText: "-1 Value on future Attacks"},
	{ownerId: 0, cardName: "Tax", deckType: "hollow", severity: "lesser", cardText: "Your next Secondary Success has no effect."},
	{ownerId: 0, cardName: "Weary", deckType: "hollow", severity: "lesser", cardText: "-3 Value on next Attack"},
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