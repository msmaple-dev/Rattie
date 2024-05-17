const { SlashCommandBuilder } = require('discord.js');
const { QueryTypes } = require('sequelize');
const db = require('./database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rem')
		.setDescription('Sets a reminder [WIP, NON-FUNCTIONAL]')
		.addStringOption(option => option.setName('content').setDescription('Reminder Content').setRequired(true))
		.addStringOption(option => option.setName('time').setDescription('Time until Reminder Hits (1y10w4d3h2m = 1 [y]ear, 10 [w]eeks, 4 [d]ays, 3 [h]ours, 2 [m]inutes)').setRequired(true)),
	async execute(interaction) {
		const sqlUserID = BigInt(interaction.user.id);
		const reminderContent = interaction.options.getString('content');
		const timeString = interaction.options.getString('time').toLowerCase();
		const reminderStart = Date.now();

		const timeYears = timeString.match(/\d+(?=y)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;
		const timeWeeks = timeString.match(/\d+(?=w)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;
		const timeDays = timeString.match(/\d+(?=d)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;
		const timeHours = timeString.match(/\d+(?=h)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;
		const timeMinutes = timeString.match(/\d+(?=m)/g)?.map(time => parseInt(time))?.reduce((a, b) => a + b) || 0;

		const endTime = reminderStart + (
			((((((timeYears * 365) + (timeWeeks * 7) + timeDays) * 24) + timeHours) * 60) + timeMinutes) + 60000
		);

		console.log(timeYears, timeWeeks, timeDays, timeHours, timeMinutes, reminderStart, endTime, reminderStart - endTime, new Date(endTime))


		await interaction.reply(`Set a reminder for <t:${endTime}:D> @ <t:${endTime}:t> (<t:${endTime}:R>)`);
		const replyMessage = await interaction.fetchReply();
		const replyMessageChannel = replyMessage.channelId;
		const replyMessageId = replyMessage.id;

		await db.query('INSERT INTO reminders (ownerId, content, messageId, channelId, endTime) VALUES (?, ?, ?, ?, ?)', {
			replacements: [sqlUserID, reminderContent, replyMessageId, replyMessageChannel, endTime],
			type: QueryTypes.INSERT,
		});

	},
};
