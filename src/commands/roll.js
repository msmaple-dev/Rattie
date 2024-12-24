const { SlashCommandBuilder } = require('discord.js');
const { rollFromString } = require('../functions/roll_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls a standard roll (1d20+1d6+0). Shorthand Enabled (2d20+1d5+1->2+5+1)')
		.addStringOption(option => option.setName('roll').setDescription('Roll code').setRequired(false)),
	async execute(interaction) {
		const inputText = interaction.options.getString('roll') ?? '1+6+0';
		const outputText = rollFromString(inputText) ;
		await interaction.reply(outputText);
	},
};
