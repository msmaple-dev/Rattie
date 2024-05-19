const { SlashCommandBuilder } = require('discord.js');
const { roll } = require("../functions/roll_utils")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('luck')
		.setDescription('Rolls a d3'),
	async execute(interaction) {
		let rollResult = roll(3)
		await interaction.reply(`Luck Roll: ${rollResult === 3 ? `**${rollResult}**` : rollResult}`);
	},
};
