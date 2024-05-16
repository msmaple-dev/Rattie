const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv');
const db = require('../database');
const { QueryTypes } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('init')
		.setDescription('Adds you to init')
		.addStringOption(option => option.setName('init').setDescription('Init Rolled').setRequired(true))
		.addStringOption(option => option.setName('text').setDescription('Text w/ Init').setRequired(false)),
	async execute(interaction) {
		const initVal = interaction.options.getString('init');
		const textVal = interaction.options.getString('text') ?? null;
		const channelId = interaction.channelId;
		const userID = interaction.user.id;
		const sqlID = BigInt(userID)

		let outputText = '';

		let userCards = await db.query('SELECT * FROM cards WHERE ownerId IN (0, ?)', {
			replacements: [sqlID],
			type: QueryTypes.SELECT,
		});

		let decks = {};
		for (const card of userCards) {
			if (card.deckType in decks) {
				decks[card.deckType].push({ ...card, used: false });
			}
			else {
				decks[card.deckType] = [{ ...card, used: false }];
			}
		}

		if (await init_keyv.has(channelId)) {
			let currentInit = await init_keyv.get(channelId).catch(err => interaction.reply(err));
			let currentUsers = currentInit.users;
			let matchingIndex = currentUsers.findIndex(usr => usr.userID === userID && usr.identifier === textVal)
			let currentTurnUser = currentUsers[currentInit.currentTurn - 1]
			if(matchingIndex >= 0){
				let userInit = currentUsers[matchingIndex]
				userInit.initVal = initVal
				outputText = `Changed User ${textVal ? `${textVal} (<@${userID}>)` : `<@${userID}>`} Init to ${initVal}`
			} else {
				currentUsers.push({ userID: userID, identifier: textVal, initVal: initVal, decks: decks})
				outputText = `Added User ${textVal ? `${textVal} (<@${userID}>)` : `<@${userID}>`} at Init ${initVal}`
			}
			currentUsers.sort((a, b) => (b.initVal - a.initVal))
			currentInit.currentTurn = currentUsers.indexOf(currentTurnUser)+1
			await init_keyv.set(channelId, currentInit)

		}
		else {
			let newInit = {
				currentTurn: 0,
				round: 0,
				users: [
					{ userID: userID, identifier: textVal, initVal: initVal, decks: decks},
				],
				trackers: [],
			};
			await init_keyv.set(channelId, newInit)
			outputText = `Started new Init with User ${textVal ? `${textVal} (<@${userID}>)` : `<@${userID}>`} at Init ${initVal}`
		}
		await interaction.reply(outputText)
	},
};
