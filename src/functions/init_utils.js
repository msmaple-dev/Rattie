const init_keyv = require('../keyv_stores/init_keyv');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const { attackCardsToObject } = require('./monster_utils');

const modifierTypes = { 'curse': 'Curse Die Size', 'flat': 'Flat' };
const modifierCategories = { 'attack': 'Attack', 'defend': 'Defense', 'saves': 'Save' };

function newInit(users = [], monster = {}) {
	return {
		currentTurn: 0,
		round: 0,
		users: [...users],
		trackers: [],
		monster: monster || null,
		looting: false,
		damageDealt: 0,
		dpr: [],
		modifiers: [],
		modifiersApplied: 0,
		monsterCards: monster && attackCardsToObject(monster.attackCards),
	};
}

async function getUserDecks(sqlID) {
	const userCards = await db.query('SELECT * FROM cards WHERE ownerId IN (0, ?)', {
		replacements: [sqlID],
		type: QueryTypes.SELECT,
	});

	const decks = {};
	for (const card of userCards) {
		if (card.deckType in decks) {
			decks[card.deckType].push({ ...card, used: false });
		}
		else {
			decks[card.deckType] = [{ ...card, used: false }];
		}
	}

	return decks;
}

function getModifiedRollCode(modifiers, category) {
	const categoryModifiers = modifiers.filter(modifier => modifier.category === category);
	const rollCode = [1, 6, 0, 1];
	if (category === 'attack') {
		rollCode[1] = 0;
	}
	for (const modifier of categoryModifiers) {
		if (modifier.type === 'flat') {rollCode[2] += modifier.amount;}
		else if (modifier.type === 'curse') {rollCode [1] += modifier.amount;}
	}
	if (category !== 'attack') {
		rollCode[1] = Math.max(rollCode[1], 1);
	}
	return rollCode;
}

function getACModifiers(modifiers) {
	const categoryModifiers = modifiers.filter(modifier => modifier.category === 'defend');
	const flatMod = categoryModifiers.filter(modifier => modifier.type === 'flat').reduce((a, current) => a + current.amount, 0);
	const curseMod = categoryModifiers.filter(modifier => modifier.type === 'curse').reduce((a, current) => a + current.amount, 0);
	return [flatMod, curseMod];
}

function getModifierString(modifier) {
	let endText, typeText;

	if (modifier.procs !== null && modifier.procs <= 0) {
		endText = 'No more Procs';
	}
	else if (modifier.duration !== null && modifier.duration <= 0) {
		endText = 'End of Duration';
	}
	else {
		endText = `Ends in ${modifier.duration !== null ? modifier.duration + ' Turns' : ''}${modifier.duration !== null && modifier.procs !== null ? ' or ' : ''}${modifier.procs !== null ? modifier.procs + ' Procs' : ''}.`;
	}

	if (modifier.category === 'attack') {
		const attackModifierTypes = { 'curse': 'Cursed Accuracy', 'flat': 'Accuracy' };
		typeText = attackModifierTypes[modifier.type];
	}
	else {
		typeText = modifierTypes[modifier.type];
	}

	return `Modifier **#${modifier.id}** (${modifier.note ? `${modifier.note} - ` : ''}${modifier.amount > 0 ? '+' : ''}${modifier.amount} ${typeText} ${modifierCategories[modifier.category]} [${endText}])`;
}

function procModifiers(modifiers, category) {
	for (const modifier of modifiers) {
		if (modifier.category === category && modifier.procs !== null) {
			modifier.procs--;
		}
	}
	return clearedModifiers(modifiers);
}

function clearedModifiers(modifiers) {
	return modifiers.filter(modifier => (modifier.procs !== null && modifier.procs <= 0) || (modifier.duration !== null && modifier.duration <= 0)).map(modifier => `Expired: ${getModifierString(modifier)}`).join('\n');
}

function cullModifiers(modifiers) {
	return modifiers.filter(modifier => !((modifier.procs !== null && modifier.procs <= 0) || (modifier.duration !== null && modifier.duration <= 0)));
}

function roundModifiers(modifiers) {
	modifiers.forEach(modifier => {
		if (modifier.duration !== null) {modifier.duration--;}
	});
	return clearedModifiers(modifiers);
}

async function nextTurn(channelId, count = 1) {
	const currentInit = await init_keyv.get(channelId);
	let returnText = '';
	if (currentInit) {
		// Trackers: userID, turnUserID, turnUserIdentifier, turns, content
		// Checks for endRound via === -1
		const effectiveCount = (count === -1 ? (currentInit.users.length - currentInit.currentTurn) + 1 : count);
		for (let i = 0; i < effectiveCount; i++) {
			if (i > 0) {
				returnText += '\n';
			}
			if (currentInit.round <= 0) {
				currentInit.round = 1;
				currentInit.currentTurn = 1;
				if (currentInit.monster) {currentInit.dpr[0] = 0;}
				returnText = `Combat Start!\nBeginning Round ${currentInit.round}\n`;
			}
			else {
				currentInit.currentTurn += 1;
			}
			if (currentInit.currentTurn > currentInit.users.length) {
				currentInit.round += 1;
				currentInit.currentTurn = 1;
				returnText += `\nBeginning Round ${currentInit.round}\n`;
				if (currentInit.monster) {
					currentInit.dpr[currentInit.round] = 0;
					const modifiersRemoved = roundModifiers(currentInit.modifiers);
					currentInit.modifiers = cullModifiers(currentInit.modifiers);
					returnText += modifiersRemoved ? modifiersRemoved + '\n' : '';
				}

			}
			const turnUser = currentInit.users[currentInit.currentTurn - 1];
			if (count > 0 || i === (effectiveCount - 1)) {
				returnText += `Round ${currentInit.round}, ${turnUser.identifier ? `${turnUser.identifier} (<@${turnUser.userID}>)` : `<@${turnUser.userID}>`}'s Turn:`;
			}

			let trackers = currentInit.trackers.map(a => {return { ...a, rounds: (turnUser.userID == a.turnUserID && turnUser.identifier == a.turnUserIdentifier ? a.rounds - 1 : a.rounds) };});

			for (const tracker of trackers.filter(a => a.rounds <= 0)) {
				returnText += `\n<@${tracker.userID}>: ${tracker.content}\n`;
			}
			trackers = trackers.filter(a => a.rounds > 0);
			currentInit.trackers = trackers;
		}
		await init_keyv.set(channelId, currentInit);
	}
	else {
		returnText = 'No Inits Entered!';
	}
	return returnText;
}

function uniqueUsers(users) {
	const uniqueIDs = {};
	return users.filter(function(entry) {
		if (uniqueIDs[entry.userID]) {
			return false;
		}
		uniqueIDs[entry.userID] = true;
		return true;
	});
}

module.exports = { nextTurn, newInit, getUserDecks, uniqueUsers, procModifiers, getACModifiers, getModifierString, getModifiedRollCode, cullModifiers, modifierCategories, modifierTypes };