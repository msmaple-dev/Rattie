const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Shows init for the current channel'),
	async execute(interaction) {
		const channelId = interaction.channelId;
		let currentInit = await init_keyv.get(channelId)

		let outputText = ""

		if(currentInit){
			outputText = `__Current Init ${currentInit.round > 0 && currentInit.currentTurn > 0 ? `(Round ${currentInit.round}, Turn ${currentInit.currentTurn})` : "(Not Started)"}__\n`

			for(const userIndex in currentInit.users){
				let user = currentInit.users[userIndex]
				let userID = user.userID
				let identifier = user.identifier
				outputText += `${parseInt(userIndex) === (parseInt(currentInit.currentTurn)-1) ? "\>" : ""}${identifier ? `${identifier} (<@${userID}>)` : `<@${userID}>`}: ${user.initVal}\n`
			}
		} else {
			outputText = "No Inits Entered!"
		}

		await interaction.reply({ content: outputText, allowedMentions: {} });
	},
};
