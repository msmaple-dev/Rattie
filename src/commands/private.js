const { SlashCommandBuilder } = require('discord.js');
const { declareChannelId } = require('../../config.json');
const init_keyv = require('../keyv_stores/init_keyv');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('private')
		.setDescription('Privately set information, or reveal it later.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription('Sets private information [Init only].')
				.addStringOption(option => option.setName('info').setDescription('Private Information').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('reveal')
				.setDescription('Reveal and clear your private info, if any. [Init Only]'),
		),
	async execute(interaction) {
		const privateInfo = interaction.options.getString('info');
		const channelId = interaction.channel.id;
		const currentInit = await init_keyv.get(channelId).catch(err => interaction.reply(err));
		const subCommand = interaction.options.getSubcommand();
		if (!currentInit) {
			await interaction.reply('You can only use ``/private`` commands in an Init!');
		}
		else {
			const userID = interaction.user.id;
			const currentUsers = currentInit.users;
			const matchingIndex = currentUsers.findIndex(usr => usr.userID === userID);

			if (matchingIndex < 0) {
				await interaction.reply('You aren\'t in the current init!');
			}
			else {
				const userInit = currentUsers[matchingIndex];
				if (subCommand === 'set') {
					const client = interaction.client;
					const messageChannel = await client.channels.fetch(channelId);

					userInit.privateInfo = privateInfo;
					await init_keyv.set(channelId, currentInit);
					await interaction.reply({ content: `Noted "${privateInfo}"`, allowedMentions: {}, ephemeral: true });
					const declarationMessage = await messageChannel.send({ content: `Note Made by <@${userID}>!`, allowedMentions: {} });

					const declareChannel = await client.channels.fetch(declareChannelId);
					if (declareChannel) {
						await declareChannel.send({ content: `<@${userID}> in ${declarationMessage.url}: ${privateInfo}`, allowedMentions: {} });
					}
					else {
						console.log('Invalid channel!');
					}
				}
				else if (subCommand === 'reveal') {
					await interaction.reply({ content: `Revealed Info: ${userInit.privateInfo || 'No Info Found!'}`, allowedMentions: {} });
					userInit.privateInfo = '';
					await init_keyv.set(channelId, currentInit);
				}
			}
		}
	},
};
