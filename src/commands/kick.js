const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')
const {nextTurn} = require('../functions/init_utils');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Removes the current turn user from init'),
	async execute(interaction) {
		const channelId = interaction.channelId;

		let outputText = "No Init in this Channel!"
		let skipTurn = false;

		let currentInit = await init_keyv.get(channelId)

		if(currentInit.currentTurn > 0){
			let turnUser = currentInit.users[currentInit.currentTurn-1]
			currentInit.users = structuredClone(currentInit.users.filter(usr => !(usr.userID === turnUser.userID && usr.identifier === turnUser.identifier)))
			currentInit.currentTurn -= 1
			skipTurn = true;
			outputText = `Kicked User <@${turnUser.userID}>.`
			currentInit.users.sort((a, b) => b.initVal - a.initVal)
			if(currentInit.users.length <= 0){
				await init_keyv.delete(channelId);
				outputText += `GG!`
				skipTurn = false;
			} else {
				await init_keyv.set(channelId, currentInit)
			}
		}

		if(skipTurn){
			outputText += `\n` + await nextTurn(channelId)
		}
		await interaction.reply(outputText);
	},
};
