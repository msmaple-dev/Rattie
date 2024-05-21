const { SlashCommandBuilder } = require('discord.js');
const { tarotEmbed } = require('../components/embeds');
const { QueryTypes } = require('sequelize');
const db = require('../database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tarot')
		.setDescription('Draw a tarot card')
		.addStringOption(option => option
			.setName('tier')
			.setDescription('(Optional) Force a Draw of a Given Tier')
			.setRequired(false)
			.addChoices({ name: 'Minor', value: 'minor' }, { name: 'Major', value: 'major' })),
	async execute(interaction) {

		let forcedTier = interaction.options.getString('tier') && interaction.options.getString('tier') === 'major';

		let tarotCards = await db.query(`SELECT * FROM tarots`, {
			type: QueryTypes.SELECT,
		});

		if(forcedTier){
			tarotCards = tarotCards.filter(a => a.majorTarot);
		} else if (forcedTier === false){
			tarotCards = tarotCards.filter(a => !a.majorTarot)
		}

		if (tarotCards) {
			const drawnCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];
			const {cardName, originalTarot, majorTarot, upright, reverse, description, explanation} = drawnCard;
			const cardEmbed = tarotEmbed(cardName, originalTarot, majorTarot, upright, reverse, description, explanation, forcedTier)
			await interaction.reply({ embeds: [cardEmbed] });
		} else {
			await interaction.reply("Tarot Cards Weren't Added!")
		}
	},
};
