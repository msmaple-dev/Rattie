const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pet')
		.setDescription('Pet the rat'),
	async execute(interaction) {
		await interaction.reply('Yay :D');
	},
};
