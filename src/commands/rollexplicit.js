const { SlashCommandBuilder } = require('discord.js');
const { rollString, explicitParse } = require('../functions/roll_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rollexplicit')
		.setDescription('Rolls any roll that is writen explicitly. Cannot use shorthand or accuracy.')
		.addStringOption(option => option.setName('roll').setDescription('Roll code').setRequired(false)),
	async execute(interaction) {
		const inputText = interaction.options.getString('roll') ?? '1d20+1d6+0';
		const outputText = rollString(...explicitParse(inputText), true);
		await interaction.reply(outputText);
	},
};
