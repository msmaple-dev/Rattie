const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const { getUserDecks, newInit } = require('../functions/init_utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('init')
		.setDescription('Adds you to init')
		.addIntegerOption(option => option.setName('init').setDescription('Init Rolled').setRequired(true))
		.addStringOption(option => option.setName('identifier').setDescription('Identifier for Additional Users Linked to You').setRequired(false)),
	async execute(interaction) {
		const initVal = interaction.options.getInteger('init');
		const userIdentifier = interaction.options.getString('identifier') ?? null;
		const channelId = interaction.channelId;
		const userID = interaction.user.id;
		const sqlID = BigInt(userID);

		let outputText = '';
		await interaction.deferReply();

		const decks = await getUserDecks(sqlID);

		const initTags = await db.query('SELECT * FROM tags WHERE tags.isPrivate = TRUE AND tags.name = ? AND tags.ownerId = ?', {
			replacements: ['init', sqlID],
			type: QueryTypes.SELECT,
		});
		const userInitTag = initTags && initTags[0];
		let postInitTag = false;

		if (await init_keyv.has(channelId)) {
			const currentInit = await init_keyv.get(channelId).catch(err => interaction.reply(err));
			const currentUsers = currentInit.users;
			const matchingIndex = currentUsers.findIndex(usr => usr.userID === userID && usr.identifier === userIdentifier);
			const currentTurnUser = currentUsers[currentInit.currentTurn - 1];
			if (matchingIndex >= 0) {
				const userInit = currentUsers[matchingIndex];
				userInit.initVal = initVal;
				outputText = `Changed User ${userIdentifier ? `${userIdentifier} (<@${userID}>)` : `<@${userID}>`} Init to ${initVal}`;
			}
			else {
				currentUsers.push({ userID: userID, identifier: userIdentifier, initVal: initVal, decks: decks });
				outputText = `Added User ${userIdentifier ? `${userIdentifier} (<@${userID}>)` : `<@${userID}>`} at Init ${initVal}`;
				if (!userIdentifier) {
					postInitTag = true;
				}
			}
			currentUsers.sort((a, b) => (b.initVal - a.initVal));
			currentInit.currentTurn = currentUsers.indexOf(currentTurnUser) + 1;
			await init_keyv.set(channelId, currentInit);
		}
		else {
			const startingInit = newInit([{ userID: userID, identifier: userIdentifier, initVal: initVal, decks: decks }]);
			await init_keyv.set(channelId, startingInit);
			outputText = `Started new Init with User ${userIdentifier ? `${userIdentifier} (<@${userID}>)` : `<@${userID}>`} at Init ${initVal}`;
			if (!userIdentifier) {
				postInitTag = true;
			}
		}
		await interaction.editReply(outputText);
		if (postInitTag && userInitTag) {
			await interaction.followUp(`\n${userInitTag.content.replaceAll(/\\n/gm, '\n')}`).then(msg => {
				msg.pin('Init Pin');
			});
		}
	},
};
