const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reshuffle')
		.setDescription('Reshuffles one of your decks in initiative, refreshing it back to full')
		.addStringOption(option => option.setName('deck').setDescription('Deck to reshuffle').setRequired(true))
		.addStringOption(option => option.setName('identifier').setDescription('Identifier for sub-user in initiative to reshuffle').setRequired(false))
	,
	async execute(interaction) {
		const deckType = interaction.options.getString('deck')?.toLowerCase();
		const identifier = interaction.options.getString('identifier') || null;
		const channel = interaction.channelId;
		const userID = interaction.user.id;
		let channelInit = await init_keyv.get(channel);
		let channelUserIndex = channelInit && channelInit?.users ? channelInit.users.findIndex(user => user.userID === userID && user.identifier === identifier) : -1;
		let channelUser = channelUserIndex >= 0 ? channelInit.users[channelUserIndex] : null;

		if (!channelUser) {
			await interaction.reply('Invalid user for this channel\'s initiative!')
			return;
		}
		else {
			let userCards = channelUser.decks;
			let deck = userCards[deckType];

			if (!deck || deck.length <= 0) {
				interaction.reply({
					content: `Invalid Deck Type "${deckType}"! Valid Decks: ${Object.keys(userCards).map(word => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(', ')}`,
					ephemeral: true,
				});
				return;
			}

			for (let card of deck) {
				card.used = false;
			}

			await init_keyv.set(channel, channelInit);
		}
		await interaction.reply(`Refreshed all ${deckType} cards${identifier ? ` for sub-user ${identifier}` : ''}!`);
	},
};
