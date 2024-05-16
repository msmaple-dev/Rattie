const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')
const nextTurn = require('../functions/init_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts Init'),
	async execute(interaction) {
		const channelId = interaction.channelId;
		let outputText = ""

		let currentInit = await init_keyv.get(channelId) ?? 0;

		if(currentInit){
			if(currentInit?.round === 0){
				outputText = await nextTurn(channelId)
			} else {
				outputText = "Combat Has Already Started!"
			}
		} else outputText = "No Inits Entered!"
		interaction.reply(outputText)
	},
};
