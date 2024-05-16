const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gg')
		.setDescription('Ends the match'),
	async execute(interaction) {
		const channelId = interaction.channelId;

		let outputText = "GG!"

		await init_keyv.delete(channelId)

		await interaction.reply(outputText);
	},
};
