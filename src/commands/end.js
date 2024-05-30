const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')
const nextTurn = require('../functions/init_utils');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('end')
		.setDescription('Ends your turn')
		.addBooleanOption(option => option.setName('true').setDescription('End turns other than your own').setRequired(false))
		.addIntegerOption(option => option.setName('turns').setDescription('Pass through the next X turns (also acts as end true)').setMinValue(0).setRequired(false))
		.addBooleanOption(option => option.setName('endround').setDescription('Passes to start of next round (incompatible with turns)').setRequired(false)),
	async execute(interaction) {
		const channelId = interaction.channelId;
		const endTrue = interaction.options.getBoolean('true') || false;
		const count = interaction.options.getInteger('turns') || null;
		const roundEnd = interaction.options.getBoolean('endround') || false;
		let outputText = ""

		let currentInit = await init_keyv.get(channelId) ?? 0;

		if(currentInit){
			if(currentInit?.round >= 0 && currentInit.currentTurn >= 0){
				if(roundEnd || count || endTrue || currentInit.users[currentInit.currentTurn - 1].userID === interaction.user.id){
					outputText = await nextTurn(channelId, (roundEnd ? -1 : (count || 1)))
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
