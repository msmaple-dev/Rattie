const { SlashCommandBuilder } = require('discord.js');
const { parseRoll, rollString } = require("../functions/roll_utils")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls a standard roll (2d20+1d6)')
		.addStringOption(option => option.setName('roll').setDescription('Roll code')),
	async execute(interaction) {
		const inputText = interaction.options.getString('roll') ?? '2+6+0';
		let parsedValues = parseRoll(inputText)
		let rolledDice = parsedValues[0].reduce((a, b) => parseInt(a) + parseInt(b[0])) * parsedValues[3]
		let outputText = rolledDice > 100 ? `Please keep rolls to under 100 dice. (Attempted to roll ${rolledDice} dice)` : rollString(parsedValues[0], parsedValues[1], parsedValues[2], parsedValues[3])
		await interaction.reply(outputText);
	},
};
