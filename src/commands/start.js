const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')
const {nextTurn, uniqueUsers} = require('../functions/init_utils');
const {statusEmbed} = require("../components/embeds");
const {drawMonsterCard, initializeParticipants, getEncounterID} = require("../functions/monster_utils");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts Init'),
	async execute(interaction) {
		const channelId = interaction.channelId;
		let outputText = ""
		let initialMonsterDraw = false;

		let currentInit = await init_keyv.get(channelId) ?? 0;

		if(currentInit){
			if(currentInit?.round === 0){
				outputText = await nextTurn(channelId)
				if(currentInit.monster && currentInit.monster?.id){initialMonsterDraw = true}
			} else {
				outputText = "Combat Has Already Started!"
			}
		} else outputText = "No Inits Entered!"
		await interaction.reply(outputText)
		if(initialMonsterDraw){
			let [cardDrawn, outputText] = await drawMonsterCard(channelId, interaction.channel, false)
			await interaction.followUp({embeds: [statusEmbed(cardDrawn.name, cardDrawn.effect, cardDrawn.severity, cardDrawn.color)]}).then(msg => msg.pin('Monster Hunt Card Draw'))
			if(outputText){
				await interaction.followUp(outputText)
			}
			let encounterId = await getEncounterID(channelId);
			let filteredUsers = uniqueUsers(currentInit.users)
			await initializeParticipants(encounterId, filteredUsers)
		}
	},
};
