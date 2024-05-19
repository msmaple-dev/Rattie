const { SlashCommandBuilder } = require('discord.js');
const timeFromString = require('../functions/time_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Show a discord timecode some time later from now')
		.addStringOption(option => option.setName('time').setDescription('Time between Now/End Point (1y10w4d3h2m = 1 [y]ear, 10 [w]eeks, 4 [d]ays, 3 [h]ours, 2 [m]inutes)').setRequired(true)),
	async execute(interaction) {
		let timeString = interaction.options.getString('time')?.toLowerCase();
		let logTime = timeFromString(timeString)

		await interaction.reply(`<t:${logTime}:D> @ <t:${logTime}:t> (<t:${logTime}:R>)`);
	},
};
