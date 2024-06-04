const { SlashCommandBuilder } = require('discord.js');
const { QueryTypes } = require('sequelize');
const db = require('../database');
const timeFromString = require('../functions/time_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rem')
		.setDescription('Sets a reminder, to an accuracy of ±30s')
		.addStringOption(option => option.setName('content').setDescription('Reminder Content').setRequired(true))
		.addStringOption(option => option.setName('time').setDescription('Time until Reminder Hits (1y10w4d3h2m = 1 [y]ear, 10 [w]eeks, 4 [d]ays, 3 [h]ours, 2 [m]inutes)').setRequired(true)),
	async execute(interaction) {
		const sqlUserID = `${BigInt(interaction.user.id)}`;
		const reminderContent = interaction.options.getString('content');
		const timeString = interaction.options.getString('time').toLowerCase();

		let endTime = timeFromString(timeString)
		const logTime = `${endTime}`.slice(0, 10);
		await interaction.reply(`Set reminder "${reminderContent}" for <t:${logTime}:D> @ <t:${logTime}:t> (<t:${logTime}:R>)`);
		const replyMessage = await interaction.fetchReply();
		const replyMessageChannel = replyMessage.channelId;
		const replyMessageId = replyMessage.id;

		await db.query('INSERT INTO reminders (ownerId, content, messageId, channelId, endTime) VALUES (?, ?, ?, ?, ?)', {
			replacements: [sqlUserID, reminderContent, replyMessageId, replyMessageChannel, endTime],
			type: QueryTypes.INSERT,
		});

	},
};
