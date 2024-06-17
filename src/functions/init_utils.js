const init_keyv = require('../keyv_stores/init_keyv');
const db = require("../database");
const {QueryTypes} = require("sequelize");
const {monster_color} = require("../components/constants");

function newInit(users = [], monster = {}){
	return {
		currentTurn: 0,
		round: 0,
		users: [...users],
		trackers: [],
		monster: monster || null,
		looting: false,
		damageDealt: 0,
		dpr: [],
		monsterCards: monster && monster.attackCards ? monster.attackCards.map(card => {return {name: card.split(" | ")[0], effect: card.split(" | ")[1], severity: 'Monster', color: monster_color}}) : null
	}
}

async function getUserDecks(sqlID){
	let userCards = await db.query('SELECT * FROM cards WHERE ownerId IN (0, ?)', {
		replacements: [sqlID],
		type: QueryTypes.SELECT,
	});

	let decks = {};
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

async function nextTurn(channelId, count = 1){
	let currentInit = await init_keyv.get(channelId)
	let returnText = ""
	if(currentInit) {
		// Trackers: userID, turnUserID, turnUserIdentifier, turns, content
		// Checks for endRound via === -1
		let effectiveCount = (count === -1 ? (currentInit.users.length - currentInit.currentTurn) + 1 : count)
		for(let i = 0; i < effectiveCount; i++){
			if(i > 0){
				returnText += `\n`
			}
			if(currentInit.round <= 0){
				currentInit.round = 1
				currentInit.currentTurn = 1
				if(currentInit.monster){currentInit.dpr[0] = 0;}
				returnText = `Combat Start!\nBeginning Round ${currentInit.round}\n`
			} else {
				currentInit.currentTurn += 1
			}
			if(currentInit.currentTurn > currentInit.users.length){
				currentInit.round += 1
				currentInit.currentTurn = 1
				if(currentInit.monster){currentInit.dpr[currentInit.round] = 0;}
				returnText += `\nBeginning Round ${currentInit.round}\n`
			}
			let turnUser = currentInit.users[currentInit.currentTurn - 1];
			if(count > 0 || i === (effectiveCount - 1)){
				returnText += `Round ${currentInit.round}, ${turnUser.identifier ? `${turnUser.identifier} (<@${turnUser.userID}>)` : `<@${turnUser.userID}>`}'s Turn:`
			}

			let trackers = currentInit.trackers.map(a => {return {...a, rounds: (turnUser.userID == a.turnUserID && turnUser.identifier == a.turnUserIdentifier ? a.rounds-1 : a.rounds)}})

			for (const tracker of trackers.filter(a => a.rounds <= 0)){
				returnText += `\n<@${tracker.userID}>: ${tracker.content}\n`
			}
			trackers = trackers.filter(a => a.rounds > 0)
			currentInit.trackers = trackers
		}
		await init_keyv.set(channelId, currentInit)
	} else {
		returnText = "No Inits Entered!"
	}
	return returnText
}

function uniqueUsers(users){
	let uniqueIDs = {};
	return users.filter(function (entry) {
		if (uniqueIDs[entry.userID]) {
			return false;
		}
		uniqueIDs[entry.userID] = true;
		return true;
	});
}

module.exports = { nextTurn, newInit, getUserDecks, uniqueUsers }