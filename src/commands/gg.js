const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')
const { clientId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gg')
		.setDescription('Ends the match'),
	async execute(interaction) {
		const channelId = interaction.channelId;

		let outputText = "GG!"

		await init_keyv.delete(channelId)

		await interaction.channel?.messages.fetchPinned().then((pinnedMessages) => {
			pinnedMessages.forEach((msg) => {
				if(msg.author.id == clientId){
					msg.unpin().catch(console.error)
				}
			})
		}).catch(console.error)
		await interaction.reply(outputText);
	},
};
