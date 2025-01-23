const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv');
const { statusEmbed } = require('../components/embeds');
const { QueryTypes } = require('sequelize');
const db = require('../database');
const { selectFromWeightedString, drawDeck } = require('../functions/roll_utils');
const { severities } = require('../components/constants');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('draw')
		.setDescription('Draws a card from a deck, exhausting that card if in a fight.')
		.addStringOption(option => option.setName('decks').setDescription('Deck(s) and amount of Damage (Valid: Burn, 1 Burn, 4 Burn 3 Slash)').setRequired(true))
		.addStringOption(option => option.setName('identifier').setDescription('Init Name').setRequired(false))
		.addIntegerOption(option => option.setName('cards').setDescription('Cards to Draw').setMaxValue(5).setRequired(false))
		.addStringOption(option => option
			.setName('severity')
			.setDescription('Severity')
			.setRequired(false)
			.addChoices(...severities),
		)
		.addBooleanOption(option => option.setName('base').setDescription('Draw from base decks, not init decks').setRequired(false)),
	async execute(interaction) {
		await interaction.deferReply();
		const deckString = interaction.options.getString('decks')?.toLowerCase();
		const drawCount = interaction.options.getInteger('cards') ? Math.min(5, interaction.options.getInteger('cards')) : 1;
		const severity = interaction.options.getString('severity')?.toLowerCase() || null;
		const baseDraw = interaction.options.getBoolean('base') || false;
		const userID = interaction.user.id;
		const sqlUserID = BigInt(interaction.user.id);
		const identifier = interaction.options.getString('identifier') || null;
		const channel = interaction.channelId;
		const channelInit = await init_keyv.get(channel);
		const channelUserIndex = channelInit && channelInit?.users ? channelInit.users.findIndex(user => user.userID === userID && user.identifier === identifier) : -1;
		const channelUser = channelUserIndex >= 0 ? channelInit.users[channelUserIndex] : null;
		const cardColors = await db.query('SELECT deckType, color FROM colors WHERE colors.`ownerId` IN (0, ?)', {
			replacements: [sqlUserID],
			type: QueryTypes.SELECT,
		});
		const colorDictionary = Object.assign({}, ...cardColors.map((x) => ({ [x.deckType]: x.color })));

		const statusCards = [];

		if (!(deckString && deckString.match(/(\d+ \w+)+/gm)?.length > 0)) {
			await interaction.editReply({ content: 'No Valid Deck Type(s) Entered!', ephemeral: true });
			return;
		}

		if (baseDraw || !channelUser) {
			for (let i = 0; i < drawCount; i++) {
				const deckType = selectFromWeightedString(deckString)?.toLowerCase();
				const baseCards = await db.query('SELECT * FROM cards WHERE ownerId IN (0, ?) AND deckType = ?', {
					replacements: [sqlUserID, deckType],
					type: QueryTypes.SELECT,
				});
				if (!baseCards || baseCards.length <= 0) {
					console.log('Base Draw Error');
					await interaction.editReply({ content: `Invalid Deck Type "${deckType}"!`, ephemeral: true });
					return;
				}
				const severityCards = severity ? baseCards.filter(card => (card.severity === severity)) : null;
				const drawableCards = severityCards || baseCards;
				const drawnCard = drawableCards[Math.floor(Math.random() * drawableCards.length)];
				statusCards.push(drawnCard);
			}
		}
		else {
			const userCards = channelUser.decks;

			for (let i = 0; i < drawCount; i++) {
				const deckType = selectFromWeightedString(deckString)?.toLowerCase();
				const deck = userCards[deckType];
				if (!deck || deck.length <= 0) {
					console.log('Init Draw Error');
					interaction.editReply({
						content: `Invalid Deck Type "${deckType}"! Valid Decks: ${Object.keys(userCards).map(word => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(', ')}`,
						ephemeral: true,
					});
					return;
				}
				statusCards.push(drawDeck(deck, 1, severity)[0]);
				userCards[deckType] = deck;
			}

			await init_keyv.set(channel, channelInit);
		}
		const replyArray = [];
		for (const selectedCard of statusCards) {
			const embed = statusEmbed(selectedCard.cardName, selectedCard.cardText, selectedCard.severity, (colorDictionary[selectedCard.deckType] || '#FFFFFF'), identifier, severity);
			replyArray.push(embed);
		}
		await interaction.editReply({ embeds: replyArray });
	},
};
