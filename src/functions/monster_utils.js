const { weightedSelect, drawDeck, roll, unweightedSelect, arrayRoll } = require('./roll_utils');
const { camelizeKeys } = require('./string_utils');
const path = require('node:path');
const fs = require('node:fs');
const init_keyv = require('../keyv_stores/init_keyv');
const { unpinLatestEmbed } = require('./chat_utils');
const DPR = require('../tables/dpr');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const Participants = require('../tables/participants');
const { statusEmbed } = require('../components/embeds');
const { monster_color } = require('../components/constants');

const monstersPath = path.join(__dirname.replace(/[\\/]+functions/, ''), 'monsters');
const monsterFiles = fs.readdirSync(monstersPath).filter(file => file.endsWith('.json'));
const monsters = {};

for (const file of monsterFiles) {
	const filePath = path.join(monstersPath, file);
	let monster = require(filePath);
	monster = camelizeKeys(monster);
	monsters[monster.id] = monster;
}

const defaultLoot = {
	'Baseline Cert': 0.56,
	'A Bauble!': 0.20,
	'A Trinket!!': 0.16,
	'An Artifact!!!': 0.08,
};

const baubles = {
	'Two-Minds Earring': 'You may take another Focus in Smarts',
	'Two-Sights Bracelet': 'You may take another Focus in Talent',
	'Two-Bodies Bracelet': 'You may take another Focus in Fitness',
	'Two-Hearts Locket': 'You may take another Focus in Intuition',
	'Mole\'s Eye Ring': 'You may walk through walls like they are molasses.',
	'Feather Tassel': 'You may fly at 25 mph in 1 minute bursts.',
	'Spider Boots': 'You can walk on walls and ceilings',
	'Cloak of Faeriekind': 'You may grow translucent while still in shadow.',
	'Boots of Faeriekind': 'Your steps make almost no sound.',
	'Ruby of the Red': 'You may create small flames at will in your hand.',
	'Sapphire of the Blue': 'You may create ice at will in your hand.',
	'Emerald of the Green': 'You can create plant-life at will in your hand.',
	'Topaz of the Yellow': 'You can create electric sparks at will in your hand.',
	'Strengthened Mind Ring': 'You may Reroll a Smarts roll once per thread or quest.',
	'Strengthened Sight Pendant': 'You may Reroll a Talent roll once per thread or quest.',
	'Strengthened Body Earring': 'You may Reroll a Fitness roll once per thread or quest.',
	'Strengthened Heart Anklet': 'You may Reroll a Intuition roll once per thread or quest.',
	'Bangle of Attention': 'People and weaker Warlocks tend to focus more on you, attention being drawn to you above others.',
	'Amethyst of Purple': 'You can create mildly poisonous smoke at will in your hand. ',
	'Fools Gold': 'You may turn leaves and rocks into gold coins. They return to normal after a minute.',
	'Echo Bracelet': 'When you speak, you may have your voice come from within 10ft of your location instead.',
	'Inverted Eye': 'Can peer through it to see through surfaces.',
	'Diamond of Clarity': 'Gain a minor resistance to mind altering effects of substances and weaker Curses.',
	'Vocal Amp': 'Allows you to change the volume, and the tone, of your voice without potentially straining your vocal chords.',
	'Dragonskin Rock': 'Makes it look like your skin is much more rugged and tough, more like stone than flesh. Does not actually improve your toughness.',
	'Quantum Veil': 'While in use, your appearance changes whenever you are unobserved.',
};

function getMonster(name) {
	return monsters[name.toLowerCase()];
}

function concCheck(damage, damageThreshold) {
	if (Array.isArray(damageThreshold)) {
		return damage >= unweightedSelect(damageThreshold);
	}
	else {
		return damage >= (damageThreshold + unweightedSelect([
			-8,
			-5,
			-4,
			-3,
			-2,
			-1,
			0,
			0,
			0,
			1,
			2,
			3,
			5,
			8,
			10,
		]));
	}
}

function getValidMonsters() {
	return Object.keys(monsters);
}

function drawDefaultLoot() {
	let lootRoll = `${weightedSelect(defaultLoot)}`;
	if (lootRoll.includes('Bauble')) {
		lootRoll += `\n${unweightedSelect(Object.entries(baubles)).join(': ')}`;
	}
	return lootRoll;
}

async function drawMonsterCard(channelId, channel, clearLast = true) {
	const currentInit = await init_keyv.get(channelId);
	let outputText = '';
	const monsterCards = currentInit.monsterCards;
	if (monsterCards.filter(card => !card.used).length < 1) {
		outputText = 'Shuffling deck...';
	}
	const cardDrawn = drawDeck(monsterCards)[0];
	if (clearLast) {unpinLatestEmbed(channel);}
	await init_keyv.set(channelId, currentInit);
	return [cardDrawn, outputText];
}

function attackCardsToObject(attackCards) {
	return attackCards ? attackCards.map(card => {return { name: card.split(' | ')[0], effect: card.split(' | ')[1], severity: 'Monster', color: monster_color };}) : null;
}

function getMonsterCards(monsterName) {
	const monster = getMonster(monsterName);
	const monsterCards = attackCardsToObject(monster.attackCards);
	const embedArray = [];
	for (const selectedCard of monsterCards) {
		const embed = statusEmbed(selectedCard.name, selectedCard.effect, selectedCard.severity, selectedCard.color);
		embedArray.push(embed);
	}
	return embedArray;
}

function rollAC(baseAC, curseDie = 5) {
	if (Array.isArray(baseAC)) {
		return [arrayRoll(baseAC), roll(curseDie)];
	}
	else {
		return [baseAC, roll(curseDie)];
	}
}

async function logDPR(encounterId, dprArray) {
	const dprValues = dprArray?.slice(1).map((dpr, index) => {return { encounterId: encounterId, round: index, damage: dpr };});
	await DPR.bulkCreate(dprValues);
}

async function getEncounterID(channelId) {
	const encounterId = await db.query('SELECT encounterId FROM encounters WHERE channelId = ? AND startTime < ? ORDER BY startTime DESC LIMIT 1', {
		replacements: [channelId, Date.now()],
		type: QueryTypes.SELECT,
	});
	return encounterId[0]?.encounterId || false;
}

async function initializeParticipants(encounterId, users) {
	const userValues = users.map(usr => {return { encounterId: encounterId, userId: usr.userID, damageTaken: null };});
	await Participants.bulkCreate(userValues);
}

module.exports = { drawMonsterCard, drawDefaultLoot, getMonster, getValidMonsters, logDPR, getEncounterID, initializeParticipants, rollAC, getMonsterCards, attackCardsToObject, concCheck };