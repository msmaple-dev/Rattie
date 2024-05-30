const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	needsClient: true,
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('qping')
		.setDescription('Pings all members who reacted to a message.')
		.addStringOption(option => option.setName('message').setDescription('Message Link').setRequired(true)),
	async execute(interaction, client) {
		let link = interaction.options.getString('message') || null;
		let linkTest = /(?:https:\/\/)?discord.com\/channels\/\d+\/\d+\/\d+/;
		let splitMessage = linkTest.test(link) && link.split('/').length && link.split('/');
		let messageId = splitMessage && splitMessage[splitMessage.length - 1];
		let channelId = splitMessage && splitMessage[splitMessage.length - 2];
		if (messageId && channelId) {
			try {
				let channel = await client.channels.cache.get(channelId);
				let message = channel && await channel.messages.fetch(messageId);
				if (message) {
					let users = [];
					for (const reaction of message.reactions.cache.values()) {
						let reactingUsers = await reaction.users.fetch();
						for (const user of reactingUsers.keys()) {
							if (users.indexOf(user) === -1) {
								users.push(user);
							}
						}
					}
					let reply = `Quest Ping: ${users.map(user => `<@${user}>`).join(', ')}`;
					await interaction.reply({ content: reply, allowedMentions: {} });
				}
			} catch (e) {
				await interaction.reply(`Something Went Wrong! Error: ${e}`);
				console.log(e);
			}
		}
		else {
			await interaction.reply('Invalid Message Link!');
		}
	},
};
