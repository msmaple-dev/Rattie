const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')
const nextTurn = require('../functions/init_utils');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('end')
		.setDescription('Ends your turn')
		.addBooleanOption(option => option.setName('true').setDescription('End turns other than your own').setRequired(false)),
	async execute(interaction) {
		const channelId = interaction.channelId;
		const endTrue = interaction.options.getBoolean('true') || false;
		let outputText = ""

		let currentInit = await init_keyv.get(channelId) ?? 0;

		if(currentInit){
			if(currentInit?.round >= 0 && currentInit.currentTurn >= 0){
				if(endTrue || currentInit.users[currentInit.currentTurn - 1].userID === interaction.user.id){
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
