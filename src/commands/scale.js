const { SlashCommandBuilder } = require('discord.js');
const { QueryTypes } = require('sequelize');
const db = require('../database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scale')
		.setDescription('Set Your Current Scale for Accuracy Rolls')
		.addIntegerOption(option => option
			.setName('scale')
			.setDescription('Scale Number (1-3)')
			.setRequired(true)
			.setMaxValue(3)
			.setMinValue(1)),
	async execute(interaction) {
		await interaction.deferReply();
		const userID = interaction.user.id;
		const sqlUserID = `${BigInt(userID)}`;
		const scale = interaction.options.getInteger('scale') || 1;
		await db.query('REPLACE INTO scales VALUES (?, ?)', {
			replacements: [sqlUserID, scale],
			type: QueryTypes.SELECT,
		});
		await interaction.editReply(`Set Your Current Scale to ${scale}`);
	},
};
