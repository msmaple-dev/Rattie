const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const { QueryTypes } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tag')
		.setDescription('Add or show a tag')
		.addSubcommand(subcommand =>
			subcommand
				.setName('show')
				.setDescription('View a tag')
				.addStringOption(option => option.setName('name').setDescription('Tag Name').setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Search for Private or Public Tags?').setRequired(false)),
				// .addBooleanOption(option => option.setName('pin').setDescription('Pin the Tag?').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a new tag')
				.addStringOption(option => option.setName('name').setDescription('Tag Name').setRequired(true))
				.addStringOption(option => option.setName('text').setDescription('Tag Content').setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Make the tag Private?').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('modify')
				.setDescription('Modify a tag')
				.addStringOption(option => option.setName('name').setDescription('Tag Name').setRequired(true))
				.addStringOption(option => option.setName('text').setDescription('Tag Content').setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Modify a Private or Public Tag?').setRequired(false)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Delete a tag')
				.addStringOption(option => option.setName('name').setDescription('Tag Name').setRequired(true))
				.addBooleanOption(option => option.setName('private').setDescription('Search for Private or Public Tags?').setRequired(false)),
		),
	async execute(interaction) {
		const userID = interaction.user.id;
		const sqlUserID = BigInt(interaction.user.id);
		if (interaction.options.getSubcommand() === 'show') {
			const tagName = interaction.options.getString('name')?.toLowerCase();
			const isPrivate = interaction.options.getBoolean('private') || false;

			if (tagName) {
				let query = `SELECT * from tags WHERE tags.name = ?${isPrivate ? ` AND tags.ownerId = ? AND tags.isPrivate = ?` : ""}`
				let matchingTags = await db.query(query, {
					replacements: isPrivate ? [tagName, sqlUserID, isPrivate] : [tagName],
					type: QueryTypes.SELECT,
				});

				if(matchingTags?.length > 0) {
					await interaction.reply(matchingTags[0].content.replaceAll(/\/n/gm, '\n'))
				}
				else {
					await interaction.reply(`${isPrivate ? 'Private ' : ""}Tag ${tagName} does not exist!`);
				}
			}
		}
		else if (interaction.options.getSubcommand() === 'add' || interaction.options.getSubcommand() === 'modify') {
			const tagName = interaction.options.getString('name')?.toLowerCase();
			const content = interaction.options.getString('text');
			const isPrivate = interaction.options.getBoolean('private') || false;

			let query = `SELECT * from tags WHERE tags.name = ?${isPrivate ? ` AND tags.ownerId = ? AND tags.isPrivate = ?` : ""}`
			let matchingTags = await db.query(query, {
				replacements: isPrivate ? [tagName, sqlUserID, isPrivate] : [tagName],
				type: QueryTypes.SELECT,
			});

			if(interaction.options.getSubcommand() === 'add'){
				if(matchingTags?.length > 0){
					if(matchingTags[0].ownerId != sqlUserID){
						await interaction.reply(`${isPrivate ? 'Private ' : ""}Tag ${tagName} already exists`);
						return;
					} else {
						await db.query(`DELETE FROM tags WHERE tags.name = ? AND tags.ownerId = ? AND tags.isPrivate = ?`, {
							replacements: [tagName, sqlUserID, isPrivate],
							type: QueryTypes.DELETE,
						})
					}
				}
			} else if(interaction.options.getSubcommand() === 'modify'){
				if(matchingTags?.length > 0) {
					await db.query(`DELETE FROM tags WHERE tags.name = ? AND tags.ownerId = ? AND tags.isPrivate = ?`, {
						replacements: [tagName, sqlUserID, isPrivate],
						type: QueryTypes.DELETE,
					})
				}
				else {
					await interaction.reply(`${isPrivate ? 'Private ' : ""}Tag ${tagName} does not exist!`);
					return;
				}
			}

			await db.query('REPLACE INTO tags(name, ownerId, content, isPrivate) VALUES (?, ?, ?, ?)', {
				replacements: [tagName, sqlUserID, content, isPrivate]
			})
			interaction.reply(`${interaction.options.getSubcommand() === 'modify' ? 'Modified' : 'Added'} Tag ${tagName}!`)
		}
		else if (interaction.options.getSubcommand() === 'delete') {
			const tagName = interaction.options.getString('name')?.toLowerCase();
			const isPrivate = interaction.options.getBoolean('private') || false;

			let query = `SELECT * from tags WHERE tags.name = ? AND tags.ownerId = ? AND tags.isPrivate = ?`
			let matchingTags = await db.query(query, {
				replacements: [tagName, sqlUserID, isPrivate],
				type: QueryTypes.SELECT,
			});

			if(matchingTags?.length > 0){
				await db.query(`DELETE FROM tags WHERE tags.name = ? AND tags.ownerId = ? AND tags.isPrivate = ?`, {
					replacements: [tagName, sqlUserID, isPrivate],
					type: QueryTypes.DELETE,
				})
				interaction.reply(`Deleted ${isPrivate ? 'private ' : ""}tag ${tagName}!`)
			} else {
				await interaction.reply(`There are no ${isPrivate ? 'Private ' : ""}Tags named ${tagName} that you own!`);
			}
		}
	},
};
