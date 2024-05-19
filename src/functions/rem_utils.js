const db = require('../database');
const { QueryTypes } = require('sequelize');

async function checkReminders(client){
	const now = Date.now()
	let expiredReminders = await db.query ('SELECT ownerId, content, messageId, channelId, endTime FROM reminders WHERE reminders.endTime <= ?', {
		replacements: [now],
		type: QueryTypes.SELECT,
	})

	if(expiredReminders?.length > 0){
		for(let reminder of expiredReminders){
			let channel = await client.channels.fetch(`${reminder.channelId}`)
			if(channel && channel?.messages){
				let originalReminderMessage = await channel.messages.fetch(reminder.messageId)
				originalReminderMessage.reply(`<@${reminder.ownerId}>: ${reminder.content}`)
			}
		}
		await db.query('DELETE FROM reminders WHERE reminders.endTime <= ?', {
			replacements: [now],
			type: QueryTypes.SELECT,
		})
	}
}

module.exports = checkReminders