const { SlashCommandBuilder } = require('discord.js');
const { weightedSelect } = require('../functions/roll_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pet')
		.setDescription('Pet the rat'),
	async execute(interaction) {
		const choices = { 'Yay :D': 50, '*Bites You*': 1 };
		await interaction.reply(weightedSelect(choices));
	},
};
