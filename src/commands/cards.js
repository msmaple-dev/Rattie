const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const { statusEmbed } = require('../components/embeds');
const { severities } = require('../components/constants');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cards')
		.setDescription('Lets you modify or view your cards')
		.addSubcommand(subcommand =>
			subcommand
				.setName('show')
				.setDescription('View all your current decks, all the cards in a deck, or a specific card.')
				.addStringOption(option => option.setName('decktype').setDescription('Deck Type').setRequired(false))
				.addStringOption(option => option.setName('card').setDescription('Specific card').setRequired(false))
				.addBooleanOption(option => option.setName('private').setDescription('Display cards publicly?').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a new card')
				.addStringOption(option => option.setName('name').setDescription('Card Name').setRequired(true))
				.addStringOption(option => option.setName('decktype').setDescription('Deck Type').setRequired(true))
				.addStringOption(option => option.setName('cardtext').setDescription('Card Text').setRequired(true))
				.addStringOption(option => option.setName('deckcolor').setDescription('Deck Color (Optional)').setRequired(false))
				.addStringOption(option => option
					.setName('severity')
					.setDescription('Card Severity')
					.addChoices(...severities)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('modify')
				.setDescription('Modify a card')
				.addStringOption(option => option.setName('name').setDescription('Card Name').setRequired(true))
				.addStringOption(option => option.setName('decktype').setDescription('Deck Type').setRequired(true))
				.addStringOption(option => option
					.setName('severity')
					.setDescription('Card Severity')
					.addChoices(...severities).setRequired(false))
				.addStringOption(option => option.setName('cardtext').setDescription('Card Text').setRequired(false))
				.addStringOption(option => option.setName('deckcolor').setDescription('Deck Color').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Delete a card')
				.addStringOption(option => option.setName('name').setDescription('Card Name').setRequired(true))
				.addStringOption(option => option.setName('decktype').setDescription('Deck Type').setRequired(true)),
		).addSubcommand(subcommand =>
			subcommand
				.setName('clear')
				.setDescription('Clear out an entire deck you own.')
				.addStringOption(option => option.setName('decktype').setDescription('Deck Type').setRequired(true)),
		),
	async execute(interaction) {
		const userID = interaction.user.id;
		const sqlUserID = BigInt(userID);
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'show') {
			await interaction.deferReply();
			const deckType = interaction.options.getString('decktype')?.toLowerCase() || null;
			const specificCard = interaction.options.getString('card')?.toLowerCase() || null;
			const isPrivate = interaction.options.getBoolean('private') || false;
			let baseCards = null;

			if (deckType || specificCard) {
				const cardColors = await db.query('SELECT deckType, color FROM colors WHERE colors.`ownerId` IN (0, ?)', {
					replacements: [sqlUserID],
					type: QueryTypes.SELECT,
				});
				const colorDictionary = Object.assign({}, ...cardColors.map((x) => ({ [x.deckType]: x.color })));

				const replyArray = [];
				let query = 'SELECT * FROM cards WHERE ownerId IN (0, ?)';
				const queryReplacements = [sqlUserID];
				if (deckType) {
					query += ' AND LOWER(deckType) = ?';
					queryReplacements.push(deckType);
				}
				if (specificCard) {
					query += ' AND LOWER(cardName) = ?';
					queryReplacements.push(specificCard);
				}
				baseCards = await db.query(query, {
					replacements: queryReplacements,
					type: QueryTypes.SELECT,
				});

				if (!baseCards || !(baseCards?.length)) {
					await interaction.editReply('No valid cards found!');
				}
				else {
					for (const selectedCard of baseCards) {
						const embed = statusEmbed(selectedCard.cardName, selectedCard.cardText, selectedCard.severity, (colorDictionary[selectedCard.deckType] || '#FFFFFF'));
						replyArray.push(embed);
					}

					await interaction.editReply({ embeds: replyArray.slice(0, 5), ephemeral: isPrivate });
					if (replyArray.length > 5) {
						for (let i = 5; i < replyArray.length; i = i + 5) {
							await interaction.followUp({ embeds: replyArray.slice(i, i + 5), ephemeral: isPrivate });
						}
					}
				}
			}
			else {
				baseCards = await db.query('SELECT `deckType`, count(`deckType`) AS `count` FROM `cards` WHERE `cards`.`ownerId` IN (0, ?) GROUP BY `deckType`', {
					replacements: [sqlUserID],
					type: QueryTypes.SELECT,
				});

				let outputText = '__Deck, Card Count__\n';
				baseCards.sort((a, b) => a.deckType > b.deckType);
				for (const deck of baseCards) {
					outputText += `${deck.deckType[0].toUpperCase() + deck.deckType.slice(1)}: ${deck.count}\n`;
				}

				await interaction.editReply({ content: outputText, ephemeral: isPrivate });
			}

		}
		else if (subCommand === 'add' || subCommand === 'modify') {
			await interaction.deferReply();
			const cardName = interaction.options.getString('name') || null;
			const deckType = interaction.options.getString('decktype')?.toLowerCase() || null;
			let severity = interaction.options.getString('severity')?.toLowerCase() || null;
			let cardText = interaction.options.getString('cardtext') || null;

			const cardColors = await db.query('SELECT deckType, color FROM colors WHERE colors.`ownerId` IN (0, ?)', {
				replacements: [sqlUserID],
				type: QueryTypes.SELECT,
			});
			const colorDictionary = Object.assign({}, ...cardColors.map((x) => ({ [x.deckType]: x.color })));

			const deckColor = interaction.options.getString('deckcolor') || colorDictionary[deckType] || '#FFFFFF';

			const existingCards = await db.query('SELECT * FROM cards WHERE ownerId = ? AND deckType = ? AND cardName = ?', {
				replacements: [sqlUserID, deckType, cardName],
				type: QueryTypes.SELECT,
			});

			if (subCommand === 'modify') {
				if (existingCards?.length) {
					const existingCard = existingCards[0];
					severity = severity || existingCard.severity;
					cardText = cardText || existingCard.cardText;

					await db.query('DELETE FROM cards WHERE ownerId = ? AND deckType = ? AND cardName = ?', {
						replacements: [sqlUserID, deckType, cardName],
						type: QueryTypes.DELETE,
					});
				}
				else {
					await interaction.editReply(`No cards in deck ${deckType} are named ${cardName}!`);
					return;
				}
			}
			else if (existingCards?.length) {
				await interaction.editReply(`Card ${cardName} already exists in ${deckType}!`);
				return;
			}

			await db.query ('REPLACE INTO cards (ownerId, cardName, deckType, severity, cardText) VALUES (?, ?, ?, ?, ?)', {
				replacements: [sqlUserID, cardName, deckType, severity, cardText],
			});

			if (interaction.options.getString('deckcolor')) {
				await db.query('DELETE FROM colors WHERE ownerId = ? AND deckType = ?', {
					replacements: [sqlUserID, deckType],
					type: QueryTypes.DELETE,
				});

				await db.query('REPLACE INTO colors(ownerId, deckType, color) VALUES (?, ?, ?)', {
					replacements: [sqlUserID, deckType, deckColor],
				});
			}

			await interaction.editReply(`${subCommand === 'modify' ? 'Modified' : 'Added'} card ${cardName} ${subCommand === 'modify' ? 'Of' : 'To'} Deck ${deckType}`);
		}
		else if (subCommand === 'delete') {
			await interaction.deferReply();
			const cardName = interaction.options.getString('name') || null;
			const deckType = interaction.options.getString('decktype')?.toLowerCase() || null;

			const existingCards = await db.query('SELECT * FROM cards WHERE ownerId = ? AND deckType = ? AND cardName = ?', {
				replacements: [sqlUserID, deckType, cardName],
				type: QueryTypes.SELECT,
			});
			if (!existingCards) {
				await interaction.editReply(`No cards in deck ${deckType} are named ${cardName}!`);
			}
			else {
				await db.query('DELETE FROM cards WHERE ownerId = ? AND deckType = ? AND cardName = ?', {
					replacements: [sqlUserID, deckType, cardName],
					type: QueryTypes.DELETE,
				});
				const remainingCards = await db.query('SELECT * FROM cards WHERE ownerId = ? AND deckType = ?', {
					replacements: [sqlUserID, deckType, cardName],
					type: QueryTypes.SELECT,
				});

				if (remainingCards && !remainingCards?.length) {
					await db.query('DELETE FROM colors WHERE ownerId = ? AND deckType = ?', {
						replacements: [sqlUserID, deckType, cardName],
						type: QueryTypes.DELETE,
					});
				}
				await interaction.editReply(`Deleted card ${cardName} of Deck ${deckType}`);
			}
		}
		else if (subCommand === 'clear') {
			await interaction.deferReply();
			const deckType = interaction.options.getString('decktype')?.toLowerCase();

			await db.query('DELETE FROM cards WHERE ownerId = ? AND deckType = ?', {
				replacements: [sqlUserID, deckType],
				type: QueryTypes.DELETE,
			});

			await db.query('DELETE FROM colors WHERE ownerId = ? AND deckType = ?', {
				replacements: [sqlUserID, deckType],
				type: QueryTypes.DELETE,
			});
			await interaction.editReply(`Deleted Deck ${deckType}`);
		}
	},
};
