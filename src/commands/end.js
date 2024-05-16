const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')
const nextTurn = require('../functions/init_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('end')
		.setDescription('Ends your turn'),
	async execute(interaction) {
		const channelId = interaction.channelId;
		let outputText = ""

		let currentInit = await init_keyv.get(channelId) ?? 0;

		if(currentInit){
			if(currentInit?.round >= 0 && currentInit.currentTurn >= 0){
				if(currentInit.users[currentInit.currentTurn - 1].userID === interaction.user.id){
					outputText = await nextTurn(channelId)
				} else {
					outputText = "It's not your turn!"
				}
			} else {
				outputText = "Combat Has Not Started!"
			}
		} else outputText = "No Inits Entered!"
		interaction.reply(outputText)
	},
};
