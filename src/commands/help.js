const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

let outputText = '__Commands__\n';
const outputArray = [];

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js') && file.toString() !== 'help.js');
for (const file of commandFiles) {
	const command = require(`./${file}`);
	outputText += `**/${command.data.name}** *(${command.data.description || 'N/A'})*\n`;
	// eslint-disable-next-line no-prototype-builtins
	for (const option of command.data.options.filter(opt => opt.hasOwnProperty('options'))) {
		outputText += `  /${command.data.name} ${option.name} *(${option.description || 'N/A'})*\n`;
	}
	if (outputText.length > 1800) {
		outputArray.push(outputText);
		outputText = '';
	}
}
outputArray.push(outputText);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows all commands in the bot'),
	async execute(interaction) {
		await interaction.reply({ content: outputArray[0], ephemeral: true });
		if (outputArray.length > 0) {
			for (const textSegment of outputArray.slice(1)) {
				await interaction.followUp({ content: textSegment, ephemeral: true });
			}
		}
	},
};
