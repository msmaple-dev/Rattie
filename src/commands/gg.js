const { SlashCommandBuilder } = require('discord.js');
const init_keyv = require('../keyv_stores/init_keyv')
const { clientId } = require('../../config.json');
const {unpinChannelPins} = require("../functions/chat_utils");
const db = require("../database");
const {QueryTypes} = require("sequelize");
const {logDPR, getEncounterID} = require("../functions/monster_utils");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gg')
		.setDescription('Ends the match'),
	async execute(interaction) {
		const channelId = interaction.channelId;

		let outputText = "GG!"

		let currentInit = await init_keyv.get(channelId)

		if(currentInit?.looting === false){
			if(currentInit.monster && currentInit.monster?.id){
				let encounterId = await getEncounterID(channelId);
				await db.query("UPDATE encounters SET rounds = ?, endTime = ?, status = ? WHERE encounterId = ?", {
					replacements: [currentInit.round, Date.now(), 'Conceded', encounterId],
					type: QueryTypes.UPDATE
				})
				await logDPR(encounterId, currentInit.dpr)
				await init_keyv.delete(channelId)
				await unpinChannelPins(interaction.channel)
			}
			else {
				outputText = `The following players need to do \`\`/monster loot\`\` in this channel with their ending hp: ${currentInit.users.map(usr => `<@${usr.userID}>`).join(", ")}.\nInit will close automatically once everyone has rolled loot.`
			}
		} else {
			await init_keyv.delete(channelId)
		}
		await interaction.reply({content: outputText, allowedMentions: {}});
	},
};
