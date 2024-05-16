const init_keyv = require('../keyv_stores/init_keyv');

async function nextTurn(channelId){
	let currentInit = await init_keyv.get(channelId)
	let returnText = ""
	if(currentInit) {
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
			returnText += `Beginning Round ${currentInit.round}\n`
		}
		let turnUser = currentInit.users[currentInit.currentTurn - 1];
		returnText += `Round ${currentInit.round}, ${turnUser.identifier ? `${turnUser.identifier} (<@${turnUser.userID}>)` : `<@${turnUser.userID}>`}'s Turn:`
		let trackers = currentInit.trackers.map(a => [a[0]-1, a[1]])
		for (const tracker of trackers.filter(a => a[0] <= 0)){
			returnText += tracker[1]
		}
		trackers = trackers.filter(a => a[0] > 0)
		currentInit.trackers = trackers
		await init_keyv.set(channelId, currentInit)
	} else {
		returnText = "No Inits Entered!"
	}
	return returnText
}

module.exports = nextTurn