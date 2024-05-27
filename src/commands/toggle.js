const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('toggle')
		.setDescription('Toggles having a specific role')
		.addStringOption(option => option
			.setName('role')
			.setDescription('Role to Toggle')
			.addChoices(
				{ name: 'Skirmish', value: 'skirmish' },
				{ name: 'Roleplay', value: 'roleplay' },
				{ name: 'Monster Hunter', value: 'monster hunter' },
			)
			.setRequired(true)),
	async execute(interaction) {
		const roleName = interaction.options.getString('role');
		const role = interaction.guild?.roles?.cache?.find(role => role.name?.toLowerCase() === roleName);
		const member = interaction?.member || null;

		if(member && role){
			if(member.roles.cache.has(role.id)){
				member.roles.remove(role)
				await interaction.reply(`Removed Role ${role?.name || '[Invalid Role Name]'}`)
			} else {
				member.roles.add(role)
				await interaction.reply(`Added Role ${role?.name || '[Invalid Role Name]'}`)
			}
		} else {
			await interaction.reply(`Invalid Role`)
		}
	},
};
