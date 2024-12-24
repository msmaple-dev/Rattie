const { SlashCommandBuilder } = require('discord.js');
const { declareChannelId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('declare')
		.setDescription('Privately declare something; Moderators & Staff will be able to verify what you\'ve declared.')
		.addStringOption(option => option.setName('declaration').setDescription('Declaration Text').setRequired(true)),
	async execute(interaction) {
		const declaration = interaction.options.getString('declaration');
		const channelId = interaction.channel.id;
		const client = interaction.client;
		const messageChannel = await client.channels.fetch(channelId);
		const userID = interaction.user.id;

		await interaction.reply({ content: `Declared "${declaration}"`, allowedMentions: {}, ephemeral: true });
		const declarationMessage = await messageChannel.send({ content: `Declaration Made by <@${userID}>!`, allowedMentions: {} });

		const declareChannel = await client.channels.fetch(declareChannelId);
		if (declareChannel) {
			await declareChannel.send({ content: `<@${userID}> in ${declarationMessage.url}: ${declaration}`, allowedMentions: {} });
		}
		else {
			console.log('Invalid channel!');
		}

	},
};
