const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv');
const { toProperCase } = require('../functions/string_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('library')
		.setDescription('Shows all cards remaining per each of your decks in Init')
		.addStringOption(option => option.setName('identifier').setDescription('Identifier for Additional User Linked to You, if Any').setRequired(false)),
	async execute(interaction) {
		const channelId = interaction.channelId;
		const userID = interaction.user.id;
		const identifier = interaction.options.getString('identifier') ?? null;
		const currentInit = await init_keyv.get(channelId);

		let outputText = '';

		if (currentInit && currentInit.users.find(user => user.userID == userID && user.identifier == identifier)) {

			const currentUser = currentInit.users.find(user => user.userID == userID && user.identifier == identifier);
			outputText = '__Deck (# of Cards Left): Available Cards__\n';

			for (const [deck, totalCards] of Object.entries(currentUser.decks)) {
				const usableCards = totalCards.filter(card => !card.used);
				outputText += `**${toProperCase(deck)} (${usableCards.length}/${totalCards.length})${usableCards?.length > 0 ? ': ' : ''}**`;
				console.log(usableCards, totalCards);
				if (usableCards?.length > 0) {
					outputText += usableCards.map(card => card.cardName = toProperCase(card.cardName)).sort((a, b) => (b.severity > a.severity) || (a.cardName > b.cardName)).join(', ');
				}
				outputText += '\n';
			}
		}
		else {
			outputText = 'You aren\'t in init in this channel!';
		}

		await interaction.reply({ content: outputText, ephemeral: true });
	},
};
