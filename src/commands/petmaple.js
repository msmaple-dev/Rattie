const { SlashCommandBuilder } = require('discord.js');
const { weightedSelect } = require('../functions/roll_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('petmaple')
		.setDescription('Pet the Maple'),
	async execute(interaction) {
		const choices = { 'https://cdn.discordapp.com/attachments/1276975133403385917/1315595672749342720/maplepet.gif?ex=67ec4c32&is=67eafab2&hm=4e6dc0de4d014fd37a6fd698413008ab54d7edad97019c392a7c3e589369f3d6&': 50,
			'https://cdn.discordapp.com/attachments/1276975133403385917/1315595690906488883/maplepetfaster.gif?ex=67ec4c37&is=67eafab7&hm=2356fc759647ba0b299007b281991b0848ecb220f9b4366964aee643920ea814&': 1 };
		await interaction.reply('<@195951867254145024>\n' + weightedSelect(choices));
	},
};
