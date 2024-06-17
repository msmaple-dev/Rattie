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
		),
	async execute(interaction) {
		const userID = interaction.user.id;
		const sqlUserID = BigInt(interaction.user.id);
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'show') {
			const deckType = interaction.options.getString('decktype')?.toLowerCase() || null;
			const specificCard = interaction.options.getString('card')?.toLowerCase() || null;
			const isPrivate = interaction.options.getBoolean('private') || false;
			let baseCards = null;

			if (deckType || specificCard) {
				let cardColors = await db.query('SELECT deckType, color FROM colors WHERE colors.`ownerId` IN (0, ?)', {
					replacements: [sqlUserID],
					type: QueryTypes.SELECT,
				});
				let colorDictionary = Object.assign({}, ...cardColors.map((x) => ({ [x.deckType]: x.color })));

				let replyArray = [];
				let query = 'SELECT * FROM cards WHERE ownerId IN (0, ?)'
				let queryReplacements = [sqlUserID]
				if(deckType){
					query += ' AND LOWER(deckType) = ?'
					queryReplacements.push(deckType)
				}
				if (specificCard) {
					query += ' AND LOWER(cardName) = ?'
					queryReplacements.push(specificCard)
				}
				baseCards = await db.query(query, {
					replacements: queryReplacements,
					type: QueryTypes.SELECT,
				});

				if(!baseCards || !(baseCards?.length)){
					await interaction.reply('No valid cards found!')
				} else {
					for (let selectedCard of baseCards) {
						let embed = statusEmbed(selectedCard.cardName, selectedCard.cardText, selectedCard.severity, (colorDictionary[selectedCard.deckType] || '#FFFFFF'));
						replyArray.push(embed);
					}

					await interaction.reply({ embeds: replyArray.slice(0, 5), ephemeral: isPrivate });
					if (replyArray.length > 5) {
						await interaction.followUp({ embeds: replyArray.slice(5), ephemeral: isPrivate});
					}
				}
			}
			else {
				baseCards = await db.query('SELECT `deckType`, count(`deckType`) AS `count` FROM `cards` WHERE `cards`.`ownerId` IN (0, ?) GROUP BY `deckType`', {
					replacements: [sqlUserID],
					type: QueryTypes.SELECT,
				});

				let outputText = `__Deck, Card Count__\n`;
				baseCards.sort((a, b) => a.deckType > b.deckType);
				for (let deck of baseCards) {
					outputText += `${deck.deckType[0].toUpperCase() + deck.deckType.slice(1)}: ${deck.count}\n`;
				}

				await interaction.reply({content: outputText, ephemeral: isPrivate});
			}

		}
		else if (subCommand === 'add' || subCommand === 'modify') {
			let cardName = interaction.options.getString('name') || null;
			let deckType = interaction.options.getString('decktype')?.toLowerCase() || null;
			let severity = interaction.options.getString('severity')?.toLowerCase() || null;
			let cardText = interaction.options.getString('cardtext') || null;

			let cardColors = await db.query('SELECT deckType, color FROM colors WHERE colors.`ownerId` IN (0, ?)', {
				replacements: [sqlUserID],
				type: QueryTypes.SELECT,
			});
			let colorDictionary = Object.assign({}, ...cardColors.map((x) => ({ [x.deckType]: x.color })));

			const deckColor = interaction.options.getString('deckcolor') || colorDictionary[deckType] || `#FFFFFF`;

			let existingCards = await db.query('SELECT * FROM cards WHERE ownerId = ? AND deckType = ? AND cardName = ?', {
				replacements: [sqlUserID, deckType, cardName],
				type: QueryTypes.SELECT,
			})

			if(subCommand === 'modify'){
				if(existingCards?.length){
					let existingCard = existingCards[0]
					severity = severity || existingCard.severity
					cardText = cardText || existingCard.cardText

					await db.query('DELETE FROM cards WHERE ownerId = ? AND deckType = ? AND cardName = ?', {
						replacements: [sqlUserID, deckType, cardName],
						type: QueryTypes.DELETE,
					})
				} else {
					await interaction.reply(`No cards in deck ${deckType} are named ${cardName}!`)
					return
				}
			} else if(existingCards?.length){
				await interaction.reply(`Card ${cardName} already exists in ${deckType}!`)
				return
			}

			await db.query ('REPLACE INTO cards (ownerId, cardName, deckType, severity, cardText) VALUES (?, ?, ?, ?, ?)', {
				replacements: [sqlUserID, cardName, deckType, severity, cardText],
			})

			await db.query('DELETE FROM colors WHERE ownerId = ? AND deckType = ?', {
				replacements: [sqlUserID, deckType],
				type: QueryTypes.DELETE,
			})

			await db.query('REPLACE INTO colors(ownerId, deckType, color) VALUES (?, ?, ?)', {
				replacements: [sqlUserID, deckType, deckColor]
			})

			await interaction.reply(`${subCommand === 'modify' ? 'Modified' : 'Added'} card ${cardName} ${subCommand === 'modify' ? 'Of' : 'To'} Deck ${deckType}`)
		}
		else if (subCommand === 'delete') {
			const cardName = interaction.options.getString('name') || null;
			const deckType = interaction.options.getString('decktype')?.toLowerCase() || null;

			let existingCards = await db.query('SELECT * FROM cards WHERE ownerId = ? AND deckType = ? AND cardName = ?', {
				replacements: [sqlUserID, deckType, cardName],
				type: QueryTypes.SELECT,
			})

			await db.query('DELETE FROM cards WHERE ownerId = ? AND deckType = ? AND cardName = ?', {
				replacements: [sqlUserID, deckType, cardName],
				type: QueryTypes.DELETE,
			})

			if(!(existingCards?.length > 0)){
				await db.query('DELETE FROM colors WHERE ownerId = ? AND deckType = ?', {
					replacements: [sqlUserID, deckType, cardName],
					type: QueryTypes.DELETE,
				})
				await interaction.reply(`Deleted card ${cardName} of Deck ${deckType}`)
			} else {
				await interaction.reply(`No cards in deck ${deckType} are named ${cardName}!`)
			}
		}
	},
};
