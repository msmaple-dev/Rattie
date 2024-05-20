const db = require('../database');
const { QueryTypes } = require('sequelize');
const { DiscordAPIError } = require('discord.js');

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
				try {
					let originalReminderMessage = await channel.messages.fetch(reminder.messageId);
					await originalReminderMessage.reply(`<@${reminder.ownerId}>: ${reminder.content}`)
				} catch (e) {
					if(e instanceof DiscordAPIError){
						console.log('Missing Message Error!', e)
						await channel.send(`<@${reminder.ownerId}>: ${reminder.content} [Note: Original Message Deleted or Inaccessible]`)
					}
				}

			}
		}
		await db.query('DELETE FROM reminders WHERE reminders.endTime <= ?', {
			replacements: [now],
			type: QueryTypes.SELECT,
		})
	}
}

module.exports = checkReminders