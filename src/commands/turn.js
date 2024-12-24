const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('turn')
		.setDescription('Sets a reminder for X rounds from now, based off the current turn in init.')
		.addIntegerOption(option => option.setName('rounds').setDescription('Rounds until the Reminder Strikes').setRequired(true))
		.addStringOption(option => option.setName('content').setDescription('Reminder Text').setRequired(true)),
	async execute(interaction) {
		const channelId = interaction.channelId;
		const userID = interaction.user.id;
		const rounds = interaction.options.getInteger('rounds');
		const content = interaction.options.getString('content');

		let outputText = 'No Init in this Channel!';

		const currentInit = await init_keyv.get(channelId);

		if (currentInit?.currentTurn > 0) {
			const turnUser = currentInit.users[currentInit.currentTurn - 1];
			// Trackers: userID, identifier, turnUserID, turnUserIdentifier, rounds, content
			const tracker = { userID: userID, turnUserID: turnUser.userID, turnUserIdentifier: turnUser.identifier, rounds: rounds, content: content };
			currentInit.trackers.push(tracker);
			outputText = `Set Reminder "${content}" for ${rounds} Round(s) from now.`;
			await init_keyv.set(channelId, currentInit);
		}

		await interaction.reply(outputText);
	},
};
