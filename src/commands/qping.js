const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	needsClient: true,
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('qping')
		.setDescription('Pings all members who reacted to a message.')
		.addStringOption(option => option.setName('message').setDescription('Message Link').setRequired(true)),
	async execute(interaction, client) {
		const link = interaction.options.getString('message') || null;
		const linkTest = /(?:https:\/\/)?discord.com\/channels\/\d+\/\d+\/\d+/;
		const splitMessage = linkTest.test(link) && link.split('/').length && link.split('/');
		const messageId = splitMessage && splitMessage[splitMessage.length - 1];
		const channelId = splitMessage && splitMessage[splitMessage.length - 2];
		if (messageId && channelId) {
			try {
				const channel = await client.channels.cache.get(channelId);
				const message = channel && await channel.messages.fetch(messageId);
				if (message) {
					const users = [];
					for (const reaction of message.reactions.cache.values()) {
						const reactingUsers = await reaction.users.fetch();
						for (const user of reactingUsers.keys()) {
							if (users.indexOf(user) === -1) {
								users.push(user);
							}
						}
					}
					const reply = `Quest Ping: ${users.map(user => `<@${user}>`).join(', ')}`;
					await interaction.reply({ content: reply, allowedMentions: {} });
				}
			}
			catch (e) {
				await interaction.reply(`Something Went Wrong! Error: ${e}`);
				console.log(e);
			}
		}
		else {
			await interaction.reply('Invalid Message Link!');
		}
	},
};
