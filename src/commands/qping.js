const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	needsClient: true,
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('qping')
		.setDescription('Pings all members who reacted to a message.')
		.addStringOption(option => option.setName('message').setDescription('Message Link').setRequired(true)),
	async execute(interaction, client) {
		await interaction.deferReply();
		const link = interaction.options.getString('message') || null;
		const linkTest = /(?:https:\/\/)?discord.com\/channels\/\d+\/\d+\/\d+/;
		const splitMessage = linkTest.test(link) && link.split('/').length && link.split('/');
		const messageId = splitMessage && splitMessage[splitMessage.length - 1];
		const channelId = splitMessage && splitMessage[splitMessage.length - 2];
		if (messageId && channelId) {
			try {
				const channel = await client.channels.cache.get(channelId);
				let message = channel && await channel.messages.fetch(messageId);
				// Force update cache
				message = await message.fetch(true);
				if (message) {
					const users = new Set();
					for (const reaction of message.reactions.cache.values()) {
						const reactingUsers = await reaction.users.fetch();
						for (const user of reactingUsers.keys()) {
							users.add(user);
						}
					}
					if (users) {
						const reply = `Quest Ping: ${[...users].map(user => `<@${user}>`).join(', ')}`;
						await interaction.editReply({ content: reply });
					}
					else {
						await interaction.editReply(`No Reactions Found at Message ${link}`);
					}
				}
			}
			catch (e) {
				await interaction.editReply(`Something Went Wrong! Error: ${e}`);
				console.log(e);
			}
		}
		else {
			await interaction.editReply('Invalid Message Link!');
		}
	},
};
