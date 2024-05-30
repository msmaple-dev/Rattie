const { SlashCommandBuilder } = require('discord.js');
const { tarotEmbed } = require('../components/embeds');
const { QueryTypes } = require('sequelize');
const db = require('../database');
const { toProperCase } = require('../functions/string_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tarot')
		.setDescription('Draw a tarot card')
		.addStringOption(option => option
			.setName('tier')
			.setDescription('(Optional) Force a Draw of a Given Tier')
			.setRequired(false)
			.addChoices({ name: 'Minor', value: 'minor' }, { name: 'Major', value: 'major' }))
		.addStringOption(option => option
			.setName('card')
			.setDescription('(Optional) Specific tarot card, by title (Eg: Judgement, Valor, Love)')
			.setRequired(false)),
	async execute(interaction) {

		let forcedTier = interaction.options.getString('tier') && interaction.options.getString('tier') === 'major';
		let specificCard = interaction.options.getString('card') && toProperCase(interaction.options.getString('card')) || null;

		let tarotCards = []

		if(specificCard){
			tarotCards = await db.query(`SELECT * FROM tarots WHERE cardName = ?`, {
				replacements: [specificCard, specificCard],
				type: QueryTypes.SELECT,
			});
		} else {
			tarotCards = await db.query(`SELECT * FROM tarots`, {
				type: QueryTypes.SELECT,
			});
		}

		if(forcedTier){
			tarotCards = tarotCards.filter(a => a.majorTarot);
		} else if (forcedTier === false){
			tarotCards = tarotCards.filter(a => !a.majorTarot)
		}

		if (tarotCards?.length > 0) {
			const drawnCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];
			const {cardName, originalTarot, majorTarot, upright, reverse, description, explanation} = drawnCard;
			const cardEmbed = tarotEmbed(cardName, originalTarot, majorTarot, upright, reverse, description, explanation, forcedTier, specificCard)
			await interaction.reply({ embeds: [cardEmbed] });
		} else {
			await interaction.reply("Invalid card name!")
		}
	},
};
