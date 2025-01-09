const { SlashCommandBuilder } = require('discord.js');
const { QueryTypes } = require('sequelize');
const db = require('../database');
const { rollFromString } = require('../functions/roll_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('strike')
		.setDescription('Rolls a strike roll w/ accuracy & shorthand enabled. (2+5+1m1 -> 2d20+1d5+[1 Acc.]-5)')
		.addStringOption(option => option.setName('roll').setDescription('Roll code').setRequired(false)),
	async execute(interaction) {
		const userID = interaction.user.id;
		const sqlUserID = `${BigInt(userID)}`;
		const scale = await db.query('SELECT scale FROM scales WHERE userId = ? LIMIT 1', {
			replacements: [sqlUserID],
			type: QueryTypes.SELECT,
		});
		const inputText = interaction.options.getString('roll') ?? '1+0+0';
		let outputText = rollFromString(inputText, scale[0]?.scale || 1) ;
		if (!scale) {
			outputText += '\nYou currently don\'t have a valid scale defined! Set your current scale via /scale';
		}
		await interaction.reply(outputText);
	},
};
