const init_keyv = require('../keyv_stores/init_keyv');

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
				returnText = `Combat Start!\nBeginning Round ${currentInit.round}\n`
			} else {
				currentInit.currentTurn += 1
			}
			if(currentInit.currentTurn > currentInit.users.length){
				currentInit.round += 1
				currentInit.currentTurn = 1
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

module.exports = nextTurn